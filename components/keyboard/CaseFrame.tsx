"use client";

interface CaseFrameProps {
  color: string;
  width: number;
  height: number;
  incompatible: boolean;
  children: React.ReactNode;
}

export function CaseFrame({ color, width, height, incompatible, children }: CaseFrameProps) {
  return (
    <div
      className={[
        "relative rounded-md border p-5 shadow-sm transition",
        incompatible ? "border-rose-500 ring-2 ring-rose-200" : "border-black/10",
      ].join(" ")}
      style={{
        width,
        height,
        backgroundColor: color,
        boxShadow: incompatible
          ? "0 18px 60px rgba(190, 18, 60, 0.12)"
          : "inset 0 10px 24px rgba(255,255,255,0.16), 0 18px 60px rgba(16,24,40,0.10)",
      }}
    >
      <div className="absolute inset-3 rounded-md border border-white/25 bg-white/10" />
      {children}
    </div>
  );
}
