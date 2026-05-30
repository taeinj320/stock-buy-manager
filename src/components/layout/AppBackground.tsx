export function AppBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-sky-50/50 to-indigo-50/40" />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "url(/decor/grid-pattern.svg)",
          backgroundSize: "24px 24px",
        }}
      />
      <div className="absolute -right-20 top-0 h-72 w-72 rounded-full bg-sky-300/25 blur-3xl" />
      <div className="absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-indigo-300/20 blur-3xl" />
      <div className="absolute left-1/2 top-1/3 h-48 w-48 -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />
    </div>
  );
}
