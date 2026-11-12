import { Text, View } from 'react-native';
import { fonts, theme } from '../../constants/theme';
import Button from './Button';

export default function EmptyState({ emoji = '🐾', title, subtitle, actionLabel, onAction }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 36, paddingHorizontal: 24, gap: 8 }}>
      <Text style={{ fontSize: 48 }}>{emoji}</Text>
      <Text style={{ fontSize: 16, fontFamily: fonts.extrabold, color: theme.text, textAlign: 'center' }}>
        {title}
      </Text>
      {subtitle ? (
        <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted, textAlign: 'center', lineHeight: 20 }}>
          {subtitle}
        </Text>
      ) : null}
      {actionLabel ? (
        <View style={{ marginTop: 12, alignSelf: 'stretch' }}>
          <Button label={actionLabel} onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}
