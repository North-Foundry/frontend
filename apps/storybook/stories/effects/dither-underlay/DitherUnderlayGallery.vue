<script setup lang="ts">
import { ref } from 'vue';
import { DitherUnderlay } from '@north-foundry/ui';

const paused = ref(false);
const corners = [
  { name: 'Top left', value: 'top-left' },
  { name: 'Top right', value: 'top-right' },
  { name: 'Bottom left', value: 'bottom-left' },
  { name: 'Bottom right', value: 'bottom-right' },
] as const;
const edges = [
  { name: 'Bottom edge', value: 'bottom' },
  { name: 'Right edge', value: 'right' },
  { name: 'Top edge', value: 'top' },
  { name: 'Left edge', value: 'left' },
] as const;
const motions = [
  { name: 'Drift', value: 'drift', note: 'A slow lateral current.' },
  { name: 'Breathe', value: 'breathe', note: 'The field gently grows and recedes.' },
  { name: 'Expand', value: 'expand', note: 'The field opens outward.' },
  { name: 'Contract', value: 'contract', note: 'The field draws inward.' },
  { name: 'Ripple', value: 'ripple', note: 'Concentric waves pass through.' },
] as const;
const edgeMotions = [
  { name: 'Sine wave', animation: 'wave', waveShape: 'sine', note: 'A smooth current along the edge.' },
  { name: 'Triangle wave', animation: 'wave', waveShape: 'triangle', note: 'A steady rise and return.' },
  { name: 'Sawtooth wave', animation: 'wave', waveShape: 'sawtooth', note: 'A gradual build with a sharp reset.' },
  { name: 'Square wave', animation: 'wave', waveShape: 'square', note: 'A crisp alternation between levels.' },
  { name: 'Fire rising', animation: 'fire', waveShape: 'sine', note: 'A rising, flickering edge.' },
  { name: 'Fire falling', animation: 'fire-down', waveShape: 'sine', note: 'A descending, flickering edge.' },
  { name: 'Evaporation', animation: 'evaporate', waveShape: 'sine', note: 'The field lifts and dissipates.' },
  { name: 'Ray shooting', animation: 'rays', waveShape: 'sine', note: 'Short beams shoot outward, trailing blue grains.' },
] as const;
const edgeMotionPaused = ref(false);
const mathematicalMotions = [
  { name: 'Reaction diffusion', animation: 'reaction-diffusion', note: 'Chemical concentrations evolve into organic patterns.' },
  { name: 'Voronoi', animation: 'voronoi', note: 'Sharp cell edges form a dense, fractured network.' },
  { name: 'Chladni', animation: 'chladni', note: 'Nodal lines blend between two resonance modes.' },
  { name: 'Interference', animation: 'interference', note: 'Crossing wave fields form shifting bands.' },
  { name: 'Vortex ribbons', animation: 'vortex', note: 'Curved ribbons circle through the field.' },
  { name: 'Solitary pulses', animation: 'soliton', note: 'Rounded pulses rise and dissolve away from the edge.' },
  { name: 'Moiré drift', animation: 'moire', note: 'Offset patterns create slow-moving interference fringes.' },
  { name: 'Phyllotaxis', animation: 'phyllotaxis', note: 'A spiral arrangement follows a botanical growth pattern.' },
  { name: 'Branching streams', animation: 'branching', note: 'Flow divides into branching, river-like paths.' },
  { name: 'Kuramoto', animation: 'kuramoto', note: 'Oscillators gradually synchronize into a shared rhythm.' },
] as const;
const mathematicalMotionPaused = ref(false);
</script>

<template>
  <main class="dc-gallery">
    <header class="dc-masthead">
      <a class="dc-wordmark" href="#top" aria-label="North Foundry, back to top">NF<span>—</span></a>
      <span class="dc-masthead__label">Component studies</span>
      <span class="dc-masthead__index">Bayer / 8×8</span>
    </header>

    <section id="top" class="dc-intro">
      <div class="dc-intro__heading">
        <p class="dc-kicker"><span class="dc-kicker__line"></span> Dither underlay / Underlay primitive</p>
        <h1>Dither underlay</h1>
      </div>
      <div class="dc-intro__aside">
        <p>A field of blue grain gives a quiet edge to the interface. Place it, tune its scale, or let it move.</p>
        <p class="dc-code">Absolute underlay <span>·</span> 900 × 560 ratio</p>
      </div>
      <div class="dc-hero-frame" aria-label="Dither underlay on a dark hero surface">
        <DitherUnderlay position="bottom-right" :size="600" :pixel-size="2" />
        <div class="dc-hero-frame__content">
          <span class="dc-kicker">North Foundry / Digital craft</span>
          <h2>Shape the<br /><span>signal.</span></h2>
          <p>Texture with intention.<br />Space for everything else.</p>
          <a href="#playbook">Explore the system <span aria-hidden="true">↗</span></a>
        </div>
        <div class="dc-hero-frame__caption"><span>01</span><span>Quiet signal / 2026</span></div>
      </div>
    </section>

    <section class="dc-section" aria-labelledby="corners-title">
      <div class="dc-section__head">
        <div><p class="dc-kicker">01 / Placement</p><h2 id="corners-title">Four points of view</h2></div>
        <p>Anchor the field to any corner.<br />The host provides the frame.</p>
      </div>
      <div class="dc-corners">
        <article v-for="corner in corners" :key="corner.value" class="dc-corner-card">
          <span class="dc-swatch-label">Surface / graphite</span>
          <div class="dc-swatch">
            <DitherUnderlay :position="corner.value" :size="380" :pixel-size="2" />
            <span class="dc-swatch__cross" aria-hidden="true">+</span>
          </div>
          <div class="dc-card-caption"><span>{{ corner.name }}</span><code>{{ corner.value }}</code></div>
        </article>
      </div>
    </section>

    <section class="dc-section" aria-labelledby="edges-title">
      <div class="dc-section__head">
        <div><p class="dc-kicker">02 / Edge placement</p><h2 id="edges-title">A field along the edge</h2></div>
        <p>Each field spans its host edge.<br />Depth sets its reach.</p>
      </div>
      <div class="dc-corners dc-edges">
        <article v-for="edge in edges" :key="edge.value" class="dc-corner-card">
          <span class="dc-swatch-label">Surface / graphite</span>
          <div class="dc-swatch">
            <DitherUnderlay :position="edge.value" :depth="140" :pixel-size="2" />
            <span class="dc-swatch__cross" aria-hidden="true">+</span>
          </div>
          <div class="dc-card-caption"><span>{{ edge.name }}</span><code>{{ edge.value }}</code></div>
        </article>
      </div>
    </section>

    <section class="dc-section dc-motion-section" aria-labelledby="motion-title">
      <div class="dc-section__head">
        <div><p class="dc-kicker">03 / Motion</p><h2 id="motion-title">A measured pulse</h2></div>
        <button class="dc-pause" type="button" :aria-pressed="paused" @click="paused = !paused">
          <span class="dc-pause__icon" aria-hidden="true">{{ paused ? '▶' : 'Ⅱ' }}</span>
          {{ paused ? 'Resume motion' : 'Pause motion' }}
        </button>
      </div>
      <p class="dc-section__intro">Five restrained behaviors, each designed to stay in the periphery. Pause the set to inspect the current frames.</p>
      <div class="dc-motions">
        <article v-for="motion in motions" :key="motion.value" class="dc-motion-card">
          <div class="dc-motion-card__field">
            <DitherUnderlay :animation="motion.value" :size="380" :pixel-size="2" :paused="paused" />
            <span class="dc-motion-card__index">0{{ motions.indexOf(motion) + 1 }}</span>
          </div>
          <div class="dc-card-caption"><span>{{ motion.name }}</span><code>{{ motion.value }}</code></div>
          <p class="dc-motion-card__note">{{ motion.note }}</p>
        </article>
      </div>
    </section>

    <section class="dc-section dc-edge-motion-section" aria-labelledby="edge-motion-title">
      <div class="dc-section__head">
        <div><p class="dc-kicker">04 / Edge motion</p><h2 id="edge-motion-title">Edge motion lab</h2></div>
        <button class="dc-pause" type="button" :aria-pressed="edgeMotionPaused" @click="edgeMotionPaused = !edgeMotionPaused">
          <span class="dc-pause__icon" aria-hidden="true">{{ edgeMotionPaused ? '▶' : 'Ⅱ' }}</span>
          {{ edgeMotionPaused ? 'Resume motion' : 'Pause motion' }}
        </button>
      </div>
      <p class="dc-section__intro">Waveforms, fire, evaporation, and shooting rays, all held to the edge.</p>
      <div class="dc-edge-motion-grid">
        <article v-for="motion in edgeMotions" :key="motion.name" class="dc-edge-motion-card">
          <span class="dc-swatch-label">Surface / graphite</span>
          <div class="dc-edge-motion-card__field">
            <DitherUnderlay
              position="bottom"
              :depth="motion.animation === 'rays' ? 200 : 140"
              :animation="motion.animation"
              :wave-shape="motion.waveShape"
              :wave-count="3"
              :amplitude="0.22"
              :duration="motion.animation === 'wave' ? 10 : motion.animation === 'rays' ? 4 : 6"
              :pixel-size="2"
              :paused="edgeMotionPaused"
            />
          </div>
          <div class="dc-card-caption"><span>{{ motion.name }}</span><code>{{ motion.animation === 'wave' ? motion.waveShape : motion.animation }}</code></div>
          <p class="dc-motion-card__note">{{ motion.note }}</p>
        </article>
      </div>
    </section>

    <section class="dc-section dc-edge-motion-section" aria-labelledby="mathematical-motion-title">
      <div class="dc-section__head">
        <div><p class="dc-kicker">05 / Mathematical motion</p><h2 id="mathematical-motion-title">Mathematical motion lab</h2></div>
        <button class="dc-pause" type="button" :aria-pressed="mathematicalMotionPaused" @click="mathematicalMotionPaused = !mathematicalMotionPaused">
          <span class="dc-pause__icon" aria-hidden="true">{{ mathematicalMotionPaused ? '▶' : 'Ⅱ' }}</span>
          {{ mathematicalMotionPaused ? 'Resume motion' : 'Pause motion' }}
        </button>
      </div>
      <p class="dc-section__intro">Ten patterned flows explore interference, rotation, pulses, synchronization, and natural growth forms.</p>
      <div class="dc-edge-motion-grid">
        <article v-for="motion in mathematicalMotions" :key="motion.animation" class="dc-edge-motion-card">
          <span class="dc-swatch-label">Surface / graphite</span>
          <div class="dc-edge-motion-card__field">
            <DitherUnderlay
              position="bottom"
              :depth="220"
              :animation="motion.animation"
              :wave-count="3"
              :amplitude="0.22"
              :duration="motion.animation === 'phyllotaxis' || motion.animation === 'branching' ? 10 : 12"
              :pixel-size="2"
              :intensity="0.9"
              :paused="mathematicalMotionPaused"
            />
          </div>
          <div class="dc-card-caption"><span>{{ motion.name }}</span><code>{{ motion.animation }}</code></div>
          <p class="dc-motion-card__note">{{ motion.note }}</p>
        </article>
      </div>
    </section>

    <section id="playbook" class="dc-section dc-usage" aria-labelledby="usage-title">
      <div class="dc-section__head">
        <div><p class="dc-kicker">06 / In context</p><h2 id="usage-title">A layer, not a layout</h2></div>
        <p>Give the parent a position and a shape.<br />Let the content flow normally.</p>
      </div>
      <div class="dc-usage-grid">
        <article class="dc-usage-card dc-panel-example">
          <div class="dc-usage-card__top"><span>Compact panel</span><span>02 / 04</span></div>
          <div class="dc-panel-example__surface">
            <DitherUnderlay position="top-right" :size="500" :pixel-size="2" :intensity="0.72" />
            <div class="dc-panel-example__copy">
              <p class="dc-kicker">Field note / 18:42 UTC</p>
              <h3>Signal<br />received.</h3>
              <p>Four channels are clear.<br />The edge stays in view.</p>
            </div>
            <span class="dc-panel-example__status"><i></i> All systems steady</span>
          </div>
          <p class="dc-usage-card__foot">A small field reads best with <code>size=500</code> and a little breathing room.</p>
        </article>

        <article class="dc-usage-card dc-light-example">
          <div class="dc-usage-card__top"><span>Light surface</span><span>Paper / 01</span></div>
          <div class="dc-light-example__surface">
            <DitherUnderlay position="bottom-left" :size="600" :pixel-size="2" color="var(--nf-blue-800)" :intensity="0.72" />
            <div class="dc-light-example__copy">
              <p class="dc-kicker">Materials / 004</p>
              <h3>Blue on<br /><em>paper.</em></h3>
              <p>Keep the field tonal.<br />Let the surface carry the contrast.</p>
            </div>
            <span class="dc-light-example__mark">NF&nbsp; / &nbsp;STUDIO</span>
          </div>
          <p class="dc-usage-card__foot">On light surfaces, choose a deeper blue and reduce intensity.</p>
        </article>
      </div>
    </section>

    <footer class="dc-footer">
      <span>North Foundry <i>—</i> UI studies</span>
      <span>Texture belongs to the edge.</span>
      <a href="#top">Back to top ↑</a>
    </footer>
  </main>
</template>

<style>
@import './dither-underlay-gallery.css';
</style>
