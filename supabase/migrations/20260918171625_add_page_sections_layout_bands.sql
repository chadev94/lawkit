-- page_link 업무분야용 가로 밴드(넓은 행) 레이아웃 허용
alter table page_sections
  drop constraint page_sections_layout_check;

alter table page_sections
  add constraint page_sections_layout_check
  check (layout in ('cards', 'carousel', 'list', 'bands'));
