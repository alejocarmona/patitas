import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TopBar from '../../components/ui/TopBar';
import StatusBarCover from '../../components/ui/StatusBarCover';
import Button from '../../components/ui/Button';
import ChoiceChips from '../../components/ui/ChoiceChips';
import DateField from '../../components/ui/DateField';
import TimeField from '../../components/ui/TimeField';
import Field from '../../components/ui/Field';
import { fonts, theme } from '../../constants/theme';
import { usePet } from '../../hooks/usePet';
import { useMedicinas } from '../../hooks/useMedicinas';
import { useClearErrorsWhenValid, useDirty, useDiscardGuard, useScrollToError } from '../../hooks/useFormGuards';
import { addCartillaItem, updateCartillaItem } from '../../services/firestore';
import { track } from '../../services/analytics';
import { getPermissionStatus, syncMedicina } from '../../services/reminders';
import { ensureReminderPermission } from '../../services/reminderPrompt';
import { daysUntil, isValidDateString, toDateString } from '../../utils/vacunaStatus';
import { endDateFromDuration, formatFrequency, hasStructuredSchedule, isValidTime, scheduleSummary } from '../../utils/reminders';

const UNITS = { Horas: 'horas', Días: 'dias' };
const UNIT_LABEL = { horas: 'Horas', dias: 'Días' };
const ORDER = ['name', 'dose', 'interval', 'firstDoseTime', 'startDate', 'durationDays'];

export default function AddMedicina() {
  const pet = usePet();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { medicinas } = useMedicinas(pet?.id);
  const editing = medicinas.find((m) => m.id === id);

  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [intervalValue, setIntervalValue] = useState('8');
  const [intervalUnit, setIntervalUnit] = useState('horas');
  const [firstDoseTime, setFirstDoseTime] = useState('08:00');
  const [startDate, setStartDate] = useState(toDateString(new Date()));
  const [durationDays, setDurationDays] = useState('');
  const [reminders, setReminders] = useState(true);
  const [permission, setPermission] = useState('undetermined');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scroll = useScrollToError(ORDER);

  useEffect(() => {
    getPermissionStatus().then(setPermission).catch(() => {});
  }, []);

  useEffect(() => {
    if (editing && !loaded) {
      setName(editing.name ?? '');
      setDose(editing.dose ?? '');
      if (hasStructuredSchedule(editing)) {
        setIntervalValue(String(editing.intervalValue));
        setIntervalUnit(editing.intervalUnit);
        setFirstDoseTime(editing.firstDoseTime);
      }
      setStartDate(editing.startDate ?? '');
      // Duración: la guardada, o derivada del `endDate` de medicinas anteriores
      let dur = editing.durationDays;
      if (!dur && editing.endDate && editing.startDate) {
        const d = daysUntil(editing.endDate, editing.startDate);
        if (d !== null && d >= 0) dur = d + 1;
      }
      setDurationDays(dur ? String(dur) : '');
      setReminders(hasStructuredSchedule(editing) ? editing.reminders !== false : true);
      setNotes(editing.notes ?? '');
      setLoaded(true);
    }
  }, [editing, loaded]);

  const summary = scheduleSummary({ intervalValue, intervalUnit, firstDoseTime, durationDays }, reminders);
  const validate = () => {
    const e = {};
    const n = Number(intervalValue);
    const dur = durationDays.trim() === '' ? null : Number(durationDays);
    if (!name.trim()) e.name = 'Escribe el nombre del medicamento.';
    if (!dose.trim()) e.dose = 'Escribe la dosis.';
    if (!/^\d+$/.test(intervalValue.trim()) || n < 1) e.interval = 'Escribe un número de 1 en adelante.';
    if (!isValidTime(firstDoseTime)) e.firstDoseTime = 'Elige la hora.';
    if (!isValidDateString(startDate)) e.startDate = 'Elige una fecha.';
    if (dur !== null && (!Number.isInteger(dur) || dur < 1)) e.durationDays = 'Escribe los días del tratamiento o déjalo vacío.';
    return e;
  };
  useClearErrorsWhenValid(errors, setErrors, validate, [name, dose, intervalValue, firstDoseTime, startDate, durationDays]);
  const dirty = useDirty(
    JSON.stringify([name, dose, intervalValue, intervalUnit, firstDoseTime, startDate, durationDays, reminders, notes]),
    !id || loaded
  );
  const allowLeave = useDiscardGuard(dirty && !saving);

  if (!pet) return null;

  const legacy = !!editing && !hasStructuredSchedule(editing);

  const onToggleReminders = async (on) => {
    setReminders(on);
    if (on) setPermission((await ensureReminderPermission(pet.name)) ? 'granted' : await getPermissionStatus());
  };

  const save = async () => {
    const n = Number(intervalValue);
    const dur = durationDays.trim() === '' ? null : Number(durationDays);
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      scroll.scrollToFirst(e);
      return;
    }

    const data = {
      name: name.trim(),
      dose: dose.trim(),
      // `frequency` legible se sigue guardando (compatibilidad con medicinas anteriores)
      frequency: formatFrequency({ intervalValue: n, intervalUnit, firstDoseTime }),
      intervalValue: n,
      intervalUnit,
      firstDoseTime,
      startDate,
      durationDays: dur,
      // `endDate` se deriva de la duración (último día del tratamiento); null = sin fin
      endDate: dur ? endDateFromDuration(startDate, dur) : null,
      reminders,
      notes: notes.trim() || null,
    };

    setSaving(true);
    try {
      let granted = false;
      if (reminders) {
        granted = await ensureReminderPermission(pet.name);
        setPermission(granted ? 'granted' : await getPermissionStatus());
      }
      let itemId = editing?.id;
      if (editing) await updateCartillaItem(pet.id, 'medicinas', editing.id, data);
      else {
        const ref = await addCartillaItem(pet.id, 'medicinas', { ...data, active: true });
        itemId = ref?.id;
        track.medicineAdded();
      }
      if (itemId) {
        // Sin permiso, `syncMedicina` no programa nada (y cancela lo previo del ítem)
        await syncMedicina(pet.name, { ...data, id: itemId, active: editing ? editing.active !== false : true }).catch(() => {});
      }
      if (reminders && granted && !(editing && editing.reminders)) track.reminderEnabled('medicine');
      allowLeave();
      router.back();
    } catch {
      Alert.alert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior="padding">
      <StatusBarCover color={theme.secondary} />
      <ScrollView ref={scroll.ref} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <TopBar
          title={editing ? 'Editar medicina' : 'Agregar medicina'}
          subtitle={`Tratamiento de ${pet.name}`}
          color={theme.secondary}
          onBack={() => router.back()}
        />
        <View style={{ padding: 20, gap: 16 }} onLayout={scroll.onContainerLayout}>
          <View {...scroll.field('name')}>
            <Field label="Medicamento" value={name} onChangeText={setName} placeholder="Ej: Amoxicilina" error={errors.name} maxLength={60} />
          </View>
          <View {...scroll.field('dose')}>
            <Field label="Dosis" value={dose} onChangeText={setDose} placeholder="Ej: 1 tableta, 2 ml" error={errors.dose} maxLength={40} />
          </View>
          {legacy ? (
            <Text style={{ fontSize: 13, fontFamily: fonts.medium, color: theme.textMuted }}>
              Esta medicina tenía la frecuencia escrita a mano ({editing.frequency}). Elige abajo cada cuánto se da para poder recordártelo.
            </Text>
          ) : null}
          <View {...scroll.field('interval')} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <View style={{ width: 110 }}>
              <Field
                label="Se da cada"
                value={intervalValue}
                onChangeText={setIntervalValue}
                placeholder="Ej: 8"
                keyboardType="number-pad"
                error={errors.interval}
                maxLength={3}
              />
            </View>
            <View style={{ flex: 1, paddingTop: 24 }}>
              <ChoiceChips options={Object.keys(UNITS)} value={UNIT_LABEL[intervalUnit]} onChange={(l) => setIntervalUnit(UNITS[l])} />
            </View>
          </View>
          <View {...scroll.field('firstDoseTime')}>
            <TimeField label="Hora de la primera toma" value={firstDoseTime} onChangeText={setFirstDoseTime} error={errors.firstDoseTime} />
          </View>
          <View {...scroll.field('startDate')}>
            <DateField label="Inicio" value={startDate} onChangeText={setStartDate} error={errors.startDate} />
          </View>
          <View {...scroll.field('durationDays')}>
            <Field
              label="Duración en días (opcional)"
              value={durationDays}
              onChangeText={setDurationDays}
              placeholder="Déjalo vacío si no tiene fecha de fin"
              keyboardType="number-pad"
              error={errors.durationDays}
              maxLength={3}
            />
          </View>
          {summary ? (
            <Text testID="resumen-horario" style={{ fontSize: 14, fontFamily: fonts.semibold, color: theme.secondary, lineHeight: 20 }}>
              {summary}
            </Text>
          ) : null}
          <View
            style={{
              backgroundColor: '#fff',
              borderWidth: 2,
              borderColor: theme.border,
              borderRadius: 12,
              padding: 14,
              gap: 8,
            }}
          >
            <Pressable
              onPress={() => onToggleReminders(!reminders)}
              accessible={false}
              style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}
            >
              <Text style={{ fontSize: 15, fontFamily: fonts.bold, color: theme.text, flex: 1 }}>Recordarme cada toma</Text>
              <Switch
                value={reminders}
                onValueChange={onToggleReminders}
                accessibilityLabel="Recordarme cada toma"
                thumbColor="#FFFFFF"
                trackColor={{ true: theme.secondary, false: theme.switchOff }}
              />
            </Pressable>
            {reminders && permission === 'denied' ? (
              <Text style={{ fontSize: 13, fontFamily: fonts.medium, color: theme.danger }}>
                Los recordatorios están apagados: las notificaciones de Patitas están bloqueadas en tu teléfono. La medicina se guarda igual.
              </Text>
            ) : null}
          </View>
          <Field label="Notas (opcional)" value={notes} onChangeText={setNotes} placeholder="Indicaciones del veterinario..." multiline maxLength={300} />
          <Button label="Guardar medicina" onPress={save} loading={saving} />
          <Button label="Cancelar" onPress={() => router.back()} variant="outline" color={theme.textMuted} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
