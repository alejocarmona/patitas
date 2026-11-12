// Set predefinido de avatares (placeholders; el dueño los reemplazará).
// En Firestore solo se guarda `avatarId`.
export const AVATARS = [
  { id: 'perro-1', species: 'Perro', source: require('../assets/avatars/perro-1.png') },
  { id: 'perro-2', species: 'Perro', source: require('../assets/avatars/perro-2.png') },
  { id: 'gato-1', species: 'Gato', source: require('../assets/avatars/gato-1.png') },
  { id: 'gato-2', species: 'Gato', source: require('../assets/avatars/gato-2.png') },
  { id: 'conejo-1', species: 'Conejo', source: require('../assets/avatars/conejo-1.png') },
  { id: 'conejo-2', species: 'Conejo', source: require('../assets/avatars/conejo-2.png') },
  { id: 'ave-1', species: 'Ave', source: require('../assets/avatars/ave-1.png') },
  { id: 'ave-2', species: 'Ave', source: require('../assets/avatars/ave-2.png') },
  { id: 'hamster-1', species: 'Hámster', source: require('../assets/avatars/hamster-1.png') },
  { id: 'cerdo-1', species: 'Cerdo', source: require('../assets/avatars/cerdo-1.png') },
];

export function getAvatar(id) {
  return AVATARS.find((a) => a.id === id) ?? AVATARS[0];
}
