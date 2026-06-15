"use client";

interface Plate3DProps {
  width: number;
  depth: number;
  materialName?: string;
}

const materialColors: Record<string, string> = {
  FR4: "#2f6f73",
  PC: "#d8f3ff",
  aluminum: "#9ca3af",
  steel: "#6b7280",
};

export function Plate3D({ width, depth, materialName = "FR4" }: Plate3DProps) {
  return (
    <mesh position={[0, -0.03, 0]} receiveShadow>
      <boxGeometry args={[width + 0.45, 0.08, depth + 0.35]} />
      <meshStandardMaterial
        color={materialColors[materialName] ?? "#64748b"}
        metalness={materialName === "PC" ? 0.05 : 0.28}
        roughness={0.48}
        transparent={materialName === "PC"}
        opacity={materialName === "PC" ? 0.62 : 1}
      />
    </mesh>
  );
}
