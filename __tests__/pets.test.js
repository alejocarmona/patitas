// Varias mascotas: lógica pura (orden, selección, tope) y recordatorios por mascota.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { canAddPet, normalizeMaxPets, pickSelected, sortPets } from '../utils/pets';

jest.mock('expo-notifications', () => require('../test-helpers/notificationsMock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const { syncAll } = require('../services/reminders');

describe('utils/pets', () => {
  test('ordena de la más antigua a la más nueva; la recién creada (sin createdAt) va al final', () => {
    const pets = [
      { id: 'b', createdAt: { seconds: 200 } },
      { id: 'nueva' },
      { id: 'a', createdAt: { toMillis: () => 100000 } },
    ];
    expect(sortPets(pets).map((p) => p.id)).toEqual(['a', 'b', 'nueva']);
  });

  test('elige la seleccionada; si no existe (borrada o primera vez) cae en la primera', () => {
    const pets = [{ id: 'a' }, { id: 'b' }];
    expect(pickSelected(pets, 'b').id).toBe('b');
    expect(pickSelected(pets, 'borrada').id).toBe('a');
    expect(pickSelected(pets, null).id).toBe('a');
    expect(pickSelected([], 'a')).toBeNull();
  });

  test('tope: sin valor válido no hay tope (llega apagado); con tope 2 no deja una tercera', () => {
    expect(normalizeMaxPets(undefined)).toBe(Infinity);
    expect(normalizeMaxPets('x')).toBe(Infinity);
    expect(normalizeMaxPets(0)).toBe(Infinity);
    expect(canAddPet(50, undefined)).toBe(true);
    expect(canAddPet(1, 2)).toBe(true);
    expect(canAddPet(2, 2)).toBe(false);
  });
});

describe('syncAll con varias mascotas', () => {
  const lejos = (d) => {
    const x = new Date(2026, 10, 20);
    x.setDate(x.getDate() + d);
    return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
  };
  const now = new Date(2026, 10, 20, 8, 0);

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  test('programa las vacunas de TODAS las mascotas con su nombre y su petId', async () => {
    await syncAll({
      now,
      groups: [
        { petId: 'p1', petName: 'Lirya', vacunas: [{ id: 'v1', name: 'Rabia', nextDate: lejos(30) }], medicinas: [] },
        { petId: 'p2', petName: 'Toby', vacunas: [{ id: 'v2', name: 'Triple', nextDate: lejos(40) }], medicinas: [] },
      ],
    });
    const calls = Notifications.scheduleNotificationAsync.mock.calls.map((c) => c[0].content);
    expect(calls.some((c) => c.title.includes('Lirya') && c.data.petId === 'p1')).toBe(true);
    expect(calls.some((c) => c.title.includes('Toby') && c.data.petId === 'p2')).toBe(true);
  });

  test('cambiar de mascota NO borra los recordatorios de la otra: solo se cancela lo que ya no existe', async () => {
    const groups = [
      { petId: 'p1', petName: 'Lirya', vacunas: [{ id: 'v1', name: 'Rabia', nextDate: lejos(30) }], medicinas: [] },
      { petId: 'p2', petName: 'Toby', vacunas: [{ id: 'v2', name: 'Triple', nextDate: lejos(40) }], medicinas: [] },
    ];
    await syncAll({ now, groups });
    jest.clearAllMocks();
    await syncAll({ now, groups }); // misma data (p. ej. tras cambiar la seleccionada): nada que cancelar
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    const store = JSON.parse(await AsyncStorage.getItem('reminders.v1'));
    expect(Object.keys(store).sort()).toEqual(['vacunas/v1', 'vacunas/v2']);

    await syncAll({ now, groups: [groups[0]] }); // Toby eliminada: sus recordatorios se cancelan
    const after = JSON.parse(await AsyncStorage.getItem('reminders.v1'));
    expect(Object.keys(after)).toEqual(['vacunas/v1']);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalled();
  });

  test('la forma heredada (una mascota, sin groups) sigue funcionando y no agrega petId', async () => {
    await syncAll({ now, petName: 'Lirya', vacunas: [{ id: 'v1', name: 'Rabia', nextDate: lejos(30) }], medicinas: [] });
    const c = Notifications.scheduleNotificationAsync.mock.calls[0][0].content;
    expect(c.data).toEqual({ tab: 'vacunas' });
  });
});
