import { getAccessToken, getSupabase } from "./supabase";

export type CoverUploadResult = { key: string; publicUrl: string };
export type PdfUploadResult = { key: string };
type Bucket = "covers" | "books";
type Extension = "png" | "jpg" | "jpeg" | "webp" | "pdf";
type SignedUpload = { bucket: Bucket; path: string; token: string };

async function createSignedUpload(bucket: Bucket, extension: Extension): Promise<SignedUpload> {
  const token = getAccessToken();
  if (!token) throw new Error("You must be signed in to upload files.");
  const response = await fetch("/api/trpc/admin.createUploadUrl?batch=1", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ 0: { json: { bucket, extension } } }),
  });
  if (!response.ok) throw new Error(`Upload authorization failed (${response.status}).`);
  const payload = (await response.json()) as Array<{
    result?: { data?: { json?: SignedUpload } };
    error?: { json?: { message?: string } };
  }>;
  const message = payload[0]?.error?.json?.message;
  if (message) throw new Error(message);
  const data = payload[0]?.result?.data?.json;
  if (!data?.token || !data.path) throw new Error("Upload authorization returned no signed URL.");
  return data;
}

export async function uploadCoverFile(file: File): Promise<CoverUploadResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const rawExt = (file.name.split(".").pop() ?? "png").toLowerCase();
  const extension: Extension = ["png", "jpg", "jpeg", "webp"].includes(rawExt)
    ? (rawExt as Extension)
    : "png";
  const signed = await createSignedUpload("covers", extension);
  const { error } = await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path, signed.token, file);
  if (error) throw error;
  const { data } = supabase.storage.from("covers").getPublicUrl(signed.path);
  return { key: signed.path, publicUrl: data.publicUrl };
}

export async function uploadPdfFile(file: File): Promise<PdfUploadResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const signed = await createSignedUpload("books", "pdf");
  const { error } = await supabase.storage.from(signed.bucket).uploadToSignedUrl(signed.path, signed.token, file);
  if (error) throw error;
  return { key: signed.path };
}
