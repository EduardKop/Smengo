-- ─────────────────────────────────────────────────────────
-- Registration upgrade: acquisition attribution.
-- «Откуда вы о нас узнали?» answered by the registering owner,
-- stored on the organization they create.
-- ─────────────────────────────────────────────────────────

alter table organizations add column if not exists acquisition_source text;

-- Recreate create_organization with the new optional param.
-- Old 5-arg signature must be dropped to avoid PostgREST overload ambiguity.
drop function if exists create_organization(text, text, text, text, text);

create or replace function create_organization(
  p_name               text,
  p_slug               text,
  p_billing_email      text,
  p_timezone           text default 'Europe/Kyiv',
  p_locale             text default 'ru',
  p_acquisition_source text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org_id  uuid;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'create_organization: caller must be authenticated';
  end if;

  -- 1. Create organization with 14-day trial
  insert into organizations (name, slug, billing_email, default_locale, timezone, plan, trial_ends_at, acquisition_source)
  values (p_name, p_slug, p_billing_email, p_locale, p_timezone, 'start', now() + interval '14 days',
          nullif(trim(p_acquisition_source), ''))
  returning id into v_org_id;

  -- 2. Create owner membership
  insert into memberships (org_id, user_id, role)
  values (v_org_id, v_user_id, 'owner');

  -- 3. Create trialing subscription
  insert into subscriptions (org_id, plan, status)
  values (v_org_id, 'start', 'trialing');

  return v_org_id;
end;
$$;

revoke execute on function create_organization(text, text, text, text, text, text) from public, anon;
grant execute on function create_organization(text, text, text, text, text, text) to authenticated;
