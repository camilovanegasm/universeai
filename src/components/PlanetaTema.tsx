"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * El tema por dentro: un planeta que se gira de verdad.
 *
 * Los subtemas viven en coordenadas (lat, lon) sobre una esfera y se proyectan
 * a la pantalla; girar es cambiar un ángulo, no una animación fingida. Se
 * reparten en espiral, así avanzar por el temario es darle la vuelta al mundo.
 *
 * El globo se dibuja en canvas (cientos de puntos por cuadro) y los nodos son
 * <button> reales encima, para que funcionen con teclado y lector de pantalla.
 *
 * Hay también vista de lista: el globo es la llegada, la lista es la
 * herramienta. Quien va de afán no paga el peaje. La preferencia se recuerda.
 */

export type SubtemaEnPlaneta = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  completado: boolean;
  disponible: boolean;
};

type Props = {
  color: string;
  subtemas: SubtemaEnPlaneta[];
  onAbrir: (subtemaId: string) => void;
};

type Nodo = SubtemaEnPlaneta & { lat: number; lon: number; boton: HTMLButtonElement };

const CLAVE_VISTA = "punti-vista-tema";

/**
 * La preferencia globo/lista vive en localStorage, que es un almacén externo
 * al render. useSyncExternalStore es la forma correcta de leerlo: evita
 * setState dentro de un efecto y no rompe la hidratación, porque en el
 * servidor siempre devuelve "globo".
 */
const oyentes = new Set<() => void>();

function suscribirVista(alCambiar: () => void) {
  oyentes.add(alCambiar);
  return () => {
    oyentes.delete(alCambiar);
  };
}

function leerVista() {
  try {
    return localStorage.getItem(CLAVE_VISTA) === "lista";
  } catch {
    return false;
  }
}

function leerVistaEnServidor() {
  return false;
}

function guardarVista(lista: boolean) {
  try {
    localStorage.setItem(CLAVE_VISTA, lista ? "lista" : "globo");
  } catch {
    /* ventana privada o datos bloqueados: la vista igual cambia */
  }
  oyentes.forEach((alCambiar) => alCambiar());
}

// Reparto Fibonacci: distribuye puntos parejo sobre la esfera.
const ESFERA = (() => {
  const N = 900;
  const puntos: { lat: number; lon: number; tierra: boolean }[] = [];
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2;
    const lat = Math.asin(y);
    const lon = (Math.PI * (3 - Math.sqrt(5)) * i) % (Math.PI * 2);
    const ruido =
      Math.sin(lat * 2.3 + 1.1) * Math.cos(lon * 1.85 + 0.6) +
      Math.sin(lon * 3.2 + lat * 1.6) * 0.5 +
      Math.cos(lat * 4.1 - lon * 0.9) * 0.3;
    puntos.push({ lat, lon, tierra: ruido > 0.08 });
  }
  return puntos;
})();

const hex2 = (v: number) =>
  Math.max(0, Math.min(255, Math.round(v * 255))).toString(16).padStart(2, "0");

export default function PlanetaTema({ color, subtemas, onAbrir }: Props) {
  const lienzoRef = useRef<HTMLCanvasElement>(null);
  const nodosRef = useRef<HTMLDivElement>(null);
  const [elegido, setElegido] = useState<number>(() => {
    const siguiente = subtemas.findIndex((s) => !s.completado);
    return siguiente === -1 ? 0 : siguiente;
  });
  const enLista = useSyncExternalStore(suscribirVista, leerVista, leerVistaEnServidor);

  const girarHaciaRef = useRef<((i: number) => void) | null>(null);
  const alElegir = useCallback((i: number) => {
    setElegido(i);
    girarHaciaRef.current?.(i);
  }, []);


  useEffect(() => {
    if (enLista) return;
    const lienzo = lienzoRef.current;
    const caja = nodosRef.current;
    if (!lienzo || !caja) return;
    const ctx = lienzo.getContext("2d");
    if (!ctx) return;

    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 1, H = 1, R = 1, cx = 0, cy = 0;
    let rot = 0;
    let inclinacion = -0.3;
    let rotMeta: number | null = null;
    let autoGiro = false;

    // Espiral alrededor del mundo. Con pocos subtemas se da menos vuelta, para
    // que siempre se vean varios a la vez.
    const n = subtemas.length;
    const vuelta = Math.PI * (1.05 + n * 0.095);
    const nodos: Nodo[] = subtemas.map((s, i) => {
      const f = n === 1 ? 0.5 : i / (n - 1);
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className =
        "absolute left-0 top-0 flex flex-col items-center gap-1.5 border-0 bg-transparent p-0 will-change-transform";
      boton.style.pointerEvents = "auto";
      boton.setAttribute(
        "aria-label",
        `Subtema ${s.numero}: ${s.titulo}. ${
          s.completado ? "Completado" : s.disponible ? "Disponible" : "En construcción"
        }`
      );
      const circulo = document.createElement("span");
      circulo.className =
        "grid h-8 w-8 place-items-center rounded-full border-2 font-[family-name:var(--font-display)] text-xs font-bold transition-shadow";
      if (s.completado) {
        circulo.style.background = color;
        circulo.style.borderColor = color;
        circulo.style.color = "#05050f";
        circulo.textContent = "✓";
      } else {
        circulo.style.background = s.disponible ? `${color}1f` : "transparent";
        circulo.style.borderColor = s.disponible ? color : "#3d4a60";
        circulo.style.color = s.disponible ? color : "#6d7b92";
        circulo.style.boxShadow = s.disponible ? `0 0 14px ${color}66` : "none";
        circulo.textContent = String(s.numero);
      }
      const texto = document.createElement("span");
      texto.className =
        "max-w-[210px] overflow-hidden text-ellipsis whitespace-nowrap rounded border border-[var(--color-panel-border)] bg-[rgba(5,5,15,0.9)] px-2 py-0.5 font-[family-name:var(--font-ui)] text-xs font-bold text-[#eaf5ea] opacity-0 transition-opacity";
      texto.textContent = s.titulo;
      boton.append(circulo, texto);
      boton.addEventListener("click", () => alElegir(i));
      boton.addEventListener("focus", () => alElegir(i));
      caja.appendChild(boton);
      return {
        ...s,
        lat: (f - 0.5) * 1.3,
        lon: f * vuelta,
        boton,
      };
    });

    rot = -(nodos[elegido]?.lon ?? 0);

    const proyectar = (lat: number, lon: number) => {
      const cl = Math.cos(lat), sl = Math.sin(lat), a = lon + rot;
      const x = cl * Math.sin(a), y = sl, z = cl * Math.cos(a);
      const ct = Math.cos(inclinacion), st = Math.sin(inclinacion);
      return { x: cx + x * R, y: cy - (y * ct - z * st) * R, z: y * st + z * ct };
    };

    const medir = () => {
      const r = lienzo.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; H = r.height;
      lienzo.width = Math.round(W * dpr);
      lienzo.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cx = W / 2; cy = H / 2;
      R = Math.min(W, H) * 0.37;
    };

    const trazo = (pts: [number, number][], alfa: number, ancho: number, col: string) => {
      ctx.lineWidth = ancho;
      let abierto = false;
      ctx.beginPath();
      for (const [lat, lon] of pts) {
        const q = proyectar(lat, lon);
        if (q.z <= 0.02) { abierto = false; continue; }
        if (!abierto) { ctx.moveTo(q.x, q.y); abierto = true; }
        else ctx.lineTo(q.x, q.y);
      }
      ctx.strokeStyle = col + hex2(alfa);
      ctx.stroke();
    };

    const dibujar = () => {
      if (!R) return;
      ctx.clearRect(0, 0, W, H);

      let g = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R * 1.45);
      g.addColorStop(0, color + "33");
      g.addColorStop(0.4, color + "12");
      g.addColorStop(1, color + "00");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.45, 0, 6.2832); ctx.fill();

      // El cuerpo va oscuro a propósito: lo que brilla son los continentes,
      // la ruta y el borde. Si el planeta brilla, los detalles se pierden.
      g = ctx.createRadialGradient(cx - R * 0.34, cy - R * 0.36, R * 0.04, cx, cy, R);
      g.addColorStop(0, color + "24");
      g.addColorStop(0.45, color + "0e");
      g.addColorStop(0.8, "#070713");
      g.addColorStop(1, "#04040e");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.fill();

      for (const p of ESFERA) {
        const q = proyectar(p.lat, p.lon);
        if (q.z <= 0) continue;
        const a = q.z * q.z;
        const rr = (p.tierra ? 1.8 : 0.8) * (0.42 + q.z * 0.72);
        ctx.fillStyle = color + hex2(p.tierra ? 0.95 * a : 0.13 * a);
        ctx.beginPath(); ctx.arc(q.x, q.y, rr, 0, 6.2832); ctx.fill();
        if (p.tierra && q.z > 0.45) {
          ctx.fillStyle = "#ffffff" + hex2(0.3 * a);
          ctx.beginPath(); ctx.arc(q.x, q.y, rr * 0.45, 0, 6.2832); ctx.fill();
        }
      }

      for (let m = 0; m < 12; m++) {
        const lon = (m * Math.PI) / 6;
        const pts: [number, number][] = [];
        for (let k = 0; k <= 30; k++) pts.push([-Math.PI / 2 + (k * Math.PI) / 30, lon]);
        trazo(pts, 0.1, 0.7, color);
      }
      for (let k = -3; k <= 3; k++) {
        const lat = (k * Math.PI) / 8;
        const pts: [number, number][] = [];
        for (let m = 0; m <= 48; m++) pts.push([lat, (m * Math.PI * 2) / 48]);
        trazo(pts, k === 0 ? 0.2 : 0.09, 0.7, color);
      }

      for (let i = 0; i < nodos.length - 1; i++) {
        const A = nodos[i], B = nodos[i + 1];
        const pts: [number, number][] = [];
        for (let k = 0; k <= 22; k++) {
          const t = k / 22;
          pts.push([A.lat + (B.lat - A.lat) * t, A.lon + (B.lon - A.lon) * t]);
        }
        const viva = A.completado;
        trazo(pts, viva ? 0.75 : 0.3, viva ? 1.8 : 1.2, viva ? color : "#5a6a86");
      }

      ctx.lineWidth = 1.6;
      ctx.strokeStyle = color + "d9";
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, 6.2832); ctx.stroke();

      nodos.forEach((nodo, i) => {
        const q = proyectar(nodo.lat, nodo.lon);
        const atras = q.z <= 0.04;
        const escala = 0.6 + Math.max(0, q.z) * 0.5;
        nodo.boton.style.transform = `translate(${q.x.toFixed(1)}px,${q.y.toFixed(
          1
        )}px) translate(-50%,-50%) scale(${escala.toFixed(3)})`;
        nodo.boton.style.opacity = atras ? "0" : (0.4 + q.z * 0.6).toFixed(2);
        nodo.boton.style.pointerEvents = atras ? "none" : "auto";
        nodo.boton.style.zIndex = String(200 + Math.round(q.z * 100));
        const etiqueta = nodo.boton.lastElementChild as HTMLElement;
        etiqueta.style.opacity = i === elegido ? "1" : "0";
      });
    };

    girarHaciaRef.current = (i: number) => {
      autoGiro = false;
      rotMeta = -(nodos[i]?.lon ?? 0);
    };

    // Girar con el dedo o el ratón.
    let girando = false, gx = 0, gy = 0;
    const abajo = (e: PointerEvent) => {
      girando = true; gx = e.clientX; gy = e.clientY;
      autoGiro = false; rotMeta = null;
      lienzo.style.cursor = "grabbing";
      try { lienzo.setPointerCapture(e.pointerId); } catch { /* sin captura */ }
    };
    const mover = (e: PointerEvent) => {
      if (!girando) return;
      rot -= (e.clientX - gx) * 0.006;
      inclinacion = Math.max(-0.95, Math.min(0.95, inclinacion + (e.clientY - gy) * 0.004));
      gx = e.clientX; gy = e.clientY;
    };
    const arriba = () => { girando = false; lienzo.style.cursor = "grab"; };

    lienzo.addEventListener("pointerdown", abajo as EventListener);
    lienzo.addEventListener("pointermove", mover as EventListener);
    lienzo.addEventListener("pointerup", arriba);
    lienzo.addEventListener("pointercancel", arriba);
    lienzo.addEventListener("pointerleave", arriba);

    let vivo = true;
    let ultimo = performance.now();
    const bucle = (ahora: number) => {
      if (!vivo) return;
      const dt = Math.min(64, ahora - ultimo);
      ultimo = ahora;
      if (rotMeta !== null) {
        let d = rotMeta - rot;
        while (d > Math.PI) d -= Math.PI * 2;
        while (d < -Math.PI) d += Math.PI * 2;
        rot += d * 0.11;
        if (Math.abs(d) < 0.003) { rot = rotMeta; rotMeta = null; }
      } else if (autoGiro && !girando && !reducido) {
        rot += 0.00013 * dt;
      }
      dibujar();
      requestAnimationFrame(bucle);
    };

    medir();
    dibujar();
    requestAnimationFrame(bucle);

    const observador = new ResizeObserver(() => { medir(); dibujar(); });
    observador.observe(lienzo);

    return () => {
      vivo = false;
      observador.disconnect();
      girarHaciaRef.current = null;
      nodos.forEach((nodo) => nodo.boton.remove());
    };
  }, [enLista, subtemas, color, elegido, alElegir]);

  const actual = subtemas[elegido];

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* alternador de vista */}
      <div className="flex justify-center px-4 pt-3">
        <div className="flex overflow-hidden rounded-lg border border-[var(--color-panel-border)]">
          {[
            { id: "globo", txt: "GLOBO", activo: !enLista },
            { id: "lista", txt: "LISTA", activo: enLista },
          ].map((b) => (
            <button
              key={b.id}
              onClick={() => guardarVista(b.id === "lista")}
              aria-pressed={b.activo}
              className="px-4 py-1.5 font-[family-name:var(--font-terminal)] text-xs tracking-[0.12em] transition-colors"
              style={
                b.activo
                  ? { background: `${color}2e`, color }
                  : { background: "transparent", color: "var(--muted)" }
              }
            >
              {b.txt}
            </button>
          ))}
        </div>
      </div>

      {enLista ? (
        <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
          <ol className="mx-auto flex w-full max-w-2xl flex-col gap-2">
            {subtemas.map((s) => (
              <li key={s.id}>
                <button
                  onClick={() => onAbrir(s.id)}
                  className="flex w-full items-center gap-4 rounded-xl border border-[var(--color-panel-border)] bg-[rgba(13,13,34,0.6)] py-3 pr-4 text-left transition-transform hover:translate-x-1"
                >
                  <span className="grid w-[52px] place-items-center">
                    <span
                      className="grid h-9 w-9 place-items-center rounded-full border-2 font-[family-name:var(--font-display)] text-sm font-bold"
                      style={
                        s.completado
                          ? { background: color, borderColor: color, color: "#05050f" }
                          : s.disponible
                            ? { background: `${color}1f`, borderColor: color, color }
                            : { borderColor: "#2b3350", color: "#6d7b92" }
                      }
                    >
                      {s.completado ? "✓" : s.numero}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-[family-name:var(--font-ui)] text-base font-semibold text-white">
                      {s.titulo}
                    </span>
                    <span className="mt-0.5 block font-[family-name:var(--font-terminal)] text-xs tracking-wider text-[var(--muted)]">
                      {s.completado ? "COMPLETADO" : s.disponible ? "DISPONIBLE" : "EN CONSTRUCCIÓN"}
                    </span>
                  </span>
                  <span style={{ color }} className="font-[family-name:var(--font-terminal)]">→</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <>
          <div className="relative min-h-0 flex-1">
            <canvas
              ref={lienzoRef}
              className="absolute inset-0 h-full w-full touch-none"
              style={{ cursor: "grab" }}
              aria-label="Planeta girable con los subtemas en su superficie"
            />
            <div ref={nodosRef} className="pointer-events-none absolute inset-0" />
            <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center font-[family-name:var(--font-terminal)] text-[11px] tracking-[0.14em] text-[#46536b]">
              ARRASTRA EL PLANETA PARA GIRARLO
            </p>
          </div>

          {/* ficha del subtema elegido */}
          {actual && (
            <div className="px-4 pb-4">
              <div className="mx-auto flex w-full max-w-2xl flex-wrap items-center gap-4 rounded-2xl border border-[var(--color-panel-border)] bg-[rgba(13,13,34,0.94)] p-4 backdrop-blur">
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 font-[family-name:var(--font-display)] text-sm font-bold"
                  style={
                    actual.completado
                      ? { background: color, borderColor: color, color: "#05050f" }
                      : actual.disponible
                        ? { background: `${color}1f`, borderColor: color, color }
                        : { borderColor: "#3d4a60", color: "#6d7b92" }
                  }
                >
                  {actual.completado ? "✓" : actual.numero}
                </span>
                <div className="min-w-[150px] flex-1">
                  <p className="font-[family-name:var(--font-ui)] text-base font-bold text-white">
                    {actual.titulo}
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-terminal)] text-xs tracking-wider text-[var(--muted)]">
                    {actual.completado
                      ? "COMPLETADO"
                      : actual.disponible
                        ? "DISPONIBLE"
                        : "EN CONSTRUCCIÓN"}
                  </p>
                </div>
                <button
                  onClick={() => onAbrir(actual.id)}
                  className="rounded-xl border px-5 py-2.5 font-[family-name:var(--font-ui)] text-sm font-bold uppercase tracking-wide transition-colors"
                  style={{ color, borderColor: color, background: `${color}1a` }}
                >
                  {actual.completado ? "Repasar" : actual.disponible ? "Empezar" : "Ver"}
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
