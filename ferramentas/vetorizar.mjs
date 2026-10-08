// Converte uma logo de uma cor só (PNG) em SVG vetorial.
// Uso: node ferramentas/vetorizar.mjs entrada.png saida.svg [#cor] [--recorte]
//      node ferramentas/vetorizar.mjs entrada.png saida.svg --camada=#363b71:0-160:0.35 --camada=#403f47:180-242:0.7 --recorte
//      (cada --camada = cor : faixa de linhas da imagem : suavização; para logos com mais de uma cor)
//
// Como funciona:
//  1. lê o PNG (8 bits; tons de cinza, RGB, paleta ou com transparência);
//  2. mede, em cada pixel, o quanto ele pertence à cor da logo (0 = fundo, 1 = logo), usando a
//     distância de cor até o branco e a transparência;
//  3. traça os contornos de nível 0,5 com marching squares e interpolação linear (precisão abaixo
//     do pixel), simplifica com Ramer-Douglas-Peucker e suaviza em curvas de Bézier (Catmull-Rom);
//  4. grava um único <path> com fill-rule evenodd (os furos ficam vazados).
// Funciona melhor quanto maior a imagem de origem. Para a fidelidade total, prefira o arquivo
// vetorial original da logo, quando houver.

import { readFileSync, writeFileSync } from "node:fs";
import { inflateSync } from "node:zlib";

const [entrada, saida, ...resto] = process.argv.slice(2);
const opcoes = resto.filter((a) => a.startsWith("--"));
const corArg = resto.find((a) => a.startsWith("#"));
if (!entrada || !saida) { console.error("Uso: node ferramentas/vetorizar.mjs entrada.png saida.svg [#cor] [--recorte]"); process.exit(1); }

/* ---------- PNG ---------- */
function lerPng(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error("não é PNG");
  let p = 8, w, h, bits, tipo, entrelacado, paleta = null, trns = null; const dados = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), nome = buf.toString("latin1", p + 4, p + 8), c = buf.subarray(p + 8, p + 8 + len);
    if (nome === "IHDR") { w = c.readUInt32BE(0); h = c.readUInt32BE(4); bits = c[8]; tipo = c[9]; entrelacado = c[12]; }
    else if (nome === "PLTE") paleta = c;
    else if (nome === "tRNS") trns = c;
    else if (nome === "IDAT") dados.push(c);
    else if (nome === "IEND") break;
    p += 12 + len;
  }
  if (bits !== 8 || entrelacado) throw new Error("só PNG de 8 bits, sem entrelaçamento");
  const canais = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[tipo];
  const cru = inflateSync(Buffer.concat(dados)), linha = w * canais, px = Buffer.alloc(h * linha);
  for (let y = 0; y < h; y++) {
    const f = cru[y * (linha + 1)], o = y * (linha + 1) + 1;
    for (let x = 0; x < linha; x++) {
      const a = x >= canais ? px[y * linha + x - canais] : 0, b = y ? px[(y - 1) * linha + x] : 0, cc = x >= canais && y ? px[(y - 1) * linha + x - canais] : 0;
      let v = cru[o + x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const pp = a + b - cc, pa = Math.abs(pp - a), pb = Math.abs(pp - b), pc = Math.abs(pp - cc); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : cc; }
      px[y * linha + x] = v & 255;
    }
  }
  const rgba = new Uint8Array(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    let r, g, b, al = 255;
    if (tipo === 0) r = g = b = px[i];
    else if (tipo === 4) { r = g = b = px[i * 2]; al = px[i * 2 + 1]; }
    else if (tipo === 2) { r = px[i * 3]; g = px[i * 3 + 1]; b = px[i * 3 + 2]; }
    else if (tipo === 6) { r = px[i * 4]; g = px[i * 4 + 1]; b = px[i * 4 + 2]; al = px[i * 4 + 3]; }
    else { const k = px[i]; r = paleta[k * 3]; g = paleta[k * 3 + 1]; b = paleta[k * 3 + 2]; al = trns && k < trns.length ? trns[k] : 255; }
    rgba.set([r, g, b, al], i * 4);
  }
  return { w, h, rgba };
}

const { w, h, rgba } = lerPng(readFileSync(entrada));

/* ---------- cor da logo e campo de pertencimento ---------- */
// Cor da logo: a informada, ou a média dos pixels opacos mais distantes do branco.
const distBranco = (i) => Math.hypot(255 - rgba[i], 255 - rgba[i + 1], 255 - rgba[i + 2]);
let cor = corArg && corArg.startsWith("#") ? [1, 3, 5].map((k) => parseInt(corArg.slice(k, k + 2), 16)) : null;
if (!cor) {
  const cand = [];
  for (let i = 0; i < w * h * 4; i += 4) if (rgba[i + 3] > 200) cand.push([distBranco(i), i]);
  cand.sort((a, b) => b[0] - a[0]);
  const top = cand.slice(0, Math.max(50, Math.floor(cand.length * 0.2)));
  cor = [0, 1, 2].map((k) => Math.round(top.reduce((s, [, i]) => s + rgba[i + k], 0) / top.length));
}
const escala = 1000 / Math.max(w, h); // coordenadas finais num quadro de até 1000
const f = (v) => (Math.round(v * escala * 10) / 10).toString();
function tracar(cor, y0 = 0, y1 = h, eps = 0.35) {
const alcance = Math.max(1, Math.hypot(255 - cor[0], 255 - cor[1], 255 - cor[2]));
const W = w + 2, H = h + 2, campo = new Float32Array(W * H); // borda de 1 pixel de fundo
for (let y = Math.max(0, y0); y < Math.min(h, y1); y++) for (let x = 0; x < w; x++) {
  const i = (y * w + x) * 4;
  campo[(y + 1) * W + x + 1] = Math.min(1, distBranco(i) / alcance) * (rgba[i + 3] / 255);
}

/* ---------- marching squares ---------- */
const L = 0.5, segs = [];
const pt = (x, y) => [x, y];
for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
  const a = campo[y * W + x], b = campo[y * W + x + 1], c = campo[(y + 1) * W + x + 1], d = campo[(y + 1) * W + x];
  const k = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
  if (k === 0 || k === 15) continue;
  const t = (p, q) => (L - p) / (q - p);
  const cima = pt(x + t(a, b), y), dir = pt(x + 1, y + t(b, c)), baixo = pt(x + t(d, c), y + 1), esq = pt(x, y + t(a, d));
  const centro = (a + b + c + d) / 4 > L;
  switch (k) {
    case 1: case 14: segs.push([esq, baixo]); break;
    case 2: case 13: segs.push([baixo, dir]); break;
    case 3: case 12: segs.push([esq, dir]); break;
    case 4: case 11: segs.push([cima, dir]); break;
    case 6: case 9: segs.push([cima, baixo]); break;
    case 7: case 8: segs.push([esq, cima]); break;
    case 5: if (centro) { segs.push([esq, cima]); segs.push([baixo, dir]); } else { segs.push([esq, baixo]); segs.push([cima, dir]); } break;
    case 10: if (centro) { segs.push([cima, dir]); segs.push([esq, baixo]); } else { segs.push([esq, cima]); segs.push([baixo, dir]); } break;
  }
}
// Liga os segmentos em contornos fechados.
const chave = (p) => `${p[0].toFixed(4)},${p[1].toFixed(4)}`;
const porPonto = new Map();
segs.forEach((s, i) => { for (const p of s) { const k = chave(p); if (!porPonto.has(k)) porPonto.set(k, []); porPonto.get(k).push(i); } });
const usado = new Uint8Array(segs.length), contornos = [];
for (let i = 0; i < segs.length; i++) {
  if (usado[i]) continue;
  usado[i] = 1;
  const linha = [segs[i][0], segs[i][1]];
  for (;;) {
    const fim = linha[linha.length - 1], prox = (porPonto.get(chave(fim)) || []).find((j) => !usado[j]);
    if (prox === undefined) break;
    usado[prox] = 1;
    const s = segs[prox];
    linha.push(chave(s[0]) === chave(fim) ? s[1] : s[0]);
  }
  if (linha.length > 6) contornos.push(linha);
}

/* ---------- simplificação e curvas ---------- */
function rdp(p, eps) {
  if (p.length < 3) return p;
  let dmax = 0, idx = 0; const [x1, y1] = p[0], [x2, y2] = p[p.length - 1], dx = x2 - x1, dy = y2 - y1, n = Math.hypot(dx, dy) || 1;
  for (let i = 1; i < p.length - 1; i++) { const d = Math.abs(dy * p[i][0] - dx * p[i][1] + x2 * y1 - y2 * x1) / n; if (d > dmax) { dmax = d; idx = i; } }
  return dmax > eps ? rdp(p.slice(0, idx + 1), eps).slice(0, -1).concat(rdp(p.slice(idx), eps)) : [p[0], p[p.length - 1]];
}
function caminho(c) {
  const meio = Math.floor(c.length / 2);
  let p = rdp(c.slice(0, meio + 1), eps).slice(0, -1).concat(rdp(c.slice(meio), eps));
  if (p.length > 2 && chave(p[0]) === chave(p[p.length - 1])) p = p.slice(0, -1);
  if (p.length < 3) return "";
  const n = p.length, q = (i) => p[(i + n) % n];
  let d = `M${f(q(0)[0] - 1)} ${f(q(0)[1] - 1)}`;
  for (let i = 0; i < n; i++) {
    const p0 = q(i - 1), p1 = q(i), p2 = q(i + 1), p3 = q(i + 2);
    // Em quinas muito fechadas, segue em linha reta (preserva os cantos das letras).
    const ang = (a, b, c) => { const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]]; return Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / ((Math.hypot(...v1) * Math.hypot(...v2)) || 1)))); };
    if (ang(p0, p1, p2) < 2.0 || ang(p1, p2, p3) < 2.0) { d += `L${f(p2[0] - 1)} ${f(p2[1] - 1)}`; continue; }
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6], c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${f(c1[0] - 1)} ${f(c1[1] - 1)} ${f(c2[0] - 1)} ${f(c2[1] - 1)} ${f(p2[0] - 1)} ${f(p2[1] - 1)}`;
  }
  return d + "Z";
}
return { cor, contornos, d: contornos.map(caminho).filter(Boolean).join("") };
}

const hexDe = (c) => "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
const camadas = opcoes.filter((o) => o.startsWith("--camada="))
  .map((o) => { const [hx, faixa = "", e] = o.slice(9).split(":"); const [y0, y1] = faixa ? faixa.split("-").map(Number) : [0, h]; return tracar([1, 3, 5].map((k) => parseInt(hx.slice(k, k + 2), 16)), y0, y1, e ? Number(e) : 0.35); });
if (!camadas.length) camadas.push(tracar(cor));
const contornos = camadas.flatMap((c) => c.contornos);


// Recorte opcional: viewBox justo no desenho, com uma pequena margem.
let vb = `0 0 ${f(w)} ${f(h)}`;
if (opcoes.includes("--recorte")) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const c of contornos) for (const [x, y] of c) { x0 = Math.min(x0, x - 1); y0 = Math.min(y0, y - 1); x1 = Math.max(x1, x - 1); y1 = Math.max(y1, y - 1); }
  const m = Math.max(x1 - x0, y1 - y0) * 0.02;
  vb = [x0 - m, y0 - m, x1 - x0 + 2 * m, y1 - y0 + 2 * m].map(f).join(" ");
}
const paths = camadas.map((c) => `<path fill="${hexDe(c.cor)}" fill-rule="evenodd" d="${c.d}"/>`).join("");
writeFileSync(saida, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${paths}</svg>
`);
console.log(`${saida}: ${contornos.length} contornos, ${camadas.map((c) => hexDe(c.cor)).join(" + ")}, ${(paths.length / 1024).toFixed(1)} KB`);
