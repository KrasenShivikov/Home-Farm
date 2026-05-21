import path from "path";
import dotenv from "dotenv";
import type { NextConfig } from "next";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const nextConfig: NextConfig = {
  // Turbopack expects an absolute path for `root`.
  // Use the workspace root to silence the inferred-root warning.
  turbopack: {
    root: "C:\\Programming\\Projects\\home-farm",
  },
};

export default nextConfig;
