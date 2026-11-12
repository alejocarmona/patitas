import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { fonts, theme } from '../../constants/theme';

// Encabezado de pantalla (reemplaza el degradado del prototipo por color sólido)
export default function TopBar({ title, subtitle, color = theme.primary, onBack, right }) {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        backgroundColor: color,
        paddingTop: insets.top + 16,
        paddingHorizontal: 20,
        paddingBottom: 24,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 12,
              paddingVertical: 8,
              paddingHorizontal: 12,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Feather name="chevron-left" size={18} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 13, fontFamily: fonts.bold }}>Atrás</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {right}
      </View>
      <Text
        style={{
          color: '#fff',
          fontSize: 22,
          fontFamily: fonts.black,
          marginTop: onBack ? 12 : 0,
          marginBottom: 4,
        }}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, fontFamily: fonts.regular }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
