import { useEffect, useMemo, useRef } from 'react';
import { AppState } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { usePets } from './usePet';
import { useAllPetsCartilla } from './useAllPetsCartilla';
import { initNotifications, syncAll } from '../services/reminders';

// Se monta una vez en (main)/_layout. Mantiene las notificaciones locales al día con lo que
// hay en Firestore (al abrir la app, al volver a primer plano y cuando cambian los datos)
// y, al tocar una notificación, selecciona esa mascota y abre la Cartilla en la pestaña correcta.
export function useReminders() {
  const { pets, pet, selectPet } = usePets();
  const router = useRouter();
  const petIds = useMemo(() => pets.map((p) => p.id), [pets]);
  const { data, ready } = useAllPetsCartilla(petIds);

  const groups = useMemo(
    () =>
      pets.map((p) => ({
        petId: p.id,
        petName: p.name,
        vacunas: data[p.id]?.vacunas ?? [],
        medicinas: data[p.id]?.medicinas ?? [],
      })),
    [pets, data]
  );
  const latest = useRef({});
  latest.current = { ready: pets.length > 0 && ready, groups };

  useEffect(() => {
    initNotifications().catch(() => {});
  }, []);

  useEffect(() => {
    if (!latest.current.ready) return;
    syncAll({ groups: latest.current.groups }).catch(() => {});
  }, [ready, groups]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      const { ready: r, groups: g } = latest.current;
      if (state === 'active' && r) syncAll({ groups: g }).catch(() => {});
    });
    return () => sub.remove();
  }, []);

  // Toque en una notificación (también arranque en frío) -> su mascota + Cartilla en su pestaña
  const response = Notifications.useLastNotificationResponse();
  const handled = useRef(null);
  useEffect(() => {
    if (!response || !pet) return;
    const id = response.notification?.request?.identifier;
    if (handled.current === id) return;
    handled.current = id;
    if (response.actionIdentifier !== Notifications.DEFAULT_ACTION_IDENTIFIER) return;
    const content = response.notification?.request?.content?.data ?? {};
    if (content.petId && content.petId !== pet.id && pets.some((p) => p.id === content.petId)) selectPet(content.petId);
    router.push({ pathname: '/cartilla', params: { tab: content.tab === 'vacunas' ? 'vacunas' : 'medicinas' } });
  }, [response, pet, pets, selectPet, router]);
}
