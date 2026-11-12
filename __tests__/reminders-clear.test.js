// clearAllReminders (eliminar cuenta): cancela lo programado y vacía la tienda local.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

jest.mock('expo-notifications', () => require('../test-helpers/notificationsMock'));
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const { clearAllReminders } = require('../services/reminders');

test('cancela cada notificación guardada, cancela todo y borra reminders.v1', async () => {
  await AsyncStorage.setItem(
    'reminders.v1',
    JSON.stringify({ 'medicinas/m1': { sig: 'x', ids: ['a', 'b'] }, 'vacunas/v1': { sig: 'y', ids: ['c'] } })
  );
  await clearAllReminders();
  expect(Notifications.cancelScheduledNotificationAsync.mock.calls.map((c) => c[0])).toEqual(['a', 'b', 'c']);
  expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalledTimes(1);
  expect(await AsyncStorage.getItem('reminders.v1')).toBeNull();
});

test('sin nada programado no falla', async () => {
  await AsyncStorage.removeItem('reminders.v1');
  await expect(clearAllReminders()).resolves.toBeUndefined();
});
