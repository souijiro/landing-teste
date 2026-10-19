import ptBR from "https://cdn.jsdelivr.net/npm/intl-tel-input@25.3.1/build/js/i18n/pt/index.js";

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

// ---------- Teste A/B 1: formulário com e-mail x sem e-mail ----------
// A versão muda a cada HORA CHEIA (mesma janela dos dados da Meta), a partir de AB_INICIO.
// 1ª hora sem e-mail, depois com, e a ordem inverte a cada dia. Antes do início: com e-mail.
// A versão vale pela hora em que a página abriu. ?ab=com_email ou ?ab=sem_email força a versão e NÃO conta visita.
const AB_VARIANTES = ["com_email", "sem_email"];
const AB_INICIO = Date.parse("2026-10-19T16:00:00Z"); // 13:00 de Brasília
const AB_FORCADA = AB_VARIANTES.includes(new URLSearchParams(location.search).get("ab")) ? new URLSearchParams(location.search).get("ab") : null;
function lerOuCriar(chave, criar) {
  try { let v = localStorage.getItem(chave); if (!v) { v = criar(); localStorage.setItem(chave, v); } return v; } catch (e) { return criar(); }
}
const VISITANTE = lerOuCriar("black2026_visitante", uuid);
function versaoAB(ms) {
  const h = Math.floor((ms - AB_INICIO) / 3600000);
  if (h < 0) return "com_email";
  return (h + Math.floor(h / 24)) % 2 === 0 ? "sem_email" : "com_email";
}
const VARIANTE = AB_FORCADA || versaoAB(Date.now());
const SEM_EMAIL = VARIANTE === "sem_email";
if (SEM_EMAIL) {
  const campoEmail = document.getElementById("email").closest(".campo");
  campoEmail.hidden = true;
  document.getElementById("email").required = false;
}
function registrar(evento) {
  if (AB_FORCADA) return;
  try {
    fetch(`${SUPABASE_URL}/rest/v1/visitas_black2026`, {
      method: "POST", keepalive: true,
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ visitante: VISITANTE, variante: VARIANTE, evento, host: location.hostname.slice(0, 100),
        utm_source: UTMS.utm_source, utm_medium: UTMS.utm_medium, utm_campaign: UTMS.utm_campaign, utm_content: UTMS.utm_content, utm_term: UTMS.utm_term })
    }).catch(() => {});
  } catch (e) {}
}
registrar("visita");
let popupRegistrado = false;

// ---------- Telefone com DDI ----------
const telInput = document.getElementById("telefone");
const iti = window.intlTelInput(telInput, {
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
  const okTel = marcar(telInput, iti.isValidNumber());
  if (!okNome || !okEmail || !okTel) {
    form.querySelector(".campo.erro input").focus();
    return;
  }

  const lead = {
    nome,
    email: SEM_EMAIL ? null : email,
    telefone: iti.getNumber(), // E.164, ex: +5511999999999
    pais: iti.getSelectedCountryData().iso2 || null,
    ...UTMS,
    pagina_origem: PAGINA_ORIGEM,
    // mesmo ID no banco, no pixel e no GTM: a Meta descarta Leads repetidos com o mesmo event_id
    event_id: uuid(),
    variante_ab: VARIANTE
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
      event: "lead_black2026", event_id: lead.event_id, variante_ab: VARIANTE,
      pais: lead.pais, utm_source: lead.utm_source, utm_campaign: lead.utm_campaign,
      eventCallback: irParaObrigado, eventTimeout: 2000
    });
    setTimeout(irParaObrigado, 2500); // segurança caso o GTM não responda
  } else {
    setTimeout(irParaObrigado, 400);
  }
});
