import { Pressable, Text } from 'react-native';
import { fonts, theme } from '../../constants/theme';

// Chip del encabezado de Tips (sobre fondo de color): activo = blanco.
export default function CategoryChip({ label, active, onPress, outlined = false }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: active ? '#fff' : 'rgba(255,255,255,0.2)',
        borderWidth: outlined && !active ? 1.5 : 0,
        borderColor: 'rgba(255,255,255,0.5)',
      }}
    >
      <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: active ? theme.primary : '#fff' }}>{label}</Text>
    </Pressable>
  );
}
