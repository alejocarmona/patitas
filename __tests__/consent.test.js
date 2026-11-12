// Consentimiento (Ley 1581): texto con enlaces en el login y registro de la aceptación solo en cuentas nuevas.
import { Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';

const mockSetDoc = jest.fn(() => Promise.resolve());
const mockGetDoc = jest.fn();
const mockAuthState = { isNewUser: true };

jest.mock('expo-web-browser', () => ({ openBrowserAsync: jest.fn(() => Promise.resolve({ type: 'opened' })) }));
jest.mock('../firebase', () => ({ auth: () => 'AUTH', db: () => 'DB' }));
jest.mock('@react-native-firebase/firestore', () => ({
  doc: (_db, ...p) => ({ path: p.join('/') }),
  setDoc: (...a) => mockSetDoc(...a),
  getDoc: (...a) => mockGetDoc(...a),
  serverTimestamp: () => 'SERVER_TS',
}));
jest.mock('@react-native-firebase/auth', () => ({
  createUserWithEmailAndPassword: jest.fn(async (_a, email) => ({ user: { uid: 'new1', email, displayName: null } })),
  signInWithEmailAndPassword: jest.fn(async (_a, email) => ({ user: { uid: 'old1', email, displayName: 'Alejo' } })),
  sendPasswordResetEmail: jest.fn(),
  signInWithCredential: jest.fn(async () => ({
    user: { uid: 'g1', email: 'g@x.co', displayName: 'Gina', photoURL: 'https://foto' },
    additionalUserInfo: { isNewUser: mockAuthState.isNewUser },
  })),
  GoogleAuthProvider: { credential: jest.fn(() => 'CRED') },
  EmailAuthProvider: { credential: jest.fn() },
  updateProfile: jest.fn(() => Promise.resolve()),
  signOut: jest.fn(),
  reauthenticateWithCredential: jest.fn(),
  getIdTokenResult: jest.fn(),
  deleteUser: jest.fn(),
}));
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: {
    configure: jest.fn(),
    hasPlayServices: jest.fn(async () => true),
    signIn: jest.fn(async () => ({ type: 'success', data: { idToken: 'tok' } })),
    signOut: jest.fn(async () => {}),
  },
  isSuccessResponse: (r) => r?.type === 'success',
}));
jest.mock('../services/analytics', () => ({ track: new Proxy({}, { get: () => () => {} }), setPetSpecies: jest.fn(), logEvent: jest.fn() }));
jest.mock('@expo/vector-icons', () => {
  const { Text } = require('react-native');
  return { Feather: ({ name }) => <Text>{`icon-${name}`}</Text> };
});

const legal = require('../constants/legal');
const Login = require('../app/login').default;
const { loginWithGoogle, loginWithEmail, registerWithEmail, ensureConsentProof } = require('../services/auth');

const press = async (el) => {
  await fireEvent.press(el);
};

describe('consentimiento', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState.isNewUser = true;
    mockSetDoc.mockImplementation(() => Promise.resolve());
    mockGetDoc.mockReset();
    jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
  });
  afterEach(() => jest.restoreAllMocks());

  test('el login muestra el texto de aceptación y sus dos enlaces abren las páginas públicas', async () => {
    await renderRouter({ index: Login });
    expect(screen.getByText(/Al continuar aceptas los/)).toBeTruthy();
    await press(screen.getByText('Términos'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenLastCalledWith(legal.URL_TERMINOS, expect.any(Object));
    await press(screen.getByText('Política de privacidad'));
    expect(WebBrowser.openBrowserAsync).toHaveBeenLastCalledWith(legal.URL_PRIVACIDAD, expect.any(Object));
  });

  test('registro con correo: users/{uid} guarda acceptedTermsAt y termsVersion', async () => {
    await renderRouter({ index: Login });
    await press(screen.getByText('Crear mi cuenta'));
    await fireEvent.changeText(screen.getByPlaceholderText('¿Cómo te llamas?'), 'Ana');
    await fireEvent.changeText(screen.getByPlaceholderText('tucorreo@ejemplo.com'), 'ana@ejemplo.com');
    await fireEvent.changeText(screen.getByPlaceholderText('Mínimo 6 caracteres'), 'secreta1');
    await press(screen.getByText('Crear cuenta'));
    await waitFor(() => expect(mockSetDoc).toHaveBeenCalledTimes(1));
    const [ref, data, opts] = mockSetDoc.mock.calls[0];
    expect(ref.path).toBe('users/new1');
    expect(data).toMatchObject({ uid: 'new1', email: 'ana@ejemplo.com', acceptedTermsAt: 'SERVER_TS', termsVersion: '2026-11-12' });
    expect(opts).toEqual({ merge: true });
  });

  test('Google con cuenta NUEVA registra la aceptación', async () => {
    await loginWithGoogle();
    expect(mockSetDoc.mock.calls[0][1]).toMatchObject({ acceptedTermsAt: 'SERVER_TS', termsVersion: legal.TERMS_VERSION });
  });

  test('Google con cuenta EXISTENTE no escribe aceptación (no se bloquea ni se toca al usuario actual)', async () => {
    mockAuthState.isNewUser = false;
    await loginWithGoogle();
    const data = mockSetDoc.mock.calls[0][1];
    expect(data).not.toHaveProperty('acceptedTermsAt');
    expect(data).not.toHaveProperty('termsVersion');
  });

  test('ingresar con correo (usuario existente) no escribe en Firestore', async () => {
    await loginWithEmail('viejo@ejemplo.com', 'secreta1');
    expect(mockSetDoc).not.toHaveBeenCalled();
    expect(mockGetDoc).not.toHaveBeenCalled(); // cuenta sin fecha de creación posterior a los términos: ni se lee
  });

  describe('prueba de aceptación robusta (Ley 1581 art. 17 b)', () => {
    const newer = { uid: 'n1', email: 'n@x.co', displayName: 'Nina', metadata: { creationTime: 'Thu, 12 Nov 2026 15:00:00 GMT' } };
    const older = { uid: 'o1', email: 'o@x.co', displayName: 'Owner', metadata: { creationTime: 'Wed, 01 Jul 2026 10:00:00 GMT' } };
    const docWith = (data) => ({ exists: () => !!data, data: () => data });

    test('cuenta posterior a los términos sin acceptedTermsAt: se escribe', async () => {
      mockGetDoc.mockResolvedValue(docWith({ uid: 'n1', name: 'Nina' }));
      await expect(ensureConsentProof(newer)).resolves.toBe(true);
      const [ref, data, opts] = mockSetDoc.mock.calls[0];
      expect(ref.path).toBe('users/n1');
      expect(data).toMatchObject({ acceptedTermsAt: 'SERVER_TS', termsVersion: '2026-11-12' });
      expect(data).not.toHaveProperty('createdAt'); // el doc existe: no se pisa
      expect(opts).toEqual({ merge: true });
    });

    test('si users/{uid} ni existe, se crea completo con la aceptación', async () => {
      mockGetDoc.mockResolvedValue(docWith(null));
      await ensureConsentProof(newer);
      expect(mockSetDoc.mock.calls[0][1]).toMatchObject({ uid: 'n1', email: 'n@x.co', createdAt: 'SERVER_TS', acceptedTermsAt: 'SERVER_TS' });
    });

    test('si ya tiene acceptedTermsAt no se reescribe', async () => {
      mockGetDoc.mockResolvedValue(docWith({ acceptedTermsAt: 'X' }));
      await expect(ensureConsentProof(newer)).resolves.toBe(false);
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    test('cuenta anterior a los términos (el dueño) no se toca', async () => {
      await expect(ensureConsentProof(older)).resolves.toBe(false);
      expect(mockGetDoc).not.toHaveBeenCalled();
      expect(mockSetDoc).not.toHaveBeenCalled();
    });

    test('loginWithEmail repara la aceptación faltante de una cuenta nueva', async () => {
      require('@react-native-firebase/auth').signInWithEmailAndPassword.mockResolvedValueOnce({ user: newer });
      mockGetDoc.mockResolvedValue(docWith({ uid: 'n1' }));
      await loginWithEmail('n@x.co', 'secreta1');
      expect(mockSetDoc.mock.calls[0][1]).toMatchObject({ acceptedTermsAt: 'SERVER_TS' });
    });

    test('un fallo al leer/escribir no rompe el ingreso y queda en el log', async () => {
      const err = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockGetDoc.mockRejectedValue(Object.assign(new Error('x'), { code: 'unavailable' }));
      await expect(ensureConsentProof(newer)).resolves.toBe(false);
      expect(err).toHaveBeenCalled();
    });

    test('registro: si ensureUserDoc falla se reintenta SIN reescribir acceptedTermsAt y luego ensureConsentProof lo escribe', async () => {
      require('@react-native-firebase/auth').createUserWithEmailAndPassword.mockResolvedValueOnce({ user: { ...newer, uid: 'new1' } });
      mockSetDoc.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'unavailable' }));
      mockGetDoc.mockResolvedValue(docWith({ uid: 'new1' }));
      const user = await registerWithEmail('Ana', 'ana@ejemplo.com', 'secreta1');
      expect(user.uid).toBe('new1');
      expect(mockSetDoc).toHaveBeenCalledTimes(3);
      expect(mockSetDoc.mock.calls[0][1]).toHaveProperty('acceptedTermsAt'); // intento 1 (falló)
      expect(mockSetDoc.mock.calls[1][1]).not.toHaveProperty('acceptedTermsAt'); // reintento: sin la prueba
      expect(mockSetDoc.mock.calls[2][1]).toMatchObject({ acceptedTermsAt: 'SERVER_TS', termsVersion: '2026-11-12' });
    });

    test('registro: si el reintento también falla, no se traga en silencio (log) y la cuenta sigue creada', async () => {
      const err = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockSetDoc.mockRejectedValue(Object.assign(new Error('x'), { code: 'permission-denied' }));
      const user = await registerWithEmail('Ana', 'ana@ejemplo.com', 'secreta1');
      expect(user.uid).toBe('new1');
      expect(mockSetDoc).toHaveBeenCalledTimes(2);
      expect(err).toHaveBeenCalledWith(expect.stringContaining('[consent]'), 'permission-denied');
      expect(mockSetDoc.mock.calls[1][1]).not.toHaveProperty('acceptedTermsAt');
    });
  });
});
