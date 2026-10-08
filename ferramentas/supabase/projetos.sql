-- Projetos e parcerias do Grêmio (com grupos de extensão e com empresas).
-- Rode este arquivo no SQL Editor do Supabase depois do contas.sql (ele usa a lista de
-- administradores e a função eh_administrador() criadas lá).
-- Leitura: pública. Escrita: só administradores.

create table if not exists public.projetos (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('gex', 'empresa')),
  titulo text not null check (char_length(titulo) between 2 and 140),
  parceiro text,                                  -- nome do GEX ou da empresa
  inicio date,
  termino_previsto date,
  descricao text not null check (char_length(descricao) between 2 and 2000),  -- o que se busca atingir
  situacao text not null default 'planejado' check (situacao in ('planejado', 'em-andamento', 'concluido')),
  criado_em timestamptz not null default now()
);

-- Atualizações de cada projeto (o espaço para contar o andamento depois).
create table if not exists public.projetos_atualizacoes (
  id uuid primary key default gen_random_uuid(),
  projeto_id uuid not null references public.projetos (id) on delete cascade,
  data date not null default current_date,
  texto text not null check (char_length(texto) between 2 and 2000),
  criado_em timestamptz not null default now()
);
create index if not exists projetos_atualizacoes_projeto on public.projetos_atualizacoes (projeto_id, data);

alter table public.projetos enable row level security;
alter table public.projetos_atualizacoes enable row level security;

drop policy if exists "projetos públicos" on public.projetos;
create policy "projetos públicos" on public.projetos for select using (true);
drop policy if exists "administradores cuidam dos projetos" on public.projetos;
create policy "administradores cuidam dos projetos" on public.projetos for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

drop policy if exists "atualizações públicas" on public.projetos_atualizacoes;
create policy "atualizações públicas" on public.projetos_atualizacoes for select using (true);
drop policy if exists "administradores atualizam" on public.projetos_atualizacoes;
create policy "administradores atualizam" on public.projetos_atualizacoes for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());
