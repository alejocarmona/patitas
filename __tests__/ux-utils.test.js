import { groupVacunas, normalizeVacunaName } from '../utils/vacunas';
import { formatKg, weightOutlier } from '../utils/weight';
import { formatNextDose, formatTime12, scheduleSummary } from '../utils/reminders';
import { statusColors, theme } from '../constants/theme';

const TODAY = new Date(2026, 10, 12);

describe('normalizeVacunaName', () => {
  test('ignora mayúsculas, tildes y espacios', () => {
    expect(normalizeVacunaName('  Antirrábica ')).toBe('antirrabica');
    expect(normalizeVacunaName('ANTIRRABICA')).toBe('antirrabica');
    expect(normalizeVacunaName('Triple   felina')).toBe('triple felina');
  });
});

describe('groupVacunas', () => {
  const old = { id: 'a1', name: 'Antirrábica', appliedDate: '2024-01-10', nextDate: '2025-01-10' };
  const recent = { id: 'a2', name: 'antirrabica', appliedDate: '2026-11-01', nextDate: '2027-11-01' };
  const other = { id: 'b1', name: 'Parvovirus', appliedDate: '2026-10-01', nextDate: '2026-11-20' };

  test('solo la dosis más reciente define el estado; las demás son historial sin estado', () => {
    const [g] = groupVacunas([old, recent], TODAY).filter((x) => x.key === 'antirrabica');
    expect(g.latest.id).toBe('a2');
    expect(g.latest.status).toBe('ok');
    expect(g.history.map((h) => h.id)).toEqual(['a1']);
    expect(g.history[0].status).toBeUndefined();
  });

  test('el orden de entrada no importa', () => {
    const [a] = groupVacunas([recent, old], TODAY);
    expect(a.latest.id).toBe('a2');
  });

  test('una dosis vieja vencida sin otra más reciente sigue vencida', () => {
    const [g] = groupVacunas([old], TODAY);
    expect(g.latest.status).toBe('vencida');
    expect(g.history).toEqual([]);
  });

  test('tipos distintos son grupos distintos, ordenados por próxima dosis', () => {
    const groups = groupVacunas([recent, old, other], TODAY);
    expect(groups.map((g) => g.latest.id)).toEqual(['b1', 'a2']);
    expect(groups[0].latest.status).toBe('pronto');
  });

  test('una completa (sin próxima dosis) va al final', () => {
    const done = { id: 'c1', name: 'Rabia', appliedDate: '2026-01-01', nextDate: null };
    const groups = groupVacunas([done, other], TODAY);
    expect(groups.map((g) => g.latest.id)).toEqual(['b1', 'c1']);
    expect(groups[1].latest.status).toBe('completa');
  });

  test('lista vacía', () => {
    expect(groupVacunas([], TODAY)).toEqual([]);
    expect(groupVacunas(undefined, TODAY)).toEqual([]);
  });
});

describe('peso', () => {
  test('formatKg usa coma decimal', () => {
    expect(formatKg(4.2)).toBe('4,2');
    expect(formatKg(19)).toBe('19');
  });
  test('rango plausible por especie', () => {
    expect(weightOutlier('Gato', 4.2)).toBeNull();
    expect(weightOutlier('Gato', 122)).toMatchObject({ kind: 'alto', message: '122 kg es mucho para un gato.' });
    expect(weightOutlier('Gato', 0.1)).toMatchObject({ kind: 'bajo' });
    expect(weightOutlier('Perro', 40)).toBeNull();
    expect(weightOutlier('Perro', 120)).toMatchObject({ kind: 'alto' });
    expect(weightOutlier('Otro', 500)).toBeNull(); // sin rango definido
  });
});

describe('horario de medicinas', () => {
  test('formatTime12', () => {
    expect(formatTime12('08:00')).toBe('8:00 a. m.');
    expect(formatTime12('16:30')).toBe('4:30 p. m.');
    expect(formatTime12('00:05')).toBe('12:05 a. m.');
    expect(formatTime12('12:00')).toBe('12:00 p. m.');
    expect(formatTime12('xx')).toBe('');
  });
  test('scheduleSummary', () => {
    const base = { intervalValue: 8, intervalUnit: 'horas', firstDoseTime: '08:00' };
    expect(scheduleSummary({ ...base, durationDays: '7' })).toBe('Recordatorios: cada 8 horas desde las 8:00 a. m., durante 7 días');
    expect(scheduleSummary({ ...base, durationDays: '' })).toBe('Recordatorios: cada 8 horas desde las 8:00 a. m., sin fecha de fin');
    expect(scheduleSummary({ ...base, durationDays: '1' })).toContain('durante 1 día');
    expect(scheduleSummary({ intervalValue: 1, intervalUnit: 'dias', firstDoseTime: '21:00', durationDays: null })).toBe(
      'Recordatorios: cada día desde las 9:00 p. m., sin fecha de fin'
    );
    expect(scheduleSummary({ ...base, durationDays: '' }, false)).toMatch(/^Horario \(sin recordatorios\)/);
    expect(scheduleSummary({ ...base, intervalValue: 'x' })).toBe('');
  });
  test('formatNextDose', () => {
    const now = new Date(2026, 10, 12, 10, 0);
    expect(formatNextDose(new Date(2026, 10, 12, 16, 0), now)).toBe('hoy 4:00 p. m.');
    expect(formatNextDose(new Date(2026, 10, 13, 8, 0), now)).toBe('mañana 8:00 a. m.');
    expect(formatNextDose(new Date(2026, 10, 20, 8, 0), now)).toBe('20 Nov 8:00 a. m.');
  });
});

// Contraste WCAG 2.x de los pares de color de la paleta (texto normal >= 4,5; UI/texto grande >= 3)
function lum(hex) {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m);
  return (x + 0.05) / (y + 0.05);
};

describe('contraste de la paleta (WCAG)', () => {
  const white = '#FFFFFF';
  test.each([
    ['blanco / primaryStrong (botones, headers)', white, theme.primaryStrong],
    ['blanco / secondary (headers de salud)', white, theme.secondary],
    ['blanco / success', white, theme.success],
    ['blanco / danger', white, theme.danger],
    ['textMuted / blanco', theme.textMuted, white],
    ['textMuted / crema', theme.textMuted, theme.bg],
    ['textSubtle / blanco', theme.textSubtle, white],
    ['text / crema', theme.text, theme.bg],
    ['primaryStrong / blanco (texto de acción)', theme.primaryStrong, white],
    ['danger / blanco', theme.danger, white],
    ...Object.entries(statusColors).map(([k, c]) => [`badge ${k}`, c.fg, c.bg]),
  ])('%s >= 4,5:1', (_n, a, b) => {
    expect(ratio(a, b)).toBeGreaterThanOrEqual(4.5);
  });
});
