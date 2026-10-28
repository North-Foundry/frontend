/**
 * Public surface of the shared UI package.
 *
 * @packageDocumentation
 */

export { default as NorthArrow } from './components/north-arrow/NorthArrow.vue';
export {
  NORTH_ARROW_DEFAULTS,
  gridSide,
  mountNorthArrow,
  type NorthArrowHandle,
  type NorthArrowOptions,
} from './components/north-arrow/mount';
export type { Ground } from './components/north-arrow/engine';
export * from './components/dither-underlay';
