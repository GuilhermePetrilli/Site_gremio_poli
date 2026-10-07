// Carimba uma versão nova (?v=AAAAMMDDHHMM) em todas as referências locais a .css e .js
// dentro dos arquivos .html e .js do site. Assim o navegador nunca mistura arquivos
// novos com versões antigas guardadas em cache depois de uma publicação.
//
// Uso: node ferramentas/versionar.mjs
// Roda sozinho antes de cada commit pelo gancho em .git/hooks/pre-commit (ver README).

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const raiz = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ignorar = new Set([".git", "ferramentas", "node_modules"]);
const agora = new Date();
const versao = [agora.getFullYear(), agora.getMonth() + 1, agora.getDate(), agora.getHours(), agora.getMinutes()]
  .map((n) => String(n).padStart(2, "0")).join("");

// Caminho relativo entre aspas terminando em .css ou .js, com ou sem ?v= anterior.
const referencia = /(["'])((?![a-z]+:)[^"'?\s]+\.(?:css|js))(?:\?v=[\w-]+)?\1/g;

function percorrer(pasta) {
  for (const nome of readdirSync(pasta)) {
    if (ignorar.has(nome)) continue;
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) percorrer(caminho);
    else if ([".html", ".js"].includes(extname(nome))) {
      const antes = readFileSync(caminho, "utf8");
      const depois = antes.replace(referencia, (_, aspas, ref) => `${aspas}${ref}?v=${versao}${aspas}`);
      if (depois !== antes) writeFileSync(caminho, depois);
    }
  }
}

percorrer(raiz);
console.log(`Versão ${versao} aplicada.`);
