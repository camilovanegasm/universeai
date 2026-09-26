# Temario · Núcleo (id del mundo: `como-se-construye`) · PROPUESTA (2026-09-24)

**Core · How AI is built.** Rango: Arquitecto. Club (decisión 6.9).

Receta principal: **construcción** (el piloto diseña piezas de un sistema: una guía de etiquetado, un
examen, un bot que consulta documentos). Apoyo de **concepto** (capítulo 2) y **criterio** (leer costos,
exámenes y licencias). El capítulo 4 usa **mercado** en la misión 13.

Para quién: gente curiosa sin formación técnica que ya usa IA y quiere entender qué hay detrás, o
que tiene que decidir algo (el jefe pide "montemos un bot", un proveedor le cotiza "una IA propia").
No se programa en ningún momento.

## 1. La historia que cuenta Punti

Núcleo es el centro del universo de Punti, literalmente: un planeta hueco con un **reactor en el
centro**, y alrededor del reactor, la fábrica donde Punti construye las mentes de sus máquinas (la suya
también salió de aquí). Para llegar al reactor se baja por capas, como en una mina. La metáfora de todo
el mundo es **la fábrica**: materia prima (datos) → horno (entrenamiento) → control de calidad
(evaluación) → muelle de despacho (llevar el modelo a la gente). Cada capítulo es una capa del planeta.

- **La mina** (cap. 1): donde se saca y se limpia la materia prima. Hay mineros humanos: los que
  etiquetan.
- **El reactor** (cap. 2): el horno gigante que convierte datos en un modelo. Consume chips, energía y
  dinero.
- **El banco de pruebas** (cap. 3): donde cada modelo presenta exámenes y lo intentan romper antes de
  salir.
- **El muelle** (cap. 4): donde los modelos salen hacia las apps: por API, descargados, conectados a
  documentos o ajustados para una empresa.

Cada misión abre con una transmisión de Punti desde la capa donde está: "Piloto, en la mina llegó un
cargamento de datos que huele raro. Antes de meterlo al reactor, ayúdame a revisarlo".

## 2. Recetas

| Capítulo | Receta | Por qué |
|---|---|---|
| 1 · La mina | construcción (misiones 1 y 2: concepto) | El piloto diseña la guía de etiquetado y audita un conjunto de datos |
| 2 · El reactor | concepto (misión 7: criterio; misión 8: construcción) | Hay que entender escala, chips y costos antes de opinar |
| 3 · El banco de pruebas | criterio y construcción | Leer exámenes ajenos y armar el propio |
| 4 · El muelle | construcción (misión 13: mercado; misión 15: criterio) | Decidir cómo se usa un modelo en un caso real |

## 3. Mapa del mundo

| Capítulo (zona · subtítulo) | Misiones | Proyecto del capítulo |
|---|---|---|
| 1 · La mina · Los datos (*The mine · Data*) | 1 La receta de un modelo (las cuatro etapas de la fábrica) · 2 De dónde salen los datos (internet, libros, código, datos con licencia, datos sintéticos, y los permisos) · 3 Las manos detrás de los datos (etiquetar: escribir una guía clara) · 4 Basura entra, basura sale (calidad y quién falta en los datos) | **Ficha de datos**: la hoja de vida de los datos de una IA imaginaria (de dónde, con qué permiso, quién etiqueta, quién falta) |
| 2 · El reactor · Entrenar y computar (*The reactor · Training and compute*) | 5 ¿Más grande es mejor? (escala: datos, parámetros y cómputo crecen juntos) · 6 Chips y centros de datos (por qué hacen falta miles de chips) · 7 Cuánto cuesta entrenar (leer cifras de costo sin tragar entero) · 8 De loro a asistente (postentrenamiento: calificadores humanos y reglas) | **Desarma un anuncio**: un anuncio de lanzamiento inventado; extraes datos, cómputo, costo y lo que no dice |
| 3 · El banco de pruebas · Evaluar y cuidar (*The test bench · Evaluate and keep safe*) | 9 Exámenes para máquinas (benchmarks, arenas de votos y el examen filtrado) · 10 Tu propio examen (casos de prueba con respuesta esperada) · 11 Intenta romperlo (pruebas de seguridad antes de salir) | **Tu examen de 10 preguntas**: una prueba para tu trabajo, corrida en dos asistentes, con puntaje |
| 4 · El muelle · Del reactor al mundo (*The dock · From the reactor to the world*) | 12 El mesero y la cuenta (API y costo por fichas) · 13 Abierto o cerrado (pesos, licencias y modelos en tu computador) · 14 Que consulte antes de hablar (RAG) · 15 Prompt, RAG o ajuste fino (la escalera para adaptar una IA) | **Proyecto final · El plano de tu IA**. Da el certificado de Núcleo |

Total: 4 capítulos, 15 misiones, 3 proyectos de capítulo y 1 proyecto final.

## 4. Las misiones

Formato: concepto (id) · receta · largo · protagonista y escenario · Laboratorio (qué escribe el piloto,
qué revisa la rúbrica) · bloques propios (además de inicio, nota a la bitácora y punto de control).

### Capítulo 1 · La mina

**1 · La receta de un modelo** (*The recipe for a model*) · `cadena-de-construccion` · concepto · normal (9 min)
- **Protagonista:** Olga, 39, gerente de una cooperativa cafetera en Caldas. Un proveedor le ofrece
  "entrenar una IA propia" para leer las facturas de los asociados y ella no sabe qué preguntar.
- **Idea:** todo modelo pasa por la misma fábrica: datos, entrenamiento (con cómputo), evaluación y
  despliegue. Casi nadie entrena desde cero: la mayoría toma un modelo ya hecho y lo adapta. Saber las
  cuatro etapas te deja hacer las preguntas correctas.
- **Bloques propios:** `piezas` (las 4 etapas, con color fijo en todo Núcleo), `clasificar` (¿en qué
  etapa pasa esto?).
- **Laboratorio:** el piloto le pide a la IA las preguntas que Olga le debe hacer al proveedor.
  Rúbrica: (1) pide preguntas sobre los datos (cuáles, de quién, con qué permiso); (2) sobre si entrena
  desde cero o adapta uno existente; (3) sobre cómo lo van a probar; (4) sobre cuánto cuesta usarlo cada
  mes, no solo construirlo. Aprobar 3 de 4.
- **Sale de:** nueva (sin lección vieja); usa `como-entrenan-una-ia` de Lexia como punto de partida.

**2 · De dónde salen los datos** (*Where the data comes from*) · `fuentes-de-datos` · concepto · normal (9 min)
- **Protagonista:** Ómar, 52, dueño de una editorial pequeña de libros regionales en Medellín. Se
  pregunta si sus libros terminaron dentro de alguna IA y qué puede hacer.
- **Idea:** las fuentes típicas: páginas web públicas recogidas por programas que las copian, libros,
  código, datos comprados o con licencia, datos de usuarios (cuando la app lo permite) y datos sintéticos
  (texto hecho por otra IA). Los textos humanos de calidad no son infinitos: un estudio de Epoch AI
  estima que el texto público podría usarse por completo entre 2026 y 2032. Cada fuente trae su
  pregunta de permiso.
- **Bloques propios:** `piezas` (las 6 fuentes), `caso` (Ómar decide qué hacer: bloquear a los programas
  que copian su página, negociar una licencia o no hacer nada; se ven las consecuencias).
- **Laboratorio:** el piloto le pide a la IA una tabla de fuentes de datos para una IA que entienda
  libros regionales. Rúbrica: (1) pide varias fuentes distintas; (2) pide para cada una si hace falta
  permiso o licencia; (3) pide un riesgo de cada una (calidad, permiso, sesgo).
- **Sale de:** `como-entrenan-una-ia` (Lexia, pantalla 2) ampliada.
- **Cruce:** de quién es lo que genera una IA y los pleitos por derechos de autor son de Brújula
  (misión 12, `derechos-de-autor-ia`). Aquí solo se ve el lado de quien construye.

**3 · Las manos detrás de los datos** (*The hands behind the data*) · `etiquetado` · construcción · normal (10 min)
- **Protagonista:** Yessica, 27, trabaja desde Barranquilla etiquetando datos para empresas de IA de
  otros países, un trabajo real y creciente en América Latina. Le toca clasificar mensajes de clientes
  y cada compañera los clasifica distinto.
- **Idea:** miles de personas etiquetan datos y califican respuestas; sin ellas no hay IA. La calidad
  depende de una guía clara: categorías bien definidas, un ejemplo de cada una y qué hacer con los casos
  dudosos. También se habla, sin sermón, de las condiciones de ese trabajo.
- **Bloques propios:** `antes-despues` (guía vaga vs guía clara, con el desacuerdo entre etiquetadoras),
  `clasificar` (el piloto etiqueta 5 mensajes con la guía).
- **Laboratorio:** el piloto escribe la guía de etiquetado. La IA la aplica a tres mensajes difíciles
  del reto y muestra dónde dudó. Rúbrica: (1) define cada categoría (queja, pregunta, pedido, otro) con
  una frase; (2) da al menos un ejemplo por categoría; (3) dice qué hacer con los mensajes que caben en
  dos categorías o no caben en ninguna. Segundo Laboratorio (`inicial: anterior`): arreglar la guía
  donde la IA dudó.
- **Sale de:** nueva. Fuentes: MIT Technology Review (2022) y Global Voices (2024) sobre etiquetadores
  en América Latina.

**4 · Basura entra, basura sale** (*Garbage in, garbage out*) · `calidad-de-datos` · construcción · normal (10 min)
- **Protagonista:** Emiro, 47, líder de un consejo comunitario de pescadores en Guapi (Cauca). Quieren un asistente de
  voz para reportar la pesca y el que probaron no entiende el acento del Pacífico.
- **Idea:** un modelo aprende lo que hay en sus datos, y también lo que falta. Si casi no hay voces o
  textos de una región, le va peor con esa región. El español de Colombia está menos representado que
  el inglés; por eso existen esfuerzos como Latam-GPT. Revisar datos es preguntar: ¿está limpio?, ¿está
  completo?, ¿quién falta?
- **Bloques propios:** `clasificar` (problemas de un conjunto de datos: sucio, repetido, incompleto,
  desbalanceado), `punti-se-equivoco` (Punti asegura que "con más datos siempre mejora").
- **Laboratorio:** el reto describe el conjunto de grabaciones que usaron (inventado: casi todo de
  ciudades del interior, pocas mujeres, nada del Pacífico). El piloto le pide a la IA una auditoría.
  Rúbrica: (1) incluye la descripción del conjunto; (2) pide identificar quién o qué falta; (3) pide
  cómo conseguir esos datos con permiso de las personas; (4) pide cómo probar el resultado con gente de
  Guapi.
- **Sale de:** `como-entrenan-una-ia` (Lexia, pantalla 5: "aprende nuestros prejuicios").
- **Cruce:** sesgos y discriminación, a fondo, en Brújula (misión 10, `sesgo`).

**Proyecto del capítulo 1 · Ficha de datos** (*Datasheet*) · proyecto (20 min)
El piloto inventa una IA útil para su trabajo o su comunidad y llena su ficha de datos: de dónde salen,
con qué permiso, quién los etiqueta y con qué guía, quién falta y cómo se revisa. Laboratorio: la IA
revisa la ficha y señala huecos. Rúbrica: la ficha trae las cinco partes y pide la revisión de huecos.

### Capítulo 2 · El reactor

**5 · ¿Más grande es mejor?** (*Is bigger better?*) · `escalado` · concepto · normal (9 min)
- **Protagonista:** Doña Edelmira, 55, dueña de una panadería en Duitama que pasó de un horno a tres. Sabe
  que no sirve comprar más harina si no hay horno, ni más horno si no hay panaderos.
- **Idea:** durante años los modelos mejoraron al crecer juntos tres ingredientes: datos, parámetros y
  cómputo. Si uno crece solo, se desperdicia. Hoy esa receta tiene límites (datos que se acaban,
  costos que suben) y las empresas también mejoran con métodos más eficientes y con modelos que
  "piensan" más al responder.
- **Bloques propios:** `piezas` (datos, parámetros, cómputo), `transmision` con gráfico `tabla` (el
  cómputo de entrenamiento de los modelos de punta creció unas 5 veces por año desde 2020, según
  Epoch AI; `vivo: true`).
- **Laboratorio:** el piloto le pide a la IA que explique la idea de escala con la panadería de Doña
  Rosa. Rúbrica: (1) nombra los tres ingredientes; (2) pide que explique por qué deben crecer juntos;
  (3) pide al menos un límite de "más grande".
- **Sale de:** `historia` (Origen, "los tres combustibles", `usaConceptos: tres-combustibles`) en versión adulta; `redes-neuronales`
  (parámetros).

**6 · Chips y centros de datos** (*Chips and data centers*) · `computo` · concepto · normal (9 min)
- **Protagonista:** Edilson, 41, electricista industrial en Barrancabermeja. Oyó que una sola IA "gasta
  como una ciudad" y quiere entender qué es lo que se conecta.
- **Idea:** entrenar es hacer billones de multiplicaciones. Un procesador normal es un maestro que hace
  una cuenta tras otra; un chip de IA son miles de ayudantes haciendo cuentas a la vez. Se juntan
  decenas o cientos de miles en centros de datos que necesitan electricidad y refrigeración.
  Entrenar (una vez, carísimo) no es lo mismo que usar el modelo (cada pregunta, barato pero millones
  de veces).
- **Bloques propios:** `antes-despues` (un maestro vs mil ayudantes), `clasificar` (¿esto es
  entrenamiento o uso?).
- **Laboratorio:** el piloto le pide a la IA una explicación para los compañeros de Edilson de por qué la
  IA necesita chips especiales y tanta electricidad. Rúbrica: (1) pide la diferencia entre un procesador
  normal y un chip de IA (o hacer cuentas una a una vs a la vez); (2) pide separar entrenar de usar;
  (3) pide una comparación con el trabajo eléctrico.
- **Sale de:** nueva.
- **Cruce:** el impacto en energía, agua y ambiente es de Horizonte (misión 13, `energia-ia`). Aquí solo
  como parte del costo.

**7 · Cuánto cuesta entrenar** (*How much training costs*) · `costo-de-entrenar` · criterio · normal (10 min)
- **Protagonista:** Yaneth, 34, asesora del fondo de empleados de una empresa en Cali. Un asociado le
  manda un titular: "Empresa entrenó una IA igual de buena con solo 5 millones de dólares".
- **Idea:** las cifras de costo casi siempre son estimaciones y cuentan cosas distintas. El AI Index
  de Stanford estimó unos 930 dólares para el Transformer original (2017), unos 78 millones para GPT-4
  y unos 191 millones para Gemini Ultra; Epoch AI calcula que el costo de entrenar modelos de punta
  crece unas 3,5 veces por año. El caso famoso: DeepSeek informó unos 5,6 millones de dólares para el
  entrenamiento final de su modelo V3, y el mismo informe aclara que no incluye la investigación ni los
  experimentos previos. Preguntas: ¿quién lo estimó?, ¿qué incluye?, ¿qué deja por fuera?
- **Bloques propios:** `clasificar` (¿esto entra en "el costo de entrenar"?: la corrida final, los
  experimentos, los sueldos, los chips comprados, la electricidad), `pantalla-viva` (tabla de costos
  estimados con fuente y fecha).
- **Laboratorio:** el reto trae el titular y dos párrafos de la nota (inventados, inspirados en el caso
  real). El piloto le pide a la IA que lo analice para Yaneth. Rúbrica: (1) incluye el titular o la
  nota; (2) pide qué incluye y qué deja por fuera esa cifra; (3) pide quién hizo la estimación o la
  fuente; (4) pide una frase prudente para responderle al asociado.
- **Sale de:** `apis-y-costos` (solo la idea de "leer la factura").

**8 · De loro a asistente** (*From parrot to assistant*) · `postentrenamiento` · construcción · normal (10 min)
- **Protagonista:** Gerardo, 44, jefe de servicio al cliente de una empresa de internet en Bogotá. Califica
  todos los días a sus asesores con una lista de criterios.
- **Idea:** un modelo recién preentrenado solo continúa textos, como un loro que leyó todo. El
  postentrenamiento lo vuelve asistente: le muestran ejemplos de buenas respuestas, personas comparan
  dos respuestas y eligen la mejor, y el modelo se ajusta hacia lo preferido (la técnica se conoce como
  aprendizaje por refuerzo con retroalimentación humana). Algunas empresas agregan reglas escritas o
  una "constitución". Los modelos de razonamiento se entrenan además con problemas que tienen
  respuesta comprobable.
- **Bloques propios:** `piezas` (ejemplos, comparaciones, reglas, problemas comprobables),
  `punti-se-equivoco` (Punti dice que el modelo "aprende en vivo de cada chat").
- **Laboratorio:** el piloto hace de calificador: escribe los criterios con los que se elige la mejor de
  dos respuestas a un cliente. La IA genera dos respuestas a un reclamo del reto y aplica esos criterios.
  Rúbrica: (1) al menos tres criterios concretos (resuelve el problema, es honesta, es amable, no
  inventa); (2) pide elegir una ganadora; (3) pide la razón según los criterios.
- **Sale de:** `como-entrenan-una-ia` (Lexia, pantalla 3) a fondo.
- **Cruce:** Origen misión 10 (aprendizaje por refuerzo); Lexia misión 4 (las dos etapas, sin
  detalle).

**Proyecto del capítulo 2 · Desarma un anuncio** (*Take a launch apart*) · proyecto (20 min)
El reto trae el anuncio de lanzamiento de un modelo inventado (con cifras de parámetros, datos, chips,
costo y "el mejor en todo"). El piloto extrae lo que dice sobre cada etapa de la fábrica y lista lo que
no dice. Laboratorio: pedirle a la IA la tabla. Rúbrica: pide las cuatro etapas, lo que falta y qué
cifras son de la propia empresa. Enlaza con la misión 15 de Lexia.

### Capítulo 3 · El banco de pruebas

**9 · Exámenes para máquinas** (*Exams for machines*) · `benchmark` · criterio · normal (10 min)
- **Protagonista:** Profe Nidia, 49, rectora de un colegio en Villavicencio. Conoce bien las pruebas
  Saber 11: sabe lo que miden, lo que no miden y lo que pasa si el examen se filtra.
- **Idea:** un benchmark es un examen estandarizado para IA: todos presentan las mismas preguntas. Las
  arenas de votos comparan respuestas anónimas y miden lo que la gente prefiere, que no siempre es lo
  correcto. Trampa: si las preguntas se filtraron en los datos de entrenamiento, el modelo memoriza
  (contaminación), y con preguntas nuevas parecidas algunos bajan varios puntos. Un buen puntaje en
  matemáticas no dice nada de tu correo en español.
- **Bloques propios:** `piezas` (examen, arena de votos, prueba propia), `clasificar` (¿qué mide cada
  cosa?), `pantalla-viva` (exámenes más citados hoy, con fecha).
- **Laboratorio:** el reto trae la frase de un anuncio ("número uno en el examen X"). El piloto le pide a
  la IA que le ayude a Nidia a entender qué significa. Rúbrica: (1) pide qué mide ese examen; (2) pide
  si el examen es público y podría estar filtrado; (3) pide si sirve para la tarea de Nidia (por
  ejemplo, preparar guías en español).
- **Sale de:** `como-se-evalua-un-modelo` (pantallas 1-4).

**10 · Tu propio examen** (*Your own exam*) · `evaluacion-propia` · construcción · normal (10 min)
- **Protagonista:** Don Ramón, 58, dueño de un taller de ornamentación (rejas y puertas) en Pasto. Quiere
  usar una IA para responder cotizaciones y no sabe cuál sirve.
- **Idea:** la prueba que más te dice es la tuya: casos reales, la respuesta que esperas y cómo la
  calificas. Pocos casos, bien escogidos, incluidos los difíciles. Se corre igual en cada modelo y se
  vuelve a correr cuando sale uno nuevo.
- **Bloques propios:** `antes-despues` ("probé y me gustó" vs una tabla de 5 casos con puntaje).
- **Laboratorio:** el piloto escribe tres casos de prueba para Don Ramón. Rúbrica: (1) cada caso trae la
  pregunta de un cliente; (2) cada caso trae lo que debería decir una buena respuesta; (3) al menos un
  caso difícil (un dato que falta, un pedido raro); (4) pide que la IA lo convierta en una tabla con
  columna de puntaje.
- **Sale de:** `como-se-evalua-un-modelo` (pantalla 5), `cual-uso-para-que` (la prueba del mismo
  prompt).
- **Cruce:** el tablero de Lexia (proyecto final) compara asistentes para uso personal; aquí se
  construye un examen con respuesta esperada. Si el piloto hizo el tablero, lo convierte en examen.

**11 · Intenta romperlo** (*Try to break it*) · `pruebas-de-seguridad` · construcción · normal (10 min)
- **Protagonista:** Rocío, 46, funcionaria de atención al ciudadano de una alcaldía en Boyacá. En un
  mes sale el chatbot de la alcaldía y le toca aprobarlo.
- **Idea:** antes de salir, los modelos y los bots pasan por pruebas de "equipo rojo": gente que intenta
  que digan algo peligroso, inventen trámites o entreguen datos de otros. Las empresas grandes
  publican fichas del modelo con esos resultados. Una entidad pequeña puede hacer su versión: una lista
  de situaciones riesgosas y lo que el bot debería hacer en cada una.
- **Bloques propios:** `caso` (el bot le da a un ciudadano un requisito inventado: ¿qué hace Rocío?),
  `fuente` (una ficha de sistema pública de cualquier empresa, con fecha).
- **Laboratorio:** el piloto escribe el plan de pruebas. Rúbrica: (1) al menos tres situaciones
  riesgosas (pedir datos de otra persona, inventar un trámite, un insulto o una amenaza); (2) para cada
  una, lo que el bot debería hacer; (3) incluye una prueba de "instrucción escondida" o de alguien que
  intenta cambiarle las reglas (no cuenta solo "probar que funcione").
- **Sale de:** nueva.
- **Cruce:** la seguridad de la IA como problema de fondo es Horizonte (misión 12, `seguridad-ia`); las
  instrucciones escondidas en agentes, Nexo (misión 9, `inyeccion-de-instrucciones`).

**Proyecto del capítulo 3 · Tu examen de 10 preguntas** (*Your 10-question exam*) · proyecto (30 min)
El piloto arma un examen de 10 casos para su trabajo real (sin datos personales), lo corre en dos
asistentes (`reto-ia`), pega los resultados y la IA de Punti arma la tabla de puntajes. Rúbrica: 10
casos con respuesta esperada, al menos 2 difíciles, y la misma escala para los dos. Se guarda en la
Bitácora para volver a correrlo cuando salga un modelo nuevo.

### Capítulo 4 · El muelle

**12 · El mesero y la cuenta** (*The waiter and the bill*) · `api-y-tokens` · construcción · normal (10 min)
- **Protagonista:** Alexis, 32, tiene una agencia de turismo en Leticia. Un programador le cotizó un bot
  de WhatsApp "que usa IA por API" y le cobra aparte "el consumo".
- **Idea:** una API es el mesero que lleva el pedido de una app a la cocina del modelo y trae la
  respuesta. Por API se paga por uso, en fichas: las de entrada (lo que se le manda, incluido todo el
  historial y los documentos que se pegan en cada pedido) y las de salida (lo que escribe), que suelen
  costar varias veces más. Por eso un bot que pega un documento largo en cada pregunta sale caro.
- **Bloques propios:** `piezas` (app, API, modelo, fichas de entrada, fichas de salida),
  `pantalla-viva` (precios de referencia por millón de fichas de varias empresas, con fecha).
- **Laboratorio:** el reto trae precios **de ejemplo** marcados como tales y el uso esperado del bot. El
  piloto le pide a la IA el cálculo del costo mensual. Rúbrica: (1) incluye cuántas conversaciones al
  mes; (2) incluye el largo aproximado de lo que entra y lo que sale; (3) pide calcular entrada y salida
  por separado; (4) pide una idea para bajar el costo.
- **Sale de:** `apis-y-costos` (entera).
- **Cruce:** conectar la IA a otras apps es Autómata y Nexo; construir la app, Taller.

**13 · Abierto o cerrado** (*Open or closed*) · `pesos-abiertos` · mercado · normal (10 min)
- **Protagonista:** Consuelo, 53, abogada con una oficina pequeña en Tunja. No quiere que los
  documentos de sus clientes salgan de su computador.
- **Idea:** un modelo cerrado vive en los servidores de la empresa y se usa por internet. Uno de pesos
  abiertos se descarga (los pesos son las perillas ya ajustadas) y puede correr en tu computador, sin
  internet, con apps gratuitas. Ventajas: privacidad y control. Costos: hace falta un buen equipo y los
  pequeños son menos capaces. Y "abierto" no es "haz lo que quieras": cada modelo trae licencia, y no
  todos los "abiertos" cumplen la definición de código abierto de la Open Source Initiative (2024).
- **Bloques propios:** `caso` (¿qué le conviene a Consuelo?), `pantalla-viva` (familias abiertas y sus
  licencias, con fecha), `reto-ia` opcional (instalar un modelo pequeño si tiene computador).
- **Laboratorio:** el piloto le pide a la IA una comparación para Consuelo. Rúbrica: (1) dice qué le
  preocupa (que los documentos no salgan); (2) pide comparar un modelo en la nube con uno en su
  computador; (3) pide revisar la licencia antes de usarlo en su trabajo; (4) pide qué computador
  necesitaría, en términos generales.
- **Sale de:** `modelos-abiertos-y-locales` (entera), `meta-y-llama` (la licencia).
- **Cruce:** el mapa de quién publica modelos abiertos es Lexia (misión 14).

**14 · Que consulte antes de hablar** (*Look it up before answering*) · `rag` · construcción · normal (10 min)
- **Protagonista:** Arnulfo, 38, administrador del acueducto veredal de una vereda en Santander. Los
  usuarios preguntan por WhatsApp las tarifas y el reglamento, y él quiere un bot que no invente.
- **Idea:** RAG (generación aumentada con búsqueda): antes de responder, el sistema busca en los
  documentos correctos y responde con eso en la mano, citando de dónde lo sacó. Reduce los inventos,
  pero no los elimina: puede traer el papel equivocado o leer mal una tabla. Un estudio de Stanford de
  2024 encontró que herramientas legales con RAG se equivocaban o inventaban en más de 1 de cada 6
  consultas. Las citas valen oro porque dejan comprobar.
- **Bloques propios:** `transmision` con gráfico `flujo` (pregunta → busca → encuentra → responde con
  cita), `punti-se-equivoco` (Punti responde bien pero cita el artículo que no es).
- **Laboratorio:** el reto trae un reglamento corto inventado del acueducto (5 artículos). El piloto
  escribe las instrucciones del bot y una pregunta de un usuario. Rúbrica: (1) ordena responder solo con
  el reglamento; (2) pide citar el artículo usado; (3) pide decir "eso no está en el reglamento" cuando
  falte; (4) pregunta algo que sí está o algo que no está para probarlo. Segundo Laboratorio
  (`inicial: anterior`): una pregunta cuya respuesta no está, y ver si el bot aguanta.
- **Sale de:** `rag` (entera).
- **Cruce:** subir tus documentos a un asistente para trabajar es Forja; armar un asistente con la
  información de un negocio, sin programar, es Taller 11. Núcleo es dueño de RAG: aquí se entiende la
  pieza.

**15 · Prompt, RAG o ajuste fino** (*Prompt, RAG or fine-tuning*) · `escalera-de-adaptacion` · criterio · normal (10 min)
- **Protagonista:** Doña Pilar, 40, dueña de tres heladerías en Girardot. Quiere que su bot (1) hable con el
  tono de la marca, (2) diga los sabores del día y (3) responda miles de pedidos con el mismo formato
  exacto.
- **Idea:** tres herramientas en escalera, de la barata a la cara: mejorar el prompt, darle documentos
  (RAG) y ajuste fino (seguir entrenando un modelo con muchos ejemplos tuyos, como un chef experto que
  aprende tu sazón). Para lo que cambia seguido, RAG; para un estilo o formato fijo con mucho volumen,
  ajuste fino; y casi siempre, empezar por el prompt.
- **Bloques propios:** `caso` (las tres necesidades de Doña Pilar), `clasificar` (6 necesidades de otros
  negocios en los tres escalones), gráfico `flujo` de la escalera.
- **Laboratorio:** el piloto le pide a la IA una recomendación para Doña Pilar. Rúbrica: (1) separa las tres
  necesidades; (2) dice cuál información cambia seguido; (3) dice el volumen o cuántos mensajes; (4)
  pide empezar por lo más simple o justificar por qué subir de escalón.
- **Sale de:** `ajuste-fino` (entera).

## 5. Proyecto final y certificado

**El plano de tu IA** (*Your AI blueprint*) · proyecto (40 min)

El piloto diseña, sin programar, una IA para un caso real de su trabajo o su comunidad (un bot de
preguntas, un clasificador de mensajes, un asistente de cotizaciones). Entrega un plano de una página
con seis partes, una por cada idea del mundo:

1. Qué hace y para quién (y qué no debe hacer).
2. Datos: de dónde salen, con qué permiso, quién falta (ficha del capítulo 1).
3. Modelo: cerrado o abierto, y por qué.
4. Adaptación: prompt, RAG o ajuste fino, con la escalera.
5. Pruebas: 5 casos de su examen y 3 pruebas de seguridad.
6. Costo mensual estimado por API (con precios de la pantalla viva y su fecha).

Pasos: Laboratorio por partes (`inicial: anterior`, el plano crece en cada paso), `punti-se-equivoco`
con un plano de Punti que tiene tres errores del mundo, y revisión final de la IA contra una rúbrica de
seis partes. Nota a la Bitácora: "Si mañana me ofrecen una IA propia, lo primero que pregunto es…".

**Certificado:** "Arquitecto/a de Núcleo · Entiende cómo se construye, se prueba y se despliega una IA,
y sabe hacer las preguntas correctas antes de contratar una". Club.

## 6. Lecciones viejas que se reciclan

| Lección vieja (id) | Misiones |
|---|---|
| `apis-y-costos` | 7 (idea), 12 |
| `rag` | 14 |
| `ajuste-fino` | 15 |
| `modelos-abiertos-y-locales` | 13 |
| `como-se-evalua-un-modelo` | 9, 10 |
| `como-entrenan-una-ia` (Lexia) | 1, 2, 4, 8 (ampliadas; Lexia conserva la versión corta) |
| `historia` y `redes-neuronales` (Origen) | 5 |
| `meta-y-llama` (Arena) | 13 (licencias) |
| `cual-uso-para-que` (Arena) | 10 |

Nuevas, sin lección vieja: 1, 3, 6, 11 y los proyectos. Las cinco lecciones de Núcleo de la fase C
quedan todas absorbidas.

## 7. Datos que envejecen (VOLÁTILES)

- **Precios por API** (por millón de fichas de entrada y de salida) de cada empresa. Hoy, a modo de
  referencia al 2026-09-24: los modelos más capaces de varias empresas están alrededor de 10 dólares de
  entrada y 50 de salida por millón, y los más económicos por debajo de 1 de entrada. **Nunca en un
  bloque fijo.**
- Costos estimados de entrenamiento y sus fuentes (AI Index, Epoch AI): se actualizan cada año.
- Tendencias de cómputo (5 veces por año desde 2020, según Epoch AI, actualizado en febrero de 2026) y
  de costo (3,5 veces por año).
- Tamaños de los modelos y de los centros de datos más grandes.
- Familias de modelos abiertos, sus licencias y qué apps sirven para correrlos en casa.
- Qué exámenes (benchmarks) están de moda y quién va primero en las arenas de votos.
- Estado de Latam-GPT (versión, cómo probarlo).
- Estudios citados con cifra (Stanford 2024 sobre RAG legal; contaminación de exámenes): no cambian,
  pero pueden quedar superados por estudios nuevos.

**Regla:** estos datos van en bloques `pantalla-viva` (`vivo: true`, `revisado`, `fuentes` con fecha)
o en el `reto` de un Laboratorio que los toma de esa pantalla y los marca como "de ejemplo" o "a la
fecha". Los precios del Laboratorio de la misión 12 son siempre **de ejemplo**, para que la cuenta
enseñe el método sin prometer una tarifa. El Radar IA revisa las pantallas vivas de las misiones 5, 7,
9, 12 y 13.

## 8. Requisitos y lugar en la ruta

- **Requisitos:** Origen y Lexia (usa `aprendizaje-supervisado`, `aprendizaje-por-refuerzo`,
  `red-neuronal`, `token`, `ventana-de-contexto`, `entrenamiento-llm`, `alucinacion`). Eco muy
  recomendado (los Laboratorios de Núcleo piden prompts largos y precisos).
- **Recomendados antes:** Forja (haber usado IA en el trabajo le da sentido a "construir una propia") y
  Autómata (APIs y conexiones).
- **Lugar recomendado:** último mundo de la ruta recomendada (ver `INDICE.md`): … → Nexo → Taller →
  Horizonte → Autómata → **Núcleo**. Quien quiera, puede hacer Núcleo antes de Horizonte: el capítulo
  3 de Horizonte gana si el piloto ya entiende cómputo, datos y costos.
- **Conceptos que exporta:** `rag` y `api-y-tokens` (Nexo, Taller, Autómata), `pesos-abiertos` (Lexia
  14 lo nombra), `pruebas-de-seguridad` (Horizonte, Nexo), `benchmark` (Lexia 15).

## 9. Preguntas abiertas para Cami

1. **Trabajo de etiquetado (misión 3).** Es un tema real en Colombia y Venezuela y toca condiciones de
   trabajo difíciles. ¿Lo contamos con Yessica como protagonista digna (trabajo real, criterio real) y
   una pantalla breve sobre condiciones, o prefieres dejar la parte laboral para Horizonte (capítulo 2)?
2. **Nombres de empresas en costos (misión 7).** Para enseñar a leer cifras hay que citar casos reales
   (GPT-4, Gemini Ultra, DeepSeek V3). ¿Está bien nombrarlos con fuente, o prefieres casos inventados y
   las cifras reales solo en el Archivo de Punti?
3. **Correr un modelo en el computador (misión 13).** El `reto-ia` de instalar un modelo local no lo
   puede hacer quien solo tiene celular. ¿Lo dejamos opcional, con otra evidencia para quien no tenga
   computador?
4. **¿15 misiones o 12?** Si Núcleo debe ser más corto (es de Club y de nicho), se pueden fusionar 5 y 6
   (escala y chips) y 9 y 10 (exámenes ajenos y propios). Recomiendo dejarlo en 15: cada una tiene un
   Laboratorio de construcción distinto.
5. **Costo del Laboratorio.** Los Laboratorios de Núcleo tienen retos largos (un reglamento, una nota,
   un anuncio). Eso sube las fichas por uso. ¿Se acepta un tope por piloto más alto en este mundo, o
   acortamos los retos?
6. **Ficha de datos y plano descargables.** Los proyectos de este mundo son documentos útiles fuera de
   la app. ¿Se puede descargar el plano final como PDF junto al certificado?

## Fuentes (consultadas el 2026-09-24)

- Epoch AI, *Trends* (cómputo de entrenamiento 5×/año desde 2020; costo 3,5×/año; actualizado el 5 de febrero de 2026). https://epoch.ai/trends
- Villalobos et al. / Epoch AI, *Will we run out of data?* (el texto público podría agotarse entre 2026 y 2032). https://arxiv.org/abs/2211.04325 · https://epoch.ai/publications/will-we-run-out-of-data-limits-of-llm-scaling-based-on-human-generated-data
- Stanford HAI, *AI Index 2024* (costos estimados: Transformer ~930 USD, GPT-4 ~78 M USD, Gemini Ultra ~191 M USD). https://hai.stanford.edu/news/inside-new-ai-index-expensive-new-models-targeted-investments-and-more · https://fortune.com/2024/04/18/google-gemini-cost-191-million-to-train-stanford-university-report-estimates/
- Stanford HAI, *AI Index 2026* (13 de abril de 2026). https://hai.stanford.edu/ai-index/2026-ai-index-report · resumen en IEEE Spectrum: https://spectrum.ieee.org/state-of-ai-index-2026
- DeepSeek-AI (2024), *DeepSeek-V3 Technical Report* (2,788 M horas de GPU H800, ~5,576 M USD solo para el entrenamiento final; excluye investigación y experimentos previos). https://arxiv.org/abs/2412.19437
- Kaplan et al. (2020), *Scaling Laws for Neural Language Models*. https://arxiv.org/abs/2001.08361 · Hoffmann et al. (2022), *Training Compute-Optimal Large Language Models*. https://arxiv.org/abs/2203.15556
- Ouyang et al. (2022), *Training language models to follow instructions with human feedback*. https://arxiv.org/abs/2203.02155
- MIT Technology Review (2022), etiquetadores de datos en Venezuela. https://www.technologyreview.com/2022/04/20/1050392/ai-industry-appen-scale-data-labels/
- Global Voices (2024), *Latin America: Uncovering the hidden human workforce behind AI*. https://globalvoices.org/2024/10/05/latin-america-uncovering-the-hidden-human-workforce-behind-ai/
- CENIA, Latam-GPT (10 de febrero de 2026; ~70.000 millones de parámetros, más de 300.000 millones de fichas). https://cenia.cl/2026/02/10/latam-gpt-la-primera-ia-regional-abierta-creada-con-datos-latinoamericanos/
- Arena de votos y contaminación de exámenes: https://en.wikipedia.org/wiki/Arena_(AI_platform) · https://arxiv.org/abs/2405.00332
- Lewis et al. (2020), el artículo que nombró RAG. https://arxiv.org/abs/2005.11401
- Stanford RegLab/HAI (2024), herramientas legales con RAG (más de 1 de cada 6 consultas con error). https://hai.stanford.edu/news/ai-trial-legal-models-hallucinate-1-out-6-or-more-benchmarking-queries
- OpenAI, guía de optimización de modelos (prompt, RAG, ajuste fino). https://developers.openai.com/api/docs/guides/model-optimization
- Open Source Initiative, *Open Source AI Definition 1.0* (2024). https://opensource.org/ai/open-source-ai-definition
- OpenAI, gpt-oss (agosto de 2025, Apache 2.0). https://openai.com/index/introducing-gpt-oss/
- Precios oficiales (foto al 2026-09-24): https://platform.claude.com/docs/en/about-claude/models/overview · https://developers.openai.com/api/docs/models · https://ai.google.dev/gemini-api/docs/pricing
