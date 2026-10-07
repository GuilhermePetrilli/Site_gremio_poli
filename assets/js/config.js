// Configuração global do site: um único lugar para menu, contato e redes.
// Os caminhos (href) são relativos à raiz do site, sem barra no início,
// para funcionar igual em subpasta (github.io/Site_gremio_poli/) ou num domínio próprio.

export const site = {
  nome: "Grêmio Politécnico",
  nomeCompleto: "Grêmio Politécnico da USP",
  slogan: "Desde 1903 representando os alunos da Poli",

  // Faixa no topo de todas as páginas. Use null para esconder.
  aviso: {
    texto: "Novo site em construção. O site atual continua no ar.",
    link: { rotulo: "gremiopolitecnico.com.br", href: "https://www.gremiopolitecnico.com.br/" },
  },

  menu: [
    { rotulo: "O Grêmio", href: "#sobre" },
    { rotulo: "Atuação", href: "#atuacao" },
    { rotulo: "Serviços", href: "#servicos" },
    { rotulo: "História", href: "#historia" },
    { rotulo: "Contato", href: "#contato" },
  ],
  chamada: { rotulo: "Fale com a gente", href: "#contato" },

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
};
