// Integración de Tips (expo-router/testing-library): filtro por especie y categoría,
// guardar/desguardar con contador, detalle y volver, estados de error.
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

const mockPet = { id: 'pet1', name: 'Lirya', species: 'Gato', breed: 'Criollo', gender: 'Hembra', birthdate: '2022-05-14', avatarId: 'gato-1' };

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'u1', displayName: 'Alejo C' }, pet: mockPet, onboardingSeen: true, loading: false }),
}));
jest.mock('../hooks/usePet', () => ({ usePet: () => mockPet }));
jest.mock('../hooks/useVacunas', () => ({ useVacunas: () => ({ vacunas: [], loading: false }) }));
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
jest.mock('expo-notifications', () => require('../test-helpers/notificationsMock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Feather: ({ name }) => <Text>{`icon-${name}`}</Text> };
});

const tipsMock = require('../test-helpers/tipsMock');
const tipsService = require('../services/tips');
const { track } = require('../services/analytics');
const { resetTipsCache } = require('../hooks/useTips');
const routes = require('../test-helpers/routes');

jest.setTimeout(30000);
const render = (url) => renderRouter(routes.build(), { initialUrl: url });
const press = async (el) => { await fireEvent.press(el); };
const chip = (name) => screen.getByRole('button', { name });

beforeEach(() => {
  jest.clearAllMocks();
  resetTipsCache();
  tipsMock.reset(tipsMock.sampleTips());
  mockPet.species = 'Gato';
});

describe('Tips', () => {
  test('encabezado con el nombre y solo tips de la especie (gato + todos); oculta futuros y de perro', async () => {
    await render('/tips');
    expect(await screen.findByText('Tips para Lirya')).toBeTruthy();
    expect(await screen.findByText('Gato alimentación')).toBeTruthy();
    expect(screen.getByText('Gato higiene')).toBeTruthy();
    expect(screen.getByText('Para todos')).toBeTruthy();
    expect(screen.queryByText('Solo para perros')).toBeNull();
    expect(screen.queryByText('Tip futuro oculto')).toBeNull();
  });

  test('una mascota perro ve los de perro y los de todos, no los de gato', async () => {
    mockPet.species = 'Perro';
    await render('/tips');
    expect(await screen.findByText('Solo para perros')).toBeTruthy();
    expect(screen.getByText('Para todos')).toBeTruthy();
    expect(screen.queryByText('Gato alimentación')).toBeNull();
  });

  test('una especie sin tips propios (Conejo) ve solo los de "todos"', async () => {
    mockPet.species = 'Conejo';
    await render('/tips');
    expect(await screen.findByText('Para todos')).toBeTruthy();
    expect(screen.queryByText('Gato higiene')).toBeNull();
    expect(screen.queryByText('Solo para perros')).toBeNull();
  });

  test('filtro por categoría y vuelta a Todos', async () => {
    await render('/tips');
    await screen.findByText('Gato alimentación');
    await press(chip('Higiene'));
    expect(screen.getByText('Gato higiene')).toBeTruthy();
    expect(screen.queryByText('Gato alimentación')).toBeNull();
    await press(chip('Todos'));
    expect(await screen.findByText('Gato alimentación')).toBeTruthy();
  });

  test('guardar y desguardar actualiza el contador de Guardados y su lista', async () => {
    await render('/tips');
    await screen.findByText('Gato alimentación');
    expect(screen.getByText('🔖 Guardados (0)')).toBeTruthy();

    await press(screen.getAllByLabelText('Guardar tip')[0]);
    await waitFor(() => expect(screen.getByText('🔖 Guardados (1)')).toBeTruthy());
    expect(tipsService.saveTip).toHaveBeenCalledTimes(1);
    expect(track.tipSaved).toHaveBeenCalledTimes(1);

    await press(chip('🔖 Guardados (1)'));
    expect(screen.getAllByLabelText('Quitar de guardados')).toHaveLength(1);
    expect(screen.queryByText('Gato higiene')).toBeNull();

    await press(screen.getByLabelText('Quitar de guardados'));
    await waitFor(() => expect(screen.getByText('Sin tips guardados aún')).toBeTruthy());
    expect(screen.getByText('🔖 Guardados (0)')).toBeTruthy();
    expect(track.tipUnsaved).toHaveBeenCalledTimes(1);
    await press(screen.getByText('Ver todos los tips'));
    expect(await screen.findByText('Gato higiene')).toBeTruthy();
  });

  test('abrir el detalle desde la lista, guardar desde allí y volver con Atrás', async () => {
    await render('/tips');
    await press(await screen.findByLabelText('Abrir tip: Gato alimentación'));
    await waitFor(() => expect(screen).toHavePathname('/tip/gato-a'));
    expect(track.tipOpened).toHaveBeenCalledWith('Alimentación');
    expect(await screen.findByText('Detalle gato a')).toBeTruthy();
    expect(screen.getByText('✅ línea 2')).toBeTruthy();

    await press(screen.getByText('Guardar tip'));
    expect(await screen.findByText('Guardado')).toBeTruthy();

    await press(screen.getByText('Atrás'));
    await waitFor(() => expect(screen).toHavePathname('/tips'));
    expect(screen.getByText('🔖 Guardados (1)')).toBeTruthy();
  });

  test('deep link a un tip inexistente muestra estado vacío y permite volver', async () => {
    await render('/tip/no-existe');
    expect(await screen.findByText('No encontramos este tip')).toBeTruthy();
    await press(screen.getByText('Volver a Tips'));
    await waitFor(() => expect(screen).toHavePathname('/tips'));
  });

  test('error al cargar: muestra estado de error y Reintentar recupera', async () => {
    tipsService.fetchActiveTips.mockRejectedValueOnce(new Error('offline'));
    await render('/tips');
    expect(await screen.findByText('No pudimos cargar los tips')).toBeTruthy();
    await press(screen.getByText('Reintentar'));
    expect(await screen.findByText('Gato alimentación')).toBeTruthy();
  });

  test('sin tips visibles: estado vacío', async () => {
    tipsMock.reset([]);
    await render('/tips');
    expect(await screen.findByText('Aún no hay tips aquí')).toBeTruthy();
  });

  test('los tips se leen una sola vez por sesión (cache)', async () => {
    await render('/tips');
    await screen.findByText('Gato alimentación');
    await press(await screen.findByLabelText('Abrir tip: Gato alimentación'));
    await waitFor(() => expect(screen).toHavePathname('/tip/gato-a'));
    expect(tipsService.fetchActiveTips).toHaveBeenCalledTimes(1);
  });
});
