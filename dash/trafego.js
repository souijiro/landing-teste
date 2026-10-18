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
    // formato pela Meta; se não vier, pelo arquivo do Drive
    formato: (a[15] || (criativoDe(a[1])?.tipo === "vid" ? "video" : "imagem")) === "video" ? "Vídeo" : "Imagem"
  }));
  ADS = new Map(TRAF.ads.map((a) => [a.ad_id, a]));
  TRAF.insights = (d.insights || []).map((r) => ({ dia: r[0], ad_id: r[1], investimento: +r[2] || 0, impressoes: +r[3] || 0, cliques: +r[4] || 0, page_views: +r[5] || 0, leads_meta: +r[6] || 0, alcance: +r[7] || 0 }));
  TRAF.alcance = {};
  (d.alcance || []).forEach(([nivel, chave, periodo, v]) => { TRAF.alcance[`${nivel}|${chave}|${periodo}`] = +v || 0; });
  TRAF.sync = d.sync; TRAF.ultimaOk = d.ultima_sync_ok;
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
  return { de: $("#t-de").value, ate: $("#t-ate").value, sel };
}
const adPassa = (a, f) => a && f.sel.every(([c, v]) => (a[c] || "") === v);
const diaPassa = (d, f) => (!f.de || d >= f.de) && (!f.ate || d <= f.ate);

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
  TRAF.insights.forEach((i) => {
    const a = ADS.get(i.ad_id);
    if (!adPassa(a, f) || !diaPassa(i.dia, f)) return;
    const r = g(dim ? chaveDim(a, dim) : "total");
    r.investimento += i.investimento; r.impressoes += i.impressoes; r.cliques += i.cliques;
    r.page_views += i.page_views; r.leads_meta += i.leads_meta; r.alcance += i.alcance;
    if (dim === "anuncio") { r.campanha = a.campanha; r.conjunto = a.conjunto; r.formato = a.formato; }
    if (dim === "conjunto") r.campanha = a.campanha;
  });
  UNICOS.forEach((l) => {
    const at = ATRIB.get(l.id);
    if (!at || !diaPassa(l.dia, f)) return;
    const gl = grupoLead(l);
    at.forEach(({ ad_id, peso }) => { const a = ADS.get(ad_id); if (adPassa(a, f)) { const r = g(dim ? chaveDim(a, dim) : "total"); r.leads += peso; r[gl] += peso; } });
  });
  // alcance deduplicado quando dá (período inteiro e nível da Meta, ou total sem filtro)
  grupos.forEach((r, k) => {
    if (!dim && !f.sel.length && periodoTodo && TRAF.alcance["conta|total|total"] != null) { r.alcance = TRAF.alcance["conta|total|total"]; r.alcanceAprox = false; }
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
  const f = estadoFiltros();
  const total = agregar(f, null).get("total") || derivar(vazio());

  // status da sincronização
  const s = TRAF.sync;
  $("#t-sync").textContent = !TRAF.ultimaOk ? "Ainda sem dados da Meta" :
    `Dados da Meta de ${horaSP.format(new Date(TRAF.ultimaOk))} · atualiza de hora em hora` + (s && !s.ok ? ` · ⚠ última tentativa falhou: ${s.mensagem}` : "");

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
    compara = Math.abs(dif) <= 0.10 ? `<p class="kpi__sub kpi__comp kpi__comp--igual">≈ igual à média geral</p>`
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
  const semAnuncio = UNICOS.filter((l) => l.tipo === "Tráfego" && !ATRIB.has(l.id) && diaPassa(l.dia, f)).length;
  $("#t-aviso").hidden = !semAnuncio;
  $("#t-aviso").textContent = `${fmt(semAnuncio)} lead${semAnuncio === 1 ? "" : "s"} de tráfego no período não ${semAnuncio === 1 ? "bateu" : "bateram"} com nenhum anúncio blf26 (UTMs diferentes ou anúncio de outra campanha) e não ${semAnuncio === 1 ? "entra" : "entram"} no CPL.`;

  renderContas(f);
  if (diaHora) carregarHora(diaHora); // atualiza o dia que já estava aberto
  renderCplDia(f);                     // na primeira vez, abre o último dia
  renderDiaTrafego(f);
  renderTop5(f);
  renderRanking();
}

function renderDiaTrafego(f) {
  const porDia = new Map();
  const g = (d) => { if (!porDia.has(d)) porDia.set(d, Object.assign(vazio(), { org: 0, traf: 0, alcanceAprox: true })); return porDia.get(d); };
  TRAF.insights.forEach((i) => {
    const a = ADS.get(i.ad_id);
    if (!adPassa(a, f) || !diaPassa(i.dia, f)) return;
    const r = g(i.dia);
    r.investimento += i.investimento; r.impressoes += i.impressoes; r.cliques += i.cliques; r.page_views += i.page_views; r.leads_meta += i.leads_meta; r.alcance += i.alcance;
  });
  UNICOS.forEach((l) => {
    if (!diaPassa(l.dia, f)) return;
    if (l.tipo === "Orgânico") g(l.dia).org++;
    if (l.tipo === "Tráfego") g(l.dia).traf++;
    const at = ATRIB.get(l.id);
    if (at) at.forEach(({ ad_id, peso }) => { if (adPassa(ADS.get(ad_id), f)) g(l.dia).leads += peso; });
  });
  porDia.forEach((r, d) => {
    if (!f.sel.length && TRAF.alcance[`conta|total|${d}`] != null) { r.alcance = TRAF.alcance[`conta|total|${d}`]; r.alcanceAprox = false; }
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
  (TRAF.horas || []).forEach(([d, hora, ad_id, , imp, cl, lpv]) => {
    if (hora >= horaAtual || !adPassa(ADS.get(ad_id), f)) return;
    const r = gh(d); r.impressoes += +imp || 0; r.cliques += +cl || 0; r.page_views += +lpv || 0;
  });
  UNICOS.forEach((l) => {
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
    const r = valor / ref;
    if (Math.abs(r - 1) <= FAIXA_IGUAL) return "";
    const sobe = r > 1;
    const bom = SOBE_RUIM.includes(col) ? !sobe : sobe;
    return ` class="n ${bom ? "cel--bom" : "cel--ruim"}" title="${sobe ? "acima" : "abaixo"} da média geral em ${taxa(Math.abs(r - 1), 1)}"`;
  };
  const celCor = (col, r, d) => {
    const parcial = d === hoje;
    let valor = r[col], ref = media[col];
    if (parcial && CONTAGENS.includes(col)) {
      if (col === "alcance") return `<td class="n">${celula(col, r)}</td>`; // sem alcance por hora
      valor = ateHora.get(d)?.[col] || 0; ref = mediaAteHora[col];
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
$("#t-limpar").addEventListener("click", () => {
  $("#t-de").value = ""; $("#t-ate").value = "";
  document.querySelectorAll("#t-selects select").forEach((s) => { s.value = "__todos"; });
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
function renderCplDia(f) {
  const porDia = new Map();
  const g = (d) => { if (!porDia.has(d)) porDia.set(d, { inv: 0, leads: 0 }); return porDia.get(d); };
  TRAF.insights.forEach((i) => { if (adPassa(ADS.get(i.ad_id), f) && diaPassa(i.dia, f)) g(i.dia).inv += i.investimento; });
  UNICOS.forEach((l) => {
    const at = ATRIB.get(l.id); if (!at || !diaPassa(l.dia, f)) return;
    at.forEach(({ ad_id, peso }) => { if (adPassa(ADS.get(ad_id), f)) g(l.dia).leads += peso; });
  });
  const dias = [...porDia.keys()].sort();
  const cpl = dias.map((d) => { const r = porDia.get(d); return r.leads ? +(r.inv / r.leads).toFixed(2) : null; });
  const labels = dias.map(dataBR);
  if (gCpl) { gCpl.data.labels = labels; gCpl.data.datasets[0].data = cpl; gCpl.$dias = dias; gCpl.$porDia = porDia; gCpl.update(); return; }
  const o = opcoesGrafico({});
  o.interaction = { mode: "nearest", intersect: false, axis: "x" };
  o.plugins.tooltip.callbacks.label = (c) => ` CPL: ${brl(c.parsed.y)}`;
  o.plugins.tooltip.callbacks.afterLabel = (c) => { const r = gCpl.$porDia.get(gCpl.$dias[c.dataIndex]); return r ? ` Investimento: ${brl(r.inv)} · Leads: ${num1(r.leads)}` : ""; };
  o.plugins.tooltip.callbacks.footer = () => "Clique para ver hora a hora";
  o.scales.y.ticks.callback = (v) => brl(v);
  o.onClick = (ev, els) => { const el = els[0]; if (el) carregarHora(gCpl.$dias[el.index]); };
  o.onHover = (ev, els) => { ev.native.target.style.cursor = els.length ? "pointer" : "default"; };
  gCpl = new Chart($("#g-cpl"), { type: "line", data: { labels, datasets: [{ label: "CPL", data: cpl, borderColor: "#2a78d6", backgroundColor: "#2a78d6", borderWidth: 2, pointRadius: 5, pointHoverRadius: 8, tension: .25, spanGaps: true }] }, options: o });
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
  const inv = Array(24).fill(0), leads = Array(24).fill(0);
  linhas.forEach(([h, ad_id, v]) => { if (adPassa(ADS.get(ad_id), f)) inv[h] += +v || 0; });
  UNICOS.forEach((l) => {
    if (l.dia !== dia) return; const at = ATRIB.get(l.id); if (!at) return;
    const h = parseInt(horaLead.format(new Date(l.criado_em)), 10);
    at.forEach(({ ad_id, peso }) => { if (adPassa(ADS.get(ad_id), f)) leads[h] += peso; });
  });
  let ai = 0, al = 0;
  const cplHora = inv.map((v, h) => (leads[h] ? +(v / leads[h]).toFixed(2) : null));
  const cplAcum = inv.map((v, h) => { ai += v; al += leads[h]; return al ? +(ai / al).toFixed(2) : null; });
  const ult = Math.max(...inv.map((v, h) => (v || leads[h] ? h : -1)), 0);
  const labels = Array.from({ length: ult + 1 }, (_, h) => `${String(h).padStart(2, "0")}h`);
  const ds = [
    { label: "CPL da hora", data: cplHora.slice(0, ult + 1), borderColor: "#eb6834", backgroundColor: "#eb6834", borderWidth: 2, pointRadius: 3, spanGaps: true, tension: .2 },
    { label: "CPL acumulado do dia", data: cplAcum.slice(0, ult + 1), borderColor: "#0b0b0b", backgroundColor: "#0b0b0b", borderWidth: 2, pointRadius: 0, tension: .2, spanGaps: true }
  ];
  $("#hora-nota").textContent = `${brl(inv.reduce((s, v) => s + v, 0))} · ${num1(leads.reduce((s, v) => s + v, 0))} leads · horário de Brasília`;
  if (gHora) { gHora.data.labels = labels; gHora.data.datasets.forEach((d, i) => { d.data = ds[i].data; }); gHora.$inv = inv; gHora.$leads = leads; gHora.update(); return; }
  const o = opcoesGrafico({ legenda: true });
  o.plugins.tooltip.callbacks.label = (c) => ` ${c.dataset.label}: ${c.parsed.y == null ? "—" : brl(c.parsed.y)}`;
  o.plugins.tooltip.callbacks.afterBody = (items) => { const h = items[0].dataIndex; return `Investimento: ${brl(gHora.$inv[h])} · Leads: ${num1(gHora.$leads[h])}`; };
  o.scales.y.ticks.callback = (v) => brl(v);
  gHora = new Chart($("#g-hora"), { type: "line", data: { labels, datasets: ds }, options: o });
  gHora.$inv = inv; gHora.$leads = leads;
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
