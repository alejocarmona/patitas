import { useMemo } from 'react';
import { useSubcollection } from './useSubcollection';
import { getVacunaStatus } from '../utils/vacunaStatus';

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
  return { vacunas, loading, error };
}
