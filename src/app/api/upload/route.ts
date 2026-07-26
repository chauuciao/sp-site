import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import sharp, { type Metadata } from "sharp";
import { adminBucket } from "@/lib/firebase/admin";
import { getOwnerSession } from "@/lib/session";

export const runtime = "nodejs";

/**
 * Image upload for owners. Raw image bytes in the body (client downscales
 * to ≤2048px first to stay under Vercel's request cap), sharp re-encodes to
 * WebP, lands in Firebase Storage with a download token URL.
 *
 *   POST /api/upload?kind=cover|body&docId=…   body: image bytes
 *   → { url, width, height }
 */
const LIMITS = { cover: 900, body: 1600 } as const;
const MAX_BYTES = 15 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const session = await getOwnerSession();
  if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const kind = req.nextUrl.searchParams.get("kind") === "cover" ? "cover" : "body";
  const docId = (req.nextUrl.searchParams.get("docId") ?? "misc").replace(/[^\w-]/g, "");

  const raw = Buffer.from(await req.arrayBuffer());
  if (raw.length === 0 || raw.length > MAX_BYTES) {
    return NextResponse.json({ error: "bad size" }, { status: 413 });
  }

  let out: Buffer, meta: Metadata;
  try {
    const pipeline = sharp(raw).rotate().resize({
      width: LIMITS[kind],
      withoutEnlargement: true,
    });
    out = await pipeline.webp({ quality: 82 }).toBuffer();
    meta = await sharp(out).metadata();
  } catch {
    return NextResponse.json({ error: "not an image" }, { status: 415 });
  }

  const token = randomUUID();
  const path =
    kind === "cover"
      ? `covers/${docId}.webp`
      : `body/${docId}/${Date.now().toString(36)}.webp`;

  try {
    const file = adminBucket().file(path);
    await file.save(out, {
      contentType: "image/webp",
      metadata: { metadata: { firebaseStorageDownloadTokens: token } },
    });
    const url = `https://firebasestorage.googleapis.com/v0/b/${
      adminBucket().name
    }/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
    return NextResponse.json({ url, width: meta.width, height: meta.height });
  } catch (e) {
    // most likely: Storage not enabled in the Firebase console yet
    console.error("upload failed:", (e as Error).message);
    return NextResponse.json(
      { error: "storage unavailable — is Firebase Storage enabled?" },
      { status: 503 },
    );
  }
}
