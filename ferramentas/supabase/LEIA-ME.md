# Banco das contas (Supabase)

A página **Transparência** e o painel de contas do **portal interno** usam um banco Supabase:
leitura pública, escrita só para administradores, atualização ao vivo. Plano gratuito basta.

## Configurar (uma vez, uns 10 minutos)

1. Crie uma conta em https://supabase.com e um projeto novo (região: São Paulo).
2. No projeto, abra **SQL Editor**, cole o conteúdo de `contas.sql` e rode.
3. Ainda no SQL Editor, cadastre quem pode lançar contas:
   `insert into public.administradores (email) values ('pessoa@exemplo.com');`
4. Em **Authentication > Users**, crie (ou convide) essas mesmas pessoas, com e-mail e senha.
5. Em **Authentication > Sign In / Providers > Email**, desligue **Allow new users to sign up**
   (só quem você criar consegue entrar).
6. Em **Project Settings > API**, copie a **Project URL** e a chave **anon public** e cole em
   `assets/js/config.js`, em `site.contas` (`supabaseUrl` e `supabaseChave`). Essa chave é pública
   por desenho: quem protege a escrita são as regras do `contas.sql`.
7. Publique o site. Pronto: os administradores entram em **Área dos administradores > Contas do
   Grêmio**, lançam receitas e despesas, e a Transparência atualiza sozinha.

## Sem o banco

Enquanto `site.contas` estiver vazio, a Transparência lê `assets/dados/contas.json` (só leitura) e o
portal interno mostra este passo a passo.
