import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const audioDir = resolve(root, "public", "audio");

const sampleRate = 44100;

const profiles = [
  ["switch-linear-45.wav", 270, 0.12, 0.28, "sine"],
  ["switch-tactile-58.wav", 160, 0.16, 0.34, "triangle"],
  ["switch-clicky-62.wav", 620, 0.08, 0.26, "square"],
  ["switch-silent-50.wav", 190, 0.055, 0.12, "sine"],
  ["sound-thock.wav", 140, 0.16, 0.36, "triangle"],
  ["sound-clack.wav", 540, 0.085, 0.27, "square"],
  ["sound-creamy.wav", 260, 0.13, 0.25, "sine"],
  ["sound-silent.wav", 185, 0.055, 0.1, "sine"],
];

function waveform(type, phase) {
  if (type === "square") {
    return Math.sin(phase) >= 0 ? 1 : -1;
  }

  if (type === "triangle") {
    return (2 / Math.PI) * Math.asin(Math.sin(phase));
  }

  return Math.sin(phase);
}

function createWav({ frequency, duration, gain, type }) {
  const sampleCount = Math.floor(sampleRate * duration);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const t = index / sampleRate;
    const attack = Math.min(t / 0.008, 1);
    const decay = Math.exp(-t * 24);
    const body = waveform(type, 2 * Math.PI * frequency * t);
    const click = Math.sin(2 * Math.PI * frequency * 2.7 * t) * Math.exp(-t * 55);
    const sample = (body * 0.76 + click * 0.24) * gain * attack * decay;
    buffer.writeInt16LE(Math.max(-1, Math.min(1, sample)) * 32767, 44 + index * 2);
  }

  return buffer;
}

mkdirSync(audioDir, { recursive: true });

for (const [fileName, frequency, duration, gain, type] of profiles) {
  writeFileSync(
    resolve(audioDir, fileName),
    createWav({ frequency, duration, gain, type }),
  );
}

console.log(`Generated ${profiles.length} audio files in ${audioDir}`);
