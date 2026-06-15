import type {
  BuildPartsSelection,
  CompatibilityResult,
  KeyboardBuild,
  PartsByType,
} from "@/types/keyboard";

type BuildLike = BuildPartsSelection | KeyboardBuild;

export function checkBuildCompatibility(
  build: BuildLike,
  parts: PartsByType,
): CompatibilityResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const template = parts.keyboard_template.find((item) => item.id === build.templateId);
  const keycap = parts.keycap.find((item) => item.id === build.keycapId);
  const switchPart = parts.switch.find((item) => item.id === build.switchId);
  const pcb = parts.pcb.find((item) => item.id === build.pcbId);
  const plate = parts.plate.find((item) => item.id === build.plateId);
  const casePart = parts.case.find((item) => item.id === build.caseId);
  const diffuser = parts.diffuser.find((item) => item.id === build.diffuserId);
  const soundPack = parts.sound_pack.find((item) => item.id === build.soundPackId);

  if (!template) errors.push("未找到当前键盘模板");
  if (!keycap) errors.push("未找到当前键帽套装");
  if (!switchPart) errors.push("未找到当前轴体");
  if (!pcb) errors.push("未找到当前 PCB");
  if (!plate) errors.push("未找到当前定位板");
  if (!casePart) errors.push("未找到当前外壳");
  if (!diffuser) errors.push("未找到当前均光板");
  if (!soundPack) errors.push("未找到当前声音包");

  if (!template || !keycap || !switchPart || !pcb || !plate || !casePart || !diffuser || !soundPack) {
    return {
      compatible: false,
      errors,
      warnings,
    };
  }

  if (!pcb.compatibleLayouts.includes(template.layout)) {
    errors.push(`当前 PCB 不支持 ${template.layout} 配列`);
  }

  const pcbMountType = pcb.hotswap ? "hotswap" : "solder";
  if (!template.supportedPCBTypes.includes(pcbMountType)) {
    errors.push(`当前模板不支持 ${pcbMountType} PCB`);
  }

  if (switchPart.switchType === "magnetic" && pcb.pcbType !== "magnetic") {
    errors.push("磁轴需要搭配磁轴 PCB，当前 PCB 不兼容。");
  }

  if (switchPart.switchType !== "magnetic" && pcb.pcbType === "magnetic") {
    errors.push("磁轴 PCB 不能直接使用普通机械轴。");
  }

  if (!plate.compatibleLayouts.includes(template.layout)) {
    errors.push(`当前定位板是 ${plate.layout}，不能用于当前模板`);
  }

  if (!template.supportedPlateLayouts.includes(plate.layout)) {
    errors.push(`当前模板不支持 ${plate.layout} 定位板`);
  }

  if (!casePart.compatibleLayouts.includes(template.layout)) {
    errors.push(`当前外壳是 ${casePart.layout}，不能用于 ${template.layout} 模板`);
  }

  if (!template.supportedCaseLayouts.includes(casePart.layout)) {
    errors.push(`当前模板不支持 ${casePart.layout} 外壳`);
  }

  if (!keycap.compatibleLayouts.includes(template.layout)) {
    errors.push(`当前键帽套装没有覆盖 ${template.layout} 配列`);
  }

  if (!diffuser.compatibleCaseLayouts.includes(casePart.layout)) {
    errors.push(`当前均光板不支持 ${casePart.layout} 外壳布局`);
  }

  if (!diffuser.compatibleCaseMaterials.includes(casePart.material)) {
    errors.push(`当前均光板不适配 ${casePart.material} 外壳材质`);
  }

  if (
    casePart.supportedDiffuserIds &&
    casePart.supportedDiffuserIds.length > 0 &&
    !casePart.supportedDiffuserIds.includes(diffuser.id)
  ) {
    errors.push("当前外壳没有列入该均光板的安装支持");
  }

  if (!soundPack.compatibleSwitchTypes.includes(switchPart.switchType)) {
    errors.push(`当前声音包不能用于 ${switchPart.switchType} 轴体`);
  }

  if (!soundPack.hasSpacebarAudio) {
    warnings.push("该声音包缺少空格键音频");
  }

  if (
    soundPack.soundProfile !== "unknown" &&
    switchPart.soundProfile !== "unknown" &&
    soundPack.soundProfile !== switchPart.soundProfile
  ) {
    warnings.push(
      `声音包风格为 ${soundPack.soundProfile}，当前轴体声线为 ${switchPart.soundProfile}`,
    );
  }

  return {
    compatible: errors.length === 0,
    errors,
    warnings,
  };
}
