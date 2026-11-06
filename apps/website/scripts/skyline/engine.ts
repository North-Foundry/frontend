/*
 * A small sphere tracer and the signed distance primitives the skyline scene is built from.
 * Ported from the plate pipeline in the North Foundry website prototype (`packages/imaging`), so
 * the skyline is lit and fogged the same way as its other plates. Build-time only: it runs in Node
 * and is never shipped to browsers.
 */
import type { LuminanceImage } from '../../../../packages/ui/src/lib/dither.ts';

export type Vec3 = readonly [number, number, number];

export interface Camera {
  position: Vec3;
  target: Vec3;
  /**
   * Vertical field of view in degrees.
   */
  fov: number;
}

export interface Scene {
  /**
   * Signed distance to the nearest surface.
   */
  map(x: number, y: number, z: number): number;
  /**
   * Surface reflectance in [0, 1] at a point; defaults to 1.
   */
  albedo?(x: number, y: number, z: number): number;
  /**
   * Self-illumination at a surface point, such as lit windows, added after fog.
   */
  emission?(x: number, y: number, z: number, nx: number, ny: number, nz: number): number;
  /**
   * Direction towards the key light.
   */
  light: Vec3;
  lightIntensity?: number;
  ambient?: number;
  /**
   * Silhouette light that catches edges facing away from the camera.
   */
  rim?: number;
  /**
   * Exponential fog density; distant geometry fades into the transparent background.
   */
  fog?: number;
  maxDistance?: number;
  maxSteps?: number;
  /**
   * Fraction of the distance estimate taken per step; lower it for inexact distance fields.
   */
  stepScale?: number;
}

const EPSILON = 0.002;

/**
 * Scales a vector to unit length.
 */
function normalize(v: Vec3): [number, number, number] {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
}

/**
 * Penumbra towards the light: 0 in full shadow, 1 when nothing lies in the way.
 */
function softShadow(scene: Scene, ox: number, oy: number, oz: number, l: Vec3, max: number): number {
  let result = 1;
  let t = 0.05;
  for (let i = 0; i < 64 && t < max; i++) {
    const h = scene.map(ox + l[0] * t, oy + l[1] * t, oz + l[2] * t);
    if (h < EPSILON) {
      return 0;
    }
    result = Math.min(result, (10 * h) / t);
    t += Math.min(Math.max(h, 0.02), 1.5);
  }
  return result;
}

/**
 * Ambient occlusion from five samples along the normal.
 */
function occlusion(scene: Scene, px: number, py: number, pz: number, nx: number, ny: number, nz: number): number {
  let occluded = 0;
  let weight = 1;
  for (let i = 1; i <= 5; i++) {
    const d = 0.08 * i;
    occluded += (d - scene.map(px + nx * d, py + ny * d, pz + nz * d)) * weight;
    weight *= 0.7;
  }
  return Math.min(1, Math.max(0, 1 - 2.5 * occluded));
}

/**
 * Sphere-traces `scene` from `camera` into a luminance image. Rays that hit nothing stay 0, so the
 * sky becomes transparent once the image is dithered.
 */
export function renderScene(scene: Scene, camera: Camera, width: number, height: number): LuminanceImage {
  const data = new Float32Array(width * height);
  const forward = normalize([
    camera.target[0] - camera.position[0],
    camera.target[1] - camera.position[1],
    camera.target[2] - camera.position[2],
  ]);
  const right = normalize([-forward[2], 0, forward[0]]);
  const up: Vec3 = [
    right[1] * forward[2] - right[2] * forward[1],
    right[2] * forward[0] - right[0] * forward[2],
    right[0] * forward[1] - right[1] * forward[0],
  ];
  const light = normalize(scene.light);
  const focal = 1 / Math.tan(((camera.fov / 2) * Math.PI) / 180);
  const maxDistance = scene.maxDistance ?? 120;
  const maxSteps = scene.maxSteps ?? 160;
  const stepScale = scene.stepScale ?? 1;
  const [cx, cy, cz] = camera.position;

  for (let py = 0; py < height; py++) {
    for (let px = 0; px < width; px++) {
      const u = (2 * (px + 0.5) - width) / height;
      const v = -(2 * (py + 0.5) - height) / height;
      const [dx, dy, dz] = normalize([
        forward[0] * focal + right[0] * u + up[0] * v,
        forward[1] * focal + right[1] * u + up[1] * v,
        forward[2] * focal + right[2] * u + up[2] * v,
      ]);

      let t = 0;
      let hit = false;
      for (let i = 0; i < maxSteps && t < maxDistance; i++) {
        const d = scene.map(cx + dx * t, cy + dy * t, cz + dz * t);
        if (d < EPSILON * Math.max(1, t)) {
          hit = true;
          break;
        }
        t += d * stepScale;
      }
      if (!hit) {
        continue;
      }

      const hx = cx + dx * t;
      const hy = cy + dy * t;
      const hz = cz + dz * t;
      const e = 0.001 * Math.max(1, t * 0.5);
      const [nx, ny, nz] = normalize([
        scene.map(hx + e, hy, hz) - scene.map(hx - e, hy, hz),
        scene.map(hx, hy + e, hz) - scene.map(hx, hy - e, hz),
        scene.map(hx, hy, hz + e) - scene.map(hx, hy, hz - e),
      ]);

      const ao = occlusion(scene, hx, hy, hz, nx, ny, nz);
      const lambert = Math.max(0, nx * light[0] + ny * light[1] + nz * light[2]);
      const shadow = lambert > 0
        ? softShadow(scene, hx + nx * 0.01, hy + ny * 0.01, hz + nz * 0.01, light, maxDistance)
        : 1;
      const facing = Math.max(0, -(nx * dx + ny * dy + nz * dz));
      const albedo = scene.albedo?.(hx, hy, hz) ?? 1;
      let value = albedo * (
        lambert * shadow * (scene.lightIntensity ?? 1)
        + (scene.ambient ?? 0.12) * (0.5 + 0.5 * ny) * ao
        + (scene.rim ?? 0) * (1 - facing) ** 3 * ao
      );
      value *= Math.exp(-(scene.fog ?? 0) * t);
      value += scene.emission?.(hx, hy, hz, nx, ny, nz) ?? 0;
      data[py * width + px] = value;
    }
  }

  return { width, height, data };
}

/**
 * Length of a 3D vector.
 */
export function length3(x: number, y: number, z: number): number {
  return Math.sqrt(x * x + y * y + z * z);
}

/**
 * Axis-aligned box centred at the origin with half-extents (bx, by, bz).
 */
export function box(px: number, py: number, pz: number, bx: number, by: number, bz: number): number {
  const qx = Math.abs(px) - bx;
  const qy = Math.abs(py) - by;
  const qz = Math.abs(pz) - bz;
  return length3(Math.max(qx, 0), Math.max(qy, 0), Math.max(qz, 0)) + Math.min(Math.max(qx, qy, qz), 0);
}

/**
 * Sphere of radius `r` centred at the origin.
 */
export function sphere(px: number, py: number, pz: number, r: number): number {
  return length3(px, py, pz) - r;
}

/**
 * Vertical cylinder centred at the origin: radius `r`, half-height `h`.
 */
export function cylinder(px: number, py: number, pz: number, r: number, h: number): number {
  const dx = Math.hypot(px, pz) - r;
  const dy = Math.abs(py) - h;
  return Math.min(Math.max(dx, dy), 0) + Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
}

/**
 * Deterministic hash of two integers to [0, 1).
 */
export function hash2(x: number, y: number): number {
  let h = Math.imul(x | 0, 0x27d4eb2d) ^ Math.imul(y | 0, 0x165667b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}
