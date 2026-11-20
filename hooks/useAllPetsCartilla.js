import { useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { collection, onSnapshot } from '@react-native-firebase/firestore';
import { db } from '../firebase';

const SUBS = ['vacunas', 'medicinas'];

// Vacunas y medicinas de TODAS las mascotas (no solo la seleccionada): los recordatorios
// de cada mascota deben seguir programados aunque se esté viendo otra.
// Devuelve { data: { [petId]: { vacunas, medicinas } }, ready }.
export function useAllPetsCartilla(petIds) {
  const key = petIds.join('|');
  const [data, setData] = useState({});
  const [nonce, setNonce] = useState(0);
  const failed = useRef(false);
  // Un listener que falla queda muerto: al volver a primer plano se vuelve a escuchar
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && failed.current) {
        failed.current = false;
        setNonce((n) => n + 1);
      }
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    const ids = key ? key.split('|') : [];
    setData((prev) => Object.fromEntries(Object.entries(prev).filter(([id]) => ids.includes(id))));
    const unsubs = [];
    for (const id of ids) {
      for (const sub of SUBS) {
        unsubs.push(
          onSnapshot(
            collection(db(), 'pets', id, sub),
            (snap) =>
              setData((prev) => ({ ...prev, [id]: { ...prev[id], [sub]: snap.docs.map((d) => ({ id: d.id, ...d.data() })) } })),
            // Sin permiso/red: lista vacía para no bloquear la sincronización de las demás
            () => {
              failed.current = true;
              setData((prev) => ({ ...prev, [id]: { ...prev[id], [sub]: prev[id]?.[sub] ?? [] } }));
            }
          )
        );
      }
    }
    return () => unsubs.forEach((u) => u());
  }, [key, nonce]);
  const ids = key ? key.split('|') : [];
  const ready = ids.every((id) => SUBS.every((sub) => Array.isArray(data[id]?.[sub])));
  return { data, ready };
}
