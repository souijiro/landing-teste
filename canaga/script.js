// Configuração do Supabase (chave pública: só permite inserir leads, não ler)
const SUPABASE_URL = "https://dhpfoynxsspaovtdbwmq.supabase.co";
const SUPABASE_KEY = "sb_publishable_9jMmrFBHVzXufxLwGgUO_A_47HsuLx3";
const TABELA = "leads_lancamento";

const DATA_LANCAMENTO = new Date("2026-10-08T19:00:00-03:00");
const UTM_CAMPOS = ["utm_campaign", "utm_source", "utm_medium", "utm_content", "utm_term", "utm_lp"];

// ---------- UTMs ----------
// Guarda as UTMs da primeira visita na sessão, para não perder se a pessoa navegar pela página.
function capturarUtms() {
  const params = new URLSearchParams(window.location.search);
  let salvas = {};
  try { salvas = JSON.parse(sessionStorage.getItem("canaga_utms") || "{}"); } catch (e) {}

  const utms = {};
  UTM_CAMPOS.forEach((campo) => {
    utms[campo] = params.get(campo) || salvas[campo] || null;
  });
  // utm_lp: se não vier na URL, registra qual landing page gerou o lead
  if (!utms.utm_lp) utms.utm_lp = (window.location.origin + window.location.pathname).replace(/\/+$/, "");

  try { sessionStorage.setItem("canaga_utms", JSON.stringify(utms)); } catch (e) {}
  return utms;
}
const UTMS = capturarUtms();

// ---------- Contador ----------
function atualizarContador() {
  const el = document.getElementById("contador");
  const diff = DATA_LANCAMENTO - new Date();
  if (diff <= 0) {
    el.innerHTML = '<p class="contador__aovivo">É hoje! O lançamento já começou.</p>';
    return false;
  }
  const s = Math.floor(diff / 1000);
  const valores = {
    dias: Math.floor(s / 86400),
    horas: Math.floor((s % 86400) / 3600),
    min: Math.floor((s % 3600) / 60),
    seg: s % 60
  };
  Object.entries(valores).forEach(([u, v]) => {
    el.querySelector(`[data-u="${u}"]`).textContent = String(v).padStart(2, "0");
  });
  return true;
}
if (atualizarContador()) {
  const timer = setInterval(() => { if (!atualizarContador()) clearInterval(timer); }, 1000);
}

// ---------- Professores ----------
function escapar(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}
const FOTO_PLACEHOLDER = `
  <svg viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" fill="currentColor" opacity=".08"/>
  <circle cx="60" cy="46" r="20" fill="currentColor" opacity=".35"/>
  <path d="M22 108c4-22 20-34 38-34s34 12 38 34" fill="currentColor" opacity=".35"/></svg>`;

document.getElementById("professores").innerHTML = (window.PROFESSORES || []).map((p) => {
  const ig = (p.instagram || "").replace(/^@/, "");
  return `
  <article class="professor">
    <div class="professor__topo">
      <div class="professor__foto">
        ${p.foto ? `<img src="${escapar(p.foto)}" alt="${escapar(p.nome)}" loading="lazy" width="400" height="400">` : FOTO_PLACEHOLDER}
      </div>
      <div>
        <p class="professor__nome">${escapar(p.nome)}</p>
        ${ig ? `<a class="professor__ig" href="https://www.instagram.com/${encodeURIComponent(ig)}/" target="_blank" rel="noopener">@${escapar(ig)}</a>` : ""}
      </div>
    </div>
    <p class="professor__rotulo">Curso sorteado</p>
    <h3 class="professor__curso">${escapar(p.curso)}</h3>
    <p class="professor__desc">${escapar(p.descricao)}</p>
  </article>`;
}).join("");

// ---------- Máscara de telefone ----------
const inputTel = document.querySelector('input[name="telefone"]');
inputTel.addEventListener("input", () => {
  const d = inputTel.value.replace(/\D/g, "").slice(0, 11);
  let v = d;
  if (d.length > 2) v = `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length > 7) v = `(${d.slice(0, 2)}) ${d.slice(2, d.length - 4)}-${d.slice(-4)}`;
  inputTel.value = v;
});

// ---------- Envio do formulário ----------
const form = document.querySelector(".form-lead");
const msg = form.querySelector(".form-lead__msg");
const botao = form.querySelector("button");

function mostrarMsg(texto, tipo) {
  msg.textContent = texto;
  msg.className = `form-lead__msg form-lead__msg--${tipo}`;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const nomeCompleto = form.nome.value.trim().replace(/\s+/g, " ");
  const email = form.email.value.trim().toLowerCase();
  const telDigitos = form.telefone.value.replace(/\D/g, "");

  if (nomeCompleto.length < 2) return mostrarMsg("Por favor, informe seu nome.", "erro");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return mostrarMsg("Confira seu e-mail.", "erro");
  if (telDigitos.length < 10) return mostrarMsg("Informe seu telefone com DDD.", "erro");

  const [nome, ...resto] = nomeCompleto.split(" ");
  const lead = {
    nome,
    sobrenome: resto.join(" ") || null,
    email,
    telefone: form.telefone.value,
    ...UTMS
  };

  botao.disabled = true;
  botao.textContent = "ENVIANDO...";
  mostrarMsg("", "ok");

  try {
    const resp = await fetch(`${SUPABASE_URL}/rest/v1/${TABELA}`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(lead)
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}: ${await resp.text()}`);

    form.innerHTML = `
      <div class="form-lead__sucesso">
        <p class="form-lead__sucesso-titulo">Inscrição confirmada, ${escapar(nome)}!</p>
        <p>Te esperamos no dia <strong>8 de outubro, às 19h</strong>. Fique de olho no seu e-mail e WhatsApp: vamos enviar o link da live por lá.</p>
      </div>`;
  } catch (err) {
    console.error(err);
    mostrarMsg("Não conseguimos registrar sua inscrição. Tente novamente em instantes.", "erro");
    botao.disabled = false;
    botao.textContent = "QUERO PARTICIPAR DO LANÇAMENTO";
  }
});
