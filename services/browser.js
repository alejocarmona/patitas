import { Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

// Abre un enlace legal en el navegador integrado (Custom Tab): "Atrás" vuelve a Patitas.
export async function openLegalUrl(url) {
  try {
    await WebBrowser.openBrowserAsync(url, { toolbarColor: '#2D4A3E', controlsColor: '#FFFFFF', showTitle: true });
  } catch {
    Alert.alert('No se pudo abrir el enlace', 'Revisa tu conexión e inténtalo de nuevo.');
  }
}
