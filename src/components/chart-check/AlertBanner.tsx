import { cn } from "@/lib/cn";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import type { ReactNode } from "react";

type Variant = "error" | "warning" | "info";

const STYLES: Record<
  Variant,
  { box: string; icon: string; Icon: typeof AlertCircle }
> = {
  error: {
    box: "border-rose-200/80 bg-rose-50/90 text-rose-900",
    icon: "text-rose-600",
    Icon: AlertCircle,
  },
  warning: {
    box: "border-amber-200/80 bg-amber-50/90 text-amber-950",
    icon: "text-amber-600",
    Icon: AlertTriangle,
  },
  info: {
    box: "border-sky-200/80 bg-sky-50/90 text-sky-950",
    icon: "text-sky-600",
    Icon: Info,
  },
};

export function AlertBanner({
  variant,
  title,
  children,
  action,
  className,
}: {
  variant: Variant;
  title?: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const { box, icon, Icon } = STYLES[variant];

  return (
    <div
      className={cn(
        "flex gap-3 rounded-xl border px-4 py-3 text-sm",
        box,
        className,
      )}
      role={variant === "error" ? "alert" : "status"}
      aria-live="polite"
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <div className={cn(title && "mt-1", "leading-relaxed")}>{children}</div>
        {action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}
