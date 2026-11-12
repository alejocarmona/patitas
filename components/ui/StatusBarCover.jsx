import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Franja fija del color del encabezado bajo la barra de estado: el contenido que hace
// scroll (labels, errores) nunca se ve detrás del reloj y los íconos del sistema.
export default function StatusBarCover({ color }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: color, zIndex: 10 }}
    />
  );
}
