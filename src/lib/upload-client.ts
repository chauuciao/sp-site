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
  const res = await fetch(
    `/api/upload?kind=${opts.kind}&docId=${encodeURIComponent(opts.docId)}`,
    { method: "POST", headers: { "Content-Type": file.type }, body: blob },
  );
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `upload failed (${res.status})`);
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
