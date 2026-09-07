create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  room_code text not null,
  from_name text not null,
  to_name text not null,
  message text not null,
  type text not null default 'custom',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists messages_room_recipient_idx
  on public.messages (room_code, to_name, created_at desc);

alter table public.messages enable row level security;

create or replace function public.touch_message_read(message_id uuid, message_room text)
returns void
language sql
security definer
set search_path = public
as $$
  update public.messages
  set read_at = now()
  where id = message_id and room_code = message_room;
$$;