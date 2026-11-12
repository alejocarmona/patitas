// Mapa de rutas para renderRouter con los layouts y pantallas reales.
// OLD_LAYOUT=1 sustituye el layout por la versión antigua (pestañas ocultas
// con href:null) para comprobar que los tests de regresión fallan con el bug.
/* eslint-disable global-require */
const React = require('react');
const { Stack } = require('expo-router');

exports.build = () => {
  const screens = {
    index: () => null,
    '(main)/perfil': require('../app/(main)/perfil').default,
    '(main)/add-vacuna': require('../app/(main)/add-vacuna').default,
    '(main)/add-peso': require('../app/(main)/add-peso').default,
    '(main)/add-medicina': require('../app/(main)/add-medicina').default,
    '(main)/edit-pet': require('../app/(main)/edit-pet').default,
  };
  const tabs = {
    home: require('../app/(main)/(tabs)/home').default,
    cartilla: require('../app/(main)/(tabs)/cartilla').default,
    tips: require('../app/(main)/(tabs)/tips').default,
    directorio: () => null,
  };
  const root = { _layout: () => <Stack screenOptions={{ headerShown: false }} /> };

  if (process.env.OLD_LAYOUT) {
    const old = {};
    for (const [k, v] of Object.entries(tabs)) old[`(main)/${k}`] = v;
    return { ...root, ...screens, ...old, '(main)/_layout': require('./oldMainLayout').default };
  }
  const nested = {};
  for (const [k, v] of Object.entries(tabs)) nested[`(main)/(tabs)/${k}`] = v;
  return {
    ...root,
    ...screens,
    ...nested,
    '(main)/_layout': require('../app/(main)/_layout').default,
    '(main)/(tabs)/_layout': require('../app/(main)/(tabs)/_layout').default,
  };
};
