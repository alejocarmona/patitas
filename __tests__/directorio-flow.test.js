// Integración del Directorio (expo-router/testing-library): permisos, lista ordenada, sin key,
// error + reintento, acciones Llamar/Cómo llegar, cache de 10 min, y el atajo desde una vacuna vencida.
import { Linking } from 'react-native';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import { renderRouter as renderRouterLib, screen as routerScreen, fireEvent as routerFire, waitFor as routerWait } from 'expo-router/testing-library';

const mockPet = { id: 'pet1', name: 'Lirya', species: 'Gato', breed: 'Criollo', gender: 'Hembra', birthdate: '2022-05-14', avatarId: 'gato-1' };
const mockVacunas = { list: [] };

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'u1', displayName: 'Alejo C' }, pet: mockPet, onboardingSeen: true, loading: false }),
}));
jest.mock('../hooks/usePet', () => ({ usePet: () => mockPet }));
jest.mock('../hooks/useVacunas', () => ({ useVacunas: () => require('../test-helpers/vacunasMock').hookResult(mockVacunas.list) }));
jest.mock('../hooks/usePeso', () => ({ usePeso: () => ({ pesos: [], loading: false }) }));
jest.mock('../hooks/useMedicinas', () => ({ useMedicinas: () => ({ medicinas: [], loading: false }) }));
jest.mock('../services/firestore', () => ({
  addCartillaItem: jest.fn(), updateCartillaItem: jest.fn(), deleteCartillaItem: jest.fn(), updatePet: jest.fn(),
}));
jest.mock('../services/auth', () => ({ signOut: jest.fn(), logout: jest.fn() }));
jest.mock('../services/accountDeletion', () => ({ deleteAccount: jest.fn(() => Promise.resolve()) }));
jest.mock('../services/analytics', () => {
  const fns = {};
  return {
    track: new Proxy({}, { get: (_, k) => (fns[k] = fns[k] ?? jest.fn()) }),
    setPetSpecies: jest.fn(),
    logEvent: jest.fn(),
  };
});
jest.mock('../services/tips', () => require('../test-helpers/tipsMock').servicesMock());
jest.mock('../hooks/useSavedTips', () => require('../test-helpers/tipsMock').savedHookMock());
jest.mock('expo-location', () => require('../test-helpers/locationMock'));
jest.mock('../services/places', () => ({
  placesKey: jest.fn(() => 'KEY'),
  getNearbyVets: jest.fn(),
  PlacesError: class PlacesError extends Error {},
}));
jest.mock('expo-notifications', () => require('../test-helpers/notificationsMock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const Icon = ({ name }) => <Text>{`icon-${name}`}</Text>;
  return { Feather: Icon, Ionicons: Icon };
});

const Location = require('expo-location');
const places = require('../services/places');
const { track } = require('../services/analytics');
const { vetsCache, useNearbyVets } = require('../hooks/useNearbyVets');
const routes = require('../test-helpers/routes');

jest.setTimeout(30000);
const render = (url) => renderRouterLib(routes.build(), { initialUrl: url });
const press = async (el) => { await routerFire.press(el); };

const VETS = [
  { id: 'lejos', name: 'Vet Lejos', address: 'Dir 3', rating: 4.1, reviews: 10, open: false, phone: '(604) 333 3333', lat: 6.3, lng: -75.5 },
  { id: 'cerca', name: 'Vet Cerca', address: 'Dir 1', rating: 4.8, reviews: 124, open: true, phone: '(604) 111 1111', lat: 6.201, lng: -75.5 },
  { id: 'medio', name: 'Vet Medio', address: 'Dir 2', rating: null, reviews: null, open: null, phone: null, lat: 6.22, lng: -75.5 },
];

beforeEach(() => {
  jest.clearAllMocks();
  vetsCache.clear();
  Location.__mock.permission = 'granted';
  places.placesKey.mockReturnValue('KEY');
  places.getNearbyVets.mockResolvedValue(VETS.map((v) => ({ ...v })));
  mockVacunas.list = [];
});

describe('Directorio', () => {
  test('lista ordenada por distancia, con distancia, rating y estado solo si se conoce', async () => {
    await render('/directorio');
    expect(await routerScreen.findByText('Vet Cerca')).toBeTruthy();
    const names = routerScreen.getAllByText(/^Vet (Cerca|Medio|Lejos)$/).map((n) => n.props.children);
    expect(names).toEqual(['Vet Cerca', 'Vet Medio', 'Vet Lejos']);
    expect(routerScreen.getByText('110 m')).toBeTruthy();
    expect(routerScreen.getByText('● Abierto')).toBeTruthy();
    expect(routerScreen.getByText('● Cerrado')).toBeTruthy(); // solo 2 de 3 tienen estado conocido
    expect(routerScreen.getAllByText('Llamar')).toHaveLength(2); // el que no tiene teléfono no muestra Llamar
    expect(routerScreen.getAllByText('Cómo llegar')).toHaveLength(3);
    expect(routerScreen.getByText('Resultados de Google')).toBeTruthy();
    expect(places.getNearbyVets).toHaveBeenCalledWith(6.2, -75.5);
    expect(track.directoryViewed).toHaveBeenCalledWith(3);
    expect(track.locationPermission).toHaveBeenCalledWith(true);
  });

  test('Llamar abre tel: solo con dígitos y Cómo llegar abre Google Maps con el place id', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    await render('/directorio');
    await routerScreen.findByText('Vet Cerca');
    await press(routerScreen.getAllByText('Llamar')[0]);
    expect(open).toHaveBeenCalledWith('tel:6041111111');
    await press(routerScreen.getAllByText('Cómo llegar')[0]);
    expect(open).toHaveBeenCalledWith('https://www.google.com/maps/dir/?api=1&destination=6.201,-75.5&destination_place_id=cerca');
    expect(track.vetCall).toHaveBeenCalledTimes(1);
    expect(track.vetDirections).toHaveBeenCalledTimes(1);
  });

  test('permiso denegado: explica y ofrece abrir ajustes; no llama a Places', async () => {
    Location.__mock.permission = 'denied';
    const settings = jest.spyOn(Linking, 'openSettings').mockResolvedValue();
    await render('/directorio');
    expect(await routerScreen.findByText('Necesitamos tu ubicación')).toBeTruthy();
    await press(routerScreen.getByText('Abrir ajustes'));
    expect(settings).toHaveBeenCalledTimes(1);
    expect(places.getNearbyVets).not.toHaveBeenCalled();
    expect(track.locationPermission).toHaveBeenCalledWith(false);
  });

  test('sin API key: "Directorio no disponible por ahora", sin pedir ubicación ni llamar', async () => {
    places.placesKey.mockReturnValue('');
    await render('/directorio');
    expect(await routerScreen.findByText('Directorio no disponible por ahora')).toBeTruthy();
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(places.getNearbyVets).not.toHaveBeenCalled();
  });

  test('error de red: estado de error y "Reintentar" vuelve a intentar', async () => {
    places.getNearbyVets.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'network' }));
    await render('/directorio');
    expect(await routerScreen.findByText('No pudimos cargar las veterinarias')).toBeTruthy();
    await press(routerScreen.getByText('Reintentar'));
    expect(await routerScreen.findByText('Vet Cerca')).toBeTruthy();
    expect(places.getNearbyVets).toHaveBeenCalledTimes(2);
  });

  test('vacuna vencida: "Encuentra veterinaria" lleva al directorio', async () => {
    mockVacunas.list = [{ id: 'v1', name: 'Triple felina', appliedDate: '2025-01-01', nextDate: '2025-12-01', status: 'vencida' }];
    await render('/cartilla');
    await press(routerScreen.getByText('Encuentra veterinaria'));
    await routerWait(() => expect(routerScreen).toHavePathname('/directorio'));
    expect(await routerScreen.findByText('Vet Cerca')).toBeTruthy();
  });

  test('vacuna al día: no muestra "Encuentra veterinaria"', async () => {
    mockVacunas.list = [{ id: 'v1', name: 'Triple felina', appliedDate: '2026-11-01', nextDate: '2027-11-01', status: 'ok' }];
    await render('/cartilla');
    expect(routerScreen.queryByText('Encuentra veterinaria')).toBeNull();
  });
});

describe('useNearbyVets: cache de 10 minutos', () => {
  test('no vuelve a llamar a Places dentro de 10 min (aunque se monte de nuevo) y sí después', async () => {
    let now = 1_000_000;
    const spy = jest.spyOn(Date, 'now').mockImplementation(() => now);
    const first = await renderHook(() => useNearbyVets());
    await waitFor(() => expect(first.result.current.status).toBe('ready'));
    expect(places.getNearbyVets).toHaveBeenCalledTimes(1);
    await first.unmount();

    now += 9 * 60 * 1000;
    const second = await renderHook(() => useNearbyVets());
    await waitFor(() => expect(second.result.current.status).toBe('ready'));
    expect(places.getNearbyVets).toHaveBeenCalledTimes(1);
    await second.unmount();

    now += 2 * 60 * 1000; // 11 min desde la primera carga
    const third = await renderHook(() => useNearbyVets());
    await waitFor(() => expect(third.result.current.status).toBe('ready'));
    expect(places.getNearbyVets).toHaveBeenCalledTimes(2);
    await third.unmount();
    spy.mockRestore();
  });

  test('pull-to-refresh se limita a 1 por minuto', async () => {
    let now = 5_000_000;
    const spy = jest.spyOn(Date, 'now').mockImplementation(() => now);
    const h = await renderHook(() => useNearbyVets());
    await waitFor(() => expect(h.result.current.status).toBe('ready'));
    now += 30_000;
    await act(async () => { await h.result.current.refresh(); });
    expect(places.getNearbyVets).toHaveBeenCalledTimes(1); // throttled
    now += 31_000;
    await act(async () => { await h.result.current.refresh(); });
    expect(places.getNearbyVets).toHaveBeenCalledTimes(2);
    await h.unmount();
    spy.mockRestore();
  });
});
