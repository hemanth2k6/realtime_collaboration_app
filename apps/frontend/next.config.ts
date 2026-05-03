import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "standalone",
  /**
   * Monorepo root for standalone file tracing.
   * Resolved at build time: in the Docker builder (`WORKDIR /app`) this becomes `/app`.
   * On your machine it becomes the repo root — always build the image in Docker for deployment.
   */
  outputFileTracingRoot: path.join(__dirname, "..", ".."),
};

export default nextConfig;
