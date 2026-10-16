// Aba Tráfego — cruza os dados da Meta (meta_*_black2026) com os leads pelas UTMs.
// Usa LEADS, UNICOS, fmt, pct, esc, dataBR, diaSP, $ de dash.js.

const brl = (n) => (Number.isFinite(n) ? n : 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const brl2 = (n) => (Number.isFinite(n) && n > 0 ? brl(n) : "—");
const taxa = (a, b) => (b ? (a / b * 100).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + "%" : "—");
const num1 = (n) => (n < 10 && n % 1 ? n.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : fmt(n));

const UTMS_AD = ["utm_source", "utm_campaign", "utm_content", "utm_term"]; // utm_medium = {{placement}}, não resolvível
const DIMENSOES = [
  ["campanha", "Campanha (Meta)"], ["conjunto", "Conjunto (Meta)"], ["anuncio", "Anúncio (Meta)"],
  ["utm_source", "utm_source"], ["utm_campaign", "utm_campaign"], ["utm_content", "utm_content"], ["utm_term", "utm_term"]
];
const COLUNAS = [
  ["investimento", "Investimento", brl], ["impressoes", "Impressões", fmt], ["cliques", "Cliques", fmt],
  ["page_views", "Page views", fmt], ["leads", "Leads", num1], ["leads_meta", "Leads (Meta)", fmt], ["alcance", "Alcance", (v, r) => (r.alcanceAprox ? "≈ " : "") + fmt(v)],
  ["tx_lp", "Tx carreg. LP", null], ["cpm", "CPM", null], ["ctr", "CTR", null], ["cpc", "CPC", null],
  ["conv_cliques", "Conv. cliques→leads", null], ["conv_lp", "Conv. LP", null], ["cpl", "CPL", null]
];

let TRAF = { ads: [], insights: [], alcance: {}, sync: null, ultimaOk: null };
let ADS = new Map();          // ad_id -> anúncio
let ATRIB = new Map();        // lead.id -> [{ad_id, peso}]
let ordem = { col: "investimento", dir: -1 };
let gInv = null;
try { const o = JSON.parse(localStorage.getItem("dash_traf_ordem") || "null"); if (o) ordem = o; } catch (e) {}

const norm = (v) => String(v ?? "").trim().toLowerCase();

function prepararTrafego(d) {
  TRAF.ads = (d.ads || []).map((a) => ({
    ad_id: a[0], anuncio: a[1] || a[0], adset_id: a[2], conjunto: a[3] || a[2], campaign_id: a[4], campanha: a[5] || a[4], status: a[6],
    utm_source: a[7], utm_medium: a[8], utm_campaign: a[9], utm_content: a[10], utm_term: a[11], url_tags: a[12]
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
const FILTROS_T = [["campanha", "Campanha"], ["conjunto", "Conjunto"], ["anuncio", "Anúncio"], ["utm_source", "utm_source"], ["utm_campaign", "utm_campaign"], ["utm_content", "utm_content"], ["utm_term", "utm_term"]];

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
function vazio() { return { investimento: 0, impressoes: 0, cliques: 0, page_views: 0, leads: 0, leads_meta: 0, alcance: 0, alcanceAprox: true }; }
function derivar(r) {
  r.tx_lp = r.cliques ? r.page_views / r.cliques : null;
  r.cpm = r.impressoes ? r.investimento / r.impressoes * 1000 : null;
  r.ctr = r.impressoes ? r.cliques / r.impressoes : null;
  r.cpc = r.cliques ? r.investimento / r.cliques : null;
  r.conv_cliques = r.cliques ? r.leads / r.cliques : null;
  r.conv_lp = r.page_views ? r.leads / r.page_views : null;
  r.cpl = r.leads ? r.investimento / r.leads : null;
  return r;
}
const fmtDerivada = { tx_lp: (v) => (v == null ? "—" : taxa(v, 1)), ctr: (v) => (v == null ? "—" : taxa(v, 1)), conv_cliques: (v) => (v == null ? "—" : taxa(v, 1)), conv_lp: (v) => (v == null ? "—" : taxa(v, 1)), cpm: (v) => (v == null ? "—" : brl(v)), cpc: (v) => (v == null ? "—" : brl(v)), cpl: (v) => (v == null ? "—" : brl(v)) };
function celula(col, r) {
  const def = COLUNAS.find((c) => c[0] === col);
  if (fmtDerivada[col]) return fmtDerivada[col](r[col]);
  return def[2](r[col], r);
}

function chaveDim(a, dim) { return dim === "campanha" ? a.campanha : dim === "conjunto" ? a.conjunto : dim === "anuncio" ? a.anuncio : (a[dim] || "(vazio)"); }

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
    if (dim === "anuncio") { r.campanha = a.campanha; r.conjunto = a.conjunto; }
    if (dim === "conjunto") r.campanha = a.campanha;
  });
  UNICOS.forEach((l) => {
    const at = ATRIB.get(l.id);
    if (!at || !diaPassa(l.dia, f)) return;
    at.forEach(({ ad_id, peso }) => { const a = ADS.get(ad_id); if (adPassa(a, f)) g(dim ? chaveDim(a, dim) : "total").leads += peso; });
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

  // KPIs
  const kpis = [
    ["Investimento", brl(total.investimento)], ["Impressões", fmt(total.impressoes)], ["Cliques", fmt(total.cliques)],
    ["Page views", fmt(total.page_views)], ["Leads", num1(total.leads)], ["Alcance", (total.alcanceAprox ? "≈ " : "") + fmt(total.alcance)],
    ["Tx carregamento LP", fmtDerivada.tx_lp(total.tx_lp)], ["CPM", fmtDerivada.cpm(total.cpm)], ["CTR", fmtDerivada.ctr(total.ctr)],
    ["CPC", fmtDerivada.cpc(total.cpc)], ["Conv. cliques → leads", fmtDerivada.conv_cliques(total.conv_cliques)],
    ["Conv. LP", fmtDerivada.conv_lp(total.conv_lp)], ["CPL", fmtDerivada.cpl(total.cpl)]
  ];
  $("#t-kpis").innerHTML = kpis.map(([r, v], i) => `<div class="kpi${i === 0 || i === 12 ? " kpi--destaque" : ""}"><p class="rotulo">${r}</p><p class="kpi__num">${v}</p></div>`).join("");

  // leads de tráfego sem anúncio identificado
  const semAnuncio = UNICOS.filter((l) => l.tipo === "Tráfego" && !ATRIB.has(l.id) && diaPassa(l.dia, f)).length;
  $("#t-aviso").hidden = !semAnuncio;
  $("#t-aviso").textContent = `${fmt(semAnuncio)} lead${semAnuncio === 1 ? "" : "s"} de tráfego no período não ${semAnuncio === 1 ? "bateu" : "bateram"} com nenhum anúncio blf26 (UTMs diferentes ou anúncio de outra campanha) e não ${semAnuncio === 1 ? "entra" : "entram"} no CPL.`;

  renderDiaTrafego(f);
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
  $("#tr-dia tbody").innerHTML = dias.map((d) => {
    const r = porDia.get(d);
    return `<tr><td>${dataBR(d)}</td><td class="n">${fmt(r.org)}</td><td class="n">${fmt(r.traf)}</td>${cols.map((c) => `<td class="n">${celula(c, r)}</td>`).join("")}</tr>`;
  }).join("") || `<tr><td colspan="16" class="vazio">Sem dados no período.</td></tr>`;

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
  const grupos = [...agregar(f, dim).entries()];
  const val = (r) => (ordem.col === "nome" ? null : r[ordem.col]);
  grupos.sort((a, b) => {
    if (ordem.col === "nome") return ordem.dir * a[0].localeCompare(b[0], "pt-BR", { numeric: true });
    const va = val(a[1]), vb = val(b[1]);
    if (va == null && vb == null) return 0; if (va == null) return 1; if (vb == null) return -1;
    return ordem.dir * (va - vb);
  });
  const seta = (c) => (ordem.col === c ? (ordem.dir > 0 ? " ▲" : " ▼") : "");
  const nomeDim = DIMENSOES.find((d) => d[0] === dim)[1];
  $("#t-rank thead").innerHTML = `<tr><th data-col="nome" class="ordenavel">${esc(nomeDim)}${seta("nome")}</th>${COLUNAS.map(([c, n]) => `<th data-col="${c}" class="n ordenavel">${n}${seta(c)}</th>`).join("")}</tr>`;
  $("#t-rank tbody").innerHTML = grupos.map(([k, r]) => `<tr>
    <td title="${esc(k)}"><strong>${esc(k)}</strong>${r.campanha ? `<span class="sub">${esc(r.campanha)}${r.conjunto ? " · " + esc(r.conjunto) : ""}</span>` : ""}</td>
    ${COLUNAS.map(([c]) => `<td class="n">${celula(c, r)}</td>`).join("")}</tr>`).join("") || `<tr><td colspan="${COLUNAS.length + 1}" class="vazio">Sem dados.</td></tr>`;
  $("#t-rank-info").textContent = `${fmt(grupos.length)} ${grupos.length === 1 ? "linha" : "linhas"} · clique no título da coluna para ordenar`;
  $("#t-rank thead").querySelectorAll("th").forEach((th) => th.addEventListener("click", () => {
    const c = th.dataset.col;
    ordem = { col: c, dir: ordem.col === c ? -ordem.dir : (c === "nome" ? 1 : -1) };
    try { localStorage.setItem("dash_traf_ordem", JSON.stringify(ordem)); } catch (e) {}
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
