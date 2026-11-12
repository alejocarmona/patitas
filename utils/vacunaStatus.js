// Fechas 'YYYY-MM-DD' siempre en hora LOCAL.
// Nunca usar new Date('YYYY-MM-DD'): se parsea como UTC y en Colombia (UTC-5)
// queda corrido un día hacia atrás.

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseLocalDate(str) {
  const m = DATE_RE.exec(String(str ?? '').trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(y, mo - 1, d);
  // Rechaza fechas inexistentes (2025-02-30 se normalizaría a marzo)
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

export function isValidDateString(str) {
  return parseLocalDate(str) !== null;
}

export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDay(value) {
  if (value instanceof Date) return startOfDay(value);
  return parseLocalDate(value);
}

// Días enteros entre hoy y nextDate (negativo si ya pasó). null si la fecha es inválida.
export function daysUntil(nextDate, today = new Date()) {
  const n = toDay(nextDate);
  const t = toDay(today);
  if (!n || !t) return null;
  // Por componentes (UTC) para no depender de cambios de horario
  const a = Date.UTC(n.getFullYear(), n.getMonth(), n.getDate());
  const b = Date.UTC(t.getFullYear(), t.getMonth(), t.getDate());
  return Math.round((a - b) / 86400000);
}

// 'completa' si no hay próxima dosis (null/''/undefined): esquema terminado, sin vencimiento.
// 'vencida' si nextDate < hoy; 'pronto' si hoy <= nextDate <= hoy+30; 'ok' si > hoy+30.
// `today` puede ser Date o 'YYYY-MM-DD'. Devuelve null si nextDate no es vacía pero tampoco válida.
export function getVacunaStatus(nextDate, today = new Date()) {
  if (nextDate === null || nextDate === undefined || String(nextDate).trim() === '') return 'completa';
  const diff = daysUntil(nextDate, today);
  if (diff === null) return null;
  if (diff < 0) return 'vencida';
  if (diff <= 30) return 'pronto';
  return 'ok';
}

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatDateEs(str) {
  const d = parseLocalDate(str);
  if (!d) return '';
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatAge(birthdate, today = new Date()) {
  const b = parseLocalDate(birthdate);
  if (!b) return '';
  const t = startOfDay(today);
  let months = (t.getFullYear() - b.getFullYear()) * 12 + (t.getMonth() - b.getMonth());
  if (t.getDate() < b.getDate()) months -= 1;
  if (months < 0) return '';
  if (months < 12) return months === 1 ? '1 mes' : `${months} meses`;
  const years = Math.floor(months / 12);
  return years === 1 ? '1 año' : `${years} años`;
}
