"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PerfilUsuario } from "@/lib/userProfile";
import { gasolinaEfectiva, rachaEfectiva, GASOLINA_MAXIMA } from "@/lib/progreso";
import { textoTema, textoSubtema } from "@/lib/temas";
import { useCatalogo } from "@/lib/contenido";
import { RANGOS, rangoPorXp } from "@/lib/rangos";
import { textoPixel, type Idioma } from "@/lib/i18n";
import PuntiPixel from "@/components/PuntiPixel";
import PlanetaPixel from "@/components/PlanetaPixel";
import BarraGasolina from "@/components/BarraGasolina";
import BotonSonido from "@/components/BotonSonido";

/**
 * El perfil: quién eres en el universo y dónde te quedaste.
 *
 * Recibe el perfil ya cargado y no lo busca solo, a propósito: así se puede
 * mostrar con datos de ejemplo en una vista previa, sin cuenta.
 *
 * Lo más importante está arriba y no es el avatar: es "Retoma donde lo
 * dejaste". Un perfil que solo muestra números no hace volver a nadie; uno
 * que dice "te falta esto, está a un toque" sí.
 */

const COLORES = ["#00ff41", "#00f5ff", "#b400ff", "#ff006e", "#ffe600"];

// Etiquetas en fuente pixel sin tildes: Press Start 2P no las trae.
const TX: Record<Idioma, Record<string, string>> = {
  es: {
    eyebrow: "// ficha de piloto",
    rango: "Rango",
    siguiente: "Próximo rango",
    faltan: "XP para",
    maximo: "Llegaste al rango más alto del universo.",
    xp: "XP total",
    racha: "Racha",
    dias: "días",
    gasolina: "Gasolina",
    lecciones: "Lecciones",
    retoma: "Retoma donde lo dejaste",
    retomaVacio: "Todavía no empiezas ningún mundo. El primero está a un toque.",
    siguienteLeccion: "Sigue",
    sinLeccion: "La próxima lección de este mundo todavía está en obra.",
    continuar: "CONTINUAR",
    verMundo: "VER MUNDO",
    empezar: "ELEGIR MUNDO",
    empezados: "Mundos a medio camino",
    completados: "Mundos conquistados",
    ningunoCompleto: "Ninguno todavía. El primero siempre es el que más cuesta.",
    ajustes: "Ajustes",
    idioma: "Idioma del viaje",
    sonido: "Sonido",
    salir: "CERRAR SESION",
    volver: "MUNDOS",
  },
  en: {
    eyebrow: "// pilot file",
    rango: "Rank",
    siguiente: "Next rank",
    faltan: "XP to",
    maximo: "You've reached the highest rank in the universe.",
    xp: "Total XP",
    racha: "Streak",
    dias: "days",
    gasolina: "Fuel",
    lecciones: "Lessons",
    retoma: "Pick up where you left off",
    retomaVacio: "You haven't started any world yet. The first one is a tap away.",
    siguienteLeccion: "Next up",
    sinLeccion: "The next lesson in this world is still being built.",
    continuar: "CONTINUE",
    verMundo: "VIEW WORLD",
    empezar: "PICK A WORLD",
    empezados: "Worlds halfway there",
    completados: "Worlds conquered",
    ningunoCompleto: "None yet. The first one is always the hardest.",
    ajustes: "Settings",
    idioma: "Journey language",
    sonido: "Sound",
    salir: "SIGN OUT",
    volver: "WORLDS",
  },
};

/**
 * Un número que cuenta desde 0 hasta su valor al aparecer.
 * Curva que frena al final (easeOutCubic): los últimos números se ven pasar,
 * que es lo que da la sensación de "sumando". Sin movimiento reducido, salta
 * directo al valor.
 */
function Contador({ valor, duracion = 900 }: { valor: number; duracion?: number }) {
  // Se lee una sola vez. Si la persona pidió menos movimiento, se muestra el
  // valor final directo y no se anima nada.
  const [quieto] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  // Empieza en 0 y no en el valor final: si empezara en el final, se vería un
  // cuadro con el número completo y luego un salto a 0 antes de contar.
  const [mostrado, setMostrado] = useState(0);
  // Dónde va el conteo, para que si el valor cambia a mitad de camino siga
  // desde ahí en vez de volver a empezar de 0.
  const ultimo = useRef(0);

  useEffect(() => {
    if (quieto) return;
    const desde = ultimo.current;
    let cuadro = 0;
    // El reloj arranca con el primer cuadro, no al montar: si la página se
    // abrió en una pestaña de fondo, el conteo se ve completo al volver en
    // vez de saltar directo al número final.
    let inicio = -1;
    const paso = (ahora: number) => {
      if (inicio < 0) inicio = ahora;
      const t = Math.min(1, (ahora - inicio) / duracion);
      const e = 1 - Math.pow(1 - t, 3);
      const n = Math.round(desde + (valor - desde) * e);
      ultimo.current = n;
      setMostrado(n);
      if (t < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valor, duracion, quieto]);

  return <>{quieto ? valor : mostrado}</>;
}

type Props = {
  perfil: PerfilUsuario;
  idioma: Idioma;
  alSalir: () => void;
  selectorIdioma: React.ReactNode;
};

export default function PanelPerfil({ perfil, idioma, alSalir, selectorIdioma }: Props) {
  const catalogo = useCatalogo();
  const t = TX[idioma];
  const en = idioma === "en";

  const xp = perfil.xp ?? 0;
  const racha = rachaEfectiva(perfil);
  const gasolina = gasolinaEfectiva(perfil);
  const r = rangoPorXp(xp);
  const rango = RANGOS[r.actual];
  const siguiente = r.siguiente ? RANGOS[r.siguiente] : null;

  const mundos = catalogo.temas.map((tema, i) => {
    const hechas = tema.subtemas.filter((s) => perfil.progreso?.[s.id]?.completada).length;
    const proxima = tema.subtemas.find((s) => !perfil.progreso?.[s.id]?.completada);
    return {
      tema,
      tx: textoTema(tema, idioma),
      color: COLORES[i % COLORES.length],
      hechas,
      total: tema.subtemas.length,
      proxima,
      proximaLista: proxima ? catalogo.conLeccion.has(proxima.id) : false,
    };
  });

  const empezados = mundos.filter((m) => m.hechas > 0 && m.hechas < m.total);
  const completados = mundos.filter((m) => m.total > 0 && m.hechas >= m.total);
  const totalLecciones = mundos.reduce((n, m) => n + m.hechas, 0);

  // El mundo para retomar: el más avanzado de los que están a medias.
  const retomar = [...empezados].sort((a, b) => b.hechas / b.total - a.hechas / a.total)[0];

  return (
    <div className="flex flex-col gap-6">
      {/* ─────────────── ficha ─────────────── */}
      <section
        className="entra entra-1 border-2 bg-[rgba(10,10,30,0.88)] p-5 sm:p-7"
        style={{ borderColor: rango.color }}
      >
        <p className="font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.26em]" style={{ color: rango.color }}>
          {t.eyebrow}
        </p>

        <div className="mt-4 flex flex-col items-center gap-5 text-center sm:flex-row sm:items-center sm:text-left">
          <div className="avatar-perfil shrink-0 border-2 p-3" style={{ borderColor: rango.color, color: rango.color }}>
            <PuntiPixel estado={racha >= 3 ? "hype" : "online"} recorte="cabeza" ancho={110} flotando={false} />
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="font-[family-name:var(--font-pixel)] text-[16px] leading-[1.5] text-white sm:text-[20px]">
              {textoPixel(perfil.nombre || (en ? "Pilot" : "Piloto"))}
            </h1>
            <p className="mt-2 font-[family-name:var(--font-display)] text-[17px] font-black" style={{ color: rango.color }}>
              {en ? rango.tituloEn : rango.titulo}
            </p>

            {/* Barra al siguiente rango. Se llena con scaleX desde 0, que va
                en el compositor: animar el ancho obligaría a recalcular la
                página en cada cuadro. */}
            <div className="mt-4">
              {siguiente ? (
                <>
                  <div className="h-3 border-2 border-[var(--color-panel-border)] bg-[#0a0a1e] p-px">
                    <div
                      className="barra-rango h-full origin-left"
                      style={{ transform: `scaleX(${r.avance})`, background: siguiente.color, boxShadow: `0 0 10px ${siguiente.color}` }}
                    />
                  </div>
                  <p className="mt-2 font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.08em] text-[var(--muted)]">
                    {r.faltan} {t.faltan} <span style={{ color: siguiente.color }}>{en ? siguiente.tituloEn : siguiente.titulo}</span>
                  </p>
                </>
              ) : (
                <p className="font-[family-name:var(--font-terminal)] text-[17px] text-[var(--muted)]">{t.maximo}</p>
              )}
            </div>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="border-2 border-[var(--color-panel-border)] p-3 text-center">
            <dd className="font-[family-name:var(--font-pixel)] text-[18px] text-[var(--gold)]">
              <Contador valor={xp} />
            </dd>
            <dt className="mt-2 font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.14em] text-[var(--muted)]">{t.xp}</dt>
          </div>
          <div className="border-2 border-[var(--color-panel-border)] p-3 text-center">
            <dd className="font-[family-name:var(--font-pixel)] text-[18px] text-[var(--pink)]">
              <Contador valor={racha} duracion={600} />
            </dd>
            <dt className="mt-2 font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.14em] text-[var(--muted)]">
              {t.racha} · {t.dias}
            </dt>
          </div>
          <div className="border-2 border-[var(--color-panel-border)] p-3 text-center">
            <dd className="flex h-[27px] items-center justify-center">
              <BarraGasolina gasolina={gasolina} maximo={GASOLINA_MAXIMA} etiqueta={`${t.gasolina}: ${gasolina} / ${GASOLINA_MAXIMA}`} alto={18} />
            </dd>
            <dt className="mt-2 font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.14em] text-[var(--muted)]">{t.gasolina}</dt>
          </div>
          <div className="border-2 border-[var(--color-panel-border)] p-3 text-center">
            <dd className="font-[family-name:var(--font-pixel)] text-[18px] text-[var(--cyan)]">
              <Contador valor={totalLecciones} duracion={600} />
            </dd>
            <dt className="mt-2 font-[family-name:var(--font-terminal)] text-[15px] uppercase tracking-[0.14em] text-[var(--muted)]">{t.lecciones}</dt>
          </div>
        </dl>
      </section>

      {/* ─────────────── retoma ─────────────── */}
      <section className="entra entra-2">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] leading-[1.5] text-white sm:text-[14px]">{textoPixel(t.retoma)}</h2>

        {retomar ? (
          <div
            className="tarjeta-retoma mt-4 flex flex-col items-center gap-5 border-2 p-5 sm:flex-row sm:p-6"
            style={{ borderColor: retomar.color, ["--pc" as string]: retomar.color } as React.CSSProperties}
          >
            <PlanetaPixel id={retomar.tema.id} color={retomar.color} ancho={132} />
            <div className="min-w-0 flex-1 text-center sm:text-left">
              <p className="font-[family-name:var(--font-pixel)] text-[9px] leading-[1.6]" style={{ color: retomar.color }}>
                {String(retomar.tema.numero).padStart(2, "0")} · {textoPixel(retomar.tx.nombre)}
              </p>
              <h3 className="mt-1 font-[family-name:var(--font-display)] text-[20px] font-black leading-[1.25] text-white">
                {retomar.tx.titulo}
              </h3>

              <div className="mt-3 flex gap-px border-2 border-[var(--color-panel-border)] bg-[#0a0a1e] p-px">
                {Array.from({ length: retomar.total }, (_, k) => (
                  <i key={k} className="block h-2 flex-1" style={{ background: k < retomar.hechas ? retomar.color : "#191940" }} />
                ))}
              </div>
              <p className="mt-2 font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.08em] text-[var(--muted)]">
                {retomar.hechas}/{retomar.total} · {Math.round((retomar.hechas / retomar.total) * 100)}%
              </p>

              {retomar.proxima && (
                <p className="mt-3 text-[14.5px] leading-[1.5] text-[var(--muted)]">
                  {retomar.proximaLista ? (
                    <>
                      <span className="font-[family-name:var(--font-terminal)] text-[16px] uppercase tracking-[0.14em]" style={{ color: retomar.color }}>
                        {t.siguienteLeccion}:
                      </span>{" "}
                      <span className="text-white">{textoSubtema(retomar.proxima, idioma).titulo}</span>
                    </>
                  ) : (
                    t.sinLeccion
                  )}
                </p>
              )}
            </div>
            <Link
              transitionTypes={["adelante"]}
              href={
                retomar.proxima && retomar.proximaLista
                  ? `/leccion/${retomar.tema.id}/${retomar.proxima.id}`
                  : `/tema/${retomar.tema.id}`
              }
              className="boton-pixel boton-pixel-lleno w-full shrink-0 sm:w-auto"
            >
              {retomar.proximaLista ? t.continuar : t.verMundo}
            </Link>
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-4 border-2 border-dashed border-[var(--color-panel-border)] p-6 text-center">
            <PuntiPixel estado="info" ancho={80} />
            <p className="max-w-[40ch] text-[15px] leading-[1.6] text-[var(--muted)]">{t.retomaVacio}</p>
            <Link href="/inicio" transitionTypes={["atras"]} className="boton-pixel boton-pixel-lleno">
              {t.empezar}
            </Link>
          </div>
        )}
      </section>

      {/* ─────────────── a medio camino ─────────────── */}
      {empezados.length > 1 && (
        <section className="entra entra-3">
          <h2 className="font-[family-name:var(--font-pixel)] text-[12px] leading-[1.5] text-white">{textoPixel(t.empezados)}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {empezados
              .filter((m) => m !== retomar)
              .map((m) => (
                <li key={m.tema.id}>
                  <Link
                    href={`/tema/${m.tema.id}`}
                    transitionTypes={["adelante"]}
                    className="fila-mundo flex items-center gap-4 border-2 border-[var(--color-panel-border)] bg-[rgba(16,16,40,0.55)] p-3"
                    style={{ ["--pc" as string]: m.color } as React.CSSProperties}
                  >
                    <PlanetaPixel id={m.tema.id} color={m.color} ancho={56} flotando={false} />
                    <span className="min-w-0 flex-1">
                      <span className="block font-[family-name:var(--font-pixel)] text-[8px] leading-[1.6]" style={{ color: m.color }}>
                        {textoPixel(m.tx.nombre)}
                      </span>
                      <span className="block truncate font-[family-name:var(--font-display)] text-[15px] font-black text-white">{m.tx.titulo}</span>
                      <span className="mt-1.5 flex gap-px">
                        {Array.from({ length: m.total }, (_, k) => (
                          <i key={k} className="block h-1.5 flex-1" style={{ background: k < m.hechas ? m.color : "#191940" }} />
                        ))}
                      </span>
                    </span>
                    <span className="font-[family-name:var(--font-terminal)] text-[16px] text-[var(--muted)]">
                      {m.hechas}/{m.total}
                    </span>
                  </Link>
                </li>
              ))}
          </ul>
        </section>
      )}

      {/* ─────────────── conquistados ─────────────── */}
      <section className="entra entra-4">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] leading-[1.5] text-white">{textoPixel(t.completados)}</h2>
        {completados.length ? (
          <ul className="mt-4 flex flex-wrap gap-3">
            {completados.map((m) => (
              <li key={m.tema.id} className="flex flex-col items-center border-2 p-3 text-center" style={{ borderColor: m.color }}>
                <PlanetaPixel id={m.tema.id} color={m.color} ancho={64} />
                <span className="mt-1 font-[family-name:var(--font-pixel)] text-[7px]" style={{ color: m.color }}>
                  {textoPixel(m.tx.nombre)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-[15px] text-[var(--muted)]">{t.ningunoCompleto}</p>
        )}
      </section>

      {/* ─────────────── ajustes ─────────────── */}
      <section className="entra entra-5 border-t-2 border-[var(--color-panel-border)] pt-6">
        <h2 className="font-[family-name:var(--font-pixel)] text-[12px] leading-[1.5] text-white">{textoPixel(t.ajustes)}</h2>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex items-center gap-3">
              <span className="font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.14em] text-[var(--muted)]">{t.idioma}</span>
              {selectorIdioma}
            </div>
            <div className="flex items-center gap-3">
              <span className="font-[family-name:var(--font-terminal)] text-[17px] uppercase tracking-[0.14em] text-[var(--muted)]">{t.sonido}</span>
              <BotonSonido />
            </div>
          </div>
          <button type="button" onClick={alSalir} className="boton-pixel">
            {t.salir}
          </button>
        </div>
      </section>
    </div>
  );
}
