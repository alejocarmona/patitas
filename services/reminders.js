// Recordatorios con notificaciones LOCALES (sin servidor). Funciona sin FCM.
//
// Modelo: Firestore es la fuente de verdad (medicinas con esquema estructurado y
// vacunas con nextDate). Aquí solo se programa/cancela en el dispositivo, con una
// VENTANA MÓVIL (14 días, máx. 64 notificaciones por medicina) para no pasar el
// límite de alarmas de Android (~500 por app), y se re-programa cada vez que la app
// abre o cambian los datos (useReminders). Los IDs de notificación por ítem viven
// en AsyncStorage (son del dispositivo; NO van a Firestore).
//
// Alarmas exactas: se usa el modo por defecto ('bestEffort' = setExactAndAllowWhileIdle)
// SIN declarar SCHEDULE_EXACT_ALARM / USE_EXACT_ALARM. Esos permisos están restringidos
// (Play solo los admite para apps de alarma/calendario; en Android 14 SCHEDULE_EXACT_ALARM
// viene denegado) y para un recordatorio de medicina un retraso de unos minutos en modo
// Doze es aceptable. Si en la práctica se retrasa demasiado, la salida es delivery:'alarmClock'.
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { computeDoseTimes, computeVaccineReminderTimes, hasStructuredSchedule } from '../utils/reminders';
import { formatDateEs, toDateString } from '../utils/vacunaStatus';

export const CHANNEL_ID = 'recordatorios';
export const HORIZON_DAYS = 14;
export const MAX_PER_MEDICINE = 64;
const STORE_KEY = 'reminders.v1';

// Un solo hilo de escritura sobre la tienda y la programación (evita duplicados
// cuando el formulario y el listener de Firestore sincronizan a la vez).
let chain = Promise.resolve();
const serial = (fn) => {
  const run = chain.then(fn, fn);
  chain = run.catch(() => {});
  return run;
};

async function readStore() {
  try {
    return JSON.parse((await AsyncStorage.getItem(STORE_KEY)) ?? '{}') || {};
  } catch {
    return {};
  }
}
const writeStore = (store) => AsyncStorage.setItem(STORE_KEY, JSON.stringify(store)).catch(() => {});

export async function initNotifications() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  try {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Recordatorios',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B35',
    });
  } catch {
    // sin canal se usa el predeterminado; no es fatal
  }
}

// 'granted' | 'denied' | 'undetermined'
export async function getPermissionStatus() {
  try {
    const p = await Notifications.getPermissionsAsync();
    if (p.granted) return 'granted';
    return p.status === 'undetermined' ? 'undetermined' : 'denied';
  } catch {
    return 'undetermined';
  }
}

export async function requestPermission() {
  try {
    const p = await Notifications.requestPermissionsAsync();
    return !!p.granted;
  } catch {
    return false;
  }
}

async function cancelIds(ids = []) {
  for (const id of ids) {
    try {
      await Notifications.cancelScheduledNotificationAsync(id);
    } catch {
      // ya no existía
    }
  }
}

async function scheduleAll(items) {
  const ids = [];
  for (const { at, title, body, data } of items) {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: { title, body, data, sound: 'default' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: at, channelId: CHANNEL_ID },
      });
      if (id) ids.push(id);
    } catch {
      // una que falle no tumba las demás
    }
  }
  return ids;
}

// Reemplaza lo programado para `key` si la firma cambió (o `force`). `items` = [] cancela.
async function apply(store, key, sig, items, { force = false } = {}) {
  const prev = store[key];
  if (!force && prev && prev.sig === sig) return;
  if (prev) await cancelIds(prev.ids);
  if (items.length === 0) {
    delete store[key];
    return;
  }
  store[key] = { sig, ids: await scheduleAll(items) };
}

function medicineItems(petName, med, now) {
  if (!med || med.reminders === false || med.active === false || !hasStructuredSchedule(med)) return [];
  const times = computeDoseTimes(med, now, HORIZON_DAYS).slice(0, MAX_PER_MEDICINE);
  const body = [med.name, med.dose].filter(Boolean).join(', ');
  return times.map((at) => ({
    at,
    title: `Hora de la medicina de ${petName}`,
    body,
    data: { tab: 'medicinas' },
  }));
}

function vaccineItems(petName, vac, now) {
  if (!vac?.nextDate) return [];
  return computeVaccineReminderTimes(vac.nextDate, now).map((at) => {
    const sameDay = toDateString(at) === vac.nextDate;
    return {
      at,
      title: sameDay ? `Hoy toca la vacuna de ${petName}` : `${petName} tiene vacuna en 7 días`,
      body: sameDay ? vac.name : `${vac.name} · ${formatDateEs(vac.nextDate)}`,
      data: { tab: 'vacunas' },
    };
  });
}

const medSig = (petName, med, now) =>
  JSON.stringify([
    petName,
    med.name,
    med.dose,
    med.active !== false,
    med.reminders !== false,
    med.startDate,
    med.firstDoseTime,
    med.intervalValue,
    med.intervalUnit,
    med.durationDays ?? null,
    toDateString(now), // re-rueda la ventana al menos una vez al día
  ]);
const vacSig = (petName, vac) => JSON.stringify([petName, vac.name, vac.nextDate ?? null]);

// Sincroniza UNA medicina (tras guardar/editar). Sin permiso no programa.
export function syncMedicina(petName, med, { now = new Date(), force = false } = {}) {
  return serial(async () => {
    const store = await readStore();
    const granted = (await getPermissionStatus()) === 'granted';
    const items = granted ? medicineItems(petName, med, now) : [];
    await apply(store, `medicinas/${med.id}`, medSig(petName, med, now), items, { force });
    await writeStore(store);
  });
}

export function syncVacuna(petName, vac, { now = new Date(), force = false } = {}) {
  return serial(async () => {
    const store = await readStore();
    const granted = (await getPermissionStatus()) === 'granted';
    const items = granted ? vaccineItems(petName, vac, now) : [];
    await apply(store, `vacunas/${vac.id}`, vacSig(petName, vac), items, { force });
    await writeStore(store);
  });
}

// Cancela lo programado de un ítem (al borrarlo).
export function cancelItem(sub, id) {
  return serial(async () => {
    const store = await readStore();
    const prev = store[`${sub}/${id}`];
    if (prev) await cancelIds(prev.ids);
    delete store[`${sub}/${id}`];
    await writeStore(store);
  });
}

// Reconciliación completa contra lo que hay en Firestore: programa/actualiza lo vigente
// y cancela lo huérfano (ítems borrados desde otro dispositivo, reinstalación, etc.).
export function syncAll({ petName, medicinas = [], vacunas = [], now = new Date() }) {
  return serial(async () => {
    const store = await readStore();
    const granted = (await getPermissionStatus()) === 'granted';
    const live = new Set();
    for (const med of medicinas) {
      const key = `medicinas/${med.id}`;
      live.add(key);
      await apply(store, key, medSig(petName, med, now), granted ? medicineItems(petName, med, now) : []);
    }
    for (const vac of vacunas) {
      const key = `vacunas/${vac.id}`;
      live.add(key);
      await apply(store, key, vacSig(petName, vac), granted ? vaccineItems(petName, vac, now) : []);
    }
    for (const key of Object.keys(store)) {
      if (!live.has(key)) {
        await cancelIds(store[key].ids);
        delete store[key];
      }
    }
    await writeStore(store);
  });
}
