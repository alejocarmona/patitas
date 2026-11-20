import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { collection, onSnapshot } from '@react-native-firebase/firestore';
import { db } from '../firebase';

// Reintentos tras un error del listener: un onSnapshot que falla (red, token renovándose,
// permisos aún no propagados) queda muerto para siempre. Inicio es una pestaña que no se
// vuelve a montar, así que sin esto se podía quedar mostrando 0 aunque hubiera registros.
export const RETRY_DELAYS_MS = [2000, 5000, 15000, 30000, 60000];

// Escucha en tiempo real pets/{petId}/{name}. Devuelve { items, loading, error }.
// El orden se aplica en cliente con `sort` (evita índices compuestos).
export function useSubcollection(petId, name, sort) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  // Otra mascota (o subcolección): se empieza de cero, sin mostrar los datos de la anterior
  useEffect(() => {
    setAttempt(0);
    setItems([]);
    setError(null);
  }, [petId, name]);

  useEffect(() => {
    if (!petId) {
      setItems([]);
      setLoading(false);
      return undefined;
    }
    setLoading(true);
    let timer;
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
        const delay = RETRY_DELAYS_MS[attempt];
        if (delay !== undefined) timer = setTimeout(() => setAttempt((a) => a + 1), delay);
      }
    );
    return () => {
      clearTimeout(timer);
      unsub();
    };
    // `sort` es estable (definido a nivel de módulo en cada hook)
  }, [petId, name, sort, attempt]);

  // Agotados los reintentos: volver a intentar cuando la app regresa a primer plano
  useEffect(() => {
    if (!error) return undefined;
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active') setAttempt(0);
    });
    return () => sub.remove();
  }, [error]);

  return { items, loading, error };
}
