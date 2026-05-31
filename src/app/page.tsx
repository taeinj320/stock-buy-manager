import { ChartCheckApp } from "@/components/chart-check/ChartCheckApp";
import { AppBackground } from "@/components/layout/AppBackground";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ toss_mini?: string }>;
}) {
  const params = await searchParams;
  const inTossMini = params.toss_mini === "1";

  return (
    <div className="relative min-h-[100dvh]">
      <AppBackground />
      <ChartCheckApp inTossMini={inTossMini} />
    </div>
  );
}
