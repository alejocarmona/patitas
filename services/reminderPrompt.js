// Pide el permiso de notificaciones con un texto previo claro, en el momento en que el
// usuario activa un recordatorio por primera vez. Devuelve true si quedó concedido.
import { Alert, Linking } from 'react-native';
import { track } from './analytics';
import { getPermissionStatus, requestPermission } from './reminders';

export async function ensureReminderPermission(petName) {
  const status = await getPermissionStatus();
  if (status === 'granted') return true;
  if (status === 'denied') {
    // Ya lo negó y Android no deja volver a preguntar: solo queda activarlo en Ajustes.
    offerSettings(petName);
    return false;
  }

  const accepted = await new Promise((resolve) => {
    Alert.alert(
      `Recordatorios para ${petName}`,
      `Para avisarte a tiempo, Patitas necesita permiso para enviarte notificaciones. Solo las usará para cuidar a ${petName}.`,
      [
        { text: 'Ahora no', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Continuar', onPress: () => resolve(true) },
      ],
      { onDismiss: () => resolve(false) }
    );
  });
  if (!accepted) return false;
  const granted = await requestPermission();
  track.notificationPermission(granted);
  if (!granted && (await getPermissionStatus()) === 'denied') offerSettings(petName);
  return granted;
}

export function openNotificationSettings() {
  return Linking.openSettings().catch(() => {});
}

function offerSettings(petName) {
  Alert.alert(
    'Notificaciones desactivadas',
    `Para recibir los recordatorios de ${petName}, activa las notificaciones de Patitas en los ajustes del teléfono.`,
    [
      { text: 'Ahora no', style: 'cancel' },
      { text: 'Abrir ajustes', onPress: openNotificationSettings },
    ]
  );
}
