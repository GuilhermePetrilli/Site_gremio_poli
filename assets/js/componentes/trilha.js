// Trilha de navegação (Início › Área do aluno › …).
// Uso direto: <div data-componente="trilha" data-id="aluno"></div>
// Também é usada pelo componente de página.

export function trilha({ url, destino }, ancestrais, no) {
  const passos = [
    `<li><a href="${url("./")}">Início</a></li>`,
    ...ancestrais.map((a, i) => `<li><a href="${url(destino(a, ancestrais.slice(0, i)))}">${a.titulo}</a></li>`),
    `<li><span aria-current="page">${no.titulo}</span></li>`,
  ];
  return `<nav class="trilha" aria-label="Você está em"><ol>${passos.join("")}</ol></nav>`;
}

export default function componenteTrilha(alvo, contexto) {
  const achado = contexto.encontrar(alvo.dataset.id);
  if (achado) alvo.innerHTML = trilha(contexto, achado.ancestrais, achado.no);
}
