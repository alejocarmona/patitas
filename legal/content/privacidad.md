<!-- BORRADOR pendiente de revisión del dueño. No es asesoría legal. Puntos a confirmar antes de publicar: (1) completar TELEFONO en constants/legal.js (el domicilio es solo la ciudad, decisión del dueño); (2) región de Firestore us-east1 en la consola; (3) que el formulario de Seguridad de los datos de Google Play coincida con esta política; (4) la configuración de retención de Google Analytics en la consola de Firebase (14 meses); (5) volver a generar las páginas con npm run build:legal; (6) confirmar en Analytics → Configuración de la cuenta → Data sharing settings que el intercambio de datos con Google esté desactivado -->
# Política de privacidad y tratamiento de datos personales

Última actualización: {{LAST_UPDATED_ES}}

{{APP_NAME}} es una aplicación para Android que te ayuda a llevar la cartilla de salud de tu mascota, ver veterinarias cerca de ti y leer tips de cuidado. Esta política explica qué datos personales trata la app, para qué, quién los procesa y cómo puedes ejercer tus derechos según la Ley 1581 de 2012 y el Decreto 1377 de 2013 (hoy compilado en el Decreto 1074 de 2015) de Colombia.

## 1. Quién es el responsable

- **Responsable del tratamiento:** {{RESPONSABLE_NOMBRE}}, persona natural.
- **Ciudad:** {{RESPONSABLE_CIUDAD}}.
- **Domicilio:** {{RESPONSABLE_CIUDAD}}.
- **Teléfono:** {{TELEFONO}}.
- **Correo para consultas, reclamos y solicitudes:** [{{CONTACT_EMAIL}}](mailto:{{CONTACT_EMAIL}}).

Esa misma persona atiende las consultas y reclamos sobre tus datos.

## 2. Qué datos tratamos

**Datos de tu cuenta**
- Tu correo electrónico y un identificador interno de la cuenta.
- Tu nombre. Si ingresas con Google, tomamos el nombre y la dirección de la foto de perfil de tu cuenta de Google. Si te registras con correo, el nombre que escribes.
- Si te registras con correo y contraseña, la contraseña la guarda y protege Firebase Authentication; {{APP_NAME}} no puede verla.
- La fecha en que aceptaste los Términos y esta política y su versión, la fecha de creación de tu cuenta y los registros de ingreso que guarda Firebase Authentication.

**Datos de tu mascota**
- Nombre, especie, raza, género, fecha de nacimiento y el avatar que elegiste. {{APP_NAME}} no sube fotos.

**Cartilla de salud que tú registras**
- Vacunas (nombre, fecha de aplicación, próxima dosis y notas), pesos con su fecha y medicinas (nombre, dosis, frecuencia, fechas, notas y si quieres recordatorios).

**Tips guardados**
- Los tips de cuidado que marcas como guardados.

**Recordatorios**
- Los recordatorios de vacunas y medicinas se programan en tu celular. Los identificadores y el contenido de los recordatorios (nombre de tu mascota, medicina, dosis y horario) se guardan solo en tu celular y no se incluyen en copias de seguridad.

**Ubicación**
- Cuando abres o actualizas el Directorio y aceptas el permiso, la app lee la ubicación de tu celular (como máximo cada pocos minutos; mientras tanto reutiliza la última lista) y la envía a Google Maps Platform (Places API) para buscar veterinarias a menos de 5 km. {{APP_NAME}} no guarda tu ubicación en sus servidores ni en tu cuenta; solo guarda en la memoria de la app, por unos minutos, la lista de veterinarias recibida.

**Uso de la app (Firebase Analytics)**
- Eventos de uso asociados a identificadores seudónimos del dispositivo, sin tu nombre, tu correo ni el nombre de tu mascota. Por ejemplo: registro e ingreso (y el método usado), onboarding completado, mascota creada (especie y avatar), vacuna, peso o medicina agregados, pestañas de la cartilla vistas, recordatorios activados, tips abiertos o guardados (con su categoría), directorio visto (solo un rango del número de resultados), llamadas y rutas hacia una veterinaria (sin indicar cuál), si aceptaste o negaste los permisos, y la eliminación de la cuenta.
- Firebase Analytics también registra de forma automática eventos como la primera apertura, las sesiones y las pantallas vistas, y estima tu ciudad o país aproximados a partir de la dirección IP.
- La especie de tu mascota como propiedad de usuario.
- No enviamos a Analytics tu nombre, correo, el nombre de tu mascota, tu ubicación ni nombres de veterinarias.
- Puedes dejar de compartir estas estadísticas en cualquier momento: en Perfil, desactiva "Compartir estadísticas de uso".

**Identificadores del dispositivo**
- Los servicios de Google que usa la app (Firebase) pueden generar identificadores de instalación y de dispositivo, y recoger datos técnicos como modelo, versión de Android, idioma y país aproximado. La app no usa el ID de publicidad de Android ni muestra publicidad.

**Datos sensibles**
- {{APP_NAME}} no te pide datos sensibles (como origen racial, orientación sexual, convicciones, datos biométricos o tu propia salud). La información de salud de tu mascota no es un dato sensible tuyo según el artículo 5 de la Ley 1581. Te pedimos no escribir datos sensibles tuyos ni de otras personas en las notas ni en otros campos de texto libre.

## 3. Para qué usamos tus datos (finalidades)

- Crear y mantener tu cuenta, y que puedas ingresar.
- Guardar y mostrarte la cartilla y el perfil de tu mascota.
- Programar los recordatorios que pides.
- Mostrarte veterinarias cercanas.
- Mostrarte tips según la especie de tu mascota y recordar los que guardaste.
- Entender cómo se usa la app para mejorarla, con estadísticas de uso asociadas a identificadores seudónimos.
- Atender tus consultas, reclamos y solicitudes, y cumplir obligaciones legales.

No vendemos tus datos, no los cedemos a terceros con fines comerciales y {{APP_NAME}} no tiene publicidad.

## 4. Base legal: tu autorización

Tratamos tus datos con tu autorización previa, expresa e informada, que das al crear tu cuenta o ingresar aceptando los Términos y esta política. Guardamos la fecha y la versión de lo que aceptaste. Puedes revocar tu autorización total o parcialmente. La revocatoria total implica eliminar tu cuenta (ver sección 9). Para dejar de compartir estadísticas de uso, desactiva "Compartir estadísticas de uso" en Perfil.

## 5. Quiénes procesan tus datos y con qué rol

**Google como encargado del tratamiento** (trata los datos por cuenta de {{APP_NAME}}):

- **Firebase Authentication:** ingreso con Google y con correo y contraseña.
- **Cloud Firestore:** base de datos donde se guardan tu cuenta, tu mascota, la cartilla y tus tips guardados. Está ubicada en Estados Unidos (región us-east1).
- **Firebase Analytics:** estadísticas de uso.

**Google como responsable independiente** (trata los datos para sus propios fines, bajo su propia política de privacidad, [https://policies.google.com/privacy](https://policies.google.com/privacy)):

- **Google Maps Platform (Places API):** búsqueda de veterinarias cercanas. Google recibe las coordenadas de tu consulta y tu dirección IP.
- **Google Sign-In:** si eliges ingresar con tu cuenta de Google.

## 6. Transmisión y transferencia internacionales

- **Transmisión** (artículo 3 del Decreto 1377 de 2013): tus datos se transmiten a servidores de Google en Estados Unidos (Firestore, región us-east1) y en otros países donde Google opera, para que los trate como encargado por cuenta de {{APP_NAME}}.
- **Transferencia:** tus datos se transfieren a Google, que actúa como responsable, cuando usas el Directorio (Google Maps Platform) o ingresas con Google.

Lo hacemos con tu autorización. Estados Unidos está en la lista de países con nivel adecuado de protección de la Superintendencia de Industria y Comercio (Circular Externa 005 de 2017) y Google aplica sus propios términos de protección de datos.

## 7. Vigencia y cuánto tiempo guardamos tus datos

- Esta política rige desde el {{LAST_UPDATED_ES}}. La base de datos de {{APP_NAME}} estará vigente mientras la app esté en operación; tus datos se conservan según lo que sigue.
- Los datos de tu cuenta y de tu mascota (Firestore y Authentication) se conservan mientras tu cuenta esté activa y se eliminan cuando la eliminas.
- Las copias de seguridad de Google se eliminan por completo en un plazo de hasta unos 180 días después de la eliminación.
- Los datos de Firebase Analytics a nivel de evento se conservan hasta 14 meses como máximo, asociados a identificadores seudónimos del dispositivo y no a tu nombre ni a tu correo.
- Podremos conservar lo estrictamente necesario para cumplir una obligación legal o atender un reclamo.

## 8. Seguridad

- Cada persona solo puede leer y modificar sus propios datos: las reglas de seguridad de Firestore lo exigen en el servidor.
- La comunicación entre la app y los servicios de Google va cifrada (HTTPS/TLS).
- Ningún sistema es 100 % infalible. Si ocurre un incidente que afecte tus datos, actuaremos según la ley.

## 9. Tus derechos como titular

Según la Ley 1581 de 2012 puedes:

- **Conocer** los datos que tenemos sobre ti.
- **Actualizarlos y rectificarlos** si están incompletos o son inexactos. Puedes editar tu mascota y tu cartilla directamente en la app.
- **Solicitar prueba de la autorización** que nos diste.
- **Ser informado** del uso que damos a tus datos.
- **Revocar la autorización, total o parcialmente, y pedir la supresión** de tus datos.
- **Presentar quejas ante la Superintendencia de Industria y Comercio (SIC)** por infracciones a la ley, una vez hayas agotado la consulta o el reclamo ante el responsable.
- **Acceder gratuitamente** a tus datos.

Estos derechos los puede ejercer el titular, sus causahabientes o su representante o apoderado (acreditando esa calidad).

### Cómo ejercerlos

- **Eliminar tu cuenta y tus datos:** en la app, en Perfil → Eliminar cuenta. También puedes pedirlo por correo (ver [Eliminar cuenta](/eliminar-cuenta)).
- **Dejar de compartir estadísticas de uso:** en Perfil, desactiva "Compartir estadísticas de uso".
- **Cualquier otra solicitud:** escribe a [{{CONTACT_EMAIL}}](mailto:{{CONTACT_EMAIL}}) desde el correo con el que creaste tu cuenta, indicando qué quieres hacer.

### Qué debe llevar un reclamo

Un reclamo (corregir, actualizar o suprimir datos, o revocar la autorización) debe incluir:

- Tu identificación (nombre y correo de la cuenta).
- La descripción de los hechos que dan lugar al reclamo.
- Una dirección para recibir la respuesta.
- Los documentos que quieras hacer valer.

Si el reclamo está incompleto, dentro de los 5 días hábiles siguientes a su recepción te pediremos que corrijas lo que falta. Si pasan 2 meses desde ese requerimiento sin que entregues la información, entenderemos que desististe del reclamo.

### Tiempos de respuesta

- **Consultas:** respondemos en máximo 10 días hábiles. Si no es posible, te avisamos el motivo y la nueva fecha, que no superará 5 días hábiles adicionales.
- **Reclamos:** respondemos en máximo 15 días hábiles. Si no es posible, te avisamos el motivo y la nueva fecha, que no superará 8 días hábiles adicionales.

## 10. Menores de edad

{{APP_NAME}} está dirigida a personas mayores de edad que cuidan mascotas. No está dirigida a menores de 18 años y no recogemos a propósito datos de niños, niñas ni adolescentes. La Ley 1581 prohíbe tratar datos de menores salvo los de naturaleza pública y los que respondan a su interés superior. Si sabes que un menor creó una cuenta sin la autorización de su representante, escríbenos y la eliminaremos.

## 11. Permisos de la app

- **Notificaciones:** para avisarte de las vacunas y medicinas que programas. Se pide la primera vez que activas un recordatorio. Si lo niegas, la app sigue funcionando sin recordatorios.
- **Ubicación (mientras usas la app):** solo para mostrar veterinarias cercanas. Puedes elegir ubicación aproximada o precisa. Si la niegas, el Directorio no puede buscar veterinarias, pero el resto de la app funciona. Puedes cambiar estos permisos en los ajustes de Android.

## 12. Cambios a esta política

Te informaremos los cambios importantes en la app o por correo antes de aplicarlos, y te pediremos de nuevo tu autorización si cambian las finalidades. La nueva versión se publica en esta página con su fecha de actualización.

## 13. Contacto

{{RESPONSABLE_NOMBRE}} · {{RESPONSABLE_CIUDAD}} · {{TELEFONO}} · [{{CONTACT_EMAIL}}](mailto:{{CONTACT_EMAIL}})
