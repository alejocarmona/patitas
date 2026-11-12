#!/usr/bin/env node
// Siembra/actualiza la colección `tips` de Firestore desde seed/tips.json.
// Las reglas dejan `tips` en write:false para clientes, así que se escribe con
// privilegios de admin vía la REST API de Firestore, usando la sesión de firebase-tools
// (`firebase login`). Nunca imprime tokens.
//
//   node scripts/seed-tips.js            # siembra
//   node scripts/seed-tips.js --dry-run  # solo muestra qué haría
//
// Idempotente: el ID del documento es el slug del título. Si el tip ya existe solo se
// actualizan los campos de contenido (title, excerpt, detail, category, emoji, species);
// NO se tocan active / publishedAt / order (pueden haberse editado en la consola).
const fs = require('fs');
const os = require('os');
const path = require('path');

const PROJECT = process.env.FIREBASE_PROJECT || 'patitas-alejocarmona';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const CONTENT_FIELDS = ['title', 'excerpt', 'detail', 'category', 'emoji', 'species'];

const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);

function toValue(v) {
  if (v === null) return { nullValue: null };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toValue) } };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  return { stringValue: String(v) };
}

// Credenciales públicas del cliente OAuth de firebase-tools (no son secretas del proyecto).
function oauthClient() {
  if (process.env.FIREBASE_CLIENT_ID && process.env.FIREBASE_CLIENT_SECRET) {
    return { id: process.env.FIREBASE_CLIENT_ID, secret: process.env.FIREBASE_CLIENT_SECRET };
  }
  const roots = [
    process.env.APPDATA && path.join(process.env.APPDATA, 'npm', 'node_modules', 'firebase-tools'),
    path.join(process.cwd(), 'node_modules', 'firebase-tools'),
  ].filter(Boolean);
  for (const r of roots) {
    try {
      const api = require(path.join(r, 'lib', 'api.js'));
      return { id: api.clientId(), secret: api.clientSecret() };
    } catch {
      // siguiente ruta
    }
  }
  throw new Error('No se encontró firebase-tools instalado (npm i -g firebase-tools) ni FIREBASE_CLIENT_ID/SECRET.');
}

async function getAccessToken() {
  const file = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
  const refresh = JSON.parse(fs.readFileSync(file, 'utf8'))?.tokens?.refresh_token;
  if (!refresh) throw new Error('No hay sesión de firebase-tools: ejecuta `firebase login`.');
  const { id, secret } = oauthClient();
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh, client_id: id, client_secret: secret }),
  });
  if (!res.ok) throw new Error(`No se pudo obtener el access token (HTTP ${res.status}). Reintenta \`firebase login\`.`);
  return (await res.json()).access_token;
}

async function main() {
  const dry = process.argv.includes('--dry-run');
  const tips = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'seed', 'tips.json'), 'utf8'));
  const ids = tips.map((t) => slug(t.title));
  if (new Set(ids).size !== ids.length) throw new Error('Slugs duplicados en seed/tips.json');
  if (dry) {
    tips.forEach((t, i) => console.log(`${ids[i]}  [${t.species}/${t.category}]`));
    console.log(`${tips.length} tips (dry-run, no se escribió nada)`);
    return;
  }
  const token = await getAccessToken();
  const auth = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
  const now = new Date();
  let created = 0;
  let updated = 0;
  for (let i = 0; i < tips.length; i += 1) {
    const t = tips[i];
    const url = `${BASE}/tips/${ids[i]}`;
    const exists = (await fetch(url, { headers: auth })).status === 200;
    const fields = {};
    CONTENT_FIELDS.forEach((k) => { fields[k] = toValue(t[k]); });
    let target = url;
    if (exists) {
      target += '?' + CONTENT_FIELDS.map((k) => `updateMask.fieldPaths=${k}`).join('&');
    } else {
      fields.active = toValue(true);
      fields.publishedAt = toValue(now);
      fields.order = toValue(null);
    }
    const res = await fetch(target, { method: 'PATCH', headers: auth, body: JSON.stringify({ fields }) });
    if (!res.ok) throw new Error(`Falló ${ids[i]}: HTTP ${res.status} ${(await res.text()).slice(0, 200)}`);
    if (exists) updated += 1; else created += 1;
  }
  console.log(`Listo: ${created} creados, ${updated} actualizados (${tips.length} tips) en ${PROJECT}.`);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
