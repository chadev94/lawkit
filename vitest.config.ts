import { defineConfig } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));

/**
 * 렌더 매트릭스 검사용. 브라우저·DB 없이 사이트 컴포넌트를 문자열로 렌더해
 * "어드민에서 고른 값이 실제로 다른 화면을 만드는가"를 확인한다.
 */
export default defineConfig({
  // Vite 8(rolldown/oxc) 은 .tsx 를 자동 런타임 JSX 로 변환한다. 별도 설정 불필요.
  resolve: {
    alias: {
      "@": path.resolve(root, "src"),
      // next/image 는 서버 렌더 문자열 검사에 불필요. 평범한 <img> 로 바꾼다.
      "next/image": path.resolve(root, "qa/stubs/next-image.tsx"),
    },
  },
  test: {
    include: ["qa/render/**/*.test.tsx"],
    environment: "node",
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
    },
  },
});
