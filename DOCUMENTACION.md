# Documentación del proyecto — Punti

> Este documento es la **memoria del proyecto**: qué estamos construyendo, cómo está
> armado por dentro, qué decisión se tomó en cada bifurcación y por qué.
>
> **Se actualiza por tandas.** Cada vez que se completa un bloque de trabajo se agrega
> una entrada nueva al final de la bitácora. **Nunca se borra ni se reescribe lo anterior** —
> una decisión que cambió se marca como reemplazada, no se elimina.
>
> Hay una versión visual de este mismo documento publicada como artifact ("Manual del
> Universo"), para leerla cómodo desde cualquier dispositivo. **Esta es la fuente de
> verdad**: si las dos no coinciden, manda este archivo.
>
> (Ver también `CLAUDE.md` en esta misma carpeta: contexto operativo para Claude Code.)

**Última actualización:** 2026-09-23 (noche) · **Fase actual:** 6.0 — preparar el lanzamiento (ver sección 11)

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

**Barra de abajo (`NavPunti.tsx`)**, con sesión iniciada: MUNDOS (/inicio) · SEGUIR
(/seguir, directo a la próxima lección) · MANUAL (/como-funciona) · PERFIL (/perfil).
No aparece en la portada, login, registro, bienvenida, dentro de una lección ni en el
admin.

Tres niveles, y cada uno usa la forma que le corresponde.

```
MUNDOS  →  RUTA DEL MUNDO  →  LECCIÓN + EJERCICIOS
/inicio    /tema/[id]          /leccion/[temaId]/[subtemaId]
```

Todas las rutas de la app:

| Ruta | Qué es | Quién |
|---|---|---|
| `/` | Portada (música opcional, FAQ, cifras) | Público |
| `/login` · `/registro` | Entrar y crear cuenta (correo o Google) | Público |
| `/bienvenida` | Elegir idioma + manual, la primera vez | Con cuenta |
| `/inicio` | Los mundos + anuncio del admin | Con cuenta |
| `/tema/[id]` | La ruta de estaciones de un mundo | Con cuenta |
| `/leccion/[temaId]/[subtemaId]` | Explicación de Punti + quiz | Con cuenta |
| `/seguir` | Lleva directo a la próxima lección pendiente | Con cuenta |
| `/como-funciona` | Manual de vuelo | Cualquiera |
| `/perfil` | Ficha del piloto, progreso, ajustes | Con cuenta |
| `/admin` · `/admin/contenido` · `/admin/contenido/[id]` · `/admin/ajustes` | Estación de control | Solo el admin |

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

### 3.3 El mundo por dentro — `RutaTema.tsx`

Una ruta de estaciones cuadradas en pixel art que zigzaguea de arriba hacia
abajo, unidas por un camino (sólido lo recorrido, punteado lo que falta). La
siguiente lección lleva la etiqueta "SIGUE AQUÍ", un anillo que late y a Punti
al lado. Reemplazó al globo girable (`PlanetaTema.tsx`, guardado en
`referencias/`) porque el globo escondía la mitad de las lecciones detrás de la
esfera y había que girarlo a ciegas.

### 3.4 La lección — la consola de transmisión

La explicación no es un bloque de texto: es un HUD con marco de esquinas,
barra de progreso segmentada, Punti al costado reaccionando, y el texto
apareciendo tecleado como una transmisión que llega.

### 3.5 Los ejercicios

Cinco tipos en `Ejercicio.tsx`. La lección pasa por cuatro fases:
`cargando → explicacion → ejercicios → resultado`, con una quinta salida si te
quedas sin gasolina (`sin-gasolina`).

- Al fallar se abre un segundo intento con la opción fallada tachada.
- En los ejercicios hay un botón SALIR que pide confirmación en un panel propio.
- El texto de la pista dice lo que cuesta según los Ajustes del admin.

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

> **Histórico:** la proyección del globo y la curva de entrada al planeta eran de
> la galaxia y del globo girable, que ya no están en la app (se guardan en
> `referencias/`). Se dejan aquí por si vuelven.

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

### 4.2 Prácticas obligatorias en cada cambio — seguridad y eficiencia

Pedido de Cami (2026-09-23): "aplica las prácticas desde el inicio en términos de
eficiencia y seguridad, para no estar repitiendo". Esta lista se cumple en **todo**
cambio, sin que haga falta pedirlo. Si algo no se puede cumplir, se dice por qué.

**Seguridad**

1. **La seguridad vive en `firestore.rules`, no en la interfaz.** Esconder un botón o
   una ruta no protege nada. Todo dato nuevo que el usuario pueda escribir entra en la
   lista cerrada de `cambioDelJuego`, con tipo, tamaño y límite. Lo que no está en la
   lista, solo lo escribe el admin.
2. **Nada de confiar en el cliente para lo que da ventaja** (XP, gasolina, premium,
   fechas). Las fechas las pone el reloj del servidor (`request.time`); los topes salen
   de `contenido/ajustes`.
3. **Admin = correo verificado en las reglas** (`esAdmin()`), y el mismo correo en
   `src/lib/admin.ts`. Si cambia uno, cambia el otro.
4. **Textos siempre como texto.** Nunca `dangerouslySetInnerHTML`, `innerHTML` ni
   `eval` con contenido que venga de Firebase o del usuario. React escapa solo.
5. **Secretos fuera del repositorio.** `.env.local` nunca se sube (se revisa con
   `git check-ignore` antes de cada commit). La API key de Firebase es pública por
   diseño; lo que protege son las reglas.
6. **Cabeceras de seguridad** en `next.config.ts` (nosniff, anti-iframe, permisos
   apagados, HSTS). Una página o servicio nuevo que necesite cámara, micrófono o
   iframes externos obliga a revisarlas.
7. **El admin no se indexa** (`src/app/admin/layout.tsx`).
8. **Todo cambio de reglas se anota en CAMBIOS.md con "hay que volver a publicar las
   reglas"**: las reglas no se despliegan con el push, las publica Cami en la consola.
9. **Ventanas propias, no del navegador**: nada de `alert`, `confirm` ni `prompt`.

**Eficiencia (lecturas de Firebase = dinero y tiempo)**

1. **Leer una vez y reutilizar.** El catálogo y los ajustes se piden juntos, una vez por
   visita (`cargarCatalogo`), y todas las pantallas comparten esa copia. Las FAQ solo
   se piden en la portada.
2. **No releer lo que se acaba de escribir.** Si una escritura calcula un valor (la
   gasolina que queda), la función lo devuelve (`gastarGasolina`, `pagarPista`).
3. **Esperar lo necesario, no más.** Las pantallas que muestran números del juego
   esperan a `listo`; la portada no espera (muestra lo del código mientras llega).
4. **Listas grandes paginadas** cuando pasen de unos cientos (hoy: la lista de pilotos
   del admin lee todos; revisar al llegar a ~500 usuarios).
5. **Animar solo `transform` y `opacity`**, con `prefers-reduced-motion` siempre.
6. **Nada de trabajo por cuadro en React**: lo que cambia 60 veces por segundo va en
   `useRef` o en canvas, no en `useState`.
7. **El código del admin no viaja a las pantallas públicas**: nada público importa de
   `contenidoAdmin.ts` ni de `components/admin/`.

**Configurable antes que fijo**

Todo número o texto que Cami pueda querer cambiar (valores del juego, anuncios, FAQ,
contenido) va en el admin, con un valor por defecto en el código por si Firebase no
responde. Antes de escribir un número fijo nuevo, preguntarse si va en Ajustes.

---

## 5. Mapa de archivos

> **El personaje:** todo sobre Punti (ficha, paleta, estados y exports en PNG, SVG, GIF y logo) está en la carpeta principal `personaje-punti/`; empieza por su README.


```
C:\Proyectos\UniverseAI          (la carpeta sigue llamándose así por dentro)
├─ CLAUDE.md                     memoria de contexto para Claude (léela primero)
├─ DOCUMENTACION.md              este documento: el porqué de cada cosa
├─ CAMBIOS.md                    qué se tocó en cada sesión, en detalle
├─ .env.local                    claves de Firebase — NUNCA se sube a GitHub
├─ firestore.rules               reglas de seguridad (se PUBLICAN a mano en la consola)
├─ next.config.ts                cabeceras de seguridad
├─ referencias/                  (no se sube) imágenes de referencia, reglas y globo viejos
├─ public/punti/                 los PNG de Punti (portada y momentos grandes)
└─ src/
   ├─ app/
   │  ├─ page.tsx                portada pública
   │  ├─ layout.tsx              fuentes, metadatos, sonido global, barra de abajo
   │  ├─ template.tsx            transiciones entre pantallas
   │  ├─ globals.css             colores, clases y animaciones
   │  ├─ login/ · registro/      entrar y crear cuenta
   │  ├─ bienvenida/             idioma + manual la primera vez
   │  ├─ inicio/                 los mundos
   │  ├─ tema/[id]/              la ruta de un mundo
   │  ├─ leccion/[temaId]/[subtemaId]/   la lección + quiz
   │  ├─ seguir/                 salto a la próxima lección
   │  ├─ como-funciona/          el manual de vuelo
   │  ├─ perfil/                 ficha del piloto
   │  └─ admin/                  Estación de control (no se indexa)
   │     ├─ page.tsx             PILOTOS: usuarios, tanque, premium
   │     ├─ contenido/           CONTENIDO: mundos y lista de lecciones
   │     │  └─ [subtemaId]/      editor de una lección
   │     └─ ajustes/             AJUSTES: reglas del juego, anuncio, FAQ
   ├─ components/
   │  ├─ NavPunti.tsx            barra de navegación de abajo (íconos pixel)
   │  ├─ MundosPunti.tsx         tarjetas de mundos
   │  ├─ RutaTema.tsx            ruta de estaciones dentro de un mundo
   │  ├─ Ejercicio.tsx           los 5 tipos de ejercicio
   │  ├─ GraficoExplicacion.tsx  tablas y diagramas
   │  ├─ ComoFunciona.tsx        el manual en cinco pantallas
   │  ├─ PreguntasFrecuentes.tsx FAQ (Firebase o las del código)
   │  ├─ AnuncioGlobal.tsx       el aviso del admin en /inicio
   │  ├─ PanelPerfil.tsx         el contenido del perfil
   │  ├─ PuntiPixel.tsx · PlanetaPixel.tsx   sprites en canvas
   │  ├─ Cargando.tsx · EsqueletoMundos.tsx  estados de carga
   │  ├─ BarraGasolina.tsx       la gasolina en segmentos
   │  ├─ SonidoGlobal · BotonSonido · BotonMusica   sonido
   │  ├─ SelectorIdioma · ElegirIdioma · LangDocumento   idioma
   │  ├─ CampoEstelar · FondoEspacial · PieDePagina · MarcoCuenta
   │  └─ admin/                  MarcoAdmin (pestañas), Campos, VistaPrevia
   └─ lib/
      ├─ contenido.ts           catálogo, lecciones, ajustes y FAQ desde Firebase (con respaldo al código)
      ├─ contenidoAdmin.ts      borradores, validación y publicación (solo admin)
      ├─ ajustes.ts             números del juego y anuncio: valores por defecto y validación
      ├─ admin.ts               quién es admin, lista de pilotos, tanque, premium
      ├─ progreso.ts            XP, combustible, gasolina, racha
      ├─ rangos.ts              Dificultad de los mundos y escalafón de 10 rangos
      ├─ insigniaSprite.ts      Dibujo pixel de las 10 insignias
      ├─ userProfile.ts         perfil en Firestore
      ├─ temas.ts · lecciones.ts   contenido semilla (respaldo si Firebase no responde)
      ├─ puntiSprite.ts · planetaSprite.ts   dibujos puros, sin React
      ├─ sonido.ts              sintetizador chiptune
      ├─ i18n.ts · useIdioma.ts idiomas
      ├─ AuthContext.tsx · authErrors.ts · firebase.ts
      └─ frasesFeedback.ts      lo que dice Punti al acertar o fallar
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

### 6.1.0 Planeta nuevo: Arena (decidido 2026-09-23, por crear)

Un planeta dedicado a **las marcas de IA y en qué se diferencian**, justo después de
Lexia. Lexia sigue explicando cómo funciona un modelo de lenguaje; Arena enseña quién es
quién y cuál usar para qué.

Lecciones (ids): `el-mapa-de-los-modelos` · `openai-chatgpt` · `google-gemini` ·
`anthropic-claude` · `xai-grok` · `modelos-chinos` (DeepSeek, Qwen, Kimi) ·
`cual-uso-para-que` · `novedades-de-la-semana` (viva, la alimenta el Radar IA y
reemplaza a `modelos-recientes` de Lexia).

**Estado (2026-09-23):** las 7 lecciones fijas están escritas (hoja en el Drive, ver 6.7), con datos verificados a septiembre de 2026. Falta crear el mundo en el admin, pegarlas y publicarlas.

Regla de diseño: cada lección separa lo que dura (quién es la empresa, en qué es fuerte)
de una pantalla **viva** con versiones y precios, que es lo único que el Radar toca cada
semana. Neutralidad: mismos criterios para todas las marcas; quien escribe es Claude (de
Anthropic), por eso Cami revisa esa parte con ojo neutral.

### 6.1.1 Rangos — `rangos.ts`

Hay dos cosas distintas con nombres parecidos:

**a) La dificultad de cada MUNDO** (tres niveles, se elige en el admin):

| Rango | Nombre completo | En el chip | Color |
|---|---|---|---|
| `explorador` | Explorador espacial | EXPLORADOR | verde |
| `capitan` | Capitán de estación | CAPITÁN | cian |
| `arquitecto` | Arquitecto de galaxias | ARQUITECTO | morado |

Cada rango guarda dos formas del nombre a propósito: el largo va en el perfil,
el corto va en la tarjeta. "Capitán de estación espacial" no cabe en un chip
sin partirse en dos renglones.

**b) El escalafón de la PERSONA** (10 rangos por XP, `ESCALAFON`). Cada rango tiene una
insignia en pixel art (`InsigniaRango.tsx` + `insigniaSprite.ts`). Los rangos del 2 al 10
empiezan en el XP que se fija en Admin → Ajustes → RANGOS.

| # | Rango | XP por defecto | Insignia |
|---|---|---|---|
| 1 | Cadete | 0 | escudo gris, 1 galón |
| 2 | Explorador espacial | 40 | verde, 2 galones |
| 3 | Navegante | 120 | lima, 3 galones |
| 4 | Piloto | 250 | amarillo, 1 estrella |
| 5 | Capitán de estación | 450 | cian, 2 estrellas |
| 6 | Comandante | 700 | azul, 3 estrellas |
| 7 | Almirante | 1000 | naranja, 1 estrella y alas |
| 8 | Arquitecto de galaxias | 1400 | violeta, 2 estrellas y alas |
| 9 | Guardián estelar | 1900 | rosa, 3 estrellas, alas y corona |
| 10 | Leyenda cósmica | 2600 | tornasol, alas doradas, corona, destellos y brillo |

**Premio por subir de rango:** cada vez que alguien sube de rango gana **6 horas de gasolina
ilimitada** (configurable en Admin → Ajustes → RANGOS, `horasPremioRango`; 0 = sin premio).
Se guarda `premioRangoDesde` con la hora del servidor, y las reglas de Firestore solo lo
aceptan en la misma escritura en que el XP cruza el umbral de un rango. Si las reglas lo
rechazan, la lección se guarda igual, sin premio. Mientras dura, fallar no gasta y las pistas
son gratis. La cabecera de /inicio muestra "∞ 5:12" (horas:minutos restantes) y la pantalla de
"subiste de rango" muestra el premio.

Una pasada completa por la escuela da unos 400 a 500 XP (Piloto o Capitán). Los
rangos altos se ganan repitiendo lecciones: premian la práctica. Un mundo marcado
"Capitán" es el que se recomienda a quien ya llegó a ese rango.

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
| `xp` | Solo subir, como mucho la mejor nota + bono (según Ajustes; 20 por defecto) |
| `corazones` (gasolina) | El mismo día solo bajar; en un día nuevo, recargar hasta el tanque de Ajustes (5 por defecto) |
| `ultimaActividad` | Solo la fecha de hoy según el reloj del servidor (margen de 2 h) |
| `ultimaLeccion` | Solo la fecha de hoy. Es la fecha de la racha |
| `racha` | Solo con la primera lección completada de un día nuevo: +1 o volver a 1 |
| `progreso` | Una lección por escritura, con la forma exacta que escribe la app; la lección se identifica en `ultimaLeccionId` |
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

### 6.4.1 Dónde se escribe el contenido — Google Sheets

Las lecciones se escriben y revisan en la hoja **Punti-Contenido** del Google Drive de
Cami (una pestaña por mundo, una fila por pieza; las reglas están en su pestaña
Instrucciones). De ahí pasan a la app por el editor del admin (y, más adelante, con
un importador). La app sigue leyendo de Firebase.

**Filas que entiende PEGAR DESDE LA HOJA** (además de las de la pestaña Instrucciones):
- **MUNDO** crea un mundo si todavía no existe:
  - ID lección = id del mundo.
  - Tipo / Punti = dificultad (explorador, capitan o arquitecto).
  - Texto = nombre.
  - Texto 2 = qué enseña.
  - Opción 1 = descripción.
  Los mundos nuevos quedan al final de la lista.
- **LECCION** con la columna Tipo / Punti llena (el id de un mundo): la lección nueva
  queda preseleccionada en ese mundo. Si está vacía, se elige a mano como antes.

### 6.5 De dónde sale el contenido — el editor (fase 4.1)

Desde la fase 4.1 el contenido (mundos, lecciones, ejercicios) vive en Firebase
y se edita en **/admin/contenido**, sin tocar código.

| En Firebase | Qué es | Quién lo lee | Quién lo escribe |
|---|---|---|---|
| `contenido/catalogo` | Los mundos publicados, su orden y sus lecciones | Cualquiera (también sin cuenta) | Admin |
| `lecciones/{id}` | Cada lección publicada | Cualquiera | Admin |
| `borradores/catalogo` | Los mundos como los está editando el admin | Admin | Admin |
| `borradores/leccion-{id}` | Cada lección en edición | Admin | Admin |
| `contenido/ajustes` | Números del juego (tanque, costos, XP, rangos) y el anuncio | Cualquiera | Admin |
| `contenido/faq` | Preguntas frecuentes de la portada | Cualquiera | Admin |

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

### 6.6 El equipo de contenido: la voz de Punti y el Especialista en IA

Decidido con Cami el 2026-09-23: **Claude escribe todo el contenido** de la escuela
("tú eres el especialista en IA") y Cami revisa y publica. Para que los textos suenen
siempre a Punti y estén al día, hay tres piezas en la carpeta `guias/`:

| Pieza | Archivo | Qué hace |
|---|---|---|
| **La voz de Punti** | `guias/voz-de-punti.md` | Cómo escribe Punti: robot amigable experto en IA, de tú, humor ligero, ejemplos latinos, frases cortas, sin relleno de IA, neutral entre marcas. **Manda sobre las guías de terceros.** |
| **Especialista en IA** | `guias/especialista-ia.md` | Perfil del que investiga: qué vigila (OpenAI, Google, Anthropic, xAI, Meta, DeepSeek, Qwen, Kimi…), reglas (siempre con fuente y fecha, sin rumores, neutral), y el formato del Radar IA |
| Copy comercial (referencia) | `guias/terceros/copywriting/` | De [marketingskills](https://github.com/coreyhaines31/marketingskills) (MIT, ~51 mil estrellas, v2.0.2). Solo para portada, precios, anuncios y correos |
| Quitar "tono de IA" (referencia) | `guias/terceros/humanizer/` | De [humanizer](https://github.com/blader/humanizer) (MIT, ~34 mil estrellas, v3.0.0). Filtro final de todo texto |

**Por qué no se usó marketingskills tal cual:** está hecho para páginas de venta de
software (prohíbe los signos de exclamación, pide testimonios, botones de "prueba
gratis"). Punti quedaba serio y rígido. Se tomaron sus principios buenos (claridad antes
que ingenio, ser específico, palabras de la gente) y la voz de Punti los ajusta. Humanizer
tampoco se usa tal cual: pide tono neutro en textos informativos y las lecciones de Punti
llevan calidez.

Se guardaron en `guias/` y no en `.claude/` porque esa carpeta está protegida en el
computador de Cami.

#### Radar IA semanal (tarea programada)

- **Cuándo:** cada lunes a las 7:00 a. m. de Colombia (12:00 UTC). Primera vez:
  28 de septiembre de 2026. Id de la tarea: `trig_0131UUMvfP2KBTvkZuPKj2dv`.
- **Dónde corre:** en la nube; no necesita el computador de Cami prendido.
- **Qué hace:** investiga lo que pasó en IA en los últimos 7 días (con fuentes y fechas),
  lee la hoja Punti-Contenido para encontrar lecciones desactualizadas, revisa si
  marketingskills o humanizer sacaron versión nueva, y escribe la lección viva "Novedades
  de la semana" en ES/EN.
- **Qué entrega en el Drive de Cami:** un Google Doc "Radar IA · fecha" y una hoja
  "Radar IA · fecha · Novedades de la semana (propuesta)" con el formato de la hoja de
  contenido. Avisa por notificación y correo.
- **Nada se publica solo.** Cami revisa y decide qué pasa a la app. Las guías de terceros
  tampoco se actualizan solas: el Radar lo propone.
- Si las ejecuciones se detienen pidiendo aprobación, en los ajustes de la tarea se puede
  activar "aprobar automáticamente".

#### Cómo pasa una lección de la hoja a la app

1. Claude (o Cami) escribe la lección en la hoja, en el formato de la pestaña Instrucciones.
2. En /admin/contenido → **PEGAR DESDE LA HOJA**: se copian las filas en Sheets, se pegan,
   LEER FILAS, y CREAR BORRADORES (las lecciones nuevas piden elegir su mundo).
3. Cada lección se abre con EDITAR LECCION → VISTA PREVIA → PUBLICAR.
   O todas juntas con **PUBLICAR TODO** en la lista de contenido: publica las lecciones completas y los mundos, y lista las que les falta algo.

Pedirle cosas a Claude desde el celular: la app de Claude basta (no hace falta un bot de
WhatsApp o Telegram). El Radar IA también se puede lanzar cuando se quiera, pidiéndoselo.

### 6.7 Archivos de contenido en el Drive de Cami

| Archivo (Google Sheets) | Id | Qué es |
|---|---|---|
| Punti-Contenido | `181wQyGETx1UfL2HUBVSUqXm3vYzvG9V_AF2K-Eb_YXA` | **La hoja oficial**: una pestaña por mundo |
| Punti · Mundo 01 Origen (lecciones escritas por Claude) | `14zqgaGAtGpBcCweZcIJWzMxu-4_hVt7TN5dapt5oSgk` | Las 4 lecciones que faltaban del Mundo 01, para pegar en la oficial |
| Punti · Planeta Arena (plan de lecciones) | `1elBy-ZiCPWRxMpTkECJZO-2MHu-KjEdjjecNLX0bov0` | Plan de las 8 lecciones del planeta nuevo |
| Punti · Planeta Arena (lecciones escritas por Claude) | `1dC9kiwcj4r2M39-o4qmRZ3f5oxmPrCofcZA23TAurGg` | Las 7 lecciones de Arena completas en ES/EN (la 8.ª, Novedades, la escribe el Radar) |

**Escuela completa (2026-09-23).** Todas las lecciones están escritas: 34 en total
(`definicion` en el código y 33 en hojas). Los archivos están en la carpeta
`contenido/` del proyecto:

| Archivo | Qué es |
|---|---|
| `punti-todas-las-lecciones.tsv` | Las 33 lecciones en un solo archivo (Mundo 01, Arena, mundos 02 a 07 y Novedades). Se abre con el Bloc de notas, se copia todo y se pega en PEGAR DESDE LA HOJA |
| `mundo-02-lexia.csv` … `mundo-07-automata.csv` | Un archivo por mundo, para subir al Drive o pegar en la pestaña de la hoja oficial |
| `mundo-08-arena-novedades.csv` | Primera edición de Novedades de la semana (datos del 14 al 22 de septiembre de 2026) |

Cómo se escribieron: voz de Punti, 4 a 6 pantallas y 5 ejercicios por lección, en ES y EN.
Cada lección pasó por el lector del importador (0 faltas, 0 avisos) y por un revisor
independiente. Ese revisor corrigió pasos de "ordenar" que admitían más de un orden, el
cobro de Zapier/Make/n8n y la definición de deepfake. Pantallas vivas (las revisa el Radar):
`generadores-de-imagenes` 4, `video-con-ia` 3, `derechos-de-autor` 3 y toda
`novedades-de-la-semana`.

### 6.8 Revisión del temario: lo que falta (2026-09-23)

**Estado:** las tres fases quedaron escritas el mismo día, 44 lecciones en total. Están en
`contenido/punti-44-lecciones-nuevas.tsv` (con las filas MUNDO de los 5 mundos nuevos)
y las fuentes en `contenido/fuentes-44-lecciones.md`. La escuela queda en 13 mundos y
78 lecciones. Mundos nuevos: Órbita (`ia-en-tu-dia`), Nexo (`agentes`), Taller
(`crea-sin-programar`), Horizonte (`futuro-de-la-ia`) y Núcleo (`como-se-construye`).


Hoy hay 8 mundos y 34 lecciones. Cubren bien lo básico: qué es la IA, cómo funciona
un modelo, prompts, las marcas, trabajo, imagen y video, ética y automatizaciones.
Para enseñar "todo el mundo de la IA" faltan seis áreas grandes. Están ordenadas por
importancia para quien empieza. Todo esto es propuesta: Cami decide y después se escribe.

**Fase A: lo que más falta (hace falta para salir al aire)**

| Dónde | Lección nueva | Por qué hace falta |
|---|---|---|
| Mundo nuevo **Nexo · Agentes de IA** | Qué es un agente · Agentes que usan el navegador y el computador · Conectores (apps, MCP) · Cómo supervisar a un agente · Riesgos: permisos e instrucciones escondidas | Es el tema más grande de 2025 y 2026, y hoy solo sale de pasada en Autómata |
| Brújula | Deepfakes y estafas con voz clonada · Cómo detectar contenido hecho con IA · IA en el colegio y la universidad (honestidad académica) | Protege a la gente de riesgos reales de hoy |
| Prisma | Voz, audio y música con IA · Editar fotos con IA | Falta todo el audio (voces, podcasts, canciones) |
| Forja | Buscar e investigar con IA (buscadores con IA e investigación profunda) · Presentaciones y documentos con IA | Son los usos más comunes después de escribir |

**Fase B: IA en la vida y en el trabajo**

| Dónde | Lecciones |
|---|---|
| Mundo nuevo **Órbita · IA en tu día a día** | Estudiar y aprender con IA · Salud y bienestar (con límites claros) · Dinero y trámites · Viajes, cocina y hogar · Niños, familia e IA |
| Mundo nuevo **Taller · Crea con IA sin programar** | Qué es programar con IA (vibe coding) · Tu primera página web con IA · De la idea a la app · Publicar y cuidar la seguridad |
| Forja | IA para emprender y vender (redes, atención al cliente, marketing) · IA dentro de Office y Google Workspace |
| Lexia | Contexto y memoria del asistente · Multimodal: ver, oír y hablar |
| Eco | Instrucciones personalizadas, proyectos y plantillas de prompts |

**Fase C: para ir más profundo y mirar el futuro**

| Dónde | Lecciones |
|---|---|
| Origen | Cómo aprende una máquina (supervisado, no supervisado, por refuerzo) · Redes neuronales sin fórmulas |
| Mundo nuevo **Núcleo · Cómo se construye la IA** (rango Arquitecto) | APIs y cuánto cuesta usarlas · RAG: IA que consulta tus documentos · Ajuste fino (fine-tuning) · Modelos abiertos y en tu computador · Cómo se evalúa un modelo |
| Mundo nuevo **Horizonte · El futuro de la IA** | IA y empleo · IA en la ciencia y la medicina · Robots e IA física · AGI y seguridad de la IA · Energía y medio ambiente · Leyes de IA en el mundo y en Colombia (lección viva) |
| Arena | Meta y Llama · Microsoft Copilot · Mistral (Europa) · Perplexity |

Total propuesto: unas 45 lecciones más, en 4 mundos nuevos y en los 8 que ya
existen. Con eso la escuela quedaría en unos 12 mundos y unas 80 lecciones.
Cada lección se escribe igual que las actuales: voz de Punti, ES/EN, lector del
importador y revisor independiente. Los datos que envejecen van en pantallas vivas.

## 7. Reglas del juego

Toda esta lógica vive en `src/lib/progreso.ts`, separada de la interfaz. **Los
números se cambian desde el admin (Ajustes)**; abajo están los valores por
defecto (`src/lib/ajustes.ts`). Las reglas de Firestore leen los mismos números.

- **Gasolina** (antes "corazones"): tanque de 5. Fallar cuesta 1; ver una pista
  cuesta 0,5. Si se acaba, el viaje se pausa hasta el día siguiente. Se recarga
  sola cada día (a medianoche UTC).
- **Combustible de la lección** (la nota, no la gasolina): 3/3 sin errores, 2/3
  con 1 o 2, 1/3 con 3 o más.
- **XP**: 15 / 10 / 5 según la nota, **+5** si termina dentro del tiempo objetivo.
- **Premio de rango**: al subir de rango, horas de gasolina ilimitada (6 por defecto).
- **Minijuegos**: ganar uno recarga +1 de gasolina, máximo 3 veces al día y con 30 s entre recargas (ver 6.10). Con el tanque lleno no gasta recarga. No dan XP.
- **Rangos**: 10, de Cadete (0 XP) a Leyenda cósmica (2600 XP). Tabla en 6.1.1.
- **Racha**: cuenta días seguidos con al menos una lección completada (fecha
  `ultimaLeccion`). Fallar o recibir gasolina del admin no la mueve.

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

Antes de cada commit se corre `npx tsc --noEmit` (tipos) y `npm run lint`. El `npm run build`
completo no corre en el entorno de Claude (falta un binario de Linux); Vercel lo corre al
publicar, y si falla, la versión anterior sigue en línea.

**Las reglas de Firestore no se publican con el push.** Cuando cambian, Cami copia
`firestore.rules` en Firebase → Firestore → Reglas → Publicar. CAMBIOS.md lo avisa cada vez.

**Limitación conocida:** el `git push` hay que hacerlo desde el computador de Cami. Las
credenciales de GitHub están guardadas en Windows y no son visibles desde el entorno donde
trabaja Claude.

---

### 6.9 Suscripción: Punti Club

**Decidido por Cami (2026-09-23):**
- **Precio:** el recomendado.
- **Mundos del Club:** Taller, Horizonte y Núcleo. Brújula (ética y seguridad) es siempre gratis.
- **Lanzamiento:** con lista de espera; los cobros se conectan después.

**Construido (fase 1):**
- **`/club`:** promesa ("Aprender IA es gratis. Siempre."), precios mensual/anual en COP o USD,
  oferta Fundador, comparación gratis vs Club (lo que falta dice PRONTO), lista de espera y
  preguntas.
- **Lista de espera:**
  - Colección `listaEspera/{uid}`: una anotación por persona, con su correo, plan y moneda.
  - Solo el dueño y el admin la leen. El admin la ve, con conteo por plan y un botón para copiar los correos, en Admin → Ajustes → PUNTI CLUB.
- **Precios:** en `contenido/ajustes.club`, editables en Admin → Ajustes → PUNTI CLUB.
- **Mundos del Club:**
  - Se marcan en Admin → Contenido con la casilla "Solo Punti Club" y se aplican al tocar PUBLICAR MUNDOS.
  - Las lecciones de esos mundos se guardan con `club: true`. **Las reglas de Firestore solo dejan leerlas a miembros (premium) y al admin**, así que no basta con saltarse la pantalla.
  - Quien no es miembro ve la ruta con un aviso del Club; al tocar una lección va a /club.
  - Las tarjetas de mundo llevan la etiqueta CLUB.
- **Beneficios activos para premium:** gasolina ilimitada (fallar no gasta) y pistas gratis.
  El perfil muestra "★ Miembro de Punti Club"; a los demás, un enlace al Club.
- **Miembros:** por ahora se marcan a mano en Admin → PILOTOS (premium). Cuando se conecten
  Mercado Pago y Lemon Squeezy, un webhook lo hará solo.

**Resumen del informe** (completo en `estrategia/suscripcion-informe.md`):

El informe completo, con precios comparados, pasarelas de pago y fuentes, está en
`estrategia/suscripcion-informe.md`. Resumen de la propuesta (Cami decide):

- **Principio:** aprender IA es gratis; el Club es para ir más rápido, más profundo y
  demostrarlo. **La ética y la seguridad nunca se cobran.** No hay anuncios.
- **Gratis para siempre:**
  - Los mundos básicos.
  - 5 de gasolina al día.
  - XP, los 10 rangos y la racha.
  - La lección semanal de novedades.
  - La comunidad, después de ganar un poco de XP.
- **Punti Club:**
  - Gasolina ilimitada y pistas gratis.
  - Reparar la racha.
  - Certificado verificable por mundo.
  - Rol y sesión en vivo mensual en Discord.
  - Novedades antes que nadie.
  - Mundos avanzados.
  - Retos de proyecto revisados.
  - Más adelante, el tutor de IA "Pregúntale a Punti", con un límite diario.
- **Precio recomendado:**
  - Colombia: 19.900 COP/mes o 149.900 COP/año.
  - Resto del mundo: USD 6,99/mes o USD 49,99/año.
  - Extras: plan Fundador de 99.900 COP el primer año, 50 % para estudiantes, becas para docentes y 7 días de prueba.
- **Cobros:**
  - Stripe no está disponible para Colombia.
  - En pesos: Mercado Pago Suscripciones, con cobro automático.
  - En dólares: Lemon Squeezy, que cobra y paga los impuestos de cada país.
  - Se puede empezar como persona natural con RUT. Antes de lanzar hay que hablar con un contador.
- **Fases:**
  0. Preparación: RUT, cuentas, términos y lista de espera.
  1. Lo que ya permite la marca premium.
  2. Certificados, un mundo avanzado y venta en USD.
  3. Tutor de IA y planes para colegios.
- **Por verificar:** el precio actual de Codédex Club en su propia página (las fuentes no
  coinciden: USD 19,99 o 9,99 al mes) y si cada pasarela acepta persona natural.

### 6.10 Minijuegos que recargan gasolina (2026-09-23)

**Decidido con Cami:**
- Varios juegos, cada uno con una mecánica distinta, sobre un marco común (`MarcoJuego`).
- Ganar da +1 de gasolina, con un máximo de 3 al día.
- Los juegos no dan XP: el XP y los rangos salen de las lecciones.
- Primera tanda: los cuatro juegos propuestos.

**Cómo se eligieron:** se revisaron juegos web de GitHub que enganchan. Lo que tienen en común:
- partidas de menos de un minuto;
- la dificultad sube;
- combos;
- sonido y temblor en cada acierto o error;
- un récord que superar;
- algo nuevo cada día.

| Referencia | Qué se tomó | Licencia |
|---|---|---|
| 2048 (gabrielecirulli) | Récord a la vista y "otra vez" en un toque | MIT |
| FlappyLearning (xviniette) | Ver a una IA aprender a jugar, generación tras generación | MIT (idea; código propio) |
| Wordle y sus clones en React | Un reto al día, igual para todos, para compartir con cuadritos | MIT |
| Flexbox Froggy, Grid Garden, k8sgames | Aprender jugando, con niveles cortos | MIT / Apache |
| Gandalf / tensor-trust | Engañar a una IA para sacarle una clave | Queda para el Club: necesita una IA real y cuesta por uso |

**Descartados:**
- react-tetris y hextris, porque no tienen licencia clara.
- clumsy-bird, porque es GPL y obligaría a publicar el código de Punti.
- Phaser y otros motores, porque pesan más de 1 MB. Punti ya dibuja en canvas.

**Los juegos:**

| Juego | Mundo | Mecánica | Se gana con | Enseña |
|---|---|---|---|---|
| Punti Flap | Origen | Volar entre portales; modo IA con neuroevolución | 10 portales | Cómo aprende una máquina |
| Caza la estafa | Brújula | Chat cada vez más rápido: tocar señales, combos | 70 % de las señales y 3 errores o menos | Voces clonadas, deepfakes, urgencia |
| Caza el glitch | Prisma | Buscar errores en escenas pixel art, contra reloj | 6 de 9 | Pistas de una imagen hecha con IA |
| Palabra IA del día | Todos | Wordle de palabras de IA, para compartir | Adivinar en 6 intentos | Una palabra de IA al día |

**Seguridad:** la recarga la valida `recargaJuegoValida()` en las reglas, siempre con el reloj del servidor. Comprueba:
- el tope diario;
- que el día no vuelva atrás;
- el tiempo mínimo entre recargas;
- que la gasolina no pase del tanque.

**Límite conocido:** alguien con conocimientos puede decir "gané" sin jugar, pero no puede pasar del tope diario. Cerrarlo del todo exige un servidor (Cloud Functions, plan de pago).

**Contenido:** está en el código, en `src/lib/juegos/` (estafas, escenas, palabras), en español y en inglés, con la voz de Punti. Es una excepción a "configurable antes que fijo", y está anotado como pendiente.

**Pendiente:**
- Probar con sesión en localhost.
- Juegos para los otros mundos.
- Pasar las palabras y los mensajes al admin o a la hoja.
- Un Gandalf de Punti para el Club.

## 11. Guía de ruta

Dónde estamos y qué sigue. Se actualiza cada vez que se cierra una fase.

### Terminado

| Fase | Qué incluye |
|---|---|
| **0** | Entorno: Next.js + GitHub + Vercel + Firebase conectados |
| **1.1** | Registro e inicio de sesión (correo + Google) |
| **1.2** | XP, combustible, corazones, racha + identidad visual |
| **1.3** | Mapa de niveles — *reemplazada por la 1.4* |
| **1.4** | Galaxia navegable + lección real + renombre a Punti + dominio propio — *la galaxia se reemplazó en la 2.0* |
| **2.0** | **Sistema visual pixel art**: Punti en 9 estados, mundos generados por código, corazones pasan a gasolina |
| **2.1** | **Inicio completo**: nombres de mundo, rangos, preguntas frecuentes, manual en cinco pantallas |
| **2.2** | **Portada 8-bits**: campo de estrellas, cifras, "por dentro", FAQ, pie de página |
| **2.3** | **Bienvenida**: elegir idioma y recorrer el manual al crear la cuenta |
| **2.4** | **Dos idiomas**: toda la interfaz, los 7 mundos, los 26 subtemas y la primera lección |
| **2.5** | **Perfil**: rango por XP, retomar, mundos a medias y conquistados, ajustes |
| **3.0** | **Sonido**: chiptune sintetizado, silencio recordado, voz de Punti, música solo en la portada |
| **3.1** | **Transiciones y carga**: dirección al navegar, el planeta que viaja, cargador sin parpadeo, esqueleto |
| **3.2** | **Navegación**: ruta de estaciones en vez del globo, segundo intento al fallar, salir del quiz, barra de abajo con SEGUIR |
| **4.0** | **Estación de control** (`/admin`): pilotos, llenar tanque, premium; reglas de Firestore cerradas campo por campo |
| **4.1** | **Editor de contenido** (`/admin/contenido`): mundos y lecciones en Firebase, borrador/publicado, validación, vista previa |
| **4.2** | **Ajustes** (`/admin/ajustes`): números del juego, anuncio, FAQ; seguridad por defecto (cabeceras, noindex, prácticas escritas) |

> Nota: la numeración cambió el 2026-09-23. Lo que antes era "5.1 editor" se
> construyó como 4.1, y los precios pasan a después del lanzamiento.

### Cómo se trabaja cada fase

1. **Acordar el alcance.** Claude propone qué entra y qué no; Cami aprueba o ajusta.
2. **Construir con seguridad y eficiencia desde el inicio** (ver 4.2), sin que haga
   falta pedirlo.
3. **Verificar** antes de entregar: tipos, lint, navegador en celular y escritorio,
   y pruebas de la lógica. Lo que no se pudo ver se dice.
4. **Cami prueba en localhost** con una lista corta de qué tocar.
5. **Commit** (Claude) y **push** (Cami). Si cambiaron las reglas, Cami las publica
   en la consola **antes** del push.
6. **Documentar**: CAMBIOS.md con el detalle y este documento con el estado.

### Camino al lanzamiento

Lanzar = abrir punti.space al público y empezar a invitar gente. Lo **bloqueante**
es lo que no puede faltar el día uno; lo demás puede llegar después.

| Fase | Qué incluye | ¿Bloquea el lanzamiento? |
|---|---|---|
| **6.0 Cuenta y privacidad** | Recuperar contraseña; eliminar mi cuenta (con sus datos); política de privacidad y términos (páginas bilingües, enlazadas en el registro y el pie); un canal de contacto (correo de soporte) | **Sí.** Se piden correos: la ley colombiana (1581 de 2012) exige política de datos y poder borrarlos, y Google la pide para mostrar "Punti" en la ventana de login |
| **6.1 Contenido mínimo** | El **Mundo 01 · Origen completo** (5 lecciones en ES y EN). **Escrito por Claude el 2026-09-23**, falta que Cami lo revise, lo pase a la hoja oficial y lo publique. Después: el planeta Arena y el resto de mundos, con la voz de Punti y el Especialista en IA | **Sí.** Hoy hay 1 lección de 26: alguien que entra la termina en 5 minutos y no tiene a qué volver |
| **6.2 Presentación** | Ícono de Punti en la pestaña (favicon) y al instalar en el celular; imagen para compartir en WhatsApp/redes (Open Graph); robots y sitemap; quitar los archivos de ejemplo de Next | **Sí** (es barato y es la primera impresión al compartir el enlace) |
| **6.3 Protección y medición** | Firebase App Check (Cami crea una clave de reCAPTCHA); analítica respetuosa de la privacidad (Vercel Analytics) para saber cuánta gente entra y dónde se va; respaldo del contenido descargable desde el admin | App Check y respaldo: **sí**. Analítica: muy recomendada |
| **6.4 Prueba general** | Recorrido completo en iPhone y Android reales, en los dos idiomas: registro → bienvenida → lección → perfil → admin. Revisión de accesibilidad y velocidad. Arreglos de lo que aparezca | **Sí** |
| **🚀 Lanzamiento** | Beta pública gratuita. Anuncio en la app, invitaciones | — |
| **7.0 Precios** | Página mensual/anual y qué incluye premium (el admin ya marca premium) | No |
| **7.1 Pagos** | Pasarela real (Wompi, Stripe o similar) conectada al premium | No |
| **7.2 Más contenido** | Los mundos 02 a 07 y el planeta Arena, a medida que se escriben. Radar IA cada lunes | No |
| **7.3 Seguridad avanzada** | Content-Security-Policy completa; XP calculado en el servidor si aparece un ranking | No |

### Fuera de la ruta por ahora

- Aplicación instalable de tienda (App Store / Play Store). La web funciona en el celular.
- Los 4 estados de Punti sin exportar (Glitch, Encrypted, Signal Lost, God Mode).
- Subir imágenes propias a las lecciones (hoy: tablas y diagramas).

---

## 12. Pendientes

### Privacidad y términos (hecho el 2026-09-23, parte de la fase 6.0)

- /privacidad y /terminos están publicados (ver CAMBIOS). Antes de cobrar Punti Club hay que agregar las condiciones de pago y que un abogado revise ambos textos.
- La pantalla de consentimiento de Google (Google Cloud → Branding) usa esos enlaces. El logo está en `contenido/marca/`; subirlo activa la verificación de marca de Google, que pide el dominio verificado en Search Console.
- Lo que falta de la fase 6.0: recuperar contraseña y borrar la cuenta desde la app. Hoy se borra a pedido por correo, como dice la política.

### Tarea aparte: minijuegos para recargar gasolina (idea de Cami, 2026-09-23)

> **Hecho el 2026-09-23 (noche): ver 6.10.** Lo de abajo queda como el punto de partida.

Se trabaja en una tarea nueva del proyecto, para no cargar esta conversación. Punto de partida:
- **Objetivo:** minijuegos cortos sobre IA que recarguen gasolina, fáciles de construir entre Cami y Claude.
- **Ya existe y se puede reutilizar:**
  - La gasolina (`progreso.ts`) y los ajustes (`ajustes.ts`).
  - Los ejercicios (`Ejercicio.tsx`) y los sonidos (`sonido.ts`).
  - Punti en pixel art y las reglas de Firestore.
- **Regla de seguridad clave:** hoy la gasolina solo puede bajar el mismo día (`gasolinaValida` en
  `firestore.rules`). Recargarla con un juego exige una regla nueva con límite diario (por ejemplo,
  +1 por juego y máximo N al día), guardado con la hora del servidor, para que nadie se recargue
  a sí mismo desde la consola.


Lo técnico que no bloquea pero no se debe olvidar:

- **Content-Security-Policy completa**: probarla con el login de Google antes de activarla (fase 7.3).
- **Lista de pilotos paginada**: hoy el admin lee todos los usuarios; revisar al llegar a ~500.
- **Recarga de gasolina a medianoche UTC** (7 p. m. en Colombia), no a la medianoche de cada persona.
- **README.md** del repositorio sigue siendo el de ejemplo de Next.
- ~~Racha y fallos~~: arreglado con el campo `ultimaLeccion`.

### Acciones de Cami

- [x] ~~Borrar `src/app/vista-previa/`~~ — borrada el 2026-09-23 antes del commit.
- [ ] Renombrar el repositorio de GitHub y el proyecto de Vercel de
      `universeai` a `punti`. Cosmético, no afecta nada.
- [ ] Crear un correo de soporte (por ejemplo soporte@punti.space) para la fase 6.0.
- [ ] Crear la clave de reCAPTCHA en Firebase para App Check (fase 6.3), con guía.
- [ ] Configurar la pantalla de consentimiento de Google (nombre Punti, logo,
      correo de soporte, enlace a la política) cuando exista la política (6.0).

### Decisiones abiertas

- **Nombre definitivo del planeta Arena** y su lugar exacto en el orden (propuesto: justo
  después de Lexia).

- **¿Qué pasa al pulsar "Empezar" en una lección?** Hoy va al quiz existente.
  Falta definir si esa es la experiencia final.
- **¿Qué incluye premium?** El admin ya lo marca, pero no cambia nada (fase 7.0).
- **"Thrust"** como nombre en inglés de la nota de la lección: pendiente de confirmar.
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

### 2026-09-23 (noche) — Minijuegos que recargan gasolina

- Cuatro juegos con mecánicas distintas: Punti Flap (con modo IA), Caza la estafa, Caza el glitch y Palabra IA del día. Ver 6.10.
- Ganar da +1 de gasolina, máximo 3 al día, validado en las reglas con la hora del servidor.
- Se cerró un hueco viejo de las reglas: alternar la fecha cerca de la medianoche llenaba el tanque sin límite.
- Hay que publicar las reglas nuevas antes del push.

### 2026-09-23 (tarde) — Fases 2.2 a 4.2: de la portada al admin completo

Resumen; el detalle está en CAMBIOS.md.

- Portada 8-bits, bienvenida con idioma, app entera en español e inglés, perfil.
- Sonido sintetizado y transiciones con dirección; el planeta viaja de la tarjeta
  al mundo.
- Navegación rehecha: ruta de estaciones en vez del globo, segundo intento al
  fallar, salir del quiz, barra de abajo con SEGUIR.
- Estación de control: pilotos (tanque, premium), editor de contenido con
  borrador y vista previa, ajustes del juego, anuncio y FAQ sin tocar código.
- Reglas de Firestore cerradas campo por campo y atadas a los ajustes; cabeceras
  de seguridad; prácticas de seguridad y eficiencia escritas (4.2).
- Todo publicado en punti.space; reglas publicadas; contenido importado a Firebase.
- Decidido con Cami: el editor se adelantó a los precios; los precios pasan a
  después del lanzamiento; la seguridad y la eficiencia se aplican siempre sin
  pedirlas.


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

**Pedido de Cami (2026-09-23): todo lo que se hable y se decida se va anotando en la
documentación**, no solo el código. Decisiones de producto, cambios de plan, archivos
creados fuera del proyecto (Drive, tareas programadas) y el porqué de cada cosa.


1. **Se actualiza por tandas.** Cada vez que se completa un bloque de trabajo, se agrega una
   entrada nueva a la bitácora.
2. **Nunca se borra lo anterior.** La Fase 1.3 quedó obsoleta y ahí sigue, porque explica de
   dónde salió la 1.4. Una decisión que cambió se marca como reemplazada, no se elimina.
3. **El porqué pesa más que el qué.** El código ya dice qué hace. Lo que se pierde con el
   tiempo es por qué se hizo así.

Para pedir una actualización basta con decir: *"actualiza la documentación con lo que hicimos"*.
