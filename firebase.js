// Helpers de Firebase con @react-native-firebase (API modular).
// La configuración nativa sale de google-services.json; no hay config web.
import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';
import { getAnalytics } from '@react-native-firebase/analytics';

export const app = () => getApp();
export const auth = () => getAuth(getApp());
export const db = () => getFirestore(getApp());
export const analyticsInstance = () => getAnalytics(getApp());
