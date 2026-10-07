// Blocos das ramificações, gerados a partir do registro (ramificacoes.js).
// Uso: <div data-componente="ramificacoes" data-grupo="frentes"></div>
// Cada bloco tem o id da ramificação, para servir de destino enquanto a página dela não existe.

export default function ramificacoes(alvo, { url, registro, destino }) {
  const grupo = alvo.dataset.grupo || "frentes";
  const lista = registro.filter((r) => r.grupo === grupo);
  const classe = grupo === "acessos" ? "acessos" : "frentes";

  const estado = (r) =>
    r.pronta
      ? `<a class="botao botao--linha botao--pequeno" href="${url(destino(r))}">Abrir ${r.titulo}</a>`
      : `<span class="estado">Página em construção</span>`;

  const numeros = (r) =>
    r.numeros && r.numeros.length
      ? `<dl class="frente__numeros">${r.numeros.map((n) => `<div><dt>${n.valor}</dt><dd>${n.rotulo}</dd></div>`).join("")}</dl>`
      : "";

  const itens = (r) =>
    r.itens && r.itens.length
      ? `<ul class="frente__itens">${r.itens.map((i) => `<li><h4>${i.nome}</h4><p>${i.texto}</p></li>`).join("")}</ul>`
      : "";

  const acoes = (r) =>
    r.acoes && r.acoes.length
      ? `<div class="acoes frente__acoes">${r.acoes
          .map((a, i) => `<a class="botao${i ? " botao--linha" : ""}" href="${a.href}"${a.externo ? ' target="_blank" rel="noopener"' : ""}>${a.rotulo}</a>`)
          .join("")}</div>`
      : "";

  if (classe === "acessos") {
    alvo.innerHTML = `<div class="acessos">${lista
      .map((r) => `<article class="acesso" id="${r.id}">
          <h3>${r.titulo}</h3>
          <p>${r.resumo}</p>
          ${estado(r)}
        </article>`)
      .join("")}</div>`;
    return;
  }

  alvo.innerHTML = `<div class="frentes">${lista
    .map((r) => `<article class="frente" id="${r.id}">
        <div class="frente__cabeca">
          <h3>${r.titulo}</h3>
          <p>${r.resumo}</p>
          ${numeros(r)}
          ${estado(r)}
        </div>
        <div class="frente__corpo">${itens(r)}${acoes(r)}</div>
      </article>`)
    .join("")}</div>`;
}
