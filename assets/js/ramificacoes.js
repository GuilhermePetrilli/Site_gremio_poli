// Registro central das ramificações do site (as grandes seções que partem da página inicial).
// É a fonte única para o menu, os blocos da página inicial e o mapa do rodapé.
//
// Para criar a página de uma ramificação:
//   1. crie a pasta indicada em `caminho` com um index.html;
//   2. troque `pronta` para true.
// Enquanto `pronta` for false, os links levam ao bloco da ramificação na página inicial.
//
// Grupos: "frentes" = o que o Grêmio faz; "acessos" = áreas do aluno e da gestão.
// Conteúdo das frentes: página "Projetos e impacto" do site atual, conferida em outubro de 2026.

export const ramificacoes = [
  {
    id: "apoio",
    grupo: "frentes",
    titulo: "Apoio ao aluno",
    caminho: "apoio/",
    pronta: false,
    resumo: "Do reforço antes da prova ao empréstimo de calculadora: ajuda prática para atravessar a graduação.",
    itens: [
      { nome: "Aulas de reforço (Fuja do Nabo)", texto: "Aulas na reta final antes das provas, gravadas e publicadas no YouTube do Grêmio." },
      { nome: "Apoio acadêmico", texto: "Dúvidas sobre matrícula, requerimentos e calendário, divulgação de bolsas e pedidos de reoferecimento de disciplinas." },
      { nome: "Empréstimo de material", texto: "Calculadoras científicas, jalecos e equipamentos de som e foto para eventos e apresentações." },
      { nome: "Bolsas de idiomas", texto: "Bolsas integrais no Poliglota Idiomas, independentemente da condição socioeconômica." },
    ],
    numeros: [
      { valor: "700+", rotulo: "alunos por ano nas aulas de reforço" },
      { valor: "900+", rotulo: "bolsas integrais de idiomas concedidas" },
    ],
  },
  {
    id: "cultura",
    grupo: "frentes",
    titulo: "Projetos culturais",
    caminho: "cultura/",
    pronta: false,
    resumo: "Jornalismo, arte e teatro com décadas de história dentro da Poli.",
    itens: [
      { nome: "Jornal O Politécnico", texto: "Há mais de 80 anos tratando os temas da Poli com verdade, humor e curiosidade." },
      { nome: "Semana de Arte da Poli (SAPO)", texto: "Desde 1989, oficinas de pintura, recitais de piano e apresentações de teatro e dança." },
      { nome: "Grupo de Teatro da Poli (GTP)", texto: "Mais de 80 anos de história e aulas gratuitas, abertas à universidade e ao público." },
    ],
    numeros: [
      { valor: "80+", rotulo: "anos de O Politécnico e do GTP" },
      { valor: "1989", rotulo: "ano da primeira SAPO" },
    ],
  },
  {
    id: "social",
    grupo: "frentes",
    titulo: "Projetos sociais",
    caminho: "social/",
    pronta: false,
    resumo: "A Poli indo até as escolas públicas e abrindo as portas para quem ainda vai chegar.",
    itens: [
      { nome: "Poli Vai à Escola", texto: "Politécnicos levam a universidade até escolas, desde 2023." },
      { nome: "Meninas na Poli", texto: "Alunas do ensino médio de escolas públicas conhecem laboratórios, atividades estudantis e a rotina da Poli." },
      { nome: "Semana da Mulher Politécnica", texto: "Programação dedicada às mulheres da Poli." },
    ],
    numeros: [
      { valor: "1000+", rotulo: "estudantes alcançados pelo Poli Vai à Escola" },
      { valor: "75", rotulo: "alunas visitantes no Meninas na Poli em 2025" },
    ],
  },
  {
    id: "eventos",
    grupo: "frentes",
    titulo: "Eventos e extensão",
    caminho: "eventos/",
    pronta: false,
    resumo: "Da recepção dos calouros à feira que apresenta os grupos de extensão da Poli.",
    itens: [
      { nome: "Semana de Recepção", texto: "Integração dos calouros à vida universitária e à comunidade politécnica." },
      { nome: "Festas e confraternizações", texto: "Encontros que aproximam turmas e cursos." },
      { nome: "Feira de Extensões", texto: "Todo primeiro trimestre, os grupos de extensão e coletivos da Poli reunidos num só lugar." },
    ],
    numeros: [
      { valor: "50+", rotulo: "grupos na Feira de Extensões de 2026" },
      { valor: "400+", rotulo: "alunos presentes na feira" },
    ],
  },
  {
    id: "servicos",
    grupo: "frentes",
    titulo: "Serviços",
    caminho: "servicos/",
    pronta: false,
    resumo: "Serviços mantidos pelo Grêmio no campus para o dia a dia de quem estuda na Poli.",
    itens: [
      { nome: "Copiadora Politécnica", texto: "Plano de cotas com preços mais acessíveis durante toda a graduação, itens de conveniência e impressão de material de divulgação." },
      { nome: "Lanchonete Triedro", texto: "Refeições a preços acessíveis no prédio do Biênio." },
      { nome: "Poliglota Idiomas", texto: "Há mais de 30 anos ensinando alemão, espanhol, francês, inglês, italiano e português." },
    ],
    numeros: [
      { valor: "6", rotulo: "idiomas no Poliglota" },
      { valor: "30+", rotulo: "anos de Poliglota" },
    ],
  },
  {
    id: "representacao",
    grupo: "frentes",
    titulo: "Representação discente",
    caminho: "representacao/",
    pronta: false,
    resumo: "Alunos com voz e voto nas decisões da graduação e da pós-graduação. Nessas instâncias, o voto discente tem o mesmo peso do voto docente.",
    itens: [],
    numeros: [],
    acoes: [
      { rotulo: "Enviar uma demanda por e-mail", href: "mailto:administrativo@gremiopolitecnico.com.br?subject=Demanda%20para%20a%20representa%C3%A7%C3%A3o" },
      { rotulo: "Falar pelo Instagram", href: "https://instagram.com/gremiopolitecnico", externo: true },
    ],
  },
  {
    id: "aluno",
    grupo: "acessos",
    titulo: "Área do aluno",
    caminho: "aluno/",
    pronta: false,
    resumo: "O espaço de quem estuda na Poli: informações e serviços do Grêmio reunidos num só lugar.",
  },
  {
    id: "admin",
    grupo: "acessos",
    titulo: "Área dos administradores",
    caminho: "admin/",
    pronta: false,
    resumo: "Acesso restrito à gestão do Grêmio.",
  },
];

export const ramificacao = (id) => ramificacoes.find((r) => r.id === id);

// Destino de um link para a ramificação: a página dela, se já existe, ou o bloco na página inicial.
export const destino = (r) => (r.pronta ? r.caminho : `#${r.id}`);
