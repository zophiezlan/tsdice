/**
 * @fileoverview Generative ambient sound built on the Web Audio API.
 *
 * A slowly breathing pad holds the scene's key; soft chimes drift in on
 * their own (more often at higher chaos) and answer taps. Every note is
 * scheduled against the audio clock, so the same engine runs live or in an
 * OfflineAudioContext (used to render demos and in tests).
 *
 * Comfort rules: quiet master level behind a limiter, no hard attacks,
 * long fades for every change, and taps capped at a few notes a second.
 */

import { midiToHz, noteAt } from './music.js';

export const SOUND_LIMITS = Object.freeze({
  /** Master level once faded in (0-1) */
  MASTER_LEVEL: 0.35,
  /** Seconds to fade in on start, and between scenes */
  FADE_SECONDS: 2.5,
  /** Most tap notes in any one second */
  MAX_TAPS_PER_SECOND: 4,
  /** Shortest note attack, in seconds (no clicks or jolts) */
  MIN_ATTACK: 0.03,
});

const PAD_LEVEL = 0.05;
const CHIME_LEVEL = 0.11;
const SILENT = 0.0001;

const makeImpulse = (ctx, seconds, rng) => {
  const length = Math.floor(ctx.sampleRate * seconds);
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (rng() * 2 - 1) * Math.pow(1 - i / length, 3);
    }
  }
  return buffer;
};

/**
 * @param {BaseAudioContext} ctx
 * @param {{ rng?: () => number }} [options]
 */
export const createSoundEngine = (ctx, { rng = Math.random } = {}) => {
  // master → limiter → speakers
  const master = ctx.createGain();
  master.gain.value = 0;
  const limiter = ctx.createDynamicsCompressor();
  limiter.threshold.value = -18;
  limiter.knee.value = 12;
  limiter.ratio.value = 8;
  limiter.attack.value = 0.01;
  limiter.release.value = 0.4;
  master.connect(limiter).connect(ctx.destination);

  // Shared space: a long soft reverb and a gentle echo
  const reverb = ctx.createConvolver();
  reverb.buffer = makeImpulse(ctx, 3.5, rng);
  const reverbReturn = ctx.createGain();
  reverbReturn.gain.value = 0.6;
  reverb.connect(reverbReturn).connect(master);

  const echo = ctx.createDelay(2);
  echo.delayTime.value = 0.45;
  const echoFeedback = ctx.createGain();
  echoFeedback.gain.value = 0.3;
  const echoTone = ctx.createBiquadFilter();
  echoTone.type = 'lowpass';
  echoTone.frequency.value = 2200;
  echo.connect(echoTone).connect(echoFeedback).connect(echo);
  echoTone.connect(reverb);

  let music = null;
  let pad = null;
  let nextChimeAt = 0;
  const recentTaps = [];

  const startPad = (at) => {
    // Linear fades: an exponential ramp from silence stays inaudible for
    // most of its length, then jumps up at the end.
    const out = ctx.createGain();
    out.gain.setValueAtTime(0, at);
    out.gain.linearRampToValueAtTime(PAD_LEVEL, at + SOUND_LIMITS.FADE_SECONDS);
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = music.padCutoff;
    filter.Q.value = 0.7;
    // Slow breathing on the filter
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.06;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = music.padCutoff * 0.35;
    lfo.connect(lfoDepth).connect(filter.frequency);

    const fifth = music.scale.includes(7) ? 7 : music.scale[2];
    const voices = [
      { midi: music.rootMidi, type: 'triangle', level: 0.55, detune: 0 },
      { midi: music.rootMidi + fifth, type: 'sine', level: 0.35, detune: -4 },
      { midi: music.rootMidi + 12, type: 'sine', level: 0.25, detune: 5 },
    ].map(({ midi, type, level, detune }) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = midiToHz(midi);
      osc.detune.value = detune;
      const gain = ctx.createGain();
      gain.gain.value = level;
      osc.connect(gain).connect(filter);
      return osc;
    });
    filter.connect(out);
    out.connect(master);
    out.connect(reverb);
    [lfo, ...voices].forEach((osc) => osc.start(at));
    return { out, oscillators: [lfo, ...voices] };
  };

  const releasePad = (old, at) => {
    old.out.gain.cancelScheduledValues(at);
    old.out.gain.setValueAtTime(PAD_LEVEL, at);
    old.out.gain.linearRampToValueAtTime(0, at + SOUND_LIMITS.FADE_SECONDS);
    old.oscillators.forEach((osc) =>
      osc.stop(at + SOUND_LIMITS.FADE_SECONDS + 0.1)
    );
  };

  const chime = (midi, at, { pan = 0, level = CHIME_LEVEL } = {}) => {
    const decay = music.chimeDecay;
    // Linear rise (an exponential one ends in a click), bell-like decay
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, at);
    gain.gain.linearRampToValueAtTime(level, at + SOUND_LIMITS.MIN_ATTACK);
    gain.gain.exponentialRampToValueAtTime(SILENT, at + decay);
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-0.8, Math.min(0.8, pan));
    gain.connect(panner);
    panner.connect(master);
    panner.connect(reverb);
    panner.connect(echo);

    // A sine body with a faint shimmer an octave up
    [
      { mult: 1, type: 'sine', level: 1 },
      { mult: 2, type: 'triangle', level: 0.12 },
    ].forEach(({ mult, type, level: partial }) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = midiToHz(midi) * mult;
      const partialGain = ctx.createGain();
      partialGain.gain.value = partial;
      osc.connect(partialGain).connect(gain);
      osc.start(at);
      osc.stop(at + decay + 0.05);
    });
  };

  return {
    /** Moves to a new scene's key, gliding the pad across. */
    setScene(nextMusic, at = ctx.currentTime) {
      const old = pad;
      music = nextMusic;
      pad = startPad(at);
      if (old) releasePad(old, at);
      // Let the new key settle before the first chime
      nextChimeAt = Math.max(nextChimeAt, at + 1.5);
    },

    /** Schedules ambient chimes up to `until` (audio-clock seconds). */
    scheduleUntil(until) {
      if (!music) return;
      while (nextChimeAt < until) {
        const pan = rng() * 1.2 - 0.6;
        const octaves = rng() < 0.7 ? 1 : 2;
        chime(noteAt(music, rng(), octaves, 1), nextChimeAt, {
          pan,
          level: CHIME_LEVEL * (0.6 + rng() * 0.4),
        });
        nextChimeAt += music.chimeInterval * (0.6 + rng() * 0.8);
      }
    },

    /**
     * A tap at (x, y), each 0-1 across the screen: higher taps play higher
     * notes, and the note sits where the tap was in the stereo field.
     * @returns {boolean} Whether a note played (taps are rate-limited)
     */
    tap({ x, y }, at = ctx.currentTime) {
      if (!music) return false;
      while (recentTaps.length && recentTaps[0] <= at - 1) recentTaps.shift();
      if (recentTaps.length >= SOUND_LIMITS.MAX_TAPS_PER_SECOND) return false;
      recentTaps.push(at);
      chime(noteAt(music, 1 - y, 1, 2), at, { pan: x * 1.6 - 0.8 });
      return true;
    },

    fadeIn(at = ctx.currentTime, seconds = SOUND_LIMITS.FADE_SECONDS) {
      master.gain.cancelScheduledValues(at);
      master.gain.setValueAtTime(master.gain.value, at);
      master.gain.linearRampToValueAtTime(
        SOUND_LIMITS.MASTER_LEVEL,
        at + seconds
      );
    },

    fadeOut(at = ctx.currentTime, seconds = 1.2) {
      master.gain.cancelScheduledValues(at);
      master.gain.setValueAtTime(master.gain.value, at);
      master.gain.linearRampToValueAtTime(0, at + seconds);
    },

    /** Current musical parameters (for tests and diagnostics) */
    get music() {
      return music;
    },
  };
};
