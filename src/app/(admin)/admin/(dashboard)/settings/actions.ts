"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { createClient } from "@/lib/supabase/server";
import {
  colorsFromFormData,
  contentFromFormData,
  typographyFromFormData,
} from "@/lib/site-settings";

export type ActionState = { error: string | null };

export async function updateSiteSettings(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const colors = colorsFromFormData(formData);
  const typography = typographyFromFormData(formData);
  const content = contentFromFormData(formData);

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
