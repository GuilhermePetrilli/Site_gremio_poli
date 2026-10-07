// Índice do site em árvore, gerado do registro (ramificacoes.js).
// Uso: <div data-componente="indice" data-modo="lateral"></div>
// O mesmo desenho é usado na gaveta do cabeçalho (ver cabecalho.js).
// Os filhos aparecem abertos na ramificação em que o visitante está.

export function arvore({ registro, grupos, url, raiz, destino }, modo = "lateral") {
  const aqui = location.pathname.replace(/index\.html$/, "");
  const caminhoDe = (no) => new URL(no.caminho, raiz).pathname;
  const ehAtual = (no) => no.caminho && caminhoDe(no) === aqui;
  const contemAtual = (no) => no.caminho && aqui.startsWith(caminhoDe(no));

  const ramo = (nos, ancestrais = []) => `<ul>${nos
    .map((no) => {
      const abrir = contemAtual(no) && no.filhos && no.filhos.length;
      const atual = ehAtual(no) ? ' aria-current="page"' : "";
      return `<li><a href="${url(destino(no, ancestrais))}"${atual}>${no.titulo}</a>${
        abrir ? ramo(no.filhos, [...ancestrais, no]) : ""
      }</li>`;
    })
    .join("")}</ul>`;

  const inicio = aqui === new URL("./", raiz).pathname;
  return `<a class="indice__inicio" href="${url("./")}"${inicio ? ' aria-current="page"' : ""}>Início</a>${grupos
    .map((g) => {
      const nos = registro.filter((no) => no.grupo === g.id);
      return nos.length ? `<div class="indice__grupo"><p class="indice__titulo">${g.titulo}</p>${ramo(nos)}</div>` : "";
    })
    .join("")}`;
}

export default function indice(alvo, contexto) {
  const modo = alvo.dataset.modo || "lateral";
  alvo.innerHTML = `<nav class="indice indice--${modo}" aria-label="Índice do site">${arvore(contexto, modo)}</nav>`;
}
