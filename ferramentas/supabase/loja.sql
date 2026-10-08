-- Vendas da Loja do Grêmio, publicadas sozinhas na Transparência.
-- Rode este arquivo no SQL Editor do Supabase depois do contas.sql (ele usa a lista de
-- administradores, a função eh_administrador() e a tabela de lançamentos criadas lá).
--
-- Como funciona: cada venda registrada em `vendas` (pelo painel do admin, no balcão, ou pelo
-- futuro checkout online) dispara um gatilho que soma as vendas do dia e grava UMA receita
-- "Vendas da loja" daquele dia em `lancamentos`. A Transparência mostra essa receita na hora.
-- Anônimo de propósito: a venda não guarda nome, e-mail, NUSP nem nada de quem comprou,
-- e o público só vê o total do dia, nunca as vendas uma a uma.

create table if not exists public.vendas (
  id uuid primary key default gen_random_uuid(),
  data date not null default (now() at time zone 'America/Sao_Paulo')::date,
  produto text not null check (char_length(produto) between 2 and 120),
  quantidade integer not null default 1 check (quantidade > 0),
  valor_total numeric(12, 2) not null check (valor_total > 0),
  forma text not null default 'pix' check (forma in ('pix', 'cartao', 'dinheiro', 'outro')),
  canal text not null default 'balcao' check (canal in ('balcao', 'online')),
  criado_em timestamptz not null default now(),
  criado_por text default (auth.jwt() ->> 'email')   -- quem lançou (da gestão), nunca quem comprou
);
create index if not exists vendas_data on public.vendas (data);

-- As vendas uma a uma ficam só com a gestão; o público vê o total do dia em `lancamentos`.
alter table public.vendas enable row level security;
drop policy if exists "administradores registram vendas" on public.vendas;
create policy "administradores registram vendas" on public.vendas for all to authenticated
  using (public.eh_administrador()) with check (public.eh_administrador());

-- Marca os lançamentos gerados sozinhos, para o painel não deixar apagá-los à mão.
alter table public.lancamentos add column if not exists origem text;
create unique index if not exists lancamentos_loja_por_dia on public.lancamentos (data) where origem = 'loja';

-- Refaz a receita "Vendas da loja" de um dia a partir das vendas registradas.
create or replace function public.publicar_vendas_do_dia(dia date) returns void
language plpgsql security definer set search_path = public as $$
declare
  total numeric(12, 2);
  pecas integer;
begin
  select coalesce(sum(valor_total), 0), coalesce(sum(quantidade), 0) into total, pecas
    from public.vendas where data = dia;
  if total <= 0 then
    delete from public.lancamentos where origem = 'loja' and data = dia;
    return;
  end if;
  insert into public.lancamentos (data, tipo, valor, descricao, categoria, origem, criado_por)
  values (dia, 'receita', total,
          'Vendas da loja: ' || pecas || case when pecas = 1 then ' peça' else ' peças' end,
          'Loja', 'loja', 'loja (automático)')
  on conflict (data) where origem = 'loja'
  do update set valor = excluded.valor, descricao = excluded.descricao;
end;
$$;

create or replace function public.vendas_mudaram() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then perform public.publicar_vendas_do_dia(new.data); end if;
  if tg_op in ('UPDATE', 'DELETE') then perform public.publicar_vendas_do_dia(old.data); end if;
  return null;
end;
$$;

drop trigger if exists vendas_na_transparencia on public.vendas;
create trigger vendas_na_transparencia after insert or update or delete on public.vendas
  for each row execute function public.vendas_mudaram();
