import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import PetForm from '../../components/pet/PetForm';
import { usePets } from '../../hooks/usePet';
import { deletePet, updatePet } from '../../services/firestore';
import Button from '../../components/ui/Button';
import { theme } from '../../constants/theme';
import { setPetSpecies } from '../../services/analytics';

export default function EditPet() {
  const { pet, pets, selectPet } = usePets();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(false);

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

  // Solo con 2 o más mascotas: la app siempre necesita al menos una.
  const confirmRemove = () =>
    Alert.alert(
      `¿Eliminar a ${pet.name}?`,
      `Se borra su perfil y toda su cartilla (vacunas, pesos y medicinas), con sus recordatorios. No se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            setRemoving(true);
            const other = pets.find((p) => p.id !== pet.id);
            try {
              await deletePet(pet.id);
              if (other) selectPet(other.id);
              router.back();
            } catch {
              setRemoving(false);
              Alert.alert('No se pudo eliminar', 'Revisa tu conexión e inténtalo de nuevo.');
            }
          },
        },
      ]
    );

  return (
    <PetForm
      footer={
        pets.length > 1 ? (
          <Button label={`Eliminar a ${pet.name}`} onPress={confirmRemove} loading={removing} variant="outline" color={theme.danger} />
        ) : null
      }
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
