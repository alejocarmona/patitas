// Google Places API (New) — places:searchNearby. Ver CLAUDE.md §7.
// La API key va restringida a Android (package + SHA-1): las llamadas REST desde RN
// deben enviar X-Android-Package y X-Android-Cert (el SHA-1 NO es secreto).
import Constants from 'expo-constants';

export const ANDROID_PACKAGE = 'com.alejocarmona.patitas';
const ENDPOINT = 'https://places.googleapis.com/v1/places:searchNearby';
const FIELD_MASK =
  'places.id,places.displayName,places.formattedAddress,places.rating,' +
  'places.userRatingCount,places.currentOpeningHours.openNow,' +
  'places.nationalPhoneNumber,places.location';

export const placesKey = () => process.env.EXPO_PUBLIC_PLACES_API_KEY || '';
// SHA-1 de la firma de la app: debug en desarrollo, llave de subida/release en builds de producción.
export const certSha1 = () => {
  const extra = Constants.expoConfig?.extra;
  return (__DEV__ ? extra?.androidCertSha1 : extra?.androidCertSha1Release) || '';
};

export class PlacesError extends Error {
  constructor(code) {
    super(code);
    this.code = code; // 'no_key' | 'http_<status>' | 'network'
  }
}

export function mapPlace(p) {
  return {
    id: p.id,
    name: p.displayName?.text ?? 'Veterinaria',
    address: p.formattedAddress ?? '',
    rating: typeof p.rating === 'number' ? p.rating : null,
    reviews: typeof p.userRatingCount === 'number' ? p.userRatingCount : null,
    open: typeof p.currentOpeningHours?.openNow === 'boolean' ? p.currentOpeningHours.openNow : null,
    phone: p.nationalPhoneNumber ?? null,
    lat: p.location?.latitude,
    lng: p.location?.longitude,
  };
}

export async function getNearbyVets(lat, lng, radius = 5000) {
  const key = placesKey();
  if (!key) throw new PlacesError('no_key');
  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': FIELD_MASK,
        'X-Android-Package': ANDROID_PACKAGE,
        'X-Android-Cert': certSha1(),
      },
      body: JSON.stringify({
        includedTypes: ['veterinary_care'],
        maxResultCount: 20,
        languageCode: 'es',
        regionCode: 'CO',
        locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius } },
      }),
    });
  } catch {
    throw new PlacesError('network');
  }
  if (!res.ok) throw new PlacesError(`http_${res.status}`);
  const data = await res.json();
  return (data.places ?? []).map(mapPlace).filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number');
}
