"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Mapa galáctico de temas.
 *
 * Cada tema es un planeta en una órbita elíptica alrededor de Punti, que es
 * la fuente del conocimiento (no hay un "sol": es él). El tamaño del planeta
 * sale del número de subtemas, así el mapa dice de un vistazo qué tan grande
 * es cada mundo antes de entrar.
 *
 * Decisión de producto (ver src/lib/temas.ts): el contenido NO es acumulativo,
 * así que aquí NO hay candados. Todos los mundos están abiertos siempre.
 *
 * El dibujo se construye una sola vez con el DOM y se anima con
 * requestAnimationFrame: la cámara y los ángulos viven en refs, no en estado,
 * porque cambian en cada cuadro y no deben provocar renders de React.
 */

const NS = "http://www.w3.org/2000/svg";
const VERDE = "#00ff41";
const MORADO = "#b400ff";
const ROSA = "#ff006e";
const AMARILLO = "#ffe600";
const CYAN = "#00f5ff";
const FONDO = "#050510";

// Achatamiento de las órbitas: las hace elipses, como un sistema solar visto
// en ángulo y no como una diana plana.
const ACHATE = 0.52;
const COLORES = [VERDE, CYAN, MORADO, ROSA, AMARILLO];

export type TemaEnMapa = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  total: number;
  hechas: number;
  disponibles: number;
};

const BOTON_CAMARA =
  "grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-panel-border)] " +
  "bg-[rgba(13,13,34,0.9)] font-[family-name:var(--font-terminal)] text-base text-white " +
  "backdrop-blur transition-colors hover:border-[var(--matrix)] hover:text-[var(--matrix)]";

type Props = {
  temas: TemaEnMapa[];
  onEntrar: (temaId: string) => void;
};

type Planeta = {
  tema: TemaEnMapa;
  color: string;
  radio: number;
  orbita: number;
  angulo: number;
  velocidad: number;
  anillo: boolean;
  grupo: SVGGElement;
  etiqueta: SVGGElement;
};

function el<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attrs?: Record<string, string | number>
): SVGElementTagNameMap[K] {
  const nodo = document.createElementNS(NS, tag);
  if (attrs) for (const k in attrs) nodo.setAttribute(k, String(attrs[k]));
  return nodo;
}

function semilla(texto: string) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  let s = h >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const PUNTI_SVG = `
<rect x="18" y="138" width="74" height="12" rx="6" fill="#0a1a0a" stroke="${MORADO}" stroke-width="2"/>
<rect x="22" y="140" width="66" height="2" rx="1" fill="${MORADO}" opacity=".9"/>
<ellipse cx="32" cy="152" rx="6" ry="3" fill="${MORADO}" opacity=".45"/>
<ellipse cx="78" cy="152" rx="6" ry="3" fill="${MORADO}" opacity=".45"/>
<rect x="32" y="78" width="46" height="40" rx="8" fill="#1a2a1a" stroke="${VERDE}" stroke-width="1.5"/>
<rect x="39" y="85" width="32" height="20" rx="4" fill="#0d1a0d" stroke="#00cc33" stroke-width="1"/>
<circle cx="46" cy="95" r="5.5" fill="#0a0a1f" stroke="${MORADO}" stroke-width="1"/>
<rect x="54" y="89" width="10" height="11" rx="2" fill="#0a0a1f" stroke="${CYAN}" stroke-width="1"/>
<rect x="32" y="115" width="46" height="3" rx="1.5" fill="${VERDE}" opacity=".9"/>
<rect x="37" y="118" width="14" height="18" rx="5" fill="#1a2a1a" stroke="${VERDE}" stroke-width="1"/>
<rect x="59" y="118" width="14" height="18" rx="5" fill="#1a2a1a" stroke="${VERDE}" stroke-width="1"/>
<rect x="34" y="130" width="20" height="9" rx="4" fill="#0a1a0a" stroke="#00cc33" stroke-width="1.5"/>
<rect x="56" y="130" width="20" height="9" rx="4" fill="#0a1a0a" stroke="#00cc33" stroke-width="1.5"/>
<rect x="14" y="76" width="18" height="24" rx="6" fill="#1a2a1a" stroke="${VERDE}" stroke-width="1.5" transform="rotate(15 23 88)"/>
<rect x="78" y="76" width="18" height="24" rx="6" fill="#1a2a1a" stroke="${VERDE}" stroke-width="1.5" transform="rotate(-15 87 88)"/>
<ellipse cx="20" cy="104" rx="9" ry="7" fill="#0a2a0a" stroke="${VERDE}" stroke-width="1.5"/>
<ellipse cx="90" cy="104" rx="9" ry="7" fill="#0a2a0a" stroke="${VERDE}" stroke-width="1.5"/>
<rect x="24" y="12" width="62" height="68" rx="12" fill="#0d1a0d" stroke="${VERDE}" stroke-width="2"/>
<rect x="32" y="20" width="46" height="54" rx="7" fill="#001a00" stroke="${VERDE}" stroke-width="1.5"/>
<rect x="46" y="20" width="18" height="5" rx="2.5" fill="${FONDO}" stroke="${VERDE}" stroke-width=".5"/>
<rect x="36" y="30" width="14" height="10" rx="3" fill="#001000" stroke="${VERDE}" stroke-width="1"/>
<rect x="38" y="32" width="10" height="7" rx="2" fill="${VERDE}" opacity=".92"/>
<rect x="36" y="30" width="14" height="4" rx="2" fill="#0d1a0d" opacity=".6"/>
<rect x="60" y="30" width="14" height="10" rx="3" fill="#001000" stroke="${VERDE}" stroke-width="1"/>
<rect x="62" y="32" width="10" height="7" rx="2" fill="${VERDE}" opacity=".92"/>
<rect x="60" y="30" width="14" height="4" rx="2" fill="#0d1a0d" opacity=".6"/>
<rect x="39" y="33" width="3" height="3" rx="1" fill="#fff" opacity=".8"/>
<rect x="63" y="33" width="3" height="3" rx="1" fill="#fff" opacity=".8"/>
<path d="M 42 50 Q 55 54 66 50" stroke="${VERDE}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
<rect x="22" y="26" width="4" height="8" rx="2" fill="${MORADO}" opacity=".8"/>
<rect x="84" y="26" width="4" height="8" rx="2" fill="${MORADO}" opacity=".8"/>
<rect x="22" y="38" width="4" height="6" rx="2" fill="${CYAN}" opacity=".8"/>
<rect x="84" y="38" width="4" height="6" rx="2" fill="${CYAN}" opacity=".8"/>
<rect x="32" y="78" width="46" height="3" rx="1" fill="${MORADO}" opacity=".7"/>`;

export default function MapaGalaxia({ temas, onEntrar }: Props) {
  const cajaRef = useRef<HTMLDivElement>(null);
  const [elegido, setElegido] = useState<TemaEnMapa | null>(null);
  const [aterrizando, setAterrizando] = useState<string | null>(null);

  // La API imperativa que crea el efecto, para que los botones de React
  // (zoom, encuadrar, aterrizar) puedan hablarle al dibujo.
  const apiRef = useRef<{
    zoom: (f: number) => void;
    encuadrar: () => void;
    irA: (id: string) => void;
    aterrizar: (id: string) => void;
  } | null>(null);

  const alElegir = useCallback((tema: TemaEnMapa | null) => setElegido(tema), []);
  const alAterrizar = useCallback((id: string) => onEntrar(id), [onEntrar]);

  useEffect(() => {
    const caja = cajaRef.current;
    if (!caja || temas.length === 0) return;

    const svg = el("svg", { class: "absolute inset-0 h-full w-full touch-none" });
    (svg as SVGSVGElement).style.cursor = "grab";
    const defs = el("defs");
    const capaLejos = el("g");
    const capaCerca = el("g");
    const mundo = el("g");
    svg.append(defs, capaLejos, capaCerca, mundo);
    caja.appendChild(svg);

    // ── estrellas con paralaje ──
    const sembrar = (capa: SVGGElement, n: number, sem: number, rmax: number, alfa: number) => {
      const r = semilla("estrellas" + sem);
      for (let i = 0; i < n; i++) {
        capa.appendChild(
          el("circle", {
            cx: (r() * 4200 - 2100).toFixed(1),
            cy: (r() * 3000 - 1500).toFixed(1),
            r: (r() * rmax + 0.3).toFixed(2),
            fill: r() > 0.85 ? "#cfe3ff" : "#ffffff",
            opacity: (r() * alfa + 0.1).toFixed(2),
          })
        );
      }
    };
    sembrar(capaLejos, 220, 1, 0.9, 0.3);
    sembrar(capaCerca, 90, 2, 1.4, 0.5);

    // ── Punti al centro: la fuente ──
    const aura = el("radialGradient", { id: "aura-punti", cx: "50%", cy: "50%", r: "50%" });
    aura.append(
      el("stop", { offset: "0", "stop-color": VERDE, "stop-opacity": "0.5" }),
      el("stop", { offset: "0.3", "stop-color": VERDE, "stop-opacity": "0.2" }),
      el("stop", { offset: "0.6", "stop-color": VERDE, "stop-opacity": "0.07" }),
      el("stop", { offset: "1", "stop-color": VERDE, "stop-opacity": "0" })
    );
    defs.appendChild(aura);

    const centro = el("g", { class: "cursor-pointer" });
    centro.appendChild(el("circle", { cx: 0, cy: 0, r: 260, fill: "url(#aura-punti)" }));
    [96, 126, 158].forEach((rr, i) => {
      const anillo = el("circle", {
        cx: 0, cy: 0, r: rr, fill: "none", stroke: VERDE, "stroke-width": 1,
        "vector-effect": "non-scaling-stroke",
        opacity: 0.2 - i * 0.045,
        "stroke-dasharray": i % 2 ? "5 9" : "2 8",
      });
      anillo.appendChild(
        el("animateTransform", {
          attributeName: "transform", type: "rotate",
          from: i % 2 ? "360" : "0", to: i % 2 ? "0" : "360",
          dur: `${34 + i * 16}s`, repeatCount: "indefinite",
        })
      );
      centro.appendChild(anillo);
    });
    const flota = el("g");
    const figura = el("g", { transform: "scale(1.3) translate(-55 -85)" });
    figura.innerHTML = PUNTI_SVG;
    flota.appendChild(figura);
    flota.appendChild(
      el("animateTransform", {
        attributeName: "transform", type: "translate",
        values: "0,0; 0,-7; 0,0", dur: "4.5s", repeatCount: "indefinite",
        calcMode: "spline", keySplines: "0.45 0 0.55 1; 0.45 0 0.55 1",
      })
    );
    centro.appendChild(flota);

    const etiquetaCentro = el("g", { transform: "translate(0 150)" });
    const nombreCentro = el("text", {
      x: 0, y: 0, "text-anchor": "middle", "font-size": 19, "font-weight": "900",
      "font-family": "var(--font-orbitron), monospace", fill: VERDE, opacity: 0.95,
      "letter-spacing": "5", stroke: FONDO, "stroke-width": 4.5,
      "paint-order": "stroke fill", "stroke-linejoin": "round",
    });
    nombreCentro.textContent = "PUNTI";
    const subCentro = el("text", {
      x: 0, y: 16, "text-anchor": "middle", "font-size": 10,
      "font-family": "var(--font-vt323), monospace", fill: VERDE, opacity: 0.5,
      "letter-spacing": "2.6", stroke: FONDO, "stroke-width": 3,
      "paint-order": "stroke fill", "stroke-linejoin": "round",
    });
    subCentro.textContent = "FUENTE DEL CONOCIMIENTO";
    etiquetaCentro.append(nombreCentro, subCentro);
    centro.appendChild(etiquetaCentro);
    mundo.appendChild(centro);

    // ── órbitas y planetas ──
    const capaOrbitas = el("g");
    const capaPlanetas = el("g");
    mundo.append(capaOrbitas, capaPlanetas);

    const planetas: Planeta[] = temas.map((tema, i) => {
      const color = COLORES[i % COLORES.length];
      const rnd = semilla(tema.id);
      const radio = 22 + tema.total * 5.5;
      const orbita = 345 + i * 155;
      const anillo = rnd() > 0.55;

      const orb = el("ellipse", {
        cx: 0, cy: 0, rx: orbita, ry: orbita * ACHATE, fill: "none",
        stroke: color, "stroke-width": 1, "vector-effect": "non-scaling-stroke",
        opacity: 0.32, "stroke-dasharray": "3 7",
      });
      capaOrbitas.appendChild(orb);

      const grad = el("radialGradient", { id: `cuerpo-${tema.id}`, cx: "34%", cy: "28%", r: "78%" });
      grad.append(
        el("stop", { offset: "0", "stop-color": color, "stop-opacity": "0.92" }),
        el("stop", { offset: "0.48", "stop-color": color, "stop-opacity": "0.34" }),
        el("stop", { offset: "1", "stop-color": "#03030c", "stop-opacity": "1" })
      );
      const brillo = el("radialGradient", { id: `halo-${tema.id}`, cx: "50%", cy: "50%", r: "50%" });
      brillo.append(
        el("stop", { offset: "0.42", "stop-color": color, "stop-opacity": "0.34" }),
        el("stop", { offset: "1", "stop-color": color, "stop-opacity": "0" })
      );
      const recorte = el("clipPath", { id: `recorte-${tema.id}` });
      recorte.appendChild(el("circle", { cx: 0, cy: 0, r: radio }));
      defs.append(grad, brillo, recorte);

      const g = el("g", {
        class: "cursor-pointer",
        tabindex: "0",
        role: "button",
        "aria-label": `${tema.titulo}, ${tema.total} subtemas`,
      });
      g.appendChild(el("circle", { cx: 0, cy: 0, r: radio * 2.6, fill: `url(#halo-${tema.id})` }));
      if (anillo) {
        g.appendChild(el("ellipse", {
          cx: 0, cy: 0, rx: radio * 1.95, ry: radio * 0.5, fill: "none",
          stroke: color, "stroke-width": radio * 0.13, opacity: 0.3, transform: "rotate(-17)",
        }));
      }
      g.appendChild(el("circle", { cx: 0, cy: 0, r: radio, fill: `url(#cuerpo-${tema.id})` }));

      const sup = el("g", { "clip-path": `url(#recorte-${tema.id})`, opacity: 0.55 });
      const bandas = 2 + Math.floor(rnd() * 3);
      for (let b = 0; b < bandas; b++) {
        sup.appendChild(el("ellipse", {
          cx: ((rnd() * 0.5 - 0.25) * radio).toFixed(1),
          cy: ((rnd() * 1.7 - 0.85) * radio).toFixed(1),
          rx: (radio * (0.7 + rnd() * 0.5)).toFixed(1),
          ry: (radio * (0.07 + rnd() * 0.13)).toFixed(1),
          fill: color, opacity: (0.1 + rnd() * 0.16).toFixed(2),
        }));
      }
      g.appendChild(sup);
      g.appendChild(el("circle", {
        cx: 0, cy: 0, r: radio, fill: "none", stroke: color, "stroke-width": 1.6, opacity: 0.92,
      }));
      if (anillo) {
        g.appendChild(el("path", {
          d: `M ${-radio * 1.95} 0 A ${radio * 1.95} ${radio * 0.5} 0 0 0 ${radio * 1.95} 0`,
          fill: "none", stroke: color, "stroke-width": radio * 0.13, opacity: 0.42,
          transform: "rotate(-17)",
        }));
      }

      // Aro de "en curso" / insignia de "completado"
      if (tema.hechas > 0 && tema.hechas < tema.total) {
        const aro = el("circle", {
          cx: 0, cy: 0, r: radio * 1.32, fill: "none", stroke: color,
          "stroke-width": 1.4, opacity: 0.5, "stroke-dasharray": "4 6",
        });
        aro.appendChild(el("animateTransform", {
          attributeName: "transform", type: "rotate", from: "0", to: "360",
          dur: "26s", repeatCount: "indefinite",
        }));
        g.appendChild(aro);
      }
      if (tema.total > 0 && tema.hechas === tema.total) {
        g.appendChild(el("circle", {
          cx: 0, cy: 0, r: radio * 1.28, fill: "none", stroke: color,
          "stroke-width": 1.2, opacity: 0.38,
        }));
        const insignia = el("g", { transform: `translate(${radio * 0.92} ${-radio * 0.92})` });
        insignia.append(
          el("circle", { cx: 0, cy: 0, r: 9, fill: FONDO, stroke: color, "stroke-width": 1.4 }),
          el("path", {
            d: "M -4 0 L -1.2 3 L 4.2 -3", fill: "none", stroke: color,
            "stroke-width": 1.8, "stroke-linecap": "round", "stroke-linejoin": "round",
          })
        );
        g.appendChild(insignia);
      }

      // Etiqueta: se contra-escala para seguir legible a cualquier zoom, y
      // lleva halo oscuro para que se lea aunque pase un planeta por detrás.
      const etiqueta = el("g", { transform: `translate(0 ${radio + 16})` });
      const titulo = el("text", {
        x: 0, y: 0, "text-anchor": "middle", "font-size": 15, "font-weight": "700",
        "font-family": "var(--font-rajdhani), sans-serif", fill: "#eaf5ea",
        stroke: FONDO, "stroke-width": 3.6, "paint-order": "stroke fill",
        "stroke-linejoin": "round",
      });
      titulo.textContent = tema.titulo;
      const sub = el("text", {
        x: 0, y: 15, "text-anchor": "middle", "font-size": 10.5,
        "font-family": "var(--font-vt323), monospace", fill: color, opacity: 0.9,
        "letter-spacing": "1.4", stroke: FONDO, "stroke-width": 3,
        "paint-order": "stroke fill", "stroke-linejoin": "round",
      });
      sub.textContent =
        tema.total > 0 && tema.hechas === tema.total
          ? "COMPLETADO"
          : tema.hechas > 0
            ? `${tema.hechas}/${tema.total} EN CURSO`
            : `${tema.total} SUBTEMAS`;
      etiqueta.append(titulo, sub);
      g.appendChild(etiqueta);

      capaPlanetas.appendChild(g);

      const planeta: Planeta = {
        tema, color, radio, orbita,
        angulo: (i * 2.399) % (Math.PI * 2),
        velocidad: 0.000045 / Math.sqrt(orbita / 345),
        anillo, grupo: g, etiqueta,
      };

      const abrir = () => alElegir(tema);
      g.addEventListener("click", (ev) => { ev.stopPropagation(); abrir(); });
      g.addEventListener("keydown", (ev) => {
        const e = ev as KeyboardEvent;
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); }
      });

      return planeta;
    });

    centro.addEventListener("click", (ev) => { ev.stopPropagation(); alElegir(null); });

    // ── cámara ──
    let W = 1, H = 1;
    const vista = { x: 0, y: 0, z: 0.3 };
    const destino = { x: 0, y: 0, z: 0.3 };
    let hayDestino = false;
    let modo: "libre" | "aterrizando" = "libre";
    let animT = 0;
    let desde = { x: 0, y: 0, z: 1 };
    let objX = 0, objY = 0, objZ = 10, objId = "";

    const medir = () => {
      const r = caja.getBoundingClientRect();
      W = Math.max(1, r.width);
      H = Math.max(1, r.height);
      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    };

    const extremo = 345 + (temas.length - 1) * 155 + 120;
    const esAngosta = () => W < 720;

    const encuadrar = (suave: boolean) => {
      const margen = esAngosta() ? 80 : 160;
      const z = Math.min((W - margen) / (extremo * 2), (H - margen) / (extremo * 2 * ACHATE + 260));
      const nz = Math.max(0.1, Math.min(1.6, z));
      if (suave) { destino.x = 0; destino.y = 0; destino.z = nz; hayDestino = true; }
      else { vista.x = 0; vista.y = 0; vista.z = nz; }
    };

    /**
     * En un celular, encuadrar la galaxia entera deja los planetas del tamaño
     * de una arveja y los nombres encimados y colgando fuera de pantalla. Así
     * que ahí NO se abre en vista general: se abre al lado del mundo en curso,
     * con el texto a su tamaño real. Explorar es arrastrar, que es justo el
     * gesto que el mapa ya sabe hacer. El botón FIT sigue ahí para quien
     * quiera el panorama completo.
     */
    const vistaInicial = () => {
      if (!esAngosta() || planetas.length === 0) {
        encuadrar(false);
        return;
      }
      const enCurso =
        planetas.find((q) => q.tema.hechas > 0 && q.tema.hechas < q.tema.total) ??
        planetas.find((q) => q.tema.hechas < q.tema.total) ??
        planetas[0];
      vista.x = Math.cos(enCurso.angulo) * enCurso.orbita;
      vista.y = Math.sin(enCurso.angulo) * enCurso.orbita * ACHATE;
      vista.z = Math.max(0.42, Math.min(0.95, W / 560));
    };

    const aplicar = () => {
      mundo.setAttribute(
        "transform",
        `translate(${W / 2 - vista.x * vista.z} ${H / 2 - vista.y * vista.z}) scale(${vista.z})`
      );
      const p = (f: number) =>
        `translate(${W / 2 - vista.x * vista.z * f} ${H / 2 - vista.y * vista.z * f}) scale(${vista.z})`;
      capaLejos.setAttribute("transform", p(0.16));
      capaCerca.setAttribute("transform", p(0.6));
    };

    // ── arrastrar. OJO: capturar el puntero en pointerdown redirige el click
    // al contenedor y el planeta nunca lo recibe. Se captura solo cuando el
    // dedo YA se movió, así un clic limpio llega a su destino.
    let arrastrando = false, capturado = false, movido = 0, ultX = 0, ultY = 0;
    const UMBRAL = 5;

    const abajo = (e: PointerEvent) => {
      arrastrando = true; capturado = false; movido = 0;
      ultX = e.clientX; ultY = e.clientY; hayDestino = false;
    };
    const mover = (e: PointerEvent) => {
      if (!arrastrando || modo !== "libre") return;
      const dx = e.clientX - ultX, dy = e.clientY - ultY;
      movido += Math.abs(dx) + Math.abs(dy);
      if (!capturado) {
        if (movido < UMBRAL) return;
        capturado = true;
        (svg as SVGSVGElement).style.cursor = "grabbing";
        try { svg.setPointerCapture(e.pointerId); } catch { /* sin captura, sigue */ }
      }
      vista.x -= dx / vista.z; vista.y -= dy / vista.z;
      ultX = e.clientX; ultY = e.clientY;
      aplicar();
    };
    const arriba = () => {
      arrastrando = false; capturado = false;
      (svg as SVGSVGElement).style.cursor = "grab";
    };

    svg.addEventListener("pointerdown", abajo as EventListener);
    svg.addEventListener("pointermove", mover as EventListener);
    svg.addEventListener("pointerup", arriba);
    svg.addEventListener("pointercancel", arriba);
    svg.addEventListener("pointerleave", arriba);
    svg.addEventListener("click", () => { if (movido < 6) alElegir(null); });

    const rueda = (ev: Event) => {
      const e = ev as WheelEvent;
      e.preventDefault();
      if (modo !== "libre") return;
      hayDestino = false;
      const r = caja.getBoundingClientRect();
      const mx = e.clientX - r.left - W / 2, my = e.clientY - r.top - H / 2;
      const wx = vista.x + mx / vista.z, wy = vista.y + my / vista.z;
      vista.z = Math.max(0.07, Math.min(2.4, vista.z * Math.exp(-e.deltaY * 0.0014)));
      vista.x = wx - mx / vista.z; vista.y = wy - my / vista.z;
      aplicar();
    };
    svg.addEventListener("wheel", rueda, { passive: false });

    apiRef.current = {
      zoom: (f) => { hayDestino = false; vista.z = Math.max(0.07, Math.min(2.4, vista.z * f)); aplicar(); },
      encuadrar: () => encuadrar(true),
      irA: (id) => {
        const p = planetas.find((q) => q.tema.id === id);
        if (!p) return;
        destino.x = Math.cos(p.angulo) * p.orbita;
        destino.y = Math.sin(p.angulo) * p.orbita * ACHATE;
        const util = W > 720 ? W - 340 : W;
        destino.z = Math.max(0.35, Math.min(1.5, Math.min(util, H) / (p.radio * 11)));
        hayDestino = true;
      },
      aterrizar: (id) => {
        const p = planetas.find((q) => q.tema.id === id);
        if (!p || modo === "aterrizando") return;
        modo = "aterrizando"; animT = 0; hayDestino = false;
        desde = { ...vista };
        objX = Math.cos(p.angulo) * p.orbita;
        objY = Math.sin(p.angulo) * p.orbita * ACHATE;
        objZ = Math.max(W, H) / (p.radio * 0.4);
        objId = id;
      },
    };

    // ── bucle ──
    let ultimo = performance.now();
    let vivo = true;
    const reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const bucle = (ahora: number) => {
      if (!vivo) return;
      const dt = Math.min(64, ahora - ultimo);
      ultimo = ahora;

      if (modo === "aterrizando") {
        // Un zoom que ACELERA se siente como caer hacia algo; uno que frena,
        // como una ventana que se abre. Por eso la curva va al revés.
        animT = Math.min(1, animT + dt / 1150);
        const pos = 1 - Math.pow(1 - animT, 3);
        const ace = animT * animT * animT;
        vista.x = desde.x + (objX - desde.x) * pos;
        vista.y = desde.y + (objY - desde.y) * pos;
        vista.z = desde.z * Math.pow(objZ / desde.z, ace);
        const fundido = Math.max(0, 1 - Math.max(0, (animT - 0.12) / 0.58));
        [capaLejos, capaCerca, capaOrbitas, centro].forEach((c) =>
          c.setAttribute("opacity", fundido.toFixed(3))
        );
        planetas.forEach((p) => {
          if (p.tema.id !== objId) p.grupo.setAttribute("opacity", fundido.toFixed(3));
          else p.etiqueta.setAttribute("opacity", fundido.toFixed(3));
        });
        aplicar();
        if (animT >= 1) { vivo = false; alAterrizar(objId); return; }
        requestAnimationFrame(bucle);
        return;
      }

      // Por debajo de este zoom los nombres no se alcanzan a leer y además
      // chocan entre sí, así que se esconden: se ve la forma de la galaxia,
      // y el nombre aparece al tocar el planeta. Es lo que hacen los mapas.
      const verNombres = vista.z >= 0.26;

      planetas.forEach((p) => {
        if (!reducido) p.angulo += p.velocidad * dt;
        const x = Math.cos(p.angulo) * p.orbita;
        const y = Math.sin(p.angulo) * p.orbita * ACHATE;
        p.grupo.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        p.etiqueta.setAttribute("opacity", verNombres ? "1" : "0");
        p.etiqueta.setAttribute(
          "transform",
          `translate(0 ${p.radio + 16}) scale(${(1 / vista.z).toFixed(3)})`
        );
      });
      etiquetaCentro.setAttribute("opacity", verNombres ? "1" : "0");
      etiquetaCentro.setAttribute("transform", `translate(0 150) scale(${(1 / vista.z).toFixed(3)})`);

      if (hayDestino) {
        vista.x += (destino.x - vista.x) * 0.085;
        vista.y += (destino.y - vista.y) * 0.085;
        vista.z += (destino.z - vista.z) * 0.085;
        if (
          Math.abs(destino.x - vista.x) < 0.6 &&
          Math.abs(destino.y - vista.y) < 0.6 &&
          Math.abs(destino.z - vista.z) < 0.002
        ) hayDestino = false;
      }
      aplicar();
      requestAnimationFrame(bucle);
    };

    medir();
    vistaInicial();
    aplicar();
    requestAnimationFrame(bucle);

    const observador = new ResizeObserver(() => { medir(); aplicar(); });
    observador.observe(caja);

    return () => {
      vivo = false;
      observador.disconnect();
      svg.removeEventListener("wheel", rueda);
      apiRef.current = null;
      svg.remove();
    };
  }, [temas, alElegir, alAterrizar]);

  const entrar = useCallback((id: string) => {
    setAterrizando(id);
    apiRef.current?.aterrizar(id);
  }, []);

  const acercar = useCallback(() => apiRef.current?.zoom(1.3), []);
  const alejar = useCallback(() => apiRef.current?.zoom(1 / 1.3), []);
  const encuadrarTodo = useCallback(() => {
    setElegido(null);
    apiRef.current?.encuadrar();
  }, []);

  useEffect(() => {
    if (elegido) apiRef.current?.irA(elegido.id);
  }, [elegido]);

  const color = elegido ? COLORES[temas.findIndex((t) => t.id === elegido.id) % COLORES.length] : VERDE;
  const pct = elegido && elegido.total > 0 ? Math.round((elegido.hechas / elegido.total) * 100) : 0;

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={cajaRef} className="absolute inset-0" />

      {/* controles de cámara */}
      <div
        className={`absolute right-4 z-20 flex flex-col gap-1.5 transition-all ${
          aterrizando ? "pointer-events-none opacity-0" : ""
        } ${
          elegido
            ? "bottom-[calc(56%+1rem)] sm:bottom-4"
            : "bottom-4"
        }`}
      >
        <button onClick={acercar} aria-label="Acercar" className={BOTON_CAMARA}>
          +
        </button>
        <button onClick={alejar} aria-label="Alejar" className={BOTON_CAMARA}>
          −
        </button>
        <button onClick={encuadrarTodo} aria-label="Ver toda la galaxia" className={BOTON_CAMARA}>
          FIT
        </button>
      </div>

      {/* panel del tema elegido */}
      {elegido && !aterrizando && (
        <aside className="absolute inset-x-3 bottom-3 z-20 max-h-[56%] overflow-y-auto rounded-2xl border border-[var(--color-panel-border)] bg-[rgba(13,13,34,0.95)] p-5 backdrop-blur-md sm:inset-x-auto sm:right-4 sm:top-1/2 sm:bottom-auto sm:w-80 sm:-translate-y-1/2">
          <button
            onClick={() => setElegido(null)}
            aria-label="Cerrar"
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg border border-[var(--color-panel-border)] text-[var(--muted)] transition-colors hover:border-[var(--pink)] hover:text-[var(--pink)]"
          >
            ✕
          </button>

          <p
            className="mb-1.5 inline-block rounded px-2 py-0.5 font-[family-name:var(--font-terminal)] text-xs uppercase tracking-[0.16em]"
            style={{ color, background: `${color}1c`, border: `1px solid ${color}55` }}
          >
            Mundo {elegido.numero}
          </p>
          <h2 className="pr-8 font-[family-name:var(--font-display)] text-lg font-bold text-white">
            {elegido.titulo}
          </h2>
          <p className="mt-2.5 font-[family-name:var(--font-ui)] text-sm leading-relaxed text-[var(--muted)]">
            {elegido.descripcion}
          </p>

          <div className="mt-4 flex gap-2">
            {[
              { n: elegido.total, t: "Subtemas" },
              { n: `${pct}%`, t: "Avance" },
              { n: elegido.disponibles, t: "Con lección" },
            ].map((d) => (
              <div
                key={d.t}
                className="flex-1 rounded-lg border border-[var(--color-panel-border)] bg-white/5 px-2.5 py-2"
              >
                <p className="font-[family-name:var(--font-display)] text-base font-bold" style={{ color }}>
                  {d.n}
                </p>
                <p className="mt-0.5 font-[family-name:var(--font-terminal)] text-[10px] uppercase tracking-wider text-[var(--muted)]">
                  {d.t}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
            <span
              className="block h-full rounded-full"
              style={{ width: `${pct}%`, background: color, boxShadow: `0 0 12px ${color}` }}
            />
          </div>

          <button
            onClick={() => entrar(elegido.id)}
            className="mt-4 w-full rounded-xl px-6 py-3 font-[family-name:var(--font-ui)] text-sm font-bold uppercase tracking-wide transition-colors"
            style={{ color, borderColor: color, background: `${color}1a`, borderWidth: 1 }}
          >
            {elegido.hechas > 0 ? "Continuar" : "Aterrizar"}
          </button>
        </aside>
      )}
    </div>
  );
}
