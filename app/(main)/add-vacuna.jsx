import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TopBar from '../../components/ui/TopBar';
import StatusBarCover from '../../components/ui/StatusBarCover';
import Button from '../../components/ui/Button';
import ChoiceChips from '../../components/ui/ChoiceChips';
import DateField from '../../components/ui/DateField';
import Field from '../../components/ui/Field';
import { fonts, theme } from '../../constants/theme';
import { usePet } from '../../hooks/usePet';
import { useVacunas } from '../../hooks/useVacunas';
import { useClearErrorsWhenValid, useDirty, useDiscardGuard, useScrollToError } from '../../hooks/useFormGuards';
import { addCartillaItem, updateCartillaItem } from '../../services/firestore';
import { track } from '../../services/analytics';
import { syncVacuna } from '../../services/reminders';
import { ensureReminderPermission } from '../../services/reminderPrompt';
import { computeVaccineReminderTimes } from '../../utils/reminders';
import { getVacunaStatus, isValidDateString, toDateString } from '../../utils/vacunaStatus';
import { normalizeVacunaName } from '../../utils/vacunas';

// Nombres como se leen en el carnet colombiano
export const VACUNAS = {
  Perro: ['Múltiple (Puppy/Quíntuple)', 'Parvovirus', 'Moquillo', 'Antirrábica', 'Leptospirosis', 'Bordetella', 'Otra'],
  Gato: ['Triple felina', 'Panleucopenia', 'Rinotraqueítis', 'Calicivirus', 'Antirrábica', 'Leucemia felina', 'Otra'],
  Conejo: ['Mixomatosis', 'Enfermedad hemorrágica', 'Otra'],
  Ave: ['Newcastle', 'Poxvirus', 'Otra'],
  Otro: ['Otra'],
};

const ORDER = ['name', 'appliedDate', 'nextDate'];

export default function AddVacuna() {
  const pet = usePet();
  const router = useRouter();
  const { id, renewName } = useLocalSearchParams();
  const { vacunas } = useVacunas(pet?.id);
  const editing = vacunas.find((v) => v.id === id);

  const options = VACUNAS[pet?.species] ?? VACUNAS.Otro;
  // "Ya se la pusieron": llega con el nombre de la vacuna precargado
  const renewMatch = renewName ? options.find((o) => normalizeVacunaName(o) === normalizeVacunaName(renewName)) : null;
  const [name, setName] = useState(renewName ? (renewMatch ?? 'Otra') : '');
  const [customName, setCustomName] = useState(renewName && !renewMatch ? String(renewName) : '');
  // Por defecto: hoy (fecha LOCAL)
  const [appliedDate, setAppliedDate] = useState(toDateString(new Date()));
  const [nextDate, setNextDate] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scroll = useScrollToError(ORDER);

  // Precarga al editar (una sola vez, cuando llegan los datos)
  useEffect(() => {
    if (editing && !loaded) {
      const known = options.includes(editing.name);
      setName(known ? editing.name : 'Otra');
      setCustomName(known ? '' : editing.name);
      setAppliedDate(editing.appliedDate ?? '');
      setNextDate(editing.nextDate ?? '');
      setNotes(editing.notes ?? '');
      setLoaded(true);
    }
  }, [editing, loaded, options]);

  const validate = () => {
    const finalName = name === 'Otra' ? customName.trim() : name;
    const e = {};
    if (!finalName) e.name = 'Elige o escribe el nombre de la vacuna.';
    if (!isValidDateString(appliedDate)) e.appliedDate = 'Elige una fecha.';
    else if (appliedDate > toDateString(new Date()) && !(editing && editing.appliedDate === appliedDate)) e.appliedDate = 'No puede ser una fecha futura.';
    // La próxima dosis es opcional: vacía = esquema completo
    if (nextDate && !isValidDateString(nextDate)) e.nextDate = 'Elige una fecha válida o déjala vacía.';
    return e;
  };

  useClearErrorsWhenValid(errors, setErrors, validate, [name, customName, appliedDate, nextDate]);
  const dirty = useDirty(JSON.stringify([name, customName, appliedDate, nextDate, notes]), !id || loaded);
  const allowLeave = useDiscardGuard(dirty && !saving);

  if (!pet) return null;

  const save = async () => {
    const finalName = name === 'Otra' ? customName.trim() : name;
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      scroll.scrollToFirst(e);
      return;
    }

    const data = { name: finalName, appliedDate, nextDate: nextDate || null, notes: notes.trim() || null };
    setSaving(true);
    try {
      // Recordatorios (7 días antes y el mismo día): solo si hay alguno futuro
      const wantsReminders = computeVaccineReminderTimes(data.nextDate).length > 0;
      const granted = wantsReminders ? await ensureReminderPermission(pet.name) : false;
      let itemId = editing?.id;
      if (editing) await updateCartillaItem(pet.id, 'vacunas', editing.id, data);
      else {
        const ref = await addCartillaItem(pet.id, 'vacunas', data);
        itemId = ref?.id;
        track.vaccineAdded(getVacunaStatus(data.nextDate));
      }
      if (itemId) await syncVacuna(pet.name, { ...data, id: itemId }).catch(() => {});
      if (granted && !editing) track.reminderEnabled('vaccine');
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
          title={editing ? 'Editar vacuna' : 'Agregar vacuna'}
          subtitle={editing ? `Actualiza la vacuna de ${pet.name}` : `Registra la vacuna de ${pet.name}`}
          color={theme.secondary}
          onBack={() => router.back()}
        />
        <View style={{ padding: 20, gap: 16 }} onLayout={scroll.onContainerLayout}>
          <View {...scroll.field('name')}>
            <ChoiceChips label="Vacuna" options={options} value={name} onChange={setName} />
            {errors.name ? <Text style={{ color: theme.danger, fontSize: 12, fontFamily: fonts.medium, marginTop: 4 }}>{errors.name}</Text> : null}
          </View>
          {name === 'Otra' && <Field value={customName} onChangeText={setCustomName} placeholder="Nombre de la vacuna" maxLength={60} />}
          <View {...scroll.field('appliedDate')}>
            <DateField
              label={`¿Cuándo se la pusieron a ${pet.name}?`}
              value={appliedDate}
              onChangeText={setAppliedDate}
              maximumDate={new Date()}
              error={errors.appliedDate}
            />
          </View>
          <View {...scroll.field('nextDate')}>
            <DateField clearable label="Próxima dosis (opcional)" value={nextDate} onChangeText={setNextDate} error={errors.nextDate} />
          </View>
          <Field label="Notas (opcional)" value={notes} onChangeText={setNotes} placeholder="Reacciones, lote, veterinario..." multiline maxLength={300} />
          <View style={{ backgroundColor: `${theme.accent}33`, borderWidth: 1, borderColor: theme.accent, borderRadius: 14, padding: 14 }}>
            <Text style={{ fontSize: 13, fontFamily: fonts.semibold, color: theme.text }}>
              💡 Guarda el carnet físico de {pet.name} como respaldo adicional
            </Text>
          </View>
          <Button label="Guardar vacuna" onPress={save} loading={saving} />
          <Button label="Cancelar" onPress={() => router.back()} variant="outline" color={theme.textMuted} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
