import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.nilaza.motchutyoga",
  appName: "Một chút yoga",
  webDir: "dist/client",
  plugins: {
    Keyboard: {
      resize: "native",
    },
    StatusBar: {
      overlaysWebView: false,
      style: "LIGHT",
      backgroundColor: "#f6f0e8",
    },
  },
};

export default config;
