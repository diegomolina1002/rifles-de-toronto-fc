-- ============================================================================
-- RIFLES DE TORONTO F.C. — Esquema PostgreSQL y Storage para Supabase
-- Ejecuta este script completo en el SQL Editor de tu proyecto Supabase.
-- ============================================================================

-- 1. Tabla de Jugadores (inicia completamente vacía)
create table if not exists public.players (
  id bigint generated always as identity primary key,
  name text not null,
  nickname text default '',
  number integer not null,
  position text not null check (position in ('Portero', 'Defensa', 'Medio', 'Delantero')),
  goals integer not null default 0,
  matches integer not null default 0,
  photo_url text default '',
  created_at timestamptz not null default now()
);

-- 2. Tabla de Partidos
create table if not exists public.matches (
  id bigint generated always as identity primary key,
  opponent text not null,
  league text not null,
  date text not null,
  time text not null default '20:00',
  venue text not null default '',
  jersey_color text not null default 'Azul Marino',
  is_upcoming boolean not null default true,
  score_home integer,
  score_away integer,
  status text not null default 'Programado',
  notes text default '',
  created_at timestamptz not null default now()
);

-- 3. Tabla de Playeras / Armaduras (inicia vacía para gestionar desde /admin)
create table if not exists public.jerseys (
  id bigint generated always as identity primary key,
  name text not null,
  edition text default '',
  league text not null,
  color_hex text not null default '#1E3A8A',
  description text default '',
  image_url text not null default '',
  created_at timestamptz not null default now()
);

-- 4. Tabla de Galería Multimedia
create table if not exists public.gallery (
  id bigint generated always as identity primary key,
  title text not null,
  matchday text default '',
  photographer text not null default '@aleextasis',
  image_url text not null,
  created_at timestamptz not null default now()
);

-- 5. Habilitar Row Level Security (lectura pública, escritura vía Serverless Service Role)
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.jerseys enable row level security;
alter table public.gallery enable row level security;

drop policy if exists "Public read players" on public.players;
create policy "Public read players" on public.players for select using (true);

drop policy if exists "Public read matches" on public.matches;
create policy "Public read matches" on public.matches for select using (true);

drop policy if exists "Public read jerseys" on public.jerseys;
create policy "Public read jerseys" on public.jerseys for select using (true);

drop policy if exists "Public read gallery" on public.gallery;
create policy "Public read gallery" on public.gallery for select using (true);

-- 6. Bucket público en Supabase Storage para fotos de jugadores, playeras y galería
insert into storage.buckets (id, name, public)
values ('club-media', 'club-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read club-media" on storage.objects;
create policy "Public read club-media"
  on storage.objects for select
  using (bucket_id = 'club-media');

-- 7. Datos iniciales de partidos y fotos históricas (sin jugadores mock)
insert into public.matches (opponent, league, date, time, venue, jersey_color, is_upcoming, score_home, score_away, status, notes)
select * from (values
  ('Atlético del Sur F.C.', 'Liga La Curva CDMX', '2026-11-28', '20:30', 'Complejo La Curva, CDMX', 'Azul Marino', true, null::integer, null::integer, 'Programado', 'Jornada Nocturna — Llegar 30 min antes'),
  ('Deportivo Contreras', 'Liga ODEMAC (Final de Copa)', '2026-11-15', '11:00', 'Campo Contreras, Magdalena Contreras', 'Amarilla', false, 3, 1, 'Victoria — Campeones', '2do Título Histórico del Club'),
  ('Halcones Motolinía', 'Liga Universidad Motolinía (Final)', '2026-11-03', '19:00', 'Cancha Universidad Motolinía, CDMX', 'Roja', false, 4, 2, 'Victoria — Campeones', '1er Título Histórico del Club'),
  ('Club Cuervos Rápido', 'Capital Fútbol Rápido', '2026-11-20', '21:00', 'Capital Arena, CDMX', 'Blanca', false, 5, 3, 'Victoria', 'Gran remontada en el último cuarto')
) as seed(opponent, league, date, time, venue, jersey_color, is_upcoming, score_home, score_away, status, notes)
where not exists (select 1 from public.matches limit 1);

insert into public.gallery (title, matchday, photographer, image_url)
select * from (values
  ('Noche de Campeonato — Campeones 2026', 'Bicampeonato 2026 · CDMX', '@aleextasis', '/images/campeones-2026.jpg'),
  ('Plantel Oficial — Campo Contreras', 'Liga ODEMAC · Magdalena Contreras', '@aleextasis', '/images/accion-2.jpg'),
  ('Acción en Cancha — Control y Velocidad', 'Torneo CDMX 2026', '@aleextasis', '/images/accion-1.jpg')
) as seed(title, matchday, photographer, image_url)
where not exists (select 1 from public.gallery limit 1);
