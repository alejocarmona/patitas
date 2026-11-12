import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { usePet } from './usePet';
import { useVacunas } from './useVacunas';
import { useMedicinas } from './useMedicinas';
import { initNotifications, syncAll } from '../services/reminders';

// Se monta una vez en (main)/_layout. Mantiene las notificaciones locales al día con lo que
// hay en Firestore (al abrir la app, al volver a primer plano y cuando cambian los datos)
// y abre la Cartilla en la pestaña correcta al tocar una notificación.
export function useReminders() {
  const pet = usePet();
  const router = useRouter();
  const { vacunas, loading: lv } = useVacunas(pet?.id);
  const { medicinas, loading: lm } = useMedicinas(pet?.id);
  const latest = useRef({});
  latest.current = { petName: pet?.name, ready: !!pet && !lv && !lm, vacunas, medicinas };

  useEffect(() => {
    initNotifications().catch(() => {});
  }, []);

  useEffect(() => {
    if (!latest.current.ready) return;
    const { petName, medicinas: m, vacunas: v } = latest.current;
    syncAll({ petName, medicinas: m, vacunas: v }).catch(() => {});
  }, [pet?.id, pet?.name, lv, lm, vacunas, medicinas]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      const { ready, petName, medicinas: m, vacunas: v } = latest.current;
      if (state === 'active' && ready) syncAll({ petName, medicinas: m, vacunas: v }).catch(() => {});
    });
    return () => sub.remove();
  }, []);

  // Toque en una notificación (también arranque en frío) -> Cartilla en su pestaña
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef(null);
  useEffect(() => {
    if (!response || !pet) return;
    const id = response.notification?.request?.identifier;
    if (handled.current === id) return;
    handled.current = id;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const tab = response.notification?.request?.content?.data?.tab;
    router.push({ pathname: '/cartilla', params: { tab: tab === 'vacunas' ? 'vacunas' : 'medicinas' } });
  }, [response, pet, router]);
}
