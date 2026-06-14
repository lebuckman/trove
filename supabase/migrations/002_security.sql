-- Trove: RLS ownership hardening.
-- Run this after 001_init.sql (existing databases: run this once now).
--
-- The 001 policies scope each write to the row's own user_id, but a direct
-- PostgREST call could still set a foreign-key column to an id the user
-- doesn't own — e.g. parent a gem under someone else's trove, point a trove
-- cover at another user's gem, or link a gem to another user's tag. None of
-- that leaks data (reads stay user_id-scoped), but it's an integrity gap.
-- These policies cross-check the referenced row's owner too. drop+create so
-- the file is safe to re-run.

drop policy if exists "troves update own" on trove.troves;
create policy "troves update own" on trove.troves
  for update using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      cover_gem_id is null
      or exists (
        select 1 from trove.gems g
        where g.id = cover_gem_id and g.user_id = (select auth.uid())
      )
    )
  );

drop policy if exists "gems insert own" on trove.gems;
create policy "gems insert own" on trove.gems
  for insert with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from trove.troves t
      where t.id = trove_id and t.user_id = (select auth.uid())
    )
  );

drop policy if exists "gems update own" on trove.gems;
create policy "gems update own" on trove.gems
  for update using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1 from trove.troves t
      where t.id = trove_id and t.user_id = (select auth.uid())
    )
  );

drop policy if exists "gem_tags insert own" on trove.gem_tags;
create policy "gem_tags insert own" on trove.gem_tags
  for insert with check (
    exists (
      select 1 from trove.gems g
      where g.id = gem_id and g.user_id = (select auth.uid())
    )
    and exists (
      select 1 from trove.tags t
      where t.id = tag_id and t.user_id = (select auth.uid())
    )
  );
