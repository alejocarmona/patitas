import {
  computeDoseTimes,
  computeVaccineReminderTimes,
  endDateFromDuration,
  formatFrequency,
  hasStructuredSchedule,
} from '../utils/reminders';

const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

describe('computeDoseTimes', () => {
  const base = { startDate: '2026-11-11', firstDoseTime: '08:00', intervalValue: 8, intervalUnit: 'horas' };

  test('cada 8 h desde 08:00 -> 08:00, 16:00, 00:00...', () => {
    const now = new Date(2026, 10, 11, 7, 0);
    const out = computeDoseTimes(base, now, 2).map(fmt);
    expect(out.slice(0, 4)).toEqual(['2026-11-11 08:00', '2026-11-11 16:00', '2026-11-12 00:00', '2026-11-12 08:00']);
  });

  test('cada 1 día a la misma hora', () => {
    const now = new Date(2026, 10, 11, 7, 0);
    const out = computeDoseTimes({ ...base, intervalValue: 1, intervalUnit: 'dias' }, now, 3).map(fmt);
    expect(out).toEqual(['2026-11-11 08:00', '2026-11-12 08:00', '2026-11-13 08:00']);
  });

  test('durationDays corta la lista (8 h x 2 días = 6 tomas)', () => {
    const now = new Date(2026, 10, 11, 7, 0);
    const out = computeDoseTimes({ ...base, durationDays: 2 }, now, 14).map(fmt);
    expect(out).toHaveLength(6);
    expect(out[5]).toBe('2026-11-13 00:00'); // 08,16,00,08,16,00
  });

  test('sin durationDays respeta el horizonte', () => {
    const now = new Date(2026, 10, 11, 7, 0);
    const out = computeDoseTimes(base, now, 2);
    expect(out).toHaveLength(6); // 2 días * 3 tomas/día
    expect(out.every((t) => t < new Date(2026, 10, 13, 7, 0))).toBe(true);
  });

  test('now a mitad de día descarta las tomas pasadas', () => {
    const now = new Date(2026, 10, 11, 12, 0);
    const out = computeDoseTimes(base, now, 1).map(fmt);
    expect(out[0]).toBe('2026-11-11 16:00');
    expect(out.every((s) => s > '2026-11-11 12:00')).toBe(true);
  });

  test('una toma exactamente en now no cuenta (estrictamente futura)', () => {
    const now = new Date(2026, 10, 11, 8, 0);
    expect(fmt(computeDoseTimes(base, now, 1)[0])).toBe('2026-11-11 16:00');
  });

  test('cruza medianoche y cambio de mes', () => {
    const now = new Date(2026, 10, 30, 20, 0);
    const out = computeDoseTimes({ ...base, startDate: '2026-11-29' }, now, 1).map(fmt);
    expect(out.slice(0, 3)).toEqual(['2026-12-01 00:00', '2026-12-01 08:00', '2026-12-01 16:00']);
  });

  test('tratamiento que empieza en el futuro', () => {
    const now = new Date(2026, 10, 11, 12, 0);
    const out = computeDoseTimes({ ...base, startDate: '2026-11-15' }, now, 14).map(fmt);
    expect(out[0]).toBe('2026-11-15 08:00');
  });

  test('tratamiento ya terminado -> []', () => {
    const now = new Date(2026, 10, 20, 12, 0);
    expect(computeDoseTimes({ ...base, durationDays: 3 }, now, 14)).toEqual([]);
  });

  test('entradas inválidas -> []', () => {
    const now = new Date(2026, 10, 11, 12, 0);
    expect(computeDoseTimes({ ...base, intervalValue: 0 }, now)).toEqual([]);
    expect(computeDoseTimes({ ...base, firstDoseTime: '25:00' }, now)).toEqual([]);
    expect(computeDoseTimes({ ...base, startDate: 'x' }, now)).toEqual([]);
    expect(computeDoseTimes({ ...base, intervalUnit: 'meses' }, now)).toEqual([]);
  });
});

describe('computeVaccineReminderTimes', () => {
  test('7 días antes y el mismo día a las 09:00', () => {
    const now = new Date(2026, 10, 11, 12, 0);
    expect(computeVaccineReminderTimes('2026-12-01', now).map(fmt)).toEqual(['2026-11-24 09:00', '2026-12-01 09:00']);
  });

  test('omite los pasados', () => {
    const now = new Date(2026, 10, 11, 12, 0);
    expect(computeVaccineReminderTimes('2026-11-15', now).map(fmt)).toEqual(['2026-11-15 09:00']);
    expect(computeVaccineReminderTimes('2026-11-11', now)).toEqual([]); // hoy 09:00 ya pasó
    expect(computeVaccineReminderTimes('2026-11-01', now)).toEqual([]);
  });

  test('inválida o vacía -> []', () => {
    expect(computeVaccineReminderTimes('', new Date())).toEqual([]);
    expect(computeVaccineReminderTimes(null, new Date())).toEqual([]);
  });
});

describe('helpers', () => {
  test('formatFrequency', () => {
    expect(formatFrequency({ intervalValue: 8, intervalUnit: 'horas', firstDoseTime: '08:00' })).toBe('Cada 8 horas desde las 08:00');
    expect(formatFrequency({ intervalValue: 1, intervalUnit: 'dias', firstDoseTime: '20:30' })).toBe('Cada día desde las 20:30');
  });
  test('endDateFromDuration (último día)', () => {
    expect(endDateFromDuration('2026-11-29', 3)).toBe('2026-12-01');
    expect(endDateFromDuration('2026-11-29', '')).toBeNull();
  });
  test('hasStructuredSchedule: la medicina vieja (solo frequency) no lo tiene', () => {
    expect(hasStructuredSchedule({ frequency: 'Cada 12 horas', startDate: '2026-11-11' })).toBe(false);
    expect(
      hasStructuredSchedule({ intervalValue: 8, intervalUnit: 'horas', firstDoseTime: '08:00', startDate: '2026-11-11' })
    ).toBe(true);
  });
});
