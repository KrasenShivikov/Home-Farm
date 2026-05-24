import type React from "react";

type AppIconName =
  | "bar-chart"
  | "home"
  | "leaf"
  | "log-in"
  | "log-out"
  | "package"
  | "shopping-cart"
  | "sprout"
  | "user"
  | "user-plus"
  | "wallet";

type AppIconProps = {
  name: AppIconName;
  className?: string;
  size?: number;
};

const paths: Record<AppIconName, React.ReactNode> = {
  "bar-chart": (
    <>
      <path d="M4 19V9" />
      <path d="M12 19V5" />
      <path d="M20 19v-7" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 21c8-2 14-8 16-18-10 1-17 6-18 16" />
      <path d="M5 21c3-6 7-9 13-12" />
    </>
  ),
  "log-in": (
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <path d="m10 17 5-5-5-5" />
      <path d="M15 12H3" />
    </>
  ),
  "log-out": (
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  package: (
    <>
      <path d="m21 8-9-5-9 5 9 5 9-5Z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </>
  ),
  "shopping-cart": (
    <>
      <path d="M6 6h15l-2 8H8L6 3H3" />
      <path d="M9 20h.01" />
      <path d="M18 20h.01" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21V11" />
      <path d="M12 11C7 11 4 8 4 3c5 0 8 3 8 8Z" />
      <path d="M12 14c5 0 8-3 8-8-5 0-8 3-8 8Z" />
    </>
  ),
  user: (
    <>
      <path d="M20 21a8 8 0 0 0-16 0" />
      <path d="M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
    </>
  ),
  "user-plus": (
    <>
      <path d="M16 21a7 7 0 0 0-14 0" />
      <path d="M9 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />
      <path d="M19 8v6" />
      <path d="M22 11h-6" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 7V5a2 2 0 0 0-2-2H5a3 3 0 0 0 0 6h15v10H5a3 3 0 0 1-3-3V6" />
      <path d="M16 14h.01" />
    </>
  ),
};

export default function AppIcon({ className, name, size = 16 }: AppIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        {paths[name]}
      </g>
    </svg>
  );
}
