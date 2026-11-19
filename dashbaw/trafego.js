// Aba Tráfego do dash BAW: Meta por anúncio (baw_anuncio_dia + baw_anuncios via RPC dash_baw_trafego)
// cruzada com as vendas reais da Hotmart. A venda chega com sck = "<posicionamento>hQwK21wXxR<campanha>hQwK21wXxRpaid
// hQwK21wXxR<conjunto>hQwK21wXxR<anúncio>" (nomes do momento do clique) → venda vai para o anúncio com esse nome.
// Usa as funções e o período global do app.js (SEL, MODO, noPer, V, APROV, fmt, brl, pct…).
const SEP_SCK = "hQwK21wXxR";
let TR = { dia: [], anuncios: [] }, TR_DIA = [], ADS = new Map(), TF = { campanha: "", conjunto: "", formato: "" };
let TR_DIM = "anuncio", TR_ORD = { col: "cpa", dir: 1 };

const normNome = (s) => String(s || "").toUpperCase().replace(/\s*[—–-]\s*(C[ÓO]PIA|COPY)(\s*\d+)?\s*$/i, "").replace(/\s+/g, " ").trim();
function lerSck(sck) {
  const p = String(sck || "").split(SEP_SCK);
  if (p.length < 5) return null;
  return { posicionamento: p[0] || "?", campanha: p[1], conjunto: p[3], anuncio: p.slice(4).join(SEP_SCK) };
}
// desde 16/11 a página manda src = "perfil|nome do anúncio" (antes vinha o caminho completo no sck, pelo Utmify)
const perfilDe = (v) => String(v.src || "").split("|")[0].trim() || "(sem perfil)";
function origemVenda(v) {
  const s = lerSck(v.sck); if (s) return s;
  const i = String(v.src || "").indexOf("|");
  if (i >= 0 && v.src.slice(i + 1).trim()) return { posicionamento: "", campanha: null, conjunto: null, anuncio: v.src.slice(i + 1).trim() };
  return null;
}
const NOME_POS = { ig: "Instagram", fb: "Facebook", wa: "WhatsApp", an: "Audience Network", msg: "Messenger", th: "Threads" };

function prepararTrafego(d) {
  TR = d || { dia: [], anuncios: [] };
  ADS = new Map((TR.anuncios || []).map((a) => [a.id, a]));
  TR_DIA = (TR.dia || []).map((r) => ({
    dia: r[0], ad: r[1], inv: +r[2] || 0, imp: +r[3] || 0, alc: +r[4] || 0, cli: +r[5] || 0, link: +r[6] || 0, lpv: +r[7] || 0,
    chk: +r[8] || 0, cmp: +r[9] || 0, vcmp: +r[10] || 0, v3: +r[11] || 0, thru: +r[12] || 0,
    sem: semanaDoDia(r[0]), mes: r[0].slice(0, 7)
  }));
}

// vendas do low (com bumps) atribuídas a anúncio pelo sck
function vendasRastreadas() {
  const porNome = new Map();
  for (const a of ADS.values()) { const k = normNome(a.nome); if (!porNome.has(k)) porNome.set(k, []); porNome.get(k).push(a.id); }
  const gastoDia = new Map(); for (const r of TR_DIA) gastoDia.set(r.dia + "|" + r.ad, (gastoDia.get(r.dia + "|" + r.ad) || 0) + r.inv);
  const bumpsDe = new Map(); for (const v of APROV) if (v.tipo === "ob_low") { const l = bumpsDe.get(v.pai) || []; l.push(v); bumpsDe.set(v.pai, l); }
  return APROV.filter((v) => v.tipo === "low").map((v) => {
    const s = origemVenda(v);
    const ob = bumpsDe.get(v.t) || [];
    const fat = v.fat + ob.reduce((x, b) => x + b.fat, 0);
    let ad = null;
    if (s) {
      const ids = porNome.get(normNome(s.anuncio)) || [];
      // mesmo nome em mais de um anúncio: fica com o que mais gastou no dia da venda
      ad = ids.sort((a, b) => (gastoDia.get(v.dia + "|" + b) || 0) - (gastoDia.get(v.dia + "|" + a) || 0))[0] || null;
    }
    return { v, sck: s, ad, fat, ob: ob.length, pos: !s ? "Sem rastreio" : s.posicionamento ? (NOME_POS[s.posicionamento] || s.posicionamento) : "Não informado (src)", perfil: perfilDe(v) };
  });
}

// ---------- filtros ----------
function passaFiltro(adId) {
  const a = ADS.get(adId) || {};
  return (!TF.campanha || a.campanha_id === TF.campanha) && (!TF.conjunto || a.conjunto_id === TF.conjunto) && (!TF.formato || (a.formato || "outro") === TF.formato);
}
function montarFiltrosTrafego() {
  const opc = (lista, sel, todos) => `<option value="">${todos}</option>` + lista.map(([v, n]) => `<option value="${esc(v)}" ${v === sel ? "selected" : ""}>${esc(n)}</option>`).join("");
  const camp = new Map(), conj = new Map(), fmts = new Set();
  for (const a of ADS.values()) {
    if (a.campanha_id) camp.set(a.campanha_id, a.campanha);
    if (a.conjunto_id && (!TF.campanha || a.campanha_id === TF.campanha)) conj.set(a.conjunto_id, a.conjunto);
    fmts.add(a.formato || "outro");
  }
  if (TF.conjunto && !conj.has(TF.conjunto)) TF.conjunto = "";
  $("#tf-campanha").innerHTML = opc([...camp.entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1]))), TF.campanha, "Todas as campanhas");
  $("#tf-conjunto").innerHTML = opc([...conj.entries()].sort((a, b) => String(a[1]).localeCompare(String(b[1]))), TF.conjunto, "Todos os conjuntos");
  const NF = { video: "Vídeo", imagem: "Imagem", carrossel: "Carrossel", outro: "Outro" };
  $("#tf-formato").innerHTML = opc([...fmts].map((f) => [f, NF[f] || f]), TF.formato, "Todos os formatos");
}
["campanha", "conjunto", "formato"].forEach((k) => document.addEventListener("change", (e) => {
  if (e.target.id !== "tf-" + k) return; TF[k] = e.target.value; if (k === "campanha") TF.conjunto = ""; renderTrafego();
}));

// ---------- métricas ----------
function vazioT() { return { inv: 0, imp: 0, alc: 0, link: 0, lpv: 0, chk: 0, cmp: 0, vcmp: 0, v3: 0, thru: 0, vendas: 0, fat: 0, ob: 0 }; }
function somar(a, r) { for (const k of ["inv", "imp", "alc", "link", "lpv", "chk", "cmp", "vcmp", "v3", "thru"]) a[k] += r[k] || 0; return a; }
function derivarT(m) {
  return { ...m, cpm: div(m.inv * 1000, m.imp), ctr: div(m.link, m.imp), cpc: div(m.inv, m.link), txLpv: div(m.lpv, m.link),
    cpChk: div(m.inv, m.chk), cpaMeta: div(m.inv, m.cmp), cpa: div(m.inv, m.vendas), roas: div(m.fat, m.inv),
    hook: div(m.v3, m.imp), hold: div(m.thru, m.v3), conv: div(m.vendas, m.link) };
}
// agrupa linhas do período por dimensão (anúncio/conjunto/campanha/formato/dia)
function agregarT(k, dim) {
  const g = new Map();
  const chaveDe = (adId, dia) => { const a = ADS.get(adId) || {}; return dim === "anuncio" ? adId : dim === "conjunto" ? a.conjunto_id || "?" : dim === "campanha" ? a.campanha_id || "?" : dim === "formato" ? a.formato || "outro" : dia; };
  for (const r of TR_DIA) if (noPer(r, k) && passaFiltro(r.ad)) { const c = chaveDe(r.ad, r.dia); g.set(c, somar(g.get(c) || vazioT(), r)); }
  for (const s of VR) if (noPer(s.v, k) && s.ad && passaFiltro(s.ad)) { const c = chaveDe(s.ad, s.v.dia); const m = g.get(c) || vazioT(); m.vendas++; m.fat += s.fat; m.ob += s.ob; g.set(c, m); }
  return g;
}
let VR = [];

// ---------- render ----------
const pctT = (x) => (isFinite(x) ? (x * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%" : "—");
const brlT = (x) => (isFinite(x) ? brl(x) : "—");
const num2T = (x) => (isFinite(x) ? x.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—");
function thumbDe(adId, cls = "thumb") {
  const a = ADS.get(adId);
  return a?.thumb ? `<img class="${cls}" src="${esc(a.thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer" data-ad="${esc(adId)}">` : `<span class="${cls} thumb--vazia" data-ad="${esc(adId)}"></span>`;
}
const NOME_FMT = { video: "▶ vídeo", imagem: "▣ imagem", carrossel: "▤ carrossel", outro: "· outro" };

function renderTrafego() {
  if (!$("#aba-trafego")) return;
  VR = vendasRastreadas();
  montarFiltrosTrafego();
  const tot = derivarT([...agregarT(SEL, "campanha").values()].reduce((a, m) => { somar(a, m); a.vendas += m.vendas; a.fat += m.fat; a.ob += m.ob; return a; }, vazioT()));
  const todasLow = APROV.filter((v) => v.tipo === "low" && noPer(v)).length;
  const semRastreio = VR.filter((s) => noPer(s.v) && !s.sck).length, naoAchado = VR.filter((s) => noPer(s.v) && s.sck && !s.ad).length;
  const filtrado = TF.campanha || TF.conjunto || TF.formato;
  $("#tr-kpis").innerHTML = [
    kpi("Investimento", brl0(tot.inv), `${fmt(tot.imp)} impressões · CPM ${brlT(tot.cpm)}`, "kpi--preto"),
    kpi("CTR (link)", pctT(tot.ctr), `${fmt(tot.link)} cliques · CPC ${brlT(tot.cpc)}`),
    kpi("Página carregada", pctT(tot.txLpv), `${fmt(tot.lpv)} LPV dos cliques`),
    kpi("Checkouts (Meta)", fmt(tot.chk), `custo ${brlT(tot.cpChk)}`),
    kpi("Compras (Meta)", fmt(tot.cmp), `CPA Meta ${brlT(tot.cpaMeta)}`),
    kpi("Vendas Hotmart rastreadas", fmt(tot.vendas), `CPA real ${brlT(tot.cpa)} · ROAS ${num2T(tot.roas)}`, "kpi--preto"),
    kpi("Todas as vendas do low", fmt(todasLow), filtrado ? "sem filtro de campanha" : `CPA geral ${brlT(div(tot.inv, todasLow))}`),
    kpi("Hook (3 s)", pctT(tot.hook), `retenção até o fim ${pctT(tot.hold)}`)
  ].join("");
  $("#tr-aviso").textContent = (semRastreio || naoAchado) ? `${semRastreio} venda(s) do low sem o anúncio no sck nem no src (orgânico, link direto ou de 15/11 a 16/11 20h, quando a página não mandava o anúncio) e ${naoAchado} com nome de anúncio que não achei na Meta — não entram nas colunas por anúncio.` : "";
  funil($("#tr-funil"), [
    ["Impressões", tot.imp, "#57534e"], ["Cliques no link", tot.link, "#2a78d6"], ["Página carregada", tot.lpv, "#2a78d6"],
    ["Checkouts (Meta)", tot.chk, "#1d4f91"], ["Compras (Meta)", tot.cmp, "#eb6834"], ["Vendas Hotmart", tot.vendas, "#1baf7a"]
  ], { escalaDesde: 1 });

  // por dia (dentro do período)
  const dias = [...agregarT(SEL, "dia").entries()].sort((a, b) => b[0].localeCompare(a[0]));
  const maxInv = Math.max(1, ...dias.map(([, m]) => m.inv)), maxV = Math.max(1, ...dias.map(([, m]) => m.vendas));
  $("#tr-barras").innerHTML = [...dias].reverse().map(([d, m]) => `<div class="tr-barra" title="${dm(d)}: ${brl(m.inv)} · ${m.vendas} vendas">
      <div class="tr-barra__par"><b class="inv" style="height:${m.inv / maxInv * 100}%"></b><b class="ven" style="height:${m.vendas / maxV * 100}%"></b></div><span>${dm(d)}</span></div>`).join("") || `<p class="t-nota">Sem tráfego no período.</p>`;
  $("#tr-dia").innerHTML = `<thead><tr><th>Dia</th><th class="n">Invest.</th><th class="n">CPM</th><th class="n">CTR</th><th class="n">CPC</th><th class="n">LPV</th><th class="n">Checkouts</th><th class="n">Compras Meta</th><th class="n">CPA Meta</th><th class="n">Vendas Hotmart</th><th class="n">CPA real</th><th class="n">ROAS</th></tr></thead><tbody>${
    dias.map(([d, m0]) => { const m = derivarT(m0); return `<tr><td>${dm(d)} ${DIAS_SEM[new Date(d + "T12:00:00Z").getUTCDay()]}</td><td class="n">${brl(m.inv)}</td><td class="n">${brlT(m.cpm)}</td><td class="n">${pctT(m.ctr)}</td><td class="n">${brlT(m.cpc)}</td><td class="n">${fmt(m.lpv)}</td><td class="n">${fmt(m.chk)}</td><td class="n">${fmt(m.cmp)}</td><td class="n">${brlT(m.cpaMeta)}</td><td class="n">${fmt(m.vendas)}</td><td class="n">${brlT(m.cpa)}</td><td class="n">${num2T(m.roas)}</td></tr>`; }).join("") || vazioTab(12)}</tbody>`;

  // top 5
  const porAd = [...agregarT(SEL, "anuncio").entries()].map(([id, m]) => [id, derivarT(m)]).filter(([, m]) => m.inv > 0 || m.vendas > 0);
  // melhor criativo = menor CPA real (regra da usuária, 18/11); só disputa quem tem MIN_VENDAS_TOP+ vendas, o resto vem depois
  const MIN_VENDAS_TOP = 2;
  const qualifica = (m) => m.vendas >= MIN_VENDAS_TOP;
  const ordemTop = (a, b) => (qualifica(b[1]) - qualifica(a[1])) || (qualifica(a[1]) ? (a[1].cpa || 1e9) - (b[1].cpa || 1e9) : b[1].vendas - a[1].vendas) || b[1].vendas - a[1].vendas || b[1].ctr - a[1].ctr;
  const fmtDe = (id) => (ADS.get(id)?.formato || "outro");
  desenharTopT($("#tr-top5"), porAd.slice().sort(ordemTop).slice(0, 5));
  desenharTopT($("#tr-top5-video"), porAd.filter(([id]) => fmtDe(id) === "video").sort(ordemTop).slice(0, 5));
  desenharTopT($("#tr-top5-imagem"), porAd.filter(([id]) => fmtDe(id) !== "video").sort(ordemTop).slice(0, 5));

  renderRankingT();

  // posicionamento e perfil (vendas do low no período)
  const vp = VR.filter((s) => noPer(s.v));
  const tabela = (el, chave, titulo) => {
    const g = new Map(); for (const s of vp) { const c = s[chave]; const o = g.get(c) || { n: 0, fat: 0 }; o.n++; o.fat += s.fat; g.set(c, o); }
    el.innerHTML = `<thead><tr><th>${titulo}</th><th class="n">Vendas</th><th class="n">%</th><th class="n">Faturamento</th></tr></thead><tbody>${
      [...g.entries()].sort((a, b) => b[1].n - a[1].n).map(([c, o]) => `<tr><td>${esc(c)}</td><td class="n">${fmt(o.n)}</td><td class="n">${pct(o.n, vp.length)}</td><td class="n">${brl(o.fat)}</td></tr>`).join("") || vazioTab(4)}</tbody>`;
  };
  tabela($("#tr-pos"), "pos", "Posicionamento");
  tabela($("#tr-perfil"), "perfil", "Perfil (src)");
  $("#tr-sync").textContent = TR.sync ? "Meta lida em " + quando(TR.sync) + " · de hora em hora" : "";
  if (typeof renderEscala === "function") renderEscala();
}

function desenharTopT(el, lista) {
  el.innerHTML = lista.map(([id, m], i) => { const a = ADS.get(id) || {};
    return `<article class="top5__card">
      <button type="button" class="top5__img" data-ad="${esc(id)}" aria-label="Ver o anúncio ${esc(a.nome || id)}">
        ${a.thumb ? `<img src="${esc(a.thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ""}
        <span class="top5__pos">#${i + 1}</span><span class="top5__tipo">${NOME_FMT[a.formato] || ""}</span>
      </button>
      <div class="top5__info">
        <span class="top5__nome">${esc(a.nome || id)}</span>
        <span class="top5__linha"><span>Vendas Hotmart</span><strong>${fmt(m.vendas)}</strong></span>
        <span class="top5__linha"><span>CPA real</span><strong>${brlT(m.cpa)}</strong></span>
        <span class="top5__linha"><span>Investimento</span><strong>${brl(m.inv)}</strong></span>
        <span class="top5__linha"><span>CTR · CPM</span><strong>${pctT(m.ctr)} · ${brlT(m.cpm)}</strong></span>
        <span class="top5__linha"><span>Compras Meta</span><strong>${fmt(m.cmp)}</strong></span>
        ${a.formato === "video" ? `<span class="top5__linha"><span>Hook · retenção</span><strong>${pctT(m.hook)} · ${pctT(m.hold)}</strong></span>` : ""}
      </div></article>`; }).join("") || `<p class="t-nota">Nenhum anúncio com gasto no período.</p>`;
}

const COLS_T = [
  ["inv", "Invest.", (m) => brl(m.inv)], ["imp", "Impr.", (m) => fmt(m.imp)], ["cpm", "CPM", (m) => brlT(m.cpm)],
  ["ctr", "CTR", (m) => pctT(m.ctr)], ["cpc", "CPC", (m) => brlT(m.cpc)], ["txLpv", "LPV/clique", (m) => pctT(m.txLpv)],
  ["chk", "Checkouts", (m) => fmt(m.chk)], ["cmp", "Compras Meta", (m) => fmt(m.cmp)], ["cpaMeta", "CPA Meta", (m) => brlT(m.cpaMeta)],
  ["vendas", "Vendas Hotmart", (m) => fmt(m.vendas)], ["cpa", "CPA real", (m) => brlT(m.cpa)], ["roas", "ROAS", (m) => num2T(m.roas)],
  ["conv", "Venda/clique", (m) => pctT(m.conv)], ["hook", "Hook 3s", (m) => pctT(m.hook)], ["hold", "Retenção", (m) => pctT(m.hold)]
];
function renderRankingT() {
  const g = [...agregarT(SEL, TR_DIM).entries()].map(([id, m]) => [id, derivarT(m)]).filter(([, m]) => m.inv > 0 || m.vendas > 0);
  const val = (m) => { const x = m[TR_ORD.col]; return isFinite(x) ? x : (TR_ORD.dir > 0 ? 1e12 : -1e12); };
  g.sort((a, b) => (val(a[1]) - val(b[1])) * TR_ORD.dir);
  const nomeDe = (id) => { if (TR_DIM === "anuncio") return ADS.get(id)?.nome || id;
    const a = [...ADS.values()].find((x) => (TR_DIM === "conjunto" ? x.conjunto_id : x.campanha_id) === id);
    return TR_DIM === "formato" ? (NOME_FMT[id] || id) : TR_DIM === "conjunto" ? a?.conjunto || id : a?.campanha || id; };
  $("#tr-rank").innerHTML = `<thead><tr><th>${{ anuncio: "Anúncio", conjunto: "Conjunto", campanha: "Campanha", formato: "Formato" }[TR_DIM]}</th>${
    COLS_T.map(([c, n]) => `<th class="n ordenavel" data-ord="${c}">${n}${TR_ORD.col === c ? (TR_ORD.dir > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}</tr></thead><tbody>${
    g.map(([id, m]) => { const a = ADS.get(id);
      return `<tr><td><div class="rank-nome">${TR_DIM === "anuncio" ? thumbDe(id) : ""}<div>${esc(nomeDe(id))}${TR_DIM === "anuncio" && a ? `<span class="sub">${esc(a.conjunto || "")} · ${esc(a.status || "")}</span>` : ""}</div></div></td>${COLS_T.map(([, , f]) => `<td class="n">${f(m)}</td>`).join("")}</tr>`; }).join("") || vazioTab(COLS_T.length + 1, "Sem dados no período")}</tbody>`;
}
document.addEventListener("click", (e) => {
  const th = e.target.closest("#tr-rank th[data-ord]"); if (!th) return;
  const c = th.dataset.ord; TR_ORD = { col: c, dir: TR_ORD.col === c ? -TR_ORD.dir : (["cpm", "cpc", "cpaMeta", "cpa"].includes(c) ? 1 : -1) }; renderRankingT();
});
document.addEventListener("change", (e) => { if (e.target.id === "tr-dim") { TR_DIM = e.target.value; renderRankingT(); } });

// ---------- prévia do criativo ----------
document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-ad]"); if (!el || !$("#aba-trafego").contains(el)) return;
  const a = ADS.get(el.dataset.ad); if (!a) return;
  $("#tr-previa-titulo").textContent = a.nome + (a.formato === "video" ? " · vídeo" : "");
  const img = $("#tr-previa-img"); img.hidden = !(a.imagem || a.thumb); if (!img.hidden) img.src = a.imagem || a.thumb;
  $("#tr-previa-ver").hidden = !a.preview; if (a.preview) $("#tr-previa-ver").href = a.preview;
  $("#tr-previa-gerenciador").href = `https://adsmanager.facebook.com/adsmanager/manage/ads?act=744557224934681&selected_ad_ids=${encodeURIComponent(a.id)}`;
  $("#tr-previa").hidden = false;
});
document.addEventListener("click", (e) => { if (e.target.id === "tr-previa" || e.target.id === "tr-previa-fechar") $("#tr-previa").hidden = true; });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && $("#tr-previa") && !$("#tr-previa").hidden) $("#tr-previa").hidden = true; });
