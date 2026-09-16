@AGENTS.md

# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

# 이 저장소의 규칙

위 일반 원칙에 더해, **이 저장소에서 반드시 지켜야 하는 규칙은 `.claude/rules/`(= `.cursor/rules/`)에 있다.** 작업을 시작하기 전에 읽는다. Cursor 와 Claude Code 가 같은 파일을 읽도록 심볼릭 링크로 묶어 두었다.

| 파일 | 내용 |
| --- | --- |
| `constitution.mdc` | 위반하면 머지되지 않는 절대 규칙 요약. 각 항목에 무엇이 막는지 적혀 있다 |
| `imports.mdc` | import 방향 `app → components → lib`, 순환 금지, `@/` 별칭, 서버/클라이언트 경계 |
| `supabase.mdc` | 마이그레이션은 `supabase migration new` 로만, 기존 파일 불변, RLS 필수, 머지 후 `db push` |
| `git-workflow.mdc` | 브랜치, 커밋 전 검증, PR base, 머지 방식 |
| `ai-behavior.mdc` | 추측 금지, 검증, 실수 대응, 읽는 사람 눈높이의 글쓰기 |
| `design.mdc` | 어드민 토큰·컴포넌트 어휘, 사이트와의 분리 (상세: 루트 `DESIGN.md`) |

규칙은 문서로만 두지 않고 기계가 막는다.

- **CI** (`.github/workflows/ci.yml`): `pnpm check:migrations` → lint → typecheck → build. 하나라도 실패하면 머지 불가.
- **Claude Code 훅** (`.claude/hooks/guard-db.sh`): `supabase/migrations/` 에 파일 직접 생성, `db reset --linked`, 원격 DB 파괴 SQL 을 거부하고 `db push` 는 확인을 받는다.
- **ESLint** (`eslint.config.mjs`): 순환·역방향·상대경로 import 를 오류로 잡는다.

규칙을 어겨야 하는 상황이면 우회하지 말고 사용자에게 이유를 말하고 규칙 파일을 함께 고친다.
