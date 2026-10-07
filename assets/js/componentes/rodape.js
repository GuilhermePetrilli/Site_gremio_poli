// Rodapé: contato, redes sociais e links do menu.

export default function rodape(alvo, { site, url }) {
  const { contato } = site;
  const tel = contato.telefone.replace(/\D/g, "");
  const redes = site.redes
    .map((r) => `<li><a href="${r.href}" target="_blank" rel="noopener">${r.nome} <span>${r.usuario}</span></a></li>`)
    .join("");
  const menu = site.menu.map((i) => `<li><a href="${url(i.href)}">${i.rotulo}</a></li>`).join("");

  alvo.innerHTML = `
    <footer class="rodape" id="contato">
      <div class="container rodape__grade">
        <div class="rodape__marca">
          <img src="${url("assets/img/marca/gremio-branco.png")}" alt="${site.nomeCompleto}" width="96" height="96">
          <p>${site.slogan}.</p>
        </div>
        <div>
          <h2 class="rodape__titulo">Contato</h2>
          <ul class="rodape__lista">
            <li>${contato.endereco}</li>
            <li><a href="tel:+55${tel}">${contato.telefone}</a></li>
            <li><a href="mailto:${contato.email}">${contato.email}</a></li>
          </ul>
        </div>
        <div>
          <h2 class="rodape__titulo">Redes</h2>
          <ul class="rodape__lista">${redes}</ul>
        </div>
        <div>
          <h2 class="rodape__titulo">Navegação</h2>
          <ul class="rodape__lista">${menu}</ul>
        </div>
      </div>
      <div class="container rodape__base">
        <span>© <span data-ano></span> ${site.nomeCompleto}</span>
        <span>CNPJ ${contato.cnpj}</span>
      </div>
    </footer>`;
}
