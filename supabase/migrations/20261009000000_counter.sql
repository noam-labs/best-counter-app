-- Compteur partagé « ni non ni non ».
create table public.counter (
  id text primary key,
  value bigint not null default 0 check (value >= 0),
  updated_at timestamptz not null default now()
);

insert into public.counter (id) values ('family');

-- Les clients peuvent lire, mais jamais écrire directement dans la table.
alter table public.counter enable row level security;

create policy "anyone can read the counter"
  on public.counter for select
  to anon, authenticated
  using (true);

-- +1 / -1 atomique, jamais en dessous de 0. Renvoie la nouvelle valeur (null si delta/id invalide).
create function public.bump_counter(counter_id text, delta int)
returns bigint
language sql
security definer
set search_path = ''
as $$
  update public.counter
     set value = greatest(value + delta, 0),
         updated_at = now()
   where id = counter_id
     and delta in (-1, 1)
  returning value;
$$;

revoke execute on function public.bump_counter(text, int) from public;
grant execute on function public.bump_counter(text, int) to anon, authenticated;

-- Mises à jour en direct pour tout le monde.
alter publication supabase_realtime add table public.counter;
