import { createContext, useContext } from 'react';

// Estado global de sesión: { user, pet, onboardingSeen, loading, setOnboardingSeen }
export const AuthContext = createContext({
  user: null,
  pet: null,
  onboardingSeen: false,
  loading: true,
  setOnboardingSeen: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
