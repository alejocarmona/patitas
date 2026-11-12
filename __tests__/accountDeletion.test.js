// Servicio de eliminación de cuenta: orden, lotes de 500, recordatorios y reautenticación primero.
const mockLog = [];
const mockData = {}; // 'ruta' -> [ids]
const mockFlags = { failBatch: false };

jest.mock('../firebase', () => ({ db: () => 'DB' }));
jest.mock('@react-native-firebase/firestore', () => ({
  collection: (_db, ...p) => ({ path: p.join('/') }),
  doc: (_db, ...p) => ({ path: p.join('/') }),
  query: (c) => c,
  where: () => null,
  getDocs: async (c) => ({
    docs: (mockData[c.path] ?? []).map((id) => ({ id, ref: { path: `${c.path}/${id}` } })),
  }),
  deleteDoc: async (ref) => {
    mockLog.push(`delete:${ref.path}`);
  },
  writeBatch: () => {
    const refs = [];
    return {
      delete: (r) => refs.push(r),
      commit: async () => {
        if (mockFlags.failBatch) throw new Error('batch_failed');
        mockLog.push(`batch:${refs.length}:${refs[0].path.split('/').slice(0, -1).join('/')}`);
      },
    };
  },
}));
jest.mock('../services/analytics', () => ({ track: { accountDeleted: () => mockLog.push('analytics:account_deleted') } }));
jest.mock('../services/reminders', () => ({
  clearAllReminders: jest.fn(async () => {
    mockLog.push('reminders:clear');
  }),
}));
jest.mock('../services/auth', () => ({
  hasRecentLogin: jest.fn(async () => false),
  reauthenticate: jest.fn(async () => {
    mockLog.push('reauth');
  }),
  deleteAuthUser: jest.fn(async () => {
    mockLog.push('auth:delete');
  }),
}));

const auth = require('../services/auth');
const { deleteAccount } = require('../services/accountDeletion');

const googleUser = { uid: 'u1', providerData: [{ providerId: 'google.com' }] };
const passUser = { uid: 'u1', email: 'a@b.co', providerData: [{ providerId: 'password' }] };

beforeEach(() => {
  jest.clearAllMocks();
  mockLog.length = 0;
  mockFlags.failBatch = false;
  for (const k of Object.keys(mockData)) delete mockData[k];
  mockData.pets = ['p1'];
  mockData['pets/p1/vacunas'] = ['v1', 'v2'];
  mockData['pets/p1/pesos'] = ['w1'];
  mockData['pets/p1/medicinas'] = ['m1'];
  mockData['users/u1/savedTips'] = ['t1'];
  auth.hasRecentLogin.mockImplementation(async () => false);
  auth.reauthenticate.mockImplementation(async () => {
    mockLog.push('reauth');
  });
});

const idx = (s) => mockLog.indexOf(s);

describe('deleteAccount', () => {
  test('orden: reautenticar, analytics, recordatorios, subcolecciones, mascota, savedTips, usuario, auth', async () => {
    await deleteAccount(googleUser);
    expect(mockLog).toEqual([
      'reauth',
      'analytics:account_deleted',
      'reminders:clear',
      'batch:2:pets/p1/vacunas',
      'batch:1:pets/p1/pesos',
      'batch:1:pets/p1/medicinas',
      'delete:pets/p1',
      'batch:1:users/u1/savedTips',
      'delete:users/u1',
      'reminders:clear',
      'auth:delete',
    ]);
  });

  test('la reautenticación va antes de cualquier borrado', async () => {
    await deleteAccount(googleUser);
    const firstDelete = mockLog.findIndex((l) => l.startsWith('batch:') || l.startsWith('delete:'));
    expect(idx('reauth')).toBeGreaterThanOrEqual(0);
    expect(idx('reauth')).toBeLessThan(firstDelete);
    expect(idx('reminders:clear')).toBeLessThan(firstDelete);
  });

  test('si la reautenticación falla o se cancela: no se borra nada (ni datos, ni recordatorios, ni analytics)', async () => {
    auth.reauthenticate.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'patitas/reauth-cancelled' }));
    await expect(deleteAccount(googleUser)).rejects.toMatchObject({ code: 'patitas/reauth-cancelled' });
    expect(mockLog).toEqual([]);
    expect(auth.deleteAuthUser).not.toHaveBeenCalled();
  });

  test('contraseña incorrecta (cuenta de correo): aborta sin borrar y se pasa la contraseña escrita', async () => {
    auth.reauthenticate.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'auth/wrong-password' }));
    await expect(deleteAccount(passUser, { password: 'mala' })).rejects.toMatchObject({ code: 'auth/wrong-password' });
    expect(auth.reauthenticate).toHaveBeenCalledWith(passUser, 'mala');
    expect(mockLog).toEqual([]);
  });

  test('Google con ingreso reciente no vuelve a pedir cuenta; correo siempre verifica la contraseña', async () => {
    auth.hasRecentLogin.mockImplementation(async () => true);
    await deleteAccount(googleUser);
    expect(auth.reauthenticate).not.toHaveBeenCalled();
    mockLog.length = 0;
    await deleteAccount(passUser, { password: 'ok' });
    expect(auth.reauthenticate).toHaveBeenCalledWith(passUser, 'ok');
  });

  test('más de 500 documentos se borran en lotes de máximo 500', async () => {
    mockData['pets/p1/vacunas'] = Array.from({ length: 1200 }, (_, i) => `v${i}`);
    await deleteAccount(googleUser);
    const batches = mockLog.filter((l) => l.startsWith('batch:') && l.endsWith('/vacunas')).map((l) => Number(l.split(':')[1]));
    expect(batches).toEqual([500, 500, 200]);
  });

  test('borra todas las mascotas del usuario, subcolecciones antes que el documento', async () => {
    mockData.pets = ['p1', 'p2'];
    mockData['pets/p2/vacunas'] = ['x'];
    await deleteAccount(googleUser);
    expect(mockLog).toContain('delete:pets/p1');
    expect(mockLog).toContain('delete:pets/p2');
    expect(idx('batch:1:pets/p2/vacunas')).toBeLessThan(idx('delete:pets/p2'));
  });

  test('si un lote falla, reintenta documento por documento y completa', async () => {
    mockFlags.failBatch = true;
    await deleteAccount(googleUser);
    expect(mockLog).toEqual(
      expect.arrayContaining(['delete:pets/p1/vacunas/v1', 'delete:pets/p1/vacunas/v2', 'delete:pets/p1', 'delete:users/u1', 'auth:delete'])
    );
  });

  test('si borrar la cuenta de Auth falla, el error sale (los datos ya no están, reintentar es seguro)', async () => {
    auth.deleteAuthUser.mockRejectedValueOnce(Object.assign(new Error('x'), { code: 'auth/network-request-failed' }));
    await expect(deleteAccount(googleUser)).rejects.toMatchObject({ code: 'auth/network-request-failed' });
  });
});
