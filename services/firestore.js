// Escrituras de mascota y cartilla. Lecturas: hooks con onSnapshot.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from '@react-native-firebase/firestore';
import { db } from '../firebase';
import { PET_SUBCOLLECTIONS } from '../utils/pets';

export async function createPet(uid, data) {
  const ref = await addDoc(collection(db(), 'pets'), {
    userId: uid,
    name: data.name.trim(),
    species: data.species,
    breed: (data.breed ?? '').trim(),
    gender: data.gender,
    birthdate: data.birthdate,
    avatarId: data.avatarId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

// Borra una mascota y su cartilla. Los recordatorios se cancelan solos: useReminders deja de
// recibirla y syncAll cancela lo huérfano.
export async function deletePet(petId) {
  for (const sub of PET_SUBCOLLECTIONS) {
    const snap = await getDocs(collection(db(), 'pets', petId, sub));
    for (const d of snap.docs) await deleteDoc(d.ref);
  }
  await deleteDoc(doc(db(), 'pets', petId));
}

export function updatePet(petId, data) {
  return updateDoc(doc(db(), 'pets', petId), {
    name: data.name.trim(),
    species: data.species,
    breed: (data.breed ?? '').trim(),
    gender: data.gender,
    birthdate: data.birthdate,
    avatarId: data.avatarId,
    updatedAt: serverTimestamp(),
  });
}

// ---- Subcolecciones de la cartilla ----
export function addCartillaItem(petId, sub, data) {
  return addDoc(collection(db(), 'pets', petId, sub), { ...data, createdAt: serverTimestamp() });
}

export function updateCartillaItem(petId, sub, id, data) {
  return updateDoc(doc(db(), 'pets', petId, sub, id), data);
}

export function deleteCartillaItem(petId, sub, id) {
  return deleteDoc(doc(db(), 'pets', petId, sub, id));
}
