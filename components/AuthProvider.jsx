import { useEffect, useMemo, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from '@react-native-firebase/auth';
import { collection, doc, limit, onSnapshot, query, where } from '@react-native-firebase/firestore';
import { auth, db } from '../firebase';
import { AuthContext } from '../hooks/useAuth';
import { setPetSpecies, setAnalyticsEnabled } from '../services/analytics';

const ONBOARDING_KEY = 'onboardingSeen';

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [pet, setPet] = useState(null);
  const [petReady, setPetReady] = useState(false);
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
        setPet(null);
        setPetReady(true);
      } else {
        setPetReady(false);
      }
      setAuthReady(true);
    });
    return unsub;
  }, []);

  // Mascota del usuario (tiempo real)
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) return undefined;
    const q = query(collection(db(), 'pets'), where('userId', '==', uid), limit(1));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const d = snap.docs[0];
        const next = d ? { id: d.id, ...d.data() } : null;
        setPet(next);
        if (next?.species) setPetSpecies(next.species);
        setPetReady(true);
      },
      () => {
        // Error de permisos/red: no dejar la app en splash para siempre
        setPet(null);
        setPetReady(true);
      }
    );
    return unsub;
  }, [uid]);

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
      onboardingSeen: seen,
      loading: !(authReady && petReady && seenReady),
      analyticsEnabled,
      setOnboardingSeen,
    }),
    [user, pet, seen, authReady, petReady, seenReady, analyticsEnabled, setOnboardingSeen]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
