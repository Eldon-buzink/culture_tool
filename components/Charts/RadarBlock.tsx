"use client";

import dynamic from "next/dynamic";

const RadarInner = dynamic(() => import("./RadarInner"), { ssr: false });

interface RadarBlockProps {
  data: Record<string, number>;
}

export default function RadarBlock({ data }: RadarBlockProps) {
  return (
    <div className="min-h-0 flex items-center justify-center">
      <div className="relative w-full max-w-[540px] aspect-square mx-auto">
        <RadarInner data={data} />
      </div>
    </div>
  );
}
