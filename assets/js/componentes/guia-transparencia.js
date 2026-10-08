// Transparência (transparencia/): saldo ao vivo, barra da dívida, gráfico mês a mês e extrato
// com o saldo acumulado. Os lançamentos vêm de dados/contas.js (banco Supabase ou arquivo).
// Uso: marcação em transparencia/index.html e <div data-componente="guia-transparencia"></div>.

import { carregar, ouvir, extrato, reais, dataBR, INICIO_CONTAS } from "../dados/contas.js?v=202610072336";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

export default async function guiaTransparencia(_alvo, { site, raiz }) {
  if (!$("#tabelaContas")) return;
  const F = { tipo: "todos", categoria: "", busca: "" };
  let dados = null, idsVistos = new Set(), primeira = true;

  async function atualizar() {
    try {
      const r = await carregar(site, raiz);
      dados = { ...r, ...extrato(r.lancamentos, r.parametros) };
      desenhar();
      const hora = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const vivo = $("#aoVivo");
      vivo.classList.toggle("on", r.modo === "banco");
      vivo.querySelector("span").textContent = r.modo === "banco" ? `Ao vivo · atualizado às ${hora}`
        : dados.linhas.length ? `Contas publicadas · conferido às ${hora}` : "As contas começam a ser publicadas em 1º de janeiro de 2027.";
    } catch {
      $("#aoVivo span").textContent = "Não deu para carregar as contas agora. Tente de novo em alguns minutos.";
    }
  }

  function desenhar() {
    const d = dados;
    // saldo
    const sv = $("#saldoValor");
    sv.textContent = reais(d.saldo);
    sv.classList.toggle("negativo", d.saldo < 0);
    $("#saldoRotulo").textContent = d.inicialDefinido ? `Saldo desde 1º de janeiro de 2027 (começou com ${reais(d.inicial)})` : "Saldo desde 1º de janeiro de 2027";
    $("#totReceitas").textContent = reais(d.receitas);
    $("#totDespesas").textContent = reais(d.despesas);
    $("#totLanc").textContent = d.linhas.length;

    // dívida
    const barra = $("#dividaBarra"), pago = $("#dividaPago");
    if (d.divida.total == null) {
      barra.classList.add("a-confirmar");
      pago.style.width = "0";
      $("#dividaValor").textContent = "Valor a confirmar";
      $("#dividaLegenda").textContent = d.divida.paga
        ? `Já foram pagos ${reais(d.divida.paga)}. O valor total está sendo levantado e será publicado aqui.`
        : "O valor total está sendo levantado e será publicado aqui. Cada pagamento lançado pelo Grêmio vai encher esta barra.";
      barra.setAttribute("aria-label", "Valor da dívida ainda a confirmar");
    } else {
      barra.classList.remove("a-confirmar");
      const pct = d.divida.total > 0 ? Math.min(100, (d.divida.paga / d.divida.total) * 100) : 100;
      pago.style.width = `${pct}%`;
      const resta = Math.max(0, d.divida.total - d.divida.paga);
      $("#dividaValor").textContent = resta ? `Faltam ${reais(resta)}` : "Dívida quitada";
      $("#dividaLegenda").textContent = `${reais(d.divida.paga)} pagos de ${reais(d.divida.total)} (${pct.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%). A barra enche a cada pagamento lançado.`;
      barra.setAttribute("aria-label", `${pct.toFixed(0)}% da dívida paga`);
    }

    grafico();
    graficoAcumulado();

    // categorias do filtro
    const sel = $("#fCategoria"), atual = sel.value;
    const cats = [...new Set(d.linhas.map((l) => l.categoria).filter(Boolean))].sort((a, b) => a.localeCompare(b, "pt"));
    sel.innerHTML = `<option value="">Todas as categorias</option>` + cats.map((c) => `<option${c === atual ? " selected" : ""}>${esc(c)}</option>`).join("");
    tabela();
    primeira = false;
  }

  function grafico() {
    const svg = $("#grafMeses");
    const w = Math.max(320, svg.clientWidth || 800), h = 240, esq = 8, dir = 8, topo = 14, baixo = 26;
    const porMes = MESES.map(() => ({ r: 0, d: 0, saldo: null }));
    for (const l of dados.linhas) {
      const m = +l.data.slice(5, 7) - 1;
      if (l.data.slice(0, 4) !== INICIO_CONTAS.slice(0, 4)) continue;
      if (l.tipo === "receita") porMes[m].r += l.valor; else porMes[m].d += l.valor;
      porMes[m].saldo = l.saldo;
    }
    let ultimo = dados.inicial;
    const hojeMes = new Date().getFullYear() === 2027 ? new Date().getMonth() : (new Date().getFullYear() > 2027 ? 11 : -1);
    porMes.forEach((p, i) => { if (p.saldo == null) p.saldo = i <= hojeMes ? ultimo : null; else ultimo = p.saldo; });
    const valores = porMes.flatMap((p) => [p.r, -p.d, p.saldo ?? 0]);
    const max = Math.max(1, ...valores), min = Math.min(0, ...valores);
    const y = (v) => topo + ((max - v) / (max - min)) * (h - topo - baixo);
    const col = (w - esq - dir) / 12, bw = Math.max(6, col * 0.28);
    let s = `<line class="zero" x1="${esq}" x2="${w - dir}" y1="${y(0)}" y2="${y(0)}"/>`;
    porMes.forEach((p, i) => {
      const cx = esq + col * i + col / 2;
      if (p.r) s += `<rect class="barra-r" x="${cx - bw - 1}" y="${y(p.r)}" width="${bw}" height="${y(0) - y(p.r)}" rx="2"><title>${MESES[i]}: receitas ${reais(p.r)}</title></rect>`;
      if (p.d) s += `<rect class="barra-d" x="${cx + 1}" y="${y(0)}" width="${bw}" height="${y(-p.d) - y(0)}" rx="2"><title>${MESES[i]}: despesas ${reais(p.d)}</title></rect>`;
      s += `<text class="rot" x="${cx}" y="${h - 8}" text-anchor="middle">${MESES[i]}</text>`;
    });
    const pts = porMes.map((p, i) => (p.saldo == null ? null : [esq + col * i + col / 2, y(p.saldo), p.saldo, i])).filter(Boolean);
    if (pts.length) {
      s += `<polyline class="linha-saldo" points="${pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ")}"/>`;
      s += pts.map((p) => `<circle class="ponto-saldo" cx="${p[0]}" cy="${p[1]}" r="4"><title>${MESES[p[3]]}: saldo ${reais(p[2])}</title></circle>`).join("");
    }
    if (!dados.linhas.length) s += `<text class="rot" x="${w / 2}" y="${h / 2 - 10}" text-anchor="middle">Os meses de 2027 vão se preencher conforme as contas forem lançadas.</text>`;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML = s;
  }

  /* ---------- saldo acumulado x dívida, com ajuste de curva ---------- */
  // Mínimos quadrados para um polinômio de grau g (equações normais + eliminação de Gauss).
  function polinomio(xs, ys, g) {
    const n = g + 1, A = Array.from({ length: n }, () => Array(n + 1).fill(0));
    xs.forEach((x, i) => {
      const p = Array.from({ length: n }, (_, k) => x ** k);
      for (let r = 0; r < n; r++) { for (let c = 0; c < n; c++) A[r][c] += p[r] * p[c]; A[r][n] += p[r] * ys[i]; }
    });
    for (let c = 0; c < n; c++) {
      let piv = c; for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
      [A[c], A[piv]] = [A[piv], A[c]];
      if (Math.abs(A[c][c]) < 1e-12) return null;
      for (let r = 0; r < n; r++) if (r !== c) { const f = A[r][c] / A[c][c]; for (let k = c; k <= n; k++) A[r][k] -= f * A[c][k]; }
    }
    return A.map((linha, i) => linha[n] / linha[i]);
  }
  const avaliar = (coef, t) => coef.reduce((s, a, k) => s + a * t ** k, 0);
  // Escolhe o grau (1 a 3) pelo critério AICc, que pune complexidade com poucos pontos.
  function melhorAjuste(xs, ys) {
    const n = xs.length, media = ys.reduce((a, b) => a + b, 0) / n;
    const tss = ys.reduce((s, y) => s + (y - media) ** 2, 0);
    let melhor = null;
    for (let g = 1; g <= 3; g++) {
      const k = g + 2; if (n - k - 1 <= 0) continue;
      const coef = polinomio(xs, ys, g); if (!coef) continue;
      const rss = xs.reduce((s, x, i) => s + (ys[i] - avaliar(coef, x)) ** 2, 0);
      const aicc = n * Math.log(Math.max(rss, 1e-9) / n) + 2 * k + (2 * k * (k + 1)) / (n - k - 1);
      if (!melhor || aicc < melhor.aicc - 2) melhor = { g, coef, aicc, r2: tss > 0 ? 1 - rss / tss : 1 };
    }
    return melhor;
  }
  const num = (v) => Math.abs(v).toLocaleString("pt-BR", { maximumFractionDigits: Math.abs(v) >= 100 ? 0 : 2 });
  const SOB = ["", "", "²", "³"];
  function formula(coef) {
    return "S(t) ≈ " + coef.map((a, k) => ({ a, k })).filter(({ a }) => Math.abs(a) > 1e-9)
      .map(({ a, k }, i) => `${i ? (a < 0 ? " − " : " + ") : a < 0 ? "−" : ""}${num(a)}${k ? "·t" + SOB[k] : ""}`).join("");
  }

  function graficoAcumulado() {
    const svg = $("#grafAcum");
    const w = Math.max(320, svg.clientWidth || 800), h = 280, esq = 8, dir = 8, topo = 16, baixo = 26;
    const ano = INICIO_CONTAS.slice(0, 4);
    // saldo no fim de cada mês (carrega o anterior), até o mês atual ou o último com conta
    const agora = new Date(), mesAtual = agora.getFullYear() == ano ? agora.getMonth() + 1 : agora.getFullYear() > ano ? 12 : 0;
    const ultimoComConta = dados.linhas.length ? +dados.linhas[dados.linhas.length - 1].data.slice(5, 7) : 0;
    const M = Math.max(mesAtual, ultimoComConta);
    const pontos = [];
    let saldo = dados.inicial;
    for (let m = 1; m <= M; m++) {
      for (const l of dados.linhas) if (+l.data.slice(5, 7) === m && l.data.slice(0, 4) === ano) saldo = l.saldo;
      pontos.push([m, saldo]);
    }
    const ajuste = pontos.length >= 3 ? melhorAjuste(pontos.map((p) => p[0]), pontos.map((p) => p[1])) : null;
    const D = dados.divida.total;
    const curva = ajuste ? Array.from({ length: 111 }, (_, i) => { const t = 1 + i * 0.1; return [t, avaliar(ajuste.coef, t)]; }) : [];
    const vals = [0, ...pontos.map((p) => p[1]), ...(D != null ? [D] : []), ...curva.map((p) => p[1])];
    const max = Math.max(1, ...vals), min = Math.min(0, ...vals);
    const col = (w - esq - dir) / 12, bw = Math.max(8, col * 0.5);
    const x = (t) => esq + col * (t - 1) + col / 2;
    const y = (v) => topo + ((max - v) / (max - min || 1)) * (h - topo - baixo);
    let s = `<line class="zero" x1="${esq}" x2="${w - dir}" y1="${y(0)}" y2="${y(0)}"/>`;
    MESES.forEach((m, i) => { s += `<text class="rot" x="${x(i + 1)}" y="${h - 8}" text-anchor="middle">${m}</text>`; });
    for (const [t, v] of pontos) s += `<rect class="barra-s${v < 0 ? " neg" : ""}" x="${x(t) - bw / 2}" y="${Math.min(y(v), y(0))}" width="${bw}" height="${Math.abs(y(0) - y(v))}" rx="3"><title>${MESES[t - 1]}: saldo ${reais(v)}</title></rect>`;
    if (D != null) s += `<line class="linha-divida" x1="${esq}" x2="${w - dir}" y1="${y(D)}" y2="${y(D)}"/><text class="rot-divida" x="${w - dir - 4}" y="${y(D) - 6}" text-anchor="end">dívida: ${reais(D)}</text>`;
    else s += `<text class="rot-divida" x="${w - dir - 4}" y="${topo + 12}" text-anchor="end">dívida: valor a confirmar</text>`;
    if (curva.length) s += `<polyline class="curva-ajuste" points="${curva.map(([t, v]) => `${x(t).toFixed(1)},${y(v).toFixed(1)}`).join(" ")}"/>`;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.innerHTML = s;

    // canto do ajuste
    const caixa = $("#ajuste");
    if (!ajuste) {
      caixa.innerHTML = `<span class="ajuste__titulo">Ajuste de curva</span><span class="ajuste__formula">S(t) = ?</span><small>A função aparece quando houver pelo menos 3 meses de contas. Até lá, faltam dados para o mínimos quadrados.</small>`;
      return;
    }
    let previsao = "";
    if (D != null && pontos[pontos.length - 1][1] < D) {
      let tCruz = null;
      for (let t = M; t <= M + 36; t += 0.05) if (avaliar(ajuste.coef, t) >= D) { tCruz = t; break; }
      if (tCruz) { const mes = Math.ceil(tCruz), mm = ((mes - 1) % 12), aa = +ano + Math.floor((mes - 1) / 12); previsao = `Extrapolando (com toda a cautela de engenheiro), o saldo alcançaria a dívida por volta de ${MESES[mm]}/${aa}.`; }
      else previsao = "No ritmo do ajuste, o saldo não alcança a dívida nos próximos três anos.";
    }
    caixa.innerHTML = `<span class="ajuste__titulo">Ajuste por mínimos quadrados</span>
      <span class="ajuste__formula">${formula(ajuste.coef)}</span>
      <small>Polinômio de grau ${ajuste.g}, escolhido pelo critério AICc · R² = ${ajuste.r2.toLocaleString("pt-BR", { maximumFractionDigits: 3 })} · t em meses desde dez/${+ano - 1} · S em reais.</small>
      ${previsao ? `<small>${previsao}</small>` : ""}`;
  }

  function tabela() {
    const q = norm(F.busca);
    const linhas = dados.linhas.filter((l) => (F.tipo === "todos" || l.tipo === F.tipo) && (!F.categoria || l.categoria === F.categoria) && (!q || norm(`${l.descricao} ${l.categoria} ${l.diretoria || ""}`).includes(q)));
    const caixa = $("#tabelaContas");
    if (!dados.linhas.length) {
      caixa.innerHTML = `<div class="contas-vazio"><b>Nenhuma conta lançada ainda</b>As receitas e despesas de 2027 aparecem aqui assim que a gestão registrar no portal interno, com o saldo atualizado na hora.</div>`;
      return;
    }
    if (!linhas.length) { caixa.innerHTML = `<div class="contas-vazio"><b>Nada com esses filtros</b>Tente outra categoria ou limpe a busca.</div>`; return; }
    caixa.innerHTML = `<table><thead><tr><th>Data</th><th>Descrição</th><th class="num">Valor</th><th class="num">Saldo depois</th></tr></thead><tbody>${linhas.slice().reverse().map((l) => {
      const novo = !primeira && l.id && !idsVistos.has(l.id);
      return `<tr${novo ? ' class="novo"' : ""}>
        <td class="c-data tab">${dataBR(l.data)}</td>
        <td>${esc(l.descricao)}<br><span class="cat${l.abate_divida ? " cat--divida" : ""}">${esc(l.abate_divida ? "Pagamento da dívida" : l.categoria)}</span>${l.diretoria ? ` <span class="cat">${esc(l.diretoria)}</span>` : ""}${l.comprovante_url ? ` <a class="cat" href="${esc(l.comprovante_url)}" target="_blank" rel="noopener">Comprovante</a>` : ""}</td>
        <td class="num ${l.tipo === "receita" ? "valor-r" : "valor-d"}">${l.tipo === "receita" ? "+" : "−"} ${reais(l.valor)}</td>
        <td class="num c-saldo">${reais(l.saldo)}</td>
      </tr>`;
    }).join("")}</tbody></table>`;
    idsVistos = new Set(dados.linhas.map((l) => l.id));
  }

  // filtros
  $("#fTipo").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tipo]"); if (!b) return;
    F.tipo = b.dataset.tipo;
    $("#fTipo").querySelectorAll("[data-tipo]").forEach((x) => x.setAttribute("aria-pressed", x === b));
    tabela();
  });
  $("#fCategoria").addEventListener("change", (e) => { F.categoria = e.target.value; tabela(); });
  $("#fBusca").addEventListener("input", (e) => { F.busca = e.target.value; tabela(); });

  // planilha
  $("#baixarCsv").addEventListener("click", () => {
    if (!dados) return;
    const c = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const linhas = [["data", "tipo", "descricao", "categoria", "diretoria", "valor", "saldo_depois", "pagamento_da_divida"].join(";"),
      ...dados.linhas.map((l) => [l.data, l.tipo, c(l.descricao), c(l.categoria), c(l.diretoria), l.valor.toFixed(2).replace(".", ","), l.saldo.toFixed(2).replace(".", ","), l.abate_divida ? "sim" : "não"].join(";"))];
    const blob = new Blob(["﻿" + linhas.join("\n")], { type: "text/csv;charset=utf-8" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "contas-gremio-politecnico-2027.csv" });
    document.body.appendChild(a); a.click(); a.remove();
  });

  new ResizeObserver(() => { if (dados) { grafico(); graficoAcumulado(); } }).observe($("#grafMeses"));
  await atualizar();
  // Ao vivo: o banco avisa a cada mudança; a cada minuto, confere de novo por garantia.
  ouvir(site, () => atualizar());
  setInterval(atualizar, 60_000);
}
