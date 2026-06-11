-- ─────────────────────────────────────────────────────────
-- Invitation & membership management (SECURITY DEFINER RPCs)
--
-- The invite flow was dead under RLS:
--  * the invited user cannot SELECT the invitation (not a member yet),
--  * nobody can INSERT into invitations / memberships (no policies).
-- All multi-step membership mutations go through definer functions so the
-- checks and writes are atomic and the tables stay locked down.
-- ─────────────────────────────────────────────────────────

-- ── create_invitation: owner/admin invites by email ──────
-- Re-inviting the same email replaces the pending invitation (fresh token+TTL).

create or replace function create_invitation(
  p_org_id uuid,
  p_email  text,
  p_role   user_role
)
returns text
language plpgsql security definer
set search_path = public
as $$
declare
  v_token text;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  if not auth_has_role(p_org_id, array['owner','admin']::user_role[]) then
    raise exception 'forbidden';
  end if;

  if p_role = 'owner' then
    raise exception 'cannot_invite_owner';
  end if;

  if exists (
    select 1 from memberships m
    join auth.users u on u.id = m.user_id
    where m.org_id = p_org_id and lower(u.email) = lower(p_email)
  ) then
    raise exception 'already_member';
  end if;

  -- replace any pending invitation for this email
  delete from invitations
  where org_id = p_org_id and lower(email) = lower(p_email) and accepted_at is null;

  v_token := replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');

  insert into invitations (org_id, email, role, token, expires_at)
  values (p_org_id, lower(p_email), p_role, v_token, now() + interval '7 days');

  return v_token;
end;
$$;

grant execute on function create_invitation(uuid, text, user_role) to authenticated;

-- ── get_invitation: token holder previews the invite ─────
-- Token is 64 hex chars of entropy; safe to resolve pre-auth (invite page
-- renders before the user registers or logs in).

create or replace function get_invitation(p_token text)
returns table (
  email       text,
  role        user_role,
  org_name    text,
  expires_at  timestamptz,
  accepted_at timestamptz
)
language sql stable security definer
set search_path = public
as $$
  select i.email, i.role, o.name, i.expires_at, i.accepted_at
  from invitations i
  join organizations o on o.id = i.org_id
  where i.token = p_token;
$$;

grant execute on function get_invitation(text) to anon, authenticated;

-- ── accept_invitation: invited user joins the org ────────
-- The authenticated email must match the invited email.

create or replace function accept_invitation(p_token text)
returns uuid
language plpgsql security definer
set search_path = public
as $$
declare
  v_inv   invitations%rowtype;
  v_email text;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  select * into v_inv
  from invitations
  where token = p_token and accepted_at is null and expires_at > now();

  if not found then
    raise exception 'invalid_or_expired';
  end if;

  select lower(email) into v_email from auth.users where id = auth.uid();

  if v_email is distinct from lower(v_inv.email) then
    raise exception 'email_mismatch';
  end if;

  insert into memberships (org_id, user_id, role)
  values (v_inv.org_id, auth.uid(), v_inv.role)
  on conflict (org_id, user_id) do update set role = excluded.role;

  update invitations set accepted_at = now() where id = v_inv.id;

  return v_inv.org_id;
end;
$$;

grant execute on function accept_invitation(text) to authenticated;

-- ── update_member_role ───────────────────────────────────
-- owner: any change, but the org can never lose its last owner.
-- admin: may only move people between manager and viewer.

create or replace function update_member_role(
  p_org_id  uuid,
  p_user_id uuid,
  p_role    user_role
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_caller_role user_role;
  v_target_role user_role;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  select role into v_caller_role
  from memberships where org_id = p_org_id and user_id = auth.uid();

  if v_caller_role not in ('owner','admin') then
    raise exception 'forbidden';
  end if;

  select role into v_target_role
  from memberships where org_id = p_org_id and user_id = p_user_id;

  if not found then
    raise exception 'not_a_member';
  end if;

  if v_caller_role = 'admin'
     and (v_target_role not in ('manager','viewer') or p_role not in ('manager','viewer')) then
    raise exception 'forbidden';
  end if;

  if v_target_role = 'owner' and p_role <> 'owner' then
    if (select count(*) from memberships where org_id = p_org_id and role = 'owner') <= 1 then
      raise exception 'last_owner';
    end if;
  end if;

  update memberships set role = p_role
  where org_id = p_org_id and user_id = p_user_id;
end;
$$;

grant execute on function update_member_role(uuid, uuid, user_role) to authenticated;

-- ── remove_member ────────────────────────────────────────
-- owner: removes anyone (but not the last owner).
-- admin: removes manager/viewer only.
-- anyone: may remove themselves (leave), unless they are the last owner.

create or replace function remove_member(
  p_org_id  uuid,
  p_user_id uuid
)
returns void
language plpgsql security definer
set search_path = public
as $$
declare
  v_caller_role user_role;
  v_target_role user_role;
begin
  if auth.uid() is null then
    raise exception 'unauthorized';
  end if;

  select role into v_caller_role
  from memberships where org_id = p_org_id and user_id = auth.uid();

  if v_caller_role is null then
    raise exception 'forbidden';
  end if;

  select role into v_target_role
  from memberships where org_id = p_org_id and user_id = p_user_id;

  if not found then
    raise exception 'not_a_member';
  end if;

  if p_user_id <> auth.uid() then
    if v_caller_role = 'admin' and v_target_role not in ('manager','viewer') then
      raise exception 'forbidden';
    end if;
    if v_caller_role not in ('owner','admin') then
      raise exception 'forbidden';
    end if;
  end if;

  if v_target_role = 'owner' then
    if (select count(*) from memberships where org_id = p_org_id and role = 'owner') <= 1 then
      raise exception 'last_owner';
    end if;
  end if;

  delete from memberships where org_id = p_org_id and user_id = p_user_id;
end;
$$;

grant execute on function remove_member(uuid, uuid) to authenticated;
