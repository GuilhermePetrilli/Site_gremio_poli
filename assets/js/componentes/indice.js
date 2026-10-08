// Índice do site em árvore, gerado do registro (ramificacoes.js).
// Uso: <div data-componente="indice" data-modo="lateral"></div>
// O mesmo desenho é usado na gaveta do cabeçalho (ver cabecalho.js).
// Os filhos aparecem abertos na ramificação em que o visitante está.
//
// Índice de uma área (ex.: Área do aluno): <div data-componente="indice" data-modo="lateral" data-raiz="aluno"></div>
// Mostra só aquela ramificação, com a página de entrada no topo e as subpáginas abaixo,
// do mesmo jeito que o índice do site faz com as frentes.

function posicao({ raiz }) {
  const aqui = location.pathname.replace(/index\.html$/, "");
  const caminhoDe = (no) => new URL(no.caminho, raiz).pathname;
  return {
    aqui,
    ehAtual: (no) => no.caminho && caminhoDe(no) === aqui,
    contemAtual: (no) => no.caminho && aqui.startsWith(caminhoDe(no)),
  };
}

function ramo(contexto, nos, ancestrais = [], sempreAbrir = false) {
  const { url, destino } = contexto;
  const { ehAtual, contemAtual } = posicao(contexto);
  return `<ul>${nos
    .map((no) => {
      const temFilhos = no.filhos && no.filhos.length;
      const abrir = temFilhos && (sempreAbrir || contemAtual(no));
      const atual = ehAtual(no) ? ' aria-current="page"' : "";
      const destaque = no.destaque ? `<span class="indice__destaque">${no.destaque}</span>` : "";
      return `<li><a href="${url(destino(no, ancestrais))}"${atual}>${no.titulo}${destaque}</a>${
        abrir ? ramo(contexto, no.filhos, [...ancestrais, no]) : ""
      }</li>`;
    })
    .join("")}</ul>`;
}

// O grupo "Acessos" (Área do aluno, dos administradores) não entra na árvore: essas áreas
// já têm botões próprios no cabeçalho, no topo da gaveta e na faixa de acesso da página inicial.
export function arvore(contexto) {
  const { registro, grupos, url, raiz } = contexto;
  const { aqui } = posicao(contexto);
  const inicio = aqui === new URL("./", raiz).pathname;
  return `<a class="indice__inicio" href="${url("./")}"${inicio ? ' aria-current="page"' : ""}>Início</a>${grupos
    .filter((g) => g.id !== "acessos")
    .map((g) => {
      const nos = registro.filter((no) => no.grupo === g.id);
      return nos.length ? `<div class="indice__grupo"><p class="indice__titulo">${g.titulo}</p>${ramo(contexto, nos)}</div>` : "";
    })
    .join("")}${botoesDoFim(contexto)}`;
}

// Nós do grupo "fim" (hoje, a Transparência) fecham o índice como botão vermelho.
const iconeContas = `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>`;
function botoesDoFim(contexto) {
  const { registro, url, destino } = contexto;
  const { ehAtual } = posicao(contexto);
  const fim = registro.filter((no) => no.grupo === "fim");
  return fim.length
    ? `<div class="indice__fim">${fim.map((no) => `<a class="botao botao--transparencia" href="${url(destino(no, []))}"${ehAtual(no) ? ' aria-current="page"' : ""}>${iconeContas}<span>${no.titulo}</span></a>`).join("")}</div>`
    : "";
}

// Índice de uma única ramificação e das suas subpáginas.
export function arvoreDaArea(contexto, id) {
  const { url, destino, encontrar } = contexto;
  const achado = encontrar(id);
  if (!achado) return arvore(contexto);
  const { no, ancestrais } = achado;
  const { ehAtual } = posicao(contexto);
  const filhos = no.filhos || [];
  return `<a class="indice__cabeca" href="${url(destino(no, ancestrais))}"${ehAtual(no) ? ' aria-current="page"' : ""}>
      <strong>${no.titulo}</strong><span>Página de entrada</span>
    </a>
    ${filhos.length
      ? `<div class="indice__grupo"><p class="indice__titulo">Nesta área</p>${ramo(contexto, filhos, [...ancestrais, no], true)}</div>`
      : `<p class="indice__titulo">As páginas desta área aparecem aqui conforme forem criadas.</p>`}
    <p class="indice__voltar"><a href="${url("./")}">Voltar ao início do site</a></p>`;
}

export default function indice(alvo, contexto) {
  const modo = alvo.dataset.modo || "lateral";
  const area = alvo.dataset.raiz;
  const rotulo = area ? `Índice: ${contexto.encontrar(area)?.no.titulo || "área"}` : "Índice do site";
  alvo.innerHTML = `<nav class="indice indice--${modo}" aria-label="${rotulo}">${area ? arvoreDaArea(contexto, area) : arvore(contexto)}</nav>`;
}
