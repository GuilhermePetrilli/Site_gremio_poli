// Ponto de entrada de todas as páginas.
// Procura elementos com data-componente="nome" e monta o componente correspondente.
// Para criar um componente novo: crie o arquivo em componentes/ e registre abaixo.

import { site } from "./config.js";
import cabecalho from "./componentes/cabecalho.js";
import rodape from "./componentes/rodape.js";
import agora from "./componentes/agora.js";

// Raiz do site calculada a partir deste arquivo (assets/js/site.js),
// então funciona em qualquer domínio, subpasta ou hospedagem.
export const RAIZ = new URL("../../", import.meta.url);
export const url = (caminho) => (/^[a-z]+:/i.test(caminho) ? caminho : new URL(caminho, RAIZ).href);

const componentes = { cabecalho, rodape, agora };

document.querySelectorAll("[data-componente]").forEach((alvo) => {
  const montar = componentes[alvo.dataset.componente];
  if (montar) montar(alvo, { site, url });
  else console.warn(`Componente desconhecido: ${alvo.dataset.componente}`);
});

const ano = document.querySelector("[data-ano]");
if (ano) ano.textContent = new Date().getFullYear();
