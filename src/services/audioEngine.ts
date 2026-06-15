import type { SoundPack, SwitchOption } from "../types/domain";

const synthProfiles: Record<string, { frequency: number; duration: number; gain: number }> = {
  thock: { frequency: 145, duration: 0.16, gain: 0.2 },
  clack: { frequency: 520, duration: 0.08, gain: 0.16 },
  creamy: { frequency: 270, duration: 0.12, gain: 0.15 },
  silent: { frequency: 190, duration: 0.055, gain: 0.07 },
};

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  audioContext ??= new AudioContext();
  return audioContext;
}

function playSynth(kind: string): void {
  const profile = synthProfiles[kind] ?? synthProfiles.creamy;
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = kind === "clack" ? "square" : "triangle";
  oscillator.frequency.setValueAtTime(profile.frequency, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(profile.frequency * 0.52, 80),
    context.currentTime + profile.duration,
  );

  filter.type = "lowpass";
  filter.frequency.value = kind === "clack" ? 1800 : 850;

  gain.gain.setValueAtTime(profile.gain, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + profile.duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + profile.duration);
}

function playAudioFile(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const audio = new Audio(src);
    audio.currentTime = 0;
    audio.volume = 0.82;
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error(`无法加载音频文件：${src}`));
    audio.play().then(resolve).catch(reject);
  });
}

export async function playKeySound(
  selectedSwitch: SwitchOption,
  soundPack: SoundPack,
): Promise<void> {
  try {
    await playAudioFile(soundPack.audioFile);
  } catch {
    try {
      await playAudioFile(selectedSwitch.audioFile);
    } catch {
      playSynth(soundPack.kind || selectedSwitch.soundType);
    }
  }
}
