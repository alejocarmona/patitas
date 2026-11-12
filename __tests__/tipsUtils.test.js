import { sortTips, visibleTips, filterByCategory, normalizeSpecies } from '../utils/tips';

const T = (id, o = {}) => ({ id, active: true, species: 'todos', category: 'Salud', order: null, publishedAt: new Date(2026, 0, 1), ...o });
const NOW = new Date(2026, 10, 12);

describe('tips', () => {
  test('normalizeSpecies', () => {
    expect(normalizeSpecies('Gato')).toBe('gato');
    expect(normalizeSpecies(undefined)).toBe('');
  });
  test('muestra los de la especie de la mascota y los de "todos"', () => {
    const tips = [T('g', { species: 'gato' }), T('p', { species: 'perro' }), T('t')];
    expect(visibleTips(tips, 'Gato', NOW).map((x) => x.id).sort()).toEqual(['g', 't']);
    expect(visibleTips(tips, 'Perro', NOW).map((x) => x.id).sort()).toEqual(['p', 't']);
    expect(visibleTips(tips, 'Conejo', NOW).map((x) => x.id)).toEqual(['t']);
  });
  test('oculta publishedAt futuro e inactivos', () => {
    const tips = [T('ok'), T('futuro', { publishedAt: new Date(2026, 11, 1) }), T('off', { active: false })];
    expect(visibleTips(tips, 'Gato', NOW).map((x) => x.id)).toEqual(['ok']);
  });
  test('acepta publishedAt tipo Timestamp de Firestore (toMillis)', () => {
    const ts = (d) => ({ toMillis: () => d.getTime() });
    const tips = [T('viejo', { publishedAt: ts(new Date(2026, 0, 1)) }), T('nuevo', { publishedAt: ts(new Date(2026, 5, 1)) }), T('fut', { publishedAt: ts(new Date(2027, 0, 1)) })];
    expect(visibleTips(tips, 'Gato', NOW).map((x) => x.id)).toEqual(['nuevo', 'viejo']);
  });
  test('orden: order asc primero (los null después), luego publishedAt desc', () => {
    const tips = [
      T('a', { publishedAt: new Date(2026, 1, 1) }),
      T('b', { publishedAt: new Date(2026, 3, 1) }),
      T('o2', { order: 2, publishedAt: new Date(2025, 1, 1) }),
      T('o1', { order: 1, publishedAt: new Date(2025, 0, 1) }),
    ];
    expect(sortTips(tips).map((x) => x.id)).toEqual(['o1', 'o2', 'b', 'a']);
  });
  test('filterByCategory', () => {
    const tips = [T('a', { category: 'Salud' }), T('b', { category: 'Higiene' })];
    expect(filterByCategory(tips, 'Todos')).toHaveLength(2);
    expect(filterByCategory(tips, 'Higiene').map((x) => x.id)).toEqual(['b']);
  });
});
