import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Linking, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import { fonts, theme } from '../constants/theme';
import { URL_PRIVACIDAD, URL_TERMINOS } from '../constants/legal';
import {
  authErrorMessage,
  loginWithEmail,
  loginWithGoogle,
  registerWithEmail,
  resetPassword,
} from '../services/auth';

const openLegal = (url) =>
  Linking.openURL(url).catch(() => Alert.alert('No se pudo abrir el enlace', 'Revisa tu conexión e inténtalo de nuevo.'));

// mode: 'choose' | 'login' | 'register' | 'reset'
export default function Login() {
  const insets = useSafeAreaInsets();
  const [mode, setMode] = useState('choose');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const go = (m) => {
    setMode(m);
    setError('');
  };

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      await fn();
    } catch (e) {
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const onGoogle = () => run(() => loginWithGoogle());

  const onSubmit = () => {
    const mail = email.trim();
    if (!mail) return setError('Escribe tu correo.');
    if (mode === 'reset') {
      return run(async () => {
        await resetPassword(mail);
        Alert.alert('Revisa tu correo', 'Te enviamos un enlace para crear una nueva contraseña.');
        go('login');
      });
    }
    if (!password) return setError('Escribe tu contraseña.');
    if (mode === 'register') {
      if (password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.');
      return run(() => registerWithEmail(name.trim(), mail, password));
    }
    return run(() => loginWithEmail(mail, password));
  };

  const title =
    mode === 'register' ? 'Crea tu cuenta' : mode === 'reset' ? 'Recupera tu contraseña' : 'Ingresa con tu correo';

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: theme.bg }} behavior="padding">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          paddingHorizontal: 32,
          paddingTop: insets.top + 24,
          paddingBottom: insets.bottom + 24,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 28 }}>
          <View
            style={{
              width: 72,
              height: 72,
              backgroundColor: theme.primary,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              elevation: 6,
            }}
          >
            <Text style={{ fontSize: 36 }}>🐾</Text>
          </View>
          <Text style={{ fontSize: 28, fontFamily: fonts.black, color: theme.text, marginBottom: 6 }}>Patitas</Text>
          <Text style={{ fontSize: 14, fontFamily: fonts.regular, color: theme.textMuted, textAlign: 'center' }}>
            Todo lo de tu mascota, siempre contigo
          </Text>
        </View>

        {mode === 'choose' ? (
          <View style={{ gap: 12 }}>
            <Pressable
              onPress={onGoogle}
              disabled={busy}
              style={{
                backgroundColor: '#fff',
                borderWidth: 2,
                borderColor: theme.border,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                opacity: busy ? 0.6 : 1,
              }}
            >
              <Feather name="log-in" size={20} color={theme.text} />
              <Text style={{ fontSize: 15, fontFamily: fonts.semibold, color: theme.text }}>Continuar con Google</Text>
            </Pressable>
            <Pressable
              onPress={() => go('login')}
              style={{
                backgroundColor: '#fff',
                borderWidth: 2,
                borderColor: theme.border,
                borderRadius: 14,
                paddingVertical: 14,
                paddingHorizontal: 20,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <Feather name="mail" size={20} color={theme.text} />
              <Text style={{ fontSize: 15, fontFamily: fonts.semibold, color: theme.text }}>Continuar con correo</Text>
            </Pressable>
            <View style={{ marginVertical: 4, alignItems: 'center' }}>
              <View style={{ height: 1, backgroundColor: theme.border, alignSelf: 'stretch', position: 'absolute', top: 8 }} />
              <Text style={{ backgroundColor: theme.bg, paddingHorizontal: 12, fontSize: 12, color: theme.textMuted, fontFamily: fonts.regular }}>o</Text>
            </View>
            <Button label="Crear mi cuenta" onPress={() => go('register')} />
            {error ? <Text style={{ color: theme.danger, fontSize: 13, fontFamily: fonts.medium, textAlign: 'center' }}>{error}</Text> : null}
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            <Text style={{ fontSize: 18, fontFamily: fonts.extrabold, color: theme.text }}>{title}</Text>
            {mode === 'register' && (
              <Field label="Tu nombre" value={name} onChangeText={setName} placeholder="¿Cómo te llamas?" autoComplete="name" />
            )}
            <Field
              label="Correo"
              value={email}
              onChangeText={setEmail}
              placeholder="tucorreo@ejemplo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            {mode !== 'reset' && (
              <Field
                label="Contraseña"
                value={password}
                onChangeText={setPassword}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                autoCapitalize="none"
              />
            )}
            {error ? <Text style={{ color: theme.danger, fontSize: 13, fontFamily: fonts.medium }}>{error}</Text> : null}
            <Button
              label={mode === 'register' ? 'Crear cuenta' : mode === 'reset' ? 'Enviar enlace' : 'Ingresar'}
              onPress={onSubmit}
              loading={busy}
            />
            {mode === 'login' && (
              <Pressable onPress={() => go('reset')} style={{ alignItems: 'center', paddingVertical: 4 }}>
                <Text style={{ color: theme.primary, fontSize: 13, fontFamily: fonts.bold }}>¿Olvidaste tu contraseña?</Text>
              </Pressable>
            )}
            {mode !== 'register' ? (
              <Pressable onPress={() => go('register')} style={{ alignItems: 'center', paddingVertical: 4 }}>
                <Text style={{ color: theme.textMuted, fontSize: 13, fontFamily: fonts.semibold }}>
                  ¿No tienes cuenta? <Text style={{ color: theme.primary, fontFamily: fonts.bold }}>Regístrate</Text>
                </Text>
              </Pressable>
            ) : (
              <Pressable onPress={() => go('login')} style={{ alignItems: 'center', paddingVertical: 4 }}>
                <Text style={{ color: theme.textMuted, fontSize: 13, fontFamily: fonts.semibold }}>
                  ¿Ya tienes cuenta? <Text style={{ color: theme.primary, fontFamily: fonts.bold }}>Ingresa</Text>
                </Text>
              </Pressable>
            )}
            <Pressable onPress={() => go('choose')} style={{ alignItems: 'center', paddingVertical: 4 }}>
              <Text style={{ color: theme.textMuted, fontSize: 13, fontFamily: fonts.semibold }}>Volver</Text>
            </Pressable>
          </View>
        )}

        <Text style={{ textAlign: 'center', fontSize: 12, color: theme.textLight, fontFamily: fonts.regular, marginTop: 28 }}>
          Al continuar aceptas los{' '}
          <Text accessibilityRole="link" onPress={() => openLegal(URL_TERMINOS)} style={{ color: theme.primary, fontFamily: fonts.semibold }}>
            Términos
          </Text>{' '}
          y la{' '}
          <Text accessibilityRole="link" onPress={() => openLegal(URL_PRIVACIDAD)} style={{ color: theme.primary, fontFamily: fonts.semibold }}>
            Política de privacidad
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
