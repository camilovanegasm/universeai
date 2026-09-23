"use client";

import { useEffect, useRef } from "react";

/**
 * Campo de estrellas en pixel, con profundidad.
 *
 * Tres capas que se mueven a velocidades distintas: las del fondo casi no se
 * mueven, las del frente cruzan. Eso es lo que da sensación de profundidad sin
 * dibujar nada en 3D.
 *
 * Tres decisiones de rendimiento que importan:
 *
 * 1. **Se apaga cuando la pestaña no está visible.** Un bucle de animación
 *    corriendo en una pestaña de fondo gasta batería para nada. El navegador
 *    ya frena `requestAnimationFrame`, pero al volver dispara un salto de
 *    tiempo enorme; aquí se corta el bucle y se reinicia el reloj al volver.
 * 2. **Respeta `prefers-reduced-motion`.** Si está activo dibuja un solo
 *    cuadro y no arranca el bucle: se ve el cielo, pero quieto.
 * 3. **Usa `devicePixelRatio` y `ResizeObserver`.** Sin lo primero el pixel se
 *    ve borroso en pantallas densas; sin lo segundo el canvas no se entera
 *    cuando su contenedor cambia de tamaño.
 */

type Estrella = { x: number; y: number; z: number; t: number };

const CAPAS = [
  { cantidad: 46, vel: 2.6, tam: 2, alfa: 0.95 },  // frente
  { cantidad: 70, vel: 1.2, tam: 2, alfa: 0.6 },
  { cantidad: 96, vel: 0.5, tam: 1, alfa: 0.4 },   // fondo
];

const TINTES = ["#ffffff", "#c9ffd8", "#b9f4ff", "#e6c8ff"];

export default function CampoEstelar({ className = "" }: { className?: string }) {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = lienzo.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let ancho = 0;
    let alto = 0;
    let capas: Estrella[][] = [];
    let cuadro = 0;
    let ultimo = 0;
    let fugaz: { x: number; y: number; vida: number } | null = null;
    let proximaFugaz = 4000 + Math.random() * 6000;

    const sembrar = () => {
      capas = CAPAS.map((c) =>
        Array.from({ length: c.cantidad }, () => ({
          x: Math.random() * ancho,
          y: Math.random() * alto,
          z: Math.random(),
          t: Math.random(),
        })),
      );
    };

    const medir = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const caja = cv.getBoundingClientRect();
      ancho = Math.max(1, Math.round(caja.width));
      alto = Math.max(1, Math.round(caja.height));
      cv.width = Math.round(ancho * dpr);
      cv.height = Math.round(alto * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = false;
      sembrar();
    };

    const pintar = (dt: number) => {
      ctx.clearRect(0, 0, ancho, alto);

      capas.forEach((estrellas, i) => {
        const c = CAPAS[i];
        for (const e of estrellas) {
          if (!quieto) {
            e.x -= c.vel * dt * 0.06;
            if (e.x < -2) {
              e.x = ancho + 2;
              e.y = Math.random() * alto;
            }
            e.t += dt * 0.0016;
          }
          // parpadeo suave: las del frente titilan más que las del fondo
          const titileo = 0.72 + 0.28 * Math.sin(e.t * 2 + e.z * 9);
          ctx.globalAlpha = c.alfa * titileo;
          ctx.fillStyle = TINTES[Math.floor(e.z * TINTES.length) % TINTES.length];
          // Math.round mantiene la estrella pegada a la rejilla de pixeles:
          // sin esto el navegador la reparte entre dos columnas y se ve gris.
          ctx.fillRect(Math.round(e.x), Math.round(e.y), c.tam, c.tam);
        }
      });

      // estrella fugaz de vez en cuando; nunca dos a la vez
      if (!quieto) {
        proximaFugaz -= dt;
        if (!fugaz && proximaFugaz <= 0) {
          fugaz = { x: ancho * (0.3 + Math.random() * 0.6), y: alto * Math.random() * 0.5, vida: 1 };
          proximaFugaz = 7000 + Math.random() * 9000;
        }
        if (fugaz) {
          fugaz.x -= dt * 0.9;
          fugaz.y += dt * 0.34;
          fugaz.vida -= dt * 0.0013;
          if (fugaz.vida <= 0) {
            fugaz = null;
          } else {
            ctx.globalAlpha = Math.max(0, fugaz.vida) * 0.9;
            ctx.fillStyle = "#c9ffd8";
            for (let k = 0; k < 10; k++) {
              ctx.globalAlpha = Math.max(0, fugaz.vida) * (1 - k / 10) * 0.9;
              ctx.fillRect(Math.round(fugaz.x + k * 3), Math.round(fugaz.y - k * 1.1), 2, 2);
            }
          }
        }
      }

      ctx.globalAlpha = 1;
    };

    const bucle = (ahora: number) => {
      const dt = Math.min(48, ahora - ultimo); // tope: evita saltos al volver
      ultimo = ahora;
      pintar(dt);
      cuadro = requestAnimationFrame(bucle);
    };

    const arrancar = () => {
      if (quieto || cuadro) return;
      ultimo = performance.now();
      cuadro = requestAnimationFrame(bucle);
    };
    const parar = () => {
      if (!cuadro) return;
      cancelAnimationFrame(cuadro);
      cuadro = 0;
    };

    const alCambiarVisibilidad = () => (document.hidden ? parar() : arrancar());

    const observador = new ResizeObserver(() => {
      medir();
      pintar(0);
    });

    medir();
    pintar(0);
    arrancar();

    observador.observe(cv);
    document.addEventListener("visibilitychange", alCambiarVisibilidad);

    return () => {
      parar();
      observador.disconnect();
      document.removeEventListener("visibilitychange", alCambiarVisibilidad);
    };
  }, []);

  return <canvas ref={lienzo} aria-hidden="true" className={`campo-estelar ${className}`} />;
}
