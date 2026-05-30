import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export function GlassCard({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn(
        "rounded-2xl border border-white/70 bg-white/80 p-4 shadow-[0_8px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl sm:p-5",
        className,
      )}
    >
      {children}
    </section>
  );
}
