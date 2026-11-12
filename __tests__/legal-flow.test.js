// Integración: Perfil (sección Legal, eliminar cuenta) con el router real.
// El servicio de eliminación se mockea: aquí NO se borra nada real, solo se prueba el flujo.
import { Alert, Linking } from 'react-native';
import React from 'react';
import { fireEvent, renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Redirect, Stack } from 'expo-router';
import { Text } from 'react-native';

const mockPet = { id: 'pet1', name: 'Lirya', species: 'Gato' };
const mockAuth = {
  user: null,
  analyticsEnabled: true,
  listeners: new Set(),
  set(u) {
    mockAuth.user = u;
    mockAuth.listeners.forEach((f) => f());
  },
};
const googleUser = { uid: 'u1', displayName: 'Alejo C', email: 'a@b.co', providerData: [{ providerId: 'google.com' }] };
const passUser = { uid: 'u1', displayName: 'Alejo C', email: 'a@b.co', providerData: [{ providerId: 'password' }] };

jest.mock('../hooks/useAuth', () => {
  const R = require('react');
  return {
    useAuth: () => {
      const user = R.useSyncExternalStore(
        (cb) => {
          mockAuth.listeners.add(cb);
          return () => mockAuth.listeners.delete(cb);
        },
        () => mockAuth.user
      );
      return { user, pet: user ? mockPet : null, onboardingSeen: true, loading: false, analyticsEnabled: mockAuth.analyticsEnabled };
    },
  };
});
jest.mock('../services/auth', () => ({
  signOut: jest.fn(() => Promise.resolve()),
  authErrorMessage: () => 'Algo salió mal.',
  saveAnalyticsPreference: jest.fn(() => Promise.resolve()),
}));
jest.mock('../services/accountDeletion', () => ({ deleteAccount: jest.fn() }));
jest.mock('@expo/vector-icons', () => {
  const { Text: T } = require('react-native');
  return { Feather: ({ name }) => <T>{`icon-${name}`}</T> };
});

const { deleteAccount } = require('../services/accountDeletion');
const { saveAnalyticsPreference } = require('../services/auth');
const legal = require('../constants/legal');
const Perfil = require('../app/(main)/perfil').default;

function RootLayout() {
  const { useAuth } = require('../hooks/useAuth');
  const { user } = useAuth();
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Protected guard={!user}>
        <Stack.Screen name="login" />
      </Stack.Protected>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(main)" />
      </Stack.Protected>
    </Stack>
  );
}
const routes = () => ({
  _layout: RootLayout,
  index: () => <Redirect href="/login" />,
  login: () => <Text>PANTALLA-LOGIN</Text>,
  '(main)/_layout': () => <Stack screenOptions={{ headerShown: false }} />,
  '(main)/perfil': Perfil,
  '(main)/edit-pet': () => <Text>EDIT</Text>,
});

const press = async (el) => {
  await fireEvent.press(el);
};
const renderPerfil = (user = googleUser) => {
  mockAuth.set(user);
  return renderRouter(routes(), { initialUrl: '/perfil' });
};
// Pulsa un botón de la última Alert.alert abierta
const alertButton = (label) => {
  const calls = Alert.alert.mock.calls;
  const buttons = calls[calls.length - 1][2] ?? [];
  return buttons.find((b) => b.text === label);
};

describe('Perfil: Legal y eliminar cuenta', () => {
  let openURL;
  beforeEach(() => {
    jest.clearAllMocks();
    openURL = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    deleteAccount.mockReset();
    saveAnalyticsPreference.mockReset().mockResolvedValue();
    mockAuth.analyticsEnabled = true;
  });
  afterEach(() => jest.restoreAllMocks());

  test('muestra la sección Legal con los tres elementos', async () => {
    await renderPerfil();
    expect(screen.getByText('Legal')).toBeTruthy();
    expect(screen.getByText('Política de privacidad')).toBeTruthy();
    expect(screen.getByText('Términos y condiciones')).toBeTruthy();
    expect(screen.getByText('Eliminar cuenta')).toBeTruthy();
  });

  test('"Compartir estadísticas de uso" está activado por defecto y al apagarlo se guarda la preferencia', async () => {
    await renderPerfil();
    const sw = screen.getByTestId('switch-estadisticas');
    expect(sw.props.value).toBe(true);
    await fireEvent(sw, 'valueChange', false);
    expect(saveAnalyticsPreference).toHaveBeenCalledWith('u1', false);
    expect(screen.getByTestId('switch-estadisticas').props.value).toBe(false);
    await fireEvent(screen.getByTestId('switch-estadisticas'), 'valueChange', true);
    expect(saveAnalyticsPreference).toHaveBeenLastCalledWith('u1', true);
  });

  test('si la preferencia guardada es desactivada, el interruptor aparece apagado', async () => {
    mockAuth.analyticsEnabled = false;
    await renderPerfil();
    expect(screen.getByTestId('switch-estadisticas').props.value).toBe(false);
  });

  test('si no se puede guardar la preferencia, el interruptor vuelve a su valor y avisa', async () => {
    saveAnalyticsPreference.mockRejectedValue(new Error('offline'));
    await renderPerfil();
    await fireEvent(screen.getByTestId('switch-estadisticas'), 'valueChange', false);
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('No se pudo guardar', expect.any(String)));
    expect(screen.getByTestId('switch-estadisticas').props.value).toBe(true);
  });

  test('Política de privacidad y Términos abren su URL pública', async () => {
    await renderPerfil();
    await press(screen.getByText('Política de privacidad'));
    expect(openURL).toHaveBeenLastCalledWith(legal.URL_PRIVACIDAD);
    await press(screen.getByText('Términos y condiciones'));
    expect(openURL).toHaveBeenLastCalledWith(legal.URL_TERMINOS);
  });

  test('si no se puede abrir el enlace avisa, sin romper', async () => {
    openURL.mockRejectedValueOnce(new Error('sin navegador'));
    await renderPerfil();
    await press(screen.getByText('Política de privacidad'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalledWith('No se pudo abrir el enlace', expect.any(String)));
  });

  test('Eliminar cuenta: el primer aviso lista lo que se borra y Cancelar no hace nada', async () => {
    await renderPerfil();
    await press(screen.getByText('Eliminar cuenta'));
    expect(Alert.alert).toHaveBeenCalledTimes(1);
    const [title, msg] = Alert.alert.mock.calls[0];
    expect(title).toMatch(/Eliminar tu cuenta/);
    expect(msg).toMatch(/permanente/);
    for (const w of ['cartilla', 'vacunas', 'pesos', 'medicinas', 'tips guardados', 'recordatorios']) expect(msg).toContain(w);
    // Cancelar = no hay onPress: no se abre el modal ni se llama al servicio
    expect(alertButton('Cancelar').onPress).toBeUndefined();
    expect(screen.queryByText('Eliminar definitivamente')).toBeNull();
    expect(deleteAccount).not.toHaveBeenCalled();
  });

  test('segunda confirmación: sin escribir ELIMINAR no se elimina; Cancelar del modal tampoco elimina', async () => {
    await renderPerfil();
    await press(screen.getByText('Eliminar cuenta'));
    await React.act(async () => alertButton('Continuar').onPress());
    await press(screen.getByText('Eliminar definitivamente'));
    expect(deleteAccount).not.toHaveBeenCalled();
    await fireEvent.changeText(screen.getByLabelText('Escribe ELIMINAR'), 'ELIMIN');
    await press(screen.getByText('Eliminar definitivamente'));
    expect(deleteAccount).not.toHaveBeenCalled();
    await press(screen.getByText('Cancelar'));
    expect(deleteAccount).not.toHaveBeenCalled();
    expect(mockAuth.user).toBe(googleUser);
  });

  test('confirmar (Google): llama al servicio y la app aterriza en el login con aviso', async () => {
    deleteAccount.mockImplementation(async () => {
      mockAuth.set(null); // Firebase cierra la sesión al borrar la cuenta
    });
    await renderPerfil();
    await press(screen.getByText('Eliminar cuenta'));
    await React.act(async () => alertButton('Continuar').onPress());
    expect(screen.queryByLabelText('Tu contraseña')).toBeNull();
    await fireEvent.changeText(screen.getByLabelText('Escribe ELIMINAR'), 'eliminar');
    await press(screen.getByText('Eliminar definitivamente'));
    await waitFor(() => expect(deleteAccount).toHaveBeenCalledTimes(1));
    expect(deleteAccount).toHaveBeenCalledWith(googleUser, { password: '' });
    await waitFor(() => expect(screen.getByText('PANTALLA-LOGIN')).toBeTruthy());
    await waitFor(() => expect(Alert.alert).toHaveBeenLastCalledWith('Cuenta eliminada', expect.stringContaining('Eliminamos')));
  });

  test('cuenta de correo: pide contraseña y la pasa al servicio', async () => {
    deleteAccount.mockResolvedValue();
    await renderPerfil(passUser);
    await press(screen.getByText('Eliminar cuenta'));
    await React.act(async () => alertButton('Continuar').onPress());
    await fireEvent.changeText(screen.getByLabelText('Escribe ELIMINAR'), 'ELIMINAR');
    await press(screen.getByText('Eliminar definitivamente'));
    expect(deleteAccount).not.toHaveBeenCalled(); // falta la contraseña
    await fireEvent.changeText(screen.getByLabelText('Tu contraseña'), 'secreta1');
    await press(screen.getByText('Eliminar definitivamente'));
    await waitFor(() => expect(deleteAccount).toHaveBeenCalledWith(passUser, { password: 'secreta1' }));
  });

  test('si el servicio falla (p. ej. reautenticación cancelada): muestra el error y sigue en el perfil', async () => {
    deleteAccount.mockRejectedValue(Object.assign(new Error('x'), { code: 'patitas/reauth-cancelled' }));
    await renderPerfil();
    await press(screen.getByText('Eliminar cuenta'));
    await React.act(async () => alertButton('Continuar').onPress());
    await fireEvent.changeText(screen.getByLabelText('Escribe ELIMINAR'), 'ELIMINAR');
    await press(screen.getByText('Eliminar definitivamente'));
    await waitFor(() => expect(screen.getByText('Algo salió mal.')).toBeTruthy());
    expect(screen).toHavePathname('/perfil');
    expect(mockAuth.user).toBe(googleUser);
  });
});
