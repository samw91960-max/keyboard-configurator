"use client";

import { useEffect } from "react";
import type { SoundPack, Switch } from "@/types/keyboard";

const synthProfiles = {
  thock: { frequency: 145, duration: 0.16, gain: 0.2 },
  clack: { frequency: 520, duration: 0.08, gain: 0.16 },
  creamy: { frequency: 270, duration: 0.12, gain: 0.15 },
  silent: { frequency: 190, duration: 0.055, gain: 0.07 },
};

let audioContext: AudioContext | null = null;

function getAudioContext() {
  audioContext ??= new AudioContext();
  return audioContext;
}

function playSynth(profileName: keyof typeof synthProfiles) {
  const profile = synthProfiles[profileName] ?? synthProfiles.creamy;
  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();

  oscillator.type = profileName === "clack" ? "square" : "triangle";
  oscillator.frequency.setValueAtTime(profile.frequency, context.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(
    Math.max(profile.frequency * 0.52, 80),
    context.currentTime + profile.duration,
  );

  filter.type = "lowpass";
  filter.frequency.value = profileName === "clack" ? 1800 : 850;

  gain.gain.setValueAtTime(profile.gain, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + profile.duration);

  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + profile.duration);
}

function safeSynthProfile(profileName: string | undefined): keyof typeof synthProfiles {
  if (
    profileName === "thock" ||
    profileName === "clack" ||
    profileName === "creamy" ||
    profileName === "silent"
  ) {
    return profileName;
  }

  return "creamy";
}

function playAudioFile(src?: string): Promise<void> {
  if (!src) {
    return Promise.reject(new Error("missing audio src"));
  }

  return new Promise((resolve, reject) => {
    const audio = new Audio(src);
    audio.currentTime = 0;
    audio.volume = 0.82;
    audio.onended = () => resolve();
    audio.onerror = () => reject(new Error(`无法加载音频文件：${src}`));
    audio.play().then(resolve).catch(reject);
  });
}

export async function playKeyboardSound(
  switchPart?: Switch,
  soundPack?: SoundPack,
): Promise<void> {
  try {
    await playAudioFile(switchPart?.soundUrl);
  } catch {
    try {
      await playAudioFile(soundPack?.audioUrl);
    } catch {
      playSynth(safeSynthProfile(switchPart?.soundProfile ?? soundPack?.soundProfile));
    }
  }
}

interface SoundPlayerProps {
  switchPart?: Switch;
  soundPack?: SoundPack;
}

export function SoundPlayer({ switchPart, soundPack }: SoundPlayerProps) {
  useEffect(() => {
    const preloadUrls = [soundPack?.audioUrl, switchPart?.soundUrl].filter(Boolean) as string[];

    preloadUrls.forEach((url) => {
      const audio = new Audio(url);
      audio.preload = "auto";
    });
  }, [soundPack?.audioUrl, switchPart?.soundUrl]);

  return null;
}
