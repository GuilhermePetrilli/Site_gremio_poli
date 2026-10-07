// Formulário de demandas (aluno/demandas/): monta um e-mail pronto para o Grêmio com o tipo
// (proposta, demanda ou denúncia), o assunto, o título e o texto, e abre o programa de e-mail
// do aluno. O site é estático, então o envio sai do e-mail de quem escreve (não é anônimo).
// Uso: a marcação fica na página (<form id="demanda">) e <div data-componente="demanda"></div>.

export default function demanda(_alvo, { site }) {
  const form = document.getElementById("demanda");
  if (!form) return;
  const erro = document.getElementById("dem-erro");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    const valor = (nome) => String(dados.get(nome) || "").trim();
    const titulo = valor("titulo"), texto = valor("texto");

    if (!titulo || !texto) {
      erro.textContent = !titulo ? "Escreva um título para a sua mensagem." : "Conte com detalhes o que você quer levar ao Grêmio.";
      erro.hidden = false;
      form.querySelector(!titulo ? "#dem-titulo" : "#dem-texto").focus();
      return;
    }
    erro.hidden = true;

    const tipo = valor("tipo"), area = valor("area");
    const assunto = `[${tipo}] ${area}: ${titulo}`;
    const corpo = [
      `Tipo: ${tipo}`,
      `Assunto: ${area}`,
      "",
      texto,
      "",
      valor("nome") ? `Nome: ${valor("nome")}` : "",
      valor("curso") ? `Curso e ano: ${valor("curso")}` : "",
      "",
      "Enviado pela página Demandas e transparência do site do Grêmio Politécnico.",
    ].filter((linha, i, todas) => linha || todas[i - 1]).join("\n");

    location.href = `mailto:${site.contato.email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`;
  });
}
