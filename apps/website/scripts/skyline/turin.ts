/*
 * Turin seen from a rise east of the river, looking west: the old town's large blocks of five- and
 * six-storey buildings around courtyards, a few baroque domes, the Mole Antonelliana on the right,
 * the Intesa Sanpaolo tower further off by Porta Susa and the Alps far behind, with Monviso standing
 * out. One unit is roughly seven metres, so the Mole's 167 m make about 24 units. West is -z and
 * north is +x.
 */
import { box, cylinder, hash2, sphere, type Camera, type Scene } from './engine.ts';

/** Street grid pitch: an 84 m block plus its street. */
const CELL = 12;
/** Half the side of a block, leaving a 14 m street to the next one. */
const BLOCK = 5;
/** Depth of the buildings around the courtyard. */
const WING = 2.1;
/** Length of one building along the street. */
const FRONTAGE = 2.5;
/** The Mole's position; its cell is left as a square around it. */
const MOLE = { x: 30, z: -18 } as const;
/** Cells holding a church under a baroque dome instead of a block: cell coordinates and radius. */
const DOMES = [
  { ix: -3, iz: -2, r: 1.5 },
  { ix: 0, iz: -4, r: 1.3 },
  { ix: -6, iz: -5, r: 1.2 },
  { ix: 1, iz: -1, r: 1.1 },
] as const;
/**
 * The cell of the Intesa Sanpaolo tower: about 2.1 km west and 260 m north of the Mole, on the
 * grid, so its 166 m stand just short of the Mole's top but much further from the eye.
 */
const TOWER = { ix: 5, iz: -27 } as const;
/** The foot of the Alps. */
const RANGE_Z = -420;

/**
 * Whether a cell is left without a block: the Mole's square, the tower's and the churches.
 */
function isOpen(ix: number, iz: number): boolean {
  if (ix === Math.floor(MOLE.x / CELL) && iz === Math.floor(MOLE.z / CELL)) {
    return true;
  }
  if (ix === TOWER.ix && iz === TOWER.iz) {
    return true;
  }
  return DOMES.some((dome) => dome.ix === ix && dome.iz === iz);
}

/**
 * One block: a ring of buildings around a courtyard, each building with its own eaves height and a
 * pitched roof whose ridge runs along the street, plus the odd chimney.
 */
function block(lx: number, y: number, lz: number, ix: number, iz: number): number {
  const ax = Math.abs(lx);
  const az = Math.abs(lz);
  const onX = ax > az;
  const across = onX ? ax : az;
  const along = onX ? lz : lx;
  const side = (onX ? (lx > 0 ? 1 : 3) : (lz > 0 ? 2 : 4)) + ix * 7 + iz * 13;
  const lot = Math.floor((along + BLOCK) / FRONTAGE);
  const tall = hash2(side * 31 + lot, ix - iz);
  const eaves = 2.5 + Math.floor(tall * 4) * 0.42;

  const wingMiddle = BLOCK - WING / 2;
  const fromRidge = Math.abs(across - wingMiddle);
  const roof = (y - (eaves + 0.75 - fromRidge * 0.7)) * 0.8;
  const ring = Math.max(box(lx, y - 2.5, lz, BLOCK, 3.5, BLOCK), -box(lx, y, lz, BLOCK - WING, 8, BLOCK - WING));
  const building = Math.max(ring, roof);

  const lotCentre = (lot + 0.5) * FRONTAGE - BLOCK;
  const chimneyAlong = along - lotCentre - (hash2(lot, side) - 0.5) * 1.4;
  const chimney = hash2(side, lot * 3) > 0.45
    ? box(chimneyAlong, y - (eaves + 0.75), across - wingMiddle - 0.35, 0.1, 0.32, 0.1)
    : Infinity;
  return Math.min(building, chimney);
}

/**
 * The street grid: the blocks of the current cell and its eight neighbours.
 */
function blocks(x: number, y: number, z: number): number {
  if (y > 6.5) {
    return y - 5.5;
  }
  const ix = Math.floor(x / CELL);
  const iz = Math.floor(z / CELL);
  let d = Infinity;
  for (let ox = -1; ox <= 1; ox++) {
    for (let oz = -1; oz <= 1; oz++) {
      const cx = ix + ox;
      const cz = iz + oz;
      if (isOpen(cx, cz)) {
        continue;
      }
      d = Math.min(d, block(x - (cx + 0.5) * CELL, y, z - (cz + 0.5) * CELL, cx, cz));
    }
  }
  return d;
}

/**
 * Baroque churches: a nave, a drum with a raised dome and a small lantern.
 */
function domes(x: number, y: number, z: number): number {
  let d = Infinity;
  for (const dome of DOMES) {
    const lx = x - (dome.ix + 0.5) * CELL;
    const lz = z - (dome.iz + 0.5) * CELL;
    const bound = Math.max(Math.abs(lx), Math.abs(lz)) - 5.3;
    if (bound > 1) {
      d = Math.min(d, bound);
      continue;
    }
    const nave = box(lx, y - 1.9, lz - 1.5, 2.2, 1.9, 3.6);
    const crossing = box(lx, y - 2.6, lz, 2.4, 2.6, 2.4);
    const drum = cylinder(lx, y - 6, lz, dome.r, 0.9);
    const cap = Math.max(sphere(lx, (y - 6.9) / 1.3, lz, dome.r) * 0.85, 6.9 - y);
    const lantern = cylinder(lx, y - (6.9 + dome.r * 1.3 + 0.35), lz, dome.r * 0.2, 0.5);
    d = Math.min(d, nave, crossing, drum, cap, lantern);
  }
  return d;
}

/**
 * Columns around a square of half-side `half`, spaced `pitch` apart: distance in the horizontal plane.
 */
function colonnade(lx: number, lz: number, half: number, pitch: number, radius: number): number {
  const ax = Math.abs(lx);
  const az = Math.abs(lz);
  const along = ax > az ? az : ax;
  const across = ax > az ? ax : az;
  const column = Math.min(half, Math.round(along / pitch) * pitch);
  return Math.hypot(along - column, across - half) - radius;
}

/**
 * Half-width of the Mole's dome from its springing (t = 0) to its top (t = 1): steep, full sides
 * that curve in towards the lantern like a pointed arch.
 */
function moleDomeWidth(t: number): number {
  return 0.95 + 1.75 * (1 - t ** 1.7) ** 0.75;
}

/**
 * The Mole Antonelliana, in real proportions: the windowed base, the peristyle of columns around
 * it, the tall four-sided dome, the terrace, the two-storey colonnaded temple and the segmented
 * spire with its star.
 */
function mole(x: number, y: number, z: number): number {
  const lx = x - MOLE.x;
  const lz = z - MOLE.z;
  const reach = Math.hypot(lx, lz);
  if (reach > 6) {
    return reach - 5;
  }
  const square = Math.max(Math.abs(lx), Math.abs(lz));
  /**
   * A square slab between two heights.
   */
  const slab = (bottom: number, top: number, half: number): number =>
    Math.max(square - half, bottom - y, y - top);

  const base = slab(0, 5.6, 3.1);
  const cornice = slab(5.45, 5.7, 3.25);
  const core = slab(5.6, 7, 2.55);
  const peristyle = Math.max(colonnade(lx, lz, 2.9, 0.42, 0.11), 5.6 - y, y - 7);
  const attic = slab(7, 7.45, 3);

  const springing = 7.45;
  const rise = 5.2;
  const t = Math.min(1, Math.max(0, (y - springing) / rise));
  const dome = Math.max((square - moleDomeWidth(t)) * 0.55, springing - y, y - (springing + rise));

  const terrace = slab(12.6, 12.9, 1.25);
  const lowerCore = slab(12.9, 14.5, 0.78);
  const lowerColumns = Math.max(colonnade(lx, lz, 1.02, 0.34, 0.07), 12.9 - y, y - 14.5);
  const lowerCornice = slab(14.5, 14.7, 1.12);
  const upperCore = slab(14.7, 15.9, 0.55);
  const upperColumns = Math.max(colonnade(lx, lz, 0.74, 0.37, 0.06), 14.7 - y, y - 15.9);
  const upperCornice = slab(15.9, 16.1, 0.82);

  const spireBase = 16.1;
  const spireTop = 23.4;
  const s = Math.min(1, Math.max(0, (y - spireBase) / (spireTop - spireBase)));
  const stage = Math.floor(s * 7);
  const inStage = s * 7 - stage;
  const taper = 0.5 * (1 - s) ** 1.15 + 0.035;
  const ledge = inStage < 0.12 ? 0.07 * (1 - s) : 0;
  const spire = Math.max((square - taper - ledge) * 0.85, spireBase - y, y - spireTop);
  const star = sphere(lx, y - 23.65, lz, 0.2);

  return Math.min(
    base, cornice, core, peristyle, attic, dome, terrace,
    lowerCore, lowerColumns, lowerCornice, upperCore, upperColumns, upperCornice, spire, star,
  );
}

/**
 * The Intesa Sanpaolo tower: a slab 59 by 35 m with its long sides facing east and west, over a
 * glass hall, its ends stepping in near the top and the greenhouse on the roof sloping down to
 * the south. The top stays a little under the Mole's star.
 */
function tower(x: number, y: number, z: number): number {
  const lx = x - (TOWER.ix + 0.5) * CELL;
  const lz = z - (TOWER.iz + 0.5) * CELL;
  const bound = Math.max(Math.abs(lx) - 4.5, Math.abs(lz) - 3, y - 24);
  if (bound > 1) {
    return bound;
  }
  const hall = box(lx, y - 1.6, lz, 3.9, 1.6, 2.3);
  const offices = box(lx, y - 12.4, lz, 4.2, 9.2, 2.5);
  const crown = box(lx, y - 22.35, lz, 3.6, 0.75, 2.5);
  const greenhouse = Math.max(box(lx, y - 23.5, lz, 3, 0.4, 2.4), y - (23.5 + lx * 0.08));
  return Math.min(hall, offices, crown, greenhouse);
}

/**
 * Zig-zag wave with sharp crests in [0, 1].
 */
function crest(v: number): number {
  return 1 - Math.abs(2 * (v - Math.floor(v)) - 1);
}

/**
 * The ridge line of the Alps along x: jagged layered crests, with Monviso's pyramid on the left.
 */
function ridge(x: number): number {
  let h = 26;
  h += 18 * crest(x * 0.005 + 0.3) ** 1.4;
  h += 10 * crest(x * 0.014 + 0.71) ** 1.6;
  h += 4.5 * crest(x * 0.037 + 0.2);
  h += 1.8 * crest(x * 0.1 + 0.5);
  const monviso = Math.max(0, 1 - Math.abs(x + 170) / 70);
  return h + 58 * monviso ** 1.7;
}

/**
 * The Alps as a heightfield that rises from the plain far behind the city.
 */
function alps(x: number, y: number, z: number): number {
  if (z > RANGE_Z + 10) {
    return z - RANGE_Z;
  }
  const foot = Math.min(1, (RANGE_Z + 10 - z) / 50);
  const height = ridge(x + (z - RANGE_Z) * 0.18 + 14 * Math.sin(z * 0.04)) * foot;
  return (y - height) * 0.3;
}

/**
 * The whole scene: ground, grid, churches, the Mole, the tower and the mountains.
 */
function map(x: number, y: number, z: number): number {
  return Math.min(y, blocks(x, y, z), domes(x, y, z), mole(x, y, z), tower(x, y, z), alps(x, y, z));
}

/**
 * Reflectance. The ground falls away; the Alps brighten from hazy foothills to snowy peaks; facades
 * carry rows of darker windows, the Mole's base and dome their own window rows, the tower's glass
 * the light bands of its floors.
 */
function albedo(x: number, y: number, z: number): number {
  if (z < RANGE_Z + 20) {
    return Math.min(1, Math.max(0.1, (y - 18) / 36));
  }
  if (y < 0.2) {
    return 0.04;
  }
  const lx = x - MOLE.x;
  const lz = z - MOLE.z;
  if (Math.hypot(lx, lz) < 4.6) {
    const along = Math.abs(lx) > Math.abs(lz) ? lz : lx;
    if (y < 5.4) {
      const opening = along / 0.55 - Math.floor(along / 0.55) > 0.55 && y / 0.9 - Math.floor(y / 0.9) > 0.45;
      return opening ? 0.35 : 0.9;
    }
    if (y > 7.6 && y < 12.4) {
      const row = (y - 7.6) % 1.2 < 0.26 && along / 0.5 - Math.floor(along / 0.5) > 0.5;
      return row ? 0.4 : 0.92;
    }
    return 0.9;
  }
  const tx = x - (TOWER.ix + 0.5) * CELL;
  const tz = z - (TOWER.iz + 0.5) * CELL;
  if (Math.abs(tx) < 4.4 && Math.abs(tz) < 2.7) {
    if (y > 23) {
      return 0.95;
    }
    const band = y / 0.6 - Math.floor(y / 0.6) < 0.25;
    return band ? 0.88 : 0.6;
  }
  const along = (x + z) / 0.62;
  const floor = y / 0.47;
  const opening = along - Math.floor(along) > 0.5 && floor - Math.floor(floor) > 0.42 && y > 0.6;
  return opening ? 0.42 : 0.82;
}

/**
 * A few lit windows on the buildings' facades.
 */
function emission(x: number, y: number, z: number, nx: number, ny: number): number {
  if (Math.abs(ny) > 0.5 || y < 0.6 || y > 4.6 || z < -150) {
    return 0;
  }
  const along = Math.abs(nx) > 0.5 ? z : x;
  const column = Math.floor(along / 0.62);
  const floor = Math.floor(y / 0.47);
  const inWindow = along / 0.62 - column > 0.5 && y / 0.47 - floor > 0.42;
  return inWindow && hash2(column * 7 + Math.floor(x), floor * 13 + Math.floor(z)) > 0.975 ? 0.55 : 0;
}

export const scene: Scene = {
  map,
  albedo,
  emission,
  light: [-0.62, 0.45, 0.32],
  lightIntensity: 0.9,
  ambient: 0.12,
  rim: 0.4,
  fog: 0.003,
  maxDistance: 800,
  maxSteps: 420,
  stepScale: 0.7,
};

export const camera: Camera = { position: [-6, 13, 95], target: [6, 9.5, -60], fov: 20 };

export const plate = {
  name: 'turin',
  description: 'The Turin skyline: old town blocks, the Mole Antonelliana, the Intesa Sanpaolo tower and the Alps behind',
  width: 1920,
  height: 360,
  tone: { black: 0.04, white: 0.7, gamma: 1 },
} as const;
