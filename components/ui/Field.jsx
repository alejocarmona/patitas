import { Text, TextInput, View } from 'react-native';
import { fonts, theme } from '../../constants/theme';

export default function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  multiline = false,
  maxLength,
  error,
}) {
  return (
    <View>
      {label ? (
        <Text
          style={{
            fontSize: 12,
            fontFamily: fonts.bold,
            color: theme.textMuted,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textLight}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        multiline={multiline}
        maxLength={maxLength}
        textAlignVertical={multiline ? 'top' : 'center'}
        style={{
          backgroundColor: '#fff',
          borderWidth: 2,
          borderColor: error ? theme.danger : theme.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          paddingVertical: 13,
          fontSize: 15,
          fontFamily: fonts.semibold,
          color: theme.text,
          minHeight: multiline ? 90 : undefined,
        }}
      />
      {error ? (
        <Text style={{ color: theme.danger, fontSize: 12, fontFamily: fonts.medium, marginTop: 4 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
