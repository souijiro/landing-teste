// Black Vitalícia 2026 — página de vendas /sejavitalicio
// A consulta roda no banco (função vitalicio_consultar): a página só recebe a categoria, o preço e o link de checkout.
// Links da Hotmart: tabela vitalicio_checkouts no Supabase (HOTMART_BLACK_ANTERIOR_URL, HOTMART_ALUNO_DOCIS_FELIPE_URL, HOTMART_NOVO_ALUNO_URL).
const SUPABASE_URL = "https://eoqyoeohbcpdjxghfwua.supabase.co";
const SUPABASE_KEY = "sb_publishable_cv-1jB60ZGb1hJHYQi0qPA_LwF9DS98";
const PRECO_CHEIO = 1397;
const PRECO_ANCORA = 5999; // soma de tudo que a oferta entrega
// valor da parcela em 12x no checkout da Hotmart (com juros), por preço à vista
const PARCELA_12X = { 1397: "139,51", 897: "89,51", 297: "29,66" };

const OFERTAS = {
  black_anterior: {
    selo: "Benefício máximo desbloqueado",
    titulo: "Você desbloqueou <span class=\"nw\">R$ 1.100</span> de desconto! 🎉",
    msg: "Por ter participado da nossa Black anterior, você ganhou uma condição especial para fazer seu upgrade e garantir os cursos da Docis + Felipe Russo com acesso vitalício!",
    botao: "Quero fazer meu upgrade por <span class=\"nw\">R$ 297</span>",
  },
  aluno: {
    selo: "Desconto de aluno liberado",
    titulo: "Você desbloqueou <span class=\"nw\">R$ 500</span> de desconto! 🎉",
    msg: "Encontramos seu cadastro de aluno! E por já fazer parte da nossa história, você tem uma condição especial para garantir todos os cursos da Docis + Felipe Russo com acesso vitalício.",
    botao: "Quero meu acesso por <span class=\"nw\">R$ 897</span>",
  },
  novo: {
    selo: "",
    titulo: "Seu acesso vitalício está disponível!",
    msg: "Chegou a sua oportunidade de aprender as receitas da Docis e as estratégias de vendas e delivery do Felipe Russo em uma única oferta.",
    botao: "Quero garantir meu acesso vitalício",
  },
};

const $ = (s) => document.querySelector(s);
const brl = (v) => "R$ " + Number(v).toLocaleString("pt-BR");

// ---------- eventos (nunca com CPF/e-mail) ----------
const EVENTOS_META = { clique_cta: "CTAClick", nao_aluno: "NaoSouAluno", sou_aluno: "SouAluno", inicio_identificacao: "IdentificacaoInicio", consulta_concluida: "ConsultaConcluida", categoria_oferta: "CategoriaOferta" };
function evento(nome, dados = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    dataLayer.push({ event: "vitalicio_" + nome, ...dados });
    if (window.gtag && window.GA4_ID) gtag("event", "vitalicio_" + nome, dados);
    if (window.fbq) {
      if (nome === "clique_checkout") fbq("track", "InitiateCheckout", { value: dados.valor, currency: "BRL", content_name: "Black Vitalícia 2026", content_category: dados.categoria });
      else if (EVENTOS_META[nome]) fbq("trackCustom", EVENTOS_META[nome], dados);
    }
  } catch (e) { /* rastreamento nunca quebra a página */ }
}

// ---------- modal ----------
const modal = $("#modal");
let tipo = "cpf", ultimoFoco = null, enviando = false;

function mostrar(etapa) {
  ["#etapa-form", "#etapa-carregando", "#etapa-resultado"].forEach((s) => ($(s).hidden = s !== etapa));
}
function abrir(origem) {
  evento("clique_cta", { origem });
  ultimoFoco = document.activeElement;
  mostrar("#etapa-form");
  mostrarConsulta(false);
  modal.classList.add("aberto");
  document.body.classList.add("modal-aberto");
  document.documentElement.style.overflow = "hidden";
  evento("inicio_identificacao", { origem });
  setTimeout(() => $("#sou-aluno").focus(), 60);
}
// "Sou aluno" abre os campos de consulta; "Não sou aluno" vai direto ao checkout.
function mostrarConsulta(sim) {
  $("#consulta").hidden = !sim;
  $("#escolha").hidden = sim; // depois de "Sou aluno" some a escolha; quem não é aluno usa o link abaixo do campo
  $("#sou-aluno").setAttribute("aria-expanded", String(sim));
}
$("#sou-aluno").addEventListener("click", () => { mostrarConsulta(true); evento("sou_aluno"); setTipo(tipo); setTimeout(() => $("#valor").focus(), 30); });
function fechar() {
  modal.classList.remove("aberto");
  document.body.classList.remove("modal-aberto");
  document.documentElement.style.overflow = "";
  if (ultimoFoco) ultimoFoco.focus();
}
document.querySelectorAll("[data-abrir]").forEach((b) => b.addEventListener("click", () => abrir(b.dataset.abrir)));
modal.addEventListener("click", (e) => { if (e.target.closest("[data-fechar]")) fechar(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("aberto")) fechar(); });

// ---------- CPF / e-mail ----------
const campo = $("#valor"), erro = $("#valor-erro");
function setTipo(t) {
  tipo = t;
  document.querySelectorAll(".aba[data-tipo]").forEach((a) => a.setAttribute("aria-selected", String(a.dataset.tipo === t)));
  campo.value = ""; limparErro();
  if (t === "cpf") {
    $("#valor-rotulo").textContent = "Seu CPF";
    Object.assign(campo, { type: "text", inputMode: "numeric", placeholder: "000.000.000-00", maxLength: 14, autocomplete: "off" });
  } else {
    $("#valor-rotulo").textContent = "E-mail usado na compra";
    Object.assign(campo, { type: "email", inputMode: "email", placeholder: "seuemail@exemplo.com", maxLength: 200, autocomplete: "email" });
  }
  campo.focus();
}
document.querySelectorAll(".aba[data-tipo]").forEach((a) => a.addEventListener("click", () => setTipo(a.dataset.tipo)));

function mascaraCpf(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  return d.replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d{1,2})$/, ".$1-$2");
}
campo.addEventListener("input", () => {
  if (tipo === "cpf") campo.value = mascaraCpf(campo.value);
  limparErro();
});
function cpfValido(v) {
  const d = v.replace(/\D/g, "");
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  const dv = (n) => { let s = 0; for (let i = 0; i < n; i++) s += +d[i] * (n + 1 - i); return (s * 10) % 11 % 10; };
  return dv(9) === +d[9] && dv(10) === +d[10];
}
const emailValido = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(v.trim());
function mostrarErro(msg) { erro.textContent = msg; campo.setAttribute("aria-invalid", "true"); campo.focus(); }
function limparErro() { erro.textContent = ""; campo.removeAttribute("aria-invalid"); }

// ---------- consulta ----------
async function consultar(t, valor) {
  const ctrl = new AbortController();
  const tempo = setTimeout(() => ctrl.abort(), 12000);
  try {
    const r = await fetch(SUPABASE_URL + "/rest/v1/rpc/vitalicio_consultar", {
      method: "POST", signal: ctrl.signal,
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_tipo: t, p_valor: valor }),
    });
    if (!r.ok) throw new Error("http " + r.status);
    return await r.json();
  } finally { clearTimeout(tempo); }
}

$("#form-consulta").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (enviando) return;
  const valor = campo.value.trim();
  if (tipo === "cpf" && !cpfValido(valor)) return mostrarErro(valor ? "Confira o CPF: algum número parece estar errado." : "Digite seu CPF.");
  if (tipo === "email" && !emailValido(valor)) return mostrarErro(valor ? "Confira o e-mail: parece estar incompleto." : "Digite o e-mail usado na compra.");

  enviando = true;
  mostrar("#etapa-carregando");
  const inicio = Date.now();
  let res = null, falhou = false;
  try { res = await consultar(tipo, valor); } catch (err) { falhou = true; }
  await new Promise((ok) => setTimeout(ok, Math.max(0, 900 - (Date.now() - inicio)))); // tempo mínimo para a animação
  enviando = false;

  if (falhou || !res) return telaErro("Não conseguimos consultar agora. Isso costuma ser rápido de resolver: tente de novo em alguns segundos.");
  if (res.erro === "invalido") { mostrar("#etapa-form"); return mostrarErro(tipo === "cpf" ? "Confira o CPF: algum número parece estar errado." : "Confira o e-mail digitado."); }
  if (res.erro === "limite") return telaErro("Muitas consultas seguidas desta conexão. Aguarde alguns minutos e tente de novo.");
  if (!OFERTAS[res.categoria]) return telaErro("Não conseguimos concluir a consulta. Tente de novo em alguns segundos.");

  evento("consulta_concluida", { tipo_consulta: tipo, encontrado: res.categoria !== "novo" });
  if (res.categoria === "novo") return telaNaoEncontrado();
  evento("categoria_oferta", { categoria: res.categoria, valor: res.preco });
  telaOferta(res, tipo === "email" ? valor.trim().toLowerCase() : "");
});

// CPF/e-mail sem compra: pede para conferir ou seguir como novo aluno
function telaNaoEncontrado() {
  const box = $("#etapa-resultado");
  box.innerHTML = `<div class="erro-caixa"><div class="icone" aria-hidden="true">🔎</div>
    <h2 class="res__titulo">Não encontramos seu cadastro</h2>
    <p>Confira o ${tipo === "cpf" ? "CPF" : "e-mail"} digitado e tente novamente${tipo === "cpf" ? " ou consulte pelo e-mail da compra" : ""}.</p>
    <button type="button" class="btn btn--branco" id="tentar-de-novo">Tentar novamente</button>
    <div class="res__outro"><button type="button" class="link" id="link-nao-aluno">Clique aqui se você não for aluno</button></div></div>`;
  mostrar("#etapa-resultado");
  $("#tentar-de-novo").addEventListener("click", () => { mostrar("#etapa-form"); campo.focus(); campo.select(); });
  $("#link-nao-aluno").addEventListener("click", irNaoAluno);
}

function telaErro(msg) {
  const box = $("#etapa-resultado");
  box.innerHTML = `<div class="erro-caixa"><div class="icone" aria-hidden="true">⏳</div><h2 class="res__titulo">Quase lá!</h2><p>${msg}</p>
    <button type="button" class="btn btn--branco" id="tentar-de-novo">Tentar novamente</button></div>`;
  mostrar("#etapa-resultado");
  $("#tentar-de-novo").addEventListener("click", () => { mostrar("#etapa-form"); campo.focus(); });
}

// link da Hotmart: e-mail preenchido (quando consultou por e-mail) + UTMs/origem da página, para a venda cair na campanha certa
function montarCheckout(base, categoria, email) {
  const u = new URL(base);
  const aqui = new URLSearchParams(location.search);
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "src", "xcod"].forEach((k) => { if (aqui.get(k) && !u.searchParams.has(k)) u.searchParams.set(k, aqui.get(k)); });
  if (!u.searchParams.has("sck")) u.searchParams.set("sck", "sejavitalicio_" + categoria);
  if (email && !u.searchParams.has("email")) u.searchParams.set("email", email);
  return u.toString();
}

// Duas formas de pagamento na mesma oferta da Hotmart:
// cartão/à vista = checkout padrão (oferta 7xxei0ba, cupom ALUNOS/BLACK)
// parcelado = boleto parcelado, Pix parcelado e parcelamento inteligente (oferta 22oyoyxe, cupom ALUNOSBOLETO/BLACKBOLETO)
const OFERTA_PARCELADO = "22oyoyxe";
function linkParcelado(base) {
  const u = new URL(base);
  u.searchParams.set("off", OFERTA_PARCELADO);
  const cupom = u.searchParams.get("offDiscount");
  if (cupom && !/BOLETO$/i.test(cupom)) u.searchParams.set("offDiscount", cupom + "BOLETO");
  return u.toString();
}
function opcoesPagamento(res) {
  const parc = PARCELA_12X[res.preco];
  return `<fieldset class="pag">
      <legend class="pag__titulo">Como você prefere pagar?</legend>
      <label class="pag__op pag__op--destaque">
        <span class="pag__selo">Melhor opção</span>
        <input type="radio" name="pag" value="cartao" checked>
        <span class="pag__corpo">
          <span class="pag__nome">Cartão de crédito ou à vista</span>
          ${parc ? `<span class="pag__grande">12x de R$ ${parc}</span><span class="pag__linha">no cartão de crédito</span>` : ""}
          <span class="pag__linha"><span aria-hidden="true">⚡</span> ou <b>${brl(res.preco)} à vista</b> no Pix ou no cartão</span>
        </span>
      </label>
      <label class="pag__op pag__op--simples">
        <input type="radio" name="pag" value="parcelado">
        <span class="pag__corpo">
          <span class="pag__nome">Boleto, Pix parcelado ou Parcelamento Inteligente</span>
          <span class="pag__linha"><span aria-hidden="true">📄</span> <b>Boleto parcelado:</b> um boleto por mês</span>
          <span class="pag__linha"><span aria-hidden="true">💠</span> <b>Pix parcelado:</b> um Pix por mês</span>
          <span class="pag__linha"><span aria-hidden="true">🔁</span> <b>Parcelamento Inteligente:</b> no cartão, cobrando só a parcela do mês, sem ocupar o limite todo</span>
          <span class="pag__nota">Você escolhe o número de parcelas no checkout.</span>
        </span>
      </label>
    </fieldset>`;
}

function telaOferta(res, email) {
  const o = OFERTAS[res.categoria];
  const temDesconto = res.categoria !== "novo";
  const box = $("#etapa-resultado");
  box.innerHTML = `
    ${o.selo ? `<span class="res__selo">${o.selo}</span>` : ""}
    <h2 class="res__titulo">${o.titulo}</h2>
    <p class="res__msg">${o.msg}</p>
    ${res.checkout ? opcoesPagamento(res) : ""}
    <button type="button" class="btn" id="ir-checkout" ${res.checkout ? "" : "disabled"}>Consultar opções de pagamento</button>
    ${res.checkout ? `<p class="pag__seg">🔒 Pagamento seguro pela Hotmart</p>` : `<p class="res__aviso">O checkout desta oferta abre em instantes. Volte daqui a pouco para garantir sua condição.</p>`}
    <div class="res__outro"><button type="button" class="link" id="outro">Comprou com outro e-mail ou CPF? Tentar outro</button></div>`;
  mostrar("#etapa-resultado");
  if (res.checkout) {
    $("#ir-checkout").addEventListener("click", () => {
      const forma = (box.querySelector('input[name="pag"]:checked') || {}).value || "cartao";
      const url = montarCheckout(forma === "parcelado" ? linkParcelado(res.checkout) : res.checkout, res.categoria, email);
      evento("clique_checkout", { categoria: res.categoria, valor: res.preco, pagamento: forma });
      const aba = window.open(url, "_blank"); // com "noopener" o open devolve null e não dá para saber se abriu
      if (aba) aba.opener = null;
      else location.href = url; // bloqueador de pop-up: abre na mesma aba
    });
  }
  $("#outro").addEventListener("click", () => setTipoEVoltar());
}
// "Não sou aluno": sem consulta de cadastro, mostra a oferta cheia com as formas de pagamento.
async function irNaoAluno() {
  if (enviando) return;
  enviando = true;
  evento("nao_aluno", {});
  mostrar("#etapa-carregando");
  let res = null;
  try { res = await consultar("nao_aluno", null); } catch (err) { /* tratado abaixo */ }
  enviando = false;
  if (!res || res.categoria !== "novo") return telaErro("Não conseguimos abrir a oferta agora. Tente de novo em alguns segundos.");
  evento("categoria_oferta", { categoria: res.categoria, valor: res.preco });
  telaOferta(res, "");
}
$("#nao-aluno").addEventListener("click", irNaoAluno);
$("#nao-aluno-2").addEventListener("click", irNaoAluno);

function setTipoEVoltar() { mostrar("#etapa-form"); setTipo(tipo === "cpf" ? "email" : "cpf"); }

// ---------- botão fixo no celular: aparece quando o botão da primeira dobra sai da tela ----------
const fixo = $("#cta-fixo");
if ("IntersectionObserver" in window) {
  new IntersectionObserver(([en]) => {
    const vis = !en.isIntersecting;
    fixo.classList.toggle("visivel", vis);
    fixo.setAttribute("aria-hidden", String(!vis));
    fixo.querySelector("button").tabIndex = vis ? 0 : -1;
  }).observe($("#cta-hero"));
  const rev = new IntersectionObserver((ens) => ens.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("visto"); rev.unobserve(en.target); } }), { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".revelar").forEach((el) => rev.observe(el));
} else {
  fixo.classList.add("visivel");
  document.querySelectorAll(".revelar").forEach((el) => el.classList.add("visto"));
}
