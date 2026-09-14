#!/usr/bin/env bash
# Claude Code PreToolUse 훅. Bash / Write / Edit 호출 전에 실행된다.
#
# 무엇을 막나
#   Bash
#     deny  supabase db reset --linked            원격(dev) DB 를 비운다. 팀 전체 데이터가 사라진다
#     deny  원격 DB 에 drop/truncate/delete 직접 실행   되돌릴 수 없다. 마이그레이션과 PR 을 거친다
#     deny  supabase/migrations/ 에 셸 리다이렉트로 파일 생성   타임스탬프를 손으로 쓰는 경로다
#     ask   supabase db push                      PR 이 머지된 뒤에만 한다. 확인을 받는다
#   Write / Edit
#     deny  supabase/migrations/*.sql 을 새로 만드는 것   반드시 `supabase migration new` 로 만든다
#           (이미 존재하는 파일에 내용을 채우는 것은 허용)
#
# 입력(stdin): { "tool_name": "...", "tool_input": { ... } }
# 거부: hookSpecificOutput.permissionDecision = "deny" | "ask"  /  허용: 출력 없이 exit 0
#
# aippt-prisonbreak 의 .claude/hooks/block-prod-db.sh 를 이 저장소 구조에 맞게 줄인 것.

set -u
command -v jq >/dev/null 2>&1 || exit 0   # jq 가 없으면 막지 않는다. CI 가 최종 방어선이다.

INPUT=$(cat)
tool=$(echo "$INPUT" | jq -r '.tool_name // empty')

decide() {  # $1 = deny|ask, $2 = reason
  jq -n --arg d "$1" --arg r "$2" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:$d,permissionDecisionReason:$r}}'
  exit 0
}

case "$tool" in
  Bash)
    cmd=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
    [ -z "$cmd" ] && exit 0

    # heredoc 본문은 명령이 아니라 데이터다(커밋 메시지, PR 본문 등). 검사에서 제외한다.
    # `cat > x <<EOF` 처럼 heredoc 을 여는 줄 자체는 남겨서 리다이렉트 검사는 그대로 받게 한다.
    cmd=$(printf '%s\n' "$cmd" | awk '
      skip == 1 { if ($0 == tag) { skip = 0 }; next }
      match($0, /<<-?[ \t]*["'"'"']?[A-Za-z_][A-Za-z0-9_]*["'"'"']?/) {
        t = substr($0, RSTART, RLENGTH); sub(/^<<-?[ \t]*["'"'"']?/, "", t); sub(/["'"'"']$/, "", t)
        tag = t; skip = 1; print; next
      }
      { print }')

    # 명령 시작 위치에서만 판정한다. 커밋 메시지나 PR 본문의 heredoc 에 적힌 설명 문구에는 걸리지 않도록,
    # 줄 처음 / ; / && / || / | / $( / ( 뒤에 (pnpm|npx 접두어 허용) 오는 것만 명령으로 본다.
    CMD_START='(^|[;&|(]|\$\()\s*(pnpm\s+(exec\s+)?|npx\s+)?'
    if echo "$cmd" | grep -Eq "${CMD_START}supabase\s+db\s+reset\b[^;&|]*--linked"; then
      decide deny "BLOCKED: 'supabase db reset --linked' 는 원격(dev) DB 를 비운다. 팀이 공유하는 DB 다. 로컬 검증은 --linked 없이 실행한다."
    fi

    # 원격 Supabase 로 직접 파괴 SQL
    if echo "$cmd" | grep -Eq '\.supabase\.co|pooler\.supabase\.com' \
       && echo "$cmd" | grep -Eiq '\b(drop\s+(table|schema|database)|truncate|delete\s+from)\b'; then
      decide deny "BLOCKED: 원격 DB 에 파괴적 SQL 을 직접 실행하려 한다. 마이그레이션 파일로 만들고 PR 을 거친다."
    fi

    # 셸 리다이렉트·복사·이동으로 마이그레이션 파일 생성. `supabase migration new` 만 허용한다.
    if echo "$cmd" | grep -Eq '(>|>>|\btee\b)\s*["'"'"']?[^ ]*supabase/migrations/[^ ]*\.sql' \
       || echo "$cmd" | grep -Eq '\b(cp|mv|install|rsync)\b[^|;&]*\bsupabase/migrations/[^ ]*\.sql'; then
      decide deny "BLOCKED: supabase/migrations/ 에 파일을 직접 쓰거나 옮기지 않는다. 'supabase migration new <이름>' 으로 만들고 그 파일을 편집한다. (.cursor/rules/supabase.mdc)"
    fi

    if echo "$cmd" | grep -Eq "${CMD_START}supabase\s+db\s+push\b"; then
      decide ask "supabase db push 는 해당 마이그레이션 PR 이 main 에 머지된 뒤에만 실행한다. 머지된 상태인가?"
    fi
    ;;

  Write|Edit|MultiEdit)
    path=$(echo "$INPUT" | jq -r '.tool_input.file_path // .tool_input.path // empty')
    [ -z "$path" ] && exit 0
    case "$path" in
      *supabase/migrations/*.sql)
        if [ ! -e "$path" ]; then
          decide deny "BLOCKED: 마이그레이션 파일은 도구로 새로 만들지 않는다. 먼저 'supabase migration new <이름>' 을 실행해 파일을 생성한 뒤, 그 파일을 편집한다. 타임스탬프는 CLI 가 실제 시각으로 채운다."
        fi
        ;;
    esac
    ;;
esac

exit 0
