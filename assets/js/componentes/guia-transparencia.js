// Transparência (transparencia/): saldo ao vivo, barra da dívida, gráfico mês a mês e extrato
// com o saldo acumulado. Os lançamentos vêm de dados/contas.js (banco Supabase ou arquivo).
// Uso: marcação em transparencia/index.html e <div data-componente="guia-transparencia"></div>.

import { carregar, ouvir, extrato, reais, dataBR, INICIO_CONTAS } from "../dados/contas.js?v=202610072231";

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

  new ResizeObserver(() => { if (dados) grafico(); }).observe($("#grafMeses"));
  await atualizar();
  // Ao vivo: o banco avisa a cada mudança; a cada minuto, confere de novo por garantia.
  ouvir(site, () => atualizar());
  setInterval(atualizar, 60_000);
}
