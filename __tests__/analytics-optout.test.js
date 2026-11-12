// Preferencia "Compartir estadísticas de uso": servicio de analytics, guardado en users/{uid} y config de privacidad.
const fs = require('fs');
const path = require('path');

const mockSetCollection = jest.fn(() => Promise.resolve());
const mockRnLogEvent = jest.fn(() => Promise.resolve());
const mockSetDoc = jest.fn(() => Promise.resolve());

jest.mock('../firebase', () => ({ analyticsInstance: () => 'AN', auth: () => 'AUTH', db: () => 'DB' }));
jest.mock('@react-native-firebase/analytics', () => ({
  logEvent: (...a) => mockRnLogEvent(...a),
  setUserProperty: jest.fn(() => Promise.resolve()),
  setAnalyticsCollectionEnabled: (...a) => mockSetCollection(...a),
}));
jest.mock('@react-native-firebase/firestore', () => ({
  doc: (_db, ...p) => ({ path: p.join('/') }),
  setDoc: (...a) => mockSetDoc(...a),
  getDoc: jest.fn(),
  serverTimestamp: () => 'TS',
}));
jest.mock('@react-native-firebase/auth', () => ({}));
jest.mock('@react-native-google-signin/google-signin', () => ({ GoogleSignin: {}, isSuccessResponse: () => false }));

const { track, setAnalyticsEnabled, setPetSpecies } = require('../services/analytics');
const { saveAnalyticsPreference } = require('../services/auth');

const root = path.join(__dirname, '..');
const readJson = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'));

describe('estadísticas de uso: opt-out', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAnalyticsEnabled(true);
    mockSetCollection.mockClear();
  });

  test('desactivar apaga la recolección y no se registra ningún evento después', () => {
    setAnalyticsEnabled(false);
    expect(mockSetCollection).toHaveBeenLastCalledWith('AN', false);
    track.vaccineAdded('ok');
    track.login('password');
    setPetSpecies('Gato');
    expect(mockRnLogEvent).not.toHaveBeenCalled();
  });

  test('activar de nuevo reanuda el registro', () => {
    setAnalyticsEnabled(false);
    setAnalyticsEnabled(true);
    expect(mockSetCollection).toHaveBeenLastCalledWith('AN', true);
    track.weightAdded();
    expect(mockRnLogEvent).toHaveBeenCalledWith('AN', 'weight_added', undefined);
  });

  test('un valor ausente cuenta como activado (default on)', () => {
    setAnalyticsEnabled(undefined);
    expect(mockSetCollection).toHaveBeenLastCalledWith('AN', true);
  });

  test('saveAnalyticsPreference aplica el cambio y lo guarda en users/{uid}.analyticsEnabled', async () => {
    await saveAnalyticsPreference('u1', false);
    expect(mockSetCollection).toHaveBeenLastCalledWith('AN', false);
    expect(mockSetDoc).toHaveBeenCalledWith({ path: 'users/u1' }, { analyticsEnabled: false }, { merge: true });
    track.weightAdded();
    expect(mockRnLogEvent).not.toHaveBeenCalled();
  });

  test('si no se pudo guardar, revierte la recolección y propaga el error', async () => {
    mockSetDoc.mockRejectedValueOnce(new Error('offline'));
    await expect(saveAnalyticsPreference('u1', false)).rejects.toThrow('offline');
    expect(mockSetCollection).toHaveBeenLastCalledWith('AN', true);
    track.weightAdded();
    expect(mockRnLogEvent).toHaveBeenCalled();
  });
});

describe('analytics no recolecta sin sesión', () => {
  // módulo fresco: el estado inicial de analytics.js debe ser apagado
  const fresh = () => {
    let m;
    jest.isolateModules(() => {
      m = require('../services/analytics');
    });
    return m;
  };
  beforeEach(() => jest.clearAllMocks());

  test('antes de iniciar sesión no se envía ningún evento ni propiedad', () => {
    const a = fresh();
    a.track.vaccineAdded('ok');
    a.track.onboardingCompleted(false);
    a.track.login('password');
    a.setPetSpecies('Gato');
    expect(mockRnLogEvent).not.toHaveBeenCalled();
  });

  test('tras iniciar sesión con analyticsEnabled sin definir se activa y salen los eventos en cola (en orden)', () => {
    const a = fresh();
    a.track.onboardingCompleted(false);
    a.track.signUp('password');
    expect(mockRnLogEvent).not.toHaveBeenCalled();
    a.setAnalyticsEnabled(undefined);
    expect(mockSetCollection).toHaveBeenLastCalledWith('AN', true);
    expect(mockRnLogEvent.mock.calls.map((c) => c[1])).toEqual(['onboarding_completed', 'sign_up']);
    a.track.weightAdded();
    expect(mockRnLogEvent).toHaveBeenLastCalledWith('AN', 'weight_added', undefined);
  });

  test('al cerrar sesión se apaga y se descarta lo pendiente', () => {
    const a = fresh();
    a.setAnalyticsEnabled(undefined);
    a.setAnalyticsEnabled(false);
    expect(mockSetCollection).toHaveBeenLastCalledWith('AN', false);
    a.track.login('google');
    a.setAnalyticsEnabled(false); // sigue sin sesión: lo encolado se descarta
    mockRnLogEvent.mockClear();
    a.setAnalyticsEnabled(undefined);
    expect(mockRnLogEvent).not.toHaveBeenCalled();
    a.track.weightAdded();
    a.setAnalyticsEnabled(false);
    mockRnLogEvent.mockClear();
    a.track.weightAdded();
    expect(mockRnLogEvent).not.toHaveBeenCalled();
  });
});

describe('configuración de privacidad (JS/config)', () => {
  test('firebase.json apaga el ID de publicidad y los consentimientos de publicidad', () => {
    const rn = readJson('firebase.json')['react-native'];
    expect(rn.google_analytics_adid_collection_enabled).toBe(false);
    expect(rn.analytics_default_allow_ad_storage).toBe(false);
    expect(rn.analytics_default_allow_ad_user_data).toBe(false);
    expect(rn.analytics_default_allow_ad_personalization_signals).toBe(false);
    expect(rn.messaging_auto_init_enabled).toBe(false);
    expect(rn.analytics_auto_collection_enabled).toBe(false);
  });

  test('las claves de firebase.json existen en el esquema de RNFirebase', () => {
    const schema = readJson('node_modules/@react-native-firebase/app/firebase-schema.json');
    const props = JSON.stringify(schema);
    for (const key of Object.keys(readJson('firebase.json')['react-native'])) expect(props).toContain(`"${key}"`);
  });

  test('app.json: sin copias de seguridad y permisos innecesarios bloqueados', () => {
    const android = readJson('app.json').expo.android;
    expect(android.allowBackup).toBe(false);
    expect(android.blockedPermissions).toEqual(
      expect.arrayContaining([
        'com.google.android.gms.permission.AD_ID',
        'android.permission.ACCESS_ADSERVICES_AD_ID',
        'android.permission.ACCESS_ADSERVICES_ATTRIBUTION',
        'android.permission.SYSTEM_ALERT_WINDOW',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
      ])
    );
  });

  test('firestore.rules: la aceptación de términos no se puede modificar una vez escrita', () => {
    const rules = fs.readFileSync(path.join(root, 'firestore.rules'), 'utf8');
    expect(rules).toMatch(/allow read, delete: if request\.auth != null && request\.auth\.uid == userId;/);
    expect(rules).toContain("request.resource.data.get('acceptedTermsAt', request.time) == request.time");
    expect(rules).toContain('users/{uid}/consents/{version}');
    expect(rules).toContain("resource.data.get('acceptedTermsAt', null) == null");
    expect(rules).toContain("request.resource.data.get('acceptedTermsAt', null) == resource.data.acceptedTermsAt");
  });
});
