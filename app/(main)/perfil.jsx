import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TopBar from '../../components/ui/TopBar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DeleteAccountModal from '../../components/perfil/DeleteAccountModal';
import { fonts, theme } from '../../constants/theme';
import { URL_PRIVACIDAD, URL_TERMINOS } from '../../constants/legal';
import { useAuth } from '../../hooks/useAuth';
import { authErrorMessage, saveAnalyticsPreference, signOut } from '../../services/auth';
import { authProviderOf } from '../../utils/authProvider';
import { deleteAccount } from '../../services/accountDeletion';

function LegalRow({ label, url, testID }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="link"
      onPress={() =>
        Linking.openURL(url).catch(() =>
          Alert.alert('No se pudo abrir el enlace', 'Revisa tu conexión e inténtalo de nuevo.')
        )
      }
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 }}
    >
      <Text style={{ fontSize: 15, fontFamily: fonts.semibold, color: theme.text }}>{label}</Text>
      <Feather name="external-link" size={18} color={theme.textMuted} />
    </Pressable>
  );
}

export default function Perfil() {
  const { user, pet, analyticsEnabled } = useAuth();
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [stats, setStats] = useState(analyticsEnabled !== false);

  useEffect(() => {
    setStats(analyticsEnabled !== false);
  }, [analyticsEnabled]);

  const toggleStats = async (value) => {
    setStats(value);
    try {
      await saveAnalyticsPreference(user.uid, value);
    } catch {
      setStats(!value);
      Alert.alert('No se pudo guardar', 'Revisa tu conexión e inténtalo de nuevo.');
    }
  };

  const confirmSignOut = () =>
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Cerrar sesión', style: 'destructive', onPress: () => signOut().catch(() => Alert.alert('No se pudo cerrar sesión')) },
    ]);

  // Primer paso: aviso con lo que se borra. El segundo paso (escribir ELIMINAR) es el modal.
  const startDelete = () =>
    Alert.alert(
      '¿Eliminar tu cuenta?',
      'Es permanente y no se puede deshacer. Vamos a borrar tu cuenta, el perfil de tu mascota, toda su cartilla (vacunas, pesos y medicinas), tus tips guardados y tus recordatorios.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Continuar',
          style: 'destructive',
          onPress: () => {
            setDeleteError('');
            setDeleting(true);
          },
        },
      ]
    );

  const runDelete = async ({ password }) => {
    setBusy(true);
    setDeleteError('');
    try {
      await deleteAccount(user, { password });
      setBusy(false);
      setDeleting(false);
      Alert.alert('Cuenta eliminada', 'Eliminamos tu cuenta y tus datos. Gracias por haber usado Patitas.');
    } catch (e) {
      setBusy(false);
      setDeleteError(authErrorMessage(e));
    }
  };

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

        <Card style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase' }}>Privacidad</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text style={{ flex: 1, fontSize: 15, fontFamily: fonts.semibold, color: theme.text }}>Compartir estadísticas de uso</Text>
            <Switch
              testID="switch-estadisticas"
              accessibilityLabel="Compartir estadísticas de uso"
              value={stats}
              onValueChange={toggleStats}
              trackColor={{ true: theme.primary }}
            />
          </View>
          <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>
            Eventos de uso sin tu nombre, tu correo ni el nombre de tu mascota. Puedes cambiarlo cuando quieras.
          </Text>
        </Card>

        <Card style={{ gap: 0 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase' }}>Legal</Text>
          <LegalRow label="Política de privacidad" url={URL_PRIVACIDAD} testID="legal-privacidad" />
          <View style={{ height: 1, backgroundColor: theme.border }} />
          <LegalRow label="Términos y condiciones" url={URL_TERMINOS} testID="legal-terminos" />
        </Card>

        <View style={{ marginTop: 16 }}>
          <Button label="Eliminar cuenta" onPress={startDelete} variant="outline" color={theme.danger} />
        </View>
      </ScrollView>

      <DeleteAccountModal
        visible={deleting}
        needsPassword={authProviderOf(user) === 'password'}
        busy={busy}
        error={deleteError}
        onCancel={() => setDeleting(false)}
        onConfirm={runDelete}
      />
    </View>
  );
}
