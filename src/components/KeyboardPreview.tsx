import { Box, MousePointerClick, Volume2 } from "lucide-react";
import type {
  CaseOption,
  DiffuserOption,
  KeyboardTemplate,
  KeycapSet,
  PerKeyCustomizations,
  PcbOption,
  PlateOption,
  SoundPack,
  SwitchOption,
} from "../types/domain";
import { readableTextColor, withAlpha } from "../utils/color";

interface KeyboardPreviewProps {
  template: KeyboardTemplate;
  keycap: KeycapSet;
  switchOption: SwitchOption;
  pcb: PcbOption;
  plate: PlateOption;
  keyboardCase: CaseOption;
  diffuser: DiffuserOption;
  soundPack: SoundPack;
  customizations: PerKeyCustomizations;
  selectedKeyId: string;
  customKeyCount: number;
  onKeyPress: (keyId: string) => void;
}

export function KeyboardPreview({
  template,
  keycap,
  switchOption,
  pcb,
  plate,
  keyboardCase,
  diffuser,
  soundPack,
  customizations = {},
  selectedKeyId,
  customKeyCount,
  onKeyPress,
}: KeyboardPreviewProps) {
  const unit = 42;
  const gap = 4;
  const padding = 20;
  const maxX = Math.max(...template.keys.map((key) => key.x + key.w));
  const maxY = Math.max(...template.keys.map((key) => key.y + (key.h ?? 1)));
  const boardWidth = maxX * unit + padding * 2;
  const boardHeight = maxY * unit + padding * 2;
  const keyTextColor = readableTextColor(keycap.color);
  const rgbGlow = diffuser.enabled ? withAlpha(diffuser.color, 0.42) : "transparent";

  return (
    <section className="rounded-md border border-stone-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-4">
        <div>
          <h2 className="text-base font-semibold text-ink">2D 装配预览</h2>
          <p className="mt-1 text-sm text-stone-500">
            {template.name} · {keycap.name} · {keyboardCase.name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-md bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700">
            <MousePointerClick className="h-4 w-4" />
            点击按键选择并试听
          </div>
          <div className="rounded-md bg-stone-100 px-3 py-2 text-xs font-semibold text-stone-700">
            已自定义 {customKeyCount} 个键
          </div>
        </div>
      </div>

      <div className="keyboard-preview-grid overflow-x-auto p-4">
        <div
          className="relative rounded-md border border-black/10"
          style={{
            width: boardWidth,
            height: boardHeight,
            backgroundColor: keyboardCase.color,
            boxShadow: diffuser.enabled
              ? `0 0 38px ${rgbGlow}, inset 0 0 28px ${withAlpha(diffuser.color, 0.3)}`
              : "inset 0 10px 24px rgba(255,255,255,0.16)",
          }}
        >
          <div
            className="absolute rounded-md border border-white/25"
            style={{
              inset: 10,
              backgroundColor: diffuser.enabled ? withAlpha(diffuser.color, 0.16) : "rgba(255,255,255,0.08)",
            }}
          />

          {template.keys.map((key, index) => {
            const isAccent = index % 11 === 0 || key.label === "Esc" || key.label.includes("Enter");
            const customization = customizations[key.id];
            const keyColor = customization?.keycapColor ?? (isAccent ? keycap.accentColor : keycap.color);
            const textColor = readableTextColor(keyColor);
            const isSelected = key.id === selectedKeyId;
            const hasPerKeySwitch = Boolean(customization?.switchId);
            const hasPerKeyColor = Boolean(customization?.keycapColor);

            return (
              <button
                aria-label={`编辑并试听 ${key.label} 键`}
                className={[
                  "absolute rounded-md border text-[11px] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none",
                  isSelected
                    ? "border-white ring-2 ring-ink ring-offset-2 ring-offset-white"
                    : "border-black/15 focus:ring-2 focus:ring-white/80",
                ].join(" ")}
                key={`${template.id}-${key.id}-${key.x}-${key.y}-${index}`}
                onClick={() => onKeyPress(key.id)}
                style={{
                  left: padding + key.x * unit,
                  top: padding + key.y * unit,
                  width: key.w * unit - gap,
                  height: (key.h ?? 1) * unit - gap,
                  backgroundColor: keyColor,
                  color: hasPerKeyColor || isAccent ? textColor : keyTextColor,
                }}
                type="button"
              >
                {key.label}
                {hasPerKeySwitch ? (
                  <span
                    className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: textColor }}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-3 border-t border-stone-200 p-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-md bg-stone-50 p-3">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <Box className="h-4 w-4" />
            尺寸
          </div>
          <p className="mt-1 text-stone-500">
            {template.dimensions.widthMm} × {template.dimensions.depthMm} ×{" "}
            {template.dimensions.frontHeightMm} mm
          </p>
        </div>
        <div className="rounded-md bg-stone-50 p-3">
          <div className="font-semibold text-ink">PCB / 定位板</div>
          <p className="mt-1 text-stone-500">
            {pcb.mount === "hot-swap" ? "热插拔" : "焊接"} · {pcb.rgb ? "RGB" : "无 RGB"} ·{" "}
            {plate.material}
          </p>
        </div>
        <div className="rounded-md bg-stone-50 p-3">
          <div className="font-semibold text-ink">轴体</div>
          <p className="mt-1 text-stone-500">
            {switchOption.kind} · {switchOption.forceGf} gf · {switchOption.soundType}
          </p>
        </div>
        <div className="rounded-md bg-stone-50 p-3">
          <div className="flex items-center gap-2 font-semibold text-ink">
            <Volume2 className="h-4 w-4" />
            声音包
          </div>
          <p className="mt-1 text-stone-500">{soundPack.name}</p>
        </div>
      </div>
    </section>
  );
}
