"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import {
  colorsFromFormData,
  contentFromFormData,
  typographyFromFormData,
} from "@/lib/site-settings";
import { CHANNEL_META, channelUrlError } from "@/lib/site-channels";

export type ActionState = { error: string | null };

export async function updateSiteSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const colors = colorsFromFormData(formData);
  const typography = typographyFromFormData(formData);
  const content = contentFromFormData(formData);

  // 채널 주소는 그 서비스 도메인이어야 한다. 브라우저 표시는 편의, 여기서 다시 본다.
  for (const channel of content.channels) {
    const problem = channelUrlError(channel.key, channel.url);
    if (problem) {
      return { error: `${CHANNEL_META[channel.key].label}: ${problem}` };
    }
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("site_settings")
    .update({ colors, typography, content })
    .eq("key", "default");

  if (error) return { error: error.message };

  revalidateTag(CACHE_TAGS.siteSettings, "max");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { error: null };
}
