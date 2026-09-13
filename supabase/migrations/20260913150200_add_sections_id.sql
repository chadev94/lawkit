-- sections 에 uuid PK 추가.
-- key 는 unique 로 유지하고, home_sections.kind FK 는 key 를 계속 참조한다.

-- 1) 의존 FK 잠시 해제
alter table home_sections
  drop constraint home_sections_kind_fkey;

-- 2) id 추가 후 PK 전환
alter table sections
  add column id uuid not null default gen_random_uuid();

alter table sections
  drop constraint sections_pkey;

alter table sections
  add constraint sections_key_unique unique (key);

alter table sections
  add primary key (id);

-- 3) FK 재연결 (key unique 대상)
alter table home_sections
  add constraint home_sections_kind_fkey
  foreign key (kind) references sections (key);

comment on column sections.id is '내부 식별자. 공개 라우팅/컴포넌트 매핑은 key 를 쓴다.';
