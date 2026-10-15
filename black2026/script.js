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
  if (window.dataLayer) window.dataLayer.push({ event: "abriu_popup_black2026" });
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
  const okEmail = marcar(emailEl, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
  const okTel = marcar(telInput, iti.isValidNumber());
  if (!okNome || !okEmail || !okTel) {
    form.querySelector(".campo.erro input").focus();
    return;
  }

  const lead = {
    nome,
    email,
    telefone: iti.getNumber(), // E.164, ex: +5511999999999
    pais: iti.getSelectedCountryData().iso2 || null,
    ...UTMS,
    pagina_origem: PAGINA_ORIGEM
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
      salvo = r.ok;
    } catch (err) { /* tenta de novo */ }
  }

  if (!salvo) {
    btn.disabled = false;
    btn.textContent = "Finalizar cadastro";
    falha.style.display = "block";
    return;
  }

  // Pixel: Lead
  if (window.fbq) fbq("track", "Lead", { content_name: "Black Vitalícia 2026" });
  // GTM (só existe no c.docis.com.br)
  if (window.dataLayer) window.dataLayer.push({ event: "lead_black2026", pais: lead.pais, utm_source: lead.utm_source, utm_campaign: lead.utm_campaign });

  // Leva as UTMs para a página de obrigado
  const qs = new URLSearchParams();
  UTM_CAMPOS.forEach((c) => { if (UTMS[c]) qs.set(c, UTMS[c]); });
  setTimeout(() => {
    location.href = PAGINA_OBRIGADO + (qs.toString() ? "?" + qs : "");
  }, 350);
});
