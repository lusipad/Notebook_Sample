"use client";

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

mermaid.initialize({
  startOnLoad: false,
  theme: "neutral",
  securityLevel: "loose",
  fontFamily: "inherit",
});

export default function MermaidDiagram({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState("");

  useEffect(() => {
    if (ref.current) {
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      mermaid.render(id, code).then(({ svg }) => {
        setSvg(svg);
      }).catch((error) => {
        console.error("Mermaid render failed:", error);
        setSvg(`<div class="text-red-500 text-sm p-2">图表渲染失败</div>`);
      });
    }
  }, [code]);

  return (
    <div 
      ref={ref}
      className="my-4 overflow-x-auto bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700/50 flex justify-center"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
