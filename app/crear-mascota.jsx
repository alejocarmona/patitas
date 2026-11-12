import { useState } from 'react';
import { Alert } from 'react-native';
import PetForm from '../components/pet/PetForm';
import { useAuth } from '../hooks/useAuth';
import { createPet } from '../services/firestore';
import { setPetSpecies, track } from '../services/analytics';

// Al crearse la mascota, el AuthProvider la recibe por onSnapshot y el
// layout redirige solo a las tabs (no se navega a mano).
export default function CrearMascota() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const onSubmit = async (form) => {
    setSaving(true);
    try {
      await createPet(user.uid, form);
      track.petProfileCreated(form.species, form.avatarId);
      setPetSpecies(form.species);
    } catch {
      Alert.alert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
      setSaving(false);
    }
  };

  return <PetForm onSubmit={onSubmit} submitting={saving} />;
}
