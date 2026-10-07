// Página de uma ramificação, montada a partir do registro (ramificacoes.js).
// Uso: <div data-componente="pagina" data-id="apoio"></div>
// Mostra a trilha (Início › … › página), o título, o resumo, os números,
// as seções filhas e as ações. Para escrever uma página à mão, troque este
// componente pelo conteúdo em HTML e mantenha a trilha com data-componente="trilha".

import { trilha } from "./trilha.js?v=202610062246";

export default function pagina(alvo, contexto) {
  const { url, encontrar, destino } = contexto;
  const achado = encontrar(alvo.dataset.id);
  if (!achado) {
    alvo.innerHTML = `<p>Esta página não está no registro de ramificações.</p>`;
    return;
  }
  const { no, ancestrais } = achado;
  const filhos = no.filhos || [];

  const numeros = no.numeros && no.numeros.length
    ? `<dl class="pagina__numeros">${no.numeros.map((n) => `<div><dt>${n.valor}</dt><dd>${n.rotulo}</dd></div>`).join("")}</dl>`
    : "";

  const acoes = no.acoes && no.acoes.length
    ? `<div class="acoes pagina__acoes">${no.acoes
        .map((a, i) => `<a class="botao${i ? " botao--linha" : ""}" href="${a.href}"${a.externo ? ' target="_blank" rel="noopener"' : ""}>${a.rotulo}</a>`)
        .join("")}</div>`
    : "";

  const secoes = filhos.length
    ? filhos
        .map((f) => `<section class="pagina__secao" id="${f.id}">
            <h2>${f.caminho ? `<a href="${url(destino(f, [...ancestrais, no]))}">${f.titulo}</a>` : f.titulo}</h2>
            ${f.texto || f.resumo ? `<p>${f.texto || f.resumo}</p>` : ""}
          </section>`)
        .join("")
    : `<p class="pagina__vazio">As seções desta área vão aparecer aqui conforme forem criadas.</p>`;

  alvo.innerHTML = `
    ${trilha(contexto, ancestrais, no)}
    <header class="pagina__topo">
      <h1>${no.titulo}</h1>
      <p class="pagina__resumo">${no.resumo || ""}</p>
      ${numeros}
      ${acoes}
      ${no.construcao ? `<p class="estado">Página em construção: o conteúdo completo entra em breve.</p>` : ""}
    </header>
    <div class="pagina__secoes">${secoes}</div>`;
}
