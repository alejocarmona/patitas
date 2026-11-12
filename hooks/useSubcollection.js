import { useEffect, useState } from 'react';
import { collection, onSnapshot } from '@react-native-firebase/firestore';
import { db } from '../firebase';

// Escucha en tiempo real pets/{petId}/{name}. Devuelve { items, loading, error }.
// El orden se aplica en cliente con `sort` (evita índices compuestos).
export function useSubcollection(petId, name, sort) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!petId) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    const unsub = onSnapshot(
      collection(db(), 'pets', petId, name),
      (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        if (sort) list.sort(sort);
        setItems(list);
        setError(null);
        setLoading(false);
      },
      (e) => {
        setError(e);
        setLoading(false);
      }
    );
    return unsub;
    // `sort` es estable (definido a nivel de módulo en cada hook)
  }, [petId, name, sort]);

  return { items, loading, error };
}
