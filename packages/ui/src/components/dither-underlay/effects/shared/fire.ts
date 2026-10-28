import { noise } from '../../../../lib/math';
import { renderField } from '../../engine/field';
import { drawFlowingGrains } from './flowing-grains';
import type { EffectContext } from '../types';

/**
 * Combines a looped noise field with flowing grains for fire and evaporation variants.
 */
export function renderFire(context: EffectContext, direction: 1 | -1 = 1, evaporating = false): void {
  const flow = direction === -1 ? (1 - context.phase) % 1 : context.phase;
  const blend = flow * flow * (3 - 2 * flow);
  renderField(context, (along, distance) => {
    const n = noise(along * 9, distance * 5 - flow * 5, 3) * (1 - blend)
      + noise(along * 9, distance * 5 - flow * 5 + 5, 3) * blend;
    const height = evaporating ? 0.32 : 0.3 + n * 0.65;
    let tone = Math.max(0, 1 - distance / height) ** 1.3;
    tone *= evaporating ? 0.35 : 0.5 + n;
    return tone;
  });
  drawFlowingGrains(context, direction);
}
