import { defineConfig } from "@apps-in-toss/web-framework/config";

export default defineConfig({
  appName: "chartcheck",
  brand: {
    displayName: "차트체크",
    primaryColor: "#0ea5e9",
    icon: "https://stock-buy-manager.vercel.app/store-assets/app-logo.png",
  },
  web: {
    host: "localhost",
    port: 5173,
    commands: {
      dev: "vite dev",
      build: "vite build",
    },
  },
  permissions: [],
  outdir: "dist",
  webViewProps: {
    type: "partner",
  },
});
