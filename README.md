# Site do Grêmio Politécnico da USP

Site estático, modular e independente de hospedagem. Não tem etapa de build: o que está no repositório é exatamente o que vai ao ar.

## Rodar localmente

Como o site usa módulos JavaScript, abra-o por um servidor local, não clicando duas vezes no arquivo:

```sh
python -m http.server 8000
# ou: npx serve .
```

Depois acesse http://localhost:8000.

## Estrutura

```
index.html                 página inicial
projetos/, eventos/, …     uma pasta por ramificação, gerada por ferramentas/paginas.mjs
aluno/                     Área do aluno (página de entrada escrita à mão)
  bandejoes/               guia dos bandejões: cardápio do dia, mapa e caminho a pé
.github/workflows/         agendador do cardápio (opcional; ver "Cardápio dos bandejões")
.nojekyll                  faz o GitHub Pages servir os arquivos como estão
assets/
  css/
    tokens.css             cores, fontes e medidas (identidade visual)
    base.css               reset, tipografia e utilitários
    componentes.css        botões, chips, cabeçalho, índice, seções, cartões, rodapé
    bandejoes.css          estilos só do guia dos bandejões
  dados/
    cardapio.json          cardápio da semana, gerado por ferramentas/cardapio.mjs
  js/
    config.js              menu, contato, redes e autoria
    ramificacoes.js        registro das ramificações em árvore (fonte única de índice, páginas, menu e mapa)
    site.js                monta os componentes de cada página
    componentes/           um arquivo por componente (cabecalho, rodape, indice, trilha, pagina, recursos, ramificacoes, agora, guia-bandejoes)
    dados/                 dados reutilizáveis (bandejões e horários, mapa do campus)
  img/
    marca/                 logo oficial do Grêmio (não alterar)
    servicos/, historia/   imagens de conteúdo
```

## Identidade visual

Títulos e números em Bricolage Grotesque, texto em Nunito. Bordas de 2px na cor tinta, cantos de 10px, botões e chips em pílula, números em "fichas" com borda. O azul da logo marca ações e links; o amarelo (`--sol`) é o sol do horizonte e o destaque. Esses elementos vieram do protótipo do guia dos bandejões e valem para o site inteiro.

## Cardápio dos bandejões

O guia em `aluno/bandejoes/` mostra o cardápio do dia lido de `assets/dados/cardapio.json`. Esse arquivo é gerado por:

```sh
node ferramentas/cardapio.mjs
```

O script consulta o serviço que alimenta o app Cardápio+ da USP. O serviço não aceita chamadas direto do navegador (não envia cabeçalhos CORS), por isso o cardápio passa pelo arquivo. Hoje o agendamento em `.github/workflows/cardapio.yml` roda o script quatro vezes por dia e publica o arquivo quando o cardápio muda. Em outra hospedagem, basta um cron rodando o mesmo comando e publicando o arquivo.

Como esse agendador faz commits no `main`, rode `git pull --rebase` antes de enviar as suas mudanças.

## Versão dos arquivos (cache)

As referências a `.css` e `.js` levam `?v=AAAAMMDDHHMM`. Isso impede que o navegador misture arquivos novos com versões antigas em cache depois de uma publicação. O script `ferramentas/versionar.mjs` atualiza todas as versões de uma vez e roda sozinho antes de cada commit, se o gancho estiver instalado:

```sh
printf '#!/bin/sh\nnode ferramentas/versionar.mjs && git add -u\n' > .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Ao criar arquivos novos, escreva as referências normalmente (`"./componentes/novo.js"`); o script acrescenta a versão.

## Regras para manter o site portável

- Use sempre caminhos relativos, nunca começando com `/`. O site precisa funcionar em subpasta (`usuario.github.io/Site_gremio_poli/`) e na raiz de um domínio próprio.
- Dentro dos componentes, monte os links com `url("caminho")`. A função calcula a raiz do site a partir de `site.js`.
- Não use Jekyll, Liquid ou qualquer recurso exclusivo do GitHub.

## Como expandir

**Nova seção na página inicial:** copie um bloco `<section class="bloco">` do `index.html` e troque o conteúdo. Para fundo alternado, adicione a classe `bloco--painel`. Se a seção precisar aparecer no menu, inclua o item em `assets/js/config.js`.

**Ramificações e subdivisões:** o site é uma árvore cadastrada em `assets/js/ramificacoes.js`. Cada nó tem `id`, `titulo`, `resumo` e, opcionalmente, `caminho` (pasta da página), `numeros`, `acoes` e `filhos`, que seguem o mesmo formato e podem ter qualquer profundidade. Nó sem `caminho` vira uma seção dentro da página do pai, com link `pai/#id`.

Do registro saem o índice lateral (fixo nas páginas internas e na gaveta do botão "Índice"), a trilha de navegação, os blocos da página inicial, o mapa do rodapé e o conteúdo das páginas.

Para criar uma subdivisão nova (ex.: uma página dentro da Área do aluno):

1. adicione o nó em `filhos` do nó pai, com `caminho: "aluno/nome/"`;
2. rode `node ferramentas/paginas.mjs`, que cria a pasta e o `index.html` de toda página nova do registro, sem tocar nas que já existem;
3. publique. O índice, a trilha e os links se atualizam sozinhos.

**Áreas com índice próprio (Área do aluno, dos administradores):** as páginas dessas áreas usam `<div data-componente="indice" data-modo="lateral" data-raiz="aluno">`, que mostra só a área, com a página de entrada no topo e as subpáginas abaixo. O `paginas.mjs` já gera as subpáginas assim. Para listar as subpáginas como cartões numa página escrita à mão, use `<div data-componente="recursos" data-id="aluno"></div>`.

Para escrever o conteúdo de uma página à mão, edite o `index.html` dela e troque o `<div data-componente="pagina">` pelo HTML desejado, mantendo `<div data-componente="trilha" data-id="...">`.

**Novo componente:** crie `assets/js/componentes/nome.js` exportando `function (alvo, { site, url })`, registre o componente em `site.js` e use `<div data-componente="nome"></div>` na página. Componentes pesados, usados numa página só (como o guia dos bandejões), entram em `sobDemanda` no `site.js` e só são baixados nessa página.

**Abrir o índice de qualquer lugar:** qualquer botão com `data-abrir-gaveta` abre a gaveta do índice do site.
