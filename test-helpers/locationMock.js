// Mock de expo-location para tests. Cambiar `mock.permission` / `mock.position` por test.
const mock = { permission: 'granted', position: { coords: { latitude: 6.2, longitude: -75.5 } } };

module.exports = {
  __mock: mock,
  Accuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(async () => ({ status: mock.permission })),
  getCurrentPositionAsync: jest.fn(async () => mock.position),
};
