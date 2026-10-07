// Horários dos bandejões em dias letivos (minutos desde 0h).
// Fonte: página "Bandejão" do Instituto de Física da USP, conferida em outubro de 2026.
// Reaproveitado pelo painel "Agora no campus" e, futuramente, pelo guia dos bandejões.

export const bandejoes = [
  { id: "central", nome: "Central", semana: [["Café da manhã", 420, 510], ["Almoço", 660, 840], ["Jantar", 1050, 1185]], sabado: [["Café da manhã", 450, 510], ["Almoço", 660, 830]] },
  { id: "fisica", nome: "Física", semana: [["Almoço", 660, 840], ["Jantar", 1050, 1185]], sabado: [] },
  { id: "quimica", nome: "Química", semana: [["Almoço", 660, 840], ["Jantar", 1050, 1185]], sabado: [] },
  { id: "prefeitura", nome: "Prefeitura", semana: [["Almoço", 660, 840]], sabado: [] },
];

export const hora = (m) => {
  const h = Math.floor(m / 60), mm = m % 60;
  return h + "h" + (mm ? String(mm).padStart(2, "0") : "");
};

// Dia da semana (0 = domingo) e minuto atual no fuso de São Paulo.
export function agoraSP() {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" })
      .formatToParts(new Date()).map((x) => [x.type, x.value])
  );
  return { dia: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[p.weekday], minuto: (+p.hour % 24) * 60 + +p.minute };
}

export function situacao(b, { dia, minuto } = agoraSP()) {
  const lista = dia >= 1 && dia <= 5 ? b.semana : dia === 6 ? b.sabado : [];
  if (!lista.length) return { aberto: false, texto: dia === 0 ? "Fechado aos domingos" : "Fechado hoje" };
  for (const [refeicao, abre, fecha] of lista) if (minuto >= abre && minuto < fecha) return { aberto: true, texto: `${refeicao} até ${hora(fecha)}` };
  for (const [refeicao, abre] of lista) if (minuto < abre) return { aberto: false, texto: `${refeicao} às ${hora(abre)}` };
  return { aberto: false, texto: "Fechado por hoje" };
}
