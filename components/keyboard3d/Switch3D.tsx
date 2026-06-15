"use client";

interface Switch3DProps {
  x: number;
  z: number;
  switchType?: string;
}

export function Switch3D({ x, z, switchType = "linear" }: Switch3DProps) {
  const color = switchType === "magnetic" ? "#38bdf8" : "#111827";

  return (
    <mesh position={[x, 0.18, z]} castShadow>
      <boxGeometry args={[0.48, 0.28, 0.48]} />
      <meshStandardMaterial color={color} roughness={0.45} />
    </mesh>
  );
}
