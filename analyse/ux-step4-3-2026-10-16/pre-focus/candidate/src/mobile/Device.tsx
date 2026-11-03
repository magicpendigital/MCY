import { createContext, lazy, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { mobileAssets } from "./assets";
import { iphoneGeometry, pixelGeometry, type MobileDeviceGeometry } from "./geometry";

const AUTOMATIC_WEB_SURFACE_QUERY = "(max-width: 600px), ((pointer: coarse) and (max-height: 600px)), (min-width: 900px)";

export type MobileDeviceId = "iphone" | "pixel-10";

export const DevicePicker = lazy(() => import("./DevicePicker").then(module => ({ default: module.DevicePicker })));

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
  const [webMode, setWebMode] = useState(() => !native && shouldUseWebSurface(forcedWeb, forcedReview));
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
      setWebMode(forcedWeb || (!forcedReview && shouldUseWebSurface(false, false)));
      setViewport(getNativeViewport());
      setWebViewport(getWebViewport());
    };
    const media = window.matchMedia(AUTOMATIC_WEB_SURFACE_QUERY);
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

function shouldUseWebSurface(forcedWeb: boolean, forcedReview: boolean) {
  if (typeof window === "undefined" || forcedReview) return false;
  if (forcedWeb) return true;
  return window.matchMedia(AUTOMATIC_WEB_SURFACE_QUERY).matches;
}

export function useMobileDevice() {
  const context = useContext(MobileDeviceContext);

  if (!context) {
    throw new Error("useMobileDevice must be used inside MobileDeviceProvider");
  }

  return context;
}
