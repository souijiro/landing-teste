// Dash do webinário Brigadeiro de A a Z — lê tudo pela RPC dash_baw (token do login, painel 'baw').
// Semana do webinário = segunda 19h → segunda seguinte 18h59 (São Paulo). Só a cobrança 1 conta como venda.
const SUPABASE_URL = "https://eoqyoeohbcpdjxghfwua.supabase.co";
const SUPABASE_KEY = "sb_publishable_cv-1jB60ZGb1hJHYQi0qPA_LwF9DS98";
const PAINEL = "baw";
const COOKIE = "dash_baw";
const TZ = "America/Sao_Paulo";
const ATUALIZAR_A_CADA = 60 * 1000;
const FAIXA_IGUAL = 0.10;
const WEBHOOK_URL = SUPABASE_URL + "/functions/v1/baw-webhooks";

const TIPOS = {
  pendente: "Pendente (classificar)", low: "Low ticket", ob_low: "Order bump do low", principal: "Brigadeiro de A a Z (principal)",
  ob_principal: "Order bump do principal", upsell: "Upsell Delivery de A a Z", ob_upsell: "Order bump do upsell", ignorar: "Ignorar"
};
const TIPOS_ENVIO = [
  "padrao",
  "venda_low_aprovada", "venda_low_aguardando", "venda_low_cancelada", "venda_low_reembolso", "carrinho_low",
  "venda_ob_low_aprovada",
  "venda_principal_aprovada", "venda_principal_aguardando", "venda_principal_cancelada", "venda_principal_reembolso", "carrinho_principal",
  "venda_ob_principal_aprovada",
  "venda_upsell_aprovada", "venda_upsell_aguardando", "venda_upsell_cancelada", "venda_upsell_reembolso", "carrinho_upsell",
  "webinario_acessou", "webinario_pitch", "webinario_oferta", "webinario_clicou", "webinario_nao_viu_oferta", "webinario_saiu"
];

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n) => Math.round(+n || 0).toLocaleString("pt-BR");
const brl = (n) => (+n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brl0 = (n) => (+n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const pct = (a, b) => (b ? (a / b * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%" : "—");
const pctV = (x) => (isFinite(x) ? (x * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%" : "—");
const num2 = (x) => (isFinite(x) ? x.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—");
const div = (a, b) => (b ? a / b : NaN);
const _dia = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const _hora = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" });
const _quando = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const diaSP = (iso) => _dia.format(new Date(iso));
const horaSP = (iso) => +_hora.format(new Date(iso));
const quando = (iso) => (iso ? _quando.format(new Date(iso)) : "—");
function somaDias(iso, n) { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function segundaDe(dia) { const d = new Date(dia + "T12:00:00Z"); return somaDias(dia, -((d.getUTCDay() + 6) % 7)); }
// semana de um dia de custo: segunda até 19h ainda é da semana anterior, então segunda conta na semana anterior
const semanaDoDia = (dia) => segundaDe(somaDias(dia, -1));
const semanaAgora = () => segundaDe(diaSP(new Date(Date.now() - 19 * 3600e3)));
const DIAS_SEM = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const dm = (d) => d.slice(8, 10) + "/" + d.slice(5, 7);
function rotulo(k, modo = MODO) {
  if (!k) return "—";
  if (modo === "dia") return dm(k) + " " + DIAS_SEM[new Date(k + "T12:00:00Z").getUTCDay()];
  if (modo === "semana") return dm(k) + " → " + dm(somaDias(k, 7));
  return MESES[+k.slice(5, 7) - 1] + "/" + k.slice(0, 4);
}
const grupoStatus = (s) => {
  s = String(s || "").toUpperCase();
  if (["APPROVED", "COMPLETE", "COMPLETED"].includes(s)) return "aprovada";
  if (["REFUNDED", "PARTIALLY_REFUNDED", "CHARGEBACK", "PROTESTED", "DISPUTE"].includes(s)) return "reembolso";
  if (["CANCELED", "CANCELLED", "EXPIRED", "OVERDUE", "DELAYED"].includes(s)) return "cancelada";
  if (["WAITING_PAYMENT", "BILLET_PRINTED", "PRINTED_BILLET"].includes(s)) return "aguardando";
  return "outro";
};
const NOME_GRUPO = { aprovada: "Aprovada", reembolso: "Reembolso", cancelada: "Cancelada", aguardando: "Aguardando", outro: "Outro", carrinho: "Carrinho" };
const telChave = (t) => { let d = String(t || "").replace(/\D/g, ""); if (d.length >= 12 && d.startsWith("55")) d = d.slice(2); return d.length >= 10 ? d.slice(0, 2) + d.slice(-8) : d || null; };
const pessoa = (o) => (o.email ? String(o.email).toLowerCase() : o.tel ? "tel:" + telChave(o.tel) : null);
const waLink = (t) => { const d = String(t || "").replace(/\D/g, ""); return d ? `<a href="https://wa.me/${d.length <= 11 ? "55" + d : d}" target="_blank" rel="noopener">${esc(t)}</a>` : "—"; };

// ---------- login ----------
function lerToken() { const m = document.cookie.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]+)")); return m ? decodeURIComponent(m[1]) : null; }
function salvarToken(t) { document.cookie = `${COOKIE}=${encodeURIComponent(t)}; max-age=${90 * 86400}; path=/dashbaw; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; }
function apagarToken() { document.cookie = `${COOKIE}=; max-age=0; path=/dashbaw`; }
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
    if (!token) { $("#login-erro").hidden = false; return; }
    salvarToken(token); $("#senha").value = ""; mostrarApp(); carregar();
  } catch { $("#login-erro").textContent = "Não foi possível entrar. Tente de novo."; $("#login-erro").hidden = false; }
  finally { $("#login-btn").disabled = false; }
});
$("#sair").addEventListener("click", () => { apagarToken(); location.reload(); });

// ---------- estado ----------
let D = null, CFG = {}, PROD = [], V = [], APROV = [], CARR = [], INSC = [], WEB = [], TRAF = [], CUST = [], COBR = {};
let LOW_DE = new Map(); // pessoa → low que comprou primeiro
let MODO = "semana", SEL = null, timer = null;
const chave = (o) => (MODO === "dia" ? o.dia : MODO === "semana" ? o.sem : o.mes);
const noPer = (o, k = SEL) => chave(o) === k;
const taxa = (nome) => +(CFG[nome] ?? 0);

function produtoDe(pid, of) {
  return PROD.find((p) => p.produto_id === pid && p.oferta === (of || "")) || PROD.find((p) => p.produto_id === pid && p.oferta === "") || null;
}
const nomeProd = (p, fallback) => (p ? p.apelido || p.nome || p.produto_id : fallback || "—");
function imgProd(p, cls = "thumb-low") {
  return p?.imagem ? `<img class="${cls}" src="${esc(p.imagem)}" alt="">` : `<span class="${cls}"></span>`;
}

function preparar(d) {
  D = d; CFG = d.config || {}; PROD = d.produtos || [];
  COBR = {};
  for (const c of d.cobrancas || []) (COBR[c.t] ||= []).push(c);
  V = (d.vendas || []).map((v) => {
    const o = { ...v };
    o.dia = diaSP(v.em); o.mes = o.dia.slice(0, 7); o.grupo = grupoStatus(v.st);
    o.prodCad = produtoDe(v.pid, v.of);
    o.fat = +(v.vo ?? v.cheio ?? v.valor ?? 0);
    if (v.rec != null) {
      const lim = new Date(v.em).getTime() + 30 * 86400e3;
      o.caixa30 = (COBR[v.t] || []).filter((c) => grupoStatus(c.st) === "aprovada" && new Date(c.em).getTime() <= lim).reduce((s, c) => s + (+c.valor || 0), 0);
    } else o.caixa30 = o.grupo === "aprovada" ? o.fat : 0;
    o.comissao = (v.com || []).filter((c) => /CO_?PRODUCER|AFFILIATE/i.test(c.source || "")).reduce((s, c) => s + (+c.value || 0), 0);
    o.pessoa = pessoa(v);
    return o;
  });
  APROV = V.filter((v) => v.grupo === "aprovada");
  LOW_DE = new Map();
  [...APROV].filter((v) => v.tipo === "low").sort((a, b) => a.em.localeCompare(b.em)).forEach((v) => { if (v.pessoa && !LOW_DE.has(v.pessoa)) LOW_DE.set(v.pessoa, v); });
  CARR = (d.carrinhos || []).map((c) => ({ ...c, dia: diaSP(c.em), mes: diaSP(c.em).slice(0, 7), sem: segundaDe(diaSP(new Date(new Date(c.em).getTime() - 19 * 3600e3))) }));
  INSC = (d.inscricoes || []).map((i) => ({ ...i, dia: diaSP(i.em), mes: diaSP(i.em).slice(0, 7), pessoa: pessoa(i) }));
  WEB = (d.webinario || []).map((w) => ({ ...w, dia: diaSP(w.em), mes: diaSP(w.em).slice(0, 7), sem: w.web, pessoa: pessoa(w) }));
  TRAF = (d.trafego || []).map((t) => ({ ...t, sem: semanaDoDia(t.dia), mes: t.dia.slice(0, 7) }));
  CUST = (d.custos || []).map((c) => ({ ...c, sem: semanaDoDia(c.dia), mes: c.dia.slice(0, 7) }));
}

// ---------- períodos ----------
function chaveAgora() { const hoje = diaSP(new Date()); return MODO === "dia" ? hoje : MODO === "semana" ? semanaAgora() : hoje.slice(0, 7); }
function periodos() {
  const s = new Set([chaveAgora()]);
  for (const arr of [V, INSC, WEB, TRAF, CUST]) for (const o of arr) { const k = chave(o); if (k) s.add(k); }
  return [...s].sort().reverse();
}
function montarPeriodos() {
  const lista = periodos();
  if (!SEL || !lista.includes(SEL)) SEL = chaveAgora();
  $("#periodo-sel").innerHTML = lista.map((k) => `<option value="${k}" ${k === SEL ? "selected" : ""}>${esc(rotulo(k))}${k === chaveAgora() ? " (atual)" : ""}</option>`).join("");
  $("#periodo-nota").textContent = MODO === "semana" ? "segunda 19h → segunda 19h" : "";
  $$(".modo-nome").forEach((e) => (e.textContent = MODO === "dia" ? "dia" : MODO === "semana" ? "semana" : "mês"));
  $$(".periodo__modo button").forEach((b) => b.classList.toggle("ativo", b.dataset.modo === MODO));
}
$$(".periodo__modo button").forEach((b) => b.addEventListener("click", () => { MODO = b.dataset.modo; SEL = null; try { localStorage.setItem("baw_modo", MODO); } catch {} renderTudo(); }));
$("#periodo-sel").addEventListener("change", (e) => { SEL = e.target.value; renderTudo(); });
try { MODO = localStorage.getItem("baw_modo") || MODO; } catch {}

// ---------- métricas ----------
const soma = (arr, f) => arr.reduce((s, o) => s + (+f(o) || 0), 0);
const trafego = (tipo, k) => soma(TRAF.filter((t) => t.tipo === tipo && noPer(t, k)), (t) => t.investimento);
const custo = (cat, k) => soma(CUST.filter((c) => c.categoria === cat && noPer(c, k)), (c) => c.valor);
const aprov = (tipo, k) => APROV.filter((v) => v.tipo === tipo && noPer(v, k));
// webinário ligado a uma chave: na visão semanal, a live que abre a janela; os inscritos/lows vêm da semana anterior
const kAnterior = (k) => (MODO === "semana" ? somaDias(k, -7) : k);

function mLow(k) {
  const lows = aprov("low", k), obs = aprov("ob_low", k);
  const vendas = lows.length, fatLT = soma(lows, (v) => v.fat), fatOB = soma(obs, (v) => v.fat), fat = fatLT + fatOB;
  const traf = trafego("low", k) + custo("trafego_low", k);
  const tx = fat * taxa("taxa_hotmart"), imp = fat * taxa("imposto_venda"), impT = traf * taxa("imposto_trafego");
  const liq = fat - traf - tx - imp - impT;
  const insc = INSC.filter((i) => noPer(i, k)).length;
  return { vendas, insc, pInsc: div(insc, vendas), fat, fatLT, traf, tx, imp, impT, ticket: div(fat, vendas), liq, margem: div(liq, fat),
    cac: div(traf + impT, vendas), roas: div(fat, traf), obQtd: obs.length, fatOB, acresc: div(fatOB, fatLT), caixa: soma(lows, (v) => v.caixa30) + soma(obs, (v) => v.caixa30) };
}
function mProduto(tipo, obTipo, k) {
  const vs = aprov(tipo, k), obs = aprov(obTipo, k);
  const fat = soma(vs, (v) => v.fat), fatOB = soma(obs, (v) => v.fat), tot = fat + fatOB;
  const tx = tot * taxa("taxa_hotmart"), imp = tot * taxa("imposto_venda"), com = soma(vs, (v) => v.comissao) + soma(obs, (v) => v.comissao);
  return { vendas: vs.length, fat, obQtd: obs.length, fatOB, tot, acresc: div(fatOB, fat), caixa: soma(vs, (v) => v.caixa30) + soma(obs, (v) => v.caixa30), tx, imp, com, liq: tot - tx - imp - com, vs, obs };
}
function mWeb(k) {
  const evs = WEB.filter((w) => noPer(w, k));
  const set = (ev) => new Set(evs.filter((w) => w.ev === ev && w.pessoa).map((w) => w.pessoa));
  const acessou = set("acessou"), pitch = set("pitch"), oferta = set("oferta"), clicou = set("clicou"), naoViuEv = set("nao_viu_oferta");
  // quem chegou no pitch/oferta (ou ficou sem ver a oferta) também acessou; quem clicou viu a oferta
  for (const s of [pitch, oferta, clicou, naoViuEv]) s.forEach((p) => acessou.add(p));
  clicou.forEach((p) => oferta.add(p));
  const naoViu = [...acessou].filter((p) => !oferta.has(p)).length;
  const kIns = kAnterior(k);
  const insc = INSC.filter((i) => noPer(i, kIns)).length;
  const lows = aprov("low", kIns).length;
  const vendas = aprov("principal", k).length;
  return { lows, insc, acessou: acessou.size, pitch: pitch.size, oferta: oferta.size, clicou: clicou.size, naoViu, vendas, temEventos: evs.length > 0 };
}
function mFin(k) {
  const vs = APROV.filter((v) => noPer(v, k) && !["pendente", "ignorar"].includes(v.tipo));
  const fat = soma(vs, (v) => v.fat), caixa = soma(vs, (v) => v.caixa30);
  const trafLow = trafego("low", k) + custo("trafego_low", k), trafLemb = trafego("lembrete", k) + custo("trafego_lembrete", k);
  const trafOutro = trafego("outro", k) + custo("trafego_outro", k), traf = trafLow + trafLemb + trafOutro;
  const impT = traf * taxa("imposto_trafego");
  const api = custo("api_oficial", k), com = soma(vs, (v) => v.comissao) + custo("comissao", k);
  const tx = fat * taxa("taxa_hotmart") + custo("taxa", k), imp = fat * taxa("imposto_venda") + custo("imposto", k), outros = custo("outro", k);
  const custos = traf + impT + api + com + tx + imp + outros;
  return { fat, caixa, trafLow, trafLemb, trafOutro, impT, api, com, tx, imp, outros, custos, lucro: fat - custos, margem: div(fat - custos, fat), lucroCaixa: caixa - custos, vs };
}

// seta comparando com a média das linhas anteriores
function seta(valor, anteriores, menorMelhor = false) {
  const vals = anteriores.filter((x) => isFinite(x));
  if (!vals.length || !isFinite(valor)) return "";
  const media = vals.reduce((s, x) => s + x, 0) / vals.length;
  if (!media) return "";
  const r = valor / media - 1;
  if (Math.abs(r) <= FAIXA_IGUAL) return `<b class="seta seta--igual" title="média ${num2(media)}">=</b>`;
  const sobe = r > 0, bom = menorMelhor ? !sobe : sobe;
  return `<b class="seta ${bom ? "seta--sobe" : "seta--desce"}" title="média ${num2(media)}">${sobe ? "▲" : "▼"}</b>`;
}
function kpi(rot, val, sub = "", cls = "") { return `<div class="kpi ${cls}"><p class="rotulo">${rot}</p><p class="kpi__num">${val}</p>${sub ? `<p class="kpi__sub">${sub}</p>` : ""}</div>`; }
const vazioTab = (n, txt = "Sem dados no período") => `<tr><td colspan="${n}" class="vazio">${txt}</td></tr>`;
function funil(el, etapas) {
  const max = Math.max(1, ...etapas.map((e) => e[1] || 0));
  el.innerHTML = etapas.map(([nome, n, cor], i) => {
    const ant = i ? etapas[i - 1][1] : null;
    return `<div class="funil-baw__linha"><span class="funil-baw__nome">${nome}</span>
      <div class="funil-baw__trilho"><b style="width:${Math.max(4, (n || 0) / max * 100)}%;${cor ? "background:" + cor : ""}">${fmt(n)}</b></div>
      <span class="funil-baw__pct">${i ? pct(n, ant) : ""}</span></div>`;
  }).join("");
}

// ---------- abas ----------
$$(".aba").forEach((b) => b.addEventListener("click", () => abrirAba(b.dataset.aba)));
function abrirAba(id) {
  $$(".aba").forEach((x) => { x.classList.toggle("ativa", x.dataset.aba === id); x.setAttribute("aria-selected", x.dataset.aba === id); });
  $$(".aba-conteudo").forEach((m) => (m.hidden = m.id !== "aba-" + id));
  $("#periodo").hidden = ["webhooks", "cadastros"].includes(id);
  try { localStorage.setItem("baw_aba", id); } catch {}
}

// ---------- Painel ----------
function renderPainel() {
  const L = mLow(SEL), W = mWeb(SEL), P = mProduto("principal", "ob_principal", SEL), U = mProduto("upsell", "ob_upsell", SEL), F = mFin(SEL);
  const neg = (x) => (x < 0 ? " neg" : "");
  $("#painel-kpis").innerHTML = [
    kpi("Vendas do low", fmt(L.vendas), `${brl0(L.fat)} com bumps · ticket ${brl(L.ticket || 0)}`),
    kpi("Lucro do low", `<span class="${neg(L.liq)}">${brl0(L.liq)}</span>`, `margem ${pctV(L.margem)}`),
    kpi("CAC · ROAS", `${isFinite(L.cac) ? brl(L.cac) : "—"}`, `ROAS ${num2(L.roas)} · tráfego ${brl0(L.traf)}`),
    kpi(MODO === "semana" ? `Inscritos p/ live de ${dm(somaDias(SEL, 7))}` : "Inscritos", fmt(L.insc), `${pctV(L.pInsc)} das vendas do low`),
    kpi(MODO === "semana" ? `Presentes na live de ${dm(SEL)}` : "Acessaram a live", fmt(W.acessou), `${pct(W.acessou, W.insc)} dos ${fmt(W.insc)} inscritos`),
    kpi("Brigadeiro de A a Z", fmt(P.vendas), `${brl0(P.tot)} · ${pct(P.vendas, W.acessou)} dos presentes`),
    kpi("Upsell DAZ", fmt(U.vendas), brl0(U.tot)),
    kpi("Faturamento total", brl0(F.fat), "todas as vendas aprovadas", "kpi--preto"),
    kpi("Caixa em 30 dias", brl0(F.caixa), "", "kpi--preto"),
    kpi("Custos", brl0(F.custos), `tráfego ${brl0(F.trafLow + F.trafLemb + F.trafOutro)} · API ${brl0(F.api)}`, "kpi--preto"),
    kpi("Lucro", `<span class="${neg(F.lucro)}">${brl0(F.lucro)}</span>`, `margem ${pctV(F.margem)}`, "kpi--preto"),
    kpi("Order bumps", fmt(L.obQtd + P.obQtd + U.obQtd), `acréscimo: low ${pctV(L.acresc)} · principal ${pctV(P.acresc)}`)
  ].join("");
  funil($("#painel-funil"), funilEtapas(W));
  $("#funil-nota").textContent = MODO === "semana" ? `webinário de ${dm(SEL)} · lows e inscritos da semana ${rotulo(kAnterior(SEL))}` : "mesmo período para todas as etapas";
  // lows
  const porLow = new Map();
  for (const v of aprov("low", SEL)) { const k = v.prodCad?.id ?? v.pid; const o = porLow.get(k) || { p: v.prodCad, nome: v.prod, n: 0, fat: 0 }; o.n++; o.fat += v.fat; porLow.set(k, o); }
  const inscPorLow = contarInscPorLow(SEL);
  $("#painel-lows").innerHTML = [...porLow.values()].sort((a, b) => b.n - a.n).map((o) =>
    `<div class="low">${o.p?.imagem ? `<img class="low__img" src="${esc(o.p.imagem)}" alt="">` : `<div class="low__img">LT</div>`}
      <div><strong>${esc(nomeProd(o.p, o.nome))}</strong><span>${fmt(o.n)} vendas · ${brl0(o.fat)}</span><span>${fmt(inscPorLow.get(o.p?.id ?? "?") || 0)} inscritos</span></div></div>`).join("")
    || `<div class="vazio-bloco">Nenhuma venda de low no período.</div>`;
  renderSaude($("#painel-saude"), false);
}
function funilEtapas(W) {
  return [
    ["Compraram o low", W.lows, "#57534e"], ["Inscritos", W.insc, "#2a78d6"], ["Acessaram", W.acessou, "#2a78d6"],
    ["Estavam no pitch", W.pitch, "#1d4f91"], ["Viram a oferta", W.oferta, "#1d4f91"], ["Clicaram na oferta", W.clicou, "#eb6834"],
    ["Compraram o BAW", W.vendas, "#1baf7a"]
  ];
}
// inscrito → low: pelo e-mail/telefone na compra do low; senão pelo campo low que o Full Funnel mandou
function lowDaInscricao(i) {
  const v = LOW_DE.get(i.pessoa) || (i.tel ? [...LOW_DE.values()].find((x) => telChave(x.tel) === telChave(i.tel)) : null);
  if (v) return v.prodCad;
  if (i.low) return PROD.find((p) => [p.apelido, p.nome, p.produto_id].some((n) => n && n.toLowerCase() === String(i.low).toLowerCase())) || { id: "ff:" + i.low, nome: i.low };
  return null;
}
function contarInscPorLow(k) {
  const m = new Map();
  for (const i of INSC.filter((x) => noPer(x, k))) { const p = lowDaInscricao(i); const id = p?.id ?? "?"; m.set(id, (m.get(id) || 0) + 1); }
  return m;
}

// ---------- Low ticket ----------
function renderLow() {
  const L = mLow(SEL);
  $("#low-kpis").innerHTML = [
    kpi("Vendas", fmt(L.vendas), `${fmt(L.insc)} inscritos (${pctV(L.pInsc)})`),
    kpi("Faturamento total", brl0(L.fat), `low ${brl0(L.fatLT)} · bumps ${brl0(L.fatOB)}`),
    kpi("Tráfego", brl0(L.traf), `imposto ${brl0(L.impT)}`),
    kpi("Líquido", `<span class="${L.liq < 0 ? "neg" : ""}">${brl0(L.liq)}</span>`, `margem ${pctV(L.margem)}`, "kpi--preto"),
    kpi("CAC", isFinite(L.cac) ? brl(L.cac) : "—", `ticket médio ${isFinite(L.ticket) ? brl(L.ticket) : "—"}`),
    kpi("ROAS", num2(L.roas), `acréscimo do bump ${pctV(L.acresc)}`)
  ].join("");
  const ks = periodos().slice(0, 60);
  const linhas = ks.map((k) => ({ k, m: mLow(k) }));
  const col = [
    ["Vendas", (m) => fmt(m.vendas), (m) => m.vendas], ["Inscr.", (m) => fmt(m.insc), (m) => m.insc], ["% inscr.", (m) => pctV(m.pInsc), (m) => m.pInsc],
    ["Fat. total", (m) => brl(m.fat), (m) => m.fat], ["Fat. LT", (m) => brl(m.fatLT)], ["Tráfego", (m) => brl(m.traf)], ["Taxa Hotmart", (m) => brl(m.tx)],
    ["Imposto", (m) => brl(m.imp)], ["Imp. tráfego", (m) => brl(m.impT)], ["Ticket médio", (m) => (isFinite(m.ticket) ? brl(m.ticket) : "—"), (m) => m.ticket],
    ["Líquido", (m) => brl(m.liq), (m) => m.liq], ["Margem", (m) => pctV(m.margem), (m) => m.margem], ["CAC", (m) => (isFinite(m.cac) ? brl(m.cac) : "—"), (m) => m.cac, true],
    ["ROAS", (m) => num2(m.roas), (m) => m.roas], ["Qtd OB", (m) => fmt(m.obQtd), (m) => m.obQtd], ["Fat. OB", (m) => brl(m.fatOB), (m) => m.fatOB], ["Acrésc. OB", (m) => pctV(m.acresc), (m) => m.acresc]
  ];
  const tot = mLowTotal(ks);
  $("#low-quadro").innerHTML = `<thead><tr><th>${MODO === "dia" ? "Dia" : MODO === "semana" ? "Semana" : "Mês"}</th>${col.map((c) => `<th class="n">${c[0]}</th>`).join("")}</tr></thead>
    <tbody>${linhas.map(({ k, m }, i) => {
      const ant = linhas.slice(i + 1).filter((x) => x.m.vendas > 0);
      return `<tr class="${k === SEL ? "atual" : ""}"><td>${esc(rotulo(k))}</td>${col.map((c) => `<td class="n">${c[1](m)}${c[2] && m.vendas ? seta(c[2](m), ant.map((x) => c[2](x.m)), c[3]) : ""}</td>`).join("")}</tr>`;
    }).join("")}<tr class="total"><td>Total</td>${col.map((c) => `<td class="n">${c[1](tot)}</td>`).join("")}</tr></tbody>`;

  // por low
  const grupos = new Map();
  for (const v of APROV.filter((v) => noPer(v) && (v.tipo === "low" || v.tipo === "ob_low"))) {
    const pai = v.tipo === "ob_low" ? V.find((x) => x.t === v.pai) : v;
    const id = pai?.prodCad?.id ?? pai?.pid ?? "?";
    const g = grupos.get(id) || { p: pai?.prodCad, nome: pai?.prod, n: 0, fat: 0, ob: 0, fatOB: 0 };
    if (v.tipo === "low") { g.n++; g.fat += v.fat; } else { g.ob++; g.fatOB += v.fat; }
    grupos.set(id, g);
  }
  const inscPorLow = contarInscPorLow(SEL);
  const lst = [...grupos.entries()].sort((a, b) => b[1].n - a[1].n);
  $("#low-por-produto").innerHTML = `<thead><tr><th>Low</th><th class="n">Vendas</th><th class="n">Faturamento</th><th class="n">Bumps</th><th class="n">Conv. bump</th><th class="n">Fat. bumps</th><th class="n">Inscritos</th><th class="n">% inscr.</th></tr></thead><tbody>${
    lst.map(([id, g]) => `<tr><td>${imgProd(g.p)}${esc(nomeProd(g.p, g.nome))}</td><td class="n">${fmt(g.n)}</td><td class="n">${brl(g.fat)}</td><td class="n">${fmt(g.ob)}</td><td class="n">${pct(g.ob, g.n)}</td><td class="n">${brl(g.fatOB)}</td><td class="n">${fmt(inscPorLow.get(id) || 0)}</td><td class="n">${pct(inscPorLow.get(id) || 0, g.n)}</td></tr>`).join("") || vazioTab(8)}</tbody>`;

  // order bumps (como o "Dashboard de vendas" da planilha)
  const lows = aprov("low", SEL), fatLT = soma(lows, (v) => v.fat);
  const porOB = new Map();
  for (const v of aprov("ob_low", SEL)) { const id = v.prodCad?.id ?? v.pid; const o = porOB.get(id) || { p: v.prodCad, nome: v.prod, n: 0, fat: 0 }; o.n++; o.fat += v.fat; porOB.set(id, o); }
  $("#low-ob").innerHTML = `<thead><tr><th>Produto</th><th class="n">Faturamento</th><th class="n">Aumento do faturamento</th><th class="n">Vendas</th><th class="n">Conversão</th><th class="n">Ticket</th></tr></thead><tbody>
    <tr><td><b>Low (principal do checkout)</b></td><td class="n">${brl(fatLT)}</td><td class="n"></td><td class="n">${fmt(lows.length)}</td><td class="n"></td><td class="n">${lows.length ? brl(fatLT / lows.length) : "—"}</td></tr>
    ${[...porOB.values()].sort((a, b) => b.n - a.n).map((o) => `<tr><td>${imgProd(o.p)}${esc(nomeProd(o.p, o.nome))}</td><td class="n">${brl(o.fat)}</td><td class="n">${pct(o.fat, fatLT)}</td><td class="n">${fmt(o.n)}</td><td class="n">${pct(o.n, lows.length)}</td><td class="n">${brl(o.fat / o.n)}</td></tr>`).join("")}</tbody>`;

  // por hora
  const h = Array(24).fill(0); lows.forEach((v) => h[horaSP(v.em)]++);
  const mx = Math.max(1, ...h);
  $("#low-horas").innerHTML = h.map((n, i) => `<div style="height:${n / mx * 100}%" title="${i}h: ${n}">${n ? `<b>${n}</b>` : ""}<span>${i % 3 === 0 ? i + "h" : ""}</span></div>`).join("");

  // src
  const src = new Map();
  for (const v of lows) { const k = v.src || v.sck || "(sem src)"; const o = src.get(k) || { n: 0, fat: 0 }; o.n++; o.fat += v.fat; src.set(k, o); }
  $("#low-src").innerHTML = `<thead><tr><th>src</th><th class="n">Vendas</th><th class="n">%</th><th class="n">Faturamento</th></tr></thead><tbody>${
    [...src.entries()].sort((a, b) => b[1].n - a[1].n).map(([k, o]) => `<tr><td>${esc(k)}</td><td class="n">${fmt(o.n)}</td><td class="n">${pct(o.n, lows.length)}</td><td class="n">${brl(o.fat)}</td></tr>`).join("") || vazioTab(4)}</tbody>`;
}
function mLowTotal(ks) {
  const ms = ks.map(mLow), s = (f) => ms.reduce((a, m) => a + m[f], 0);
  const t = { vendas: s("vendas"), insc: s("insc"), fat: s("fat"), fatLT: s("fatLT"), traf: s("traf"), tx: s("tx"), imp: s("imp"), impT: s("impT"), liq: s("liq"), obQtd: s("obQtd"), fatOB: s("fatOB") };
  return { ...t, pInsc: div(t.insc, t.vendas), ticket: div(t.fat, t.vendas), margem: div(t.liq, t.fat), cac: div(t.traf + t.impT, t.vendas), roas: div(t.fat, t.traf), acresc: div(t.fatOB, t.fatLT) };
}

// ---------- Inscrições ----------
function renderInscricoes() {
  const ins = INSC.filter((i) => noPer(i));
  const lows = aprov("low", SEL);
  const compradores = new Set(lows.map((v) => v.pessoa));
  const inscritosCompradores = new Set(INSC.map((i) => i.pessoa));
  const deCompradores = [...compradores].filter((p) => inscritosCompradores.has(p)).length;
  $("#insc-kpis").innerHTML = [
    kpi("Inscritos", fmt(ins.length), MODO === "semana" ? `para o webinário de ${dm(somaDias(SEL, 7))}` : ""),
    kpi("Compradores do low que se inscreveram", pct(deCompradores, compradores.size), `${fmt(deCompradores)} de ${fmt(compradores.size)}`),
    kpi("Sem compra de low", fmt(ins.filter((i) => !lowDaInscricao(i)).length), "inscritos que não achei na Hotmart")
  ].join("");
  const ks = periodos().slice(0, 60);
  const ids = [...new Set(INSC.map((i) => lowDaInscricao(i)?.id ?? "?"))];
  const nomeId = (id) => { const p = PROD.find((x) => x.id === id); return p ? nomeProd(p) : id === "?" ? "Sem low" : String(id).replace(/^ff:/, ""); };
  $("#insc-quadro").innerHTML = `<thead><tr><th>Período</th><th class="n">Inscritos</th><th class="n">Vendas low</th><th class="n">% inscr.</th>${ids.map((id) => `<th class="n">${esc(nomeId(id))}</th>`).join("")}</tr></thead><tbody>${
    ks.map((k) => { const m = contarInscPorLow(k), n = INSC.filter((i) => noPer(i, k)).length, vl = aprov("low", k).length;
      return `<tr class="${k === SEL ? "atual" : ""}"><td>${esc(rotulo(k))}</td><td class="n">${fmt(n)}</td><td class="n">${fmt(vl)}</td><td class="n">${pct(n, vl)}</td>${ids.map((id) => `<td class="n">${fmt(m.get(id) || 0)}</td>`).join("")}</tr>`; }).join("")}</tbody>`;
  $("#insc-lista").innerHTML = `<thead><tr><th>Quando</th><th>Nome</th><th>E-mail</th><th>WhatsApp</th><th>Low</th><th>Tag</th></tr></thead><tbody>${
    ins.slice(0, 300).map((i) => `<tr><td>${quando(i.em)}</td><td>${esc(i.nome)}</td><td>${esc(i.email)}</td><td>${waLink(i.tel)}</td><td>${esc(nomeProd(lowDaInscricao(i), "—"))}</td><td>${esc(i.tag)}</td></tr>`).join("") || vazioTab(6)}</tbody>`;
}

// ---------- Webinário ----------
function renderWebinario() {
  const W = mWeb(SEL);
  $("#web-kpis").innerHTML = [
    kpi("Inscritos", fmt(W.insc)), kpi("Acessaram", fmt(W.acessou), pct(W.acessou, W.insc) + " dos inscritos"),
    kpi("No pitch", fmt(W.pitch), pct(W.pitch, W.acessou) + " de quem acessou"), kpi("Viram a oferta", fmt(W.oferta), pct(W.oferta, W.acessou)),
    kpi("Clicaram", fmt(W.clicou), pct(W.clicou, W.oferta) + " de quem viu"), kpi("Não viram a oferta", fmt(W.naoViu), pct(W.naoViu, W.acessou))
  ].join("");
  funil($("#web-funil"), funilEtapas(W));
  $("#web-nota").textContent = W.temEventos ? "" : "Ainda não chegou nenhum evento do HotWebinar neste período.";
  const ks = periodos().slice(0, 40);
  $("#web-quadro").innerHTML = `<thead><tr><th>${MODO === "semana" ? "Webinário" : "Período"}</th><th class="n">Inscritos</th><th class="n">Acessaram</th><th class="n">Comparec.</th><th class="n">Pitch</th><th class="n">Oferta</th><th class="n">Clicaram</th><th class="n">Não viram oferta</th><th class="n">Vendas BAW</th><th class="n">Conv. presentes</th><th class="n">Conv. inscritos</th></tr></thead><tbody>${
    ks.map((k) => { const m = mWeb(k); return `<tr class="${k === SEL ? "atual" : ""}"><td>${esc(MODO === "semana" ? dm(k) + " " + "seg" : rotulo(k))}</td><td class="n">${fmt(m.insc)}</td><td class="n">${fmt(m.acessou)}</td><td class="n">${pct(m.acessou, m.insc)}</td><td class="n">${fmt(m.pitch)}</td><td class="n">${fmt(m.oferta)}</td><td class="n">${fmt(m.clicou)}</td><td class="n">${fmt(m.naoViu)}</td><td class="n">${fmt(m.vendas)}</td><td class="n">${pct(m.vendas, m.acessou)}</td><td class="n">${pct(m.vendas, m.insc)}</td></tr>`; }).join("")}</tbody>`;
}

// ---------- Principal / Upsell ----------
function quadroProduto(el, tipo, obTipo, comWeb) {
  const ks = periodos().slice(0, 60);
  el.innerHTML = `<thead><tr><th>Período</th><th class="n">Vendas</th><th class="n">Faturamento</th><th class="n">Caixa 30 d</th><th class="n">Bumps</th><th class="n">Fat. bumps</th><th class="n">Acrésc.</th><th class="n">Taxa Hotmart</th><th class="n">Imposto</th><th class="n">Comissões</th><th class="n">Líquido</th>${comWeb ? `<th class="n">Conv. presentes</th><th class="n">Conv. inscritos</th>` : ""}</tr></thead><tbody>${
    ks.map((k) => { const m = mProduto(tipo, obTipo, k), w = comWeb ? mWeb(k) : null;
      return `<tr class="${k === SEL ? "atual" : ""}"><td>${esc(rotulo(k))}</td><td class="n">${fmt(m.vendas)}</td><td class="n">${brl(m.tot)}</td><td class="n">${brl(m.caixa)}</td><td class="n">${fmt(m.obQtd)}</td><td class="n">${brl(m.fatOB)}</td><td class="n">${pctV(m.acresc)}</td><td class="n">${brl(m.tx)}</td><td class="n">${brl(m.imp)}</td><td class="n">${brl(m.com)}</td><td class="n">${brl(m.liq)}</td>${comWeb ? `<td class="n">${pct(m.vendas, w.acessou)}</td><td class="n">${pct(m.vendas, w.insc)}</td>` : ""}</tr>`; }).join("")}</tbody>`;
}
function listaVendas(el, vs) {
  el.innerHTML = `<thead><tr><th>Quando</th><th>Nome</th><th>E-mail</th><th>WhatsApp</th><th>Produto</th><th>Pagamento</th><th class="n">Valor</th><th>Status</th></tr></thead><tbody>${
    vs.slice(0, 300).map((v) => `<tr><td>${quando(v.em)}</td><td>${esc(v.nome)}</td><td>${esc(v.email)}</td><td>${waLink(v.tel)}</td><td>${esc(nomeProd(v.prodCad, v.prod))}${v.ob ? " <span class=pill>bump</span>" : ""}</td><td>${esc(v.met || "")}${v.parc > 1 ? " " + v.parc + "x" : ""}${v.rec != null ? " · intelig." : ""}</td><td class="n">${brl(v.fat)}</td><td><span class="pill pill--${v.grupo}">${NOME_GRUPO[v.grupo]}</span></td></tr>`).join("") || vazioTab(8)}</tbody>`;
}
function renderPrincipal() {
  const P = mProduto("principal", "ob_principal", SEL), W = mWeb(SEL);
  $("#princ-kpis").innerHTML = [
    kpi("Vendas", fmt(P.vendas), MODO === "semana" ? `janela do webinário de ${dm(SEL)}` : ""),
    kpi("Faturamento", brl0(P.tot), `principal ${brl0(P.fat)} · bumps ${brl0(P.fatOB)}`),
    kpi("Caixa em 30 dias", brl0(P.caixa), ""), kpi("Conv. presentes", pct(P.vendas, W.acessou), `${fmt(W.acessou)} presentes`),
    kpi("Conv. inscritos", pct(P.vendas, W.insc), `${fmt(W.insc)} inscritos`), kpi("Líquido", brl0(P.liq), "sem tráfego", "kpi--preto")
  ].join("");
  quadroProduto($("#princ-quadro"), "principal", "ob_principal", true);
  const orig = new Map();
  for (const v of P.vs) { const l = LOW_DE.get(v.pessoa); const id = l?.prodCad?.id ?? "?"; const o = orig.get(id) || { p: l?.prodCad, nome: l ? l.prod : "Sem low (comprou sem low ticket)", n: 0, fat: 0 }; o.n++; o.fat += v.fat; orig.set(id, o); }
  const lowsAnt = new Map();
  for (const v of aprov("low", kAnterior(SEL))) { const id = v.prodCad?.id ?? "?"; lowsAnt.set(id, (lowsAnt.get(id) || 0) + 1); }
  $("#princ-origem").innerHTML = `<thead><tr><th>Low de origem</th><th class="n">Vendas BAW</th><th class="n">Faturamento</th><th class="n">Vendas do low (semana anterior)</th><th class="n">Conversão</th></tr></thead><tbody>${
    [...orig.entries()].sort((a, b) => b[1].n - a[1].n).map(([id, o]) => `<tr><td>${imgProd(o.p)}${esc(nomeProd(o.p, o.nome))}</td><td class="n">${fmt(o.n)}</td><td class="n">${brl(o.fat)}</td><td class="n">${MODO === "semana" ? fmt(lowsAnt.get(id) || 0) : "—"}</td><td class="n">${MODO === "semana" ? pct(o.n, lowsAnt.get(id) || 0) : "—"}</td></tr>`).join("") || vazioTab(5)}</tbody>`;
  const porOB = new Map();
  for (const v of P.obs) { const id = v.prodCad?.id ?? v.pid; const o = porOB.get(id) || { p: v.prodCad, nome: v.prod, n: 0, fat: 0 }; o.n++; o.fat += v.fat; porOB.set(id, o); }
  $("#princ-ob").innerHTML = `<thead><tr><th>Bump</th><th class="n">Vendas</th><th class="n">Conversão</th><th class="n">Faturamento</th><th class="n">Aumento</th></tr></thead><tbody>${
    [...porOB.values()].map((o) => `<tr><td>${imgProd(o.p)}${esc(nomeProd(o.p, o.nome))}</td><td class="n">${fmt(o.n)}</td><td class="n">${pct(o.n, P.vendas)}</td><td class="n">${brl(o.fat)}</td><td class="n">${pct(o.fat, P.fat)}</td></tr>`).join("") || vazioTab(5)}</tbody>`;
  listaVendas($("#princ-lista"), V.filter((v) => noPer(v) && (v.tipo === "principal" || v.tipo === "ob_principal")));
}
function renderUpsell() {
  const U = mProduto("upsell", "ob_upsell", SEL), P = mProduto("principal", "ob_principal", SEL), L = mLow(SEL);
  $("#ups-kpis").innerHTML = [
    kpi("Vendas", fmt(U.vendas)), kpi("Faturamento", brl0(U.tot)), kpi("Caixa em 30 dias", brl0(U.caixa)),
    kpi("Sobre compradores do low", pct(U.vendas, L.vendas)), kpi("Sobre compradores do BAW", pct(U.vendas, P.vendas)), kpi("Líquido", brl0(U.liq), "", "kpi--preto")
  ].join("");
  quadroProduto($("#ups-quadro"), "upsell", "ob_upsell", false);
  listaVendas($("#ups-lista"), V.filter((v) => noPer(v) && (v.tipo === "upsell" || v.tipo === "ob_upsell")));
}

// ---------- Vendas e recuperação ----------
function renderVendas() {
  const tipos = ["low", "ob_low", "principal", "ob_principal", "upsell", "ob_upsell", "pendente"];
  const vs = V.filter((v) => noPer(v)), cs = CARR.filter((c) => noPer(c));
  $("#vend-status").innerHTML = `<thead><tr><th>Produto</th><th class="n">Aprovadas</th><th class="n">Aguardando</th><th class="n">Canceladas</th><th class="n">Reembolsos</th><th class="n">% reembolso</th><th class="n">Carrinhos</th><th class="n">Carrinhos que compraram</th></tr></thead><tbody>${
    tipos.map((t) => { const x = vs.filter((v) => v.tipo === t), c = cs.filter((c) => c.tipo === t); if (!x.length && !c.length) return "";
      const n = (g) => x.filter((v) => v.grupo === g).length;
      return `<tr><td>${esc(TIPOS[t])}</td><td class="n">${fmt(n("aprovada"))}</td><td class="n">${fmt(n("aguardando"))}</td><td class="n">${fmt(n("cancelada"))}</td><td class="n">${fmt(n("reembolso"))}</td><td class="n">${pct(n("reembolso"), n("aprovada") + n("reembolso"))}</td><td class="n">${fmt(c.length)}</td><td class="n">${fmt(c.filter((c) => c.comprou).length)} (${pct(c.filter((c) => c.comprou).length, c.length)})</td></tr>`; }).join("") || vazioTab(8)}</tbody>`;
  const comprouDepois = (v) => APROV.some((a) => a.pid === v.pid && a.pessoa && a.pessoa === v.pessoa);
  const f = $("#rec-filtro").value;
  const itens = [
    ...vs.filter((v) => v.grupo !== "aprovada" && v.grupo !== "outro").map((v) => ({ em: v.em, nome: v.nome, email: v.email, tel: v.tel, prod: nomeProd(v.prodCad, v.prod), g: v.grupo, st: v.st, rec: comprouDepois(v), valor: v.fat })),
    ...cs.map((c) => ({ em: c.em, nome: c.nome, email: c.email, tel: c.tel, prod: c.prod, g: "carrinho", st: "carrinho", rec: c.comprou }))
  ].filter((i) => f === "todos" || i.g === f).sort((a, b) => b.em.localeCompare(a.em));
  $("#vend-recuperar").innerHTML = `<thead><tr><th>Quando</th><th>Situação</th><th>Nome</th><th>E-mail</th><th>WhatsApp</th><th>Produto</th><th class="n">Valor</th><th>Recuperada?</th></tr></thead><tbody>${
    itens.slice(0, 400).map((i) => `<tr><td>${quando(i.em)}</td><td><span class="pill pill--${i.g}">${esc(NOME_GRUPO[i.g])}</span></td><td>${esc(i.nome)}</td><td>${esc(i.email)}</td><td>${waLink(i.tel)}</td><td>${esc(i.prod)}</td><td class="n">${i.valor ? brl(i.valor) : ""}</td><td>${i.rec ? '<span class="pill pill--aprovada">comprou</span>' : ""}</td></tr>`).join("") || vazioTab(8)}</tbody>`;
}
$("#rec-filtro").addEventListener("change", () => renderVendas());

// ---------- Disparos ----------
function renderDisparos() {
  const api = custo("api_oficial", SEL), W = mWeb(SEL), P = mProduto("principal", "ob_principal", SEL);
  $("#disp-kpis").innerHTML = [kpi("Custo API oficial", brl(api), "lançado em Cadastros"), kpi("Custo por inscrito", isFinite(div(api, W.insc)) ? brl(api / W.insc) : "—"), kpi("Custo por venda BAW", isFinite(div(api, P.vendas)) ? brl(api / P.vendas) : "—")].join("");
  $("#disp-corpo").innerHTML = `<div class="vazio-bloco">Leitura automática da API oficial (custo por template: convite, lembrete da live, venda, follow-up, recuperação) ainda não ligada.<br>Falta definir qual conta de WhatsApp e quais nomes de template são deste webinário. Enquanto isso, lance o custo em <b>Cadastros → Custos lançados à mão</b>.</div>`;
}

// ---------- Financeiro ----------
function renderFinanceiro() {
  const F = mFin(SEL);
  const neg = (x) => (x < 0 ? "neg" : "");
  $("#fin-kpis").innerHTML = [
    kpi("Faturamento", brl0(F.fat), "", "kpi--preto"), kpi("Caixa em 30 dias", brl0(F.caixa), "", "kpi--preto"),
    kpi("Tráfego", brl0(F.trafLow + F.trafLemb + F.trafOutro), `low ${brl0(F.trafLow)} · lembrete ${brl0(F.trafLemb)}`),
    kpi("Impostos e taxas", brl0(F.imp + F.impT + F.tx), `imposto ${brl0(F.imp)} · tráfego ${brl0(F.impT)} · Hotmart ${brl0(F.tx)}`),
    kpi("API + comissões", brl0(F.api + F.com), `API ${brl0(F.api)} · comissões ${brl0(F.com)}`),
    kpi("Lucro", `<span class="${neg(F.lucro)}">${brl0(F.lucro)}</span>`, `margem ${pctV(F.margem)} · no caixa ${brl0(F.lucroCaixa)}`, "kpi--preto")
  ].join("");
  const ks = periodos().slice(0, 60);
  const col = [["Faturamento", "fat"], ["Caixa 30 d", "caixa"], ["Tráfego low", "trafLow"], ["Tráfego lembrete", "trafLemb"], ["Outro tráfego", "trafOutro"], ["Imp. tráfego", "impT"], ["API oficial", "api"], ["Comissões", "com"], ["Taxa Hotmart", "tx"], ["Imposto", "imp"], ["Outros", "outros"], ["Lucro", "lucro"]];
  const linhas = ks.map((k) => ({ k, m: mFin(k) }));
  $("#fin-quadro").innerHTML = `<thead><tr><th>Período</th>${col.map((c) => `<th class="n">${c[0]}</th>`).join("")}<th class="n">Margem</th></tr></thead><tbody>${
    linhas.map(({ k, m }, i) => `<tr class="${k === SEL ? "atual" : ""}"><td>${esc(rotulo(k))}</td>${col.map((c) => `<td class="n">${brl(m[c[1]])}${c[1] === "lucro" && m.fat ? seta(m.lucro, linhas.slice(i + 1).filter((x) => x.m.fat).map((x) => x.m.lucro)) : ""}</td>`).join("")}<td class="n">${pctV(m.margem)}</td></tr>`).join("")}</tbody>`;
  const porTipo = new Map();
  for (const v of F.vs) { const o = porTipo.get(v.tipo) || { n: 0, fat: 0, caixa: 0, com: 0 }; o.n++; o.fat += v.fat; o.caixa += v.caixa30; o.com += v.comissao; porTipo.set(v.tipo, o); }
  $("#fin-produto").innerHTML = `<thead><tr><th>Tipo</th><th class="n">Vendas</th><th class="n">Faturamento</th><th class="n">Caixa 30 d</th><th class="n">Comissões</th><th class="n">% do faturamento</th></tr></thead><tbody>${
    [...porTipo.entries()].map(([t, o]) => `<tr><td>${esc(TIPOS[t] || t)}</td><td class="n">${fmt(o.n)}</td><td class="n">${brl(o.fat)}</td><td class="n">${brl(o.caixa)}</td><td class="n">${brl(o.com)}</td><td class="n">${pct(o.fat, F.fat)}</td></tr>`).join("") || vazioTab(6)}</tbody>`;
}

// ---------- Webhooks ----------
const NOME_FONTE = { hotmart: "Hotmart (vendas)", fullfunnel: "Full Funnel (inscrições)", hotwebinar: "HotWebinar (live)" };
function estadoFonte(f) {
  if (!f.ultimo) return ["st-nada", "nunca recebeu"];
  if (f.erros24 > 0) return ["st-erro", `${f.erros24} erro(s) em 24 h`];
  if (Date.now() - new Date(f.ultimo).getTime() > 24 * 3600e3) return ["st-alerta", "nada nas últimas 24 h"];
  return ["st-ok", "funcionando"];
}
function renderSaude(el, grande) {
  const fontes = D?.monitor?.fontes || [];
  const st = D?.monitor?.envios_status || {};
  el.innerHTML = fontes.map((f) => { const [c, txt] = estadoFonte(f);
    return `<div class="saude__item ${c}"><strong>${NOME_FONTE[f.fonte] || f.fonte}</strong><span>${txt}</span><span>último: ${quando(f.ultimo)} · ${fmt(f.n24)} em 24 h</span>${grande ? `<code>${esc(WEBHOOK_URL)}?fonte=${f.fonte}${f.fonte === "hotmart" ? "" : "&chave=…"}</code>` : ""}</div>`; }).join("")
    + `<div class="saude__item ${CFG.fullfunnel_ativo === true ? (st.erro ? "st-erro" : "st-ok") : "st-nada"}"><strong>Saída → Full Funnel</strong><span>${CFG.fullfunnel_ativo === true ? "ligada" : "desligada"}</span><span>${fmt(st.enviado || 0)} enviados · ${fmt(st.erro || 0)} erros · ${fmt((st.pendente || 0) + (st.enviando || 0))} na fila</span></div>`;
}
function renderWebhooks(forcar) {
  renderSaude($("#wh-entradas"), true);
  const ativo = CFG.fullfunnel_ativo === true;
  $("#ff-ativo").checked = ativo;
  const editando = $("#aba-webhooks").contains(document.activeElement) && document.activeElement.tagName === "INPUT";
  if (forcar || !editando) {
    const urls = CFG.fullfunnel_urls || {};
    const resumo = new Map((D.monitor.envios_tipo || []).map((t) => [t.tipo, t]));
    $("#ff-urls").innerHTML = `<thead><tr><th>Tipo de envio</th><th>URL do webhook no Full Funnel</th><th class="n">Eventos</th><th class="n">Enviados</th><th class="n">Erros</th></tr></thead><tbody>${
      TIPOS_ENVIO.map((t) => { const r = resumo.get(t) || {}; return `<tr><td>${esc(t)}</td><td><input class="url" data-tipo="${t}" value="${esc(urls[t] || "")}" placeholder="${t === "padrao" ? "URL padrão" : "(usa a padrão)"}"></td><td class="n">${fmt(r.total || 0)}</td><td class="n">${fmt(r.enviados || 0)}</td><td class="n">${fmt(r.erros || 0)}</td></tr>`; }).join("")}</tbody>`;
  }
  $("#ff-envios").innerHTML = `<thead><tr><th>Quando</th><th>Tipo</th><th>Referência</th><th>Status</th><th class="n">Tent.</th><th>Erro</th><th></th></tr></thead><tbody>${
    (D.monitor.envios || []).map((e) => `<tr><td>${quando(e.criado_em)}</td><td>${esc(e.tipo)}</td><td>${esc(e.ref)}</td><td><span class="pill pill--${e.status}">${esc(e.status)}</span></td><td class="n">${e.tentativas}</td><td>${esc(e.ultimo_erro || "")}</td><td>${["erro", "sem_url", "desligado"].includes(e.status) ? `<button class="btn-sec" data-reenviar="${e.id}">Reenviar</button>` : ""}</td></tr>`).join("") || vazioTab(7, "Nenhum envio ainda")}</tbody>`;
  $("#wh-log").innerHTML = `<thead><tr><th>Quando</th><th>Fonte</th><th>Evento</th><th>Resultado</th><th>Payload</th></tr></thead><tbody>${
    (D.monitor.log || []).map((l) => `<tr><td>${quando(l.recebido_em)}</td><td>${esc(l.fonte)}</td><td>${esc(l.evento || "")}</td><td><span class="pill pill--${l.ok ? "enviado" : "erro"}">${l.ok ? "ok" : "erro"}</span> ${esc(l.resultado || "")}</td><td>${l.payload ? `<details><summary>ver</summary><pre>${esc(JSON.stringify(l.payload, null, 2))}</pre></details>` : ""}</td></tr>`).join("") || vazioTab(5, "Nada recebido ainda")}</tbody>`;
  const ruim = (D.monitor.fontes || []).some((f) => f.erros24 > 0) || (D.monitor.envios_status || {}).erro > 0;
  $("#bolinha-webhooks").hidden = !ruim;
}
$("#ff-ativo").addEventListener("change", async (e) => {
  const liga = e.target.checked;
  if (liga && !confirm("Ligar os envios para o Full Funnel? A partir de agora cada venda, carrinho e evento da live novo será enviado.")) { e.target.checked = false; return; }
  await salvarConfig("fullfunnel_ativo", liga);
});
$("#ff-salvar").addEventListener("click", async () => {
  const urls = {};
  for (const i of $$("#ff-urls input.url")) { const v = i.value.trim(); if (v) { if (!/^https:\/\//.test(v)) { alert("URL inválida em " + i.dataset.tipo); return; } urls[i.dataset.tipo] = v; } }
  await salvarConfig("fullfunnel_urls", urls); alert("URLs salvas.");
});
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-reenviar]"); if (!b) return;
  b.disabled = true; await comToken("dash_baw_reenviar", { p_id: +b.dataset.reenviar }).catch((err) => alert(err.message)); carregar();
});
async function salvarConfig(chaveCfg, valor) {
  try { await comToken("dash_baw_config_salvar", { p_chave: chaveCfg, p_valor: valor }); await carregar(true); }
  catch (err) { alert("Não salvou: " + err.message); }
}

// ---------- Cadastros ----------
function renderCadastros(forcar) {
  const pend = PROD.filter((p) => p.tipo === "pendente").length;
  $("#bolinha-cadastros").hidden = !pend;
  $("#aviso-produtos").hidden = !pend;
  $("#aviso-produtos").innerHTML = pend ? `⚠️ ${pend} produto(s)/oferta(s) da Hotmart sem tipo — as vendas deles não entram nas contas. <a data-ir="cadastros">Classificar em Cadastros</a>` : "";
  if (!forcar && $("#aba-cadastros").contains(document.activeElement) && /INPUT|SELECT/.test(document.activeElement.tagName)) return;
  const opc = (sel) => Object.entries(TIPOS).map(([k, n]) => `<option value="${k}" ${k === sel ? "selected" : ""}>${n}</option>`).join("");
  const vendasPorProd = new Map(); for (const v of APROV) { const id = v.prodCad?.id; if (id) vendasPorProd.set(id, (vendasPorProd.get(id) || 0) + 1); }
  $("#cad-produtos").innerHTML = `<thead><tr><th>Imagem</th><th>Produto (Hotmart)</th><th>Tipo</th><th>Nome no dash</th><th class="n">Vendas</th><th>Ativo</th><th></th></tr></thead><tbody>${
    PROD.map((p) => `<tr class="${p.tipo === "pendente" ? "pendente" : ""}" data-id="${p.id}">
      <td><label class="img-btn" title="Trocar imagem">${imgProd(p, "thumb-low")}<input type="file" accept="image/*" hidden data-img="${p.id}"></label></td>
      <td>${esc(p.nome || "")}<br><small>${p.produto_id.startsWith("?") ? "aguardando a 1ª venda para pegar o ID" : "produto " + esc(p.produto_id)}${p.oferta ? " · oferta " + esc(p.oferta) : " · todas as ofertas"}${p.preco ? " · " + brl(p.preco) : ""}</small></td>
      <td><select data-campo="tipo">${opc(p.tipo)}</select></td>
      <td><input type="text" data-campo="apelido" value="${esc(p.apelido || "")}" placeholder="${esc(p.nome || "")}"></td>
      <td class="n">${fmt(vendasPorProd.get(p.id) || 0)}</td>
      <td><input type="checkbox" data-campo="ativo" ${p.ativo ? "checked" : ""}></td>
      <td><button class="btn-pri" data-salvar="${p.id}">Salvar</button></td></tr>`).join("") || vazioTab(7, "Nenhum produto ainda — eles aparecem sozinhos quando a Hotmart mandar a primeira venda, ou cadastre abaixo.")}</tbody>`;
  $("#cad-novo select[name=tipo]").innerHTML = opc("low");
  const f = $("#cad-taxas");
  for (const n of ["taxa_hotmart", "imposto_venda", "imposto_trafego"]) f[n].value = +(taxa(n) * 100).toFixed(2);
  $("#cad-custos").innerHTML = `<thead><tr><th>Dia</th><th>Categoria</th><th>Descrição</th><th class="n">Valor</th><th></th></tr></thead><tbody>${
    CUST.slice(0, 200).map((c) => `<tr><td>${dm(c.dia)}/${c.dia.slice(0, 4)}</td><td>${esc(c.categoria)}</td><td>${esc(c.descricao || "")}</td><td class="n">${brl(c.valor)}</td><td><button class="btn-sec" data-apagar-custo="${c.id}">Apagar</button></td></tr>`).join("") || vazioTab(5, "Nenhum custo lançado")}</tbody>`;
  if (!$("#cad-custo").dia.value) $("#cad-custo").dia.value = diaSP(new Date());
}
document.addEventListener("click", (e) => { const a = e.target.closest("[data-ir]"); if (a) abrirAba(a.dataset.ir); });
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-salvar]"); if (!b) return;
  const tr = b.closest("tr");
  b.disabled = true;
  try {
    await comToken("dash_baw_produto_salvar", { p_id: +b.dataset.salvar, p_tipo: tr.querySelector("[data-campo=tipo]").value, p_apelido: tr.querySelector("[data-campo=apelido]").value.trim(), p_imagem: null, p_ativo: tr.querySelector("[data-campo=ativo]").checked });
    await carregar(true);
  } catch (err) { alert("Não salvou: " + err.message); } finally { b.disabled = false; }
});
document.addEventListener("change", async (e) => {
  const inp = e.target.closest("[data-img]"); if (!inp || !inp.files[0]) return;
  try {
    const url = await reduzirImagem(inp.files[0], 240);
    await comToken("dash_baw_produto_salvar", { p_id: +inp.dataset.img, p_tipo: null, p_apelido: inp.closest("tr").querySelector("[data-campo=apelido]").value.trim(), p_imagem: url, p_ativo: null });
    await carregar(true);
  } catch (err) { alert("Não salvou a imagem: " + err.message); }
});
function reduzirImagem(arq, lado) {
  return new Promise((ok, falha) => {
    const img = new Image();
    img.onload = () => {
      const s = Math.min(1, lado / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      let url = c.toDataURL("image/webp", 0.82); if (!url.startsWith("data:image/webp")) url = c.toDataURL("image/jpeg", 0.82);
      URL.revokeObjectURL(img.src); ok(url);
    };
    img.onerror = () => falha(new Error("imagem inválida"));
    img.src = URL.createObjectURL(arq);
  });
}
$("#cad-novo").addEventListener("submit", async (e) => {
  e.preventDefault(); const f = e.target;
  try { await comToken("dash_baw_produto_novo", { p_produto: f.produto.value, p_oferta: f.oferta.value, p_tipo: f.tipo.value, p_nome: f.nome.value || null }); f.reset(); await carregar(true); }
  catch (err) { alert("Não salvou: " + err.message); }
});
$("#cad-taxas").addEventListener("submit", async (e) => {
  e.preventDefault(); const f = e.target;
  try { for (const n of ["taxa_hotmart", "imposto_venda", "imposto_trafego"]) await comToken("dash_baw_config_salvar", { p_chave: n, p_valor: +f[n].value / 100 }); await carregar(true); alert("Taxas salvas."); }
  catch (err) { alert("Não salvou: " + err.message); }
});
$("#cad-custo").addEventListener("submit", async (e) => {
  e.preventDefault(); const f = e.target;
  try { await comToken("dash_baw_custo_salvar", { p_dia: f.dia.value, p_categoria: f.categoria.value, p_descricao: f.descricao.value || null, p_valor: +f.valor.value }); f.descricao.value = ""; f.valor.value = ""; await carregar(true); }
  catch (err) { alert("Não salvou: " + err.message); }
});
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-apagar-custo]"); if (!b || !confirm("Apagar este custo?")) return;
  await comToken("dash_baw_custo_apagar", { p_id: +b.dataset.apagarCusto }).catch((err) => alert(err.message)); carregar(true);
});

// ---------- carregar ----------
function renderTudo(forcar) {
  montarPeriodos();
  const partes = [renderPainel, renderLow, renderInscricoes, renderWebinario, renderPrincipal, renderUpsell, renderVendas, renderDisparos, renderFinanceiro, () => renderWebhooks(forcar), () => renderCadastros(forcar)];
  for (const f of partes) { try { f(); } catch (err) { console.error(f.name, err); } }
}
async function carregar(forcar) {
  if (!lerToken()) return mostrarLogin();
  $("#recarregar").disabled = true;
  try {
    preparar(await comToken("dash_baw"));
    renderTudo(forcar === true);
    $("#atualizado").textContent = "Atualizado " + quando(new Date().toISOString()) + " · atualiza sozinho a cada 1 min";
  } catch (err) {
    if (err.code === "28000") { apagarToken(); return mostrarLogin(); }
    console.error(err);
    $("#atualizado").textContent = "Falha ao atualizar — tentando de novo em 1 min";
  } finally {
    $("#recarregar").disabled = false;
    clearTimeout(timer); timer = setTimeout(carregar, ATUALIZAR_A_CADA);
  }
}
$("#recarregar").addEventListener("click", () => carregar(true));
try { const a = localStorage.getItem("baw_aba"); if (a && $("#aba-" + a)) abrirAba(a); } catch {}
if (lerToken()) { mostrarApp(); carregar(true); } else mostrarLogin();
