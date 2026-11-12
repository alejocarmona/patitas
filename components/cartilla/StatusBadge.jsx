import { Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, statusColors } from '../../constants/theme';

const LABEL = { ok: 'Al día', pronto: 'Próxima', vencida: 'Vencida', completa: 'Completa' };

// Badge de estado: texto oscuro sobre fondo claro + ícono (el estado no depende solo del color).
export default function StatusBadge({ status }) {
  const c = statusColors[status] ?? statusColors.ok;
  return (
    <View
      accessibilityLabel={`Estado: ${LABEL[status] ?? ''}`}
      style={{ backgroundColor: c.bg, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5 }}
    >
      <Feather name={c.icon} size={12} color={c.fg} />
      <Text style={{ color: c.fg, fontSize: 12, fontFamily: fonts.bold }}>{LABEL[status] ?? ''}</Text>
    </View>
  );
}
