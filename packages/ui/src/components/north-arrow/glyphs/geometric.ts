import { clipRight, geometric, polygon, rect, STROKE } from './primitives';

/**
 * The N's right stem is the F's stem: one shared upright, N in ink and F in blue.
 */
export const ligature = geometric(
  100,
  100,
  [rect(0, 0, STROKE, 100), clipRight(49, polygon([0, 0], [17, 0], [64, 100], [47, 100]))],
  [rect(49, 0, STROKE, 100), rect(64, 0, 36, STROKE), rect(64, 43, 26, STROKE - 1)],
);

/**
 * Shift right so the needle's left barb starts at x = 0; the cap line is at y = 44.
 */
const nx = (value: number) => value + 8.5;
const NORTH_CAP = 44;
const northNeedlePart = polygon([nx(-8.5), 42], [nx(7.5), 0], [nx(23.5), 42], [nx(7.5), 34]);
const northInk = [
  rect(nx(0), 40, STROKE, NORTH_CAP + 100 - 40),
  clipRight(
    nx(49),
    polygon(
      [nx(0), NORTH_CAP],
      [nx(17), NORTH_CAP],
      [nx(64), NORTH_CAP + 100],
      [nx(47), NORTH_CAP + 100],
    ),
  ),
];
const northBlue = [
  rect(nx(49), NORTH_CAP, STROKE, 100),
  rect(nx(64), NORTH_CAP, 36, STROKE),
  rect(nx(64), NORTH_CAP + 43, 26, STROKE - 1),
];

/**
 * The ligature with the needle of `needle` on the N's top-left corner: the left stem rises
 * above the cap height and ends in a blue point aimed north. The needle sits wholly above the
 * cap line, so the diagonal still starts cleanly from the corner.
 */
export const northLigature = geometric(108.5, NORTH_CAP + 100, northInk, [
  northNeedlePart,
  ...northBlue,
]);

/**
 * The north needle alone, in its own box: the logo without letters.
 */
export const northArrow = geometric(32, 42, [], [polygon([0, 42], [16, 0], [32, 42], [16, 34])]);

/**
 * Only the needle of `northLigature`, in the same box, to be dithered on its own.
 */
export const northNeedle = geometric(108.5, NORTH_CAP + 100, [], [northNeedlePart]);

/**
 * `northLigature` without its needle, in the same box, to be drawn crisp.
 */
export const northLetters = geometric(108.5, NORTH_CAP + 100, northInk, northBlue);

/**
 * The ligature cut as a stencil, as on a casting pattern: the cuts fall exactly where the ink
 * meets the blue, so the bridges are the two colours' borders.
 */
export const stencil = geometric(
  106,
  100,
  [rect(0, 0, STROKE, 100), clipRight(46, polygon([0, 0], [17, 0], [64, 100], [47, 100]))],
  [rect(52, 0, STROKE, 100), rect(71, 0, 35, STROKE), rect(71, 43, 26, STROKE - 1)],
);

/**
 * The N's right stem rises past the cap height into a needle pointing north.
 */
export const needle = geometric(
  120,
  124,
  [
    rect(0, 24, STROKE, 100),
    clipRight(48, polygon([0, 24], [17, 24], [62, 124], [45, 124])),
    rect(48, 40, STROKE - 1, 84),
  ],
  [
    polygon([39, 42], [55, 0], [71, 42], [55, 34]),
    rect(78, 24, STROKE - 1, 100),
    rect(92, 24, 28, STROKE - 1),
    rect(92, 66, 22, STROKE - 2),
  ],
);

/**
 * A hallmark punch: N and F inside a chamfered frame, as struck into cast metal.
 */
export const hallmark = geometric(
  100,
  100,
  [
    rect(20, 26, 9, 48),
    clipRight(47, polygon([20, 26], [30, 26], [47, 74], [37, 74])),
    rect(38, 26, 9, 48),
  ],
  [
    (context) => {
      const outer: [number, number][] = [
        [14, 0],
        [86, 0],
        [100, 14],
        [100, 86],
        [86, 100],
        [14, 100],
        [0, 86],
        [0, 14],
      ];
      const inner: [number, number][] = [
        [16, 6],
        [84, 6],
        [94, 16],
        [94, 84],
        [84, 94],
        [16, 94],
        [6, 84],
        [6, 16],
      ];
      context.beginPath();
      for (const ring of [outer, inner]) {
        ring.forEach(([x, y], index) => (index ? context.lineTo(x, y) : context.moveTo(x, y)));
        context.closePath();
      }
      context.fill('evenodd');
    },
    rect(55, 26, 9, 48),
    rect(64, 26, 19, 9),
    rect(64, 46, 15, 8),
  ],
);
