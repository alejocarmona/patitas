// Eliminación de cuenta (Google Play + Ley 1581: derecho de supresión).
//
// ORDEN (importa para no dejar la cuenta a medio borrar):
//   1. Reautenticar PRIMERO (correo: siempre; Google: si el ingreso no es reciente). Si falla o se cancela: se aborta
//      sin haber borrado nada.
//   2. Analytics `account_deleted` (sin PII) y cancelar recordatorios locales.
//   3. Firestore: por cada mascota del usuario -> vacunas, pesos, medicinas (lotes <= 500) -> doc de
//      la mascota; luego users/{uid}/savedTips -> users/{uid}. Las subcolecciones van ANTES que el
//      documento de la mascota porque las reglas validan la propiedad con get() sobre ese documento.
//   4. Borrar la cuenta de Firebase Auth y cerrar la sesión de Google.
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch,
} from '@react-native-firebase/firestore';
import { db } from '../firebase';
import { track } from './analytics';
import { clearAllReminders } from './reminders';
import { deleteAuthUser, hasRecentLogin, reauthenticate } from './auth';
import { authProviderOf } from '../utils/authProvider';

export const BATCH_SIZE = 500;
export const PET_SUBCOLLECTIONS = ['vacunas', 'pesos', 'medicinas'];
export const USER_SUBCOLLECTIONS = ['savedTips'];

// Borra refs en lotes de <= 500. Si un lote falla (p. ej. por el tope de lecturas de las reglas
// en escrituras por lote), reintenta ese lote documento por documento.
async function deleteRefs(refs) {
  for (let i = 0; i < refs.length; i += BATCH_SIZE) {
    const chunk = refs.slice(i, i + BATCH_SIZE);
    try {
      const batch = writeBatch(db());
      chunk.forEach((ref) => batch.delete(ref));
      await batch.commit();
    } catch {
      for (const ref of chunk) await deleteDoc(ref);
    }
  }
}

async function deleteCollection(...path) {
  const snap = await getDocs(collection(db(), ...path));
  await deleteRefs(snap.docs.map((d) => d.ref));
}

export async function deleteUserData(uid) {
  const pets = await getDocs(query(collection(db(), 'pets'), where('userId', '==', uid)));
  for (const pet of pets.docs) {
    for (const sub of PET_SUBCOLLECTIONS) await deleteCollection('pets', pet.id, sub);
    await deleteDoc(doc(db(), 'pets', pet.id));
  }
  for (const sub of USER_SUBCOLLECTIONS) await deleteCollection('users', uid, sub);
  await deleteDoc(doc(db(), 'users', uid));
}

// user: usuario actual de Firebase Auth. password: solo para cuentas de correo.
// Lanza el error original (con `code`) si algo falla; si falla la reautenticación no se borró nada.
export async function deleteAccount(user, { password } = {}) {
  if (!user?.uid) throw Object.assign(new Error('no_user'), { code: 'patitas/no-user' });

  // Cuentas de correo: siempre se verifica la contraseña escrita. Google: solo si el ingreso no es reciente.
  const needsReauth = authProviderOf(user) === 'password' || !(await hasRecentLogin(user));
  if (needsReauth) await reauthenticate(user, password);

  track.accountDeleted();
  await clearAllReminders();
  await deleteUserData(user.uid);
  await clearAllReminders(); // por si un listener reprogramó algo mientras se borraban los datos
  await deleteAuthUser(user);
}
