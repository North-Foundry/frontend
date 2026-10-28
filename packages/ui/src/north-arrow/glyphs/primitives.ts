import type { Glyph } from '../engine';

export const STROKE = 15;

export type Draw = (context: CanvasRenderingContext2D) => void;

export function rect(x: number, y: number, width: number, height: number): Draw {
  return (context) => context.fillRect(x, y, width, height);
}

export function polygon(...points: [number, number][]): Draw {
  return (context) => {
    context.beginPath();
    for (const [x, y] of points) context.lineTo(x, y);
    context.closePath();
    context.fill();
  };
}

/**
 * Draws `shape` only where x <= `limit`, so a diagonal can stop flush against a stem.
 */
export function clipRight(limit: number, shape: Draw): Draw {
  return (context) => {
    context.save();
    context.beginPath();
    context.rect(-1000, -1000, 1000 + limit, 3000);
    context.clip();
    shape(context);
    context.restore();
  };
}

export function geometric(width: number, height: number, ink: Draw[], blue: Draw[]): Glyph {
  return {
    width,
    height,
    draw(context, layer) {
      for (const shape of layer === 0 ? ink : blue) shape(context);
    },
  };
}
