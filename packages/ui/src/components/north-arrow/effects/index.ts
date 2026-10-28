/**
 * Effects shade a rasterised mark frame by frame. Each one draws into the surface at time `t`
 * (seconds since it started) and must render a complete, legible mark at its `rest` time, which
 * is what reduced-motion visitors and still captures get.
 */

export type { Effect, EffectDefinition } from './types';

export { cast } from './cast';
export { dust } from './dust';
export { signal } from './signal';
export { scan } from './scan';
export { magnet } from './magnet';
export { signature } from './signature';
export { beacon } from './beacon';
export { ascent } from './ascent';
