import { distanceKm, formatDistance, sortByDistance, mapsDirectionsUrl, telUrl } from '../utils/geo';

describe('geo', () => {
  test('distancia haversine: mismo punto = 0', () => {
    expect(distanceKm({ lat: 6.2, lng: -75.5 }, { lat: 6.2, lng: -75.5 })).toBeCloseTo(0, 5);
  });
  test('distancia conocida: 0,01 grados de latitud ~ 1,11 km', () => {
    expect(distanceKm({ lat: 6.2, lng: -75.5 }, { lat: 6.21, lng: -75.5 })).toBeCloseTo(1.112, 2);
  });
  test('Medellín - Bogotá ~ 240 km', () => {
    const d = distanceKm({ lat: 6.2442, lng: -75.5812 }, { lat: 4.711, lng: -74.0721 });
    expect(d).toBeGreaterThan(230);
    expect(d).toBeLessThan(250);
  });
  test('formatDistance', () => {
    expect(formatDistance(0.35)).toBe('350 m');
    expect(formatDistance(0.004)).toBe('10 m');
    expect(formatDistance(1.234)).toBe('1,2 km');
    expect(formatDistance(1)).toBe('1,0 km');
    expect(formatDistance(12.4)).toBe('12 km');
    expect(formatDistance(null)).toBe('');
  });
  test('sortByDistance ordena del más cercano al más lejano y añade distanceKm', () => {
    const origin = { lat: 6.2, lng: -75.5 };
    const out = sortByDistance(
      [
        { id: 'lejos', lat: 6.3, lng: -75.5 },
        { id: 'cerca', lat: 6.201, lng: -75.5 },
        { id: 'medio', lat: 6.22, lng: -75.5 },
      ],
      origin
    );
    expect(out.map((p) => p.id)).toEqual(['cerca', 'medio', 'lejos']);
    expect(out[0].distanceKm).toBeLessThan(out[1].distanceKm);
  });
  test('mapsDirectionsUrl con y sin place id', () => {
    expect(mapsDirectionsUrl({ lat: 6.2, lng: -75.5, id: 'ChIJ123' })).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=6.2,-75.5&destination_place_id=ChIJ123'
    );
    expect(mapsDirectionsUrl({ lat: 6.2, lng: -75.5 })).toBe('https://www.google.com/maps/dir/?api=1&destination=6.2,-75.5');
  });
  test('telUrl deja solo dígitos y devuelve null sin teléfono', () => {
    expect(telUrl('(604) 451-2890')).toBe('tel:6044512890');
    expect(telUrl('+57 604 451 2890')).toBe('tel:576044512890');
    expect(telUrl(null)).toBeNull();
    expect(telUrl('')).toBeNull();
  });
});
