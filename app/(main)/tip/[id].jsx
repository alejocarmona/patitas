import { ActivityIndicator, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TopBar from '../../../components/ui/TopBar';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import { fonts, theme } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useTips } from '../../../hooks/useTips';
import { useSavedTips } from '../../../hooks/useSavedTips';
import { saveTip, unsaveTip } from '../../../services/tips';
import { track } from '../../../services/analytics';

// Detalle de un tip (pantalla del Stack: /tip/<id>).
export default function TipDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const { tips, loading, error, reload } = useTips();
  const savedIds = useSavedTips(user?.uid);
  const tip = tips.find((t) => t.id === id);
  const saved = savedIds.includes(id);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/tips'));
  const toggle = async () => {
    try {
      if (saved) {
        await unsaveTip(user.uid, id);
        track.tipUnsaved();
      } else {
        await saveTip(user.uid, id);
        track.tipSaved(tip.category);
      }
    } catch {
      // el estado visual lo manda el listener; si falla no cambia
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar title={tip ? tip.title : 'Tip'} subtitle={tip ? `${tip.emoji}  ${tip.category}` : undefined} onBack={back} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 32 }} />
        ) : error ? (
          <EmptyState emoji="📡" title="No pudimos cargar el tip" subtitle="Revisa tu conexión e inténtalo de nuevo." actionLabel="Reintentar" onAction={reload} />
        ) : !tip ? (
          <EmptyState emoji="🔍" title="No encontramos este tip" subtitle="Puede que ya no esté disponible." actionLabel="Volver a Tips" onAction={back} />
        ) : (
          <>
            {tip.detail.map((line, i) => (
              <Text key={i} style={{ fontSize: 14, fontFamily: fonts.regular, color: theme.text, lineHeight: 22 }}>
                {line}
              </Text>
            ))}
            <View style={{ marginTop: 8 }}>
              <Button label={saved ? 'Guardado' : 'Guardar tip'} variant={saved ? 'outline' : 'primary'} onPress={toggle} />
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
