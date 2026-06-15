"use client";

interface LightingLayerProps {
  enabled: boolean;
  color: string;
}

export function LightingLayer({ enabled, color }: LightingLayerProps) {
  if (!enabled) {
    return null;
  }

  return (
    <div
      className="pointer-events-none absolute inset-4 rounded-md"
      style={{
        background: `radial-gradient(circle at 50% 60%, ${color}66, transparent 58%)`,
        boxShadow: `0 0 42px ${color}88, inset 0 0 28px ${color}55`,
      }}
    />
  );
}
