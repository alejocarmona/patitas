import { Pressable, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { fonts, theme } from '../../constants/theme';

export default function TipCard({ tip, saved, onOpen, onToggleSave }) {
  return (
    <View
      style={{
        backgroundColor: '#fff',
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: saved ? `${theme.primary}50` : theme.border,
        overflow: 'hidden',
        elevation: 1,
      }}
    >
      <Pressable onPress={onOpen} accessibilityRole="button" accessibilityLabel={`Abrir tip: ${tip.title}`} style={{ padding: 16, paddingBottom: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Text style={{ fontSize: 20 }}>{tip.emoji}</Text>
          <View style={{ backgroundColor: `${theme.primary}15`, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: theme.primary }}>{tip.category}</Text>
          </View>
        </View>
        <Text style={{ fontSize: 15, fontFamily: fonts.extrabold, color: theme.text, marginBottom: 6, lineHeight: 20 }}>{tip.title}</Text>
        <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted, lineHeight: 19 }}>{tip.excerpt}</Text>
      </Pressable>
      <View style={{ borderTopWidth: 1, borderTopColor: theme.border, paddingVertical: 10, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center' }}>
        <Pressable onPress={onToggleSave} accessibilityRole="button" accessibilityLabel={saved ? 'Quitar de guardados' : 'Guardar tip'} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Feather name="bookmark" size={15} color={saved ? theme.primary : theme.textMuted} />
          <Text style={{ fontSize: 13, fontFamily: fonts.bold, color: saved ? theme.primary : theme.textMuted }}>{saved ? 'Guardado' : 'Guardar'}</Text>
        </Pressable>
        <Text style={{ marginLeft: 'auto', fontSize: 12, fontFamily: fonts.semibold, color: theme.textLight }}>Leer más →</Text>
      </View>
    </View>
  );
}
