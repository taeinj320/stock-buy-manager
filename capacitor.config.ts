import type { CapacitorConfig } from "@capacitor/cli";

/**
 * 프로덕션 URL을 WebView에 로드합니다.
 * 웹(Vercel)을 수정하면 앱에도 자동 반영됩니다.
 * 로컬 개발 시 server.url 을 주석 처리하고 cap run 하세요.
 */
const config: CapacitorConfig = {
  appId: "com.chartcheck.app",
  appName: "ChartCheck",
  webDir: "public",
  server: {
    url: "https://stock-buy-manager.vercel.app",
    cleartext: false,
  },
  android: {
    allowMixedContent: false,
  },
  ios: {
    contentInset: "automatic",
  },
};

export default config;
