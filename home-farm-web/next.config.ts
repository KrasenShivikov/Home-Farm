import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack expects an absolute path for `root`.
  // Use the workspace root to silence the inferred-root warning.
  turbopack: {
    root: "C:\\Programming\\Projects\\home-farm",
  },
};

export default nextConfig;
