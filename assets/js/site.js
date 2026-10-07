// Ponto de entrada de todas as páginas.
// Procura elementos com data-componente="nome" e monta o componente correspondente.
// Para criar um componente novo: crie o arquivo em componentes/ e registre abaixo.

import { site } from "./config.js?v=202610062246";
import { ramificacoes as registro, grupos, encontrar, destino } from "./ramificacoes.js?v=202610062246";
import cabecalho from "./componentes/cabecalho.js?v=202610062246";
import rodape from "./componentes/rodape.js?v=202610062246";
import agora from "./componentes/agora.js?v=202610062246";
import ramificacoes from "./componentes/ramificacoes.js?v=202610062246";
import indice from "./componentes/indice.js?v=202610062246";
import pagina from "./componentes/pagina.js?v=202610062246";
import trilha from "./componentes/trilha.js?v=202610062246";

// Raiz do site calculada a partir deste arquivo (assets/js/site.js),
// então funciona em qualquer domínio, subpasta ou hospedagem.
export const RAIZ = new URL("../../", import.meta.url);
export const url = (caminho) => (/^[a-z]+:/i.test(caminho) ? caminho : new URL(caminho, RAIZ).href);

const componentes = { cabecalho, rodape, agora, ramificacoes, indice, pagina, trilha };
const contexto = { site, url, raiz: RAIZ, registro, grupos, encontrar, destino };

document.querySelectorAll("[data-componente]").forEach((alvo) => {
  const montar = componentes[alvo.dataset.componente];
  if (montar) montar(alvo, contexto);
  else console.warn(`Componente desconhecido: ${alvo.dataset.componente}`);
});

const ano = document.querySelector("[data-ano]");
if (ano) ano.textContent = new Date().getFullYear();

// Conteúdo gerado depois do carregamento: refaz o salto para a âncora do endereço (ex.: apoio/#bolsas).
if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
