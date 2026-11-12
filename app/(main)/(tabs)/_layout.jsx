import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, theme } from '../../../constants/theme';

// 4 pestañas visibles. La barra respeta el inset inferior (gestos de Android).
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 8);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.bold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: theme.border,
          height: 56 + bottom,
          paddingBottom: bottom,
          paddingTop: 6,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{ title: 'Inicio', tabBarIcon: ({ color, size }) => <Feather name="home" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="cartilla"
        options={{ title: 'Cartilla', tabBarIcon: ({ color, size }) => <Feather name="activity" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="tips"
        options={{ title: 'Tips', tabBarIcon: ({ color, size }) => <Feather name="info" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="directorio"
        options={{ title: 'Vets', tabBarIcon: ({ color, size }) => <Feather name="map-pin" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
