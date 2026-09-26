# Temario · Origen (id del mundo: `que-es-la-ia`) · PROPUESTA (2026-09-24)

**Origin · What AI is.** Rango: Explorador. Gratis. Mundo de entrada para quien nunca ha usado una IA.

Receta principal: **concepto**. El capítulo 4 (mitos) usa **criterio**. El capítulo 2 (historia) es
concepto con toques de **futuro** (un `debate` corto al final).

## 1. La historia que cuenta Punti

Origen es el planeta donde Punti se encendió por primera vez. Antes de construir los demás mundos,
Punti armó aquí su taller, y en el sótano guarda el **museo de sus ancestros**: las máquinas que
soñaron con pensar antes que él. La metáfora de todo el mundo es **"el árbol genealógico de Punti"**:
cada idea de la IA es un pariente suyo (su tatarabuela la prueba de Turing, su abuela la red neuronal,
su primo el que recomienda videos). Cuando el piloto entiende una idea, se enciende una rama del árbol.

Cada capítulo es una zona del planeta y Punti te lleva a pie, porque Origen es pequeño:

- **El taller de Punti** (cap. 1): Punti se abre el panel del pecho y muestra qué es y qué no es una IA.
- **El museo de los ancestros** (cap. 2): una galería con las vitrinas de la historia, de 1950 a hoy.
- **El vivero de máquinas** (cap. 3): donde Punti "cría" máquinas pequeñas y les enseña de tres maneras.
- **El espejo** (cap. 4): un salón de espejos que deforman; ahí se desarman los mitos.

Cada misión abre con una transmisión de Punti desde la zona donde está: "Piloto, estoy en el museo y
la vitrina de 1966 se encendió sola. Ven, que aquí hay alguien que convencía a la gente sin entender
nada".

## 2. Recetas

| Capítulo | Receta | Por qué |
|---|---|---|
| 1 · El taller | concepto (misión 4: criterio) | Hay que armar la idea central antes de juzgar nada |
| 2 · El museo | concepto (+ `debate` en la 7) | Historia contada como causas, no como fechas para memorizar |
| 3 · El vivero | concepto | Tres formas de aprender + redes; cada una con un Laboratorio donde el piloto "entrena" |
| 4 · El espejo | criterio | Separar lo real de lo exagerado |

**Decisión de diseño sobre el Laboratorio en Origen.** El piloto de Origen todavía no pasó por Eco,
así que el Laboratorio aquí no califica "qué tan buen prompt" escribió: califica **si el prompt usa la
idea de la misión** (por ejemplo, si le dio ejemplos con respuesta, que es aprendizaje supervisado).
Los retos traen los datos del caso listos para copiar, y el `sistema` le pide a la IA respuestas
cortas y sin jerga. `maxIntentos` bajo (3) para que nadie se atasque en su primer mundo.

## 3. Mapa del mundo

| Capítulo (zona · subtítulo) | Misiones | Proyecto del capítulo |
|---|---|---|
| 1 · El taller de Punti · ¿Qué es la IA? (*Punti's workshop · What is AI?*) | 1 Una IA en tu bolsillo (reconocer la IA que ya usas: programas que aprenden de ejemplos) · 2 Reglas o ejemplos (diferenciar un programa de reglas de uno que aprende) · 3 Los cuatro oficios (reconocer, recomendar, predecir, generar; toda la IA de hoy es "estrecha") · 4 ¿Eso es IA o no? (no todo lo "inteligente" es IA; leer la etiqueta "con IA") | **Mi mapa de IA de un día**: 8 momentos en que una IA trabajó para ti, con su oficio y de qué ejemplos aprendió |
| 2 · El museo de los ancestros · De dónde viene (*The ancestors' museum · Where it comes from*) | 5 La pregunta de Turing (1950, Dartmouth 1956, ELIZA 1966 y el efecto ELIZA) · 6 Inviernos y primaveras (promesas, frenazos y Deep Blue) · 7 Los tres combustibles (datos, cómputo y mejores métodos: 2012, 2016, 2017, 2022) | **La línea de tiempo de tu familia**: 6 hitos de la IA cruzados con 6 hechos de tu familia + la entrevista a alguien mayor |
| 3 · El vivero de máquinas · Cómo aprende una máquina (*The machine nursery · How a machine learns*) | 8 Aprender con solucionario (supervisado) · 9 Encontrar grupos sin que nadie diga cuáles (no supervisado) · 10 Premio y castigo (por refuerzo) · 11 Neuronas que votan (redes neuronales y aprendizaje profundo, sin fórmulas) | **Entrena una máquina en papel**: un problema de tu trabajo, qué tipo de aprendizaje le sirve, 6 ejemplos y cómo sabrías si aprendió |
| 4 · El espejo · Mitos y verdades (*The mirror · Myths and facts*) | 12 ¿Piensa? ¿Siente? (qué no es la IA: ni consciente ni infalible ni neutral) · 13 El detector de humo (leer un titular exagerado sobre IA) | **Proyecto final · Explícale la IA a alguien que quieres**. Da el certificado de Origen |

Total: 4 capítulos, 13 misiones, 3 proyectos de capítulo y 1 proyecto final. Es el mundo más corto a
propósito: su trabajo es quitar el miedo y dejar las bases, no agotar el tema.

## 4. Las misiones

Formato de cada ficha: concepto (id) · receta · largo · protagonista y escenario · Laboratorio (qué
escribe el piloto, qué revisa la rúbrica) · bloques propios (además de inicio, nota a la bitácora y
punto de control, que van siempre).

### Capítulo 1 · El taller de Punti

**1 · Una IA en tu bolsillo** (*An AI in your pocket*) · `ia` · concepto · normal (7 min)
- **Protagonista:** Doña Gilma, 61, vende arepas de huevo en un puesto en Barranquilla. Su nieta le dice
  que el celular "tiene IA" y ella responde que eso es para gente de oficina.
- **Idea:** la IA es un programa que aprende de muchos ejemplos para hacer tareas que parecían pedir
  inteligencia humana. Doña Gilma ya la usa: el teclado que adivina, el filtro de fotos, el mapa que
  avisa del trancón.
- **Bloques propios:** `piezas` (3 IA escondidas en el celular de Gilma), `clasificar` (¿usa IA o no?).
- **Laboratorio:** el piloto le pide a la IA que le explique a Doña Gilma qué es la IA **con un ejemplo
  de su puesto o de su celular**. Rúbrica: (1) pide la explicación para Doña Gilma o para alguien sin
  estudios de tecnología (no cuenta "explícame la IA" a secas); (2) pide un ejemplo de la vida diaria de
  ella (celular, puesto, ventas); (3) pide que diga que la IA aprende de ejemplos (no cuenta "que diga
  qué es"). Aprobar: 2 de 3.
- **Sale de:** `definicion` (pantallas 1-2), `tipos-de-ia` (tarea del diario de IA).

**2 · Reglas o ejemplos** (*Rules or examples*) · `reglas-vs-ejemplos` · concepto · normal (8 min)
- **Protagonista:** Nubia, 44, cajera de supermercado en Bucaramanga. Le enseñaron a revisar billetes
  falsos con reglas (marca de agua, hilo); una compañera nueva los detecta "al tacto", por experiencia.
- **Idea:** un programa normal sigue reglas que alguien escribió; una IA encuentra sus propias reglas
  mirando ejemplos. Cuando las reglas son demasiadas o nadie sabe escribirlas, gana el aprendizaje.
- **Bloques propios:** `antes-despues` (el programa de reglas que falla con un billete nuevo vs el que
  aprendió de miles), `clasificar` (¿esta tarea se resuelve mejor con reglas o con ejemplos?),
  `punti-se-equivoco` (Punti dice que la calculadora del celular es IA).
- **Laboratorio:** el piloto le pide a la IA que compare, para el trabajo de Nubia, cómo revisaría billetes
  un programa de reglas y uno que aprende de ejemplos. Rúbrica: (1) pide comparar las dos formas (no
  cuenta preguntar solo por la IA); (2) usa el caso de los billetes o de la caja; (3) pide cuándo
  conviene cada una o una ventaja y una desventaja de cada una.
- **Sale de:** `definicion` (tabla programación tradicional vs IA).

**3 · Los cuatro oficios** (*The four jobs of AI*) · `oficios-de-la-ia` · concepto · normal (8 min)
- **Protagonista:** Wilmer, 50, taxista en Bogotá. En un turno usa IA que reconoce (desbloqueo con la
  cara), que predice (el tiempo de llegada), que recomienda (la emisora que le propone la app de música)
  y que genera (el mensaje que le redacta el celular).
- **Idea:** por lo que hacen, las IA de hoy reconocen, recomiendan, predicen o generan. Todas son
  "estrechas": hacen bien una sola cosa. La IA general, que haría todo como una persona, no existe
  (el debate sobre si llegará queda en Horizonte, misión 11).
- **Bloques propios:** `piezas` (los 4 oficios, con color fijo que se reusa en todo Origen),
  `clasificar` (8 momentos del turno de Wilmer).
- **Laboratorio:** el piloto le pide a la IA que ordene los momentos del turno de Wilmer (vienen en el
  reto) en los cuatro oficios. Rúbrica: (1) nombra los cuatro oficios o pide clasificar en esos cuatro
  grupos (no cuenta "clasifícalos" sin decir en qué); (2) incluye los momentos del turno; (3) pide
  una razón corta por cada uno.
- **Sale de:** `tipos-de-ia` (entera).

**4 · ¿Eso es IA o no?** (*Is that AI or not?*) · `ia-o-no` · criterio · normal (8 min)
- **Protagonista:** Marisol, 29, vende electrodomésticos en un almacén de Cúcuta. Todo llega con la
  etiqueta "con IA": una nevera, una lavadora, un ventilador con temporizador.
- **Idea:** "con IA" a veces es marketing. Pregunta clave: ¿aprende de datos o solo sigue un
  temporizador o una regla fija?
- **Bloques propios:** `caso` (un cliente pregunta si vale la pena pagar más por el ventilador "con IA"),
  `clasificar`.
- **Laboratorio:** el piloto escribe las preguntas que Marisol le haría a la IA para revisar la ficha de
  un producto (la ficha, inventada, viene en el reto). Rúbrica: (1) pide identificar qué aprende o de
  qué datos (no cuenta "¿tiene IA?"); (2) pide separar lo que es una regla fija de lo que se adapta;
  (3) pide una frase honesta para explicarle al cliente.
- **Sale de:** `mitos-y-verdades` (la IA no es magia).

**Proyecto del capítulo 1 · Mi mapa de IA de un día** (*My one-day AI map*) · proyecto (15 min)
El piloto anota 8 momentos de un día en que una IA trabajó para él o ella (`reto-ia` con lista de
chequeo), los clasifica en los 4 oficios y, con un Laboratorio, le pide a la IA que adivine de qué
ejemplos aprendió cada una. Rúbrica: lista con al menos 5 momentos, cada uno con su oficio, y la
pregunta de "de qué aprendió". Se guarda en la Bitácora como la primera página del piloto.

### Capítulo 2 · El museo de los ancestros

**5 · La pregunta de Turing** (*Turing's question*) · `prueba-de-turing` · concepto · normal (8 min)
- **Protagonista:** Profe Álvaro, 68, profesor de matemáticas jubilado en Manizales. Su club de ajedrez
  discute si el chatbot con el que habla su nieto "piensa".
- **Idea:** en 1950 Alan Turing cambió la pregunta "¿las máquinas piensan?" por un juego: si conversas
  por escrito y no distingues a la máquina de la persona, ¿importa? En 1956, en Dartmouth, la idea
  recibió su nombre. En 1966, ELIZA repetía tus frases como preguntas y la gente sentía que la
  escuchaba: el "efecto ELIZA" sigue vivo.
- **Bloques propios:** `transmision` con gráfico `flujo` (1950 → 1956 → 1966), `punti-se-equivoco`
  (Punti dice que Turing inventó ChatGPT).
- **Laboratorio:** el piloto arma su propia mini prueba de Turing: le pide a la IA que responda **como lo
  haría una persona** a tres preguntas del club de ajedrez, y después que explique qué respuesta la
  delataría. Rúbrica: (1) pide que responda como persona o que intente pasar por humana; (2) incluye
  preguntas concretas (al menos 2); (3) pide que al final revele qué pistas la delatan. El `sistema`
  siempre cierra aclarando que es una IA.
- **Sale de:** `origenes` (entera).

**6 · Inviernos y primaveras** (*Winters and springs*) · `inviernos-de-la-ia` · concepto · normal (8 min)
- **Protagonista:** Doña Teresa, 71, locutora de una emisora comunitaria en Quibdó. Prepara un segmento
  de radio: "¿Por qué la IA tardó 70 años en llegar a mi celular?".
- **Idea:** la historia no fue una línea recta. Hubo promesas enormes, frenazos por falta de datos y de
  computadores (los "inviernos" de los años 70 y de finales de los 80) y victorias vistosas como Deep
  Blue contra Kasparov en 1997, que ganó con fuerza bruta, no aprendiendo como hoy.
- **Bloques propios:** `clasificar` (¿primavera o invierno?), `punto-control` con orden cronológico.
- **Laboratorio:** el piloto le pide a la IA un guion de radio de 1 minuto para Doña Teresa. Rúbrica:
  (1) pide que mencione al menos un "invierno" y por qué pasó (no cuenta "la historia de la IA" a
  secas); (2) pide un largo o tiempo concreto; (3) pide un tono de radio o para oyentes sin estudios
  técnicos.
- **Sale de:** `historia` (pantallas 1-3).

**7 · Los tres combustibles** (*The three fuels*) · `tres-combustibles` · concepto · normal (9 min)
- **Protagonista:** Brayan, 24, mecánico de motos en Montería. Para él todo es motor: sin gasolina,
  sin cilindraje o sin buen carburador, no arranca.
- **Idea:** la IA despegó cuando se juntaron tres combustibles: muchísimos datos (internet), mucho
  cómputo (chips que hacen miles de cuentas a la vez) y mejores métodos. Vitrinas: 2012 (una red
  reconoce fotos mucho mejor que todo lo anterior), 2016 (AlphaGo gana al Go), 2017 (el Transformer,
  la pieza de los modelos de lenguaje), 2022 (ChatGPT llega a 100 millones de usuarios estimados en
  dos meses), 2024 (dos premios Nobel ligados a la IA).
- **Bloques propios:** `piezas` (los 3 combustibles), `debate` corto: "¿La IA es la tecnología más
  rápida en llegar a la gente?" (postura A con el dato de usuarios, postura B: el celular y la
  electricidad llegaron más lento pero a más gente). Punti no opina.
- **Laboratorio:** el piloto le pide a la IA que explique por qué la IA despegó ahora usando la
  comparación de la moto de Brayan. Rúbrica: (1) nombra los tres combustibles (datos, cómputo y
  métodos o algoritmos); (2) pide la comparación con la moto o el motor; (3) pide un hito con año.
- **Sale de:** `historia` (tabla de saltos y pantalla 4).
- **Cruce:** la energía y el agua que gasta ese cómputo se ven en Horizonte (misión 13, `energia-ia`);
  la versión adulta de la escala (datos, parámetros y cómputo), en Núcleo (misión 5, `escalado`).

**Proyecto del capítulo 2 · La línea de tiempo de tu familia** (*Your family timeline*) · proyecto (15 min)
Ordenar 6 hitos de la IA (bloque de orden en `punto-control`), sumar 6 hechos de la familia del piloto
(cuándo llegó el primer celular a la casa, el primer computador…) y hacer la tarea vieja de
`historia`: preguntarle a alguien mayor qué pensaba de la IA hace 20 años. Laboratorio: pedirle a la
IA que mezcle las dos listas en una sola línea de tiempo. Rúbrica: incluye los dos grupos de hechos
con año y pide un orden cronológico.

### Capítulo 3 · El vivero de máquinas

**8 · Aprender con solucionario** (*Learning with the answer key*) · `aprendizaje-supervisado` · concepto · normal (9 min)
- **Protagonista:** Don Hernando, 57, caficultor en Pitalito (Huila). Separa café excelso del grano
  pasilla y quiere saber si una máquina podría aprender a hacerlo.
- **Idea:** aprendizaje supervisado: le das ejemplos con la respuesta correcta y la máquina busca los
  patrones. Es estudiar con el solucionario al lado. Así funcionan el filtro de spam y el lector de
  cheques.
- **Laboratorio (el más importante del mundo):** el piloto "entrena" a la IA dentro del prompt: le da
  ejemplos de granos descritos (color, tamaño, si tienen broca) con su etiqueta, y al final un grano
  nuevo para clasificar. La IA responde como la máquina recién entrenada. Rúbrica: (1) al menos dos
  ejemplos de cada etiqueta (excelso y pasilla); (2) cada ejemplo trae su respuesta (no cuenta una
  lista de granos sin decir cuál es cuál); (3) incluye un caso nuevo sin etiqueta para clasificar;
  (4) pide que diga qué rasgo usó para decidir. Aprobar: 3 de 4. Segundo Laboratorio (`inicial:
  anterior`): quitar todos los ejemplos de pasilla y ver qué pasa (la máquina no puede aprender lo
  que nunca vio).
- **Sale de:** `como-aprende-una-maquina` (pantalla 2).

**9 · Grupos que nadie nombró** (*Groups nobody named*) · `aprendizaje-no-supervisado` · concepto · normal (8 min)
- **Protagonista:** Yurani, 31, vende ropa por internet desde Ibagué. Tiene la lista de compras de
  sus clientas y no sabe cómo organizarlas.
- **Idea:** aprendizaje no supervisado: datos sin respuestas; la máquina encuentra grupos parecidos que
  nadie le dijo que buscara (las que compran de noche, las que solo compran en promoción).
- **Laboratorio:** el reto trae 8 clientas inventadas con lo que compraron y cuándo. El piloto pide a la
  IA que encuentre grupos. Rúbrica: (1) incluye los datos de las clientas; (2) pide encontrar grupos
  **sin decirle cuáles** (no cuenta si el prompt ya trae los grupos: eso sería darle el solucionario);
  (3) pide qué tiene en común cada grupo; (4) pide una idea de venta para cada grupo.
- **Sale de:** `como-aprende-una-maquina` (pantalla 3).

**10 · Premio y castigo** (*Reward and penalty*) · `aprendizaje-por-refuerzo` · concepto · normal (9 min)
- **Protagonista:** Mónica, 38, adiestradora de perros en Chía. Ella ya enseña con premios; Punti le
  muestra que una máquina puede aprender igual.
- **Idea:** aprendizaje por refuerzo: la máquina prueba, recibe premios o castigos y repite lo que le
  sirvió. Así aprendió AlphaGo y así aprende el "modo IA" del juego Punti Flap.
- **Bloques propios:** enlace al juego Punti Flap (modo IA) como `reto-ia` opcional dentro de la app.
- **Laboratorio:** el piloto diseña las reglas del juego para un robot que aprende a estacionar un carrito
  de juguete: la meta, qué gana premio y qué recibe castigo. La IA simula tres intentos del robot y
  cómo mejora. Rúbrica: (1) dice la meta; (2) dice qué da premio; (3) dice qué da castigo; (4) no le
  dicta al robot los movimientos paso a paso (no cuenta "gira a la izquierda y luego frena": eso sería
  programarlo con reglas).
- **Sale de:** `como-aprende-una-maquina` (pantallas 4-5).

**11 · Neuronas que votan** (*Neurons that vote*) · `red-neuronal` · concepto · normal (9 min)
- **Protagonista:** Esteban, 27, fotógrafo de matrimonios en Cartagena. Su celular agrupa solo las
  fotos de tortas, de anillos y de la playa.
- **Idea:** una red neuronal son votantes diminutos organizados en capas: las primeras ven bordes, las
  siguientes formas y las últimas objetos. Aprende ajustando un poquito sus conexiones cada vez que se
  equivoca. "Aprendizaje profundo" es una red con muchas capas.
- **Bloques propios:** `transmision` con gráfico `flujo` (capas: bordes → formas → objeto),
  `punti-se-equivoco` ("una red neuronal es un cerebro en miniatura").
- **Laboratorio:** el piloto le pide a la IA que explique, capa por capa, cómo una red reconocería una
  torta de matrimonio en las fotos de Esteban. Rúbrica: (1) pide la explicación por capas o en orden de
  lo simple a lo complejo; (2) pide cómo aprende de sus errores; (3) usa el ejemplo de las fotos o la
  torta; (4) pide que no use fórmulas o que sea para alguien sin estudios técnicos.
- **Sale de:** `redes-neuronales` (entera).

**Proyecto del capítulo 3 · Entrena una máquina en papel** (*Train a machine on paper*) · proyecto (20 min)
El piloto elige un problema de su trabajo o de su casa, decide qué tipo de aprendizaje le sirve
(`caso` con las tres opciones), escribe 6 ejemplos y la forma de comprobar si aprendió. Laboratorio:
la IA hace de máquina y el piloto la prueba con un caso nuevo. Rúbrica: nombra el tipo de aprendizaje,
trae ejemplos coherentes con ese tipo y un caso de prueba.

### Capítulo 4 · El espejo

**12 · ¿Piensa? ¿Siente?** (*Does it think? Does it feel?*) · `mitos-de-la-ia` · criterio · normal (9 min)
- **Protagonista:** Doña Carmen, 77, dirige el coro de su parroquia en Popayán. Le da las gracias al asistente del celular y
  le preocupa que "se ofenda" si no lo hace.
- **Idea:** cuatro mitos frente a lo que pasa de verdad: no es consciente ni siente (imita patrones);
  se equivoca con total seguridad; no es neutral (aprende de textos humanos, con sus prejuicios); no es
  magia (son cuentas sobre muchos datos). El efecto ELIZA de la misión 5 vuelve como cameo.
- **Bloques propios:** `clasificar` (¿mito o verdad?), `caso` (Doña Carmen quiere dejar que el
  asistente decida su dieta).
- **Laboratorio:** el piloto le pide a la IA que le responda con honestidad a Doña Carmen si siente algo
  cuando ella le da las gracias. Rúbrica: (1) pide una respuesta honesta sobre si siente o piensa (no
  cuenta "sé amable con ella" solo); (2) pide palabras sencillas o para una persona mayor; (3) pide un
  consejo práctico de cuándo no confiar a ciegas.
- **Sale de:** `mitos-y-verdades` (entera).
- **Cruce:** sesgos a fondo en Brújula (misión 10, `sesgo`); por qué se equivoca por dentro, en Lexia
  (misión 8, `alucinacion`); cómo verificar, en Eco (misión 7, `verificar`). Aquí solo se nombran.

**13 · El detector de humo** (*The smoke detector*) · `titulares-de-ia` · criterio · normal (8 min)
- **Protagonista:** Jaider, 35, presidente de la junta de acción comunal de su barrio en Sincelejo. Le
  llegó por WhatsApp una cadena: "La IA dejará sin trabajo a todo el mundo el próximo año".
- **Idea:** tres preguntas antes de reenviar: ¿quién lo dice y dónde está la fuente?, ¿habla de tareas o
  de trabajos enteros?, ¿qué se promete y qué ya se comprobó?
- **Bloques propios:** `punti-se-equivoco` (Punti reenvía una cadena exagerada), `clasificar` (¿habla
  de tareas o de trabajos enteros?). Sin `debate`: el debate sobre empleo es de Horizonte.
- **Laboratorio:** el piloto le pide a la IA que revise la cadena (viene en el reto). Rúbrica: (1)
  incluye el texto de la cadena; (2) pide separar lo que es dato de lo que es exageración; (3) pide
  qué fuente haría falta para creerlo; (4) pide un mensaje corto y respetuoso para responder en el grupo.
- **Sale de:** `mitos-y-verdades` (tarea).
- **Cruce:** qué pasa de verdad con el empleo, en Horizonte (misión 6, `tareas-no-trabajos`); leer
  noticias y estadísticas a fondo, en Horizonte capítulo 1; cadenas falsas y estafas, en Brújula
  capítulo 1. Las tres preguntas de esta misión son la base que Horizonte profundiza.

## 5. Proyecto final y certificado

**Explícale la IA a alguien que quieres** (*Explain AI to someone you love*) · proyecto (25 min)

El piloto elige a una persona real de su vida (sin datos personales: solo "mi tía, 60, cocinera") y
prepara una explicación de 1 minuto con cuatro partes: qué es la IA con un ejemplo de su día, uno de
los cuatro oficios, un momento de la historia y un mito desarmado. Pasos:

1. Laboratorio: le pide a la IA un borrador con esas cuatro partes para esa persona. Rúbrica: las
   cuatro partes, la persona descrita y un largo máximo.
2. `punti-se-equivoco`: Punti le devuelve un borrador suyo con dos errores de Origen y el piloto los
   encuentra.
3. `reto-ia`: se la cuenta a la persona (en persona o por nota de voz) y marca qué preguntó.
4. Nota final a la Bitácora: "La IA es…", comparada con la frase que escribió en la misión 1.

**Certificado:** "Explorador/a de Origen · Sabe qué es la IA, de dónde viene y cómo aprende".
Muestra las 13 ramas del árbol genealógico de Punti encendidas.

## 6. Lecciones viejas que se reciclan

| Lección vieja (id) | Misiones |
|---|---|
| `definicion` (en `src/lib/lecciones.ts`) | 1, 2 |
| `origenes` | 5 |
| `historia` | 6, 7, proyecto 2 |
| `tipos-de-ia` | 1 (tarea), 3, proyecto 1 |
| `mitos-y-verdades` | 4, 12, 13 |
| `como-aprende-una-maquina` | 8, 9, 10 |
| `redes-neuronales` | 11 |

Ninguna lección vieja se copia: se toman sus datos verificados, sus comparaciones (el solucionario, el
perro y la galleta, los votantes diminutos) y sus tareas, que pasan a `reto-ia` o a proyectos.

## 7. Datos que envejecen (VOLÁTILES)

Origen es el mundo más estable de la escuela. Lo que puede envejecer:

- Ejemplos de "IA en tu celular" que dependen de una app o función concreta (desbloqueo facial, el
  teclado que sugiere, la app de mapas): se escriben genéricos, sin marca.
- La cifra de usuarios de ChatGPT (100 millones estimados en enero de 2023, según un análisis de UBS
  citado por Reuters): es un dato histórico, no cambia, pero **se dice "estimados" y se cita**.
- Cualquier comparación del tipo "la IA más usada hoy" o "ya se habla de IA general": no se pone en
  Origen; va a Lexia (mercado) o Horizonte (futuro).
- El debate de la misión 7 ("la tecnología más rápida"): si aparece otra marca con adopción más rápida,
  hay que actualizar la postura A.

**Regla:** todo bloque con un dato de este tipo lleva `vivo: true` y la misión lleva `fuentes` con
`{ titulo, url, fecha }`. Los hitos históricos (1950, 1956, 1966, 1997, 2012, 2016, 2017, 2022, 2024)
van en `fuentes` una vez, con la fecha de verificación, aunque no cambien.

## 8. Requisitos y lugar en la ruta

- **Requisitos:** ninguno. Es la puerta de entrada.
- **Lugar recomendado:** primer mundo de la escuela. El orden sugerido de la ruta de Explorador es
  Origen → Lexia → Eco → Órbita (ruta completa en `INDICE.md`). No hay candado (decisión de producto), pero el onboarding debería mandar aquí a
  quien dice "nunca he usado una IA".
- **Conceptos que exporta** (`usaConceptos` de otros mundos): `ia`, `reglas-vs-ejemplos`,
  `aprendizaje-supervisado`, `red-neuronal` (Lexia y Núcleo los dan por sabidos), `mitos-de-la-ia`
  (Brújula).

## 9. Preguntas abiertas para Cami

1. **¿13 misiones está bien para el mundo de entrada?** Se podría bajar a 11 fusionando la 6 y la 7
   (historia en una sola misión larga). Recomendación: dejarlo así; la historia es de lo que más se
   comparte.
2. **Plantilla en el Laboratorio.** El formato solo permite `inicial: vacio` o `anterior`. Para un piloto
   que nunca escribió un prompt, propongo un tercer valor, `plantilla`, con un prompt a medio llenar
   ("Explícale a ___ qué es la IA con un ejemplo de ___"). ¿Se agrega al molde?
3. **Certificado de un mundo gratis.** Según 6.11 el certificado es del Club. ¿Origen da certificado a
   todos (buena puerta de entrada) o solo a los del Club? (Consolidada en `INDICE.md`, decisión sobre
   certificados.)
4. **Punti Flap dentro de la misión 10.** ¿Se puede abrir el juego desde una misión y volver, o se deja
   como enlace a la sección de juegos?
5. **Doña Carmen y el "gracias".** El caso de la misión 12 toca cómo se relaciona una persona mayor con
   la IA. ¿Te parece bien el tono, o prefieres un protagonista más joven para no caer en el
   estereotipo de "la abuela que no entiende"? (En la misión se cuida: Carmen tiene buena intuición y
   hace la pregunta correcta.)

## Fuentes (consultadas el 2026-09-24)

- Turing, A. (1950). *Computing Machinery and Intelligence*. Mind. https://academic.oup.com/mind/article/LIX/236/433/986238
- Propuesta de Dartmouth (1955) para el taller de 1956. https://en.wikipedia.org/wiki/Dartmouth_workshop
- ELIZA (1966) y el efecto ELIZA. https://en.wikipedia.org/wiki/ELIZA · https://en.wikipedia.org/wiki/ELIZA_effect
- Inviernos de la IA. https://en.wikipedia.org/wiki/AI_winter
- Deep Blue contra Kasparov (1997). https://www.ibm.com/history/deep-blue
- AlexNet (2012). https://en.wikipedia.org/wiki/AlexNet
- AlphaGo contra Lee Sedol (2016). https://deepmind.google/research/breakthroughs/alphago/
- Vaswani et al. (2017). *Attention Is All You Need*. https://arxiv.org/abs/1706.03762
- ChatGPT, 100 millones de usuarios estimados (análisis de UBS, febrero de 2023). https://www.euronews.com/next/2023/02/02/openai-chatgpt
- Premio Nobel de Física 2024 (Hopfield y Hinton). https://www.nobelprize.org/prizes/physics/2024/summary/
- Premio Nobel de Química 2024 (Baker, Hassabis y Jumper). https://www.nobelprize.org/prizes/chemistry/2024/summary/
- Google, *Introduction to Machine Learning* (supervisado, no supervisado, refuerzo). https://developers.google.com/machine-learning/intro-to-ml/what-is-ml
- Google, *Machine Learning Crash Course: Neural networks*. https://developers.google.com/machine-learning/crash-course/neural-networks
- Zeiler y Fergus (2013), qué "ven" las capas de una red. https://arxiv.org/abs/1311.2901
- Stanford HAI, *AI Index 2026* (contexto general). https://hai.stanford.edu/ai-index/2026-ai-index-report
