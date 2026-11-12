// Resultado de `useVacunas` calculado con la lógica REAL (estado por dosis + agrupación por tipo).
const { groupVacunas } = require('../utils/vacunas');
const { getVacunaStatus } = require('../utils/vacunaStatus');

function hookResult(list = []) {
  const vacunas = list.map((v) => ({ ...v, status: getVacunaStatus(v.nextDate) ?? 'ok' }));
  const groups = groupVacunas(list);
  return { vacunas, groups, latests: groups.map((g) => g.latest), loading: false };
}

module.exports = { hookResult };
