// Aba Tráfego — cruza os dados da Meta (meta_*_black2026) com os leads pelas UTMs.
// Usa LEADS, UNICOS, fmt, pct, esc, dataBR, diaSP, $ de dash.js.

const brl = (n) => (Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brl2 = (n) => (Number.isFinite(n) && n > 0 ? brl(n) : "—");
const taxa = (a, b) => (b ? (a / b * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%" : "—");
const num1 = (n) => (n < 10 && n % 1 ? n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : fmt(n));

const UTMS_AD = ["utm_source", "utm_campaign", "utm_content", "utm_term"]; // utm_medium = {{placement}}, não resolvível
const DIMENSOES = [
  ["conta", "Conta de anúncio"], ["formato", "Formato (vídeo/imagem)"], ["campanha", "Campanha (Meta)"], ["conjunto", "Conjunto (Meta)"], ["anuncio", "Anúncio (Meta)"],
  ["utm_source", "utm_source"], ["utm_campaign", "utm_campaign"], ["utm_content", "utm_content"], ["utm_term", "utm_term"]
];
const COLUNAS = [
  ["investimento", "Investimento", brl], ["impressoes", "Impressões", fmt], ["cliques", "Cliques", fmt],
  ["page_views", "Page views", fmt], ["leads", "Leads", num1], ["leads_meta", "Leads (Meta)", fmt], ["alcance", "Alcance", (v, r) => (r.alcanceAprox ? "≈ " : "") + fmt(v)],
  ["tx_lp", "Tx carreg. LP", null], ["cpm", "CPM", null], ["ctr", "CTR", null], ["cpc", "CPC", null],
  ["conv_cliques", "Conv. cliques→leads", null], ["conv_lp", "Conv. LP", null], ["cpl", "CPL", null], ["cpl_hoje", "CPL hoje", null],
  ["ci", "Alunos Ci", num1], ["felipe", "Alunos Felipe", num1], ["ambos", "Alunos dos dois", num1], ["nao", "Não alunos", num1]
];
// perfil do lead -> grupo (Ci = Docis)
const PERFIL_GRUPO = { aluno_docis: "ci", aluno_docis_black: "ci", aluno_felipe: "felipe", aluno_felipe_black: "felipe", aluno_ambos: "ambos" };
const grupoLead = (l) => PERFIL_GRUPO[l.perfil] || "nao";

let TRAF = { ads: [], insights: [], alcance: {}, sync: null, ultimaOk: null };
const CONTA_DOCIS = "act_259868608977585";
// o alcance exato da "conta|total" é só da Docis: só vale quando nenhuma outra conta entregou no dia (ou no período)
const soDocis = (dia) => !TRAF.insights.some((i) => i.impressoes > 0 && (!dia || i.dia === dia) && ADS.get(i.ad_id)?.conta_id !== CONTA_DOCIS);
let ADS = new Map();          // ad_id -> anúncio
let ATRIB = new Map();        // lead.id -> [{ad_id, peso}]
let ordem = { col: "leads", dir: -1 };
// Desempate dos rankings de anúncios: 1) mais leads, 2) menor CPL, 3) mais leads que são alunos
const arred = (v) => Math.round((v || 0) * 1000) / 1000;
const alunosDe = (r) => (r.ci || 0) + (r.felipe || 0) + (r.ambos || 0);
function desempate(a, b) {
  return arred(b.leads) - arred(a.leads)
    || (a.cpl ?? Infinity) - (b.cpl ?? Infinity)
    || arred(alunosDe(b)) - arred(alunosDe(a));
}
let gInv = null, gCpl = null, gHora = null, diaHora = null;
try { const o = JSON.parse(localStorage.getItem("dash_traf_ordem2") || "null"); if (o) ordem = o; } catch (e) {}

// Normaliza para comparar UTMs com os nomes da Meta. Ignora o sufixo de cópia que o Gerenciador põe ao duplicar
// ("geral — Cópia", "alunos - Copy 2"): a UTM grava o nome do momento do clique e o conjunto pode ser renomeado depois.
const SUFIXO_COPIA = /\s*[—–-]\s*(c[óo]pia|copy)(\s*\d+)?\s*$/i;
const norm = (v) => {
  let t = String(v ?? "").trim();
  while (SUFIXO_COPIA.test(t)) t = t.replace(SUFIXO_COPIA, "").trim();
  return t.toLowerCase();
};

function prepararTrafego(d) {
  TRAF.ads = (d.ads || []).map((a) => ({
    ad_id: a[0], anuncio: a[1] || a[0], adset_id: a[2], conjunto: a[3] || a[2], campaign_id: a[4], campanha: a[5] || a[4], status: a[6],
    utm_source: a[7], utm_medium: a[8], utm_campaign: a[9], utm_content: a[10], utm_term: a[11], url_tags: a[12], conta_id: a[13], conta: a[14] || "Docis",
    // formato pela Meta; se não vier, pelo arquivo do Drive (só Docis); conta do Felipe sem formato = "Não informado"
    formato: a[15] ? (a[15] === "video" ? "Vídeo" : "Imagem") : criativoDe(a[1]) ? (criativoDe(a[1]).tipo === "vid" ? "Vídeo" : "Imagem")
      : a[13] && a[13] !== CONTA_DOCIS ? "Não informado" : "Imagem"
  }));
  ADS = new Map(TRAF.ads.map((a) => [a.ad_id, a]));
  TRAF.insights = (d.insights || []).map((r) => ({ dia: r[0], ad_id: r[1], investimento: +r[2] || 0, impressoes: +r[3] || 0, cliques: +r[4] || 0, page_views: +r[5] || 0, leads_meta: +r[6] || 0, alcance: +r[7] || 0 }));
  TRAF.alcance = {};
  (d.alcance || []).forEach(([nivel, chave, periodo, v]) => { TRAF.alcance[`${nivel}|${chave}|${periodo}`] = +v || 0; });
  TRAF.sync = d.sync; TRAF.ultimaOk = d.ultima_sync_ok; TRAF.syncFelipe = d.sync_felipe;
  atribuirLeads();
}

// Liga cada lead aos anúncios cujas UTMs resolvidas batem com as dele (se bater com vários, divide o lead)
function atribuirLeads() {
  ATRIB = new Map();
  const padroes = new Map(); // "campos" -> Map(assinatura -> [ad_id])
  TRAF.ads.forEach((a) => {
    const campos = UTMS_AD.filter((c) => a[c] && !String(a[c]).startsWith("("));
    if (!campos.length) return;
    const chave = campos.join(",");
    if (!padroes.has(chave)) padroes.set(chave, new Map());
    const sig = campos.map((c) => norm(a[c])).join("|");
    const m = padroes.get(chave);
    if (!m.has(sig)) m.set(sig, []);
    m.get(sig).push(a.ad_id);
  });
  UNICOS.forEach((l) => {
    let achados = [];
    padroes.forEach((m, chave) => {
      const sig = chave.split(",").map((c) => norm(l[c])).join("|");
      if (m.has(sig)) achados = achados.concat(m.get(sig));
    });
    if (achados.length) ATRIB.set(l.id, achados.map((ad_id) => ({ ad_id, peso: 1 / achados.length })));
  });
}

// ---------- Filtros ----------
const FILTROS_T = [["conta", "Conta"], ["formato", "Formato"], ["campanha", "Campanha"], ["conjunto", "Conjunto"], ["anuncio", "Anúncio"], ["utm_source", "utm_source"], ["utm_campaign", "utm_campaign"], ["utm_content", "utm_content"], ["utm_term", "utm_term"]];

function montarFiltrosTrafego() {
  const wrap = $("#t-selects");
  const atuais = Object.fromEntries([...wrap.querySelectorAll("select")].map((s) => [s.dataset.campo, s.value]));
  wrap.innerHTML = FILTROS_T.map(([campo, nome]) => {
    const vals = [...new Set(TRAF.ads.map((a) => a[campo] || ""))].sort((a, b) => a.localeCompare(b, "pt-BR", { numeric: true }));
    return `<select data-campo="${campo}" aria-label="${nome}"><option value="__todos">${nome}: todos</option>${vals.map((v) => `<option value="${esc(v)}">${esc(v || "(vazio)")}</option>`).join("")}</select>`;
  }).join("");
  wrap.querySelectorAll("select").forEach((s) => {
    if (atuais[s.dataset.campo] && [...s.options].some((o) => o.value === atuais[s.dataset.campo])) s.value = atuais[s.dataset.campo];
    s.addEventListener("change", renderTrafego);
  });
  const dim = $("#t-dim");
  if (!dim.options.length) {
    dim.innerHTML = DIMENSOES.map(([k, n]) => `<option value="${k}">${n}</option>`).join("");
    try { dim.value = localStorage.getItem("dash_traf_dim") || "anuncio"; } catch (e) { dim.value = "anuncio"; }
    if (!dim.value) dim.value = "anuncio";
    dim.addEventListener("change", () => { try { localStorage.setItem("dash_traf_dim", dim.value); } catch (e) {} renderRanking(); });
  }
}

function estadoFiltros() {
  const sel = [...document.querySelectorAll("#t-selects select")].filter((s) => s.value !== "__todos").map((s) => [s.dataset.campo, s.value]);
  // com o filtro do teste A/B ligado, compara só a partir do início do teste (antes todo mundo via o e-mail)
  const iniAB = $("#t-ab") && AB_NOMES[$("#t-ab").value] ? abInicioDia() : null;
  const de = $("#t-de").value;
  return { de: iniAB && (!de || de < iniAB) ? iniAB : de, ate: $("#t-ate").value, sel };
}
const adPassa = (a, f) => a && f.sel.every(([c, v]) => (a[c] || "") === v);
const diaPassa = (d, f) => (!f.de || d >= f.de) && (!f.ate || d <= f.ate);

// ---------- Teste A/B 1 (e-mail no formulário): visão do tráfego por versão ----------
// Teste 2: um dia inteiro para cada versão; cada hora do dia pertence inteira à versão daquele dia
// (gasto/impressões/cliques/page views da Meta hora a hora, contas Docis e Felipe).
let AB = null;          // dados de dash_ab_black2026
let VIS = { insights: [], horas: [], unicos: [] };
function abInicioDia() { return AB && AB.inicio ? diaSP.format(new Date(AB.inicio)) : null; }
// Testes A/B (o mais recente primeiro). Cada um diz o campo que separa as versões, os nomes, a janela
// e a regra de qual versão estava no ar em cada instante (no sorteio por visitante, as duas ficam no ar juntas).
const TESTES_AB = [
  { id: 3, nome: "Teste 3 · Headline A × B × C", campo: "headline", a: "atual", b: "nova", sorteio: true,
    nomeA: "A · Headline atual", nomeB: "B · Compre uma vez",
    subA: "“Todos os cursos… Acesso para sempre.”", subB: "“Compre uma vez. Aprenda para sempre.”",
    variantes: [
      { id: "atual", nome: "A · Headline atual", sub: "“Todos os cursos… Uma única oferta. Acesso para sempre.”", cor: "#2a78d6" },
      { id: "nova", nome: "B · Compre uma vez", sub: "“Compre uma vez. Aprenda para sempre.”", cor: "#eb6834" },
      { id: "sonho", nome: "C · Sonho", sub: "“Seu sonho de viver da confeitaria…”", cor: "#7c3aed" }
    ],
    desc: "22/10 das 15h à meia-noite · cada visitante é sorteado 1/3 para cada versão e vê sempre a mesma (e-mail pedido nas três)",
    ini: Date.parse("2026-10-22T15:00:00-03:00"), fim: Date.parse("2026-10-23T00:00:00-03:00"),
    versao: () => "sorteio" },
  { id: 2, nome: "Teste 2 · Dia sem e-mail × dia com e-mail", campo: "email", a: "com_email", b: "sem_email",
    nomeA: "A · Com e-mail", nomeB: "B · Sem e-mail", subA: "nome, e-mail e WhatsApp", subB: "só nome e WhatsApp",
    desc: "20/10 o dia todo SEM e-mail · 21/10 o dia todo COM e-mail, com a mesma copy nova nos dois dias",
    ini: Date.parse("2026-10-20T00:00:00-03:00"), fim: Date.parse("2026-10-22T00:00:00-03:00"),
    versao: (ms) => (ms < Date.parse("2026-10-21T00:00:00-03:00") ? "sem_email" : "com_email") },
  { id: 1, nome: "Teste 1 · E-mail no formulário, trocando a cada hora", campo: "email", a: "com_email", b: "sem_email",
    nomeA: "A · Com e-mail", nomeB: "B · Sem e-mail", subA: "nome, e-mail e WhatsApp", subB: "só nome e WhatsApp",
    desc: "19/10 das 13h às 23h: a versão mudava a cada hora cheia (13h sem e-mail, 14h com, 15h sem…), copy antiga",
    ini: Date.parse("2026-10-19T13:00:00-03:00"), fim: Date.parse("2026-10-19T23:00:00-03:00"),
    versao: (ms) => (Math.floor((ms - Date.parse("2026-10-19T13:00:00-03:00")) / 3600000) % 2 === 0 ? "sem_email" : "com_email") }
];
let TESTE_AB = TESTES_AB[0];
// nomes das versões do teste escolhido (A e B)
const AB_NOMES = new Proxy({}, { get: (_, k) => (TESTE_AB.variantes ? (TESTE_AB.variantes.find((x) => x.id === k) || {}).nome
  : k === TESTE_AB.a ? TESTE_AB.nomeA : k === TESTE_AB.b ? TESTE_AB.nomeB : undefined) });
const idsVariantes = () => (TESTE_AB.variantes ? TESTE_AB.variantes.map((x) => x.id) : [TESTE_AB.a, TESTE_AB.b]);
// versão em que o lead se cadastrou, no campo do teste escolhido
const varianteDoLead = (l) => (TESTE_AB.campo === "headline" ? l.hl : l.ab);
const noTeste = (l) => !!versaoEm(Date.parse(l.criado_em));
function versaoEm(ms) {
  const t = TESTE_AB;
  return ms >= t.ini && ms < t.fim ? t.versao(ms) : null;
}
// fração do gasto da hora (dia, hora em Brasília) que pertence à versão v
// (sorteio: cada versão fica com 1/N de cada minuto da hora que está dentro do teste)
const _frac = new Map();
function fracHora(dia, hora, v) {
  const k = `${TESTE_AB.id}|${dia}|${hora}|${v}`;
  if (_frac.has(k)) return _frac.get(k);
  const ini = Date.parse(`${dia}T${String(hora).padStart(2, "0")}:00:00-03:00`), agora = Date.now();
  let dentro = 0, daV = 0;
  for (let m = 0; m < 60; m++) {
    const t = ini + m * 60000 + 30000;
    if (t > agora) break;
    dentro++;
    const x = versaoEm(t);
    if (x === v) daV++; else if (x === "sorteio" && idsVariantes().includes(v)) daV += 1 / idsVariantes().length;
  }
  const f = dentro ? daV / dentro : 0;
  if (ini + 3600000 < agora) _frac.set(k, f); // hora fechada não muda
  return f;
}
// A conta do Felipe manda hora a hora por CONJUNTO (id "conj:<adset_id>"): cria um "anúncio" representante
// do conjunto só para os filtros funcionarem (conta, campanha, conjunto, UTMs); filtro por anúncio o exclui.
function registrarConjuntosHora() {
  (TRAF.horas || []).forEach(([, , id]) => {
    if (!String(id).startsWith("conj:") || ADS.has(id)) return;
    const adset = String(id).slice(5), base = TRAF.ads.find((a) => a.adset_id === adset);
    ADS.set(id, base ? { ...base, ad_id: id, anuncio: "(conjunto inteiro)", utm_term: null, formato: "Não informado" }
      : { ad_id: id, anuncio: "(conjunto inteiro)", conjunto: adset, conta: "Felipe Russo", conta_id: "act_766204412703705" });
  });
}

function aplicarAB() {
  const v = $("#t-ab") ? $("#t-ab").value : "todos";
  if (!AB_NOMES[v] || !AB || !AB.inicio) { VIS = { insights: TRAF.insights, horas: TRAF.horas || [], unicos: UNICOS }; return; }
  const horas = [], insights = [];
  (TRAF.horas || []).forEach(([d, h, ad, inv, imp, cl, lpv]) => {
    const x = fracHora(d, h, v);
    if (!x) return;
    horas.push([d, h, ad, (+inv || 0) * x, (+imp || 0) * x, (+cl || 0) * x, (+lpv || 0) * x]);
    insights.push({ dia: d, ad_id: ad, investimento: (+inv || 0) * x, impressoes: (+imp || 0) * x, cliques: (+cl || 0) * x, page_views: (+lpv || 0) * x, leads_meta: 0, alcance: 0 });
  });
  VIS = { insights, horas, unicos: UNICOS.filter((l) => varianteDoLead(l) === v && noTeste(l)) };
}

// ---------- Agregação ----------
function vazio() { return { investimento: 0, impressoes: 0, cliques: 0, page_views: 0, leads: 0, leads_meta: 0, alcance: 0, alcanceAprox: true, ci: 0, felipe: 0, ambos: 0, nao: 0 }; }
function derivar(r) {
  r.tx_lp = r.cliques ? r.page_views / r.cliques : null;
  r.cpm = r.impressoes ? r.investimento / r.impressoes * 1000 : null;
  r.ctr = r.impressoes ? r.cliques / r.impressoes : null;
  r.cpc = r.cliques ? r.investimento / r.cliques : null;
  r.conv_cliques = r.cliques ? r.leads / r.cliques : null;
  r.conv_lp = r.page_views ? r.leads / r.page_views : null;
  r.cpl = r.leads ? r.investimento / r.leads : null;
  r.cpl_nao = r.nao ? r.investimento / r.nao : null;
  return r;
}
const fmtDerivada = { tx_lp: (v) => (v == null ? "—" : taxa(v, 1)), ctr: (v) => (v == null ? "—" : taxa(v, 1)), conv_cliques: (v) => (v == null ? "—" : taxa(v, 1)), conv_lp: (v) => (v == null ? "—" : taxa(v, 1)), cpm: (v) => (v == null ? "—" : brl(v)), cpc: (v) => (v == null ? "—" : brl(v)), cpl: (v) => (v == null ? "—" : brl(v)), cpl_hoje: (v) => (v == null ? "—" : brl(v)) };
// CPL de hoje para cada grupo (mesmos filtros, só o dia de hoje)
const hojeSP = () => diaSP.format(new Date());
function comCplHoje(grupos, f, dim) {
  const h = hojeSP();
  const deHoje = agregar({ ...f, de: h, ate: h }, dim);
  grupos.forEach(([k, r]) => { const x = deHoje.get(k); r.cpl_hoje = x && x.leads ? x.investimento / x.leads : null; });
  return grupos;
}
function celula(col, r) {
  const def = COLUNAS.find((c) => c[0] === col);
  if (fmtDerivada[col]) return fmtDerivada[col](r[col]);
  return def[2](r[col], r);
}

function chaveDim(a, dim) { return dim === "formato" ? a.formato : dim === "conta" ? a.conta : dim === "campanha" ? a.campanha : dim === "conjunto" ? a.conjunto : dim === "anuncio" ? a.anuncio : (a[dim] || "(vazio)"); }

function agregar(f, dim) {
  const grupos = new Map();
  const g = (k) => { if (!grupos.has(k)) grupos.set(k, vazio()); return grupos.get(k); };
  const periodoTodo = !f.de && !f.ate;
  VIS.insights.forEach((i) => {
    const a = ADS.get(i.ad_id);
    if (!adPassa(a, f) || !diaPassa(i.dia, f)) return;
    const r = g(dim ? chaveDim(a, dim) : "total");
    r.investimento += i.investimento; r.impressoes += i.impressoes; r.cliques += i.cliques;
    r.page_views += i.page_views; r.leads_meta += i.leads_meta; r.alcance += i.alcance;
    if (dim === "anuncio") { r.campanha = a.campanha; r.conjunto = a.conjunto; r.formato = a.formato; }
    if (dim === "conjunto") r.campanha = a.campanha;
  });
  VIS.unicos.forEach((l) => {
    const at = ATRIB.get(l.id);
    if (!at || !diaPassa(l.dia, f)) return;
    const gl = grupoLead(l);
    at.forEach(({ ad_id, peso }) => { const a = ADS.get(ad_id); if (adPassa(a, f)) { const r = g(dim ? chaveDim(a, dim) : "total"); r.leads += peso; r[gl] += peso; } });
  });
  // alcance deduplicado quando dá (período inteiro e nível da Meta, ou total sem filtro)
  grupos.forEach((r, k) => {
    if (!dim && !f.sel.length && periodoTodo && soDocis() && TRAF.alcance["conta|total|total"] != null) { r.alcance = TRAF.alcance["conta|total|total"]; r.alcanceAprox = false; }
    else if (periodoTodo && ["campanha", "conjunto", "anuncio"].includes(dim) && !f.sel.length) {
      const nivelId = { campanha: "campaign_id", conjunto: "adset_id", anuncio: "ad_id" }[dim];
      const ids = [...new Set(TRAF.ads.filter((a) => chaveDim(a, dim) === k).map((a) => a[nivelId]))];
      if (ids.length === 1 && TRAF.alcance[`${dim}|${ids[0]}|total`] != null) { r.alcance = TRAF.alcance[`${dim}|${ids[0]}|total`]; r.alcanceAprox = false; }
    }
    derivar(r);
  });
  return grupos;
}

// ---------- Render ----------
function renderTrafego() {
  if (!$("#aba-trafego")) return;
  aplicarAB();
  const vAB = $("#t-ab").value;
  $("#t-ab-nota").hidden = !AB_NOMES[vAB];
  const f = estadoFiltros();
  const total = agregar(f, null).get("total") || derivar(vazio());

  // status da sincronização
  const s = TRAF.sync;
  $("#t-sync").textContent = !TRAF.ultimaOk ? "Ainda sem dados da Meta" :
    `Dados da Meta de ${horaSP.format(new Date(TRAF.ultimaOk))} · atualiza de hora em hora` + (s && !s.ok ? ` · ⚠ última tentativa falhou: ${s.mensagem}` : "")
    + (TRAF.syncFelipe ? ` · conta Felipe Russo: ${TRAF.syncFelipe.ok ? horaSP.format(new Date(TRAF.syncFelipe.em)) : "⚠ falhou (" + TRAF.syncFelipe.mensagem + ")"}` : "");

  // Funil: impressões → cliques → page views → leads, com a taxa entre cada etapa (setas) e o clique → lead ao lado
  const etapas = [
    { nome: "Impressões", valor: fmt(total.impressoes), cor: "#1d4f91", w: 100 },
    { nome: "Cliques", valor: fmt(total.cliques), cor: "#2a78d6", w: 80 },
    { nome: "Page views", valor: fmt(total.page_views), cor: "#4f95e6", w: 62 },
    { nome: "Leads de anúncios", valor: num1(total.leads), cor: "#2fa84f", w: 46 }
  ];
  const conectores = [
    { nome: "CTR", v: total.ctr, dica: "cliques ÷ impressões" },
    { nome: "carreg. da página", v: total.tx_lp, dica: "page views ÷ cliques" },
    { nome: "conv. da página", v: total.conv_lp, dica: "leads ÷ page views" }
  ];
  const pct2 = (v) => (v == null ? "—" : taxa(v, 1));
  let html = "";
  etapas.forEach((e, k) => {
    html += `<div class="funil__etapa" style="grid-row:${k * 2 + 1}"><div class="funil__barra" style="width:${e.w}%;background:${e.cor}"><b>${e.valor}</b><span>${e.nome}</span></div></div>`;
    if (conectores[k]) html += `<div class="funil__vao" style="grid-row:${k * 2 + 2}"></div><div class="funil__chave funil__chave--esq" style="grid-row:${k * 2 + 1} / ${k * 2 + 4}" title="${conectores[k].dica}"><span><b>${pct2(conectores[k].v)}</b>${conectores[k].nome}</span></div>`;
  });
  html += `<div class="funil__chave" style="grid-row:3 / 8" title="leads ÷ cliques"><span><b>${pct2(total.conv_cliques)}</b>clique → lead</span></div>`;
  $("#t-funil").innerHTML = html;

  // ao lado do funil: investimento grande; CPL geral x hoje; CPM x CPC; alcance pequeno
  const h0 = hojeSP(); const tHoje = agregar({ ...f, de: h0, ate: h0 }, null).get("total");
  const cplHojeV = tHoje && tHoje.leads ? tHoje.investimento / tHoje.leads : null;
  let compara = "";
  if (cplHojeV != null && total.cpl) {
    const dif = cplHojeV / total.cpl - 1;
    compara = Math.abs(dif) < 0.05 ? `<p class="kpi__sub kpi__comp kpi__comp--igual">≈ igual à média geral (${dif < 0 ? "-" : "+"}${taxa(Math.abs(dif), 1)})</p>`
      : dif < 0 ? `<p class="kpi__sub kpi__comp kpi__comp--bom">▼ ${taxa(-dif, 1)} abaixo da média</p>`
      : `<p class="kpi__sub kpi__comp kpi__comp--ruim">▲ ${taxa(dif, 1)} acima da média</p>`;
  }
  $("#t-kpis").innerHTML = `
    <div class="kpi kpi--destaque kpi--largo kpi--grande"><p class="rotulo">Investimento</p><p class="kpi__num">${brl(total.investimento)}</p></div>
    <div class="kpi kpi--destaque"><p class="rotulo">CPL geral</p><p class="kpi__num">${fmtDerivada.cpl(total.cpl)}</p></div>
    <div class="kpi kpi--cinza"><p class="rotulo">CPL hoje</p><p class="kpi__num">${cplHojeV == null ? "—" : brl(cplHojeV)}</p>${compara}</div>
    <div class="kpi"><p class="rotulo">CPM</p><p class="kpi__num">${fmtDerivada.cpm(total.cpm)}</p></div>
    <div class="kpi"><p class="rotulo">CPC</p><p class="kpi__num">${fmtDerivada.cpc(total.cpc)}</p></div>
    <div class="kpi kpi--largo kpi--pequeno"><p class="rotulo">Alcance</p><p class="kpi__num">${(total.alcanceAprox ? "≈ " : "") + fmt(total.alcance)}</p></div>`;

  // leads de tráfego sem anúncio identificado
  const semAnuncio = VIS.unicos.filter((l) => l.tipo === "Tráfego" && !ATRIB.has(l.id) && diaPassa(l.dia, f)).length;
  $("#t-aviso").hidden = !semAnuncio;
  $("#t-aviso").textContent = `${fmt(semAnuncio)} lead${semAnuncio === 1 ? "" : "s"} de tráfego no período não ${semAnuncio === 1 ? "bateu" : "bateram"} com nenhum anúncio blf26 (UTMs diferentes ou anúncio de outra campanha) e não ${semAnuncio === 1 ? "entra" : "entram"} no CPL.`;

  renderContas(f);
  if (diaHora) carregarHora(diaHora); // atualiza o dia que já estava aberto
  renderCplDia(f);                     // na primeira vez, abre o último dia
  renderDiaTrafego(f);
  renderTaxas(f);
  renderCtrFormato(f);
  renderTop5(f);
  renderRanking();
}

function renderDiaTrafego(f) {
  const porDia = new Map();
  const g = (d) => { if (!porDia.has(d)) porDia.set(d, Object.assign(vazio(), { org: 0, traf: 0, alcanceAprox: true })); return porDia.get(d); };
  VIS.insights.forEach((i) => {
    const a = ADS.get(i.ad_id);
    if (!adPassa(a, f) || !diaPassa(i.dia, f)) return;
    const r = g(i.dia);
    r.investimento += i.investimento; r.impressoes += i.impressoes; r.cliques += i.cliques; r.page_views += i.page_views; r.leads_meta += i.leads_meta; r.alcance += i.alcance;
  });
  VIS.unicos.forEach((l) => {
    if (!diaPassa(l.dia, f)) return;
    if (l.tipo === "Orgânico") g(l.dia).org++;
    if (l.tipo === "Tráfego") g(l.dia).traf++;
    const at = ATRIB.get(l.id);
    if (at) at.forEach(({ ad_id, peso }) => { if (adPassa(ADS.get(ad_id), f)) g(l.dia).leads += peso; });
  });
  porDia.forEach((r, d) => {
    if (!f.sel.length && soDocis(d) && TRAF.alcance[`conta|total|${d}`] != null) { r.alcance = TRAF.alcance[`conta|total|${d}`]; r.alcanceAprox = false; }
    derivar(r);
  });
  const dias = [...porDia.keys()].sort().reverse();
  const cols = ["investimento", "impressoes", "cliques", "page_views", "leads", "alcance", "tx_lp", "cpm", "ctr", "cpc", "conv_cliques", "conv_lp", "cpl"];
  // cores x média geral (dias completos): verde = melhor, vermelho = pior, ±10% = sem cor
  const SOBE_BOM = ["org", "traf", "impressoes", "cliques", "page_views", "leads", "alcance", "tx_lp", "ctr", "conv_cliques", "conv_lp"];
  const SOBE_RUIM = ["cpm", "cpc", "cpl"];
  const CONTAGENS = ["org", "traf", "impressoes", "cliques", "page_views", "leads", "alcance"];
  const hoje = hojeSP();
  const completos = dias.filter((d) => d < hoje && d >= INICIO_CAPTACAO);
  const soma = (lista) => { const t = vazio(); t.org = 0; t.traf = 0; lista.forEach((r) => { ["investimento", "impressoes", "cliques", "page_views", "leads", "leads_meta", "alcance", "org", "traf"].forEach((c) => { t[c] += r[c] || 0; }); }); return derivar(t); };
  const tot = soma(completos.map((d) => porDia.get(d)));
  const media = Object.assign({}, tot);
  CONTAGENS.concat(["investimento"]).forEach((c) => { media[c] = completos.length ? tot[c] / completos.length : null; });

  // hoje é parcial: contagens comparadas com a média dos dias completos ATÉ A MESMA HORA (horas fechadas)
  const horaAtual = Math.floor(minutoSP(new Date()) / 60);
  const ateHora = new Map(); // dia -> contagens até horaAtual
  const gh = (d) => { if (!ateHora.has(d)) ateHora.set(d, { impressoes: 0, cliques: 0, page_views: 0, leads: 0, org: 0, traf: 0 }); return ateHora.get(d); };
  VIS.horas.forEach(([d, hora, ad_id, , imp, cl, lpv]) => {
    if (hora >= horaAtual || !adPassa(ADS.get(ad_id), f)) return;
    const r = gh(d); r.impressoes += +imp || 0; r.cliques += +cl || 0; r.page_views += +lpv || 0;
  });
  VIS.unicos.forEach((l) => {
    if (l.minuto >= horaAtual * 60) return;
    const r = gh(l.dia);
    if (l.tipo === "Orgânico") r.org++;
    if (l.tipo === "Tráfego") r.traf++;
    const at = ATRIB.get(l.id);
    if (at) at.forEach(({ ad_id, peso }) => { if (adPassa(ADS.get(ad_id), f)) r.leads += peso; });
  });
  const mediaAteHora = {};
  ["impressoes", "cliques", "page_views", "leads", "org", "traf"].forEach((c) => {
    mediaAteHora[c] = completos.length ? completos.reduce((s2, d) => s2 + (ateHora.get(d)?.[c] || 0), 0) / completos.length : null;
  });

  const corDe = (col, valor, ref) => {
    if (valor == null || ref == null || !ref || col === "investimento") return "";
    const r = valor / ref, dif = taxa(Math.abs(r - 1), 1);
    // variação abaixo de 5% = amarelo; acima disso verde (melhor) ou vermelho (pior)
    if (Math.abs(r - 1) < 0.05) return ` class="n cel--igual" title="${r >= 1 ? "acima" : "abaixo"} da média geral em ${dif} (menos de 5%)"`;
    const sobe = r > 1;
    const bom = SOBE_RUIM.includes(col) ? !sobe : sobe;
    return ` class="n ${bom ? "cel--bom" : "cel--ruim"}" title="${sobe ? "acima" : "abaixo"} da média geral em ${dif}"`;
  };
  const celCor = (col, r, d) => {
    const parcial = d === hoje;
    let valor = r[col], ref = media[col];
    if (parcial && CONTAGENS.includes(col)) {
      if (col === "alcance") {
        // a Meta não dá alcance por hora: espera-se a média do dia proporcional às impressões que a média tem até esta hora
        ref = media.impressoes ? media.alcance * (mediaAteHora.impressoes || 0) / media.impressoes : null;
      } else { valor = ateHora.get(d)?.[col] || 0; ref = mediaAteHora[col]; }
    }
    if (d < INICIO_CAPTACAO || !completos.length || (!parcial && completos.length < 1)) return `<td class="n">${celula(col, r)}</td>`;
    const attr = corDe(col, valor, ref);
    return attr ? `<td${attr}>${col === "org" || col === "traf" ? fmt(r[col]) : celula(col, r)}</td>` : `<td class="n">${col === "org" || col === "traf" ? fmt(r[col]) : celula(col, r)}</td>`;
  };
  const linhaMedia = completos.length ? `<tr class="linha-media"><td>Média geral <span>(${completos.length} dia${completos.length > 1 ? "s" : ""} completo${completos.length > 1 ? "s" : ""})</span></td>
      <td class="n">${num1(media.org)}</td><td class="n">${num1(media.traf)}</td>${cols.map((c) => `<td class="n">${c === "alcance" ? fmt(media.alcance) : CONTAGENS.includes(c) || c === "investimento" ? (c === "investimento" ? brl(media.investimento) : num1(media[c])) : celula(c, media)}</td>`).join("")}</tr>` : "";
  $("#tr-dia tbody").innerHTML = linhaMedia + (dias.map((d) => {
    const r = porDia.get(d);
    return `<tr><td>${dataBR(d)}${d === hoje ? ` · hoje <span class="t-nota">(até ${String(horaAtual).padStart(2, "0")}h)</span>` : ""}</td>${celCor("org", r, d)}${celCor("traf", r, d)}${cols.map((c) => celCor(c, r, d)).join("")}</tr>`;
  }).join("") || `<tr><td colspan="16" class="vazio">Sem dados no período.</td></tr>`);

  // gráfico de investimento por dia
  const asc = [...dias].reverse();
  const labels = asc.map(dataBR), dados = asc.map((d) => porDia.get(d).investimento);
  if (gInv) { gInv.data.labels = labels; gInv.data.datasets[0].data = dados; gInv.update(); }
  else {
    const o = opcoesGrafico({});
    o.plugins.tooltip.callbacks.label = (c) => ` Investimento: ${brl(c.parsed.y)}`;
    o.plugins.tooltip.callbacks.afterLabel = (c) => { const r = porDia.get(asc[c.dataIndex]); return r ? ` CPL: ${fmtDerivada.cpl(r.cpl)} · Leads: ${num1(r.leads)}` : ""; };
    o.scales.y.ticks.callback = (v) => brl(v).replace(",00", "");
    gInv = new Chart($("#g-inv"), { type: "bar", data: { labels, datasets: [{ label: "Investimento", data: dados, backgroundColor: "#2a78d6", borderRadius: 4, borderSkipped: "bottom", maxBarThickness: 36 }] }, options: o });
  }
}

function renderRanking() {
  const f = estadoFiltros();
  const dim = $("#t-dim").value || "anuncio";
  const grupos = comCplHoje([...agregar(f, dim).entries()], f, dim);
  const val = (r) => (ordem.col === "nome" ? null : r[ordem.col]);
  grupos.sort((a, b) => {
    if (ordem.col === "nome") return ordem.dir * a[0].localeCompare(b[0], "pt-BR", { numeric: true });
    const va = val(a[1]), vb = val(b[1]);
    if (va == null && vb == null) return desempate(a[1], b[1]);
    if (va == null) return 1; if (vb == null) return -1;
    return ordem.dir * (arred(va) - arred(vb)) || desempate(a[1], b[1]); // empate na coluna escolhida -> leads, CPL, alunos
  });
  const seta = (c) => (ordem.col === c ? (ordem.dir > 0 ? " ▲" : " ▼") : "");
  const nomeDim = DIMENSOES.find((d) => d[0] === dim)[1];
  $("#t-rank thead").innerHTML = `<tr><th data-col="nome" class="ordenavel">${esc(nomeDim)}${seta("nome")}</th>${COLUNAS.map(([c, n]) => `<th data-col="${c}" class="n ordenavel">${n}${seta(c)}</th>`).join("")}</tr>`;
  $("#t-rank tbody").innerHTML = grupos.map(([k, r]) => `<tr>
    <td title="${esc(k)}"><div class="rank-nome">${dim === "anuncio" && criativoDe(k) ? `<img class="thumb" src="${thumbUrl(criativoDe(k))}" alt="" loading="lazy" referrerpolicy="no-referrer" data-criativo="${esc(k)}">` : ""}<div><strong>${dim === "anuncio" ? iconeFormato(r.formato) : ""}${esc(k)}</strong>${r.campanha ? `<span class="sub">${esc(r.campanha)}${r.conjunto ? " · " + esc(r.conjunto) : ""}</span>` : ""}</div></div></td>
    ${COLUNAS.map(([c]) => `<td class="n">${celula(c, r)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${COLUNAS.length + 1}" class="vazio">Sem dados.</td></tr>`;
  $("#t-rank-info").textContent = `${fmt(grupos.length)} ${grupos.length === 1 ? "linha" : "linhas"} · clique no título da coluna para ordenar · empate: leads, CPL, alunos`;
  $("#t-rank thead").querySelectorAll("th").forEach((th) => th.addEventListener("click", () => {
    const c = th.dataset.col;
    ordem = { col: c, dir: ordem.col === c ? -ordem.dir : (c === "nome" ? 1 : -1) };
    try { localStorage.setItem("dash_traf_ordem2", JSON.stringify(ordem)); } catch (e) {}
    renderRanking();
  }));
  TRAF.ultimoRanking = { dim: nomeDim, grupos };
}

["#t-de", "#t-ate"].forEach((s) => $(s).addEventListener("input", renderTrafego));
$("#t-ab").addEventListener("change", () => renderTrafego());
// opções do filtro "Teste A/B" seguem o teste escolhido na aba Teste A/B
function montarFiltroAB() {
  const sel = $("#t-ab"), atual = sel.value;
  sel.innerHTML = `<option value="todos">Todas as versões (${TESTE_AB.nome.split(" · ")[0]})</option>` + idsVariantes().map((v) => `<option value="${v}">Só ${AB_NOMES[v]}</option>`).join("");
  sel.value = idsVariantes().includes(atual) ? atual : "todos";
}
montarFiltroAB();
$("#t-limpar").addEventListener("click", () => {
  $("#t-de").value = ""; $("#t-ate").value = "";
  document.querySelectorAll("#t-selects select").forEach((s) => { s.value = "__todos"; });
  $("#t-ab").value = "todos";
  renderTrafego();
});
$("#t-csv").addEventListener("click", () => {
  const rk = TRAF.ultimoRanking; if (!rk) return;
  const cel = (v) => { const s = String(v ?? ""); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const n = (v) => (v == null ? "" : String(Math.round(v * 10000) / 10000).replace(".", ","));
  const linhas = rk.grupos.map(([k, r]) => [k, ...COLUNAS.map(([c]) => n(r[c]))].map(cel).join(";"));
  const blob = new Blob(["﻿" + [[rk.dim, ...COLUNAS.map((c) => c[1])].join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `trafego-black2026-${diaSP.format(new Date())}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// Investimento e CPL na aba principal
function totaisTrafegoPorDia() {
  const inv = new Map();
  TRAF.insights.forEach((i) => inv.set(i.dia, (inv.get(i.dia) || 0) + i.investimento));
  return inv;
}

// ---------- Criativos (Drive) ----------
function criativoDe(nomeAnuncio) {
  const C = window.CRIATIVOS || {};
  if (C[nomeAnuncio]) return C[nomeAnuncio];
  const num = String(nomeAnuncio || "").match(/(\d{3})$/);          // cai para o número (únicos entre os criativos)
  if (num) { const k = Object.keys(C).find((x) => x.endsWith("_" + num[1])); if (k) return C[k]; }
  return null;
}
const thumbUrl = (c, w = 200) => `https://drive.google.com/thumbnail?id=${encodeURIComponent(c.id)}&sz=w${w}`;

function abrirPrevia(nome) {
  const c = criativoDe(nome); if (!c) return;
  $("#previa-titulo").textContent = nome + (c.tipo === "vid" ? " · vídeo" : "");
  const video = c.tipo === "vid";
  $("#previa-img").hidden = video; $("#previa-frame").hidden = !video;
  if (video) $("#previa-frame").src = `https://drive.google.com/file/d/${encodeURIComponent(c.id)}/preview`;
  else $("#previa-img").src = thumbUrl(c, 1200);
  $("#previa-link").href = `https://drive.google.com/file/d/${encodeURIComponent(c.id)}/view`;
  $("#previa").hidden = false;
}
function fecharPrevia() { $("#previa").hidden = true; $("#previa-frame").src = "about:blank"; $("#previa-img").removeAttribute("src"); }
$("#previa-fechar").addEventListener("click", fecharPrevia);
$("#previa").addEventListener("click", (e) => { if (e.target.id === "previa") fecharPrevia(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("#previa").hidden) fecharPrevia(); });

// prévia rápida ao passar o mouse (desktop) + clique abre o anúncio (qualquer aparelho)
document.addEventListener("mouseover", (e) => {
  const t = e.target.closest("[data-criativo]"); const h = $("#previa-hover");
  if (!t || !matchMedia("(hover: hover)").matches) { h.hidden = true; return; }
  const c = criativoDe(t.dataset.criativo); if (!c) return;
  h.src = thumbUrl(c, 480); h.hidden = false;
  const r = t.getBoundingClientRect();
  h.style.left = Math.min(innerWidth - 256, r.right + 12) + "px";
  h.style.top = Math.max(8, Math.min(innerHeight - 320, r.top - 40)) + "px";
});
document.addEventListener("click", (e) => {
  const t = e.target.closest("[data-criativo]"); if (!t) return;
  $("#previa-hover").hidden = true; abrirPrevia(t.dataset.criativo);
});

// ---------- Por conta ----------
function renderContas(f) {
  const grupos = [...agregar(f, "conta").entries()].sort((a, b) => b[1].investimento - a[1].investimento);
  const t = derivar(grupos.reduce((s, [, r]) => { ["investimento", "leads", "ci", "felipe", "ambos", "nao"].forEach((c) => { s[c] += r[c]; }); return s; }, vazio()));
  const linha = (nome, r, cls = "") => `<tr class="${cls}"><td><strong>${esc(nome)}</strong></td><td class="n">${brl(r.investimento)}</td><td class="n">${num1(r.leads)}</td>
    <td class="n">${num1(r.ci)}</td><td class="n">${num1(r.felipe)}</td><td class="n">${num1(r.ambos)}</td><td class="n">${num1(r.nao)}</td>
    <td class="n">${fmtDerivada.cpl(r.cpl)}</td><td class="n">${r.cpl_nao == null ? "—" : brl(r.cpl_nao)}</td></tr>`;
  $("#t-contas tbody").innerHTML = grupos.map(([k, r]) => linha(k, r)).join("") + (grupos.length > 1 ? linha("Total", t, "total") : "")
    || `<tr><td colspan="9" class="vazio">Sem dados.</td></tr>`;
}

// ---------- CPL por dia + hora a hora ----------
// ---------- CPL por conta: dia a dia e hora a hora ----------
// Geral (preto, grosso) + Docis e Felipe (finos, com a cabecinha no começo). Botões escondem/mostram cada linha.
const LINHAS_CPL = [
  { chave: "geral", nome: "Geral", cor: "#0b0b0b", largura: 3.5, rotulo: "Geral" },
  { chave: "Docis", nome: "Docis", cor: "#eda100", largura: 2, cabeca: () => (typeof CABECA_CI !== "undefined" ? CABECA_CI : null) },
  { chave: "Felipe Russo", nome: "Felipe Russo", cor: "#4a3aa7", largura: 2, cabeca: () => (typeof CABECA_FELIPE !== "undefined" ? CABECA_FELIPE : null) }
];
const cplVisivel = { geral: true, Docis: true, "Felipe Russo": true };
const contaDe = (ad_id) => ADS.get(ad_id)?.conta || "Docis";
function montarBotoesCpl() {
  const alvo = $("#cpl-linhas"); if (!alvo || alvo.dataset.montado) return;
  alvo.dataset.montado = "1";
  alvo.innerHTML = LINHAS_CPL.map((l) => `<button type="button" class="chip-linha ativo" data-linha="${l.chave}" style="--cor:${l.cor}">${l.cabeca ? `<img src="${l.chave === "Docis" ? "/black2026/img/cabeca-cilaine.webp" : "/black2026/img/cabeca-felipe.webp"}" alt="">` : "<i></i>"}${l.nome}</button>`).join("");
  alvo.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => {
    cplVisivel[b.dataset.linha] = !cplVisivel[b.dataset.linha];
    b.classList.toggle("ativo", cplVisivel[b.dataset.linha]);
    [gCpl, gHora].forEach((g) => { if (!g) return; g.data.datasets.forEach((d) => { if (d.$chave) d.hidden = !cplVisivel[d.$chave]; }); g.update(); });
  }));
}
const dsCpl = (l, data, extra = {}) => ({ label: l.nome, data, $chave: l.chave, $cabeca: l.cabeca, $rotulo: l.rotulo, hidden: !cplVisivel[l.chave],
  borderColor: l.cor, backgroundColor: l.cor, borderWidth: l.largura, pointRadius: l.chave === "geral" ? 3 : 2, pointHoverRadius: 6, tension: .25, spanGaps: true, ...extra });

function renderCplDia(f) {
  montarBotoesCpl();
  const porDia = new Map(); // dia -> { geral, Docis, "Felipe Russo" } cada um { inv, leads }
  const g = (d, c) => { if (!porDia.has(d)) porDia.set(d, { geral: { inv: 0, leads: 0 }, Docis: { inv: 0, leads: 0 }, "Felipe Russo": { inv: 0, leads: 0 } }); const r = porDia.get(d); return [r.geral, r[c] || (r[c] = { inv: 0, leads: 0 })]; };
  VIS.insights.forEach((i) => { if (adPassa(ADS.get(i.ad_id), f) && diaPassa(i.dia, f)) g(i.dia, contaDe(i.ad_id)).forEach((x) => { x.inv += i.investimento; }); });
  VIS.unicos.forEach((l) => {
    const at = ATRIB.get(l.id); if (!at || !diaPassa(l.dia, f)) return;
    at.forEach(({ ad_id, peso }) => { if (adPassa(ADS.get(ad_id), f)) g(l.dia, contaDe(ad_id)).forEach((x) => { x.leads += peso; }); });
  });
  const dias = [...porDia.keys()].sort();
  const cpl = (k) => dias.map((d) => { const r = porDia.get(d)[k]; return r && r.leads && r.inv ? +(r.inv / r.leads).toFixed(2) : null; });
  const labels = dias.map((d) => dataBR(d).slice(0, 5));
  const datasets = LINHAS_CPL.map((l) => dsCpl(l, cpl(l.chave), l.chave === "geral" ? { pointRadius: 4 } : {}));
  if (gCpl) { gCpl.data.labels = labels; gCpl.data.datasets = datasets; gCpl.$dias = dias; gCpl.$porDia = porDia; gCpl.update(); return; }
  const o = opcoesGrafico({});
  o.layout = { padding: { left: 16, top: 28, right: 6 } };
  o.interaction = { mode: "index", intersect: false };
  o.plugins.tooltip.callbacks.label = (c) => { const r = gCpl.$porDia.get(gCpl.$dias[c.dataIndex])?.[c.dataset.$chave]; return ` ${c.dataset.label}: ${c.parsed.y == null ? "—" : brl(c.parsed.y)}${r ? ` · ${brl(r.inv)} ÷ ${num1(r.leads)} leads` : ""}`; };
  o.plugins.tooltip.callbacks.footer = () => "Clique para ver hora a hora";
  o.scales.y.ticks.callback = (v) => brl(v);
  o.onClick = (ev, els) => { const el = els[0]; if (el) carregarHora(gCpl.$dias[el.index]); };
  o.onHover = (ev, els) => { ev.native.target.style.cursor = els.length ? "pointer" : "default"; };
  gCpl = new Chart($("#g-cpl"), { type: "line", data: { labels, datasets }, options: o, plugins: [pluginCabecaLinha] });
  gCpl.$dias = dias; gCpl.$porDia = porDia;
  if (!diaHora && dias.length) carregarHora(dias[dias.length - 1]);
}

const horaLead = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" });
async function carregarHora(dia) {
  diaHora = dia;
  $("#hora-titulo").textContent = `Hora a hora · ${dataBR(dia)}`;
  $("#hora-nota").textContent = "carregando…";
  let linhas = [];
  try { linhas = await rpc("dash_trafego_hora_black2026", { p_token: lerToken(), p_dia: dia }); } catch (e) { $("#hora-nota").textContent = "não foi possível carregar"; return; }
  renderHora(dia, linhas || []);
}
function renderHora(dia, linhas) {
  const f = estadoFiltros();
  const novo = () => ({ inv: Array(24).fill(0), leads: Array(24).fill(0) });
  const por = { geral: novo(), Docis: novo(), "Felipe Russo": novo() };
  linhas.forEach(([h, ad_id, v]) => { if (adPassa(ADS.get(ad_id), f)) { const c = contaDe(ad_id); [por.geral, por[c] || (por[c] = novo())].forEach((x) => { x.inv[h] += +v || 0; }); } });
  VIS.unicos.forEach((l) => {
    if (l.dia !== dia) return; const at = ATRIB.get(l.id); if (!at) return;
    const h = parseInt(horaLead.format(new Date(l.criado_em)), 10);
    at.forEach(({ ad_id, peso }) => { if (adPassa(ADS.get(ad_id), f)) { const c = contaDe(ad_id); [por.geral, por[c] || (por[c] = novo())].forEach((x) => { x.leads[h] += peso; }); } });
  });
  // a hora em andamento fica de fora: já tem leads, mas o custo dela ainda não chegou da Meta
  const limite = dia === hojeSP() ? Math.floor(minutoSP(new Date()) / 60) - 1 : 23;
  const ult = Math.min(limite, Math.max(...por.geral.inv.map((v, h) => (v || por.geral.leads[h] ? h : -1)), 0));
  const acum = (x) => { let ai = 0, al = 0; return x.inv.slice(0, ult + 1).map((v, h) => { ai += v; al += x.leads[h]; return al && ai ? +(ai / al).toFixed(2) : null; }); };
  const daHora = por.geral.inv.slice(0, ult + 1).map((v, h) => (por.geral.leads[h] ? +(v / por.geral.leads[h]).toFixed(2) : null));
  const labels = Array.from({ length: ult + 1 }, (_, h) => `${String(h).padStart(2, "0")}h`);
  const datasets = [
    ...LINHAS_CPL.map((l) => dsCpl(l, acum(por[l.chave] || novo()), { pointRadius: 0, label: `${l.nome} · acumulado do dia` })),
    { type: "bar", label: "CPL da hora (geral)", data: daHora, backgroundColor: "rgba(120,113,108,.18)", borderWidth: 0, barPercentage: .7, order: 10 }
  ];
  const t = por.geral;
  $("#hora-nota").textContent = `${brl(t.inv.reduce((s, v) => s + v, 0))} · ${num1(t.leads.reduce((s, v) => s + v, 0))} leads · linhas = CPL acumulado do dia · barras = CPL de cada hora`;
  if (gHora) { gHora.data.labels = labels; gHora.data.datasets = datasets; gHora.$por = por; gHora.update(); return; }
  const o = opcoesGrafico({});
  o.layout = { padding: { left: 16, top: 28, right: 6 } };
  o.plugins.tooltip.callbacks.label = (c) => ` ${c.dataset.label}: ${c.parsed.y == null ? "—" : brl(c.parsed.y)}`;
  o.plugins.tooltip.callbacks.afterBody = (items) => {
    const h = items[0].dataIndex, p = gHora.$por;
    return LINHAS_CPL.filter((l) => p[l.chave]).map((l) => `${l.nome} nesta hora: ${brl(p[l.chave].inv[h])} · ${num1(p[l.chave].leads[h])} leads`).join("\n");
  };
  o.scales.y.ticks.callback = (v) => brl(v);
  gHora = new Chart($("#g-hora"), { type: "line", data: { labels, datasets }, options: o, plugins: [pluginCabecaLinha] });
  gHora.$por = por;
}

// ---------- Top 5 ----------
function renderTop5(f) {
  const todos = comCplHoje([...agregar(f, "anuncio").entries()], f, "anuncio").filter(([, r]) => r.leads > 0).sort((a, b) => desempate(a[1], b[1]));
  desenharTop($("#t-top5"), todos.slice(0, 5), "Ainda sem leads ligados a anúncios.");
  desenharTop($("#t-top5-imagem"), todos.filter(([, r]) => r.formato === "Imagem").slice(0, 5), "Nenhuma imagem com leads no período.");
  const videos = todos.filter(([, r]) => r.formato === "Vídeo").slice(0, 5);
  const temVideo = TRAF.ads.some((a) => a.formato === "Vídeo" && adPassa(a, f));
  desenharTop($("#t-top5-video"), videos, temVideo ? "Os vídeos ainda não trouxeram leads no período." : "Nenhum anúncio em vídeo rodando nas campanhas blf26 (com os filtros escolhidos).");
}
function iconeFormato(fmt) {
  return fmt === "Vídeo" ? '<span class="fmt fmt--video" title="Vídeo" aria-label="Vídeo">▶</span>' : '<span class="fmt fmt--img" title="Imagem" aria-label="Imagem">▣</span>';
}
function desenharTop(el, ads, vazioMsg) {
  el.innerHTML = ads.map(([nome, r], i) => {
    const c = criativoDe(nome);
    return `<article class="top5__card">
      <button type="button" class="top5__img" data-criativo="${esc(nome)}" aria-label="Ver o anúncio ${esc(nome)}">
        ${c ? `<img src="${thumbUrl(c, 480)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ""}
        <span class="top5__pos">#${i + 1}</span><span class="top5__tipo">${r.formato === "Vídeo" ? "▶ vídeo" : "▣ imagem"}</span>
      </button>
      <div class="top5__info">
        <span class="top5__nome">${esc(nome)}</span>
        <span class="top5__linha"><span>Leads</span><strong>${num1(r.leads)}</strong></span>
        <span class="top5__linha"><span>CPL</span><strong>${fmtDerivada.cpl(r.cpl)}</strong></span>
        <span class="top5__linha top5__linha--hoje"><span>CPL hoje</span><strong>${fmtDerivada.cpl(r.cpl_hoje)}</strong></span>
        <span class="top5__linha"><span>Investimento</span><strong>${brl(r.investimento)}</strong></span>
        <div class="top5__perfis">
          <span><b>${num1(r.ci)}</b>Ci</span><span><b>${num1(r.felipe)}</b>Felipe</span><span><b>${num1(r.ambos)}</b>Ambos</span><span><b>${num1(r.nao)}</b>Não alunos</span>
        </div>
      </div></article>`;
  }).join("") || `<p class="t-nota">${vazioMsg}</p>`;
}

// ---------- Análise diária dos criativos ----------
let ANALISES = [];
async function carregarAnalise() {
  try { ANALISES = (await rpc("dash_analise_criativos_black2026", { p_token: lerToken() })) || []; } catch (e) { ANALISES = []; }
  const sel = $("#t-analise-dia"), atual = sel.value;
  sel.innerHTML = ANALISES.map((a) => `<option value="${a.dia}">${dataBR(a.dia)}</option>`).join("");
  if (atual && ANALISES.some((a) => a.dia === atual)) sel.value = atual;
  renderAnalise();
}
$("#t-analise-dia").addEventListener("change", renderAnalise);

function renderAnalise() {
  const a = ANALISES.find((x) => x.dia === $("#t-analise-dia").value) || ANALISES[0];
  if (!a) { $("#t-analise").innerHTML = '<p class="t-nota">Ainda não há análise.</p>'; return; }
  const c = a.conteudo || {};
  const miniatura = (nome) => { const n = String(nome).split(/\s*·\s*/)[0]; const cr = criativoDe(n); return cr ? `<img class="thumb" src="${thumbUrl(cr)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-criativo="${esc(n)}">` : '<span class="thumb"></span>'; };
  const lista = (arr) => `<ul>${(arr || []).map((t) => `<li>${esc(t)}</li>`).join("")}</ul>`;
  $("#t-analise").innerHTML = `
    <p class="t-nota analise__periodo">${esc(c.periodo || "")} · gerada em ${horaSP.format(new Date(a.gerado_em))}</p>
    <p class="analise__resumo">${esc(c.resumo || "")}</p>
    <h3>O que está funcionando</h3>
    <div class="analise__grade">${(c.vencedores || []).map((v) => `<div class="analise__item">${miniatura(v.anuncio)}<div>
      <strong>${esc(v.anuncio)} · ${esc(v.formato || "")}</strong>
      <span class="analise__metricas">${esc(v.leads)} leads · CPL ${esc(v.cpl)} · ${esc(v.perfil || "")}</span>
      <p>${esc(v.porque)}</p></div></div>`).join("")}</div>
    <h3>O que evitar / pausar</h3>
    <div class="analise__grade">${(c.evitar || []).map((v) => `<div class="analise__item analise__item--ruim">${miniatura(v.anuncio)}<div>
      <strong>${esc(v.anuncio)}</strong><p>${esc(v.porque)}</p></div></div>`).join("")}</div>
    <h3>Padrões</h3>${lista(c.padroes)}
    <h3>Sugestões de copy</h3>
    <div class="analise__grade">${(c.copys || []).map((k) => `<div class="analise__copy"><span class="para">${esc(k.para)}</span>
      <strong>${esc(k.titulo)}</strong><p>${esc(k.texto)}</p><span class="cta">${esc(k.cta)}</span></div>`).join("")}</div>
    <h3>Prompts para gerar imagens</h3>
    <div class="analise__grade">${(c.prompts || []).map((p, i) => `<div class="analise__prompt"><strong>${esc(p.nome)}</strong>
      <p id="prompt-${i}">${esc(p.prompt)}</p><button type="button" class="analise__copiar" data-copiar="prompt-${i}">Copiar</button></div>`).join("")}</div>
    <h3>Próximos testes</h3>${lista(c.proximos_testes)}`;
  document.querySelectorAll("[data-copiar]").forEach((b) => b.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(document.getElementById(b.dataset.copiar).textContent); b.textContent = "Copiado ✓"; setTimeout(() => { b.textContent = "Copiar"; }, 1500); } catch (e) {}
  }));
}

// ---------- Taxas por conta, por dia e hora a hora: CTR, carregamento da página e conversão da página ----------
// um gráfico por indicador; em cada um, a linha da Docis e a do Felipe, com a cabecinha no começo da linha.
// CTR = cliques ÷ impressões · carregamento = page views ÷ cliques · conversão = leads ÷ page views
const TAXAS = [
  { k: "ctr", nome: "CTR", dica: "cliques ÷ impressões", num: "cliques", den: "impressoes" },
  { k: "tx_lp", nome: "Carregamento da página", dica: "page views ÷ cliques", num: "page_views", den: "cliques" },
  { k: "conv_lp", nome: "Conversão da página", dica: "leads ÷ page views", num: "leads", den: "page_views" }
];
const CONTAS_TX = [
  { nome: "Docis", cor: "#eda100", cabeca: () => (typeof CABECA_CI !== "undefined" ? CABECA_CI : null) },
  { nome: "Felipe Russo", cor: "#4a3aa7", cabeca: () => (typeof CABECA_FELIPE !== "undefined" ? CABECA_FELIPE : null) }
];
const gTaxas = {};
// desenha a cabecinha da conta no primeiro ponto com valor de cada linha
const pluginCabecaLinha = {
  id: "cabecaLinha",
  afterDatasetsDraw(chart) {
    const ctx = chart.ctx;
    chart.data.datasets.forEach((ds, i) => {
      const meta = chart.getDatasetMeta(i); if (meta.hidden) return;
      const idx = ds.data.findIndex((v) => v != null); if (idx < 0) return;
      const pt = meta.data[idx]; if (!pt) return;
      if (ds.$rotulo) {
        ctx.save(); ctx.font = "800 10px Montserrat, sans-serif"; const tw = ctx.measureText(ds.$rotulo).width + 10;
        const y = pt.y - 22; // acima do ponto, para não cobrir as cabecinhas
        ctx.fillStyle = ds.borderColor; ctx.beginPath(); ctx.roundRect(pt.x - tw / 2, y - 9, tw, 18, 9); ctx.fill();
        ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(ds.$rotulo, pt.x, y + .5); ctx.restore();
        return;
      }
      const img = ds.$cabeca && ds.$cabeca(); if (!img || !img.complete || !img.naturalWidth) return;
      const h = 26, w = h * img.naturalWidth / img.naturalHeight;
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 3;
      ctx.drawImage(img, pt.x - w / 2, pt.y - h / 2, w, h); ctx.restore();
    });
  }
};
function opcoesTaxa(tx) {
  const o = opcoesGrafico({ legenda: false });
  o.layout = { padding: { left: 14, right: 8, top: 14 } };
  o.scales.y.ticks.precision = undefined;
  o.scales.y.ticks.callback = (v) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
  o.plugins.tooltip.callbacks.label = (c) => ` ${c.dataset.label}: ${c.parsed.y == null ? "—" : c.parsed.y.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%"}`;
  o.plugins.tooltip.callbacks.afterLabel = (c) => { const b = c.dataset.$base && c.dataset.$base[c.dataIndex]; return b ? `   ${fmt(b[tx.num])} ÷ ${fmt(b[tx.den])}` : ""; };
  return o;
}
function desenharTaxa(id, tx, labels, porConta) {
  const pc = (a, b) => (b ? +(a / b * 100).toFixed(2) : null);
  const datasets = CONTAS_TX.filter((c) => porConta.has(c.nome)).map((c) => {
    const lista = porConta.get(c.nome);
    return { label: c.nome, data: lista.map((r) => pc(r[tx.num], r[tx.den])), borderColor: c.cor, backgroundColor: c.cor, tension: .25, borderWidth: 2.5, pointRadius: 2, spanGaps: true, $base: lista, $cabeca: c.cabeca };
  });
  if (gTaxas[id]) { gTaxas[id].data.labels = labels; gTaxas[id].data.datasets = datasets; gTaxas[id].update(); return; }
  gTaxas[id] = new Chart($("#" + id), { type: "line", data: { labels, datasets }, options: opcoesTaxa(tx), plugins: [pluginCabecaLinha] });
}
function renderTaxas(f) {
  const alvo = $("#taxas");
  if (!alvo.dataset.montado) {
    alvo.dataset.montado = "1";
    alvo.innerHTML = TAXAS.map((tx) => `
      <div class="taxa">
        <h3>${tx.nome} <span class="t-nota">${tx.dica}</span></h3>
        <div class="taxa__par">
          <div><p class="taxa__sub">por dia</p><div class="grafico grafico--taxa"><canvas id="g-tx-${tx.k}-dia" aria-label="${tx.nome} por dia, Docis e Felipe Russo"></canvas></div></div>
          <div><p class="taxa__sub" id="sub-${tx.k}-hora">hora a hora</p><div class="grafico grafico--taxa"><canvas id="g-tx-${tx.k}-hora" aria-label="${tx.nome} hora a hora, Docis e Felipe Russo"></canvas></div></div>
        </div>
      </div>`).join("");
    [CABECA_CI, CABECA_FELIPE].forEach((img) => img.addEventListener("load", () => Object.values(gTaxas).forEach((g) => g.draw())));
  }
  const vazioT = () => ({ impressoes: 0, cliques: 0, page_views: 0, leads: 0 });
  const conta = (ad_id) => ADS.get(ad_id)?.conta || "Docis";

  // por dia, separado por conta
  const porDia = new Map(); // conta -> Map(dia -> totais)
  const gd = (c, d) => { if (!porDia.has(c)) porDia.set(c, new Map()); const m = porDia.get(c); if (!m.has(d)) m.set(d, vazioT()); return m.get(d); };
  VIS.insights.forEach((i) => {
    if (!adPassa(ADS.get(i.ad_id), f) || !diaPassa(i.dia, f) || !(i.impressoes > 0)) return;
    const r = gd(conta(i.ad_id), i.dia); r.impressoes += i.impressoes; r.cliques += i.cliques; r.page_views += i.page_views;
  });
  VIS.unicos.forEach((l) => {
    if (!diaPassa(l.dia, f)) return;
    const at = ATRIB.get(l.id); if (!at) return;
    at.forEach(({ ad_id, peso }) => { if (adPassa(ADS.get(ad_id), f) && porDia.get(conta(ad_id))?.has(l.dia)) gd(conta(ad_id), l.dia).leads += peso; });
  });
  const dias = [...new Set([...porDia.values()].flatMap((m) => [...m.keys()]))].sort();
  const porContaDia = new Map([...porDia].map(([c, m]) => [c, dias.map((d) => m.get(d) || vazioT())]));

  // hora a hora do dia escolhido, separado por conta (a hora em andamento fica de fora)
  const sel = $("#tx-dia");
  const diasHora = [...new Set(VIS.horas.map((r) => r[0]))].filter((d) => diaPassa(d, f)).sort().reverse();
  const atual = sel.value;
  sel.innerHTML = diasHora.map((d) => `<option value="${d}">${dataBR(d)}${d === hojeSP() ? " (hoje)" : ""}</option>`).join("");
  if (diasHora.includes(atual)) sel.value = atual;
  if (!sel.dataset.ligado) { sel.dataset.ligado = "1"; sel.addEventListener("change", () => renderTaxas(estadoFiltros())); }
  const dia = sel.value;
  const porHora = new Map();
  const gh = (c) => { if (!porHora.has(c)) porHora.set(c, Array.from({ length: 24 }, vazioT)); return porHora.get(c); };
  VIS.horas.forEach(([d, h, ad_id, , imp, cl, lpv]) => {
    if (d !== dia || !adPassa(ADS.get(ad_id), f)) return;
    const r = gh(conta(ad_id))[h]; r.impressoes += +imp || 0; r.cliques += +cl || 0; r.page_views += +lpv || 0;
  });
  VIS.unicos.forEach((l) => {
    if (l.dia !== dia) return;
    const at = ATRIB.get(l.id); if (!at) return;
    const h = parseInt(horaLead.format(new Date(l.criado_em)), 10);
    at.forEach(({ ad_id, peso }) => { if (adPassa(ADS.get(ad_id), f) && porHora.has(conta(ad_id))) gh(conta(ad_id))[h].leads += peso; });
  });
  const limite = dia === hojeSP() ? Math.floor(minutoSP(new Date()) / 60) - 1 : 23;
  let ult = 0; porHora.forEach((arr) => arr.forEach((r, h) => { if (r.impressoes && h > ult) ult = h; }));
  ult = Math.min(ult, limite);
  const labelsHora = Array.from({ length: Math.max(ult + 1, 0) }, (_, h) => `${String(h).padStart(2, "0")}h`);
  const porContaHora = new Map([...porHora].map(([c, arr]) => [c, arr.slice(0, ult + 1).map((r) => (r.impressoes ? r : { ...r, impressoes: 0 }))]));

  TAXAS.forEach((tx) => {
    desenharTaxa(`g-tx-${tx.k}-dia`, tx, dias.map((d) => dataBR(d).slice(0, 5)), porContaDia);
    desenharTaxa(`g-tx-${tx.k}-hora`, tx, labelsHora, porContaHora);
    $(`#sub-${tx.k}-hora`).textContent = `hora a hora · ${dia ? dataBR(dia) : "—"}`;
  });
}

// ---------- CTR por anúncio: vídeo × imagem ----------
// cada barra é um anúncio (com volume mínimo de impressões), cor pelo formato; linhas tracejadas = CTR médio de cada formato
let gCtrFmt = null, ctrFmtTodos = false;
const COR_FMT = { "Vídeo": "#eb6834", "Imagem": "#2a78d6" };
const MIN_IMPRESSOES_CTR = 1000;
const pluginMediasCtr = {
  id: "mediasCtr",
  afterDatasetsDraw(chart) {
    const m = chart.$medias; if (!m) return;
    const { ctx, chartArea: a, scales: { x } } = chart;
    Object.entries(m).forEach(([fmt, v]) => {
      if (v == null) return;
      const px = x.getPixelForValue(v);
      ctx.save(); ctx.strokeStyle = COR_FMT[fmt]; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
      ctx.beginPath(); ctx.moveTo(px, a.top); ctx.lineTo(px, a.bottom); ctx.stroke(); ctx.setLineDash([]);
      ctx.font = "800 10px Montserrat, sans-serif"; const txt = `média ${fmt.toLowerCase()} ${v.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
      const tw = ctx.measureText(txt).width + 10;
      ctx.fillStyle = COR_FMT[fmt]; ctx.beginPath(); ctx.roundRect(Math.min(px + 4, a.right - tw), fmt === "Vídeo" ? a.top + 2 : a.top + 22, tw, 17, 8); ctx.fill();
      ctx.fillStyle = "#fff"; ctx.textBaseline = "middle"; ctx.fillText(txt, Math.min(px + 4, a.right - tw) + 5, (fmt === "Vídeo" ? a.top + 2 : a.top + 22) + 9);
      ctx.restore();
    });
  }
};
function renderCtrFormato(f) {
  const porAd = new Map();
  VIS.insights.forEach((i) => {
    const a = ADS.get(i.ad_id);
    if (!adPassa(a, f) || !diaPassa(i.dia, f)) return;
    const r = porAd.get(i.ad_id) || { impressoes: 0, cliques: 0 };
    r.impressoes += i.impressoes; r.cliques += i.cliques; porAd.set(i.ad_id, r);
  });
  // junta anúncios com o mesmo nome e formato na mesma conta (cópias do mesmo criativo em conjuntos diferentes)
  const porItem = new Map();
  porAd.forEach((r, id) => {
    const a = ADS.get(id); if (!a || !["Vídeo", "Imagem"].includes(a.formato)) return;
    const k = `${a.conta}|${a.anuncio}`;
    const x = porItem.get(k) || { nome: a.anuncio, conta: a.conta, formato: a.formato, impressoes: 0, cliques: 0 };
    x.impressoes += r.impressoes; x.cliques += r.cliques; porItem.set(k, x);
  });
  const todosItens = [...porItem.values()].filter((x) => x.impressoes >= MIN_IMPRESSOES_CTR)
    .map((x) => ({ ...x, ctr: x.cliques / x.impressoes * 100 })).sort((a, b) => b.ctr - a.ctr);
  const media = (fmt) => { const l = [...porItem.values()].filter((x) => x.formato === fmt); const im = l.reduce((s, x) => s + x.impressoes, 0); return im ? l.reduce((s, x) => s + x.cliques, 0) / im * 100 : null; };
  const medias = { "Vídeo": media("Vídeo"), "Imagem": media("Imagem") };
  const qtd = (fmt) => todosItens.filter((x) => x.formato === fmt).length;
  $("#ctr-fmt-resumo").innerHTML = ["Vídeo", "Imagem"].map((fmt) => `<span class="ctr-fmt__chip" style="--cor:${COR_FMT[fmt]}">${fmt === "Vídeo" ? "▶" : "▣"} ${fmt}: <b>${medias[fmt] == null ? "—" : medias[fmt].toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%"}</b> <small>${qtd(fmt)} anúncio${qtd(fmt) === 1 ? "" : "s"}</small></span>`).join("")
    + (medias["Vídeo"] && medias["Imagem"] ? `<span class="t-nota">${medias["Vídeo"] > medias["Imagem"] ? "vídeo" : "imagem"} com CTR ${Math.abs((medias["Vídeo"] / medias["Imagem"] - 1) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}% maior</span>` : "");
  // mostra os 20 primeiros; o botão abre a lista toda
  const btn = $("#ctr-fmt-todos");
  if (!btn.dataset.ligado) { btn.dataset.ligado = "1"; btn.addEventListener("click", () => { ctrFmtTodos = !ctrFmtTodos; renderCtrFormato(estadoFiltros()); }); }
  btn.hidden = todosItens.length <= 20;
  btn.textContent = ctrFmtTodos ? "Mostrar só os 20 primeiros" : `Ver todos (${todosItens.length})`;
  const itens = ctrFmtTodos ? todosItens : todosItens.slice(0, 20);
  const wrap = $("#ctr-fmt-wrap"); wrap.style.height = Math.max(160, itens.length * 26 + 50) + "px";
  const labels = itens.map((x) => `${x.formato === "Vídeo" ? "▶" : "▣"} ${x.nome}${x.conta === "Felipe Russo" ? " · Felipe" : ""}`);
  const data = itens.map((x) => +x.ctr.toFixed(2));
  const cores = itens.map((x) => COR_FMT[x.formato]);
  if (gCtrFmt) { gCtrFmt.data.labels = labels; gCtrFmt.data.datasets[0].data = data; gCtrFmt.data.datasets[0].backgroundColor = cores; gCtrFmt.$itens = itens; gCtrFmt.$medias = medias; gCtrFmt.resize(); gCtrFmt.update(); return; }
  const o = opcoesGrafico({});
  o.indexAxis = "y";
  o.layout = { padding: { top: 40, right: 8 } };
  o.interaction = { mode: "nearest", intersect: true, axis: "y" };
  o.scales.x = { beginAtZero: true, grid: { color: "#f1ece6" }, border: { display: false }, ticks: { color: "#8a857f", font: { family: "Montserrat", size: 11 }, callback: (v) => v + "%" } };
  o.scales.y = { grid: { display: false }, ticks: { color: "#3a3634", font: { family: "Montserrat", size: 11, weight: "600" }, autoSkip: false } };
  o.plugins.tooltip.callbacks.title = (items) => gCtrFmt.$itens[items[0].dataIndex].nome;
  o.plugins.tooltip.callbacks.label = (c) => { const x = gCtrFmt.$itens[c.dataIndex]; return ` CTR ${c.parsed.x.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% · ${fmt(x.cliques)} cliques ÷ ${fmt(x.impressoes)} impressões · ${x.formato} · ${x.conta}`; };
  gCtrFmt = new Chart($("#g-ctr-fmt"), { type: "bar", data: { labels, datasets: [{ label: "CTR", data, backgroundColor: cores, borderRadius: 4, barThickness: 16 }] }, options: o, plugins: [pluginMediasCtr] });
  gCtrFmt.$itens = itens; gCtrFmt.$medias = medias;
}
