// Tips (colección `tips`, solo lectura para clientes) y tips guardados por usuario.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from '@react-native-firebase/firestore';
import { db } from '../firebase';

// Solo `active == true`: el orden (order, publishedAt) y el filtro de publicación futura
// se aplican en cliente (utils/tips.js) para no necesitar un índice compuesto.
export async function fetchActiveTips() {
  const snap = await getDocs(query(collection(db(), 'tips'), where('active', '==', true)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function saveTip(uid, tipId) {
  return setDoc(doc(db(), 'users', uid, 'savedTips', tipId), { tipId, savedAt: serverTimestamp() });
}

export function unsaveTip(uid, tipId) {
  return deleteDoc(doc(db(), 'users', uid, 'savedTips', tipId));
}
