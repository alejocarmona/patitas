import { ActivityIndicator, Linking, RefreshControl, ScrollView, Text, View } from 'react-native';
import TopBar from '../../../components/ui/TopBar';
import EmptyState from '../../../components/ui/EmptyState';
import VetCard from '../../../components/directorio/VetCard';
import { fonts, theme } from '../../../constants/theme';
import { useNearbyVets } from '../../../hooks/useNearbyVets';

// Veterinarias cercanas (Google Places API New). Ver CLAUDE.md §7.
export default function Directorio() {
  const { status, vets, refreshing, refresh, retry } = useNearbyVets();

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar
        title="Veterinarias cerca"
        subtitle={status === 'ready' ? 'Usando tu ubicación actual 📍' : 'Encuentra la más cercana'}
        color={theme.secondary}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}
        refreshControl={status === 'ready' ? <RefreshControl refreshing={refreshing} onRefresh={refresh} /> : undefined}
      >
        {status === 'loading' ? (
          <ActivityIndicator color={theme.secondary} style={{ marginTop: 32 }} />
        ) : status === 'denied' ? (
          <EmptyState
            emoji="📍"
            title="Necesitamos tu ubicación"
            subtitle="Solo la usamos para mostrarte las veterinarias más cercanas. Puedes activarla en los ajustes de tu teléfono."
            actionLabel="Abrir ajustes"
            onAction={() => Linking.openSettings().catch(() => {})}
          />
        ) : status === 'no_key' ? (
          <EmptyState emoji="🛠️" title="Directorio no disponible por ahora" subtitle="Estamos trabajando para traerte las veterinarias cercanas muy pronto." />
        ) : status === 'error' ? (
          <EmptyState emoji="📡" title="No pudimos cargar las veterinarias" subtitle="Revisa tu conexión y que la ubicación esté activada." actionLabel="Reintentar" onAction={retry} />
        ) : vets.length === 0 ? (
          <EmptyState emoji="🔍" title="No encontramos veterinarias cerca" subtitle="Prueba de nuevo en otro lugar." actionLabel="Reintentar" onAction={refresh} />
        ) : (
          <>
            <Text style={{ fontSize: 13, fontFamily: fonts.semibold, color: theme.textMuted }}>
              {vets.length} {vets.length === 1 ? 'resultado' : 'resultados'} cerca de ti
            </Text>
            {vets.map((v) => (
              <VetCard key={v.id} vet={v} />
            ))}
            <Text style={{ fontSize: 12, fontFamily: fonts.regular, color: theme.textSubtle, textAlign: 'center', marginTop: 8 }}>
              Resultados de Google
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}
