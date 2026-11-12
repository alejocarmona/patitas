import {
  getVacunaStatus,
  daysUntil,
  parseLocalDate,
  toDateString,
  isValidDateString,
} from '../utils/vacunaStatus';

// "Hoy" fijo: 2026-11-11 a media tarde (hora local)
const TODAY = new Date(2026, 10, 11, 15, 30, 0);

const addDays = (base, n) =>
  toDateString(new Date(base.getFullYear(), base.getMonth(), base.getDate() + n));

describe('getVacunaStatus (bordes)', () => {
  test('ayer -> vencida', () => {
    expect(getVacunaStatus(addDays(TODAY, -1), TODAY)).toBe('vencida');
  });

  test('hoy -> pronto (no vencida)', () => {
    expect(getVacunaStatus(addDays(TODAY, 0), TODAY)).toBe('pronto');
  });

  test('hoy + 30 -> pronto (borde inclusive)', () => {
    expect(getVacunaStatus(addDays(TODAY, 30), TODAY)).toBe('pronto');
  });

  test('hoy + 31 -> ok', () => {
    expect(getVacunaStatus(addDays(TODAY, 31), TODAY)).toBe('ok');
  });

  test('mucho tiempo atrás -> vencida; mucho adelante -> ok', () => {
    expect(getVacunaStatus('2020-01-01', TODAY)).toBe('vencida');
    expect(getVacunaStatus('2030-01-01', TODAY)).toBe('ok');
  });

  test('la hora del día de "hoy" no cambia el resultado', () => {
    const madrugada = new Date(2026, 10, 11, 0, 0, 1);
    const noche = new Date(2026, 10, 11, 23, 59, 59);
    expect(getVacunaStatus('2026-11-11', madrugada)).toBe('pronto');
    expect(getVacunaStatus('2026-11-11', noche)).toBe('pronto');
    expect(getVacunaStatus('2026-11-10', noche)).toBe('vencida');
  });

  test('acepta "hoy" como string YYYY-MM-DD', () => {
    expect(getVacunaStatus('2026-12-11', '2026-11-11')).toBe('pronto'); // +30
    expect(getVacunaStatus('2026-12-12', '2026-11-11')).toBe('ok'); // +31
  });

  test('cruza fin de año y año bisiesto', () => {
    expect(getVacunaStatus('2028-03-01', '2028-01-31')).toBe('pronto'); // +30 (feb bisiesto = 29)
    expect(getVacunaStatus('2028-03-02', '2028-01-31')).toBe('ok'); // +31
    expect(getVacunaStatus('2027-01-10', '2026-12-31')).toBe('pronto');
  });

  test('sin próxima dosis (null, undefined, vacío) -> completa', () => {
    expect(getVacunaStatus(null, TODAY)).toBe('completa');
    expect(getVacunaStatus(undefined, TODAY)).toBe('completa');
    expect(getVacunaStatus('', TODAY)).toBe('completa');
    expect(getVacunaStatus('   ', TODAY)).toBe('completa');
  });

  test('fecha inválida -> null', () => {
    expect(getVacunaStatus('2026-02-30', TODAY)).toBeNull();
    expect(getVacunaStatus('11/11/2026', TODAY)).toBeNull();
  });
});

describe('fechas locales', () => {
  test('parseLocalDate respeta día local (no UTC)', () => {
    const d = parseLocalDate('2026-11-11');
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(11);
    expect(d.getHours()).toBe(0);
  });

  test('daysUntil', () => {
    expect(daysUntil('2026-11-11', TODAY)).toBe(0);
    expect(daysUntil('2026-11-10', TODAY)).toBe(-1);
    expect(daysUntil('2026-12-11', TODAY)).toBe(30);
  });

  test('isValidDateString', () => {
    expect(isValidDateString('2026-11-11')).toBe(true);
    expect(isValidDateString('2026-13-01')).toBe(false);
    expect(isValidDateString('hoy')).toBe(false);
  });
});
