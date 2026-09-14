#!/usr/bin/env bash
# 마이그레이션 파일 검사. CI 와 로컬(pnpm check:migrations)에서 같은 스크립트를 쓴다.
#
# 무엇을 막나
#   1. 파일명 형식이 YYYYMMDDHHMMSS_snake_case.sql 이 아닌 것
#   2. 타임스탬프 초(SS)가 00 인 것 — 손으로 지어낸 이름의 흔적. 진짜 `supabase migration new` 가
#      정각에 걸릴 확률은 1/60 이고, 그때는 다시 생성하면 된다
#   3. 새 파일의 타임스탬프가 기존 최신보다 앞선 것 — 적용 순서가 환경마다 달라진다
#   4. 이미 있는 마이그레이션의 수정·삭제·이름 변경 — 원격 적용 이력과 어긋난다
#   5. create table 이 있는데 enable row level security 가 같은 파일에 없는 것 — RLS 없는 테이블은 전체 공개다
#   6. 같은 타임스탬프가 둘 이상
#
# 비교 기준(base)
#   PR CI : origin/<base 브랜치>  (GITHUB_BASE_REF). base 가 production 이면 origin/main
#   로컬  : 인자로 준 ref, 없으면 origin/main
#   base 를 못 찾으면 변경분 검사(3,4)는 건너뛰고 전체 형식 검사(1,2,5,6)만 한다.

set -euo pipefail

DIR="supabase/migrations"
PATTERN='^[0-9]{14}_[a-z0-9_]+\.sql$'
fail=0

red()   { printf '\033[31m%s\033[0m\n' "$*"; }
green() { printf '\033[32m%s\033[0m\n' "$*"; }

err() { red "✗ $1"; fail=1; }

[ -d "$DIR" ] || { green "✓ $DIR 없음. 검사할 것이 없다."; exit 0; }

# ── base 결정 ────────────────────────────────────────────────────────────
base=""
if [ "${GITHUB_BASE_REF:-}" = "production" ]; then
  # release PR(main → production). 마이그레이션은 이미 main 에서 검사·머지·원격 적용을 거쳤다.
  # production 과 비교하면 그 파일들이 전부 "새 파일" 로 잡히므로 main 을 기준으로 본다.
  base="origin/main"
elif [ -n "${GITHUB_BASE_REF:-}" ]; then
  base="origin/${GITHUB_BASE_REF}"
elif [ -n "${1:-}" ]; then
  base="$1"
elif git rev-parse --verify -q origin/main >/dev/null; then
  base="origin/main"
fi

if [ -n "$base" ] && ! git rev-parse --verify -q "$base" >/dev/null; then
  echo "base '$base' 를 찾을 수 없어 변경분 검사는 건너뛴다."
  base=""
fi

# ── 1·2·5·6: 전체 파일 형식 검사 ─────────────────────────────────────────
all_files=$(ls "$DIR"/*.sql 2>/dev/null | xargs -n1 basename | sort || true)

# 기존 파일 중 SS=00 인 것은 이미 원격에 적용되어 이름을 못 바꾸므로, 초 검사는 새 파일에만 한다.
for f in $all_files; do
  if ! [[ "$f" =~ $PATTERN ]]; then
    err "$f: 파일명 형식이 YYYYMMDDHHMMSS_snake_case.sql 이 아니다. supabase migration new <이름> 으로 만든다."
  fi
  if grep -qiE '^\s*create\s+table' "$DIR/$f" && ! grep -qiE 'enable\s+row\s+level\s+security' "$DIR/$f"; then
    err "$f: create table 이 있는데 enable row level security 가 없다. anon 키가 공개되는 구조라 RLS 없는 테이블은 전체 공개다."
  fi
done

dups=$(printf '%s\n' $all_files | cut -c1-14 | sort | uniq -d || true)
for d in $dups; do
  err "타임스탬프 $d 가 둘 이상이다. 같은 시각으로 손으로 만든 파일이 있는지 본다."
done

# ── 3·4: base 대비 변경분 검사 ────────────────────────────────────────────
if [ -n "$base" ]; then
  merge_base=$(git merge-base "$base" HEAD 2>/dev/null || echo "$base")
  changes=$(git diff --name-status --diff-filter=AMDR "$merge_base"...HEAD -- "$DIR" 2>/dev/null || true)

  # 작업트리에 스테이징된 변경도 본다 (로컬에서 커밋 전 검사)
  staged=$(git diff --cached --name-status --diff-filter=AMDR -- "$DIR" 2>/dev/null || true)
  changes=$(printf '%s\n%s\n' "$changes" "$staged" | sed '/^$/d' | sort -u)

  latest_existing=$(git ls-tree -r --name-only "$merge_base" -- "$DIR" 2>/dev/null \
    | xargs -n1 basename 2>/dev/null | grep -E "$PATTERN" | sort | tail -1 | cut -c1-14 || true)

  while IFS=$'\t' read -r status path rest; do
    [ -z "$status" ] && continue
    name=$(basename "${rest:-$path}")
    case "$status" in
      A)
        ts="${name:0:14}"; ss="${name:12:2}"
        if [ "$ss" = "00" ]; then
          err "$name: 초가 00 이다. 타임스탬프를 손으로 쓰지 말고 supabase migration new <이름> 으로 다시 만든다. (진짜 정각이었다면 한 번 더 생성하면 된다)"
        fi
        if [ -n "$latest_existing" ] && [[ "$ts" < "$latest_existing" ]] ; then
          err "$name: 타임스탬프가 기존 최신($latest_existing)보다 앞선다. 적용 순서가 환경마다 달라진다. 다시 생성한다."
        fi
        ;;
      M)
        err "$path: 이미 있는 마이그레이션을 수정했다. 원격 적용 이력과 어긋난다. 새 마이그레이션으로 정정한다."
        ;;
      D)
        err "$path: 마이그레이션을 삭제했다. 테이블 제거는 새 마이그레이션에서 drop 으로 한다."
        ;;
      R*)
        err "$path → $rest: 마이그레이션 이름을 바꿨다. 원격은 옛 이름으로 기록되어 있다."
        ;;
    esac
  done <<< "$changes"
fi

if [ "$fail" -ne 0 ]; then
  echo
  red "마이그레이션 검사 실패. 규칙: .cursor/rules/supabase.mdc"
  exit 1
fi

green "✓ 마이그레이션 검사 통과"
