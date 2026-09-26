# Estado del contenido de las misiones · Punti

**Actualizado:** 2026-09-26 · 88 paquetes escritos (de unos 241: 193 misiones + 48 proyectos) ·
revisor automático: **0 errores**. Este archivo es el punto de partida de cada nueva tanda: se
actualiza al cerrar cada una.

Cómo se trabaja: `contenido/misiones/GUIA-DE-PRODUCCION.md` (lo leen todos los agentes).
La escuela entera, los dueños de cada tema y las decisiones abiertas: `contenido/temarios/INDICE.md`.

## Leyenda

- **Editado:** escrito, autorrevisado y leído por un editor independiente. Listo para que Cami lo lea y publique.
- **Autorrevisado:** el agente cerró todos los pasos de la guía (revisor, prueba de claves, lectura
  en los dos idiomas, PERSONAJES.md). Falta el editor independiente.
- **Sin cerrar:** el agente se detuvo antes de su chequeo final (tanda del 2026-09-26). Pasa el
  revisor, pero falta prueba de claves, lectura final y editor.
- **A medias:** faltan misiones o el proyecto del capítulo.

## Por mundo

| # | Mundo (carpeta) | Cap. 1 | Cap. 2 | Cap. 3 | Cap. 4 | Siguiente paso |
|---|---|---|---|---|---|---|
| 1 | Origen (`origen`) | Editado (1-4 + p1) | Sin cerrar (5-7 + p2) | Falta | Falta | Cerrar y editar cap. 2 |
| 2 | Lexia (`lexia`) | Autorrevisado (1-3 + p1) | Falta | Falta | Falta | Editor cap. 1; escribir cap. 2 |
| 3 | Eco (`prompts`) | Editado | Editado | Editado | Editado | Mundo completo (19 + 4). Cami lo lee y publica |
| 4 | Órbita (`orbita`) | Editado (1-3 + p1) | Sin cerrar (4-7 + p2) | Falta | Falta | Editor cap. 2 (dinero y leyes); escribir cap. 3 |
| 5 | Brújula (`brujula`) | Editado (1-5 + p1) | Falta | Falta | Falta | Escribir cap. 2 |
| 6 | Forja (`forja`) | Sin cerrar (1-5 + p1) | Sin cerrar (6-9 + p2) | Falta | Falta | Crear PERSONAJES.md; cerrar y editar caps. 1 y 2 |
| 7 | Prisma (`prisma`) | Sin cerrar (1-5 + p1) | Falta | Falta | Falta | Crear PERSONAJES.md; cerrar y editar cap. 1 |
| 8 | Nexo (`nexo`) | Autorrevisado (1-4 + p1) | Falta | Falta | Falta | Editor cap. 1; probar el "droide" con el modelo real |
| 9 | Taller (`taller`) | A medias (solo 1) | Falta | Falta | Falta | Terminar cap. 1 (2-4 + p1) y PERSONAJES.md |
| 10 | Horizonte (`horizonte`) | Autorrevisado (1-5 + p1) | Falta | Falta | Falta | Editor cap. 1 (datos con fecha) |
| 11 | Autómata (`automata`) | A medias (1-4, sin p1) | Falta | Falta | Falta | p1 + PERSONAJES.md; cerrar y editar |
| 12 | Núcleo (`nucleo`) | A medias (1-4, sin p1) | Falta | Falta | Falta | p1 + PERSONAJES.md; cerrar y editar |

## Cómo seguir sin trabarse (acordado con Cami el 2026-09-26)

- Tandas **pequeñas: 3 o 4 agentes a la vez**, no 12. Al cerrar cada tanda: validar, copiar al
  computador de Cami y actualizar este archivo. Así nada queda solo en la copia de trabajo.
- Orden: primero **cerrar lo que está sin cerrar o a medias** (Origen 2, Órbita 2, Forja 1-2,
  Prisma 1, Taller 1, Autómata 1, Núcleo 1), luego **editores independientes** de lo autorrevisado
  (Lexia 1, Nexo 1, Horizonte 1), y después capítulos nuevos, un mundo por agente.
- En paralelo entre mundos, en orden dentro de cada mundo (cada escritor lee lo ya escrito de su mundo).

## Pendientes que decide Cami

- Las 17 decisiones abiertas del `INDICE.md` (sección 4). Mientras tanto se sigue la recomendación.
- Revisión profesional antes de publicar: salud (Órbita cap. 3), legal (Brújula 8, 9 y 12; Órbita
  cap. 2; Taller 16; Forja 15), finanzas (Órbita 4 y 7).
- Probar con el modelo real del Laboratorio los laboratorios simulados especiales: "pintor ciego"
  (Prisma), "droide" (Nexo), "ensamblador" (Taller) y "banda" (Autómata).
- Nombres cambiados por los agentes respecto a los temarios (anotados en cada PERSONAJES.md).

## Técnico

- La semilla ya no va dentro de la app: `scripts/generar-semilla.mjs` arma
  `src/lib/misiones/semilla.ts` (solo servidor) y el sitio publica cada misión como archivo
  estático en `/semilla/<id>` (lista en `/semilla`). Se regenera sola en `npm run dev` y en cada
  publicación; basta con guardar el `.json` en la carpeta de su mundo.
