// Rodapé no formato de carimbo (legenda) de folha de desenho técnico:
// cada campo traz um dado da entidade.

export default function rodape(alvo, { site, url }) {
  const { contato } = site;
  const tel = contato.telefone.replace(/\D/g, "");
  const menu = site.menu.map((i) => `<li><a href="${url(i.href)}">${i.rotulo}</a></li>`).join("");

  alvo.innerHTML = `
    <footer class="rodape" id="contato">
      <div class="container">
        <div class="rodape__topo">
          <h2>Fale com o Grêmio</h2>
          <p>Dúvidas, demandas, parcerias ou sugestões: escreva para a gente pelo canal que preferir.</p>
          <ul class="rodape__canais">
            <li><a href="mailto:${contato.email}"><span>E-mail</span>${contato.email}</a></li>
            <li><a href="tel:+55${tel}"><span>Telefone</span>${contato.telefone}</a></li>
            ${site.redes.map((r) => `<li><a href="${r.href}" target="_blank" rel="noopener"><span>${r.nome}</span>${r.usuario}</a></li>`).join("")}
          </ul>
        </div>

        <div class="carimbo" role="group" aria-label="Dados da entidade">
          <div class="carimbo__logo"><img src="${url("assets/img/marca/gremio-azul.png")}" alt="${site.nomeCompleto}" width="88" height="88"></div>
          <div class="carimbo__campo carimbo__campo--largo"><span>Entidade</span>${site.nomeCompleto}</div>
          <div class="carimbo__campo"><span>Fundação</span>1º de setembro de 1903</div>
          <div class="carimbo__campo carimbo__campo--largo"><span>Sede</span>${contato.endereco}</div>
          <div class="carimbo__campo"><span>CNPJ</span>${contato.cnpj}</div>
          <div class="carimbo__campo carimbo__campo--largo"><span>Representa</span>Alunos da Escola Politécnica da USP</div>
          <div class="carimbo__campo"><span>Ano</span><span data-ano></span></div>
        </div>

        <nav class="rodape__menu" aria-label="Rodapé"><ul>${menu}</ul></nav>
      </div>
    </footer>`;
}
