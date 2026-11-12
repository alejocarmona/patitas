// Pide el permiso de notificaciones con un texto previo claro, en el momento en que el
// usuario activa un recordatorio por primera vez. Devuelve true si quedó concedido.
import { Alert } from 'react-native';
import { track } from './analytics';
import { getPermissionStatus, requestPermission } from './reminders';

export async function ensureReminderPermission(petName) {
  const status = await getPermissionStatus();
  if (status === 'granted') return true;
  if (status === 'denied') return false; // ya lo negó: no insistir (se avisa en el formulario)

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
  return granted;
}
