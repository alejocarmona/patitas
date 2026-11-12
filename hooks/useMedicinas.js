import { useSubcollection } from './useSubcollection';

// Activas primero, luego por inicio más reciente
const sortMedicinas = (a, b) => {
  if (!!a.active !== !!b.active) return a.active ? -1 : 1;
  return String(b.startDate).localeCompare(String(a.startDate));
};

export function useMedicinas(petId) {
  const { items, loading, error } = useSubcollection(petId, 'medicinas', sortMedicinas);
  return { medicinas: items, loading, error };
}
