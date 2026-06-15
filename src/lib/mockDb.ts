import {
  initialBuilds,
  initialParts,
  mockSearchResults,
} from "@/lib/mockData";
import type {
  ExtractedPart,
  KeyboardBuild,
  KeyboardPart,
  PartType,
  PartsByType,
  SearchRequest,
  SearchResult,
} from "@/types/keyboard";

const parts: PartsByType = structuredClone(initialParts);
const builds: KeyboardBuild[] = structuredClone(initialBuilds);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function partExists(type: PartType, name: string): boolean {
  return parts[type].some(
    (part) => part.name.trim().toLowerCase() === name.trim().toLowerCase(),
  );
}

function makeId(type: PartType, name: string): string {
  const base = `${type}-${slugify(name) || Date.now()}`;
  let candidate = base;
  let index = 2;

  while (parts[type].some((part) => part.id === candidate)) {
    candidate = `${base}-${index}`;
    index += 1;
  }

  return candidate;
}

function primaryLayout(part: ExtractedPart) {
  return part.layout ?? part.compatibleLayouts?.[0] ?? "65%";
}

export function getAllParts(): PartsByType {
  return structuredClone(parts);
}

export function getFlatParts(): KeyboardPart[] {
  return Object.values(parts).flat();
}

export function getBuilds(userId = "demo-user"): KeyboardBuild[] {
  return builds.filter((build) => build.userId === userId).map((build) => ({ ...build }));
}

export function saveBuild(build: KeyboardBuild): KeyboardBuild {
  builds.push(build);
  return { ...build };
}

export function searchMockParts(request: SearchRequest): SearchResult[] {
  const query = request.query.trim().toLowerCase();

  return mockSearchResults
    .filter((result) => result.extractedPart.type === request.type)
    .filter((result) => {
      if (!query) {
        return true;
      }

      return [
        result.title,
        result.snippet,
        result.extractedPart.name,
        result.extractedPart.brand,
        result.extractedPart.layout,
        ...(result.extractedPart.tags ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
}

export function normalizeExtractedPart(extractedPart: ExtractedPart): KeyboardPart {
  const nowId = makeId(extractedPart.type, extractedPart.name);
  const common = {
    id: nowId,
    name: extractedPart.name.trim(),
    brand: extractedPart.brand?.trim() || "Unknown",
    tags: extractedPart.tags ?? [],
    sourceUrl: extractedPart.sourceUrl,
  };
  const layout = primaryLayout(extractedPart);
  const compatibleLayouts = extractedPart.compatibleLayouts ?? [layout];

  switch (extractedPart.type) {
    case "keyboard_template":
      return {
        ...common,
        type: "keyboard_template",
        layout,
        mount: extractedPart.mount ?? "gasket",
        supportedPCBTypes: extractedPart.tags?.includes("hotswap")
          ? ["hotswap"]
          : ["hotswap", "solder"],
        supportedPlateLayouts: compatibleLayouts,
        supportedCaseLayouts: compatibleLayouts,
        compatibleLayouts,
        materials: extractedPart.materials ?? ["aluminum"],
      };
    case "keycap":
      return {
        ...common,
        type: "keycap",
        material: extractedPart.tags?.includes("abs") ? "ABS" : "PBT",
        profile: extractedPart.tags?.includes("xda") ? "XDA" : "Cherry",
        materialStyle: extractedPart.tags?.includes("black-translucent")
          ? "black_translucent"
          : extractedPart.tags?.includes("white-translucent")
            ? "white_translucent"
            : "normal",
        colors: ["cream", "accent"],
        compatibleLayouts,
      };
    case "switch":
      return {
        ...common,
        type: "switch",
        switchType: extractedPart.tags?.includes("clicky")
          ? "clicky"
          : extractedPart.tags?.includes("tactile")
            ? "tactile"
            : "linear",
        actuationForce: 55,
        soundProfile: extractedPart.tags?.includes("clack") ? "clack" : "thock",
        soundUrl: "/sounds/switch-linear-45.wav",
        compatiblePCBType: "mechanical",
      };
    case "pcb":
      return {
        ...common,
        type: "pcb",
        layout,
        pcbType: extractedPart.tags?.includes("magnetic") ? "magnetic" : "mechanical",
        hotswap: extractedPart.tags?.includes("solder") ? false : true,
        rgb: extractedPart.tags?.includes("rgb") ?? false,
        compatibleLayouts,
      };
    case "plate":
      return {
        ...common,
        type: "plate",
        layout,
        material: extractedPart.materials?.[0] ?? "FR4",
        compatibleLayouts,
      };
    case "case":
      return {
        ...common,
        type: "case",
        layout,
        material: extractedPart.materials?.[0] ?? "aluminum",
        color: "#4B5563",
        compatibleLayouts,
        supportedDiffuserIds: [],
      };
    case "diffuser":
      return {
        ...common,
        type: "diffuser",
        color: "ice-blue",
        compatibleCaseLayouts: compatibleLayouts,
        compatibleCaseMaterials: extractedPart.materials ?? ["aluminum", "acrylic"],
      };
    case "sound_pack":
      return {
        ...common,
        type: "sound_pack",
        soundProfile: extractedPart.tags?.includes("silent") ? "silent" : "thock",
        compatibleSwitchTypes: extractedPart.tags?.includes("clicky")
          ? ["clicky"]
          : ["linear", "tactile"],
        hasSpacebarAudio: !extractedPart.tags?.includes("missing-spacebar"),
        audioUrl: "/sounds/sound-thock.wav",
      };
  }
}

export function importPart(extractedPart: ExtractedPart): KeyboardPart {
  if (!extractedPart?.type || !extractedPart.name?.trim()) {
    throw new Error("瀵煎叆澶辫触锛氱己灏戦儴浠剁被鍨嬫垨鍚嶇О");
  }

  if (partExists(extractedPart.type, extractedPart.name)) {
    throw new Error(`閮ㄤ欢宸插瓨鍦細${extractedPart.name}`);
  }

  const normalizedPart = normalizeExtractedPart(extractedPart);
  parts[normalizedPart.type].push(normalizedPart as never);
  return normalizedPart;
}
