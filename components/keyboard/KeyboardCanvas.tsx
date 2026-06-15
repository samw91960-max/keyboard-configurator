"use client";

import type { KeyboardLayout, KeycapMaterialStyle, KeyColorMap } from "@/types/keyboard";
import { Key } from "./Key";

export interface PreviewKey {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h?: number;
}

interface KeyboardCanvasProps {
  layout: KeyboardLayout;
  keyColor: string;
  accentColor: string;
  textColor: string;
  unit: number;
  gap: number;
  keyColorMap: KeyColorMap;
  selectedKeyId?: string;
  materialStyle: KeycapMaterialStyle;
  lightingColor: string;
  lightingEnabled: boolean;
  onKeyPress: (keyId: string) => void;
}

function baseAlphaKeys(): PreviewKey[] {
  return [
    { id: "Esc", label: "Esc", x: 0, y: 0, w: 1 },
    { id: "1", label: "1", x: 1, y: 0, w: 1 },
    { id: "2", label: "2", x: 2, y: 0, w: 1 },
    { id: "3", label: "3", x: 3, y: 0, w: 1 },
    { id: "4", label: "4", x: 4, y: 0, w: 1 },
    { id: "5", label: "5", x: 5, y: 0, w: 1 },
    { id: "6", label: "6", x: 6, y: 0, w: 1 },
    { id: "7", label: "7", x: 7, y: 0, w: 1 },
    { id: "8", label: "8", x: 8, y: 0, w: 1 },
    { id: "9", label: "9", x: 9, y: 0, w: 1 },
    { id: "0", label: "0", x: 10, y: 0, w: 1 },
    { id: "Backspace", label: "Back", x: 11, y: 0, w: 2 },
    { id: "Tab", label: "Tab", x: 0, y: 1, w: 1.5 },
    { id: "Q", label: "Q", x: 1.5, y: 1, w: 1 },
    { id: "W", label: "W", x: 2.5, y: 1, w: 1 },
    { id: "E", label: "E", x: 3.5, y: 1, w: 1 },
    { id: "R", label: "R", x: 4.5, y: 1, w: 1 },
    { id: "T", label: "T", x: 5.5, y: 1, w: 1 },
    { id: "Y", label: "Y", x: 6.5, y: 1, w: 1 },
    { id: "U", label: "U", x: 7.5, y: 1, w: 1 },
    { id: "I", label: "I", x: 8.5, y: 1, w: 1 },
    { id: "O", label: "O", x: 9.5, y: 1, w: 1 },
    { id: "P", label: "P", x: 10.5, y: 1, w: 1 },
    { id: "Pipe", label: "\\", x: 11.5, y: 1, w: 1.5 },
    { id: "Caps", label: "Caps", x: 0, y: 2, w: 1.75 },
    { id: "A", label: "A", x: 1.75, y: 2, w: 1 },
    { id: "S", label: "S", x: 2.75, y: 2, w: 1 },
    { id: "D", label: "D", x: 3.75, y: 2, w: 1 },
    { id: "F", label: "F", x: 4.75, y: 2, w: 1 },
    { id: "G", label: "G", x: 5.75, y: 2, w: 1 },
    { id: "H", label: "H", x: 6.75, y: 2, w: 1 },
    { id: "J", label: "J", x: 7.75, y: 2, w: 1 },
    { id: "K", label: "K", x: 8.75, y: 2, w: 1 },
    { id: "L", label: "L", x: 9.75, y: 2, w: 1 },
    { id: "Enter", label: "Enter", x: 10.75, y: 2, w: 2.25 },
    { id: "ShiftLeft", label: "Shift", x: 0, y: 3, w: 2.25 },
    { id: "Z", label: "Z", x: 2.25, y: 3, w: 1 },
    { id: "X", label: "X", x: 3.25, y: 3, w: 1 },
    { id: "C", label: "C", x: 4.25, y: 3, w: 1 },
    { id: "V", label: "V", x: 5.25, y: 3, w: 1 },
    { id: "B", label: "B", x: 6.25, y: 3, w: 1 },
    { id: "N", label: "N", x: 7.25, y: 3, w: 1 },
    { id: "M", label: "M", x: 8.25, y: 3, w: 1 },
    { id: "ShiftRight", label: "Shift", x: 9.25, y: 3, w: 3.75 },
    { id: "ControlLeft", label: "Ctrl", x: 0, y: 4, w: 1.25 },
    { id: "Meta", label: "Win", x: 1.25, y: 4, w: 1.25 },
    { id: "AltLeft", label: "Alt", x: 2.5, y: 4, w: 1.25 },
    { id: "Space", label: "Space", x: 3.75, y: 4, w: 6.25 },
    { id: "Fn", label: "Fn", x: 10, y: 4, w: 1 },
    { id: "Menu", label: "Menu", x: 11, y: 4, w: 1 },
    { id: "ControlRight", label: "Ctrl", x: 12, y: 4, w: 1 },
  ];
}

function layoutKeys(layout: KeyboardLayout): PreviewKey[] {
  const keys = baseAlphaKeys();

  if (layout === "60%") {
    return keys;
  }

  if (layout === "65%") {
    return [
      ...keys.filter((key) => key.id !== "Menu"),
      { id: "Home", label: "Home", x: 13.25, y: 0, w: 1 },
      { id: "PageUp", label: "PgUp", x: 13.25, y: 1, w: 1 },
      { id: "PageDown", label: "PgDn", x: 13.25, y: 2, w: 1 },
      { id: "ArrowUp", label: "Up", x: 12.25, y: 3, w: 1 },
      { id: "ArrowLeft", label: "Left", x: 11.25, y: 4, w: 1 },
      { id: "ArrowDown", label: "Down", x: 12.25, y: 4, w: 1 },
      { id: "ArrowRight", label: "Right", x: 13.25, y: 4, w: 1 },
    ];
  }

  const fRow: PreviewKey[] = [
    { id: "F1", label: "F1", x: 1.25, y: 0, w: 1 },
    { id: "F2", label: "F2", x: 2.25, y: 0, w: 1 },
    { id: "F3", label: "F3", x: 3.25, y: 0, w: 1 },
    { id: "F4", label: "F4", x: 4.25, y: 0, w: 1 },
    { id: "F5", label: "F5", x: 5.5, y: 0, w: 1 },
    { id: "F6", label: "F6", x: 6.5, y: 0, w: 1 },
    { id: "F7", label: "F7", x: 7.5, y: 0, w: 1 },
    { id: "F8", label: "F8", x: 8.5, y: 0, w: 1 },
    { id: "F9", label: "F9", x: 9.75, y: 0, w: 1 },
    { id: "F10", label: "F10", x: 10.75, y: 0, w: 1 },
    { id: "F11", label: "F11", x: 11.75, y: 0, w: 1 },
    { id: "F12", label: "F12", x: 12.75, y: 0, w: 1 },
  ];
  const shifted = keys.map((key) => ({ ...key, y: key.y + 1.25 }));

  if (layout === "75%") {
    return [
      { id: "Esc", label: "Esc", x: 0, y: 0, w: 1 },
      ...fRow,
      { id: "Delete", label: "Del", x: 14, y: 0, w: 1 },
      ...shifted,
      { id: "Home", label: "Home", x: 14, y: 1.25, w: 1 },
      { id: "PageUp", label: "PgUp", x: 14, y: 2.25, w: 1 },
      { id: "PageDown", label: "PgDn", x: 14, y: 3.25, w: 1 },
      { id: "ArrowUp", label: "Up", x: 13, y: 4.25, w: 1 },
      { id: "ArrowLeft", label: "Left", x: 12, y: 5.25, w: 1 },
      { id: "ArrowDown", label: "Down", x: 13, y: 5.25, w: 1 },
      { id: "ArrowRight", label: "Right", x: 14, y: 5.25, w: 1 },
    ];
  }

  if (layout === "TKL") {
    return [
      { id: "Esc", label: "Esc", x: 0, y: 0, w: 1 },
      ...fRow,
      { id: "PrintScreen", label: "Prt", x: 15, y: 0, w: 1 },
      { id: "ScrollLock", label: "Scr", x: 16, y: 0, w: 1 },
      { id: "Pause", label: "Pse", x: 17, y: 0, w: 1 },
      ...shifted,
      { id: "Insert", label: "Ins", x: 15, y: 1.25, w: 1 },
      { id: "Home", label: "Home", x: 16, y: 1.25, w: 1 },
      { id: "PageUp", label: "PgUp", x: 17, y: 1.25, w: 1 },
      { id: "Delete", label: "Del", x: 15, y: 2.25, w: 1 },
      { id: "End", label: "End", x: 16, y: 2.25, w: 1 },
      { id: "PageDown", label: "PgDn", x: 17, y: 2.25, w: 1 },
      { id: "ArrowUp", label: "Up", x: 16, y: 4.25, w: 1 },
      { id: "ArrowLeft", label: "Left", x: 15, y: 5.25, w: 1 },
      { id: "ArrowDown", label: "Down", x: 16, y: 5.25, w: 1 },
      { id: "ArrowRight", label: "Right", x: 17, y: 5.25, w: 1 },
    ];
  }

  return keys.map((key) => ({
    ...key,
    x: key.x + (key.y < 2 ? 0 : key.y * 0.25),
    y: key.y + (key.x > 6 ? 0.2 : 0),
  }));
}

export function getKeyboardCanvasSize(layout: KeyboardLayout, unit: number, padding: number) {
  const keys = layoutKeys(layout);
  const maxX = Math.max(...keys.map((key) => key.x + key.w));
  const maxY = Math.max(...keys.map((key) => key.y + (key.h ?? 1)));

  return {
    keys,
    width: maxX * unit + padding * 2,
    height: maxY * unit + padding * 2,
  };
}

function keyFillColor(
  keyId: string,
  fallbackColor: string,
  materialStyle: KeycapMaterialStyle,
  keyColorMap: KeyColorMap,
) {
  const customColor = keyColorMap[keyId];

  if (customColor) {
    return customColor;
  }

  if (materialStyle === "black_translucent") {
    return "rgba(0,0,0,0.55)";
  }

  if (materialStyle === "white_translucent") {
    return "rgba(255,255,255,0.55)";
  }

  return fallbackColor;
}

export function KeyboardCanvas({
  layout,
  keyColor,
  accentColor,
  textColor,
  unit,
  gap,
  keyColorMap,
  selectedKeyId,
  materialStyle,
  lightingColor,
  lightingEnabled,
  onKeyPress,
}: KeyboardCanvasProps) {
  const { keys } = getKeyboardCanvasSize(layout, unit, 20);
  const translucent = materialStyle !== "normal";

  return (
    <div className="absolute inset-5">
      {keys.map((key, index) => {
        const accent = key.label === "Esc" || key.label.includes("Enter") || index % 13 === 0;
        const baseColor = accent ? accentColor : keyColor;

        return (
          <Key
            color={keyFillColor(key.id, baseColor, materialStyle, keyColorMap)}
            gap={gap}
            glowColor={lightingEnabled || translucent ? lightingColor : undefined}
            h={key.h}
            id={key.id}
            key={key.id}
            label={key.label}
            onPress={onKeyPress}
            selected={selectedKeyId === key.id}
            textColor={textColor}
            unit={unit}
            w={key.w}
            x={key.x}
            y={key.y}
          />
        );
      })}
    </div>
  );
}
