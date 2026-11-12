import { Pressable, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { fonts, theme } from '../../constants/theme';
import { formatTime12, parseTime, toTimeString } from '../../utils/reminders';

// Selector de hora con el reloj nativo. El valor es un string 'HH:mm' (24 h, hora local);
// se muestra y se elige en formato de 12 h (a. m. / p. m.).
export default function TimeField({ label, value, onChangeText, error, testID }) {
  const t = parseTime(value);

  const open = () => {
    const base = new Date();
    base.setHours(t ? t.h : 8, t ? t.min : 0, 0, 0);
    DateTimePickerAndroid.open({
      value: base,
      mode: 'time',
      is24Hour: false,
      onChange: (event, date) => {
        if (event.type === 'set' && date) onChangeText(toTimeString(date));
      },
    });
  };

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
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={open}
        accessibilityRole="button"
        accessibilityLabel={label ?? 'Hora'}
        testID={testID}
        style={{
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: error ? theme.danger : theme.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 13,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Text style={{ fontSize: 15, fontFamily: fonts.semibold, color: t ? theme.text : theme.textSubtle }}>
          {t ? formatTime12(value) : 'Elegir hora'}
        </Text>
        <Feather name="clock" size={18} color={theme.textMuted} />
      </Pressable>
      {error ? (
        <Text style={{ color: theme.danger, fontSize: 12, fontFamily: fonts.medium, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
}
