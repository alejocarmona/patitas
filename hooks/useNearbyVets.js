import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Location from 'expo-location';
import { getNearbyVets, placesKey } from '../services/places';
import { sortByDistance } from '../utils/geo';
import { createTtlCache } from '../utils/cache';
import { track } from '../services/analytics';

// Cache en memoria 10 min; pull-to-refresh forzado como máximo cada 60 s.
export const vetsCache = createTtlCache({ ttlMs: 10 * 60 * 1000, minForceMs: 60 * 1000 });
const KEY = 'vets';

// status: 'loading' | 'ready' | 'denied' | 'no_key' | 'error' | 'no_location'
export function useNearbyVets() {
  const [state, setState] = useState({ status: 'loading', vets: [] });
  const [refreshing, setRefreshing] = useState(false);
  const busy = useRef(false);
  const statusRef = useRef('loading');
  statusRef.current = state.status;

  const load = useCallback(async ({ force = false } = {}) => {
    if (busy.current) return;
    if (!placesKey()) {
      setState({ status: 'no_key', vets: [] });
      return;
    }
    const cached = vetsCache.read(KEY, { force });
    if (cached.hit) {
      setState({ status: 'ready', vets: cached.value });
      return;
    }
    busy.current = true;
    if (!force) setState((s) => ({ status: 'loading', vets: s.vets }));
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      track.locationPermission(perm.status === 'granted');
      if (perm.status !== 'granted') {
        setState({ status: 'denied', vets: [] });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const origin = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const places = await getNearbyVets(origin.lat, origin.lng);
      const vets = sortByDistance(places, origin);
      vetsCache.write(KEY, vets);
      track.directoryViewed(vets.length);
      setState({ status: 'ready', vets });
    } catch (e) {
      const code = e?.code;
      setState({ status: code === 'no_key' ? 'no_key' : 'error', vets: [] });
    } finally {
      busy.current = false;
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Si el usuario concede el permiso desde Ajustes y vuelve a la app, reintenta solo.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'active' && statusRef.current === 'denied') load();
    });
    return () => sub.remove();
  }, [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load({ force: true });
    setRefreshing(false);
  }, [load]);

  return { ...state, refreshing, refresh, retry: () => load() };
}
