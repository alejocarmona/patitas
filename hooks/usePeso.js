import { useSubcollection } from './useSubcollection';

// Más reciente primero
const byDateDesc = (a, b) => String(b.date).localeCompare(String(a.date));

export function usePeso(petId) {
  const { items, loading, error } = useSubcollection(petId, 'pesos', byDateDesc);
  return { pesos: items, loading, error };
}
