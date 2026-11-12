import { createTtlCache } from '../utils/cache';

describe('cache TTL', () => {
  test('no rellama dentro de 10 min y sí después', () => {
    let t = 1000;
    const c = createTtlCache({ ttlMs: 600000, minForceMs: 60000, now: () => t });
    expect(c.read('k').hit).toBe(false);
    c.write('k', [1]);
    t += 599000;
    expect(c.read('k')).toEqual({ hit: true, value: [1] });
    t += 2000;
    expect(c.read('k').hit).toBe(false);
  });
  test('refresh forzado limitado a 1 por minuto', () => {
    let t = 0;
    const c = createTtlCache({ ttlMs: 600000, minForceMs: 60000, now: () => t });
    c.write('k', 'v');
    t += 30000;
    expect(c.read('k', { force: true }).hit).toBe(true); // throttled: sirve el cache
    t += 31000;
    expect(c.read('k', { force: true }).hit).toBe(false); // ya pasó 1 min
  });
  test('otra clave invalida', () => {
    const c = createTtlCache();
    c.write('a', 1);
    expect(c.read('b').hit).toBe(false);
  });
});
