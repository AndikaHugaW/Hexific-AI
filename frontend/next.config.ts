import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Webpack is now the primary engine via --webpack flag in package.json
  // This avoids Turbopack symlink issues on Windows
};

export default nextConfig;
