import { ChartCheckApp } from "@/components/chart-check/ChartCheckApp";
import { AppBackground } from "@/components/layout/AppBackground";

export default function Home() {
  return (
    <div className="relative min-h-[100dvh]">
      <AppBackground />
      <ChartCheckApp />
    </div>
  );
}
