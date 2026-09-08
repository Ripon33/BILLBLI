alter table works
  add column if not exists worker_type text,
  add column if not exists worker_name text,
  add column if not exists worker_context jsonb;
