import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithCredential,
  GoogleAuthProvider,
  updateProfile,
  signOut as rnSignOut,
  EmailAuthProvider,
  reauthenticateWithCredential,
  getIdTokenResult,
  deleteUser,
} from '@react-native-firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from '@react-native-firebase/firestore';
import { GoogleSignin, isSuccessResponse } from '@react-native-google-signin/google-signin';
import { auth, db } from '../firebase';
import { track, setAnalyticsEnabled } from './analytics';
import { TERMS_VERSION, TERMS_EFFECTIVE_DATE } from '../constants/legal';
import { authProviderOf } from '../utils/authProvider';

let googleConfigured = false;
function configureGoogle() {
  if (googleConfigured) return;
  GoogleSignin.configure({ webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID });
  googleConfigured = true;
}

// Crea (si no existe) el documento users/{uid}. merge para no pisar datos.
// `isNew`: solo en un registro nuevo se guarda la aceptación de términos (Ley 1581:
// autorización previa). A usuarios existentes no se les escribe ni se les bloquea.
async function ensureUserDoc(user, name, isNew = false) {
  await setDoc(
    doc(db(), 'users', user.uid),
    {
      uid: user.uid,
      name: name || user.displayName || '',
      email: user.email ?? '',
      photoURL: user.photoURL ?? null,
      // createdAt solo en el alta: con merge, escribirlo en cada ingreso lo pisaba.
      ...(isNew
        ? { createdAt: serverTimestamp(), acceptedTermsAt: serverTimestamp(), termsVersion: TERMS_VERSION }
        : {}),
    },
    { merge: true }
  );
}

// Reintenta una vez y, si sigue fallando, deja el error en el log (no se traga en silencio).
// La prueba de aceptación se repara en el siguiente ingreso (ensureConsentProof).
async function ensureUserDocWithRetry(user, name, isNew) {
  try {
    await ensureUserDoc(user, name, isNew);
  } catch (first) {
    try {
      // Reintento sin reescribir acceptedTermsAt (las reglas lo hacen inmutable): la prueba la
      // escribe ensureConsentProof solo si falta.
      await ensureUserDoc(user, name, false);
      if (isNew) await ensureConsentProof(user);
    } catch (second) {
      console.error('[consent] no se pudo crear users/{uid}', second?.code ?? first?.code ?? second);
    }
  }
}

// Prueba de autorización (Ley 1581 art. 17 b): en cada ingreso, si la cuenta es posterior a la
// versión de términos y users/{uid} no tiene acceptedTermsAt, se escribe. Las cuentas anteriores
// (sin términos) no se tocan. Las reglas impiden modificarlo una vez escrito.
export async function ensureConsentProof(user) {
  try {
    const created = Date.parse(user?.metadata?.creationTime);
    if (!Number.isFinite(created) || created < Date.parse(TERMS_EFFECTIVE_DATE)) return false;
    const ref = doc(db(), 'users', user.uid);
    const snap = await getDoc(ref);
    const data = snap.exists() ? snap.data() : null;
    if (data?.acceptedTermsAt) return false;
    await setDoc(
      ref,
      {
        uid: user.uid,
        ...(data ? {} : { name: user.displayName || '', email: user.email ?? '', photoURL: user.photoURL ?? null, createdAt: serverTimestamp() }),
        acceptedTermsAt: serverTimestamp(),
        termsVersion: TERMS_VERSION,
      },
      { merge: true }
    );
    return true;
  } catch (e) {
    console.error('[consent] no se pudo registrar la aceptación', e?.code ?? e);
    return false;
  }
}

export async function registerWithEmail(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth(), email.trim(), password);
  try {
    if (name) await updateProfile(cred.user, { displayName: name });
  } catch {
    // El nombre se puede completar después; la cuenta ya existe
  }
  await ensureUserDocWithRetry(cred.user, name, true);
  track.signUp('password');
  return cred.user;
}

export async function loginWithEmail(email, password) {
  const cred = await signInWithEmailAndPassword(auth(), email.trim(), password);
  await ensureConsentProof(cred.user);
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
  const isNew = !!cred.additionalUserInfo?.isNewUser;
  await ensureUserDocWithRetry(cred.user, undefined, isNew);
  if (!isNew) await ensureConsentProof(cred.user);
  if (cred.additionalUserInfo?.isNewUser) track.signUp('google');
  else track.login('google');
  return cred.user;
}

// "Compartir estadísticas de uso": se aplica de inmediato y se guarda en users/{uid}.analyticsEnabled.
export async function saveAnalyticsPreference(uid, enabled) {
  setAnalyticsEnabled(enabled);
  try {
    await setDoc(doc(db(), 'users', uid), { analyticsEnabled: !!enabled }, { merge: true });
  } catch (e) {
    setAnalyticsEnabled(!enabled); // vuelve al estado anterior si no se pudo guardar
    throw e;
  }
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

// ---- Reautenticación (eliminar cuenta) ----
const RECENT_LOGIN_MS = 4 * 60 * 1000; // Firebase exige un ingreso de menos de ~5 min

// Verdadero si el ingreso es reciente y no hace falta reautenticar.
export async function hasRecentLogin(user) {
  try {
    const res = await getIdTokenResult(user);
    const t = Date.parse(res?.authTime);
    return Number.isFinite(t) && Date.now() - t < RECENT_LOGIN_MS;
  } catch {
    return false;
  }
}

// Reautentica a la persona (Google: vuelve a elegir cuenta; correo: contraseña).
// Lanza con code 'patitas/reauth-cancelled' si cancela el selector de Google.
export async function reauthenticate(user, password) {
  const provider = authProviderOf(user);
  if (provider === 'password') {
    const credential = EmailAuthProvider.credential(user.email, password ?? '');
    await reauthenticateWithCredential(user, credential);
    return;
  }
  if (provider === 'google') {
    configureGoogle();
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) throw Object.assign(new Error('cancelled'), { code: 'patitas/reauth-cancelled' });
    const idToken = response.data.idToken;
    if (!idToken) throw Object.assign(new Error('no_id_token'), { code: 'patitas/no-id-token' });
    await reauthenticateWithCredential(user, GoogleAuthProvider.credential(idToken));
    return;
  }
  throw Object.assign(new Error('unsupported_provider'), { code: 'patitas/unsupported-provider' });
}

export async function deleteAuthUser(user) {
  await deleteUser(user);
  try {
    configureGoogle();
    await GoogleSignin.signOut();
  } catch {
    // puede no haber sesión de Google
  }
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
    case 'patitas/reauth-cancelled':
      return 'Cancelaste la verificación. No se eliminó nada.';
    case 'auth/user-mismatch':
      return 'Esa no es la cuenta con la que ingresaste. No se eliminó nada.';
    case 'auth/requires-recent-login':
      return 'Por seguridad, vuelve a ingresar e inténtalo de nuevo.';
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
