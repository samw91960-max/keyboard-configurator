"use client";

import dynamic from "next/dynamic";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Download, FileUp, Plus, Trash2 } from "lucide-react";
import { WebHIDPanel } from "@/components/driver/WebHIDPanel";
import { PageShell } from "@/components/v2/PageShell";
import type {
  KeyboardDriverConfig,
  KeyMapping,
  Macro,
  RGBConfig,
  RGBMode,
} from "@/types/driver";
import type {
  BuildCustomization,
  BuildPartsSelection,
  KeyboardLayout,
  PartsByType,
} from "@/types/keyboard";
import { CaseFrame } from "../../components/keyboard/CaseFrame";
import {
  getKeyboardCanvasSize,
  KeyboardCanvas,
} from "../../components/keyboard/KeyboardCanvas";
import { LightingLayer } from "../../components/keyboard/LightingLayer";

const Keyboard3DPreview = dynamic(
  () =>
    import("../../components/keyboard3d/Keyboard3DPreview").then(
      (mod) => mod.Keyboard3DPreview,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[420px] items-center justify-center rounded-md border border-stone-200 bg-white text-sm text-stone-500 shadow-sm">
        正在加载 3D 预览...
      </div>
    ),
  },
);

type PreviewMode = "2d" | "3d";

const layers = [
  { id: 0, label: "Layer 0 默认层" },
  { id: 1, label: "Layer 1 Fn 层" },
  { id: 2, label: "Layer 2 自定义层" },
];

const rgbModes: { value: RGBMode; label: string }[] = [
  { value: "static", label: "Static 常亮" },
  { value: "breathing", label: "Breathing 呼吸" },
  { value: "rainbow", label: "Rainbow 彩虹" },
  { value: "wave", label: "Wave 波浪" },
  { value: "reactive", label: "Reactive 触发" },
];

const keyOptions = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "Space",
  "Enter",
  "Backspace",
  "Esc",
  "Ctrl",
  "Alt",
  "Fn",
  "Volume Up",
  "Volume Down",
  "Play/Pause",
  "Screenshot",
  "↑",
  "←",
  "↓",
  "→",
  "Disabled",
];

const compactLabels: Record<string, string> = {
  Backspace: "Back",
  "Volume Up": "Vol+",
  "Volume Down": "Vol-",
  "Play/Pause": "Play",
  Screenshot: "Shot",
  Disabled: "Off",
};

function defaultRgbConfig(): RGBConfig {
  return {
    enabled: true,
    mode: "static",
    color: "#73D8FF",
    brightness: 72,
    speed: 48,
  };
}

function keyList(layout: KeyboardLayout) {
  return getKeyboardCanvasSize(layout, 1, 0).keys;
}

function defaultAssignedKey(keyId: string, label: string, layer: number) {
  if (layer === 0) {
    return keyId === "Fn" ? "Fn" : label;
  }

  if (layer === 1) {
    const fnDefaults: Record<string, string> = {
      W: "↑",
      A: "←",
      S: "↓",
      D: "→",
      Q: "Volume Down",
      E: "Volume Up",
      R: "Play/Pause",
      P: "Screenshot",
    };

    return fnDefaults[keyId] ?? label;
  }

  return label;
}

function createDefaultMappings(layout: KeyboardLayout): KeyMapping[] {
  return layers.flatMap((layer) =>
    keyList(layout).map((key) => ({
      keyId: key.id,
      label: key.label,
      assignedKey: defaultAssignedKey(key.id, key.label, layer.id),
      layer: layer.id,
    })),
  );
}

function findMapping(mappings: KeyMapping[], keyId: string, layer: number) {
  return mappings.find((mapping) => mapping.keyId === keyId && mapping.layer === layer);
}

function compactKeyLabel(value: string, macros: Macro[]) {
  if (value.startsWith("Macro:")) {
    const macro = macros.find((item) => item.id === value.slice("Macro:".length));
    return macro ? `M:${macro.name.slice(0, 5)}` : "Macro";
  }

  return compactLabels[value] ?? value;
}

function createBuildSelection(parts: PartsByType, templateId: string): BuildPartsSelection {
  const template = parts.keyboard_template.find((item) => item.id === templateId);
  const layout = template?.layout ?? parts.keyboard_template[0]?.layout ?? "65%";

  return {
    templateId: templateId || parts.keyboard_template[0]?.id || "",
    keycapId: parts.keycap[0]?.id ?? "",
    switchId: parts.switch[0]?.id ?? "",
    pcbId: parts.pcb.find((item) => item.compatibleLayouts.includes(layout))?.id ?? parts.pcb[0]?.id ?? "",
    plateId:
      parts.plate.find((item) => item.compatibleLayouts.includes(layout))?.id ??
      parts.plate[0]?.id ??
      "",
    caseId:
      parts.case.find((item) => item.compatibleLayouts.includes(layout))?.id ??
      parts.case[0]?.id ??
      "",
    diffuserId:
      parts.diffuser.find((item) => item.compatibleCaseLayouts.includes(layout))?.id ??
      parts.diffuser[0]?.id ??
      "",
    soundPackId: parts.sound_pack[0]?.id ?? "",
  };
}

function isDriverConfig(value: unknown): value is KeyboardDriverConfig {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as KeyboardDriverConfig;

  return (
    typeof candidate.keyboardId === "string" &&
    typeof candidate.layout === "string" &&
    typeof candidate.activeLayer === "number" &&
    Array.isArray(candidate.keyMappings) &&
    typeof candidate.rgbConfig === "object" &&
    Array.isArray(candidate.macros) &&
    typeof candidate.createdAt === "string"
  );
}

export default function DriverPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [parts, setParts] = useState<PartsByType | null>(null);
  const [message, setMessage] = useState("正在加载键盘驱动数据...");
  const [templateId, setTemplateId] = useState("");
  const [activeLayer, setActiveLayer] = useState(0);
  const [fnPreview, setFnPreview] = useState(false);
  const [fnKeyId, setFnKeyId] = useState("Fn");
  const [selectedKeyId, setSelectedKeyId] = useState("A");
  const [previewMode, setPreviewMode] = useState<PreviewMode>("2d");
  const [keyMappings, setKeyMappings] = useState<KeyMapping[]>([]);
  const [rgbConfig, setRgbConfig] = useState<RGBConfig>(defaultRgbConfig);
  const [macros, setMacros] = useState<Macro[]>([
    { id: "macro-copy-paste", name: "Copy Paste", steps: ["Ctrl+C", "Ctrl+V"] },
  ]);
  const [newMacroName, setNewMacroName] = useState("Copy Paste");
  const [activeMacroId, setActiveMacroId] = useState("macro-copy-paste");
  const [newStep, setNewStep] = useState("Ctrl+C");

  useEffect(() => {
    async function loadParts() {
      try {
        const response = await fetch("/api/parts");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error ?? "读取部件库失败");
        }

        const loadedParts = data.parts as PartsByType;
        const firstTemplate = loadedParts.keyboard_template[0];
        const initialLayout = firstTemplate?.layout ?? "65%";

        setParts(loadedParts);
        setTemplateId(firstTemplate?.id ?? "");
        setKeyMappings(createDefaultMappings(initialLayout));
        setSelectedKeyId(keyList(initialLayout)[0]?.id ?? "A");
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "加载驱动数据失败");
      }
    }

    void loadParts();
  }, []);

  const selectedTemplate = parts?.keyboard_template.find((item) => item.id === templateId);
  const layout = selectedTemplate?.layout ?? "65%";
  const displayLayer = fnPreview ? 1 : activeLayer;
  const selectedMapping = findMapping(keyMappings, selectedKeyId, activeLayer);
  const selectedDisplayMapping = findMapping(keyMappings, selectedKeyId, displayLayer);
  const activeMacro = macros.find((macro) => macro.id === activeMacroId) ?? macros[0];
  const uniqueTemplates = useMemo(
    () =>
      parts?.keyboard_template.filter(
        (template, index, list) =>
          list.findIndex((item) => item.id === template.id) === index,
      ) ?? [],
    [parts],
  );
  const uniqueMacros = useMemo(
    () =>
      macros.filter(
        (macro, index, list) => list.findIndex((item) => item.id === macro.id) === index,
      ),
    [macros],
  );

  const buildSelection = useMemo(() => {
    if (!parts) {
      return null;
    }

    return createBuildSelection(parts, templateId);
  }, [parts, templateId]);

  const keyLabelMap = useMemo(() => {
    const next: Record<string, string> = {};

    for (const mapping of keyMappings) {
      if (mapping.layer === displayLayer) {
        next[mapping.keyId] = compactKeyLabel(mapping.assignedKey, macros);
      }
    }

    return next;
  }, [displayLayer, keyMappings, macros]);

  const customization: BuildCustomization = useMemo(
    () => ({
      selectedKeyId,
      keyColorMap: {},
      defaultKeycapColor: "#F4E9D8",
      legendColor: "#151922",
      caseColor: "#4B5563",
      lightingColor: rgbConfig.color,
      keycapMaterialStyle: "normal",
    }),
    [rgbConfig.color, selectedKeyId],
  );

  function updateTemplate(nextTemplateId: string) {
    if (!parts) {
      return;
    }

    const nextTemplate = parts.keyboard_template.find((item) => item.id === nextTemplateId);
    const nextLayout = nextTemplate?.layout ?? "65%";
    const nextKeys = keyList(nextLayout);

    setTemplateId(nextTemplateId);
    setKeyMappings(createDefaultMappings(nextLayout));
    setSelectedKeyId(nextKeys[0]?.id ?? "A");
    setFnKeyId(nextKeys.some((key) => key.id === "Fn") ? "Fn" : nextKeys[0]?.id ?? "Fn");
    setMessage("已根据新模板重置驱动映射。");
  }

  function updateMapping(keyId: string, layer: number, assignedKey: string) {
    setKeyMappings((current) =>
      current.map((mapping) =>
        mapping.keyId === keyId && mapping.layer === layer
          ? { ...mapping, assignedKey }
          : mapping,
      ),
    );
  }

  function updateFnKey(nextFnKeyId: string) {
    setFnKeyId(nextFnKeyId);
    setKeyMappings((current) =>
      current.map((mapping) =>
        mapping.layer === 0
          ? {
              ...mapping,
              assignedKey:
                mapping.keyId === nextFnKeyId
                  ? "Fn"
                  : mapping.assignedKey === "Fn"
                    ? mapping.label
                    : mapping.assignedKey,
            }
          : mapping,
      ),
    );
  }

  function createMacro() {
    const trimmedName = newMacroName.trim();

    if (!trimmedName) {
      setMessage("宏名称不能为空。");
      return;
    }

    const macro: Macro = {
      id: `macro-${Date.now()}`,
      name: trimmedName,
      steps: [],
    };

    setMacros((current) => [...current, macro]);
    setActiveMacroId(macro.id);
    setNewMacroName("");
    setMessage(`已创建宏：${macro.name}`);
  }

  function addMacroStep() {
    const trimmedStep = newStep.trim();

    if (!activeMacro || !trimmedStep) {
      return;
    }

    setMacros((current) =>
      current.map((macro) =>
        macro.id === activeMacro.id
          ? { ...macro, steps: [...macro.steps, trimmedStep] }
          : macro,
      ),
    );
    setNewStep("");
  }

  function deleteMacroStep(index: number) {
    if (!activeMacro) {
      return;
    }

    setMacros((current) =>
      current.map((macro) =>
        macro.id === activeMacro.id
          ? { ...macro, steps: macro.steps.filter((_, stepIndex) => stepIndex !== index) }
          : macro,
      ),
    );
  }

  function bindMacroToSelectedKey() {
    if (!activeMacro) {
      return;
    }

    updateMapping(selectedKeyId, activeLayer, `Macro:${activeMacro.id}`);
  }

  function exportConfig() {
    if (!selectedTemplate) {
      setMessage("没有可导出的键盘模板。");
      return;
    }

    const config: KeyboardDriverConfig = {
      keyboardId: selectedTemplate.id,
      layout,
      activeLayer,
      fnKeyId,
      keyMappings,
      rgbConfig,
      macros,
      createdAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${selectedTemplate.name}-driver-config.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("已导出驱动配置 JSON。");
  }

  async function importConfig(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as unknown;

      if (!isDriverConfig(parsed)) {
        throw new Error("JSON 格式不符合 KeyboardDriverConfig。");
      }

      const imported = parsed as KeyboardDriverConfig;
      const compatibleTemplate = parts?.keyboard_template.find(
        (item) => item.id === imported.keyboardId || item.layout === imported.layout,
      );

      if (compatibleTemplate) {
        setTemplateId(compatibleTemplate.id);
      }

      setActiveLayer(Math.min(Math.max(imported.activeLayer, 0), 2));
      setFnPreview(false);
      setFnKeyId(imported.fnKeyId ?? "Fn");
      setKeyMappings(imported.keyMappings);
      setRgbConfig(imported.rgbConfig);
      setMacros(imported.macros);
      setActiveMacroId(imported.macros[0]?.id ?? "");
      setSelectedKeyId(imported.keyMappings[0]?.keyId ?? "A");
      setMessage("已导入驱动配置。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "导入配置失败。");
    }
  }

  if (!parts || !buildSelection) {
    return (
      <PageShell
        description="第一阶段只做网页端键位、Fn、RGB、宏和 JSON 导入导出，不连接实体键盘。"
        title="键盘驱动配置"
      >
        <p className="rounded-md bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
          {message}
        </p>
      </PageShell>
    );
  }

  return (
    <PageShell
      description="网页端驱动配置原型：编辑键位映射、Fn 层、RGB 灯效和宏，并导入/导出 JSON。"
      title="键盘驱动配置"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
              <label>
                <span className="mb-1 block text-sm font-semibold text-ink">键盘模板</span>
                <select
                  className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                  onChange={(event) => updateTemplate(event.target.value)}
                  value={templateId}
                >
                  {uniqueTemplates.map((template, index) => (
                    <option key={`driver-template-${template.id}-${index}`} value={template.id}>
                      {template.name} / {template.layout}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="mb-1 block text-sm font-semibold text-ink">预览模式</span>
                <select
                  className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                  onChange={(event) => setPreviewMode(event.target.value as PreviewMode)}
                  value={previewMode}
                >
                  <option value="2d">2D 映射预览</option>
                  <option value="3d">3D 外观预览</option>
                </select>
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {layers.map((layer, index) => (
                <button
                  className={[
                    "rounded-md border px-3 py-2 text-sm font-semibold transition",
                    activeLayer === layer.id
                      ? "border-ink bg-ink text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:border-ink",
                  ].join(" ")}
                  key={`driver-layer-${layer.id}-${index}`}
                  onClick={() => {
                    setActiveLayer(layer.id);
                    setFnPreview(false);
                  }}
                  type="button"
                >
                  {layer.label}
                </button>
              ))}

              <label className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-700">
                <input
                  checked={fnPreview}
                  className="h-4 w-4"
                  onChange={(event) => setFnPreview(event.target.checked)}
                  type="checkbox"
                />
                按住 Fn 预览 Layer 1
              </label>
            </div>
          </section>

          {previewMode === "2d" ? (
            <section className="rounded-md border border-stone-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-4">
                <div>
                  <h2 className="text-base font-semibold text-ink">键位映射预览</h2>
                  <p className="mt-1 text-sm text-stone-500">
                    当前显示：Layer {displayLayer} / 选中键：{selectedKeyId}
                  </p>
                </div>
                <span className="rounded-md bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700">
                  点击任意键进行映射
                </span>
              </div>
              <div className="overflow-x-auto bg-stone-50 p-4">
                {(() => {
                  const unit = 42;
                  const padding = 20;
                  const { width, height } = getKeyboardCanvasSize(layout, unit, padding);

                  return (
                    <CaseFrame color="#4B5563" height={height} incompatible={false} width={width}>
                      <LightingLayer color={rgbConfig.color} enabled={rgbConfig.enabled} />
                      <KeyboardCanvas
                        accentColor="#2F6F73"
                        gap={4}
                        keyColor="#F4E9D8"
                        keyColorMap={{}}
                        keyLabelMap={keyLabelMap}
                        layout={layout}
                        lightingColor={rgbConfig.color}
                        lightingEnabled={rgbConfig.enabled}
                        materialStyle="normal"
                        onKeyPress={setSelectedKeyId}
                        selectedKeyId={selectedKeyId}
                        textColor="#151922"
                        unit={unit}
                      />
                    </CaseFrame>
                  );
                })()}
              </div>
            </section>
          ) : (
            <Keyboard3DPreview
              build={buildSelection}
              compatibility={{ compatible: true, errors: [], warnings: [] }}
              customization={customization}
              onKeySelect={setSelectedKeyId}
              parts={parts}
            />
          )}
        </div>

        <aside className="space-y-5">
          <WebHIDPanel
            rgbConfig={rgbConfig}
            selectedKeyId={selectedKeyId}
            onRGBConfigChange={setRgbConfig}
          />

          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-ink">键位映射</h2>
            <p className="mb-3 text-sm text-stone-500">
              当前选中：{selectedKeyId} / 当前编辑：Layer {activeLayer}
            </p>

            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">按键功能</span>
              <select
                className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                onChange={(event) =>
                  updateMapping(selectedKeyId, activeLayer, event.target.value)
                }
                value={selectedMapping?.assignedKey ?? ""}
              >
                {keyOptions.map((option, index) => (
                  <option key={`key-option-${option}-${index}`} value={option}>
                    {option}
                  </option>
                ))}
                {uniqueMacros.map((macro, index) => (
                  <option key={`mapping-macro-${macro.id}-${index}`} value={`Macro:${macro.id}`}>
                    Macro: {macro.name}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-3 rounded-md bg-stone-50 p-3 text-sm text-stone-600">
              当前显示层功能：
              <span className="ml-1 font-semibold text-ink">
                {selectedDisplayMapping?.assignedKey ?? "未配置"}
              </span>
            </div>
          </section>

          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-ink">Fn 层配置</h2>
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">Fn 键</span>
              <select
                className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                onChange={(event) => updateFnKey(event.target.value)}
                value={fnKeyId}
              >
                {keyList(layout).map((key, index) => (
                  <option key={`fn-key-${layout}-${key.id}-${key.x}-${key.y}-${index}`} value={key.id}>
                    {key.label} ({key.id})
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-stone-600">
              <span className="rounded bg-stone-50 px-2 py-1">Fn + W = ↑</span>
              <span className="rounded bg-stone-50 px-2 py-1">Fn + A = ←</span>
              <span className="rounded bg-stone-50 px-2 py-1">Fn + S = ↓</span>
              <span className="rounded bg-stone-50 px-2 py-1">Fn + D = →</span>
            </div>
          </section>

          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-ink">RGB 灯效配置</h2>
            <label className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-ink">
              <input
                checked={rgbConfig.enabled}
                className="h-4 w-4"
                onChange={(event) =>
                  setRgbConfig((current) => ({ ...current, enabled: event.target.checked }))
                }
                type="checkbox"
              />
              启用 RGB
            </label>
            <div className="grid gap-3">
              <label>
                <span className="mb-1 block text-sm font-semibold text-ink">灯效模式</span>
                <select
                  className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm"
                  onChange={(event) =>
                    setRgbConfig((current) => ({
                      ...current,
                      mode: event.target.value as RGBMode,
                    }))
                  }
                  value={rgbConfig.mode}
                >
                  {rgbModes.map((mode, index) => (
                    <option key={`rgb-mode-${mode.value}-${index}`} value={mode.value}>
                      {mode.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-sm font-semibold text-ink">颜色</span>
                <input
                  className="h-10 w-full rounded-md border border-stone-300 bg-white p-1"
                  onChange={(event) =>
                    setRgbConfig((current) => ({ ...current, color: event.target.value }))
                  }
                  type="color"
                  value={rgbConfig.color}
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-semibold text-ink">
                  亮度：{rgbConfig.brightness}
                </span>
                <input
                  className="w-full"
                  max={100}
                  min={0}
                  onChange={(event) =>
                    setRgbConfig((current) => ({
                      ...current,
                      brightness: Number(event.target.value),
                    }))
                  }
                  type="range"
                  value={rgbConfig.brightness}
                />
              </label>
              <label>
                <span className="mb-1 block text-sm font-semibold text-ink">
                  速度：{rgbConfig.speed}
                </span>
                <input
                  className="w-full"
                  max={100}
                  min={0}
                  onChange={(event) =>
                    setRgbConfig((current) => ({
                      ...current,
                      speed: Number(event.target.value),
                    }))
                  }
                  type="range"
                  value={rgbConfig.speed}
                />
              </label>
            </div>
          </section>

          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-ink">宏配置</h2>
            <div className="flex gap-2">
              <input
                className="h-10 min-w-0 flex-1 rounded-md border border-stone-300 px-3 text-sm"
                onChange={(event) => setNewMacroName(event.target.value)}
                placeholder="宏名称"
                value={newMacroName}
              />
              <button
                className="inline-flex h-10 items-center gap-1 rounded-md bg-ink px-3 text-sm font-semibold text-white"
                onClick={createMacro}
                type="button"
              >
                <Plus className="h-4 w-4" />
                创建
              </button>
            </div>

            {macros.length > 0 ? (
              <label className="mt-3 block">
                <span className="mb-1 block text-sm font-semibold text-ink">当前宏</span>
                <select
                  className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm"
                  onChange={(event) => setActiveMacroId(event.target.value)}
                  value={activeMacro?.id ?? ""}
                >
                  {uniqueMacros.map((macro, index) => (
                    <option key={`active-macro-${macro.id}-${index}`} value={macro.id}>
                      {macro.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className="mt-3 flex gap-2">
              <input
                className="h-10 min-w-0 flex-1 rounded-md border border-stone-300 px-3 text-sm"
                onChange={(event) => setNewStep(event.target.value)}
                placeholder="例如 Ctrl+C"
                value={newStep}
              />
              <button
                className="h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-ink"
                disabled={!activeMacro}
                onClick={addMacroStep}
                type="button"
              >
                添加步骤
              </button>
            </div>

            <div className="mt-3 space-y-2">
              {(activeMacro?.steps ?? []).map((step, index) => (
                <div
                  className="flex items-center justify-between gap-2 rounded-md bg-stone-50 px-3 py-2 text-sm"
                  key={`macro-step-${activeMacro?.id ?? "none"}-${index}`}
                >
                  <span>{step}</span>
                  <button
                    aria-label={`删除步骤 ${step}`}
                    className="text-stone-500 hover:text-rose-600"
                    onClick={() => deleteMacroStep(index)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <button
              className="mt-3 h-10 w-full rounded-md border border-stone-300 px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!activeMacro}
              onClick={bindMacroToSelectedKey}
              type="button"
            >
              绑定宏到当前键
            </button>
          </section>

          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-ink">配置导入 / 导出</h2>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white"
                onClick={exportConfig}
                type="button"
              >
                <Download className="h-4 w-4" />
                导出配置
              </button>
              <button
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-4 text-sm font-semibold text-ink"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <FileUp className="h-4 w-4" />
                导入配置
              </button>
            </div>
            <input
              accept="application/json,.json"
              className="hidden"
              onChange={importConfig}
              ref={fileInputRef}
              type="file"
            />
            {message ? (
              <p className="mt-3 rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-700">
                {message}
              </p>
            ) : null}
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
