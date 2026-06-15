"use client";

import { AlertTriangle, Box, Volume2 } from "lucide-react";
import type {
  BuildCustomization,
  BuildPartsSelection,
  Case,
  CompatibilityResult,
  Diffuser,
  KeyboardBuild,
  KeyboardLayout,
  KeyboardTemplate,
  PartsByType,
  SoundPack,
  Switch,
} from "@/types/keyboard";
import { CaseFrame } from "./CaseFrame";
import { getKeyboardCanvasSize, KeyboardCanvas } from "./KeyboardCanvas";
import { LightingLayer } from "./LightingLayer";
import { playKeyboardSound, SoundPlayer } from "./SoundPlayer";

type BuildLike = BuildPartsSelection | KeyboardBuild;

interface KeyboardPreviewProps {
  build: BuildLike;
  parts: PartsByType;
  compatibility: CompatibilityResult;
  customization?: BuildCustomization;
  onKeySelect?: (keyId: string) => void;
}

const colorMap: Record<string, string> = {
  cream: "#F4E9D8",
  teal: "#2F6F73",
  accent: "#2F6F73",
  black: "#1F2937",
  white: "#F8FAFC",
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

function readableTextColor(hexColor: string) {
  const normalized = hexColor.replace("#", "");
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.56 ? "#151922" : "#F8FAFC";
}

function findParts(build: BuildLike, parts: PartsByType) {
  return {
    template: parts.keyboard_template.find((item) => item.id === build.templateId),
    keycap: parts.keycap.find((item) => item.id === build.keycapId),
    switchPart: parts.switch.find((item) => item.id === build.switchId),
    casePart: parts.case.find((item) => item.id === build.caseId),
    diffuser: parts.diffuser.find((item) => item.id === build.diffuserId),
    soundPack: parts.sound_pack.find((item) => item.id === build.soundPackId),
  };
}

function fallbackTemplate(): KeyboardTemplate {
  return {
    id: "fallback-template",
    type: "keyboard_template",
    name: "Fallback 65%",
    brand: "System",
    layout: "65%",
    mount: "gasket",
    supportedPCBTypes: ["hotswap"],
    supportedPlateLayouts: ["65%"],
    supportedCaseLayouts: ["65%"],
    compatibleLayouts: ["65%"],
    materials: ["plastic"],
    tags: [],
  };
}

export function KeyboardPreview({
  build,
  parts,
  compatibility,
  customization,
  onKeySelect,
}: KeyboardPreviewProps) {
  const { template, keycap, switchPart, casePart, diffuser, soundPack } = findParts(build, parts);
  const activeTemplate = template ?? fallbackTemplate();
  const layout: KeyboardLayout = activeTemplate.layout;
  const unit = 42;
  const padding = 20;
  const gap = 4;
  const { width, height } = getKeyboardCanvasSize(layout, unit, padding);
  const defaultKeyColor = customization?.defaultKeycapColor ?? toColor(keycap?.colors[0], "#F4E9D8");
  const accentColor = toColor(keycap?.colors[1], "#2F6F73");
  const caseColor = customization?.caseColor ?? toColor((casePart as Case | undefined)?.color, "#4B5563");
  const lightingColor = customization?.lightingColor ?? toColor((diffuser as Diffuser | undefined)?.color, "#73D8FF");
  const legendColor = customization?.legendColor ?? readableTextColor(defaultKeyColor);
  const materialStyle = customization?.keycapMaterialStyle ?? keycap?.materialStyle ?? "normal";
  const keyColorMap = customization?.keyColorMap ?? {};
  const incompatible = !compatibility.compatible;

  function handleKeyPress(keyId: string) {
    onKeySelect?.(keyId);
    void playKeyboardSound(switchPart as Switch | undefined, soundPack as SoundPack | undefined);
  }

  return (
    <section className="rounded-md border border-stone-200 bg-white shadow-sm">
      <SoundPlayer
        soundPack={soundPack as SoundPack | undefined}
        switchPart={switchPart as Switch | undefined}
      />
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-4">
        <div>
          <h2 className="text-base font-semibold text-ink">键盘 2D 预览</h2>
          <p className="mt-1 text-sm text-stone-500">
            {activeTemplate.name} · {keycap?.name ?? "默认键帽"} ·{" "}
            {casePart?.name ?? "默认外壳"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-md bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700">
            <Volume2 className="h-4 w-4" />
            点击按键选择并试听
          </span>
          {incompatible ? (
            <span className="inline-flex items-center gap-2 rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              <AlertTriangle className="h-4 w-4" />
              当前配置不兼容
            </span>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto bg-stone-50 p-4">
        <CaseFrame color={caseColor} height={height} incompatible={incompatible} width={width}>
          <LightingLayer color={lightingColor} enabled={Boolean(diffuser)} />
          <KeyboardCanvas
            accentColor={accentColor}
            gap={gap}
            keyColor={defaultKeyColor}
            keyColorMap={keyColorMap}
            layout={layout}
            lightingColor={lightingColor}
            lightingEnabled={Boolean(diffuser)}
            materialStyle={materialStyle}
            onKeyPress={handleKeyPress}
            selectedKeyId={customization?.selectedKeyId}
            textColor={legendColor}
            unit={unit}
          />
        </CaseFrame>
      </div>

      <div className="grid gap-3 border-t border-stone-200 p-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md bg-stone-50 p-3">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <Box className="h-4 w-4" />
            配列
          </div>
          <p className="mt-1 text-stone-500">{layout}</p>
        </div>
        <div className="rounded-md bg-stone-50 p-3">
          <div className="font-semibold text-ink">键帽材质</div>
          <p className="mt-1 text-stone-500">{materialStyle}</p>
        </div>
        <div className="rounded-md bg-stone-50 p-3">
          <div className="font-semibold text-ink">外壳颜色</div>
          <p className="mt-1 text-stone-500">{caseColor}</p>
        </div>
        <div className="rounded-md bg-stone-50 p-3">
          <div className="font-semibold text-ink">声音</div>
          <p className="mt-1 text-stone-500">
            {switchPart?.name ?? "默认轴体"} · 轴体声音优先
          </p>
        </div>
      </div>
    </section>
  );
}
