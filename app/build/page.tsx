"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { Save } from "lucide-react";
import { KeyboardPreview } from "../../components/keyboard/KeyboardPreview";
import { CompatibilityPanel } from "@/components/v2/CompatibilityPanel";
import { PageShell } from "@/components/v2/PageShell";
import { PartSelect } from "@/components/v2/PartSelect";
import { checkBuildCompatibility } from "@/lib/compatibility";
import type {
  BuildCustomization,
  BuildPartsSelection,
  KeyboardBuild,
  KeyboardPart,
  KeycapMaterialStyle,
  PartsByType,
} from "@/types/keyboard";

type PreviewMode = "2d" | "3d";

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

const materialStyleLabels: Record<KeycapMaterialStyle, string> = {
  normal: "普通不透光",
  black_translucent: "黑透",
  white_translucent: "白透",
};

function defaultSelection(parts: PartsByType): BuildPartsSelection {
  return {
    templateId: parts.keyboard_template[0]?.id ?? "",
    keycapId: parts.keycap[0]?.id ?? "",
    switchId: parts.switch[0]?.id ?? "",
    pcbId: parts.pcb[0]?.id ?? "",
    plateId: parts.plate[0]?.id ?? "",
    caseId: parts.case[0]?.id ?? "",
    diffuserId: parts.diffuser[0]?.id ?? "",
    soundPackId: parts.sound_pack[0]?.id ?? "",
  };
}

function findPart(parts: PartsByType, id: string): KeyboardPart | undefined {
  return Object.values(parts)
    .flat()
    .find((part) => part.id === id);
}

function findSelectedKeyLabel(keyId: string | undefined) {
  return keyId || "未选择";
}

export default function BuildPage() {
  const [parts, setParts] = useState<PartsByType | null>(null);
  const [selection, setSelection] = useState<BuildPartsSelection | null>(null);
  const [buildName, setBuildName] = useState("我的第一把客制化键盘");
  const [builds, setBuilds] = useState<KeyboardBuild[]>([]);
  const [message, setMessage] = useState("正在加载配置数据...");
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("3d");
  const [selectedKeyId, setSelectedKeyId] = useState<string | undefined>();
  const [keyColorMap, setKeyColorMap] = useState<Record<string, string>>({});
  const [defaultKeycapColor, setDefaultKeycapColor] = useState("#F4E9D8");
  const [legendColor, setLegendColor] = useState("#151922");
  const [caseColor, setCaseColor] = useState("#4B5563");
  const [lightingColor, setLightingColor] = useState("#73D8FF");
  const [keycapMaterialStyle, setKeycapMaterialStyle] =
    useState<KeycapMaterialStyle>("normal");

  useEffect(() => {
    async function loadData() {
      try {
        const [partsResponse, buildsResponse] = await Promise.all([
          fetch("/api/parts"),
          fetch("/api/builds"),
        ]);
        const partsData = await partsResponse.json();
        const buildsData = await buildsResponse.json();

        if (!partsResponse.ok) {
          throw new Error(partsData.error ?? "读取部件库失败");
        }

        if (!buildsResponse.ok) {
          throw new Error(buildsData.error ?? "读取保存配置失败");
        }

        const loadedParts = partsData.parts as PartsByType;
        const initialSelection = defaultSelection(loadedParts);
        const initialCase = loadedParts.case.find((item) => item.id === initialSelection.caseId);
        const initialDiffuser = loadedParts.diffuser.find(
          (item) => item.id === initialSelection.diffuserId,
        );

        setParts(loadedParts);
        setSelection(initialSelection);
        setBuilds(buildsData.builds);
        setCaseColor(initialCase?.color ?? "#4B5563");
        setLightingColor(initialDiffuser?.color === "warm-white" ? "#FFE6B7" : "#73D8FF");
        setKeycapMaterialStyle(
          loadedParts.keycap.find((item) => item.id === initialSelection.keycapId)
            ?.materialStyle ?? "normal",
        );
        setMessage("");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "加载失败");
      }
    }

    void loadData();
  }, []);

  const customization: BuildCustomization = useMemo(
    () => ({
      selectedKeyId,
      keyColorMap,
      defaultKeycapColor,
      legendColor,
      caseColor,
      lightingColor,
      keycapMaterialStyle,
    }),
    [
      selectedKeyId,
      keyColorMap,
      defaultKeycapColor,
      legendColor,
      caseColor,
      lightingColor,
      keycapMaterialStyle,
    ],
  );

  const compatibility = useMemo(() => {
    if (!parts || !selection) {
      return { compatible: false, errors: ["配置数据尚未加载"], warnings: [] };
    }

    return checkBuildCompatibility(selection, parts);
  }, [parts, selection]);

  function updateSelection<K extends keyof BuildPartsSelection>(
    key: K,
    value: BuildPartsSelection[K],
  ) {
    setSelection((current) => (current ? { ...current, [key]: value } : current));

    if (key === "caseId" && parts) {
      const nextCase = parts.case.find((item) => item.id === value);
      setCaseColor(nextCase?.color ?? caseColor);
    }

    if (key === "diffuserId" && parts) {
      const nextDiffuser = parts.diffuser.find((item) => item.id === value);
      setLightingColor(nextDiffuser?.color === "warm-white" ? "#FFE6B7" : "#73D8FF");
    }

    if (key === "keycapId" && parts) {
      const nextKeycap = parts.keycap.find((item) => item.id === value);
      setKeycapMaterialStyle(nextKeycap?.materialStyle ?? "normal");
    }
  }

  function updateSelectedKeyColor(color: string) {
    if (!selectedKeyId) {
      return;
    }

    setKeyColorMap((current) => ({ ...current, [selectedKeyId]: color }));
  }

  function resetSelectedKeyColor() {
    if (!selectedKeyId) {
      return;
    }

    setKeyColorMap((current) => {
      const next = { ...current };
      delete next[selectedKeyId];
      return next;
    });
  }

  async function handleSave() {
    if (!selection) {
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/builds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...selection, ...customization, name: buildName }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "保存失败");
      }

      setBuilds((current) => [data.build, ...current]);
      setMessage(`已保存配置：${data.build.name}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "保存失败");
    } finally {
      setSaving(false);
    }
  }

  if (!parts || !selection) {
    return (
      <PageShell
        description="用户可以选择模板和部件，系统自动检测兼容性，并保存配置。"
        title="键盘配置"
      >
        <p className="rounded-md bg-white px-4 py-3 text-sm text-stone-600 shadow-sm">
          {message}
        </p>
      </PageShell>
    );
  }

  const selectedParts = [
    selection.templateId,
    selection.keycapId,
    selection.switchId,
    selection.pcbId,
    selection.plateId,
    selection.caseId,
    selection.diffuserId,
    selection.soundPackId,
  ]
    .map((id) => findPart(parts, id))
    .filter(Boolean) as KeyboardPart[];
  const dedupedSelectedParts = selectedParts.filter(
    (part, index, list) =>
      list.findIndex((item) => item.type === part.type && item.id === part.id) === index,
  );
  const uniqueBuilds = builds.filter(
    (build, index, list) =>
      list.findIndex(
        (item) => item.id === build.id && item.createdAt === build.createdAt,
      ) === index,
  );

  return (
    <PageShell
      description="选择部件后，2D/3D 预览实时变化；可以编辑整套颜色，也可以给每个键单独上色。"
      title="键盘配置"
    >
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
        <div className="space-y-5">
          <div className="flex w-fit rounded-md border border-stone-200 bg-white p-1 shadow-sm">
            <button
              className={[
                "rounded px-3 py-2 text-sm font-semibold transition",
                previewMode === "2d" ? "bg-ink text-white" : "text-stone-600 hover:bg-stone-100",
              ].join(" ")}
              onClick={() => setPreviewMode("2d")}
              type="button"
            >
              2D 预览
            </button>
            <button
              className={[
                "rounded px-3 py-2 text-sm font-semibold transition",
                previewMode === "3d" ? "bg-ink text-white" : "text-stone-600 hover:bg-stone-100",
              ].join(" ")}
              onClick={() => setPreviewMode("3d")}
              type="button"
            >
              3D 预览
            </button>
          </div>

          {previewMode === "3d" ? (
            <Keyboard3DPreview
              build={selection}
              compatibility={compatibility}
              customization={customization}
              onKeySelect={setSelectedKeyId}
              parts={parts}
            />
          ) : (
            <KeyboardPreview
              build={selection}
              compatibility={compatibility}
              customization={customization}
              onKeySelect={setSelectedKeyId}
              parts={parts}
            />
          )}

          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <div className="mb-4">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink">配置名称</span>
                <input
                  className="h-10 w-full rounded-md border border-stone-300 px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                  onChange={(event) => setBuildName(event.target.value)}
                  value={buildName}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <PartSelect
                label="键盘模板"
                onChange={(value) => updateSelection("templateId", value)}
                parts={parts.keyboard_template}
                value={selection.templateId}
              />
              <PartSelect
                label="键帽"
                onChange={(value) => updateSelection("keycapId", value)}
                parts={parts.keycap}
                value={selection.keycapId}
              />
              <PartSelect
                label="轴体"
                onChange={(value) => updateSelection("switchId", value)}
                parts={parts.switch}
                value={selection.switchId}
              />
              <PartSelect
                label="PCB"
                onChange={(value) => updateSelection("pcbId", value)}
                parts={parts.pcb}
                value={selection.pcbId}
              />
              <PartSelect
                label="定位板"
                onChange={(value) => updateSelection("plateId", value)}
                parts={parts.plate}
                value={selection.plateId}
              />
              <PartSelect
                label="外壳"
                onChange={(value) => updateSelection("caseId", value)}
                parts={parts.case}
                value={selection.caseId}
              />
              <PartSelect
                label="均光板"
                onChange={(value) => updateSelection("diffuserId", value)}
                parts={parts.diffuser}
                value={selection.diffuserId}
              />
              <PartSelect
                label="声音包"
                onChange={(value) => updateSelection("soundPackId", value)}
                parts={parts.sound_pack}
                value={selection.soundPackId}
              />
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-ink">颜色与材质</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink">默认键帽颜色</span>
                <input
                  className="h-10 w-full rounded-md border border-stone-300 bg-white p-1"
                  onChange={(event) => setDefaultKeycapColor(event.target.value)}
                  type="color"
                  value={defaultKeycapColor}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink">字符颜色</span>
                <input
                  className="h-10 w-full rounded-md border border-stone-300 bg-white p-1"
                  onChange={(event) => setLegendColor(event.target.value)}
                  type="color"
                  value={legendColor}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink">外壳颜色</span>
                <input
                  className="h-10 w-full rounded-md border border-stone-300 bg-white p-1"
                  onChange={(event) => setCaseColor(event.target.value)}
                  type="color"
                  value={caseColor}
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-semibold text-ink">灯光颜色</span>
                <input
                  className="h-10 w-full rounded-md border border-stone-300 bg-white p-1"
                  onChange={(event) => setLightingColor(event.target.value)}
                  type="color"
                  value={lightingColor}
                />
              </label>
              <label className="block sm:col-span-2 xl:col-span-1">
                <span className="mb-1 block text-sm font-semibold text-ink">键帽材质</span>
                <select
                  className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                  onChange={(event) =>
                    setKeycapMaterialStyle(event.target.value as KeycapMaterialStyle)
                  }
                  value={keycapMaterialStyle}
                >
                  {Object.entries(materialStyleLabels).map(([value, label], index) => (
                    <option key={`material-style-${value}-${index}`} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-ink">单键颜色编辑</h2>
            <p className="mb-3 text-sm text-stone-500">
              当前选中：{findSelectedKeyLabel(selectedKeyId)}
            </p>
            <input
              className="h-10 w-full rounded-md border border-stone-300 bg-white p-1 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedKeyId}
              onChange={(event) => updateSelectedKeyColor(event.target.value)}
              type="color"
              value={selectedKeyId ? keyColorMap[selectedKeyId] ?? defaultKeycapColor : defaultKeycapColor}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              {["#ff4d4f", "#111111", "#ffffff", "#73D8FF"].map((color, index) => (
                <button
                  aria-label={`设置选中键颜色 ${color}`}
                  className="h-8 w-8 rounded-full border border-black/10 transition hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!selectedKeyId}
                  key={`selected-key-color-${index}-${color}`}
                  onClick={() => updateSelectedKeyColor(color)}
                  style={{ backgroundColor: color }}
                  type="button"
                />
              ))}
            </div>
            <button
              className="mt-3 h-9 w-full rounded-md border border-stone-300 bg-white px-3 text-sm font-semibold text-ink transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!selectedKeyId}
              onClick={resetSelectedKeyColor}
              type="button"
            >
              恢复默认颜色
            </button>
          </section>

          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-ink">当前配置</h2>
            <div className="space-y-2">
              {dedupedSelectedParts.map((part, index) => (
                <div
                  className="flex items-center justify-between gap-3 rounded-md bg-stone-50 px-3 py-2 text-sm"
                  key={`selected-part-${part.type}-${part.id}-${index}`}
                >
                  <span className="text-stone-500">{part.type}</span>
                  <span className="font-semibold text-ink">{part.name}</span>
                </div>
              ))}
            </div>
          </section>

          <CompatibilityPanel result={compatibility} />

          <button
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!compatibility.compatible || saving}
            onClick={handleSave}
            type="button"
          >
            <Save className="h-4 w-4" />
            {saving ? "保存中" : "保存配置"}
          </button>

          {message ? (
            <p className="rounded-md bg-white px-3 py-2 text-sm text-stone-700 shadow-sm">
              {message}
            </p>
          ) : null}

          <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-base font-semibold text-ink">已保存配置</h2>
            {builds.length === 0 ? (
              <p className="text-sm text-stone-500">暂无保存记录。</p>
            ) : (
              <div className="space-y-2">
                {uniqueBuilds.map((build, index) => (
                  <div
                    className="rounded-md bg-stone-50 px-3 py-2 text-sm"
                    key={`saved-build-${build.id}-${index}`}
                  >
                    <div className="font-semibold text-ink">{build.name}</div>
                    <div className="mt-1 text-xs text-stone-500">
                      {new Date(build.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
