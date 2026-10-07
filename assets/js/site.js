// Ponto de entrada de todas as páginas.
// Procura elementos com data-componente="nome" e monta o componente correspondente.
// Para criar um componente novo: crie o arquivo em componentes/ e registre abaixo.
// Componentes pesados, usados numa página só, entram em `sobDemanda`: o arquivo
// só é baixado quando a página tem aquele componente.

import { site } from "./config.js?v=202610071030";
import { ramificacoes as registro, grupos, encontrar, destino } from "./ramificacoes.js?v=202610071030";
import cabecalho from "./componentes/cabecalho.js?v=202610071030";
import rodape from "./componentes/rodape.js?v=202610071030";
import agora from "./componentes/agora.js?v=202610071030";
import ramificacoes from "./componentes/ramificacoes.js?v=202610071030";
import indice from "./componentes/indice.js?v=202610071030";
import pagina from "./componentes/pagina.js?v=202610071030";
import trilha from "./componentes/trilha.js?v=202610071030";
import recursos from "./componentes/recursos.js?v=202610071030";

// Raiz do site calculada a partir deste arquivo (assets/js/site.js),
// então funciona em qualquer domínio, subpasta ou hospedagem.
export const RAIZ = new URL("../../", import.meta.url);
export const url = (caminho) => (/^[a-z]+:/i.test(caminho) ? caminho : new URL(caminho, RAIZ).href);

const componentes = { cabecalho, rodape, agora, ramificacoes, indice, pagina, trilha, recursos };
const sobDemanda = {
  "guia-bandejoes": () => import("./componentes/guia-bandejoes.js?v=202610071030"),
};
const contexto = { site, url, raiz: RAIZ, registro, grupos, encontrar, destino };

const pendentes = [];
document.querySelectorAll("[data-componente]").forEach((alvo) => {
  const nome = alvo.dataset.componente;
  if (componentes[nome]) componentes[nome](alvo, contexto);
  else if (sobDemanda[nome]) pendentes.push(sobDemanda[nome]().then((m) => m.default(alvo, contexto)));
  else console.warn(`Componente desconhecido: ${nome}`);
});

const ano = document.querySelector("[data-ano]");
if (ano) ano.textContent = new Date().getFullYear();

// Conteúdo gerado depois do carregamento: refaz o salto para a âncora do endereço (ex.: projetos/#bolsas).
const saltar = () => { if (location.hash) document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView(); };
saltar();
if (pendentes.length) Promise.allSettled(pendentes).then(saltar);
