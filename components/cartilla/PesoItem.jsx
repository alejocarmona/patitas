import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, theme } from '../../constants/theme';
import { formatDateEs } from '../../utils/vacunaStatus';
import { formatKg } from '../../utils/weight';

export default function PesoItem({ peso, onDelete }) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 4,
        paddingLeft: 16,
        paddingRight: 4,
        borderWidth: 1.5,
        borderColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ fontSize: 13, fontFamily: fonts.semibold, color: theme.textMuted }}>{formatDateEs(peso.date)}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={{ fontSize: 16, fontFamily: fonts.extrabold, color: theme.secondary }}>{formatKg(peso.value)} kg</Text>
        <Pressable
          onPress={onDelete}
          accessibilityRole="button"
          accessibilityLabel="Eliminar registro de peso"
          style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}
        >
          <Feather name="trash-2" size={18} color={theme.neutralAction} />
        </Pressable>
      </View>
    </View>
  );
}
