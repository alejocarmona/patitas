// Config plugin: firma de RELEASE con la llave de subida, leída de propiedades de Gradle
// (PATITAS_UPLOAD_STORE_FILE / _STORE_PASSWORD / _KEY_ALIAS / _KEY_PASSWORD, normalmente en
// ~/.gradle/gradle.properties, fuera del repo). Si faltan, release cae a la firma debug con un aviso.
// Idempotente: usa marcadores para no duplicar el bloque en prebuilds sucesivos.
const { withAppBuildGradle } = require('expo/config-plugins');

const START = '// @patitas-release-signing-start';
const END = '// @patitas-release-signing-end';

const SIGNING_BLOCK = `        ${START}
        release {
            if (project.hasProperty('PATITAS_UPLOAD_STORE_FILE')) {
                storeFile file(project.property('PATITAS_UPLOAD_STORE_FILE'))
                storePassword project.property('PATITAS_UPLOAD_STORE_PASSWORD')
                keyAlias project.property('PATITAS_UPLOAD_KEY_ALIAS')
                keyPassword project.property('PATITAS_UPLOAD_KEY_PASSWORD')
            }
        }
        ${END}
`;

const SELECT_LINE = `            ${START}-select
            signingConfig project.hasProperty('PATITAS_UPLOAD_STORE_FILE') ? signingConfigs.release : signingConfigs.debug
            if (!project.hasProperty('PATITAS_UPLOAD_STORE_FILE')) {
                logger.warn('AVISO: PATITAS_UPLOAD_* no definidas; la build release se firma con la llave DEBUG.')
            }
            ${END}-select`;

function apply(src) {
  if (src.includes(START)) return src; // ya aplicado
  // 1) signingConfig release, justo antes de cerrar signingConfigs (tras el bloque debug).
  const sc = /(signingConfigs\s*\{\s*debug\s*\{[\s\S]*?\n        \}\n)(    \})/;
  if (!sc.test(src)) throw new Error('withReleaseSigning: no se encontró signingConfigs.debug en build.gradle');
  src = src.replace(sc, (_, a, b) => a + SIGNING_BLOCK + b);
  // 2) en buildTypes.release, reemplazar la selección de firma debug.
  const rel = /(buildTypes\s*\{[\s\S]*?release\s*\{[\s\S]*?)(?:[ \t]*\/\/ Caution![^\n]*\n[ \t]*\/\/ see [^\n]*\n)?[ \t]*signingConfig signingConfigs\.debug/;
  if (!rel.test(src)) throw new Error('withReleaseSigning: no se encontró signingConfig debug en buildTypes.release');
  src = src.replace(rel, (_, a) => a + SELECT_LINE);
  return src;
}

module.exports = function withReleaseSigning(config) {
  return withAppBuildGradle(config, (cfg) => {
    cfg.modResults.contents = apply(cfg.modResults.contents);
    return cfg;
  });
};
module.exports.apply = apply;
