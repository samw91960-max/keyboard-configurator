export type PartType =
  | "keyboard_template"
  | "keycap"
  | "switch"
  | "pcb"
  | "plate"
  | "case"
  | "diffuser"
  | "sound_pack";

export type KeyboardLayout = "60%" | "65%" | "75%" | "TKL" | "Alice" | "Split";

export type MountStyle = "tray" | "gasket" | "top" | "sandwich" | "integrated" | "split";

export type SwitchType = "linear" | "tactile" | "clicky" | "magnetic";

export type SoundProfile = "thock" | "clack" | "creamy" | "silent" | "unknown";

export type PCBType = "mechanical" | "magnetic";

export type KeycapMaterialStyle = "normal" | "black_translucent" | "white_translucent";

export type KeyColorMap = Record<string, string>;

export interface BuildCustomization {
  selectedKeyId?: string;
  keyColorMap: KeyColorMap;
  defaultKeycapColor: string;
  legendColor: string;
  caseColor: string;
  lightingColor: string;
  keycapMaterialStyle: KeycapMaterialStyle;
}

export interface KeyboardTemplate {
  id: string;
  type: "keyboard_template";
  name: string;
  brand: string;
  layout: KeyboardLayout;
  mount: MountStyle;
  supportedPCBTypes: string[];
  supportedPlateLayouts: KeyboardLayout[];
  supportedCaseLayouts: KeyboardLayout[];
  compatibleLayouts: KeyboardLayout[];
  materials: string[];
  tags: string[];
}

export interface KeycapSet {
  id: string;
  type: "keycap";
  name: string;
  brand: string;
  material: string;
  profile: string;
  materialStyle: KeycapMaterialStyle;
  colors: string[];
  compatibleLayouts: KeyboardLayout[];
  tags: string[];
}

export interface Switch {
  id: string;
  type: "switch";
  name: string;
  brand: string;
  switchType: SwitchType;
  triggerType?: "hall_effect";
  actuationForce: number | "unknown";
  initialForce?: number | "unknown";
  totalTravel?: number | "unknown";
  soundProfile: SoundProfile;
  soundUrl: string;
  compatiblePCBType?: PCBType;
  source?: string;
  sourceUrl?: string;
  tags: string[];
}

export interface PCB {
  id: string;
  type: "pcb";
  name: string;
  brand: string;
  layout: KeyboardLayout;
  pcbType: PCBType;
  hotswap: boolean;
  rgb: boolean;
  compatibleLayouts: KeyboardLayout[];
  tags: string[];
}

export interface Plate {
  id: string;
  type: "plate";
  name: string;
  brand: string;
  layout: KeyboardLayout;
  material: string;
  compatibleLayouts: KeyboardLayout[];
  tags: string[];
}

export interface Case {
  id: string;
  type: "case";
  name: string;
  brand: string;
  layout: KeyboardLayout;
  material: string;
  color: string;
  compatibleLayouts: KeyboardLayout[];
  supportedDiffuserIds?: string[];
  tags: string[];
}

export interface Diffuser {
  id: string;
  type: "diffuser";
  name: string;
  brand: string;
  color: string;
  compatibleCaseLayouts: KeyboardLayout[];
  compatibleCaseMaterials: string[];
  tags: string[];
}

export interface SoundPack {
  id: string;
  type: "sound_pack";
  name: string;
  brand: string;
  soundProfile: SoundProfile;
  compatibleSwitchTypes: SwitchType[];
  hasSpacebarAudio: boolean;
  audioUrl: string;
  tags: string[];
}

export type KeyboardPart =
  | KeyboardTemplate
  | KeycapSet
  | Switch
  | PCB
  | Plate
  | Case
  | Diffuser
  | SoundPack;

export type PartsByType = {
  keyboard_template: KeyboardTemplate[];
  keycap: KeycapSet[];
  switch: Switch[];
  pcb: PCB[];
  plate: Plate[];
  case: Case[];
  diffuser: Diffuser[];
  sound_pack: SoundPack[];
};

export interface KeyboardBuild {
  id: string;
  userId: string;
  name: string;
  templateId: string;
  keycapId: string;
  switchId: string;
  pcbId: string;
  plateId: string;
  caseId: string;
  diffuserId: string;
  soundPackId: string;
  keyColorMap: KeyColorMap;
  defaultKeycapColor: string;
  legendColor: string;
  caseColor: string;
  lightingColor: string;
  keycapMaterialStyle: KeycapMaterialStyle;
  createdAt: string;
  updatedAt: string;
}

export interface CompatibilityResult {
  compatible: boolean;
  errors: string[];
  warnings: string[];
}

export type ExtractedPart = Partial<KeyboardPart> & {
  type: PartType;
  name: string;
  brand?: string;
  layout?: KeyboardLayout;
  mount?: MountStyle;
  materials?: string[];
  compatibleLayouts?: KeyboardLayout[];
  tags?: string[];
  sourceUrl?: string;
};

export interface SearchResult {
  title: string;
  url: string;
  image: string;
  snippet: string;
  source: "mock" | "tavily" | "firecrawl" | "serpapi" | "openai_web_search";
  confidence: number;
  extractedPart: ExtractedPart;
}

export interface SearchRequest {
  query: string;
  type: PartType;
}

export interface PartsResponse {
  parts: PartsByType;
}

export interface BuildPartsSelection {
  templateId: string;
  keycapId: string;
  switchId: string;
  pcbId: string;
  plateId: string;
  caseId: string;
  diffuserId: string;
  soundPackId: string;
}
