-- 상담 접수: 변호사 메모 + 검색.
--
-- 메모는 건당 하나. 변호사가 한 명이라 작성자 구분이 필요 없고, 여러 줄을 이어 쓰면 그것이 이력이다.
-- 여러 사람이 번갈아 쓰게 되면 그때 consultation_notes 로그 테이블로 옮긴다.
--
-- 검색은 답 봉투(answers) 전체를 대상으로 한다. 칸이 늘어도 검색이 따라간다.
-- 전화번호는 "010-5555-1234" 로 저장돼도 "5555" 나 "01055551234" 로 찾을 수 있게
-- 숫자만 남긴 사본을 같이 둔다. 메모도 검색 대상.

alter table consultation_requests
  add column note text,
  add column note_updated_at timestamptz,
  add column search text generated always as (
    lower(coalesce(answers::text, ''))
    || ' ' || regexp_replace(coalesce(answers::text, ''), '[^0-9]', '', 'g')
    || ' ' || lower(coalesce(note, ''))
  ) stored;

comment on column consultation_requests.note is
  '변호사 메모. 방문자가 쓴 answers 와 분리된, 관리자만 쓰는 처리 노트.';
comment on column consultation_requests.search is
  '검색용. answers 전체 소문자 + 숫자만 + 메모. ilike 로 찾는다. 수천 건을 넘으면 pg_trgm 인덱스를 얹는다.';

-- update 정책은 이미 관리자에게 열려 있어(20260924045821) 메모 저장에 새 정책이 필요 없다.
