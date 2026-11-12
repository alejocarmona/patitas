// Mini "Firestore" de tips en memoria para los tests de integración.
// Uso: jest.mock('../services/tips', () => require('../test-helpers/tipsMock').servicesMock());
//      jest.mock('../hooks/useSavedTips', () => require('../test-helpers/tipsMock').savedHookMock());
const React = require('react');

const store = { tips: [], saved: [], listeners: new Set() };
const emit = () => store.listeners.forEach((f) => f());

exports.store = store;
exports.reset = (tips = []) => {
  store.tips = tips;
  store.saved = [];
};

exports.servicesMock = () => ({
  fetchActiveTips: jest.fn(async () => store.tips.map((t) => ({ ...t }))),
  saveTip: jest.fn(async (uid, id) => {
    if (!store.saved.includes(id)) store.saved = [...store.saved, id];
    emit();
  }),
  unsaveTip: jest.fn(async (uid, id) => {
    store.saved = store.saved.filter((x) => x !== id);
    emit();
  }),
});

exports.savedHookMock = () => ({
  useSavedTips: () => {
    const [, force] = React.useReducer((x) => x + 1, 0);
    React.useEffect(() => {
      store.listeners.add(force);
      return () => store.listeners.delete(force);
    }, []);
    return store.saved;
  },
});

exports.sampleTips = () => [
  { id: 'gato-a', title: 'Gato alimentación', excerpt: 'ex gato a', detail: ['Detalle gato a', '✅ línea 2'], category: 'Alimentación', emoji: '🐱', species: 'gato', active: true, order: null, publishedAt: new Date(2026, 9, 1) },
  { id: 'gato-b', title: 'Gato higiene', excerpt: 'ex gato b', detail: ['Detalle gato b'], category: 'Higiene', emoji: '🛁', species: 'gato', active: true, order: null, publishedAt: new Date(2026, 9, 2) },
  { id: 'perro-a', title: 'Solo para perros', excerpt: 'ex perro', detail: ['Detalle perro'], category: 'Cuidado', emoji: '🐶', species: 'perro', active: true, order: null, publishedAt: new Date(2026, 9, 3) },
  { id: 'todos-a', title: 'Para todos', excerpt: 'ex todos', detail: ['Detalle todos'], category: 'Salud', emoji: '🩺', species: 'todos', active: true, order: null, publishedAt: new Date(2026, 9, 4) },
  { id: 'futuro', title: 'Tip futuro oculto', excerpt: 'ex futuro', detail: ['x'], category: 'Salud', emoji: '⏳', species: 'todos', active: true, order: null, publishedAt: new Date(2099, 0, 1) },
];
