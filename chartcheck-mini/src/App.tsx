import { useEffect, useState } from "react";
import { ChartCheckNative } from "./ChartCheckNative";
import "./App.css";

const WEB_URL = (
  import.meta.env.VITE_WEB_URL?.replace(/\/$/, "") ||
  "https://stock-buy-manager.vercel.app"
).replace(/\/$/, "");

/** true면 Vercel 리다이렉트 없이 TDS 네이티브만 (QA·오프라인) */
const FORCE_NATIVE = import.meta.env.VITE_BOOT_MODE === "native";

function webUrlWithTag() {
  const u = new URL(WEB_URL);
  u.searchParams.set("toss_mini", "1");
  return u.toString();
}

function BootScreen({ message }: { message: string }) {
  return (
    <div className="boot-screen">
      <p className="boot-title">차트체크</p>
      <p className="boot-message">{message}</p>
    </div>
  );
}

/**
 * 토스 WebView: iframe은 차단되는 경우가 많아 프로덕션에서는 Vercel로 직접 이동.
 * 이동 실패 시 TDS + API(차트·뉴스) 네이티브 UI로 폴백.
 */
function App() {
  const [phase, setPhase] = useState<"boot" | "native">(
    FORCE_NATIVE ? "native" : "boot",
  );

  useEffect(() => {
    if (FORCE_NATIVE) return;

    const target = webUrlWithTag();
    if (window.location.href.startsWith(WEB_URL)) {
      return;
    }

    const before = window.location.href;
    try {
      window.location.replace(target);
    } catch {
      setPhase("native");
      return;
    }

    const timer = window.setTimeout(() => {
      if (window.location.href === before) {
        setPhase("native");
      }
    }, 2800);

    return () => window.clearTimeout(timer);
  }, []);

  if (phase === "native") {
    return <ChartCheckNative />;
  }

  return <BootScreen message="ChartCheck 불러오는 중…" />;
}

export default App;
