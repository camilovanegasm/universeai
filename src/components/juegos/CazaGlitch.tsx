"use client";

import { useEffect, useRef, useState } from "react";
import type { Idioma } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import { ESCENAS, LIENZO, type Escena } from "@/lib/juegos/escenas";
import { mezclar, temblar } from "@/lib/juegos/utiles";
import type { FinJuego } from "@/components/juegos/MarcoJuego";

/**
 * Caza el glitch: escenas en pixel art "hechas por una IA", cada una con 3
 * errores escondidos. Se toca donde se ve algo raro, contra reloj. Tocar
 * donde no hay nada quita tiempo, para que no gane quien toca al azar.
 */

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    escena: "ESCENA",
    de: "DE",
    errores: "errores",
    siguiente: "SIGUIENTE ESCENA",
    terminar: "VER RESULTADO",
    lienzo: "Escena para buscar errores. Toca donde veas algo raro.",
    seAcabo: "Se acabó el tiempo. Estos eran los errores:",
    todos: "¡Los encontraste todos!",
    nota: "Ojo: las herramientas de imagen mejoran rápido y cada vez cometen menos errores. Si una imagen importa, busca de dónde salió.",
  },
  en: {
    escena: "SCENE",
    de: "OF",
    errores: "mistakes",
    siguiente: "NEXT SCENE",
    terminar: "SEE RESULT",
    lienzo: "A scene to search for mistakes. Tap wherever something looks off.",
    seAcabo: "Time's up. These were the mistakes:",
    todos: "You found them all!",
    nota: "Heads up: image tools improve fast and make fewer mistakes every month. If an image matters, find out where it came from.",
  },
};

const SEGUNDOS = 25;
const CASTIGO = 2;
/** Margen alrededor de cada error, en pixeles lógicos: el dedo no es un puntero fino. */
const MARGEN = 2;

export default function CazaGlitch({ idioma, alTerminar }: { idioma: Idioma; alTerminar: (fin: FinJuego) => void }) {
  const t = TX[idioma];
  const [escenas] = useState<Escena[]>(() => mezclar(ESCENAS));
  const [indice, setIndice] = useState(0);
  const [halladas, setHalladas] = useState<number[]>([]);
  const [fase, setFase] = useState<"buscando" | "revision">("buscando");
  const [restante, setRestante] = useState(SEGUNDOS);
  const [puntos, setPuntos] = useState(0);
  const [total, setTotal] = useState(0);
  const [escala, setEscala] = useState(3);

  const lienzo = useRef<HTMLCanvasElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const finRef = useRef(0); // hora (ms) en que se acaba la escena
  const escena = escenas[indice];

  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      setEscala(Math.max(2, Math.min(6, Math.floor(e.contentRect.width / LIENZO.ancho))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Dibuja la escena y marca los errores (verde los hallados; en la
  // revisión, amarillo los que se pasaron).
  useEffect(() => {
    const c = lienzo.current?.getContext("2d");
    if (!c) return;
    escena.dibujar(c);
    escena.glitches.forEach((g, i) => {
      const hallada = halladas.includes(i);
      if (!hallada && fase !== "revision") return;
      c.fillStyle = hallada ? "#00ff41" : "#ffe600";
      const x = g.x - 1;
      const y = g.y - 1;
      const w = g.w + 2;
      const h = g.h + 2;
      c.fillRect(x, y, w, 1);
      c.fillRect(x, y + h - 1, w, 1);
      c.fillRect(x, y, 1, h);
      c.fillRect(x + w - 1, y, 1, h);
    });
  }, [escena, halladas, fase]);

  // Reloj: marca el final y revisa 5 veces por segundo (no cada cuadro).
  useEffect(() => {
    if (fase !== "buscando") return;
    finRef.current = Date.now() + SEGUNDOS * 1000;
    const id = setInterval(() => {
      const quedan = Math.max(0, Math.ceil((finRef.current - Date.now()) / 1000));
      setRestante(quedan);
      if (quedan <= 0) {
        setFase("revision");
        sonar("sinGasolina");
      }
    }, 200);
    return () => clearInterval(id);
  }, [fase, indice]);

  function tocar(e: React.PointerEvent<HTMLCanvasElement>) {
    if (fase !== "buscando") return;
    const caja = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - caja.left) / caja.width) * LIENZO.ancho;
    const y = ((e.clientY - caja.top) / caja.height) * LIENZO.alto;
    const i = escena.glitches.findIndex(
      (g) => x >= g.x - MARGEN && x <= g.x + g.w + MARGEN && y >= g.y - MARGEN && y <= g.y + g.h + MARGEN,
    );
    if (i === -1) {
      sonar("error");
      temblar(marco.current);
      finRef.current -= CASTIGO * 1000;
      return;
    }
    if (halladas.includes(i)) return;
    const nuevas = [...halladas, i];
    setHalladas(nuevas);
    setTotal((n) => n + 1);
    const segundosQuedan = Math.max(0, (finRef.current - Date.now()) / 1000);
    setPuntos((p) => p + 100 + (nuevas.length === escena.glitches.length ? Math.round(segundosQuedan) * 10 : 0));
    if (nuevas.length === escena.glitches.length) {
      sonar("combo");
      setFase("revision");
    } else {
      sonar("acierto");
    }
  }

  function siguiente() {
    sonar("pantalla");
    if (indice + 1 >= escenas.length) {
      const posibles = escenas.reduce((n, s) => n + s.glitches.length, 0);
      alTerminar({ gano: total >= Math.ceil(posibles * 0.66), puntos, resumen: `${total}/${posibles}`, nota: t.nota });
      return;
    }
    setIndice((i) => i + 1);
    setHalladas([]);
    setRestante(SEGUNDOS);
    setFase("buscando");
  }

  const completa = halladas.length === escena.glitches.length;
  const ultima = indice + 1 >= escenas.length;

  return (
    <div className="flex w-full max-w-[600px] flex-col gap-3">
      {/* Una sola línea siempre: si el puntaje crece y el título salta a dos
          líneas, la escena se corre justo cuando la persona va a tocar. */}
      <div className="flex items-center gap-2 font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.12em] text-[var(--muted)]">
        <span className="min-w-0 flex-1 truncate">
          {t.escena} {indice + 1} {t.de} {escenas.length} · {escena.nombre[idioma]}
        </span>
        <span className="shrink-0 font-[family-name:var(--font-pixel)] text-[11px] tabular-nums text-[var(--gold)]">{puntos}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-2 flex-1 bg-white/10">
          <div
            className="h-full bg-[var(--cyan)] shadow-[0_0_8px_var(--cyan)] transition-transform duration-200 ease-linear"
            style={{ transform: `scaleX(${restante / SEGUNDOS})`, transformOrigin: "left" }}
          />
        </div>
        <span className="w-10 text-right font-[family-name:var(--font-pixel)] text-[10px] text-white">{restante}s</span>
        <span className="font-[family-name:var(--font-terminal)] text-[16px] text-[var(--matrix)]">
          {halladas.length}/{escena.glitches.length}
        </span>
      </div>

      <div ref={marco} className="w-full">
        <canvas
          ref={lienzo}
          width={LIENZO.ancho}
          height={LIENZO.alto}
          role="img"
          aria-label={t.lienzo}
          onPointerDown={tocar}
          className="mx-auto block cursor-crosshair border-2 border-[var(--color-panel-border)]"
          style={{ width: LIENZO.ancho * escala, height: LIENZO.alto * escala, imageRendering: "pixelated", touchAction: "manipulation" }}
        />
      </div>

      <ul aria-live="polite" className="flex flex-col gap-1.5">
        {fase === "revision" && !completa && <li className="text-[14px] text-[var(--gold)]">{t.seAcabo}</li>}
        {fase === "revision" && completa && <li className="text-[14px] text-[var(--matrix)]">{t.todos}</li>}
        {escena.glitches.map((g, i) =>
          halladas.includes(i) || fase === "revision" ? (
            <li
              key={i}
              className={`juego-aviso border-l-4 bg-[rgba(10,10,30,0.88)] px-3 py-2 text-[14px] leading-[1.45] text-white ${
                halladas.includes(i) ? "border-[var(--matrix)]" : "border-[var(--gold)]"
              }`}
            >
              {g.texto[idioma]}
            </li>
          ) : null,
        )}
      </ul>

      {fase === "revision" && (
        <button onClick={siguiente} className="boton-pixel boton-pixel-lleno">
          {ultima ? t.terminar : t.siguiente}
        </button>
      )}
    </div>
  );
}
