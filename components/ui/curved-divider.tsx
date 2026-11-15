import React from "react";

interface CurvedDividerProps {
  /** Color class for the curve path, e.g. text-lavender, text-butter, text-mint, text-cream */
  fillColor?: string;
  className?: string;
  flip?: boolean;
}

export function CurvedDivider({
  fillColor = "text-lavender",
  className = "",
  flip = false,
}: CurvedDividerProps) {
  return (
    <div
      className={`relative w-full overflow-hidden leading-none select-none pointer-events-none ${className} ${
        flip ? "rotate-180" : ""
      }`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className={`block w-full h-8 sm:h-12 lg:h-14 ${fillColor}`}
      >
        <path
          d="M0,0 C480,48 960,48 1440,0 L1440,48 L0,48 Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
