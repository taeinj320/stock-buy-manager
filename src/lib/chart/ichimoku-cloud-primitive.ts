import type { CanvasRenderingTarget2D } from "fancy-canvas";
import type {
  IChartApi,
  ISeriesApi,
  ISeriesPrimitive,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  SeriesAttachedParameter,
  Time,
} from "lightweight-charts";

export interface IchimokuCloudPoint {
  time: string;
  spanA: number;
  spanB: number;
}

export function mergeIchimokuCloudPoints(
  spanA: { time: string; value: number }[],
  spanB: { time: string; value: number }[],
): IchimokuCloudPoint[] {
  const map = new Map<string, { spanA?: number; spanB?: number }>();
  for (const p of spanA) {
    const row = map.get(p.time) ?? {};
    row.spanA = p.value;
    map.set(p.time, row);
  }
  for (const p of spanB) {
    const row = map.get(p.time) ?? {};
    row.spanB = p.value;
    map.set(p.time, row);
  }
  return [...map.entries()]
    .filter(([, v]) => v.spanA != null && v.spanB != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([time, v]) => ({
      time,
      spanA: v.spanA!,
      spanB: v.spanB!,
    }));
}

interface CloudPixelPoint {
  x: number;
  upper: number;
  lower: number;
  bullish: boolean;
}

const BULL_FILL = "rgba(34, 197, 94, 0.28)";
const BEAR_FILL = "rgba(239, 68, 68, 0.28)";

class IchimokuCloudPaneRenderer implements IPrimitivePaneRenderer {
  constructor(private readonly points: CloudPixelPoint[]) {}

  draw() {}

  drawBackground(target: CanvasRenderingTarget2D) {
    if (this.points.length < 2) return;

    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const hr = scope.horizontalPixelRatio;
      const vr = scope.verticalPixelRatio;
      ctx.save();
      ctx.scale(hr, vr);

      for (let i = 0; i < this.points.length - 1; i++) {
        const p0 = this.points[i];
        const p1 = this.points[i + 1];
        if (p0.x < 0 && p1.x < 0) continue;

        ctx.fillStyle = p0.bullish ? BULL_FILL : BEAR_FILL;
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.upper);
        ctx.lineTo(p1.x, p1.upper);
        ctx.lineTo(p1.x, p1.lower);
        ctx.lineTo(p0.x, p0.lower);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    });
  }
}

class IchimokuCloudPaneView implements IPrimitivePaneView {
  private pixelPoints: CloudPixelPoint[] = [];

  constructor(private readonly source: IchimokuCloudPrimitive) {}

  zOrder() {
    return "bottom" as const;
  }

  update() {
    const chart = this.source.chart;
    const series = this.source.series;
    if (!chart || !series) {
      this.pixelPoints = [];
      return;
    }

    const timeScale = chart.timeScale();
    const next: CloudPixelPoint[] = [];
    for (const d of this.source.cloudData) {
      const x = timeScale.timeToCoordinate(d.time as Time);
      const yA = series.priceToCoordinate(d.spanA);
      const yB = series.priceToCoordinate(d.spanB);
      if (x == null || yA == null || yB == null) continue;
      next.push({
        x,
        upper: Math.min(yA, yB),
        lower: Math.max(yA, yB),
        bullish: d.spanA >= d.spanB,
      });
    }
    this.pixelPoints = next;
  }

  renderer() {
    return new IchimokuCloudPaneRenderer(this.pixelPoints);
  }
}

export class IchimokuCloudPrimitive implements ISeriesPrimitive<Time> {
  private readonly paneView: IchimokuCloudPaneView;
  chart: IChartApi | null = null;
  series: ISeriesApi<"Candlestick"> | null = null;
  private requestUpdate?: () => void;

  constructor(public readonly cloudData: IchimokuCloudPoint[]) {
    this.paneView = new IchimokuCloudPaneView(this);
  }

  attached(param: SeriesAttachedParameter<Time, "Candlestick">) {
    this.chart = param.chart;
    this.series = param.series;
    this.requestUpdate = param.requestUpdate;
    this.updateAllViews();
  }

  detached() {
    this.chart = null;
    this.series = null;
    this.requestUpdate = undefined;
  }

  updateAllViews() {
    this.paneView.update();
    this.requestUpdate?.();
  }

  paneViews() {
    return [this.paneView];
  }
}
