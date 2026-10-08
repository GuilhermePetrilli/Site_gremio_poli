// Empreendimentos do Grêmio mostrados em servicos/: logo (SVG vetorizado por
// ferramentas/vetorizar.mjs), textos e posição no mapa do campus (pixels de mapa-campus.js).
// x/y null = local ainda a confirmar: o serviço aparece na lista, mas não no mapa.
// Para pôr um novo ponto no mapa, basta adicionar um item aqui (o mapa é o mesmo dos bandejões).

export const servicos = [
  {
    id: "copiadora",
    nome: "Copiadora Politécnica",
    logo: "assets/img/servicos/copiadora.svg",
    frase: "A salvação da véspera.",
    texto: "Plano de cotas com preços mais acessíveis durante toda a graduação, itens de conveniência e impressão de material de divulgação.",
    onde: null,
    x: null, y: null,
  },
  {
    id: "triedro",
    nome: "Lanchonete Triedro",
    logo: "assets/img/servicos/triedro.svg",
    frase: "Entre uma aula e outra.",
    texto: "Refeições a preços acessíveis para quem não tem tempo de ir até o bandejão.",
    onde: "No prédio do Biênio",
    x: 697, y: 480,
  },
  {
    id: "poliglota",
    nome: "Poliglota Idiomas",
    logo: "assets/img/servicos/poliglota.svg",
    frase: "O idioma do seu intercâmbio começa aqui.",
    texto: "Há mais de 30 anos ensinando alemão, espanhol, francês, inglês, italiano e português, com bolsas integrais para alunos.",
    numeros: [{ valor: "6", rotulo: "idiomas" }, { valor: "30+", rotulo: "anos" }, { valor: "900+", rotulo: "bolsas integrais" }],
    onde: null,
    x: null, y: null,
  },
];
