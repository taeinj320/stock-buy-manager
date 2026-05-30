import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export function PrimaryButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={cn(
        "min-h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-600/20 transition hover:from-sky-500 hover:to-indigo-500 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
