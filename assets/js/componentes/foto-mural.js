// Mandar uma foto para o Mural de memórias (aluno/meu-amor/).
// Mostra a foto escolhida dentro da polaroide, confere o tamanho e envia o formulário ao
// FormSubmit, que repassa a foto por e-mail ao administrador do site (o site é estático, sem servidor).
// O endereço de destino fica no action do formulário, na página.
// Uso: <form id="formFoto"> da página e <div data-componente="foto-mural"></div>.

const LIMITE = 5 * 1024 * 1024;

export default function fotoMural() {
  const form = document.getElementById("formFoto");
  if (!form) return;
  const arquivo = document.getElementById("fotoArquivo"), janela = document.getElementById("fotoJanela");
  const legenda = document.getElementById("fotoLegenda"), previa = document.getElementById("fotoLegendaPrevia");
  const erro = document.getElementById("fotoErro");
  let url = null;

  // Volta para esta mesma página depois do envio, com o aviso de sucesso.
  const volta = new URL(location.href);
  volta.hash = "mande-sua-foto";
  volta.searchParams.set("foto", "enviada");
  document.getElementById("fotoVolta").value = volta.href;
  if (new URLSearchParams(location.search).get("foto") === "enviada") document.getElementById("fotoOk").hidden = false;

  const avisar = (texto) => { erro.textContent = texto; erro.hidden = false; };

  arquivo.addEventListener("change", () => {
    const f = arquivo.files[0];
    erro.hidden = true;
    if (!f) return;
    if (!f.type.startsWith("image/")) { avisar("Escolha um arquivo de imagem."); arquivo.value = ""; return; }
    if (f.size > LIMITE) { avisar("A foto passa de 5 MB. Escolha uma versão menor."); arquivo.value = ""; return; }
    if (url) URL.revokeObjectURL(url);
    url = URL.createObjectURL(f);
    janela.classList.add("com-foto");
    janela.innerHTML = `<img src="${url}" alt="Prévia da foto escolhida">`;
  });
  legenda.addEventListener("input", () => { previa.textContent = legenda.value.trim() || "sua legenda aqui"; });

  form.addEventListener("submit", (e) => {
    if (!arquivo.files[0]) { e.preventDefault(); avisar("Escolha uma foto tocando na polaroide."); return; }
    if (!legenda.value.trim()) { e.preventDefault(); avisar("Escreva uma legenda para a foto."); legenda.focus(); }
  });
}
