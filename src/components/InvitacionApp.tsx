"use client";

// "¡Llévame en tu pantalla!": Punti invita a instalar la app (PWA).
//
// Pantalla completa con Punti. Cuándo sale:
//  - solo en celular, con sesión iniciada, y si Punti NO está ya instalada;
//  - nunca en medio de una lección, misión, juego, login o en el admin;
//  - para probarla: punti.space/?invitacion=1 (la muestra ya y reinicia lo recordado);
//  - espera unos segundos después de llegar a la pantalla;
//  - si dice "Ahora no", vuelve a preguntar en 7 días; como mucho 3 veces;
//    "No volver a mostrar" la apaga para siempre en ese celular.
//
// Cómo instala:
//  - Android (Chrome, Edge, Samsung): el botón abre el instalador del sistema.
//  - iPhone/iPad: el sistema no deja abrirlo desde la página, así que Punti
//    muestra los dos pasos (Compartir → Agregar a pantalla de inicio).
//
// Lo recordado vive en localStorage de ese navegador (solo esta preferencia).
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useIdioma } from "@/lib/useIdioma";
import { textoPixel, type Idioma } from "@/lib/i18n";
import { sonar } from "@/lib/sonido";
import PuntiPixel from "@/components/PuntiPixel";
import TextoTecleado from "@/components/TextoTecleado";

type EventoInstalar = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };
type Plataforma = "android" | "ios";

const CLAVE = "punti-invitacion-app";
const DIAS_ENTRE_VECES = 7;
const MAX_VECES = 3;
const ESPERA_MS = 3_500;

const T: Record<Idioma, Record<string, string>> = {
  es: {
    etiqueta: "Punti · Transmisión",
    titulo: "¡Llévame en tu pantalla!",
    texto: "Guárdame en tu inicio y me abres de un toque, a pantalla completa, como una app. Sin tiendas y sin ocupar espacio.",
    instalar: "Llevar a Punti",
    ahoraNo: "Ahora no",
    nunca: "No volver a mostrar",
    paso1: "Toca el botón Compartir",
    paso1b: "(el cuadrito con la flecha hacia arriba).",
    paso2: "Elige «Agregar a pantalla de inicio»",
    paso2b: "y luego «Agregar».",
    entendido: "Entendido",
    gracias: "¡Señal recibida! Ya estoy en tu pantalla. Ábreme desde mi ícono.",
  },
  en: {
    etiqueta: "Punti · Transmission",
    titulo: "Take me on your screen!",
    texto: "Save me to your home screen and open me with one tap, full screen, like a real app. No app store and no storage used.",
    instalar: "Take Punti",
    ahoraNo: "Not now",
    nunca: "Don't show again",
    paso1: "Tap the Share button",
    paso1b: "(the square with the arrow pointing up).",
    paso2: "Choose “Add to Home Screen”",
    paso2b: "then “Add”.",
    entendido: "Got it",
    gracias: "Signal received! I'm on your screen now. Open me from my icon.",
  },
};

type Recuerdo = { veces: number; ultima: number; nunca: boolean };

function leer(): Recuerdo {
  try {
    const r = JSON.parse(localStorage.getItem(CLAVE) ?? "null") as Partial<Recuerdo> | null;
    return {
      veces: typeof r?.veces === "number" ? r.veces : 0,
      ultima: typeof r?.ultima === "number" ? r.ultima : 0,
      nunca: r?.nunca === true,
    };
  } catch {
    return { veces: 0, ultima: 0, nunca: false };
  }
}
function guardar(r: Recuerdo) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(r));
  } catch {
    /* navegador privado o sin almacenamiento: no pasa nada */
  }
}

function yaInstalada() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}
function esIOS() {
  const ua = navigator.userAgent;
  // iPadOS se presenta como Mac, pero tiene pantalla táctil.
  return /iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}
function esCelular() {
  return window.matchMedia("(pointer: coarse)").matches && Math.min(window.innerWidth, window.innerHeight) < 900;
}

/** Rutas donde no se interrumpe al piloto. */
function enMedioDeAlgo(ruta: string) {
  return (
    ruta === "/login" ||
    ruta === "/registro" ||
    ruta === "/bienvenida" ||
    ruta.startsWith("/leccion") ||
    ruta.startsWith("/mision") ||
    ruta.startsWith("/juego/") ||
    ruta.startsWith("/admin")
  );
}

export default function InvitacionApp() {
  const ruta = usePathname();
  const idioma = useIdioma();
  const t = T[idioma];
  const { usuario } = useAuth();
  const [abierta, setAbierta] = useState<Plataforma | null>(null);
  const [instalada, setInstalada] = useState(false);
  const evento = useRef<EventoInstalar | null>(null);
  const principalRef = useRef<HTMLButtonElement>(null);
  const mostrada = useRef(false);

  // Android: el sistema avisa que se puede instalar; se guarda para el botón.
  useEffect(() => {
    const alPoder = (e: Event) => {
      e.preventDefault(); // la invitación la hace Punti, no el aviso del navegador
      evento.current = e as EventoInstalar;
    };
    const alInstalar = () => {
      setInstalada(true);
      guardar({ ...leer(), nunca: true });
    };
    window.addEventListener("beforeinstallprompt", alPoder);
    window.addEventListener("appinstalled", alInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", alPoder);
      window.removeEventListener("appinstalled", alInstalar);
    };
  }, []);

  // ¿Toca invitar? Se decide unos segundos después de llegar a una pantalla tranquila.
  useEffect(() => {
    if (!usuario || mostrada.current || enMedioDeAlgo(ruta)) return;
    // punti.space/?invitacion=1 la muestra ya, sin importar lo recordado (para probarla).
    const forzar = new URLSearchParams(window.location.search).has("invitacion");
    const reloj = setTimeout(
      () => {
        if (yaInstalada()) return;
        const r = leer();
        if (!forzar) {
          if (!esCelular()) return;
          if (r.nunca || r.veces >= MAX_VECES) return;
          if (r.ultima && Date.now() - r.ultima < DIAS_ENTRE_VECES * 86_400_000) return;
        }
        const plataforma: Plataforma | null = esIOS() ? "ios" : evento.current ? "android" : forzar ? "ios" : null;
        if (!plataforma) return; // navegador sin forma de instalar: no se promete lo que no hay
        mostrada.current = true;
        guardar(forzar ? { veces: 0, ultima: 0, nunca: false } : { ...r, veces: r.veces + 1, ultima: Date.now() });
        setAbierta(plataforma);
        try {
          sonar("pantalla");
        } catch {
          /* sin sonido no pasa nada */
        }
      },
      forzar ? 800 : ESPERA_MS,
    );
    return () => clearTimeout(reloj);
  }, [usuario, ruta]);

  const cerrar = useCallback((nunca = false) => {
    if (nunca) guardar({ ...leer(), nunca: true });
    setAbierta(null);
  }, []);

  useEffect(() => {
    if (!abierta) return;
    principalRef.current?.focus();
    const alTeclear = (e: KeyboardEvent) => {
      if (e.key === "Escape") cerrar();
    };
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [abierta, cerrar]);

  async function instalar() {
    const e = evento.current;
    if (!e) return;
    sonar("toque");
    try {
      await e.prompt();
      const { outcome } = await e.userChoice;
      evento.current = null;
      if (outcome === "accepted") {
        sonar("nivel");
        setInstalada(true);
        guardar({ ...leer(), nunca: true });
        setTimeout(() => setAbierta(null), 2_800);
      } else {
        setAbierta(null);
      }
    } catch {
      setAbierta(null);
    }
  }

  if (!abierta) return null;

  const dicho = instalada ? t.gracias : t.texto;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invitacion-app-titulo"
      className="invitacion-app fixed inset-0 z-[80] overflow-y-auto overscroll-contain bg-[rgba(3,3,12,0.98)]"
    >
      {/* min-h-full + centrado: si no cabe, se desplaza en vez de cortar a Punti arriba */}
      <div className="flex min-h-full flex-col items-center justify-center gap-5 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-center">
      <PuntiPixel estado={instalada ? "levelup" : "hype"} ancho={112} />

      <div className="consola-leccion w-full max-w-sm text-left">
        <span className="consola-esquina consola-esquina-tl" />
        <span className="consola-esquina consola-esquina-br" />
        <div className="grid gap-2 p-4">
          <p className="font-[family-name:var(--font-pixel)] text-[8px] leading-[1.8] text-[var(--matrix)]">{t.etiqueta}</p>
          <h2 id="invitacion-app-titulo" className="font-[family-name:var(--font-display)] text-[24px] font-black leading-tight text-white">
            {t.titulo}
          </h2>
          <p aria-live="polite" className="font-[family-name:var(--font-terminal)] text-[19px] leading-[1.18] text-[#d9ffe3]">
            <TextoTecleado key={dicho} texto={dicho} />
          </p>
        </div>
      </div>

      {abierta === "ios" && !instalada && (
        <ol className="grid w-full max-w-sm gap-3 text-left">
          {[
            [t.paso1, t.paso1b],
            [t.paso2, t.paso2b],
          ].map(([titulo, detalle], i) => (
            <li key={titulo} className="flex items-center gap-3 border-2 border-[var(--color-panel-border)] bg-[rgba(10,10,30,0.88)] px-3 py-2.5">
              <span className="grid h-8 w-8 shrink-0 place-content-center bg-[var(--matrix)] font-[family-name:var(--font-pixel)] text-[11px] text-[#050510]">
                {i + 1}
              </span>
              <span className="text-[15px] leading-[1.45] text-white">
                <b className="font-semibold">{titulo}</b>{" "}
                {i === 0 && <IconoCompartir />} <span className="text-[var(--muted)]">{detalle}</span>
              </span>
            </li>
          ))}
        </ol>
      )}

      {!instalada && (
        <div className="grid w-full max-w-sm gap-3">
          {abierta === "android" ? (
            <button ref={principalRef} type="button" onClick={instalar} className="boton-pixel boton-pixel-lleno w-full">
              {textoPixel(t.instalar)}
            </button>
          ) : (
            <button ref={principalRef} type="button" onClick={() => cerrar()} className="boton-pixel boton-pixel-lleno w-full">
              {textoPixel(t.entendido)}
            </button>
          )}
          <div className="flex justify-between gap-3">
            {abierta === "android" && (
              <button type="button" onClick={() => cerrar()} className="px-2 py-2 font-[family-name:var(--font-ui)] text-[15px] font-semibold text-[var(--muted)] hover:text-white">
                {t.ahoraNo}
              </button>
            )}
            <button type="button" onClick={() => cerrar(true)} className="ml-auto px-2 py-2 font-[family-name:var(--font-ui)] text-[15px] font-semibold text-[var(--muted)] hover:text-white">
              {t.nunca}
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

/** El ícono de Compartir de iPhone, dibujado (sin imágenes de terceros). */
function IconoCompartir() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" className="inline-block align-[-3px] text-[var(--cyan)]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square">
      <path d="M12 3v12M7 8l5-5 5 5" />
      <path d="M5 11v10h14V11" />
    </svg>
  );
}
