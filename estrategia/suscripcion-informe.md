# Punti Club: cómo cobrar sin traicionar la misión

**Informe de investigación para Punti (punti.space)**
Fecha: 23 de septiembre de 2026
Tasa de cambio usada: **1 USD = 3.192,53 COP** (TRM del 22 sep 2026, según CapitalColombia). Todos los "≈" en pesos o dólares salen de esa tasa.

---

## Resumen en 30 segundos

- **Codédex** deja gratis los primeros capítulos de cada curso y cobra por "Club": todo el catálogo, certificados, proyectos revisados por mentores, IA ilimitada y eventos. Según dos artículos de Boot.dev cuesta **USD 19,99/mes o USD 9,99/mes pagando el año**. Además tiene **precios más bajos en muchos países**.
- Casi todas las apps parecidas (Duolingo, Brilliant, Mimo, DataCamp) hacen lo mismo: **lo básico es gratis y la suscripción quita los límites** (vidas o energía) y da certificados, IA y contenido avanzado.
- En Colombia las apps grandes cobran **mucho menos que en EE. UU.** Spotify cobra 18.500 COP al mes (≈ USD 5,80), contra USD 12,99 allá. Super Duolingo en la App Store de Colombia cuesta entre 27.900 y 30.000 COP (≈ USD 8,70–9,40).
- **Stripe no existe para empresas colombianas.** Para cobrar en pesos usa **Mercado Pago Suscripciones**, que tiene cobro recurrente automático. Para cobrar en dólares al resto del mundo usa **Lemon Squeezy**, que funciona como "comerciante registrado" (merchant of record) y paga a bancos colombianos.
- **Recomendación:** "Punti Club" a **19.900 COP/mes o 149.900 COP/año** en Colombia, y **USD 6,99/mes o USD 49,99/año** fuera de Colombia. Todo lo que enseña IA, incluida la ética y la seguridad, sigue gratis. El Club vende **comodidad, profundidad y reconocimiento**, no el acceso al conocimiento.

---

## 1. Codédex: cómo lo hacen

### Qué pude confirmar y qué no
La página de precios de Codédex (codedex.io/pricing) se carga con JavaScript y **no la pude leer directamente**. Todo lo que sigue viene de fuentes secundarias, citadas abajo. Los precios **no coinciden entre fuentes**, así que revísalos tú en su página antes de citarlos en público.

### Plan gratis ("Explorer")
Según Postunreel (reseña de 2026):
- "Los capítulos iniciales de los cursos principales": alcanzan para aprender lo básico (variables, condicionales, bucles en Python).
- Acceso a la comunidad **después de ganar 100 XP**. Es un filtro para evitar spam, y es una buena idea para Punti.
- Algunos tutoriales de proyectos gratis.

DataCamp usa una idea parecida: el **primer capítulo de cada curso es gratis** (según su página de precios).

### Plan pago ("Codédex Club")
Beneficios según varias fuentes:
- **Catálogo completo**: cursos intermedios y avanzados. Según el anuncio de GitHub Education: Python, HTML, CSS, JavaScript, Git & GitHub, línea de comandos y más.
- **"Club Courses"**: son simplemente los cursos y capítulos que solo abre el Club.
- **Artículos extra y "cheat sheets"** (hojas de resumen).
- **Code Challenges**: retos tipo LeetCode.
- **"Checkpoint and Final Projects"**: proyectos a mitad y al final de cada curso.
- **Certificados de curso.**
- **Revisión de proyectos por mentores humanos.** Codédex lo anunció en Threads como "code review from human experts".
- **"Get unstuck" / ayuda para desbloquearte:** "24/7 help from code mentors" y "Unlimited access to Lumi AI for learning and debugging". Lumi es su asistente de IA dentro de las lecciones. En la práctica, "get unstuck" es ayuda de IA sin límite más mentores cuando te trabas.
- **Eventos exclusivos**: Office Hours, Game Nites y preparación de entrevistas.

### Precio
| Fuente | Mensual | Anual |
|---|---|---|
| Boot.dev (2 artículos, 2026) | USD 19,99/mes | USD 9,99/mes facturado anual (≈ USD 119,88/año) |
| Pagetools | USD 9,99/mes | no muestra plan anual |
| Codédex en X (2024, oferta estudiantes) | "6 meses gratis (valor USD 60)", o sea ≈ USD 10/mes en esa época | – |

- **Precios regionales:** Postunreel dice que "Codédex introdujo precios localizados, así que la membresía cuesta menos en muchos países fuera de EE. UU." No pude verificar el precio exacto para Colombia.
- **Descuento para estudiantes:** 6 meses de Club gratis con el GitHub Student Developer Pack. Postunreel dice que ese beneficio **no incluye** la revisión de proyectos por mentores ni los certificados.
- **Promociones:** hacen ventas puntuales, como Black Friday con 25% de descuento en el plan anual (código BLACKFRIDAY24, 2024).
- **Reembolso:** solo dentro de **3 días** después de la compra (respuesta de Codédex en Trustpilot).
- **Si cancelas:** pierdes el acceso al contenido pago, pero conservas el progreso y los certificados (Postunreel).
- **Comunidad:** tienen un servidor de Discord ("Codédex Community", discord.com/invite/codedex) y un foro dentro de la web.

**Lección para Punti:** Codédex deja probar gratis el inicio de todo, cobra por la profundidad, los certificados, la ayuda humana y la IA, y baja el precio fuera de EE. UU.

---

## 2. Otros modelos parecidos

| App | Qué es gratis | Qué cobra | Precio (USD) |
|---|---|---|---|
| **Duolingo Super** | Todos los cursos, con un sistema de **energía** que se gasta al equivocarte, y anuncios | Energía ilimitada, sin anuncios, práctica de errores, reparar la racha | App Store EE. UU.: USD 12,99/mes. Anual entre USD 83,99 y 95,99. Familiar USD 119,99/año |
| **Duolingo Max** | – | Lo de Super más funciones de IA: Roleplay y videollamada con Lily. "Explain My Answer" pasó a ser gratis para todos a inicios de 2026 | ≈ USD 29,99/mes, ≈ USD 168/año (DealNews) |
| **Brilliant** | Primeras 2 o 3 lecciones de cada curso, 1 reto diario, 2 "llaves" al día | Lecciones ilimitadas, sin anuncios, tutor "Koji" | USD 27,99/mes o USD 161,88/año (Nibble). Brilliant no publica el precio en su centro de ayuda |
| **Mimo** | Plan Basic gratis (solo móvil, contenido limitado) | **Pro** (solo app): llaves ilimitadas, sin anuncios, certificados, reparar racha. **Max** (app + web): rutas de carrera, tutor de IA ilimitado, proyectos guiados, comunidad, sesiones en vivo | App Store EE. UU.: entre USD 9,99 y 99,99 según el producto. Mimo no publica una tabla clara |
| **DataCamp** | Primer capítulo de cada curso | Más de 790 cursos, certificados, rutas de carrera | USD 14/mes facturado anual, como "precio especial" (su página). Otras fuentes hablan de USD 14–28/mes |

**Patrón común:**
1. Límite diario gratis (vidas, energía o llaves). Pagar lo quita.
2. Certificados solo para los que pagan.
3. La IA como beneficio premium.
4. Contenido avanzado o proyectos como premium.
5. Descuento fuerte por pagar el año, normalmente de 35% a 50%.

Ojo: Duolingo acaba de **liberar gratis** una función de IA ("Explain My Answer"). Las explicaciones básicas con IA se están volviendo algo que la gente espera gratis.

---

## 3. Precios en Colombia y Latinoamérica

### Ejemplos reales
| Servicio | Colombia (COP) | ≈ USD | EE. UU. (USD) | Colombia como % del precio en EE. UU. |
|---|---|---|---|---|
| Spotify Premium Individual | 18.500/mes | 5,80 | 12,99 | ~45% |
| Spotify Estudiantes | 10.100/mes | 3,16 | 6,99 | ~45% |
| Super Duolingo, mensual (App Store CO) | 27.900 o 30.000 | 8,70–9,40 | 12,99 | ~67–72% |
| Super Duolingo, anual y familiar (App Store CO) | 189.900 / 219.000 / 274.900 | 59–86 | 83,99 / 95,99 / 119,99 | ~70% |
| Brilliant (App Store CO) | 49.900–52.900 (mensual probable); 259.900–349.900 (anual probable) | 15,60–16,60; 81–110 | 27,99; 161,88 | ~57–68% |
| Mimo Pro (App Store CO) | 41.900 ("un mes"); 299.900–359.900 ("un año") | 13,10; 94–113 | – | – |

*Las listas de la App Store no dicen claramente qué precio es mensual y cuál es anual. Lo deduje por el monto.*

**Contexto:** el salario mínimo en Colombia en 2026 es **1.750.905 COP** al mes (Alegra).

### ¿Cuánto cobrar en pesos?
- Spotify, que es muy masivo, cobra cerca del **45%** del precio de EE. UU. Las apps educativas cobran entre el **57% y el 72%**.
- Un precio mensual **entre 14.900 y 24.900 COP** te pone por debajo de Duolingo y cerca de Spotify, que es la referencia mental de "una suscripción normal".
- **Termina los precios en 900**, como hacen todos en Colombia: 19.900, 149.900.
- **Empuja el plan anual.** Las comisiones de las pasarelas colombianas tienen un **cargo fijo** (unos 700–900 COP) que pesa mucho en cobros pequeños. En un cobro anual ese cargo casi desaparece.

---

## 4. Cómo cobrar desde Colombia

### Stripe: NO está disponible
La página oficial de países de Stripe (stripe.com/global) muestra en Latinoamérica **solo Brasil y México**. Colombia no aparece. Para usarlo tendrías que crear una empresa en EE. UU. (LLC), sacar un EIN y abrir una cuenta bancaria allá (BTO Digital). Eso cuesta dinero y trabajo contable. **No te lo recomiendo por ahora.**

*Aviso: algunos blogs publican "tarifas de Stripe Colombia". Son errores, no les creas.*

### Opciones comparadas

| Opción | ¿Cobro recurrente automático? | Comisión (verificada) | ¿Persona natural? | Para qué sirve |
|---|---|---|---|---|
| **Mercado Pago Suscripciones** | **Sí, automático**: planes, reintentos si falla el cobro, periodo de prueba gratis, frecuencia mensual o anual. Acepta tarjetas, saldo MP y, según la documentación, PSE y Efecty | Según cuándo retires el dinero: 3,29% + 800 COP + IVA (inmediato); 2,99% + 800 + IVA (7 días); 2,79% + 800 + IVA (14 días) | No lo pude confirmar en la página. Normalmente se abre con cédula y RUT, pero **verifícalo** | **Cobrar en COP en Colombia.** Lo más fácil para empezar |
| **Wompi (Bancolombia)** | **Solo a medias.** Guarda la tarjeta (tokenización y "Credential On File", solo Visa y Mastercard), pero **tú tienes que programar cada cobro** con tu propio código. Hay herramientas externas como Treli que lo automatizan | Plan Avanzado: 2,65% + 700 COP + IVA (su centro de ayuda) | **Sí.** Persona natural con RUT actualizado y cuenta bancaria. Tope de 2.500.000 COP por transacción | Buena opción cuando tengas a alguien que programe, o usando Treli |
| **ePayco** | Sí, tiene "Suscripciones" con cobros recurrentes automáticos y tokenización | No aparece en la página de suscripciones. Blogs dicen ≈ 2,99% + 900 COP, **sin verificar** | No lo confirmé | Alternativa a Mercado Pago |
| **PayU** | **Su API de pagos recurrentes fue descontinuada**, según su documentación oficial. Solo queda la tokenización | Blogs dicen 3,49% + 900 COP, **sin verificar** | – | No lo recomiendo para suscripciones |
| **Lemon Squeezy** (merchant of record) | **Sí**, suscripciones completas | **5% + USD 0,50** por venta. Suma +0,5% en suscripciones, +1,5% en ventas internacionales y +1,5% con PayPal. Pago a banco no estadounidense: 1% | Tu país es compatible: **Colombia está en su lista de pagos bancarios.** No confirmé si exige empresa | **Cobrar en USD al mundo.** Ellos cobran y pagan los impuestos de cada país por ti |
| **Paddle** (merchant of record) | Sí | 5% + USD 0,50 | Colombia no está en su lista de países excluidos. Su política exige que vendas "software o servicio real". Prohíbe cobrar **solo** por acceso a una comunidad | Alternativa a Lemon Squeezy. Suele pedir más requisitos |

### Ejemplo de cuánto te queda
- **19.900 COP mensual con Mercado Pago (retiro a 14 días):** 2,79% (≈ 555) + 800 = 1.355 COP. Más IVA sobre la comisión (≈ 257) da ≈ **1.612 COP de comisión (≈ 8%)**. Te quedan ≈ 18.290 COP.
- **149.900 COP anual con Mercado Pago:** ≈ 4.182 + 800 = 4.982, más IVA ≈ **5.929 COP (≈ 4%)**. Por eso conviene empujar el plan anual.
- **USD 6,99 mensual con Lemon Squeezy (cliente extranjero):** 5% + 0,5% + 1,5% = 7% (≈ 0,49) + 0,50 = **≈ USD 0,99 (≈ 14%)**, más 1% al recibir el dinero en tu banco colombiano. En cobros pequeños en dólares se va bastante. El anual (USD 49,99) sale mucho mejor: ≈ 8%.

*Los cálculos son aproximados. Los impuestos (retención en la fuente, ICA, etc.) dependen de tu caso: confírmalos con un contador.*

### ¿Persona natural o empresa (SAS)?
- **Para empezar, persona natural con RUT sirve.** Wompi lo acepta expresamente, y Mercado Pago normalmente también.
- Las personas naturales **deben facturar electrónicamente** en 2026 si superan **3.500 UVT de ingresos brutos al año (≈ 164,7 millones COP)**. Al pasar ese tope también pasas a ser responsable de IVA (El País, citando a la DIAN).
- **Crea una SAS más adelante:** cuando tengas ingresos estables, quieras socios o inversión, o una pasarela te la pida. **Habla con un contador antes de lanzar.** Son una o dos horas bien invertidas.
- **Ley del consumidor:** en Colombia existe el "derecho de retracto" para ventas a distancia. **Pídele a un abogado o contador que te confirme cómo aplica** a una suscripción digital. No lo verifiqué en esta investigación.

### Si después haces apps móviles
- **Apple (fuera de EE. UU.):** si la app abre contenido o funciones pagas, **debes usar la compra dentro de la app de Apple** (regla 3.1.1). Con el Small Business Program (menos de USD 1 millón al año), Apple se queda con el **15%**.
- **Apple en EE. UU.:** las apps pueden poner enlaces para pagar en la web (regla 3.1.1(a)). Pero en agosto de 2026 Apple propuso a un tribunal **cobrar comisión también por esas compras externas** (15% normal, 5% para pequeños, 10% en renovaciones). Todavía no hay decisión final (TechCrunch).
- **Apple, regla 3.1.3(b):** las apps que funcionan en varias plataformas pueden dejar entrar a quien ya pagó en la web, **siempre que también ofrezcan la compra dentro de la app**.
- **Google Play:** fuera de EE. UU., la UE y el Reino Unido cobra **15% sobre el primer USD 1 millón** al año.
- **Consejo:** mientras puedas, **quédate en web y usa una PWA** (una web que se instala en el celular como app). Así no pagas comisión a Apple ni a Google y no te enredas con sus reglas.

---

## 5. Recomendación concreta: "Punti Club"

### Principio guía
> **Aprender IA es gratis. El Club es para ir más rápido, más profundo y demostrarlo.**

### Qué queda GRATIS PARA SIEMPRE
- **Todos los mundos básicos**, que cubren lo que cualquier persona debería saber de IA: qué es, cómo usarla bien, prompts básicos, **ética, sesgos, privacidad, seguridad, deepfakes y desinformación**. **Nunca pongas detrás del pago el contenido de seguridad y ética.** Es tu misión y tu reputación.
- El tanque de **5 de combustible al día**. Revisa que no se sienta como castigo.
- XP, los 10 rangos, rachas y tabla de posiciones.
- **La lección semanal de noticias.**
- Acceso a la comunidad en Discord **después de ganar XP**, como Codédex con sus 100 XP. Así evitas spam.
- **Sin anuncios.** Hoy no tienes anuncios. **No los pongas solo para venderle a la gente "quitar anuncios".** Dañaría la confianza.

### Qué da PUNTI CLUB
Ordenado de lo más fácil a lo más difícil de construir:

| Beneficio | Por qué funciona | Dificultad técnica |
|---|---|---|
| **Combustible ilimitado** y pistas sin costo | Es el beneficio número uno de Duolingo Super, Brilliant y Mimo | Muy baja: ya tienes la marca de premium |
| **Reparar la racha** (1 o 2 al mes) | Duolingo Super y Mimo Pro lo ofrecen | Baja |
| **Certificado verificable por mundo**, con enlace público y botón "Agregar a LinkedIn" | Codédex, Mimo y DataCamp cobran por esto. En Latinoamérica, un certificado para el CV vale mucho | Media: una página pública con código de verificación |
| **Rol "Club" en Discord**, canal privado y una **sesión en vivo al mes** contigo ("Office hours de IA") | Codédex tiene eventos y office hours. Te acerca a tu comunidad | Baja |
| **Noticias antes que nadie**: la lección semanal llega 2–3 días antes al Club, más el archivo completo de noticias pasadas | Premia a los fans sin quitarle nada al gratuito | Baja |
| **Mundos avanzados**: IA en tu trabajo, automatizaciones, agentes, crear tu propio GPT o asistente, IA para emprender | Codédex y DataCamp cobran por la profundidad, igual que los "Club Courses" | Media: es contenido nuevo |
| **Retos de proyecto** por mundo, revisados primero por IA y luego por ti o por mentores, con un "sello" en el certificado | Igual que la revisión de proyectos por mentores de Codédex. Limita las revisiones humanas: por ejemplo, 1 al mes | Media o alta, y **te cuesta tiempo** |
| **Tutor de IA "Pregúntale a Punti"** dentro de las lecciones | Brilliant (Koji), Mimo Max y Codédex (Lumi) lo usan como beneficio premium | Alta, y **cuesta dinero por cada uso**. Ponle un límite diario razonable |
| **Modo sin conexión** | – | **No lo recomiendo por ahora.** En una web es complicado y aporta poco |

**Idea para no romper la misión:** dale a los usuarios gratis **1 o 2 preguntas al día al tutor de IA**. Duolingo liberó "Explain My Answer" en 2026, y la gente ya espera algo de IA gratis.

### Opciones de precio

| | **A. "Accesible"** | **B. "Recomendado"** ⭐ | **C. "Como Codédex"** |
|---|---|---|---|
| Colombia, mensual | 14.900 COP (≈ USD 4,67) | **19.900 COP** (≈ USD 6,23) | 29.900 COP (≈ USD 9,37) |
| Colombia, anual | 119.900 COP (≈ USD 37,6; ≈ 10.000/mes) | **149.900 COP** (≈ USD 47; ≈ 12.500/mes, 37% de ahorro) | 199.900 COP (≈ USD 62,6) |
| Resto del mundo, mensual | USD 4,99 | **USD 6,99** | USD 9,99 |
| Resto del mundo, anual | USD 39,99 | **USD 49,99** | USD 79,99 |
| Comparación | Menos que Spotify Colombia (18.500) | Casi igual a Spotify y por debajo de Duolingo Colombia (27.900) | Parecido a Duolingo y Codédex |
| Riesgo | La comisión fija se come mucho del mensual | Equilibrado | Caro para estudiantes colombianos |

**Por qué recomiendo la B:** en la cabeza de la gente queda al nivel de "lo mismo que Spotify". Está por debajo de Duolingo y Brilliant en Colombia. Y el plan anual deja un margen sano después de comisiones.

**Extras recomendados:**
- **"Miembro fundador":** para los primeros 100 a 200 suscriptores, **99.900 COP el primer año** (o USD 34,99), con una insignia permanente de "Fundador". Crea urgencia y te da una comunidad inicial fiel.
- **Precio estudiante:** 50% de descuento en el anual con correo .edu.co o carné. Spotify y Duolingo tienen precio para estudiantes.
- **Becas "IA para todos":** Club gratis para docentes de colegios públicos o para quien no pueda pagar, con un formulario sencillo. Refuerza la misión y trae buena prensa.
- **Prueba gratis de 7 días** del Club. Mercado Pago la permite en suscripciones, y Brilliant y Mimo la usan.
- **Más adelante:** plan para colegios o equipos, como DataCamp Teams.

### Plan de lanzamiento por fases

**Fase 0: preparación (2 a 3 semanas)**
1. Saca o actualiza tu **RUT** y habla con un **contador**: impuestos, facturación y retracto.
2. Abre cuentas en **Mercado Pago** (para COP) y en **Lemon Squeezy** (para USD). Crea el plan mensual y el anual en cada una.
3. Escribe **términos de servicio, política de reembolso y privacidad** en lenguaje simple. Por ejemplo: reembolso completo dentro de 7 días (Codédex da 3).
4. Publica una página **"Punti Club: próximamente"** con lista de espera y el precio de fundador.
5. Anuncia públicamente la **promesa de misión**: "Lo esencial de la IA, incluida la seguridad y la ética, siempre será gratis".

**Fase 1: lanzamiento mínimo (mes 1 y 2)**
- Beneficios que ya puedes dar con la marca de premium que existe: **combustible ilimitado, pistas gratis, reparar racha, rol en Discord, noticias antes que nadie y una sesión en vivo al mes.**
- Conexión técnica: Mercado Pago y Lemon Squeezy avisan a tu app (con un "webhook", pídeselo a Claude o a un desarrollador), y tu app activa o quita la marca de premium en Firebase. Mientras tanto, lo puedes hacer **a mano desde tu panel de admin**. Con pocos usuarios funciona.
- Vende primero el **plan Fundador anual**.

**Fase 2: valor que se siente (mes 3 y 4)**
- **Certificados verificables por mundo.**
- Primer **mundo avanzado** exclusivo del Club.
- **Retos de proyecto** con revisión por IA, más una revisión humana al mes.
- Abre la venta en USD con Lemon Squeezy para el resto de Latinoamérica, España y EE. UU.

**Fase 3: escalar (mes 6 en adelante)**
- **Tutor de IA** con límite diario: gratis 1 o 2 preguntas, en el Club un límite mucho mayor.
- Planes para colegios y empresas. Becas.
- **PWA** antes que apps nativas. Si luego haces apps en las tiendas, suma la comisión de Apple o Google (15%) a tus cuentas.
- Revisa los precios a los 6 meses con datos reales: cuántos pasan de gratis a pago y cuántos cancelan al mes.

### Riesgos y cómo evitarlos
1. **Poner la ética o la seguridad detrás del pago.** Nunca. Si alguna vez dudas, que quede gratis.
2. **Que el combustible se sienta como trampa** para obligar a pagar. Mantén 5 al día, que sea generoso, y deja ganar combustible extra practicando.
3. **Perder confianza.** Sé transparente: publica qué es gratis, qué es pago y por qué cobras ("para pagar servidores y crear más mundos").
4. **Costos del tutor de IA.** Cada pregunta cuesta dinero. Ponle límites y revisa la factura cada semana.
5. **Tu tiempo.** Las revisiones humanas y las sesiones en vivo no escalan. Limítalas desde el inicio.
6. **Promesas de certificado.** No digas que es "oficial" ni "avalado". Di "certificado de finalización de Punti".
7. **Impuestos y leyes.** Contador antes de lanzar. Guarda registros desde el primer peso.
8. **Dependencia de una sola pasarela.** Ten dos: Mercado Pago más Lemon Squeezy (o Wompi como respaldo).
9. **Comparación con Codédex.** Puedes decir "inspirado en" o "el Codédex de la IA" en conversaciones, pero **no uses su marca, colores ni el nombre "Club" de forma que parezca parte de ellos.** "Punti Club" está bien porque "Club" es una palabra genérica.

---

## Qué NO pude verificar (no lo inventé)
- El precio exacto actual de Codédex Club en su propia página y su precio para Colombia. Las fuentes secundarias no coinciden: USD 19,99 vs 9,99 al mes.
- Qué precio de la App Store de Colombia corresponde a qué plan exacto de Duolingo, Brilliant y Mimo.
- Precio oficial de Brilliant en su centro de ayuda (no lo publica) y precio oficial de Mimo en la web.
- Si Mercado Pago, ePayco, Lemon Squeezy y Paddle aceptan persona natural colombiana sin empresa.
- Tarifas oficiales actuales de ePayco y PayU (solo aparecen en blogs).
- Cómo aplica exactamente el derecho de retracto a suscripciones digitales en Colombia.

---

## Fuentes

**Codédex**
- https://www.codedex.io/pricing (se carga con JavaScript, no se pudo leer)
- https://www.boot.dev/blog/education/best-coding-games
- https://www.boot.dev/blog/education/code-academy-alternatives
- https://pagetools.co/tools/cod-dex
- https://postunreel.com/blog/codedex-review
- https://coddy.tech/vs/codedex
- https://github.com/orgs/community/discussions/109496
- https://x.com/codedex_io/status/1762202953090298262
- https://www.threads.com/@codedex.io/post/DCubZUzP_M3
- https://www.trustpilot.com/review/codedex.io
- https://discord.com/invite/codedex

**Comparables**
- https://www.dealnews.com/features/duolingo/cost/
- https://apps.apple.com/us/app/duolingo-language-lessons/id570060128
- https://apps.apple.com/co/app/duolingo-language-lessons/id570060128
- https://brilliant.org/help/pricing-and-plans/how-much-does-brilliant-premium-cost/
- https://nibble-app.com/blog/is-brilliant-free
- https://apps.apple.com/co/app/brilliant-learn-by-doing/id913335252
- https://support.mimo.org/hc/en-us/articles/14951451385746-What-s-the-difference-between-Mimo-Pro-and-Mimo-Max-subscriptions
- https://mimo.org/pro
- https://apps.apple.com/us/app/mimo-coding-code-learning-app/id1133960732
- https://apps.apple.com/co/app/mimo-coding-code-learning-app/id1133960732
- https://www.datacamp.com/pricing

**Precios en Colombia y contexto**
- https://www.spotify.com/co-es/premium/
- https://www.spotify.com/us/premium/
- https://www.capitalcolombia.com/sec-trm_precio_dolar_en_colombia
- https://blog.alegra.com/colombia/salario-minimo-en-colombia-2026/
- https://www.dineroenimagen.com/tu-dinero/cuanto-cuesta-super-duolingo-en-2025

**Pagos**
- https://stripe.com/global
- https://btodigital.com/stripe-en-colombia/
- https://www.mercadopago.com.co/herramientas-para-vender/suscripciones
- https://www.mercadopago.com.co/developers/es/docs/subscriptions/overview
- https://soporte.wompi.co/hc/es-419/articles/360020957133--Cu%C3%A1les-son-los-planes-y-tarifas-que-maneja-la-plataforma-Wompi
- https://soporte.wompi.co/hc/es-419/articles/360020955173--C%C3%B3mo-es-el-proceso-de-vinculaci%C3%B3n-a-la-pasarela-de-pago
- https://docs.wompi.co/en/docs/colombia/fuentes-de-pago/
- https://treli.co/conecta-tu-cuenta-de-wompi-a-treli/
- https://epayco.com/suscripciones/
- https://developers.payulatam.com/latam/es/deprecated/recurring-payments/recurring-payments-api.html
- https://btodigital.com/pasarelas-pago-colombia-comparativa-guia-negocio/ (tarifas de blog, no oficiales)
- https://www.lemonsqueezy.com/pricing
- https://docs.lemonsqueezy.com/help/getting-started/fees
- https://docs.lemonsqueezy.com/help/getting-started/supported-countries
- https://www.paddle.com/help/start/intro-to-paddle/which-countries-are-supported-by-paddle
- https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle
- https://dodopayments.com/blogs/paddle-fees-explained

**Impuestos y tiendas de apps**
- https://www.elpais.com.co/economia/la-dian-revelo-cuales-son-las-personas-naturales-que-deben-facturar-electronicamente-en-2026-este-es-el-tope-1153.html
- https://developer.apple.com/app-store/review/guidelines/
- https://developer.apple.com/app-store/small-business-program/
- https://techcrunch.com/2026/08/14/apple-proposes-to-take-a-15-cut-of-purchases-made-outside-the-app-store/
- https://support.google.com/googleplay/android-developer/answer/112622?hl=en
