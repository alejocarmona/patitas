// useSubcollection: si el listener de Firestore falla, se reintenta solo (Inicio no se queda en 0).
import { act, renderHook } from '@testing-library/react-native';

const mockCalls = [];
jest.mock('../firebase', () => ({ db: () => 'DB' }));
jest.mock('@react-native-firebase/firestore', () => ({
  collection: (_d, ...p) => ({ path: p.join('/') }),
  onSnapshot: (_ref, ok, err) => {
    mockCalls.push({ ok, err });
    return () => {};
  },
}));

const { useSubcollection, RETRY_DELAYS_MS } = require('../hooks/useSubcollection');

test('tras un error vuelve a escuchar y muestra los registros', async () => {
  jest.useFakeTimers();
  const { result } = await renderHook(() => useSubcollection('p1', 'vacunas'));
  expect(mockCalls).toHaveLength(1);
  await act(async () => mockCalls[0].err(new Error('unavailable')));
  expect(result.current.items).toEqual([]);
  expect(result.current.error).toBeTruthy();
  await act(async () => jest.advanceTimersByTime(RETRY_DELAYS_MS[0]));
  expect(mockCalls).toHaveLength(2); // nueva suscripción
  await act(async () => mockCalls[1].ok({ docs: [{ id: 'v1', data: () => ({ name: 'Rabia' }) }] }));
  expect(result.current.items).toEqual([{ id: 'v1', name: 'Rabia' }]);
  expect(result.current.error).toBeNull();
  jest.useRealTimers();
});
