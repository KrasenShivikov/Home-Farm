import path from "path";
import dotenv from "dotenv";
import type { NextConfig } from "next";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const workspaceRoot = path.resolve(__dirname, "..");

const nextConfig: NextConfig = {
  // Turbopack expects an absolute path for `root`.
  // Use the workspace root without hardcoding a local OS-specific path.
  turbopack: {
    root: workspaceRoot,
  },
};

export default nextConfig;
