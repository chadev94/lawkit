import { createClient } from "@/lib/supabase/client";
import { SECTION_MEDIA_BUCKET } from "@/lib/section-content";

function extensionOf(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  return "jpg";
}

/**
 * section-media 버킷에 이미지를 업로드하고 storage path 를 반환한다.
 * folder 는 보통 page_section_id 또는 'draft'.
 */
export async function uploadSectionMedia(
  folder: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  if (!file.type.startsWith("image/")) {
    return { error: "이미지 파일만 업로드할 수 있습니다." };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { error: "이미지는 5MB 이하만 업로드할 수 있습니다." };
  }

  const supabase = createClient();
  const path = `${folder}/${crypto.randomUUID()}.${extensionOf(file)}`;
  const { error } = await supabase.storage
    .from(SECTION_MEDIA_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });

  if (error) return { error: error.message };
  return { path };
}
