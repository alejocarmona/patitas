// Cache en memoria con TTL: no rellama dentro de la ventana salvo `force`,
// y un refresco forzado (pull-to-refresh) se limita a una vez por `minForceMs`.
export function createTtlCache({ ttlMs = 10 * 60 * 1000, minForceMs = 60 * 1000, now = () => Date.now() } = {}) {
  let entry = null; // { value, at, key }
  return {
    // Devuelve { hit, value }. `key` invalida si cambia (p. ej. otra ubicación).
    read(key, { force = false } = {}) {
      if (!entry || entry.key !== key) return { hit: false };
      const age = now() - entry.at;
      if (force) return age < minForceMs ? { hit: true, value: entry.value } : { hit: false };
      return age < ttlMs ? { hit: true, value: entry.value } : { hit: false };
    },
    write(key, value) {
      entry = { key, value, at: now() };
    },
    clear() {
      entry = null;
    },
  };
}
