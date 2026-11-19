// Aba "Escala × teste" do dash BAW: compara cada criativo escalado (anúncio numa campanha com ESCALA no nome)
// com o mesmo criativo onde ele nasceu (mesmo nome em outra campanha), e lista os testes candidatos à escala.
// Usa TR_DIA, ADS, VR, normNome, derivarT, vazioT, somar (trafego.js) e SEL, noPer, brl, fmt, esc, kpi (app.js).
// Como o nome do anúncio é o mesmo na escala e no teste, a venda Hotmart (que só traz o nome) é dividida entre os
// anúncios de mesmo nome na proporção das compras Meta de cada um naquele dia (sem compra Meta: pelo investimento).
const ESC_MAX_CPA = 15, ESC_MIN_VENDAS = 2;
const ehEscala = (a) => /ESCALA/i.test(a?.campanha || "");
const ehTeste = (a) => /TESTE/i.test(a?.campanha || "");

function vendasFracionadas() {
  const porNome = new Map();
  for (const a of ADS.values()) { const k = normNome(a.nome); if (!porNome.has(k)) porNome.set(k, []); porNome.get(k).push(a.id); }
  const dia = new Map(); for (const r of TR_DIA) { const k = r.dia + "|" + r.ad; const o = dia.get(k) || { cmp: 0, inv: 0 }; o.cmp += r.cmp; o.inv += r.inv; dia.set(k, o); }
  const out = [];
  for (const s of VR) {
    if (!s.sck) continue;
    const ids = porNome.get(normNome(s.sck.anuncio)) || [];
    if (!ids.length) continue;
    const pesoDe = (campo) => ids.map((id) => (dia.get(s.v.dia + "|" + id) || {})[campo] || 0);
    let p = pesoDe("cmp"); if (!p.some(Boolean)) p = pesoDe("inv"); if (!p.some(Boolean)) p = ids.map(() => 1);
    const tot = p.reduce((x, y) => x + y, 0);
    ids.forEach((id, i) => p[i] && out.push({ v: s.v, ad: id, frac: p[i] / tot, fat: s.fat * p[i] / tot }));
  }
  return out;
}

// soma Meta + vendas fracionadas por anúncio no período
function porAnuncioEsc(k) {
  const g = new Map();
  for (const r of TR_DIA) if (noPer(r, k)) g.set(r.ad, somar(g.get(r.ad) || vazioT(), r));
  for (const s of vendasFracionadas()) if (noPer(s.v, k)) { const m = g.get(s.ad) || vazioT(); m.vendas += s.frac; m.fat += s.fat; g.set(s.ad, m); }
  return g;
}
const juntar = (lista) => derivarT(lista.reduce((a, m) => { somar(a, m); a.vendas += m.vendas; a.fat += m.fat; return a; }, vazioT()));
const fmtV = (x) => (Math.abs(x - Math.round(x)) < 0.05 ? fmt(Math.round(x)) : x.toLocaleString("pt-BR", { maximumFractionDigits: 1 }));

function renderEscala() {
  if (!$("#aba-escala")) return;
  const g = porAnuncioEsc(SEL);
  const nomes = new Map(); // nome normalizado → { escala: [ids], origem: [ids] }
  for (const a of ADS.values()) {
    const k = normNome(a.nome); const o = nomes.get(k) || { nome: a.nome, escala: [], origem: [] };
    (ehEscala(a) ? o.escala : o.origem).push(a.id); nomes.set(k, o);
  }
  const escalados = [...nomes.values()].filter((o) => o.escala.length);
  const mDe = (ids) => juntar(ids.map((id) => g.get(id) || vazioT()));
  const linhas = escalados.map((o) => ({ ...o, e: mDe(o.escala), t: mDe(o.origem) })).sort((a, b) => (a.e.cpa || 1e9) - (b.e.cpa || 1e9));
  const totE = juntar(linhas.map((l) => l.e)), totT = juntar(linhas.map((l) => l.t));
  const ondeNasceu = (ids) => [...new Set(ids.map((id) => ADS.get(id)?.campanha).filter(Boolean))].map((c) => c.replace(/^\[MBP\]\[VENDA\]\s*/i, "")).join(", ") || "—";

  $("#esc-kpis").innerHTML = [
    kpi("Escala · investimento", brl0(totE.inv), `${fmtV(totE.vendas)} vendas Hotmart · ${fmt(totE.cmp)} compras Meta`, "kpi--preto"),
    kpi("Escala · CPA real", brlT(totE.cpa), `CPA Meta ${brlT(totE.cpaMeta)} · ROAS ${num2T(totE.roas)}`, "kpi--preto"),
    kpi("Mesmos criativos na origem · investimento", brl0(totT.inv), `${fmtV(totT.vendas)} vendas Hotmart · ${fmt(totT.cmp)} compras Meta`),
    kpi("Mesmos criativos na origem · CPA real", brlT(totT.cpa), `CPA Meta ${brlT(totT.cpaMeta)} · ROAS ${num2T(totT.roas)}`)
  ].join("");

  const cel = (m) => `<td class="n">${brl(m.inv)}</td><td class="n">${fmtV(m.vendas)}</td><td class="n"><strong>${brlT(m.cpa)}</strong></td><td class="n">${fmt(m.cmp)}</td><td class="n">${brlT(m.cpaMeta)}</td><td class="n">${num2T(m.roas)}</td><td class="n">${pctT(m.ctr)}</td><td class="n">${pctT(m.hook)}</td>`;
  const delta = (l) => { if (!isFinite(l.e.cpa) || !isFinite(l.t.cpa)) return "—"; const d = l.e.cpa - l.t.cpa;
    return `<span class="esc-delta ${d <= 0 ? "esc-delta--bom" : "esc-delta--ruim"}">${d <= 0 ? "▼" : "▲"} ${brl(Math.abs(d))}</span>`; };
  const cab = `<th class="n">Invest.</th><th class="n">Vendas Hotmart</th><th class="n">CPA real</th><th class="n">Compras Meta</th><th class="n">CPA Meta</th><th class="n">ROAS</th><th class="n">CTR</th><th class="n">Hook 3s</th>`;
  $("#esc-comp").innerHTML = `<thead><tr><th>Criativo</th><th>Onde</th>${cab}<th class="n">CPA escala × origem</th></tr></thead><tbody>${
    linhas.map((l) => `<tr class="esc-par"><td rowspan="2"><div class="rank-nome">${thumbDe(l.escala[0])}<div>${esc(l.nome)}</div></div></td><td><span class="esc-tag esc-tag--escala">Escala</span></td>${cel(l.e)}<td class="n" rowspan="2">${delta(l)}</td></tr>
      <tr><td><span class="esc-tag">${esc(ondeNasceu(l.origem))}</span></td>${cel(l.t)}</tr>`).join("") || vazioTab(11, "Nenhum anúncio em campanha de escala")}</tbody>`;

  // candidatos: anúncios de teste ainda não escalados, com vendas suficientes e CPA real dentro do limite
  const jaEscalado = new Set(escalados.map((o) => normNome(o.nome)));
  const cands = [...g.entries()].filter(([id]) => ehTeste(ADS.get(id)) && !jaEscalado.has(normNome(ADS.get(id)?.nome)))
    .map(([id, m]) => [id, derivarT(m)]).filter(([, m]) => m.vendas >= ESC_MIN_VENDAS - 0.05 && m.cpa <= ESC_MAX_CPA)
    .sort((a, b) => a[1].cpa - b[1].cpa);
  $("#esc-cand").innerHTML = `<thead><tr><th>Anúncio</th><th>Status</th>${cab}</tr></thead><tbody>${
    cands.map(([id, m]) => { const a = ADS.get(id) || {};
      return `<tr><td><div class="rank-nome">${thumbDe(id)}<div>${esc(a.nome || id)}<span class="sub">${esc(a.conjunto || "")}</span></div></div></td><td>${esc(a.status || "")}</td>${cel(m)}</tr>`; }).join("")
    || vazioTab(10, `Nenhum teste com ${ESC_MIN_VENDAS}+ vendas e CPA real até ${brl(ESC_MAX_CPA)} no período`)}</tbody>`;
}
