<template>
  <main class="type-guide">
    <header class="type-guide__intro">
      <p class="type-guide__eyebrow">North Foundry / Design system</p>
      <h1>Type with purpose.</h1>
      <p class="type-guide__description">
        Four typefaces give the interface, code, annotations and website display their own voices.
        Use each where its role calls for it.
      </p>
    </header>

    <section class="type-guide__section" aria-labelledby="instrument-heading">
      <div class="type-guide__details">
        <p class="type-guide__eyebrow">01 / Interface</p>
        <h2 id="instrument-heading">Instrument Sans</h2>
        <p>The default voice for body text, headings, buttons and interface labels. North Arrow's typographic marks use it too.</p>
        <code>--font-family-sans · font-sans</code>
      </div>
      <div class="type-guide__sample type-guide__sample--sans">
        <p class="type-guide__large">Built to be useful.</p>
        <p class="type-guide__alphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 &amp;?!</p>
      </div>
    </section>

    <section class="type-guide__section" aria-labelledby="plex-heading">
      <div class="type-guide__details">
        <p class="type-guide__eyebrow">02 / Code &amp; data</p>
        <h2 id="plex-heading">IBM Plex Mono</h2>
        <p>For code, technical details, metadata and compact labels where fixed-width characters help scanning.</p>
        <code>--font-family-mono · font-mono</code>
      </div>
      <div class="type-guide__sample type-guide__sample--mono">
        <p class="type-guide__large">const direction = north;</p>
        <p class="type-guide__alphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 {}[] =&gt;</p>
      </div>
    </section>

    <section class="type-guide__section" aria-labelledby="newsreader-heading">
      <div class="type-guide__details">
        <p class="type-guide__eyebrow">03 / Website display</p>
        <h2 id="newsreader-heading">Newsreader</h2>
        <p>The website's editorial serif for expressive display text, including italic accents. It is specific to the website rather than a shared UI font token.</p>
        <code>.serif <span>in the website</span></code>
      </div>
      <div class="type-guide__sample type-guide__sample--serif">
        <p class="type-guide__large">A little more <em>character.</em></p>
        <p class="type-guide__alphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 &amp;?!</p>
      </div>
    </section>

    <section class="type-guide__section" aria-labelledby="architects-heading">
      <div class="type-guide__details">
        <p class="type-guide__eyebrow">04 / Annotations</p>
        <h2 id="architects-heading">Architects Daughter</h2>
        <p>A handwritten option for occasional annotations and personal notes. The shared token provides fallbacks; applications must load the font to use it.</p>
        <code>--font-family-hand · font-hand</code>
      </div>
      <div class="type-guide__sample type-guide__sample--hand">
        <p class="type-guide__large">A note in the margin.</p>
        <p class="type-guide__alphabet">ABCDEFGHIJKLMNOPQRSTUVWXYZ<br />abcdefghijklmnopqrstuvwxyz<br />0123456789 &amp;?!</p>
      </div>
    </section>
    <footer class="type-guide__footer">Font specimens / Loaded in Storybook for this preview</footer>
  </main>
</template>

<style scoped>
.type-guide {
  min-height: 100vh;
  padding: clamp(2rem, 5vw, 5rem) var(--nf-gutter);
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-family-sans);
}

.type-guide__intro,
.type-guide__section,
.type-guide__footer {
  max-width: var(--nf-page-max);
  margin-inline: auto;
}

.type-guide__intro {
  padding-bottom: clamp(3rem, 6vw, 5rem);
}

.type-guide__intro h1 {
  max-width: 12ch;
  margin: 1.5rem 0;
  font-size: var(--nf-text-display);
  font-weight: var(--nf-weight-medium);
  line-height: var(--nf-leading-tight);
  letter-spacing: var(--nf-tracking-tight);
}

.type-guide__description {
  max-width: 52ch;
  color: var(--muted-foreground);
  font-size: var(--nf-text-lede);
}

.type-guide__eyebrow,
.type-guide__details code,
.type-guide__footer {
  font-family: var(--font-family-mono);
  font-size: var(--nf-text-caption);
}

.type-guide__eyebrow {
  color: var(--signal);
  letter-spacing: var(--nf-tracking-label);
  text-transform: uppercase;
}

.type-guide__section {
  display: grid;
  grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.5fr);
  gap: clamp(2rem, 5vw, 6rem);
  padding-block: clamp(2.5rem, 5vw, 4rem);
  border-top: 1px solid var(--rule);
}

.type-guide__details h2 {
  margin: 1rem 0;
  font-size: var(--nf-text-title);
}

.type-guide__details > p:not(.type-guide__eyebrow) {
  max-width: 38ch;
  color: var(--muted-foreground);
}

.type-guide__details code {
  display: block;
  margin-top: 1.5rem;
  color: var(--signal);
  overflow-wrap: anywhere;
}

.type-guide__details code span {
  color: var(--muted-foreground);
}

.type-guide__sample {
  min-width: 0;
  overflow-wrap: anywhere;
}

.type-guide__sample--sans { font-family: var(--font-family-sans); }
.type-guide__sample--mono { font-family: var(--font-family-mono); }
.type-guide__sample--serif { font-family: Newsreader, Georgia, serif; }
.type-guide__sample--hand { font-family: var(--font-family-hand); }

.type-guide__large {
  margin: 0 0 2rem;
  font-size: clamp(2rem, 4vw, 4rem);
  line-height: 1.1;
  letter-spacing: -0.025em;
}

.type-guide__sample--mono .type-guide__large {
  font-size: clamp(1.4rem, 2.6vw, 2.5rem);
  letter-spacing: 0;
}

.type-guide__alphabet {
  color: var(--muted-foreground);
  font-size: clamp(1rem, 1.5vw, 1.25rem);
  line-height: 1.8;
}

.type-guide__footer {
  padding-top: 2rem;
  border-top: 1px solid var(--rule);
  color: var(--muted-foreground);
}

@media (max-width: 700px) {
  .type-guide__section { grid-template-columns: 1fr; }
}
</style>
