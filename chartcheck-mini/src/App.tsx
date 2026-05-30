import "./App.css";

const WEB_URL =
  import.meta.env.VITE_WEB_URL?.replace(/\/$/, "") ||
  "https://stock-buy-manager.vercel.app";

/**
 * 앱인토스 WebView 안에서 웹과 동일한 ChartCheck(Vercel)를 표시합니다.
 * API·차트·뉴스·공시는 웹과 같은 코드 경로를 사용합니다.
 */
function App() {
  return (
    <iframe
      className="web-frame"
      title="ChartCheck"
      src={WEB_URL}
      allow="clipboard-read; clipboard-write"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
    />
  );
}

export default App;
