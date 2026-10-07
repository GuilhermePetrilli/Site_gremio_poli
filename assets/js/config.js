// Configuração global do site: menu, contato, redes e autoria.
// As ramificações (grandes seções) ficam em ramificacoes.js.
// Os caminhos (href) são relativos à raiz do site, sem barra no início,
// para funcionar igual em subpasta (github.io/Site_gremio_poli/) ou num domínio próprio.

import { encontrar, destino } from "./ramificacoes.js?v=202610071003";

const doRegistro = (id, rotulo) => {
  const { no } = encontrar(id);
  return { rotulo: rotulo || no.titulo, href: destino(no) };
};

export const site = {
  nome: "Grêmio Politécnico",
  nomeCompleto: "Grêmio Politécnico da USP",
  slogan: "Desde 1903 representando os alunos da Poli",

  // Faixa no topo de todas as páginas. Use null para esconder.
  aviso: {
    texto: "Novo site em construção. O site atual continua no ar.",
    link: { rotulo: "gremiopolitecnico.com.br", href: "https://www.gremiopolitecnico.com.br/" },
  },

  // O índice completo das ramificações abre pelo botão "Índice" do cabeçalho.
  // `local: true` mantém o link na própria página (o rodapé com #contato existe em todas).
  menu: [
    doRegistro("representacao", "Representação"),
    { rotulo: "O Grêmio", href: "#gremio" },
    { rotulo: "Contato", href: "#contato", local: true },
  ],
  chamada: doRegistro("aluno"),
  // Acessos mostrados no topo da gaveta do índice.
  acessos: [doRegistro("aluno"), doRegistro("admin")],

  contato: {
    endereco: "Av. Prof. Almeida Prado, 128, Travessa 2, Cidade Universitária, São Paulo, SP",
    telefone: "(11) 91514-8780",
    email: "administrativo@gremiopolitecnico.com.br",
    cnpj: "62.841.382/0001-33",
  },

  redes: [
    { nome: "Instagram", usuario: "@gremiopolitecnico", href: "https://instagram.com/gremiopolitecnico" },
    { nome: "YouTube", usuario: "@gremiopolitecnico", href: "https://www.youtube.com/@gremiopolitecnico" },
  ],

  autoria: "Site desenvolvido pela chapa Alvorada.",
};
