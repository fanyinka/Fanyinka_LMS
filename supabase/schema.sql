-- FANYINKA LMS starter schema. Run in Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.members (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  department text,
  ministry text,
  bible_group integer check (bible_group between 1 and 30),
  membership_status text not null default 'active'
    check (membership_status in ('active','inactive','visitor')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  service_name text not null,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  qr_token_hash text unique,
  created_by uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references public.members(id) on delete cascade,
  session_id uuid references public.attendance_sessions(id) on delete set null,
  attendance_method text not null check (attendance_method in ('qr','face','remote','manual')),
  attendance_status text not null default 'present'
    check (attendance_status in ('present','pending_review','rejected')),
  checked_in_at timestamptz not null default now(),
  preacher_name text,
  sermon_topic text,
  scripture_reference text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  unique(member_id, session_id)
);

create table if not exists public.staff_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role text not null check (role in ('super_admin','pastor','secretary','attendance_officer','ministry_leader','media_team')),
  ministry_scope text,
  created_at timestamptz not null default now(),
  unique(user_id, role, ministry_scope)
);

create table if not exists public.message_logs (
  id uuid primary key default gen_random_uuid(),
  channel text not null check (channel in ('email','whatsapp')),
  audience_type text not null,
  audience_value text,
  message_body text not null,
  status text not null default 'draft',
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists members_name_idx on public.members (full_name);
create index if not exists members_phone_idx on public.members (phone);
create index if not exists attendance_date_idx on public.attendance_records (checked_in_at);
create index if not exists attendance_member_idx on public.attendance_records (member_id);

-- IMPORTANT: Do not enable public write access for production.
-- Before launch, configure Supabase Auth + Row Level Security policies
-- so members only access their own data and staff access is role-scoped.
-- Never store raw face images or face embeddings in this starter schema.
