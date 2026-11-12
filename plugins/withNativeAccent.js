// Config plugin: color de acento NATIVO (pickers de fecha/hora, botones de diálogos, controles de
// Android) en el verde de marca, en vez del teal por defecto (#008577). Solo toca el tema AppTheme.
const { withAndroidStyles } = require('expo/config-plugins');

const NAMES = ['colorPrimary', 'colorAccent', 'colorControlActivated', 'android:colorAccent'];

module.exports = function withNativeAccent(config, { color = '#2D4A3E' } = {}) {
  return withAndroidStyles(config, (cfg) => {
    const styles = cfg.modResults.resources.style ?? [];
    const app = styles.find((s) => s.$ && s.$.name === 'AppTheme');
    if (!app) return cfg;
    // La app es siempre clara (userInterfaceStyle: light): tema nativo claro, para que los diálogos y
    // pickers no salgan oscuros (verde sobre gris oscuro no se lee) cuando el teléfono está en modo oscuro.
    app.$.parent = 'Theme.AppCompat.Light.NoActionBar';
    app.item = (app.item ?? []).filter((i) => !NAMES.includes(i.$.name));
    for (const name of NAMES) app.item.push({ $: { name }, _: color });
    return cfg;
  });
};
