import { View } from 'react-native';
import TopBar from '../../../components/ui/TopBar';
import EmptyState from '../../../components/ui/EmptyState';
import { theme } from '../../../constants/theme';

// P2: veterinarias cercanas con Google Places API (New). Ver CLAUDE.md §7.
export default function Directorio() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar title="Veterinarios cerca" subtitle="Encuentra el más cercano" color={theme.secondary} />
      <EmptyState emoji="📍" title="Muy pronto" subtitle="Pronto podrás encontrar veterinarios cerca de ti y llegar directo desde la app." />
    </View>
  );
}
