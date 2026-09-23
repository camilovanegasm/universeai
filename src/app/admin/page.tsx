"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/AuthContext";
import { cambiarPremium, esAdmin, listarUsuarios, llenarTanque, type UsuarioAdmin } from "@/lib/admin";
import { gasolinaMaxima } from "@/lib/progreso";
import { rangoPorXp } from "@/lib/rangos";
import PuntiPixel from "@/components/PuntiPixel";
import BarraGasolina from "@/components/BarraGasolina";
import MarcoAdmin from "@/components/admin/MarcoAdmin";

/**
 * Estación de control: el panel de administración. Solo en español, porque
 * lo usa una sola persona.
 *
 * Esconder esta pantalla no es la seguridad: la seguridad son las reglas de
 * Firestore. Si alguien que no es admin llega aquí, igual Firebase le niega
 * la lista de usuarios; esta pantalla solo le evita ver algo roto.
 */

type Filtro = "todos" | "hoy" | "premium" | "vacio";
type Orden = "recientes" | "xp" | "racha";

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: "todos", texto: "Todos" },
  { id: "hoy", texto: "Jugaron hoy" },
  { id: "premium", texto: "Premium" },
  { id: "vacio", texto: "Sin gasolina" },
];

const fechaCorta = new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" });

function formatearDia(dia: string | null) {
  if (!dia) return "nunca";
  // "YYYY-MM-DD" en UTC: se lee en UTC para que no se corra un día.
  const [a, m, d] = dia.split("-").map(Number);
  return fechaCorta.format(new Date(Date.UTC(a, m - 1, d, 12)));
}

export default function AdminPage() {
  const { usuario } = useAuth();
  const admin = esAdmin(usuario);

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [orden, setOrden] = useState<Orden>("recientes");
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [aviso, setAviso] = useState<{ texto: string; malo?: boolean } | null>(null);


  const cargar = useCallback(async () => {
    try {
      const lista = await listarUsuarios();
      setUsuarios(lista);
      setError(null);
    } catch (e) {
      const codigo = (e as { code?: string }).code;
      setError(
        codigo === "permission-denied"
          ? "Firebase no dejó leer la lista de usuarios. Revisa que las reglas nuevas estén publicadas en la consola de Firebase."
          : "No se pudo cargar la lista. Revisa la conexión e intenta de nuevo."
      );
    }
  }, []);

  useEffect(() => {
    if (!admin) return;
    let vigente = true;
    listarUsuarios()
      .then((lista) => {
        if (vigente) setUsuarios(lista);
      })
      // Si falla, `cargar` vuelve a intentar y traduce el error a algo legible.
      .catch(() => {
        if (vigente) void cargar();
      });
    return () => {
      vigente = false;
    };
  }, [admin, cargar]);

  // El aviso de abajo se va solo.
  useEffect(() => {
    if (!aviso) return;
    const reloj = setTimeout(() => setAviso(null), 3200);
    return () => clearTimeout(reloj);
  }, [aviso]);

  const visibles = useMemo(() => {
    if (!usuarios) return [];
    const q = busqueda.trim().toLowerCase();
    const lista = usuarios.filter((u) => {
      if (q && !u.nombre.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false;
      if (filtro === "hoy") return u.activoHoy;
      if (filtro === "premium") return u.premium;
      if (filtro === "vacio") return u.gasolina <= 0;
      return true;
    });
    return lista.sort((a, b) => {
      if (orden === "xp") return b.xp - a.xp;
      if (orden === "racha") return b.racha - a.racha;
      return (b.creadoEn?.getTime() ?? 0) - (a.creadoEn?.getTime() ?? 0);
    });
  }, [usuarios, busqueda, filtro, orden]);

  const cifras = useMemo(() => {
    const u = usuarios ?? [];
    return [
      { texto: "Pilotos", valor: u.length, color: "var(--matrix)" },
      { texto: "Jugaron hoy", valor: u.filter((x) => x.activoHoy).length, color: "#00f5ff" },
      { texto: "Premium", valor: u.filter((x) => x.premium).length, color: "var(--gold)" },
      { texto: "Lecciones hechas", valor: u.reduce((s, x) => s + x.lecciones, 0), color: "#b400ff" },
    ];
  }, [usuarios]);

  // Cambia un usuario en la lista sin volver a pedirla completa.
  function actualizarLocal(uid: string, cambio: Partial<UsuarioAdmin>) {
    setUsuarios((lista) => lista?.map((u) => (u.uid === uid ? { ...u, ...cambio } : u)) ?? null);
  }

  async function alLlenar(u: UsuarioAdmin) {
    setOcupado(u.uid);
    try {
      await llenarTanque(u.uid);
      actualizarLocal(u.uid, { gasolina: gasolinaMaxima() });
      setAviso({ texto: `Tanque lleno para ${u.nombre || u.email}` });
    } catch {
      setAviso({ texto: "No se pudo llenar el tanque. Intenta de nuevo.", malo: true });
    } finally {
      setOcupado(null);
    }
  }

  async function alCambiarPremium(u: UsuarioAdmin) {
    setOcupado(u.uid);
    try {
      await cambiarPremium(u.uid, !u.premium);
      actualizarLocal(u.uid, { premium: !u.premium });
      setAviso({ texto: `${u.nombre || u.email} ${u.premium ? "ya no es premium" : "ahora es premium"}` });
    } catch {
      setAviso({ texto: "No se pudo cambiar el premium. Intenta de nuevo.", malo: true });
    } finally {
      setOcupado(null);
    }
  }

  return (
    <MarcoAdmin
      acciones={
        <button
          onClick={() => {
            setUsuarios(null);
            cargar();
          }}
          className="btn-admin"
        >
          ACTUALIZAR
        </button>
      }
    >

      <main className="mx-auto flex w-full max-w-[1040px] flex-col gap-6 px-4 pb-24 pt-6 sm:px-6">
        {/* cifras */}
        <section aria-label="Resumen" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cifras.map((c) => (
            <div key={c.texto} className="border-2 border-[var(--color-panel-border)] bg-[rgba(13,13,34,0.7)] px-4 py-3">
              <p
                className="font-[family-name:var(--font-pixel)] text-[20px] leading-none tabular-nums"
                style={{ color: c.color }}
              >
                {usuarios ? c.valor : "--"}
              </p>
              <p className="mt-2 font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.1em] text-[var(--muted)]">
                {c.texto}
              </p>
            </div>
          ))}
        </section>

        {/* controles */}
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <label htmlFor="buscar" className="sr-only">
              Buscar por nombre o correo
            </label>
            <input
              id="buscar"
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por nombre o correo"
              className="min-w-0 flex-1 basis-[220px] border-2 border-[var(--color-panel-border)] bg-black/30 px-3 py-2.5 text-[15px] text-white placeholder-[var(--muted)] outline-none focus:border-[var(--matrix)]"
            />
            <label htmlFor="orden" className="sr-only">
              Ordenar
            </label>
            <select
              id="orden"
              value={orden}
              onChange={(e) => setOrden(e.target.value as Orden)}
              className="border-2 border-[var(--color-panel-border)] bg-[#0b0b1d] px-3 py-2.5 text-[15px] text-white outline-none focus:border-[var(--matrix)]"
            >
              <option value="recientes">Más recientes</option>
              <option value="xp">Más XP</option>
              <option value="racha">Mejor racha</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                aria-pressed={filtro === f.id}
                className={`border-2 px-3 py-1.5 font-[family-name:var(--font-terminal)] text-[14px] uppercase tracking-[0.1em] transition-colors ${
                  filtro === f.id
                    ? "border-[var(--matrix)] bg-[var(--matrix)]/15 text-[var(--matrix)]"
                    : "border-[var(--color-panel-border)] text-[var(--muted)] hover:text-white"
                }`}
              >
                {f.texto}
              </button>
            ))}
          </div>
        </section>

        {/* lista */}
        {error ? (
          <div className="flex flex-col items-center gap-4 border-2 border-[var(--pink)]/50 px-6 py-10 text-center">
            <PuntiPixel estado="error" ancho={96} />
            <p className="max-w-[48ch] text-[15px] text-[var(--muted)]">{error}</p>
            <button onClick={cargar} className="boton-pixel">
              REINTENTAR
            </button>
          </div>
        ) : !usuarios ? (
          <div className="flex flex-col gap-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="esqueleto h-[112px]" />
            ))}
          </div>
        ) : visibles.length === 0 ? (
          <p className="py-10 text-center font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.1em] text-[var(--muted)]">
            {usuarios.length === 0 ? "TODAVIA NO HAY PILOTOS" : "NADIE COINCIDE CON ESA BUSQUEDA"}
          </p>
        ) : (
          <>
            <p className="font-[family-name:var(--font-terminal)] text-[14px] tracking-[0.1em] text-[var(--muted)]">
              {visibles.length} DE {usuarios.length}
            </p>
            <ol className="flex flex-col gap-3">
              {visibles.map((u, i) => {
                const rango = rangoPorXp(u.xp).actual;
                const lleno = u.gasolina >= gasolinaMaxima();
                const trabajando = ocupado === u.uid;
                return (
                  <li
                    key={u.uid}
                    className="estacion-entra flex flex-wrap items-center gap-x-5 gap-y-3 border-2 bg-[rgba(13,13,34,0.78)] p-4"
                    style={{
                      animationDelay: `${Math.min(i, 8) * 45}ms`,
                      borderColor: u.premium ? "var(--gold)" : "var(--color-panel-border)",
                    }}
                  >
                    {/* quién */}
                    <div className="flex min-w-0 flex-[1_1_260px] items-center gap-3">
                      <span
                        className="grid h-11 w-11 shrink-0 place-items-center border-2 font-[family-name:var(--font-pixel)] text-[14px]"
                        style={{ borderColor: rango.color, color: rango.color, background: `${rango.color}14` }}
                        aria-hidden="true"
                      >
                        {(u.nombre || u.email || "?").trim().charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-[family-name:var(--font-ui)] text-[16px] font-bold text-white">
                          {u.nombre || "Sin nombre"}
                        </p>
                        <p className="truncate text-[13px] text-[var(--muted)]">{u.email}</p>
                        <div className="mt-1.5 flex flex-wrap gap-1.5 font-[family-name:var(--font-terminal)] text-[13px] uppercase tracking-[0.08em]">
                          <span className="border px-1.5" style={{ borderColor: rango.color, color: rango.color }}>
                            {rango.titulo}
                          </span>
                          <span className="border border-[var(--color-panel-border)] px-1.5 text-[var(--muted)]">
                            {u.idioma}
                          </span>
                          {u.premium && (
                            <span className="border border-[var(--gold)] bg-[var(--gold)]/15 px-1.5 text-[var(--gold)]">
                              ★ Premium
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* cómo va */}
                    <dl className="grid flex-[1_1_300px] grid-cols-4 gap-2 font-[family-name:var(--font-terminal)] text-[13px] uppercase tracking-[0.08em] text-[var(--muted)]">
                      <div>
                        <dt>XP</dt>
                        <dd className="text-[18px] tabular-nums text-white">{u.xp}</dd>
                      </div>
                      <div>
                        <dt>Racha</dt>
                        <dd className="text-[18px] tabular-nums text-white">{u.racha}</dd>
                      </div>
                      <div>
                        <dt>Lecc.</dt>
                        <dd className="text-[18px] tabular-nums text-white">{u.lecciones}</dd>
                      </div>
                      <div>
                        <dt>Gasolina</dt>
                        <dd className="pt-1.5">
                          <BarraGasolina gasolina={u.gasolina} maximo={gasolinaMaxima()} etiqueta={`Gasolina ${u.gasolina}`} alto={12} />
                        </dd>
                      </div>
                      <p className="col-span-4 normal-case tracking-normal">
                        Última lección: {formatearDia(u.ultimaLeccion)}
                        {u.creadoEn && <> · Se unió: {fechaCorta.format(u.creadoEn)}</>}
                      </p>
                    </dl>

                    {/* acciones */}
                    <div className="flex flex-[1_1_100%] flex-wrap gap-2 sm:flex-[0_0_auto] sm:flex-col">
                      <button
                        onClick={() => alLlenar(u)}
                        disabled={lleno || trabajando}
                        className="boton-pixel disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {lleno ? "TANQUE LLENO" : "LLENAR TANQUE"}
                      </button>
                      <button
                        onClick={() => alCambiarPremium(u)}
                        disabled={trabajando}
                        className={`boton-pixel disabled:opacity-40 ${u.premium ? "" : "boton-pixel-oro"}`}
                      >
                        {u.premium ? "QUITAR PREMIUM" : "HACER PREMIUM"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </main>

      {aviso && (
        <p
          role="status"
          className="cargando-entra fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom,0px))] z-30 mx-auto w-fit max-w-[calc(100%-32px)] border-2 bg-[#05050f] px-4 py-3 font-[family-name:var(--font-terminal)] text-[16px] tracking-[0.06em]"
          style={{
            borderColor: aviso.malo ? "var(--pink)" : "var(--matrix)",
            color: aviso.malo ? "var(--pink)" : "var(--matrix)",
          }}
        >
          {aviso.texto}
        </p>
      )}
    </MarcoAdmin>
  );
}
