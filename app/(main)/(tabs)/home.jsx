import { useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Card from '../../../components/ui/Card';
import { getAvatar } from '../../../constants/avatars';
import { fonts, theme } from '../../../constants/theme';
import { useAuth } from '../../../hooks/useAuth';
import { useMedicinas } from '../../../hooks/useMedicinas';
import { usePet } from '../../../hooks/usePet';
import { usePeso } from '../../../hooks/usePeso';
import { useVacunas } from '../../../hooks/useVacunas';
import { track } from '../../../services/analytics';
import { daysUntil, formatAge, formatDateEs } from '../../../utils/vacunaStatus';

function ageLabel(pet) {
  const a = formatAge(pet.birthdate);
  return [pet.species, pet.breed, a].filter(Boolean).join(' · ');
}

export default function Home() {
  const { user } = useAuth();
  const pet = usePet();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { vacunas, loading: lv } = useVacunas(pet?.id);
  const { pesos } = usePeso(pet?.id);
  const { medicinas } = useMedicinas(pet?.id);

  const overdue = vacunas.filter((v) => v.status === 'vencida');
  const upcoming = vacunas.filter((v) => v.status === 'ok' || v.status === 'pronto'); // ya ordenadas por nextDate; las completas no cuentan
  const alertVaccine = overdue[0] ?? upcoming[0] ?? null;

  useEffect(() => {
    if (!lv && overdue.length > 0) track.overdueVaccineSeen();
  }, [lv, overdue.length]);

  if (!pet) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.bg }}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  const firstName = (user?.displayName ?? '').split(' ')[0];
  const quick = [
    { icon: '💉', label: 'Vacunas', go: () => router.push({ pathname: '/cartilla', params: { tab: 'vacunas' } }) },
    { icon: '⚖️', label: 'Peso', go: () => router.push({ pathname: '/cartilla', params: { tab: 'peso' } }) },
    { icon: '💊', label: 'Medicinas', go: () => router.push({ pathname: '/cartilla', params: { tab: 'medicinas' } }) },
    { icon: '📍', label: 'Vets cerca', go: () => router.push('/directorio') },
  ];
  const lastPeso = pesos[0];
  const activeMeds = medicinas.filter((m) => m.active).length;
  const allGood = !lv && vacunas.length > 0 && overdue.length === 0;

  const diff = alertVaccine ? daysUntil(alertVaccine.nextDate) : null;
  const when =
    diff === null ? '' : diff < 0 ? `venció hace ${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'día' : 'días'}` : diff === 0 ? 'es hoy' : `en ${diff} ${diff === 1 ? 'día' : 'días'}`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View
        style={{
          backgroundColor: theme.primary,
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 28,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: fonts.semibold, marginBottom: 2 }}>
              {firstName ? `Hola, ${firstName} 👋` : 'Hola 👋'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 22, fontFamily: fonts.black }}>¿Cómo está {pet.name} hoy?</Text>
          </View>
          <Pressable
            onPress={() => router.push('/perfil')}
            accessibilityLabel="Perfil"
            testID="perfil-btn"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: 10 }}
          >
            <Feather name="user" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={{ marginTop: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Image source={getAvatar(pet.avatarId).source} style={{ width: 60, height: 60, borderRadius: 18 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontFamily: fonts.extrabold, marginBottom: 2 }}>{pet.name}</Text>
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontFamily: fonts.regular }}>{ageLabel(pet)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            {allGood ? (
              <View style={{ backgroundColor: theme.success, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 }}>
                <Text style={{ color: '#fff', fontSize: 10, fontFamily: fonts.bold }}>Al día gracias a ti ✓</Text>
              </View>
            ) : null}
            <Pressable
              onPress={() => router.push('/edit-pet')}
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Feather name="edit-2" size={12} color="#fff" />
              <Text style={{ color: '#fff', fontSize: 11, fontFamily: fonts.bold }}>Editar</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={{ padding: 16, gap: 12 }}>
        {alertVaccine ? (
          <Pressable
            onPress={() => router.push({ pathname: '/cartilla', params: { tab: 'vacunas' } })}
            style={{
              backgroundColor: alertVaccine.status === 'vencida' ? `${theme.danger}14` : `${theme.accent}33`,
              borderWidth: 1.5,
              borderColor: alertVaccine.status === 'vencida' ? theme.danger : theme.accent,
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View style={{ width: 40, height: 40, backgroundColor: alertVaccine.status === 'vencida' ? theme.danger : theme.accent, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 20 }}>💉</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {alertVaccine.status === 'vencida' ? `${pet.name} necesita protección` : 'Próxima vacuna'}
              </Text>
              <Text style={{ fontSize: 14, fontFamily: fonts.extrabold, color: theme.text }}>{alertVaccine.name}</Text>
              <Text style={{ fontSize: 12, fontFamily: fonts.regular, color: theme.textMuted }}>
                {formatDateEs(alertVaccine.nextDate)} · {when}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textMuted} />
          </Pressable>
        ) : null}

        <Text style={{ fontSize: 14, fontFamily: fonts.extrabold, color: theme.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
          Acceso rápido
        </Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {quick.map((a) => (
            <Pressable
              key={a.label}
              onPress={a.go}
              style={{ flex: 1, backgroundColor: '#fff', borderWidth: 1.5, borderColor: theme.border, borderRadius: 16, paddingVertical: 14, alignItems: 'center', gap: 8 }}
            >
              <Text style={{ fontSize: 24 }}>{a.icon}</Text>
              <Text style={{ fontSize: 11, fontFamily: fonts.bold, color: theme.textMuted }}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={{ fontSize: 14, fontFamily: fonts.extrabold, color: theme.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 8 }}>
          Resumen de {pet.name}
        </Text>
        {[
          { icon: '⚖️', label: 'Peso actual', value: lastPeso ? `${lastPeso.value} kg` : 'Sin registro', sub: lastPeso ? formatDateEs(lastPeso.date) : '', color: theme.secondary },
          { icon: '💉', label: 'Vacunas registradas', value: `${vacunas.length}`, sub: overdue.length ? `${overdue.length} por renovar` : '', color: theme.success },
          { icon: '💊', label: 'Medicinas en tratamiento', value: `${activeMeds}`, sub: '', color: theme.primary },
        ].map((item) => (
          <Card key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 }}>
            <View style={{ width: 40, height: 40, backgroundColor: `${item.color}22`, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 18 }}>{item.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontFamily: fonts.semibold, color: theme.textMuted }}>{item.label}</Text>
              <Text style={{ fontSize: 15, fontFamily: fonts.extrabold, color: theme.text }}>{item.value}</Text>
            </View>
            {item.sub ? <Text style={{ fontSize: 11, fontFamily: fonts.semibold, color: theme.textLight }}>{item.sub}</Text> : null}
          </Card>
        ))}
      </View>
    </ScrollView>
  );
}
