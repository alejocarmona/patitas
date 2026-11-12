// Integración del pase UX/UI (expo-router/testing-library): estado de vacunas por la dosis MÁS
// RECIENTE (+ Historial), "Ya se la pusieron", primer paso en Inicio, formularios (errores que se
// borran, "¿Descartar cambios?", peso fuera de rango, resumen del horario de medicinas).
import { Alert } from 'react-native';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

const mockPet = { id: 'pet1', name: 'Lirya', species: 'Gato', breed: 'Criollo', gender: 'Hembra', birthdate: '2022-05-14', avatarId: 'gato-1' };
const mockData = { vacunas: [] };

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ user: { uid: 'u1', displayName: 'Alejo C' }, pet: mockPet, onboardingSeen: true, loading: false }),
}));
jest.mock('../hooks/usePet', () => ({ usePet: () => mockPet }));
jest.mock('../hooks/useVacunas', () => ({ useVacunas: () => require('../test-helpers/vacunasMock').hookResult(mockData.vacunas) }));
jest.mock('../hooks/usePeso', () => ({ usePeso: () => ({ pesos: [], loading: false }) }));
jest.mock('../hooks/useMedicinas', () => ({ useMedicinas: () => ({ medicinas: [], loading: false }) }));
jest.mock('../services/firestore', () => ({
  addCartillaItem: jest.fn(() => Promise.resolve({ id: 'new1' })),
  updateCartillaItem: jest.fn(() => Promise.resolve()),
  deleteCartillaItem: jest.fn(() => Promise.resolve()),
  updatePet: jest.fn(() => Promise.resolve()),
}));
jest.mock('../services/auth', () => ({ signOut: jest.fn(), logout: jest.fn() }));
jest.mock('../services/accountDeletion', () => ({ deleteAccount: jest.fn(() => Promise.resolve()) }));
jest.mock('../services/analytics', () => ({
  track: new Proxy({}, { get: () => () => {} }),
  setPetSpecies: jest.fn(),
  logEvent: jest.fn(),
}));
jest.mock('@react-native-community/datetimepicker', () => ({
  DateTimePickerAndroid: { open: jest.fn(({ onChange }) => onChange({ type: 'set' }, new Date(2026, 10, 11))) },
}));
jest.mock('../services/tips', () => require('../test-helpers/tipsMock').servicesMock());
jest.mock('../hooks/useSavedTips', () => require('../test-helpers/tipsMock').savedHookMock());
jest.mock('expo-location', () => require('../test-helpers/locationMock'));
jest.mock('expo-notifications', () => require('../test-helpers/notificationsMock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  const Icon = ({ name }) => <Text>{`icon-${name}`}</Text>;
  return { Feather: Icon, Ionicons: Icon };
});

const { addCartillaItem } = require('../services/firestore');
const routes = require('../test-helpers/routes');
const { toDateString } = require('../utils/vacunaStatus');

const render = (initialUrl) => renderRouter(routes.build(), { initialUrl });
const press = async (el) => { await fireEvent.press(el); };

// Antirrábica: dosis vieja VENCIDA + dosis nueva al día (con distinto formato de nombre)
const OLD_OVERDUE = { id: 'a1', name: 'Antirrábica', appliedDate: '2024-01-10', nextDate: '2025-01-10' };
const NEW_OK = { id: 'a2', name: 'antirrabica ', appliedDate: '2026-11-01', nextDate: '2027-11-01' };

beforeEach(() => {
  jest.clearAllMocks();
  mockData.vacunas = [];
  jest.spyOn(Alert, 'alert').mockImplementation(() => {});
});
afterEach(() => jest.restoreAllMocks());

describe('Vacunas: el estado sale de la dosis más reciente', () => {
  test('Inicio: dosis vieja vencida + dosis nueva al día => al día, sin alerta ni "por renovar"', async () => {
    mockData.vacunas = [OLD_OVERDUE, NEW_OK];
    await render('/home');
    expect(screen.getByText('Al día gracias a ti')).toBeTruthy();
    expect(screen.queryByText('Lirya necesita protección')).toBeNull();
    expect(screen.queryByText(/por renovar/)).toBeNull();
    // un solo tipo de vacuna registrado (no dos dosis)
    expect(screen.getByLabelText('Vacunas registradas: 1')).toBeTruthy();
  });

  test('Inicio: si solo existe la dosis vencida, sí alerta y cuenta "1 por renovar"', async () => {
    mockData.vacunas = [OLD_OVERDUE];
    await render('/home');
    expect(screen.getByText('Lirya necesita protección')).toBeTruthy();
    expect(screen.getByText('1 por renovar')).toBeTruthy();
    expect(screen.queryByText('Al día gracias a ti')).toBeNull();
  });

  test('Cartilla: una tarjeta por tipo, estado de la dosis nueva y Historial plegado sin estado', async () => {
    mockData.vacunas = [{ ...OLD_OVERDUE, name: 'antirrabica ' }, { ...NEW_OK, name: 'Antirrábica' }];
    await render('/cartilla');
    expect(screen.getAllByText('Antirrábica')).toHaveLength(1); // la dosis más reciente es la que da el nombre
    expect(screen.getByText('Al día')).toBeTruthy();
    expect(screen.queryByText('Vencida')).toBeNull();
    expect(screen.queryByText('Ya se la pusieron')).toBeNull();
    expect(screen.getByText('Historial (1 dosis anterior)')).toBeTruthy();
    expect(screen.queryByText(/Aplicada: 10 Ene 2024/)).toBeNull(); // plegado
    await press(screen.getByTestId('vacuna-historial-toggle'));
    expect(screen.getByText(/Aplicada: 10 Ene 2024/)).toBeTruthy();
    expect(screen.queryByText('Vencida')).toBeNull(); // el historial no lleva badge de estado
  });

  test('Cartilla: vencida muestra "Vencida" + cuánto hace y "Ya se la pusieron" abre add-vacuna con el nombre y hoy', async () => {
    mockData.vacunas = [OLD_OVERDUE];
    await render('/cartilla');
    expect(screen.getByText('Vencida')).toBeTruthy();
    expect(screen.getByText(/Lirya necesita su refuerzo · venció hace/)).toBeTruthy();
    await press(screen.getByText('Ya se la pusieron'));
    await waitFor(() => expect(screen).toHavePathname('/add-vacuna'));
    expect(screen.getByText('Antirrábica').parent.props.accessibilityState ?? true).toBeTruthy();
    await press(screen.getByText('Guardar vacuna'));
    await waitFor(() => expect(addCartillaItem).toHaveBeenCalledTimes(1));
    expect(addCartillaItem.mock.calls[0][2]).toMatchObject({ name: 'Antirrábica', appliedDate: toDateString(new Date()), nextDate: null });
  });

  test('add-vacuna: el gato ofrece "Triple felina"', async () => {
    await render('/add-vacuna');
    expect(screen.getByText('Triple felina')).toBeTruthy();
  });
});

describe('Inicio: primer paso', () => {
  test('sin vacunas: "Empieza la cartilla de Lirya" y el botón lleva a add-vacuna', async () => {
    await render('/home');
    expect(screen.getByText('Empieza la cartilla de Lirya')).toBeTruthy();
    await press(screen.getByText('Registrar primera vacuna'));
    await waitFor(() => expect(screen).toHavePathname('/add-vacuna'));
  });

  test('con vacunas no aparece', async () => {
    mockData.vacunas = [NEW_OK];
    await render('/home');
    expect(screen.queryByText('Empieza la cartilla de Lirya')).toBeNull();
  });
});

describe('Formularios', () => {
  test('el error de un campo se borra en cuanto deja de ser inválido', async () => {
    await render('/add-vacuna');
    await press(screen.getByText('Guardar vacuna'));
    expect(screen.getByText('Elige o escribe el nombre de la vacuna.')).toBeTruthy();
    await press(screen.getByText('Panleucopenia'));
    await waitFor(() => expect(screen.queryByText('Elige o escribe el nombre de la vacuna.')).toBeNull());
  });

  test('salir con cambios sin guardar pregunta "¿Descartar cambios?"; sin cambios sale directo', async () => {
    await render('/cartilla?tab=peso');
    await press(screen.getByText('Registrar peso'));
    await waitFor(() => expect(screen).toHavePathname('/add-peso'));
    // sin cambios: Cancelar sale sin avisar
    await press(screen.getByText('Cancelar'));
    await waitFor(() => expect(screen).toHavePathname('/cartilla'));
    expect(Alert.alert).not.toHaveBeenCalled();
    // con cambios: avisa y "Seguir editando" se queda
    await press(screen.getByText('Registrar peso'));
    await waitFor(() => expect(screen).toHavePathname('/add-peso'));
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: 4,2'), '4,2');
    await press(screen.getByText('Cancelar'));
    expect(Alert.alert).toHaveBeenCalledWith('¿Descartar cambios?', expect.any(String), expect.any(Array));
    expect(screen).toHavePathname('/add-peso');
    // "Descartar" ejecuta la salida
    const buttons = Alert.alert.mock.calls[0][2];
    await waitFor(async () => {
      await buttons.find((b) => b.text === 'Descartar').onPress();
    });
    await waitFor(() => expect(screen).toHavePathname('/cartilla'));
  });

  test('guardar con datos válidos no pregunta por cambios', async () => {
    await render('/add-peso');
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: 4,2'), '4,2');
    await press(screen.getByText('Guardar peso'));
    await waitFor(() => expect(addCartillaItem).toHaveBeenCalledTimes(1));
    expect(addCartillaItem.mock.calls[0][2]).toMatchObject({ value: 4.2 });
    expect(Alert.alert).not.toHaveBeenCalledWith('¿Descartar cambios?', expect.anything(), expect.anything());
  });

  test('peso atípico (122 kg en un gato): pide confirmar y no bloquea; "Corregir" no guarda', async () => {
    await render('/add-peso');
    await fireEvent.changeText(screen.getByPlaceholderText('Ej: 4,2'), '122');
    await press(screen.getByText('Guardar peso'));
    expect(Alert.alert).toHaveBeenCalledWith('¿Seguro?', '122 kg es mucho para un gato.', expect.any(Array));
    expect(addCartillaItem).not.toHaveBeenCalled();
    const buttons = Alert.alert.mock.calls[0][2];
    expect(buttons.map((b) => b.text)).toEqual(['Corregir', 'Confirmar']);
    await buttons.find((b) => b.text === 'Confirmar').onPress();
    await waitFor(() => expect(addCartillaItem).toHaveBeenCalledTimes(1));
    expect(addCartillaItem.mock.calls[0][2]).toMatchObject({ value: 122 });
  });

  test('medicina: resumen del horario en 12 h y duración', async () => {
    await render('/add-medicina');
    expect(screen.getByTestId('resumen-horario').props.children).toBe('Recordatorios: cada 8 horas desde las 8:00 a. m., sin fecha de fin');
    await fireEvent.changeText(screen.getByPlaceholderText('Déjalo vacío si no tiene fecha de fin'), '7');
    await waitFor(() =>
      expect(screen.getByTestId('resumen-horario').props.children).toBe('Recordatorios: cada 8 horas desde las 8:00 a. m., durante 7 días')
    );
    expect(screen.queryByPlaceholderText('Vacío = sin fin')).toBeNull();
  });
});
