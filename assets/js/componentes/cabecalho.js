// Cabeçalho: faixa de aviso, marca, menu e gaveta lateral com o índice do site.
// No computador, o botão "Índice" abre a gaveta; no celular, o botão "Menu" abre a
// mesma gaveta, que também traz os links do menu.

import { arvore } from "./indice.js?v=202610062246";

export default function cabecalho(alvo, contexto) {
  const { site, url } = contexto;
  const link = (i) => (i.local ? i.href : url(i.href));

  const aviso = site.aviso
    ? `<div class="aviso"><div class="container">${site.aviso.texto}${
        site.aviso.link ? ` <a href="${url(site.aviso.link.href)}">${site.aviso.link.rotulo}</a>` : ""
      }</div></div>`
    : "";

  const itens = site.menu.map((i) => `<a href="${link(i)}">${i.rotulo}</a>`).join("");
  const chamada = site.chamada
    ? `<a class="botao botao--pequeno" href="${url(site.chamada.href)}">${site.chamada.rotulo}</a>`
    : "";

  const iconeIndice = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h13"/></svg>`;

  alvo.innerHTML = `${aviso}
    <header class="cabecalho">
      <div class="container cabecalho__barra">
        <a class="marca" href="${url("./")}" aria-label="${site.nomeCompleto}, página inicial">
          <img src="${url("assets/img/marca/gremio-azul.png")}" alt="" width="40" height="40">
          <span>${site.nome}</span>
        </a>
        <button class="cabecalho__indice" type="button" data-abrir-gaveta aria-haspopup="dialog">${iconeIndice}Índice</button>
        <nav class="cabecalho__menu" aria-label="Principal">${itens}${chamada}</nav>
        <button class="cabecalho__menu-botao" type="button" data-abrir-gaveta aria-haspopup="dialog">Menu</button>
      </div>
    </header>
    <dialog class="gaveta" aria-label="Índice do site">
      <div class="gaveta__topo">
        <span class="gaveta__titulo">Índice</span>
        <button class="gaveta__fechar" type="button" data-fechar-gaveta>Fechar</button>
      </div>
      <nav class="indice indice--gaveta" aria-label="Índice do site">${arvore(contexto, "gaveta")}</nav>
      <div class="gaveta__menu">${itens}${chamada}</div>
    </dialog>`;

  const gaveta = alvo.querySelector(".gaveta");
  alvo.querySelectorAll("[data-abrir-gaveta]").forEach((b) => b.addEventListener("click", () => gaveta.showModal()));
  alvo.querySelector("[data-fechar-gaveta]").addEventListener("click", () => gaveta.close());
  // Fecha ao clicar fora do painel ou ao seguir um link.
  gaveta.addEventListener("click", (e) => {
    if (e.target === gaveta || e.target.closest("a")) gaveta.close();
  });
}
