import { Platform } from 'react-native';
import { contactSubject, contactUrl, CONTACT_PROMPT } from '../utils/contact';
import { CONTACT_EMAIL } from '../constants/legal';

jest.mock('expo-constants', () => ({ __esModule: true, default: { expoConfig: { version: '1.2.3' } } }));

describe('contacto (Escríbenos)', () => {
  const setConstants = (v) => Object.defineProperty(Platform, 'constants', { value: v, configurable: true });

  test('asunto: versión de la app, marca+modelo y versión de Android', () => {
    setConstants({ Brand: 'samsung', Model: 'SM-A546E' });
    Object.defineProperty(Platform, 'Version', { value: 34, configurable: true });
    expect(contactSubject()).toBe('Patitas v1.2.3 · samsung SM-A546E · Android 34');
  });

  test('sin modelo disponible usa un texto neutro', () => {
    setConstants({});
    expect(contactSubject()).toContain('· dispositivo ·');
  });

  test('la URL codifica asunto y cuerpo, y el cuerpo trae solo la línea guía', () => {
    setConstants({ Brand: 'Google', Model: 'Pixel 7' });
    const url = contactUrl();
    expect(url.startsWith(`mailto:${CONTACT_EMAIL}?subject=`)).toBe(true);
    expect(url).not.toMatch(/ |·/); // nada sin codificar
    const q = new URLSearchParams(url.split('?')[1]);
    expect(q.get('subject')).toBe(contactSubject());
    expect(q.get('body')).toBe(`${CONTACT_PROMPT}\n\n`);
    expect(q.get('body')).not.toMatch(/@|uid/i);
  });
});
