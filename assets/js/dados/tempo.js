// Hora e data no fuso de São Paulo, usadas pelos bandejões e pelas salas.

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

// Data em São Paulo no formato AAAA-MM-DD, somando dias se pedido.
export const hojeSP = (soma = 0) => new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(Date.now() + soma * 864e5));
