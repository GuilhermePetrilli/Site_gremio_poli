// Mensagens da página Sou bixo burro (aluno/bixo/): frases, fotos e vídeos pra mostrar como é daora
// ser da Poli. Com mais de uma peça, elas viram um carrossel; com uma só, aparece fixa.
// A ordem da lista é a ordem em que aparecem.
//
// Tipos:
//   { tipo: "frase", antes: "texto menor que abre", frase: "a frase grande", destaque: "trecho da frase pintado de amarelo" }
//   { tipo: "foto", imagem: "assets/img/bixo/arquivo.jpg", alt: "o que aparece na foto", legenda: "opcional" }
//   { tipo: "video", youtube: "ID do vídeo no YouTube", titulo: "do que é o vídeo" }
//   { tipo: "video", arquivo: "assets/video/arquivo.mp4", capa: "assets/img/bixo/capa.jpg", titulo: "do que é o vídeo" }
// Vídeo pesa: prefira o YouTube a um .mp4 dentro do site.

export const mensagens = [
  {
    tipo: "frase",
    antes: "Você passou na Poli. Ok.",
    frase: "Mas, acima de tudo, agora você é politécnico.",
    destaque: "politécnico",
  },
];
