import { useState } from 'react';
import { Alert, KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import TopBar from '../../components/ui/TopBar';
import StatusBarCover from '../../components/ui/StatusBarCover';
import Button from '../../components/ui/Button';
import DateField from '../../components/ui/DateField';
import Field from '../../components/ui/Field';
import { theme } from '../../constants/theme';
import { usePet } from '../../hooks/usePet';
import { useClearErrorsWhenValid, useDirty, useDiscardGuard, useScrollToError } from '../../hooks/useFormGuards';
import { addCartillaItem } from '../../services/firestore';
import { track } from '../../services/analytics';
import { isValidDateString, toDateString } from '../../utils/vacunaStatus';
import { weightOutlier } from '../../utils/weight';

const ORDER = ['value', 'date'];

export default function AddPeso() {
  const pet = usePet();
  const router = useRouter();
  const [value, setValue] = useState('');
  const [date, setDate] = useState(toDateString(new Date()));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const scroll = useScrollToError(ORDER);

  const kgOf = (v) => Number(v.replace(',', '.'));
  const validate = () => {
    const kg = kgOf(value);
    const e = {};
    if (!value.trim() || !Number.isFinite(kg) || kg <= 0 || kg > 500) e.value = 'Escribe un peso válido en kg (ej: 4,2).';
    if (!isValidDateString(date)) e.date = 'Elige una fecha.';
    return e;
  };
  useClearErrorsWhenValid(errors, setErrors, validate, [value, date]);
  const dirty = useDirty(JSON.stringify([value, date]));
  const allowLeave = useDiscardGuard(dirty && !saving);

  if (!pet) return null;

  const persist = async (kg) => {
    setSaving(true);
    try {
      await addCartillaItem(pet.id, 'pesos', { value: Math.round(kg * 100) / 100, date });
      track.weightAdded();
      allowLeave();
      router.back();
    } catch {
      Alert.alert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  const save = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      scroll.scrollToFirst(e);
      return;
    }
    const kg = kgOf(value);
    // Fuera del rango plausible de la especie: confirmación suave (no bloquea)
    const odd = weightOutlier(pet.species, kg);
    if (odd) {
      Alert.alert('¿Seguro?', odd.message, [
        { text: 'Corregir', style: 'cancel' },
        { text: 'Confirmar', onPress: () => persist(kg) },
      ]);
      return;
    }
    persist(kg);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior="padding">
      <StatusBarCover color={theme.secondary} />
      <ScrollView ref={scroll.ref} keyboardShouldPersistTaps="handled">
        <TopBar title="Registrar peso" subtitle={`¿Cuánto pesa ${pet.name} hoy?`} color={theme.secondary} onBack={() => router.back()} />
        <View style={{ padding: 20, gap: 16 }} onLayout={scroll.onContainerLayout}>
          <View {...scroll.field('value')}>
            <Field label="Peso (kg)" value={value} onChangeText={setValue} placeholder="Ej: 4,2" keyboardType="decimal-pad" error={errors.value} maxLength={6} />
          </View>
          <View {...scroll.field('date')}>
            <DateField label="Fecha" maximumDate={new Date()} value={date} onChangeText={setDate} error={errors.date} />
          </View>
          <Button label="Guardar peso" onPress={save} loading={saving} />
          <Button label="Cancelar" onPress={() => router.back()} variant="outline" color={theme.textMuted} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
