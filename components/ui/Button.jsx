import { ActivityIndicator, Pressable, Text } from 'react-native';
import { fonts, theme } from '../../constants/theme';

// variant: 'primary' (relleno) | 'outline' | 'danger' | 'text' (sin borde: acciones secundarias o destructivas poco frecuentes)
export default function Button({
  label,
  onPress,
  variant = 'primary',
  color,
  loading = false,
  disabled = false,
  full = true,
}) {
  const base = color ?? (variant === 'danger' ? theme.danger : theme.primaryStrong);
  const text = variant === 'text';
  const outline = variant === 'outline' || text;
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: full ? '100%' : undefined,
        backgroundColor: outline ? 'transparent' : base,
        borderWidth: text ? 0 : 2,
        borderColor: base,
        borderRadius: 14,
        paddingVertical: text ? 12 : 14,
        minHeight: 48,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: off ? 0.55 : pressed ? 0.85 : 1,
        elevation: outline ? 0 : 3,
      })}
    >
      {loading ? (
        <ActivityIndicator color={outline ? base : '#fff'} />
      ) : (
        <Text style={{ color: outline ? base : '#fff', fontSize: 15, fontFamily: fonts.bold }}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
