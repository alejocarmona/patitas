import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import AuthProvider from '../components/AuthProvider';
import { useAuth } from '../hooks/useAuth';

SplashScreen.preventAutoHideAsync().catch(() => {});

// Navegación declarativa por estado de sesión:
//   sin sesión, sin onboarding  -> onboarding
//   sin sesión, onboarding visto -> login
//   con sesión, sin mascota      -> crear-mascota
//   con sesión y mascota         -> (main) tabs
// `index` es la única ruta siempre accesible y decide con <Redirect> (app/index.jsx).
function Navigator({ fontsReady }) {
  const { user, pet, onboardingSeen, loading } = useAuth();

  useEffect(() => {
    if (fontsReady && !loading) SplashScreen.hideAsync().catch(() => {});
  }, [fontsReady, loading]);

  if (!fontsReady || loading) return null;

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!user && !onboardingSeen}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!user && !pet}>
        <Stack.Screen name="crear-mascota" />
      </Stack.Protected>
      <Stack.Protected guard={!!user && !!pet}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
    Inter_900Black,
  });

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <Navigator fontsReady={fontsLoaded || !!fontError} />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
