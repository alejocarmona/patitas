import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ActionLink from '../ui/ActionLink';
import { fonts, theme } from '../../constants/theme';
import { formatDateEs } from '../../utils/vacunaStatus';
import { computeDoseTimes, formatNextDose, hasStructuredSchedule } from '../../utils/reminders';

// Línea de recordatorios: próxima toma, o "Sin recordatorios".
export function reminderLine(medicina, now = new Date()) {
  if (!medicina.active) return null;
  if (!hasStructuredSchedule(medicina) || medicina.reminders === false) return { on: false, text: 'Sin recordatorios' };
  const next = computeDoseTimes(medicina, now, 14)[0];
  return next ? { on: true, text: `Próxima toma: ${formatNextDose(next, now)}` } : { on: true, text: 'Recordatorios activos' };
}

export default function MedicinaItem({ medicina, onToggle, onEdit, onDelete }) {
  const on = !!medicina.active;
  const line = reminderLine(medicina);
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: theme.border,
        borderLeftWidth: 5,
        borderLeftColor: on ? theme.secondary : theme.divider,
        gap: 6,
        opacity: on ? 1 : 0.85,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 15, fontFamily: fonts.extrabold, color: theme.text, flex: 1 }}>{medicina.name}</Text>
        <View style={{ backgroundColor: on ? '#E3E7E5' : theme.border, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 }}>
          <Text style={{ color: on ? theme.secondary : theme.textMuted, fontSize: 12, fontFamily: fonts.bold }}>
            {on ? 'En tratamiento' : 'Finalizada'}
          </Text>
        </View>
      </View>
      <Text style={{ fontSize: 13, fontFamily: fonts.medium, color: theme.textMuted }}>
        {medicina.dose} · {medicina.frequency}
      </Text>
      <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>
        Desde {formatDateEs(medicina.startDate)}
        {medicina.endDate ? ` hasta ${formatDateEs(medicina.endDate)}` : ''}
      </Text>
      {line ? (
        <Pressable
          onPress={onEdit}
          accessibilityRole="button"
          accessibilityLabel={`${line.text}. Toca para editar`}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 32 }}
        >
          <Feather name={line.on ? 'bell' : 'bell-off'} size={14} color={line.on ? theme.secondary : theme.textMuted} />
          <Text style={{ fontSize: 13, fontFamily: fonts.semibold, color: line.on ? theme.secondary : theme.textMuted }}>{line.text}</Text>
        </Pressable>
      ) : null}
      {medicina.notes ? <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>{medicina.notes}</Text> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 }}>
        <ActionLink icon={on ? 'check-circle' : 'rotate-ccw'} label={on ? 'Marcar finalizada' : 'Reactivar'} onPress={onToggle} color={theme.secondary} />
        <ActionLink icon="edit-2" label="Editar" onPress={onEdit} color={theme.secondary} />
        <ActionLink icon="trash-2" label="Eliminar" onPress={onDelete} color={theme.neutralAction} />
      </View>
    </View>
  );
}
