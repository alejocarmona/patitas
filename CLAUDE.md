# CLAUDE.md — Patitas MVP

Actualizado 2026-11-12

Documento de arquitectura para Claude Code.
Lee este archivo completo antes de escribir cualquier código.
El prototipo de referencia visual está en `patitas-final.jsx`.

---

## 1. QUÉ ES PATITAS

App móvil Android para dueños de mascotas en Colombia.
Permite registrar la cartilla médica digital de la mascota, consultar
veterinarias cercanas y leer tips de cuidado.

Filosofía de MVP:
- Operación manual primero, automatización después
- Cero fricción para el usuario
- Sin mencionar cobros, precios, "gratis" ni versiones premium en ninguna pantalla
- Carnegie como principio UX: el mérito siempre es del dueño,
  el sujeto siempre es la mascota
- Sin fotos subidas: la mascota elige un avatar de un set predefinido
  empaquetado en la app

---

## 2. STACK TÉCNICO

| Capa              | Tecnología                              | Notas                        |
|-------------------|-----------------------------------------|------------------------------|
| Framework         | React Native + Expo SDK 58 (JavaScript) | Android primero              |
| Navegación        | Expo Router (file-based)                | No React Navigation directo  |
| Auth              | @react-native-firebase/auth             | Google + Email/Password      |
| Base de datos     | @react-native-firebase/firestore        | Listeners en tiempo real     |
| Avatares          | Assets locales en `assets/avatars/`     | Sin Firebase Storage         |
| Directorio vets   | Google Places API (New) — `places:searchNearby` | Con field mask (P2)  |
| Push (P2)         | Firebase Cloud Messaging                | Recordatorios vacunas        |
| Analytics         | @react-native-firebase/analytics        | Eventos de interacción       |
| Íconos            | @expo/vector-icons (Feather)            |                              |
| Fuente            | Inter via expo-font                     |                              |

Las versiones exactas de Expo Router, React Native Firebase y demás
librerías son las que fije `npx expo install` (no se fijan a mano).

Todo Firebase se usa vía **@react-native-firebase/\***. Nunca el SDK JS
(`firebase/app`, `firebase/auth`, `firebase/firestore`, `firebase/analytics`).
La configuración nativa sale de `google-services.json` (en `.gitignore`);
no hay config web de Firebase ni claves de Firebase en `.env`.

### Por qué este stack
- React Native + Expo: Alejo conoce React, el prototipo está en React
- Compilación LOCAL con Android SDK + Gradle (`npx expo run:android`),
  no EAS por ahora (RNFirebase requiere development build, no corre en Expo Go)
- Firebase: free tier generoso, FCM incluido, sin servidor propio
- iOS queda para Fase 2 post-validación de mercado

### Umbrales gratuitos Firebase
- Auth: según plan Spark vigente (verificar en consola)
- Firestore: 1 GB almacenamiento, 50,000 lecturas/día, 20,000 escrituras/día
- FCM y Analytics: gratis ilimitado

---

## 3. ESTRUCTURA DE CARPETAS

Expo Router solo enruta lo que está dentro de `app/`. Las pantallas de
stack (formularios, detalle) viven también dentro de `app/`.

```
patitas/
├── CLAUDE.md                    ← este archivo
├── patitas-final.jsx            ← prototipo referencia visual
├── app.json                     ← config Expo
├── google-services.json         ← config Firebase Android (no commitear)
├── firebase.json                ← apunta a firestore.rules
├── firestore.rules              ← reglas de seguridad
├── .env                         ← solo EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID (no commitear)
├── .env.example
│
├── app/                         ← Expo Router file-based routing
│   ├── _layout.jsx              ← root layout + AuthProvider + redirección declarativa
│   ├── index.jsx                ← punto de entrada (el layout redirige)
│   ├── onboarding.jsx           ← 3 slides onboarding
│   ├── login.jsx                ← Google + email login
│   ├── crear-mascota.jsx        ← primer perfil de mascota
│   │
│   └── (main)/                  ← zona protegida (requiere auth + mascota)
│       ├── _layout.jsx          ← <Stack> headerShown:false
│       ├── (tabs)/              ← grupo de las 4 pestañas
│       │   ├── _layout.jsx      ← <Tabs> (home, cartilla, tips, directorio) + insets
│       │   ├── home.jsx         ← inicio con resumen mascota
│       │   ├── cartilla.jsx     ← vacunas / peso / medicinas
│       │   ├── tips.jsx         ← lista tips + guardados
│       │   └── directorio.jsx   ← veterinarias cercanas
│       ├── perfil.jsx           ← pantallas del Stack (NO pestañas)
│       ├── add-vacuna.jsx
│       ├── add-peso.jsx
│       ├── add-medicina.jsx
│       └── edit-pet.jsx
│
├── components/
│   ├── ui/                      ← Button, Field, TopBar, Card, EmptyState
│   ├── home/                    ← PetCard, VaccineAlert
│   ├── cartilla/                ← VacunaItem, PesoItem, MedicinaItem
│   ├── tips/                    ← TipCard, CategoryChip
│   └── directorio/              ← VetCard
│
├── hooks/                       ← useAuth, usePet, useVacunas, usePeso, useMedicinas, ...
├── services/                    ← auth.js, analytics.js, places.js
├── utils/                       ← vacunaStatus.js (+ tests)
├── constants/                   ← theme.js, avatars.js
└── assets/
    ├── avatars/                 ← 8 avatares predefinidos
    └── images/                  ← ícono app, splash screen
```

**NUNCA** ocultar pantallas como pestañas con `options={{ href: null }}`:
en expo-router 58 eso redirige el foco a la pestaña inicial (Inicio) y los
botones "Editar", "Perfil", "Agregar vacuna/peso/medicina" dejan de navegar
(bug real del 2026-11-11). Todo lo que no sea una de las 4 pestañas va como
pantalla del `<Stack>` de `app/(main)/_layout.jsx`. Las rutas se escriben sin
grupos: `/home`, `/perfil`, `/add-vacuna`, `/edit-pet`.

Fechas: `components/ui/DateField.jsx` abre el calendario nativo
(`@react-native-community/datetimepicker`, requiere recompilar) y entrega
'YYYY-MM-DD' en fecha LOCAL (nunca `toISOString()`).

---

## 4. MODELO DE DATOS FIRESTORE

### `users/{userId}`
```json
{
  "uid": "string",
  "name": "string",
  "email": "string",
  "photoURL": "string | null",
  "createdAt": "timestamp"
}
```

### `pets/{petId}`
```json
{
  "userId": "string",
  "name": "string",
  "species": "Perro | Gato | Conejo | Ave | Otro",
  "breed": "string",
  "gender": "Macho | Hembra",
  "birthdate": "string YYYY-MM-DD",
  "avatarId": "string (id de un avatar de assets/avatars)",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

No hay fotos subidas ni Firebase Storage: solo `avatarId`.

### `pets/{petId}/vacunas/{vacunaId}`
```json
{
  "name": "string",
  "appliedDate": "string YYYY-MM-DD",
  "nextDate": "string YYYY-MM-DD | null",
  "notes": "string | null",
  "createdAt": "timestamp"
}
```

`nextDate` es OPCIONAL (`null` = esquema completo, sin vencimiento). La fecha de
aplicación (`appliedDate`) trae HOY por defecto y no puede ser futura al crear.

El `status` (`ok | pronto | vencida | completa`) NO se persiste: se calcula al leer con
`getVacunaStatus(nextDate, today)` de `utils/vacunaStatus.js` (función pura):
- `vencida`: nextDate < hoy
- `pronto`: nextDate entre hoy y hoy + 30 días (inclusive)
- `ok`: nextDate > hoy + 30 días
- `completa`: sin `nextDate` (null/''); no cuenta como vencida ni pronto, va al final de la lista

Las fechas son strings `YYYY-MM-DD` interpretadas en hora LOCAL. Nunca usar
`new Date('YYYY-MM-DD')` (parsea como UTC y en Colombia corre un día).

### `pets/{petId}/pesos/{pesoId}`
```json
{
  "value": "number en kg",
  "date": "string YYYY-MM-DD",
  "createdAt": "timestamp"
}
```

### `pets/{petId}/medicinas/{medicinaId}`
```json
{
  "name": "string",
  "dose": "string",
  "frequency": "string (legible, generado: 'Cada 8 horas desde las 08:00')",
  "intervalValue": "number >= 1",
  "intervalUnit": "'horas' | 'dias'",
  "firstDoseTime": "string HH:mm (24 h, local)",
  "startDate": "string YYYY-MM-DD",
  "durationDays": "number | null (null = sin fin)",
  "endDate": "string | null (DERIVADO: último día = startDate + durationDays - 1)",
  "reminders": "boolean",
  "notes": "string | null",
  "active": "boolean",
  "createdAt": "timestamp"
}
```

Medicinas anteriores solo traen `frequency` de texto libre: se muestran tal cual,
sin recordatorios (`hasStructuredSchedule` en `utils/reminders.js`). Al editarlas
se pide elegir la frecuencia estructurada.

### Recordatorios (notificaciones LOCALES, sin servidor)
`expo-notifications` (requiere recompilar). Canal Android `recordatorios` (importancia
alta). La lógica pura vive en `utils/reminders.js` (`computeDoseTimes`,
`computeVaccineReminderTimes`); `services/reminders.js` programa/cancela y
`hooks/useReminders.js` (montado en `(main)/_layout`) reconcilia contra Firestore al abrir
la app, al volver a primer plano y cuando cambian los datos. Decisiones:
- Ventana móvil de 14 días, máx. 64 notificaciones por medicina (Android limita ~500 alarmas).
- Los IDs de notificación por ítem van en AsyncStorage (`reminders.v1`), NO en Firestore;
  se cancelan al editar/borrar/finalizar y se limpian los huérfanos.
- Vacunas con `nextDate`: 7 días antes y el mismo día, 09:00 (solo futuros).
- `endDate` se mantiene derivado de `durationDays` (compatibilidad con la lista); la fuente es `durationDays`.
- Alarmas exactas: NO se declara SCHEDULE_EXACT_ALARM/USE_EXACT_ALARM (restringidos por Play; en
  Android 14 vienen denegados). Consecuencia medida en el Moto: la alarma es inexacta y llegó
  ~2 min 24 s tarde. Si se necesita puntualidad, usar `delivery: 'alarmClock'` + permiso.
- Permiso POST_NOTIFICATIONS: se pide al activar/guardar un recordatorio por primera vez, con un
  texto previo (`services/reminderPrompt.js`). Si lo niega, el ítem se guarda y el formulario avisa
  que los recordatorios están apagados.

### `tips/{tipId}` — solo lectura para usuarios, gestión via Firebase Console

```json
{
  "title": "string",
  "excerpt": "string",
  "detail": ["string"],
  "category": "Alimentación | Cuidado | Higiene | Salud",
  "emoji": "string",
  "likes": "number",
  "publishedAt": "timestamp",
  "active": "boolean",
  "order": "number | null"
}
```

**Campos clave:**
- `active`: inhabilitar tip sin eliminarlo. `false` = no aparece en app,
  historial de interacciones permanece intacto. NUNCA eliminar documentos.
- `publishedAt`: controla el orden de visualización. Puedes crear un tip hoy
  con fecha futura para publicarlo después.
- `order`: campo opcional para forzar posición manual independiente de fecha.
  Si es `null`, se ordena por `publishedAt desc`.
- `likes`: contador incrementado con `firestore.FieldValue.increment(1)` —
  nunca sobrescribir directamente para evitar condiciones de carrera.

**Query de carga en app** (requiere índice compuesto `active` + `publishedAt`;
Firestore muestra el enlace para crearlo la primera vez):
```javascript
import firestore from '@react-native-firebase/firestore';

firestore()
  .collection('tips')
  .where('active', '==', true)
  .orderBy('publishedAt', 'desc')
  .get();
```

**Gestión de tips (sin panel de admin en MVP):**
1. Redactar tip con Claude en claude.ai
2. Entrar a Firebase Console → Firestore → colección `tips`
3. Crear documento con ID automático
4. Completar todos los campos
5. Para inhabilitar: cambiar `active` a `false`
6. Para despublicar temporalmente: cambiar `publishedAt` a fecha futura

**Tips iniciales a poblar:** los 6 del prototipo `patitas-final.jsx`
en la constante `TIPS_DATA`. Copiar `title`, `excerpt`, `detail`,
`category`, `emoji`. Agregar `likes: 0`, `active: true`,
`publishedAt: now()`, `order: null`.

### `users/{userId}/savedTips/{tipId}`
```json
{
  "tipId": "string",
  "savedAt": "timestamp"
}
```

### `users/{userId}/tipLikes/{tipId}` — evitar doble like
```json
{
  "tipId": "string",
  "likedAt": "timestamp"
}
```

Cuando usuario da like:
1. Verificar que `users/{uid}/tipLikes/{tipId}` no existe
2. Si no existe: crear el documento + `FieldValue.increment(1)` en el tip
3. Si existe: ignorar silenciosamente (idempotente)

Nota: como `tips` es de solo escritura por consola, el incremento de `likes`
desde el cliente requiere una regla específica (solo permitir cambiar `likes`
en +1) o moverlo a una Cloud Function. Resolver en la Fase 4.

### Reglas de seguridad Firestore (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      match /{sub}/{docId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }

    match /pets/{petId} {
      allow create: if request.auth != null
        && request.resource.data.userId == request.auth.uid;
      allow read, update, delete: if request.auth != null
        && resource.data.userId == request.auth.uid;

      match /vacunas/{id} {
        allow read, write: if request.auth != null
          && get(/databases/$(database)/documents/pets/$(petId)).data.userId == request.auth.uid;
      }
      match /pesos/{id} {
        allow read, write: if request.auth != null
          && get(/databases/$(database)/documents/pets/$(petId)).data.userId == request.auth.uid;
      }
      match /medicinas/{id} {
        allow read, write: if request.auth != null
          && get(/databases/$(database)/documents/pets/$(petId)).data.userId == request.auth.uid;
      }
    }

    match /tips/{tipId} {
      allow read: if request.auth != null;
      allow write: if false; // solo via Firebase Console
    }
  }
}
```

Importante: en reglas, `resource.data` no existe en un `create`, por eso
`create` usa `request.resource.data`. Las subcolecciones NO heredan permisos
del padre: cada una verifica la propiedad con `get()` sobre `pets/{petId}`.
Las reglas se despliegan con `firebase deploy --only firestore:rules` una
vez creada la base de datos (región us-east1).

---

## 5. AUTENTICACIÓN

Proveedores Firebase: Google Sign-In + Email/Password, ambos vía
`@react-native-firebase/auth` y `@react-native-google-signin/google-signin`
(el Web Client ID va en `.env` como `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`).

La navegación es **declarativa**: `app/_layout.jsx` mantiene el estado
(`user`, `pet`, `onboardingSeen`, `loading`) en un `AuthProvider` y renderiza
`<Redirect>` según el estado. No se llama a `router.replace` desde un
callback de auth.

```javascript
// Estados en app/_layout.jsx
// loading                    → splash
// sin sesión, !onboardingSeen → /onboarding
// sin sesión, onboardingSeen  → /login
// con sesión, sin mascota     → /crear-mascota
// con sesión y mascota        → /home

useEffect(() => {
  AsyncStorage.getItem('onboardingSeen').then((v) => setSeen(v === 'true'));
  return auth().onAuthStateChanged((u) => setUser(u));
}, []);
```

Al completar onboarding: `AsyncStorage.setItem('onboardingSeen', 'true')`
Al cerrar sesión: `auth().signOut()` → el layout redirige a `/login`

---

## 6. ANALYTICS — FIREBASE ANALYTICS

`@react-native-firebase/analytics`. Gratis e ilimitado. No requiere
colecciones adicionales en Firestore. Captura automáticamente: sesiones,
pantallas, usuarios nuevos vs recurrentes. La retención la calcula GA4:
NO crear un evento de retención propio.

### Eventos personalizados (nombres en inglés)

```javascript
import analytics from '@react-native-firebase/analytics';

analytics().logEvent('sign_up', { method });            // 'google' | 'password'
analytics().logEvent('login', { method });
analytics().logEvent('onboarding_completed', { skipped });
analytics().logEvent('pet_profile_created', { species, avatar_id });
analytics().logEvent('vaccine_added', { status });      // ok | pronto | vencida | completa
analytics().logEvent('weight_added');
analytics().logEvent('medicine_added');
analytics().logEvent('cartilla_viewed', { tab, has_overdue });
analytics().logEvent('overdue_vaccine_seen');
analytics().logEvent('reminder_enabled', { type });          // 'medicine' | 'vaccine'
analytics().logEvent('notification_permission', { granted }); // boolean
analytics().setUserProperty('pet_species', species);
```

Eventos de tips y directorio se definen al implementar esas fases.

### Dónde ver los datos
Firebase Console → Analytics → Events
Los eventos tardan hasta 24 horas en aparecer.
Para depuración en tiempo real: Firebase Console → Analytics → DebugView
(`adb shell setprop debug.firebase.analytics.app com.alejocarmona.patitas`).

### Qué no hacer
- Nunca loguear PII (nombre, email, cédula, nombre de la mascota)
- No loguear más de 500 tipos de eventos distintos
- No crear colección propia de eventos en Firestore para MVP

---

## 7. DIRECTORIO DE VETERINARIAS (P2)

### Flujo
1. Usuario abre Directorio
2. `expo-location` solicita permiso `foreground`
3. Si denegado → pantalla de estado con instrucciones
4. Con permiso → `Location.getCurrentPositionAsync()`
5. Llamar Places API (New) `places:searchNearby`
6. Mostrar lista ordenada por distancia
7. Llamar → `Linking.openURL('tel:NUMERO')`
8. Cómo llegar → `Linking.openURL('https://maps.google.com/?q=DIRECCION')`

### Places API (New)
El crédito mensual de USD 200 ya no existe (cambió en marzo 2025: hoy hay
cupos gratuitos por SKU). La Nearby Search legacy (`maps/api/place/nearbysearch`)
no se habilita en proyectos nuevos. Usar **Places API (New)** con POST y
**field mask** (solo se paga/consume lo pedido):

```javascript
// services/places.js
const KEY = process.env.EXPO_PUBLIC_PLACES_API_KEY;

export async function getNearbyVets(lat, lng, radius = 5000) {
  const res = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask':
        'places.id,places.displayName,places.formattedAddress,places.rating,' +
        'places.userRatingCount,places.currentOpeningHours.openNow,' +
        'places.nationalPhoneNumber,places.location',
    },
    body: JSON.stringify({
      includedTypes: ['veterinary_care'],
      maxResultCount: 20,
      languageCode: 'es',
      locationRestriction: {
        circle: { center: { latitude: lat, longitude: lng }, radius },
      },
    }),
  });
  if (!res.ok) throw new Error(`places_${res.status}`);
  const data = await res.json();
  return (data.places ?? []).map((p) => ({
    id: p.id,
    name: p.displayName?.text,
    address: p.formattedAddress,
    rating: p.rating,
    reviews: p.userRatingCount,
    open: p.currentOpeningHours?.openNow ?? null,
    phone: p.nationalPhoneNumber ?? null,
    lat: p.location.latitude,
    lng: p.location.longitude,
  }));
}
```

Pedir `nationalPhoneNumber` sube el SKU de facturación; evaluar al implementar.
La API key (`EXPO_PUBLIC_PLACES_API_KEY`) va en `.env`, restringida a Android
(package + SHA-1) en Google Cloud Console antes de publicar.

Cache: guardar resultado en estado + timestamp, no rellamar si
han pasado menos de 10 minutos.

---

## 8. TEMA VISUAL

Trasladar exactamente desde el prototipo `patitas-final.jsx`
a `constants/theme.js`:

```javascript
export const theme = {
  primary: '#FF6B35',
  primaryDark: '#E5521A',
  secondary: '#2D4A3E',
  accent: '#FFD166',
  bg: '#FDF6F0',
  text: '#1A1A2E',
  textMuted: '#7A7A9A',
  textLight: '#B0B0C8',
  success: '#4CAF82',
  danger: '#FF4757',
  border: '#F0E8E0',
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const radius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 28,
};
```

Fuente: Inter en todos sus pesos via `@expo-google-fonts/inter`.
Nunca usar la fuente del sistema — siempre Inter.

---

## 9. VARIABLES DE ENTORNO

Archivo `.env` en raíz — NUNCA commitear (hay un `.env.example`):
```
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=
EXPO_PUBLIC_PLACES_API_KEY=
```

Firebase NO usa variables de entorno: su configuración sale de
`google-services.json` (nativo). El Web Client ID de Google se obtiene en
Firebase Console → Authentication → Sign-in method → Google, y requiere
registrar el SHA-1 / SHA-256 de la app en la configuración Android del proyecto.

Acceso: `process.env.EXPO_PUBLIC_*`.

---

## 10. ORDEN DE IMPLEMENTACIÓN

Seguir fases en orden. Confirmar criterio de pausa antes de avanzar.

### Fase 1 — Fundación
- [x] Scaffold Expo SDK 58 + Expo Router + RNFirebase
- [x] `constants/theme.js`
- [x] Helpers de Firebase (RNFirebase)
- [x] Onboarding 3 slides con AsyncStorage flag
- [x] Login Google + email (cableado)
- [x] Redirección declarativa en `app/_layout.jsx`

**Pausa cuando:** login con Google funciona en dispositivo Android
(requiere Auth habilitado en consola + SHA-1 registrado)

### Fase 2 — Mascota
- [x] Formulario crear mascota con selector de avatar → Firestore
- [x] Home con datos reales de Firestore
- [x] Editar mascota

**Pausa cuando:** usuario crea mascota, datos persisten al reiniciar

### Fase 3 — Cartilla
- [x] Tab Cartilla con 3 subtabs (Vacunas / Peso / Medicinas)
- [x] CRUD vacunas con cálculo de status al leer
- [x] CRUD registros de peso
- [x] CRUD medicamentos
- [ ] Botón "Encuentra veterinaria" en vacuna vencida → tab Directorio

**Pausa cuando:** los tres subtabs funcionan con datos reales

### Fase 4 — Tips
- [ ] Poblar Firestore con los 6 tips del prototipo via Console
- [ ] Lista de tips con filtro por categoría
- [ ] Tab "Guardados" con contador
- [ ] Guardar/desguardar (subcolección savedTips)
- [ ] Pantalla detalle de tip

### Fase 5 — Directorio (P2)
- [ ] Permiso de ubicación con manejo de denegación
- [ ] Integrar Places API (New)
- [ ] Lista veterinarias ordenada por distancia
- [ ] Botones Llamar y Cómo llegar

### Fase 6 — Perfil y pulido
- [ ] Pantalla Perfil con ajustes y cerrar sesión con confirmación
- [ ] Loading / empty / error states en todas las pantallas
- [x] Recordatorios con notificaciones locales (`expo-notifications`, sin servidor)
- [ ] Push remoto FCM (P2, opcional)

### Fase 7 — Publicación
- [ ] Íconos y splash screen definitivos; reemplazar avatares placeholder
- [ ] Firestore rules desplegadas
- [ ] Restricción de API keys en Google Cloud Console
- [ ] Build de release firmado (local con Gradle, o EAS si se decide)
- [ ] Subir a Google Play (internal testing)

---

## 11. CONVENCIONES DE CÓDIGO

- JavaScript (no TypeScript)
- Componentes: PascalCase, archivos `.jsx`
- Hooks: camelCase con prefijo `use`, archivos `.js`
- Servicios: camelCase, archivos `.js`
- Todo el texto visible en español; eventos de Analytics en inglés
- Estilos como objetos inline (no StyleSheet.create)
  para mantener consistencia con el prototipo
- Un componente por archivo
- Props siempre destructuradas
- Listeners Firestore con `onSnapshot`, no `get`
  para datos que deben actualizarse en tiempo real
- `get()` solo para datos estáticos (tips)

---

## 12. DEPENDENCIAS

Instalar siempre con `npx expo install` para que fije versiones compatibles
con SDK 58:

```bash
npx expo install expo-router expo-linking expo-constants expo-status-bar \
  expo-font @expo-google-fonts/inter @expo/vector-icons expo-build-properties \
  react-native-safe-area-context react-native-screens \
  react-native-gesture-handler react-native-reanimated react-native-worklets \
  @react-native-async-storage/async-storage \
  @react-native-firebase/app @react-native-firebase/auth \
  @react-native-firebase/firestore @react-native-firebase/analytics \
  @react-native-google-signin/google-signin
```

Para P2 se sumará `expo-location` (directorio). `expo-notifications` ya está instalada
(recordatorios locales).

Tests: `jest-expo` + `jest`; `npm test`.

---

## 13. NOTAS CRÍTICAS PARA CLAUDE CODE

1. No usar `expo-cli` global — siempre `npx`
2. No usar React Navigation directo — solo Expo Router
3. Datos remotos siempre via hooks personalizados con Firestore,
   nunca `useState` manual con fetch
4. El prototipo `patitas-final.jsx` es la fuente de verdad visual.
   Ante cualquier duda de diseño, consultar ese archivo
5. Android únicamente en MVP — no configurar nada de iOS
6. Confirmar criterio de pausa de cada fase antes de continuar
7. API key de Places restringida a Android en Google Cloud Console
   antes de publicar
8. No existe modo "permisivo" de reglas: las reglas de `firestore.rules`
   son las de producción desde el primer despliegue
9. `.env` y `google-services.json` en `.gitignore` desde el primer commit
10. Tips se cargan desde Firestore — no están hardcodeados en el código
11. Un solo pet por usuario en MVP — la query es:
    `where('userId', '==', uid).limit(1)`
12. Sin premium, precios ni la palabra "gratis" en ninguna pantalla
13. RNFirebase no funciona en Expo Go: siempre development build
    (`npx expo run:android`)

---

## 14. PRUEBAS OBLIGATORIAS POR VERSIÓN

Antes de dar por buena cualquier versión, correr las 3 capas:

1. **Unitarias (Jest)** — `npx jest` (utils: fechas, estado de vacunas incl. `completa`, `utils/reminders` con `computeDoseTimes`/`computeVaccineReminderTimes`, `DateField`).
2. **Integración de navegación (Jest + `expo-router/testing-library`)** —
   `__tests__/navigation.test.js`: un test por bug reportado (Editar → /edit-pet,
   Perfil → /perfil, Agregar vacuna/peso/medicina → su pantalla, guardar → vuelve
   a /cartilla, pestañas). Usa los layouts y pantallas reales (`test-helpers/routes.js`)
   con Firebase/auth/analytics mockeados. `OLD_LAYOUT=1 npx jest __tests__/navigation`
   carga el layout antiguo (pestañas con `href: null`) y debe FALLAR: prueba de que
   los tests cazan el bug. Todo bug nuevo reportado por el dueño añade aquí su test.
   `__tests__/reminders-flow.test.js`: vacuna sin próxima dosis ("Completa"), medicina con
   recordatorio (N llamadas a `scheduleNotificationAsync`), editar/borrar (cancela los IDs previos),
   permiso denegado y toque de notificación. Mockea `expo-notifications`
   (`test-helpers/notificationsMock.js`) y AsyncStorage; jest-expo usa timers falsos: para
   esperar promesas usar `await Promise.resolve()` en bucle, no `setTimeout`; los `fireEvent` se `await`an.
3. **E2E en dispositivo (Maestro)** — `npm run test:e2e` (`maestro test .maestro`)
   con el Moto por USB y la app debug instalada, ya con sesión iniciada:
   `.maestro/navegacion.yaml`, `.maestro/formularios.yaml`, `.maestro/vacuna-completa.yaml` y
   `.maestro/medicina-recordatorio.yaml` (los flujos que crean datos borran SOLO su ítem de prueba con
   `below:`; la cartilla real del dueño tiene datos. Generan capturas con
   `takeScreenshot` para revisar barra inferior y teclado; usar `--test-output-dir`).
   Instalar Maestro CLI (Windows): descargar
   `https://github.com/mobile-dev-inc/maestro/releases/latest/download/maestro.zip`,
   descomprimir, añadir `maestroin` al PATH; requiere Java 17+ y adb.
   En debug, el toast "Open debugger to view warnings" puede tapar la barra inferior.

4. **Prueba real de notificación en el dispositivo** (al tocar recordatorios): crear una medicina con la
   primera toma a 2-3 min, esperar (la alarma es inexacta: puede tardar ~2-3 min más), verificar con
   `adb shell dumpsys notification --noredact | grep -i patitas`, y tras borrar la medicina confirmar
   `adb shell dumpsys alarm | grep -c "Alarm{.*com.alejocarmona.patitas}"` = 0.

Si cambia código nativo (dependencias): recompilar
`cd android && gradlew assembleDebug -PreactNativeArchitectures=arm64-v8a`
e instalar con `adb install -r`.
