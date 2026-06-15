import { CheckCircle2 } from "lucide-react";

interface PartOptionCardProps {
  title: string;
  meta: string;
  active: boolean;
  compatible: boolean;
  reason?: string;
  swatchColor?: string;
  onSelect: () => void;
}

export function PartOptionCard({
  title,
  meta,
  active,
  compatible,
  reason,
  swatchColor,
  onSelect,
}: PartOptionCardProps) {
  return (
    <button
      className={[
        "group flex w-full items-start gap-3 rounded-md border p-3 text-left transition",
        active
          ? "border-ink bg-white shadow-sm"
          : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-white",
        compatible ? "" : "cursor-not-allowed opacity-55",
      ].join(" ")}
      disabled={!compatible}
      onClick={onSelect}
      type="button"
      title={reason}
    >
      {swatchColor ? (
        <span
          className="mt-0.5 h-5 w-5 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: swatchColor }}
        />
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate text-sm font-semibold text-ink">{title}</span>
          {active ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : null}
        </span>
        <span className="mt-1 block text-xs leading-5 text-stone-500">{meta}</span>
        {!compatible && reason ? (
          <span className="mt-2 block text-xs leading-5 text-rose-700">{reason}</span>
        ) : null}
      </span>
    </button>
  );
}
