// Cabeçalho: faixa de aviso, marca, menu e botão de menu no celular.

export default function cabecalho(alvo, { site, url }) {
  const aviso = site.aviso
    ? `<div class="aviso"><div class="container">${site.aviso.texto}${
        site.aviso.link ? ` <a href="${url(site.aviso.link.href)}">${site.aviso.link.rotulo}</a>` : ""
      }</div></div>`
    : "";

  const itens = site.menu.map((i) => `<a href="${url(i.href)}">${i.rotulo}</a>`).join("");
  const chamada = site.chamada
    ? `<a class="botao botao--pequeno" href="${url(site.chamada.href)}">${site.chamada.rotulo}</a>`
    : "";

  alvo.innerHTML = `${aviso}
    <header class="cabecalho">
      <div class="container cabecalho__barra">
        <a class="marca" href="${url("./")}" aria-label="${site.nomeCompleto}, página inicial">
          <img src="${url("assets/img/marca/gremio-azul.png")}" alt="" width="44" height="44">
          <span>${site.nome}</span>
        </a>
        <button class="cabecalho__menu-botao" type="button" aria-expanded="false" aria-controls="menu-principal">Menu</button>
        <nav id="menu-principal" class="cabecalho__menu" aria-label="Principal">${itens}${chamada}</nav>
      </div>
    </header>`;

  const botao = alvo.querySelector(".cabecalho__menu-botao");
  const menu = alvo.querySelector(".cabecalho__menu");
  const fechar = () => {
    menu.classList.remove("aberto");
    botao.setAttribute("aria-expanded", "false");
  };
  botao.addEventListener("click", () => {
    const aberto = menu.classList.toggle("aberto");
    botao.setAttribute("aria-expanded", String(aberto));
  });
  menu.querySelectorAll("a").forEach((a) => a.addEventListener("click", fechar));
}
