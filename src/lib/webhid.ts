import type { RGBConfig, RGBMode } from "@/types/driver";

export interface WebHIDCollectionInfo {
  usage?: number;
  usagePage?: number;
}

export interface WebHIDDevice {
  opened: boolean;
  productId: number;
  productName: string;
  vendorId: number;
  collections?: WebHIDCollectionInfo[];
  close: () => Promise<void>;
  open: () => Promise<void>;
  sendReport: (reportId: number, data: BufferSource) => Promise<void>;
}

interface WebHIDNavigator {
  hid?: {
    getDevices: () => Promise<WebHIDDevice[]>;
    requestDevice: (options: { filters: Array<Record<string, number>> }) => Promise<WebHIDDevice[]>;
  };
}

export interface HIDDeviceSummary {
  id: string;
  productId: number;
  productName: string;
  vendorId: number;
  opened: boolean;
  keyboardLike: boolean;
}

const REPORT_ID = 0;
const REPORT_SIZE = 32;
const COMMAND_RGB = 0x10;
const COMMAND_TEST = 0x11;

const rgbModeCodes: Record<Extract<RGBMode, "static" | "breathing" | "rainbow">, number> = {
  static: 0x01,
  breathing: 0x02,
  rainbow: 0x03,
};

export function isWebHIDSupported() {
  return typeof navigator !== "undefined" && "hid" in navigator;
}

function hidNavigator() {
  return navigator as Navigator & WebHIDNavigator;
}

export function isKeyboardLikeDevice(device: WebHIDDevice) {
  const productName = device.productName.toLowerCase();
  const productLooksKeyboard =
    productName.includes("keyboard") ||
    productName.includes("qmk") ||
    productName.includes("via") ||
    productName.includes("keychron") ||
    productName.includes("wooting");

  const collectionLooksKeyboard = device.collections?.some(
    (collection) => collection.usagePage === 0x01 && collection.usage === 0x06,
  );

  return Boolean(productLooksKeyboard || collectionLooksKeyboard);
}

export function hidDeviceIdentity(device: WebHIDDevice) {
  return `${device.vendorId}:${device.productId}`;
}

export function dedupeHIDDevices(devices: WebHIDDevice[]) {
  const seen = new Set<string>();

  return devices.filter((device) => {
    const identity = hidDeviceIdentity(device);

    if (seen.has(identity)) {
      return false;
    }

    seen.add(identity);
    return true;
  });
}

export function summarizeHIDDevice(device: WebHIDDevice, index = 0): HIDDeviceSummary {
  return {
    id: `${device.vendorId}:${device.productId}:${index}`,
    opened: device.opened,
    productId: device.productId,
    productName: device.productName || "Unknown HID Device",
    vendorId: device.vendorId,
    keyboardLike: isKeyboardLikeDevice(device),
  };
}

export async function getAuthorizedHIDDevices() {
  if (!isWebHIDSupported()) {
    return [];
  }

  return hidNavigator().hid?.getDevices() ?? [];
}

export async function requestHIDKeyboardDevice() {
  if (!isWebHIDSupported()) {
    throw new Error("当前浏览器不支持 WebHID。请使用 Chrome 或 Edge。");
  }

  const devices = await hidNavigator().hid?.requestDevice({
    filters: [],
  });

  return devices ?? [];
}

export function supportedRGBMode(mode: RGBMode): mode is "static" | "breathing" | "rainbow" {
  return mode === "static" || mode === "breathing" || mode === "rainbow";
}

function parseHexColor(color: string) {
  const normalized = color.replace("#", "");

  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return { r: 115, g: 216, b: 255 };
  }

  return {
    r: Number.parseInt(normalized.slice(0, 2), 16),
    g: Number.parseInt(normalized.slice(2, 4), 16),
    b: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

function keyHash(keyId: string) {
  return Array.from(keyId).reduce((sum, char) => (sum + char.charCodeAt(0)) % 256, 0);
}

export function createQMKRGBReport(config: RGBConfig, selectedKeyId?: string, test = false) {
  const report = new Uint8Array(REPORT_SIZE);
  const mode = supportedRGBMode(config.mode) ? config.mode : "static";
  const { r, g, b } = parseHexColor(config.color);

  report[0] = test ? COMMAND_TEST : COMMAND_RGB;
  report[1] = rgbModeCodes[mode];
  report[2] = config.enabled ? 1 : 0;
  report[3] = r;
  report[4] = g;
  report[5] = b;
  report[6] = Math.max(0, Math.min(100, config.brightness));
  report[7] = Math.max(0, Math.min(100, config.speed));
  report[8] = selectedKeyId ? keyHash(selectedKeyId) : 0;
  report[31] = report.slice(0, 31).reduce((sum, byte) => (sum + byte) % 256, 0);

  return report;
}

export async function ensureHIDDeviceOpen(device: WebHIDDevice) {
  if (!device.opened) {
    await device.open();
  }
}

export async function sendRGBReport(
  device: WebHIDDevice,
  config: RGBConfig,
  selectedKeyId?: string,
  test = false,
) {
  await ensureHIDDeviceOpen(device);
  const report = createQMKRGBReport(config, selectedKeyId, test);
  await device.sendReport(REPORT_ID, report);
  return report;
}
