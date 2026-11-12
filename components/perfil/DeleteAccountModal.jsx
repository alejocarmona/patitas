import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Text, TextInput, View } from 'react-native';
import Button from '../ui/Button';
import { fonts, theme } from '../../constants/theme';

export const CONFIRM_WORD = 'ELIMINAR';

// Segunda confirmación explícita: hay que escribir ELIMINAR (y la contraseña si ingresó con correo).
export default function DeleteAccountModal({ visible, needsPassword, busy, error, onCancel, onConfirm }) {
  const [word, setWord] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!visible) {
      setWord('');
      setPassword('');
    }
  }, [visible]);

  const ready = word.trim().toUpperCase() === CONFIRM_WORD && (!needsPassword || password.length > 0);

  const input = {
    borderWidth: 2,
    borderColor: theme.border,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: fonts.regular,
    color: theme.text,
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={busy ? undefined : onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, backgroundColor: 'rgba(26,26,46,0.55)', justifyContent: 'center', padding: 24 }}
      >
        <View style={{ backgroundColor: theme.bg, borderRadius: 20, padding: 20, gap: 12 }}>
          <Text style={{ fontSize: 18, fontFamily: fonts.extrabold, color: theme.text }}>Confirma que quieres eliminar tu cuenta</Text>
          <Text style={{ fontSize: 14, fontFamily: fonts.regular, color: theme.textMuted }}>
            {`Escribe ${CONFIRM_WORD} para confirmar. Esta acción es permanente.`}
          </Text>
          <TextInput
            value={word}
            onChangeText={setWord}
            placeholder={CONFIRM_WORD}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!busy}
            accessibilityLabel="Escribe ELIMINAR"
            style={input}
          />
          {needsPassword ? (
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Tu contraseña"
              secureTextEntry
              autoCapitalize="none"
              editable={!busy}
              accessibilityLabel="Tu contraseña"
              style={input}
            />
          ) : (
            <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>
              Es posible que te pidamos elegir de nuevo tu cuenta de Google para verificar que eres tú.
            </Text>
          )}
          {error ? <Text style={{ color: theme.danger, fontSize: 13, fontFamily: fonts.medium }}>{error}</Text> : null}
          <Button
            label="Eliminar definitivamente"
            variant="danger"
            disabled={!ready}
            loading={busy}
            onPress={() => onConfirm({ password })}
          />
          <Button label="Cancelar" variant="outline" disabled={busy} onPress={onCancel} />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
