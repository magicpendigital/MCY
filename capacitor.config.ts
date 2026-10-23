import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.magicpendigital.motchutyoga",
  appName: "Một chút yoga",
  webDir: process.env.MCY_CAPACITOR_WEB_DIR || "dist/client",
  plugins: {
    Keyboard: {
      resize: "native",
    },
    StatusBar: {
      overlaysWebView: false,
      style: "LIGHT",
      backgroundColor: "#fffcf7",
    },
  },
};

export default config;
