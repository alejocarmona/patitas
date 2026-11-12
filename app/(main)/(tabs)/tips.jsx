import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import TopBar from '../../../components/ui/TopBar';
import EmptyState from '../../../components/ui/EmptyState';
import TipCard from '../../../components/tips/TipCard';
import CategoryChip from '../../../components/tips/CategoryChip';
import { fonts, theme } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { usePet } from '../../../hooks/usePet';
import { useTips } from '../../../hooks/useTips';
import { useSavedTips } from '../../../hooks/useSavedTips';
import { saveTip, unsaveTip } from '../../../services/tips';
import { track } from '../../../services/analytics';
import { CATEGORIES, filterByCategory, visibleTips } from '../../../utils/tips';

const GUARDADOS = 'Guardados';

export default function Tips() {
  const pet = usePet();
  const { user } = useAuth();
  const router = useRouter();
  const { tips, loading, error, reload } = useTips();
  const savedIds = useSavedTips(user?.uid);
  const [cat, setCat] = useState('Todos');
  const [saveError, setSaveError] = useState(false);

  const visible = useMemo(() => visibleTips(tips, pet?.species), [tips, pet?.species]);
  const savedVisible = useMemo(() => visible.filter((t) => savedIds.includes(t.id)), [visible, savedIds]);
  const list = cat === GUARDADOS ? savedVisible : filterByCategory(visible, cat);

  const toggle = async (tip) => {
    const isSaved = savedIds.includes(tip.id);
    try {
      if (isSaved) {
        await unsaveTip(user.uid, tip.id);
        track.tipUnsaved();
      } else {
        await saveTip(user.uid, tip.id);
        track.tipSaved(tip.category);
      }
      setSaveError(false);
    } catch {
      setSaveError(true);
    }
  };

  if (!pet) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar
        title={`Tips para ${pet.name}`}
        subtitle="Toca un tip para leerlo completo"
        right={
          <Pressable
            onPress={() => { setSaveError(false); setCat(GUARDADOS); }}
            accessibilityRole="button"
            accessibilityLabel="Ver guardados"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}
          >
            <Text style={{ fontSize: 13 }}>🔖</Text>
            <Text style={{ color: '#fff', fontSize: 12, fontFamily: fonts.bold }}>{savedVisible.length}</Text>
          </Pressable>
        }
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 16 }}>
          {['Todos', ...CATEGORIES].map((c) => (
            <CategoryChip key={c} label={c} active={cat === c} onPress={() => { setSaveError(false); setCat(c); }} />
          ))}
          <CategoryChip
            label={`🔖 Guardados (${savedVisible.length})`}
            active={cat === GUARDADOS}
            outlined
            onPress={() => { setSaveError(false); setCat(GUARDADOS); }}
          />
        </ScrollView>
      </TopBar>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        {saveError ? (
          <Text style={{ color: theme.danger, fontFamily: fonts.semibold, fontSize: 12, textAlign: 'center' }}>
            No se pudo actualizar tus guardados. Revisa tu conexión e intenta de nuevo.
          </Text>
        ) : null}
        {loading ? (
          <ActivityIndicator color={theme.primary} style={{ marginTop: 32 }} />
        ) : error ? (
          <EmptyState emoji="📡" title="No pudimos cargar los tips" subtitle="Revisa tu conexión e inténtalo de nuevo." actionLabel="Reintentar" onAction={reload} />
        ) : cat === GUARDADOS && list.length === 0 ? (
          <EmptyState
            emoji="🔖"
            title="Sin tips guardados aún"
            subtitle="Guarda los consejos que más te sirvan para tenerlos siempre a mano."
            actionLabel="Ver todos los tips"
            onAction={() => setCat('Todos')}
          />
        ) : list.length === 0 ? (
          <EmptyState emoji="💡" title="Aún no hay tips aquí" subtitle="Pronto sumaremos más consejos para cuidar mejor a tu mascota." />
        ) : (
          list.map((tip) => (
            <TipCard
              key={tip.id}
              tip={tip}
              saved={savedIds.includes(tip.id)}
              onOpen={() => {
                track.tipOpened(tip.category);
                router.push(`/tip/${tip.id}`);
              }}
              onToggleSave={() => toggle(tip)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}
