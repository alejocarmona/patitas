// Peso: rango plausible por especie (suave: fuera de rango se pide confirmar, no se bloquea).
const RANGES = {
  Gato: { min: 0.5, max: 15, noun: 'un gato' },
  Perro: { min: 0.5, max: 100, noun: 'un perro' },
  Conejo: { min: 0.2, max: 10, noun: 'un conejo' },
  Ave: { min: 0.01, max: 5, noun: 'un ave' },
  Hámster: { min: 0.02, max: 0.25, noun: 'un hámster' },
  Cerdo: { min: 0.5, max: 150, noun: 'un cerdo' },
};

// Peso con coma decimal, estilo colombiano: 4.2 -> '4,2'
export function formatKg(value) {
  return String(value).replace('.', ',');
}

// null si el peso es plausible (o la especie no tiene rango); si no, el aviso y el motivo.
export function weightOutlier(species, kg) {
  const r = RANGES[species];
  if (!r) return null;
  if (kg > r.max) return { kind: 'alto', message: `${formatKg(kg)} kg es mucho para ${r.noun}.` };
  if (kg < r.min) return { kind: 'bajo', message: `${formatKg(kg)} kg es muy poco para ${r.noun}.` };
  return null;
}
