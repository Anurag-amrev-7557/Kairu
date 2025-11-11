"use client";

export default function Logo({ size = 40 }) {
  const strokeColor = "#000000";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-300"
    >
      {/* Orbitly minimalist symbol - single orbital */}
      <g stroke={strokeColor} strokeWidth="15" className="transition-colors duration-300">
        {/* Orbital ring */}
        <circle cx="100" cy="100" r="65" fill="none" />
      </g>
    </svg>
  );
}
