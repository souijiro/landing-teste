// Supabase "Docis Controles" — chave pública: só permite INSERIR na tabela (não lê nada)
const SUPABASE_URL = "https://eoqyoeohbcpdjxghfwua.supabase.co";
const SUPABASE_KEY = "sb_publishable_cv-1jB60ZGb1hJHYQi0qPA_LwF9DS98";
const TABELA = "leads_black2026";
// No domínio do Felipe a página fica na raiz: black.confeitaria5estrelas.com/obrigado
const PAGINA_OBRIGADO = location.hostname === "black.confeitaria5estrelas.com" ? "/obrigado" : "/black2026/obrigado";

const UTM_CAMPOS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

// ---------- UTMs ----------
// Guarda as UTMs da primeira visita na sessão, para não perder se a URL mudar.
function capturarUtms() {
  const params = new URLSearchParams(location.search);
  let salvas = {};
  try { salvas = JSON.parse(sessionStorage.getItem("black2026_utms") || "{}"); } catch (e) {}
  const utms = {};
  UTM_CAMPOS.forEach((c) => { utms[c] = (params.get(c) || salvas[c] || "").slice(0, 300) || null; });
  try { sessionStorage.setItem("black2026_utms", JSON.stringify(utms)); } catch (e) {}
  return utms;
}
const UTMS = capturarUtms();
const PAGINA_ORIGEM = location.href.slice(0, 1000);

const uuid = () => (crypto.randomUUID ? crypto.randomUUID() : "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)));

// ---------- Teste A/B 2: um dia inteiro sem e-mail x um dia inteiro com e-mail (mesma copy) ----------
// 20/10 (Brasília): SEM e-mail · 21/10: COM e-mail (dia de comparação) · fora disso: COM e-mail.
// A versão vale pela hora em que a página abriu. ?ab=com_email ou ?ab=sem_email força a versão e NÃO conta visita.
const AB_VARIANTES = ["com_email", "sem_email"];
const AB_DIAS = [
  { ini: Date.parse("2026-10-20T00:00:00-03:00"), fim: Date.parse("2026-10-21T00:00:00-03:00"), v: "sem_email" },
  { ini: Date.parse("2026-10-21T00:00:00-03:00"), fim: Date.parse("2026-10-22T00:00:00-03:00"), v: "com_email" }
];
const AB_FORCADA = AB_VARIANTES.includes(new URLSearchParams(location.search).get("ab")) ? new URLSearchParams(location.search).get("ab") : null;
function lerOuCriar(chave, criar) {
  try { let v = localStorage.getItem(chave); if (!v) { v = criar(); localStorage.setItem(chave, v); } return v; } catch (e) { return criar(); }
}
const VISITANTE = lerOuCriar("black2026_visitante", uuid);
function versaoAB(ms) {
  const p = AB_DIAS.find((x) => ms >= x.ini && ms < x.fim);
  return p ? p.v : "com_email";
}
const VARIANTE = AB_FORCADA || versaoAB(Date.now());
const SEM_EMAIL = VARIANTE === "sem_email";
if (SEM_EMAIL) {
  const campoEmail = document.getElementById("email").closest(".campo");
  campoEmail.hidden = true;
  document.getElementById("email").required = false;
}
function registrar(evento) {
  if (AB_FORCADA || window.HEADLINE_FORCADA) return;
  try {
    fetch(`${SUPABASE_URL}/rest/v1/visitas_black2026`, {
      method: "POST", keepalive: true,
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ visitante: VISITANTE, variante: VARIANTE, variante_headline: window.HEADLINE || null, evento, host: location.hostname.slice(0, 100),
        utm_source: UTMS.utm_source, utm_medium: UTMS.utm_medium, utm_campaign: UTMS.utm_campaign, utm_content: UTMS.utm_content, utm_term: UTMS.utm_term })
    }).catch(() => {});
  } catch (e) {}
}
// a visita é registrada logo que a página termina de carregar (ou no 1º toque), fora do caminho crítico
(window.carregarDepois || ((f) => f()))(() => registrar("visita"));
let popupRegistrado = false;

// ---------- Telefone com DDI ----------
// A biblioteca do seletor de país (~80 KB) só é usada no formulário: carrega depois que a página aparece
// ou quando a pessoa abre o popup, o que vier primeiro.
const ITI_URL = "https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/";
const telInput = document.getElementById("telefone");
let iti = null, carregandoTel = null;
function carregarTelefone() {
  if (carregandoTel) return carregandoTel;
  carregandoTel = (async () => {
    await new Promise((ok, erro) => {
      const sc = document.createElement("script");
      sc.src = ITI_URL + "intlTelInputWithUtils.min.js"; sc.onload = ok; sc.onerror = erro;
      document.head.appendChild(sc);
    });
    const { default: ptBR } = await import(ITI_URL + "i18n/pt/index.js");
    iti = window.intlTelInput(telInput, {
      initialCountry: "br",
      countryOrder: ["br", "pt", "us"],
      separateDialCode: true,
      countrySearch: true,
      nationalMode: true,
      formatAsYouType: true,
      strictMode: true,
      i18n: ptBR,
      dropdownContainer: document.body
    });
    telInput.addEventListener("countrychange", () => {
      telInput.placeholder = iti.getSelectedCountryData().iso2 === "br" ? "* DDD + WhatsApp" : "* WhatsApp";
    });
    return iti;
  })();
  carregandoTel.catch(() => { carregandoTel = null; }); // se o CDN falhar, tenta de novo no envio
  return carregandoTel;
}
(window.carregarDepois || ((f) => f()))(() => setTimeout(carregarTelefone, 200));

// Sem a biblioteca (CDN fora do ar): aceita número brasileiro com DDD
function telefoneReserva() {
  let d = telInput.value.replace(/\D/g, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return /^55\d{10,11}$/.test(d) ? "+" + d : null;
}

// ---------- Popup ----------
const modal = document.getElementById("modal");
let ultimoFoco = null;
function abrir() {
  ultimoFoco = document.activeElement;
  modal.hidden = false;
  modal.classList.add("aberto");
  document.body.style.overflow = "hidden";
  setTimeout(() => document.getElementById("nome").focus(), 60);
  if (window.fbq) fbq("trackCustom", "AbriuPopupBlack2026");
  if (window.dataLayer) window.dataLayer.push({ event: "abriu_popup_black2026", variante_ab: VARIANTE });
  if (!popupRegistrado) { popupRegistrado = true; registrar("popup"); }
  carregarTelefone().catch(() => {});
}
function fechar() {
  modal.classList.remove("aberto");
  modal.hidden = true;
  document.body.style.overflow = "";
  if (ultimoFoco) ultimoFoco.focus();
}
document.querySelectorAll("[data-abrir]").forEach((b) => b.addEventListener("click", abrir));
document.querySelector("[data-fechar]").addEventListener("click", fechar);
modal.addEventListener("click", (e) => { if (e.target === modal) fechar(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("aberto")) fechar(); });

// Botão fixo aparece depois que o botão do topo sai da tela
const ctaFixo = document.getElementById("cta-fixo");
new IntersectionObserver(([e]) => {
  ctaFixo.classList.toggle("visivel", !e.isIntersecting && e.boundingClientRect.top < 0);
}).observe(document.getElementById("cta-hero"));

// ---------- Envio ----------
const form = document.getElementById("form");
const btn = document.getElementById("enviar");
const falha = document.getElementById("falha");

function marcar(input, ok) {
  input.closest(".campo").classList.toggle("erro", !ok);
  return ok;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  falha.style.display = "none";

  const nomeEl = form.nome, emailEl = form.email;
  const nome = nomeEl.value.trim().replace(/\s+/g, " ");
  const email = emailEl.value.trim().toLowerCase();
  const okNome = marcar(nomeEl, nome.length >= 2);
  const okEmail = SEM_EMAIL || marcar(emailEl, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
  if (!iti) { try { await carregarTelefone(); } catch (err) { /* usa a validação reserva */ } }
  const okTel = marcar(telInput, iti ? iti.isValidNumber() : !!telefoneReserva());
  if (!okNome || !okEmail || !okTel) {
    form.querySelector(".campo.erro input").focus();
    return;
  }

  const lead = {
    nome,
    email: SEM_EMAIL ? null : email,
    telefone: iti ? iti.getNumber() : telefoneReserva(), // E.164, ex: +5511999999999
    pais: iti ? iti.getSelectedCountryData().iso2 || null : "br",
    ...UTMS,
    pagina_origem: PAGINA_ORIGEM,
    // mesmo ID no banco, no pixel e no GTM: a Meta descarta Leads repetidos com o mesmo event_id
    event_id: uuid(),
    variante_ab: VARIANTE,
    variante_headline: window.HEADLINE || null // Teste A/B 3: "atual" ou "nova"
  };

  btn.disabled = true;
  btn.textContent = "Enviando...";

  let salvo = false;
  for (let tentativa = 0; tentativa < 2 && !salvo; tentativa++) {
    try {
      const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          "Content-Type": "application/json",
          Prefer: "return=minimal"
        },
        body: JSON.stringify(lead)
      });
      salvo = r.ok || r.status === 409; // 409 = já gravado numa tentativa anterior (mesmo event_id)
    } catch (err) { /* tenta de novo */ }
  }

  if (!salvo) {
    btn.disabled = false;
    btn.textContent = "Finalizar cadastro";
    falha.style.display = "block";
    return;
  }

  // Leva as UTMs para a página de obrigado (uma vez só)
  const qs = new URLSearchParams();
  qs.set("e", lead.event_id); // a página de obrigado usa para achar o grupo de WhatsApp desta pessoa
  try { sessionStorage.setItem("black2026_event_id", lead.event_id); } catch (e) {}
  UTM_CAMPOS.forEach((c) => { if (UTMS[c]) qs.set(c, UTMS[c]); });
  let foi = false;
  const irParaObrigado = () => {
    if (foi) return; foi = true;
    location.href = PAGINA_OBRIGADO + (qs.toString() ? "?" + qs : "");
  };

  // Pixel direto (domínio do Felipe): Lead uma vez, com event_id
  if (window.fbq) fbq("track", "Lead", { content_name: "Black Vitalícia 2026" }, { eventID: lead.event_id });
  // GTM (c.docis.com.br): evento único do cadastro; redireciona quando as tags terminarem
  if (window.dataLayer && window.google_tag_manager) {
    window.dataLayer.push({
      event: "lead_black2026", event_id: lead.event_id, variante_ab: VARIANTE, variante_headline: window.HEADLINE,
      pais: lead.pais, utm_source: lead.utm_source, utm_campaign: lead.utm_campaign,
      eventCallback: irParaObrigado, eventTimeout: 2000
    });
    setTimeout(irParaObrigado, 2500); // segurança caso o GTM não responda
  } else {
    setTimeout(irParaObrigado, 400);
  }
});
