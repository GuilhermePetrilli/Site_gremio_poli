// Gera assets/dados/selic.json com a taxa Selic de cada dia útil, para a Transparência corrigir
// a dívida do Grêmio pela Selic. Fonte: Banco Central do Brasil, SGS série 11 (taxa Selic diária,
// em % ao dia) e série 432 (meta Selic definida pelo Copom, em % ao ano).
// Roda em qualquer servidor com Node 18+: `node ferramentas/selic.mjs`. O agendamento fica em
// .github/workflows/selic.yml (é só um agendador; trocar de servidor não muda nada aqui).

import { writeFile } from "node:fs/promises";

// A dívida passa a ser corrigida a partir desta data (ver parâmetro "divida" no banco).
const DESDE = "2026-10-01";
const SAIDA = new URL("../assets/dados/selic.json", import.meta.url);
const br = (iso) => iso.split("-").reverse().join("/");
const iso = (b) => b.split("/").reverse().join("-");

async function serie(codigo, caminho) {
  const r = await fetch(`https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigo}/dados${caminho}`, { signal: AbortSignal.timeout(60_000), headers: { Accept: "application/json" } });
  if (!r.ok) throw new Error(`SGS ${codigo}: HTTP ${r.status}`);
  return r.json();
}

const hoje = new Date().toLocaleDateString("sv-SE", { timeZone: "America/Sao_Paulo" });
const [diaria, meta] = await Promise.all([
  serie(11, `?formato=json&dataInicial=${br(DESDE)}&dataFinal=${br(hoje)}`),
  serie(432, "/ultimos/1?formato=json"),
]);
if (!diaria.length) throw new Error("SGS 11 voltou vazia");

const dados = {
  fonte: "Banco Central do Brasil, SGS 11 (Selic diária, % ao dia) e SGS 432 (meta Selic, % ao ano)",
  atualizadoEm: new Date().toISOString(),
  metaAnual: Number(meta[0]?.valor) || null,
  diaria: diaria.map((d) => [iso(d.data), Number(d.valor)]),
};
await writeFile(SAIDA, JSON.stringify(dados) + "\n");
console.log(`assets/dados/selic.json: ${dados.diaria.length} dias úteis (${dados.diaria[0][0]} a ${dados.diaria.at(-1)[0]}), meta ${dados.metaAnual}% a.a.`);
