import { bayerMatrix } from '../../../lib/dither';

export const bayer = bayerMatrix(3);
export const cosine = Math.cos(0.62);
export const sine = Math.sin(0.62);
export const tau = Math.PI * 2;
