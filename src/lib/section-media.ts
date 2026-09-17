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
export const WEB_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function uploadSectionMedia(
  folder: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  // 브라우저가 그릴 수 있는 형식만. HEIC(아이폰 기본)는 올라가도 사이트에서 빈 칸으로 보인다.
  if (!WEB_IMAGE_TYPES.has(file.type)) {
    const isHeic = /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
    return {
      error: isHeic
        ? "아이폰 사진(HEIC)은 웹에서 보이지 않습니다. 아이폰 설정 → 카메라 → 포맷을 '높은 호환성'으로 바꾸거나, JPG 로 변환해 올려 주세요."
        : "JPG · PNG · WebP · GIF 이미지만 올릴 수 있습니다.",
    };
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
