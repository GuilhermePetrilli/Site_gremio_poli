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
apoio/, cultura/, …       uma pasta por ramificação, gerada por ferramentas/paginas.mjs
.nojekyll                  faz o GitHub Pages servir os arquivos como estão
assets/
  css/
    tokens.css             cores, fontes e medidas (identidade visual)
    base.css               reset, tipografia e utilitários
    componentes.css        botões, cabeçalho, seções, cartões, rodapé
  js/
    config.js              menu, contato, redes e autoria
    ramificacoes.js        registro das ramificações em árvore (fonte única de índice, páginas, menu e mapa)
    site.js                monta os componentes de cada página
    componentes/           um arquivo por componente (cabecalho, rodape, indice, trilha, pagina, ramificacoes, agora)
    dados/                 dados reutilizáveis (ex.: horários dos bandejões)
  img/
    marca/                 logo oficial do Grêmio (não alterar)
    servicos/, historia/   imagens de conteúdo
```

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

Para escrever o conteúdo de uma página à mão, edite o `index.html` dela e troque o `<div data-componente="pagina">` pelo HTML desejado, mantendo `<div data-componente="trilha" data-id="...">`.

**Novo componente:** crie `assets/js/componentes/nome.js` exportando `function (alvo, { site, url })`, registre o componente em `site.js` e use `<div data-componente="nome"></div>` na página.
