import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import PetForm from '../../components/pet/PetForm';
import { usePet } from '../../hooks/usePet';
import { updatePet } from '../../services/firestore';
import { setPetSpecies } from '../../services/analytics';

export default function EditPet() {
  const pet = usePet();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  if (!pet) return null;

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      await updatePet(pet.id, form);
      setPetSpecies(form.species);
      router.back();
    } catch {
      Alert.alert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return (
    <PetForm
      isEdit
      initial={{
        name: pet.name,
        species: pet.species,
        breed: pet.breed ?? '',
        gender: pet.gender,
        birthdate: pet.birthdate,
        avatarId: pet.avatarId,
      }}
      onSubmit={onSubmit}
      onCancel={() => router.back()}
      submitting={saving}
    />
  );
}
