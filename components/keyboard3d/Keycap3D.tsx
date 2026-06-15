"use client";

import { RoundedBox } from "@react-three/drei";

interface Keycap3DProps {
  id: string;
  label: string;
  x: number;
  z: number;
  width: number;
  color: string;
  onPress: (keyId: string) => void;
}

export function Keycap3D({ id, x, z, width, color, onPress }: Keycap3DProps) {
  return (
    <group position={[x, 0.48, z]}>
      <RoundedBox
        args={[width, 0.34, 0.86]}
        castShadow
        radius={0.08}
        smoothness={4}
        onClick={(event) => {
          event.stopPropagation();
          onPress(id);
        }}
      >
        <meshStandardMaterial color={color} roughness={0.52} />
      </RoundedBox>
      <mesh position={[0, 0.19, -0.18]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.min(width * 0.68, 0.75), 0.18]} />
        <meshBasicMaterial color="#111827" transparent opacity={0.72} />
      </mesh>
    </group>
  );
}
