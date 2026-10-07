// Baixa o cardápio da semana dos quatro bandejões da Cidade Universitária no serviço
// que alimenta o app Cardápio+ da USP e grava em assets/dados/cardapio.json.
//
// O serviço da USP não libera acesso direto pelo navegador (não envia cabeçalhos CORS),
// então o site lê o arquivo gerado aqui. Rode este script em qualquer lugar com Node 18+:
//   node ferramentas/cardapio.mjs
// Hoje ele roda sozinho pelo agendamento em .github/workflows/cardapio.yml; num outro
// servidor, basta um cron chamando o mesmo comando e publicando o arquivo.
//
// Se um bandejão falhar, o cardápio anterior dele é mantido no arquivo.

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SERVICO = "https://uspdigital.usp.br/rucard/servicos/menu/";
const CHAVE = "hash=596df9effde6f877717b4e81fdb2ca9f"; // chave pública usada pelo app
const RESTAURANTES = { central: 6, prefeitura: 7, fisica: 8, quimica: 9 };

const arquivo = fileURLToPath(new URL("../assets/dados/cardapio.json", import.meta.url));

let anterior = { restaurantes: {} };
try { anterior = JSON.parse(readFileSync(arquivo, "utf8")); } catch {}

// "Arroz / feijão / arroz integral\nFrango\n..." vira uma lista; "Fechado" vira lista vazia.
const itens = (texto) => {
  const linhas = String(texto || "").split("\n").map((l) => l.replace(/\s+/g, " ").replace(/\s*\/\s*/g, " / ").trim()).filter(Boolean);
  return linhas.length === 1 && /^fechado$/i.test(linhas[0]) ? [] : linhas;
};
const isoDe = (dmy) => dmy.split("/").reverse().join("-"); // 05/10/2026 -> 2026-10-05

async function baixar(id) {
  const resposta = await fetch(SERVICO + id, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: CHAVE,
    signal: AbortSignal.timeout(30_000),
  });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  const dados = await resposta.json();
  if (dados.message?.error) throw new Error(dados.message.message || "erro do serviço");
  const dias = {};
  for (const r of dados.meals || []) {
    if (!r.date) continue;
    dias[isoDe(r.date)] = { almoco: itens(r.lunch?.menu), jantar: itens(r.dinner?.menu) };
  }
  if (!Object.keys(dias).length) throw new Error("resposta sem cardápio");
  return dias;
}

const saida = { atualizadoEm: new Date().toISOString(), fonte: "Cardápio+ USP (uspdigital.usp.br/rucard)", restaurantes: {} };
let falhas = 0;
for (const [nome, id] of Object.entries(RESTAURANTES)) {
  try {
    saida.restaurantes[nome] = { atualizadoEm: saida.atualizadoEm, dias: await baixar(id) };
    console.log(`${nome}: ${Object.keys(saida.restaurantes[nome].dias).length} dias`);
  } catch (erro) {
    falhas++;
    console.warn(`${nome}: falhou (${erro.message}); mantido o cardápio anterior.`);
    if (anterior.restaurantes?.[nome]) saida.restaurantes[nome] = anterior.restaurantes[nome];
  }
}

if (falhas === Object.keys(RESTAURANTES).length) {
  console.error("Nenhum bandejão respondeu. Arquivo não alterado.");
  process.exit(1);
}

// Só grava se o cardápio mudou (evita commits que só trocam a data).
const semData = (o) => JSON.stringify(Object.fromEntries(Object.entries(o.restaurantes || {}).map(([k, v]) => [k, v.dias])));
if (semData(saida) === semData(anterior)) {
  console.log("Cardápio sem mudanças.");
} else {
  mkdirSync(fileURLToPath(new URL("../assets/dados/", import.meta.url)), { recursive: true });
  writeFileSync(arquivo, JSON.stringify(saida, null, 1) + "\n");
  console.log("assets/dados/cardapio.json atualizado.");
}
