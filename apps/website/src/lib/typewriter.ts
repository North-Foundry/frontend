import { onBeforeUnmount, onMounted, readonly, ref, type Ref } from 'vue';

/** Delays in milliseconds between the typewriter's steps. */
export interface TypewriterTiming {
  type?: number;
  erase?: number;
  hold?: number;
  gap?: number;
  blink?: number;
}

/** The text typed so far, and whether the caret is lit right now. */
export interface Typewriter {
  text: Readonly<Ref<string>>;
  caret: Readonly<Ref<boolean>>;
}

/**
 * Cycles through `words` by erasing the current one a letter at a time and typing the next. It
 * starts on the first word in full, so the server-rendered text matches, and stays there with no
 * caret when the visitor prefers reduced motion. The caret holds steady while letters change and
 * blinks while a word rests.
 */
export function useTypewriter(words: readonly string[], timing: TypewriterTiming = {}): Typewriter {
  const { type = 95, erase = 55, hold = 2400, gap = 380, blink = 530 } = timing;
  const text = ref(words[0] ?? '');
  const caret = ref(false);
  let index = 0;
  let erasing = false;
  let resting = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let blinker: ReturnType<typeof setInterval> | undefined;

  /**
   * Advances by one letter, or turns around at either end of a word, and schedules the next step.
   */
  const tick = (): void => {
    const target = words[index] ?? '';
    resting = false;
    caret.value = true;

    if (erasing && text.value.length > 0) {
      text.value = text.value.slice(0, -1);
      timer = setTimeout(tick, erase);
    } else if (erasing) {
      erasing = false;
      index = (index + 1) % words.length;
      timer = setTimeout(tick, gap);
    } else if (text.value.length < target.length) {
      text.value = target.slice(0, text.value.length + 1);
      timer = setTimeout(tick, type);
    } else {
      erasing = true;
      resting = true;
      timer = setTimeout(tick, hold);
    }
  };

  onMounted(() => {
    if (words.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      tick();
      blinker = setInterval(() => {
        if (resting) {
          caret.value = !caret.value;
        }
      }, blink);
    }
  });

  onBeforeUnmount(() => {
    clearTimeout(timer);
    clearInterval(blinker);
  });

  return { text: readonly(text), caret: readonly(caret) };
}
