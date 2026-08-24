import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // M0 spike: BlockNote's docs have historically warned about React 19 StrictMode.
  // We keep this ON deliberately — if BlockNote can't survive it, we want to know now.
  reactStrictMode: true,
  // @blocknote/server-util pulls in heavy DOM-shim deps and must stay unbundled.
  serverExternalPackages: ["@blocknote/server-util"],
  // firebase-admin is on Next's default external list, but externalized it
  // fails on Vercel: jwks-rsa (CJS) require()s jose (ESM) → ERR_REQUIRE_ESM.
  // Bundling it lets the bundler shim the interop. (Worked locally only
  // because Node 24's require(esm) is more permissive.)
  transpilePackages: ["firebase-admin"],
  images: {
    remotePatterns: [
      // uploaded covers / body images served from Vercel Blob
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
