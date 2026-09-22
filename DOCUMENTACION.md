# Documentación del proyecto — UniverseAI

> Este documento es la bitácora y manual de referencia del proyecto, pensado para que tú (o cualquier persona) pueda entender qué hay construido y qué ha ido cambiando con el tiempo.
> Se actualiza **por tandas**: cada vez que se completa un bloque de trabajo, se agrega una entrada nueva al final del "Historial de cambios" — nunca se borra ni se reescribe lo anterior, para no perder rastro de nada.
>
> (Para el resumen de decisiones y el plan por fases, ver `CLAUDE.md` en esta misma carpeta.)

## 1. Qué es este proyecto

**UniverseAI** es una app web gratuita, estilo Duolingo, para aprender Inteligencia Artificial mediante niveles, lecciones cortas y ejercicios interactivos, con gamificación (XP, rachas, corazones, insignias).

## 2. Enlaces del proyecto

| Recurso | Enlace |
|---|---|
| Código (GitHub) | https://github.com/camilovanegasm/universeai |
| App publicada (Vercel) | https://universeai-eight.vercel.app/ |
| Base de datos y login (Firebase) | https://console.firebase.google.com/project/universeai-e4e9c |

## 3. Estructura del proyecto (carpetas principales)

```
C:\Proyectos\UniverseAI
├─ CLAUDE.md              → memoria de contexto y decisiones (para Claude)
├─ DOCUMENTACION.md        → este archivo: bitácora y manual del proyecto
├─ .env.local              → claves de Firebase (NO se sube a GitHub, es privado)
├─ src/
│  ├─ app/                 → páginas de la app (Next.js)
│  └─ lib/
│     └─ firebase.ts       → conexión con Firebase (login + base de datos)
├─ public/                 → imágenes y archivos estáticos
└─ package.json            → lista de librerías que usa el proyecto
```

## 4. Servicios externos usados

| Servicio | Para qué | Plan |
|---|---|---|
| **GitHub** | Guardar el historial del código | Gratis |
| **Vercel** | Publicar la app en internet | Gratis |
| **Firebase Authentication** | Login de usuarios (correo/contraseña + Google) | Gratis (plan Spark) |
| **Firebase Firestore** | Base de datos (progreso, XP, niveles) — región São Paulo | Gratis (plan Spark) |

## 5. Cómo se actualiza la app publicada

Cada vez que se guarda ("commit") un cambio en el código y se sube a GitHub, Vercel lo detecta automáticamente y publica la nueva versión en unos 1-2 minutos, sin que haya que hacer nada manual.

## 6. Historial de cambios

### 2026-09-21 — Fase 0: Preparación del entorno (completa)
- Se definió el stack tecnológico: Next.js + TypeScript + Tailwind CSS, Firebase (Authentication + Firestore), Vercel y GitHub. (Se evaluó Supabase inicialmente; se cambió a Firebase por experiencia previa del usuario con esa herramienta — ver detalle en `CLAUDE.md`).
- Se creó el esqueleto del proyecto con `create-next-app` (TypeScript + Tailwind + App Router).
- Se creó el repositorio en GitHub (`camilovanegasm/universeai`) y se subió el código.
- Se creó el proyecto en Vercel, se importó el repositorio y se publicó la primera versión: https://universeai-eight.vercel.app/ (verificado funcionando: muestra la página de bienvenida por defecto de Next.js, sin errores).
- Se creó el proyecto en Firebase (`universeai-e4e9c`).
- Se habilitó **Firebase Authentication** con dos métodos: correo/contraseña y Google Sign-In.
- Se creó la base de datos **Firestore** en modo producción, región `southamerica-east1` (São Paulo).
- Se conectó Firebase al código (`src/lib/firebase.ts`), usando variables de entorno (`.env.local` en local, y configuradas también en Vercel → Settings → Environment Variables).
- Se verificó que la app publicada sigue funcionando correctamente después de conectar Firebase.
- **Resultado:** circuito completo funcionando (código → GitHub → Vercel → internet) con login y base de datos ya disponibles, listo para empezar a construir funcionalidad real en la Fase 1.

### 2026-09-22 — Fase 1.1: Registro e inicio de sesión (completa)
- Se creó el contexto de autenticación (`src/lib/AuthContext.tsx`) que le permite a toda la app saber en todo momento si hay un usuario logueado.
- Se crearon las páginas `/login` y `/registro`, con dos formas de entrar: correo/contraseña o el botón "Continuar con Google".
- Al registrarse (por cualquiera de los dos métodos), se crea automáticamente un documento de perfil en Firestore (colección `usuarios`, un documento por persona) con: nombre, correo, 0 XP, 5 corazones y racha en 0.
- Se creó `/inicio`, una página protegida (si no has iniciado sesión te manda a `/login`) que por ahora es un placeholder de bienvenida mostrando XP/corazones/racha y un botón de "Cerrar sesión". Esta página se convertirá en el mapa de niveles en la sub-fase 1.3.
- Se configuraron y desplegaron las **reglas de seguridad de Firestore** (`firestore.rules`, con `firebase.json` y `.firebaserc`) usando el Firebase CLI (ya estaba conectado en este computador): cada usuario únicamente puede leer y escribir su propio documento de perfil, nunca el de otra persona.
- Se actualizó la página principal (`/`) para mostrar botones de "Crear cuenta gratis" / "Iniciar sesión" (o "Continuar aprendiendo" si ya se inició sesión).
- Verificado: `npm run build` y `npm run lint` sin errores; probado por el usuario en `http://localhost:3000` (registro, login y Google Sign-In funcionando); confirmado también en producción tras el despliegue automático a Vercel.
- **Resultado:** cualquier persona ya puede crear una cuenta real y quedar identificada en la app, con su progreso guardado de forma segura en la nube desde el primer momento.

### 2026-09-22 — Fase 1.2: XP/combustible/corazones/racha + identidad visual "Cache" (completa)
- Se creó `src/lib/progreso.ts` con la lógica de juego:
  - **Combustible** (reemplaza el concepto de "estrellas" de Duolingo): 3/3 si completas la lección sin errores, 2/3 con 1-2 errores, 1/3 con 3 o más.
  - **XP**: 15 XP (combustible 3), 10 XP (combustible 2) o 5 XP (combustible 1), más un bono de +5 XP si terminas dentro del "tiempo objetivo" de la lección.
  - **Corazones**: se resetean automáticamente a 5 cada día (comparando la fecha de la última actividad).
  - **Racha**: sube 1 si hay actividad en días consecutivos, se mantiene si ya contaste hoy, y se rompe (vuelve a 1) si pasó más de un día sin actividad.
- Se agregaron botones temporales en `/inicio` para probar esta lógica sin tener que esperar a la lección real (que llega en la fase 1.4).
- **Identidad visual definitiva del proyecto** (reemplaza el tema morado genérico usado en un primer intento dentro de esta misma sesión): mascota oficial **Cache** (UNIT-001), un astronauta-robot retro-futurista que flota en el espacio, con visor rectangular tipo casco de iPhone, parches de NASA y SpaceX, y personalidad "gamer retro" (sarcástico con cariño, celebra los logros a lo grande). El usuario diseñó a Cache y aportó una hoja de personaje completa (10 estados posibles: Boot, Online, Level Up, Loading, Glitch, Hype, Low Battery, Encrypted, Signal Lost, God Mode) más las imágenes finales; por ahora hay arte exportado para 6 de esos 10 estados (boot, online, loading, levelup, battery, hype), copiados a `public/cache/`.
- Paleta de colores: verde Matrix `#00FF41` (dominante), morado `#B400FF`, rosa `#FF006E`, amarillo `#FFE600` (XP/logros), cian `#00F5FF` (UI), fondo casi negro `#050510`.
- Tipografías (Google Fonts, cargadas en `src/app/layout.tsx`): Orbitron (títulos épicos), VT323 (la "voz" de Cache y mensajes de sistema), Rajdhani (navegación y encabezados), Press Start 2P (solo para logros puntuales), Inter (todo el texto de lectura).
- Se creó el componente reutilizable `src/components/Cache.tsx`: recibe un "estado" y muestra la imagen correspondiente flotando con una animación suave. En `/inicio`, Cache reacciona automáticamente a lo que pasa (se pone en "loading" mientras se guarda algo, "hype"/"level up" al completar una lección, "battery" al fallar) y vuelve solo a su estado normal después de unos segundos.
- Se actualizó el fondo global (`src/components/FondoEspacial.tsx` + `globals.css`) a un estilo "polvo cósmico": azul noche casi negro, neutro, para no competir visualmente con Cache ni con el contenido.
- Verificado: `npm run build` y `npm run lint` sin errores; probado por el usuario en local y confirmado en producción tras el despliegue automático a Vercel.
- **Resultado:** UniverseAI ya tiene su identidad de marca definitiva (Cache + paleta + tipografías) aplicada a las 4 pantallas existentes, y la lógica de juego (XP/combustible/corazones/racha) queda lista para conectarse a la lección real en la fase 1.4.

### 2026-09-22 — Fase 1.3: Mapa de niveles (completa)
- Se creó `src/lib/niveles.ts` con los 7 temas de la ruta de aprendizaje (uno por "planeta"): Qué es la IA, Modelos de lenguaje, Prompts, Herramientas de IA, Imágenes y video, Ética y seguridad, Automatizaciones. Cada uno tiene un campo `disponible` — en el MVP solo el primero es `true`.
- La pantalla `/inicio` pasó de ser un placeholder de bienvenida a ser el **mapa de niveles** real: los 7 planetas se dibujan en un camino curvo y asimétrico (una curva SVG, no una línea recta), cada uno en una posición horizontal distinta para que se sienta más orgánico, como flotando en el espacio.
- El Nivel 1 se ve desbloqueado (brillante, con su número, y Cache flotando al lado); los niveles 2 a 7 se ven apagados/grises, con un candado 🔒 y la etiqueta "Próximamente", y no se pueden clickear todavía.
- Al hacer clic en el Nivel 1 se navega a `/leccion/[id]` (ej. `/leccion/que-es-la-ia`), una página temporal que confirma que la navegación funciona y avisa que la lección real (con los 5 tipos de ejercicio) llega en la fase 1.4.
- Verificado: `npm run build` y `npm run lint` sin errores; probado por el usuario en local (dos rondas: primero con un layout en zigzag simple, después ajustado a curvas asimétricas por pedido del usuario) y confirmado en producción tras el despliegue a Vercel.
- **Resultado:** cualquier usuario logueado ve ahora un mapa de niveles real y navegable, con un único nivel jugable (todavía sin lección) y el resto de la ruta de aprendizaje visible como "Próximamente".
