// Lógica PURA de recordatorios (sin dependencias nativas, testeable).
// Todas las fechas son LOCALES: nunca new Date('YYYY-MM-DD') (UTC; en Colombia corre un día).
import { parseLocalDate } from './vacunaStatus';

const HOUR_MS = 3600000;
const TIME_RE = /^(\d{1,2}):(\d{2})$/;

export function parseTime(str) {
  const m = TIME_RE.exec(String(str ?? '').trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return { h, min };
}

export function isValidTime(str) {
  return parseTime(str) !== null;
}

export function toTimeString(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

// Frecuencia legible que se guarda en `frequency` (compatibilidad con medicinas viejas).
export function formatFrequency({ intervalValue, intervalUnit, firstDoseTime }) {
  const n = Number(intervalValue);
  let every;
  if (intervalUnit === 'dias') every = n === 1 ? 'Cada día' : `Cada ${n} días`;
  else every = n === 1 ? 'Cada hora' : `Cada ${n} horas`;
  return `${every} desde las ${firstDoseTime}`;
}

// Último día del tratamiento (YYYY-MM-DD) derivado de startDate + durationDays.
export function endDateFromDuration(startDate, durationDays) {
  const start = parseLocalDate(startDate);
  const d = Number(durationDays);
  if (!start || !Number.isInteger(d) || d < 1) return null;
  const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + d - 1);
  const y = end.getFullYear();
  const m = String(end.getMonth() + 1).padStart(2, '0');
  const day = String(end.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// ¿Tiene la medicina el esquema estructurado (recordable)? Las viejas solo traen `frequency` libre.
export function hasStructuredSchedule(med) {
  return (
    !!med &&
    Number.isInteger(Number(med.intervalValue)) &&
    Number(med.intervalValue) >= 1 &&
    (med.intervalUnit === 'horas' || med.intervalUnit === 'dias') &&
    isValidTime(med.firstDoseTime) &&
    !!parseLocalDate(med.startDate)
  );
}

// Tomas futuras (Date locales) estrictamente posteriores a `now`, hasta el fin del
// tratamiento (primera toma + durationDays*24 h, exclusivo) o `now + horizonDays`,
// lo que ocurra primero. Sin durationDays solo manda el horizonte.
export function computeDoseTimes(
  { startDate, firstDoseTime, intervalValue, intervalUnit, durationDays },
  now = new Date(),
  horizonDays = 14
) {
  const day = parseLocalDate(startDate);
  const time = parseTime(firstDoseTime);
  const n = Number(intervalValue);
  if (!day || !time || !Number.isInteger(n) || n < 1) return [];
  if (intervalUnit !== 'horas' && intervalUnit !== 'dias') return [];

  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.h, time.min, 0, 0);
  const dur = Number(durationDays);
  const hasDuration = Number.isInteger(dur) && dur >= 1;
  const treatmentEnd = hasDuration
    ? new Date(start.getFullYear(), start.getMonth(), start.getDate() + dur, time.h, time.min, 0, 0)
    : null;
  const horizonEnd = new Date(now.getTime() + horizonDays * 24 * HOUR_MS);
  const end = treatmentEnd && treatmentEnd < horizonEnd ? treatmentEnd : horizonEnd;

  // La k-ésima toma. Horas: aritmética en ms. Días: por calendario (a prueba de cambio de hora).
  const at = (k) =>
    intervalUnit === 'horas'
      ? new Date(start.getTime() + k * n * HOUR_MS)
      : new Date(start.getFullYear(), start.getMonth(), start.getDate() + k * n, time.h, time.min, 0, 0);

  // Salta directo cerca de `now` (tratamientos largos) y luego avanza.
  const stepMs = intervalUnit === 'horas' ? n * HOUR_MS : n * 24 * HOUR_MS;
  let k = Math.max(0, Math.floor((now.getTime() - start.getTime()) / stepMs) - 1);
  const out = [];
  for (let t = at(k); t < end; t = at(++k)) {
    if (t > now) out.push(t);
    if (out.length > 5000) break; // guarda contra entradas absurdas
  }
  return out;
}

// Recordatorios de vacuna: 7 días antes a las 09:00 y el mismo día a las 09:00 (solo futuros).
export function computeVaccineReminderTimes(nextDate, now = new Date()) {
  const d = parseLocalDate(nextDate);
  if (!d) return [];
  const same = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 9, 0, 0, 0);
  const before = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 7, 9, 0, 0, 0);
  return [before, same].filter((t) => t > now);
}
