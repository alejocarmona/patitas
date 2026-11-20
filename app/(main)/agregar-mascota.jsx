import { useState } from 'react';
import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import PetForm from '../../components/pet/PetForm';
import { useAuth } from '../../hooks/useAuth';
import { usePets } from '../../hooks/usePet';
import { createPet } from '../../services/firestore';
import { track } from '../../services/analytics';

// Agregar otra mascota (ya hay al menos una). Al guardarla queda seleccionada y se vuelve a Inicio.
export default function AgregarMascota() {
  const { user } = useAuth();
  const { canAdd, selectPet } = usePets();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/home'));

  const onSubmit = async (form) => {
    if (!canAdd) return back();
    setSaving(true);
    try {
      const id = await createPet(user.uid, form);
      track.petProfileCreated(form.species, form.avatarId);
      selectPet(id);
      router.replace('/home');
    } catch {
      Alert.alert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return <PetForm onSubmit={onSubmit} onCancel={back} submitting={saving} />;
}
