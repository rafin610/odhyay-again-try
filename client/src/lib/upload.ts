import { getSupabase } from "./supabase";

export type CoverUploadResult = { key: string; publicUrl: string };
export type PdfUploadResult = { key: string };

export async function uploadCoverFile(file: File): Promise<CoverUploadResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase();
  const key = `covers/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("covers")
    .upload(key, file, { upsert: true, contentType: file.type || "image/png" });
  if (error) throw error;
  const { data } = supabase.storage.from("covers").getPublicUrl(key);
  return { key, publicUrl: data.publicUrl };
}

export async function uploadPdfFile(file: File): Promise<PdfUploadResult> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Supabase is not configured.");
  const key = `books/${crypto.randomUUID()}.pdf`;
  const { error } = await supabase.storage
    .from("books")
    .upload(key, file, { upsert: true, contentType: "application/pdf" });
  if (error) throw error;
  return { key };
}