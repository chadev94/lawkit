import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * 의존성 방향
 *
 *   app/  →  components/  →  lib/
 *
 * 화살표 반대 방향은 금지한다. lib 이 화면을 알게 되면 재사용이 불가능해지고,
 * 순환 의존이 생기기 시작하면 되돌리기 어렵다.
 *
 * app/       라우트와 페이지. 화면 조립만 한다
 * components/ 재사용 UI. 데이터는 props 로 받는다
 * lib/       도메인 로직, 쿼리, 타입. 화면을 모른다
 */
const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,

  {
    // import 플러그인은 eslint-config-next 가 이미 등록한다. 규칙만 덧붙인다.
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
    },
    rules: {
      // 순환 의존 차단. 한번 생기면 빌드가 이상하게 깨지고 원인 추적이 어렵다
      "import/no-cycle": ["error", { maxDepth: Infinity }],

      // 자기 자신 import
      "import/no-self-import": "error",

      // 같은 모듈을 여러 줄로 나눠 import
      "import/no-duplicates": "error",

      // 레이어 역방향 의존 차단
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/lib",
              from: "./src/app",
              message:
                "lib 은 app 을 알 수 없습니다. 필요한 값은 인자로 받으세요.",
            },
            {
              target: "./src/lib",
              from: "./src/components",
              message:
                "lib 은 components 를 알 수 없습니다. 화면 의존을 두지 마세요.",
            },
            {
              target: "./src/components",
              from: "./src/app",
              message:
                "components 는 app 을 알 수 없습니다. 데이터는 props 로 받으세요.",
            },
          ],
        },
      ],

      // 상대경로로 상위 디렉토리를 타고 올라가는 import 금지.
      // ../../ 가 쌓이면 파일을 옮길 때마다 전부 깨진다. @/ 별칭을 쓴다.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message: "상위 디렉토리는 @/ 별칭으로 import 하세요.",
            },
          ],
        },
      ],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
