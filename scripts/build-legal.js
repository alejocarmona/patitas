#!/usr/bin/env node
// Genera las páginas legales públicas (public/*.html) desde legal/content/*.md y
// constants/legal.js (única fuente de la identidad legal). No despliega nada.
//
//   npm run build:legal            -> escribe public/
//   node scripts/build-legal.js --strict   -> falla (exit 1) si queda algún marcador {{X}} (correo) o si TELEFONO contiene '#'
const fs = require('fs');
const path = require('path');
const legal = require('../constants/legal');

const ROOT = path.join(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'legal', 'content');
const OUT_DIR = path.join(ROOT, 'public');

const PAGES = [
  { file: 'privacidad', out: 'privacidad.html', nav: 'Privacidad', desc: 'Política de privacidad y tratamiento de datos personales de Patitas.' },
  { file: 'terminos', out: 'terminos.html', nav: 'Términos', desc: 'Términos y condiciones de uso de Patitas.' },
  { file: 'eliminar-cuenta', out: 'eliminar-cuenta.html', nav: 'Eliminar cuenta', desc: 'Cómo eliminar tu cuenta y tus datos de Patitas.' },
];

const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

function formatDateEs(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${MESES[m - 1]} de ${y}`;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function tokens(L) {
  return {
    APP_NAME: L.APP_NAME,
    RESPONSABLE_NOMBRE: L.RESPONSABLE_NOMBRE,
    RESPONSABLE_CIUDAD: L.RESPONSABLE_CIUDAD,
    CONTACT_EMAIL: L.CONTACT_EMAIL,
    TELEFONO: L.TELEFONO,
    LAST_UPDATED_ES: formatDateEs(L.LAST_UPDATED),
    LAST_UPDATED: L.LAST_UPDATED,
    BASE_URL: L.LEGAL_BASE_URL,
  };
}

// Reemplazo de una sola pasada: el valor insertado (p. ej. el marcador del correo) no se reprocesa.
function replaceTokens(text, map) {
  return text.replace(/\{\{([A-Z_]+)\}\}/g, (whole, key) =>
    Object.prototype.hasOwnProperty.call(map, key) ? map[key] : whole
  );
}

function inline(s) {
  return escapeHtml(s)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, text, href) => `<a href="${href}">${text}</a>`);
}

// Markdown mínimo: # ## ###, listas con "- " o "1. ", párrafos, **negrita**, [texto](url).
// Las líneas de comentario HTML (<!-- ... -->) se descartan.
function mdToHtml(md) {
  const out = [];
  let para = [];
  let list = null;
  let listTag = 'ul';
  let title = '';
  const flushPara = () => {
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
    para = [];
  };
  const flushList = () => {
    if (list) out.push(`<${listTag}>\n${list.map((li) => `  <li>${inline(li)}</li>`).join('\n')}\n</${listTag}>`);
    list = null;
  };
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  let inComment = false;
  for (const raw of lines) {
    const line = raw.trimEnd();
    // Los comentarios HTML son notas internas del borrador: no se publican.
    if (inComment || line.startsWith('<!--')) {
      flushPara();
      flushList();
      inComment = !line.includes('-->');
      continue;
    }
    let m;
    if ((m = line.match(/^(#{1,3}) (.+)$/))) {
      flushPara();
      flushList();
      const level = m[1].length;
      if (level === 1 && !title) title = m[2];
      out.push(`<h${level}>${inline(m[2])}</h${level}>`);
    } else if ((m = line.match(/^(?:- |\d+\. )(.+)$/))) {
      flushPara();
      const tag = /^\d/.test(line) ? 'ol' : 'ul';
      if (list && listTag !== tag) flushList();
      listTag = tag;
      (list = list || []).push(m[1]);
    } else if (line === '') {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return { html: out.join('\n'), title };
}

function layout({ L, title, desc, bodyHtml, current, canonical }) {
  const nav = PAGES.map(
    (p) => `<a href="/${p.file}"${p.file === current ? ' aria-current="page"' : ''}>${p.nav}</a>`
  ).join('\n      ');
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(title)} · ${escapeHtml(L.APP_NAME)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${canonical}">
<style>
  :root { --primary:#E5521A; --text:#1A1A2E; --muted:#6a6a85; --bg:#FDF6F0; --border:#F0E8E0; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--text); font:17px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif; }
  header { background:#fff; border-bottom:1px solid var(--border); }
  .wrap { max-width:760px; margin:0 auto; padding:0 20px; }
  header .wrap { display:flex; flex-wrap:wrap; gap:8px 24px; align-items:center; justify-content:space-between; padding-top:14px; padding-bottom:14px; }
  .brand { font-weight:800; font-size:20px; color:var(--text); text-decoration:none; }
  nav { display:flex; flex-wrap:wrap; gap:4px 18px; font-size:15px; }
  nav a { color:var(--muted); text-decoration:none; }
  nav a[aria-current="page"] { color:var(--primary); font-weight:700; }
  main { padding-top:28px; padding-bottom:48px; }
  h1 { font-size:28px; line-height:1.25; margin:0 0 8px; }
  h2 { font-size:21px; margin:32px 0 6px; }
  h3 { font-size:17px; margin:22px 0 4px; }
  p, ul { margin:10px 0; }
  li { margin:4px 0; }
  a { color:var(--primary); }
  footer { border-top:1px solid var(--border); color:var(--muted); font-size:14px; padding-top:18px; padding-bottom:28px; }
</style>
</head>
<body>
<header>
  <div class="wrap">
    <a class="brand" href="/">🐾 ${escapeHtml(L.APP_NAME)}</a>
    <nav>
      ${nav}
    </nav>
  </div>
</header>
<main class="wrap">
${bodyHtml}
</main>
<footer class="wrap">
  ${escapeHtml(L.APP_NAME)} · ${escapeHtml(L.RESPONSABLE_NOMBRE)} · ${escapeHtml(L.RESPONSABLE_CIUDAD)} · ${escapeHtml(L.CONTACT_EMAIL)}
</footer>
</body>
</html>
`;
}

function indexBody(L, T) {
  return `<h1>${escapeHtml(L.APP_NAME)}</h1>
<p>${escapeHtml(L.APP_NAME)} es una aplicación para Android que te ayuda a llevar la cartilla de salud de tu mascota, ver veterinarias cercanas y leer tips de cuidado. Es desarrollada por ${escapeHtml(L.RESPONSABLE_NOMBRE)} (${escapeHtml(L.RESPONSABLE_CIUDAD)}).</p>
<h2>Información legal</h2>
<ul>
  <li><a href="/privacidad">Política de privacidad y tratamiento de datos personales</a></li>
  <li><a href="/terminos">Términos y condiciones de uso</a></li>
  <li><a href="/eliminar-cuenta">Cómo eliminar tu cuenta y tus datos</a></li>
</ul>
<p>Contacto: <a href="mailto:${escapeHtml(L.CONTACT_EMAIL)}">${escapeHtml(L.CONTACT_EMAIL)}</a></p>
<p>Última actualización: ${T.LAST_UPDATED_ES}</p>`;
}

// Devuelve { 'privacidad.html': '...', ... }. `overrides` permite probar con otros valores.
function buildAll(overrides = {}) {
  const L = { ...legal, ...overrides };
  const T = tokens(L);
  const files = {};
  for (const p of PAGES) {
    const md = replaceTokens(fs.readFileSync(path.join(CONTENT_DIR, `${p.file}.md`), 'utf8'), T);
    const { html, title } = mdToHtml(md);
    files[p.out] = layout({ L, title, desc: p.desc, bodyHtml: html, current: p.file, canonical: `${L.LEGAL_BASE_URL}/${p.file}` });
  }
  files['index.html'] = layout({
    L,
    title: L.APP_NAME,
    desc: `${L.APP_NAME}: la cartilla de tu mascota, veterinarias cercanas y tips de cuidado.`,
    bodyHtml: indexBody(L, T),
    current: '',
    canonical: `${L.LEGAL_BASE_URL}/`,
  });
  return files;
}

// Marcadores {{X}} que quedan en el HTML generado (p. ej. el correo sin completar).
function findPlaceholders(files) {
  const found = new Set();
  for (const html of Object.values(files)) {
    for (const m of html.matchAll(/\{\{[A-Z_]+\}\}/g)) found.add(m[0]);
  }
  return [...found].sort();
}

// El teléfono pendiente es un marcador literal con '#' (p. ej. '### #######'): no es {{X}}, pero
// tampoco es publicable.
function pendingPhone(L = legal) {
  return typeof L.TELEFONO === 'string' && L.TELEFONO.includes('#');
}

function main() {
  const strict = process.argv.includes('--strict');
  const files = buildAll();
  const left = findPlaceholders(files);
  if (pendingPhone()) left.push(`TELEFONO (${legal.TELEFONO})`);
  if (left.length) {
    const msg = `AVISO: quedan marcadores sin completar: ${left.join(', ')}. Edita constants/legal.js antes de publicar.`;
    if (strict) {
      console.error(msg);
      process.exit(1);
    }
    console.warn(msg);
  }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, html] of Object.entries(files)) {
    fs.writeFileSync(path.join(OUT_DIR, name), html, 'utf8');
    console.log(`public/${name}`);
  }
}

if (require.main === module) main();
module.exports = { pendingPhone, buildAll, mdToHtml, replaceTokens, formatDateEs, findPlaceholders };
