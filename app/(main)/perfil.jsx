import { useEffect, useState } from 'react';
import { Alert, Image, Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import TopBar from '../../components/ui/TopBar';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import DeleteAccountModal from '../../components/perfil/DeleteAccountModal';
import { fonts, theme } from '../../constants/theme';
import { CONTACT_EMAIL, URL_PRIVACIDAD, URL_TERMINOS } from '../../constants/legal';
import { contactUrl } from '../../utils/contact';
import { track } from '../../services/analytics';
import { useAuth } from '../../hooks/useAuth';
import { usePets } from '../../hooks/usePet';
import { getAvatar } from '../../constants/avatars';
import { authErrorMessage, saveAnalyticsPreference, signOut } from '../../services/auth';
import { authProviderOf } from '../../utils/authProvider';
import { deleteAccount } from '../../services/accountDeletion';
import { openLegalUrl } from '../../services/browser';

function LegalRow({ label, url, testID }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="link"
      onPress={() => openLegalUrl(url)}
      style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 48 }}
    >
      <Text style={{ fontSize: 15, fontFamily: fonts.semibold, color: theme.text }}>{label}</Text>
      <Feather name="external-link" size={18} color={theme.textMuted} />
    </Pressable>
  );
}

// Fila de acción dentro de una tarjeta (mismo patrón que Ayuda y Legal): evita apilar botones a todo el ancho.
function ActionRow({ icon, label, onPress, color = theme.text, testID }) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 }}
    >
      <Feather name={icon} size={18} color={color} />
      <Text style={{ flex: 1, fontSize: 15, fontFamily: fonts.semibold, color }}>{label}</Text>
    </Pressable>
  );
}

async function openContact() {
  track.contactOpened();
  try {
    const url = contactUrl();
    if (!(await Linking.canOpenURL(url))) throw new Error('no-mail-app');
    await Linking.openURL(url);
  } catch {
    Alert.alert('Escríbenos', `No pudimos abrir tu correo. Escríbenos a ${CONTACT_EMAIL}`);
  }
}

export default function Perfil() {
  const { user, analyticsEnabled } = useAuth();
  const { pets, pet, selectPet, canAdd } = usePets();
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
      'Es permanente y no se puede deshacer. Vamos a borrar tu cuenta, el perfil de tus mascotas, toda su cartilla (vacunas, pesos y medicinas), tus tips guardados y tus recordatorios.',
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
      <TopBar
        title="Mi perfil"
        subtitle="Tu cuenta y tus mascotas"
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
      />
      <ScrollView contentContainerStyle={{ padding: 20, gap: 14 }}>
        <Card style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase' }}>
            {pets.length > 1 ? 'Mis mascotas' : 'Mi mascota'}
          </Text>
          {pets.map((p) => (
            <Pressable
              key={p.id}
              testID={`perfil-pet-${p.id}`}
              accessibilityRole="button"
              accessibilityLabel={`Editar perfil de ${p.name}`}
              onPress={() => {
                selectPet(p.id);
                router.push('/edit-pet');
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56 }}
            >
              <Image source={getAvatar(p.avatarId).source} style={{ width: 40, height: 40, borderRadius: 12 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontFamily: fonts.bold, color: theme.text }}>{p.name}</Text>
                {pets.length > 1 && p.id === pet?.id ? (
                  <Text style={{ fontSize: 12, fontFamily: fonts.semibold, color: theme.textMuted }}>La que estás viendo</Text>
                ) : null}
              </View>
              <Feather name="edit-2" size={16} color={theme.textMuted} />
            </Pressable>
          ))}
          {canAdd ? (
            <>
              <View style={{ height: 1, backgroundColor: theme.border }} />
              <ActionRow icon="plus" label="Agregar mascota" color={theme.secondary} onPress={() => router.push('/agregar-mascota')} testID="agregar-mascota" />
            </>
          ) : null}
        </Card>
        <Card style={{ gap: 4 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase' }}>Cuenta</Text>
          <Text style={{ fontSize: 16, fontFamily: fonts.extrabold, color: theme.text }}>{user?.displayName || 'Sin nombre'}</Text>
          <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>{user?.email}</Text>
          <View style={{ height: 1, backgroundColor: theme.border, marginTop: 8 }} />
          <ActionRow icon="log-out" label="Cerrar sesión" onPress={confirmSignOut} testID="cerrar-sesion" />
        </Card>

        <Card style={{ gap: 6 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase' }}>Privacidad</Text>
          <Pressable
            onPress={() => toggleStats(!stats)}
            accessible={false}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, minHeight: 48 }}
          >
            <Text style={{ flex: 1, fontSize: 15, fontFamily: fonts.semibold, color: theme.text }}>Compartir estadísticas de uso</Text>
            <Switch
              testID="switch-estadisticas"
              accessibilityLabel="Compartir estadísticas de uso"
              value={stats}
              onValueChange={toggleStats}
              thumbColor="#FFFFFF"
              trackColor={{ true: theme.secondary, false: theme.switchOff }}
            />
          </Pressable>
          <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>
            Eventos de uso sin tu nombre, tu correo ni el nombre de tu mascota. Puedes cambiarlo cuando quieras.
          </Text>
        </Card>

        <Card style={{ gap: 0 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase' }}>Ayuda</Text>
          <Pressable
            testID="escribenos"
            accessibilityRole="link"
            onPress={openContact}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 56, gap: 12 }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: fonts.semibold, color: theme.text }}>Escríbenos</Text>
              <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>Dudas, ideas o problemas con la app</Text>
            </View>
            <Feather name="mail" size={18} color={theme.textMuted} />
          </Pressable>
        </Card>

        <Card style={{ gap: 0 }}>
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase' }}>Legal</Text>
          <LegalRow label="Política de privacidad" url={URL_PRIVACIDAD} testID="legal-privacidad" />
          <View style={{ height: 1, backgroundColor: theme.border }} />
          <LegalRow label="Términos y condiciones" url={URL_TERMINOS} testID="legal-terminos" />
        </Card>

        <View style={{ marginTop: 8, alignItems: 'center' }}>
          <Button label="Eliminar cuenta" onPress={startDelete} variant="text" color={theme.danger} full={false} />
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
