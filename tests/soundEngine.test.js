import { describe, it, expect, beforeEach } from 'vitest';
import { createSoundEngine, SOUND_LIMITS } from '../js/sound/soundEngine.js';
import { sceneToMusic } from '../js/sound/music.js';

/** Just enough of the Web Audio API to record what the engine schedules. */
class FakeParam {
  constructor(value = 0) {
    this.value = value;
    this.events = [];
  }
  setValueAtTime(v, t) {
    this.events.push(['set', v, t]);
  }
  linearRampToValueAtTime(v, t) {
    this.events.push(['linear', v, t]);
  }
  exponentialRampToValueAtTime(v, t) {
    this.events.push(['exp', v, t]);
  }
  cancelScheduledValues() {}
}

class FakeNode {
  constructor(ctx, kind) {
    this.kind = kind;
    for (const p of [
      'gain',
      'frequency',
      'detune',
      'Q',
      'pan',
      'delayTime',
      'threshold',
      'knee',
      'ratio',
      'attack',
      'release',
    ]) {
      this[p] = new FakeParam();
    }
    this.ctx = ctx;
  }
  connect(target) {
    return target;
  }
  start(t) {
    if (this.kind === 'oscillator') this.ctx.started.push({ node: this, t });
  }
  stop() {}
}

class FakeAudioContext {
  constructor() {
    this.currentTime = 0;
    this.sampleRate = 8000;
    this.destination = new FakeNode(this, 'destination');
    this.started = [];
    this.gains = [];
    for (const kind of [
      'Gain',
      'Oscillator',
      'BiquadFilter',
      'Convolver',
      'Delay',
      'DynamicsCompressor',
      'StereoPanner',
    ]) {
      this[`create${kind}`] = () => {
        const node = new FakeNode(this, kind.toLowerCase());
        if (kind === 'Gain') this.gains.push(node);
        return node;
      };
    }
  }
  createBuffer(channels, length) {
    const data = Array.from(
      { length: channels },
      () => new Float32Array(length)
    );
    return { getChannelData: (ch) => data[ch] };
  }
}

const music = (chaosLevel = 5) =>
  sceneToMusic({
    config: { particles: { paint: { fill: { color: { value: '#ff0000' } } } } },
    chaosLevel,
    isDarkMode: true,
  });

let seed;
const rng = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

describe('createSoundEngine', () => {
  let ctx;
  let engine;

  beforeEach(() => {
    seed = 7;
    ctx = new FakeAudioContext();
    engine = createSoundEngine(ctx, { rng });
  });

  it('stays silent until it has a scene', () => {
    engine.scheduleUntil(60);
    expect(engine.tap({ x: 0.5, y: 0.5 })).toBe(false);
    expect(ctx.started).toHaveLength(0);
  });

  it('starts a pad in the scene key', () => {
    engine.setScene(music());
    expect(engine.music.rootMidi).toBe(45);
    expect(ctx.started.length).toBeGreaterThanOrEqual(4); // LFO + 3 voices
  });

  it('chimes more often at higher chaos', () => {
    engine.setScene(music(1));
    const before = ctx.started.length;
    engine.scheduleUntil(120);
    const calm = ctx.started.length - before;

    ctx = new FakeAudioContext();
    seed = 7;
    engine = createSoundEngine(ctx, { rng });
    engine.setScene(music(10));
    const before10 = ctx.started.length;
    engine.scheduleUntil(120);
    const wild = ctx.started.length - before10;

    expect(wild).toBeGreaterThan(calm * 2.5);
  });

  it('lets a new key settle before chiming', () => {
    engine.setScene(music(10), 5);
    const before = ctx.started.length;
    engine.scheduleUntil(6.4);
    expect(ctx.started.length).toBe(before);
  });

  it(`plays at most ${SOUND_LIMITS.MAX_TAPS_PER_SECOND} tap notes a second`, () => {
    engine.setScene(music());
    const played = Array.from({ length: 10 }, (_, i) =>
      engine.tap({ x: 0.5, y: 0.5 }, 1 + i * 0.05)
    ).filter(Boolean);
    expect(played).toHaveLength(SOUND_LIMITS.MAX_TAPS_PER_SECOND);
    expect(engine.tap({ x: 0.5, y: 0.5 }, 2.5)).toBe(true);
  });

  it('never starts a note with a hard attack', () => {
    engine.setScene(music());
    engine.scheduleUntil(30);
    engine.tap({ x: 0.2, y: 0.8 }, 31);

    // Every envelope that starts from silence ramps up, never jumps
    const envelopes = ctx.gains
      .map((g) => g.gain.events)
      .filter((ev) => ev[0]?.[0] === 'set' && ev[0][1] <= 0.001);
    expect(envelopes.length).toBeGreaterThan(3);
    for (const [[, , start], [kind, , peakAt]] of envelopes) {
      expect(['exp', 'linear']).toContain(kind);
      expect(peakAt - start).toBeGreaterThanOrEqual(
        SOUND_LIMITS.MIN_ATTACK - 1e-9
      );
    }
  });

  it('caps the master level', () => {
    expect(SOUND_LIMITS.MASTER_LEVEL).toBeLessThanOrEqual(0.5);
    expect(SOUND_LIMITS.FADE_SECONDS).toBeGreaterThanOrEqual(1);
  });
});
