import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronDownIcon } from "@radix-ui/react-icons";
import { Capacitor } from "@capacitor/core";
import { mobileAssets } from "./assets";
import { iphoneGeometry, pixelGeometry, type MobileDeviceGeometry } from "./geometry";

export type MobileDeviceId = "iphone" | "pixel-10";

type MobileDevicePreset = {
  id: MobileDeviceId;
  label: string;
  platform: "ios" | "android";
  bezel: string;
  bezelLayer: "above-screen" | "below-screen";
  geometry: MobileDeviceGeometry;
  camera?: {
    size: number;
    top: number;
  };
};

export const mobileDevices: Record<MobileDeviceId, MobileDevicePreset> = {
  iphone: {
    id: "iphone",
    label: "iPhone",
    platform: "ios",
    bezel: mobileAssets.iphoneBezel,
    bezelLayer: "above-screen",
    geometry: iphoneGeometry,
  },
  "pixel-10": {
    id: "pixel-10",
    label: "Pixel 10",
    platform: "android",
    bezel: mobileAssets.pixel10Bezel,
    bezelLayer: "below-screen",
    geometry: pixelGeometry,
    camera: {
      size: 32,
      top: 23,
    },
  },
};

type MobileDeviceContextValue = {
  device: MobileDevicePreset;
  deviceId: MobileDeviceId;
  setDeviceId: (deviceId: MobileDeviceId) => void;
  native: boolean;
  webMode: boolean;
};

const MobileDeviceContext = createContext<MobileDeviceContextValue | null>(null);

export function MobileDeviceProvider({ children }: PropsWithChildren) {
  const native = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform();
  const nativeDeviceId: MobileDeviceId = platform === "ios" ? "iphone" : "pixel-10";
  const params = typeof window === "undefined" ? new URLSearchParams() : new URLSearchParams(window.location.search);
  const forcedReview = params.get("mode") === "review" || params.has("device");
  const forcedWeb = params.get("mode") === "web";
  const [webMode, setWebMode] = useState(() => !native && shouldUseMobileWebView(forcedWeb, forcedReview));
  const [previewDeviceId, setPreviewDeviceId] = useState<MobileDeviceId>(() => params.get("device") === "pixel-10" ? "pixel-10" : "iphone");
  const [viewport, setViewport] = useState(() => getNativeViewport());
  const [webViewport, setWebViewport] = useState(() => getWebViewport());
  const deviceId = native ? nativeDeviceId : previewDeviceId;
  const setDeviceId = (next: MobileDeviceId) => { if (!native) setPreviewDeviceId(next); };
  const baseDevice = mobileDevices[deviceId];
  const device = native
    ? {
        ...baseDevice,
        geometry: {
          device: { width: viewport.width, height: viewport.height },
          screen: { x: 0, y: 0, width: viewport.width, height: viewport.height, radius: 0 },
          safeArea: { top: viewport.safeTop, bottom: viewport.safeBottom },
          keyboard: { height: 0 },
        },
      }
    : webMode
      ? {
          ...baseDevice,
          geometry: {
            device: { width: webViewport.width, height: webViewport.height },
            screen: { x: 0, y: 0, width: webViewport.width, height: webViewport.height, radius: 0 },
            safeArea: { top: webViewport.safeTop, bottom: webViewport.safeBottom },
            keyboard: { height: 0 },
          },
        }
      : baseDevice;

  useEffect(() => {
    if (native) return;
    const update = () => {
      setWebMode(forcedWeb || (!forcedReview && shouldUseMobileWebView(false, false)));
      setViewport(getNativeViewport());
      setWebViewport(getWebViewport());
    };
    const media = window.matchMedia("(max-width: 600px), ((pointer: coarse) and (max-height: 600px))");
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    window.visualViewport?.addEventListener("resize", update);
    media.addEventListener("change", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      window.visualViewport?.removeEventListener("resize", update);
      media.removeEventListener("change", update);
    };
  }, [forcedReview, forcedWeb, native]);
  const value = useMemo(
    () => ({ device, deviceId, setDeviceId, native, webMode }),
    [device, deviceId, native, webMode],
  );

  return <MobileDeviceContext.Provider value={value}>{children}</MobileDeviceContext.Provider>;
}

function getNativeViewport() {
  if (typeof window === "undefined") return { width: 393, height: 852, safeTop: 0, safeBottom: 0 };
  const root = getComputedStyle(document.documentElement);
  const safeTop = Number.parseFloat(root.getPropertyValue("--native-safe-area-top")) || 0;
  const safeBottom = Number.parseFloat(root.getPropertyValue("--native-safe-area-bottom")) || 0;
  return { width: window.innerWidth, height: window.innerHeight, safeTop, safeBottom };
}

function getWebViewport() {
  if (typeof window === "undefined") return { width: 393, height: 852, safeTop: 0, safeBottom: 0 };
  const root = getComputedStyle(document.documentElement);
  const safeTop = Number.parseFloat(root.getPropertyValue("--web-safe-area-top")) || 0;
  const safeBottom = Number.parseFloat(root.getPropertyValue("--web-safe-area-bottom")) || 0;
  const visual = window.visualViewport;
  return {
    width: Math.round(visual?.width ?? window.innerWidth),
    height: Math.round(visual?.height ?? window.innerHeight),
    safeTop,
    safeBottom,
  };
}

function shouldUseMobileWebView(forcedWeb: boolean, forcedReview: boolean) {
  if (typeof window === "undefined" || forcedReview) return false;
  if (forcedWeb) return true;
  return window.matchMedia("(max-width: 600px), ((pointer: coarse) and (max-height: 600px))").matches;
}

export function useMobileDevice() {
  const context = useContext(MobileDeviceContext);

  if (!context) {
    throw new Error("useMobileDevice must be used inside MobileDeviceProvider");
  }

  return context;
}

export function DevicePicker() {
  const { device, deviceId, setDeviceId, native, webMode } = useMobileDevice();

  if (native || webMode) return null;

  return (
    <DropdownMenu.Root>
      <div className="device-menu-bar" data-testid="device-menu-bar">
        <DropdownMenu.Trigger asChild>
          <button
            className="device-picker-trigger"
            data-testid="device-picker"
            aria-label={`Preview device: ${device.label}`}
            type="button"
          >
            <span>{device.label}</span>
            <ChevronDownIcon aria-hidden="true" />
          </button>
        </DropdownMenu.Trigger>
      </div>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="device-picker-menu" align="end" sideOffset={8} collisionPadding={12}>
          <DropdownMenu.RadioGroup
            value={deviceId}
            onValueChange={(value) => setDeviceId(value as MobileDeviceId)}
          >
            {Object.values(mobileDevices).map((option) => (
              <DropdownMenu.RadioItem
                key={option.id}
                className="device-picker-item"
                value={option.id}
                data-testid={`device-option-${option.id}`}
              >
                <span>{option.label}</span>
                <DropdownMenu.ItemIndicator className="device-picker-check">
                  <CheckIcon aria-hidden="true" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
