// Páginas legales públicas: generadas por scripts/build-legal.js desde legal/content + constants/legal.js.
const fs = require('fs');
const path = require('path');
const legal = require('../constants/legal');
const { spawnSync } = require('child_process');
const { buildAll, findPlaceholders, mdToHtml, pendingPhone } = require('../scripts/build-legal');

const h2 = (html) => [...html.matchAll(/<h2>([^<]*)<\/h2>/g)].map((m) => m[1].toLowerCase());

describe('build-legal', () => {
  const email = 'hola@ejemplo.com';
  const files = buildAll({ CONTACT_EMAIL: email, TELEFONO: '3000000000' });

  test('genera las 4 páginas', () => {
    expect(Object.keys(files).sort()).toEqual(['eliminar-cuenta.html', 'index.html', 'privacidad.html', 'terminos.html']);
  });

  test('el correo de contacto se reemplaza en un solo lugar: no queda ningún marcador {{...}}', () => {
    for (const html of Object.values(files)) {
      expect(html).not.toMatch(/\{\{[A-Z_]+\}\}/);
      expect(html).toContain(email);
    }
    expect(files['eliminar-cuenta.html']).toContain(`mailto:${email}`);
  });

  test('el correo real está definido; el domicilio es solo la ciudad y el teléfono es el marcador del dueño', () => {
    const def = buildAll();
    expect(legal.CONTACT_EMAIL).toMatch(/^[^@\s{}]+@[^@\s{}]+\.[a-z]+$/);
    expect(legal.DIRECCION).toBeUndefined();
    expect(legal.TELEFONO).toBe('### #######');
    for (const html of Object.values(def)) expect(html).toContain(legal.CONTACT_EMAIL);
    // Ya no hay marcadores {{X}}: el teléfono pendiente es el literal con '#'.
    expect(findPlaceholders(def)).toEqual([]);
    expect(pendingPhone()).toBe(true);
    expect(pendingPhone({ TELEFONO: '3001234567' })).toBe(false);
    const pr = def['privacidad.html'];
    expect(pr).toContain('<strong>Domicilio:</strong> Medellín, Colombia.');
    expect(pr).toContain('<strong>Teléfono:</strong> ### #######.');
    expect(pr).not.toContain('Domicilio y dirección');
  });

  test('con TELEFONO completo aparece en la política y ya no es pendiente', () => {
    expect(findPlaceholders(files)).toEqual([]);
    expect(files['privacidad.html']).toContain('3000000000');
    expect(files['privacidad.html']).not.toContain('Calle 1');
  });

  test('--strict falla (exit 1) mientras TELEFONO contenga "#" y el build normal avisa sin fallar', () => {
    const script = path.join(__dirname, '..', 'scripts', 'build-legal.js');
    const strict = spawnSync(process.execPath, [script, '--strict'], { encoding: 'utf8' });
    const normal = spawnSync(process.execPath, [script], { encoding: 'utf8' });
    if (pendingPhone()) {
      expect(strict.status).toBe(1);
      expect(strict.stderr).toContain('TELEFONO');
      expect(normal.status).toBe(0);
      expect(normal.stderr).toContain('TELEFONO');
    } else {
      expect(strict.status).toBe(0);
    }
  });

  test('los comentarios HTML (notas internas del borrador) no se publican', () => {
    for (const html of Object.values(files)) {
      expect(html).not.toMatch(/<!--/);
      expect(html).not.toContain('BORRADOR pendiente');
    }
    const { html } = mdToHtml('<!-- nota\ninterna -->\n# Título\n\nTexto');
    expect(html).not.toContain('nota');
    expect(html).toContain('<h1>Título</h1>');
  });

  test('la política cubre vigencia, retención con cifras, roles de Google, transmisión/transferencia y reclamos', () => {
    const html = files['privacidad.html'];
    expect(h2(html).join(' | ')).toContain('vigencia');
    for (const s of [
      'hasta 14 meses',
      '180 días',
      'encargado',
      'responsable independiente',
      'https://policies.google.com/privacy',
      'Transmisión',
      'Circular Externa 005 de 2017',
      'total o parcialmente',
      'Compartir estadísticas de uso',
      'identificadores seudónimos',
      'ciudad o país aproximados',
      'no usa el ID de publicidad de Android',
      'cuando abres o actualizas el Directorio',
      'no se incluyen en copias de seguridad',
      '5 días hábiles',
      '2 meses',
      'causahabientes',
      'datos sensibles',
    ]) {
      expect(html.toLowerCase()).toContain(s.toLowerCase());
    }
    expect(html).not.toContain('sin datos personales');
    expect(html).not.toContain('una sola vez');
  });

  test('términos: cambios con aviso previo y responsabilidad con salvedad de dolo o culpa grave', () => {
    const html = files['terminos.html'];
    expect(html).toContain('Te avisaremos de los cambios importantes antes de que apliquen');
    expect(html).not.toContain('se entiende que lo aceptas');
    expect(html).toContain('dolo o culpa grave');
  });

  test('la política tiene las secciones obligatorias', () => {
    const titles = h2(files['privacidad.html']).join(' | ');
    for (const word of ['responsable', 'datos', 'finalidades', 'derechos', 'transferencia', 'menores', 'contacto']) {
      expect(titles).toContain(word);
    }
    const html = files['privacidad.html'];
    expect(html).toContain('Ley 1581 de 2012');
    expect(html).toContain('Decreto 1377 de 2013');
    expect(html).toContain('10 días hábiles');
    expect(html).toContain('15 días hábiles');
    expect(html).toContain('Superintendencia de Industria y Comercio');
    expect(html).toContain(legal.RESPONSABLE_NOMBRE);
    expect(html).toContain(legal.RESPONSABLE_CIUDAD);
    expect(html).toContain('12 de noviembre de 2026');
  });

  test('los términos cubren lo esencial y no prometen gratuidad eterna', () => {
    const html = files['terminos.html'];
    expect(html).toContain('No es asesoría veterinaria');
    expect(html).toContain('Ley 1480 de 2011');
    expect(html).toContain('Actualmente el uso de Patitas no tiene costo');
    expect(html).not.toMatch(/gratis|siempre será|para siempre/i);
    expect(html).toContain('Ley aplicable');
  });

  test('la página de eliminación nombra app y desarrollador y da las dos vías', () => {
    const html = files['eliminar-cuenta.html'];
    expect(html).toContain('Patitas');
    expect(html).toContain('Alejandro Carmona');
    expect(html).toContain('Perfil');
    expect(html).toContain('Eliminar cuenta');
    expect(html).toContain('Eliminar mi cuenta de Patitas');
    expect(html).toContain('15 días hábiles');
    expect(html).toContain('hasta 14 meses');
    expect(html).toContain('180 días');
    expect(html).toContain('es posible que te pidamos elegir de nuevo tu cuenta');
    expect(html).toMatch(/Qué se elimina/);
    expect(html).toMatch(/Qué puede conservarse/);
  });

  test('las URL de constants/legal coinciden con las páginas generadas', () => {
    for (const [url, file] of [
      [legal.URL_PRIVACIDAD, 'privacidad'],
      [legal.URL_TERMINOS, 'terminos'],
      [legal.URL_ELIMINAR_CUENTA, 'eliminar-cuenta'],
    ]) {
      expect(url).toBe(`${legal.LEGAL_BASE_URL}/${file}`);
      expect(files[`${file}.html`]).toContain(`<link rel="canonical" href="${url}">`);
    }
  });

  test('todos los enlaces internos apuntan a una página que existe', () => {
    const pages = new Set(['/', '/privacidad', '/terminos', '/eliminar-cuenta']);
    for (const html of Object.values(files)) {
      for (const m of html.matchAll(/href="(\/[^"]*)"/g)) expect(pages.has(m[1])).toBe(true);
    }
  });

  test('firebase.json sirve public/ con cleanUrls (las URL no llevan .html)', () => {
    const cfg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'firebase.json'), 'utf8'));
    expect(cfg.hosting.public).toBe('public');
    expect(cfg.hosting.cleanUrls).toBe(true);
  });
});
