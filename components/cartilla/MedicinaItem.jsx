import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, theme } from '../../constants/theme';
import { formatDateEs } from '../../utils/vacunaStatus';

export default function MedicinaItem({ medicina, onToggle, onEdit, onDelete }) {
  const on = !!medicina.active;
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: theme.border,
        borderLeftWidth: 5,
        borderLeftColor: on ? theme.primary : theme.textLight,
        gap: 6,
        opacity: on ? 1 : 0.75,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontFamily: fonts.extrabold, color: theme.text, flex: 1 }}>{medicina.name}</Text>
        <View style={{ backgroundColor: on ? `${theme.primary}22` : theme.border, borderRadius: 10, paddingVertical: 3, paddingHorizontal: 10 }}>
          <Text style={{ color: on ? theme.primary : theme.textMuted, fontSize: 11, fontFamily: fonts.bold }}>
            {on ? 'En tratamiento' : 'Finalizada'}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 12, fontFamily: fonts.medium, color: theme.textMuted }}>
        {medicina.dose} · {medicina.frequency}
      </Text>
      <Text style={{ fontSize: 12, fontFamily: fonts.regular, color: theme.textMuted }}>
        Desde {formatDateEs(medicina.startDate)}
        {medicina.endDate ? ` hasta ${formatDateEs(medicina.endDate)}` : ''}
      </Text>
      {medicina.notes ? (
        <Text style={{ fontSize: 12, fontFamily: fonts.regular, color: theme.textMuted }}>{medicina.notes}</Text>
      ) : null}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 4 }}>
        <Pressable onPress={onToggle} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Feather name={on ? 'check-circle' : 'rotate-ccw'} size={14} color={theme.secondary} />
          <Text style={{ color: theme.secondary, fontSize: 12, fontFamily: fonts.bold }}>{on ? 'Marcar finalizada' : 'Reactivar'}</Text>
        </Pressable>
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
