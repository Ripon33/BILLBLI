alter table works
  add column if not exists autonomy_level text not null default 'auto',
  add column if not exists authorization text not null default 'not_required';
