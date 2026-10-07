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
.nojekyll                  faz o GitHub Pages servir os arquivos como estão
assets/
  css/
    tokens.css             cores, fontes e medidas (identidade visual)
    base.css               reset, tipografia e utilitários
    componentes.css        botões, cabeçalho, seções, cartões, rodapé
  js/
    config.js              menu, contato, redes e autoria
    ramificacoes.js        registro das ramificações (fonte única de menu, blocos e mapa do site)
    site.js                monta os componentes de cada página
    componentes/           um arquivo por componente (cabecalho, rodape, agora, ramificacoes)
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

**Nova seção na página inicial:** copie um bloco `<section class="secao">` do `index.html` e troque o conteúdo. Para fundo alternado, adicione a classe `secao--alt`. Se a seção precisar aparecer no menu, inclua o item em `assets/js/config.js`.

**Ramificações (seções principais):** todas ficam cadastradas em `assets/js/ramificacoes.js`, com título, caminho, resumo, itens e números. Desse registro saem os blocos da página inicial, o mapa do rodapé e os links do menu. Enquanto `pronta: false`, os links levam ao bloco da ramificação na página inicial e ele mostra "Página em construção". Para criar a página de uma ramificação:

1. crie a pasta do `caminho` (ex.: `apoio/index.html`) usando o mesmo `<head>` da página inicial, com `../` nos caminhos, e os pontos de montagem:
   ```html
   <div data-componente="cabecalho"></div>
   <main id="conteudo"> ... </main>
   <div data-componente="rodape"></div>
   ```
2. troque `pronta` para `true` no registro. Todos os links do site passam a apontar para a página nova.

Para criar uma ramificação nova, basta adicionar uma entrada ao registro.

**Novo componente:** crie `assets/js/componentes/nome.js` exportando `function (alvo, { site, url })`, registre o componente em `site.js` e use `<div data-componente="nome"></div>` na página.
