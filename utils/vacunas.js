// Agrupa las dosis por tipo de vacuna: SOLO la dosis más reciente (por fecha de
// aplicación) define el estado; las anteriores son "Historial" (sin estado, no cuentan
// en alertas ni en "por renovar").
import { getVacunaStatus } from './vacunaStatus';

// 'Antirrábica ', 'antirrabica' y 'ANTIRRÁBICA' son la misma vacuna.
export function normalizeVacunaName(name) {
  return String(name ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

// Más reciente primero: por appliedDate; empate -> la de nextDate más lejana (null = sin vencimiento, última).
const newestFirst = (a, b) => {
  const byApplied = String(b.appliedDate ?? '').localeCompare(String(a.appliedDate ?? ''));
  if (byApplied !== 0) return byApplied;
  return String(b.nextDate ?? '9999-99-99').localeCompare(String(a.nextDate ?? '9999-99-99'));
};

// Mismo orden que la lista: próxima dosis más cercana primero; completas al final.
const byLatestNextDate = (a, b) => {
  const an = !!a.latest.nextDate;
  const bn = !!b.latest.nextDate;
  if (an !== bn) return an ? -1 : 1;
  if (!an) return String(b.latest.appliedDate).localeCompare(String(a.latest.appliedDate));
  return String(a.latest.nextDate).localeCompare(String(b.latest.nextDate));
};

// vacunas: dosis individuales (con o sin `status`). Devuelve
// [{ key, name, latest: {...dosis con status}, history: [dosis anteriores, sin status] }]
export function groupVacunas(vacunas, today = new Date()) {
  const map = new Map();
  for (const v of vacunas ?? []) {
    const key = normalizeVacunaName(v.name);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(v);
  }
  const groups = [];
  for (const [key, doses] of map) {
    doses.sort(newestFirst);
    const [first, ...rest] = doses;
    const latest = { ...first, status: getVacunaStatus(first.nextDate, today) ?? 'ok' };
    const history = rest.map((d) => {
      const { status, ...plain } = d; // el historial no lleva estado
      return plain;
    });
    groups.push({ key, name: first.name, latest, history });
  }
  return groups.sort(byLatestNextDate);
}
