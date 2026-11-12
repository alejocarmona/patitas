import { ActivityIndicator, Pressable, Text } from 'react-native';
import { fonts, theme } from '../../constants/theme';

// variant: 'primary' (relleno) | 'outline' | 'danger'
export default function Button({
  label,
  onPress,
  variant = 'primary',
  color,
  loading = false,
  disabled = false,
  full = true,
}) {
  const base = color ?? (variant === 'danger' ? theme.danger : theme.primary);
  const outline = variant === 'outline';
  const off = disabled || loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      style={({ pressed }) => ({
        width: full ? '100%' : undefined,
        backgroundColor: outline ? 'transparent' : base,
        borderWidth: 2,
        borderColor: base,
        borderRadius: 14,
        paddingVertical: 14,
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
