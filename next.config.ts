import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // M0 spike: BlockNote's docs have historically warned about React 19 StrictMode.
  // We keep this ON deliberately — if BlockNote can't survive it, we want to know now.
  reactStrictMode: true,
  // @blocknote/server-util pulls in heavy DOM-shim deps and must stay unbundled.
  serverExternalPackages: ["@blocknote/server-util"],
};

export default nextConfig;
