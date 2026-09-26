# Índice de la escuela · Los 12 temarios de Punti · PROPUESTA (2026-09-24)

Una sola página para ver la escuela entera: qué mundos hay, en qué orden se recorren, qué mundo es
dueño de cada tema y qué decisiones le quedan a Cami. Eco (`prompts.md`) está aprobado y no se tocó;
los otros 11 temarios son propuesta, ya editados para que se lean como una sola escuela.

Todos los temarios tienen las mismas secciones: 1 Historia · 2 Recetas · 3 Mapa del mundo (con la
línea "Total") · 4 Las misiones · 5 Proyecto final y certificado · 6 Lecciones viejas que se
reciclan · 7 Datos que envejecen (VOLÁTILES) · 8 Requisitos y lugar en la ruta · 9 Preguntas abiertas
· Fuentes.

## 1. Los 12 mundos

Orden = ruta recomendada. Proyectos = 3 de capítulo + 1 final en todos los mundos.

| # | Mundo | id | Rango | Acceso | Cap. | Misiones | Proyectos | Receta principal | Antes conviene |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Origen | `que-es-la-ia` | Explorador | Gratis | 4 | 13 | 4 | concepto (criterio en cap. 4) | Nada: es la puerta |
| 2 | Lexia | `modelos-de-lenguaje` | Explorador | Gratis | 4 | 16 | 4 | concepto; criterio y habilidad (cap. 3); mercado (cap. 4) | Origen |
| 3 | Eco | `prompts` | Explorador | Gratis | 4 | 19 | 4 | habilidad (criterio en cap. 2) | Lexia (cap. 1) |
| 4 | Órbita | `ia-en-tu-dia` | Explorador | Gratis | 4 | 15 | 4 | habilidad (criterio en salud) | Nada (Eco cap. 1 en paralelo) |
| 5 | Brújula | `etica-y-seguridad` | Capitán | Gratis siempre | 4 | 16 | 4 | criterio | Nada; Eco cap. 2 antes de su cap. 2 |
| 6 | Forja | `herramientas-de-ia` | Capitán | Gratis | 4 | 17 | 4 | habilidad (criterio al cierre de cada capítulo) | Eco |
| 7 | Prisma | `imagenes-y-video` | Capitán | Gratis | 4 | 16 | 4 | habilidad (construcción y criterio) | Eco cap. 1 |
| 8 | Nexo | `agentes` | Capitán | Gratis | 4 | 16 | 4 | concepto y criterio; habilidad en cap. 4 | Eco (1, 7, 12); Brújula |
| 9 | Taller | `crea-sin-programar` | Capitán | Club | 4 | 17 | 4 | construcción | Eco; Forja cap. 1 |
| 10 | Horizonte | `futuro-de-la-ia` | Capitán | Club | 4 | 16 | 4 | futuro (criterio en cap. 1, habilidad en cap. 4) | Origen; Lexia cap. 1 |
| 11 | Autómata | `automatizaciones` | Arquitecto | Gratis | 4 | 17 | 4 | construcción (concepto, mercado y criterio de apoyo) | Eco (cap. 1 y 12); Forja; Nexo |
| 12 | Núcleo | `como-se-construye` | Arquitecto | Club | 4 | 15 | 4 | construcción (concepto, criterio, mercado) | Origen, Lexia, Eco; Autómata |

**Totales:** 12 mundos · 48 capítulos · **193 misiones** · **48 proyectos** (36 de capítulo + 12
finales) · 12 certificados. Gratis: 9 mundos y 145 misiones. Club: 3 mundos y 48 misiones.
Si Arena sigue como planeta aparte (decisión 1), Lexia baja a 12 misiones y hay que escribir el
temario de Arena.

Rangos: los de `temas.ts` para los 7 mundos viejos y los de la fila MUNDO de
`punti-44-lecciones-nuevas.tsv` para los 5 nuevos. No se cambió ninguno.

## 2. Ruta recomendada

1. **Tramo Explorador:** Origen → Lexia → Eco → Órbita.
2. **Tramo Capitán:** Brújula → Forja → Prisma → Nexo → Taller → Horizonte.
3. **Tramo Arquitecto:** Autómata → Núcleo.

- Sin candados (decisión de producto): la ruta es una recomendación del mapa y del onboarding.
- **Puerta alternativa:** quien "nunca ha usado IA" y quiere algo útil ya puede entrar por Órbita.
  Órbita 1 da el ciclo pedir, ajustar y revisar en una pantalla y remite a Eco.
- **Brújula capítulo 1** (estafas) se recomienda desde el primer día, junto a Origen.
- **Nexo antes que Autómata.** Primero se delega y se supervisa como usuario (Capitán); después se
  construyen flujos y se mete un agente dentro de uno (Autómata 17, Arquitecto). Así los rangos de
  `temas.ts` quedan intactos y se acaba la contradicción entre los dos temarios.
- Horizonte cierra el tramo Capitán. Quien haga Núcleo antes le saca más a su capítulo 3.

## 3. Qué mundo es dueño de cada tema

Dueño = el único que lo enseña. Los demás solo lo usan (`usaConceptos`) con una línea de enlace.

| Tema | Dueño (misión) | Solo enlazan |
|---|---|---|
| Qué es la IA, historia, cómo aprende una máquina | Origen 1 a 11 | Lexia 4, Núcleo 5 |
| Leer titulares y cadenas (lo básico) | Origen 13 | Horizonte cap. 1 (a fondo) |
| Qué es un modelo de lenguaje, tokens, tómbola | Lexia 1 a 3 | Núcleo 12 |
| Cómo se entrena un modelo | Lexia 4 (versión corta) · Núcleo 1 a 8 (a fondo) | Origen 7 |
| Fecha de corte y cuándo busca en internet | Lexia 5 | Forja 6 |
| Ventana de contexto | Lexia 6 | Eco, Forja |
| Memoria entre chats (qué es y qué guardar) | Lexia 7 | Eco 18, Brújula 6 |
| Instrucciones personalizadas y proyectos | Eco 18 | Taller 11 (asistente para otros) |
| Por qué alucina | Lexia 8 | Origen 12 |
| Cómo verificar lo que dice la IA | Eco 7 | Forja 7 (verificar fuentes de una búsqueda), Nexo 14 |
| Cuentas y límites de cálculo | Lexia 9 | Órbita 4 |
| Multimodal (que la IA vea y oiga) | Lexia 11 | Órbita 15, Prisma |
| Marcas, quién es quién y elegir asistente (antiguo Arena) | Lexia 12 a 16 | Forja 1 (familias de herramienta), Nexo 5 |
| Leer el lanzamiento de un modelo | Lexia 15 | Núcleo 9 y proyecto 2, Horizonte 4 (demos físicas) |
| Mapa de modelos abiertos y Latam-GPT | Lexia 14 | Núcleo 4 y 13 |
| Pesos abiertos, licencias, modelo en tu computador | Núcleo 13 | Lexia 14 |
| Escribir prompts (piezas, contexto, forma, técnicas) | Eco | Todos |
| No pegar datos sensibles en un prompt | Eco 8 | Órbita cap. 2 y 3, Forja 13, Lexia 6 |
| Configuración de privacidad (historial, entrenamiento, chat temporal) | Brújula 6 | Lexia 7 |
| Estafas con voz, deepfakes, phishing | Brújula 1 a 4 | Prisma 15, Horizonte 2 |
| Detectar contenido hecho con IA | Brújula 5 | Prisma 16 |
| Etiquetar lo que publicas | Prisma 16 | Brújula 15 |
| Transparencia con clientes, jefes y profes | Brújula 15 | Prisma 16 |
| Derechos de autor | Brújula 12 | Prisma 14 y 16, Núcleo 2 |
| Sesgos | Brújula 10 | Origen 12, Núcleo 4 |
| Decisiones sobre personas | Brújula 11 | Nexo 16, Forja 17 |
| Política de uso de IA en la empresa | Brújula 14 | Forja 17 (solo "¿vale la pena?") |
| Responsabilidad: lo que firmas es tuyo | Brújula 16 | Nexo 16, Forja ("templar") |
| Habeas data (tus derechos) | Brújula 9 | Órbita 6 (reclamos y derecho de petición) |
| Datos de otros que tú recoges (Ley 1581) | Taller 16 | Brújula 7 (fotos y voces), Autómata 16 |
| Aprender con IA y modo tutor | Órbita 12 | Brújula 13 (honestidad académica) |
| Salud, dinero, niños en casa | Órbita cap. 3, cap. 2 y misión 14 | Brújula 7, Horizonte 5 |
| Buscar e investigar, investigación profunda | Forja cap. 2 | Nexo 1 |
| IA dentro de Office y Workspace | Forja 11 | Nexo 6 |
| Plantillas de respuesta a clientes | Forja 5 | Autómata 3 (dispararlas), Taller 11 |
| Fórmulas y analizar datos en una hoja | Forja 12 y 13 | Taller 10 (construir la plantilla) |
| Crear imagen, video, voz y música | Prisma | Lexia 11 |
| Agentes: qué son, conectores, MCP, riesgos, supervisar | Nexo | Autómata 10 y 17, Núcleo 11 |
| Permiso mínimo | Nexo 8 | Autómata 10 |
| ¿Prompt, flujo, agente o a mano? | Nexo 4 | Autómata 1 y 17 |
| Construir un agente dentro de un flujo (sin código) | Autómata 17 | Nexo 15 |
| Flujos: disparador, datos, condiciones, costo por paso | Autómata | Nexo 4 (una pantalla) |
| Llaves de API y secretos | Taller 15 | Autómata 10 |
| Programar con IA y publicar | Taller | Nexo (agentes que programan: solo mención) |
| API y costo por fichas | Núcleo 12 | Lexia 2, Autómata 13, Taller 15 |
| RAG | Núcleo 14 | Taller 11, Forja |
| Ajuste fino | Núcleo 15 | Núcleo 14 |
| Evaluar modelos y armar tu examen | Núcleo 9 y 10 | Lexia 15 y proyecto final |
| Pruebas de seguridad de un bot (equipo rojo) | Núcleo 11 | Horizonte 12 |
| Seguridad de la IA y AGI (debate) | Horizonte 11 y 12 | Origen 3 |
| Empleo | Horizonte cap. 2 | Origen 13 |
| Leyes de IA (UE, EE. UU., Colombia) | Horizonte 9 y 10 | Prisma 16, Brújula 8, 9 y 16 (normas puntuales en la práctica) |
| Energía y ambiente | Horizonte 13 | Origen 7, Núcleo 6 |
| Enterarse de las novedades | Horizonte 16 + Novedades de la semana (Radar) | Lexia 15 |

## 4. Decisiones abiertas para Cami

Juntan y quitan repetidos de las preguntas abiertas de los 11 temarios. Las 8 primeras son las que
más cambian la escuela.

| # | Pregunta | Opciones | Recomendación |
|---|---|---|---|
| 1 | ¿Arena se vuelve el capítulo 4 de Lexia? | (a) Sí; Novedades de la semana sigue como sección viva aparte. (b) Arena sigue como planeta propio (Lexia queda en 12 misiones y falta su temario) | **(a)**, y la zona del capítulo 4 se puede llamar "La Arena" para no perder el nombre. Ojo: cambia lo decidido en 6.1.0 (Arena como planeta). Las 7 lecciones escritas se reciclan en Lexia 12 a 16 |
| 2 | ¿Nexo antes que Autómata, sin tocar los rangos? | (a) Sí, como quedó en esta edición. (b) Bajar Autómata a Capitán | **(a)**. Nexo ya no depende de Autómata, y Autómata 17 construye sobre Nexo |
| 3 | Certificados: ¿gratis o del Club? (Origen, Órbita, Brújula y Forja lo preguntan) | (a) Todos del Club, como dice 6.11. (b) Gratis en los mundos gratis. (c) Gratis en Origen, Órbita y Brújula; Club en el resto | **(c)**: puerta de entrada y protección para todos; el resto sigue siendo razón para el Club. Las insignias de capítulo, siempre gratis |
| 4 | Nombres de los certificados | Hoy: Explorador/a de Origen y de Lexia, Arquitecto/a de Núcleo y Comandante de agentes (chocan con los rangos); Herrero, Director de luz, Jefe de hangar y Constructor de flujos (en masculino); Navegante, Tripulante y Vigía (neutros) | Ningún certificado con nombre de rango y todos neutros: "Certificado de [Mundo]" + una frase de lo que sabe hacer. Si se quieren títulos: Navegante, Tripulante, Vigía y otros así |
| 5 | Laboratorios simulados: "pintor ciego" (Prisma: describe la imagen que saldría y marca lo que inventó), "ensamblador" (Taller: dice qué construiría y qué le falta saber), "droide" (Nexo) y "banda" (Autómata: la IA corre el flujo con casos) | (a) Aprobarlos. (b) Solo calificar el prompt, sin respuesta simulada. (c) Generar imágenes o código de verdad | **(a)**. Son baratos, no dependen de otro proveedor y muestran el efecto de lo que faltó. Probarlos con el modelo del Laboratorio antes de escribir las misiones. En Nexo 9 y en su proyecto final hay que blindar el `sistema` contra la orden escondida que trae el reto |
| 6 | Topes del Laboratorio para labs largos (Autómata 11, 17 y proyecto final; Nexo, proyecto final; retos largos de Núcleo; proyectos finales en general) | (a) El mismo tope para todos. (b) Un campo de "peso" en el paquete (por ejemplo, un lab largo cuenta doble). (c) Acortar los retos | **(b) + (c)**: marcar el peso en el paquete y acortar los retos donde se pueda. Con el tope, pasa a modo simulado, como ya está decidido |
| 7 | Revisión profesional antes de publicar | Salud: Órbita cap. 3 (sobre todo las misiones 10 y 11). Legal: Brújula 8, 9 y 12, Taller 16, Órbita cap. 2, Forja 15 (grabar reuniones). Finanzas: Órbita 4 y 7 | **Sí**, un profesional de salud y un abogado leen esas misiones antes de publicarlas. Confirmar la Línea 192 opción 4 y la Ley 2573 de 2026 en fuente oficial |
| 8 | Imágenes y audio dentro de las misiones (antes/después de Prisma, audio de ejemplo en Prisma 13 y 14, tokenizador de Lexia 2) | (a) Servicio de archivos web ya. (b) Texto y pixel art hechos en código mientras tanto | **(b)** para empezar; el servicio de archivos, cuando se migre Prisma. El tokenizador de Lexia 2, como imagen fija generada una vez |
| 9 | Muestras gratis de los mundos del Club | Taller misión 1 o capítulo 1; Horizonte capítulo 1 | Abrir **Horizonte cap. 1** (protege a cualquiera) y **Taller misión 1** |
| 10 | Onboarding | Mostrar Brújula cap. 1 como recomendado desde el día uno; Órbita como puerta alternativa | **Sí** a las dos |
| 11 | Nuevo valor `inicial: plantilla` en el Laboratorio (prompt a medio llenar para quien nunca ha escrito uno) | Agregarlo o no al molde | **Sí**, para Origen y Órbita |
| 12 | Marcas y casos reales en pantallas vivas (famosos suplantados, robotaxis, costos de entrenar) | Nombrarlos con fuente o solo casos inventados | **Nombrarlos con fuente**, con los mismos criterios para todas las marcas y sin mostrar el video falso |
| 13 | Descargas (protocolo antiestafas, ficha para la cita, plano de Núcleo) | PDF o copiar | Copiar primero; PDF cuando exista la función de descarga |
| 14 | Debates y recordatorios (voto de la comunidad, recordatorio a los 90 días en Horizonte) | Desde el lanzamiento o después | Al principio solo "tu voto"; el recordatorio, cuando haya notificaciones |
| 15 | Temas delicados: imágenes íntimas falsas (Brújula 8), soledad y compañía (Órbita 11), el tono con una persona mayor (Origen 12) | Dejarlos con cuidado o quitarlos | **Dejarlos**, sin detalle gráfico y con enlace a ayuda |
| 16 | Corregir ya la lección vieja `video-con-ia` (dice que Sora cerró en marzo) | Ahora o al migrar | **Ahora**: la app de Sora cerró el 26 de abril de 2026 y la API el 24 de septiembre de 2026 |
| 17 | Cambiar el título de Prisma en `temas.ts` | "Crear imágenes y video con IA" o "... imágenes, video y sonido con IA" | **Cambiarlo**: el capítulo 4 es de audio |

Decisiones menores, con recomendación: Lexia 13 queda como una tabla para todas las marcas, sin
una misión por empresa (las fichas por marca pueden ir al Archivo de Punti). Lexia 5 puede decir la
fecha de corte del modelo del Laboratorio sin nombrar la marca. Latam-GPT tendrá misión propia
cuando haya una forma fácil de probarlo. Forja no suma un capítulo de "IA para emprender" por
ahora. Nexo no tendrá un agente real en un entorno de juguete por ahora. Autómata no hará una
misión con capturas de una herramienta real (solo un `reto-ia` opcional), y su certificado no
dice si el negocio era real. Taller no tendrá galería de proyectos todavía (implica moderación) y
deja Apps Script y macros a Autómata. Núcleo se queda con 15 misiones, cuenta el trabajo de
etiquetado con una protagonista digna y deja el modelo local como `reto-ia` opcional, con otra
evidencia para quien solo tiene celular. Punti Flap se abre desde Origen 10 como enlace a la
sección de juegos. Al escribir Eco 18 hay que darle id a su concepto, porque Taller 11 lo usa.

## 5. Qué cambió en esta edición (resumen)

- **Arena:** los que hablaban del planeta Arena como aparte (Forja, Nexo, Horizonte) ahora
  remiten a Lexia capítulo 4.
- **Dueños únicos** (sección 3). Se reescribieron: Autómata 17 (de "¿Banda o agente?", que repetía
  Nexo 4, a "Un agente en la banda"), Autómata 3 (dispara las respuestas; el texto es de Forja 5),
  Autómata 10 (aplica el permiso mínimo de Nexo y las llaves de Taller), Forja 17 (solo "¿vale la
  pena?"; la política de empresa es de Brújula 14), Brújula 13, laboratorio 1 (la regla del profe;
  el modo tutor es de Órbita 12) y Brújula 15 (solo transparencia en el trabajo; etiquetar es de
  Prisma 16 y las leyes, de Horizonte 9). Se quitó el debate repetido de Brújula 5. Lexia 7 deja la
  configuración de privacidad a Brújula 6.
- **Ruta:** Nexo, Autómata, Taller, Horizonte y Núcleo ya no se contradicen sobre el orden.
- **Conceptos:** ids únicos en toda la escuela (Nexo 16 pasa a `no-se-delega` y Nexo 13 a
  `visto-bueno`; Órbita 1 a `primer-pedido`). Los enlaces usan los ids nuevos, no los de las
  lecciones viejas (`energia-ia`, `sesgo`, `derechos-de-autor-ia`, `seguridad-ia`, `iterar`,
  `forma`).
- **Protagonistas:** se cambiaron 75 nombres para que ningún nombre de pila se repita en la escuela
  ni choque con Eco. Se cambió también el oficio de algunos repetidos entre mundos (taxistas,
  community managers, huevos, emisoras, tamales en Ibagué, óptica).
- **Laboratorios:** nada le pide a la IA datos de hoy. Brújula 4 trae los pasos oficiales en el
  reto; Forja 6 y 8 no inventan enlaces; Órbita 13 no da precios ni horarios como actuales; Nexo 5
  usa tiendas inventadas; Lexia 16 nombra solo las marcas del reto.
- **Forma:** mismas secciones en los 11 temarios, línea "Total", título y línea de rango y acceso
  iguales, sin rayas largas.
- **Datos revisados** en fuentes el 2026-09-24: cierre de Sora (app 26 abr. 2026, API 24 sep.
  2026), Latam-GPT (presentado el 10 feb. 2026, unos 70.000 millones de parámetros), ómnibus de IA
  de la UE (en vigor el 27 jul. 2026; alto riesgo: 2 dic. 2027 y 2 ago. 2028), Ley 2502 de 2025,
  Claude in Chrome (disponible para todos el 26 ago. 2026) y los modelos de Anthropic con la fecha
  de corte de Haiku 4.5 (febrero de 2025). Siguen marcados "confirmar": Ley 2573 de 2026, Línea 192
  opción 4 y el trámite del PL 025/2026.
