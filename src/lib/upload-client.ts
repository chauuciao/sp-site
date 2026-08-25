"use client";

/**
 * Browser-side image upload: downscale on a canvas (keeps the request under
 * Vercel's body cap and saves bandwidth), then POST bytes to /api/upload.
 */
export async function uploadImage(
  file: File,
  opts: { kind: "cover" | "body"; docId: string },
): Promise<{ url: string; width: number; height: number }> {
  const blob = await downscale(file, 2048);

  // downscale failed to decode (HEIC/HEIF etc.) and the original is too
  // big or undecodable server-side — fail with a message he can act on
  if (blob === file && /hei[cf]/i.test(file.type + file.name)) {
    throw new Error(
      "This photo is in Apple's HEIC format, which the site can't read. In Photos, share/export it as JPEG and try again.",
    );
  }
  if (blob === file && file.size > 4 * 1024 * 1024) {
    throw new Error(
      "This image couldn't be compressed in the browser and is too large to upload. Try a JPG or PNG under 4 MB.",
    );
  }

  const res = await fetch(
    `/api/upload?kind=${opts.kind}&docId=${encodeURIComponent(opts.docId)}`,
    { method: "POST", headers: { "Content-Type": file.type }, body: blob },
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(
      body.error ??
        (res.status === 413
          ? "The image is too large to upload — try a smaller one."
          : res.status === 415
            ? "That file isn't an image format the site can read — use JPG or PNG."
            : `upload failed (${res.status})`),
    );
  }
  return (await res.json()) as { url: string; width: number; height: number };
}

async function downscale(file: File, maxDim: number): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, maxDim / Math.max(bmp.width, bmp.height));
    if (scale === 1 && file.size < 4 * 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise((resolve) =>
      canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.9),
    );
  } catch {
    return file; // non-decodable here; let the server try
  }
}
