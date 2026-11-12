// Integración (expo-router/testing-library): vacuna sin próxima dosis y recordatorios locales.
// Usa los layouts y pantallas REALES; mockea Firestore (hooks/servicios), analytics y expo-notifications.
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { toDateString } from '../utils/vacunaStatus';

const mockPet = { id: 'pet1', name: 'Lirya', species: 'Gato', breed: 'Criollo', gender: 'Hembra', birthdate: '2022-05-14', avatarId: 'gato-1' };

// Mini "Firestore" reactivo en memoria
const mockStore = { data: { vacunas: [], medicinas: [], pesos: [] }, version: 0, listeners: new Set(), seq: 1 };
const mockEmit = () => {
  mockStore.version += 1;
  mockStore.listeners.forEach((f) => f());
};
const mockPick = { date: new Date(2026, 10, 11) };

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'u1', displayName: 'Alejo C' }, pet: mockPet, onboardingSeen: true, loading: false }),
}));
jest.mock('../hooks/usePet', () => ({ usePet: () => mockPet }));
jest.mock('../hooks/useSubcollection', () => {
  const React = require('react');
  return {
    useSubcollection: (petId, name, sort) => {
      const [, force] = React.useReducer((x) => x + 1, 0);
      React.useEffect(() => {
        mockStore.listeners.add(force);
        return () => mockStore.listeners.delete(force);
      }, []);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      const items = React.useMemo(() => {
        const list = [...mockStore.data[name]];
        if (sort) list.sort(sort);
        return list;
      }, [mockStore.version, name, sort]);
      return { items, loading: false, error: null };
    },
  };
});
jest.mock('../hooks/usePeso', () => ({ usePeso: () => ({ pesos: [], loading: false }) }));
jest.mock('../services/firestore', () => ({
  addCartillaItem: jest.fn(async (petId, sub, data) => {
    const item = { id: `${sub}-${mockStore.seq++}`, ...data };
    mockStore.data[sub].push(item);
    mockEmit();
    return { id: item.id };
  }),
  updateCartillaItem: jest.fn(async (petId, sub, id, data) => {
    mockStore.data[sub] = mockStore.data[sub].map((x) => (x.id === id ? { ...x, ...data } : x));
    mockEmit();
  }),
  deleteCartillaItem: jest.fn(async (petId, sub, id) => {
    mockStore.data[sub] = mockStore.data[sub].filter((x) => x.id !== id);
    mockEmit();
  }),
  updatePet: jest.fn(() => Promise.resolve()),
}));
jest.mock('../services/auth', () => ({ signOut: jest.fn(() => Promise.resolve()), logout: jest.fn(() => Promise.resolve()) }));
jest.mock('../services/accountDeletion', () => ({ deleteAccount: jest.fn(() => Promise.resolve()) }));
jest.mock('../services/analytics', () => ({
  track: {
    vaccineAdded: jest.fn(),
    medicineAdded: jest.fn(),
    reminderEnabled: jest.fn(),
    notificationPermission: jest.fn(),
    cartillaViewed: jest.fn(),
    overdueVaccineSeen: jest.fn(),
  },
  setPetSpecies: jest.fn(),
  logEvent: jest.fn(),
}));
jest.mock('../services/tips', () => require('../test-helpers/tipsMock').servicesMock());
jest.mock('../hooks/useSavedTips', () => require('../test-helpers/tipsMock').savedHookMock());
jest.mock('expo-location', () => require('../test-helpers/locationMock'));
jest.mock('expo-notifications', () => require('../test-helpers/notificationsMock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@react-native-community/datetimepicker', () => ({
  DateTimePickerAndroid: {
    open: jest.fn(({ mode, onChange }) =>
      onChange({ type: 'set' }, mode === 'time' ? new Date(2026, 10, 11, 9, 30) : mockPick.date)
    ),
  },
}));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Feather: ({ name }) => <Text>{`icon-${name}`}</Text> };
});

jest.setTimeout(30000);
// jest-expo usa timers falsos: se vacían las promesas pendientes (microtareas) en vez de setTimeout
const flush = async () => {
  for (let i = 0; i < 50; i++) await Promise.resolve();
};
const Notifications = require('expo-notifications');
const { addCartillaItem, updateCartillaItem } = require('../services/firestore');
const { track } = require('../services/analytics');
const routes = require('../test-helpers/routes');

const render = (initialUrl) => renderRouter(routes.build(), { initialUrl });
const press = async (el) => {
  await fireEvent.press(el);
};
const today = () => toDateString(new Date());
const GRANTED = { granted: true, status: 'granted', canAskAgain: true };

const seedMedicina = (extra = {}) => {
  mockStore.data.medicinas.push({
    id: 'm1',
    name: 'Amoxicilina',
    dose: '1 tableta',
    frequency: 'Cada 8 horas desde las 08:00',
    intervalValue: 8,
    intervalUnit: 'horas',
    firstDoseTime: '08:00',
    startDate: today(),
    durationDays: null,
    endDate: null,
    reminders: true,
    active: true,
    notes: null,
    ...extra,
  });
};

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  mockStore.data = { vacunas: [], medicinas: [], pesos: [] };
  mockStore.seq = 1;
  mockStore.version += 1;
  mockPick.date = new Date(2026, 10, 11);
  Notifications.__state.permission = GRANTED;
  Notifications.__state.requestResult = GRANTED;
  Notifications.__state.lastResponse = undefined;
  jest.spyOn(Alert, 'alert').mockImplementation((title, msg, buttons = []) => {
    // Auto-confirma: botón destructivo (eliminar) o "Continuar" (permiso)
    const b = buttons.find((x) => x.style === 'destructive') ?? buttons.find((x) => x.text === 'Continuar');
    if (b?.onPress) b.onPress();
  });
});

describe('Mejoras 1 y 2: vacuna con próxima dosis opcional', () => {
  test('guardar sin próxima dosis -> nextDate null, fecha de aplicación = hoy, vuelve a /cartilla y muestra "Completa"', async () => {
    await render('/cartilla');
    await press(screen.getByText('Agregar vacuna'));
    await waitFor(() => expect(screen).toHavePathname('/add-vacuna'));
    expect(screen.getByLabelText('¿Cuándo se la pusieron a Lirya?')).toBeTruthy();
    expect(screen.getByText('Próxima dosis (opcional)')).toBeTruthy();
    await press(screen.getByText('Panleucopenia'));
    await press(screen.getByText('Guardar vacuna'));

    await waitFor(() => expect(addCartillaItem).toHaveBeenCalledTimes(1));
    expect(addCartillaItem.mock.calls[0][2]).toMatchObject({ name: 'Panleucopenia', appliedDate: today(), nextDate: null });
    expect(track.vaccineAdded).toHaveBeenCalledWith('completa');
    await waitFor(() => expect(screen).toHavePathname('/cartilla'));
    expect(await screen.findByText('Completa')).toBeTruthy();
    // Sin próxima dosis no hay nada que recordar ni permiso que pedir
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect(Alert.alert).not.toHaveBeenCalled();
  });

  test('vacuna con próxima dosis futura programa 2 recordatorios (7 días antes y el mismo día)', async () => {
    const next = new Date();
    next.setDate(next.getDate() + 20);
    mockPick.date = next;
    await render('/add-vacuna');
    await press(screen.getByText('Panleucopenia'));
    await press(screen.getByLabelText('Próxima dosis (opcional)'));
    await press(screen.getByText('Guardar vacuna'));
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(2));
    const dates = Notifications.scheduleNotificationAsync.mock.calls.map((c) => c[0].trigger.date);
    expect(dates.every((d) => d.getHours() === 9 && d.getMinutes() === 0)).toBe(true);
    expect(track.reminderEnabled).toHaveBeenCalledWith('vaccine');
  });
});

describe('Mejora 4: recordatorios de medicinas', () => {
  test('guardar medicina con recordatorio programa las notificaciones esperadas y la lista muestra la frecuencia legible', async () => {
    await render('/cartilla?tab=medicinas');
    await press(screen.getByText('Agregar medicina'));
    await waitFor(() => expect(screen).toHavePathname('/add-medicina'));
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: Amoxicilina'), 'Amoxicilina');
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: 1 tableta, 2 ml'), '1 tableta');
    await press(screen.getByText('Guardar medicina'));
    await waitFor(() => expect(addCartillaItem).toHaveBeenCalledTimes(1));
    expect(addCartillaItem.mock.calls[0][2]).toMatchObject({
      name: 'Amoxicilina',
      frequency: 'Cada 8 horas desde las 08:00',
      intervalValue: 8,
      intervalUnit: 'horas',
      firstDoseTime: '08:00',
      durationDays: null,
      endDate: null,
      reminders: true,
      active: true,
    });
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(42));
    const first = Notifications.scheduleNotificationAsync.mock.calls[0][0];
    expect(first.content.title).toBe('Hora de la medicina de Lirya');
    expect(first.content.body).toBe('Amoxicilina, 1 tableta');
    expect(first.content.data).toEqual({ tab: 'medicinas' });
    expect(first.trigger.channelId).toBe('recordatorios');
    expect(track.reminderEnabled).toHaveBeenCalledWith('medicine');
    await waitFor(() => expect(screen).toHavePathname('/cartilla'));
    expect(await screen.findByText(/Cada 8 horas desde las 08:00/)).toBeTruthy();
    // La sincronización posterior por el listener de Firestore no duplica (misma firma)
    await flush();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(42);
  });

  test('permiso denegado: se guarda igual, no se programa nada y se avisa que están apagados', async () => {
    Notifications.__state.permission = { granted: false, status: 'denied', canAskAgain: false };
    await render('/add-medicina');
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: Amoxicilina'), 'Amoxicilina');
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: 1 tableta, 2 ml'), '1 tableta');
    expect(await screen.findByText(/Los recordatorios están apagados/)).toBeTruthy();
    await press(screen.getByText('Guardar medicina'));
    await waitFor(() => expect(addCartillaItem).toHaveBeenCalledTimes(1));
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test('primer permiso: texto previo claro y luego el diálogo del sistema', async () => {
    Notifications.__state.permission = { granted: false, status: 'undetermined', canAskAgain: true };
    await render('/add-medicina');
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: Amoxicilina'), 'Amoxicilina');
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: 1 tableta, 2 ml'), '1 tableta');
    await press(screen.getByText('Guardar medicina'));
    await waitFor(() => expect(Notifications.requestPermissionsAsync).toHaveBeenCalledTimes(1));
    expect(Alert.alert.mock.calls[0][0]).toBe('Recordatorios para Lirya');
    expect(track.notificationPermission).toHaveBeenCalledWith(true);
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled());
  });

  test('medicina vieja (solo frequency de texto libre): se muestra tal cual y no programa recordatorios', async () => {
    mockStore.data.medicinas.push({ id: 'old', name: 'Prednisolona', dose: '5 mg', frequency: 'Cada 12 horas', startDate: today(), endDate: null, active: true });
    await render('/cartilla?tab=medicinas');
    expect(await screen.findByText(/5 mg · Cada 12 horas/)).toBeTruthy();
    await flush();
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  test('editar medicina cancela los IDs previos y reprograma', async () => {
    seedMedicina();
    await render('/cartilla?tab=medicinas');
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(42));
    const prevIds = JSON.parse(await AsyncStorage.getItem('reminders.v1'))['medicinas/m1'].ids;
    expect(prevIds).toHaveLength(42);

    await press(screen.getByText('Editar'));
    await waitFor(() => expect(screen).toHavePathname('/add-medicina'));
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: 1 tableta, 2 ml'), '2 tabletas');
    await press(screen.getByText('Guardar medicina'));
    await waitFor(() => expect(updateCartillaItem).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(42));
    prevIds.forEach((id) => expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(id));
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(84));
    expect(Notifications.scheduleNotificationAsync.mock.calls[83][0].content.body).toBe('Amoxicilina, 2 tabletas');
  });

  test('borrar medicina cancela sus notificaciones pendientes', async () => {
    seedMedicina();
    await render('/cartilla?tab=medicinas');
    await waitFor(() => expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(42));
    const prevIds = JSON.parse(await AsyncStorage.getItem('reminders.v1'))['medicinas/m1'].ids;
    await press(screen.getByText('Eliminar'));
    await waitFor(() => expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(42));
    prevIds.forEach((id) => expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(id));
    expect(JSON.parse(await AsyncStorage.getItem('reminders.v1'))['medicinas/m1']).toBeUndefined();
  });

  test('tocar una notificación abre la Cartilla en la pestaña Medicinas', async () => {
    Notifications.__state.lastResponse = {
      actionIdentifier: Notifications.DEFAULT_ACTION_IDENTIFIER,
      notification: { request: { identifier: 'n-1', content: { data: { tab: 'medicinas' } } } },
    };
    await render('/home');
    await waitFor(() => expect(screen).toHavePathname('/cartilla'));
    expect(await screen.findByText('Agregar medicina')).toBeTruthy();
  });
});
