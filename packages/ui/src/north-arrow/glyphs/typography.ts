import { type Glyph, type Layer } from '../engine';
import { ligature } from './geometric';
import { geometric, polygon, STROKE } from './primitives';

const FAMILY = '"Instrument Sans"';

function setFont(context: CanvasRenderingContext2D, weight: number, size: number): void {
  context.font = `${weight} ${size}px ${FAMILY}`;
  context.fontStretch = 'semi-condensed';
  context.textBaseline = 'alphabetic';
}

async function loadFont(weight: number): Promise<CanvasRenderingContext2D> {
  await document.fonts.load(`${weight} 100px ${FAMILY}`, 'NorthFoundry');
  const context = document.createElement('canvas').getContext('2d');
  if (!context) {
    throw new Error('Canvas 2D is not available');
  }
  setFont(context, weight, 100);
  return context;
}

/**
 * "NF" set in Instrument Sans, N in ink and F in blue, trimmed to the cap height.
 */
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

/**
 * The ligature with "North" in ink and "Foundry" in blue beside it, cap-aligned to the mark.
 */
export async function lockup(): Promise<Glyph> {
  const weight = 500;
  const measure = await loadFont(weight);
  const cap = measure.measureText('N').actualBoundingBoxAscent;
  /**
   * Text cap height is 46% of the mark, centred on it.
   */
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
  /**
   * The part that is dithered.
   */
  needle: Glyph;
  /**
   * The part drawn crisp, in the same box.
   */
  letters: Glyph;
}

/**
 * Column range of the N's left stem, measured on the rendered letter at 60% of its height.
 */
function measureLeftStem(weight: number, cap: number, left: number): [number, number] {
  const margin = 10;
  const canvas = document.createElement('canvas');
  canvas.width = 200;
  canvas.height = Math.ceil(cap) + margin * 2;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) {
    throw new Error('Canvas 2D is not available');
  }
  setFont(context, weight, 100);
  context.fillText('N', margin + left, margin + cap);
  const row = Math.round(margin + cap * 0.6);
  const alpha = context.getImageData(0, row, canvas.width, 1).data;
  let start = -1;
  for (let x = 0; x < canvas.width; x++) {
    const filled = (alpha[x * 4 + 3] ?? 0) > 127;
    if (filled && start < 0) {
      start = x;
    }
    if (!filled && start >= 0) {
      return [start - margin, x - margin];
    }
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
  /**
   * The needle keeps the proportions of `northLigature`'s, scaled to this stem.
   */
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
        /**
         * The stem's neck up into the needle's notch.
         */
        context.fillRect(shift + stemStart, base - 2 * unit, stemEnd - stemStart, 4 * unit + 1);
      },
    },
  };
}

let typeNorthParts: Promise<SplitMark> | undefined;

/**
 * "NF" in Instrument Sans with the north needle set on the N's left stem.
 */
export function typeNorth(): Promise<SplitMark> {
  return (typeNorthParts ??= buildTypeNorth(560, -4));
}
