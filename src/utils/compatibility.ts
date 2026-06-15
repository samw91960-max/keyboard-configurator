import type {
  BuildSelection,
  CaseOption,
  DiffuserOption,
  KeycapSet,
  KeyboardLayout,
  KeyboardTemplate,
  PartsCatalog,
  PcbOption,
  PlateOption,
} from "../types/domain";

export type PartType = "keycap" | "pcb" | "plate" | "case" | "diffuser";

type CompatiblePart =
  | KeycapSet
  | PcbOption
  | PlateOption
  | CaseOption
  | DiffuserOption;

export interface CompatibilityIssue {
  partType: PartType;
  partName: string;
  reason: string;
}

function supportsLayout(
  compatibleLayouts: KeyboardLayout[],
  layout: KeyboardLayout,
): boolean {
  return compatibleLayouts.includes(layout);
}

export function getPartCompatibilityReasons(
  template: KeyboardTemplate,
  part: CompatiblePart,
  partType: PartType,
): string[] {
  const reasons: string[] = [];

  if (!supportsLayout(part.compatibleLayouts, template.layout)) {
    const labelMap: Record<PartType, string> = {
      keycap: "该键帽套装",
      pcb: "该 PCB",
      plate: "该定位板",
      case: "该外壳",
      diffuser: "该均光板",
    };
    reasons.push(`${labelMap[partType]}不支持 ${template.layout} 配列`);
  }

  if (partType === "pcb") {
    const pcb = part as PcbOption;
    if (!template.supportedPcbIds.includes(pcb.id)) {
      reasons.push("当前模板未列入该 PCB 的安装孔位支持");
    }
  }

  if (partType === "case") {
    const keyboardCase = part as CaseOption;
    if (!template.supportedCaseTypes.includes(keyboardCase.caseType)) {
      reasons.push(`当前模板不支持 ${keyboardCase.caseType} 外壳类型`);
    }
  }

  return reasons;
}

export function isPartCompatible(
  template: KeyboardTemplate,
  part: CompatiblePart,
  partType: PartType,
): boolean {
  return getPartCompatibilityReasons(template, part, partType).length === 0;
}

export function validateBuild(
  selection: BuildSelection,
  template: KeyboardTemplate,
  catalog: PartsCatalog,
): CompatibilityIssue[] {
  const selectedParts = [
    {
      partType: "keycap" as const,
      part: catalog.keycaps.find((item) => item.id === selection.keycapId),
    },
    {
      partType: "pcb" as const,
      part: catalog.pcbs.find((item) => item.id === selection.pcbId),
    },
    {
      partType: "plate" as const,
      part: catalog.plates.find((item) => item.id === selection.plateId),
    },
    {
      partType: "case" as const,
      part: catalog.cases.find((item) => item.id === selection.caseId),
    },
    {
      partType: "diffuser" as const,
      part: catalog.diffusers.find((item) => item.id === selection.diffuserId),
    },
  ];

  return selectedParts.flatMap(({ partType, part }) => {
    if (!part) {
      return [
        {
          partType,
          partName: "未找到的部件",
          reason: "数据源中不存在该部件",
        },
      ];
    }

    return getPartCompatibilityReasons(template, part, partType).map((reason) => ({
      partType,
      partName: part.name,
      reason,
    }));
  });
}

export function firstCompatibleParts(
  template: KeyboardTemplate,
  catalog: PartsCatalog,
): Omit<BuildSelection, "templateId" | "switchId" | "soundPackId"> {
  const keycap = catalog.keycaps.find((part) =>
    isPartCompatible(template, part, "keycap"),
  );
  const pcb = catalog.pcbs.find((part) => isPartCompatible(template, part, "pcb"));
  const plate = catalog.plates.find((part) =>
    isPartCompatible(template, part, "plate"),
  );
  const keyboardCase = catalog.cases.find((part) =>
    isPartCompatible(template, part, "case"),
  );
  const diffuser = catalog.diffusers.find((part) =>
    isPartCompatible(template, part, "diffuser"),
  );

  if (!keycap || !pcb || !plate || !keyboardCase || !diffuser) {
    throw new Error(`模板 ${template.name} 缺少可兼容的默认部件`);
  }

  return {
    keycapId: keycap.id,
    pcbId: pcb.id,
    plateId: plate.id,
    caseId: keyboardCase.id,
    diffuserId: diffuser.id,
  };
}
