import { useMemo } from 'react';
import { useSubcollection } from './useSubcollection';
import { getVacunaStatus } from '../utils/vacunaStatus';
import { groupVacunas } from '../utils/vacunas';

// Próxima dosis más cercana primero; las completas (sin próxima dosis) al final,
// de la más reciente aplicada a la más antigua.
const byNextDate = (a, b) => {
  const an = !!a.nextDate;
  const bn = !!b.nextDate;
  if (an !== bn) return an ? -1 : 1;
  if (!an) return String(b.appliedDate).localeCompare(String(a.appliedDate));
  return String(a.nextDate).localeCompare(String(b.nextDate));
};

// El status NO se guarda en Firestore: se calcula al leer.
export function useVacunas(petId) {
  const { items, loading, error } = useSubcollection(petId, 'vacunas', byNextDate);
  const vacunas = useMemo(() => {
    const today = new Date();
    return items.map((v) => ({ ...v, status: getVacunaStatus(v.nextDate, today) ?? 'ok' }));
  }, [items]);
  // `groups`: una entrada por tipo de vacuna; SOLO `latest` define el estado, `history` son dosis anteriores.
  // Las alertas, "por renovar" e Inicio usan `latests` (nunca el historial).
  const groups = useMemo(() => groupVacunas(items), [items]);
  const latests = useMemo(() => groups.map((g) => g.latest), [groups]);
  return { vacunas, groups, latests, loading, error };
}
