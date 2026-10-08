-- Banco das contas do Grêmio (Transparência e portal interno).
-- Rode este arquivo inteiro no SQL Editor do projeto Supabase (uma vez).
-- Leitura: pública (qualquer pessoa vê as contas). Escrita: só administradores da lista.

-- Lançamentos: cada receita ou despesa do Grêmio.
create table if not exists public.lancamentos (
  id uuid primary key default gen_random_uuid(),
  data date not null,
  tipo text not null check (tipo in ('receita', 'despesa')),
  valor numeric(12, 2) not null check (valor > 0),
  descricao text not null check (char_length(descricao) between 2 and 200),
  categoria text not null default 'Outros',
  diretoria text,
  abate_divida boolean not null default false,  -- despesa que paga a dívida do Grêmio
  comprovante_url text,
  criado_em timestamptz not null default now(),
  criado_por text default (auth.jwt() ->> 'email')
);
create index if not exists lancamentos_data on public.lancamentos (data, criado_em);

-- Parâmetros: valor total da dívida e saldo em 1º de janeiro de 2027.
create table if not exists public.parametros (
  chave text primary key,
  valor jsonb not null,
  atualizado_em timestamptz not null default now()
);
insert into public.parametros (chave, valor) values
  ('divida', '{"total": null}'),
  ('saldo_inicial', '{"valor": null}')
on conflict (chave) do nothing;

-- Quem pode lançar: e-mails dos administradores (diretoria financeira, presidência...).
create table if not exists public.administradores (
  email text primary key
);
-- Troque pelos e-mails reais e rode de novo quando entrar alguém:
-- insert into public.administradores (email) values ('financeiro@gremiopolitecnico.com.br');

create or replace function public.eh_administrador() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.administradores where email = auth.jwt() ->> 'email');
$$;

alter table public.lancamentos enable row level security;
alter table public.parametros enable row level security;
alter table public.administradores enable row level security;

drop policy if exists "contas públicas" on public.lancamentos;
create policy "contas públicas" on public.lancamentos for select using (true);
drop policy if exists "administradores lançam" on public.lancamentos;
create policy "administradores lançam" on public.lancamentos for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

drop policy if exists "parâmetros públicos" on public.parametros;
create policy "parâmetros públicos" on public.parametros for select using (true);
drop policy if exists "administradores ajustam" on public.parametros;
create policy "administradores ajustam" on public.parametros for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

drop policy if exists "administrador vê a si mesmo" on public.administradores;
create policy "administrador vê a si mesmo" on public.administradores for select to authenticated
  using (email = auth.jwt() ->> 'email');

-- Atualização ao vivo na página de Transparência.
do $$ begin
  alter publication supabase_realtime add table public.lancamentos;
exception when duplicate_object then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.parametros;
exception when duplicate_object then null; end $$;
