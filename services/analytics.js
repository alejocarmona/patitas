// Analytics (RNFirebase). Nombres de eventos en inglés. NUNCA PII.
// La retención la calcula GA4: no hay evento propio de retención.
import { logEvent as rnLogEvent, setUserProperty, setAnalyticsCollectionEnabled } from '@react-native-firebase/analytics';
import { analyticsInstance } from '../firebase';

function safe(fn) {
  try {
    const r = fn();
    if (r && typeof r.catch === 'function') r.catch(() => {});
  } catch {
    // Analytics nunca debe romper la app
  }
}

// Preferencia "Compartir estadísticas de uso" (users/{uid}.analyticsEnabled). Con false no se
// registra nada más: se apaga la recolección de Firebase (persiste entre aperturas) y logEvent
// deja de enviar.
// Arranca APAGADO (firebase.json también desactiva la recolección automática): nada se envía antes de
// que exista una sesión (la autorización se da al crear la cuenta / iniciar sesión). AuthProvider lo
// enciende al haber sesión (según la preferencia) y lo apaga sin sesión.
let collectionEnabled = false;

// Eventos que ocurren ANTES de que la recolección esté activa (onboarding, sign_up, login). Se
// guardan en memoria y se envían al activarse; si se apaga (cierre de sesión / opt-out) se descartan.
let pending = [];

export function setAnalyticsEnabled(enabled) {
  collectionEnabled = enabled !== false;
  safe(() => setAnalyticsCollectionEnabled(analyticsInstance(), collectionEnabled));
  if (collectionEnabled) {
    const q = pending;
    pending = [];
    q.forEach(([name, params]) => safe(() => rnLogEvent(analyticsInstance(), name, params)));
  } else {
    pending = [];
  }
}

// Como logEvent, pero si la recolección aún no está activa lo deja en cola para enviarlo después.
function logEventDeferred(name, params) {
  if (collectionEnabled) return logEvent(name, params);
  pending.push([name, params]);
}

export function logEvent(name, params) {
  if (!collectionEnabled) return;
  safe(() => rnLogEvent(analyticsInstance(), name, params));
}

export const track = {
  signUp: (method) => logEventDeferred('sign_up', { method }),
  login: (method) => logEventDeferred('login', { method }),
  onboardingCompleted: (skipped) => logEventDeferred('onboarding_completed', { skipped }),
  petProfileCreated: (species, avatarId) =>
    logEvent('pet_profile_created', { species, avatar_id: avatarId }),
  vaccineAdded: (status) => logEvent('vaccine_added', { status: status ?? 'unknown' }),
  weightAdded: () => logEvent('weight_added'),
  medicineAdded: () => logEvent('medicine_added'),
  cartillaViewed: (tab, hasOverdue) =>
    logEvent('cartilla_viewed', { tab, has_overdue: !!hasOverdue }),
  overdueVaccineSeen: () => logEvent('overdue_vaccine_seen'),
  reminderEnabled: (type) => logEvent('reminder_enabled', { type }), // 'medicine' | 'vaccine'
  notificationPermission: (granted) => logEvent('notification_permission', { granted: !!granted }),
  tipOpened: (category) => logEvent('tip_opened', { category }),
  tipSaved: (category) => logEvent('tip_saved', { category }),
  tipUnsaved: () => logEvent('tip_unsaved'),
  // Solo un bucket del conteo: nunca coordenadas ni nombres de lugares
  directoryViewed: (count) =>
    logEvent('directory_viewed', { results_count: count === 0 ? '0' : count <= 5 ? '1-5' : count <= 10 ? '6-10' : '11+' }),
  locationPermission: (granted) => logEvent('location_permission', { granted: !!granted }),
  vetCall: () => logEvent('vet_call'),
  vetDirections: () => logEvent('vet_directions'),
  contactOpened: () => logEvent('contact_opened'),
  accountDeleted: () => logEvent('account_deleted'),
};

export function setPetSpecies(species) {
  if (!collectionEnabled) return;
  safe(() => setUserProperty(analyticsInstance(), 'pet_species', species));
}
