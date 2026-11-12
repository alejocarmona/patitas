import { Pressable, Text, View } from 'react-native';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { Feather } from '@expo/vector-icons';
import { fonts, theme } from '../../constants/theme';
import { formatDateEs, parseLocalDate, toDateString } from '../../utils/vacunaStatus';

// Selector de fecha con calendario nativo. El valor sigue siendo un string
// 'YYYY-MM-DD' en fecha LOCAL (nunca toISOString: en Colombia corre un día).
export default function DateField({ label, value, onChangeText, error, maximumDate, minimumDate, clearable = false, testID }) {
  const current = parseLocalDate(value);

  const open = () => {
    DateTimePickerAndroid.open({
      value: current ?? maximumDate ?? new Date(),
      mode: 'date',
      maximumDate,
      minimumDate,
      onChange: (event, date) => {
        if (event.type === 'set' && date) onChangeText(toDateString(date));
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
        accessibilityLabel={label ?? 'Fecha'}
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
        <Text style={{ fontSize: 15, fontFamily: fonts.semibold, color: current ? theme.text : theme.textSubtle }}>
          {current ? formatDateEs(value) : 'Elegir fecha'}
        </Text>
        {clearable && current ? (
          <Pressable onPress={() => onChangeText('')} hitSlop={12} accessibilityLabel="Quitar fecha">
            <Feather name="x" size={18} color={theme.textMuted} />
          </Pressable>
        ) : (
          <Feather name="calendar" size={18} color={theme.textMuted} />
        )}
      </Pressable>
      {error ? (
        <Text style={{ color: theme.danger, fontSize: 12, fontFamily: fonts.medium, marginTop: 4 }}>{error}</Text>
      ) : null}
    </View>
  );
}
