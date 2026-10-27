/**
 * The north arrow mark: the Vue component and the framework-free canvas mount behind it.
 *
 * @packageDocumentation
 */

export { default as NorthArrow } from './NorthArrow.vue';
export {
  NORTH_ARROW_DEFAULTS,
  gridSide,
  mountNorthArrow,
  type NorthArrowHandle,
  type NorthArrowOptions,
} from './mount';
export type { Ground } from './engine';
