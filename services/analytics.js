// Analytics (RNFirebase). Nombres de eventos en inglés. NUNCA PII.
// La retención la calcula GA4: no hay evento propio de retención.
import { logEvent as rnLogEvent, setUserProperty } from '@react-native-firebase/analytics';
import { analyticsInstance } from '../firebase';

function safe(fn) {
  try {
    const r = fn();
    if (r && typeof r.catch === 'function') r.catch(() => {});
  } catch {
    // Analytics nunca debe romper la app
  }
}

export function logEvent(name, params) {
  safe(() => rnLogEvent(analyticsInstance(), name, params));
}

export const track = {
  signUp: (method) => logEvent('sign_up', { method }),
  login: (method) => logEvent('login', { method }),
  onboardingCompleted: (skipped) => logEvent('onboarding_completed', { skipped }),
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
};

export function setPetSpecies(species) {
  safe(() => setUserProperty(analyticsInstance(), 'pet_species', species));
}
