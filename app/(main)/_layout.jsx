import { Stack } from 'expo-router';
import { useReminders } from '../../hooks/useReminders';

// Stack raíz de la zona autenticada. Las 4 pestañas viven en el grupo (tabs);
// perfil y los formularios son pantallas del Stack (NO pestañas ocultas:
// en expo-router 58 `href: null` redirige el foco a la pestaña inicial).
export default function MainLayout() {
  useReminders(); // recordatorios locales al día + toque de notificación -> Cartilla
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="perfil" />
      <Stack.Screen name="add-vacuna" />
      <Stack.Screen name="add-peso" />
      <Stack.Screen name="add-medicina" />
      <Stack.Screen name="edit-pet" />
      <Stack.Screen name="tip/[id]" />
    </Stack>
  );
}
