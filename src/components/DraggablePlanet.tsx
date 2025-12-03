"use client";

import Image from "next/image";

interface DraggablePlanetProps {
  src: string;
  position: "left" | "right";
  topOffset: string;
  size: string;
  mdSize: string;
  rotation: number;
  blur: number;
}

export default function DraggablePlanet({
  src,
  position,
  topOffset,
  size,
  mdSize,
  rotation,
  blur,
}: DraggablePlanetProps) {
  const positionClasses = position === "left" 
    ? "-left-[60px] lg:-left-[80px]" 
    : "-right-[60px] lg:-right-[80px]";

  return (
    <div
      className={`hidden lg:block fixed ${size} ${mdSize} ${positionClasses} z-0 select-none pointer-events-none overflow-hidden`}
      style={{ top: topOffset }}
    >
      <div
        className="relative w-full h-full"
        style={{ transform: `rotate(${rotation}deg)`, filter: `blur(${blur}px)` }}
      >
        <Image
          alt=""
          className="object-cover pointer-events-none"
          src={src}
          fill
          unoptimized
          draggable={false}
        />
      </div>
    </div>
  );
}
