import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ActionLink from '../ui/ActionLink';
import StatusBadge from './StatusBadge';
import { fonts, statusColors, theme } from '../../constants/theme';
import { daysUntil, formatDateEs } from '../../utils/vacunaStatus';

function overdueLine(petName, nextDate) {
  const d = daysUntil(nextDate);
  const when = d === null ? '' : d === 0 ? ' · vence hoy' : ` · venció hace ${Math.abs(d)} ${Math.abs(d) === 1 ? 'día' : 'días'}`;
  return `${petName} necesita su refuerzo${when}`;
}

// Una tarjeta por tipo de vacuna: el estado sale SOLO de la dosis más reciente (`group.latest`);
// las dosis anteriores van en "Historial", sin estado.
export default function VacunaItem({ group, petName, onEdit, onDelete, onFindVet, onRenew }) {
  const [open, setOpen] = useState(false);
  const vacuna = group.latest;
  const history = group.history ?? [];
  const c = statusColors[vacuna.status] ?? statusColors.ok;
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1.5,
        borderColor: theme.border,
        borderLeftWidth: 5,
        borderLeftColor: c.fg,
        gap: 6,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ fontSize: 15, fontFamily: fonts.extrabold, color: theme.text, flex: 1 }}>{vacuna.name}</Text>
        <StatusBadge status={vacuna.status} />
      </View>
      {vacuna.status === 'vencida' ? (
        <Text style={{ fontSize: 13, fontFamily: fonts.semibold, color: theme.danger }}>{overdueLine(petName, vacuna.nextDate)}</Text>
      ) : null}
      <Text style={{ fontSize: 13, fontFamily: fonts.medium, color: theme.textMuted }}>
        Aplicada: {formatDateEs(vacuna.appliedDate)}
        {vacuna.nextDate ? ` · Próxima: ${formatDateEs(vacuna.nextDate)}` : ''}
      </Text>
      {vacuna.notes ? <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>{vacuna.notes}</Text> : null}

      {(vacuna.status === 'vencida' || vacuna.status === 'pronto') && onRenew ? (
        <Pressable
          onPress={onRenew}
          accessibilityRole="button"
          testID="ya-se-la-pusieron"
          style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', backgroundColor: theme.secondary, borderRadius: 10, paddingHorizontal: 16, marginTop: 4 }}
        >
          <Text style={{ color: '#fff', fontSize: 13, fontFamily: fonts.bold }}>Ya se la pusieron</Text>
        </Pressable>
      ) : null}
      {vacuna.status === 'vencida' && onFindVet ? (
        <Pressable
          onPress={onFindVet}
          accessibilityRole="button"
          style={{ alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', borderWidth: 1.5, borderColor: theme.secondary, borderRadius: 10, paddingHorizontal: 16 }}
        >
          <Text style={{ color: theme.secondary, fontSize: 13, fontFamily: fonts.bold }}>Encuentra veterinaria</Text>
        </Pressable>
      ) : null}

      <View style={{ flexDirection: 'row', gap: 16, marginTop: 2 }}>
        <ActionLink icon="edit-2" label="Editar" onPress={() => onEdit(vacuna)} color={theme.secondary} />
        <ActionLink icon="trash-2" label="Eliminar" onPress={() => onDelete(vacuna)} color={theme.neutralAction} />
      </View>

      {history.length > 0 ? (
        <View style={{ borderTopWidth: 1, borderTopColor: theme.border, marginTop: 2 }}>
          <Pressable
            onPress={() => setOpen((o) => !o)}
            testID="vacuna-historial-toggle"
            accessibilityRole="button"
            accessibilityState={{ expanded: open }}
            style={{ minHeight: 48, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Text style={{ fontSize: 13, fontFamily: fonts.bold, color: theme.textMuted }}>
              Historial ({history.length} {history.length === 1 ? 'dosis anterior' : 'dosis anteriores'})
            </Text>
            <Feather name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.textMuted} />
          </Pressable>
          {open
            ? history.map((h) => (
                <View key={h.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', opacity: 0.85 }}>
                  <Text style={{ flex: 1, fontSize: 12, fontFamily: fonts.regular, color: theme.textMuted }}>
                    Aplicada: {formatDateEs(h.appliedDate)}
                    {h.nextDate ? ` · Próxima: ${formatDateEs(h.nextDate)}` : ''}
                  </Text>
                  <Pressable onPress={() => onEdit(h)} accessibilityLabel="Editar dosis anterior" style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="edit-2" size={15} color={theme.neutralAction} />
                  </Pressable>
                  <Pressable onPress={() => onDelete(h)} accessibilityLabel="Eliminar dosis anterior" style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                    <Feather name="trash-2" size={15} color={theme.neutralAction} />
                  </Pressable>
                </View>
              ))
            : null}
        </View>
      ) : null}
    </View>
  );
}
