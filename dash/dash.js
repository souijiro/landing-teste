// Dash Black Vitalícia 2026 — lê leads_black2026 via RPC protegida por senha (token em cookie)
const SUPABASE_URL = "https://eoqyoeohbcpdjxghfwua.supabase.co";
const SUPABASE_KEY = "sb_publishable_cv-1jB60ZGb1hJHYQi0qPA_LwF9DS98";
const PAINEL = "black2026";
const COOKIE = "dash_black2026";
const META = 10000;
const FIM_CAPTACAO = "2026-11-05"; // dia do evento (5/11 às 19h)
const TZ = "America/Sao_Paulo";
const ATUALIZAR_A_CADA = 60 * 1000;

// Classificação de origem (mesma lógica da planilha: campanha *_trafego / fontes pagas = Tráfego)
const FONTES_PAGAS = ["facebook", "fb", "meta", "google", "gads", "youtube", "tiktok", "ig_ads", "facebook_ads"];
const MEIOS_PAGOS = ["cpc", "paid", "pago", "ads", "trafego", "tráfego", "paid_social"];
const TIPOS = ["Tráfego", "Orgânico", "Sem UTM"];
const COR = { "Tráfego": "#2a78d6", "Orgânico": "#eb6834", "Sem UTM": "#1baf7a" };
const TAG = { "Tráfego": "trafego", "Orgânico": "organico", "Sem UTM": "semutm" };
const PERFIS = { aluno_docis: "Aluno Docis", aluno_felipe_russo: "Aluno Felipe Russo", ambos: "Ambos", nenhum: "Nenhum" };

const $ = (s) => document.querySelector(s);
const fmt = (n) => Math.round(n).toLocaleString("pt-BR");
const pct = (a, b) => (b ? (a / b * 100) : 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const diaSP = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const horaSP = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const dataBR = (iso) => iso.slice(8, 10) + "/" + iso.slice(5, 7);
function somaDias(iso, n) { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function difDias(a, b) { return Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 86400000); }

// ---------- Cookie / login ----------
function lerToken() { const m = document.cookie.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]+)")); return m ? decodeURIComponent(m[1]) : null; }
function salvarToken(t) { document.cookie = `${COOKIE}=${encodeURIComponent(t)}; max-age=${90 * 86400}; path=/dash; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; }
function apagarToken() { document.cookie = `${COOKIE}=; max-age=0; path=/dash`; }

async function rpc(nome, corpo) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(corpo)
  });
  const dados = await r.json().catch(() => null);
  if (!r.ok) { const e = new Error(dados?.message || "erro"); e.code = dados?.code; throw e; }
  return dados;
}

function mostrarLogin() { $("#app").hidden = true; $("#login").hidden = false; $("#senha").focus(); }
function mostrarApp() { $("#login").hidden = true; $("#app").hidden = false; }

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#login-erro").hidden = true;
  $("#login-btn").disabled = true;
  try {
    const token = await rpc("dash_login", { p_painel: PAINEL, p_senha: $("#senha").value });
    if (!token) { $("#login-erro").hidden = false; return; }
    salvarToken(token);
    $("#senha").value = "";
    mostrarApp();
    carregar();
  } catch (err) {
    $("#login-erro").textContent = "Não foi possível entrar. Tente de novo.";
    $("#login-erro").hidden = false;
  } finally { $("#login-btn").disabled = false; }
});
$("#sair").addEventListener("click", () => { apagarToken(); location.reload(); });

// ---------- Dados ----------
let LEADS = [];      // todos os cadastros
let UNICOS = [];     // primeiro cadastro de cada e-mail
let timer = null;

function tipoOrigem(l) {
  const c = (l.utm_campaign || "").toLowerCase(), s = (l.utm_source || "").toLowerCase(), m = (l.utm_medium || "").toLowerCase();
  if (!c && !s && !m) return "Sem UTM";
  if (c.includes("traf") || c.includes("pago") || FONTES_PAGAS.includes(s) || MEIOS_PAGOS.includes(m)) return "Tráfego";
  return "Orgânico";
}

function preparar(linhas) {
  LEADS = linhas.map((r) => {
    const l = { id: r[0], criado_em: r[1], nome: r[2], email: (r[3] || "").toLowerCase(), telefone: r[4], pais: (r[5] || "").toUpperCase(),
      utm_source: r[6], utm_medium: r[7], utm_campaign: r[8], utm_content: r[9], utm_term: r[10], pagina_origem: r[11], perfil: r[12] };
    l.dia = diaSP.format(new Date(l.criado_em));
    l.tipo = tipoOrigem(l);
    return l;
  }).sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  // únicos por e-mail (vale o primeiro cadastro)
  const vistos = new Set();
  UNICOS = [...LEADS].sort((a, b) => a.criado_em.localeCompare(b.criado_em)).filter((l) => {
    if (vistos.has(l.email)) return false; vistos.add(l.email); return true;
  });
  const idsUnicos = new Set(UNICOS.map((l) => l.id));
  LEADS.forEach((l) => { l.unico = idsUnicos.has(l.id); });
}

async function carregar() {
  const token = lerToken();
  if (!token) return mostrarLogin();
  $("#recarregar").disabled = true;
  try {
    const linhas = await rpc("dash_leads_black2026", { p_token: token });
    preparar(linhas || []);
    renderPainel();
    montarFiltros();
    renderLeads();
    $("#atualizado").textContent = "Atualizado " + horaSP.format(new Date()) + " · atualiza sozinho a cada 1 min";
  } catch (err) {
    if (err.code === "28000") { apagarToken(); return mostrarLogin(); }
    $("#atualizado").textContent = "Falha ao atualizar — tentando de novo em 1 min";
  } finally {
    $("#recarregar").disabled = false;
    clearTimeout(timer);
    timer = setTimeout(carregar, ATUALIZAR_A_CADA);
  }
}
$("#recarregar").addEventListener("click", carregar);

// ---------- Abas ----------
document.querySelectorAll(".aba").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll(".aba").forEach((x) => { x.classList.toggle("ativa", x === b); x.setAttribute("aria-selected", x === b); });
  $("#aba-painel").hidden = b.dataset.aba !== "painel";
  $("#aba-leads").hidden = b.dataset.aba !== "leads";
  try { localStorage.setItem("dash_aba", b.dataset.aba); } catch (e) {}
}));
try { const a = localStorage.getItem("dash_aba"); if (a) document.querySelector(`.aba[data-aba="${a}"]`)?.click(); } catch (e) {}

// ---------- Aba Dashboard ----------
let gDia = null, gAcum = null;

function serieDias() {
  const hoje = diaSP.format(new Date());
  const inicio = UNICOS.length ? UNICOS[0].dia : hoje;
  const dias = [];
  for (let d = inicio; d <= hoje; d = somaDias(d, 1)) dias.push(d);
  const porDia = Object.fromEntries(dias.map((d) => [d, { "Tráfego": 0, "Orgânico": 0, "Sem UTM": 0 }]));
  UNICOS.forEach((l) => { if (porDia[l.dia]) porDia[l.dia][l.tipo]++; });
  return { dias, porDia, hoje };
}

function renderPainel() {
  const n = UNICOS.length;
  const { dias, porDia, hoje } = serieDias();
  const tot = (d) => (porDia[d] ? TIPOS.reduce((s, t) => s + porDia[d][t], 0) : 0);
  const ontem = somaDias(hoje, -1);

  $("#k-unicos").textContent = fmt(n);
  $("#k-pct").textContent = pct(n, META);
  $("#k-faltam").textContent = fmt(Math.max(0, META - n));
  $("#barra-fill").style.width = Math.min(100, n / META * 100) + "%";
  $("#barra").setAttribute("aria-valuenow", Math.round(n / META * 100));

  $("#k-hoje").textContent = fmt(tot(hoje));
  $("#k-hoje-sub").textContent = TIPOS.map((t) => `${t}: ${fmt(porDia[hoje]?.[t] || 0)}`).join(" · ");
  $("#k-ontem").textContent = fmt(tot(ontem));

  const ult7 = dias.slice(-7);
  const media7 = ult7.length ? ult7.reduce((s, d) => s + tot(d), 0) / ult7.length : 0;
  $("#k-media").textContent = fmt(media7);

  // dias restantes contando hoje até o dia do evento
  const restantes = Math.max(0, difDias(hoje, FIM_CAPTACAO) + 1);
  const faltam = Math.max(0, META - n);
  $("#k-ritmo").textContent = restantes ? fmt(Math.ceil(faltam / restantes)) : "—";
  $("#k-ritmo-sub").textContent = restantes ? `${restantes} dia${restantes > 1 ? "s" : ""} até 5/11` : "captação encerrada";
  // projeção: dias seguintes na média de 7 dias + o que falta para hoje chegar na média
  const proj = restantes ? n + media7 * (restantes - 1) + Math.max(0, media7 - tot(hoje)) : n;
  $("#k-proj").textContent = fmt(proj);
  $("#k-proj-sub").textContent = `${pct(proj, META)} da meta no ritmo dos últimos 7 dias`;

  $("#k-total").textContent = fmt(LEADS.length);
  $("#k-dup").textContent = `${fmt(LEADS.length - n)} cadastros repetidos (mesmo e-mail)`;

  // gráfico por dia (barras empilhadas)
  $("#legenda-dia").innerHTML = TIPOS.map((t) => `<span><i style="background:${COR[t]}"></i>${t}</span>`).join("");
  const labels = dias.map(dataBR);
  const dsDia = TIPOS.map((t) => ({
    label: t, data: dias.map((d) => porDia[d][t]), backgroundColor: COR[t],
    borderColor: "#fff", borderWidth: { top: 2 }, borderRadius: 4, borderSkipped: "bottom", maxBarThickness: 36, stack: "s"
  }));
  if (gDia) { gDia.data.labels = labels; gDia.data.datasets.forEach((ds, i) => { ds.data = dsDia[i].data; }); gDia.update(); }
  else gDia = new Chart($("#g-dia"), { type: "bar", data: { labels, datasets: dsDia }, options: opcoesGrafico({ stacked: true }) });

  // acumulado × meta
  let ac = 0;
  const acum = dias.map((d) => (ac += tot(d)));
  const dsAc = [
    { label: "Leads únicos acumulados", data: acum, borderColor: "#0b0b0b", backgroundColor: "rgba(11,11,11,.06)", fill: true, borderWidth: 2, pointRadius: 0, pointHoverRadius: 5, tension: .25 },
    { label: "Meta 10.000", data: dias.map(() => META), borderColor: "#c9a800", borderDash: [6, 5], borderWidth: 2, pointRadius: 0, pointHoverRadius: 0 }
  ];
  if (gAcum) { gAcum.data.labels = labels; gAcum.data.datasets[0].data = acum; gAcum.data.datasets[1].data = dsAc[1].data; gAcum.update(); }
  else gAcum = new Chart($("#g-acum"), { type: "line", data: { labels, datasets: dsAc }, options: opcoesGrafico({ legenda: true, max: META * 1.05 }) });

  // tabela por dia (mais recente em cima)
  ac = 0;
  const linhas = dias.map((d) => { ac += tot(d); return { d, ac }; }).reverse();
  $("#t-dia tbody").innerHTML = linhas.map(({ d, ac }) => `<tr>
      <td>${dataBR(d)}${d === hoje ? " · hoje" : ""}</td>
      ${TIPOS.map((t) => `<td class="n">${fmt(porDia[d][t])}</td>`).join("")}
      <td class="n"><strong>${fmt(tot(d))}</strong></td>
      <td class="n">${pct(tot(d), META)}</td>
      <td class="n">${fmt(ac)}</td></tr>`).join("")
    + `<tr class="total"><td>Total</td>${TIPOS.map((t) => `<td class="n">${fmt(UNICOS.filter((l) => l.tipo === t).length)}</td>`).join("")}<td class="n">${fmt(n)}</td><td class="n">${pct(n, META)}</td><td class="n"></td></tr>`;

  // quebras
  const quebras = [
    ["Por origem", (l) => l.tipo],
    ["Por campanha (utm_campaign)", (l) => l.utm_campaign],
    ["Por fonte (utm_source)", (l) => l.utm_source],
    ["Por meio (utm_medium)", (l) => l.utm_medium],
    ["Por expert / conteúdo (utm_content)", (l) => l.utm_content],
    ["Por anúncio (utm_term)", (l) => l.utm_term],
    ["Por perfil", (l) => (l.perfil ? PERFIS[l.perfil] || l.perfil : "A definir")],
    ["Por país", (l) => l.pais],
    ["Por domínio da página", (l) => { try { return new URL(l.pagina_origem).hostname; } catch (e) { return ""; } }],
    ["Por hora do dia", (l) => new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit" }).format(new Date(l.criado_em)) + "h", true]
  ];
  $("#quebras").innerHTML = quebras.map(([titulo, fn, ordemNatural], i) => {
    const cont = {};
    UNICOS.forEach((l) => { const k = fn(l) || "(vazio)"; cont[k] = (cont[k] || 0) + 1; });
    let itens = Object.entries(cont);
    itens.sort(ordemNatural ? (a, b) => a[0].localeCompare(b[0]) : (a, b) => b[1] - a[1]);
    const max = Math.max(1, ...itens.map((x) => x[1]));
    const lis = itens.map(([k, v], j) => `<li${j >= 8 && !ordemNatural ? ' data-extra hidden' : ""}><span class="nome" title="${esc(k)}">${esc(k)}</span><span class="num">${fmt(v)}</span><span class="pct">${pct(v, n)}</span><span class="trilho"><b style="width:${v / max * 100}%"></b></span></li>`).join("");
    const extra = !ordemNatural && itens.length > 8 ? `<button class="quebra-mais" data-q="${i}">Ver todos (${itens.length})</button>` : "";
    return `<div class="cartao"><div class="cartao__topo"><h2>${titulo}</h2></div><ul class="quebra">${lis || '<li class="vazio">Sem dados ainda</li>'}</ul>${extra}</div>`;
  }).join("");
  document.querySelectorAll(".quebra-mais").forEach((b) => b.addEventListener("click", () => {
    b.previousElementSibling.querySelectorAll("[data-extra]").forEach((li) => { li.hidden = false; });
    b.remove();
  }));
}

function opcoesGrafico({ stacked = false, legenda = false, max } = {}) {
  return {
    responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: legenda, position: "top", align: "end", labels: { boxWidth: 10, boxHeight: 10, color: "#57534e", font: { family: "Montserrat", size: 11 } } },
      tooltip: {
        backgroundColor: "#0b0b0b", titleFont: { family: "Montserrat", weight: "700" }, bodyFont: { family: "Montserrat" }, padding: 10,
        callbacks: {
          label: (c) => ` ${c.dataset.label}: ${fmt(c.parsed.y)}`,
          footer: stacked ? (items) => "Total: " + fmt(items.reduce((s, i) => s + i.parsed.y, 0)) : undefined
        }
      }
    },
    scales: {
      x: { stacked, grid: { display: false }, ticks: { color: "#8a857f", font: { family: "Montserrat", size: 11 }, maxRotation: 0, autoSkip: true } },
      y: { stacked, beginAtZero: true, suggestedMax: max, grid: { color: "#f1ece6" }, border: { display: false }, ticks: { color: "#8a857f", font: { family: "Montserrat", size: 11 }, precision: 0, callback: (v) => fmt(v) } }
    }
  };
}

// ---------- Aba Leads ----------
const FILTROS = [
  ["tipo", "Tipo"], ["utm_campaign", "Campanha"], ["utm_source", "Fonte"], ["utm_medium", "Meio"],
  ["utm_content", "Conteúdo"], ["utm_term", "Termo"], ["perfil", "Perfil"], ["pais", "País"]
];
const POR_PAGINA = 100;
let pagina = 1;

function montarFiltros() {
  const wrap = $("#f-selects");
  const atuais = Object.fromEntries([...wrap.querySelectorAll("select")].map((s) => [s.dataset.campo, s.value]));
  wrap.innerHTML = FILTROS.map(([campo, nome]) => {
    const vals = [...new Set(LEADS.map((l) => l[campo] || ""))].sort((a, b) => a.localeCompare(b));
    const opts = vals.map((v) => `<option value="${esc(v)}">${esc(campo === "perfil" ? (PERFIS[v] || (v ? v : "(a definir)")) : (v || "(vazio)"))}</option>`).join("");
    return `<select data-campo="${campo}" aria-label="${nome}"><option value="__todos">${nome}: todos</option>${opts}</select>`;
  }).join("");
  wrap.querySelectorAll("select").forEach((s) => {
    if (atuais[s.dataset.campo] !== undefined && [...s.options].some((o) => o.value === atuais[s.dataset.campo])) s.value = atuais[s.dataset.campo];
    s.addEventListener("change", () => { pagina = 1; renderLeads(); });
  });
}

function filtrados() {
  const busca = $("#f-busca").value.trim().toLowerCase();
  const buscaNum = busca.replace(/\D/g, "");
  const de = $("#f-de").value, ate = $("#f-ate").value;
  const sel = [...document.querySelectorAll("#f-selects select")].filter((s) => s.value !== "__todos").map((s) => [s.dataset.campo, s.value]);
  return LEADS.filter((l) =>
    (!$("#f-unicos").checked || l.unico) &&
    (!de || l.dia >= de) && (!ate || l.dia <= ate) &&
    sel.every(([c, v]) => (l[c] || "") === v) &&
    (!busca || (l.nome || "").toLowerCase().includes(busca) || l.email.includes(busca) || (buscaNum.length >= 3 && (l.telefone || "").includes(buscaNum)))
  );
}

function renderLeads() {
  const lista = filtrados();
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  pagina = Math.min(pagina, paginas);
  const fatia = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  $("#f-contagem").textContent = `${fmt(lista.length)} lead${lista.length === 1 ? "" : "s"}`;
  $("#t-leads tbody").innerHTML = fatia.map((l) => `<tr>
    <td>${horaSP.format(new Date(l.criado_em))}</td>
    <td title="${esc(l.nome)}">${esc(l.nome)}</td>
    <td title="${esc(l.email)}">${esc(l.email)}</td>
    <td><a href="https://wa.me/${esc((l.telefone || "").replace(/\D/g, ""))}" target="_blank" rel="noopener">${esc(l.telefone)}</a></td>
    <td>${esc(l.pais)}</td>
    <td><span class="tag tag--${TAG[l.tipo]}">${l.tipo}</span></td>
    <td>${esc(l.utm_campaign)}</td><td>${esc(l.utm_source)}</td><td>${esc(l.utm_medium)}</td><td>${esc(l.utm_content)}</td><td>${esc(l.utm_term)}</td>
    <td>${esc(l.perfil ? PERFIS[l.perfil] || l.perfil : "")}</td></tr>`).join("") || `<tr><td colspan="12" style="color:#8a857f">Nenhum lead com esses filtros.</td></tr>`;
  $("#p-info").textContent = `Página ${pagina} de ${paginas}`;
  $("#p-ant").disabled = pagina <= 1;
  $("#p-prox").disabled = pagina >= paginas;
}

["#f-busca", "#f-de", "#f-ate", "#f-unicos"].forEach((s) => $(s).addEventListener("input", () => { pagina = 1; renderLeads(); }));
$("#p-ant").addEventListener("click", () => { pagina--; renderLeads(); });
$("#p-prox").addEventListener("click", () => { pagina++; renderLeads(); });
$("#f-limpar").addEventListener("click", () => {
  $("#f-busca").value = ""; $("#f-de").value = ""; $("#f-ate").value = ""; $("#f-unicos").checked = true;
  document.querySelectorAll("#f-selects select").forEach((s) => { s.value = "__todos"; });
  pagina = 1; renderLeads();
});
$("#f-csv").addEventListener("click", () => {
  const cab = ["data_hora", "nome", "email", "telefone", "pais", "tipo", "utm_campaign", "utm_source", "utm_medium", "utm_content", "utm_term", "perfil", "pagina_origem"];
  const cel = (v) => { const s = String(v ?? ""); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const linhas = filtrados().map((l) => [horaSP.format(new Date(l.criado_em)), l.nome, l.email, l.telefone, l.pais, l.tipo, l.utm_campaign, l.utm_source, l.utm_medium, l.utm_content, l.utm_term, l.perfil ? PERFIS[l.perfil] || l.perfil : "", l.pagina_origem].map(cel).join(";"));
  const blob = new Blob(["﻿" + [cab.join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leads-black2026-${diaSP.format(new Date())}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// ---------- Dica de instalação no iPhone ----------
(function () {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instalado = window.navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;
  let dispensado = false;
  try { dispensado = localStorage.getItem("dash_instalar_ok") === "1"; } catch (e) {}
  if (ios && !instalado && !dispensado) $("#instalar").hidden = false;
  $("#instalar-fechar").addEventListener("click", () => {
    $("#instalar").hidden = true;
    try { localStorage.setItem("dash_instalar_ok", "1"); } catch (e) {}
  });
})();

// ---------- Início ----------
if (lerToken()) { mostrarApp(); carregar(); } else mostrarLogin();
document.addEventListener("visibilitychange", () => { if (!document.hidden && lerToken()) carregar(); });
