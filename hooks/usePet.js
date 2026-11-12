import { useAuth } from './useAuth';

// Mascota del usuario (un solo pet por usuario en MVP). Viene del AuthProvider,
// que la escucha con onSnapshot (where userId == uid, limit 1).
export function usePet() {
  const { pet } = useAuth();
  return pet;
}
