# Registro de cambios — Punti

Bitácora corta y en orden inverso: lo más reciente arriba. Sirve para dos cosas:
saber qué se tocó en cada sesión, y **detectar si algo cambió sin que nadie lo
anotara**. Si encuentras un archivo distinto a como quedó aquí, algo lo editó
por fuera.

**Regla:** se agrega una entrada al cerrar cada sesión de trabajo, o antes si ya
van más de ~10 archivos tocados. Nunca se borra una entrada anterior.

Para el detalle de decisiones y el porqué de cada cosa, ver `DOCUMENTACION.md`.

---

## 2026-09-23 · Sistema visual nuevo: pixel art y adiós a la galaxia

**Por qué:** el mapa galáctico no servía en celular. Arrastrar, hacer zoom y
acertarle a un planeta que se mueve es una interacción de escritorio.

### Agregado
- `src/lib/puntiSprite.ts` — Punti en pixel art sobre una rejilla de 32x36.
  Nueve estados (se sumaron `leyendo`, `error` e `info`) y tres recortes
  (cuerpo, busto, cabeza). Dirección visual: "Sólido arcade".
- `src/components/PuntiPixel.tsx` — dibuja el sprite en un canvas. Redondea la
  escala a un entero para que el pixel no quede sucio.
- `src/lib/planetaSprite.ts` — genera cada mundo a partir del `id` del tema.
  Cinco familias, anillos, lunas y luz de borde en el color complementario.
- `src/components/MundosPunti.tsx` — la pantalla de mundos: una tarjeta por
  tema, primero móvil, sin arrastrar ni hacer zoom.
- `src/lib/rangos.ts` — los tres rangos: Explorador espacial, Capitán de
  estación y Arquitecto de galaxias.
- `CAMBIOS.md` — este archivo.

### Cambiado
- `src/lib/temas.ts` — cada mundo tiene ahora nombre propio (Origen, Lexia,
  Eco, Forja, Prisma, Brújula, Autómata) y rango.
- `src/components/Punti.tsx` — los PNG siguen sirviendo para portada y momentos
  grandes; acepta los 9 estados y cae al PNG más cercano para los 3 nuevos.
- **Corazones pasaron a ser gasolina** en toda la interfaz:
  `gasolinaEfectiva`, `gastarGasolina`, `gastarMediaGasolina`, `GASOLINA_MAXIMA`.
  *El campo guardado en Firestore se sigue llamando `corazones` a propósito:
  renombrarlo obligaría a migrar los datos de las cuentas que ya existen.*
- `src/app/inicio/page.tsx` — reescrita sobre la pantalla de mundos, con barra
  de gasolina en vez del número con corazón.
- `src/app/globals.css` — estilos de tarjeta de mundo, planeta y sprite.

### Eliminado
- `src/components/MapaGalaxia.tsx` (702 líneas) — con él se fueron el arrastre,
  el zoom, la captura de puntero y el bucle de animación.

### Corregido
- La familia del mundo se elegía con el primer número del generador, que
  arrastra los bits bajos de la semilla: tres de siete temas caían en el mismo
  tipo de planeta. Se agregó una mezcla de avalancha antes de elegir.
- El botón de la tarjeta se veía relleno todo el tiempo: había un bloque
  `.mundo-cta` duplicado **sin** `:hover`, y un selector que apuntaba a
  `.mundo-barra` en vez de `.mundo-cta`.

### Anomalía sin explicar
El 2026-09-23, entre las 04:09 y las 04:12, tres archivos que se acababan de
escribir (`globals.css`, `MundosPunti.tsx`, `planetaSprite.ts`) aparecieron
modificados, y apareció una ruta `src/app/revision-temporal/` que nadie creó a
propósito. Los cambios eran coherentes y de buena calidad, no basura. Cami
confirmó que no tenía otra sesión abierta. **No hay explicación.** De ahí sale
este archivo: si vuelve a pasar, quedará constancia.

---

## 2026-09-23 · Inicio: preguntas frecuentes, manual y nombres de mundo

### Agregado
- `src/components/PreguntasFrecuentes.tsx` — acordeón de 10 preguntas sobre el
  uso. Hecho con `<details>`/`<summary>` del navegador, sin estado de React:
  abre sin JavaScript y funciona con teclado y lector de pantalla.
- `src/components/ComoFunciona.tsx` — los cinco pasos del viaje. Es componente
  y no página porque se muestra en dos sitios: en `/como-funciona` y en el
  registro de gente nueva. Un solo texto, dos lugares.
- `src/app/como-funciona/page.tsx` — la página que lo envuelve.
- `src/lib/rangos.ts` — Explorador espacial, Capitán de estación y Arquitecto
  de galaxias, cada uno con nombre largo (para el perfil) y corto (para el chip
  de la tarjeta, donde el largo no cabe).

### Cambiado
- Cada mundo tiene nombre propio: **01 Origen · 02 Lexia · 03 Eco · 04 Forja ·
  05 Prisma · 06 Brújula · 07 Autómata**.
- La tarjeta de mundo muestra ahora rango y porcentaje en una sola línea.
- `/inicio` lleva al manual y termina con las preguntas frecuentes.

### Corregido
- La cabecera de las preguntas frecuentes partía el título en dos líneas en
  celular y dejaba a Punti descolgado. Ahora se apila.

### Falsa alarma, anotada para no repetirla
Parecía que la flecha del acordeón no giraba al abrir: medida desde el
navegador daba siempre la matriz identidad. **Sí giraba.** El panel del
navegador estaba oculto, y con la pestaña no visible el navegador congela las
animaciones, así que lo que se medía era el primer fotograma. Para medir algo
con transición hay que quitarle la transición primero, o tener la pestaña a la
vista.

### Pendiente antes de publicar
- Borrar `src/app/vista-previa/` — es una ruta de revisión sin login. Se deja
  mientras se sigue construyendo, pero **no puede llegar a producción**.

### Segunda anomalía
Apareció otra ruta temporal que nadie creó a propósito,
`src/app/preview-mundos/` (04:06), además de `revision-temporal/` (04:11).
Las dos se eliminaron. Sigue sin explicación.

---

## 2026-09-23 · El manual pasa a ser una secuencia de pantallas

**Por qué:** la primera versión era una lista de cinco tarjetas. Se leía, pero
no se sentía. Un manual de bienvenida tiene que ocupar la pantalla y mostrar
lo que explica.

### Cambiado
- `src/components/ComoFunciona.tsx` — reescrito como secuencia de cinco
  pantallas completas, una por paso, con Punti grande en su estado
  correspondiente (online, leyendo, info, levelup, hype).
- **Cada paso muestra lo que explica**, no solo lo cuenta: el paso de los
  mundos enseña tres planetas reales dibujados con el mismo motor de la app;
  el de la explicación, una consola de transmisión con su cursor; el de la
  práctica, un ejercicio con su opción correcta marcada; el de los rangos, los
  tres chips encadenados; el del regreso, la barra de gasolina y la racha.
- La barra de progreso va tomando el color de cada paso, así que al llegar al
  final se ve el recorrido completo en los cinco colores de la marca.
- `src/app/como-funciona/page.tsx` — pasa a componente de cliente. Los
  metadatos se movieron a `layout.tsx`, porque Next no deja exportar
  `metadata` desde un componente de cliente.

### Detalles de interacción
- Se avanza con el botón, con las flechas del teclado y deslizando el dedo.
- El deslizamiento solo cuenta si el gesto es claramente horizontal (más de
  50px y al menos 1.5 veces más ancho que alto), para no robarle el scroll
  vertical a la página.
- Los segmentos del progreso son botones: se puede saltar directo a un paso.
- La animación de entrada se dispara sola porque el contenedor se remonta al
  cambiar de paso (`key={i}`), no porque alguien reinicie una animación a mano.

### Verificado
Recorrido completo en el navegador a 375px con clics reales, no con eventos
simulados: los cinco pasos avanzan, "Saltar" desaparece en el último, y
"Empezar" lleva a `/inicio`.

### Pendiente
Mostrar este mismo manual en el registro de gente nueva. El componente ya
recibe `alTerminar` justamente para eso; falta engancharlo al alta de cuenta.

### Consolidación
`src/components/PlanetaPixel.tsx` apareció como componente suelto (05:11, misma
anomalía de siempre) y resultó ser una buena extracción: el planeta dejó de
estar incrustado dentro de la tarjeta de mundo y pasó a ser reutilizable. Se
adoptó, y se eliminó el `MiniPlaneta` duplicado que el manual tenía por dentro.
Ahora los planetas del mapa y los del manual salen del mismo componente.

---

## 2026-09-23 · Fase 2.2: portada 8-bits y animación

### Agregado
- `src/components/CampoEstelar.tsx` — campo de estrellas en canvas, con tres
  capas de profundidad y estrellas fugaces ocasionales.
- `src/app/page.tsx` — portada nueva: hero con Punti grande, los siete mundos
  en cascada, resumen del manual y cierre con llamado a la acción.

### Cómo está hecha la animación
- **Solo se animan `transform` y `opacity`.** Son las dos propiedades que el
  navegador mueve sin rehacer el diseño de la página. Animar `top`, `width` o
  `margin` obliga a recalcular todo en cada cuadro y se siente a tirones.
- **El campo de estrellas se apaga cuando la pestaña no está visible.** Un
  bucle corriendo en una pestaña de fondo gasta batería para nada, y al volver
  el navegador dispara un salto de tiempo enorme que descuadra el movimiento.
- **Respeta `prefers-reduced-motion`**: dibuja un cuadro y no arranca el bucle.
- **`devicePixelRatio` y `ResizeObserver`**: sin lo primero el pixel se ve
  borroso en pantallas densas, sin lo segundo el canvas no se entera cuando su
  contenedor cambia de tamaño.
- Las estrellas se dibujan con `Math.round`: pegadas a la rejilla de pixeles.
  Sin eso el navegador reparte cada una entre dos columnas y se ven grises.
- Los botones bajan 2px al presionarse, con `steps(2)` en vez de una curva
  suave. Es la tecla de un arcade, no un botón de formulario.

### Corregido
- **Press Start 2P no tiene mayúsculas acentuadas.** "INICIAR SESIÓN" se veía
  como "INICIAR SESIóN", con esa letra en otra fuente. Las etiquetas en fuente
  pixel pasan a escribirse sin tilde: ENTRAR y VOLVER. Queda anotado en
  `globals.css` para no repetirlo.
- El texto "puedes destapar una pista por media" no se entendía. Ahora dice
  que pedir una pista cuesta media gasolina, la mitad de lo que cuesta fallar.

### Sin verificar
El movimiento del campo de estrellas **no se pudo comprobar desde aquí**: con
el panel del navegador fuera de vista, el navegador no ejecuta ni un cuadro de
animación — un contador propio de `requestAnimationFrame` marcó 0 en 900ms.
Lo estático sí quedó verificado. Falta que alguien lo mire con la página al
frente.

---

## 2026-09-23 · Portada reestructurada tras revisar Codédex

**Por qué:** "Cómo funciona" aparecía tres veces (enlace bajo el hero, banda de
los cinco pasos, y el cierre repetía el mismo llamado del hero), y entre el
hero y la sección del universo quedaba un hueco raro.

### Corregido
- **Se eliminó el hueco.** El hero tenía `min-h-[86vh]` con el contenido
  centrado, más su propio relleno vertical, más el de la sección siguiente.
  Ahora la altura la define el contenido.
- **"Cómo funciona" pasó de tres apariciones a una**: se quitó el enlace bajo
  el hero y la banda de los cinco pasos, y queda un solo botón al cerrar la
  sección "por dentro".
- El cierre repetido se reemplazó por las **preguntas frecuentes**.
- Se quitó "Escríbenos" del cierre: no hay dónde escribir todavía, y prometer
  un canal que no existe es peor que no ofrecerlo.

### Agregado
- **Banda de cifras** (7 mundos · 26 lecciones · 5 tipos de ejercicio · 0 pesos
  al mes). Se calculan contando `TEMAS` y sus subtemas, así que se actualizan
  solas cuando crezca el contenido.
- **Sección "por dentro"**: tres bloques alternados que *muestran* el producto
  con las mismas maquetas del manual — la consola de Punti, un ejercicio real y
  el progreso. La maqueta dejó de ser privada del manual y ahora se reutiliza.
- **`src/components/PieDePagina.tsx`** — pie con enlaces reales. Una página que
  termina de golpe en un botón se siente a medio hacer.

### Lo que NO se copió de Codédex, y por qué
Su home se sostiene sobre pruebas sociales: "un millón de estudiantes",
testimonios con nombre y cargo, logos de patrocinadores, premios y una nota de
4.7/5. **Eso no se puede replicar porque todavía no es cierto**, y unos
testimonios inventados serían una mentira que además se cae sola. Lo que sí se
tomó es la estructura: cifras concretas, bloques que muestran el producto en vez
de describirlo, preguntas frecuentes y un pie completo. Las cifras que se usan
son del producto, no de la audiencia.

### Pendiente legal
La app ya recoge correos al registrar usuarios, así que **hace falta una
política de privacidad** y unos términos antes de promocionarla en serio. No se
pusieron enlaces en el pie porque esas páginas no existen todavía.

---

## 2026-09-23 · Fase 2.3: bienvenida con idioma y manual

### Agregado
- `src/app/bienvenida/page.tsx` — dos pasos: elegir idioma y recorrer el
  manual. Guarda el idioma apenas se elige (si la persona cierra a mitad del
  manual, no lo pierde) y marca la bienvenida como vista al terminar o saltar.
- `src/components/ElegirIdioma.tsx` — el selector. Solo se ve y reacciona; qué
  se guarda lo decide la página. Por eso se puede probar sin cuenta.
- `src/lib/i18n.ts` — los dos idiomas y sus saludos.
- En el perfil: `idioma` y `bienvenidaVista`, con `guardarIdioma()` y
  `marcarBienvenidaVista()`.
- En los rangos: nombre en inglés (Space Explorer · Station Captain · Galaxy
  Architect).

### Cambiado
- `ComoFunciona.tsx` — el manual existe en español e inglés. Cada texto vive
  al lado de su gemelo, para que quien cambie uno vea el otro.
- **El registro manda a `/bienvenida`** en vez de a `/inicio`.
- **`/inicio` redirige a `/bienvenida`** a quien no la haya visto. Es el único
  punto de control: registro con correo, con Google, o cuenta vieja sin
  idioma, todos pasan por `/inicio`.
- `/inicio` espera a tener el perfil antes de pintar los mundos, para no
  mostrar un instante la pantalla con 0 de avance ni asomarse antes de
  redirigir.

### Cómo reacciona
- Punti reacciona a lo que la persona **está a punto** de elegir: al pasar el
  cursor o el foco por una tarjeta, la burbuja ya le habla en ese idioma.
- Al elegir: la tarjeta destella dos veces (animando `opacity` de una capa
  encima, no el borde), la otra se apaga, Punti celebra, y las dos se bloquean
  para que no se pueda elegir dos veces.
- 900ms de respiro antes de pasar al manual: si el cambio es instantáneo, la
  reacción de Punti no alcanza a verse.
- Si falla el guardado, Punti pasa a estado **error** y la burbuja lo dice en
  los dos idiomas. Primer uso real del estado nuevo.

### Verificado
Con clics reales y teclado a 375px: elegir inglés cambia la burbuja, bloquea
las tarjetas y a los 900ms entra el manual en inglés; las flechas recorren los
cinco pasos, y los rangos y la gasolina salen traducidos.

### Lo que falta para que elegir inglés sea completo
Hoy se traduce la bienvenida y el manual. **Todavía en español**: `/inicio`,
las preguntas frecuentes, la portada, el login, el registro y la lección.
Quien elija inglés aterriza hoy en un `/inicio` en español.

### Nota de seguridad (para la fase del panel de admin)
Las reglas de Firestore dejan que cada usuario escriba **cualquier campo** de
su propio perfil. Hoy no importa, pero el día que exista `premium` o una
recarga de gasolina desde el admin, cualquiera podría dárselo a sí mismo
desde la consola del navegador. Antes de lanzar premium hay que restringir qué
campos puede tocar el usuario.

---

## 2026-09-23 · Fase 2.4 (primera parte): la interfaz en dos idiomas

### De dónde sale el idioma
**Vive en el navegador y se respalda en el perfil.** En este orden:
1. Lo último que la persona eligió en ese navegador (`localStorage`,
   clave `punti-idioma`).
2. Si nunca eligió nada, el idioma del navegador.
3. Si nada de eso existe, español.

Con cuenta, **el perfil manda**: `/inicio` copia `perfil.idioma` al navegador
al cargar, porque es lo único que viaja de un celular a otro.

Se lee con `useSyncExternalStore` (`src/lib/useIdioma.ts`) y no con estado +
efecto: no rompe la hidratación — el servidor pinta español y el navegador
corrige en el primer cuadro — y cualquier cambio avisa a todos los
componentes a la vez, incluso en otras pestañas.

### Agregado
- `src/lib/useIdioma.ts` — el idioma activo y `cambiarIdioma()`.
- `src/components/SelectorIdioma.tsx` — interruptor ES / EN.
- `src/components/LangDocumento.tsx` — mantiene `<html lang>` al día. No es
  decorativo: los lectores de pantalla eligen la voz según ese atributo.
- `src/components/MarcoCuenta.tsx` — marco común de entrar y crear cuenta.

### Traducido
Portada, `/inicio`, preguntas frecuentes, pie de página, tarjetas de mundo,
`/como-funciona`, login, registro y los mensajes de error de Firebase. Los
7 mundos tienen nombre en inglés (**Origin, Lexia, Echo, Forge, Prism,
Compass, Automaton**) y los 26 subtemas su gemelo.

**El campo en inglés es obligatorio en el tipo de `Tema` y `Subtema`.** Si
alguien agrega un subtema sin su traducción, el proyecto no compila. Es la
forma de que "replicar el contenido" no dependa de acordarse.

### Cambiado
- **Login y registro pasaron al sistema visual nuevo** — eran lo último con
  bordes redondeados y el Punti viejo. Punti refleja lo que pasa: en línea
  mientras se escribe, cargando mientras se envía, error si algo falla.
- El botón de Google pasó a su versión oscura.
- Los errores de cuenta guardan el **código**, no el mensaje: si la persona
  cambia de idioma con un error en pantalla, el mensaje se traduce también.
- "Si hay uno que te urge, dilo" se quitó de las preguntas frecuentes: igual
  que el "Escríbenos" de la portada, prometía un canal que no existe.

### Verificado
Con clics reales: cambiar a inglés en la portada cambia todo de una vez,
`<html lang>` pasa a `en`, los dos selectores (arriba y pie) quedan
sincronizados, y el idioma persiste al ir al login y al registro.

### Todavía en español
El planeta por dentro (`/tema/[id]`), la lección completa (textos de la
interfaz y el contenido), los ejercicios y las frases de Punti al acertar o
fallar. Es la segunda parte de esta fase.

### Nota
Los metadatos de `/como-funciona` (título de la pestaña y descripción para
buscadores) siguen en español: viven en el servidor y no pueden depender de
un idioma que solo conoce el navegador.

---

## 2026-09-23 · Fase 2.4 (segunda parte): la lección en dos idiomas

### Cómo se guarda una lección bilingüe
**Cada lección se escribe dos veces, completa.** `LECCIONES` pasa a ser
`Record<string, Record<Idioma, Leccion>>`: por cada id, una versión en
español y otra en inglés, cada una con su explicación, gráficos, ejercicios,
pistas, respuestas correctas y tarea. No se traduce frase por frase porque así
es como se traduce contenido de verdad, y porque evita que una pista en inglés
quede pegada a un ejercicio en español. Las dos versiones son obligatorias.

### Traducido
- La lección "Qué es la IA" completa, en inglés.
- La pantalla de la lección, los ejercicios, las frases de Punti al acertar y
  fallar, los títulos de los gráficos, el planeta por dentro y el globo.
- En inglés, la nota de la lección (el "combustible" de 1 a 3) se llama
  **Thrust**: "fuel" ya es la gasolina, y usar la misma palabra para las dos
  cosas las confundiría.

### Corregido
- **El botón de la pista decía "cuesta medio corazón".** Al renombrar
  corazones a gasolina se cambiaron las funciones pero no ese texto.
- **La barra de gasolina contaba mal las medias.** Con 4,5 mostraba 5
  segmentos llenos, porque solo preguntaba si el segmento estaba por debajo
  del número. Ahora hay `BarraGasolina` con segmentos llenos, a la mitad y
  vacíos, y la usan `/inicio` y la lección.
- **BRÚJULA y AUTÓMATA en fuente pixel**: Press Start 2P no trae mayúsculas
  acentuadas, igual que con "SESIÓN". Se agregó `textoPixel()` en
  `i18n.ts`, que pasa a mayúsculas y quita tildes, como hacían los juegos de
  la época. Se aplica a los nombres de mundo en pixel.
- **El planeta por dentro decía "Volver a la galaxia"**, y la galaxia ya no
  existe. Ahora vuelve a los mundos.
- **Fallar un ejercicio ponía a Punti en "sin batería"**, el mismo estado de
  quedarse sin gasolina. Ahora fallar es **error**; sin batería queda solo
  para cuando de verdad se acaba la gasolina. Pedir pista pone a Punti en
  **info**.
- Se deshizo un cambio propio: "Achievement unlocked" se había traducido a
  "Logro desbloqueado", pero estaba en inglés a propósito — es jerga gamer y
  parte de la voz de Punti.

### Cambiado
- La lección, el planeta por dentro y los ejercicios pasaron al sistema pixel:
  Punti en pixel, esquinas rectas, botones de arcade, barra de gasolina en
  segmentos en vez del emoji.
- Botón dorado (`.boton-pixel-oro`) para "Empezar ejercicios": avisa que lo
  que sigue es otra fase, no una pantalla más.

### Barrido
Se revisaron todos los `.tsx` buscando texto en español fuera de una tabla de
traducción. Quedaron 13 candidatos y todos son correctos: están dentro de las
tablas, dentro de un "si es inglés esto, si no aquello", o son metadatos del
servidor (título de pestaña y descripción para buscadores), que no pueden
depender del idioma del navegador.

### Verificado
Con la ruta de vista previa a 375px: la barra muestra `####½` con 4,5 y `½....`
con 0,5; el ejercicio y la frase de Punti al acertar salen en inglés; el
gráfico dice "COMPARISON"; la portada muestra BRUJULA y AUTOMATA sin tilde.

**No se pudo recorrer la lección entera con cuenta**: necesita iniciar sesión,
y no se usan credenciales ajenas. Tipos y lint pasan limpios.

---

## 2026-09-23 · Fase 2.5: el perfil

### Agregado
- `src/app/perfil/page.tsx` — carga el perfil y lo entrega al panel. Si no
  carga, Punti en estado error con un mensaje y salida a los mundos.
- `src/components/PanelPerfil.tsx` — recibe el perfil ya cargado, a propósito,
  para poder probarlo con datos de ejemplo sin cuenta.
- `rangoPorXp()` y `XP_RANGO` en `rangos.ts`: el rango **de la persona**.
- En `/inicio`, el avatar de la cabecera lleva al perfil.

### Qué muestra, en este orden
1. **Ficha de piloto**: Punti de avatar (celebra si la racha es de 3 días o
   más), nombre, rango, barra hacia el siguiente rango con la XP que falta, y
   cuatro cifras: XP total, racha, gasolina y lecciones.
2. **Retoma donde lo dejaste**: el mundo más avanzado de los que están a medias,
   con su siguiente lección y un botón directo a ella. Si esa lección todavía
   no existe lo dice y el botón lleva al mundo — no promete una lección que no
   hay. Es la sección más importante: un perfil de solo números no hace volver
   a nadie.
3. **Mundos a medio camino** (los demás empezados).
4. **Mundos conquistados**.
5. **Ajustes**: idioma (se guarda en el perfil) y cerrar sesión.

### DECISIÓN TOMADA, revisable: el rango sale de la XP
Explorador desde 0, **Capitán desde 100 XP**, **Arquitecto desde 300 XP**. Una
lección perfecta da 20 XP y hay unos 300-400 en todo el universo, así que
Capitán llega hacia la cuarta parte y Arquitecto cerca del final. Se eligió XP
y no mundos completados porque premia la constancia. El rango de cada mundo
(la dificultad del contenido) no cambia.

### Animación
- **La XP, la racha y las lecciones cuentan desde 0** al abrir, con una curva
  que frena al final para que los últimos números se vean pasar.
- **La barra de rango se llena desde 0** animando `scaleX`, no el ancho.
- **El avatar respira** con un brillo del color del rango (animando la
  opacidad de una capa encima, no la sombra).
- Todo respeta `prefers-reduced-motion`.

### Corregido antes de publicarlo
- **El contador arrancaba mostrando el número final** y en el primer cuadro
  saltaba a 0 para contar: un parpadeo. Ahora empieza en 0.
- **Con movimiento reducido, el contador se habría quedado en 0** para
  siempre: el efecto no animaba, pero tampoco ponía el valor. Ahora muestra el
  valor final directo.
- **En una pestaña de fondo, el contador saltaba al final al volver** sin
  animarse, porque tomaba la hora de inicio al montar. Ahora el reloj arranca
  con el primer cuadro que el navegador de verdad dibuja.
- El brillo del avatar era verde aunque el borde fuera del color del rango.

### Verificado
Con un perfil de ejemplo a 375px, en español y en inglés: 135 XP da Capitán
con 165 XP para Arquitecto, 3,5 de gasolina se ve como 3 y media, "Retoma"
elige Origen (60%) sobre Eco (25%) y, como la siguiente lección de Origen no
existe, ofrece "VER MUNDO". Los contadores cuentan desde 0 cuando el panel
empieza a dibujar.

---

## 2026-09-23 · Fase 3.0: sonido

### Cómo suena Punti
**Ningún sonido es un archivo.** Se sintetizan en el momento con osciladores de
onda cuadrada y triangular (`src/lib/sonido.ts`), como los chips de consola de
los 80. Cambiar un sonido es cambiar un número. Se eligieron escuchándolos en
un tablero de prueba:

| Momento | Variante |
|---|---|
| Cualquier botón | Tic suave |
| Acierto | Moneda |
| Error | Zumbido — *Cami pidió "Alerta", que no existía; se tomó la más parecida* |
| Pista | Destello |
| Subir de rango | Ascenso |
| Lección completada | Victoria |
| Sin gasolina | Motor tose |
| Cambio de pantalla | Soplido |
| Arranque | Sistema |
| Voz de Punti al teclear | Robot |
| Música | Solo en la portada, **apagada por defecto** |

### Agregado
- `src/lib/sonido.ts` — el motor, el catálogo, la música y las preferencias.
- `src/components/SonidoGlobal.tsx` — el "tic" de todos los botones, puesto una
  vez en el layout. Suena en `pointerdown` y no en `click`: llega cuando el
  dedo toca, no cuando se levanta. Un botón que no deba sonar lleva
  `data-mudo`.
- `src/components/BotonSonido.tsx` — silencio, con el altavoz dibujado en
  pixel. En la portada, `/inicio`, la lección, las pantallas de cuenta y el
  perfil. Se recuerda entre visitas.
- `src/components/BotonMusica.tsx` — solo en la portada, con un ecualizador de
  tres barras que baila mientras suena.
- **Aviso de "nuevo rango"** al terminar una lección: se compara el rango de la
  XP con que se abrió la lección con el de la XP final.

### Decisiones de ingeniería
- **El audio no se crea hasta el primer toque.** El navegador lo exige, y
  crearlo antes solo deja avisos en consola.
- **Compresor al final de la cadena**: dos sonidos juntos no se saturan.
- **Enfriamiento por sonido**: el tic no se repite antes de 40 ms, la voz antes
  de 30, el soplido antes de 120. Sin esto, dos eventos seguidos suenan
  encimados y crujen.
- **En silencio no se crea ni un nodo de audio**, no solo se baja el volumen.
- **Los sonidos no se pisan**: el "sin gasolina" espera a que termine el
  zumbido del error, y el ascenso de rango suena 1,5 s después de la victoria,
  al mismo tiempo que aparece el aviso — el ojo y el oído llegan juntos.
- **La música se programa con "mirada adelante"**: cada 25 ms se agendan las
  notas de los próximos 120 ms en el reloj del audio, que no tiembla como el de
  la página. Entra en un segundo y se apaga en medio, sin cortes secos.
- **La voz suena una letra sí y una no**: con todas es una ametralladora.

### Corregido antes de entregarlo
- **El soplido del manual habría sonado doble** en desarrollo: estaba dentro de
  la función que actualiza el estado, y React la ejecuta dos veces a propósito
  para detectar errores. Se movió afuera.
- **Silenciar con la música encendida y luego reactivar el sonido dejaba el
  botón en "Música: sí" sin que sonara nada.** Ahora la portada se anota en el
  motor mientras está abierta, y al reactivar el sonido la música vuelve.

### Verificado
Con clics reales, contando los osciladores que se crean:
- Música encendida: 22 notas en 2,5 s, que es lo que da el tempo de 110.
- Silencio: 0 notas, incluso tocando un enlace. Se recuerda al recargar.
- Reactivar el sonido en la portada: vuelve la música (18 notas en 2 s).
- Salir de la portada a `/login`: 0 notas, la música se apaga sola.
Los 18 sonidos del tablero se generaron sin errores con un audio simulado.
**Oírlos solo lo puede hacer una persona.**

---

## 2026-09-23 · Fase 3.1: transiciones entre pantallas y estados de carga

### Transiciones
Usan las **View Transitions** del navegador, que esta versión de Next integra
sin configuración (`ViewTransition` de React, `transitionTypes` en `Link` y en
`router.push`). El navegador toma una foto de la pantalla vieja y otra de la
nueva y anima entre las dos. Como son fotos, no queda ningún `transform`
pegado a la página después — que es justo lo que rompería los elementos fijos
si se animara la página entera con CSS.

- `src/app/template.tsx` — la transición de cada pantalla, puesta una sola vez.
  Un template se vuelve a montar en cada navegación; un layout no, y nunca
  dispararía entrada ni salida.
- **La dirección dice dónde estás**:
  - `adelante` (entrar a un mundo, a una lección, al perfil, al manual): lo
    viejo sale por la izquierda, lo nuevo entra por la derecha.
  - `atras` (volver a los mundos, salir de una lección): al revés.
  - sin tipo (botón atrás del navegador, enlaces de la portada): fundido
    corto. El navegador no dice hacia dónde fue, así que no se inventa.
- **Tiempos asimétricos**: lo viejo sale en 150 ms y lo nuevo entra en 220 ms
  después de que lo viejo terminó. Lo que se va no compite con lo que llega.
- **El planeta viaja**: al tocar un mundo, el planeta de la tarjeta vuela
  hasta la cabecera del mundo (se agregó un planeta chico ahí). Es el mismo
  `name` en los dos lados; el navegador los reconoce como un solo objeto. Un
  destello de desenfoque a mitad de camino esconde que las dos fotos son de
  tamaños distintos. Es el "acercamiento para entrar" del mapa galáctico, sin
  lo que se rompía en celular.
- Durante la transición la capa animada no se come los clics.

### Carga
- `src/components/Cargando.tsx` — una sola pantalla de carga para toda la app:
  Punti cargando, una barrita que recorre un riel y una frase que cambia cada
  2,2 s ("Calibrando propulsores", "Alineando planetas"...), en los dos
  idiomas.
  - **No aparece durante los primeros 250 ms.** La mayoría de cargas terminan
    antes, y un cargador que aparece y desaparece en un parpadeo es peor que
    esperar quieto.
  - **La barra es infinita a propósito**: no se sabe cuánto falta, y una barra
    que se llena y se detiene al 90% miente.
- `src/components/EsqueletoMundos.tsx` — en `/inicio`, mientras llega el
  progreso, la forma exacta de la pantalla: cabecera y tarjetas con las mismas
  medidas. Cuando llega el contenido nada salta de lugar. Un brillo de barrido
  cruza cada bloque, en pasos, como una pantalla vieja.
- **Del esqueleto al contenido hay transición**: el perfil se guarda dentro de
  `startTransition`, así que el esqueleto se desvanece rápido y el contenido
  sube un poco al entrar.
- Reemplazó los cargadores sueltos de `/inicio`, `/tema`, la lección, el perfil
  y la bienvenida, que eran cada uno distinto.

### Movimiento reducido
Con `prefers-reduced-motion` todas las transiciones duran 0: la pantalla
cambia, sin desplazamiento ni viaje. El cargador y el esqueleto se quedan
quietos.

### Verificado
Interceptando las transiciones en el navegador, con clics reales:
- Portada → login: clase `fundido` en la pantalla vieja y la nueva, animó.
- Salto marcado `adelante` a `/como-funciona`: clase `adelante`, animó.
- Tarjeta de mundo → mundo: el navegador animó el grupo
  `planeta-que-es-la-ia` de la foto vieja a la nueva. **El planeta viaja.**

**No se pudo ver la animación**: con el panel del navegador fuera de vista, el
documento está oculto y el navegador no dibuja. Se comprobó que las
transiciones se piden con los nombres y las clases correctas y que corren.
El esqueleto de `/inicio` necesita cuenta para aparecer y no se vio.

### Nota
Dos pantallas de la misma carpeta (por ejemplo `/tema/a` → `/tema/b`) no
disparan la transición de dirección, porque el template solo se vuelve a
montar al cambiar de carpeta. Hoy no hay ningún salto así en la app.

---

## 2026-09-23 · Fase 4.0, paso 1: reglas de la base de datos cerradas

Antes de construir el panel de administración y el premium había que cerrar
un hueco: la regla decía "cada quien escribe lo que quiera en su perfil".
Cualquiera con un poco de conocimiento podía ponerse gasolina infinita, XP o,
cuando exista, premium.

- `firestore.rules` reescrito: lista cerrada de campos que el usuario puede
  cambiar, cada uno con su límite (tabla en DOCUMENTACION.md, 6.4). Lo que no
  está en la lista es solo del admin.
- El admin se reconoce por su correo verificado y puede leer todos los
  perfiles (lo que necesita el panel).
- La fecha de "hoy" la pone el reloj del servidor: adelantar el reloj del
  teléfono no recarga la gasolina.
- Copia de la versión anterior en `referencias/firestore.rules.anterior`.

**No se pudo probar aquí**: el simulador de Firebase se descarga de un
servidor que la red bloquea. Se revisó a mano cada escritura de la app
(crear perfil, completar lección, fallar, pista, idioma, bienvenida) contra
las reglas. La prueba real se hace publicando y jugando en localhost.

Encontrado de paso (no lo causan las reglas): si el primer movimiento del día
es un fallo, completar una lección ese día ya no sube la racha. Anotado en
pendientes.

### Arreglo: después de fallar, el ejercicio quedaba bloqueado
Encontrado por Cami al probar las reglas nuevas (no lo causaban ellas; venía de
antes). Al fallar, la lección se queda en el mismo ejercicio para intentarlo de
nuevo, pero los botones seguían apagados y no había forma de avanzar.
- `Ejercicio.tsx`: 1,9 s después del error (lo que dura el mensaje) se abre un
  segundo intento. La opción fallada queda tachada y apagada; las demás se
  pueden elegir. En "ordenar pasos" se vacía el orden para volver a armarlo.
- Las reglas sí funcionaron: la gasolina bajó al fallar.

### El globo girable se cambia por una ruta de estaciones
Cami: "esa forma de girar el mundo no es cómoda". El globo escondía detrás de
la esfera la mitad de las lecciones y había que girarlo a ciegas para
encontrar la siguiente. También era lo último que quedaba del estilo de la
galaxia vieja.
- `src/components/RutaTema.tsx` (nuevo): las lecciones como estaciones
  cuadradas en pixel art que zigzaguean de arriba hacia abajo, unidas por un
  camino (sólido lo recorrido, punteado lo que falta). Todas a la vista, sin
  arrastrar nada. Se toca la estación y se abre la lección.
- La que toca lleva la etiqueta "SIGUE AQUI" ("EMPIEZA AQUI" si no has hecho
  ninguna), un anillo de radar que late en pasos y a Punti esperando al lado.
  Si queda fuera de la pantalla, la página baja hasta ella al llegar.
- Estaciones con sombra de botón arcade que se hunde al tocarla; visto dibujado
  en pixeles; títulos sobre una placa oscura para que el camino no los tache.
- Mundo terminado: "★ MUNDO CONQUISTADO" al final.
- Se quitó el alternador globo/lista: la ruta ya es la lista. El globo quedó
  guardado en `referencias/PlanetaTema.globo.tsx.txt`.
- Verificado en 375 px: ningún elemento se monta sobre otro y la página no se
  desborda hacia los lados.

### Limpieza antes de publicar
- Borrada `src/app/vista-previa/` (las pantallas de prueba sin login).
- Cami probó en localhost con su cuenta: lección completa, fallo con segundo
  intento, pista, idioma y la ruta nueva. Todo guarda con las reglas nuevas.

---

## 2026-09-23 · Fase 4.0, paso 2: la Estación de control (/admin)

- `src/lib/admin.ts`: `CORREO_ADMIN`, `esAdmin()`, `listarUsuarios()`,
  `llenarTanque()`, `cambiarPremium()`. El correo coincide con el de
  `firestore.rules`; si se cambia uno, hay que cambiar el otro.
- `src/app/admin/page.tsx`:
  - Cifras arriba: pilotos, jugaron hoy, premium, lecciones hechas.
  - Buscar por nombre o correo; filtros (todos, jugaron hoy, premium, sin
    gasolina); orden (recientes, más XP, mejor racha).
  - Cada piloto: inicial con el color de su rango, correo, rango, idioma,
    XP, racha, lecciones, barra de gasolina, última lección y fecha de
    registro. Los premium llevan borde dorado.
  - Botones "LLENAR TANQUE" y "HACER/QUITAR PREMIUM"; el cambio se ve al
    instante y un aviso abajo lo confirma.
  - Quien no es admin ve "ZONA RESTRINGIDA". No es la seguridad (esa son las
    reglas); es para no mostrar una pantalla que no le funcionaría.
  - Si Firebase niega la lista, el panel lo dice en claro y sugiere revisar
    que las reglas estén publicadas.
- En `/perfil`, solo para el admin: botón "ESTACION DE CONTROL".
- Premium: por ahora es solo una marca (`premium: true`). Qué incluye se
  decide con la página de precios (4.1).

### La racha tiene su propia fecha (`ultimaLeccion`)
Llenar el tanque obliga a guardar la fecha de hoy en `ultimaActividad`, que
era también la fecha de la racha: llenarle el tanque a alguien le habría
quitado el +1 de racha de ese día. Es el mismo error que ya pasaba al fallar
un ejercicio antes de completar una lección.
- Nuevo campo `ultimaLeccion`: se escribe solo al completar una lección, y la
  racha se cuenta con él. Los perfiles viejos usan `ultimaActividad` hasta
  su próxima lección.
- `firestore.rules`: admite `ultimaLeccion` (solo con la fecha de hoy) y la
  racha solo cambia cuando cambia `ultimaLeccion`. **Hay que volver a
  publicar las reglas.**

### Salir del quiz
Cami: "no hay forma de salirse del quiz". Las pantallas de explicación tenían
SALIR, pero en los ejercicios no había ningún botón de salida.
- Botón SALIR a la izquierda de la gasolina durante los ejercicios.
- Pide confirmación en un panel de la app (no un `confirm()` del navegador),
  con Punti sin batería: "¿Salir de la lección? Tu avance en esta lección no
  se guarda. La gasolina que ya gastaste no vuelve."
- El botón grande es SEGUIR JUGANDO y tiene el foco: la opción que no pierde
  nada es la fácil. Escape o tocar fuera del panel = seguir jugando.

---

## 2026-09-23 · Fase 5.1: editor de contenido en el admin (adelantada)

Cami: "en el admin también quiero controlar la carga de las preguntas, quiz y
todo lo relacionado con el aprendizaje". Se adelantó antes de los precios: de
~26 lecciones solo existía una, y cada lección nueva dependía de escribirla en
código.

- **El contenido pasa a Firebase** (`src/lib/contenido.ts`). Catálogo en
  `contenido/catalogo`, lecciones en `lecciones/{id}`, borradores en
  `borradores/`. La app usa el código mientras no se importe o si Firebase no
  responde.
- **La app lee de ahí**: portada, mundos, ruta del mundo, lección y perfil usan
  `useCatalogo()` y `cargarLeccion()`. /inicio y /tema esperan el catálogo con
  el esqueleto, para que los mundos no salten al llegar.
- **Formato bilingüe** `{ es, en }` para editar lado a lado; `aLeccion()` entrega
  la lección en un idioma, así que el quiz no cambió.
- **Admin con pestañas** PILOTOS / CONTENIDO (`MarcoAdmin.tsx`).
- **/admin/contenido**: botón para importar lo del código la primera vez; los
  mundos (nombre, título, descripción, rango, orden, agregar, quitar) y sus
  lecciones (títulos, orden, agregar, quitar) con el estado de cada una.
  "PUBLICAR MUNDOS".
- **/admin/contenido/[id]**: editor de la lección. Pantallas de explicación (qué
  dice Punti, cómo se ve, con vista del sprite, tabla o diagrama opcional), los
  5 tipos de ejercicio (marcar la correcta, verdadero/falso, frase con espacio,
  pasos en orden, prompt), pista, tarea y tiempo objetivo. Todo ES/EN lado a lado.
- **Autoguardado** del borrador 1,2 s después del último cambio, con indicador; si
  se cierra la pestaña con algo sin guardar, el navegador pregunta.
- **Validación antes de publicar** con lista de faltas y campos vacíos en rosa.
- **Vista previa jugable** en los dos idiomas.
- Borrar pide un segundo toque ("¿Borrar?") en el mismo botón.
- `firestore.rules`: contenido y lecciones públicos de lectura, escritura solo
  admin; borradores solo admin. **Hay que volver a publicar las reglas.**

### Verificado
Con una página de prueba temporal (ya borrada): la lección actual convertida a
bilingüe y de vuelta sale idéntica en español y en inglés; no quedan listas
dentro de listas; la lección y el catálogo del código pasan la validación sin
faltas; una lección vacía da 7 faltas. La vista previa se probó con clics: en
inglés, acertar la opción múltiple pasa al verdadero/falso. La portada sigue
mostrando los 7 mundos. **No se pudo ver el editor**: exige la cuenta del admin.

---

## 2026-09-23 · Ajustes en el admin + seguridad y eficiencia por defecto

Cami: "todo lo que consideres en el admin para no modificar el código principal.
Aplica las prácticas desde el inicio en términos de eficiencia y seguridad, para no
estar repitiendo".

### Pestaña AJUSTES (/admin/ajustes)
- **Reglas del juego**: tanque de gasolina, costo de fallar, costo de la pista, XP
  por nota (sin errores / 1-2 / 3 o más), bono de velocidad y XP para cada rango.
  Validación (enteros, pasos de 0,5, XP de mayor a menor, Arquitecto > Capitán) y
  botón "valores de siempre". Aplican de inmediato.
- **Anuncio**: un aviso arriba de los mundos (novedad, aviso importante o
  celebración), en ES/EN, con vista previa. Cada persona lo puede cerrar; si cambia
  el texto, vuelve a salir.
- **Preguntas frecuentes** de la portada: editar, reordenar, agregar, quitar. La
  primera vez salen las del código; al guardar pasan a Firebase.
- `src/lib/ajustes.ts` (valores por defecto, validación, normalización);
  `contenido/ajustes` y `contenido/faq` en Firebase.
- `progreso.ts` y `rangos.ts` leen los ajustes. El texto de la pista dice lo que
  cuesta de verdad ("cuesta 1 gasolina", "gratis"…).
- Las pantallas que muestran números del juego (mundos, lección, perfil, admin)
  esperan a que lleguen los ajustes; se piden junto con el catálogo, en una sola
  espera.

### Reglas de Firestore
- Leen `contenido/ajustes`: el tanque y el XP máximo por lección ya no están fijos.
- El progreso de cada lección se valida campo por campo (completada, nota 1-3, XP,
  tiempo, fecha del servidor). La app indica qué lección cambió en
  `ultimaLeccionId`, porque las reglas no pueden recorrer listas.
- Perfil nuevo: nombre de hasta 80 letras, correo de hasta 200 e igual al de la
  cuenta.
- **Hay que volver a publicar las reglas.**

### Seguridad
- Cabeceras en `next.config.ts`: nosniff, anti-iframe, Referrer-Policy, permisos de
  cámara/micrófono/ubicación/pagos apagados, COOP compatible con el login de Google,
  HSTS; ya no se anuncia "Next.js". Verificadas en localhost.
- El admin no se indexa en buscadores (`src/app/admin/layout.tsx`).
- `firma()` se movió a `contenido.ts`: ninguna pantalla pública carga código del
  admin.

### Eficiencia
- Fallar o pedir pista ya no relee el perfil: la función devuelve la gasolina que
  queda (una lectura menos por cada error).
- Si Firebase no responde al cargar el catálogo, se juega con lo del código y se
  reintenta en la siguiente pantalla (antes se quedaba con el fallo toda la visita).

### Prácticas escritas
- `DOCUMENTACION.md` → 4.2 "Prácticas obligatorias en cada cambio" y un resumen en
  `CLAUDE.md`, para que se apliquen en cada sesión sin tener que pedirlas.

### Verificado
- tsc y lint limpios. Portada: 7 mundos y 10 preguntas. Cabeceras presentes.
- Ajustes con Node: los valores de siempre pasan la validación y dan 20 XP máximo;
  datos raros se reemplazan por los de siempre; números inválidos dan 5 mensajes
  claros; los textos de costo salen bien en los dos idiomas.
- **No se pudo ver** la pestaña Ajustes ni probar las reglas nuevas: exigen la cuenta
  del admin y publicar las reglas.

---

## 2026-09-23 · Barra de navegación de abajo (NavPunti)

Cami: "es muy difícil navegarla porque uno se pierde". Cada pantalla tenía sus
propios botones de ida y vuelta y no había un lugar fijo desde donde ir a
cualquier parte.

- `src/components/NavPunti.tsx`: barra fija abajo con cuatro destinos, cada uno con
  su ícono en pixel art (dibujado con cuadritos, un solo `<path>` por ícono) y su
  color neón al estar activo:
  - **MUNDOS** (planeta con luna, cian) → /inicio; también activa dentro de un mundo.
  - **SEGUIR** (cohete, verde) → /seguir.
  - **MANUAL** (libro, amarillo) → /como-funciona.
  - **PERFIL** (casco de astronauta, rosa) → /perfil.
- El activo lleva borde y brillo de su color y el ícono da un saltito al llegar
  (en pasos, como un sprite; nada con movimiento reducido).
- No aparece sin sesión ni donde estorba: portada, login, registro, bienvenida,
  dentro de una lección (ahí se sale con SALIR) y admin (tiene sus pestañas).
- Reserva su alto al final de cada página para no tapar contenido, y respeta el
  borde inferior de los iPhone.
- **/seguir** (nuevo): busca la primera lección publicada que no has hecho, en el
  orden de los mundos, y te lleva directo. Si hiciste todas: "¡Estás al día!".
  Eficiencia: la barra no lee nada de Firebase; el perfil se lee solo al tocar
  SEGUIR.
- Verificado en 375 px con una página de prueba (ya borrada): los cuatro estados
  activos, textos alineados a la misma altura. El círculo con "N" que tapa una
  esquina en localhost es el indicador de desarrollo de Next y no sale en
  punti.space.

---

## 2026-09-23 · Documentación al día + plan de lanzamiento

- `DOCUMENTACION.md`: tabla de todas las rutas; mapa de archivos completo (admin,
  contenido, ajustes, barra, seguir); reglas del juego configurables; cómo se
  publica (las reglas van aparte); guía de ruta renumerada (terminado hasta 4.2),
  **cómo se trabaja cada fase** y **camino al lanzamiento** (6.0 cuenta y
  privacidad, 6.1 contenido mínimo, 6.2 presentación, 6.3 protección y medición,
  6.4 prueba general; después 7.x precios, pagos, contenido, seguridad avanzada);
  pendientes y acciones de Cami al día; bitácora de la tarde. Notas del globo y la
  galaxia marcadas como históricas.
- `CLAUDE.md`: aviso de que el plan de fases original quedó desactualizado y la
  guía vigente está en DOCUMENTACION.md, sección 11.

---

## 2026-09-23 · Hoja de contenido (Sheets) para escribir las lecciones

Cami: "trabajemos el contenido: un Excel con cada planeta por pestañas y que se
desglose todo; que sea Sheets para poder automatizarlo".

- `referencias/Punti-Contenido.xlsx` (no se sube a git; la versión de trabajo vive
  en el Google Drive de Cami, convertida a Google Sheets).
- Pestañas: Instrucciones · Mundos (con conteos automáticos de lecciones,
  publicadas y por escribir) · una por mundo (01 Origen … 07 Autómata) · Valores
  (listas desplegables).
- **Formato fijo, una fila por pieza**, pensado para importarlo a la app más
  adelante: LECCION, PLAN, PANTALLA, GRAFICO_TABLA, FILA, GRAFICO_FLUJO, EJERCICIO,
  TAREA. Columnas iguales en todas las pestañas; qué usa cada bloque está en
  Instrucciones.
- Partió del contenido publicado en Firebase (se comprobó con una huella que es
  idéntico al del código).
- "Qué es la IA" va entera como ejemplo. Las otras 25 tienen su **PLAN** (objetivo,
  ideas clave, práctica sugerida) y un esqueleto de 4 pantallas, los 5 tipos de
  ejercicio y la tarea, en estado "Por escribir".
- Siguiente paso posible: un botón en el admin para importar la hoja (o un CSV de
  una pestaña) directo a borradores.
- **La hoja oficial es la de Google Sheets** (en el Drive de Cami, "Punti-Contenido",
  id `181wQyGETx1UfL2HUBVSUqXm3vYzvG9V_AF2K-Eb_YXA`). El .xlsx de `referencias/` es
  solo la copia de origen. Claude puede leer la hoja online; no puede escribir
  celdas directamente con sus herramientas.

### Mundo 01 · Origen escrito completo (por Claude)
- Las 4 lecciones que faltaban (Orígenes, Breve historia, Tipos de IA, Mitos y
  verdades) escritas en ES y EN: 4 pantallas con gráficos, los 5 tipos de
  ejercicio, pistas y tarea. Validadas con las reglas de publicación.
- Entregadas en una hoja aparte del Drive de Cami: "Punti · Mundo 01 Origen
  (lecciones escritas por Claude)", id `14zqgaGAtGpBcCweZcIJWzMxu-4_hVt7TN5dapt5oSgk`,
  mismas columnas que la hoja principal, estado Borrador.
- Datos históricos usados: Turing 1950, Dartmouth 1956, ELIZA 1966, inviernos de
  la IA (años 70 y finales de los 80), Deep Blue 1997, aprendizaje profundo 2012,
  AlphaGo 2016, ChatGPT 2022.
- `Ejercicio.tsx`: en "completar la frase" se pone el espacio antes del texto final
  si empieza por letra o número (Sheets borra los espacios iniciales).

---

## 2026-09-23 · Voz de Punti, Especialista en IA, Radar semanal y planeta Arena

Cami: buscar el repo de copy creativo más valorado, sumar un "AI specialist" que nos
mantenga al día (con actualización al menos semanal), y un planeta que enseñe las
diferencias entre OpenAI, Grok, Gemini, Anthropic y algún modelo chino. Luego: "revisa
que marketing skills no sea tan serio y rígido: Punti es un robot amigable experto en
IA". Luz verde con todo; "todo lo que hablemos, vélo actualizando en la documentación".

- **Investigación:** marketingskills (coreyhaines31) es el repo de copy más valorado
  (~51 mil estrellas, MIT, varias versiones por semana en julio de 2026). humanizer
  (blader) es el skill de escritura más valorado (~34 mil estrellas, MIT).
- **Decisión:** no se adoptan tal cual. marketingskills es para ventas de software
  (sin exclamaciones, testimonios, "prueba gratis"): Punti quedaría rígido. humanizer
  deja plano el texto informativo. Se escribió una guía propia que manda sobre las dos.
- `guias/voz-de-punti.md`: personalidad y reglas de escritura de Punti.
- `guias/especialista-ia.md`: perfil del Especialista en IA y formato del Radar.
- `guias/terceros/`: copias de copywriting (marketingskills 2.0.2) y humanizer (3.0.0)
  con su licencia MIT y un ORIGEN.md (versión, fecha, cómo se usa).
- `.claude/` está protegida en el computador de Cami; por eso `guias/`.
- **Tarea programada "Radar IA semanal de Punti"** (`trig_0131UUMvfP2KBTvkZuPKj2dv`):
  lunes 7:00 a. m. Colombia, en la nube, notifica por push y correo. Investiga la
  semana, revisa la hoja de contenido, mira versiones nuevas de las guías y propone la
  lección "Novedades de la semana". Entrega un Doc y una hoja en el Drive. No publica
  nada.
- **Planeta Arena** (por crear en la app): 8 lecciones, plan en el Drive ("Punti ·
  Planeta Arena (plan de lecciones)"). Una primera versión de esa hoja salió con
  columnas corridas por comas sin comillas; se regeneró con un programa y la rota se
  mandó a la papelera de Drive.
- Documentación: DOCUMENTACION.md 6.1.0 (Arena), 6.6 (equipo de contenido y Radar),
  6.7 (archivos en Drive), ruta 6.1 y 7.2, decisiones abiertas, regla de documentar
  todo; CLAUDE.md apunta a las guías.

---

## 2026-09-23 · "Pegar desde la hoja" en el admin

- `src/lib/importarHoja.ts`: convierte filas copiadas de Google Sheets (texto separado
  por tabulaciones, con celdas entre comillas si tienen saltos de línea) en lecciones
  bilingües. Usa el encabezado si viene; si no, el orden de columnas de la hoja.
  Ignora PLAN; arma pantallas con sus gráficos (tabla con sus FILAs, diagrama),
  ejercicios (la hoja cuenta la opción correcta desde 1; verdadero/falso acepta
  VERDADERO/TRUE) y tarea. Valida con las mismas reglas del editor. Cada fila rara se
  reporta con su número en vez de romper todo. Tope de 800 mil caracteres por pegada.
- `src/components/admin/PegarDesdeHoja.tsx`, en /admin/contenido: pegar → LEER FILAS →
  lista de lecciones con dónde están, cuántas pantallas y ejercicios tienen y si están
  listas para publicar → CREAR BORRADORES. Las lecciones nuevas piden elegir mundo. Los
  títulos y descripciones de la fila LECCION actualizan el catálogo (borrador).
  **No publica nada**: después se revisa con la vista previa y se publica.
- Probado con Node usando las 4 lecciones del Mundo 01 en el formato exacto que copia
  Google Sheets (sin espacios iniciales, celdas con comillas): 4 lecciones, gráficos y
  respuestas correctas en su lugar, 0 faltas; filas con ID inválido o sin ID reportadas.
- La pantalla no se pudo ver: exige la cuenta del admin.
- Sobre WhatsApp/Telegram (pregunta de Cami): no hace falta. Desde la app de Claude en
  el celular se piden las mismas cosas y el Radar se puede lanzar cuando se quiera. Un
  bot tendría sentido más adelante para los estudiantes (recordatorios de racha).

### Planeta Arena escrito (7 lecciones, por Claude)
- `el-mapa-de-los-modelos`, `openai-chatgpt`, `google-gemini`, `anthropic-claude`,
  `xai-grok`, `modelos-chinos`, `cual-uso-para-que`, en ES y EN, con la voz de Punti.
  La 8.ª (`novedades-de-la-semana`) la propone el Radar IA cada lunes.
- **Regla anti-envejecimiento:** los ejercicios nunca preguntan versiones ni precios.
  Cada lección de marca tiene una sola pantalla "viva" (la 3) con versiones y cifras,
  marcada en Notas para que el Radar la revise.
- Datos verificados el 2026-09-23: ChatGPT lanzado el 30-nov-2022, ~900 millones de
  usuarios semanales (feb-2026), GPT-5.6 Sol (9-jul-2026) — notas de versión de
  OpenAI; Bard → Gemini (8-feb-2024), Gemini 3.1 Pro (feb-2026) y 3.6 Flash
  (21-jul-2026) — Wikipedia; Claude Sonnet 5 (30-jun-2026), planes Free/Pro/Max —
  Wikipedia; SpaceX compró xAI (feb-2026), Grok 4.7 (21-sep-2026) — x.ai/news;
  DeepSeek n.º 1 en la App Store de EE. UU. (27-ene-2025), bloqueo en Italia
  (30-ene-2025), DeepSeek V4 (24-abr-2026) — Wikipedia; Qwen 3.8 (ago-2026) —
  Wikipedia; Kimi K3 (jul-2026) — Fortune.
- Probadas con el lector del importador: 7 lecciones, 0 faltas, 0 avisos.
- Entregadas en el Drive: "Punti · Planeta Arena (lecciones escritas por Claude)".
