import { Pressable, Text, View } from 'react-native';
import { fonts, theme } from '../../constants/theme';

// Selector de una opción entre varias (chips). options: string[]
export default function ChoiceChips({ label, options, value, onChange }) {
  return (
    <View>
      {label ? (
        <Text
          style={{
            fontSize: 12,
            fontFamily: fonts.bold,
            color: theme.textMuted,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((o) => {
          const on = value === o;
          return (
            <Pressable
              key={o}
              onPress={() => onChange(o)}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 16,
                borderRadius: 20,
                borderWidth: 2,
                borderColor: on ? theme.primaryStrong : theme.border,
                backgroundColor: on ? `${theme.primaryStrong}15` : '#fff',
              }}
            >
              <Text style={{ fontSize: 13, fontFamily: fonts.bold, color: on ? theme.primaryStrong : theme.textMuted }}>
                {o}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
