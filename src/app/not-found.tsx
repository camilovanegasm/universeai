"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useIdioma } from "@/lib/useIdioma";
import type { Idioma } from "@/lib/i18n";
import PuntiPixel from "@/components/PuntiPixel";

/**
 * La página 404: te caíste en un agujero de gusano.
 *
 * El túnel se dibuja en un canvas pequeño (240 × 135) que se amplía con
 * image-rendering: pixelated, así queda en pixel art como Punti. Son anillos
 * de pixeles que vienen del fondo y se agrandan al acercarse, con un giro
 * suave y estrellas que salen disparadas del centro. El centro del túnel
 * sigue al mouse (o al dedo) con suavidad, y los anillos cercanos se corren al
 * lado contrario: eso da la sensación de profundidad (paralaje).
 *
 * Con prefers-reduced-motion se pinta un solo cuadro quieto. La animación se
 * detiene sola cuando la pestaña no se ve (requestAnimationFrame).
 */

const TX: Record<Idioma, { eyebrow: string; titulo: string; texto: string; ruta: string; volver: string; portada: string }> = {
  es: {
    eyebrow: "// ERROR 404 · COORDENADAS DESCONOCIDAS",
    titulo: "Te caíste en un agujero de gusano",
    texto:
      "Tranquilo, astronauta, a mí también me ha pasado. Esta página no existe o se la tragó el infinito. Súbete a mi tabla y te llevo de vuelta a casa.",
    ruta: "Ruta perdida",
    volver: "VOLVER A MIS MUNDOS",
    portada: "IR A LA PORTADA",
  },
  en: {
    eyebrow: "// ERROR 404 · UNKNOWN COORDINATES",
    titulo: "You fell into a wormhole",
    texto:
      "Don't worry, astronaut, it's happened to me too. This page doesn't exist, or the infinite swallowed it. Hop on my board and I'll fly you back home.",
    ruta: "Lost route",
    volver: "BACK TO MY WORLDS",
    portada: "GO TO THE HOME PAGE",
  },
};

const W = 240;
const H = 135;
const COLORES = ["#00f5ff", "#b400ff", "#00ff41", "#ff006e"];
const ANILLOS = 30;

function Agujero() {
  const lienzo = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = lienzo.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const quieto = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Estrellas: salen del centro y se aceleran al acercarse.
    const estrellas = Array.from({ length: 70 }, () => ({ a: Math.random() * Math.PI * 2, d: Math.random() }));

    // Hacia dónde apunta el mouse, de -1 a 1 en cada eje. `obj` es donde está
    // el puntero; `pos` lo persigue un poco cada cuadro, así el túnel se mueve
    // con suavidad y no a saltos.
    const obj = { x: 0, y: 0 };
    const pos = { x: 0, y: 0 };
    const mover = (e: PointerEvent) => {
      obj.x = (e.clientX / window.innerWidth) * 2 - 1;
      obj.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const soltar = () => {
      obj.x = 0;
      obj.y = 0;
    };
    if (!quieto) {
      window.addEventListener("pointermove", mover, { passive: true });
      document.addEventListener("pointerleave", soltar);
    }

    let cuadro = 0;
    const dibujar = (ms: number) => {
      const t = ms / 1000;
      pos.x += (obj.x - pos.x) * 0.06;
      pos.y += (obj.y - pos.y) * 0.06;
      ctx.fillStyle = "#05050f";
      ctx.fillRect(0, 0, W, H);

      // El centro del túnel se mece un poco: da la sensación de caer girando.
      const cx = W / 2 + Math.sin(t * 0.6) * 6 + pos.x * W * 0.22;
      // Un poco arriba del centro: el infinito queda justo detrás de Punti.
      const cy = H * 0.33 + Math.cos(t * 0.45) * 4 + pos.y * H * 0.22;

      // Brillo del fondo: el "infinito".
      for (let r = 10; r > 0; r--) {
        ctx.fillStyle = `rgba(200, 255, 240, ${0.05 + (10 - r) * 0.012})`;
        ctx.fillRect(Math.round(cx - r), Math.round(cy - r * 0.6), r * 2, Math.round(r * 1.2));
      }

      // Anillos, del más lejano al más cercano.
      for (let j = ANILLOS; j >= 0; j--) {
        const avance = (t * 0.35) % 1;
        const prof = (j - avance) / ANILLOS; // 1 = al fondo, 0 = encima tuyo
        if (prof <= 0.02) continue;
        const radio = 5 / prof;
        if (radio > W) continue;
        // Cada anillo está un poco corrido según su profundidad: el túnel se tuerce.
        // Los anillos cercanos se van al lado contrario del mouse (paralaje).
        const ox = cx + Math.sin(t * 0.8 + prof * 5) * (1 - prof) * 18 - pos.x * (1 - prof) * 70;
        const oy = cy + Math.cos(t * 0.7 + prof * 4) * (1 - prof) * 10 - pos.y * (1 - prof) * 40;
        const color = COLORES[(j + Math.floor(t * 0.35)) % COLORES.length];
        const opacidad = Math.min(1, (1 - prof) * 1.6) * (prof < 0.12 ? prof / 0.12 : 1);
        ctx.fillStyle = color;
        ctx.globalAlpha = opacidad;
        const puntos = Math.max(28, Math.floor(radio * 3.2));
        const giro = t * 0.5 + prof * 2.5;
        for (let k = 0; k < puntos; k++) {
          // Uno de cada cuatro pixeles falta: los anillos se ven "digitales".
          if ((k + j) % 4 === 0) continue;
          const ang = giro + (k / puntos) * Math.PI * 2;
          const x = Math.round(ox + Math.cos(ang) * radio);
          const y = Math.round(oy + Math.sin(ang) * radio * 0.62);
          if (x >= 0 && x < W && y >= 0 && y < H) ctx.fillRect(x, y, 1, 1);
        }
      }
      ctx.globalAlpha = 1;

      // Estrellas.
      ctx.fillStyle = "#ffffff";
      for (const e of estrellas) {
        if (!quieto) e.d += 0.004 + e.d * 0.02;
        if (e.d > 1.2) {
          e.d = 0.02;
          e.a = Math.random() * Math.PI * 2;
        }
        const r = e.d * e.d * W * 0.7;
        const x = Math.round(cx + Math.cos(e.a) * r);
        const y = Math.round(cy + Math.sin(e.a) * r * 0.62);
        const largo = e.d > 0.6 ? 2 : 1;
        ctx.globalAlpha = Math.min(1, e.d * 1.5);
        ctx.fillRect(x, y, largo, 1);
      }
      ctx.globalAlpha = 1;

      if (!quieto) cuadro = requestAnimationFrame(dibujar);
    };

    cuadro = requestAnimationFrame(dibujar);
    return () => {
      cancelAnimationFrame(cuadro);
      window.removeEventListener("pointermove", mover);
      document.removeEventListener("pointerleave", soltar);
    };
  }, []);

  return (
    <canvas
      ref={lienzo}
      width={W}
      height={H}
      aria-hidden="true"
      className="agujero-gusano pointer-events-none fixed inset-0 h-full w-full object-cover"
    />
  );
}

export default function NoEncontrada() {
  const idioma = useIdioma();
  const t = TX[idioma];
  const ruta = usePathname();
  const { usuario } = useAuth();

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <Agujero />
      {/* Viñeta: oscurece los bordes para que el texto se lea sobre el túnel. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(5,5,15,0.85)_85%)]" />

      <main className="relative z-10 mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center gap-5 px-4 py-10 text-center">
        <div className="punti-perdido">
          <PuntiPixel estado="info" ancho={150} />
        </div>

        <div className="flex flex-col items-center gap-3 border-2 border-[rgba(0,245,255,0.45)] bg-[rgba(5,5,16,0.82)] px-5 py-6 backdrop-blur-sm sm:px-8">
          <p className="font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.18em] text-[var(--cyan)]">{t.eyebrow}</p>
          <h1 className="font-[family-name:var(--font-display)] text-[24px] font-black leading-tight text-white [text-wrap:balance] sm:text-[30px]">
            {t.titulo}
          </h1>
          <p className="max-w-[44ch] text-[15.5px] leading-[1.65] text-[#c9d2e3]">{t.texto}</p>
          <p className="max-w-full truncate font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.08em] text-[var(--muted)]">
            {t.ruta}: <span className="text-[var(--pink)]">{ruta}</span>
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            <Link href={usuario ? "/inicio" : "/"} className="boton-pixel boton-pixel-lleno">
              {usuario ? t.volver : t.portada}
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
