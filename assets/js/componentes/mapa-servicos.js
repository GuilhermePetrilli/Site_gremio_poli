// Página Serviços: mapa do campus com zoom (arrastar, rodinha, pinça e botões) e os
// empreendimentos do Grêmio marcados com a logo. Os pontos vêm de dados/servicos.js; para
// expandir o mapa, basta acrescentar itens lá. Usa o mesmo mapa-base do guia dos bandejões.
// Uso: <div class="mapa-serv" id="mapaServ"></div>, cartões com data-servico, e
// <div data-componente="mapa-servicos"></div>.

import { L } from "../dados/mapa-campus.js?v=202610072351";
import { servicos } from "../dados/servicos.js?v=202610072351";

const NS = "http://www.w3.org/2000/svg";
const el = (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };

export default function mapaServicos(_alvo, { url }) {
  const caixa = document.getElementById("mapaServ");
  if (!caixa) return;
  caixa.innerHTML = `<svg class="mapa-serv__svg" role="img" aria-label="Mapa da Poli com os serviços do Grêmio"></svg>
    <div class="mapa-serv__zoom">
      <button type="button" data-z="in" aria-label="Aproximar">+</button>
      <button type="button" data-z="out" aria-label="Afastar">−</button>
      <button type="button" data-z="poli" class="txt" aria-label="Voltar para a Poli">POLI</button>
    </div>
    <p class="mapa-serv__dica">Arraste para mover · use + e − para o zoom</p>`;
  const svg = caixa.querySelector("svg");

  // camadas do mapa-base
  const base = el("g", {}, svg), marcas = el("g", {}, svg);
  el("rect", { x: -2000, y: -2000, width: 6000, height: 6000, class: "ms-chao" }, base);
  el("path", { d: L.river, class: "ms-agua" }, base);
  el("path", { d: L.outer + L.inner, class: "ms-campus" }, base);
  el("path", { d: L.brown, class: "ms-livre" }, base);
  el("path", { d: L.raia, class: "ms-raia" }, base);
  el("path", { d: L.poli, class: "ms-poli" }, base);
  el("path", { d: L.roads, class: "ms-rua" }, base);
  el("path", { d: L.bld, class: "ms-predio" }, base);
  el("path", { d: L.bldpoli, class: "ms-predio-poli" }, base);
  const rotulos = [["POLI", 870, 215, "ms-rot ms-rot--poli", 22], ["Raia Olímpica", 1180, 322, "ms-rot ms-rot--agua", 13]];

  // marcadores com a logo
  const fixos = [];
  const fixo = (g, x, y) => { g.dataset.x = x; g.dataset.y = y; fixos.push(g); return g; };
  rotulos.forEach(([t, x, y, c, fs]) => { const g = fixo(el("g", {}, marcas), x, y); const tx = el("text", { class: c, "font-size": fs, "text-anchor": "middle" }, g); tx.textContent = t; });
  const comLugar = servicos.filter((s) => s.x != null);
  for (const s of comLugar) {
    const g = fixo(el("g", { class: "ms-marca", tabindex: "0", role: "button", "aria-label": `${s.nome}: ${s.onde || ""}` }, marcas), s.x, s.y);
    el("path", { d: "M0 0 C-6 -10 -26 -18 -26 -40 a26 26 0 0 1 52 0 c0 22 -20 30 -26 40z", class: "ms-pino" }, g);
    el("image", { href: url(s.logo), x: -18, y: -58, width: 36, height: 36 }, g);
    const t = el("text", { class: "ms-nome", x: 32, y: -36 }, g); t.textContent = s.nome;
    const t2 = el("text", { class: "ms-onde", x: 32, y: -20 }, g); t2.textContent = s.onde || "";
    const ir = () => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    g.addEventListener("click", ir); g.addEventListener("keydown", (e) => { if (e.key === "Enter") ir(); });
  }

  // visão e zoom
  const V = { x: 0, y: 0, w: 520 };
  const vh = () => V.w * caixa.clientHeight / Math.max(1, caixa.clientWidth);
  const aplicar = () => {
    svg.setAttribute("viewBox", `${V.x} ${V.y} ${V.w} ${vh()}`);
    const k = V.w / Math.max(1, caixa.clientWidth);
    fixos.forEach((g) => g.setAttribute("transform", `translate(${g.dataset.x} ${g.dataset.y}) scale(${k})`));
  };
  const centrar = (cx, cy, w) => { V.w = Math.min(1900, Math.max(160, w)); V.x = cx - V.w / 2; V.y = cy - vh() / 2; aplicar(); };
  const poli = () => centrar(820, 420, 560);
  const zoom = (f, cx = V.x + V.w / 2, cy = V.y + vh() / 2) => {
    const px = (cx - V.x) / V.w, py = (cy - V.y) / vh();
    V.w = Math.min(1900, Math.max(160, V.w * f)); V.x = cx - px * V.w; V.y = cy - py * vh(); aplicar();
  };
  caixa.querySelector(".mapa-serv__zoom").addEventListener("click", (e) => {
    const b = e.target.closest("[data-z]"); if (!b) return;
    if (b.dataset.z === "in") zoom(0.7); else if (b.dataset.z === "out") zoom(1 / 0.7); else poli();
  });
  const noMapa = (ev) => { const r = caixa.getBoundingClientRect(); return [V.x + (ev.clientX - r.left) / r.width * V.w, V.y + (ev.clientY - r.top) / r.height * vh()]; };
  caixa.addEventListener("wheel", (e) => { if (!e.ctrlKey && !caixa.matches(":hover")) return; e.preventDefault(); const [x, y] = noMapa(e); zoom(Math.exp(e.deltaY * 0.0015), x, y); }, { passive: false });
  const dedos = new Map(); let arrasto = null, pinca = null;
  svg.addEventListener("pointerdown", (e) => {
    svg.setPointerCapture(e.pointerId); dedos.set(e.pointerId, [e.clientX, e.clientY]);
    if (dedos.size === 1) arrasto = { x: e.clientX, y: e.clientY, vx: V.x, vy: V.y };
    if (dedos.size === 2) { const [a, b] = [...dedos.values()]; pinca = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), w: V.w }; arrasto = null; }
  });
  svg.addEventListener("pointermove", (e) => {
    if (!dedos.has(e.pointerId)) return; dedos.set(e.pointerId, [e.clientX, e.clientY]);
    if (pinca && dedos.size === 2) { const [a, b] = [...dedos.values()]; const d = Math.hypot(a[0] - b[0], a[1] - b[1]); const [mx, my] = noMapa({ clientX: (a[0] + b[0]) / 2, clientY: (a[1] + b[1]) / 2 }); zoom((pinca.w * pinca.d / Math.max(d, 1)) / V.w, mx, my); return; }
    if (arrasto) { const s = V.w / caixa.clientWidth; V.x = arrasto.vx - (e.clientX - arrasto.x) * s; V.y = arrasto.vy - (e.clientY - arrasto.y) * s; aplicar(); caixa.classList.add("arrastando"); }
  });
  const soltar = (e) => { dedos.delete(e.pointerId); if (dedos.size < 2) pinca = null; if (!dedos.size) { arrasto = null; caixa.classList.remove("arrastando"); } };
  svg.addEventListener("pointerup", soltar); svg.addEventListener("pointercancel", soltar);
  new ResizeObserver(() => aplicar()).observe(caixa);

  // botões "Ver no mapa" dos cartões
  document.querySelectorAll("[data-ver-no-mapa]").forEach((b) => b.addEventListener("click", () => {
    const s = servicos.find((x) => x.id === b.dataset.verNoMapa); if (!s || s.x == null) return;
    caixa.scrollIntoView({ behavior: "smooth", block: "center" }); centrar(s.x, s.y - 20, 260);
  }));

  poli();
}
