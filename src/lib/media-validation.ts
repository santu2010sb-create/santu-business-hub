export const ALLOWED_IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2 MB, matches the storage bucket limit

const EXT_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export type ImageCheck = { ok: true; ext: string } | { ok: false; error: string };

export function validateImageFile(file: { type: string; size: number }): ImageCheck {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: "Please upload a PNG, JPG or WebP image." };
  }
  if (file.size <= 0) return { ok: false, error: "This file is empty." };
  if (file.size > MAX_IMAGE_BYTES) {
    return { ok: false, error: "Images must be 2 MB or smaller." };
  }
  return { ok: true, ext: EXT_BY_TYPE[file.type] };
}

/** Storage file names are flat: <uuid>.<ext>. The media route only serves names of this shape. */
export const MEDIA_PATH_PATTERN = /^[0-9a-f-]{36}\.(png|jpg|webp)$/;

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}
