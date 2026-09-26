# Temario · Lexia (id del mundo: `modelos-de-lenguaje`) · PROPUESTA (2026-09-24)

**Lexia · Language models.** Rango: Explorador. Gratis.

Receta principal: **concepto** (capítulos 1 y 2), **criterio** y **habilidad** (capítulo 3) y
**mercado** (capítulo 4, que absorbe el contenido del planeta Arena: ver pregunta abierta 1).

## 1. La historia que cuenta Punti

Lexia es el planeta de las palabras. Punti lo construyó alrededor de una **máquina de fichas**: todo lo
que se dice en Lexia se corta en fichas pequeñas, y la máquina escoge, una por una, la ficha que
probablemente sigue. Así "habla" un modelo de lenguaje. La metáfora que se repite en todo el mundo es
esa: **fichas que caen una tras otra, como en una tómbola**. Cuando el piloto entiende cómo cae la
siguiente ficha, entiende por qué la IA escribe bien, por qué a veces inventa y por qué cada respuesta
sale distinta.

Cada capítulo es una zona del planeta:

- **La fábrica de fichas** (cap. 1): donde se corta el texto y gira la tómbola de la siguiente ficha.
- **La biblioteca infinita** (cap. 2): donde los modelos "leyeron" antes de salir, con su reloj parado
  en la fecha de corte y su mesa de trabajo limitada.
- **El desierto de los espejismos** (cap. 3): donde la máquina ve cosas que no están. Aquí se aprende
  por qué falla, cuándo pensarlo más y cómo ve y oye.
- **El mercado de las voces** (cap. 4): la plaza donde cada empresa monta su puesto. Punti recorre los
  puestos con los mismos criterios para todos.

Cada misión abre con una transmisión de Punti: "Piloto, la tómbola se volvió loca: le preguntamos lo
mismo tres veces a la máquina y dio tres respuestas. Ven a la fábrica".

## 2. Recetas

| Capítulo | Receta | Por qué |
|---|---|---|
| 1 · La fábrica de fichas | concepto | La idea central del mundo: predecir la siguiente ficha |
| 2 · La biblioteca infinita | concepto (misiones 6 y 7: habilidad) | De dónde sale lo que sabe y cómo usar bien su "memoria" |
| 3 · El desierto de los espejismos | criterio (misiones 10 y 11: habilidad) | Saber cuándo desconfiar y qué modo usar |
| 4 · El mercado de las voces | mercado (misión 15: criterio) | Quién es quién, cómo leer un lanzamiento y cómo elegir |

**Decisión de diseño sobre el Laboratorio en Lexia.** El Laboratorio corre sobre un modelo con su propia
fecha de corte (hoy Claude Haiku 4.5, con datos hasta febrero de 2025). Por eso **ningún Laboratorio le
pide a la IA datos del mercado actual** (versiones, precios, "cuál es el mejor"): esos datos llegan
dentro del `reto`, copiados de la `pantalla-viva` de la misión con su fecha. Así el Laboratorio no
envejece aunque el mercado cambie cada semana, y además enseña la misión 5 con el ejemplo.

## 3. Mapa del mundo

| Capítulo (zona · subtítulo) | Misiones | Proyecto del capítulo |
|---|---|---|
| 1 · La fábrica de fichas · Cómo arma una respuesta (*The token factory · How an answer is built*) | 1 El autocompletar gigante (un modelo de lenguaje predice lo que sigue) · 2 Fichas, no palabras (qué es un token y por qué importa: largo, límites y costo) · 3 La tómbola (por qué la misma pregunta da respuestas distintas) | **Radiografía de una respuesta**: tomas una respuesta real de una IA y marcas dónde predijo, dónde pudo variar y cuántas fichas gastó, más o menos |
| 2 · La biblioteca infinita · De dónde sale lo que sabe (*The endless library · Where its knowledge comes from*) | 4 La escuela de los modelos (preentrenamiento y ajuste, parámetros) · 5 El reloj parado (fecha de corte y cuándo busca en internet) · 6 La mesa de trabajo (ventana de contexto: por qué olvida en chats largos) · 7 Lo que se guarda (la memoria entre chats: qué guardar y qué no) | **Manual de mi asistente**: la ficha técnica de la IA que usas (fecha de corte, si busca, qué recuerda, cómo se apaga la memoria), comprobada por ti |
| 3 · El desierto de los espejismos · Por qué se equivoca y cómo razona (*The mirage desert · Why it fails and how it reasons*) | 8 Por qué alucina (predice lo probable, no lo verdadero) · 9 Malo para contar (letras, cuentas y por qué las fichas lo confunden) · 10 Pensar antes de hablar (modelos de razonamiento: cuándo sí y cuándo no) · 11 Ve, oye y habla (multimodal: fotos y voz, con sus límites) | **Cazador de espejismos**: 4 pruebas que hacen fallar a una IA, qué falló en cada una y cómo lo evitas |
| 4 · El mercado de las voces · El mapa de modelos (*The market of voices · The model map*) | 12 Empresa, asistente y modelo (los tres niveles de cada nombre) · 13 Los puestos grandes (quién es quién, con los mismos criterios) · 14 Abiertos y de otras latitudes (modelos que se descargan, China, Europa y Latam-GPT) · 15 Cómo leer un lanzamiento (promesa, comprobación y lo que falta) · 16 ¿Cuál uso para qué? (4 preguntas y la prueba del mismo prompt) | **Proyecto final · Mi tablero de modelos**. Da el certificado de Lexia |

Total: 4 capítulos, 16 misiones, 3 proyectos de capítulo y 1 proyecto final.

## 4. Las misiones

Formato: concepto (id) · receta · largo · protagonista y escenario · Laboratorio (qué escribe el piloto,
qué revisa la rúbrica) · bloques propios (además de inicio, nota a la bitácora y punto de control).

### Capítulo 1 · La fábrica de fichas

**1 · El autocompletar gigante** (*The giant autocomplete*) · `modelo-de-lenguaje` · concepto · normal (8 min)
- **Protagonista:** Don Octavio, 66, escribiente de plaza en Tunja: redacta cartas y derechos de
  petición a mano y en un computador viejo. Su celular le sugiere la siguiente palabra y él se pregunta
  si "esa cosa" es pariente de las IA que le nombran sus clientes.
- **Idea:** un modelo de lenguaje (LLM) aprendió una sola habilidad: predecir qué sigue en un texto.
  Repitiéndola ficha tras ficha arma cartas, resúmenes y chistes. El teclado del celular es su primo
  pequeño.
- **Bloques propios:** `transmision` con gráfico `flujo` (tu mensaje → fichas → la más probable → otra
  vez), `punti-se-equivoco` (Punti dice que el modelo "busca la respuesta en una base de datos").
- **Laboratorio:** el piloto le da a la IA el comienzo de una carta de Don Octavio y le pide tres formas
  probables de seguir, ordenadas de la más a la menos probable. Rúbrica: (1) incluye un comienzo de texto
  sin terminar (no cuenta pedir la carta completa); (2) pide varias continuaciones; (3) pide ordenarlas
  por qué tan probables o esperables son. El `sistema` aclara que el orden es ilustrativo.
- **Sale de:** `que-es-un-llm` (pantallas 1-2 y 4), `definicion` (el flujo "genera palabra por palabra").

**2 · Fichas, no palabras** (*Tokens, not words*) · `token` · concepto · normal (8 min)
- **Protagonista:** Valeria, 26, traductora independiente en Pereira. Sus clientes le pagan por
  palabra; le contaron que las IA "cobran por tokens" y no entiende la diferencia.
- **Idea:** el modelo no lee palabras sino fichas (tokens): una palabra corta puede ser una ficha y una
  larga, dos o tres. En inglés, una ficha son unas ¾ de palabra; el español suele gastar más fichas para
  decir lo mismo. Por eso los límites de largo y los precios de las empresas se cuentan en fichas.
- **Bloques propios:** `piezas` (una frase de Valeria partida en fichas de colores, hecha con un
  tokenizador real y guardada como imagen o tabla), `clasificar` (¿qué gasta más fichas?).
- **Laboratorio:** el piloto le pide a la IA que parta una frase del trabajo de Valeria en fichas
  aproximadas y marque qué palabras se parten en varias. Rúbrica: (1) incluye una frase con al menos
  una palabra larga; (2) pide marcar o separar las fichas; (3) pide que aclare que es una aproximación
  (no cuenta pedir "el número exacto"). El `sistema` obliga a decir que cada modelo corta distinto.
- **Sale de:** `que-es-un-llm` (pantalla 3), `apis-y-costos` (solo la idea de "el token es la moneda";
  el detalle de precios queda en Núcleo).

**3 · La tómbola** (*The raffle drum*) · `probabilidad` · concepto · normal (8 min)
- **Protagonista:** Didier, 33, compositor de vallenato en Valledupar. Le pide rimas a la IA y cada vez
  le salen otras; a veces le gusta la tercera.
- **Idea:** el modelo no escoge siempre la ficha más probable: gira la tómbola entre las probables. Por
  eso la misma pregunta da respuestas distintas, y por eso vale la pena pedir varias versiones. Lo
  "creativo" y lo "exacto" son dos puntos de esa misma perilla.
- **Bloques propios:** `antes-despues` (la misma pregunta en tres chats nuevos), `caso` (¿para qué
  tareas de Didier quieres variedad y para cuáles quieres siempre la misma respuesta?).
- **Laboratorio:** el piloto le da a la IA un verso de Didier y le pide cinco maneras de seguirlo, de la
  más predecible a la más sorpresiva. Rúbrica: (1) incluye el verso; (2) pide varias opciones (al menos
  3); (3) pide ordenarlas de predecible a sorpresiva o marcar cuál es la más esperable.
- **Sale de:** `que-es-un-llm` (tarea de "completa la frase tres veces").

**Proyecto del capítulo 1 · Radiografía de una respuesta** (*X-ray of an answer*) · proyecto (15 min)
`reto-ia`: el piloto le hace a su IA la misma pregunta en dos chats nuevos y pega las dos respuestas.
Laboratorio: le pide a la IA de Punti que compare las dos, señale dónde se parecen (lo muy probable)
y dónde se separan (la tómbola), y estime cuántas fichas tiene cada una. Rúbrica: pega las dos
respuestas, pide las coincidencias y las diferencias, y pide la estimación de fichas como aproximada.

### Capítulo 2 · La biblioteca infinita

**4 · La escuela de los modelos** (*The school for models*) · `entrenamiento-llm` · concepto · normal (9 min)
- **Protagonista:** Lorena, 37, instructora en una escuela de conducción en Cali. Entiende la IA en
  cuanto Punti le habla de teoría y práctica.
- **Idea:** dos etapas. Preentrenamiento: el modelo lee muchísimo texto y practica millones de veces
  adivinar la siguiente ficha (la teoría). Ajuste: personas le muestran buenas respuestas y califican
  las suyas, y así aprende a seguir instrucciones y a negarse a lo peligroso (la práctica con
  instructor). "Grande" se refiere a sus miles de millones de parámetros, las perillas que se ajustan.
- **Bloques propios:** `piezas` (preentrenamiento, ajuste, parámetros), `clasificar` (¿esto lo aprendió
  leyendo o se lo enseñó una persona?).
- **Laboratorio:** el piloto le pide a la IA que explique las dos etapas con la comparación de la escuela
  de conducción, para los alumnos de Lorena. Rúbrica: (1) nombra o describe las dos etapas (no cuenta
  "cómo se entrena una IA" sin más); (2) pide la comparación con aprender a manejar; (3) pide que diga
  qué aprende en cada etapa.
- **Sale de:** `como-entrenan-una-ia` (pantallas 1-4), `que-es-un-llm` (pantalla 5, parámetros).
- **Cruce:** cómo se hace esto a escala industrial (datos, chips, costos, calificadores) es Núcleo.

**5 · El reloj parado** (*The stopped clock*) · `fecha-de-corte` · criterio · normal (8 min)
- **Protagonista:** Don Rigoberto, 58, comerciante de ganado en Montería. Le preguntó a una IA el precio
  del kilo en pie "de hoy" y le dio un número muy seguro… de hace más de un año.
- **Idea:** el modelo sabe lo que leyó hasta su fecha de corte. Lo que pasó después solo lo sabe si la
  app busca en internet, y conviene ver si buscó (fuentes, enlaces). Para precios, noticias y leyes, se
  pregunta con fecha y se confirma en la fuente.
- **Bloques propios:** `caso` (tres preguntas de Rigoberto: ¿sirve la IA sola, la IA que busca, o la
  fuente oficial?), `punti-se-equivoco` (Punti da como "de hoy" un dato viejo).
- **Laboratorio:** el piloto escribe la pregunta de Rigoberto de forma que la IA diga hasta cuándo
  llegan sus datos y qué no puede saber. Rúbrica: (1) pide que diga su fecha de corte o hasta cuándo
  sabe; (2) pide separar lo que sabe de lo que pudo cambiar; (3) pide dónde confirmar el dato actual
  (tipo de fuente, no una página inventada). El `sistema` del Laboratorio responde con la fecha de corte
  real del modelo que se esté usando (se lee de Ajustes, no se escribe en el paquete).
- **Sale de:** `como-entrenan-una-ia` (pantalla 5 y tarea).
- **Cruce:** la técnica para verificar datos es Eco (misión 7, `verificar`).

**6 · La mesa de trabajo** (*The workbench*) · `ventana-de-contexto` · habilidad · normal (9 min)
- **Protagonista:** Andrea, 42, contadora independiente en Neiva. Lleva un chat de tres semanas con la
  IA sobre la declaración de una clienta y la IA ya confunde los datos del principio.
- **Idea:** la ventana de contexto es la mesa de trabajo: lo que el modelo tiene en cuenta a la vez. Si
  el chat crece demasiado, lo más viejo se cae de la mesa o se resume. Cambias de tema: chat nuevo. Chat
  largo: resumen de traspaso y chat nuevo.
- **Bloques propios:** `antes-despues` (el chat eterno vs el resumen de traspaso), `clasificar` (¿sigo
  en este chat o abro uno nuevo?).
- **Laboratorio:** el piloto le pide a la IA un "resumen de traspaso" del caso de Andrea (el reto trae un
  chat largo inventado, sin datos reales) para pegarlo en un chat nuevo. Rúbrica: (1) pide conservar
  los datos y decisiones importantes; (2) pide dejar por fuera la conversación que ya no sirve; (3)
  pide un formato corto (lista o máximo de líneas); (4) no copia datos personales de la clienta (no
  cuenta si pide incluir nombre completo o documento: se usan iniciales o "la clienta").
- **Sale de:** `contexto-y-memoria` (pantallas 1-2 y 5), `modelos-recientes` (pantalla 3).

**7 · Lo que se guarda** (*What it keeps*) · `memoria-del-asistente` · habilidad · normal (8 min)
- **Protagonista:** Sebastián, 29, guía de turismo en Salento. Descubrió que su asistente recordaba el
  nombre de un grupo de turistas de hace meses.
- **Idea:** hay dos memorias. La del chat (la mesa de trabajo) y la memoria entre chats, una función que
  algunas apps tienen encendida y que se puede ver, borrar o apagar. Se guardan preferencias útiles; no
  se guardan datos de otras personas ni datos delicados. (El chat temporal y el uso de tus chats para
  entrenar se configuran en Brújula 6; aquí solo se nombran.)
- **Bloques propios:** `pantalla-viva` (qué asistentes tienen memoria y dónde se apaga, con fecha),
  `clasificar` (¿esto lo dejarías en la memoria?), `reto-ia` (revisar qué recuerda tu IA y borrar algo).
- **Laboratorio:** el piloto escribe la nota que Sebastián quiere que su asistente recuerde para
  trabajar mejor. Rúbrica: (1) incluye al menos dos preferencias de trabajo útiles (idioma de los tours,
  tono, formato); (2) no incluye datos de turistas ni datos delicados (documento, salud, dirección);
  (3) pide que la IA confirme qué guardaría. El `sistema` hace de asistente con memoria y responde qué
  anotaría, sin guardar nada de verdad.
- **Sale de:** `contexto-y-memoria` (pantallas 3-4 y 6).
- **Cruce:** Lexia es dueña del concepto de memoria (qué es y qué guardar). Cómo aprovecharla con
  instrucciones personalizadas y proyectos es Eco (misión 18); qué no pegar nunca en un prompt, Eco
  (misión 8, `datos-sensibles`); la configuración de privacidad de la app (historial, entrenamiento,
  chat temporal, enlaces), Brújula (misión 6, `configuracion-privacidad`).

**Proyecto del capítulo 2 · Manual de mi asistente** (*My assistant's manual*) · proyecto (20 min)
`reto-ia` en la IA que usa el piloto: pregunta su fecha de corte, prueba si busca en internet con una
noticia de esta semana, revisa qué recuerda de él o ella y encuentra dónde se apaga la memoria.
Laboratorio: le pide a la IA de Punti que convierta sus hallazgos en una ficha de una pantalla.
Rúbrica: incluye los cuatro hallazgos y pide la ficha con fecha de hoy. Se guarda en la Bitácora.

### Capítulo 3 · El desierto de los espejismos

**8 · Por qué alucina** (*Why it hallucinates*) · `alucinacion` · criterio · normal (9 min)
- **Protagonista:** Profe Yamile, 50, docente de una escuela rural en Boyacá. Pidió libros sobre la
  historia de su municipio y la IA le dio cinco títulos con autor y año. Tres no existen.
- **Idea:** el modelo predice lo que suena probable, no lo que comprobó. Cuando no sabe, la ficha más
  probable no es "no sé": es algo con forma de respuesta. Por eso inventa sobre temas poco conocidos,
  con nombres, fechas y citas, y lo dice con toda la calma.
- **Bloques propios:** `transmision` (la tómbola sin fichas buenas), `clasificar` (¿terreno firme o
  terreno de espejismos?: tema muy conocido, tema local, dato reciente, cita textual),
  `punti-se-equivoco` (Punti cita un libro que no existe).
- **Laboratorio:** el piloto le hace a la IA una pregunta sobre algo muy específico y local (el reto
  propone un festival inventado de un pueblo) y le da permiso de decir que no sabe. Rúbrica: (1)
  pregunta por algo específico y poco conocido; (2) le da permiso explícito de responder "no sé" o
  "no tengo datos"; (3) pide que diga si está recordando algo que leyó o si está adivinando. El
  aprendizaje se ve en la respuesta: con permiso, la IA reconoce que no sabe.
- **Sale de:** `limitaciones-y-alucinaciones` (pantallas 1-2 y tarea), `mitos-y-verdades` (pantalla 3).
- **Cruce:** la técnica para verificar (listas, fuentes, dónde confirmar) es Eco, misión 7. Aquí se
  entiende **por qué** pasa; allá se aprende a defenderse.

**9 · Malo para contar** (*Bad at counting*) · `limites-de-calculo` · criterio · normal (8 min)
- **Protagonista:** Duván, 39, maestro de obra en Soacha. Le pidió a la IA cuántos bultos de
  cemento necesita y el número no le cuadró con su experiencia.
- **Idea:** como el modelo ve fichas y no letras ni números uno por uno, puede fallar contando letras,
  sumando cifras largas o siguiendo muchas condiciones. Muchas apps ya usan una calculadora o código
  por dentro, pero no siempre. En cuentas que cuestan plata: que muestre los pasos y se revisan.
- **Bloques propios:** `antes-despues` (el resultado suelto vs los pasos que se pueden revisar),
  `punti-se-equivoco` (Punti cuenta mal las letras de "Soacha").
- **Laboratorio:** el piloto le pide a la IA el cálculo de materiales de Duván (medidas en el reto).
  Rúbrica: (1) incluye todas las medidas; (2) pide que muestre cada paso de la cuenta; (3) pide que
  revise el resultado o diga con qué comprobarlo (calculadora, proveedor). El `sistema` hace las
  cuentas bien: el punto es que el piloto sepa exigir los pasos.
- **Sale de:** `limitaciones-y-alucinaciones` (tabla de puntos débiles).
- **Cruce:** "paso a paso" como técnica de prompt es Eco, misión 11. Revisar sumas en un presupuesto
  personal se practica en Órbita (misión 4).

**10 · Pensar antes de hablar** (*Think before speaking*) · `modelo-de-razonamiento` · habilidad · normal (8 min)
- **Protagonista:** Natalia, 28, administra una finca hotel en Santa Fe de Antioquia. Tiene tareas
  simples (responder un mensaje) y otras enredadas (acomodar 14 huéspedes en 6 habitaciones con
  condiciones).
- **Idea:** muchas apps dejan elegir entre un modo rápido y uno de razonamiento, que "piensa" antes de
  responder: tarda más y cuesta más, pero resuelve mejor problemas de varios pasos con condiciones. Para
  lo diario, el rápido basta.
- **Bloques propios:** `clasificar` (¿rápido o razonamiento?), `pantalla-viva` (cómo se llama el modo en
  cada app, con fecha), `reto-ia` (el mismo acertijo en los dos modos).
- **Laboratorio:** el piloto le pide a la IA que clasifique la lista de tareas de Natalia (viene en el
  reto) en "modo rápido" o "modo razonamiento" y explique por qué. Rúbrica: (1) incluye las tareas;
  (2) pide los dos grupos; (3) pide la razón (varios pasos, condiciones, algo que se puede comprobar).
- **Sale de:** `modelos-recientes` (pantalla 4 y tarea).

**11 · Ve, oye y habla** (*It sees, hears and speaks*) · `multimodal` · habilidad · normal (9 min)
- **Protagonista:** Doña Fanny, 64, tiene un vivero de orquídeas en Envigado. Quiere mandarle a la IA la
  foto de una hoja con manchas.
- **Idea:** un modelo multimodal entiende texto, imágenes, audio y a veces video. Sirve para leer un
  letrero, explicar un empaque o conversar con la cámara. Se equivoca con fotos borrosas, letra a mano y
  números pequeños, y cada foto es un dato: se revisa antes de mandarla.
- **Bloques propios:** `piezas` (texto, imagen, voz, video), `caso` (¿qué foto manda Fanny: la hoja
  sola o la foto donde se ve la factura del abono con su cédula?), `pantalla-viva` (qué apps tienen voz
  con cámara, con fecha).
- **Laboratorio:** el reto describe la foto de la hoja (el Laboratorio es solo texto). El piloto escribe
  el mensaje que acompaña la foto. Rúbrica: (1) dice qué planta es y dónde está; (2) dice qué quiere
  saber; (3) pide que la IA diga qué no alcanza a ver bien o qué otra foto le serviría; (4) no pide un
  diagnóstico definitivo sin sugerir confirmarlo con alguien que sepa.
- **Sale de:** `multimodal` (entera).
- **Cruce:** crear imágenes, voz y video es Prisma. Aquí solo se "entiende" lo que se le muestra.

**Proyecto del capítulo 3 · Cazador de espejismos** (*Mirage hunter*) · proyecto (20 min)
El piloto arma cuatro pruebas para una IA real (`reto-ia`): un dato muy local, un dato de esta semana,
una cuenta larga y una foto difícil. Anota qué falló y por qué (con las ideas del capítulo). Laboratorio:
convierte las cuatro pruebas en "reglas de uso" para su familia. Rúbrica: nombra las cuatro trampas,
cada una con su porqué y su defensa.

### Capítulo 4 · El mercado de las voces (receta mercado)

Regla del capítulo: **cada misión separa lo que dura** (quién es cada empresa, en qué se diferencian
los tipos de modelo, cómo se compara) **de una `pantalla-viva`** con versiones, precios y planes, que es
lo único que el Radar IA toca cada semana. Todas las empresas se describen con la misma ficha:
quién la hace, en qué app la usas, si tiene versión gratis, si se puede descargar, dónde quedan tus
datos. Punti no tiene marca favorita.

**12 · Empresa, asistente y modelo** (*Company, assistant and model*) · `empresa-asistente-modelo` · mercado · normal (8 min)
- **Protagonista:** Mateo, 20, estudiante de gastronomía en Bogotá. Oye nombres a diario y no sabe si
  hablan de una empresa, de una app o de "otra IA".
- **Idea:** tres niveles: la empresa que lo construye, el asistente (la app que usas) y el modelo (el
  cerebro que responde por dentro, que cambia de versión cada pocos meses). Los nombres cambian; los
  niveles no.
- **Bloques propios:** `clasificar` (nombres reales de la `pantalla-viva` en los 3 niveles),
  `pantalla-viva` (tabla empresa → asistente → modelo actual, con fecha).
- **Laboratorio:** el reto trae la lista de nombres de la pantalla viva. El piloto le pide a la IA que
  los ordene en los tres niveles. Rúbrica: (1) incluye la lista; (2) pide los tres niveles (empresa,
  asistente, modelo); (3) pide que marque los nombres que no reconoce en vez de adivinar (esto importa:
  el modelo del Laboratorio no conoce los nombres más nuevos, y la misión lo usa para repasar la 5).
- **Sale de:** `el-mapa-de-los-modelos` (entera).

**13 · Los puestos grandes** (*The big stalls*) · `mapa-de-empresas` · mercado · normal (10 min)
- **Protagonista:** Ingrid, 45, periodista de un periódico regional en Santa Marta. Le pidieron una
  nota "neutral" sobre las IA más usadas.
- **Idea:** las empresas grandes de hoy (en Estados Unidos: OpenAI, Google, Anthropic, xAI, Meta y
  Microsoft) con la misma ficha para todas: qué hacen, dónde las encuentras (muchas ya viven dentro de
  apps que usas, como el correo o el chat), si tienen versión gratis y en qué dicen ser fuertes, sin
  ranking.
- **Bloques propios:** `pantalla-viva` (una fila por empresa, con modelo y planes a la fecha),
  `punti-se-equivoco` (Punti describe a una empresa con adjetivos de propaganda y a otra con críticas:
  el piloto encuentra la falta de neutralidad).
- **Laboratorio:** el reto trae los datos de la pantalla viva. El piloto le pide a la IA una tabla
  neutral para la nota de Ingrid. Rúbrica: (1) incluye los datos del reto; (2) pide los mismos criterios
  para todas las empresas; (3) pide no declarar ganador ni usar adjetivos de propaganda; (4) pide poner
  la fecha de los datos.
- **Sale de:** `openai-chatgpt`, `google-gemini`, `anthropic-claude`, `xai-grok`, `meta-y-llama`,
  `microsoft-copilot` (lo que dura de cada una; sus pantallas vivas pasan a una sola tabla).

**14 · Abiertos y de otras latitudes** (*Open models from other latitudes*) · `origen-del-modelo` · mercado · normal (9 min)
- **Protagonista:** Fabián, 36, bibliotecario de una universidad pública en Popayán. Quiere saber si hay
  modelos que se puedan descargar y si existe alguno "hecho con datos de aquí".
- **Idea:** no todo viene de las mismas empresas. Hay modelos abiertos que se descargan (de Meta,
  Google, Mistral en Europa, DeepSeek, Qwen y Kimi en China, y otros), y en febrero de 2026 se lanzó
  Latam-GPT, un modelo abierto de unos 70.000 millones de parámetros, liderado desde Chile y hecho con
  datos de la región. Antes de usar cualquiera: dónde quedan tus datos y bajo qué leyes.
- **Bloques propios:** `piezas` (cerrado en la nube, abierto descargable, abierto usado en la nube de
  otro), `pantalla-viva` (modelos abiertos destacados, con fecha), `fuente` (anuncio de Latam-GPT).
- **Laboratorio:** el piloto le pide a la IA las preguntas que Fabián debería hacerse antes de usar un
  modelo de cualquier empresa o país en la biblioteca. Rúbrica: (1) pide preguntas sobre dónde quedan
  los datos o qué ley aplica; (2) pide preguntas sobre si se puede descargar o solo usar en línea; (3)
  pide preguntas sobre si responde bien en español o sobre temas de la región; (4) no pide "cuál es el
  mejor".
- **Sale de:** `modelos-chinos`, `mistral`, `meta-y-llama` (la parte abierta).
- **Cruce:** qué son los pesos, las licencias y cómo correr uno en tu computador es Núcleo (misión 13,
  `pesos-abiertos`).

**15 · Cómo leer un lanzamiento** (*How to read a launch*) · `leer-lanzamientos` · criterio · normal (9 min)
- **Protagonista:** Carolina, 31, vende computadores en un centro comercial de Medellín. Los clientes le
  preguntan: "¿Es verdad que salió la IA que es la mejor del mundo?".
- **Idea:** cada semana hay un "número uno". Orden para leerlo: la fuente oficial y su fecha; qué promete
  la empresa y qué comprobaron otros; en qué prueba es "el mejor" y si esa prueba se parece a lo tuyo;
  y probarlo tú con tu tarea.
- **Bloques propios:** `clasificar` (frases de un anuncio: ¿promesa, dato comprobado o dato que
  falta?), `fuente` (el Radar IA / Novedades de la semana).
- **Laboratorio:** el reto trae un anuncio inventado de una empresa inventada. El piloto le pide a la IA
  que lo desarme. Rúbrica: (1) incluye el anuncio; (2) pide separar lo que promete la empresa de lo que
  comprobó alguien más; (3) pide qué dato falta para creerle; (4) pide cómo lo probaría Carolina con
  una tarea de su trabajo.
- **Sale de:** `novedades-de-la-semana` (pantalla 5), `modelos-recientes` (pantalla 5), `como-se-evalua-un-modelo`
  (solo la idea de "¿en qué examen?"; el detalle es de Núcleo, misión 9, `benchmark`). Leer demos de
  robots y productos fuera del chat es Horizonte (misión 4).

**16 · ¿Cuál uso para qué?** (*Which one for what?*) · `elegir-asistente` · mercado · normal (9 min)
- **Protagonista:** Don Arturo, 57, tiene una distribuidora de huevos en San Gil. Quiere "la mejor IA"
  para hacer pedidos, cotizaciones y mensajes a sus tenderos.
- **Idea:** no hay una que gane en todo. Cuatro preguntas: qué necesito hacer, cuánto puedo pagar, dónde
  la voy a usar (celular, correo, computador) y qué pasa con mis datos. Y el mejor truco: el mismo
  prompt en dos asistentes, y comparar.
- **Bloques propios:** `pantalla-viva` (guía rápida por tarea, con fecha), `reto-ia` (la prueba del
  mismo prompt).
- **Laboratorio:** el piloto escribe el perfil de Don Arturo para pedir una recomendación. Rúbrica: (1)
  dice las tareas; (2) dice el presupuesto; (3) dice dónde la usaría; (4) dice qué datos maneja o qué
  le preocupa de ellos. El `sistema` recomienda **tipos** de herramienta y criterios, y si nombra
  marcas, usa solo las que trae el reto (copiadas de la pantalla viva) y nombra al menos tres por igual.
- **Sale de:** `cual-uso-para-que` (entera), `perplexity` (como ejemplo de "buscador que responde con
  fuentes").

## 5. Proyecto final y certificado

**Mi tablero de modelos** (*My model scoreboard*) · proyecto (30 min)

El piloto elige tres tareas reales suyas (un mensaje, una explicación, una cuenta o un resumen) y las
prueba en dos o tres asistentes (`reto-ia`, sin datos personales). Pasos:

1. Laboratorio: escribe los criterios con los que va a calificar (calidad, velocidad, si inventó, si
   buscó, costo). Rúbrica: criterios concretos, la misma escala para todos y una fecha.
2. Pega los resultados y la IA de Punti arma el tablero. Rúbrica: pega resultados de al menos dos
   asistentes y pide una recomendación por tarea, no un ganador general.
3. `punti-se-equivoco`: Punti saca una conclusión general de una sola prueba; el piloto lo corrige.
4. Nota a la Bitácora: "Para ___ uso ___ porque ___", con la fecha. Punti le recuerda que vuelva a
   probar en unos meses.

**Certificado:** "Explorador/a de Lexia · Entiende cómo piensa un modelo de lenguaje, dónde falla y
cómo elegir uno". El certificado muestra la fecha: el tablero es de ese momento.

## 6. Lecciones viejas que se reciclan

| Lección vieja (id) | Misiones |
|---|---|
| `que-es-un-llm` | 1, 2, 3, 4 |
| `definicion` | 1 |
| `como-entrenan-una-ia` | 4, 5 |
| `limitaciones-y-alucinaciones` | 8, 9 |
| `mitos-y-verdades` (Origen) | 8 (solo la pantalla 3) |
| `modelos-recientes` | 6, 10, 15 (la reemplaza la pantalla viva de cada misión) |
| `contexto-y-memoria` | 6, 7 |
| `multimodal` | 11 |
| `el-mapa-de-los-modelos` | 12 |
| `openai-chatgpt`, `google-gemini`, `anthropic-claude`, `xai-grok`, `meta-y-llama`, `microsoft-copilot` | 13 |
| `modelos-chinos`, `mistral` | 14 |
| `novedades-de-la-semana` | 15 (el método); la lección viva sigue aparte como noticiero semanal |
| `cual-uso-para-que`, `perplexity` | 16 |
| `apis-y-costos`, `como-se-evalua-un-modelo` (Núcleo) | 2 y 15, solo una idea cada una |

## 7. Datos que envejecen (VOLÁTILES)

Lexia es el mundo que más envejece. **Lo que cambia rápido** (semanas o meses):

- Nombres y versiones de modelos. Foto al 2026-09-24, desde las páginas oficiales: OpenAI publica
  GPT-6 Astra, Sol y Luna; Anthropic, Claude Fable 5.1, Opus 5.5, Sonnet 5 y Haiku 4.5; Google, la
  familia Gemini 3.x (3.8 Flash estable, 3.1 Pro en vista previa). **Esto no se escribe en ninguna
  misión fija.**
- Precios por millón de fichas y planes de cada app (gratis, pagos, qué incluye cada uno).
- Tamaños de ventana de contexto (hoy varios modelos anuncian alrededor de 1 millón de fichas).
- Fechas de corte de cada modelo.
- Qué apps tienen memoria entre chats, modo de voz con cámara, modo de razonamiento, búsqueda en
  internet, y cómo se llama cada botón.
- Lanzamientos de modelos abiertos y chinos (DeepSeek, Qwen, Kimi) y el estado de Latam-GPT.
- Quién está "de primero" en cualquier tabla o arena de votos.

**Lo que dura** (se puede escribir en bloques fijos): qué es un modelo de lenguaje, qué es un token,
la tómbola, preentrenamiento y ajuste, fecha de corte, ventana de contexto, por qué alucina, los tres
niveles empresa/asistente/modelo, las cuatro preguntas para elegir.

**Regla:** los datos volátiles van **solo** en bloques `pantalla-viva` (`vivo: true`, con `revisado` y
`fuentes` con fecha) o en el `reto` de un Laboratorio que los copia de esa pantalla. El Radar IA revisa
cada lunes las pantallas vivas de las misiones 7, 10, 11, 12, 13, 14 y 16, y la fecha de corte del
modelo del Laboratorio (misión 5) sale de Ajustes. Si un dato vivo cambia, se actualiza la pantalla,
no la misión.

## 8. Requisitos y lugar en la ruta

- **Requisitos:** Origen recomendado (`usaConceptos`: `ia`, `reglas-vs-ejemplos`, `red-neuronal`). Sin
  candado.
- **Lugar recomendado:** segundo mundo, entre Origen y Eco (ruta completa en `INDICE.md`). Eco da por sabido qué es un modelo; y la
  misión 7 de Eco (verificar) funciona mejor si el piloto ya pasó por la 8 de Lexia (por qué alucina).
- **Conceptos que exporta:** `token` y `ventana-de-contexto` (Eco, Forja, Núcleo), `alucinacion`
  (Eco, Brújula), `fecha-de-corte` (Forja: buscar e investigar), `empresa-asistente-modelo` (todos).

## 9. Preguntas abiertas para Cami

1. **¿Arena desaparece como planeta?** (Decisión consolidada en `INDICE.md`; los demás temarios ya
   remiten a "Lexia, capítulo 4".) Este temario mete el contenido de Arena en el capítulo 4 de
   Lexia (mercado), porque el encargo pedía "el mapa de modelos y empresas" dentro de Lexia. Opciones:
   (a) Arena se vuelve el capítulo 4 de Lexia y el noticiero semanal queda como sección aparte;
   (b) Arena sigue como planeta propio y Lexia termina en el capítulo 3 (12 misiones). Recomiendo (a):
   un solo lugar para "quién es quién" y menos planetas que mantener.
2. **Una misión por empresa o una tabla.** Las lecciones viejas tenían una lección por marca. Aquí
   quedan en una sola misión (13) con la misma ficha para todas. ¿Te sirve, o quieres misiones cortas
   (`rapida`) por empresa como material opcional del Archivo de Punti?
3. **Memoria en Lexia y en Eco.** Resuelta por el editor (ver `INDICE.md`): Lexia 7 explica qué es y
   qué guardar; Eco 18, cómo aprovecharla; Brújula 6, la configuración de privacidad. No se fusionan.
4. **Tokenizador real.** La misión 2 queda mucho mejor con un tokenizador de verdad (la frase de Valeria
   partida en fichas de colores). ¿Lo hacemos como imagen fija generada una vez, o como herramienta
   viva dentro de la app?
5. **Fecha de corte del Laboratorio a la vista.** Para la misión 5, ¿está bien que Punti diga en qué
   fecha se quedó "su" IA del Laboratorio, sin nombrar la marca?
6. **Latam-GPT.** Es el único modelo de la región y a la gente le va a interesar. ¿Lo dejamos en la
   misión 14 o merece una misión corta propia cuando haya una forma fácil de probarlo?

## Fuentes (consultadas el 2026-09-24)

- OpenAI, *What are tokens and how to count them?* (1 ficha ≈ 4 caracteres o ¾ de palabra en inglés). https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them
- Petrov et al. (2023), *Language Model Tokenizers Introduce Unfairness Between Languages* (NeurIPS). https://arxiv.org/abs/2305.15425
- Ouyang et al. (2022), *Training language models to follow instructions with human feedback*. https://arxiv.org/abs/2203.02155
- Anthropic, *Models overview* (modelos, ventanas, fechas de corte; foto al 2026-09-24). https://platform.claude.com/docs/en/about-claude/models/overview
- OpenAI, *Models* (foto al 2026-09-24). https://developers.openai.com/api/docs/models
- Google, *Gemini API models* (foto al 2026-09-24). https://ai.google.dev/gemini-api/docs/models
- Memoria de los asistentes: https://help.openai.com/en/articles/8590148-memory-faq · https://support.claude.com/en/articles/12260368-use-incognito-chats · https://support.google.com/gemini/answer/16598469?hl=en
- Multimodal: https://help.openai.com/en/articles/8400625-voice-mode-faq · https://9to5google.com/2025/05/30/gemini-live-camera-screen-wide/
- CENIA, *Latam-GPT: la primera IA regional abierta creada con datos latinoamericanos* (10 de febrero de 2026). https://cenia.cl/2026/02/10/latam-gpt-la-primera-ia-regional-abierta-creada-con-datos-latinoamericanos/
- Radio Universidad de Chile, lanzamiento de Latam-GPT (10 de febrero de 2026). https://radio.uchile.cl/2026/02/10/gobierno-lanza-latam-gpt-el-primer-gran-modelo-de-lenguaje-abierto-de-america-latina/
- Arena de votos (arena.ai, antes LMArena). https://en.wikipedia.org/wiki/Arena_(AI_platform)
- Fuentes de las lecciones de Arena y de `contexto-y-memoria` y `multimodal`: `contenido/fuentes-44-lecciones.md`.
