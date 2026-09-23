# Documentación del proyecto — Punti

> Este documento es la **memoria del proyecto**: qué estamos construyendo, cómo está
> armado por dentro, qué decisión se tomó en cada bifurcación y por qué.
>
> **Se actualiza por tandas.** Cada vez que se completa un bloque de trabajo se agrega
> una entrada nueva al final de la bitácora. **Nunca se borra ni se reescribe lo anterior** —
> una decisión que cambió se marca como reemplazada, no se elimina.
>
> Hay una versión visual de este mismo documento publicada como artifact, para leerla
> cómodo desde cualquier dispositivo. Las dos deben mantenerse en sintonía; si solo se
> actualiza una, que sea esta.
>
> (Ver también `CLAUDE.md` en esta misma carpeta: contexto operativo para Claude Code.)

**Última actualización:** 2026-09-23 · **Fase actual:** 2.1 en curso

> Para el detalle de qué se tocó en cada sesión, ver `CAMBIOS.md`.

---

## 1. Qué es Punti

**Punti es una app web gratuita para aprender Inteligencia Artificial jugando**, al estilo
Duolingo, pero en vez de un camino vertical de niveles te da un universo para explorar.
Cada tema es un planeta, cada lección es un punto en la superficie de ese planeta, y
Punti — la mascota — es quien te guía.

| | |
|---|---|
| **Para quién** | Gente que no programa: profesionales, creadores y curiosos que quieren entender la IA de verdad y usarla en su trabajo, sin jerga técnica ni cursos de seis horas. |
| **Qué promete** | Lecciones de pocos minutos: explicación corta con gráfico, ejercicios interactivos, quiz, y progreso que se guarda. Se avanza en ratos sueltos. |
| **Qué la diferencia** | El universo se explora, no se recorre. No hay una fila de niveles: hay un mapa galáctico navegable. Arrastras, haces zoom, aterrizas en el planeta que te interesa. |
| **Modelo** | Gratis por ahora. Todo corre en planes gratuitos (Vercel, Firebase Spark). El único costo real hoy es el dominio. |

**El concepto:** *el universo lo creó Punti*. No es un universo genérico donde Punti es un
guía turístico: Punti armó cada planeta para que aprendas sin marearte. Eso explica por qué
está en el centro del mapa en lugar de un sol, y por qué habla en primera persona sobre el
mundo que te rodea.

---

## 2. Identidad visual

### 2.1 La mascota

**Punti** (unidad UNIT-001) es un astronauta-robot chibi retro-futurista que flota en el
espacio sobre un hoverboard morado. Visor rectangular tipo casco, parches de NASA y SpaceX,
ojos rectangulares entrecerrados y media sonrisa. Personalidad: gamer retro, sarcástico con
cariño, celebra los logros a lo grande.

Existe una hoja de personaje con **10 estados** posibles. Hoy hay arte exportado en PNG para
6, que son los que la app usa:

| Estado | Archivo | Cuándo aparece |
|---|---|---|
| Boot | `punti-boot.png` | Arranque, pantallas de carga inicial |
| Online | `punti-online.png` | Estado normal, reposo |
| Loading | `punti-loading.png` | Mientras se guarda o se pide algo |
| Level Up | `punti-levelup.png` | Al completar una lección |
| Low Battery | `punti-battery.png` | Al fallar, al quedarse sin corazones |
| Hype | `punti-hype.png` | Celebración, racha, acierto grande |

Los 4 restantes están diseñados pero sin exportar: **Glitch**, **Encrypted**,
**Signal Lost** y **God Mode**. Viven en la hoja de personaje para cuando haya un momento en
la app que los justifique.

### 2.2 Paleta

Definida como variables CSS en `src/app/globals.css`. El verde Matrix es dominante; los demás
son acentos con un trabajo específico cada uno.

| Token | Color | Uso |
|---|---|---|
| verde Matrix | `#00FF41` | Dominante · Punti · acierto |
| morado | `#B400FF` | Hoverboard · secundario |
| rosa | `#FF006E` | Acento · error · contraste |
| amarillo | `#FFE600` | XP · logros |
| cyan | `#00F5FF` | UI · HUD · enlaces |
| fondo | `#050510` | El vacío |

### 2.3 Tipografías

Cinco fuentes de Google Fonts, cargadas en `src/app/layout.tsx`. Cada una tiene un trabajo;
usarlas fuera de su trabajo rompe el sistema.

| Fuente | Para qué | Variable CSS |
|---|---|---|
| **Orbitron** | Títulos épicos, nombres de planeta | `--font-orbitron` |
| **VT323** | La voz de Punti, mensajes de sistema, HUD | `--font-vt323` |
| **Rajdhani** | Navegación, botones, encabezados de UI | `--font-rajdhani` |
| **Press Start 2P** | Solo logros puntuales, con mucha moderación | `--font-press-start` |
| **Inter** | Todo el texto que se lee de corrido | `--font-inter` |

**Detalle que importa:** las etiquetas que flotan sobre la galaxia llevan halo oscuro
(`paint-order: stroke fill` con un trazo del color del fondo). Sin eso, cuando un planeta pasa
por detrás de un nombre, el nombre desaparece.

---

## 3. Cómo se navega

Tres niveles, y cada uno usa la forma que le corresponde.

```
MUNDOS  →  PLANETA  →  LECCIÓN + EJERCICIOS
/inicio    /tema/[id]   /leccion/[temaId]/[subtemaId]
```

### 3.1 Los mundos — `MundosPunti.tsx`

La pantalla principal. Una tarjeta por tema, en una columna en celular, dos en
tablet y tres en escritorio. Cada tarjeta lleva su planeta dibujado, el nombre
propio del mundo, el rango al que corresponde y el avance en porcentaje.

**Aquí no hay nada que arrastrar.** Se toca y se entra.

> **Esto reemplazó a un mapa galáctico** que se arrastraba y se acercaba con
> los dedos (`MapaGalaxia.tsx`, 702 líneas, eliminado). Funcionaba en un
> monitor y se rompía en un celular: apuntarle a un planeta que se mueve es
> una interacción de escritorio disfrazada de app. Si alguien propone volver a
> ese mapa, esta es la razón por la que se fue.

### 3.2 Los planetas — `PlanetaPixel.tsx` + `planetaSprite.ts`

Un planeta no es un archivo de imagen: **se genera a partir del `id` del
tema**. Mismo tema, mismo mundo, siempre — y un tema nuevo trae su mundo sin
que nadie tenga que ilustrarlo.

- Se dibuja a 76 px reales y se amplía con `image-rendering: pixelated`. Por
  eso se ve igual de nítido en un celular que en un monitor.
- Cinco familias: rocoso, gaseoso, oceánico, volcánico y helado. De la semilla
  salen también los anillos, las lunas, los cráteres y la inclinación del eje.
- **La luz del borde es del color complementario, no blanca.** Eso es lo que
  hace que se lean como neón y no como planetas de libro de ciencias.

### 3.3 El mundo por dentro — `RutaTema.tsx` (antes el globo `PlanetaTema.tsx`)

Globo girable en canvas, con las lecciones repartidas en espiral sobre la
esfera. Tiene un interruptor GLOBO / LISTA, y la preferencia se recuerda en
`localStorage` con la clave `punti-vista-tema`.

### 3.4 La lección — la consola de transmisión

La explicación no es un bloque de texto: es un HUD con marco de esquinas,
barra de progreso segmentada, Punti al costado reaccionando, y el texto
apareciendo tecleado como una transmisión que llega.

### 3.5 Los ejercicios

Cinco tipos en `Ejercicio.tsx`. La lección pasa por cuatro fases:
`cargando → explicacion → ejercicios → resultado`, con una quinta salida si te
quedas sin gasolina (`sin-gasolina`).

### 3.6 El manual de vuelo — `ComoFunciona.tsx`

Cinco pantallas completas, una por paso, con Punti grande en el estado que
corresponde. **Cada paso muestra lo que explica** en vez de solo contarlo:
planetas reales, una consola con su cursor, un ejercicio con su respuesta
marcada, los tres rangos encadenados, la gasolina y la racha.

Es componente y no página a propósito, porque se muestra en dos sitios: en
`/como-funciona` y en el registro de gente nueva. Un solo texto, dos lugares.

## 4. Arquitectura

| Pieza | Versión | Trabajo |
|---|---|---|
| **Next.js** (App Router) | 16.3.5 | El armazón: páginas, rutas, renderizado |
| **React** | 19.2.8 | Los componentes de interfaz |
| **TypeScript** | 5.x | Avisa de errores antes de que la app corra |
| **Tailwind CSS** | 4.x | Los estilos, escritos directo en el marcado |
| **Firebase Auth** | 12.19 | Registro y login (correo + Google) |
| **Firebase Firestore** | 12.19 | Base de datos del progreso — región São Paulo |
| **Vercel** | — | Publicación automática y dominio |
| **GitHub** | — | Historial del código |

**Comparado con WordPress:** Next.js es WordPress mismo (el sistema), React es Elementor (cómo
armas las piezas visuales), Vercel es el hosting, GitHub es un historial de versiones infinito,
y Firebase es la base de datos con el sistema de usuarios ya incluido.

### 4.1 Reglas técnicas que no se pueden romper

Estas están calibradas. Cambiarlas rompe cosas que ya costó arreglar una vez.

**La proyección esférica del globo**

```js
const proyectar = (lat, lon) => {
  const cl = Math.cos(lat), sl = Math.sin(lat), a = lon + rot;
  const x = cl * Math.sin(a), y = sl, z = cl * Math.cos(a);
  const ct = Math.cos(inclinacion), st = Math.sin(inclinacion);
  return { x: cx + x * R, y: cy - (y*ct - z*st) * R, z: y*st + z*ct };
};
// z > 0 es el hemisferio de frente. La z también escala y opaca los nodos —
// eso es lo que da la sensación de profundidad.
```

**La curva de entrada al planeta — va al revés a propósito**

```js
const p = 1 - Math.pow(1 - animT, 3);  // posición: easeOut
const e = animT * animT * animT;       // zoom: easeIn
vista.z = desde.z * Math.pow(zObjetivo / desde.z, e);
```

Un zoom que **frena** se siente como una ventana que se abre. Uno que **acelera** se siente
como caer hacia algo. Queremos lo segundo. Durante la transición hay que congelar las órbitas
(si el planeta sigue moviéndose se escapa de la cámara) y desvanecer todo menos el planeta
destino (si la galaxia entera crece contigo, marea).

**El trazo que no se escala**

Las órbitas y los anillos usan `vector-effect="non-scaling-stroke"`. Sin eso, con el zoom al
0.3x el trazo queda en 0.3px y desaparece.

**React: qué va en `useRef` y qué en `useState`**

- El bucle de animación va en `useEffect`, con su `cancelAnimationFrame` en la limpieza.
- La cámara (`vista`), el ángulo de giro y la inclinación van en **`useRef`**. Cambian cada
  cuadro y no deben disparar render — si van en `useState`, son cientos de renders por segundo.
- `useState` solo para lo que sí cambia la interfaz: tema seleccionado, lección elegida, modo.
- El canvas necesita `devicePixelRatio` y un `ResizeObserver`, no `window.resize`.
- Los nodos de lección son `<button>` reales por accesibilidad, posicionados con `transform`
  cada cuadro. No se convierten en dibujos de canvas.
- Nada de `setState` dentro del cuerpo de un efecto (lo prohíbe ESLint). Para leer
  `localStorage` se usa `useSyncExternalStore`.
- Se respeta `prefers-reduced-motion` en toda animación.

---

## 5. Mapa de archivos

```
C:\Proyectos\UniverseAI          (la carpeta sigue llamándose así por dentro)
├─ CLAUDE.md                     memoria de contexto para Claude Code
├─ DOCUMENTACION.md              este documento: el porqué de cada cosa
├─ CAMBIOS.md                    qué se tocó en cada sesión
├─ .env.local                    claves de Firebase — NUNCA se sube a GitHub
├─ firestore.rules               reglas de seguridad de la base de datos
├─ public/punti/                 los 6 PNG de Punti (portada y momentos grandes)
└─ src/
   ├─ app/
   │  ├─ page.tsx                portada pública
   │  ├─ login/ · registro/      entrar y crear cuenta
   │  ├─ inicio/page.tsx         los mundos, el manual y las preguntas
   │  ├─ como-funciona/          el manual de vuelo
   │  ├─ tema/[id]/page.tsx      el planeta por dentro
   │  ├─ leccion/[temaId]/[subtemaId]/page.tsx   la lección + quiz
   │  ├─ layout.tsx              fuentes, metadatos, envoltura global
   │  └─ globals.css             variables de color, clases y animaciones
   ├─ components/
   │  ├─ MundosPunti.tsx         la pantalla de mundos
   │  ├─ PlanetaPixel.tsx        un planeta en canvas
   │  ├─ PuntiPixel.tsx          Punti en pixel art
   │  ├─ Punti.tsx               Punti ilustrado (los PNG)
   │  ├─ ComoFunciona.tsx        el manual en cinco pantallas
   │  ├─ PreguntasFrecuentes.tsx el acordeón de FAQ
   │  ├─ PlanetaTema.tsx         el globo girable
   │  ├─ Ejercicio.tsx           los 5 tipos de ejercicio
   │  ├─ GraficoExplicacion.tsx  tablas y flujos
   │  ├─ BotonGoogle.tsx
   │  └─ FondoEspacial.tsx       el polvo cósmico
   └─ lib/
      ├─ puntiSprite.ts         Punti dibujado con rectángulos (9 estados)
      ├─ planetaSprite.ts       los mundos, generados desde el id del tema
      ├─ rangos.ts              Explorador, Capitán, Arquitecto
      ├─ temas.ts               los 7 mundos y sus subtemas
      ├─ lecciones.ts           el contenido de las lecciones
      ├─ progreso.ts            XP, combustible, gasolina, racha
      ├─ userProfile.ts         leer y escribir el perfil en Firestore
      ├─ AuthContext.tsx        quién está logueado, en toda la app
      ├─ authErrors.ts          traducir errores de Firebase al español
      ├─ frasesFeedback.ts      lo que dice Punti al acertar o fallar
      └─ firebase.ts            la conexión
```

**Los dos archivos de sprite (`puntiSprite.ts` y `planetaSprite.ts`) no saben
nada de React a propósito.** Son funciones puras que dibujan sobre un canvas,
así que se pueden compilar y probar solas, sin navegador.

## 6. Contenido y datos

### 6.1 Los 7 mundos

Cada mundo tiene **nombre propio** (lo que se ve grande), **tema** (lo que
enseña) y **rango** (para quién es).

| # | Mundo | Tema | Rango | Subtemas |
|---|---|---|---|---|
| 01 | **Origen** | Qué es la IA | Explorador | 5 |
| 02 | **Lexia** | Modelos de lenguaje | Explorador | 4 |
| 03 | **Eco** | Prompts | Explorador | 4 |
| 04 | **Forja** | Herramientas de IA para el trabajo | Capitán | 3 |
| 05 | **Prisma** | Crear imágenes y video con IA | Capitán | 4 |
| 06 | **Brújula** | Ética y seguridad | Capitán | 3 |
| 07 | **Autómata** | Automatizaciones | Arquitecto | 3 |

Los nombres no son decorativos: **Eco** porque hablas y te responde, **Forja**
porque ahí se trabaja, **Prisma** porque la luz se descompone en imagen y
video, **Brújula** porque la ética dice por dónde sí y por dónde no.

Son **26 subtemas**. Hoy solo `que-es-la-ia / definicion` tiene lección
escrita; el resto aparece como "en obra".

### 6.1.1 Los tres rangos — `rangos.ts`

| Rango | Nombre completo | En el chip | Color |
|---|---|---|---|
| `explorador` | Explorador espacial | EXPLORADOR | verde |
| `capitan` | Capitán de estación | CAPITÁN | cian |
| `arquitecto` | Arquitecto de galaxias | ARQUITECTO | morado |

Cada rango guarda dos formas del nombre a propósito: el largo va en el perfil,
el corto va en la tarjeta. "Capitán de estación espacial" no cabe en un chip
sin partirse en dos renglones.

### 6.2 DECISIÓN DE PRODUCTO — sin candados secuenciales

**El contenido no es acumulativo, así que no hay candados secuenciales en ninguna parte.**
Se puede entrar a cualquier planeta y a cualquier lección en el orden que se quiera. Un subtema
solo se ve bloqueado si todavía no tiene lección escrita — no porque "no hayas llegado".
Esto también está documentado dentro de `temas.ts` para que nadie lo revierta por accidente.

### 6.3 Tipos

```ts
type Tema = {
  id: string;        // "que-es-la-ia"
  numero: number;
  titulo: string;
  descripcion: string;
  subtemas: Subtema[];
};

type Subtema = {
  id: string;        // "definicion"
  numero: number;
  titulo: string;
  descripcion: string;
};

type Leccion = {
  explicacion: PantallaExplicacion[];   // cada pantalla con su estadoPunti
                                        // y un grafico opcional
  ejercicios: Ejercicio[];              // 5 tipos disponibles
  tiempoObjetivoSegundos: number;       // para el bono de +5 XP
  tarea: string;                        // qué hacer en la vida real
};
```

### 6.4 Qué se guarda en Firestore

Colección `usuarios`, un documento por persona, con: nombre, correo, XP acumulado, corazones,
racha y fecha de última actividad. Las reglas de seguridad (`firestore.rules`) garantizan que
**cada usuario solo puede leer y escribir su propio documento**, nunca el de otra persona.

Desde la fase 4.0 (paso 1), además, dentro de su propio perfil cada persona solo puede cambiar
los campos del juego, y con límites:

| Campo | Qué puede hacer el usuario |
|---|---|
| `xp` | Solo subir, máximo 20 por escritura |
| `corazones` (gasolina) | El mismo día solo bajar; en un día nuevo, recargar hasta 5 |
| `ultimaActividad` | Solo la fecha de hoy según el reloj del servidor (margen de 2 h) |
| `ultimaLeccion` | Solo la fecha de hoy. Es la fecha de la racha |
| `racha` | Solo con la primera lección completada de un día nuevo: +1 o volver a 1 |
| `progreso` | Como mucho una lección nueva por escritura |
| `idioma` | `es` o `en` |
| `bienvenidaVista` | Solo pasar a `true` |
| todo lo demás (premium, rol…) | Nada. Solo el admin |

- **Admin**: `camilovanegasm@gmail.com`, y solo con el correo verificado (entrar con Google lo
  verifica). Puede leer todos los perfiles y cambiar cualquier campo.
- Un perfil nuevo tiene que nacer en cero (0 XP, 5 de gasolina, racha 0, sin progreso).
- Nadie puede borrar perfiles desde la app.
- **Lo que las reglas no pueden impedir**: que alguien con conocimientos repita escrituras
  válidas (por ejemplo, sumar 20 XP varias veces sin hacer la lección). Cerrar eso del todo exige
  que el servidor calcule el XP. Para el tamaño actual alcanza; se revisa si aparece un ranking.
- La versión anterior de las reglas está en `referencias/firestore.rules.anterior`.

---

### 6.5 De dónde sale el contenido — el editor (fase 5.1)

Desde la fase 5.1 el contenido (mundos, lecciones, ejercicios) vive en Firebase
y se edita en **/admin/contenido**, sin tocar código.

| En Firebase | Qué es | Quién lo lee | Quién lo escribe |
|---|---|---|---|
| `contenido/catalogo` | Los mundos publicados, su orden y sus lecciones | Cualquiera (también sin cuenta) | Admin |
| `lecciones/{id}` | Cada lección publicada | Cualquiera | Admin |
| `borradores/catalogo` | Los mundos como los está editando el admin | Admin | Admin |
| `borradores/leccion-{id}` | Cada lección en edición | Admin | Admin |

- **Borrador y publicado.** Todo se guarda solo como borrador (1,2 s después del
  último cambio). Los estudiantes no ven nada hasta que se toca PUBLICAR. Los
  mundos se publican desde la lista; cada lección, desde su editor.
- **Antes de publicar se valida**: los dos idiomas llenos, una respuesta correcta
  marcada, al menos 2 opciones o pasos… La lista de faltas dice dónde está cada
  una y los campos vacíos se marcan en rosa.
- **Vista previa jugable** en español e inglés, sin gastar gasolina.
- **Mientras no se importe**, la app usa lo escrito en `temas.ts` y
  `lecciones.ts`. También si Firebase no responde. Después de importar, Firebase
  manda y esos dos archivos quedan solo como respaldo y semilla.
- **Formato**: cada texto se guarda con sus dos idiomas juntos (`{ es, en }`). La
  app sigue recibiendo una lección por idioma (`aLeccion` en `contenido.ts`), así
  que el quiz no cambió. Firebase no admite listas dentro de listas: las filas de
  las tablas se guardan como `{ a, b }`.
- **Los ids no cambian nunca.** El progreso de cada estudiante se guarda con el id
  de la lección; cambiar el título no cambia el id. Se generan del título al
  crear la lección y no se repiten.
- Quitar una lección o un mundo de la lista no borra la lección publicada de
  Firebase: solo deja de aparecer.
- Archivos: `src/lib/contenido.ts` (lectura, tipos, conversiones),
  `src/lib/contenidoAdmin.ts` (borradores, validación, publicar),
  `src/app/admin/contenido/` (pantallas), `src/components/admin/` (marco, campos,
  vista previa).

## 7. Reglas del juego

Toda esta lógica vive en `src/lib/progreso.ts`, separada de la interfaz. Se
puede ajustar el balance del juego sin tocar ni una pantalla.

- **Gasolina** (antes "corazones"): arrancas con 5. Fallar un ejercicio cuesta
  una; pedir una pista cuesta media. Si se acaba, el viaje se pausa hasta el
  día siguiente. Se recarga sola cada día.
- **Combustible de la lección** (no es lo mismo que la gasolina): 3/3 si la
  completas sin errores, 2/3 con 1 o 2, 1/3 con 3 o más.
- **XP**: 15 con combustible 3, 10 con 2, 5 con 1. Más **+5** de bono si
  terminas dentro del tiempo objetivo.
- **Racha**: sube 1 con actividad en días consecutivos, se mantiene si ya
  contaste hoy, y vuelve a 1 si pasó más de un día.

> **El campo guardado en Firestore se sigue llamando `corazones`.** Renombrarlo
> obligaría a migrar los datos de las cuentas que ya existen, y ese nombre no lo
> ve nadie. En toda la interfaz y en todas las funciones se llama gasolina.

## 8. Decisiones y porqués

Esta es la sección más importante del documento. Si en seis meses alguien (tú incluido) se
pregunta "¿por qué está así?", la respuesta debería estar aquí.

| Decisión | El porqué |
|---|---|
| **Firebase en vez de Supabase** | Se evaluó Supabase primero. Se cambió porque ya había experiencia previa con Firebase, y la herramienta que conoces siempre gana sobre la teóricamente mejor. |
| **Galaxia en vez de lista vertical** | La lista no estaba mal, estaba en el nivel equivocado. Los *temas* son un catálogo — se exploran, necesitan un mapa. Las *lecciones dentro de un tema* sí son una secuencia — ahí lo vertical es correcto. |
| **Punti en el centro, sin sol** | El universo lo creó Punti. Poner un sol genérico lo degradaría a guía turístico. En el centro, es la fuente del conocimiento. |
| **Tamaño del planeta = número de lecciones** | Que el tamaño sea información y no decoración: de un vistazo sabes qué tan grande es cada mundo antes de entrar. |
| **Planetas generados proceduralmente** | Con semilla fija desde el `id`, así el mismo tema produce siempre el mismo planeta. Sin dibujar 7 planetas a mano, y sin que cambien al recargar. |
| **Mundos bloqueados conservan su color** | Primero se pusieron grises y desaparecían del mapa. El mapa tiene que dar ganas de llegar: el bloqueado mantiene su identidad, apagado y con candado. |
| **Interruptor GLOBO / LISTA** | El globo es correcto en la primera visita y molesto en la número cincuenta. Al aterrizar se preselecciona la siguiente lección, y quien quiera ir directo tiene la lista. |
| **Sin candados secuenciales** | El contenido no es acumulativo. Bloquear el tema 5 porque no terminaste el 3 sería una fricción inventada. |
| **El nombre Punti** | La mascota se llamaba *Cache*. Todos los dominios estaban ocupados, incluso escribiéndolo *KCHE*. Se renombró todo a Punti — mascota y producto — y se compró `punti.space`, que además refuerza el concepto espacial. |
| **El proyecto de Firebase sigue siendo `universeai-e4e9c`** | Deliberado. Es un identificador interno que nadie ve, y renombrarlo obligaría a migrar los datos. No vale el riesgo. |
| **Pixel art generado en código, no ilustraciones** | Un tema nuevo trae su mundo sin que nadie lo dibuje, se ve nítido en cualquier pantalla y no hay archivos de imagen que cargar. El techo visual es más bajo que una ilustración hecha a mano; a cambio, el sistema crece solo. |
| **Sólido arcade para Punti** | Se probaron seis direcciones. Esta invierte el peso del original: el cuerpo se llena de verde y el contorno se vuelve oscuro. Es la única que aguanta el tamaño de ícono sin deshacerse. |
| **Press Start 2P deja de ser solo para logros** | La documentación decía "con mucha moderación". El estilo 8-bits obliga a romper esa regla: ahora se usa en etiquetas y botones. Los títulos largos siguen en Orbitron, porque en pixel a 12px no se leen. |
| **Fuera el mapa galáctico** | Arrastrar, hacer zoom y acertarle a un planeta que se mueve es una interacción de escritorio. En celular no funcionaba. Se reemplazó por tarjetas: se toca y se entra. |
| **Los mundos tienen nombre propio** | "Origen" dice más que "Tema 1" y se recuerda mejor que "Qué es la IA". El tema queda como subtítulo. |
| **Cada rango tiene nombre largo y corto** | "Capitán de estación espacial" no cabe en un chip sin partirse en dos renglones. El largo va en el perfil, el corto en la tarjeta. |
| **El acordeón de preguntas es `<details>` nativo** | Abre sin JavaScript, funciona con teclado y con lector de pantalla sin programar nada, y no se rompe si el JS falla al cargar. |
| **El manual es componente, no página** | Se muestra en `/como-funciona` y en el registro. Un solo texto, dos lugares, imposible que se desincronicen. |
| **Móvil: reencuadrar, no encoger el texto** | Las etiquetas se chocaban en pantalla angosta. El problema era de encuadre, no de tamaño de letra: en móvil el mapa abre junto al mundo actual en vez de mostrar toda la galaxia, las etiquetas se ocultan bajo zoom 0.26, y los controles suben por encima del panel inferior. |

### 8.1 Errores que ya costaron caro — no repetir

- **Capturar el puntero en `pointerdown` se come el clic.** Hay que capturarlo solo después de
  un umbral de movimiento de 5px. Esto rompió por completo la entrada a los mundos.
- **Probar con eventos sintéticos no sirve.** Un `dispatchEvent(new MouseEvent('click'))` pasaba
  mientras la interfaz estaba rota: verificaba que el manejador respondía, no que el clic
  llegaba. Hay que probar con interacciones reales de mouse y de táctil.
- **`var(--color)22` no concatena en CSS.** La opacidad hay que calcularla en JS y pasarla como
  su propia variable.
- **Un elemento en línea no acepta `transform`.** Si algo no rota o no se
  escala, revisar primero su `display`.
- **Para medir una animación hay que quitarle la transición antes.** Si no, se
  mide el primer fotograma. Y si la pestaña del navegador no está visible, el
  navegador congela las animaciones y todo se mide como si no hubiera pasado
  nada — eso ya causó una falsa alarma.
- **Un bloque CSS duplicado sin su selector de estado** deja el componente
  pegado en ese estado. Pasó con el botón de la tarjeta: se veía presionado
  todo el tiempo.
- **El `.env.local` nunca se sube.** Está en `.gitignore` y se verifica antes de cada commit.

---

## 9. Servicios y enlaces

| Recurso | Dónde | Plan |
|---|---|---|
| **App en vivo** | https://www.punti.space/ | — |
| **Dominio** | GoDaddy · `punti.space` | Pago anual |
| **Código** | https://github.com/camilovanegasm/universeai | Gratis |
| **Publicación** | Vercel · proyecto `universeai` | Gratis |
| **Login y base de datos** | Firebase · `universeai-e4e9c` | Gratis (Spark) |
| **Región de datos** | `southamerica-east1` (São Paulo) | — |

**Ojo con esto:** cada dominio nuevo hay que **autorizarlo en Firebase**
(Authentication → Settings → Authorized domains). Si no, el login con Google falla con
`auth/unauthorized-domain`. Los que deben estar: `punti.space`, `www.punti.space`,
`universeai-eight.vercel.app` y `localhost`.

**Sobre la clave de Firebase:** es una variable `NEXT_PUBLIC_`, o sea que viaja al navegador a
propósito. **No es un secreto.** Lo que protege los datos son las reglas de Firestore, no
esconder la clave.

---

## 10. Cómo se publica

1. Se hace un *commit* con los cambios.
2. `git push` a GitHub.
3. Vercel lo detecta automáticamente.
4. En 1-2 minutos está en vivo.

Antes de cada commit se corre `npm run build` y `npm run lint`. Si alguno falla, Vercel también
va a fallar — mejor enterarse antes.

**Limitación conocida:** el `git push` hay que hacerlo desde el computador de Cami. Las
credenciales de GitHub están guardadas en Windows y no son visibles desde el entorno donde
trabaja Claude.

---

## 11. Guía de ruta

Dónde estamos y qué sigue. Se actualiza cada vez que se cierra una fase.

### Terminado

| Fase | Qué incluye |
|---|---|
| **0** | Entorno: Next.js + GitHub + Vercel + Firebase conectados |
| **1.1** | Registro e inicio de sesión (correo + Google) |
| **1.2** | XP, combustible, corazones, racha + identidad visual |
| **1.3** | Mapa de niveles — *reemplazada por la 1.4* |
| **1.4** | Galaxia navegable + planetas girables + lección real + renombre a Punti + dominio propio |
| **2.0** | **Sistema visual pixel art**: Punti en 9 estados, mundos generados por código, la galaxia eliminada, corazones pasan a gasolina |
| **2.1** | **Inicio completo**: nombres de mundo, rangos, preguntas frecuentes y manual de vuelo en cinco pantallas |
| **2.2** | **Portada 8-bits**: campo de estrellas animado, cifras del producto, sección "por dentro", preguntas frecuentes y pie de página |
| **2.3** | **Bienvenida**: elegir español o inglés y recorrer el manual al crear la cuenta |
| **2.4** | **La app en dos idiomas**: toda la interfaz, los 7 mundos, los 26 subtemas y la primera lección completa |
| **2.5** | **Perfil**: ficha de piloto con rango por XP, retomar donde lo dejaste, mundos a medias y conquistados, ajustes |
| **3.0** | **Sonido**: chip de sonido sintetizado en código, silencio recordado, voz de Punti, música solo en la portada |
| **3.1** | **Transiciones y carga**: dirección al navegar, el planeta que viaja de la tarjeta al mundo, cargador único con retraso, esqueleto en /inicio |

### En curso

| Fase | Qué incluye |
|---|---|

### Lo que sigue, en orden

| Fase | Qué incluye | Por qué en ese orden |
|---|---|---|

| **4.0** | **Panel de administración** (`/admin`, "Estación de control") — **construido, falta que Cami lo pruebe con su cuenta**: ver usuarios con cifras, buscar, filtrar, llenar el tanque, marcar premium. Reglas cerradas | El premium todavía no cambia nada en la app: qué incluye se decide en la 4.1 |
| **4.1** | **Precios** — planes mensual y anual, sin pasarela todavía | La página puede existir antes que el cobro |
| **5.0** | **Contenido** — escribir los 25 subtemas que faltan, cada uno en los dos idiomas, ahora desde el editor | Lo más largo de todo, y lo único que no se puede acelerar con código |
| **5.1** | **Editor de contenido en el panel** — **construido antes que los precios** (Cami, 2026-09-23): el contenido pasa a Firebase y se edita en /admin/contenido. Falta que Cami lo pruebe e importe | Adelantado porque sin él cada lección nueva dependía de escribirla en código |

### Fuera de la ruta por ahora

- Pasarela de pagos real.
- Aplicación instalable para celular. La web ya funciona bien en el celular.
- Los 4 estados de Punti sin exportar (Glitch, Encrypted, Signal Lost, God
  Mode). Están diseñados pero sin un momento en la app que los justifique.

---

## 12. Pendientes

- ~~Racha y fallos~~: arreglado en la fase 4.0 con el campo `ultimaLeccion`.

### Acciones de Cami

- [x] ~~Borrar `src/app/vista-previa/`~~ — borrada el 2026-09-23 antes del commit.
- [ ] Renombrar el repositorio de GitHub y el proyecto de Vercel de
      `universeai` a `punti`. Cosmético, no afecta nada.

### Decisiones abiertas

- **¿Qué pasa al pulsar "Empezar" en una lección?** Hoy va al quiz existente.
  Falta definir si esa es la experiencia final.
- **¿El manual de vuelo se puede saltar en el registro, o es obligatorio la
  primera vez?**
- **Rangos de la persona por XP** (Capitán desde 100, Arquitecto desde 300).
  Decidido para construir el perfil; se puede cambiar a mundos completados.

### Anomalía sin resolver

El 2026-09-23, entre las 04:06 y las 05:11, aparecieron archivos y rutas que
nadie creó a propósito, y tres archivos recién escritos amanecieron
modificados. Los cambios eran de buena calidad, no basura — uno de ellos,
`PlanetaPixel.tsx`, resultó ser una mejora y se adoptó. Cami confirmó que no
tenía otra sesión abierta. **Sigue sin explicación.** De ahí salió `CAMBIOS.md`.

---

## 13. Bitácora

### 2026-09-23 — Fases 2.0 y 2.1: sistema visual pixel art e inicio completo

- **Punti pasó a pixel art.** Se armó con rectángulos sobre una rejilla de
  32x36, en la dirección "Sólido arcade", elegida entre seis propuestas. Nueve
  estados (se sumaron `leyendo`, `error` e `info`) y tres recortes: cuerpo
  entero, busto y cabeza. Los PNG siguen sirviendo para la portada.
- **Los mundos se generan por código** a partir del `id` del tema, con cinco
  familias de planeta, anillos, lunas y luz de borde en el complementario.
- **Se eliminó el mapa galáctico** (702 líneas) y con él el arrastre, el zoom,
  la captura de puntero y el bucle de animación. Lo reemplazó una pantalla de
  tarjetas pensada primero para celular.
- **Corazones pasaron a ser gasolina** en toda la interfaz. El campo guardado
  en Firestore conserva el nombre viejo para no migrar cuentas existentes.
- **Los mundos ganaron nombre propio y rango**: Origen, Lexia, Eco, Forja,
  Prisma, Brújula y Autómata, repartidos entre Explorador, Capitán y
  Arquitecto.
- **Preguntas frecuentes** con el acordeón nativo del navegador, y **manual de
  vuelo** en cinco pantallas completas donde cada paso muestra lo que explica.
- **Se creó `CAMBIOS.md`** a raíz de una anomalía: archivos que aparecieron
  modificados sin que nadie los tocara.
- Verificado recorriéndolo en el navegador a 375px con clics reales.
- **Resultado:** la app ya se puede usar en un celular sin pelear con ella, y
  el sistema visual está fijado para todo lo que venga.

### 2026-09-22 — Fase 1.4: Rediseño completo de la navegación + renombre a Punti (completa)

- **La lista vertical se reemplazó por una galaxia navegable** (`MapaGalaxia.tsx`): 7 planetas
  en órbitas elípticas inclinadas, tamaño derivado del número de lecciones, generación
  procedural con semilla fija, arrastre y zoom, y transición de acercamiento al entrar.
- **Cada tema es ahora un planeta girable** (`PlanetaTema.tsx`): globo en canvas con proyección
  esférica real, lecciones repartidas en espiral, y un interruptor GLOBO / LISTA cuya
  preferencia se recuerda.
- **La lección se rediseñó como "consola de transmisión"**: marco HUD, progreso segmentado,
  Punti al costado reaccionando, texto tecleado, y gráficos de apoyo (tablas comparativas con
  divisor VS y flujos numerados).
- **Renombre total de Cache a Punti**, mascota y producto. *UniverseAI* desaparece de la
  interfaz. Se compró y conectó el dominio `punti.space`.
- **Se quitaron los candados secuenciales**, alineando el código con la decisión documentada de
  que el contenido no es acumulativo.
- **Ajustes de móvil:** el mapa abre junto al mundo actual en pantallas angostas, las etiquetas
  se ocultan bajo zoom 0.26, los controles de zoom suben por encima del panel inferior.
- **Se eliminó el código sin uso** heredado del mapa anterior.
- **Se tradujeron los errores de autenticación** que sí ocurren en producción, en vez del
  genérico "ocurrió un error inesperado".
- **Resultado:** Punti está en vivo en su propio dominio, con la navegación definitiva y una
  lección completa de punta a punta.

### 2026-09-22 — Fase 1.3: Mapa de niveles (reemplazada por la 1.4)

- Se creó `niveles.ts` con los 7 temas de la ruta de aprendizaje.
- `/inicio` pasó de ser un placeholder al mapa real: los 7 planetas dibujados sobre una curva
  SVG asimétrica, no una línea recta.
- Nivel 1 desbloqueado; niveles 2 a 7 apagados con candado y etiqueta "Próximamente".
- *Se conserva esta entrada porque explica de dónde salió la Fase 1.4.*

### 2026-09-22 — Fase 1.2: Progreso + identidad visual (completa)

- `progreso.ts` con la lógica de combustible, XP, corazones y racha.
- **Identidad visual definitiva** — reemplaza un tema morado genérico usado en un primer intento
  dentro de esa misma sesión. Mascota oficial (entonces llamada Cache), hoja de personaje con
  10 estados, 6 exportados a `public/`.
- Paleta de 5 colores + fondo, y el sistema de 5 tipografías cargadas en `layout.tsx`.
- El componente de la mascota reacciona automáticamente a lo que pasa (loading al guardar,
  hype/levelup al completar, battery al fallar) y vuelve solo a su estado normal.
- Fondo global "polvo cósmico": azul noche casi negro, neutro, para no competir con el
  contenido.
- Verificado con `npm run build` y `npm run lint` sin errores.

### 2026-09-22 — Fase 1.1: Registro e inicio de sesión (completa)

- `AuthContext.tsx`: toda la app sabe en todo momento si hay alguien logueado.
- Páginas `/login` y `/registro`, con correo/contraseña y botón "Continuar con Google".
- Al registrarse se crea automáticamente el documento de perfil en Firestore (colección
  `usuarios`) con 0 XP, 5 corazones y racha en 0.
- **Reglas de seguridad desplegadas** (`firestore.rules`, `firebase.json`, `.firebaserc`): cada
  usuario solo puede leer y escribir su propio perfil.
- Verificado en local y en producción tras el despliegue automático.

### 2026-09-21 — Fase 0: Preparación del entorno (completa)

- Stack definido. Se evaluó Supabase y se cambió a Firebase por experiencia previa.
- Esqueleto con `create-next-app` (TypeScript + Tailwind + App Router), repositorio en GitHub,
  proyecto en Vercel publicado.
- Firebase creado (`universeai-e4e9c`): Authentication con dos métodos, Firestore en modo
  producción, región São Paulo.
- Conexión en `src/lib/firebase.ts` con variables de entorno (`.env.local` en local, y también
  configuradas en Vercel → Settings → Environment Variables).
- **Resultado:** circuito completo funcionando — código → GitHub → Vercel → internet.

---

## 14. Cómo mantener este documento

Este documento vive en dos lugares y los dos importan:

- **`DOCUMENTACION.md`** (este archivo) — la versión en texto plano, dentro de la carpeta del
  proyecto. Es lo que **Claude Code lee** cuando abre el proyecto, junto con `CLAUDE.md`.
  Si solo se actualiza uno, que sea este.
- **El artifact** — la versión visual y compartible, con su propio enlace.

### La regla

1. **Se actualiza por tandas.** Cada vez que se completa un bloque de trabajo, se agrega una
   entrada nueva a la bitácora.
2. **Nunca se borra lo anterior.** La Fase 1.3 quedó obsoleta y ahí sigue, porque explica de
   dónde salió la 1.4. Una decisión que cambió se marca como reemplazada, no se elimina.
3. **El porqué pesa más que el qué.** El código ya dice qué hace. Lo que se pierde con el
   tiempo es por qué se hizo así.

Para pedir una actualización basta con decir: *"actualiza la documentación con lo que hicimos"*.
