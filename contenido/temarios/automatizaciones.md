# Temario · Autómata (id del mundo: `automatizaciones`) · PROPUESTA (2026-09-24)

**Automaton · Automations.** Rango: Arquitecto. Gratis.

Idea que ordena todo el mundo: **un flujo automático es una receta fija**. Tú decides los pasos una
vez y la máquina los repite igual cada vez. La IA puede ser una estación de la banda (lee, clasifica,
resume, redacta), pero no decide qué pasos seguir. Cuando la IA decide los pasos, ya es un agente, y
eso se enseña en Nexo, que va antes de Autómata en la ruta recomendada. Aquí, en la misión 17, el
piloto aprende a meter un agente dentro de una banda sin perder el control.

## 1. La historia que cuenta Punti

**Autómata es el planeta-fábrica.** Punti lo construyó para dejar de hacer a mano lo que se repite:
todo el planeta es una red de **bandas transportadoras** que cruzan valles y montañas. En cada banda
hay un **sensor** al comienzo (el disparador: "llegó un pedido") y **estaciones** a lo largo del
camino (las acciones: "anótalo en la hoja", "avísale al dueño"). Las cajas que viajan en la banda son
los **datos**. En algunas estaciones hay un **cerebro** (la IA) que abre la caja, entiende lo que hay
adentro y le pega una etiqueta, pero nunca cambia el recorrido de la banda.

Metáfora que se repite en todas las misiones: **sensor → banda → estaciones → caja que llega**.
Cada misión abre con Punti en la fábrica: "Se trabó una banda en el valle de los pedidos", "Llegó una
caja rara que nadie sabe dónde poner".

Las zonas del planeta (capítulos):

| Zona | Qué hay ahí | Lo que aprende el piloto |
|---|---|---|
| 1 · La sala de engranajes | Las primeras bandas, las más sencillas | Qué es un flujo: disparador, acciones, datos y condiciones |
| 2 · La estación del cerebro | Las estaciones con IA | Poner la IA dentro de un flujo sin que se desboque |
| 3 · El banco de pruebas | El taller donde se prueban las máquinas antes de soltarlas | Probar, arreglar lo que se rompe, calcular costos y elegir herramienta |
| 4 · La torre de control | Desde arriba se ve toda la fábrica | Criterio: qué no automatizar, cuidar los datos de otros y cómo meter un agente en la banda |

## 2. Recetas

Recetas principales: **construcción** (el piloto arma un flujo, pieza por pieza) con **concepto** en
el capítulo 1, **mercado** en las misiones de herramientas y costos, y **criterio** en el capítulo 4 (salvo la
misión 17, que es construcción).

## 3. Mapa del mundo

| Capítulo (zona) | Misiones | Proyecto del capítulo |
|---|---|---|
| **1 · La sala de engranajes · Qué es un flujo** (*The gear room · What a flow is*) | 1 La tarea que se repite (reconocer qué vale la pena automatizar) · 2 Sensor y estación (todo flujo es disparador + acciones) · 3 Engranajes que ya tienes (usar las automatizaciones que ya traen WhatsApp Business, el correo y el calendario) · 4 Las cajas viajan (los datos pasan de un paso al siguiente) · 5 Si pasa esto, haz aquello (condiciones y caminos) | **Mapa de tareas:** cinco tareas repetidas de tu semana, una elegida y su flujo escrito completo (disparador, datos, condición, acciones) |
| **2 · La estación del cerebro · La IA dentro del flujo** (*The brain station · AI inside the flow*) | 6 El paso que piensa (qué trabajos le tocan a la IA dentro de un flujo) · 7 Un prompt que nadie revisa (instrucciones cerradas y a prueba de sorpresas) · 8 Del desorden a la tabla (sacar datos de un mensaje libre) · 9 Borrador, no envío (la persona aprueba antes de salir) · 10 Conectar la IA con tus apps (cuentas, permisos y llaves) | **Tu primer flujo con cerebro:** el flujo completo de un negocio, con su prompt, su condición y su punto de aprobación humana, probado en el Laboratorio con tres mensajes reales inventados |
| **3 · El banco de pruebas · Probar, arreglar y costear** (*The test bench · Test, fix and cost*) | 11 Pruébalo antes de soltarlo (casos normales, raros y vacíos) · 12 Cuando la banda se traba (errores, avisos e historial) · 13 ¿Cuánto cuesta esta máquina? (contar pasos, ejecuciones y llamadas a la IA) · 14 Elegir herramienta (criterios que no envejecen) | **Ficha técnica del flujo:** plan de pruebas de seis casos, plan B manual y costo mensual estimado del flujo del capítulo 2 |
| **4 · La torre de control · Automatizar con criterio** (*The control tower · Automating with judgment*) | 15 Lo que no se automatiza (el desorden, lo delicado y lo que pasa una vez) · 16 Las cajas de otros (datos de clientes en el flujo) · 17 Un agente en la banda (un paso con agente dentro de un flujo fijo, con límites y visto bueno) | **Proyecto final · La máquina de tu negocio.** Da el certificado de Autómata |

Total: 4 capítulos, 17 misiones, 3 proyectos de capítulo y 1 proyecto final. Misiones de unos 8 a 10 minutos.

## 4. Las misiones

Cada fila: id del concepto (alimenta el Repaso del día), receta, idea del Laboratorio (lo que
escribe el piloto y lo que revisa la rúbrica, incluido **lo que no cuenta**) y protagonista.
Los laboratorios están pensados para una IA de texto en vivo: el piloto describe un flujo o escribe el
prompt de la estación de IA, y el modelo lo "corre" con datos de ejemplo.

### Capítulo 1 · La sala de engranajes

| # | Misión (ES / EN) | Concepto · receta | Laboratorio | Protagonista y escena |
|---|---|---|---|---|
| 1 | La tarea que se repite / *The task that repeats* | `tarea-repetitiva` · concepto | El piloto describe una tarea de su semana en una frase y la IA le pregunta qué tan seguido pasa, cuánto tarda y si siempre se hace igual. **Rúbrica:** nombra una tarea concreta, dice cada cuánto pasa y si los pasos son siempre los mismos. No cuenta "ahorrar tiempo" ni "ser más productivo" sin una tarea. | **Don Albeiro**, 58, reparte agua en botellón en Tunja: copia a un cuaderno los pedidos que le llegan por WhatsApp y cada viernes se le pierde alguno |
| 2 | Sensor y estación / *Sensor and station* | `disparador-accion` · concepto | Escribe un flujo en la forma "Cuando…, entonces…" para agendar citas. La IA lo repite como banda (sensor → estaciones) y lo "corre" con un ejemplo. **Rúbrica:** hay un disparador que es un hecho que pasa (llega, se llena, es tal hora) y al menos una acción concreta. No cuenta como disparador un deseo ("cuando quiera") ni una acción vaga ("organizar todo"). | **Sharon**, 24, estudio de tatuajes en Barranquilla: la gente pide cita por Instagram y ella confirma una por una a medianoche |
| 3 | Engranajes que ya tienes / *Gears you already own* | `automatizacion-integrada` · habilidad | Con los datos de un negocio y cuatro situaciones (primer mensaje de un cliente, mensaje fuera de horario, pregunta repetida, pedido confirmado), el piloto dice qué automatización de la app usa en cada una (bienvenida, ausencia, respuesta rápida, etiqueta) y escribe el mensaje de ausencia; la IA lo corre con tres mensajes y dice qué queda sin cubrir. **Rúbrica:** cada situación va con la automatización que la dispara; el mensaje de ausencia dice horario real y cuándo se responde. No cuenta un saludo genérico sin datos. El texto de las respuestas base es de Forja 5 (`respuesta-plantilla`); aquí se aprende a dispararlas. Cierra con `reto-ia`: activar uno de verdad (opcional). | **Doña Omaira**, 66, hace lechona por encargo en El Espinal (Tolima): el sábado en la noche le escriben 40 personas lo mismo |
| 4 | Las cajas viajan / *The boxes travel* | `datos-del-flujo` · construcción | Con un formulario de inscripción (nombre, nivel, horario), escribe el mensaje de bienvenida que el flujo manda, usando los campos entre corchetes: "Hola [nombre]…". La IA lo llena con tres inscritos de ejemplo. **Rúbrica:** usa al menos dos campos del formulario en el lugar correcto y el texto sirve para cualquier inscrito. No cuenta escribir un nombre fijo ("Hola Laura") ni un campo que el formulario no pide. | **Samuel**, 31, profe de inglés particular en Bucaramanga: copia a mano cada inscripción del formulario a su hoja y a un correo |
| 5 | Si pasa esto, haz aquello / *If this, then that* | `condicion` · construcción | Agrega una condición a un flujo de pedidos: si el pedido pasa de cierto valor, el domicilio es gratis y se avisa distinto. La IA lo corre con tres pedidos. **Rúbrica:** la condición se puede comprobar con un dato (valor, zona, hora) y dice qué pasa en los dos caminos, el sí y el no. No cuenta una condición de juicio ("si es buen cliente") ni olvidar el camino del no. | **Maribel**, vivero de plantas en Rionegro (Antioquia): los pedidos grandes y los pequeños necesitan pasos distintos |
| P1 | Mapa de tareas / *Task map* | proyecto | Lista cinco tareas, elige una y escribe su flujo completo. La IA revisa que tenga disparador, datos, condición y acciones, y lo corre con un caso. | El piloto (ejemplo de muestra: una lavandería de barrio) |

### Capítulo 2 · La estación del cerebro

| # | Misión (ES / EN) | Concepto · receta | Laboratorio | Protagonista y escena |
|---|---|---|---|---|
| 6 | El paso que piensa / *The step that thinks* | `paso-de-ia` · concepto | Dado un flujo sin IA, el piloto decide dónde va la estación de IA y qué trabajo hace (clasificar, resumir, sacar datos o redactar). **Rúbrica:** elige un trabajo que una regla fija no puede hacer (entender texto libre) y deja fijos los pasos que no necesitan IA. No cuenta poner IA en un paso que es copiar un dato tal cual. | **Tania**, fundación de rescate de perros en Cali: los mensajes mezclan "quiero adoptar", "quiero donar" y "encontré un perro" |
| 7 | Un prompt que nadie revisa / *A prompt nobody checks* | `prompt-cerrado` · habilidad | Escribe el prompt de la estación que clasifica documentos: opciones cerradas, una sola palabra de respuesta y qué hacer si no está claro. La IA lo corre con cinco documentos de ejemplo, dos ambiguos. **Rúbrica:** lista cerrada de categorías; formato exacto de salida; instrucción para el caso dudoso ("responde REVISAR"). No cuenta "clasifícalo bien" ni dejar la salida libre. Segundo lab (`inicial: anterior`): ajustar el prompt cuando llega un documento que no encaja. | **Patricia**, contadora independiente en Manizales: sus clientes le mandan facturas, extractos y fotos de recibos al mismo correo |
| 8 | Del desorden a la tabla / *From mess to table* | `extraer-datos` · habilidad | Escribe el prompt que saca de un mensaje de WhatsApp los campos de un pedido (quién, qué, cuántos, para cuándo, dirección) y deja vacío lo que no viene. La IA lo corre con tres mensajes reales inventados, uno con audio transcrito. **Rúbrica:** nombra los campos exactos; pide dejar vacío o marcar lo que falta en vez de adivinarlo; formato fijo (una línea por campo o tabla). No cuenta pedir "un resumen del pedido". | **Luis Fernando**, panadería en Pasto que hace desayunos para empresas: los pedidos llegan como "lo mismo de la otra vez pero para 30" |
| 9 | Borrador, no envío / *Draft, don't send* | `aprobacion-humana` · criterio | Diseña el tramo del flujo donde la IA redacta la respuesta a una reseña o reserva y la persona la aprueba. La IA muestra cómo se vería el aviso de aprobación. **Rúbrica:** el flujo se detiene antes de enviar; dice quién aprueba y por dónde le llega; dice qué mensajes sí pueden salir solos (por ejemplo, una confirmación con datos fijos). No cuenta "la IA responde a todos automáticamente". Incluye `caso`: una respuesta automática a una reseña de una clienta molesta. | **Angélica**, hostal familiar en Salento (Quindío): responde reseñas y reservas en tres plataformas |
| 10 | Conectar la IA con tus apps / *Connecting AI to your apps* | `cuenta-conectada` (usa `permiso-minimo` de Nexo 8 y `llaves-y-secretos` de Taller 15) · concepto | El piloto escribe qué cuentas conectaría para un flujo (Instagram, hoja, correo), con qué permiso cada una y **a nombre de quién** queda cada conexión; la IA le señala los permisos de más y qué pasa si esa persona se va o cambia la clave. **Rúbrica:** para cada app dice si necesita leer o también escribir, y no pide más de lo que el flujo usa; dice quién es dueño de la conexión y quién la revisa. No cuenta "darle acceso a todo para que funcione". El permiso mínimo y las llaves se repasan en una pantalla, sin volver a enseñarlos. | **Dairo**, 22, vende ropa deportiva por Instagram en Medellín: una herramienta le pide permiso para "administrar tu cuenta" |
| P2 | Tu primer flujo con cerebro / *Your first flow with a brain* | proyecto | Flujo completo de un negocio (el suyo o uno de muestra): disparador, prompt de la estación de IA, condición, acciones y punto de aprobación. La IA lo corre con tres mensajes inventados y el piloto ajusta. | El piloto (muestra: una tienda de repuestos de moto) |

### Capítulo 3 · El banco de pruebas

| # | Misión (ES / EN) | Concepto · receta | Laboratorio | Protagonista y escena |
|---|---|---|---|---|
| 11 | Pruébalo antes de soltarlo / *Test it before you let it go* | `casos-de-prueba` · habilidad | Escribe cinco mensajes de prueba para un flujo de pedidos: uno normal, uno incompleto, uno con emojis o audio, uno que no es un pedido y uno en broma. La IA los pasa por el flujo y muestra cuáles lo rompen. **Rúbrica:** hay al menos un caso vacío o incompleto, uno que no es del tema y uno límite (valores raros). No cuenta repetir el mismo caso normal con otro nombre. | **Doña Mireya**, asadero de carne a la llanera en Villavicencio: su flujo nuevo anotó un "jajaja" como pedido |
| 12 | Cuando la banda se traba / *When the belt jams* | `manejo-de-errores` · construcción | Diseña qué pasa cuando un paso falla: aviso a quién, por dónde, qué se revisa en el historial y cuál es el plan B manual. **Rúbrica:** hay un aviso de error que le llega a una persona con nombre; dice cada cuánto se revisa el historial; hay plan B manual. No cuenta "que no falle". Incluye `punti-se-equivoco`: Punti dejó un flujo apagado tres días sin darse cuenta. | **Robinson**, técnico de aires acondicionados en Montería: su formulario de solicitudes dejó de pasar datos a la hoja y nadie lo notó |
| 13 | ¿Cuánto cuesta esta máquina? / *What does this machine cost?* | `costo-del-flujo` · mercado | Con un flujo y un volumen (300 recordatorios al mes, cuatro pasos cada uno), el piloto calcula cuántas unidades gasta al mes según cómo cobre la herramienta (por paso o por ejecución) y dónde se va el cobro de la IA. La IA corrige la cuenta. **Rúbrica:** multiplica ejecuciones por pasos cuando se cobra por paso; separa el costo de la herramienta del costo de la IA; propone un ahorro real (filtrar antes del paso de IA). No cuenta copiar un precio sin hacer la cuenta. `pantalla-viva` con las formas de cobro vigentes. | **Jennifer**, gimnasio de barrio en Kennedy (Bogotá): quiere recordarle el pago a 300 socios |
| 14 | Elegir herramienta / *Choosing a tool* | `elegir-herramienta` · mercado | El piloto escribe qué necesita (apps que conecta, volumen, presupuesto, quién la mantiene, dónde viven los datos) y la IA le devuelve preguntas para comparar, sin recomendar marca. **Rúbrica:** nombra las apps que debe conectar, un volumen aproximado y quién la va a mantener. No cuenta "la mejor" o "la más famosa". `pantalla-viva` con tres herramientas de ejemplo descritas con los mismos criterios. | **Don Ricardo**, 60, fotógrafo de eventos en Popayán: su sobrino le dice que use una herramienta y su cliente le recomienda otra |
| P3 | Ficha técnica del flujo / *Flow spec sheet* | proyecto | Sobre el flujo del proyecto 2: seis casos de prueba, qué hace si falla, plan B manual y costo mensual estimado. | El piloto |

### Capítulo 4 · La torre de control

| # | Misión (ES / EN) | Concepto · receta | Laboratorio | Protagonista y escena |
|---|---|---|---|---|
| 15 | Lo que no se automatiza / *What not to automate* | `no-automatizar` · criterio | `caso` con decisiones más un lab corto: el piloto explica por qué una tarea de su lista no debe automatizarse o solo en parte. **Rúbrica:** usa al menos una razón de la misión: pasa pocas veces, cada caso es distinto, hay emociones o seguridad de por medio, el proceso todavía está desordenado. No cuenta "porque la IA se equivoca" sin decir por qué importa aquí. | **Doña Socorro**, jardín infantil en Neiva: quiere que los avisos a los papás salgan solos, incluido "su hijo se golpeó" |
| 16 | Las cajas de otros / *Other people's boxes* | `datos-de-clientes` · criterio | Revisa un flujo que manda datos de pacientes a varias apps y reescribe qué datos viajan y cuáles no. **Rúbrica:** quita del flujo los datos que no hacen falta para la tarea; señala los datos de salud como sensibles; dice que los clientes deben saber y autorizar el uso de sus datos. No cuenta "cifrar todo" sin quitar nada. El principio (autorización, finalidad, lo mínimo) es de Taller 16 (`datos-de-otros`); aquí se aplica a lo que viaja entre apps. | **Gabriel**, centro de terapias de lenguaje para niños en Cúcuta: un flujo copia el diagnóstico y la EPS de cada niño en una hoja compartida |
| 17 | Un agente en la banda / *An agent on the belt* | `agente-en-el-flujo` (usa `cuando-usar-agente`, `brief-del-agente` y `permiso-minimo` de Nexo) · construcción | El piloto diseña un flujo donde las confirmaciones a invitados siguen fijas y una sola estación, "buscar proveedores", la hace un agente. Escribe la orden de esa estación y dónde se detiene la banda. La IA corre el flujo con dos casos y muestra qué hizo el agente y dónde paró. **Rúbrica:** lo que se repite igual queda como flujo fijo; la estación del agente tiene meta, límites y formato de entrega; el agente solo busca y propone (no contacta, no reserva, no paga); hay un visto bueno humano antes de seguir. No cuenta mandar todo al agente "porque es más inteligente". Si el piloto no pasó por Nexo, una pantalla repasa la orden de misión. `pantalla-viva`: los agentes dentro de las herramientas de automatización. | **Doris**, organiza eventos para empresas en Bucaramanga: confirmaciones a invitados (siempre igual) y búsqueda de proveedores (cada vez distinta) |
| PF | La máquina de tu negocio / *Your business machine* | proyecto final | Ver sección 4. | El piloto |

Personajes (regla de Eco): ningún oficio se repite dentro del mundo. Se evitaron también los oficios
de los protagonistas de Eco (peluquería, tienda de barrio, almuerzos, técnico de celulares…). Al
escribir, llevar la lista en `contenido/misiones/automatizaciones/PERSONAJES.md`.

## 5. Proyecto final y certificado

**La máquina de tu negocio** (*Your business machine*), 20 a 30 minutos, en tres partes:

1. **Diagnóstico:** tres tareas de un negocio real (el propio, el de un familiar o uno de muestra), con
   cuál se automatiza, cuál no y por qué.
2. **Planos:** dos flujos completos: disparador, datos, condición, estación de IA con su prompt
   cerrado, punto de aprobación humana, qué datos viajan y cuáles no.
3. **Puesta a punto:** plan de pruebas, aviso de errores con responsable, plan B manual y costo
   mensual estimado.

El Laboratorio "corre" los dos flujos con cinco casos que la IA inventa, incluidos dos difíciles. La
rúbrica revisa las piezas de los capítulos 1 a 4. Se aprueba con los dos flujos funcionando en
los casos normales y una respuesta razonable en los difíciles (el piloto puede ajustar tres veces).

**Certificado de Autómata · Constructor de flujos** (*Flow Builder*): nombre del piloto, fecha, las
17 misiones y el nombre de "su máquina". Opcional (`reto-ia`): montar uno de los flujos en una
herramienta real con datos de prueba y marcar la lista de chequeo. No es requisito, porque exige
crear cuentas en servicios externos.

## 6. Lecciones viejas que se reciclan

| Lección vieja | Qué se aprovecha | Va a |
|---|---|---|
| `que-es-automatizar` | Pantallas 1 y 2 (pedidos de WhatsApp a Excel; disparador y acción); gráfico disparador → IA → acción; tabla de tareas repetitivas con IA; pantalla 5 (los agentes deciden pasos) | 1, 2, 6 |
| `tu-primer-flujo` | El flujo de correos urgentes (tabla de piezas, condición "solo si la urgencia es alta"); pantalla 4 (el prompt dentro del flujo debe ser preciso); pantalla 5 (probar con 5 a 10 casos, las decisiones importantes las toma una persona) | 5, 7, 9, 11 |
| `herramientas-sin-codigo` | Tabla Zapier / Make / n8n (se rehace con criterios y va a pantalla viva); pantalla 3 de cobro (se corrige con los datos de la sección 7); pantalla 5 de permisos; flujo "elige tarea → flujo pequeño → prueba → actívalo" | 10, 11, 13, 14 |
| `apis-y-costos` (Núcleo) | Solo como concepto dado por sabido (`usaConceptos`): el cobro por tokens | 13 |
| `ia-para-emprender` (Forja) | Respuestas base para las preguntas de siempre en WhatsApp | 3 |
| `publicar-con-seguridad` (Taller) | Las claves son llaves; si se filtran, se cambian | 10 |
| `privacidad` (Brújula) | Qué no compartir; aquí se aplica a los datos de los clientes | 16 |
| Ejercicios viejos | Los de ordenar pasos y completar la frase sirven para `clasificar` y `punto-control` | 1, 2, 5, 11 |

## 7. Datos que envejecen (VOLÁTILES)

**Regla:** las misiones enseñan primero lo que no cambia (disparador, acción, datos, condición,
pruebas, contar pasos). Nombres de herramientas, precios, planes gratuitos y funciones van **solo**
en bloques `pantalla-viva` con `vivo: true`, `revisado` y `fuentes` con fecha. El Radar IA los revisa
cada lunes. Nunca en un `punto-control` ni en la rúbrica de un laboratorio.

Revisado el 2026-09-24 en las páginas oficiales (los precios son en dólares o euros, antes de
impuestos, y cambian seguido):

| Dato | Qué dice hoy | Dónde se usa |
|---|---|---|
| Zapier | Plan gratis con 100 tareas al mes y solo flujos de dos pasos; Professional desde US$19,99 al mes. Cobra por **tarea**: cada acción que se completa; revisar si hay datos nuevos no cuenta. Pasos de IA desde Professional. Agentes con precio aparte | 13, 14 |
| Make | Plan gratis con 1.000 **créditos** al mes, 2 escenarios activos y ejecución cada 15 minutos como mínimo; Core desde US$12 al mes por 10.000 créditos. Cada acción de un módulo gasta un crédito. Trae asistente para armar flujos y agentes (beta) | 13, 14 |
| n8n | La edición Community se instala gratis en tu propio servidor, bajo la Sustainable Use License: gratis para uso personal o interno de tu negocio; revenderla como servicio exige otro acuerdo. n8n se llama "fair-code", no código abierto en sentido estricto. En la nube: Starter €20 al mes (pago anual) por 2.500 **ejecuciones**. Cobra por ejecución completa, sin importar cuántos pasos tenga | 13, 14 |
| Cambio de fondo | Las tres herramientas agregaron "agentes" y conexión por MCP. La frontera entre flujo y agente se vuelve borrosa dentro de las herramientas; el concepto (quién decide los pasos) no cambia | 17 |
| WhatsApp Business (app) | Mensaje de bienvenida, mensaje de ausencia y respuestas rápidas, gratis dentro de la app | 3 |
| WhatsApp Business (plataforma para empresas) | Desde el 15 de enero de 2026 Meta no permite chatbots de IA de uso general en su plataforma para empresas; sí permite IA al servicio del negocio (pedidos, citas, preguntas frecuentes) | 3, 9, 16 |
| Colombia | Ley 1581 de 2012 (protección de datos personales): los datos de salud son sensibles y el tratamiento necesita autorización. Es norma estable, pero se cita con fuente | 16 |

Lo que NO se afirma en ninguna misión: que una herramienta es "la mejor", "la más barata" para todos,
ni cifras de ahorro de tiempo inventadas.

## 8. Requisitos y lugar en la ruta

- **Antes:** Eco capítulo 1 (el pedido completo, forma) y misión 12 de Eco (Pon límites claros). La
  misión 7 los usa como `usaConceptos`. Recomendado: Forja (usar la IA a mano antes de automatizarla)
  y Nexo (la misión 17 usa sus conceptos; si falta, una pantalla de repaso).
- **No hace falta:** saber programar, tener un negocio (hay negocios de muestra en todos los proyectos),
  crear cuentas en herramientas de pago.
- **Lugar en la ruta recomendada:** penúltimo mundo, primero del rango Arquitecto, después de todos
  los de Capitán (ver `INDICE.md`).
- **Después:** Núcleo (APIs, costos por token y cómo se construye un modelo).
- **Nivel:** el mundo del constructor. Los capítulos 1 y 2 sirven a cualquier emprendedor; los 3 y 4
  piden más criterio.

### Límites con los otros mundos

| Mundo | Qué es suyo | Qué es de Autómata |
|---|---|---|
| **Nexo** (agentes) | La IA que decide los pasos, usa el navegador o el computador, conectores y MCP a fondo, supervisar agentes, inyección de instrucciones | Flujos con pasos fijos que tú diseñas. Nexo va antes en la ruta y es dueño del permiso mínimo; la misión 10 lo aplica a las cuentas de un flujo y la 17 mete un agente dentro de una banda |
| **Taller** (crear sin código) | Construir una página o una app que otros usan | Conectar apps que ya existen para que trabajen solas. Si el piloto necesita "hacer un formulario bonito", eso es Taller |
| **Forja** (herramientas para el trabajo) | Usar la IA a mano en el correo, documentos, hojas y reuniones | Que eso pase solo, sin que alguien lo pida cada vez |
| **Eco** (prompts) | Cómo se escribe un buen prompt | Aplicarlo a un prompt que nadie revisa (misión 7 usa `forma` y `limites` de Eco) |
| **Núcleo** (cómo se construye) | APIs, tokens, precios por millón de tokens | Solo se usa la idea en la cuenta de costos (misión 13) |
| **Brújula** (ética y seguridad) | Privacidad en general, sesgos, derechos | Los datos de clientes que viajan por un flujo (misión 16) |
| **Órbita** (vida diaria) | Recordatorios y rutinas personales del celular | Autómata se enfoca en trabajo y negocio; la misión 3 usa WhatsApp Business, no rutinas personales |
| **Horizonte** (futuro, empleo) | Qué trabajos cambian por la automatización | Fuera. Si sale en la misión 15, se enlaza a Horizonte |

## 9. Preguntas abiertas para Cami

1. **Rango de Autómata frente a Nexo.** Resuelto por el editor sin cambiar rangos: Nexo (Capitán) va
   antes y Autómata (Arquitecto) después. Nexo explica "flujo" en una pantalla y Autómata 17 usa lo
   de Nexo. Si Cami prefiere bajar Autómata a Capitán, el orden no cambia. Ver `INDICE.md`.
2. **¿Enseñamos una herramienta de verdad?** El temario es neutral y todo se practica en el
   Laboratorio. ¿Quieres una misión opcional "manos a la obra" con capturas de una herramienta real?
   Envejece rápido y obliga a elegir marca.
3. **Construir agentes dentro de estas herramientas** (los "agentes" de Zapier, Make o n8n). Resuelto
   por el editor: la misión 17 ("Un agente en la banda") enseña el diseño, sin marca; las marcas van
   en su pantalla viva. Construir agentes con API queda fuera de la escuela por ahora (`INDICE.md`).
4. **Negocio propio o de muestra.** Muchos pilotos no tienen negocio. Los proyectos aceptan uno de
   muestra; ¿el certificado debe decir si fue con negocio real?
5. **Tope del Laboratorio.** Las misiones 11 y 17 y el proyecto final corren varios casos por intento:
   gastan más que un laboratorio normal. ¿Se les da un tope aparte? Consolidada en `INDICE.md`.

## Fuentes (consultadas el 2026-09-24)

- Zapier, planes y precios: https://zapier.com/pricing
- Make, planes y precios: https://www.make.com/en/pricing
- n8n, planes y precios: https://n8n.io/pricing/
- n8n, Sustainable Use License: https://docs.n8n.io/n8n-community-license
- Anthropic, "Building effective agents" (diferencia entre workflows y agentes, 19 dic 2024): https://www.anthropic.com/engineering/building-effective-agents
- WhatsApp, mensajes de ausencia: https://faq.whatsapp.com/2565868990219715/?locale=es_ES
- WhatsApp, mensajes de bienvenida: https://faq.whatsapp.com/smba/account-and-profile/how-to-use-greeting-messages?lang=es
- WhatsApp, respuestas rápidas: https://faq.whatsapp.com/es/android/26000101/
- respond.io, cambio de política de IA en la plataforma de WhatsApp Business (vigente 15 ene 2026): https://respond.io/blog/whatsapp-general-purpose-chatbots-ban
- Ley 1581 de 2012 (Colombia), Función Pública: https://www.funcionpublica.gov.co/eva/gestornormativo/norma.php?i=49981 · texto con vigencias en la Secretaría del Senado: http://www.secretariasenado.gov.co/senado/basedoc/ley_1581_2012.html
- Lecciones de origen: `contenido/punti-todas-las-lecciones.tsv` (ids `que-es-automatizar`, `tu-primer-flujo`, `herramientas-sin-codigo`)
