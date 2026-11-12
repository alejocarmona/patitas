import { Alert, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import TopBar from '../../components/ui/TopBar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { fonts, theme } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { signOut } from '../../services/auth';

export default function Perfil() {
  const { user, pet } = useAuth();
  const router = useRouter();

  const confirmSignOut = () =>
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut().catch(() => Alert.alert('No se pudo cerrar sesión')) },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar title="Mi perfil" subtitle="Tu cuenta y la de tu mascota" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Card style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase' }}>Cuenta</Text>
          <Text style={{ fontSize: 16, fontFamily: fonts.extrabold, color: theme.text }}>{user?.displayName || 'Sin nombre'}</Text>
          <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>{user?.email}</Text>
        </Card>
        {pet ? <Button label={`Editar perfil de ${pet.name}`} onPress={() => router.push('/edit-pet')} variant="outline" /> : null}
        <Button label="Cerrar sesión" onPress={confirmSignOut} variant="danger" />
      </ScrollView>
    </View>
  );
}
