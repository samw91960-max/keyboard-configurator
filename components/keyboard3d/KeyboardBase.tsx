"use client";

import type {
  Case,
  BuildCustomization,
  Diffuser,
  KeyboardLayout,
  KeycapSet,
  Plate,
  Switch,
} from "@/types/keyboard";
import {
  getKeyboardCanvasSize,
  type PreviewKey,
} from "../keyboard/KeyboardCanvas";
import { Case3D } from "./Case3D";
import { Lighting3D } from "./Lighting3D";
import { Plate3D } from "./Plate3D";
import { RefinedKeycap } from "./RefinedKeycap";
import { Switch3D } from "./Switch3D";

interface KeyboardBaseProps {
  layout: KeyboardLayout;
  keycap?: KeycapSet;
  switchPart?: Switch;
  plate?: Plate;
  casePart?: Case;
  diffuser?: Diffuser;
  incompatible: boolean;
  customization?: BuildCustomization;
  onKeyPress: (keyId: string) => void;
}

const colorMap: Record<string, string> = {
  cream: "#F4E9D8",
  teal: "#2F6F73",
  accent: "#2F6F73",
  "ice-blue": "#73D8FF",
  "warm-white": "#FFE6B7",
};

function toColor(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  if (value.startsWith("#")) {
    return value;
  }

  return colorMap[value] ?? fallback;
}

function keyPosition(key: PreviewKey, boardWidthUnits: number, boardDepthUnits: number) {
  const keyCenterX = key.x + key.w / 2;
  const keyCenterY = key.y + (key.h ?? 1) / 2;

  return {
    x: keyCenterX - boardWidthUnits / 2,
    z: keyCenterY - boardDepthUnits / 2,
  };
}

export function KeyboardBase({
  layout,
  keycap,
  switchPart,
  plate,
  casePart,
  diffuser,
  incompatible,
  customization,
  onKeyPress,
}: KeyboardBaseProps) {
  const unit = 1;
  const { keys } = getKeyboardCanvasSize(layout, unit, 0);
  const boardWidthUnits = Math.max(...keys.map((key) => key.x + key.w));
  const boardDepthUnits = Math.max(...keys.map((key) => key.y + (key.h ?? 1)));
  const keyColor = customization?.defaultKeycapColor ?? toColor(keycap?.colors[0], "#F4E9D8");
  const accentColor = toColor(keycap?.colors[1], "#2F6F73");
  const caseColor = customization?.caseColor ?? toColor(casePart?.color, "#4B5563");
  const lightColor = customization?.lightingColor ?? toColor(diffuser?.color, "#73D8FF");
  const keyColorMap = customization?.keyColorMap ?? {};
  const materialStyle = customization?.keycapMaterialStyle ?? keycap?.materialStyle ?? "normal";

  return (
    <group rotation={[-0.08, 0, 0]}>
      <Case3D
        color={caseColor}
        depth={boardDepthUnits}
        incompatible={incompatible}
        width={boardWidthUnits}
      />
      <Lighting3D
        color={lightColor}
        depth={boardDepthUnits}
        enabled={Boolean(diffuser)}
        width={boardWidthUnits}
      />
      <Plate3D
        depth={boardDepthUnits}
        materialName={plate?.material}
        width={boardWidthUnits}
      />
      {keys.map((key, index) => {
        const { x, z } = keyPosition(key, boardWidthUnits, boardDepthUnits);
        const accent = key.label === "Esc" || key.label.includes("Enter") || index % 13 === 0;

        return (
          <group key={`${layout}-${key.id}-${key.x}-${key.y}-${index}`}>
            <Switch3D switchType={switchPart?.switchType} x={x} z={z} />
            <RefinedKeycap
              color={keyColorMap[key.id] ?? (accent ? accentColor : keyColor)}
              id={key.id}
              lightingColor={lightColor}
              materialStyle={materialStyle}
              onPress={onKeyPress}
              selected={customization?.selectedKeyId === key.id}
              width={Math.max(key.w * 0.9, 0.82)}
              x={x}
              z={z}
            />
          </group>
        );
      })}
    </group>
  );
}
