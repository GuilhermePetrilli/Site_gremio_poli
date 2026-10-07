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
    config.js              menu, contato e redes (fonte única)
    site.js                monta os componentes de cada página
    componentes/           um arquivo por componente (cabecalho.js, rodape.js)
  img/
    marca/                 logo oficial do Grêmio (não alterar)
    servicos/, historia/   imagens de conteúdo
```

## Regras para manter o site portável

- Use sempre caminhos relativos, nunca começando com `/`. O site precisa funcionar em subpasta (`usuario.github.io/Site_gremio_poli/`) e na raiz de um domínio próprio.
- Dentro dos componentes, monte os links com `url("caminho")`. A função calcula a raiz do site a partir de `site.js`.
- Não use Jekyll, Liquid ou qualquer recurso exclusivo do GitHub.

## Como expandir

**Nova seção na página inicial:** copie um bloco `<section class="secao">` do `index.html` e troque o conteúdo. Para fundo alternado, adicione a classe `secao--alt`. Se a seção precisar aparecer no menu, inclua o item em `assets/js/config.js`.

**Nova página:** crie uma pasta com um `index.html`, por exemplo `institucional/index.html`. O endereço fica `.../institucional/`. Use o mesmo `<head>` da página inicial, acrescentando `../` nos caminhos, e os pontos de montagem:

```html
<div data-componente="cabecalho"></div>
<main id="conteudo"> ... </main>
<div data-componente="rodape"></div>
```

Depois adicione o link no `menu` de `config.js` (ex.: `{ rotulo: "Institucional", href: "institucional/" }`).

**Novo componente:** crie `assets/js/componentes/nome.js` exportando `function (alvo, { site, url })`, registre o componente em `site.js` e use `<div data-componente="nome"></div>` na página.
