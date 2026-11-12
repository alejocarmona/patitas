import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { useRouter } from 'expo-router';
import TopBar from '../../components/ui/TopBar';
import Button from '../../components/ui/Button';
import DateField from '../../components/ui/DateField';
import Field from '../../components/ui/Field';
import { theme } from '../../constants/theme';
import { usePet } from '../../hooks/usePet';
import { addCartillaItem } from '../../services/firestore';
import { track } from '../../services/analytics';
import { isValidDateString, toDateString } from '../../utils/vacunaStatus';

export default function AddPeso() {
  const pet = usePet();
  const router = useRouter();
  const [value, setValue] = useState('');
  const [date, setDate] = useState(toDateString(new Date()));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  if (!pet) return null;

  const save = async () => {
    const kg = Number(value.replace(',', '.'));
    const e = {};
    if (!value.trim() || !Number.isFinite(kg) || kg <= 0 || kg > 500) e.value = 'Escribe un peso válido en kg (ej: 4.2).';
    if (!isValidDateString(date)) e.date = 'Elige una fecha.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setSaving(true);
    try {
      await addCartillaItem(pet.id, 'pesos', { value: Math.round(kg * 100) / 100, date });
      track.weightAdded();
      router.back();
    } catch {
      Alert.alert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior="padding">
      <ScrollView keyboardShouldPersistTaps="handled">
        <TopBar title="Registrar peso" subtitle={`¿Cuánto pesa ${pet.name} hoy?`} color={theme.secondary} onBack={() => router.back()} />
        <View style={{ padding: 20, gap: 16 }}>
          <Field label="Peso (kg)" value={value} onChangeText={setValue} placeholder="Ej: 4.2" keyboardType="decimal-pad" error={errors.value} maxLength={6} />
          <DateField label="Fecha" maximumDate={new Date()} value={date} onChangeText={setDate} error={errors.date} />
          <Button label="Guardar peso" onPress={save} loading={saving} />
          <Button label="Cancelar" onPress={() => router.back()} variant="outline" color={theme.textMuted} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
