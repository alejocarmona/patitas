import { useEffect } from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Button from '../../../components/ui/Button';
import Card from '../../../components/ui/Card';
import { getAvatar } from '../../../constants/avatars';
import { fonts, statusColors, theme } from '../../../constants/theme';
import { formatKg } from '../../../utils/weight';
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
  const { latests, loading: lv } = useVacunas(pet?.id);
  const { pesos } = usePeso(pet?.id);
  const { medicinas } = useMedicinas(pet?.id);

  // Solo la dosis MÁS RECIENTE de cada vacuna cuenta (el historial no genera alertas)
  const overdue = latests.filter((v) => v.status === 'vencida');
  const upcoming = latests.filter((v) => v.status === 'ok' || v.status === 'pronto'); // ya ordenadas por nextDate; las completas no cuentan
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
  const lastPeso = pesos[0];
  const activeMeds = medicinas.filter((m) => m.active).length;
  const allGood = !lv && latests.length > 0 && overdue.length === 0;
  const noVaccines = !lv && latests.length === 0;

  const diff = alertVaccine ? daysUntil(alertVaccine.nextDate) : null;
  const when =
    diff === null ? '' : diff < 0 ? `venció hace ${Math.abs(diff)} ${Math.abs(diff) === 1 ? 'día' : 'días'}` : diff === 0 ? 'es hoy' : `en ${diff} ${diff === 1 ? 'día' : 'días'}`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }} contentContainerStyle={{ paddingBottom: 24 }}>
      <View
        style={{
          backgroundColor: theme.primaryStrong,
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 28,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 14, fontFamily: fonts.semibold, marginBottom: 2 }}>
              {firstName ? `Hola, ${firstName} 👋` : 'Hola 👋'}
            </Text>
            <Text style={{ color: '#fff', fontSize: 22, fontFamily: fonts.black }}>¿Cómo está {pet.name} hoy?</Text>
          </View>
          <Pressable
            onPress={() => router.push('/perfil')}
            accessibilityLabel="Perfil"
            testID="perfil-btn"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 12 }}
            hitSlop={6}
          >
            <Feather name="user" size={20} color="#fff" />
          </Pressable>
        </View>

        <View style={{ marginTop: 20, backgroundColor: 'rgba(0,0,0,0.18)', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Image source={getAvatar(pet.avatarId).source} style={{ width: 60, height: 60, borderRadius: 18 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontFamily: fonts.extrabold, marginBottom: 2 }}>{pet.name}</Text>
            <Text style={{ color: '#fff', fontSize: 14, fontFamily: fonts.regular }}>{ageLabel(pet)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            {allGood ? (
              <View style={{ backgroundColor: '#fff', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Feather name="check-circle" size={12} color={theme.success} />
                <Text style={{ color: theme.success, fontSize: 12, fontFamily: fonts.bold }}>Al día gracias a ti</Text>
              </View>
            ) : null}
            <Pressable
              onPress={() => router.push('/edit-pet')}
              accessibilityRole="button"
              hitSlop={6}
              style={{ backgroundColor: '#fff', borderRadius: 10, minHeight: 44, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Feather name="edit-2" size={13} color={theme.text} />
              <Text style={{ color: theme.text, fontSize: 13, fontFamily: fonts.bold }}>Editar</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={{ padding: 16, gap: 12 }}>
        {noVaccines ? (
          <View
            testID="primer-paso"
            style={{ backgroundColor: '#fff', borderWidth: 1.5, borderColor: theme.secondary, borderRadius: 16, padding: 16, gap: 10 }}
          >
            <Text style={{ fontSize: 16, fontFamily: fonts.extrabold, color: theme.text }}>Empieza la cartilla de {pet.name}</Text>
            <Text style={{ fontSize: 14, fontFamily: fonts.regular, color: theme.textMuted, lineHeight: 20 }}>
              Ten a la mano su carnet y registra su última vacuna. Te avisaremos antes de la próxima.
            </Text>
            <Button label="Registrar primera vacuna" onPress={() => router.push('/add-vacuna')} color={theme.secondary} />
          </View>
        ) : null}
        {alertVaccine ? (
          <Pressable
            onPress={() => router.push({ pathname: '/cartilla', params: { tab: 'vacunas' } })}
            accessibilityRole="button"
            style={{
              backgroundColor: statusColors[alertVaccine.status].bg,
              borderWidth: 1.5,
              borderColor: statusColors[alertVaccine.status].fg,
              borderRadius: 16,
              padding: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View style={{ width: 40, height: 40, backgroundColor: statusColors[alertVaccine.status].fg, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
              <Feather name={statusColors[alertVaccine.status].icon} size={20} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: statusColors[alertVaccine.status].fg, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {alertVaccine.status === 'vencida' ? `${pet.name} necesita protección` : 'Próxima vacuna'}
              </Text>
              <Text style={{ fontSize: 14, fontFamily: fonts.extrabold, color: theme.text }}>{alertVaccine.name}</Text>
              <Text style={{ fontSize: 13, fontFamily: fonts.regular, color: theme.textMuted }}>
                {formatDateEs(alertVaccine.nextDate)} · {when}
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textMuted} />
          </Pressable>
        ) : null}

        <Text style={{ fontSize: 14, fontFamily: fonts.extrabold, color: theme.text, textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 }}>
          Resumen de {pet.name}
        </Text>
        {[
          { icon: 'activity', label: 'Peso actual', value: lastPeso ? `${formatKg(lastPeso.value)} kg` : 'Sin registro', sub: lastPeso ? formatDateEs(lastPeso.date) : '', color: theme.secondary, tab: 'peso' },
          { icon: 'shield', label: 'Vacunas registradas', value: `${latests.length}`, sub: overdue.length ? `${overdue.length} por renovar` : '', subColor: theme.danger, color: theme.success, tab: 'vacunas' },
          { icon: 'package', label: 'Medicinas en tratamiento', value: `${activeMeds}`, sub: '', color: theme.secondary, tab: 'medicinas' },
        ].map((item) => (
          <Pressable
            key={item.label}
            onPress={() => router.push({ pathname: '/cartilla', params: { tab: item.tab } })}
            accessibilityRole="button"
            accessibilityLabel={`${item.label}: ${item.value}`}
          >
            <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16 }}>
              <View style={{ width: 40, height: 40, backgroundColor: `${item.color}22`, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Feather name={item.icon} size={18} color={item.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 13, fontFamily: fonts.semibold, color: theme.textMuted }}>{item.label}</Text>
                <Text style={{ fontSize: 15, fontFamily: fonts.extrabold, color: theme.text }}>{item.value}</Text>
              </View>
              {item.sub ? <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: item.subColor ?? theme.textSubtle }}>{item.sub}</Text> : null}
            </Card>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}
