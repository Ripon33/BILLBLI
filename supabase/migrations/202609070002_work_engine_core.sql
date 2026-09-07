create table if not exists works (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  goal text not null,
  status text not null default 'draft',
  priority text not null default 'normal',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists work_plans (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  objective text not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists work_tasks (
  id uuid primary key default gen_random_uuid(),
  work_id uuid not null references works(id) on delete cascade,
  parent_task_id uuid references work_tasks(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'ready',
  sequence integer not null default 0,
  dependencies jsonb not null default '[]'::jsonb,
  assigned_capability text,
  autonomy_level text not null default 'auto',
  execution_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists work_executions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references work_tasks(id) on delete cascade,
  status text not null default 'queued',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists work_task_results (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references work_tasks(id) on delete cascade,
  execution_id uuid not null references work_executions(id) on delete cascade,
  status text not null,
  output jsonb,
  verification_status text not null default 'unverified',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table works enable row level security;
alter table work_plans enable row level security;
alter table work_tasks enable row level security;
alter table work_executions enable row level security;
alter table work_task_results enable row level security;

create policy "works own"
  on works
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "work_plans own"
  on work_plans
  for all
  using (
    exists (
      select 1
      from works
      where works.id = work_plans.work_id
        and works.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from works
      where works.id = work_plans.work_id
        and works.user_id = auth.uid()
    )
  );

create policy "work_tasks own"
  on work_tasks
  for all
  using (
    exists (
      select 1
      from works
      where works.id = work_tasks.work_id
        and works.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from works
      where works.id = work_tasks.work_id
        and works.user_id = auth.uid()
    )
  );

create policy "work_executions own"
  on work_executions
  for all
  using (
    exists (
      select 1
      from work_tasks
      join works on works.id = work_tasks.work_id
      where work_tasks.id = work_executions.task_id
        and works.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from work_tasks
      join works on works.id = work_tasks.work_id
      where work_tasks.id = work_executions.task_id
        and works.user_id = auth.uid()
    )
  );

create policy "work_task_results own"
  on work_task_results
  for all
  using (
    exists (
      select 1
      from work_tasks
      join works on works.id = work_tasks.work_id
      where work_tasks.id = work_task_results.task_id
        and works.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from work_tasks
      join works on works.id = work_tasks.work_id
      where work_tasks.id = work_task_results.task_id
        and works.user_id = auth.uid()
    )
  );
