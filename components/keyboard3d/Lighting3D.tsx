"use client";

interface Lighting3DProps {
  enabled: boolean;
  width: number;
  depth: number;
  color: string;
}

export function Lighting3D({ enabled, width, depth, color }: Lighting3DProps) {
  if (!enabled) {
    return null;
  }

  return (
    <>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[width + 0.25, depth + 0.2]} />
        <meshBasicMaterial color={color} transparent opacity={0.18} />
      </mesh>
      <pointLight color={color} intensity={1.6} position={[0, 2.2, 1.5]} />
    </>
  );
}
