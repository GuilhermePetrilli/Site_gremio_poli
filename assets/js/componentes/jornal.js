// Jornal O Politécnico (aluno/jornal/): folhear a edição com animação de virar a página
// e baixar a edição inteira em PDF (pela impressão do navegador, uma folha por página A3,
// o tamanho das folhas do jornal impresso).
// Uso: <div class="edicao" id="edicao"> com <section class="folha"> por página, a barra com
// #jornalAnterior, #jornalProxima, #jornalPagina e #jornalPdf, e <div data-componente="jornal"></div>.

export default function jornal() {
  const edicao = document.getElementById("edicao");
  if (!edicao) return;
  const folhas = [...edicao.querySelectorAll(".folha")];
  const ant = document.getElementById("jornalAnterior"), prox = document.getElementById("jornalProxima"), rotulo = document.getElementById("jornalPagina");
  let atual = 0, ocupado = false;
  const reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Todas as folhas passam a ocupar o mesmo lugar; só a atual fica visível.
  folhas.forEach((f) => f.removeAttribute("hidden"));
  edicao.classList.add("pronta");
  // A edição acompanha a altura da página aberta (as folhas ficam sobrepostas).
  const ajustarAltura = () => { edicao.style.height = `${folhas[atual].offsetHeight}px`; };
  new ResizeObserver(ajustarAltura).observe(edicao);
  folhas.forEach((f) => new ResizeObserver(() => { if (f === folhas[atual]) ajustarAltura(); }).observe(f));
  const marcar = () => {
    folhas.forEach((f, i) => { f.classList.toggle("atual", i === atual); f.setAttribute("aria-hidden", i === atual ? "false" : "true"); f.inert = i !== atual; });
    rotulo.textContent = `Página ${atual + 1} de ${folhas.length}`;
    ant.disabled = atual === 0; prox.disabled = atual === folhas.length - 1;
    ajustarAltura();
  };

  function ir(destino) {
    if (ocupado || destino < 0 || destino >= folhas.length || destino === atual) return;
    const frente = destino > atual;
    if (reduzido) { atual = destino; marcar(); return; }
    ocupado = true;
    // Avançar: a folha atual vira para a esquerda e revela a próxima.
    // Voltar: a folha anterior desvira por cima da atual.
    const anima = frente ? folhas[atual] : folhas[destino];
    const classe = frente ? "virando" : "voltando";
    if (frente) { folhas[destino].classList.add("atual"); }
    anima.classList.add(classe);
    let feito = false;
    const fim = () => {
      if (feito) return; feito = true;
      anima.classList.remove(classe);
      atual = destino; marcar(); ocupado = false;
    };
    anima.addEventListener("animationend", fim, { once: true });
    setTimeout(fim, 900); // garantia, caso o navegador não avise o fim da animação
  }

  ant.addEventListener("click", () => ir(atual - 1));
  prox.addEventListener("click", () => ir(atual + 1));
  // Rodapé de cada folha ("continua na página 2") também vira a página.
  folhas.forEach((f, i) => f.querySelector(".jornal__rodape")?.addEventListener("click", () => ir(i + 1)));
  edicao.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") ir(atual + 1); if (e.key === "ArrowLeft") ir(atual - 1); });
  // Deslizar o dedo no celular.
  let x0 = null;
  edicao.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  edicao.addEventListener("touchend", (e) => {
    if (x0 == null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 60) ir(atual + (dx < 0 ? 1 : -1));
  });

  // PDF: abre a impressão com o nome da edição; o leitor escolhe "Salvar como PDF".
  document.getElementById("jornalPdf")?.addEventListener("click", () => {
    const titulo = document.title;
    document.title = "O Politécnico - edição de relançamento";
    addEventListener("afterprint", () => { document.title = titulo; }, { once: true });
    print();
  });

  marcar();
}
