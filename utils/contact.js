// "Escríbenos": arma el mailto de contacto. Sin PII: solo versión de la app, modelo del equipo y
// versión de Android (lo que ayuda a reproducir un problema). Sin módulos nativos nuevos.
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { CONTACT_EMAIL } from '../constants/legal';

export const CONTACT_PROMPT = 'Cuéntanos qué pasó o qué te gustaría ver:';

export function contactSubject() {
  const version = Constants?.expoConfig?.version || '?';
  const c = Platform.constants || {};
  const device = [c.Brand, c.Model].filter(Boolean).join(' ') || 'dispositivo';
  return `Patitas v${version} · ${device} · Android ${Platform.Version ?? '?'}`;
}

export function contactUrl(email = CONTACT_EMAIL) {
  const body = `${CONTACT_PROMPT}\n\n`;
  // encodeURIComponent codifica espacios como %20 y solo asunto y cuerpo se codifican;
  // el destinatario va tal cual (mailto admite "+").
  return `mailto:${email}?subject=${encodeURIComponent(contactSubject())}&body=${encodeURIComponent(body)}`;
}
