// Utilidades geográficas puras (sin dependencias de React Native).
const R = 6371; // radio de la Tierra en km

const rad = (d) => (d * Math.PI) / 180;

// Distancia haversine en km entre dos puntos {lat,lng}.
export function distanceKm(a, b) {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// 0.35 -> "350 m"; 1.234 -> "1,2 km"; 12.4 -> "12 km"
export function formatDistance(km) {
  if (km == null || Number.isNaN(km)) return '';
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`;
  const v = km < 10 ? km.toFixed(1) : String(Math.round(km));
  return `${v.replace('.', ',')} km`;
}

// Añade `distanceKm` a cada lugar y ordena del más cercano al más lejano.
export function sortByDistance(places, origin) {
  return places
    .map((p) => ({ ...p, distanceKm: distanceKm(origin, { lat: p.lat, lng: p.lng }) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

export function mapsDirectionsUrl({ lat, lng, id }) {
  const base = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  return id ? `${base}&destination_place_id=${encodeURIComponent(id)}` : base;
}

// 'tel:' solo con dígitos (y '+' inicial si lo trae). null si no hay teléfono.
export function telUrl(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  return digits ? `tel:${digits}` : null;
}
