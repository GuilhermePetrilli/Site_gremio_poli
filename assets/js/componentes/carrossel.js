// Carrossel de fotos (Mural de memórias, em aluno/eventos-e-memorias/): polaroides numa faixa
// que desliza, com a da vez no centro, setas, pontinhos, arrastar no celular e as setas do teclado.
// Passa sozinho a cada 5 segundos enquanto está na tela, e para quando a pessoa passa o mouse,
// toca, usa o teclado ou pede menos movimento no sistema.
// Uso: <div class="carrossel" data-carrossel> com .carrossel__trilho (lista), .carrossel__seta
// [data-passo="-1"|"1"] e .carrossel__pontos; e <div data-componente="carrossel"></div>.

const reduzir = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export default function carrossel() {
  document.querySelectorAll("[data-carrossel]").forEach(montar);
}

function montar(c) {
  const trilho = c.querySelector(".carrossel__trilho"), itens = [...trilho.children], pontos = c.querySelector(".carrossel__pontos");
  if (!itens.length) return;
  itens.forEach((el, i) => { el.setAttribute("role", "group"); el.setAttribute("aria-roledescription", "foto"); el.setAttribute("aria-label", `${i + 1} de ${itens.length}`); });
  pontos.innerHTML = itens.map((_, i) => `<button type="button" aria-label="Ir para a foto ${i + 1} de ${itens.length}"></button>`).join("");
  let atual = 0;

  const destacar = (i) => {
    atual = i;
    itens.forEach((el, k) => el.classList.toggle("ativa", k === i));
    [...pontos.children].forEach((b, k) => b.setAttribute("aria-current", k === i ? "true" : "false"));
  };
  const ir = (i) => {
    const n = (i + itens.length) % itens.length, el = itens[n];
    destacar(n);
    trilho.scrollTo({ left: el.offsetLeft - (trilho.clientWidth - el.offsetWidth) / 2, behavior: reduzir() ? "auto" : "smooth" });
  };
  const marcar = () => {
    const meio = trilho.scrollLeft + trilho.clientWidth / 2;
    let perto = Infinity, mais = 0;
    itens.forEach((el, i) => { const d = Math.abs(el.offsetLeft + el.offsetWidth / 2 - meio); if (d < perto) { perto = d; mais = i; } });
    destacar(mais);
  };
  let quadro, espera;
  trilho.addEventListener("scroll", () => {
    cancelAnimationFrame(quadro); quadro = requestAnimationFrame(marcar);
    clearTimeout(espera); espera = setTimeout(marcar, 120); // garante a marcação no fim do deslize
  }, { passive: true });
  new ResizeObserver(marcar).observe(trilho);

  c.querySelectorAll("[data-passo]").forEach((b) => b.addEventListener("click", () => ir(atual + Number(b.dataset.passo))));
  pontos.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) ir([...pontos.children].indexOf(b)); });
  itens.forEach((el, i) => el.addEventListener("click", () => { if (i !== atual) ir(i); }));
  trilho.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); ir(atual + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); ir(atual - 1); }
  });

  // passa sozinho, só quando está visível e ninguém está mexendo
  let parado = false, visivel = false;
  ["pointerenter", "focusin", "touchstart"].forEach((ev) => c.addEventListener(ev, () => { parado = true; }, { passive: true }));
  ["pointerleave", "focusout"].forEach((ev) => c.addEventListener(ev, () => { parado = false; }));
  new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0.5 }).observe(c);
  setInterval(() => { if (visivel && !parado && !reduzir() && !document.hidden) ir(atual + 1); }, 5000);

  marcar();
}
