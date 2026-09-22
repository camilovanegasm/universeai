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
