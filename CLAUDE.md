# UniverseAI — App estilo Duolingo para aprender Inteligencia Artificial

> Este archivo es la "memoria" del proyecto. Antes de empezar cualquier sesión de trabajo futura, léelo completo para recordar el contexto, las decisiones ya tomadas y en qué fase vamos.

**Ubicación del proyecto en el computador:** `C:\Proyectos\UniverseAI`

**Enlaces del proyecto:**
- Repositorio en GitHub: https://github.com/camilovanegasm/universeai
- App publicada (Vercel): https://universeai-eight.vercel.app/

## 1. Visión del proyecto

App web gratuita e interactiva para aprender Inteligencia Artificial, con el mismo estilo que Duolingo:

- Se avanza por **niveles** que se van desbloqueando (mapa de niveles).
- Lecciones cortas (3-5 minutos) con ejercicios de 5 tipos:
  1. Opción múltiple
  2. Completar la frase
  3. Ordenar pasos
  4. Verdadero / falso
  5. Escribe tu primer prompt
- Gamificación: XP, rachas diarias (streaks), vidas/corazones, insignias, mapa de niveles.
- Ruta de aprendizaje de principiante a avanzado:
  1. Qué es la IA
  2. Cómo funcionan los modelos de lenguaje
  3. Prompts
  4. Herramientas de IA para el trabajo
  5. Crear imágenes y video con IA
  6. Ética y seguridad
  7. Automatizaciones
- **Modelo de negocio:** todo lo básico es gratis para siempre. Premium (de pago) SOLO para cosas muy exclusivas:
  - Proyectos guiados
  - Certificados
  - Tutor de IA personalizado
  - Contenido avanzado
- Primero app web (funciona bien en celular), más adelante app móvil nativa.

**Dueño del proyecto:** persona sin experiencia programando (viene de maquetar en WordPress/Elementor). Toda explicación debe ser en español, en lenguaje simple, sin dar por hecho conocimientos técnicos.

## 2. Decisiones ya tomadas (no volver a preguntar esto)

| Decisión | Elegido |
|---|---|
| ¿Quién escribe el código? | Claude construye todo el código. El usuario revisa, aprueba y prueba en el navegador/celular — no escribe código él mismo. |
| ¿El MVP tiene cuentas de usuario? | **Sí, desde el inicio.** El MVP ya incluye registro/login y guarda el progreso en una base de datos en la nube (no solo en el navegador). |
| ¿Quién escribe el contenido educativo? | Claude redacta el borrador de lecciones/ejercicios; el usuario los revisa y ajusta. |
| Idioma de comunicación | Español, lenguaje simple, evitando jerga técnica sin explicarla. |
| Métodos de login (Firebase Authentication) | **Correo/contraseña + Google Sign-In**, ambos habilitados desde el MVP (facilita el registro a los usuarios). |
| Regla de avance | **No pasar a la siguiente fase (ni sub-fase) sin aprobación explícita del usuario.** |

## 3. Stack tecnológico elegido y por qué

Se priorizó: gratis o barato para empezar, fácil de mantener, con mucha documentación/soporte (para que Claude pueda ayudar en el futuro sin fricción).

| Pieza | Tecnología | Para qué sirve | Por qué esta y no otra |
|---|---|---|---|
| Framework de la app | **Next.js** (con TypeScript) | Es el "motor" que arma las páginas, la navegación entre lecciones, el mapa de niveles, etc. | Es el estándar más usado en el mundo hoy, tiene muchísima documentación, y se conecta muy fácil con el hosting gratuito (Vercel). Evita tener que rehacer la app cuando crezca. |
| Estilos / diseño visual | **Tailwind CSS** | Define colores, espaciados, que se vea bien en celular. | Permite lograr un diseño moderno tipo Duolingo rápido, sin escribir CSS desde cero. |
| Base de datos + login de usuarios | **Firebase** (Firestore + Firebase Authentication) | Guarda usuarios, XP, racha, vidas, progreso por lección; maneja registro/login. | El usuario ya tiene experiencia previa con Firebase en otro proyecto, lo cual reduce fricción para entender y mantener la app a futuro. Además tiene plan gratuito (Spark) generoso y muy buen soporte nativo para apps móviles (iOS/Android), útil de cara a la Fase 4. *(Cambio de decisión: se evaluó Supabase primero — ver nota abajo).* |
| Hosting (dónde vive la app en internet) | **Vercel** | Publica la app con una dirección web real. | Plan gratuito generoso, se actualiza solo cada vez que se guarda una nueva versión del código, cero configuración de servidores. |
| Pagos (fase premium, más adelante) | **Stripe** | Cobrar por las funciones premium. | Es el estándar de la industria, fácil de integrar con Next.js + Supabase, y solo cobra comisión cuando de verdad entra dinero (no hay costo fijo). |
| Guardar el código / control de versiones | **GitHub** | Guarda el historial del código, como un "control de cambios" gigante. | Gratis, y es lo que Vercel usa para publicar automáticamente. |

> **Nota sobre el cambio Supabase → Firebase:** en la propuesta inicial se eligió Supabase porque usa una base de datos relacional (SQL/Postgres), que encaja de forma natural con datos de progreso/XP/niveles. Se cambió a Firebase (Firestore, base de datos NoSQL) porque el usuario ya tiene experiencia previa con Firebase en otro proyecto, lo cual pesa más que la ventaja teórica de Supabase: para el tamaño y tipo de datos de esta app, Firestore funciona igual de bien. Firestore usa "documentos" en vez de "tablas", pero Claude se encarga de estructurar los datos correctamente.

**Mini-glosario** (para futuras sesiones y para el usuario):
- *Framework*: un conjunto de piezas y reglas ya armadas para no construir todo desde cero.
- *Base de datos*: donde se guarda la información permanentemente (usuarios, progreso, etc.), equivalente a una hoja de cálculo enorme y segura.
- *Autenticación*: el sistema de registro/login (crear cuenta, iniciar sesión, recuperar contraseña).
- *Deploy / desplegar*: publicar una versión de la app para que cualquiera la pueda abrir desde internet.
- *Free tier / plan gratuito*: el nivel gratis que ofrecen estos servicios antes de empezar a cobrar (suficiente para el MVP y bastante más).

## 4. Plan por fases

**Regla:** cada fase (y sub-fase marcada) requiere aprobación explícita antes de empezar la siguiente.

### Fase 0 — Preparación del entorno (✅ COMPLETA)
- ✅ Esqueleto del proyecto creado (Next.js + TypeScript + Tailwind).
- ✅ Cuenta y repositorio de GitHub creados, código subido (`camilovanegasm/universeai`).
- ✅ Cuenta de Vercel conectada, proyecto importado y publicado: https://universeai-eight.vercel.app/
- ✅ Proyecto Firebase creado (`universeai-e4e9c`), región de Firestore: São Paulo (southamerica-east1).
- ✅ Firebase Authentication habilitado con **Correo/contraseña + Google Sign-In**.
- ✅ Firestore Database creada (modo producción).
- ✅ Firebase conectado al código (`src/lib/firebase.ts` + variables de entorno en `.env.local` y en Vercel → Settings → Environment Variables).
- ✅ Verificado en producción: la app publicada sigue funcionando sin errores tras conectar Firebase.

### Fase 1 — MVP: 1 nivel jugable completo
- ✅ 1.1 Registro / inicio de sesión de usuario (Firebase Authentication: correo/contraseña + Google). Páginas `/login`, `/registro` y `/inicio` (placeholder protegido). Perfil de usuario creado automáticamente en Firestore (`usuarios/{uid}`) con XP, corazones y racha en cero. Reglas de seguridad de Firestore desplegadas (cada usuario solo lee/escribe su propio perfil). Probado en local y verificado en producción (https://universeai-eight.vercel.app/login).
- ✅ 1.2 Estructura de datos: usuario, XP, corazones/vidas, racha, progreso por lección (`src/lib/progreso.ts`). Combustible (1-3, según errores) en vez de estrellas, XP con bono de velocidad, corazones con reset diario, racha que se rompe tras un día sin actividad. Probado con botones temporales en `/inicio`. Se definió también la **identidad visual definitiva** del proyecto: mascota **Cache** (astronauta-robot retro) + paleta verde Matrix sobre fondo espacial oscuro + tipografías Orbitron/VT323/Rajdhani/Press Start 2P/Inter — ver detalle en `DOCUMENTACION.md`.
- ✅ 1.3 Pantalla de "mapa de niveles" (ahora es lo que se ve en `/inicio`): 7 planetas (uno por tema de la ruta de aprendizaje, `src/lib/niveles.ts`) conectados por un camino curvo asimétrico. Nivel 1 ("Qué es la IA") desbloqueado con Cache al lado; los otros 6 en gris con candado, "Próximamente". Al hacer clic en el Nivel 1 lleva a `/leccion/[id]`, una página temporal (la lección real es la 1.4).
- 1.4 Pantalla de lección con los 5 tipos de ejercicio, usando contenido del tema "Qué es la IA".
- 1.5 Gamificación básica visible: contador de XP, corazones que se pierden si fallas, racha del día.
- 1.6 Prueba completa en celular (de principio a fin) antes de dar la fase por terminada.

### Fase 2 — Expandir contenido y gamificación
- Más niveles siguiendo la ruta de aprendizaje completa.
- Insignias (badges).
- Pulir mapa de niveles con progreso visual.

### Fase 3 — Premium y pagos
- Certificados, proyectos guiados, tutor de IA personalizado, contenido avanzado.
- Integración de pagos con Stripe.

### Fase 4 — App móvil
- Evaluar convertir la app web en app móvil (probablemente reusando la mayor parte del código de Next.js).

## 5. Estado actual

- ✅ Preguntas iniciales respondidas por el usuario.
- ✅ Stack tecnológico definido (con un cambio: Firebase en vez de Supabase, ver nota en sección 3).
- ✅ Plan por fases definido.
- ✅ Este archivo CLAUDE.md creado.
- ✅ **Fase 0 completa**: proyecto en `C:\Proyectos\UniverseAI`, en GitHub, publicado en Vercel, y con Firebase (Auth + Firestore) conectado.
- ✅ **Fase 1.1 completa**: registro/login con Firebase Authentication (correo/contraseña + Google), perfil de usuario en Firestore, página protegida `/inicio` (placeholder). Probado por el usuario en local y publicado en Vercel.
- ✅ **Fase 1.2 completa**: lógica de combustible/XP/corazones/racha (`src/lib/progreso.ts`) + identidad visual definitiva (mascota Cache, paleta verde Matrix, tipografías del sistema). Probado por el usuario en local y publicado en Vercel.
- ✅ **Fase 1.3 completa**: mapa de niveles con camino curvo de planetas en `/inicio`. Probado por el usuario en local y publicado en Vercel.
- ⏳ **Esperando aprobación del usuario para iniciar la Fase 1.4** (pantalla de lección con los 5 tipos de ejercicio, contenido del tema "Qué es la IA").

## 6. Cómo trabajar en este proyecto (recordatorio para Claude)

- Explicar cada paso técnico en español, en lenguaje simple, comparando con conceptos de WordPress/Elementor cuando ayude.
- No avanzar de fase/sub-fase sin aprobación explícita.
- Priorizar siempre la opción gratis o más barata disponible.
- Mantener este archivo actualizado al cerrar cada fase (mover ítems de "pendiente" a "hecho", anotar decisiones nuevas).
