import { apiRequest } from "./client";

type PresignResponse = {
  presignedUrl: string;
  publicUrl: string;
  objectKey: string;
};

/** presign 발급 → S3 직접 PUT → 공개 URL 반환. */
export async function uploadImage(
  token: string,
  file: File,
  folder = "purchase-evidence",
): Promise<string> {
  const presign = await apiRequest<PresignResponse>("/api/upload/presign", {
    method: "POST",
    token,
    body: { filename: file.name, contentType: file.type, folder },
  });

  const res = await fetch(presign.presignedUrl, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });
  if (!res.ok) {
    throw new Error(`S3 업로드 실패 (${res.status})`);
  }
  return presign.publicUrl;
}
