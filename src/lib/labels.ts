import type { PartType } from "@/types/keyboard";

export const partTypeLabels: Record<PartType, string> = {
  keyboard_template: "键盘模板",
  keycap: "键帽",
  switch: "轴体",
  pcb: "PCB",
  plate: "定位板",
  case: "外壳",
  diffuser: "均光板",
  sound_pack: "声音包",
};

export const partTypes = Object.keys(partTypeLabels) as PartType[];
