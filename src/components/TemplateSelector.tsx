import { Keyboard } from "lucide-react";
import type { KeyboardTemplate } from "../types/domain";

interface TemplateSelectorProps {
  templates: KeyboardTemplate[];
  selectedTemplate: KeyboardTemplate;
  onSelect: (template: KeyboardTemplate) => void;
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  const uniqueTemplates = templates.filter(
    (template, index, list) => list.findIndex((item) => item.id === template.id) === index,
  );

  return (
    <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">键盘模板库</h2>
          <p className="mt-1 text-sm text-stone-500">选择配列后，部件兼容性会自动刷新。</p>
        </div>
        <Keyboard className="h-5 w-5 text-stone-500" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {uniqueTemplates.map((template, index) => {
          const active = template.id === selectedTemplate.id;
          return (
            <button
              className={[
                "rounded-md border p-3 text-left transition",
                active
                  ? "border-ink bg-ink text-white"
                  : "border-stone-200 bg-stone-50 text-ink hover:border-stone-300 hover:bg-white",
              ].join(" ")}
              key={`template-${template.id}-${index}`}
              onClick={() => onSelect(template)}
              type="button"
            >
              <span className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold">{template.name}</span>
                <span
                  className={[
                    "rounded px-2 py-1 text-xs font-semibold",
                    active ? "bg-white/15 text-white" : "bg-stone-200 text-stone-700",
                  ].join(" ")}
                >
                  {template.layout}
                </span>
              </span>
              <span className={["mt-2 block text-xs leading-5", active ? "text-white/75" : "text-stone-500"].join(" ")}>
                {template.keyCount} 键 · {template.dimensions.widthMm} ×{" "}
                {template.dimensions.depthMm} mm
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
