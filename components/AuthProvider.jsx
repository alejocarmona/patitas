import { useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from '@react-native-firebase/auth';
import { collection, doc, onSnapshot, query, where } from '@react-native-firebase/firestore';
import { auth, db } from '../firebase';
import { AuthContext } from '../hooks/useAuth';
import { setPetSpecies, setAnalyticsEnabled } from '../services/analytics';
import { normalizeMaxPets, pickSelected, selectedPetKey, sortPets } from '../utils/pets';

const ONBOARDING_KEY = 'onboardingSeen';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [pets, setPets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [petReady, setPetReady] = useState(false);
  const [maxPets, setMaxPets] = useState(Infinity);
  const [seen, setSeen] = useState(false);
  const [seenReady, setSeenReady] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabledState] = useState(true);

  // Flag de onboarding
  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((v) => setSeen(v === 'true'))
      .catch(() => {})
      .finally(() => setSeenReady(true));
  }, []);

  // Sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth(), (u) => {
      setUser(u);
      if (!u) {
        setPets([]);
        setSelectedId(null);
        setPetReady(true);
      } else {
        setPetReady(false);
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Mascotas del usuario (tiempo real). Orden y selección en el cliente (sin índice compuesto).
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return undefined;
    let alive = true;
    AsyncStorage.getItem(selectedPetKey(uid))
      .then((v) => alive && v && setSelectedId((cur) => cur ?? v))
      .catch(() => {});
    const q = query(collection(db(), 'pets'), where('userId', '==', uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setPets(sortPets(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
        setPetReady(true);
      },
      () => {
        // Error de permisos/red: no dejar la app en splash para siempre
        setPets([]);
        setPetReady(true);
      }
    );
    return () => {
      alive = false;
      unsub();
    };
  }, [uid]);

  // Tope de mascotas gratis (config/app.maxPetsFree). Sin documento, sin permiso o sin red: sin tope.
  useEffect(() => {
    if (!uid) return undefined;
    return onSnapshot(
      doc(db(), 'config', 'app'),
      (snap) => setMaxPets(normalizeMaxPets(snap.data?.()?.maxPetsFree)),
      () => setMaxPets(Infinity)
    );
  }, [uid]);

  const pet = useMemo(() => pickSelected(pets, selectedId), [pets, selectedId]);

  useEffect(() => {
    if (pet?.species) setPetSpecies(pet.species);
  }, [pet?.species]);

  const selectPet = useCallback(
    (id) => {
      setSelectedId(id);
      if (uid && id) AsyncStorage.setItem(selectedPetKey(uid), id).catch(() => {});
    },
    [uid]
  );

  // Preferencia de estadísticas (users/{uid}.analyticsEnabled): se aplica al iniciar sesión y al cambiar.
  // Sin sesión (incluido tras cerrar sesión) la recolección queda apagada.
  useEffect(() => {
    if (!uid) {
      setAnalyticsEnabled(false);
      return undefined;
    }
    return onSnapshot(
      doc(db(), 'users', uid),
      (snap) => {
        const enabled = snap.data()?.analyticsEnabled !== false;
        setAnalyticsEnabledState(enabled);
        setAnalyticsEnabled(enabled);
      },
      () => {}
    );
  }, [uid]);

  const setOnboardingSeen = useCallback(async () => {
    setSeen(true);
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch {
      // el estado en memoria basta para esta sesión
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      pet,
      pets,
      selectPet,
      maxPets,
      onboardingSeen: seen,
      loading: !(authReady && petReady && seenReady),
      analyticsEnabled,
      setOnboardingSeen,
    }),
    [user, pet, pets, selectPet, maxPets, seen, authReady, petReady, seenReady, analyticsEnabled, setOnboardingSeen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
