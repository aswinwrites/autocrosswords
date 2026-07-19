"use client";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  return ctx;
}

function beep(freq: number, duration: number, type: OscillatorType = "sine", gainValue = 0.05) {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.value = gainValue;
  osc.connect(gain).connect(audioCtx.destination);
  const now = audioCtx.currentTime;
  gain.gain.setValueAtTime(gainValue, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  osc.start(now);
  osc.stop(now + duration);
}

export const sounds = {
  keypress: () => beep(440, 0.05, "square", 0.02),
  correct: () => {
    beep(660, 0.08, "sine", 0.04);
    setTimeout(() => beep(880, 0.1, "sine", 0.04), 70);
  },
  wrong: () => beep(160, 0.2, "sawtooth", 0.035),
  complete: () => {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => beep(f, 0.18, "sine", 0.05), i * 110));
  },
  click: () => beep(300, 0.04, "triangle", 0.02),
};

export function playSound(name: keyof typeof sounds, enabled: boolean) {
  if (!enabled) return;
  try {
    sounds[name]();
  } catch {
    // audio not available; fail silently
  }
}
