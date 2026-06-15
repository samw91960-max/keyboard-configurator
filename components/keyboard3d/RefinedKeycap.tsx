"use client";

import { Edges, RoundedBox } from "@react-three/drei";
import type { KeycapMaterialStyle } from "@/types/keyboard";

interface RefinedKeycapProps {
  id: string;
  x: number;
  z: number;
  width: number;
  color: string;
  materialStyle: KeycapMaterialStyle;
  lightingColor: string;
  selected: boolean;
  onPress: (keyId: string) => void;
}

function materialConfig(style: KeycapMaterialStyle, color: string, lightingColor: string) {
  if (style === "black_translucent") {
    return {
      color: "#111111",
      transparent: true,
      opacity: 0.45,
      roughness: 0.25,
      metalness: 0,
      emissive: lightingColor,
      emissiveIntensity: 0.38,
    };
  }

  if (style === "white_translucent") {
    return {
      color: "#f5f5f5",
      transparent: true,
      opacity: 0.55,
      roughness: 0.2,
      metalness: 0,
      emissive: lightingColor,
      emissiveIntensity: 0.32,
    };
  }

  return {
    color,
    transparent: false,
    opacity: 1,
    roughness: 0.45,
    metalness: 0,
    emissive: "#000000",
    emissiveIntensity: 0,
  };
}

export function RefinedKeycap({
  id,
  x,
  z,
  width,
  color,
  materialStyle,
  lightingColor,
  selected,
  onPress,
}: RefinedKeycapProps) {
  const config = materialConfig(materialStyle, color, lightingColor);

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
        <meshPhysicalMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={config.emissiveIntensity}
          metalness={config.metalness}
          opacity={config.opacity}
          roughness={config.roughness}
          transparent={config.transparent}
          transmission={materialStyle === "normal" ? 0 : 0.28}
        />
        {selected ? <Edges color="#f59e0b" lineWidth={2} /> : null}
      </RoundedBox>
    </group>
  );
}
