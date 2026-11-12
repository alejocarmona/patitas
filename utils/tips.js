// Lógica pura de tips (sin Firebase): especie, publicación, orden y filtros.
export const CATEGORIES = ['Alimentación', 'Cuidado', 'Higiene', 'Salud'];

// pet.species ('Gato' | 'Perro' | 'Conejo' | ...) -> 'gato' | 'perro' | otro (sin tips propios)
export function normalizeSpecies(species) {
  return String(species ?? '').trim().toLowerCase();
}

// publishedAt puede ser Timestamp de Firestore (toDate), Date o ms.
function toMillis(v) {
  if (!v) return 0;
  if (typeof v.toMillis === 'function') return v.toMillis();
  if (typeof v.toDate === 'function') return v.toDate().getTime();
  if (v instanceof Date) return v.getTime();
  return Number(v) || 0;
}

// `order` ascendente (los que lo traen primero); después publishedAt descendente.
export function sortTips(tips) {
  const hasOrder = (t) => typeof t.order === 'number';
  return [...tips].sort((a, b) => {
    if (hasOrder(a) !== hasOrder(b)) return hasOrder(a) ? -1 : 1;
    if (hasOrder(a) && a.order !== b.order) return a.order - b.order;
    return toMillis(b.publishedAt) - toMillis(a.publishedAt);
  });
}

// Oculta los tips con publishedAt futuro y los de otra especie.
export function visibleTips(tips, species, now = new Date()) {
  const sp = normalizeSpecies(species);
  const nowMs = now.getTime();
  return sortTips(
    tips.filter((t) => {
      if (t.active === false) return false;
      if (toMillis(t.publishedAt) > nowMs) return false;
      return t.species === 'todos' || t.species === sp;
    })
  );
}

export function filterByCategory(tips, category) {
  return !category || category === 'Todos' ? tips : tips.filter((t) => t.category === category);
}
