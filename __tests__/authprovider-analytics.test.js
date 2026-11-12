// AuthProvider: la recolección de Analytics sigue a la sesión (apagada sin sesión, preferencia con sesión).
import { act, render } from '@testing-library/react-native';

const mockSetEnabled = jest.fn();
let mockAuthCb;
let mockUserSnap;

jest.mock('../firebase', () => ({ auth: () => 'AUTH', db: () => 'DB' }));
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('true')),
  setItem: jest.fn(() => Promise.resolve()),
}));
jest.mock('@react-native-firebase/auth', () => ({
  onAuthStateChanged: (_a, cb) => {
    mockAuthCb = cb;
    return () => {};
  },
}));
jest.mock('@react-native-firebase/firestore', () => ({
  collection: (_d, name) => ({ path: name }),
  doc: (_d, ...p) => ({ path: p.join('/') }),
  query: (c) => c,
  where: () => ({}),
  limit: () => ({}),
  onSnapshot: (ref, ok) => {
    if (ref.path.startsWith('users/')) mockUserSnap = ok;
    else ok({ docs: [] });
    return () => {};
  },
}));
jest.mock('../services/analytics', () => ({
  setPetSpecies: jest.fn(),
  setAnalyticsEnabled: (...a) => mockSetEnabled(...a),
}));

const AuthProvider = require('../components/AuthProvider').default;

describe('AuthProvider y Analytics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUserSnap = undefined;
  });

  test('sin sesión apaga; con sesión y analyticsEnabled sin definir enciende; al cerrar sesión apaga', async () => {
    await act(async () => {
      render(<AuthProvider>{null}</AuthProvider>);
    });
    expect(mockSetEnabled).toHaveBeenLastCalledWith(false); // arranque sin sesión
    await act(async () => mockAuthCb({ uid: 'u1' }));
    await act(async () => mockUserSnap({ data: () => ({ name: 'Ana' }) }));
    expect(mockSetEnabled).toHaveBeenLastCalledWith(true);
    await act(async () => mockUserSnap({ data: () => ({ analyticsEnabled: false }) }));
    expect(mockSetEnabled).toHaveBeenLastCalledWith(false);
    await act(async () => mockUserSnap({ data: () => ({ analyticsEnabled: true }) }));
    expect(mockSetEnabled).toHaveBeenLastCalledWith(true);
    await act(async () => mockAuthCb(null)); // cierre de sesión
    expect(mockSetEnabled).toHaveBeenLastCalledWith(false);
  });
});
