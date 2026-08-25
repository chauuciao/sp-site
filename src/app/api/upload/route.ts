import { put } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";
import { getOwnerSession } from "@/lib/session";

export const runtime = "nodejs";

/**
 * Image upload for owners. Raw image bytes in the body (client downscales
 * to ≤2048px first), re-encoded to WebP via sharp when available, stored
 * in Vercel Blob (public store sp-site-images).
 *
 * sharp is a native module and has failed to load in production before
 * (missing linux binaries) — if it can't load, the client-downscaled
 * bytes are stored as-is rather than failing the upload. next/image
 * optimizes on delivery either way.
 *
 *   POST /api/upload?kind=cover|body&docId=…   body: image bytes
 *   → { url, width, height }
 *   GET  /api/upload  → { sharp: boolean }  (deploy healthcheck)
 */
const LIMITS = { cover: 900, body: 1600 } as const;
const MAX_BYTES = 15 * 1024 * 1024;

type SharpModule = (typeof import("sharp"))["default"];

async function loadSharp(): Promise<SharpModule | null> {
  try {
    return (await import("sharp")).default;
  } catch (e) {
    console.error("sharp unavailable, storing originals:", (e as Error).message);
    return null;
  }
}

export async function GET() {
  const sharp = await loadSharp();
  return NextResponse.json({ sharp: !!sharp });
}

export async function POST(req: NextRequest) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind") === "cover" ? "cover" : "body";
  const docId = (req.nextUrl.searchParams.get("docId") ?? "misc").replace(/[^\w-]/g, "");

  const raw = Buffer.from(await req.arrayBuffer());
  if (raw.length === 0 || raw.length > MAX_BYTES) {
    return NextResponse.json({ error: "bad size" }, { status: 413 });
  }

  const sharp = await loadSharp();
  let out = raw;
  let contentType = req.headers.get("content-type") ?? "application/octet-stream";
  let ext = contentType.includes("png") ? "png" : "jpg";
  let width: number | undefined;
  let height: number | undefined;

  if (sharp) {
    try {
      out = await sharp(raw)
        .rotate()
        .resize({ width: LIMITS[kind], withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const meta = await sharp(out).metadata();
      width = meta.width;
      height = meta.height;
      contentType = "image/webp";
      ext = "webp";
    } catch {
      return NextResponse.json({ error: "not an image" }, { status: 415 });
    }
  } else if (!contentType.startsWith("image/")) {
    // no sharp to sniff bytes — at least require an image content type
    return NextResponse.json({ error: "not an image" }, { status: 415 });
  }

  const path =
    kind === "cover"
      ? `covers/${docId}.${ext}`
      : `body/${docId}/${Date.now().toString(36)}.${ext}`;

  try {
    const blob = await put(path, out, {
      access: "public",
      contentType,
      addRandomSuffix: true, // cache-safe: replacements get fresh URLs
    });
    return NextResponse.json({ url: blob.url, width, height });
  } catch (e) {
    console.error("upload failed:", (e as Error).message);
    return NextResponse.json(
      { error: "storage unavailable — check BLOB_READ_WRITE_TOKEN" },
      { status: 503 },
    );
  }
}
