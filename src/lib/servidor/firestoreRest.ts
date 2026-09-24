// Firestore desde el servidor, CON LA SESIÓN DEL PILOTO.
//
// El servidor no tiene una llave maestra de Firebase: lee y escribe usando el
// token de la persona que pidió, así que las reglas de Firestore se aplican
// igual que en su navegador. Si el token es falso o de otra persona, Firestore
// lo rechaza. Menos poder en el servidor = menos daño si algo se filtra.
//
// Solo lo importa código del servidor (src/app/api/...).

const PROYECTO = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "";
const BASE = `https://firestore.googleapis.com/v1/projects/${PROYECTO}/databases/(default)/documents`;

export class ErrorFirestore extends Error {
  constructor(public estado: number, mensaje: string) {
    super(mensaje);
  }
}

type Valor =
  | { nullValue: null }
  | { booleanValue: boolean }
  | { integerValue: string }
  | { doubleValue: number }
  | { stringValue: string }
  | { timestampValue: string }
  | { arrayValue: { values?: Valor[] } }
  | { mapValue: { fields?: Record<string, Valor> } };

/** Del formato de la API de Firestore a JSON normal. */
export function desdeFirestore(v: Valor): unknown {
  if ("nullValue" in v) return null;
  if ("booleanValue" in v) return v.booleanValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("stringValue" in v) return v.stringValue;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(desdeFirestore);
  if ("mapValue" in v) return campos(v.mapValue.fields ?? {});
  return undefined;
}

function campos(f: Record<string, Valor>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(f).map(([k, v]) => [k, desdeFirestore(v)]));
}

/** Solo lo que escribe el Laboratorio: enteros y textos. */
function aFirestore(v: number | string): Valor {
  return typeof v === "number" ? { integerValue: String(Math.trunc(v)) } : { stringValue: v };
}

export type Documento = { existe: boolean; datos: Record<string, unknown>; actualizado: string | null };

export function conSesion(token: string) {
  const cabeceras = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  async function leer(ruta: string): Promise<Documento> {
    const r = await fetch(`${BASE}/${ruta}`, { headers: cabeceras, cache: "no-store" });
    if (r.status === 404) return { existe: false, datos: {}, actualizado: null };
    if (!r.ok) throw new ErrorFirestore(r.status, `leer ${ruta.split("/")[0]}: ${r.status}`);
    const j = (await r.json()) as { fields?: Record<string, Valor>; updateTime?: string };
    return { existe: true, datos: campos(j.fields ?? {}), actualizado: j.updateTime ?? null };
  }

  /**
   * Escribe varios documentos a la vez (o todo o nada).
   *  - Con `leido`: el documento tiene que seguir como se leyó. Si alguien lo
   *    cambió en el medio, Firestore rechaza todo y se vuelve a intentar.
   *  - Con `sumar`: esos campos suben 1 en Firestore mismo (sin condición),
   *    para que muchos pilotos a la vez no choquen en un contador compartido.
   */
  async function escribir(
    cambios: { ruta: string; datos?: Record<string, number | string>; leido?: Documento; sumar?: string[] }[],
  ): Promise<void> {
    const writes = cambios.map((c) => {
      const datos = c.datos ?? {};
      return {
        update: {
          name: `projects/${PROYECTO}/databases/(default)/documents/${c.ruta}`,
          fields: Object.fromEntries(Object.entries(datos).map(([k, v]) => [k, aFirestore(v)])),
        },
        updateMask: { fieldPaths: Object.keys(datos) },
        ...(c.sumar?.length
          ? { updateTransforms: c.sumar.map((f) => ({ fieldPath: f, increment: { integerValue: "1" } })) }
          : {}),
        ...(c.leido
          ? { currentDocument: c.leido.existe && c.leido.actualizado ? { updateTime: c.leido.actualizado } : { exists: false } }
          : {}),
      };
    });
    const r = await fetch(`${BASE}:commit`, { method: "POST", headers: cabeceras, body: JSON.stringify({ writes }) });
    if (!r.ok) throw new ErrorFirestore(r.status, `escribir: ${r.status}`);
  }

  return { leer, escribir };
}

/**
 * Lee el uid del token SIN verificarlo. No hace falta verificarlo aquí:
 * Firestore lo verifica en cada lectura y escritura (y las reglas exigen que
 * el perfil que se toca sea del dueño del token). Solo sirve para saber qué
 * documento pedir.
 */
export function uidDelToken(token: string): string | null {
  const partes = token.split(".");
  if (partes.length !== 3 || token.length > 4096) return null;
  try {
    const carga = JSON.parse(Buffer.from(partes[1], "base64url").toString("utf8")) as { user_id?: unknown; sub?: unknown };
    const uid = typeof carga.user_id === "string" ? carga.user_id : typeof carga.sub === "string" ? carga.sub : null;
    return uid && /^[A-Za-z0-9]{10,128}$/.test(uid) ? uid : null;
  } catch {
    return null;
  }
}
