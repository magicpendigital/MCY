import { useEffect, type PropsWithChildren } from "react";
import { Capacitor } from "@capacitor/core";
import { Keyboard as NativeKeyboard, KeyboardResize as NativeKeyboardResize } from "@capacitor/keyboard";
import { StatusBar as NativeStatusBar, Style as NativeStatusBarStyle } from "@capacitor/status-bar";
import { MobileDeviceProvider, useMobileDevice } from "./Device";
import { KeyboardDock, KeyboardProvider, useKeyboard } from "./Keyboard";
import { PhoneFrame } from "./PhoneFrame";
import { HomeIndicator, StatusBar } from "./components";

export function MobileRuntime({ children }: PropsWithChildren) {
  return (
    <MobileDeviceProvider>
      <PhoneFrame>
        <KeyboardProvider>
          <RuntimeContent>{children}</RuntimeContent>
        </KeyboardProvider>
      </PhoneFrame>
    </MobileDeviceProvider>
  );
}

function RuntimeContent({ children }: PropsWithChildren) {
  const { device, native } = useMobileDevice();

  useEffect(() => {
    if (!native) return;
    void NativeStatusBar.setOverlaysWebView({ overlay: false });
    void NativeStatusBar.setStyle({ style: NativeStatusBarStyle.Light });
    void NativeStatusBar.setBackgroundColor({ color: "#f6f0e8" });
    if (device.platform === "ios") {
      void NativeKeyboard.setResizeMode({ mode: NativeKeyboardResize.Native });
    }
  }, [native, device.platform]);

  return (
    <>
      {!native && <KeyboardPreview />}
      {!native && <StatusBar />}
      <MobileAppViewport>{children}</MobileAppViewport>
      {!native && <HomeIndicator />}
      {!native && <KeyboardDock />}
    </>
  );
}

function MobileAppViewport({ children }: PropsWithChildren) {
  const { device } = useMobileDevice();
  const keyboard = useKeyboard();

  return (
    <div
      className="mobile-app-viewport"
      data-keyboard-visible={keyboard.visible ? "true" : "false"}
      data-native={Capacitor.isNativePlatform() ? "true" : "false"}
      data-platform={device.platform}
      data-testid="mobile-app-viewport"
    >
      {children}
    </div>
  );
}

function KeyboardPreview() {
  const keyboard = useKeyboard();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("keyboard") === "1") {
      keyboard.show();
    }
  }, [keyboard]);

  return null;
}
