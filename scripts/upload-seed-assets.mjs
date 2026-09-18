/**
 * 시드 이미지를 section-media 버킷에 업로드한다.
 *
 * 필요: .env.local 에 SUPABASE_SERVICE_ROLE_KEY
 *
 *   node --env-file=.env.local scripts/upload-seed-assets.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = "section-media";
const root = join(process.cwd(), "scripts/seed-assets");
const prefix = "seed";

if (!url || !serviceKey) {
  console.error(
    "NEXT_PUBLIC_SUPABASE_URL 과 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function contentType(file) {
  if (file.endsWith(".png")) return "image/png";
  if (file.endsWith(".webp")) return "image/webp";
  if (file.endsWith(".gif")) return "image/gif";
  return "image/jpeg";
}

const files = walk(root);
const uploaded = [];

for (const file of files) {
  const rel = relative(root, file).replaceAll("\\", "/");
  const path = `${prefix}/${rel}`;
  const body = readFileSync(file);
  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    contentType: contentType(file),
    upsert: true,
    cacheControl: "3600",
  });
  if (error) {
    console.error("FAIL", path, error.message);
    process.exit(1);
  }
  console.log("OK", path, body.length);
  uploaded.push(path);
}

console.log(`\nuploaded ${uploaded.length} files under ${prefix}/`);
