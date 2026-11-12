const fs = require('fs');
const path = require('path');
const { apply } = require('../plugins/withReleaseSigning');

const GRADLE = `android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
            minifyEnabled true
        }
    }
}
`;

describe('withReleaseSigning', () => {
  test('inyecta signingConfig release y selección condicional', () => {
    const out = apply(GRADLE);
    expect(out).toContain("project.hasProperty('PATITAS_UPLOAD_STORE_FILE')");
    expect(out).toContain('signingConfigs.release : signingConfigs.debug');
    expect(out).not.toContain('Caution!');
    expect(out).toContain('minifyEnabled true');
  });
  test('es idempotente', () => {
    const once = apply(GRADLE);
    expect(apply(once)).toBe(once);
  });
  test('está registrado en app.json y el SHA-1 release es distinto del debug', () => {
    const { expo } = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'));
    expect(expo.plugins).toContain('./plugins/withReleaseSigning');
    expect(expo.extra.androidCertSha1Release).toMatch(/^[0-9A-F]{40}$/);
    expect(expo.extra.androidCertSha1Release).not.toBe(expo.extra.androidCertSha1);
  });
});
