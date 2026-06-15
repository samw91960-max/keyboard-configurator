import type { KeyboardLayout } from "@/types/keyboard";

export interface KeyMapping {
  keyId: string;
  label: string;
  assignedKey: string;
  layer: number;
}

export type RGBMode = "static" | "breathing" | "rainbow" | "wave" | "reactive";

export interface RGBConfig {
  enabled: boolean;
  mode: RGBMode;
  color: string;
  brightness: number;
  speed: number;
}

export interface Macro {
  id: string;
  name: string;
  steps: string[];
}

export interface KeyboardDriverConfig {
  keyboardId: string;
  layout: KeyboardLayout;
  activeLayer: number;
  fnKeyId: string;
  keyMappings: KeyMapping[];
  rgbConfig: RGBConfig;
  macros: Macro[];
  createdAt: string;
}
