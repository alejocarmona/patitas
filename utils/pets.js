// Lógica pura de varias mascotas (sin Firebase): orden, selección y tope.

const createdMs = (p) => {
  const c = p?.createdAt;
  if (!c) return Number.MAX_SAFE_INTEGER; // recién creada (serverTimestamp pendiente): al final
  if (typeof c.toMillis === 'function') return c.toMillis();
  if (typeof c.seconds === 'number') return c.seconds * 1000;
  const n = new Date(c).getTime();
  return Number.isNaN(n) ? Number.MAX_SAFE_INTEGER : n;
};

// Orden estable: la más antigua primero (la primera mascota sigue siendo la "principal").
export function sortPets(pets = []) {
  return [...pets].sort((a, b) => createdMs(a) - createdMs(b) || String(a.id).localeCompare(String(b.id)));
}

// La seleccionada si existe; si no (borrada, otro dispositivo, primera vez), la primera.
export function pickSelected(pets = [], selectedId) {
  return pets.find((p) => p.id === selectedId) ?? pets[0] ?? null;
}

// Tope de mascotas gratis. Sin valor válido = sin tope (hoy llega apagado).
export function normalizeMaxPets(value) {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : Infinity;
}

export function canAddPet(count, max) {
  return count < normalizeMaxPets(max);
}

export const PET_SUBCOLLECTIONS = ['vacunas', 'pesos', 'medicinas'];

export const selectedPetKey = (uid) => `selectedPet.v1:${uid}`;
