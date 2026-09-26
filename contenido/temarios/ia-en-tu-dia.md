# Temario · Órbita (id del mundo: `ia-en-tu-dia`) · PROPUESTA (2026-09-24)

**Orbit · AI in your daily life.** Rango: Explorador. Gratis. Para principiantes absolutos: nadie necesita haber hecho
otro mundo.

Receta principal: **habilidad** (hacer algo útil hoy con la IA gratis que ya tienes).
Receta de apoyo: **criterio** en el capítulo 3 (salud) y en cada misión donde hay que verificar
o saber cuándo **no** usar la IA. Tono: cálido, paso a paso, sin palabras técnicas; cada misión
termina con algo que el piloto usa esa misma semana.

## 1. La historia que cuenta Punti

Órbita no es un planeta: es la **estación espacial** que Punti puso a dar vueltas alrededor de
tu casa. Mientras los otros mundos quedan lejos, Órbita está cerquita: desde sus ventanas se ve
tu cocina, tu billetera, tu consultorio médico, el colegio de tus hijos. Una vuelta completa de
la estación dura un día: mañana, tarde y noche.

- **Metáfora que se repite:** la vuelta del día y los **módulos** de la estación. "Acoplarse" a
  un módulo = empezar un tema de la vida diaria. La **regla de la escotilla**: antes de dejar
  salir algo de la estación (una receta, un presupuesto, un dato de salud) se revisa. Y en cada
  módulo hay una **luz roja**: el momento en que no se le pregunta a la IA sino a una persona
  (técnico, médico, 123).
- Cada misión abre con **una llamada desde la Tierra**: alguien de la vida real que necesita
  una mano con algo de su día.
- Cada capítulo es un módulo de la estación:
  1. **Módulo hogar** (cocina y casa).
  2. **Módulo billetera** (plata y papeles).
  3. **Módulo enfermería** (salud, con luz roja siempre encendida).
  4. **Módulo mirador** (aprender, viajar, familia y que la IA sirva a todos).

## 2. Recetas

| Receta | Dónde | Bloques que manda |
|---|---|---|
| Habilidad | 1–7, 11–15 | `antes-despues`, `laboratorio` ×1–2, `reto-ia` (en la IA gratis del piloto) |
| Criterio | 8–10 y la "luz roja" de cada misión | `caso`, `clasificar` (esto sí / esto a una persona), `punti-se-equivoco` |

Reglas del mundo:
- **Salud y plata: el Laboratorio enseña a pedir con seguridad; nunca da consejo médico ni
  financiero.** El `sistema` de esos Laboratorios le ordena a la IA explicar en general, no
  diagnosticar, no recomendar dosis, productos financieros ni inversiones, y remitir a un
  profesional. La rúbrica revisa el **prompt del piloto** (sin datos personales, pide entender,
  no pide diagnóstico), no la respuesta médica.
- Todos los datos de los retos son inventados (exámenes, facturas, contratos).
- Frontera con Eco: Eco enseña a pedir bien y a no pegar datos sensibles. Órbita **usa** eso en
  la vida diaria con `usaConceptos` y lo recuerda con una línea, sin volver a enseñarlo.

## 3. Mapa del mundo

| Capítulo (módulo) | Misiones | Proyecto del capítulo |
|---|---|---|
| 1 · Módulo hogar · Tu primera vuelta *(Home module · Your first lap)* | 1 ¿Qué cocino hoy? (tu primer pedido real: dar lo que tienes y seguir conversando) · 2 La casa en orden (turnos, rutinas y mercado de la semana) · 3 Arreglos con cuidado (describir el daño, pasos seguros y la luz roja del gas y la luz) | **Semana organizada**: menú de 7 días con lo que hay, lista de mercado y turnos de oficio de tu casa |
| 2 · Módulo billetera · Plata y papeles *(Wallet module · Money and paperwork)* | 4 Tu presupuesto sin datos (cifras redondas, sin cuentas ni bancos) · 5 La letra menuda (entender facturas y contratos tapando tus datos) · 6 El reclamo bien hecho (queja y derecho de petición con plazos) · 7 Comprar con cabeza (entender un crédito o una compra grande antes de firmar) | **Carpeta de trámites**: tu presupuesto + un reclamo listo con marcadores + tus 5 preguntas antes de firmar |
| 3 · Módulo enfermería · Salud con límites *(Sick bay · Health with limits)* | 8 Entender, no diagnosticar (palabras de un examen explicadas, sin tus datos) · 9 Preparar la cita (síntomas en orden y preguntas para el médico) · 10 Luz roja (cuándo no se le pregunta a un chat: urgencias y 123) · 11 Bienestar sin reemplazar a nadie (rutinas, compañía y límites) | **Ficha para la cita**: plantilla reutilizable con marcadores para llevar al médico |
| 4 · Módulo mirador · Aprender, viajar y familia *(Lookout · Learning, travel and family)* | 12 Aprende lo que quieras (la IA como tutor paciente) · 13 Viajar con plan B (itinerario con presupuesto y todo confirmado) · 14 Niños e IA en casa (edad, compañía y fotos) · 15 La IA para todos (leer, dictar, lectura fácil: que sirva a quien más lo necesita) | **Proyecto final · Tu manual de Órbita**: 5 usos de IA para tu casa, cada uno con su regla de escotilla y su luz roja. Da el certificado de Órbita |

Total: 4 capítulos, 15 misiones, 3 proyectos de capítulo y 1 proyecto final.

## 4. Las misiones

### Capítulo 1 · Módulo hogar · Tu primera vuelta

**1 · ¿Qué cocino hoy?** · *What should I cook today?*
- Concepto: `primer-pedido` · Receta: habilidad. Es la puerta de entrada de quien nunca ha
  usado IA: incluye una `transmision` de "dónde está la IA gratis en tu celular" (neutral entre
  marcas) y el ciclo **pedir → ajustar → revisar**.
- Protagonista: **Don Aurelio**, 58, celador de un edificio en Bogotá, turno de noche. Tiene
  tres huevos, media cebolla, arroz de ayer y 20 minutos.
- Laboratorio 1: pedir una receta. Rúbrica: (a) dice **lo que hay** en la nevera; (b) dice **el
  tiempo o los utensilios**; (c) dice **algo de quien come** (gusto, restricción) (no cuenta
  "dame una receta").
  Laboratorio 2 (inicial `anterior`): pedir un ajuste ("sin horno", "que alcance para dos").
- Luz roja: alergias y dietas médicas se confirman con el médico, no con la receta.
- Cruce: usa `pedido-completo` e `iterar` de Eco (misiones 2 y 5), que son dueñas de la técnica. Aquí
  se da solo el ciclo en una pantalla para quien entra por Órbita sin haber pasado por Eco.

**2 · La casa en orden** · *A tidy home*
- Concepto: `organizar-la-casa` · Receta: habilidad.
- Aprende: pedir tablas y listas (turnos, rutina de la mañana, mercado agrupado por pasillo o
  por tienda), con las reglas reales de la casa.
- Protagonista: **Marleny**, operaria de confecciones en Itagüí, sola con tres hijos
  adolescentes que "nunca saben a quién le toca".
- Laboratorio: pedir la tabla de turnos. Rúbrica: (a) dice **quiénes y qué horarios**;
  (b) dice **las tareas**; (c) pide **forma de tabla** y que sea justa en carga (no cuenta
  "organízame la casa").
- Bloques clave: `antes-despues`, `reto-ia` (pegar la tabla en la nevera o en el grupo familiar).

**3 · Arreglos con cuidado** · *Careful home fixes*
- Concepto: `arreglos-seguros` · Receta: habilidad + criterio.
- Aprende: describir bien el daño (o mandar foto, si la app lo permite), pedir pasos y
  materiales, y la luz roja: gas, electricidad, estructura y alturas son para un técnico.
- Protagonista: **Abel**, conductor de bus intermunicipal en Tuluá. El lavaplatos gotea y el
  fin de semana es su único día libre.
- Laboratorio: pedir ayuda con la gotera. Rúbrica: (a) **describe el daño** (dónde, desde
  cuándo, qué ve); (b) pide **materiales y pasos numerados**; (c) pide **cuándo parar y llamar
  a un técnico**.
- Bloques clave: `clasificar` (lo hago yo / llamo al técnico), `caso` (huele a gas).

**Proyecto 1 · Semana organizada.** Con la IA, el piloto arma su menú de 7 días con lo que hay
y su presupuesto, la lista de mercado y los turnos de su casa. Rúbrica: datos reales de su casa,
sin datos personales; una revisión propia marcada ("cambié esto porque…").

### Capítulo 2 · Módulo billetera · Plata y papeles

Aviso fijo del módulo: "Punti no es asesor financiero ni abogado. La IA te ayuda a entender y a
redactar; la decisión es tuya". Nunca van números de cuenta, cédula, claves ni fotos de
documentos (recordatorio de Eco 8).

**4 · Tu presupuesto sin datos** · *A budget without personal data*
- Concepto: `presupuesto` · Receta: habilidad.
- Aprende: dar cifras redondas y categorías, pedir una tabla, pedir dónde ajustar, y revisar
  las sumas uno mismo (la IA se equivoca en cuentas; el porqué está en Lexia 9).
- Protagonista: **Karen**, 24, mesera en Santa Marta, con su primer sueldo fijo y propinas que
  cambian.
- Laboratorio: pedir el presupuesto. Rúbrica: (a) da **ingresos y gastos en cifras redondas**;
  (b) **no** incluye banco, cuenta ni nombres; (c) pide **revisar las sumas** o una columna para
  verificarlas. `sistema`: sin recomendar productos financieros.
- Bloques clave: `punti-se-equivoco` (Punti suma mal), `clasificar` (dato que sirve / dato que
  no se pega).

**5 · La letra menuda** · *The fine print*
- Concepto: `entender-documentos` · Receta: habilidad.
- Aprende: copiar solo las cláusulas o los cobros (sin nombre, dirección ni número de cliente),
  pedir explicación en palabras simples y las preguntas que conviene hacer antes de firmar.
- Protagonista: **Don Rubén**, zapatero en el barrio Restrepo de Bogotá. Le mandan un contrato
  de arriendo del local de ocho páginas.
- Laboratorio: el reto trae **tres cláusulas inventadas**. Rúbrica: (a) pide **explicación
  simple** de cada una; (b) pide **qué le conviene preguntar** al arrendador; (c) pide que
  marque **lo que debería ver un abogado** (no cuenta "¿firmo o no?").

**6 · El reclamo bien hecho** · *A complaint done right*
- Concepto: `reclamo-formal` · Receta: habilidad.
- Aprende: hechos en orden, qué pides, pruebas y plazo. En Colombia el derecho de petición
  tiene, por regla general, 15 días hábiles de respuesta; las empresas de servicios públicos
  también tienen plazo para responder reclamos. La IA redacta, tú revisas y radicas.
- Protagonista: **Doña Gladys**, 70, maestra pensionada en Montería. La factura de energía llegó
  al doble sin razón.
- Laboratorio: pedir el reclamo con marcadores. Rúbrica: (a) usa **[NOMBRE], [CONTRATO]** en
  vez de datos; (b) cuenta **hechos con fechas y valores**; (c) dice **qué pide** concretamente
  (revisión y ajuste) y **pide respuesta por escrito**.
- Cruce: Brújula 9 hace la carta de habeas data (datos personales); aquí, servicios y trámites.

**7 · Comprar con cabeza** · *Buy with your head*
- Concepto: `entender-credito` · Receta: habilidad + criterio.
- Aprende: pedirle a la IA que explique conceptos (cuota, interés, tasa efectiva anual, seguro,
  costo total) con **números de ejemplo**, y confirmar la tasa real con la entidad. La IA puede
  tener datos viejos; no elige por ti.
- Protagonista: **Jefferson**, ayudante de construcción en Soacha. En el almacén le ofrecen un
  celular "a solo 12 cuotas".
- Laboratorio: el reto trae **una oferta inventada**. Rúbrica: (a) pide **el costo total**
  comparado con el precio de contado; (b) pide **qué preguntar** en el almacén (tasa, seguros,
  qué pasa si se atrasa); (c) no pide "¿cuál me conviene?" ni recomendación de entidad.
  `sistema`: explica con los números del reto, no recomienda ni opina sobre entidades.
- Bloques clave: `caso` (firmar hoy / pedir la hoja de condiciones / esperar), `pantalla-viva`
  (tasa de usura vigente).

**Proyecto 2 · Carpeta de trámites.** Presupuesto del mes + un reclamo real del piloto con
marcadores + sus 5 preguntas antes de firmar cualquier cosa. Se guarda en la Bitácora.

### Capítulo 3 · Módulo enfermería · Salud con límites

Aviso fijo del módulo: "Esto no es consejo médico. La IA te ayuda a entender y a preguntar
mejor; quien decide es tu médico". La luz roja está siempre visible en este módulo: urgencias,
123.

**8 · Entender, no diagnosticar** · *Understand, don't diagnose*
- Concepto: `entender-salud` · Receta: criterio + habilidad.
- Aprende: la IA puede explicar palabras y rangos en general; no puede diagnosticarte ni
  cambiar un tratamiento; puede sonar muy segura y equivocarse; se pregunta sin nombre, cédula
  ni EPS.
- Protagonista: **Doña Stella**, 61, vende lotería en Popayán. Le llegaron los exámenes con
  "colesterol HDL" y "triglicéridos", y la cita es en tres semanas.
- Laboratorio: el reto trae **términos inventados de un examen, sin valores personales**.
  Rúbrica: (a) pide **explicar el término** en palabras simples; (b) **no** pide diagnóstico ni
  "¿estoy enferma?"; (c) pide **preguntas para llevarle al médico**. `sistema`: explica en
  general, no interpreta resultados de una persona, no recomienda medicamentos ni dosis, remite
  al médico.
- Bloques clave: `clasificar` (esto sí se le pregunta / esto no), `punti-se-equivoco` (Punti
  "diagnostica" con seguridad).

**9 · Preparar la cita** · *Prepare for the appointment*
- Concepto: `preparar-cita` · Receta: habilidad.
- Aprende: ordenar síntomas (cuándo empezó, qué lo mejora o empeora, qué ha tomado), preparar
  preguntas y llevar la lista; la IA no reemplaza la consulta.
- Protagonista: **Hugo**, pescador en Tumaco. Lleva tres semanas con dolor en la rodilla y
  siempre se le olvida qué decir en la cita.
- Laboratorio: pedir una **plantilla** para organizar lo que va a contar. Rúbrica: (a) pide
  **campos** (inicio, frecuencia, qué ha tomado, preguntas); (b) **no** pide saber qué tiene;
  (c) pide que sea **corta, para una hoja**.

**10 · Luz roja** · *Red light*
- Concepto: `luz-roja` · Receta: criterio.
- Aprende: señales de urgencia (dolor en el pecho, dificultad para respirar, desmayo, señales
  de derrame, pensamientos de hacerse daño) no se consultan con un chat: se llama al 123 o se
  va a urgencias; para salud mental hay línea de orientación nacional (Línea 192, opción 4,
  confirmar vigencia).
- Protagonista: **Rosa**, manicurista a domicilio en Sincelejo, que cuida a su papá con
  diabetes.
- Sin Laboratorio de salud (a propósito). Bloques: `caso` (el papá amanece confundido: Rosa
  escribe al chat / llama al 123 / espera), `clasificar` (chat / médico en cita / urgencias
  ya), `reto-ia`: armar con la IA una **tarjeta de emergencia para la nevera** con marcadores
  ([EPS], [ALERGIAS], [MEDICAMENTOS]) que la familia llena a mano.
- Tono: calmado, sin detalles gráficos. Revisión de un profesional de salud antes de publicar.

**11 · Bienestar sin reemplazar a nadie** · *Wellbeing without replacing anyone*
- Concepto: `bienestar-y-limites` · Receta: criterio + habilidad.
- Aprende: la IA puede ayudar con rutinas generales (pausas, sueño, recordatorios, ideas de
  comidas) y a veces se siente como compañía; no es un terapeuta ni un amigo, y si te sientes
  mal de verdad se habla con una persona.
- Protagonista: **Jairo**, 45, camionero que hace la ruta Bogotá–Buenaventura y conversa con la
  IA en las noches largas.
- Laboratorio: pedir una **rutina de pausas y descanso** para viajes largos. Rúbrica: (a) da
  **horarios reales** del viaje; (b) pide cosas **generales** (no medicamentos ni
  estimulantes); (c) pide incluir **cuándo parar y buscar ayuda**. `sistema`: bienestar general,
  sin consejos médicos.
- Bloques clave: `caso` (la IA como única compañía), `transmision` sobre por qué la IA "siempre
  te da la razón".

**Proyecto 3 · Ficha para la cita.** Plantilla reutilizable (misión 9 mejorada) + tarjeta de
emergencia (misión 10). Todo con marcadores; se descarga o se copia.

### Capítulo 4 · Módulo mirador · Aprender, viajar y familia

**12 · Aprende lo que quieras** · *Learn anything*
- Concepto: `tutor-ia` · Receta: habilidad.
- Aprende: pedir explicación "como si tuviera 12 años" y luego subir el nivel, pedir preguntas
  de práctica, conversar para practicar un idioma, modo socrático.
- Protagonista: **Luz Dary**, 52, cocinera de un restaurante en Villa de Leyva que quiere
  atender a los turistas en inglés.
- Laboratorio: pedir una **práctica de conversación**. Rúbrica: (a) dice **su nivel y para
  qué** (atender mesas); (b) pide que la IA haga **un papel** (turista) y **una frase a la vez**;
  (c) pide **corrección amable** al final.
- Cruce: Órbita es dueña de aprender con IA y del modo tutor (`tutor-ia`). Brújula 13 trata
  honestidad académica y la usa; "Dale un papel" es Eco 14. Aquí se usa, no se enseña de nuevo.

**13 · Viajar con plan B** · *Travel with a plan B*
- Concepto: `planear-viaje` · Receta: habilidad + criterio.
- Aprende: itinerario con presupuesto, ritmo de la familia y un plan B por lluvia; todo lo que
  cambia (precios, horarios, requisitos de entrada, si un lugar sigue abierto) se confirma en la
  fuente oficial antes de salir.
- Protagonista: **Yeimi**, enfermera jefe en Cúcuta, planea cuatro días en San Andrés con su
  mamá, que camina despacio.
- Laboratorio: pedir el itinerario. Rúbrica: (a) dice **días, presupuesto y quiénes van** (con
  sus necesidades); (b) pide **plan B**; (c) pide **una lista de lo que hay que confirmar**
  (no cuenta pedir precios "exactos"). `sistema`: no da precios, horarios ni requisitos como
  actuales (sus datos tienen fecha de corte) y marca todo lo que se debe confirmar.
- Bloques clave: `punti-se-equivoco` (Punti recomienda un lugar que cerró y un requisito viejo).

**14 · Niños e IA en casa** · *Kids and AI at home*
- Concepto: `ninos-e-ia` · Receta: criterio.
- Aprende: edades mínimas de las apps, que usen IA cerca de un adulto, controles para padres,
  dos ideas para enseñarles (la IA se equivoca; la IA no es una persona), y nada de cara,
  uniforme ni colegio en apps de IA.
- Protagonista: **Doña Ofelia**, vende tamales los domingos en Ibagué y cría a su nieto de 9
  años, que ya le pregunta todo a un chatbot.
- Laboratorio: pedir a la IA **tres reglas de la casa** explicadas para un niño de 9 años.
  Rúbrica: (a) incluye **usar IA cerca de un adulto**; (b) incluye **no dar datos** (nombre
  completo, colegio, dirección, fotos); (c) incluye **"la IA se equivoca, pregunta a un
  adulto"**, en lenguaje de niño.
- Bloques clave: `pantalla-viva` (edades y controles por app).
- Cruce: Brújula 7 trata el consentimiento con fotos de otros en general.

**15 · La IA para todos** · *AI for everyone*
- Concepto: `accesibilidad` · Receta: habilidad.
- Aprende: dictar en vez de escribir, pedir que lea en voz alta, describir una foto, subtítulos,
  y reescribir textos difíciles en **lectura fácil** para quien lo necesite (adultos mayores,
  poca lectura, baja visión).
- Protagonista: **Martín**, masajista con baja visión en Bucaramanga, que ayuda a su mamá a
  entender las cartas de la EPS.
- Laboratorio: el reto trae **una carta inventada de una EPS**, llena de términos. Rúbrica:
  (a) pide **lectura fácil** (frases cortas, palabras comunes); (b) pide **qué tiene que hacer
  su mamá y hasta cuándo**; (c) pide **no cambiar datos** ni fechas del original.
- Cruce: Lexia (multimodal: ver, oír y hablar) explica cómo funciona; Prisma crea voz. Aquí
  solo el uso diario.

## 5. Proyecto final y certificado

**Tu manual de Órbita** (*Your Orbit handbook*, 20–30 min). El piloto elige 5 usos de IA para
su vida (de las misiones o propios) y, para cada uno, escribe con la IA: el prompt que le
funciona (guardado en Mis prompts), su **regla de escotilla** (qué revisa antes de usar el
resultado) y su **luz roja** (cuándo va a una persona). Rúbrica: 5 usos concretos, cada uno con
regla y luz roja; ninguno con datos personales; al menos uno de billetera o enfermería con su
aviso. Da el **certificado de Tripulante de Órbita** (*Orbit Crew*). Si el certificado es gratis
o del Club, ver pregunta 1.

## 6. Lecciones viejas que se reciclan

| Lección vieja | Alimenta | Qué se toma |
|---|---|---|
| `viajes-cocina-y-hogar` | 1, 2, 3, 13 | La nevera con tres huevos, fotos para arreglos, "gas y luz: técnico", regla de oro de confirmar |
| `dinero-y-tramites` | 4, 5, 6, 7 | Presupuesto con cifras redondas, tapar datos, derecho de petición (15 días hábiles), lista roja |
| `salud-con-ia` | 8, 9, 10 | Qué sí y qué no, preguntar sin datos, preparar la cita, "suena segura y se equivoca" |
| `estudiar-con-ia` | 12 | "Como si tuviera 12 años", modo socrático, modos tutor de las apps |
| `ninos-familia-e-ia` | 14 | Edades mínimas, adulto cerca, las dos ideas, fotos y uniforme |
| `multimodal` (Lexia) | 15 | Solo como cameo: dictado, cámara y voz |

Las misiones 11 y 15 son nuevas.

## 7. Datos que envejecen (VOLÁTILES)

Regla: todo lo de esta lista va en `fuentes` con fecha o en `pantalla-viva` (`vivo: true`,
`revisado`). Nunca en una respuesta correcta de `punto-control`.

| Dato | Misión | Estado verificado al 2026-09-24 |
|---|---|---|
| Dónde está la IA gratis y qué hace cada app (fotos, voz, modos tutor, controles para padres) | 1, 3, 12, 14, 15 | Cambia por app y por mes: se nombran varias marcas por igual |
| Edades mínimas de las apps de IA | 14 | Según las fuentes de la lección vieja (sep. 2026); varían por país |
| Derecho de petición: 15 días hábiles por regla general (Ley 1755 de 2015) | 6 | Vigente |
| Plazos de reclamos de servicios públicos (Ley 142 de 1994) | 6 | Confirmar redacción con fuente oficial antes de publicar |
| Tasa de usura (la certifica la Superintendencia Financiera cada mes) | 7 | Cambia cada mes: solo pantalla viva con enlace oficial |
| Línea 123 (emergencias) | 10 | Vigente |
| Línea 192, opción 4 (orientación en salud mental, MinSalud) | 10, 11 | Fuentes de 2020–2021: **confirmar que sigue activa** antes de publicar |
| Requisitos para viajar a San Andrés y precios de ejemplo | 13 | Cambian: el reto no usa cifras reales |

## 8. Requisitos y lugar en la ruta

- **No pide nada.** Órbita puede ser el **primer mundo** de alguien que nunca ha usado IA: la
  misión 1 enseña dónde encontrarla y el ciclo pedir-ajustar-revisar.
- Recomendado en paralelo: Origen misión 1 (qué es la IA) y Eco capítulo 1 (hablarle claro).
  Antes del capítulo 2 conviene Eco 8 (lo que no se transmite); si el piloto no lo hizo,
  Órbita lo recuerda en una línea y enlaza.
- Rango: **Explorador** (fila MUNDO de `punti-44-lecciones-nuevas.tsv`). Gratis: no está entre los
  mundos del Club (decisión 6.9).
- Lugar en la ruta recomendada: cuarto mundo, después de Eco; o **puerta alternativa** para quien
  nunca ha usado IA y quiere algo útil desde el primer día (ver `INDICE.md`).
- Hacia adelante: Brújula (estafas y privacidad a fondo), Forja (la IA en el trabajo), Prisma
  (fotos y voz).
- Órbita no enseña: prompts como técnica (Eco), estafas (Brújula 1–4), privacidad de la app
  (Brújula 6), honestidad académica (Brújula 13), cómo funciona la IA multimodal (Lexia).

## 9. Preguntas abiertas para Cami

1. **Certificado de Órbita.** Órbita ya es gratis (no está en la lista del Club de 6.9). Queda la
   pregunta de si su certificado también es gratis. Consolidada en `INDICE.md`.
2. ¿Orden en el mapa? El rango ya es Explorador. Propuesta: cuarto en la ruta y, además, puerta de
   entrada alternativa en el onboarding ("¿nunca has usado IA? empieza aquí").
3. El capítulo 3 (salud) pide revisión de un profesional de salud antes de publicar. ¿Tienes a
   alguien? Mismo punto para un abogado o contador en el capítulo 2.
4. Misión 11 toca soledad y compañía con IA. ¿La dejamos (propuesta: sí, con tono cuidadoso y
   la línea de orientación) o la cambiamos por "rutinas y hábitos" sin ese tema?
5. ¿La tarjeta de emergencia y la ficha para la cita se descargan en PDF (necesita la función
   de descarga) o solo se copian?
6. Las marcas y regiones de los protagonistas: ¿quieres más de la costa, del Pacífico o del
   campo en algún mundo en particular?

## Fuentes (consultadas el 2026-09-24)

- Derecho de petición (Ley 1755 de 2015): https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=65334
- Línea 123: https://bogota.gov.co/mi-ciudad/seguridad/para-que-sirve-la-linea-123-de-emergencias-y-cuando-llamar-en-bogota
- Línea 192, opción 4 (MinSalud): https://www.minsalud.gov.co/Paginas/Mas-de-18-mil-atenciones-en-salud-mental-en-opcion-4-de-Linea-192.aspx
- Políticas de uso (salud, consejo profesional): https://openai.com/policies/usage-policies/
- Edades mínimas y controles para padres: https://help.openai.com/en/articles/8313401-is-chatgpt-safe-for-all-ages · https://openai.com/index/introducing-parental-controls/ · https://support.google.com/gemini/answer/16109150?hl=en · https://www.anthropic.com/legal/consumer-terms
- Modos tutor: https://openai.com/index/chatgpt-study-mode/ · https://techcrunch.com/2025/08/06/google-takes-on-chatgpts-study-mode-with-new-guided-learning-tool-in-gemini/ · https://www.engadget.com/ai/anthropic-brings-claudes-learning-mode-to-regular-users-and-devs-170018471.html
- Resto: `contenido/fuentes-44-lecciones.md`.
