/**
 * The hero's extruded shadow, ported from the MagicPath design (Project 7, "North Foundry —
 * Homepage").
 *
 * Every word marked `data-shadow-word` is drawn on an offscreen canvas as a stack of grey copies
 * stepping away from the letters, brightest next to them. The letters themselves are then cut out
 * in black, and the grey field is quantised to a palette through an 8×8 ordered (Bayer) dither, so
 * the shadow reads as printed dots behind live HTML text.
 *
 * An element marked `data-shadow-caret="on"` has no visible face of its own: it is extruded like a
 * word and its box is filled with a grey ramp, so the caret itself comes out in dots.
 *
 * With a knockout, the canvas also clears a soft halo around the letters by painting it in the
 * ground colour, so artwork placed beneath the canvas stays away from the words. The halo's edge is
 * dithered with the same matrix, so the clear zone dissolves into what lies beneath.
 *
 * `mountDitherClearing` paints the same kind of halo on its own canvas around the elements marked
 * `data-shadow-clear` inside a host, such as the navbar's logo and links, so the halo travels with
 * them instead of being measured from another component.
 */

/** Direction and length, in CSS pixels at a 140px headline, of the extrusion. */
const EXTRUSION = { dx: 0.8, dy: -0.6, length: 30 } as const;
const STEP = 1.5;

/** Tone curve applied before quantising: inputs below `black` drop out, `gamma` thins the fade. */
export interface DitherTone {
  black?: number;
  white?: number;
  gamma?: number;
}

/** A halo cleared around the letters, painted opaque in `colour` (the ground beneath the text). */
export interface DitherKnockout {
  colour: string;
  /** Halo reach in CSS pixels at a 140px headline; it scales down with the type like the extrusion. */
  radius: number;
}

/** The knockout halo is drawn and blurred at a quarter of the canvas size, 2^2 smaller per side. */
const KNOCKOUT_SHIFT = 2;

/** Recursive Bayer matrix of size 2^order, normalised to thresholds in (0, 1). */
function bayer(order: number): Float32Array {
  let size = 1;
  let matrix = [0];

  for (let step = 0; step < order; step++) {
    const next = new Array<number>(size * 2 * size * 2);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const base = (matrix[y * size + x] ?? 0) * 4;
        next[y * size * 2 + x] = base;
        next[y * size * 2 + x + size] = base + 2;
        next[(y + size) * size * 2 + x] = base + 3;
        next[(y + size) * size * 2 + x + size] = base + 1;
      }
    }
    matrix = next;
    size *= 2;
  }

  const cells = size * size;
  return Float32Array.from(matrix, (value) => (value + 0.5) / cells);
}

const THRESHOLDS = bayer(3);

function grey(level: number): string {
  const value = Math.max(0, Math.min(255, Math.round(level)));
  return `rgb(${value},${value},${value})`;
}

function rgb(hex: string): [number, number, number] {
  const value = parseInt(hex.replace('#', ''), 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

interface PlacedWord {
  text: string;
  font: string;
  spacing: string;
  x: number;
  y: number;
}

/** Reads each word's font and baseline from the live layout, relative to the canvas. */
function placeWords(context: CanvasRenderingContext2D, words: HTMLElement[], frame: DOMRect): PlacedWord[] {
  return words.map((word) => {
    const box = word.getBoundingClientRect();
    const style = getComputedStyle(word);
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} "Newsreader"`;
    context.font = font;

    const metrics = context.measureText(word.textContent ?? '');
    const ascent = metrics.fontBoundingBoxAscent ?? parseFloat(style.fontSize) * 0.8;
    const descent = metrics.fontBoundingBoxDescent ?? parseFloat(style.fontSize) * 0.2;
    const lineHeight = parseFloat(style.lineHeight) || box.height;

    return {
      text: word.textContent ?? '',
      font,
      spacing: style.letterSpacing,
      x: box.left - frame.left,
      y: box.top - frame.top + (lineHeight - (ascent + descent)) / 2 + ascent,
    };
  });
}

/** Reads each element's box, such as a lit caret's, from the live layout, relative to the canvas. */
function placeBoxes(carets: HTMLElement[], frame: DOMRect): DOMRect[] {
  return carets.map((caret) => {
    const box = caret.getBoundingClientRect();
    return new DOMRect(box.left - frame.left, box.top - frame.top, box.width, box.height);
  });
}

/**
 * Sets a word's font and letter spacing on the context before it is drawn.
 */
function applyWord(context: CanvasRenderingContext2D, word: PlacedWord): void {
  context.font = word.font;
  if ('letterSpacing' in context) {
    context.letterSpacing = word.spacing === 'normal' ? '0px' : word.spacing;
  }
}

/**
 * Prepares a quarter-size halo context for one reach: white, wide round strokes blurred into a
 * soft falloff that ends about `reach` from the shapes drawn next.
 */
function spreadHalo(context: CanvasRenderingContext2D, reach: number): void {
  const scale = 1 / (1 << KNOCKOUT_SHIFT);
  context.setTransform(scale, 0, 0, scale, 0, 0);
  context.filter = `blur(${reach * 0.35 * scale}px)`;
  context.lineWidth = reach * 1.3;
  context.lineJoin = 'round';
  context.fillStyle = '#fff';
  context.strokeStyle = '#fff';
}

/**
 * Draws the halo of each non-empty box with the current spread.
 */
function haloBoxes(context: CanvasRenderingContext2D, boxes: DOMRect[]): void {
  for (const box of boxes) {
    if (box.width && box.height) {
      context.strokeRect(box.x, box.y, box.width, box.height);
      context.fillRect(box.x, box.y, box.width, box.height);
    }
  }
}

/**
 * Sizes a canvas in CSS pixels, touching each dimension only when it changed, since any assignment
 * clears it.
 */
function fit(target: HTMLCanvasElement, width: number, height: number): void {
  if (target.width !== width) {
    target.width = width;
  }
  if (target.height !== height) {
    target.height = height;
  }
}

/**
 * Paints the knockout halo on a black field, at `1 / 2^KNOCKOUT_SHIFT` of the canvas size: every
 * word and caret is stroked wide in white and blurred, so the halo is white over the letters and
 * fades to black at about `radius` from them.
 */
function paintKnockout(
  context: CanvasRenderingContext2D,
  words: HTMLElement[],
  carets: HTMLElement[],
  frame: DOMRect,
  radius: number,
): void {
  if (!words.length) {
    return;
  }

  const fontSize = parseFloat(getComputedStyle(words[0]!).fontSize) || 150;
  spreadHalo(context, radius * Math.min(1, fontSize / 140));

  for (const word of placeWords(context, words, frame)) {
    applyWord(context, word);
    context.strokeText(word.text, word.x, word.y);
    context.fillText(word.text, word.x, word.y);
  }
  haloBoxes(context, placeBoxes(carets, frame));

  context.filter = 'none';
}

/**
 * Paints the greyscale field: the extruded copies, then the letters cut out in black and the
 * carets' faces filled with a ramp that is brightest at the foot.
 */
function paintField(
  context: CanvasRenderingContext2D,
  words: HTMLElement[],
  carets: HTMLElement[],
  frame: DOMRect,
): void {
  if (!words.length) {
    return;
  }

  const placed = placeWords(context, words, frame);
  const boxes = placeBoxes(carets, frame);
  const fontSize = parseFloat(getComputedStyle(words[0]!).fontSize) || 150;
  const length = EXTRUSION.length * Math.min(1, fontSize / 140);
  const steps = Math.ceil(length / STEP);

  context.globalCompositeOperation = 'lighten';
  for (const word of placed) {
    applyWord(context, word);
    for (let step = steps; step >= 1; step--) {
      const distance = step / (steps + 1);
      context.fillStyle = grey(250 * Math.pow(1 - distance, 1.6));
      context.fillText(word.text, word.x + EXTRUSION.dx * step * STEP, word.y + EXTRUSION.dy * step * STEP);
    }
  }
  for (const box of boxes) {
    for (let step = steps; step >= 1; step--) {
      const distance = step / (steps + 1);
      context.fillStyle = grey(250 * Math.pow(1 - distance, 1.6));
      context.fillRect(box.x + EXTRUSION.dx * step * STEP, box.y + EXTRUSION.dy * step * STEP, box.width, box.height);
    }
  }

  context.globalCompositeOperation = 'source-over';
  context.fillStyle = '#000';
  for (const word of placed) {
    applyWord(context, word);
    context.fillText(word.text, word.x, word.y);
  }

  for (const box of boxes) {
    const ramp = context.createLinearGradient(0, box.top, 0, box.bottom);
    ramp.addColorStop(0, grey(150));
    ramp.addColorStop(1, grey(255));
    context.fillStyle = ramp;
    context.fillRect(box.x, box.y, box.width, box.height);
  }
}

/**
 * Draws the shadow of every `[data-shadow-word]` inside `root` onto `canvas`, quantised to
 * `palette` (darkest first), with any lit `[data-shadow-caret]`. Redraws on resize, once the
 * display fonts arrive and whenever the text or a caret inside `root` changes; returns a cleanup
 * function. A `knockout` also clears a halo around the letters in the ground colour.
 */
export function mountDitherShadow(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  palette: readonly string[],
  tone: DitherTone = {},
  knockout?: DitherKnockout,
): () => void {
  const scratch = document.createElement('canvas');
  const halo = document.createElement('canvas');
  const colours = palette.map(rgb);
  const ground = knockout ? rgb(knockout.colour) : null;
  const { black = 0, white = 1, gamma = 1 } = tone;
  const range = Math.max(1e-6, white - black);
  let disposed = false;

  const render = (): void => {
    if (disposed) {
      return;
    }

    const frame = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(frame.width));
    const height = Math.max(1, Math.round(frame.height));
    const haloWidth = Math.ceil(width / (1 << KNOCKOUT_SHIFT));
    const haloHeight = Math.ceil(height / (1 << KNOCKOUT_SHIFT));
    fit(canvas, width, height);
    fit(scratch, width, height);
    fit(halo, haloWidth, haloHeight);

    const field = scratch.getContext('2d', { willReadFrequently: true });
    const output = canvas.getContext('2d', { willReadFrequently: true });
    if (!field || !output) {
      return;
    }

    field.setTransform(1, 0, 0, 1, 0, 0);
    field.globalCompositeOperation = 'source-over';
    field.fillStyle = '#000';
    field.fillRect(0, 0, width, height);
    const words = Array.from(root.querySelectorAll<HTMLElement>('[data-shadow-word]'));
    const carets = Array.from(root.querySelectorAll<HTMLElement>('[data-shadow-caret="on"]'));

    field.save();
    paintField(field, words, carets, frame);
    field.restore();

    let clearance: Uint8ClampedArray | null = null;
    const haloField = knockout ? halo.getContext('2d', { willReadFrequently: true }) : null;
    if (knockout && haloField) {
      haloField.setTransform(1, 0, 0, 1, 0, 0);
      haloField.fillStyle = '#000';
      haloField.fillRect(0, 0, haloWidth, haloHeight);
      haloField.save();
      paintKnockout(haloField, words, carets, frame, knockout.radius);
      haloField.restore();
      clearance = haloField.getImageData(0, 0, haloWidth, haloHeight).data;
    }

    const source = field.getImageData(0, 0, width, height).data;
    const image = output.createImageData(width, height);
    const pixels = image.data;
    const levels = colours.length;

    for (let y = 0; y < height; y++) {
      const row = (y & 7) * 8;
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) << 2;
        const value = Math.min(1, Math.max(0, (source[offset]! / 255 - black) / range)) ** gamma * levels;
        const floor = Math.floor(value);
        const threshold = THRESHOLDS[row + (x & 7)]!;
        const level = Math.min(levels, floor + (value - floor > threshold ? 1 : 0));
        let colour: [number, number, number];
        if (level > 0) {
          colour = colours[level - 1]!;
        } else if (clearance && ground) {
          // Outside the shadow, the halo clears the ground with the same ordered dither.
          const cell = ((y >> KNOCKOUT_SHIFT) * haloWidth + (x >> KNOCKOUT_SHIFT)) << 2;
          if (clearance[cell]! / 255 <= threshold) {
            continue;
          }
          colour = ground;
        } else {
          continue;
        }

        pixels[offset] = colour[0];
        pixels[offset + 1] = colour[1];
        pixels[offset + 2] = colour[2];
        pixels[offset + 3] = 255;
      }
    }

    output.putImageData(image, 0, 0);
  };

  const resize = new ResizeObserver(render);
  resize.observe(canvas);

  // Text edits, such as a typed word, and caret blinks redraw at most once per frame.
  let frameRequest = 0;
  const edits = new MutationObserver(() => {
    if (!frameRequest) {
      frameRequest = requestAnimationFrame(() => {
        frameRequest = 0;
        render();
      });
    }
  });
  edits.observe(root, {
    characterData: true,
    childList: true,
    subtree: true,
    attributeFilter: ['data-shadow-caret'],
  });

  // Canvas text only uses a web font once it has loaded; redraw when it does.
  const fonts = document.fonts;
  Promise.all([fonts.load('480 120px "Newsreader"'), fonts.load('italic 400 120px "Newsreader"')])
    .catch(() => undefined)
    .then(() => fonts.ready)
    .then(render);
  fonts.addEventListener('loadingdone', render);

  render();

  return () => {
    disposed = true;
    resize.disconnect();
    edits.disconnect();
    cancelAnimationFrame(frameRequest);
    fonts.removeEventListener('loadingdone', render);
  };
}

/**
 * Clears a dithered halo in `colour`, reaching about `reach` CSS pixels, around every
 * `[data-shadow-clear]` element inside `root`, painted on `canvas` (which should cover `root`).
 * Redraws whenever the canvas changes size, so the halo follows a host that animates its height;
 * returns a cleanup function.
 */
export function mountDitherClearing(
  root: HTMLElement,
  canvas: HTMLCanvasElement,
  colour: string,
  reach: number,
): () => void {
  const halo = document.createElement('canvas');
  const ground = rgb(colour);
  let disposed = false;

  const render = (): void => {
    if (disposed) {
      return;
    }

    const frame = canvas.getBoundingClientRect();
    const width = Math.max(1, Math.round(frame.width));
    const height = Math.max(1, Math.round(frame.height));
    const haloWidth = Math.ceil(width / (1 << KNOCKOUT_SHIFT));
    const haloHeight = Math.ceil(height / (1 << KNOCKOUT_SHIFT));
    fit(canvas, width, height);
    fit(halo, haloWidth, haloHeight);

    const field = halo.getContext('2d', { willReadFrequently: true });
    const output = canvas.getContext('2d');
    if (!field || !output) {
      return;
    }

    field.setTransform(1, 0, 0, 1, 0, 0);
    field.filter = 'none';
    field.fillStyle = '#000';
    field.fillRect(0, 0, haloWidth, haloHeight);
    spreadHalo(field, reach);
    haloBoxes(field, placeBoxes(Array.from(root.querySelectorAll<HTMLElement>('[data-shadow-clear]')), frame));
    field.filter = 'none';

    const clearance = field.getImageData(0, 0, haloWidth, haloHeight).data;
    const image = output.createImageData(width, height);
    const pixels = image.data;

    for (let y = 0; y < height; y++) {
      const row = (y & 7) * 8;
      const line = (y >> KNOCKOUT_SHIFT) * haloWidth;
      for (let x = 0; x < width; x++) {
        if (clearance[(line + (x >> KNOCKOUT_SHIFT)) << 2]! / 255 <= THRESHOLDS[row + (x & 7)]!) {
          continue;
        }

        const offset = (y * width + x) << 2;
        pixels[offset] = ground[0];
        pixels[offset + 1] = ground[1];
        pixels[offset + 2] = ground[2];
        pixels[offset + 3] = 255;
      }
    }

    output.putImageData(image, 0, 0);
  };

  const resize = new ResizeObserver(render);
  resize.observe(canvas);
  render();

  return () => {
    disposed = true;
    resize.disconnect();
  };
}
