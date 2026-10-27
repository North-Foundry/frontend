// Letterforms for the proposals. Geometric marks are drawn on a 100-unit cap height with a
// 15-unit stroke; typographic ones set Instrument Sans, the identity's typeface, semi-condensed.

import { type Glyph, type Layer } from './engine';

const STROKE = 15;

type Draw = (context: CanvasRenderingContext2D) => void;

function rect(x: number, y: number, width: number, height: number): Draw {
  return (context) => context.fillRect(x, y, width, height);
}

function polygon(...points: [number, number][]): Draw {
  return (context) => {
    context.beginPath();
    for (const [x, y] of points) context.lineTo(x, y);
    context.closePath();
    context.fill();
  };
}

/** Draws `shape` only where x <= `limit`, so a diagonal can stop flush against a stem. */
function clipRight(limit: number, shape: Draw): Draw {
  return (context) => {
    context.save();
    context.beginPath();
    context.rect(-1000, -1000, 1000 + limit, 3000);
    context.clip();
    shape(context);
    context.restore();
  };
}

function geometric(width: number, height: number, ink: Draw[], blue: Draw[]): Glyph {
  return {
    width,
    height,
    draw(context, layer) {
      for (const shape of layer === 0 ? ink : blue) shape(context);
    },
  };
}

/** The N's right stem is the F's stem: one shared upright, N in ink and F in blue. */
export const ligature = geometric(
  100,
  100,
  [rect(0, 0, STROKE, 100), clipRight(49, polygon([0, 0], [17, 0], [64, 100], [47, 100]))],
  [rect(49, 0, STROKE, 100), rect(64, 0, 36, STROKE), rect(64, 43, 26, STROKE - 1)],
);

/**
 * The ligature with the needle of `needle` on the N's top-left corner: the left stem rises
 * above the cap height and ends in a blue point aimed north. The needle sits wholly above the
 * cap line, so the diagonal still starts cleanly from the corner.
 */
// Shift right so the needle's left barb starts at x = 0; the cap line is at y = 44.
const nx = (value: number) => value + 8.5;
const NORTH_CAP = 44;
const northNeedlePart = polygon([nx(-8.5), 42], [nx(7.5), 0], [nx(23.5), 42], [nx(7.5), 34]);
const northInk = [
  rect(nx(0), 40, STROKE, NORTH_CAP + 100 - 40),
  clipRight(
    nx(49),
    polygon(
      [nx(0), NORTH_CAP],
      [nx(17), NORTH_CAP],
      [nx(64), NORTH_CAP + 100],
      [nx(47), NORTH_CAP + 100],
    ),
  ),
];
const northBlue = [
  rect(nx(49), NORTH_CAP, STROKE, 100),
  rect(nx(64), NORTH_CAP, 36, STROKE),
  rect(nx(64), NORTH_CAP + 43, 26, STROKE - 1),
];

export const northLigature = geometric(108.5, NORTH_CAP + 100, northInk, [
  northNeedlePart,
  ...northBlue,
]);

/** The north needle alone, in its own box: the logo without letters. */
export const northArrow = geometric(32, 42, [], [polygon([0, 42], [16, 0], [32, 42], [16, 34])]);

/** Only the needle of `northLigature`, in the same box, to be dithered on its own. */
export const northNeedle = geometric(108.5, NORTH_CAP + 100, [], [northNeedlePart]);

/** `northLigature` without its needle, in the same box, to be drawn crisp. */
export const northLetters = geometric(108.5, NORTH_CAP + 100, northInk, northBlue);

/**
 * The ligature cut as a stencil, as on a casting pattern: the cuts fall exactly where the ink
 * meets the blue, so the bridges are the two colours' borders.
 */
export const stencil = geometric(
  106,
  100,
  [rect(0, 0, STROKE, 100), clipRight(46, polygon([0, 0], [17, 0], [64, 100], [47, 100]))],
  [rect(52, 0, STROKE, 100), rect(71, 0, 35, STROKE), rect(71, 43, 26, STROKE - 1)],
);

/** The N's right stem rises past the cap height into a needle pointing north. */
export const needle = geometric(
  120,
  124,
  [
    rect(0, 24, STROKE, 100),
    clipRight(48, polygon([0, 24], [17, 24], [62, 124], [45, 124])),
    rect(48, 40, STROKE - 1, 84),
  ],
  [
    polygon([39, 42], [55, 0], [71, 42], [55, 34]),
    rect(78, 24, STROKE - 1, 100),
    rect(92, 24, 28, STROKE - 1),
    rect(92, 66, 22, STROKE - 2),
  ],
);

/** A hallmark punch: N and F inside a chamfered frame, as struck into cast metal. */
export const hallmark = geometric(
  100,
  100,
  [
    rect(20, 26, 9, 48),
    clipRight(47, polygon([20, 26], [30, 26], [47, 74], [37, 74])),
    rect(38, 26, 9, 48),
  ],
  [
    (context) => {
      const outer: [number, number][] = [
        [14, 0],
        [86, 0],
        [100, 14],
        [100, 86],
        [86, 100],
        [14, 100],
        [0, 86],
        [0, 14],
      ];
      const inner: [number, number][] = [
        [16, 6],
        [84, 6],
        [94, 16],
        [94, 84],
        [84, 94],
        [16, 94],
        [6, 84],
        [6, 16],
      ];
      context.beginPath();
      for (const ring of [outer, inner]) {
        ring.forEach(([x, y], index) => (index ? context.lineTo(x, y) : context.moveTo(x, y)));
        context.closePath();
      }
      context.fill('evenodd');
    },
    rect(55, 26, 9, 48),
    rect(64, 26, 19, 9),
    rect(64, 46, 15, 8),
  ],
);

const FAMILY = '"Instrument Sans"';

function setFont(context: CanvasRenderingContext2D, weight: number, size: number): void {
  context.font = `${weight} ${size}px ${FAMILY}`;
  context.fontStretch = 'semi-condensed';
  context.textBaseline = 'alphabetic';
}

async function loadFont(weight: number): Promise<CanvasRenderingContext2D> {
  await document.fonts.load(`${weight} 100px ${FAMILY}`, 'NorthFoundry');
  const context = document.createElement('canvas').getContext('2d');
  if (!context) throw new Error('Canvas 2D is not available');
  setFont(context, weight, 100);
  return context;
}

/** "NF" set in Instrument Sans, N in ink and F in blue, trimmed to the cap height. */
export async function typeMonogram(weight = 560, kerning = -4): Promise<Glyph> {
  const measure = await loadFont(weight);
  const n = measure.measureText('N');
  const f = measure.measureText('F');
  const cap = n.actualBoundingBoxAscent;
  const left = n.actualBoundingBoxLeft;
  const fx = n.width + kerning;
  return {
    width: fx + f.actualBoundingBoxRight + left,
    height: cap,
    draw(context, layer: Layer) {
      setFont(context, weight, 100);
      context.fillText(layer === 0 ? 'N' : 'F', (layer === 0 ? 0 : fx) + left, cap);
    },
  };
}

/** The ligature with "North" in ink and "Foundry" in blue beside it, cap-aligned to the mark. */
export async function lockup(): Promise<Glyph> {
  const weight = 500;
  const measure = await loadFont(weight);
  const cap = measure.measureText('N').actualBoundingBoxAscent;
  // Text cap height is 46% of the mark, centred on it.
  const size = (46 / cap) * 100;
  setFont(measure, weight, size);
  const north = measure.measureText('North ').width;
  const foundry = measure.measureText('Foundry').width;
  const textX = 100 + 30;
  return {
    width: textX + north + foundry,
    height: 100,
    draw(context, layer) {
      ligature.draw(context, layer);
      setFont(context, weight, size);
      context.fillText(
        layer === 0 ? 'North' : 'Foundry',
        textX + (layer === 0 ? 0 : north),
        50 + 23,
      );
    },
  };
}

export interface SplitMark {
  /** The part that is dithered. */
  needle: Glyph;
  /** The part drawn crisp, in the same box. */
  letters: Glyph;
}

/** Column range of the N's left stem, measured on the rendered letter at 60% of its height. */
function measureLeftStem(weight: number, cap: number, left: number): [number, number] {
  const margin = 10;
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = Math.ceil(cap) + margin * 2;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas 2D is not available');
  setFont(context, weight, 100);
  context.fillText('N', margin + left, margin + cap);
  const row = Math.round(margin + cap * 0.6);
  const alpha = context.getImageData(0, row, canvas.width, 1).data;
  let start = -1;
  for (let x = 0; x < canvas.width; x++) {
    const filled = (alpha[x * 4 + 3] ?? 0) > 127;
    if (filled && start < 0) start = x;
    if (!filled && start >= 0) return [start - margin, x - margin];
  }
  throw new Error('Could not find the stem of N');
}

async function buildTypeNorth(weight: number, kerning: number): Promise<SplitMark> {
  const measure = await loadFont(weight);
  const n = measure.measureText('N');
  const f = measure.measureText('F');
  const cap = n.actualBoundingBoxAscent;
  const left = n.actualBoundingBoxLeft;
  const [stemStart, stemEnd] = measureLeftStem(weight, cap, left);
  // The needle keeps the proportions of `northLigature`'s, scaled to this stem.
  const unit = (stemEnd - stemStart) / STROKE;
  const centre = (stemStart + stemEnd) / 2;
  const shift = Math.max(0, 16 * unit - centre);
  const base = 42 * unit;
  const top = base + 2 * unit;
  const fx = n.width + kerning;
  const width = shift + fx + f.actualBoundingBoxRight + left;
  const height = top + cap;
  const cx = shift + centre;
  return {
    needle: geometric(
      width,
      height,
      [],
      [polygon([cx - 16 * unit, base], [cx, 0], [cx + 16 * unit, base], [cx, base - 8 * unit])],
    ),
    letters: {
      width,
      height,
      draw(context, layer) {
        setFont(context, weight, 100);
        if (layer === 1) {
          context.fillText('F', shift + fx + left, top + cap);
          return;
        }
        context.fillText('N', shift + left, top + cap);
        // The stem's neck up into the needle's notch.
        context.fillRect(shift + stemStart, base - 2 * unit, stemEnd - stemStart, 4 * unit + 1);
      },
    },
  };
}

let typeNorthParts: Promise<SplitMark> | undefined;

/** "NF" in Instrument Sans with the north needle set on the N's left stem. */
export function typeNorth(): Promise<SplitMark> {
  return (typeNorthParts ??= buildTypeNorth(560, -4));
}
