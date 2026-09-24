// Los mundos y lecciones publicados en Firebase, leídos AL PUBLICAR EL SITIO
// (en Vercel), para prearmar sus páginas. El catálogo es público (las reglas
// dejan leer contenido/ a cualquiera), así que basta la API REST sin sesión.
//
// Si Firebase no responde a tiempo, se usan los mundos del código: publicar
// nunca falla por esto; las páginas que falten se arman la primera vez que
// alguien entra.
import { TEMAS } from "@/lib/temas";
import { desdeFirestore } from "@/lib/servidor/firestoreRest";

type MundoIds = { id: string; subtemas: string[] };

const DEL_CODIGO: MundoIds[] = TEMAS.map((t) => ({ id: t.id, subtemas: t.subtemas.map((s) => s.id) }));
const ID_VALIDO = /^[a-z0-9-]{1,80}$/;

let pedido: Promise<MundoIds[]> | null = null;

export function mundosPublicados(): Promise<MundoIds[]> {
  pedido ??= leer();
  return pedido;
}

async function leer(): Promise<MundoIds[]> {
  const proyecto = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!proyecto) return DEL_CODIGO;
  try {
    const r = await fetch(
      `https://firestore.googleapis.com/v1/projects/${proyecto}/databases/(default)/documents/contenido/catalogo`,
      { signal: AbortSignal.timeout(8_000), cache: "no-store" },
    );
    if (!r.ok) return DEL_CODIGO;
    const j = (await r.json()) as { fields?: { temas?: Parameters<typeof desdeFirestore>[0] } };
    const temas = j.fields?.temas ? desdeFirestore(j.fields.temas) : null;
    if (!Array.isArray(temas)) return DEL_CODIGO;
    const mundos = temas
      .map((t) => {
        const m = t as { id?: unknown; subtemas?: unknown };
        const subtemas = Array.isArray(m.subtemas)
          ? m.subtemas.map((s) => (s as { id?: unknown }).id).filter((id): id is string => typeof id === "string" && ID_VALIDO.test(id))
          : [];
        return typeof m.id === "string" && ID_VALIDO.test(m.id) ? { id: m.id, subtemas } : null;
      })
      .filter((m): m is MundoIds => m !== null);
    // Se suman los del código que no estén (por si el catálogo aún no los tiene).
    const ids = new Set(mundos.map((m) => m.id));
    return [...mundos, ...DEL_CODIGO.filter((m) => !ids.has(m.id))];
  } catch {
    return DEL_CODIGO;
  }
}
