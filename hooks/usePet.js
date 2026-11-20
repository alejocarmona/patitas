import { useAuth } from './useAuth';
import { canAddPet } from '../utils/pets';

// Mascota SELECCIONADA del usuario. Todas las pantallas de la cartilla trabajan sobre ella.
// Viene del AuthProvider, que escucha todas las mascotas del usuario con onSnapshot.
export function usePet() {
  const { pet } = useAuth();
  return pet;
}

// Todas las mascotas + selección + si se puede agregar otra (tope remoto, hoy sin tope).
export function usePets() {
  const { pets: list, pet, selectPet, maxPets } = useAuth();
  const pets = list ?? (pet ? [pet] : []);
  return { pets, pet, selectPet: selectPet ?? (() => {}), canAdd: canAddPet(pets.length, maxPets) };
}
