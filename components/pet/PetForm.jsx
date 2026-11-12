import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import Button from '../ui/Button';
import ChoiceChips from '../ui/ChoiceChips';
import DateField from '../ui/DateField';
import Field from '../ui/Field';
import TopBar from '../ui/TopBar';
import { AVATARS } from '../../constants/avatars';
import { fonts, theme } from '../../constants/theme';
import { parseLocalDate, startOfDay } from '../../utils/vacunaStatus';

const SPECIES = ['Perro', 'Gato', 'Conejo', 'Ave', 'Otro'];

// 'perro-1' -> 'Perro 1' (etiqueta legible para lectores de pantalla)
const avatarLabel = (a) => String(a.id).replace('-', ' ');

// Formulario compartido: crear mascota (onboarding) y editar.
// initial: { name, species, breed, gender, birthdate, avatarId } | undefined
export default function PetForm({ initial, isEdit = false, onSubmit, onCancel, submitting = false }) {
  const [form, setForm] = useState(
    initial ?? { name: '', species: 'Gato', breed: '', birthdate: '', gender: 'Hembra', avatarId: 'gato-1' }
  );
  const [errors, setErrors] = useState({});
  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));

  const pickSpecies = (s) =>
    setForm((f) => {
      const current = AVATARS.find((a) => a.id === f.avatarId);
      const avatarId = current && current.species === s ? f.avatarId : (AVATARS.find((a) => a.species === s)?.id ?? f.avatarId);
      return { ...f, species: s, avatarId };
    });

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Cuéntanos cómo se llama.';
    const b = parseLocalDate(form.birthdate);
    if (!b) e.birthdate = 'Elige la fecha de nacimiento.';
    else if (b > startOfDay(new Date())) e.birthdate = 'La fecha no puede ser futura.';
    setErrors(e);
    if (Object.keys(e).length) return;
    onSubmit(form);
  };

  const nombre = form.name.trim() || 'tu mascota';

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior="padding">
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 32 }}>
        <TopBar
          title={isEdit ? `Editar perfil de ${nombre}` : 'Cuéntanos de tu mascota'}
          subtitle={isEdit ? 'Actualiza los datos cuando quieras' : 'Así podremos cuidarla mejor juntos 🐾'}
          onBack={isEdit ? onCancel : undefined}
        />
        <View style={{ paddingHorizontal: 20, paddingTop: 20, gap: 16 }}>
          <View>
            <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, letterSpacing: 0.5, textTransform: 'uppercase', marginBottom: 8 }}>
              Elige su avatar
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 }}>
              {AVATARS.map((a) => {
                const on = form.avatarId === a.id;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => setForm((f) => ({ ...f, avatarId: a.id, species: a.species }))}
                    accessibilityLabel={`Avatar ${avatarLabel(a)}`}
                    style={{
                      borderRadius: 22,
                      borderWidth: 3,
                      borderColor: on ? theme.secondary : 'transparent',
                      padding: 2,
                    }}
                  >
                    <Image source={a.source} style={{ width: 68, height: 68, borderRadius: 18 }} />
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Field label="Nombre" value={form.name} onChangeText={set('name')} placeholder="¿Cómo se llama?" error={errors.name} maxLength={40} />
          <ChoiceChips label="Especie" options={SPECIES} value={form.species} onChange={pickSpecies} />
          <Field label="Raza" value={form.breed} onChangeText={set('breed')} placeholder="Ej: Labrador, Persa..." maxLength={40} />
          <DateField label="Fecha de nacimiento" maximumDate={new Date()} value={form.birthdate} onChangeText={set('birthdate')} error={errors.birthdate} />
          <ChoiceChips label="Sexo" options={['Macho', 'Hembra']} value={form.gender} onChange={set('gender')} />

          <Button
            label={isEdit ? 'Guardar cambios' : `¡Listo, creemos el perfil de ${nombre}! 🐾`}
            onPress={submit}
            loading={submitting}
          />
          {isEdit && <Button label="Cancelar" onPress={onCancel} variant="outline" color={theme.textMuted} />}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
