// Sound effects made with the Web Audio API — no audio files to download, so the game still works offline.
//
// They are built to feel like real things instead of beeps:
//  - a card is a short papery "thwack" (a burst of filtered noise plus a soft low thump), slightly different every time;
//  - a coin is a bright metallic "tink" (several inharmonic partials that ring and fade);
//  - Dahal is a temple bell (ghanta); the victory tunes are plucked notes on a Nepali-sounding scale,
//    with a madal-style drum under the big wins;
//  - everything goes through a little room reverb and a compressor so it sounds warm and never harsh.
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let reverbIn: GainNode | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

/** For tests: use another audio context (an offline one) so sounds can be rendered and measured. */
export function _useContext(c: BaseAudioContext | null) {
  ctx = c as AudioContext | null;
  master = null;
  reverbIn = null;
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended' && !('startRendering' in ctx)) void ctx.resume();
  if (!master) buildOutput(ctx);
  return ctx;
}

/** Browsers only allow audio after a user gesture: unlock on the first tap. */
export function unlockAudio() {
  audio();
}

/** Compressor (keeps loud moments from clipping) and a small room reverb that sounds natural. */
function buildOutput(a: AudioContext) {
  const comp = a.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 24;
  comp.ratio.value = 4;
  comp.attack.value = 0.004;
  comp.release.value = 0.2;
  master = a.createGain();
  master.gain.value = 0.9;
  master.connect(comp).connect(a.destination);

  // Reverb: noise that fades away, played through a ConvolverNode.
  const secs = 1.3;
  const len = Math.floor(a.sampleRate * secs);
  const ir = a.createBuffer(2, len, a.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  const conv = a.createConvolver();
  conv.buffer = ir;
  const wet = a.createGain();
  wet.gain.value = 0.22;
  reverbIn = a.createGain();
  reverbIn.connect(conv).connect(wet).connect(master);
}

const out = (a: AudioContext) => master ?? a.destination;
/** Slight random change so repeated sounds never sound like a machine. */
const vary = (amount = 0.04) => 1 + (Math.random() * 2 - 1) * amount;

interface ToneOpts {
  type?: OscillatorType;
  vol?: number;
  attack?: number;
  /** how much of the sound goes to the reverb (0–1) */
  verb?: number;
  /** a low-pass filter's cut-off in Hz, to make the tone softer */
  lp?: number;
  /** glide from this frequency to the note's frequency */
  from?: number;
  detune?: number;
}

/** One note with a natural envelope: quick start, then a smooth fade. */
function tone(freq: number, start: number, dur: number, o: ToneOpts = {}) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = o.type ?? 'sine';
  if (o.detune) osc.detune.value = o.detune;
  if (o.from) {
    osc.frequency.setValueAtTime(o.from, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + Math.min(0.08, dur / 2));
  } else osc.frequency.setValueAtTime(freq, t);
  const vol = o.vol ?? 0.1;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + (o.attack ?? 0.006));
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let node: AudioNode = osc;
  if (o.lp) {
    const f = a.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = o.lp;
    osc.connect(f);
    node = f;
  }
  node.connect(gain);
  gain.connect(out(a));
  if (o.verb && reverbIn) {
    const send = a.createGain();
    send.gain.value = o.verb;
    gain.connect(send).connect(reverbIn);
  }
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** A plucked string (sitar / sarangi-like): a bright start that mellows quickly. */
function pluck(freq: number, start: number, dur = 0.6, vol = 0.12) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const osc2 = a.createOscillator();
  osc.type = 'sawtooth';
  osc2.type = 'triangle';
  osc.frequency.value = freq;
  osc2.frequency.value = freq * 2.003;
  const lp = a.createBiquadFilter();
  lp.type = 'lowpass';
  lp.Q.value = 0.8;
  lp.frequency.setValueAtTime(Math.min(freq * 9, 7000), t);
  lp.frequency.exponentialRampToValueAtTime(freq * 1.6, t + dur * 0.8);
  const gain = a.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.006);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const g2 = a.createGain();
  g2.gain.value = 0.35;
  osc.connect(lp);
  osc2.connect(g2).connect(lp);
  lp.connect(gain).connect(out(a));
  if (reverbIn) {
    const send = a.createGain();
    send.gain.value = 0.35;
    gain.connect(send).connect(reverbIn);
  }
  osc.start(t);
  osc2.start(t);
  osc.stop(t + dur + 0.05);
  osc2.stop(t + dur + 0.05);
}

/** A bell: partials that are not whole multiples, each fading at its own speed. */
function bell(freq: number, start: number, vol = 0.1, dur = 1.6) {
  const parts: [number, number, number][] = [
    [1, 1, 1],
    [2.01, 0.5, 0.7],
    [2.76, 0.42, 0.55],
    [5.4, 0.2, 0.3],
    [8.93, 0.1, 0.18],
  ];
  for (const [ratio, amp, life] of parts) tone(freq * ratio, start, dur * life, { vol: vol * amp, verb: 0.5, attack: 0.002 });
}

interface NoiseOpts {
  dur: number;
  freq: number;
  q?: number;
  type?: BiquadFilterType;
  vol?: number;
  start?: number;
  /** sweep the filter to this frequency over the sound */
  sweepTo?: number;
  verb?: number;
}

/** A burst of filtered noise: the "air" and "paper" in card and swish sounds. */
function noise(o: NoiseOpts) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + (o.start ?? 0);
  const len = Math.max(1, Math.floor(a.sampleRate * o.dur));
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 1.6);
  const src = a.createBufferSource();
  src.buffer = buf;
  const f = a.createBiquadFilter();
  f.type = o.type ?? 'bandpass';
  f.Q.value = o.q ?? 0.9;
  f.frequency.setValueAtTime(o.freq, t);
  if (o.sweepTo) f.frequency.exponentialRampToValueAtTime(o.sweepTo, t + o.dur);
  const g = a.createGain();
  g.gain.setValueAtTime(o.vol ?? 0.3, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + o.dur);
  src.connect(f).connect(g).connect(out(a));
  if (o.verb && reverbIn) {
    const send = a.createGain();
    send.gain.value = o.verb;
    g.connect(send).connect(reverbIn);
  }
  src.start(t);
}

/** A soft drum hit (madal / damphu style): a low note that drops in pitch, with a skin "slap". */
function drum(start: number, vol = 0.3, base = 120) {
  tone(base * vary(0.03), start, 0.32, { type: 'sine', vol, from: base * 2.1, attack: 0.003, verb: 0.15 });
  noise({ dur: 0.05, freq: 1800, q: 0.7, vol: vol * 0.5, start });
}

// A Nepali-sounding scale (the major scale with a folk pentatonic feel), in Hz.
const SA = 261.63; // C4
const SCALE = { sa: SA, re: SA * 1.122, ga: SA * 1.26, pa: SA * 1.498, dha: SA * 1.682, sa2: SA * 2, re2: SA * 2.245, ga2: SA * 2.52, pa2: SA * 2.997 };

export const sfx = {
  /** A card put down on the table. */
  card: () => {
    const v = vary(0.08);
    tone(150 * v, 0, 0.09, { type: 'sine', vol: 0.5, from: 260 * v, attack: 0.002 });
    noise({ dur: 0.06, freq: 2600 * v, q: 0.8, vol: 1.0 });
    noise({ dur: 0.03, freq: 5200, type: 'highpass', vol: 0.3, start: 0.004 });
  },
  /** Cards being dealt: a lighter, quicker flick. */
  deal: () => noise({ dur: 0.07, freq: 3200 * vary(0.1), q: 1.1, vol: 0.7, sweepTo: 1800 }),
  click: () => {
    tone(900 * vary(0.03), 0, 0.05, { type: 'triangle', vol: 0.12, attack: 0.002, lp: 3000 });
    noise({ dur: 0.02, freq: 3000, vol: 0.25 });
  },
  /** A trick is taken: the cards are gathered with a short sweep. */
  trick: () => {
    noise({ dur: 0.2, freq: 900, q: 0.7, vol: 0.5, sweepTo: 3400 });
    pluck(SCALE.pa, 0.12, 0.35, 0.08);
  },
  /** A Dahal (10) is won: a temple bell. */
  dahal: () => {
    bell(SCALE.pa2 * 0.5, 0, 0.14, 1.5);
    bell(SCALE.sa2 * 0.75, 0.16, 0.1, 1.3);
  },
  /** Trump shown: three soft rising notes. */
  reveal: () => {
    pluck(SCALE.sa2, 0, 0.45, 0.08);
    pluck(SCALE.ga2, 0.1, 0.45, 0.08);
    pluck(SCALE.pa2, 0.2, 0.6, 0.09);
  },
  /** A coin: a bright "tink" that rings, then a second smaller one. */
  coin: () => {
    const f = 1760 * vary(0.02);
    const ring = (at: number, vol: number) => {
      tone(f, at, 0.5, { vol, verb: 0.35, attack: 0.001 });
      tone(f * 1.508, at, 0.38, { vol: vol * 0.7, verb: 0.35, attack: 0.001 });
      tone(f * 2.62, at, 0.22, { vol: vol * 0.4, verb: 0.2, attack: 0.001 });
    };
    ring(0, 0.07);
    ring(0.075, 0.09);
    noise({ dur: 0.02, freq: 6500, type: 'highpass', vol: 0.06 });
  },
  /** A round is won: a short happy tune. */
  win: () => {
    [SCALE.sa2, SCALE.ga2, SCALE.pa2, SCALE.sa2 * 2].forEach((f, i) => pluck(f, i * 0.12, 0.7, 0.13));
    pluck(SCALE.sa, 0.5, 1.1, 0.1);
    pluck(SCALE.ga, 0.5, 1.1, 0.08);
    pluck(SCALE.pa, 0.5, 1.1, 0.08);
    bell(SCALE.sa2 * 2, 0.5, 0.06, 1.4);
  },
  /** A round is lost: a soft, falling phrase (nothing harsh). */
  lose: () => {
    pluck(SCALE.pa, 0, 0.55, 0.1);
    pluck(SCALE.ga, 0.22, 0.55, 0.1);
    pluck(SCALE.sa, 0.44, 1.0, 0.1);
  },
  /** Kot or Baunne against us: a sad "wah-wah-wah-waaah" on a slow, low voice. */
  ouch: () => {
    [392, 370, 349].forEach((f, i) => tone(f, i * 0.32, 0.3, { type: 'triangle', vol: 0.12, lp: 1400, from: f * 1.03, verb: 0.25 }));
    tone(330, 0.96, 0.95, { type: 'triangle', vol: 0.13, lp: 1200, from: 349, verb: 0.3 });
    drum(0, 0.12, 80);
  },
  /** Kot: a drum roll up to a bright finish. */
  kot: () => {
    drum(0, 0.3);
    drum(0.22, 0.26);
    drum(0.38, 0.3);
    [SCALE.sa2, SCALE.ga2, SCALE.pa2, SCALE.sa2 * 2, SCALE.ga2 * 2].forEach((f, i) => pluck(f, 0.5 + i * 0.1, 0.8, 0.13));
    bell(SCALE.sa2, 0.5, 0.1, 1.8);
  },
  /** Baunne: the biggest celebration — drums, a rising run, and temple bells. */
  baunne: () => {
    [0, 0.2, 0.4, 0.5, 0.6, 0.8].forEach((t, i) => drum(t, i % 2 ? 0.26 : 0.34, i % 2 ? 140 : 105));
    [SCALE.sa2, SCALE.re2, SCALE.ga2, SCALE.pa2, SCALE.ga2, SCALE.pa2, SCALE.pa2 * 1.125, SCALE.sa2 * 2].forEach((f, i) =>
      pluck(f, 0.9 + i * 0.1, 0.85, 0.13),
    );
    bell(SCALE.sa2 * 0.5, 0.9, 0.12, 2.2);
    bell(SCALE.pa2, 1.7, 0.1, 2.2);
  },
};
