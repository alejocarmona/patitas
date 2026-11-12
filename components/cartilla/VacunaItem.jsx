import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, theme } from '../../constants/theme';
import { formatDateEs } from '../../utils/vacunaStatus';

const COLOR = { ok: theme.success, pronto: '#E0A100', vencida: theme.danger, completa: theme.secondary };

// Texto en positivo: el sujeto es la mascota (Carnegie)
const label = (status, petName) =>
  status === 'completa'
    ? 'Completa'
    : status === 'ok'
      ? 'Al día ✓'
      : status === 'pronto'
        ? 'Próxima'
        : `${petName} necesita protección`;

export default function VacunaItem({ vacuna, petName, onEdit, onDelete }) {
  const c = COLOR[vacuna.status] ?? theme.success;
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: theme.border,
        borderLeftWidth: 5,
        borderLeftColor: c,
        gap: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontFamily: fonts.extrabold, color: theme.text, flex: 1 }}>{vacuna.name}</Text>
        <View style={{ backgroundColor: `${c}22`, borderRadius: 10, paddingVertical: 3, paddingHorizontal: 10 }}>
          <Text style={{ color: c, fontSize: 11, fontFamily: fonts.bold }}>{label(vacuna.status, petName)}</Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: theme.textMuted }}>
        Aplicada: {formatDateEs(vacuna.appliedDate)}
        {vacuna.nextDate ? ` · Próxima: ${formatDateEs(vacuna.nextDate)}` : ''}
      </Text>
      {vacuna.notes ? (
        <Text style={{ fontSize: 12, fontFamily: fonts.regular, color: theme.textMuted }}>{vacuna.notes}</Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
        <Pressable onPress={onEdit} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name="edit-2" size={14} color={theme.primary} />
          <Text style={{ color: theme.primary, fontSize: 12, fontFamily: fonts.bold }}>Editar</Text>
        </Pressable>
        <Pressable onPress={onDelete} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name="trash-2" size={14} color={theme.danger} />
          <Text style={{ color: theme.danger, fontSize: 12, fontFamily: fonts.bold }}>Eliminar</Text>
        </Pressable>
      </View>
    </View>
  );
}
