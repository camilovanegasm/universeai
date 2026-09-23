"use client";

import { useEffect, useRef, useState } from "react";
import type { Idioma } from "@/lib/i18n";
import { dibujarPunti, RECORTES } from "@/lib/puntiSprite";
import { sonar } from "@/lib/sonido";
import { temblar } from "@/lib/juegos/utiles";
import {
  MUNDO, META, PUNTI_X, crearMundo, crearPiloto, impulsar, avanzar,
  cerebroAlAzar, decide, siguienteGeneracion, type Mundo, type Piloto, type Cerebro,
} from "@/lib/juegos/flap";

/**
 * Punti Flap, en sus dos modos:
 *  - "jugar": la persona vuela. Pasar META portales gana.
 *  - "ia": 40 Puntis con un cerebro al azar aprenden solos, generación tras
 *    generación (neuroevolución, ver lib/juegos/flap.ts).
 *
 * Todo lo que cambia en cada cuadro (posiciones, partículas, portales) vive
 * en refs y se dibuja en un canvas: React solo se entera cuando cambia algo
 * que se lee en pantalla (puntos, generación).
 */

const TX: Record<Idioma, Record<string, string>> = {
  es: {
    toca: "TOCA PARA DESPEGAR",
    meta: "¡META! SIGUE POR TU RECORD",
    lienzo: "Juego Punti Flap. Toca o pulsa espacio para impulsarte.",
    gen: "GEN",
    vivos: "VIVOS",
    mejor: "MEJOR",
    recordIa: "RÉCORD IA",
    velocidad: "Velocidad",
    reiniciar: "EMPEZAR DE CERO",
    lienzoIa: "40 Puntis controlados por una IA aprendiendo a volar.",
    ia1: "Generación 1: ninguno sabe volar. Sus cerebros son números al azar, así que se impulsan sin sentido.",
    ia2: "Los que llegaron más lejos le pasan su cerebro a la siguiente generación, con pequeños cambios al azar. Los demás se descartan.",
    ia3: "Ya pasa portales. Nadie le explicó las reglas: aprendió probando, fallando y quedándose con lo que funcionó.",
    ia4: "¡Domina el juego! Esto se llama neuroevolución. Las IA como los chatbots aprenden con otro método, pero la idea de fondo es la misma: ajustar números hasta que salga bien.",
  },
  en: {
    toca: "TAP TO TAKE OFF",
    meta: "GOAL! KEEP GOING FOR YOUR BEST",
    lienzo: "Punti Flap game. Tap or press space to boost.",
    gen: "GEN",
    vivos: "ALIVE",
    mejor: "BEST",
    recordIa: "AI RECORD",
    velocidad: "Speed",
    reiniciar: "START OVER",
    lienzoIa: "40 Puntis controlled by an AI learning to fly.",
    ia1: "Generation 1: none of them can fly. Their brains are random numbers, so they boost for no reason.",
    ia2: "The ones that got furthest pass their brain to the next generation, with small random changes. The rest are dropped.",
    ia3: "It's getting through portals now. Nobody explained the rules: it learned by trying, failing and keeping what worked.",
    ia4: "It's mastered the game! This is called neuroevolution. AIs like chatbots learn with a different method, but the core idea is the same: adjust numbers until it works.",
  },
};

const POBLACION = 40;
/** Con este puntaje en una generación, la IA ya "domina" y se detiene. */
const DOMINA = 50;
const PASO_MS = 1000 / 60;

type Chispa = { x: number; y: number; vx: number; vy: number; vida: number; color: string };

/** Estrellas del fondo: fijas, generadas una vez. */
const ESTRELLAS = Array.from({ length: 34 }, (_, i) => ({
  x: (i * 53) % MUNDO.ancho,
  y: (i * 97) % (MUNDO.suelo - 10),
  capa: 1 + (i % 3),
}));

function spriteCabeza(): HTMLCanvasElement {
  const r = RECORTES.cabeza;
  const c = document.createElement("canvas");
  c.width = r.w;
  c.height = r.h;
  const ctx = c.getContext("2d");
  if (ctx) dibujarPunti(ctx, "online", 1, "cabeza");
  return c;
}

function reducido() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export default function PuntiFlap({
  modo,
  idioma,
  alTerminar,
}: {
  modo: "jugar" | "ia";
  idioma: Idioma;
  /** Solo en modo "jugar": se llama al chocar, con los portales pasados. */
  alTerminar?: (portales: number) => void;
}) {
  const t = TX[idioma];
  const lienzo = useRef<HTMLCanvasElement>(null);
  const marco = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(2);

  // Lo que se ve fuera del canvas: cambia pocas veces por segundo como mucho.
  const [puntos, setPuntos] = useState(0);
  const [estado, setEstado] = useState<"listo" | "volando" | "fin">("listo");
  const [meta, setMeta] = useState(false);
  const [gen, setGen] = useState(1);
  const [vivos, setVivos] = useState(POBLACION);
  const [mejorGen, setMejorGen] = useState(0);
  const [recordIa, setRecordIa] = useState(0);
  const [velocidad, setVelocidad] = useState(1);
  const [reinicio, setReinicio] = useState(0);

  const estadoRef = useRef<"listo" | "volando" | "fin">("listo");
  const velocidadRef = useRef(1);
  const alTerminarRef = useRef(alTerminar);
  useEffect(() => {
    alTerminarRef.current = alTerminar;
  }, [alTerminar]);
  useEffect(() => {
    velocidadRef.current = velocidad;
  }, [velocidad]);

  // El canvas se amplía por un número entero (pixeles nítidos) que quepa en el ancho.
  useEffect(() => {
    const el = marco.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const ancho = e.contentRect.width;
      const altoLibre = window.innerHeight - 190;
      setEscala(Math.max(1, Math.min(4, Math.floor(Math.min(ancho / MUNDO.ancho, altoLibre / MUNDO.alto)))));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* ------------------------------------------------------------ bucle */
  const impulsoRef = useRef<() => void>(() => {});

  useEffect(() => {
    const cv = lienzo.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const sinMovimiento = reducido();
    const cabeza = spriteCabeza();
    const chispas: Chispa[] = [];
    let mundo: Mundo = crearMundo();
    let pilotos: Piloto[] = [crearPiloto()];
    let cerebros: Cerebro[] = [];
    let generacion = 1;
    let recordTotal = 0;
    let dominado = false;
    let ultimoVivos = POBLACION;
    let ultimoMejor = 0;
    let anterior = performance.now();
    let acumulado = 0;
    let cuadro = 0;
    let raf = 0;
    let finEn = 0;

    if (modo === "ia") {
      cerebros = Array.from({ length: POBLACION }, cerebroAlAzar);
      pilotos = cerebros.map(() => crearPiloto());
      estadoRef.current = "volando";
    } else {
      estadoRef.current = "listo";
    }

    function chispa(x: number, y: number, n: number, colores: string[], fuerza = 1) {
      if (sinMovimiento) return;
      for (let i = 0; i < n; i++) {
        chispas.push({
          x, y,
          vx: (Math.random() - 0.5) * 2.4 * fuerza - 0.6,
          vy: (Math.random() - 0.5) * 2.4 * fuerza,
          vida: 20 + Math.random() * 18,
          color: colores[i % colores.length],
        });
      }
    }

    impulsoRef.current = () => {
      if (modo !== "jugar") return;
      if (estadoRef.current === "fin") return;
      if (estadoRef.current === "listo") {
        estadoRef.current = "volando";
        setEstado("volando");
      }
      impulsar(pilotos[0]);
      sonar("aleteo");
      chispa(PUNTI_X - 8, pilotos[0].y + 7, 5, ["#b400ff", "#ff006e", "#ffe600"], 0.7);
    };

    function pasoJuego() {
      const p = pilotos[0];
      if (estadoRef.current === "listo") {
        // Flota esperando el primer toque.
        p.y = MUNDO.alto / 2 - 20 + Math.sin(cuadro / 14) * 4;
        return;
      }
      if (estadoRef.current === "fin") return;
      const pasaron = avanzar(mundo, pilotos);
      if (pasaron > 0) {
        setPuntos(p.puntos);
        if (p.puntos === META) {
          sonar("nivel");
          setMeta(true);
          chispa(PUNTI_X, p.y, 26, ["#00ff41", "#ffe600", "#00f5ff"], 2);
        } else {
          sonar(p.puntos % 5 === 0 ? "combo" : "acierto");
          chispa(PUNTI_X + 10, p.y, 8, ["#00f5ff", "#00ff41"]);
        }
      }
      if (!p.vivo) {
        estadoRef.current = "fin";
        setEstado("fin");
        sonar("choque");
        temblar(marco.current);
        chispa(PUNTI_X, p.y, 30, ["#ff006e", "#ffe600", "#b400ff", "#ffffff"], 2.2);
        finEn = cuadro + 50;
      }
    }

    function pasoIa() {
      if (dominado) return;
      avanzar(mundo, pilotos);
      pilotos.forEach((p, k) => {
        if (p.vivo && decide(cerebros[k], p, mundo)) impulsar(p);
      });
      let vivosAhora = 0;
      let mejor = 0;
      for (const p of pilotos) {
        if (p.vivo) vivosAhora++;
        if (p.puntos > mejor) mejor = p.puntos;
      }
      if (vivosAhora !== ultimoVivos) {
        ultimoVivos = vivosAhora;
        setVivos(vivosAhora);
      }
      if (mejor !== ultimoMejor) {
        ultimoMejor = mejor;
        setMejorGen(mejor);
        if (mejor > recordTotal) {
          recordTotal = mejor;
          setRecordIa(mejor);
        }
      }
      if (mejor >= DOMINA) {
        dominado = true;
        sonar("completa");
        return;
      }
      if (vivosAhora === 0) {
        cerebros = siguienteGeneracion(cerebros, pilotos);
        pilotos = cerebros.map(() => crearPiloto());
        mundo = crearMundo();
        generacion++;
        ultimoMejor = 0;
        setGen(generacion);
        setMejorGen(0);
        setVivos(POBLACION);
        ultimoVivos = POBLACION;
      }
    }

    function dibujar() {
      const c = ctx!;
      c.fillStyle = "#050510";
      c.fillRect(0, 0, MUNDO.ancho, MUNDO.alto);
      // Estrellas con paralaje: las lejanas se mueven más despacio.
      const avance = sinMovimiento ? 0 : mundo.cuadros;
      for (const e of ESTRELLAS) {
        const x = (((e.x - avance * 0.12 * e.capa) % MUNDO.ancho) + MUNDO.ancho) % MUNDO.ancho;
        c.fillStyle = e.capa === 3 ? "#8090a0" : "#2b3350";
        c.fillRect(Math.round(x), e.y, 1, 1);
      }
      // Portales: columnas oscuras con borde de neón y una boca más ancha.
      for (const q of mundo.portales) {
        const x = Math.round(q.x);
        const color = q.pasado ? "#00ff41" : "#00f5ff";
        const col = (y0: number, y1: number) => {
          if (y1 <= y0) return;
          c.fillStyle = "#0b0b1d";
          c.fillRect(x, y0, 22, y1 - y0);
          c.fillStyle = color;
          c.fillRect(x, y0, 2, y1 - y0);
          c.fillRect(x + 20, y0, 2, y1 - y0);
        };
        col(0, Math.round(q.hueco));
        col(Math.round(q.hueco + q.alto), MUNDO.suelo);
        c.fillStyle = color;
        c.fillRect(x - 2, Math.round(q.hueco) - 4, 26, 4);
        c.fillRect(x - 2, Math.round(q.hueco + q.alto), 26, 4);
      }
      // Suelo.
      c.fillStyle = "#07071a";
      c.fillRect(0, MUNDO.suelo, MUNDO.ancho, MUNDO.alto - MUNDO.suelo);
      c.fillStyle = "#00ff41";
      c.fillRect(0, MUNDO.suelo, MUNDO.ancho, 1);
      for (let x = -((avance * mundo.velocidad) % 8); x < MUNDO.ancho; x += 8) {
        c.fillStyle = "#0f3d1a";
        c.fillRect(Math.round(x), MUNDO.suelo + 4, 4, 1);
      }
      // Puntis: en modo IA, el mejor opaco y los demás transparentes.
      let mejor = 0;
      pilotos.forEach((p, k) => {
        if (p.vivo && p.cuadros > pilotos[mejor].cuadros) mejor = k;
      });
      pilotos.forEach((p, k) => {
        if (!p.vivo && modo === "ia") return;
        c.globalAlpha = modo === "ia" && k !== mejor ? 0.3 : 1;
        const y = Math.round(p.y);
        c.drawImage(cabeza, PUNTI_X - 11, y - 10);
        c.fillStyle = "#b400ff";
        c.fillRect(PUNTI_X - 10, y + 6, 20, 2);
        c.fillStyle = "#ff006e";
        c.fillRect(PUNTI_X - 12, y + 6, 2, 2);
      });
      c.globalAlpha = 1;
      // Chispas.
      for (let i = chispas.length - 1; i >= 0; i--) {
        const s = chispas[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.05;
        s.vida--;
        if (s.vida <= 0) {
          chispas.splice(i, 1);
          continue;
        }
        c.globalAlpha = Math.min(1, s.vida / 12);
        c.fillStyle = s.color;
        c.fillRect(Math.round(s.x), Math.round(s.y), 2, 2);
      }
      c.globalAlpha = 1;
    }

    function bucle(ahora: number) {
      // Si la pestaña estuvo oculta, no se "recupera" el tiempo perdido de golpe.
      acumulado += Math.min(ahora - anterior, 100);
      anterior = ahora;
      while (acumulado >= PASO_MS) {
        acumulado -= PASO_MS;
        cuadro++;
        if (modo === "jugar") pasoJuego();
        else for (let i = 0; i < velocidadRef.current; i++) pasoIa();
        if (finEn && cuadro >= finEn) {
          finEn = 0;
          alTerminarRef.current?.(pilotos[0].puntos);
        }
      }
      dibujar();
      raf = requestAnimationFrame(bucle);
    }
    raf = requestAnimationFrame(bucle);
    return () => cancelAnimationFrame(raf);
  }, [modo, reinicio]);

  // Teclado: espacio o flecha arriba, solo en modo jugar.
  useEffect(() => {
    if (modo !== "jugar") return;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        if (!e.repeat) impulsoRef.current();
      }
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [modo]);

  const textoIa = !recordIa ? t.ia1 : mejorGen >= DOMINA ? t.ia4 : recordIa >= 3 ? t.ia3 : t.ia2;

  return (
    <div className="flex w-full flex-col items-center gap-3">
      {modo === "ia" && (
        <div className="grid w-full max-w-[480px] grid-cols-4 gap-1 text-center font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.08em]">
          <Dato etiqueta={t.gen} valor={gen} color="var(--cyan)" />
          <Dato etiqueta={t.vivos} valor={vivos} color="var(--matrix)" />
          <Dato etiqueta={t.mejor} valor={mejorGen} color="var(--gold)" />
          <Dato etiqueta={t.recordIa} valor={recordIa} color="var(--pink)" />
        </div>
      )}

      <div ref={marco} className="relative w-full max-w-[640px]" style={{ touchAction: "manipulation" }}>
        <canvas
          ref={lienzo}
          width={MUNDO.ancho}
          height={MUNDO.alto}
          role="img"
          aria-label={modo === "ia" ? t.lienzoIa : t.lienzo}
          onPointerDown={(e) => {
            e.preventDefault();
            impulsoRef.current();
          }}
          className="mx-auto block cursor-pointer border-2 border-[var(--color-panel-border)] select-none"
          style={{ width: MUNDO.ancho * escala, height: MUNDO.alto * escala, imageRendering: "pixelated" }}
        />
        {modo === "jugar" && (
          <div className="pointer-events-none absolute inset-x-0 top-3 flex flex-col items-center gap-2">
            <span className="font-[family-name:var(--font-pixel)] text-[22px] text-white [text-shadow:0_2px_0_#05050f]">
              {puntos}
              <span className="text-[11px] text-[var(--muted)]">/{META}</span>
            </span>
            {meta && estado === "volando" && (
              <span className="juego-aviso border-2 border-[var(--matrix)] bg-[#05050f] px-2 py-1 font-[family-name:var(--font-pixel)] text-[8px] text-[var(--matrix)]">
                {t.meta}
              </span>
            )}
          </div>
        )}
        {modo === "jugar" && estado === "listo" && (
          <p className="pointer-events-none absolute inset-x-0 bottom-[22%] text-center font-[family-name:var(--font-pixel)] text-[10px] leading-[1.6] text-[var(--gold)] [text-shadow:0_2px_0_#05050f]">
            <span className="punto-transmision inline-block">▸</span> {t.toca}
          </p>
        )}
      </div>

      {modo === "ia" && (
        <>
          <div className="flex items-center gap-2" role="group" aria-label={t.velocidad}>
            {[1, 4, 16].map((v) => (
              <button
                key={v}
                onClick={() => setVelocidad(v)}
                aria-pressed={velocidad === v}
                className={`border-2 px-3 py-1.5 font-[family-name:var(--font-pixel)] text-[9px] ${
                  velocidad === v ? "border-[var(--cyan)] bg-[var(--cyan)] text-[#05050f]" : "border-[var(--color-panel-border)] text-[var(--muted)]"
                }`}
              >
                x{v}
              </button>
            ))}
            <button
              onClick={() => {
                setGen(1);
                setVivos(POBLACION);
                setMejorGen(0);
                setRecordIa(0);
                setReinicio((n) => n + 1);
              }}
              className="border-2 border-[var(--color-panel-border)] px-3 py-1.5 font-[family-name:var(--font-pixel)] text-[9px] text-[var(--muted)] hover:border-[var(--pink)] hover:text-[var(--pink)]"
            >
              {t.reiniciar}
            </button>
          </div>
          <p aria-live="polite" className="w-full max-w-[480px] border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] p-3 text-[14.5px] leading-[1.55] text-white">
            {textoIa}
          </p>
        </>
      )}
    </div>
  );
}

function Dato({ etiqueta, valor, color }: { etiqueta: string; valor: number; color: string }) {
  return (
    <span className="border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] px-1 py-1">
      <span className="block text-[var(--muted)]">{etiqueta}</span>
      <span className="block font-[family-name:var(--font-pixel)] text-[13px]" style={{ color }}>
        {valor}
      </span>
    </span>
  );
}
