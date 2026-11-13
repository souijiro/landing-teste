// Painel do Diagnóstico do Delivery (c.docis.com.br/daz/painel).
// Login = dash_login painel 'diagdelivery' (token de 90 dias em cookie). Dados só pelas RPCs dash_diag_*.
const SUPABASE_URL = "https://eoqyoeohbcpdjxghfwua.supabase.co";
const SUPABASE_KEY = "sb_publishable_cv-1jB60ZGb1hJHYQi0qPA_LwF9DS98";
const PAINEL = "diagdelivery";
const COOKIE = "dash_diagdelivery";
const TZ = "America/Sao_Paulo";

const STATUS = {
  novo:        { t: "Novo",           cor: "#8a8172" },
  contatado:   { t: "Em contato",     cor: "#2563eb" },
  agendado:    { t: "Agendado",       cor: "#7c3aed" },
  realizado:   { t: "Reunião feita",  cor: "#f08a24" },
  fechado:     { t: "Fechou",         cor: "#1f9d55" },
  perdido:     { t: "Não fechou",     cor: "#ef3b24" },
  desqualificado: { t: "Fora do perfil", cor: "#4b4338" }
};
const PAG = { pendente: "Pendente", parcial: "Parcial", pago: "Pago", reembolsado: "Reembolsado" };
const PAG_COR = { pendente: "#f08a24", parcial: "#2563eb", pago: "#1f9d55", reembolsado: "#ef3b24" };
const FORMAS = { "": "—", pix: "Pix", cartao: "Cartão", boleto: "Boleto", hotmart: "Hotmart", transferencia: "Transferência", outro: "Outro" };
const FAT = { "0": "Ainda não vendi", ate_2k: "Até R$ 2 mil", "2k_5k": "R$ 2–5 mil", "5k_10k": "R$ 5–10 mil", "10k_30k": "R$ 10–30 mil", "30k_50k": "R$ 30–50 mil", "50k_mais": "Acima de R$ 50 mil" };
const MOM = { segunda_renda: "Segunda renda", vivo_do_delivery: "Vive do delivery", iniciando: "Iniciando" };
const APPS = { ifood: ["iF", "#ea1d2c", "iFood"], "99food": ["99", "#e0a100", "99Food"], keeta: ["K", "#d9ad00", "Keeta"], nenhum: ["—", "#b9ae9c", "Nenhum"] };

const $ = (s) => document.querySelector(s);
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const brl = (n) => (+n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brl0 = (n) => (+n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const pct = (a, b) => (b ? Math.round(a / b * 100) + "%" : "—");
const _dt = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const _dia = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const _sem = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "short" });
const quando = (iso) => (iso ? _dt.format(new Date(iso)) : "—");
const diaSP = (d) => _dia.format(new Date(d));
const telFmt = (t) => { let d = String(t || "").replace(/\D/g, ""); if (d.startsWith("55") && d.length >= 12) d = d.slice(2); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : t || "—"; };
const waUrl = (t, nome) => { const d = String(t || "").replace(/\D/g, ""); const msg = `Oi, ${String(nome || "").split(" ")[0]}! Aqui é da equipe Docis, sobre o seu Diagnóstico do Delivery.`; return `https://wa.me/${d}?text=${encodeURIComponent(msg)}`; };
const num = (s) => { if (s == null || s === "") return null; const n = +String(s).replace(/[^\d,.-]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", "."); return isFinite(n) ? n : null; };
const numBR = (n) => (n == null ? "" : (+n).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
// datetime-local <-> ISO no fuso de SP
function isoParaLocal(iso) {
  if (!iso) return "";
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(iso)).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
}
const localParaIso = (v) => (v ? v + ":00-03:00" : null); // São Paulo sem horário de verão

// ---------- login ----------
function lerToken() { const m = document.cookie.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]+)")); return m ? decodeURIComponent(m[1]) : null; }
function salvarToken(t) { document.cookie = `${COOKIE}=${encodeURIComponent(t)}; max-age=${90 * 86400}; path=/daz/painel; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; }
function apagarToken() { document.cookie = `${COOKIE}=; max-age=0; path=/daz/painel`; }
async function rpc(nome, corpo) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, { method: "POST", headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" }, body: JSON.stringify(corpo) });
  const dados = await r.json().catch(() => null);
  if (!r.ok) { const e = new Error(dados?.message || "erro"); e.code = dados?.code; throw e; }
  return dados;
}
const comToken = (nome, corpo = {}) => rpc(nome, { p_token: lerToken(), ...corpo });
function mostrarLogin() { $("#app").hidden = true; $("#login").hidden = false; $("#senha").focus(); }
function mostrarApp() { $("#login").hidden = true; $("#app").hidden = false; }
$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault(); $("#login-erro").hidden = true; $("#login-btn").disabled = true;
  try {
    const token = await rpc("dash_login", { p_painel: PAINEL, p_senha: $("#senha").value });
    if (!token) { $("#login-erro").textContent = "Senha incorreta."; $("#login-erro").hidden = false; return; }
    salvarToken(token); $("#senha").value = ""; mostrarApp(); carregar();
  } catch { $("#login-erro").textContent = "Não foi possível entrar. Tente de novo."; $("#login-erro").hidden = false; }
  finally { $("#login-btn").disabled = false; }
});
$("#sair").addEventListener("click", () => { apagarToken(); location.reload(); });

// ---------- dados ----------
let L = [], FILTRO_ETAPA = "", ABERTO = null;

async function carregar() {
  try {
    const d = await comToken("dash_diag_delivery");
    L = d || [];
    $("#atualizado").textContent = "Atualizado " + quando(new Date().toISOString());
    render();
  } catch (e) {
    if (e.code === "28000" || /token/i.test(e.message)) { apagarToken(); mostrarLogin(); }
    else $("#atualizado").textContent = "Erro ao carregar — " + e.message;
  }
}

function noPeriodo(l) {
  const p = $("#periodo").value; if (p === "tudo") return true;
  const hoje = diaSP(new Date()), dia = diaSP(l.criado_em);
  if (p === "hoje") return dia === hoje;
  if (p === "mes") return dia.slice(0, 7) === hoje.slice(0, 7);
  return Date.now() - new Date(l.criado_em).getTime() <= +p * 86400e3;
}
function filtrados(semEtapa) {
  const b = $("#busca").value.trim().toLowerCase(), bd = b.replace(/\D/g, "");
  const st = $("#f-status").value || (semEtapa ? "" : FILTRO_ETAPA), pg = $("#f-pag").value, ft = $("#f-fat").value;
  return L.filter((l) => noPeriodo(l)
    && (!b || (l.nome || "").toLowerCase().includes(b) || (bd && (l.whatsapp || "").includes(bd)))
    && (!st || l.status === st) && (!pg || l.pagamento_status === pg) && (!ft || l.faturamento === ft));
}

function render() {
  const base = L.filter(noPeriodo);
  const n = base.length;
  const cont = (s) => base.filter((l) => l.status === s).length;
  // agendou = tem data de reunião ou já passou da etapa agendado; reunião feita = realizado/fechou, ou não fechou depois de agendar
  const agendou = base.filter((l) => l.agendado_para || ["agendado", "realizado", "fechado"].includes(l.status)).length;
  const realizou = base.filter((l) => ["realizado", "fechado"].includes(l.status) || (l.status === "perdido" && l.agendado_para)).length;
  const fech = base.filter((l) => l.status === "fechado");
  const vendido = fech.reduce((s, l) => s + (+l.ticket || 0), 0);
  const recebido = base.reduce((s, l) => s + (+l.valor_pago || 0), 0);
  const aReceber = fech.filter((l) => l.pagamento_status !== "reembolsado").reduce((s, l) => s + Math.max(0, (+l.ticket || 0) - (+l.valor_pago || 0)), 0);

  $("#kpis").innerHTML = [
    ["Leads", n, `${base.filter((l) => diaSP(l.criado_em) === diaSP(new Date())).length} hoje`],
    ["Agendamentos", agendou, pct(agendou, n) + " dos leads"],
    ["Reuniões feitas", realizou, pct(realizou, agendou) + " dos agendados"],
    ["Fechamentos", fech.length, pct(fech.length, realizou) + " das reuniões"],
    ["Vendido", brl0(vendido), "consultorias fechadas", true],
    ["Ticket médio", fech.length ? brl0(vendido / fech.length) : "—", `${fech.length} venda(s)`],
    ["Recebido", brl0(recebido), "pagamentos lançados"],
    ["A receber", brl0(aReceber), "fechado − recebido"]
  ].map(([t, v, s, d]) => `<div class="kpi${d ? " kpi--destaque" : ""}"><span>${t}</span><b>${v}</b><small>${s}</small></div>`).join("");

  $("#funil").innerHTML = Object.entries(STATUS).map(([k, s]) => {
    const c = cont(k);
    return `<button class="etapa${FILTRO_ETAPA === k ? " on" : ""}" data-k="${k}"><i style="background:${s.cor}"></i><span>${s.t}</span><b>${c}</b><small>${pct(c, n)}</small></button>`;
  }).join("");

  barras("#g-fat", FAT, base, (l) => [l.faturamento]);
  barras("#g-mom", MOM, base, (l) => [l.momento]);
  barras("#g-plat", Object.fromEntries(Object.entries(APPS).map(([k, a]) => [k, a[2]])), base, (l) => l.plataformas || []);

  const lista = filtrados();
  $("#vazio").hidden = lista.length > 0;
  $("#linhas").innerHTML = lista.map((l) => {
    const s = STATUS[l.status] || STATUS.novo;
    const quente = ["10k_30k", "30k_50k", "50k_mais"].includes(l.faturamento);
    return `<tr data-id="${l.id}">
      <td class="num">${quando(l.criado_em)}</td>
      <td class="nome">${esc(l.nome)}</td>
      <td><a class="wa" href="${waUrl(l.whatsapp, l.nome)}" target="_blank" rel="noopener" onclick="event.stopPropagation()">${telFmt(l.whatsapp)}</a></td>
      <td class="${quente ? "quente" : ""}">${esc(FAT[l.faturamento] || l.faturamento || "—")}</td>
      <td>${esc(MOM[l.momento] || l.momento || "—")}</td>
      <td><div class="apps">${(l.plataformas || []).map((p) => APPS[p] ? `<span class="app" title="${APPS[p][2]}" style="background:${APPS[p][1]}">${APPS[p][0]}</span>` : "").join("")}</div></td>
      <td><span class="pill" style="background:${s.cor}">${s.t}</span></td>
      <td class="num">${l.agendado_para ? quando(l.agendado_para) : "—"}</td>
      <td class="num">${l.ticket ? brl(l.ticket) : "—"}</td>
      <td>${l.status === "fechado" || l.valor_pago ? `<span class="pill" style="background:${PAG_COR[l.pagamento_status] || "#8a8172"}">${PAG[l.pagamento_status] || "Pendente"}</span>` : "—"}</td>
      <td>›</td></tr>`;
  }).join("");

  const agora = Date.now();
  const ags = L.filter((l) => l.agendado_para && ["agendado", "contatado", "novo"].includes(l.status) && new Date(l.agendado_para).getTime() > agora - 12 * 3600e3)
    .sort((a, b) => a.agendado_para.localeCompare(b.agendado_para)).slice(0, 15);
  $("#agenda").innerHTML = ags.length ? ags.map((l) => {
    const d = new Date(l.agendado_para);
    return `<div class="ag${d.getTime() < agora ? " passou" : ""}" data-id="${l.id}"><div class="quando">${quando(l.agendado_para).split(" ")[0].replace(",", "")}<small>${_sem.format(d)} ${quando(l.agendado_para).split(" ")[1] || ""}</small></div>
      <div><b>${esc(l.nome)}</b><br><span style="color:var(--mut)">${esc(FAT[l.faturamento] || "")} · ${esc(MOM[l.momento] || "")}${l.responsavel ? " · com " + esc(l.responsavel) : ""}</span></div></div>`;
  }).join("") : `<p class="vazio">Nenhuma reunião agendada.</p>`;
}

function barras(sel, nomes, base, valores) {
  const c = {}; base.forEach((l) => valores(l).forEach((v) => { if (v) c[v] = (c[v] || 0) + 1; }));
  const max = Math.max(1, ...Object.values(c));
  $(sel).innerHTML = Object.entries(nomes).map(([k, t]) => `<div class="barra-l"><span>${esc(t)}</span><div class="trilho"><i style="width:${(c[k] || 0) / max * 100}%"></i></div><em>${c[k] || 0} · ${pct(c[k] || 0, base.length)}</em></div>`).join("");
}

// ---------- filtros ----------
const opts = (sel, obj) => { $(sel).insertAdjacentHTML("beforeend", Object.entries(obj).map(([k, v]) => `<option value="${esc(k)}">${esc(typeof v === "string" ? v : v.t)}</option>`).join("")); };
opts("#f-status", STATUS); opts("#f-pag", PAG); opts("#f-fat", FAT);
["#busca", "#f-status", "#f-pag", "#f-fat", "#periodo"].forEach((s) => $(s).addEventListener("input", render));
$("#funil").addEventListener("click", (e) => { const b = e.target.closest(".etapa"); if (!b) return; FILTRO_ETAPA = FILTRO_ETAPA === b.dataset.k ? "" : b.dataset.k; $("#f-status").value = ""; render(); });
$("#linhas").addEventListener("click", (e) => { const tr = e.target.closest("tr[data-id]"); if (tr) abrir(tr.dataset.id); });
$("#agenda").addEventListener("click", (e) => { const a = e.target.closest("[data-id]"); if (a) abrir(a.dataset.id); });

// ---------- ficha ----------
const F = $("#f-form");
F.pagamento_status.innerHTML = Object.entries(PAG).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
F.pagamento_forma.innerHTML = Object.entries(FORMAS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("");
let ETAPA = "novo";
function pintarEtapas() {
  $("#f-etapas").innerHTML = Object.entries(STATUS).map(([k, s]) => `<button type="button" data-k="${k}" class="${ETAPA === k ? "on" : ""}" style="${ETAPA === k ? "background:" + s.cor : ""}">${s.t}</button>`).join("");
}
$("#f-etapas").addEventListener("click", (e) => {
  const b = e.target.closest("button"); if (!b) return; ETAPA = b.dataset.k; pintarEtapas();
  if (ETAPA === "fechado" && !F.fechado_em.value) F.fechado_em.value = diaSP(new Date());
});

function abrir(id) {
  const l = L.find((x) => x.id === id); if (!l) return; ABERTO = l;
  $("#f-nome").textContent = l.nome || "—";
  $("#f-sub").innerHTML = `<a class="wa" href="${waUrl(l.whatsapp, l.nome)}" target="_blank" rel="noopener">WhatsApp ${telFmt(l.whatsapp)}</a> · entrou ${quando(l.criado_em)}`;
  const o = l.origem || {};
  $("#f-resp").innerHTML = [
    ["Vende em", (l.plataformas || []).map((p) => APPS[p]?.[2] || p).join(", ") || "—"],
    ["Faturamento", FAT[l.faturamento] || "—"],
    ["Momento", MOM[l.momento] || "—"],
    ["Origem", [o.utm_source, o.utm_campaign, o.utm_content].filter(Boolean).join(" · ") || "direto"]
  ].map(([a, b]) => `<div><span>${a}</span><b>${esc(b)}</b></div>`).join("");
  ETAPA = l.status || "novo"; pintarEtapas();
  F.agendado_para.value = isoParaLocal(l.agendado_para);
  F.responsavel.value = l.responsavel || "";
  F.produto.value = l.produto || "";
  F.ticket.value = numBR(l.ticket);
  F.fechado_em.value = l.fechado_em || "";
  F.motivo_perda.value = l.motivo_perda || "";
  F.pagamento_status.value = l.pagamento_status || "pendente";
  F.pagamento_forma.value = l.pagamento_forma || "";
  F.valor_pago.value = numBR(l.valor_pago);
  F.parcelas.value = l.parcelas || "";
  F.obs.value = l.obs || "";
  $("#f-msg").textContent = "";
  $("#fundo").hidden = false; $("#ficha").hidden = false;
}
function fechar() { $("#fundo").hidden = true; $("#ficha").hidden = true; ABERTO = null; }
$("#fechar").addEventListener("click", fechar);
$("#fundo").addEventListener("click", fechar);
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && ABERTO) fechar(); });

F.agendado_para.addEventListener("change", () => { if (F.agendado_para.value && ["novo", "contatado"].includes(ETAPA)) { ETAPA = "agendado"; pintarEtapas(); } });
F.valor_pago.addEventListener("change", () => {
  const t = num(F.ticket.value), p = num(F.valor_pago.value);
  if (p && t) F.pagamento_status.value = p >= t ? "pago" : "parcial";
});

F.addEventListener("submit", async (e) => {
  e.preventDefault(); if (!ABERTO) return;
  const campos = {
    status: ETAPA,
    agendado_para: localParaIso(F.agendado_para.value),
    responsavel: F.responsavel.value.trim() || null,
    produto: F.produto.value.trim() || null,
    ticket: num(F.ticket.value),
    fechado_em: F.fechado_em.value || null,
    motivo_perda: F.motivo_perda.value.trim() || null,
    pagamento_status: F.pagamento_status.value,
    pagamento_forma: F.pagamento_forma.value || null,
    valor_pago: num(F.valor_pago.value),
    parcelas: F.parcelas.value ? +F.parcelas.value : null,
    obs: F.obs.value.trim() || null
  };
  $("#salvar").disabled = true; $("#f-msg").style.color = ""; $("#f-msg").textContent = "Salvando…";
  try {
    const novo = await comToken("dash_diag_delivery_salvar", { p_id: ABERTO.id, p_campos: campos });
    Object.assign(ABERTO, novo || campos);
    $("#f-msg").textContent = "Salvo ✓";
    render();
  } catch (err) { $("#f-msg").style.color = "var(--r)"; $("#f-msg").textContent = "Erro: " + err.message; }
  finally { $("#salvar").disabled = false; }
});

$("#apagar").addEventListener("click", async () => {
  if (!ABERTO || !confirm(`Apagar o lead "${ABERTO.nome}"? Isso não pode ser desfeito.`)) return;
  try { await comToken("dash_diag_delivery_apagar", { p_id: ABERTO.id }); L = L.filter((l) => l.id !== ABERTO.id); fechar(); render(); }
  catch (err) { $("#f-msg").style.color = "var(--r)"; $("#f-msg").textContent = "Erro: " + err.message; }
});

// ---------- CSV ----------
$("#csv").addEventListener("click", () => {
  const cols = [["criado_em", "Entrou"], ["nome", "Nome"], ["whatsapp", "WhatsApp"], ["plataformas", "Apps"], ["faturamento", "Faturamento"], ["momento", "Momento"], ["status", "Status"], ["agendado_para", "Agendado"], ["responsavel", "Responsável"], ["produto", "Produto"], ["ticket", "Ticket"], ["fechado_em", "Fechado em"], ["pagamento_status", "Pagamento"], ["pagamento_forma", "Forma"], ["valor_pago", "Recebido"], ["parcelas", "Parcelas"], ["motivo_perda", "Motivo perda"], ["obs", "Obs"]];
  const val = (l, k) => {
    const v = l[k];
    if (k === "plataformas") return (v || []).map((p) => APPS[p]?.[2] || p).join(" + ");
    if (k === "faturamento") return FAT[v] || v || "";
    if (k === "momento") return MOM[v] || v || "";
    if (k === "status") return STATUS[v]?.t || v || "";
    if (k === "pagamento_status") return PAG[v] || v || "";
    if (k === "criado_em" || k === "agendado_para") return v ? quando(v) : "";
    if (k === "ticket" || k === "valor_pago") return v == null ? "" : String(v).replace(".", ",");
    return v ?? "";
  };
  const linhas = [cols.map((c) => c[1])].concat(filtrados().map((l) => cols.map(([k]) => val(l, k))));
  const csv = "﻿" + linhas.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `diagnostico-delivery-${diaSP(new Date())}.csv`; a.click();
});

// ---------- início ----------
if (lerToken()) { mostrarApp(); carregar(); } else mostrarLogin();
setInterval(() => { if (lerToken() && !ABERTO && document.visibilityState === "visible") carregar(); }, 60e3);
