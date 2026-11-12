// Identidad legal de Patitas: ÚNICA fuente para la app y para las páginas web
// (scripts/build-legal.js lee este archivo). Va en CommonJS a propósito para que
// Node (el script) y Metro/Jest (la app) lo carguen igual.
//
// PENDIENTE DEL DUEÑO: completar DIRECCION y TELEFONO (Decreto 1377 art. 13 num. 1) y volver a
// correr `npm run build:legal`. Mientras alguno siga siendo un marcador '{{X}}', no publicar:
// `node scripts/build-legal.js --strict` falla.

const LEGAL_BASE_URL = 'https://patitas-alejocarmona.web.app';

module.exports = {
  APP_NAME: 'Patitas',
  RESPONSABLE_NOMBRE: 'Alejandro Carmona',
  RESPONSABLE_CIUDAD: 'Medellín, Colombia',
  CONTACT_EMAIL: 'iaentupocket+patitas@gmail.com',
  DIRECCION: '{{DIRECCION}}',
  TELEFONO: '{{TELEFONO}}',
  LEGAL_BASE_URL,
  // Fecha de la versión vigente de la política y los términos (ISO). También es la
  // versión de términos que se guarda al crear la cuenta (users/{uid}.termsVersion).
  LAST_UPDATED: '2026-11-12',
  TERMS_VERSION: '2026-11-12',
  URL_PRIVACIDAD: `${LEGAL_BASE_URL}/privacidad`,
  URL_TERMINOS: `${LEGAL_BASE_URL}/terminos`,
  URL_ELIMINAR_CUENTA: `${LEGAL_BASE_URL}/eliminar-cuenta`,
  PLACEHOLDER_EMAIL: '{{CORREO_CONTACTO}}',
  // Cuentas creadas desde esta fecha (ISO) deben tener prueba de aceptación en users/{uid}.
  TERMS_EFFECTIVE_DATE: '2026-11-12',
};
