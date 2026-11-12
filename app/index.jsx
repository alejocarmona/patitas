import { Redirect } from 'expo-router';
import { useAuth } from '../hooks/useAuth';

// Punto de entrada: redirección declarativa según el estado de sesión.
export default function Index() {
  const { user, pet, onboardingSeen } = useAuth();
  if (!user) return <Redirect href={onboardingSeen ? '/login' : '/onboarding'} />;
  if (!pet) return <Redirect href="/crear-mascota" />;
  return <Redirect href="/home" />;
}
