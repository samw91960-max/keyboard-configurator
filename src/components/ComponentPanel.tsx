import { Palette, RotateCcw, SlidersHorizontal, Volume2 } from "lucide-react";
import type {
  BuildSelection,
  DiffuserOption,
  KeyboardKey,
  KeyboardTemplate,
  PerKeyCustomization,
  PartsCatalog,
} from "../types/domain";
import {
  getPartCompatibilityReasons,
  isPartCompatible,
  type PartType,
} from "../utils/compatibility";
import { PartOptionCard } from "./PartOptionCard";

interface ComponentPanelProps {
  catalog: PartsCatalog;
  selection: BuildSelection;
  template: KeyboardTemplate;
  selectedKey: KeyboardKey;
  selectedKeyCustomization: PerKeyCustomization;
  onChange: <K extends keyof BuildSelection>(key: K, value: BuildSelection[K]) => void;
  onKeyCustomizationChange: (keyId: string, customization: PerKeyCustomization) => void;
  onResetKeyCustomization: (keyId: string) => void;
  onAudition: () => void;
}

function firstReason(
  template: KeyboardTemplate,
  part: Parameters<typeof getPartCompatibilityReasons>[1],
  partType: PartType,
): string | undefined {
  return getPartCompatibilityReasons(template, part, partType)[0];
}

function uniqueById<T extends { id: string }>(items: T[]) {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }

    seen.add(item.id);
    return true;
  });
}

export function ComponentPanel({
  catalog,
  selection,
  template,
  selectedKey,
  selectedKeyCustomization,
  onChange,
  onKeyCustomizationChange,
  onResetKeyCustomization,
  onAudition,
}: ComponentPanelProps) {
  const selectedKeycap = catalog.keycaps.find((keycap) => keycap.id === selection.keycapId) ?? catalog.keycaps[0];
  const selectedKeyIndex = template.keys.findIndex((key) => key.id === selectedKey.id);
  const selectedKeyUsesAccent =
    selectedKeyIndex % 11 === 0 ||
    selectedKey.label === "Esc" ||
    selectedKey.label.includes("Enter");
  const defaultKeyColor = selectedKeyUsesAccent ? selectedKeycap.accentColor : selectedKeycap.color;
  const activeKeyColor = selectedKeyCustomization.keycapColor ?? defaultKeyColor;
  const activeSwitchId = selectedKeyCustomization.switchId ?? selection.switchId;
  const keycaps = uniqueById(catalog.keycaps);
  const switches = uniqueById(catalog.switches);
  const pcbs = uniqueById(catalog.pcbs);
  const plates = uniqueById(catalog.plates);
  const cases = uniqueById(catalog.cases);
  const diffusers = uniqueById(catalog.diffusers);
  const soundPacks = uniqueById(catalog.soundPacks);

  return (
    <aside className="space-y-4">
      <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">部件选择</h2>
            <p className="mt-1 text-sm text-stone-500">不兼容部件会锁定并显示原因。</p>
          </div>
          <SlidersHorizontal className="h-5 w-5 text-stone-500" />
        </div>

        <div className="space-y-5">
          <div className="rounded-md border border-stone-200 bg-stone-50 p-3">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-ink">单键自定义</h3>
                <p className="mt-1 text-xs leading-5 text-stone-500">
                  当前按键：{selectedKey.label}。点击预览区任意按键可切换。
                </p>
              </div>
              <button
                className="inline-flex h-8 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-xs font-semibold text-ink transition hover:bg-stone-100"
                onClick={() => onResetKeyCustomization(selectedKey.id)}
                type="button"
              >
                <RotateCcw className="h-4 w-4" />
                重置
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-stone-700">
                  <Palette className="h-4 w-4" />
                  键帽颜色
                </div>
                <div className="flex items-center gap-3">
                  <input
                    aria-label="单键键帽颜色"
                    className="h-10 w-14 cursor-pointer rounded-md border border-stone-300 bg-white p-1"
                    onChange={(event) =>
                      onKeyCustomizationChange(selectedKey.id, {
                        ...selectedKeyCustomization,
                        keycapColor: event.target.value,
                      })
                    }
                    type="color"
                    value={activeKeyColor}
                  />
                  <div className="flex flex-wrap gap-2">
                    {[selectedKeycap.color, selectedKeycap.accentColor, "#F8FAFC", "#1F2937"].map((color, index) => (
                      <button
                        aria-label={`设置颜色 ${color}`}
                        className="h-8 w-8 rounded-full border border-black/10 transition hover:scale-105"
                        key={`key-color-swatch-${index}-${color}`}
                        onClick={() =>
                          onKeyCustomizationChange(selectedKey.id, {
                            ...selectedKeyCustomization,
                            keycapColor: color,
                          })
                        }
                        style={{ backgroundColor: color }}
                        type="button"
                      />
                    ))}
                    <button
                      className="h-8 rounded-md border border-stone-300 bg-white px-3 text-xs font-semibold text-stone-700 transition hover:bg-stone-100"
                      onClick={() =>
                        onKeyCustomizationChange(selectedKey.id, {
                          ...selectedKeyCustomization,
                          keycapColor: undefined,
                        })
                      }
                      type="button"
                    >
                      默认色
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-xs font-semibold text-stone-700">单键轴体</h4>
                <div className="space-y-2">
                  <button
                    className={[
                      "w-full rounded-md border px-3 py-2 text-left text-xs font-semibold transition",
                      selectedKeyCustomization.switchId
                        ? "border-stone-300 bg-white text-stone-700 hover:bg-stone-100"
                        : "border-ink bg-ink text-white",
                    ].join(" ")}
                    onClick={() =>
                      onKeyCustomizationChange(selectedKey.id, {
                        ...selectedKeyCustomization,
                        switchId: undefined,
                      })
                    }
                    type="button"
                  >
                    使用默认轴体
                  </button>
                  {switches.map((switchOption, index) => (
                    <button
                      className={[
                        "w-full rounded-md border px-3 py-2 text-left text-xs transition",
                        activeSwitchId === switchOption.id && selectedKeyCustomization.switchId === switchOption.id
                          ? "border-ink bg-white font-semibold text-ink shadow-sm"
                          : "border-stone-200 bg-white text-stone-600 hover:bg-stone-100",
                      ].join(" ")}
                      key={`per-key-switch-${switchOption.id}-${index}`}
                      onClick={() =>
                        onKeyCustomizationChange(selectedKey.id, {
                          ...selectedKeyCustomization,
                          switchId: switchOption.id,
                        })
                      }
                      type="button"
                    >
                      {switchOption.name} · {switchOption.forceGf} gf · {switchOption.soundType}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">键帽</h3>
            <div className="space-y-2">
              {keycaps.map((keycap, index) => (
                <PartOptionCard
                  active={selection.keycapId === keycap.id}
                  compatible={isPartCompatible(template, keycap, "keycap")}
                  key={`keycap-${keycap.id}-${index}`}
                  meta={`${keycap.material} · ${keycap.legendStyle}`}
                  onSelect={() => onChange("keycapId", keycap.id)}
                  reason={firstReason(template, keycap, "keycap")}
                  swatchColor={keycap.color}
                  title={keycap.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">轴体</h3>
            <div className="space-y-2">
              {switches.map((switchOption, index) => (
                <PartOptionCard
                  active={selection.switchId === switchOption.id}
                  compatible
                  key={`switch-${switchOption.id}-${index}`}
                  meta={`${switchOption.kind} · ${switchOption.forceGf} gf · ${switchOption.soundType}`}
                  onSelect={() => onChange("switchId", switchOption.id)}
                  title={switchOption.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">PCB</h3>
            <div className="space-y-2">
              {pcbs.map((pcb, index) => (
                <PartOptionCard
                  active={selection.pcbId === pcb.id}
                  compatible={isPartCompatible(template, pcb, "pcb")}
                  key={`pcb-${pcb.id}-${index}`}
                  meta={`${pcb.mount === "hot-swap" ? "热插拔" : "焊接"} · ${
                    pcb.rgb ? "RGB" : "无 RGB"
                  }`}
                  onSelect={() => onChange("pcbId", pcb.id)}
                  reason={firstReason(template, pcb, "pcb")}
                  title={pcb.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">定位板</h3>
            <div className="space-y-2">
              {plates.map((plate, index) => (
                <PartOptionCard
                  active={selection.plateId === plate.id}
                  compatible={isPartCompatible(template, plate, "plate")}
                  key={`plate-${plate.id}-${index}`}
                  meta={plate.material}
                  onSelect={() => onChange("plateId", plate.id)}
                  reason={firstReason(template, plate, "plate")}
                  title={plate.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">外壳</h3>
            <div className="space-y-2">
              {cases.map((keyboardCase, index) => (
                <PartOptionCard
                  active={selection.caseId === keyboardCase.id}
                  compatible={isPartCompatible(template, keyboardCase, "case")}
                  key={`case-${keyboardCase.id}-${index}`}
                  meta={keyboardCase.caseType}
                  onSelect={() => onChange("caseId", keyboardCase.id)}
                  reason={firstReason(template, keyboardCase, "case")}
                  swatchColor={keyboardCase.color}
                  title={keyboardCase.name}
                />
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-2 text-sm font-semibold text-ink">均光板</h3>
            <div className="space-y-2">
              {diffusers.map((diffuser: DiffuserOption, index) => (
                <PartOptionCard
                  active={selection.diffuserId === diffuser.id}
                  compatible={isPartCompatible(template, diffuser, "diffuser")}
                  key={`diffuser-${diffuser.id}-${index}`}
                  meta={diffuser.enabled ? "开启灯光扩散" : "无灯光扩散"}
                  onSelect={() => onChange("diffuserId", diffuser.id)}
                  reason={firstReason(template, diffuser, "diffuser")}
                  swatchColor={diffuser.enabled ? diffuser.color : undefined}
                  title={diffuser.name}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-ink">声音包</h3>
              <button
                className="inline-flex h-8 items-center gap-2 rounded-md border border-stone-300 bg-white px-3 text-xs font-semibold text-ink transition hover:bg-stone-100"
                onClick={onAudition}
                type="button"
              >
                <Volume2 className="h-4 w-4" />
                试听
              </button>
            </div>
            <div className="space-y-2">
              {soundPacks.map((soundPack, index) => (
                <PartOptionCard
                  active={selection.soundPackId === soundPack.id}
                  compatible
                  key={`sound-pack-${soundPack.id}-${index}`}
                  meta={`${soundPack.kind} · ${soundPack.description}`}
                  onSelect={() => onChange("soundPackId", soundPack.id)}
                  title={soundPack.name}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </aside>
  );
}
