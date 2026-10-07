// Página de uma ramificação, montada a partir do registro (ramificacoes.js).
// Uso: <div data-componente="pagina" data-id="apoio"></div>
// Mostra a trilha (Início › … › página), o título, o resumo, os números,
// as seções filhas e as ações. Filhos com página própria aparecem como cartões de recurso;
// filhos sem página viram seções com âncora. Para escrever uma página à mão, troque este
// componente pelo conteúdo em HTML e mantenha a trilha com data-componente="trilha".

import { trilha } from "./trilha.js?v=202610071019";

// Cartões das subpáginas de um nó. Também usado em páginas escritas à mão
// (<div data-componente="recursos" data-id="aluno"></div>).
export function cartoes({ url, destino }, no, ancestrais) {
  const comPagina = (no.filhos || []).filter((f) => f.caminho);
  if (!comPagina.length) return "";
  return `<ul class="recursos">${comPagina
    .map((f) => `<li><a class="recurso" href="${url(destino(f, [...ancestrais, no]))}">
        <h3>${f.titulo}</h3>
        ${f.resumo ? `<p>${f.resumo}</p>` : ""}
        <span class="recurso__ir">${f.chamada || `Abrir ${f.titulo.toLowerCase()}`}</span>
      </a></li>`)
    .join("")}</ul>`;
}

export default function pagina(alvo, contexto) {
  const { encontrar } = contexto;
  const achado = encontrar(alvo.dataset.id);
  if (!achado) {
    alvo.innerHTML = `<p>Esta página não está no registro de ramificações.</p>`;
    return;
  }
  const { no, ancestrais } = achado;
  const filhos = no.filhos || [];
  const secoesSemPagina = filhos.filter((f) => !f.caminho);

  const numeros = no.numeros && no.numeros.length
    ? `<dl class="fichas pagina__numeros">${no.numeros.map((n) => `<div class="ficha"><dt>${n.valor}</dt><dd>${n.rotulo}</dd></div>`).join("")}</dl>`
    : "";

  const acoes = no.acoes && no.acoes.length
    ? `<div class="acoes pagina__acoes">${no.acoes
        .map((a, i) => `<a class="botao${i ? " botao--linha" : ""}" href="${a.href}"${a.externo ? ' target="_blank" rel="noopener"' : ""}>${a.rotulo}</a>`)
        .join("")}</div>`
    : "";

  const recursos = cartoes(contexto, no, ancestrais);
  const secoes = secoesSemPagina
    .map((f) => `<section class="pagina__secao" id="${f.id}">
        <h2>${f.titulo}</h2>
        ${f.texto || f.resumo ? `<p>${f.texto || f.resumo}</p>` : ""}
      </section>`)
    .join("");

  alvo.innerHTML = `
    ${trilha(contexto, ancestrais, no)}
    <header class="pagina__topo">
      <h1>${no.titulo}</h1>
      <p class="pagina__resumo">${no.resumo || ""}</p>
      ${numeros}
      ${acoes}
      ${no.construcao ? `<p class="estado">Página em construção: o conteúdo completo entra em breve.</p>` : ""}
    </header>
    ${recursos ? `<div class="pagina__recursos">${recursos}</div>` : ""}
    <div class="pagina__secoes">${secoes || (recursos ? "" : `<p class="pagina__vazio">As seções desta área vão aparecer aqui conforme forem criadas.</p>`)}</div>`;
}
