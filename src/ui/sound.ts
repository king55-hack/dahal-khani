// Tiny synthesized sound effects (Web Audio) — no audio files to download.
let ctx: AudioContext | null = null;
let enabled = true;

export function setSoundEnabled(on: boolean) {
  enabled = on;
}

function audio(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Browsers only allow audio after a user gesture: unlock on the first tap. */
export function unlockAudio() {
  audio();
}

function note(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + start;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function swish() {
  const a = audio();
  if (!a) return;
  const len = Math.floor(a.sampleRate * 0.08);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 2400;
  const gain = a.createGain();
  gain.gain.value = 0.35;
  src.connect(filter).connect(gain).connect(a.destination);
  src.start();
}

const arp = (freqs: number[], step: number, dur: number, type: OscillatorType = 'triangle', vol = 0.12) =>
  freqs.forEach((f, i) => note(f, i * step, dur, type, vol));

export const sfx = {
  card: () => swish(),
  click: () => note(1200, 0, 0.04, 'square', 0.04),
  trick: () => arp([660, 880], 0.07, 0.12, 'triangle', 0.08),
  dahal: () => arp([784, 988, 1319], 0.06, 0.18, 'triangle', 0.12),
  reveal: () => arp([440, 554, 659], 0.09, 0.2, 'square', 0.05),
  coin: () => arp([988, 1319], 0.08, 0.25, 'square', 0.05),
  win: () => arp([523, 659, 784, 1047], 0.11, 0.3),
  lose: () => arp([392, 330, 262], 0.2, 0.4, 'sine', 0.1),
  kot: () => {
    arp([523, 659, 784, 1047, 1319], 0.1, 0.35);
    arp([262, 330, 392], 0.15, 0.6, 'sine', 0.08);
  },
  baunne: () => {
    arp([523, 659, 784, 1047, 784, 1047, 1319, 1568], 0.1, 0.35);
    arp([131, 196, 262, 392], 0.2, 0.8, 'sawtooth', 0.04);
  },
};
