export type KeyboardLayout = "60%" | "65%" | "75%" | "TKL" | "Alice" | "Split";

export type SwitchKind = "linear" | "tactile" | "clicky";
export type SoundKind = "thock" | "clack" | "creamy" | "silent";
export type PcbMount = "hot-swap" | "solder";
export type PlateMaterial = "PC" | "FR4" | "aluminum" | "steel" | "carbon-fiber";
export type CaseType = "plastic" | "aluminum" | "acrylic";
export type KeycapMaterial = "ABS" | "PBT" | "PC";

export interface KeyboardKey {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h?: number;
}

export interface KeyboardTemplate {
  id: string;
  name: string;
  layout: KeyboardLayout;
  description: string;
  dimensions: {
    widthMm: number;
    depthMm: number;
    frontHeightMm: number;
  };
  keyCount: number;
  supportedPcbIds: string[];
  supportedCaseTypes: CaseType[];
  keys: KeyboardKey[];
}

export interface KeycapSet {
  id: string;
  name: string;
  color: string;
  accentColor: string;
  material: KeycapMaterial;
  legendStyle: string;
  compatibleLayouts: KeyboardLayout[];
}

export interface SwitchOption {
  id: string;
  name: string;
  kind: SwitchKind;
  forceGf: number;
  soundType: SoundKind;
  audioFile: string;
}

export interface PcbOption {
  id: string;
  name: string;
  mount: PcbMount;
  rgb: boolean;
  compatibleLayouts: KeyboardLayout[];
}

export interface PlateOption {
  id: string;
  name: string;
  material: PlateMaterial;
  compatibleLayouts: KeyboardLayout[];
}

export interface CaseOption {
  id: string;
  name: string;
  caseType: CaseType;
  color: string;
  compatibleLayouts: KeyboardLayout[];
}

export interface DiffuserOption {
  id: string;
  name: string;
  enabled: boolean;
  color: string;
  compatibleLayouts: KeyboardLayout[];
}

export interface SoundPack {
  id: string;
  name: string;
  kind: SoundKind;
  description: string;
  audioFile: string;
}

export interface PartsCatalog {
  keycaps: KeycapSet[];
  switches: SwitchOption[];
  pcbs: PcbOption[];
  plates: PlateOption[];
  cases: CaseOption[];
  diffusers: DiffuserOption[];
  soundPacks: SoundPack[];
}

export interface BuildSelection {
  templateId: string;
  keycapId: string;
  switchId: string;
  pcbId: string;
  plateId: string;
  caseId: string;
  diffuserId: string;
  soundPackId: string;
}

export interface PerKeyCustomization {
  keycapColor?: string;
  switchId?: string;
}

export type PerKeyCustomizations = Record<string, PerKeyCustomization>;
