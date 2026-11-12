import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TopBar from '../../../components/ui/TopBar';
import Button from '../../../components/ui/Button';
import EmptyState from '../../../components/ui/EmptyState';
import VacunaItem from '../../../components/cartilla/VacunaItem';
import PesoItem from '../../../components/cartilla/PesoItem';
import MedicinaItem from '../../../components/cartilla/MedicinaItem';
import { fonts, theme } from '../../../constants/theme';
import { usePet } from '../../../hooks/usePet';
import { useVacunas } from '../../../hooks/useVacunas';
import { usePeso } from '../../../hooks/usePeso';
import { useMedicinas } from '../../../hooks/useMedicinas';
import { deleteCartillaItem, updateCartillaItem } from '../../../services/firestore';
import { track } from '../../../services/analytics';
import { cancelItem } from '../../../services/reminders';
import { formatDateEs } from '../../../utils/vacunaStatus';
import { formatKg } from '../../../utils/weight';

const TABS = [
  { key: 'vacunas', label: 'Vacunas' },
  { key: 'peso', label: 'Peso' },
  { key: 'medicinas', label: 'Medicinas' },
];

// `question` dice QUÉ se borra (p. ej. "¿Eliminar Antirrábica del 27 Nov 2026?")
function confirmDelete(question, onConfirm) {
  Alert.alert(question, 'Esta acción no se puede deshacer.', [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Eliminar', style: 'destructive', onPress: onConfirm },
  ]);
}

function Chart({ pesos }) {
  // Mini gráfico de barras con los últimos 6 registros (cronológico)
  const data = [...pesos].slice(0, 6).reverse();
  if (data.length < 2) return null;
  const values = data.map((p) => Number(p.value));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const span = max - min || 1;
  return (
    <View style={{ backgroundColor: '#fff', borderRadius: 16, borderWidth: 1.5, borderColor: theme.border, padding: 14 }}>
      <Text style={{ fontSize: 12, fontFamily: fonts.bold, color: theme.textMuted, textTransform: 'uppercase', marginBottom: 10 }}>
        Evolución
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 90 }}>
        {values.map((v, i) => (
          <View key={data[i].id} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%' }}>
            <Text style={{ fontSize: 10, fontFamily: fonts.bold, color: theme.secondary, marginBottom: 2 }}>{formatKg(v)}</Text>
            <View style={{ width: '100%', height: 14 + ((v - min) / span) * 50, backgroundColor: theme.secondary, borderRadius: 6 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

export default function Cartilla() {
  const pet = usePet();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [tab, setTab] = useState(TABS.some((t) => t.key === params.tab) ? params.tab : 'vacunas');
  const petId = pet?.id;
  const { vacunas, groups, latests, loading: lv } = useVacunas(petId);
  const { pesos, loading: lp } = usePeso(petId);
  const { medicinas, loading: lm } = useMedicinas(petId);

  // Permite entrar desde Home con ?tab=peso
  useEffect(() => {
    if (TABS.some((t) => t.key === params.tab)) setTab(params.tab);
  }, [params.tab]);

  const hasOverdue = latests.some((v) => v.status === 'vencida');
  const loadingAll = lv || lp || lm;

  useEffect(() => {
    if (!loadingAll) track.cartillaViewed(tab, hasOverdue);
  }, [tab, loadingAll, hasOverdue]);

  useEffect(() => {
    if (!lv && hasOverdue && tab === 'vacunas') track.overdueVaccineSeen();
  }, [lv, hasOverdue, tab]);

  if (!pet) return null;
  const loading = tab === 'vacunas' ? lv : tab === 'peso' ? lp : lm;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <TopBar title="Cartilla digital" subtitle={`La salud de ${pet.name}, siempre contigo`} color={theme.secondary} />
      <View style={{ flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingTop: 16 }}>
        {TABS.map((t) => {
          const on = tab === t.key;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 10,
                borderRadius: 12,
                backgroundColor: on ? theme.secondary : '#fff',
                borderWidth: 1.5,
                borderColor: on ? theme.secondary : theme.border,
              }}
            >
              <Text style={{ fontSize: 13, fontFamily: fonts.bold, color: on ? '#fff' : theme.textMuted }}>{t.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 32 }}>
        {loading ? (
          <ActivityIndicator color={theme.secondary} style={{ marginTop: 32 }} />
        ) : tab === 'vacunas' ? (
          <>
            {vacunas.length === 0 ? (
              <EmptyState
                emoji="💉"
                title="Aún no hay vacunas registradas"
                subtitle={`Registra la primera vacuna de ${pet.name} para tener su cartilla siempre a la mano.`}
              />
            ) : (
              groups.map((g) => (
                <VacunaItem
                  key={g.key}
                  group={g}
                  petName={pet.name}
                  onFindVet={() => router.push('/directorio')}
                  onRenew={() => router.push({ pathname: '/add-vacuna', params: { renewName: g.latest.name } })}
                  onEdit={(v) => router.push({ pathname: '/add-vacuna', params: { id: v.id } })}
                  onDelete={(v) =>
                    confirmDelete(`¿Eliminar ${v.name} del ${formatDateEs(v.appliedDate)}?`, () =>
                      deleteCartillaItem(petId, 'vacunas', v.id).then(() => cancelItem('vacunas', v.id)).catch(() => Alert.alert('No se pudo eliminar'))
                    )
                  }
                />
              ))
            )}
            <Button label="Agregar vacuna" onPress={() => router.push('/add-vacuna')} />
          </>
        ) : tab === 'peso' ? (
          <>
            {pesos.length === 0 ? (
              <EmptyState emoji="⚖️" title="Aún no hay registros de peso" subtitle={`Anota cuánto pesa ${pet.name} para seguir su evolución.`} />
            ) : (
              <>
                <Chart pesos={pesos} />
                {pesos.map((p) => (
                  <PesoItem
                    key={p.id}
                    peso={p}
                    onDelete={() => confirmDelete(`¿Eliminar el peso de ${formatKg(p.value)} kg del ${formatDateEs(p.date)}?`, () => deleteCartillaItem(petId, 'pesos', p.id).catch(() => Alert.alert('No se pudo eliminar')))}
                  />
                ))}
              </>
            )}
            <Button label="Registrar peso" onPress={() => router.push('/add-peso')} />
          </>
        ) : (
          <>
            {medicinas.length === 0 ? (
              <EmptyState emoji="💊" title="Sin medicinas registradas" subtitle={`Aquí verás los tratamientos de ${pet.name}.`} />
            ) : (
              medicinas.map((m) => (
                <MedicinaItem
                  key={m.id}
                  medicina={m}
                  onToggle={() => updateCartillaItem(petId, 'medicinas', m.id, { active: !m.active }).catch(() => Alert.alert('No se pudo actualizar'))}
                  onEdit={() => router.push({ pathname: '/add-medicina', params: { id: m.id } })}
                  onDelete={() => confirmDelete(`¿Eliminar ${m.name}?`, () => deleteCartillaItem(petId, 'medicinas', m.id).then(() => cancelItem('medicinas', m.id)).catch(() => Alert.alert('No se pudo eliminar')))}
                />
              ))
            )}
            <Button label="Agregar medicina" onPress={() => router.push('/add-medicina')} />
          </>
        )}
      </ScrollView>
    </View>
  );
}
