import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider,
  updateProfile,
  signOut as rnSignOut,
} from '@react-native-firebase/auth';
import {
  doc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { auth, db } from '../firebase';
import { track } from './analytics';

let googleConfigured = false;
function configureGoogle() {
  if (googleConfigured) return;
  GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  googleConfigured = true;
}

// Crea (si no existe) el documento users/{uid}. merge para no pisar datos.
async function ensureUserDoc(user, name) {
  await setDoc(
    doc(db(), 'users', user.uid),
    {
      uid: user.uid,
      name: name || user.displayName || '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? null,
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function registerWithEmail(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth(), email.trim(), password);
  try {
    if (name) await updateProfile(cred.user, { displayName: name });
    await ensureUserDoc(cred.user, name);
  } catch {
    // El perfil se puede completar después; la cuenta ya existe
  }
  track.signUp('password');
  return cred.user;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth(), email.trim(), password);
  track.login('password');
  return cred.user;
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth(), email.trim());
}

// Devuelve el usuario, o null si la persona canceló el selector de cuenta.
export async function loginWithGoogle() {
  configureGoogle();
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const response = await GoogleSignin.signIn();
  if (!isSuccessResponse(response)) return null;
  const idToken = response.data.idToken;
  if (!idToken) throw Object.assign(new Error('no_id_token'), { code: 'patitas/no-id-token' });
  const credential = GoogleAuthProvider.credential(idToken);
  const cred = await signInWithCredential(auth(), credential);
  try {
    await ensureUserDoc(cred.user);
  } catch {
    // no bloquear el ingreso
  }
  if (cred.additionalUserInfo?.isNewUser) track.signUp('google');
  else track.login('google');
  return cred.user;
}

export async function signOut() {
  try {
    configureGoogle();
    await GoogleSignin.signOut();
  } catch {
    // puede no haber sesión de Google
  }
  await rnSignOut(auth());
}

// Mensajes en español para errores de Firebase Auth / Google Sign-In
export function authErrorMessage(error) {
  const code = String(error?.code ?? '');
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no tiene un formato válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'Correo o contraseña incorrectos.';
    case 'auth/email-already-in-use':
      return 'Ya existe una cuenta con ese correo. Prueba iniciando sesión.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Usa al menos 6 caracteres.';
    case 'auth/missing-password':
      return 'Escribe tu contraseña.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
    case 'auth/operation-not-allowed':
      return 'Este método de ingreso aún no está habilitado.';
    case 'patitas/no-id-token':
      return 'No pudimos obtener tu cuenta de Google. Inténtalo de nuevo.';
    case 'PLAY_SERVICES_NOT_AVAILABLE':
      return 'Google Play Services no está disponible en este dispositivo.';
    case 'IN_PROGRESS':
      return 'Ya hay un ingreso en curso.';
    default:
      return 'Algo salió mal. Inténtalo de nuevo en unos segundos.';
  }
}
