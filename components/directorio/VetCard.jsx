import { Linking, Pressable, Text, View } from 'react-native';
import { fonts, theme } from '../../constants/theme';
import { formatDistance, mapsDirectionsUrl, telUrl } from '../../utils/geo';
import { track } from '../../services/analytics';

function ActionButton({ label, onPress, filled }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={{
        flex: 1,
        alignItems: 'center',
        paddingVertical: 14,
        minHeight: 48,
        justifyContent: 'center',
        borderRadius: 12,
        backgroundColor: filled ? theme.secondary : 'transparent',
        borderWidth: 1.5,
        borderColor: theme.secondary,
      }}
    >
      <Text style={{ fontSize: 13, fontFamily: fonts.bold, color: filled ? '#fff' : theme.secondary }}>{label}</Text>
    </Pressable>
  );
}

export default function VetCard({ vet }) {
  const tel = telUrl(vet.phone);
  const openColor = vet.open ? theme.success : theme.textMuted;
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 20, borderWidth: 1.5, borderColor: theme.border, padding: 16, gap: 8, elevation: 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ flex: 1, fontSize: 14, fontFamily: fonts.extrabold, color: theme.text }}>{vet.name}</Text>
        {vet.distanceKm != null ? (
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.secondary }}>{formatDistance(vet.distanceKm)}</Text>
        ) : null}
      </View>
      {vet.address ? (
        <Text style={{ fontSize: 12, fontFamily: fonts.regular, color: theme.textMuted }}>📍 {vet.address}</Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {vet.rating != null ? (
          <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.text }}>
            ★ {String(vet.rating).replace('.', ',')}
            {vet.reviews != null ? ` (${vet.reviews})` : ''}
          </Text>
        ) : null}
        {vet.open != null ? (
          <View style={{ backgroundColor: `${openColor}22`, borderRadius: 20, paddingVertical: 3, paddingHorizontal: 10 }}>
            <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: openColor }}>{vet.open ? '● Abierto' : '● Cerrado'}</Text>
          </View>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
        {tel ? (
          <ActionButton
            label="Llamar"
            filled
            onPress={() => {
              track.vetCall();
              Linking.openURL(tel).catch(() => {});
            }}
          />
        ) : null}
        <ActionButton
          label="Cómo llegar"
          filled={!tel}
          onPress={() => {
            track.vetDirections();
            Linking.openURL(mapsDirectionsUrl(vet)).catch(() => {});
          }}
        />
      </View>
    </View>
  );
}
