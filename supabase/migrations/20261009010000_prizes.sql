-- Lots à gagner, payés avec les points du compteur.
create table public.prize (
  id text primary key,
  label text not null,
  cost int not null check (cost > 0),
  sort_order int not null default 0
);

insert into public.prize (id, label, cost, sort_order) values
  ('vaisselle', 'Débarrasse la vaisselle', 30, 1),
  ('repas', 'Fais à manger', 100, 2);

alter table public.prize enable row level security;

create policy "tout le monde peut lire les lots"
  on public.prize for select
  to anon, authenticated
  using (true);

-- Retire le coût du lot du compteur, seulement s'il y a assez de points.
-- Renvoie la nouvelle valeur (null si pas assez de points ou id invalide).
create function public.claim_prize(counter_id text, prize_id text)
returns bigint
language sql
security definer
set search_path = ''
as $$
  update public.counter c
     set value = c.value - p.cost,
         updated_at = now()
    from public.prize p
   where c.id = counter_id
     and p.id = prize_id
     and c.value >= p.cost
  returning c.value;
$$;

revoke execute on function public.claim_prize(text, text) from public;
grant execute on function public.claim_prize(text, text) to anon, authenticated;
