// Carimba uma versão nova (?v=AAAAMMDDHHMM) em todas as referências locais a .css e .js
// dentro dos arquivos .html e .js do site. Assim o navegador nunca mistura arquivos
// novos com versões antigas guardadas em cache depois de uma publicação.
//
// Imagens (.svg, .png, .jpg, .jpeg, .webp) ganham ?v= com um código tirado do conteúdo do arquivo:
// só muda quando a imagem muda, então uma logo trocada aparece na hora e as outras seguem em cache.
//
// Uso: node ferramentas/versionar.mjs
// Roda sozinho antes de cada commit pelo gancho em .git/hooks/pre-commit (ver README).

import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { join, extname, dirname, resolve } from "node:path";
import { createHash } from "node:crypto";

const raiz = new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const ignorar = new Set([".git", "ferramentas", "node_modules"]);
const agora = new Date();
const versao = [agora.getFullYear(), agora.getMonth() + 1, agora.getDate(), agora.getHours(), agora.getMinutes()]
  .map((n) => String(n).padStart(2, "0")).join("");

// Caminho relativo entre aspas terminando em .css ou .js, com ou sem ?v= anterior.
const referencia = /(["'])((?![a-z]+:)[^"'?\s]+\.(?:css|js))(?:\?v=[\w-]+)?\1/g;
// O mesmo para imagens. O caminho pode ser relativo ao arquivo (no HTML) ou à raiz do site (nos dados em JS).
const imagem = /(["'])((?![a-z]+:)[^"'?\s<>$]+\.(?:svg|png|jpe?g|webp))(?:\?v=[\w-]+)?\1/g;
const codigos = new Map();
function codigoDe(ref, pasta) {
  for (const base of [pasta, raiz]) {
    const alvo = resolve(base, ref);
    if (codigos.has(alvo)) return codigos.get(alvo);
    try {
      const c = createHash("sha1").update(readFileSync(alvo)).digest("hex").slice(0, 8);
      codigos.set(alvo, c);
      return c;
    } catch {}
  }
  return null; // arquivo não encontrado (ex.: um modelo num comentário): fica como está
}

function percorrer(pasta) {
  for (const nome of readdirSync(pasta)) {
    if (ignorar.has(nome)) continue;
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) percorrer(caminho);
    else if ([".html", ".js"].includes(extname(nome))) {
      const antes = readFileSync(caminho, "utf8");
      const depois = antes
        .replace(referencia, (_, aspas, ref) => `${aspas}${ref}?v=${versao}${aspas}`)
        .replace(imagem, (todo, aspas, ref) => { const c = codigoDe(ref, dirname(caminho)); return c ? `${aspas}${ref}?v=${c}${aspas}` : todo; });
      if (depois !== antes) writeFileSync(caminho, depois);
    }
  }
}

percorrer(raiz);
console.log(`Versão ${versao} aplicada.`);
