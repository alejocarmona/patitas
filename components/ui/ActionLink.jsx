import { Pressable, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, theme } from '../../constants/theme';

// Acción de texto de una tarjeta (Editar, Eliminar, Marcar finalizada): área táctil de 48 dp.
export default function ActionLink({ icon, label, onPress, color = theme.secondary, testID }) {
  return (
    <Pressable
      onPress={onPress}
      testID={testID}
      accessibilityRole="button"
      hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      style={{ minHeight: 48, minWidth: 48, paddingHorizontal: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 }}
    >
      <Feather name={icon} size={15} color={color} />
      <Text style={{ color, fontSize: 13, fontFamily: fonts.bold }}>{label}</Text>
    </Pressable>
  );
}
