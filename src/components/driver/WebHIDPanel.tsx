"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Send, Unplug, Usb } from "lucide-react";
import type { RGBConfig, RGBMode } from "@/types/driver";
import {
  dedupeHIDDevices,
  getAuthorizedHIDDevices,
  HIDDeviceSummary,
  isWebHIDSupported,
  requestHIDKeyboardDevice,
  sendRGBReport,
  summarizeHIDDevice,
  supportedRGBMode,
  WebHIDDevice,
} from "@/lib/webhid";

interface WebHIDPanelProps {
  rgbConfig: RGBConfig;
  selectedKeyId: string;
  onRGBConfigChange: (config: RGBConfig) => void;
}

const quickModes: Array<{ mode: Extract<RGBMode, "static" | "breathing" | "rainbow">; label: string }> = [
  { mode: "static", label: "Static" },
  { mode: "breathing", label: "Breathing" },
  { mode: "rainbow", label: "Rainbow" },
];

function formatId(value: number) {
  return `0x${value.toString(16).padStart(4, "0")}`;
}

function describeDevice(device: HIDDeviceSummary) {
  return `${device.productName} · VID ${formatId(device.vendorId)} / PID ${formatId(device.productId)}`;
}

function reportPreview(report: Uint8Array | null) {
  if (!report) {
    return "尚未发送指令";
  }

  return Array.from(report)
    .slice(0, 12)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join(" ");
}

export function WebHIDPanel({ rgbConfig, selectedKeyId, onRGBConfigChange }: WebHIDPanelProps) {
  const [devices, setDevices] = useState<WebHIDDevice[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [connectedDevice, setConnectedDevice] = useState<WebHIDDevice | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("等待连接键盘。");
  const [lastReport, setLastReport] = useState<Uint8Array | null>(null);

  const uniqueDevices = useMemo(() => dedupeHIDDevices(devices), [devices]);
  const summaries = useMemo(
    () => uniqueDevices.map((device, index) => summarizeHIDDevice(device, index)),
    [uniqueDevices],
  );
  const selectedDevice = useMemo(
    () =>
      uniqueDevices.find(
        (device, index) => summarizeHIDDevice(device, index).id === selectedDeviceId,
      ) ?? uniqueDevices[0],
    [uniqueDevices, selectedDeviceId],
  );
  const connectedSummary = connectedDevice ? summarizeHIDDevice(connectedDevice) : null;
  const canSend = Boolean(connectedDevice);
  const modeSupported = supportedRGBMode(rgbConfig.mode);
  const supported = isWebHIDSupported();

  async function scanAuthorizedDevices() {
    setBusy(true);
    try {
      const authorizedDevices = await getAuthorizedHIDDevices();
      const nextDevices = dedupeHIDDevices(
        authorizedDevices.length > 0 ? authorizedDevices : devices,
      );

      setDevices(nextDevices);
      setSelectedDeviceId(
        (current) => current || (nextDevices[0] ? summarizeHIDDevice(nextDevices[0], 0).id : ""),
      );
      setMessage(
        authorizedDevices.length > 0
          ? `已找到 ${authorizedDevices.length} 个已授权 HID 设备。`
          : "没有已授权设备，请点击连接键盘打开浏览器选择器。",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "扫描 HID 设备失败。");
    } finally {
      setBusy(false);
    }
  }

  async function requestDevice() {
    setBusy(true);
    try {
      const requestedDevices = await requestHIDKeyboardDevice();

      if (requestedDevices.length === 0) {
        setMessage("没有选择 HID 设备。");
        return;
      }

      const nextDevices = dedupeHIDDevices([
        ...devices.filter(
          (existing) =>
            !requestedDevices.some(
              (device) =>
                device.vendorId === existing.vendorId &&
                device.productId === existing.productId &&
                device.productName === existing.productName,
            ),
        ),
        ...requestedDevices,
      ]);
      const targetDevice = requestedDevices[0];
      const targetIndex = nextDevices.findIndex(
        (device) =>
          device.vendorId === targetDevice.vendorId && device.productId === targetDevice.productId,
      );
      const summary = summarizeHIDDevice(targetDevice, Math.max(targetIndex, 0));

      await targetDevice.open();
      setDevices(nextDevices);
      setSelectedDeviceId(targetIndex >= 0 ? summary.id : "");
      setConnectedDevice(targetDevice);
      setMessage(`已连接：${describeDevice(summary)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "连接键盘失败。");
    } finally {
      setBusy(false);
    }
  }

  async function connectSelectedDevice() {
    if (!selectedDevice) {
      setMessage("请先扫描或选择一个 HID 设备。");
      return;
    }

    setBusy(true);
    try {
      if (!selectedDevice.opened) {
        await selectedDevice.open();
      }

      setConnectedDevice(selectedDevice);
      setMessage(`已连接：${describeDevice(summarizeHIDDevice(selectedDevice, 0))}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "连接已授权设备失败。");
    } finally {
      setBusy(false);
    }
  }

  async function disconnectDevice() {
    if (!connectedDevice) {
      return;
    }

    setBusy(true);
    try {
      await connectedDevice.close();
      setConnectedDevice(null);
      setMessage("已断开 HID session。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "断开连接失败。");
    } finally {
      setBusy(false);
    }
  }

  async function sendRGB(test = false) {
    if (!connectedDevice) {
      setMessage("请先连接键盘。");
      return;
    }

    if (!modeSupported) {
      setMessage("WebHID V1 只发送 static、breathing、rainbow 三种基础灯效。");
      return;
    }

    setBusy(true);
    try {
      const report = await sendRGBReport(connectedDevice, rgbConfig, selectedKeyId, test);

      setLastReport(report);
      setMessage(
        test
          ? `已发送测试灯效，选中键 ${selectedKeyId} 会写入模拟协议。`
          : `已发送 ${rgbConfig.mode} RGB 指令。`,
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "发送 RGB 指令失败。");
    } finally {
      setBusy(false);
    }
  }

  function setQuickMode(mode: Extract<RGBMode, "static" | "breathing" | "rainbow">) {
    onRGBConfigChange({ ...rgbConfig, enabled: true, mode });
  }

  return (
    <section className="rounded-md border border-stone-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-ink">WebHID 键盘连接</h2>
          <p className="mt-1 text-sm text-stone-500">
            第二阶段使用 QMK / 模拟协议发送 RGB Raw HID 指令。
          </p>
        </div>
        <span
          className={[
            "rounded-md px-2 py-1 text-xs font-semibold",
            connectedDevice
              ? "bg-emerald-50 text-emerald-700"
              : supported
                ? "bg-stone-100 text-stone-700"
                : "bg-amber-50 text-amber-700",
          ].join(" ")}
        >
          {connectedDevice ? "已连接" : supported ? "可用" : "不支持"}
        </span>
      </div>

      {!supported ? (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          当前浏览器没有 WebHID API。请使用 Chrome 或 Edge，并确保页面通过 HTTPS 或 localhost 打开。
        </p>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy}
              onClick={scanAuthorizedDevices}
              type="button"
            >
              <RefreshCw className="h-4 w-4" />
              扫描已授权设备
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ink px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy}
              onClick={requestDevice}
              type="button"
            >
              <Usb className="h-4 w-4" />
              连接键盘
            </button>
          </div>

          {summaries.length > 0 ? (
            <label className="block">
              <span className="mb-1 block text-sm font-semibold text-ink">HID 设备</span>
              <select
                className="h-10 w-full rounded-md border border-stone-300 bg-white px-3 text-sm outline-none transition focus:border-ink focus:ring-2 focus:ring-ink/10"
                onChange={(event) => setSelectedDeviceId(event.target.value)}
                value={selectedDeviceId || summaries[0]?.id}
              >
                {summaries.map((device, index) => (
                  <option key={`hid-device-${device.vendorId}-${device.productId}-${index}`} value={device.id}>
                    {device.keyboardLike ? "键盘" : "HID"} · {describeDevice(device)}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy || !selectedDevice}
              onClick={connectSelectedDevice}
              type="button"
            >
              <Usb className="h-4 w-4" />
              连接所选设备
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy || !connectedDevice}
              onClick={disconnectDevice}
              type="button"
            >
              <Unplug className="h-4 w-4" />
              断开连接
            </button>
          </div>

          <div className="rounded-md bg-stone-50 p-3 text-sm text-stone-600">
            <div>
              当前设备：
              <span className="font-semibold text-ink">
                {connectedSummary ? describeDevice(connectedSummary) : "未连接"}
              </span>
            </div>
            <div className="mt-1">
              3D / 2D 选中键：
              <span className="font-semibold text-ink">{selectedKeyId}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {quickModes.map((item, index) => (
              <button
                className={[
                  "h-9 rounded-md border px-2 text-xs font-semibold transition",
                  rgbConfig.mode === item.mode
                    ? "border-ink bg-ink text-white"
                    : "border-stone-300 bg-white text-stone-700 hover:border-ink",
                ].join(" ")}
                key={`hid-rgb-mode-${item.mode}-${index}`}
                onClick={() => setQuickMode(item.mode)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-stone-300 px-3 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy || !canSend}
              onClick={() => sendRGB(false)}
              type="button"
            >
              <Send className="h-4 w-4" />
              应用当前 RGB
            </button>
            <button
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#2F6F73] px-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={busy || !canSend}
              onClick={() => sendRGB(true)}
              type="button"
            >
              <Send className="h-4 w-4" />
              发送测试灯效
            </button>
          </div>

          {!modeSupported ? (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
              当前选择的灯效暂不在 WebHID V1 协议内，发送前请切换到 static、breathing 或 rainbow。
            </p>
          ) : null}

          <div className="rounded-md bg-stone-950 px-3 py-2 font-mono text-xs text-stone-100">
            report: {reportPreview(lastReport)}
          </div>
        </div>
      )}

      <p className="mt-3 rounded-md bg-stone-100 px-3 py-2 text-sm text-stone-700">
        {message}
      </p>
    </section>
  );
}
