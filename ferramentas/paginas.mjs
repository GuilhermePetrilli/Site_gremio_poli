// Cria a pasta e o index.html de cada ramificação do registro que tenha `caminho`
// e ainda não exista. Páginas já existentes não são tocadas (podem ter conteúdo próprio).
//
// Uso: node ferramentas/paginas.mjs
// Depois, o versionar.mjs carimba as versões dos arquivos (roda sozinho no commit).

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { percorrer } from "../assets/js/ramificacoes.js";

const raiz = fileURLToPath(new URL("..", import.meta.url));
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

// Páginas dentro de uma área de acesso (Área do aluno, dos administradores) usam o índice
// lateral só daquela área; as demais usam o índice do site.
function modelo(no, ancestrais) {
  const topo = ancestrais[0] || no;
  const area = topo.grupo === "acessos" ? ` data-raiz="${topo.id}"` : "";
  const nivel = no.caminho.split("/").filter(Boolean).length;
  const p = "../".repeat(nivel);
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(no.titulo)} | Grêmio Politécnico da USP</title>
  <meta name="description" content="${esc(no.resumo)}">
  <meta name="theme-color" content="#fbfbfe">
  <link rel="icon" href="${p}assets/img/marca/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600..800&family=Nunito:wght@400;600;700;800&display=swap">
  <link rel="stylesheet" href="${p}assets/css/tokens.css">
  <link rel="stylesheet" href="${p}assets/css/base.css">
  <link rel="stylesheet" href="${p}assets/css/componentes.css">
  <script type="module" src="${p}assets/js/site.js"></script>
</head>
<body>
  <a class="pular" href="#conteudo">Pular para o conteúdo</a>
  <div data-componente="cabecalho"></div>

  <div class="container leiaute leiaute--pagina">
    <div data-componente="indice" data-modo="lateral"${area}></div>
    <main id="conteudo" class="leiaute__principal">
      <!-- Conteúdo montado a partir do registro (assets/js/ramificacoes.js, id "${no.id}").
           Para escrever esta página à mão, troque o div abaixo pelo HTML da página e use
           <div data-componente="trilha" data-id="${no.id}"></div> para manter a trilha. -->
      <div data-componente="pagina" data-id="${no.id}"></div>
    </main>
  </div>

  <div data-componente="rodape"></div>
</body>
</html>
`;
}

let criadas = 0;
for (const { no, ancestrais } of percorrer()) {
  if (!no.caminho) continue;
  const pasta = join(raiz, no.caminho);
  const arquivo = join(pasta, "index.html");
  if (existsSync(arquivo)) continue;
  mkdirSync(pasta, { recursive: true });
  writeFileSync(arquivo, modelo(no, ancestrais));
  console.log(`Criada: ${no.caminho}index.html`);
  criadas++;
}
console.log(criadas ? `${criadas} página(s) criada(s).` : "Nenhuma página nova: todas já existem.");
