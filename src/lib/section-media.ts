import { createClient } from "@/lib/supabase/client";
import { SECTION_MEDIA_BUCKET } from "@/lib/section-content";

function extensionOf(file: File): string {
  const fromName = file.name.split(".").pop()?.toLowerCase();
  if (fromName && /^[a-z0-9]+$/.test(fromName)) return fromName;
  if (file.type === "image/png") return "png";
  if (file.type === "image/webp") return "webp";
  if (file.type === "image/gif") return "gif";
  if (file.type === "video/webm") return "webm";
  if (file.type === "video/mp4") return "mp4";
  return "jpg";
}

/**
 * section-media 버킷에 이미지·영상을 업로드하고 storage path 를 반환한다.
 * folder 는 보통 page_section_id 또는 'draft'.
 * 버킷 MIME·용량 한도는 마이그레이션 allow_section_media_video 와 맞춘다.
 */
export const WEB_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export const WEB_VIDEO_TYPES = new Set(["video/mp4", "video/webm"]);

const MAX_BYTES = 20 * 1024 * 1024;

export async function uploadSectionMedia(
  folder: string,
  file: File,
): Promise<{ path: string } | { error: string }> {
  const isImage = WEB_IMAGE_TYPES.has(file.type);
  const isVideo = WEB_VIDEO_TYPES.has(file.type);

  // 브라우저가 그릴 수 있는 형식만. HEIC(아이폰 기본)는 올라가도 사이트에서 빈 칸으로 보인다.
  if (!isImage && !isVideo) {
    const isHeic = /hei[cf]/i.test(file.type) || /\.hei[cf]$/i.test(file.name);
    return {
      error: isHeic
        ? "아이폰 사진(HEIC)은 웹에서 보이지 않습니다. 아이폰 설정 → 카메라 → 포맷을 '높은 호환성'으로 바꾸거나, JPG 로 변환해 올려 주세요."
        : "JPG · PNG · WebP · GIF 이미지 또는 MP4 · WebM 영상만 올릴 수 있습니다.",
    };
  }
  if (file.size > MAX_BYTES) {
    return {
      error: isVideo
        ? "영상은 20MB 이하만 업로드할 수 있습니다."
        : "이미지는 20MB 이하만 업로드할 수 있습니다.",
    };
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
