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

**Última actualización:** 2026-09-22 · **Fase actual:** 1.4 completa

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

Este es el corazón del producto. La app tiene cuatro niveles de zoom conceptual, y cada uno
usa la forma de navegación que le corresponde.

```
GALAXIA  →  PLANETA  →  LECCIÓN  →  EJERCICIOS
/inicio     /tema/[id]  /leccion/[temaId]/[subtemaId]
```

### 3.1 La galaxia — `MapaGalaxia.tsx`

- **Punti en el centro.** No hay sol. Punti es la fuente del conocimiento: aura verde radial,
  tres anillos girando en direcciones opuestas, flotación suave.
- **Cada tema es un planeta** en una órbita elíptica inclinada. El achatamiento es
  `ACHATE = 0.52`, que es lo que da la sensación de estar viendo un plano en ángulo y no un
  círculo plano.
- **El tamaño del planeta es información, no decoración:** sale del número de lecciones
  (`radio = 22 + total * 5.5`). De un vistazo sabes qué tan grande es cada mundo.
- **Cada planeta se genera proceduralmente** con una semilla fija derivada de su `id`
  (`hashId`). Mismo tema → mismo planeta, siempre. De ahí salen las bandas, los cráteres, los
  anillos y las lunas.
- **Navegación:** arrastrar para desplazarse, rueda o pellizco para zoom centrado en el cursor,
  botón para encuadrar toda la galaxia.
- **Entrar a un planeta es un acercamiento**, no un cambio de página seco: la cámara vuela
  hacia el planeta mientras el resto de la galaxia se desvanece.

### 3.2 El planeta — `PlanetaTema.tsx`

- **Globo girable dibujado en canvas.** Las lecciones viven en coordenadas `(lat, lon)` sobre
  una esfera y se proyectan a pantalla. Girar es cambiar un ángulo real, no una animación
  fingida.
- Las lecciones se reparten **en espiral** alrededor del mundo y se unen con una ruta: avanzar
  por el temario es darle la vuelta al planeta.
- Arrastrar horizontal gira; vertical inclina el eje. Al soltar sigue girando solo. Al tocar un
  nodo, el globo gira para traerlo al frente.
- Hay un interruptor **GLOBO / LISTA**. La preferencia se guarda en `localStorage` con la clave
  `punti-vista-tema`.

### 3.3 La lección — la consola de transmisión

La explicación no es un bloque de texto: es un HUD con marco de esquinas, barra de progreso
segmentada, Punti al costado reaccionando, y el texto apareciendo **tecleado** como una
transmisión que llega. Puede incluir gráficos (`GraficoExplicacion.tsx`): tablas comparativas
enfrentadas con divisor VS, o flujos numerados tipo pipeline.

### 3.4 Los ejercicios

Cinco tipos de ejercicio en `Ejercicio.tsx`. La lección pasa por cuatro fases:
`cargando → explicacion → ejercicios → resultado`, con una quinta salida si te quedas sin
corazones (`sin-corazones`).

---

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
├─ DOCUMENTACION.md              este documento
├─ .env.local                    claves de Firebase — NUNCA se sube a GitHub
├─ firestore.rules               reglas de seguridad de la base de datos
├─ public/punti/                 los 6 PNG de Punti
└─ src/
   ├─ app/
   │  ├─ page.tsx                portada pública
   │  ├─ login/ · registro/      entrar y crear cuenta
   │  ├─ inicio/page.tsx         la galaxia
   │  ├─ tema/[id]/page.tsx      el planeta
   │  ├─ leccion/[temaId]/[subtemaId]/page.tsx   la lección + quiz
   │  ├─ layout.tsx              fuentes, metadatos, envoltura global
   │  └─ globals.css             variables de color y animaciones
   ├─ components/
   │  ├─ MapaGalaxia.tsx         702 líneas · el mapa galáctico
   │  ├─ PlanetaTema.tsx         469 líneas · el globo girable
   │  ├─ Ejercicio.tsx           253 líneas · los 5 tipos de ejercicio
   │  ├─ GraficoExplicacion.tsx  111 líneas · tablas y flujos
   │  ├─ Punti.tsx                34 líneas · la mascota
   │  ├─ BotonGoogle.tsx          36 líneas
   │  └─ FondoEspacial.tsx         9 líneas · el polvo cósmico
   └─ lib/
      ├─ temas.ts               los 7 temas y sus subtemas
      ├─ lecciones.ts           el contenido de las lecciones
      ├─ progreso.ts            XP, combustible, corazones, racha
      ├─ userProfile.ts         leer y escribir el perfil en Firestore
      ├─ AuthContext.tsx        quién está logueado, en toda la app
      ├─ authErrors.ts          traducir errores de Firebase al español
      ├─ frasesFeedback.ts      lo que dice Punti al acertar o fallar
      └─ firebase.ts            la conexión
```

Son unas **2.590 líneas** de código propio. Los dos archivos grandes (`MapaGalaxia` y
`PlanetaTema`) concentran casi la mitad, porque ahí vive toda la parte de animación y
matemáticas.

---

## 6. Contenido y datos

### 6.1 Los 7 temas

| # | Tema | Subtemas | Contenido escrito |
|---|---|---|---|
| 1 | Qué es la IA | 5 | 1 de 5 |
| 2 | Modelos de lenguaje | 4 | Pendiente |
| 3 | Prompts | 4 | Pendiente |
| 4 | Herramientas de IA para el trabajo | 3 | Pendiente |
| 5 | Crear imágenes y video con IA | 4 | Pendiente |
| 6 | Ética y seguridad | 3 | Pendiente |
| 7 | Automatizaciones | 3 | Pendiente |

Son **26 subtemas** en total. Hoy solo `que-es-la-ia / definicion` tiene lección escrita; el
resto aparece como "en construcción".

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

---

## 7. Reglas del juego

Toda esta lógica vive en `src/lib/progreso.ts`, separada de la interfaz. Eso significa que se
puede ajustar el balance del juego sin tocar ni una pantalla.

- **Combustible** (reemplaza las estrellas de Duolingo): 3/3 si completas la lección sin
  errores · 2/3 con 1 o 2 errores · 1/3 con 3 o más.
- **XP**: 15 XP con combustible 3 · 10 XP con 2 · 5 XP con 1. Más **+5 XP** de bono si terminas
  dentro del tiempo objetivo de la lección.
- **Corazones**: arrancas con 5. Se resetean automáticamente a 5 cada día, comparando con la
  fecha de la última actividad.
- **Racha**: sube 1 con actividad en días consecutivos. Se mantiene si ya contaste hoy. Vuelve
  a 1 si pasó más de un día sin actividad.

---

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
| **Móvil: reencuadrar, no encoger el texto** | Las etiquetas se chocaban en pantalla angosta. El problema era de encuadre, no de tamaño de letra: en móvil el mapa abre junto al mundo actual en vez de mostrar toda la galaxia, las etiquetas se ocultan bajo zoom 0.26, y los controles suben por encima del panel inferior. |

### 8.1 Errores que ya costaron caro — no repetir

- **Capturar el puntero en `pointerdown` se come el clic.** Hay que capturarlo solo después de
  un umbral de movimiento de 5px. Esto rompió por completo la entrada a los mundos.
- **Probar con eventos sintéticos no sirve.** Un `dispatchEvent(new MouseEvent('click'))` pasaba
  mientras la interfaz estaba rota: verificaba que el manejador respondía, no que el clic
  llegaba. Hay que probar con interacciones reales de mouse y de táctil.
- **`var(--color)22` no concatena en CSS.** La opacidad hay que calcularla en JS y pasarla como
  su propia variable.
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

## 11. Estado por fases

| Fase | Qué incluye | Estado |
|---|---|---|
| **Fase 0** | Entorno: Next.js + GitHub + Vercel + Firebase conectados | Completa |
| **Fase 1.1** | Registro e inicio de sesión (correo + Google) | Completa |
| **Fase 1.2** | XP, combustible, corazones, racha + identidad visual | Completa |
| **Fase 1.3** | Mapa de niveles (camino curvo de planetas) | Reemplazada por 1.4 |
| **Fase 1.4** | Galaxia navegable + planetas girables + lección real + renombre a Punti + dominio propio | Completa |
| **Fase 1.5** | Ajuste de la experiencia móvil | Siguiente |
| **Fase 2** | Escribir el contenido de los 25 subtemas restantes | Pendiente |

---

## 12. Pendientes

### Acciones de Cami

- [ ] **Autorizar los dominios en Firebase.** Console → Authentication → Settings → Authorized
      domains. Agregar `punti.space`, `www.punti.space` y `universeai-eight.vercel.app`.
      Hasta que esto pase, el login con Google no funciona en producción.
- [ ] **Hacer `git push`** del commit `79fdb28` (traducción de errores de autenticación).
- [ ] **Pasar la referencia de móvil** para hacer el ajuste de diseño.

### Decisiones abiertas

- **¿Qué pasa al pulsar "Empezar" en una lección?** Hoy va al quiz existente. Falta definir si
  esa es la experiencia final.
- **¿Se exportan los 4 estados restantes de Punti?** Glitch, Encrypted, Signal Lost y God Mode
  están diseñados pero sin uso asignado en la app.

### Cosméticos, sin urgencia

- Renombrar el repositorio de GitHub y el proyecto de Vercel de `universeai` a `punti`.
  No afecta nada funcional.
- Reemplazar el `README.md`, que sigue siendo el genérico de Next.js.

---

## 13. Bitácora

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
