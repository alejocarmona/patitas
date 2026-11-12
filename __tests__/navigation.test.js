// Integración de navegación (expo-router/testing-library). Un test por bug
// reportado en el Moto. Usa los layouts y pantallas REALES de app/.
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

const mockPet = {
  id: 'pet1',
  name: 'Lirya',
  species: 'Gato',
  breed: 'Criollo',
  gender: 'Hembra',
  birthdate: '2022-05-14',
  avatarId: 'gato-1',
};

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'u1', displayName: 'Alejo C' }, pet: mockPet, onboardingSeen: true, loading: false }),
}));
jest.mock('../hooks/usePet', () => ({ usePet: () => mockPet }));
jest.mock('../hooks/useVacunas', () => ({ useVacunas: () => ({ vacunas: [], loading: false }) }));
jest.mock('../hooks/usePeso', () => ({ usePeso: () => ({ pesos: [], loading: false }) }));
jest.mock('../hooks/useMedicinas', () => ({ useMedicinas: () => ({ medicinas: [], loading: false }) }));
jest.mock('../services/firestore', () => ({
  addCartillaItem: jest.fn(() => Promise.resolve()),
  updateCartillaItem: jest.fn(() => Promise.resolve()),
  deleteCartillaItem: jest.fn(() => Promise.resolve()),
  updatePet: jest.fn(() => Promise.resolve()),
}));
jest.mock('../services/auth', () => ({ signOut: jest.fn(() => Promise.resolve()), logout: jest.fn(() => Promise.resolve()) }));
jest.mock('../services/analytics', () => ({
  track: new Proxy({}, { get: () => () => {} }),
  setPetSpecies: jest.fn(),
  logEvent: jest.fn(),
}));
// Calendario nativo: elige siempre 2026-11-11 (hora local)
jest.mock('@react-native-community/datetimepicker', () => ({
  DateTimePickerAndroid: {
    open: jest.fn(({ onChange }) => onChange({ type: 'set' }, new Date(2026, 10, 11))),
  },
}));
jest.mock('expo-notifications', () => require('../test-helpers/notificationsMock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Feather: ({ name }) => <Text>{`icon-${name}`}</Text> };
});

const { addCartillaItem, updatePet } = require('../services/firestore');
const routes = require('../test-helpers/routes');

const render = (initialUrl) => renderRouter(routes.build(), { initialUrl });
const press = async (el) => { await fireEvent.press(el); };

describe('navegación del Moto (regresión)', () => {
  beforeEach(() => jest.clearAllMocks());

  test('Inicio: "Editar" abre /edit-pet', async () => {
    await render('/home');
    expect(screen).toHavePathname('/home');
    await press(screen.getByText('Editar'));
    await waitFor(() => expect(screen).toHavePathname('/edit-pet'));
    expect(screen.getByText('Guardar cambios')).toBeTruthy();
  });

  test('Inicio: ícono "Perfil" abre /perfil', async () => {
    await render('/home');
    await press(screen.getByLabelText('Perfil'));
    await waitFor(() => expect(screen).toHavePathname('/perfil'));
  });

  test('deep link /perfil abre el perfil (no queda en Inicio)', async () => {
    await render('/perfil');
    expect(screen).toHavePathname('/perfil');
  });

  test('Cartilla: "Agregar vacuna" abre /add-vacuna', async () => {
    await render('/cartilla');
    await press(screen.getByText('Agregar vacuna'));
    await waitFor(() => expect(screen).toHavePathname('/add-vacuna'));
    expect(screen.getByText('Guardar vacuna')).toBeTruthy();
  });

  test('Cartilla: "Registrar peso" abre /add-peso', async () => {
    await render('/cartilla?tab=peso');
    await press(screen.getByText('Registrar peso'));
    await waitFor(() => expect(screen).toHavePathname('/add-peso'));
  });

  test('Cartilla: "Agregar medicina" abre /add-medicina', async () => {
    await render('/cartilla?tab=medicinas');
    await press(screen.getByText('Agregar medicina'));
    await waitFor(() => expect(screen).toHavePathname('/add-medicina'));
  });

  test('guardar vacuna válida vuelve a /cartilla', async () => {
    await render('/cartilla');
    await press(screen.getByText('Agregar vacuna'));
    await waitFor(() => expect(screen).toHavePathname('/add-vacuna'));
    await press(screen.getByText('Panleucopenia'));
    await press(screen.getByLabelText('¿Cuándo se la pusieron a Lirya?'));
    await press(screen.getByLabelText('Próxima dosis (opcional)'));
    await press(screen.getByText('Guardar vacuna'));
    await waitFor(() => expect(addCartillaItem).toHaveBeenCalledTimes(1));
    expect(addCartillaItem.mock.calls[0][2]).toMatchObject({
      name: 'Panleucopenia',
      appliedDate: '2026-11-11',
      nextDate: '2026-11-11',
    });
    await waitFor(() => expect(screen).toHavePathname('/cartilla'));
  });

  test('editar mascota: guardar vuelve a /home', async () => {
    await render('/home');
    await press(screen.getByText('Editar'));
    await waitFor(() => expect(screen).toHavePathname('/edit-pet'));
    await press(screen.getByText('Guardar cambios'));
    await waitFor(() => expect(updatePet).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(screen).toHavePathname('/home'));
  });

  test('las pestañas siguen navegando entre sí', async () => {
    await render('/home');
    await press(screen.getByText('Cartilla'));
    await waitFor(() => expect(screen).toHavePathname('/cartilla'));
    await press(screen.getByText('Tips'));
    await waitFor(() => expect(screen).toHavePathname('/tips'));
  });
});
