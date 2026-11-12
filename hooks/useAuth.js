import { createContext, useContext } from 'react';

// Estado global de sesión: { user, pet, onboardingSeen, loading, analyticsEnabled, setOnboardingSeen }
export const AuthContext = createContext({
  user: null,
  pet: null,
  onboardingSeen: false,
  loading: true,
  analyticsEnabled: true,
  setOnboardingSeen: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}
