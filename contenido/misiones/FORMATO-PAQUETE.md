# Formato de misión — Punti

> Molde de todas las misiones del formato nuevo (fase C0, 2026-09-23).
> Dos partes: **el paquete** (el archivo en que Claude entrega cada misión) y
> **las fichas de bloque** (qué es cada pieza, qué campos lleva y cómo habla Punti).
>
> Manda sobre esto: `guias/voz-de-punti.md` (cómo escribe Punti, incluida la
> sección "Punti es el protagonista").
>
> Ejemplo completo: `eco/03-la-tienda-de-dona-marta.json`.
> Revisor: `node contenido/misiones/validar.mjs` revisa todos los paquetes.

---

## 1. El paquete

Una misión es **un archivo JSON** con sus dos idiomas adentro. Comparado con
WordPress: es como exportar una página de Elementor. El admin lo importa, lo
revisa, lo deja en borrador y Cami publica.

### 1.1 Reglas generales

| Regla | Por qué |
|---|---|
| Todo texto que ve el piloto va como `{ "es": "…", "en": "…" }` | Es el mismo formato que ya usa la app (`Texto` en `i18n.ts`). Imposible olvidar un idioma sin que el revisor lo note |
| El inglés se **escribe**, no se traduce palabra por palabra | Ya estaba decidido (`lecciones.ts`). Ejemplos que funcionen en cualquier país |
| Las respuestas correctas son las mismas en los dos idiomas y en el mismo orden | La nota del piloto no puede depender del idioma |
| Los `id` nunca cambian después de publicar | El progreso y la bitácora de cada piloto se guardan con esos ids |
| Solo texto plano. Nada de HTML | Seguridad: la app muestra todo como texto (práctica obligatoria 4.2, regla 4) |
| Cada bloque lleva a Punti hablando | Decisión de Cami: Punti es el protagonista |

### 1.2 Cabecera de la misión

| Campo | Tipo | Qué es |
|---|---|---|
| `formato` | `"punti-mision@1"` | Versión del molde. Si el molde cambia, sube el número |
| `id` | texto | Id de la misión, en minúsculas con guiones. Único en toda la escuela |
| `mundo` | texto | Id del mundo (Eco es `prompts`) |
| `capitulo` · `numero` | número | Capítulo y posición dentro del mundo |
| `receta` | `concepto` · `habilidad` · `criterio` · `construccion` · `mercado` · `futuro` | La receta que guió el orden de bloques |
| `largo` | `rapida` · `normal` · `proyecto` | 3 a 5 min · 8 a 12 min · 15 a 30 min |
| `minutos` | número | Estimado honesto |
| `conceptos` | lista de ids | Conceptos que enseña (alimentan el Repaso del día) |
| `usaConceptos` | lista de ids | Conceptos de otras misiones que da por sabidos (enlaces entre mundos) |
| `titulo` · `resumen` | Texto | Lo que se ve en la ruta del mundo |
| `bloques` | lista | Los bloques, en orden (sección 2) |
| `ficha` | objeto | Qué muestra la Ficha de misión al final (sección 3) |
| `siguiente` | texto | Id de la misión que sigue (opcional) |
| `fuentes` | lista `{ titulo, url, fecha }` | Obligatorio si la misión da datos que cambian |
| `actualizado` | `AAAA-MM-DD` | Se muestra como "Actualizada el…" |
| `estado` | `borrador` · `revision` · `aprobado` | `aprobado` solo lo pone Cami |

### 1.3 Campos que tienen todos los bloques

| Campo | Qué es |
|---|---|
| `id` | Único dentro de la misión (`b01`, `b02`…) |
| `tipo` | Uno de los tipos de la sección 2 |
| `punti` | `{ "estado": …, "texto": Texto }`: lo que dice Punti al abrir el bloque. Máximo ~45 palabras |
| `titulo` | Texto. El título grande del bloque (opcional en algunos tipos) |
| `xp` | XP que da el bloque al completarlo |
| `vivo` | `true` si tiene datos que envejecen. El Radar IA lo revisa cada lunes |

Estados de Punti válidos: `boot`, `online`, `leyendo`, `loading`, `levelup`,
`hype`, `battery`, `error`, `info`.

**Cómo elegir el estado:** `boot` al abrir una misión · `leyendo` cuando muestra
algo para mirar · `online` para dar una instrucción · `info` para un dato o una
pista · `hype` al acertar · `error` al fallar (con humor, nunca regaño) ·
`battery` cuando algo sale débil · `loading` mientras "transmite" · `levelup` al
terminar.

### 1.4 Reacciones de Punti

Muchos bloques piden `bien` y `mal`: lo que dice Punti al acertar y al fallar.
Reglas:

- `mal` nunca da la respuesta: da una pista para pensar.
- `mal` nunca regaña ("Respuesta incorrecta" no; "Mmm, lee otra vez…" sí).
- Máximo ~30 palabras cada una.

---

## 2. Fichas de bloque

Cada ficha dice: **para qué sirve** · **campos propios** · **cómo se completa** ·
**cómo habla Punti** · **en celular** · **recetas donde encaja**.

### 2.1 `inicio` · Inicio de misión

- **Para qué:** plantear el problema del día dentro de la historia del mundo.
- **Campos:** `titulo`, `texto` (qué vas a aprender y cuánto dura).
- **Se completa:** tocando "Despegar". La primera vez pide el nombre del piloto; en la app real ya se conoce.
- **Punti:** `boot`. Cuenta qué señal llegó y a quién hay que ayudar. Nunca "Hoy vamos a aprender…".
- **Celular:** una sola pantalla, sin scroll.
- **Recetas:** todas.

### 2.2 `transmision` · Transmisión

- **Para qué:** explicar **una** idea. Es la consola de las lecciones de hoy.
- **Campos:** `texto` (lo dice Punti, máx. ~60 palabras), `grafico` opcional (`tabla` o `flujo`, los que ya existen).
- **Se completa:** al tocar Continuar.
- **Punti:** es todo el bloque. Frases cortas, un ejemplo de la vida real.
- **Celular:** el gráfico se apila.
- **Recetas:** todas. **Regla:** nunca dos transmisiones seguidas; entre una y otra, algo para hacer.

### 2.3 `antes-despues` · Antes y después

- **Para qué:** mostrar con un ejemplo real la diferencia entre hacerlo mal y bien.
- **Campos:** `antes { prompt, salida }`, `despues { partes: [{ texto, pieza }], salida, salidaTipo }`, `revelar` (lo que dice Punti al mostrar los colores). `salidaTipo`: `texto` o `cartel`.
- **Se completa:** al tocar "Mostrar qué cambió": se colorean las partes del prompt bueno según su pieza.
- **Punti:** `leyendo` → `info`.
- **Celular:** antes arriba, después abajo. Nunca lado a lado.
- **Recetas:** habilidad, mercado.

### 2.4 `piezas` · Diagrama tocable

- **Para qué:** presentar las partes de una idea (las piezas del contexto, las partes de un agente…).
- **Campos:** `piezas: [{ id, titulo, descripcion, ejemplo, color }]` (2 a 6). `ejemplo` es lo que dice Punti al tocar esa pieza.
- **Se completa:** cuando se tocaron todas.
- **Punti:** `online` al abrir, `info` en cada pieza.
- **Celular:** 2 columnas; 1 columna por debajo de 420 px.
- **Recetas:** concepto, habilidad, construcción.
- **Nota:** las `piezas` de una misión se pueden reusar en otros bloques (`clasificar`, `laboratorio`, la ficha) por su `id`, y su color es el mismo en todos.

### 2.5 `clasificar` · Clasificar

- **Para qué:** reconocer la idea en un caso nuevo.
- **Campos:** `grupos` (ids de piezas o grupos propios `{ id, titulo }`), `items: [{ texto, grupo }]` (3 a 6), `bien`, `mal`, `malPorGrupo` opcional (pistas según el grupo equivocado).
- **Se completa:** con todos los ítems bien puestos. Cada error suma a la nota de la misión.
- **Punti:** `leyendo`; `hype` al terminar.
- **Celular:** cada ítem con sus botones debajo (no se arrastra: arrastrar en celular falla).
- **Recetas:** concepto, criterio, habilidad.

### 2.6 `laboratorio` · Laboratorio

- **Para qué:** el corazón del formato. El piloto escribe un prompt y ve qué pasa.
- **Campos:**
  - `reto`: Texto con los datos del caso.
  - `inicial`: `vacio` o `anterior` (arranca con el prompt del laboratorio anterior, para practicar ajustar en vez de reescribir).
  - `checks: [{ id, texto, rubrica, claves: { es: [], en: [] } }]`. `rubrica` es la instrucción que recibe la IA que revisa. `claves` son palabras para el modo simulado.
    **Regla de la rúbrica (aprendida en la prueba real):** dice qué cuenta **y qué no cuenta**
    ("'tienda de barrio' describe el negocio, no para quién es"). Sin esa segunda parte, la IA
    revisora es generosa y aprueba piezas que no están. **Regla de las claves:** nunca una palabra
    que casi cualquier prompt trae ("aviso") ni una que venga en el prompt heredado.
  - `aprobar`: cuántos checks hacen falta para pasar.
  - `sistema`: Texto con las instrucciones que el servidor le pone al modelo para que responda dentro del ejercicio.
  - `simulado: { bueno: { salida, salidaTipo, punti }, debil: { salida, punti } }`: respuestas de ejemplo para cuando no hay IA en vivo (tope de gasto alcanzado, sin conexión).
  - `maxIntentos`: después de ese número de intentos se deja seguir aunque no pase (nadie se queda atascado).
- **Se completa:** al pasar, o al agotar los intentos.
- **Punti:** `online` al pedir, `loading` al transmitir, `hype`/`levelup` o `battery` según el resultado. La retroalimentación siempre es de Punti, nunca "Respuesta correcta".
- **Celular:** la lista de chequeo se marca **mientras escribes**. Tope de 600 caracteres.
- **Seguridad:** el prompt va al servidor, nunca directo a la IA desde el navegador. Aviso fijo: "No pegues datos personales".
- **Recetas:** habilidad (dos por misión), construcción, mercado.

### 2.7 `punti-se-equivoco` · Punti se equivocó

- **Para qué:** entrenar el ojo crítico corrigiendo a Punti.
- **Campos:** `trozos` (el texto partido en pedazos tocables), `malos` (índices de los trozos con el error), `explicacion` (lo que dice Punti cuando lo atrapan), `mal`.
- **Se completa:** cuando se tocan exactamente los trozos malos.
- **Punti:** `error` al confesar, `hype` al ser atrapado. Siempre con humor sobre sí mismo.
- **Recetas:** habilidad, criterio.

### 2.8 `nota-bitacora` · Nota a la bitácora

- **Para qué:** que el piloto diga con sus palabras lo que aprendió. Es lo que hace que la idea se quede.
- **Campos:** `concepto` (id), `definicion` (Texto de Punti), `pregunta` (Texto: "El contexto es…"), `guardaPrompt` (id del laboratorio cuyo prompt se guarda en Mis prompts) y `etiqueta`.
- **Se completa:** al guardar una frase de al menos 10 caracteres (máx. 280).
- **Punti:** `leyendo` → `hype`. Recuerda que lo guardado vuelve en el Repaso.
- **Recetas:** todas. **Regla:** una por misión.

### 2.9 `punto-control` · Punto de control

- **Para qué:** confirmar en 1 a 3 preguntas que quedó claro. Son los quiz de hoy, pero cortos y al final.
- **Campos:** `preguntas: [{ pregunta, opciones (2 a 4), correcta, bien, mal }]`.
- **Se completa:** con todas bien (se puede reintentar; el error suma a la nota).
- **Punti:** `online`; `hype` o `error`.
- **Recetas:** todas. Solo evalúa lo que la misión enseñó.

### 2.10 `caso` · Caso con decisiones

- **Para qué:** decidir en una situación real y ver la consecuencia (Brújula, Órbita).
- **Campos:** `escena` (Texto), `opciones: [{ texto, consecuencia, buena }]`, `leccion` (lo que dice Punti al final).
- **Se completa:** al elegir la buena, después de ver las consecuencias de las que se prueben.
- **Punti:** narra la escena; reacciona a cada elección sin juzgar a la persona.
- **Recetas:** criterio, futuro.

### 2.11 `debate` · Debate

- **Para qué:** temas sin una sola respuesta (empleo, AGI, leyes).
- **Campos:** `pregunta`, `posturas: [{ titulo, argumento, fuente }]` (2), `cierre`.
- **Se completa:** al votar. En la app real se ve cómo votó la comunidad.
- **Punti:** presenta las dos posturas con el mismo cuidado. **Punti no da su opinión.**
- **Recetas:** futuro.

### 2.12 `reto-ia` · Reto en tu IA

- **Para qué:** usar una IA real (ChatGPT, Gemini, Claude…) fuera de Punti y traer la evidencia.
- **Campos:** `instruccion`, `checks` (lista de chequeo que marca el piloto), `pegar` (true si pide pegar la respuesta).
- **Se completa:** con la lista marcada. Confía en el piloto, como el "Mark complete" de Codédex.
- **Punti:** `online`; nombra varias marcas por igual (neutralidad).
- **Recetas:** mercado, habilidad, construcción.

### 2.13 `fuente` · Fuente

- **Para qué:** para quien quiere profundizar.
- **Campos:** `titulo`, `url` (solo `https://`), `fecha`, `porQue`.
- **Se completa:** al tocar Continuar (abrir el enlace es opcional).
- **Recetas:** futuro, mercado, concepto.

### 2.14 `pantalla-viva` · Pantalla viva

- **Para qué:** datos que envejecen (versiones, precios). Siempre `vivo: true` y con `fuentes`.
- **Campos:** `texto`, `tabla` opcional, `revisado` (fecha).
- **Recetas:** mercado.

---

## 3. La Ficha de misión

La arma la app sola al final, con lo que hizo el piloto. El paquete solo dice qué contar:

| Campo | Qué es |
|---|---|
| `concepto` | `{ titulo, resumen }`: lo aprendido, en una frase |
| `piezas` | id del bloque `piezas` cuyas partes se muestran (se encienden las que el piloto usó en su mejor prompt) |
| `mejorPrompt` | ids de laboratorios, en orden de preferencia |
| `logros` | `[{ texto, bloque }]`: se marca ✓ si el piloto completó ese bloque (sin agotar intentos) |
| `habilidad` | `{ id, titulo }`: la habilidad y su nivel (Vista, Practicada, Dominada) |

---

## 4. Cómo se escribe una misión (proceso)

1. Claude escribe el paquete siguiendo la receta del mundo y la voz de Punti.
2. `node contenido/misiones/validar.mjs` en 0 errores.
3. Un revisor independiente lo lee en los dos idiomas (datos, respuestas únicas, tono).
4. Cami lo importa en el admin, lo juega en la vista previa y publica.
