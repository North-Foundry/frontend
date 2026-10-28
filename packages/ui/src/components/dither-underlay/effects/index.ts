import type { DitherUnderlayAnimation } from '../types';
import type { DitherEffect } from './types';
import { none } from './none';
import { drift } from './drift';
import { breathe } from './breathe';
import { expand } from './expand';
import { contract } from './contract';
import { ripple } from './ripple';
import { wave } from './wave';
import { fire } from './fire';
import { fireDown } from './fire-down';
import { evaporate } from './evaporate';
import { rays } from './rays';
import { snowing } from './snowing';
import { fireworks } from './fireworks';
import { interference } from './interference';
import { vortex } from './vortex';
import { soliton } from './soliton';
import { moire } from './moire';
import { phyllotaxis } from './phyllotaxis';
import { branching } from './branching';

/**
 * Adding an animation requires its implementation and one entry here.
 */
export const effects = {
  none,
  drift,
  breathe,
  expand,
  contract,
  ripple,
  wave,
  fire,
  'fire-down': fireDown,
  evaporate,
  rays,
  snowing,
  fireworks,
  interference,
  vortex,
  soliton,
  moire,
  phyllotaxis,
  branching,
} satisfies Record<DitherUnderlayAnimation, DitherEffect>;
