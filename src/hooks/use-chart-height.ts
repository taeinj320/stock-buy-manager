"use client";

import { useEffect, useState } from "react";

const MIN = 280;
const MAX_DESKTOP = 560;
const MAX_MOBILE = 420;

export function useChartHeight() {
  const [height, setHeight] = useState(480);

  useEffect(() => {
    function update() {
      const mobile = window.innerWidth < 640;
      const cap = mobile ? MAX_MOBILE : MAX_DESKTOP;
      const ratio = mobile ? 0.42 : 0.48;
      const next = Math.round(
        Math.min(cap, Math.max(MIN, window.innerHeight * ratio)),
      );
      setHeight(next);
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return height;
}
