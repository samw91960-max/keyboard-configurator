"use client";

interface Case3DProps {
  width: number;
  depth: number;
  color: string;
  incompatible: boolean;
}

export function Case3D({ width, depth, color, incompatible }: Case3DProps) {
  return (
    <mesh position={[0, -0.28, 0]} receiveShadow>
      <boxGeometry args={[width + 1.2, 0.36, depth + 1.1]} />
      <meshStandardMaterial
        color={incompatible ? "#9f1239" : color}
        metalness={0.45}
        roughness={0.38}
      />
    </mesh>
  );
}
