/**
 * Los mundos de Punti, dibujados pixel por pixel.
 *
 * Un planeta no es un archivo de imagen: se genera a partir del `id` del tema.
 * Mismo tema, mismo mundo, siempre — y un tema nuevo trae su mundo sin que
 * nadie tenga que ilustrarlo.
 *
 * Se dibuja pequeño (64-80 px de lado) y se amplía con `image-rendering:
 * pixelated`. Por eso se ve igual de nítido en un celular que en un monitor.
 *
 * Sin React a propósito: así se puede probar solo.
 */

/* ------------------------------------------------------- semilla y ruido */

export function hashTexto(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Avalancha: mezcla los bits antes de decidir la familia del mundo. Sin esto,
 * la familia queda pegada a los bits bajos de la semilla y varios temas
 * seguidos caen en el mismo tipo de planeta.
 */
function avalancha(h: number): number {
  h = (h ^ (h >>> 16)) >>> 0;
  h = Math.imul(h, 2246822507) >>> 0;
  h = (h ^ (h >>> 13)) >>> 0;
  h = Math.imul(h, 3266489909) >>> 0;
  return (h ^ (h >>> 16)) >>> 0;
}

function generador(semilla: number): () => number {
  let s = (semilla >>> 0) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5;  s >>>= 0;
    return s / 4294967296;
  };
}

function valorHash(ix: number, iy: number, iz: number, semilla: number): number {
  let h = (semilla ^ Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263)
    ^ Math.imul(iz | 0, 1274126177)) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1597334677) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

const suave = (t: number) => t * t * (3 - 2 * t);

function ruido3(x: number, y: number, z: number, semilla: number): number {
  const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
  const fx = suave(x - ix), fy = suave(y - iy), fz = suave(z - iz);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;
  const c = (a: number, b: number, d: number) => valorHash(ix + a, iy + b, iz + d, semilla);
  return L(
    L(L(c(0, 0, 0), c(1, 0, 0), fx), L(c(0, 1, 0), c(1, 1, 0), fx), fy),
    L(L(c(0, 0, 1), c(1, 0, 1), fx), L(c(0, 1, 1), c(1, 1, 1), fx), fy),
    fz,
  );
}

function fbm(x: number, y: number, z: number, semilla: number, octavas: number): number {
  let a = 0.5, f = 1, s = 0, n = 0;
  for (let i = 0; i < octavas; i++) {
    s += a * ruido3(x * f, y * f, z * f, (semilla + i * 7919) >>> 0);
    n += a; a *= 0.5; f *= 2;
  }
  return s / n;
}

/* ------------------------------------------------------------------ color */

type RGB = [number, number, number];

function hsl(h: number, s: number, l: number): RGB {
  h = ((h % 360) + 360) % 360; s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(Math.min(k(n) - 3, 9 - k(n)), 1));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

/** Rampa de n tonos, de sombra a luz, con deriva de matiz: frío abajo, cálido arriba. */
function rampa(h: number, s: number, n: number, l0: number, l1: number, deriva: number): RGB[] {
  const out: RGB[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    out.push(hsl(h + deriva * (t - 0.5) * 2, s * (1 - 0.22 * t), l0 + (l1 - l0) * t));
  }
  return out;
}

function hexAMatizSat(hex: string): [number, number] {
  const n = parseInt(hex.slice(1), 16);
  const R = ((n >> 16) & 255) / 255, G = ((n >> 8) & 255) / 255, B = (n & 255) / 255;
  const mx = Math.max(R, G, B), mn = Math.min(R, G, B), d = mx - mn;
  let h = 0;
  if (d) h = mx === R ? 60 * ((((G - B) / d) % 6 + 6) % 6)
    : mx === G ? 60 * ((B - R) / d + 2) : 60 * ((R - G) / d + 4);
  const l = (mx + mn) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return [(h + 360) % 360, Math.min(88, Math.max(42, s * 100))];
}

/* --------------------------------------------------------------- familias */

export const FAMILIAS = ["rocoso", "gaseoso", "oceanico", "volcanico", "helado"] as const;
export type FamiliaMundo = (typeof FAMILIAS)[number];

export const NOMBRE_FAMILIA: Record<FamiliaMundo, string> = {
  rocoso: "Rocoso",
  gaseoso: "Gaseoso",
  oceanico: "Oceánico",
  volcanico: "Volcánico",
  helado: "Helado",
};

export type PerfilMundo = {
  semilla: number;
  familia: FamiliaMundo;
  matiz: number;
  saturacion: number;
  anillo: boolean;
  lunas: number;
  inclinacion: number;
  crateres: number;
  frecuencia: number;
  giro: number;
};

/** El perfil de un mundo sale solo de su `id`, así que nunca cambia. */
export function perfilMundo(id: string, colorHex: string): PerfilMundo {
  const semilla = hashTexto(id);
  const r = generador(semilla);
  const familia = FAMILIAS[avalancha(semilla) % FAMILIAS.length];
  const [matiz, saturacion] = hexAMatizSat(colorHex);
  return {
    semilla,
    familia,
    matiz,
    saturacion,
    anillo: r() < 0.42,
    lunas: r() < 0.55 ? 1 + Math.floor(r() * 2) : 0,
    inclinacion: r() * 0.7 - 0.35,
    crateres: 3 + Math.floor(r() * 6),
    frecuencia: 2.1 + r() * 2.4,
    giro: r() * 99,
  };
}

/* ----------------------------------------------------------------- dibujo */

/** Pinta el mundo en un canvas cuadrado de `lado` x `lado` pixeles reales. */
export function dibujarMundo(
  ctx: CanvasRenderingContext2D,
  lado: number,
  id: string,
  colorHex: string,
) {
  const p = perfilMundo(id, colorHex);
  const img = ctx.createImageData(lado, lado);
  const D = img.data;
  const cx = lado / 2, cy = lado / 2, R = lado * 0.345;

  // luz arriba-izquierda, ligeramente al frente
  const Lx = -0.48, Ly = -0.55, Lz = 0.68;

  let base: RGB[], extra: RGB[] | null = null, umbral = 0;
  if (p.familia === "oceanico") {
    base = rampa(p.matiz + 8, p.saturacion, 5, 16, 64, -16);
    extra = rampa((p.matiz + 150) % 360, 60, 5, 14, 58, 10); umbral = 0.52;
  } else if (p.familia === "volcanico") {
    // La lava brilla en el color del propio mundo, no en naranja fijo: un
    // mundo morado tiene que verse morado, no marrón como todos los demás.
    base = rampa(p.matiz, Math.max(46, p.saturacion * 0.72), 5, 9, 42, -14);
    extra = rampa(p.matiz, 96, 4, 46, 74, 18); umbral = 0.63;
  } else if (p.familia === "helado") {
    base = rampa(p.matiz, Math.max(40, Math.min(p.saturacion, 62)), 5, 30, 86, -20);
    extra = rampa((p.matiz + 25) % 360, 72, 4, 26, 74, 8); umbral = 0.58;
  } else if (p.familia === "gaseoso") {
    base = rampa(p.matiz, p.saturacion, 6, 17, 70, -22);
  } else {
    base = rampa(p.matiz, p.saturacion * 0.92, 5, 14, 60, -18);
  }

  const especular = hsl(p.matiz, 90, 72);
  // luz de borde en el complementario: es lo que lo hace leer como neón
  // y no como un planeta de libro de ciencias
  const bordeNeon = hsl((p.matiz + 185) % 360, 95, 62);

  const rc = generador(p.semilla ^ 0x5bf03);
  const crat: { x: number; y: number; z: number; r: number }[] = [];
  for (let i = 0; i < p.crateres; i++) {
    const u = rc() * 2 - 1, ang = rc() * Math.PI * 2, w = Math.sqrt(1 - u * u);
    crat.push({ x: w * Math.cos(ang), y: u, z: w * Math.sin(ang), r: 0.1 + rc() * 0.15 });
  }

  const ci = Math.cos(p.inclinacion), si = Math.sin(p.inclinacion);
  const poner = (x: number, y: number, c: RGB) => {
    if (x < 0 || y < 0 || x >= lado || y >= lado) return;
    const o = (y * lado + x) * 4;
    D[o] = c[0]; D[o + 1] = c[1]; D[o + 2] = c[2]; D[o + 3] = 255;
  };

  const anilloAtras = () => {
    if (!p.anillo) return;
    const a = R * 1.72, b = R * 0.4, dy = R * 0.16;
    const col = hsl(p.matiz + 30, 80, 40);
    for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
      const ux = (x + 0.5 - cx) / a, uy = (y + 0.5 - cy - dy) / b;
      const rr = ux * ux + uy * uy;
      if (rr < 0.42 || rr > 1) continue;
      if ((y + 0.5 - cy - dy) > 0) continue;              // esa mitad va delante
      if (Math.floor(Math.sqrt(rr) * 9) % 3 === 1) continue; // huecos del anillo
      const dxp = (x + 0.5 - cx) / R, dyp = (y + 0.5 - cy) / R;
      if (dxp * dxp + dyp * dyp < 1) continue;            // tapado por el planeta
      poner(x, y, col);
    }
  };

  anilloAtras();

  for (let y = 0; y < lado; y++) {
    for (let x = 0; x < lado; x++) {
      const dx = (x + 0.5 - cx) / R, dy = (y + 0.5 - cy) / R;
      const d2 = dx * dx + dy * dy;
      if (d2 > 1) continue;
      const nz = Math.sqrt(1 - d2);
      const nx = dx, ny = dy;
      const ry = ny * ci - nz * si, rz = ny * si + nz * ci;

      let lum = nx * Lx + ny * Ly + nz * Lz;

      let v: number;
      if (p.familia === "gaseoso") {
        v = fbm(nx * 1.5 + p.giro, ry * p.frecuencia * 2.6, rz * 1.5, p.semilla, 3);
        v = v * 0.45 + (Math.sin(ry * p.frecuencia * 3.1 + v * 2.4) * 0.5 + 0.5) * 0.55;
      } else {
        v = fbm((nx + p.giro) * p.frecuencia, ry * p.frecuencia, rz * p.frecuencia, p.semilla, 4);
      }

      if (p.familia === "rocoso" || p.familia === "helado") {
        for (const c of crat) {
          const punto = nx * c.x + ry * c.y + rz * c.z;
          const dd = Math.acos(Math.max(-1, Math.min(1, punto)));
          if (dd < c.r) { lum -= 0.2 * (1 - dd / c.r); v -= 0.14 * (1 - dd / c.r); }
          else if (dd < c.r * 1.22) { lum += 0.09; }
        }
      }

      let pal = base, t = lum * 0.74 + v * 0.4 - 0.1;
      if (extra && v > umbral) { pal = extra; t = lum * 0.78 + (v - umbral) * 0.8; }
      const idx = Math.max(0, Math.min(pal.length - 1, Math.floor(t * pal.length)));
      let col: RGB = pal[idx];

      if (lum > 0.93 && p.familia !== "volcanico") col = especular;

      // Luz de borde continua. Antes se aplicaba solo a los pixeles que pasaban
      // un umbral duro (f > 0.45), y el resultado era un anillo punteado que
      // parecía un fallo de dibujo en vez de un resplandor.
      const borde = Math.pow(1 - nz, 5);
      const fuerza = Math.min(1, borde * 1.7) * Math.max(0, 1 - lum * 1.6);
      if (fuerza > 0.015) {
        const k = Math.min(0.92, fuerza);
        col = [
          Math.round(col[0] + (bordeNeon[0] - col[0]) * k),
          Math.round(col[1] + (bordeNeon[1] - col[1]) * k),
          Math.round(col[2] + (bordeNeon[2] - col[2]) * k),
        ];
      }
      poner(x, y, col);
    }
  }

  ctx.putImageData(img, 0, 0);

  // el anillo de adelante y las lunas van encima del planeta ya pintado
  if (p.anillo) {
    const a = R * 1.72, b = R * 0.4, dy = R * 0.16;
    const col = hsl(p.matiz + 30, 80, 66);
    for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
      const ux = (x + 0.5 - cx) / a, uy = (y + 0.5 - cy - dy) / b;
      const rr = ux * ux + uy * uy;
      if (rr < 0.42 || rr > 1) continue;
      if ((y + 0.5 - cy - dy) <= 0) continue;
      if (Math.floor(Math.sqrt(rr) * 9) % 3 === 1) continue;
      const dxp = (x + 0.5 - cx) / R, dyp = (y + 0.5 - cy) / R;
      const dentro = dxp * dxp + dyp * dyp < 1;
      ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${dentro ? 0.55 : 0.92})`;
      ctx.fillRect(x, y, 1, 1);
    }
  }

  if (p.lunas) {
    const rl = generador(p.semilla ^ 0x91a3);
    for (let i = 0; i < p.lunas; i++) {
      const ang = rl() * Math.PI * 2;
      const dist = R * (1.45 + rl() * 0.45);
      const rad = Math.max(2, Math.round(R * 0.13));
      const mx = Math.round(cx + Math.cos(ang) * dist);
      const my = Math.round(cy + Math.sin(ang) * dist * 0.55);
      const claro = hsl(p.matiz + 60, 45, 74), oscuro = hsl(p.matiz + 60, 40, 44);
      for (let y = -rad; y <= rad; y++) for (let x = -rad; x <= rad; x++) {
        if (x * x + y * y > rad * rad) continue;
        const c = (-x * 0.5 - y * 0.6) / rad > 0.05 ? claro : oscuro;
        ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        ctx.fillRect(mx + x, my + y, 1, 1);
      }
    }
  }
}
