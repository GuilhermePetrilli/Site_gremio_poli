// Painel "Contas do Grêmio" no portal interno (admin/): entrar, lançar receitas e despesas,
// excluir lançamentos e ajustar o valor da dívida e o saldo inicial. Tudo o que é salvo aparece
// na hora na página Transparência. Exige o banco Supabase configurado em config.js (site.contas);
// sem ele, mostra o passo a passo. A permissão real está nas regras do banco (contas.sql).
// Uso: <div class="painel-contas" id="painelContas"></div> e <div data-componente="contas-admin"></div>.

import { supabase, configurado, carregar, extrato, reais, dataBR, CATEGORIAS, INICIO_CONTAS } from "../dados/contas.js?v=202610072351";
import { hojeSP } from "../dados/tempo.js?v=202610072351";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export default async function contasAdmin(_alvo, contexto) {
  const { site, raiz, url } = contexto;
  const painel = document.getElementById("painelContas");
  if (!painel) return;

  if (!configurado(site)) {
    painel.innerHTML = `
      <p><b>O banco das contas ainda não está ligado.</b> Assim que ele estiver configurado, quem estiver na lista de administradores entra aqui com e-mail e senha e lança receitas e despesas, que aparecem na hora na <a href="${url("transparencia/")}">Transparência</a>.</p>
      <ol class="passos">
        <li>Crie um projeto gratuito em <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a> (região São Paulo).</li>
        <li>No SQL Editor do projeto, rode o arquivo <code>ferramentas/supabase/contas.sql</code> do repositório.</li>
        <li>Cadastre os e-mails de quem pode lançar em <code>administradores</code> e crie essas contas em Authentication, com o cadastro aberto desligado.</li>
        <li>Cole a URL do projeto e a chave pública (anon) em <code>assets/js/config.js</code>, em <code>site.contas</code>, e publique.</li>
      </ol>
      <p class="nota">O passo a passo completo está em <code>ferramentas/supabase/LEIA-ME.md</code>.</p>`;
    return;
  }

  let db;
  try { db = await supabase(site); } catch {
    painel.innerHTML = `<p>Não deu para conectar ao banco das contas agora. Tente de novo em alguns minutos.</p>`;
    return;
  }

  async function tela() {
    const { data: { session } } = await db.auth.getSession();
    if (!session) return telaEntrar();
    const { data: lista } = await db.from("administradores").select("email").eq("email", session.user.email);
    if (!lista || !lista.length) {
      painel.innerHTML = `<p>Você entrou como <b>${esc(session.user.email)}</b>, mas esta conta não está na lista de administradores das contas. Peça à diretoria responsável para incluir o seu e-mail.</p><button type="button" class="botao botao--linha botao--pequeno" id="sair">Sair</button>`;
      painel.querySelector("#sair").onclick = async () => { await db.auth.signOut(); tela(); };
      return;
    }
    return telaLancar(session.user.email);
  }

  function telaEntrar(msg = "") {
    painel.innerHTML = `
      <form class="formulario" id="fEntrar">
        <p>Entre com o e-mail e a senha de administrador.</p>
        <div class="dupla">
          <div class="campo"><label for="ceEmail">E-mail</label><input type="email" id="ceEmail" autocomplete="username" required></div>
          <div class="campo"><label for="ceSenha">Senha</label><input type="password" id="ceSenha" autocomplete="current-password" required></div>
        </div>
        <p class="formulario__erro" id="ceErro" role="alert"${msg ? "" : " hidden"}>${esc(msg)}</p>
        <div class="formulario__fim"><button class="botao" type="submit">Entrar</button></div>
      </form>`;
    painel.querySelector("#fEntrar").addEventListener("submit", async (e) => {
      e.preventDefault();
      const { error } = await db.auth.signInWithPassword({ email: painel.querySelector("#ceEmail").value.trim(), password: painel.querySelector("#ceSenha").value });
      if (error) return telaEntrar("E-mail ou senha incorretos.");
      tela();
    });
  }

  async function telaLancar(email, aviso = "") {
    const r = await carregar(site, raiz);
    const ex = extrato(r.lancamentos, r.parametros);
    const recentes = r.lancamentos.slice().sort((a, b) => String(b.criado_em).localeCompare(String(a.criado_em))).slice(0, 15);
    painel.innerHTML = `
      <div class="painel-contas__topo">
        <span>Saldo publicado: <b>${reais(ex.saldo)}</b> · ${ex.linhas.length} lançamento${ex.linhas.length === 1 ? "" : "s"}</span>
        <span><small>${esc(email)}</small> <button type="button" class="chip" id="sair">Sair</button></span>
      </div>
      <form class="formulario" id="fLanc" novalidate>
        <fieldset class="campo">
          <legend>Tipo</legend>
          <div class="opcoes">
            <label><input type="radio" name="tipo" value="despesa" checked><span>Despesa</span></label>
            <label><input type="radio" name="tipo" value="receita"><span>Receita</span></label>
          </div>
        </fieldset>
        <div class="tres">
          <div class="campo"><label for="clData">Data</label><input type="date" id="clData" name="data" min="${INICIO_CONTAS}" value="${hojeSP() < INICIO_CONTAS ? INICIO_CONTAS : hojeSP()}" required></div>
          <div class="campo"><label for="clValor">Valor (R$)</label><input type="number" id="clValor" name="valor" min="0.01" step="0.01" inputmode="decimal" required></div>
          <div class="campo"><label for="clCat">Categoria</label><input type="text" id="clCat" name="categoria" list="clCats" value="Outros" required><datalist id="clCats">${CATEGORIAS.map((c) => `<option value="${esc(c)}">`).join("")}</datalist></div>
        </div>
        <div class="campo"><label for="clDesc">Descrição</label><input type="text" id="clDesc" name="descricao" maxlength="200" placeholder="Ex.: Impressão dos cartazes da Semana de Recepção" required></div>
        <div class="dupla">
          <div class="campo"><label for="clDir">Diretoria (opcional)</label><input type="text" id="clDir" name="diretoria"></div>
          <div class="campo"><label for="clComp">Link do comprovante (opcional)</label><input type="text" id="clComp" name="comprovante_url" placeholder="https://"></div>
        </div>
        <label class="campo" style="display:flex;gap:10px;align-items:center"><input type="checkbox" name="abate_divida" style="width:18px;height:18px"> <span>Esta despesa é um pagamento da dívida do Grêmio</span></label>
        <p class="formulario__erro" id="clErro" role="alert" hidden></p>
        <div class="formulario__fim"><button class="botao" type="submit">Lançar e publicar</button>${aviso ? `<p class="ok-msg">${esc(aviso)}</p>` : ""}</div>
      </form>

      <h3 style="margin-top:22px">Últimos lançamentos</h3>
      ${recentes.length ? `<ul class="lista-admin">${recentes.map((l) => `<li>
          <span class="tab">${dataBR(l.data)}</span>
          <span>${esc(l.descricao)} <small>(${esc(l.categoria)})</small></span>
          <b class="tab" style="color:${l.tipo === "receita" ? "var(--aberto)" : "var(--vermelho)"}">${l.tipo === "receita" ? "+" : "−"} ${reais(l.valor)}</b>
          <button type="button" data-excluir="${esc(l.id)}">Excluir</button>
        </li>`).join("")}</ul>` : `<p class="nota">Nenhum lançamento ainda.</p>`}

      <h3 style="margin-top:22px">Dívida e saldo inicial</h3>
      <form class="formulario" id="fParam" novalidate>
        <div class="dupla">
          <div class="campo"><label for="cpDiv">Valor total da dívida (R$)</label><input type="number" id="cpDiv" min="0" step="0.01" value="${r.parametros?.divida?.total ?? ""}" placeholder="Deixe vazio enquanto estiver a confirmar"></div>
          <div class="campo"><label for="cpIni">Saldo em 1º de janeiro de 2027 (R$)</label><input type="number" id="cpIni" step="0.01" value="${r.parametros?.saldo_inicial?.valor ?? ""}" placeholder="Deixe vazio enquanto estiver a confirmar"></div>
        </div>
        <div class="formulario__fim"><button class="botao botao--linha" type="submit">Salvar valores</button></div>
      </form>`;

    painel.querySelector("#sair").onclick = async () => { await db.auth.signOut(); tela(); };

    painel.querySelector("#fLanc").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = new FormData(e.target), erro = painel.querySelector("#clErro");
      const reg = {
        tipo: f.get("tipo"),
        data: f.get("data"),
        valor: Number(String(f.get("valor")).replace(",", ".")),
        categoria: String(f.get("categoria") || "Outros").trim() || "Outros",
        descricao: String(f.get("descricao") || "").trim(),
        diretoria: String(f.get("diretoria") || "").trim() || null,
        comprovante_url: String(f.get("comprovante_url") || "").trim() || null,
        abate_divida: f.get("tipo") === "despesa" && f.get("abate_divida") === "on",
      };
      const problema = !reg.data || reg.data < INICIO_CONTAS ? "A data precisa ser de 1º de janeiro de 2027 em diante."
        : !(reg.valor > 0) ? "Informe um valor maior que zero."
        : reg.descricao.length < 2 ? "Escreva uma descrição para o lançamento."
        : reg.comprovante_url && !/^https?:\/\//.test(reg.comprovante_url) ? "O link do comprovante precisa começar com http:// ou https://." : "";
      if (problema) { erro.textContent = problema; erro.hidden = false; return; }
      const { error } = await db.from("lancamentos").insert(reg);
      if (error) { erro.textContent = "Não deu para salvar. Confira se você ainda está conectado e tente de novo."; erro.hidden = false; return; }
      telaLancar(email, `Lançado: ${reg.tipo === "receita" ? "+" : "−"} ${reais(reg.valor)}. Já está na Transparência.`);
    });

    painel.querySelectorAll("[data-excluir]").forEach((b) => b.addEventListener("click", async () => {
      if (!confirm("Excluir este lançamento? Ele some também da Transparência.")) return;
      const { error } = await db.from("lancamentos").delete().eq("id", b.dataset.excluir);
      telaLancar(email, error ? "" : "Lançamento excluído.");
    }));

    painel.querySelector("#fParam").addEventListener("submit", async (e) => {
      e.preventDefault();
      const div = painel.querySelector("#cpDiv").value, ini = painel.querySelector("#cpIni").value;
      const { error } = await db.from("parametros").upsert([
        { chave: "divida", valor: { total: div === "" ? null : Number(div) }, atualizado_em: new Date().toISOString() },
        { chave: "saldo_inicial", valor: { valor: ini === "" ? null : Number(ini) }, atualizado_em: new Date().toISOString() },
      ]);
      telaLancar(email, error ? "" : "Valores salvos e publicados.");
    });
  }

  tela();
}
