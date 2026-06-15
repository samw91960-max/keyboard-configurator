"use client";

interface KeyProps {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h?: number;
  unit: number;
  gap: number;
  color: string;
  textColor: string;
  selected: boolean;
  glowColor?: string;
  onPress: (keyId: string) => void;
}

export function Key({
  id,
  label,
  x,
  y,
  w,
  h = 1,
  unit,
  gap,
  color,
  textColor,
  selected,
  glowColor,
  onPress,
}: KeyProps) {
  return (
    <button
      aria-label={`试听 ${label} 键`}
      className={[
        "absolute rounded-md border text-[11px] font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none",
        selected
          ? "border-white ring-2 ring-ink ring-offset-2 ring-offset-white"
          : "border-black/15 focus:ring-2 focus:ring-white",
      ].join(" ")}
      onClick={() => onPress(id)}
      style={{
        left: x * unit,
        top: y * unit,
        width: w * unit - gap,
        height: h * unit - gap,
        backgroundColor: color,
        color: textColor,
        boxShadow: glowColor
          ? `0 0 18px ${glowColor}, inset 0 -8px 16px ${glowColor}`
          : undefined,
      }}
      type="button"
    >
      {label}
    </button>
  );
}
