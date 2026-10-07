// Registro central das ramificações do site, em árvore.
// É a fonte única para o índice lateral, o menu, os blocos da página inicial,
// as páginas de cada ramificação e o mapa do rodapé.
//
// Cada nó:
//   id        identificador único (vira âncora e data-id da página)
//   titulo    nome exibido
//   caminho   pasta da página, relativa à raiz (ex.: "aluno/" ou "aluno/notas/").
//             Sem caminho, o nó é uma seção dentro da página do nó pai (link para pai#id).
//   resumo    uma ou duas frases sobre a ramificação
//   texto     descrição de uma seção (para nós sem página própria)
//   numeros   [{ valor, rotulo }]
//   acoes     [{ rotulo, href, externo }]
//   filhos    nós filhos, com o mesmo formato (qualquer profundidade)
//   construcao  true enquanto a página não tiver o conteúdo completo
//   chamada   texto do link no cartão da página (opcional; padrão "Abrir <título>")
//
// Para criar páginas novas: adicione o nó com `caminho` e rode `node ferramentas/paginas.mjs`.
// Conteúdo das frentes: página "Projetos e impacto" do site atual, conferida em outubro de 2026.

export const grupos = [
  { id: "frentes", titulo: "Frentes do Grêmio" },
  { id: "acessos", titulo: "Acessos" },
  { id: "mais", titulo: "Mais do Grêmio" },
];

export const ramificacoes = [
  {
    id: "apoio",
    grupo: "frentes",
    titulo: "Apoio ao aluno",
    caminho: "apoio/",
    construcao: true,
    resumo: "Do reforço antes da prova ao empréstimo de calculadora: ajuda prática para atravessar a graduação.",
    numeros: [
      { valor: "700+", rotulo: "alunos por ano nas aulas de reforço" },
      { valor: "900+", rotulo: "bolsas integrais de idiomas concedidas" },
    ],
    filhos: [
      { id: "reforco", titulo: "Aulas de reforço (Fuja do Nabo)", texto: "Aulas na reta final antes das provas, gravadas e publicadas no YouTube do Grêmio." },
      { id: "apoio-academico", titulo: "Apoio acadêmico", texto: "Dúvidas sobre matrícula, requerimentos e calendário, divulgação de bolsas e pedidos de reoferecimento de disciplinas." },
      { id: "emprestimo", titulo: "Empréstimo de material", texto: "Calculadoras científicas, jalecos e equipamentos de som e foto para eventos e apresentações." },
      { id: "bolsas", titulo: "Bolsas de idiomas", texto: "Bolsas integrais no Poliglota Idiomas, independentemente da condição socioeconômica." },
    ],
  },
  {
    id: "cultura",
    grupo: "frentes",
    titulo: "Projetos culturais",
    caminho: "cultura/",
    construcao: true,
    resumo: "Jornalismo, arte e teatro com décadas de história dentro da Poli.",
    numeros: [
      { valor: "80+", rotulo: "anos de O Politécnico e do GTP" },
      { valor: "1989", rotulo: "ano da primeira SAPO" },
    ],
    filhos: [
      { id: "o-politecnico", titulo: "Jornal O Politécnico", texto: "Há mais de 80 anos tratando os temas da Poli com verdade, humor e curiosidade." },
      { id: "sapo", titulo: "Semana de Arte da Poli (SAPO)", texto: "Desde 1989, oficinas de pintura, recitais de piano e apresentações de teatro e dança." },
      { id: "gtp", titulo: "Grupo de Teatro da Poli (GTP)", texto: "Mais de 80 anos de história e aulas gratuitas, abertas à universidade e ao público." },
    ],
  },
  {
    id: "social",
    grupo: "frentes",
    titulo: "Projetos sociais",
    caminho: "social/",
    construcao: true,
    resumo: "A Poli indo até as escolas públicas e abrindo as portas para quem ainda vai chegar.",
    numeros: [
      { valor: "1000+", rotulo: "estudantes alcançados pelo Poli Vai à Escola" },
      { valor: "75", rotulo: "alunas visitantes no Meninas na Poli em 2025" },
    ],
    filhos: [
      { id: "poli-vai-a-escola", titulo: "Poli Vai à Escola", texto: "Politécnicos levam a universidade até escolas, desde 2023." },
      { id: "meninas-na-poli", titulo: "Meninas na Poli", texto: "Alunas do ensino médio de escolas públicas conhecem laboratórios, atividades estudantis e a rotina da Poli." },
      { id: "semana-da-mulher", titulo: "Semana da Mulher Politécnica", texto: "Programação dedicada às mulheres da Poli." },
    ],
  },
  {
    id: "eventos",
    grupo: "frentes",
    titulo: "Eventos e extensão",
    caminho: "eventos/",
    construcao: true,
    resumo: "Da recepção dos calouros à feira que apresenta os grupos de extensão da Poli.",
    numeros: [
      { valor: "50+", rotulo: "grupos na Feira de Extensões de 2026" },
      { valor: "400+", rotulo: "alunos presentes na feira" },
    ],
    filhos: [
      { id: "recepcao", titulo: "Semana de Recepção", texto: "Integração dos calouros à vida universitária e à comunidade politécnica." },
      { id: "festas", titulo: "Festas e confraternizações", texto: "Encontros que aproximam turmas e cursos." },
      { id: "feira-de-extensoes", titulo: "Feira de Extensões", texto: "Todo primeiro trimestre, os grupos de extensão e coletivos da Poli reunidos num só lugar." },
    ],
  },
  {
    id: "servicos",
    grupo: "frentes",
    titulo: "Serviços",
    caminho: "servicos/",
    construcao: true,
    resumo: "Serviços mantidos pelo Grêmio no campus para o dia a dia de quem estuda na Poli.",
    numeros: [
      { valor: "6", rotulo: "idiomas no Poliglota" },
      { valor: "30+", rotulo: "anos de Poliglota" },
    ],
    filhos: [
      { id: "copiadora", titulo: "Copiadora Politécnica", texto: "Plano de cotas com preços mais acessíveis durante toda a graduação, itens de conveniência e impressão de material de divulgação." },
      { id: "triedro", titulo: "Lanchonete Triedro", texto: "Refeições a preços acessíveis no prédio do Biênio." },
      { id: "poliglota", titulo: "Poliglota Idiomas", texto: "Há mais de 30 anos ensinando alemão, espanhol, francês, inglês, italiano e português." },
    ],
  },
  {
    id: "representacao",
    grupo: "frentes",
    titulo: "Representação discente",
    caminho: "representacao/",
    construcao: true,
    resumo: "Alunos com voz e voto nas decisões da graduação e da pós-graduação. Nessas instâncias, o voto discente tem o mesmo peso do voto docente.",
    acoes: [
      { rotulo: "Enviar uma demanda por e-mail", href: "mailto:administrativo@gremiopolitecnico.com.br?subject=Demanda%20para%20a%20representa%C3%A7%C3%A3o" },
      { rotulo: "Falar pelo Instagram", href: "https://instagram.com/gremiopolitecnico", externo: true },
    ],
    filhos: [],
  },
  {
    id: "aluno",
    grupo: "acessos",
    titulo: "Área do aluno",
    caminho: "aluno/",
    resumo: "O lugar para tirar suas dúvidas sobre a vida na Poli, cheio de recursos para ajudar você no dia a dia.",
    filhos: [
      {
        id: "bandejoes",
        titulo: "Bandejões",
        caminho: "aluno/bandejoes/",
        resumo: "Cardápio de hoje, horários, preço e o caminho a pé até cada um dos quatro bandejões do campus.",
        chamada: "Ver cardápio e caminho",
      },
    ],
  },
  {
    id: "admin",
    grupo: "acessos",
    titulo: "Área dos administradores",
    caminho: "admin/",
    construcao: true,
    resumo: "Espaço da gestão do Grêmio.",
    filhos: [],
  },
  {
    id: "loja",
    grupo: "mais",
    titulo: "Loja do Grêmio",
    caminho: "loja/",
    resumo: "Vista a camisa politécnica e faça a diferença. Os lucros da loja apoiam os projetos sociais do Grêmio.",
    filhos: [],
  },
];

// ---------- utilidades da árvore ----------

// Percorre todos os nós, entregando cada um com a lista de ancestrais.
export function* percorrer(nos = ramificacoes, ancestrais = []) {
  for (const no of nos) {
    yield { no, ancestrais };
    if (no.filhos) yield* percorrer(no.filhos, [...ancestrais, no]);
  }
}

export const encontrar = (id) => {
  for (const item of percorrer()) if (item.no.id === id) return item;
  return null;
};

// Destino de um link para o nó: a página dele ou a âncora na página do ancestral mais próximo com página.
export function destino(no, ancestrais = encontrar(no.id)?.ancestrais || []) {
  if (no.caminho) return no.caminho;
  const pai = [...ancestrais].reverse().find((a) => a.caminho);
  return `${pai ? pai.caminho : ""}#${no.id}`;
}
