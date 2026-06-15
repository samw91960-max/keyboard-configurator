"use client";

import { Component, type ErrorInfo, type ReactNode, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import type {
  BuildPartsSelection,
  BuildCustomization,
  Case,
  CompatibilityResult,
  Diffuser,
  KeyboardBuild,
  KeyboardLayout,
  KeyboardTemplate,
  KeycapSet,
  Plate,
  PartsByType,
  SoundPack,
  Switch,
} from "@/types/keyboard";
import { KeyboardPreview } from "../keyboard/KeyboardPreview";
import { playKeyboardSound, SoundPlayer } from "../keyboard/SoundPlayer";
import { KeyboardBase } from "./KeyboardBase";

type BuildLike = BuildPartsSelection | KeyboardBuild;

interface Keyboard3DPreviewProps {
  build: BuildLike;
  parts: PartsByType;
  compatibility: CompatibilityResult;
  customization?: BuildCustomization;
  onKeySelect?: (keyId: string) => void;
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

interface ErrorBoundaryState {
  failed: boolean;
}

class PreviewErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { failed: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("3D keyboard preview failed", error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return this.props.fallback;
    }

    return this.props.children;
  }
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

function findParts(build: BuildLike, parts: PartsByType) {
  return {
    template: parts.keyboard_template.find((item) => item.id === build.templateId),
    keycap: parts.keycap.find((item) => item.id === build.keycapId),
    switchPart: parts.switch.find((item) => item.id === build.switchId),
    plate: parts.plate.find((item) => item.id === build.plateId),
    casePart: parts.case.find((item) => item.id === build.caseId),
    diffuser: parts.diffuser.find((item) => item.id === build.diffuserId),
    soundPack: parts.sound_pack.find((item) => item.id === build.soundPackId),
  };
}

export function Keyboard3DPreview({
  build,
  parts,
  compatibility,
  customization,
  onKeySelect,
}: Keyboard3DPreviewProps) {
  const { template, keycap, switchPart, plate, casePart, diffuser, soundPack } = findParts(
    build,
    parts,
  );
  const activeTemplate = template ?? fallbackTemplate();
  const layout: KeyboardLayout = activeTemplate.layout;

  function handleKeyPress(keyId: string) {
    onKeySelect?.(keyId);
    void playKeyboardSound(switchPart as Switch | undefined, soundPack as SoundPack | undefined);
  }

  return (
    <PreviewErrorBoundary
      fallback={
        <KeyboardPreview
          build={build}
          compatibility={compatibility}
          customization={customization}
          onKeySelect={onKeySelect}
          parts={parts}
        />
      }
    >
      <section className="rounded-md border border-stone-200 bg-white shadow-sm">
        <SoundPlayer
          soundPack={soundPack as SoundPack | undefined}
          switchPart={switchPart as Switch | undefined}
        />
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-4">
          <div>
            <h2 className="text-base font-semibold text-ink">键盘 3D 预览</h2>
            <p className="mt-1 text-sm text-stone-500">
              {activeTemplate.name} · {keycap?.name ?? "默认键帽"} · 鼠标旋转/缩放/平移
            </p>
          </div>
          {!compatibility.compatible ? (
            <span className="rounded-md bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              当前配置不兼容
            </span>
          ) : null}
        </div>
        <div className="h-[520px] bg-stone-950">
          <Canvas camera={{ position: [0, 8, 9], fov: 45 }} shadows>
            <Suspense fallback={null}>
              <ambientLight intensity={0.85} />
              <directionalLight castShadow intensity={1.8} position={[4, 8, 5]} />
              <KeyboardBase
                casePart={casePart as Case | undefined}
                diffuser={diffuser as Diffuser | undefined}
                incompatible={!compatibility.compatible}
                keycap={keycap as KeycapSet | undefined}
                layout={layout}
                customization={customization}
                onKeyPress={handleKeyPress}
                plate={plate as Plate | undefined}
                switchPart={switchPart as Switch | undefined}
              />
              <Environment preset="city" />
              <OrbitControls enableDamping makeDefault />
            </Suspense>
          </Canvas>
        </div>
      </section>
    </PreviewErrorBoundary>
  );
}
