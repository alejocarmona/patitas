import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, theme } from '../../constants/theme';
import { formatDateEs } from '../../utils/vacunaStatus';

export default function PesoItem({ peso, onDelete }) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: theme.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Text style={{ fontSize: 13, fontFamily: fonts.semibold, color: theme.textMuted }}>{formatDateEs(peso.date)}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Text style={{ fontSize: 16, fontFamily: fonts.extrabold, color: theme.secondary }}>{peso.value} kg</Text>
        <Pressable onPress={onDelete} hitSlop={10}>
          <Feather name="trash-2" size={16} color={theme.danger} />
        </Pressable>
      </View>
    </View>
  );
}
