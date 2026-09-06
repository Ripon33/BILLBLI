-- Task 10: enforce authenticated ownership for all user-owned BILLBLI data.

-- Existing profiles and decisions already have direct auth ownership.
-- Add direct ownership to records that currently inherit ownership through decisions.
alter table research_runs
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table sources
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table evidence
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table decision_factors
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table recommendations
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

alter table decision_events
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

-- Backfill ownership from the existing decision relationships.
update research_runs
set user_id = decisions.user_id
from decisions
where research_runs.decision_id = decisions.id
  and research_runs.user_id is null;

update sources
set user_id = decisions.user_id
from research_runs
join decisions on decisions.id = research_runs.decision_id
where sources.research_run_id = research_runs.id
  and sources.user_id is null;

update evidence
set user_id = decisions.user_id
from decisions
where evidence.decision_id = decisions.id
  and evidence.user_id is null;

update decision_factors
set user_id = decisions.user_id
from decisions
where decision_factors.decision_id = decisions.id
  and decision_factors.user_id is null;

update recommendations
set user_id = decisions.user_id
from decisions
where recommendations.decision_id = decisions.id
  and recommendations.user_id is null;

update decision_events
set user_id = decisions.user_id
from decisions
where decision_events.decision_id = decisions.id
  and decision_events.user_id is null;

-- Every existing row must now have an authenticated owner.
alter table research_runs alter column user_id set not null;
alter table sources alter column user_id set not null;
alter table evidence alter column user_id set not null;
alter table decision_factors alter column user_id set not null;
alter table recommendations alter column user_id set not null;
alter table decision_events alter column user_id set not null;

-- Recreate ownership policies so each authenticated user can access only their data.
drop policy if exists "research_runs own" on research_runs;
create policy "research_runs own"
  on research_runs
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "sources own" on sources;
create policy "sources own"
  on sources
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "evidence own" on evidence;
create policy "evidence own"
  on evidence
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "decision_factors own" on decision_factors;
create policy "decision_factors own"
  on decision_factors
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "recommendations own" on recommendations;
create policy "recommendations own"
  on recommendations
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "decision_events own" on decision_events;
create policy "decision_events own"
  on decision_events
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
