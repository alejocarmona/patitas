import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, theme } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';
import { track } from '../services/analytics';

const STEPS = [
  {
    emoji: '🐾',
    title: 'Todo lo de tu mascota,\nen un lugar',
    sub: 'Cartilla digital, vacunas, veterinarios cercanos y más.',
    bg: '#FFF3EE',
  },
  {
    emoji: '💉',
    title: 'Que a tu mascota\nno se le pase una vacuna',
    sub: 'Recibe recordatorios antes de cada cita médica.',
    bg: '#EEF7F2',
  },
  {
    emoji: '📍',
    title: 'Veterinarias cerca\nde ti',
    sub: 'Encuentra el más cercano y llega directo desde la app.',
    bg: '#FFF8EE',
  },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const { setOnboardingSeen } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const s = STEPS[step];
  const last = step === STEPS.length - 1;

  const finish = async (skipped) => {
    track.onboardingCompleted(skipped);
    await setOnboardingSeen();
    router.replace('/');
  };

  return (
    <View style={{ flex: 1, backgroundColor: s.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
        <Text style={{ fontSize: 72, marginBottom: 24 }}>{s.emoji}</Text>
        <Text
          style={{
            fontSize: 26,
            fontFamily: fonts.extrabold,
            color: theme.text,
            textAlign: 'center',
            lineHeight: 33,
            marginBottom: 16,
          }}
        >
          {s.title}
        </Text>
        <Text
          style={{
            fontSize: 15,
            fontFamily: fonts.regular,
            color: theme.textMuted,
            textAlign: 'center',
            lineHeight: 24,
          }}
        >
          {s.sub}
        </Text>
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 32 }}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === step ? theme.primary : theme.border,
              }}
            />
          ))}
        </View>
      </View>
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 24, gap: 12 }}>
        <Pressable
          onPress={last ? () => finish(false) : () => setStep(step + 1)}
          style={{
            backgroundColor: theme.primaryStrong,
            borderRadius: 16,
            paddingVertical: 16,
            alignItems: 'center',
            elevation: 4,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: fonts.bold }}>
            {last ? 'Comenzar' : 'Siguiente'}
          </Text>
        </Pressable>
        {!last && (
          <Pressable onPress={() => finish(true)} style={{ paddingVertical: 8, alignItems: 'center' }}>
            <Text style={{ color: theme.textMuted, fontSize: 14, fontFamily: fonts.semibold }}>Omitir</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
