import { View } from 'react-native';
import TopBar from '../../../components/ui/TopBar';
import EmptyState from '../../../components/ui/EmptyState';
import { theme } from '../../../constants/theme';

// Fase 4: los tips se leerán de Firestore (colección `tips`).
export default function Tips() {
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar title="Tips de cuidado" subtitle="Consejos para tu mascota" />
      <EmptyState emoji="💡" title="Muy pronto" subtitle="Aquí encontrarás consejos para cuidar mejor a tu mascota." />
    </View>
  );
}
