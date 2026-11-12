jest.mock('expo-constants', () => ({
  __esModule: true,
  default: { expoConfig: { extra: { androidCertSha1: 'ABCDEF0123456789ABCDEF0123456789ABCDEF01' } } },
}));

const { getNearbyVets, mapPlace, PlacesError } = require('../services/places');

const okResponse = (places) => ({ ok: true, status: 200, json: async () => ({ places }) });

describe('places', () => {
  const OLD = process.env.EXPO_PUBLIC_PLACES_API_KEY;
  beforeEach(() => {
    process.env.EXPO_PUBLIC_PLACES_API_KEY = 'KEY123';
    global.fetch = jest.fn();
  });
  afterAll(() => {
    if (OLD === undefined) delete process.env.EXPO_PUBLIC_PLACES_API_KEY;
    else process.env.EXPO_PUBLIC_PLACES_API_KEY = OLD;
  });

  test('mapPlace tolera teléfono, horario y rating ausentes (sin inventar)', () => {
    const v = mapPlace({ id: 'p1', displayName: { text: 'Vet X' }, location: { latitude: 1, longitude: 2 } });
    expect(v).toMatchObject({ id: 'p1', name: 'Vet X', phone: null, open: null, rating: null, reviews: null, lat: 1, lng: 2 });
  });

  test('mapPlace con todos los campos', () => {
    const v = mapPlace({
      id: 'p2',
      displayName: { text: 'Vet Y' },
      formattedAddress: 'Cra 1 #2-3',
      rating: 4.6,
      userRatingCount: 89,
      currentOpeningHours: { openNow: false },
      nationalPhoneNumber: '(604) 123 4567',
      location: { latitude: 6.2, longitude: -75.5 },
    });
    expect(v).toEqual({ id: 'p2', name: 'Vet Y', address: 'Cra 1 #2-3', rating: 4.6, reviews: 89, open: false, phone: '(604) 123 4567', lat: 6.2, lng: -75.5 });
  });

  test('envía key, field mask, headers de restricción Android y el body correcto', async () => {
    global.fetch.mockResolvedValue(okResponse([{ id: 'a', displayName: { text: 'A' }, location: { latitude: 1, longitude: 1 } }]));
    const out = await getNearbyVets(6.2, -75.5);
    expect(out).toHaveLength(1);
    const [url, init] = global.fetch.mock.calls[0];
    expect(url).toBe('https://places.googleapis.com/v1/places:searchNearby');
    expect(init.method).toBe('POST');
    expect(init.headers['X-Goog-Api-Key']).toBe('KEY123');
    expect(init.headers['X-Goog-FieldMask']).toContain('places.nationalPhoneNumber');
    expect(init.headers['X-Android-Package']).toBe('com.alejocarmona.patitas');
    expect(init.headers['X-Android-Cert']).toBe('ABCDEF0123456789ABCDEF0123456789ABCDEF01');
    expect(JSON.parse(init.body)).toMatchObject({
      includedTypes: ['veterinary_care'],
      maxResultCount: 20,
      languageCode: 'es',
      regionCode: 'CO',
      locationRestriction: { circle: { center: { latitude: 6.2, longitude: -75.5 }, radius: 5000 } },
    });
  });

  test('respuesta sin "places" -> lista vacía', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) });
    expect(await getNearbyVets(1, 1)).toEqual([]);
  });

  test('HTTP no ok -> PlacesError http_<status>', async () => {
    global.fetch.mockResolvedValue({ ok: false, status: 403, json: async () => ({}) });
    await expect(getNearbyVets(1, 1)).rejects.toMatchObject({ code: 'http_403' });
  });

  test('fallo de red -> PlacesError network', async () => {
    global.fetch.mockRejectedValue(new Error('offline'));
    await expect(getNearbyVets(1, 1)).rejects.toBeInstanceOf(PlacesError);
    await expect(getNearbyVets(1, 1)).rejects.toMatchObject({ code: 'network' });
  });

  test('sin API key -> no_key y NO llama a fetch', async () => {
    process.env.EXPO_PUBLIC_PLACES_API_KEY = '';
    await expect(getNearbyVets(1, 1)).rejects.toMatchObject({ code: 'no_key' });
    expect(global.fetch).not.toHaveBeenCalled();
  });
});
