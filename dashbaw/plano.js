// Aba "Plano de tráfego" do dash BAW (21/11): mede o tráfego do low pelo que ele gera no Brigadeiro de A a Z.
// Regras da usuária:
//  - quem compra o low entra no funil na turma da semana da compra (seg→dom); tudo o que essa pessoa fizer depois conta
//    (Brigadeiro de A a Z, order bump dele, upsell, reembolsos). Venda de quem nunca comprou o low fica fora.
//  - comprou o Brigadeiro de A a Z até o carrinho da turma dela fechar (seg da live 21h → seg seguinte 20h59) → conta na
//    turma dela; depois disso → conta na turma do carrinho em que comprou (a semana seguinte).
//  - ROI = faturamento do Brigadeiro de A a Z (com bump e upsell, menos reembolsos) ÷ investimento em tráfego do low.
//  - régua de criativo: campeão = 5+ vendas Hotmart a até R$ 12; acima de R$ 15, corta.
// Usa app.js (APROV, V, INSC, WEB, mLow, noPer, SEL, MODO…), trafego.js (ADS, TR_DIA, normNome, thumbDe) e escala.js (vendasFracionadas).
const PL = { metaCpa: 12, corteCpa: 15, campeaoVendas: 5, metaRoi: 2, insc: 0.364, pres: 0.61, conv: 0.06, ticket: 697 };
const TIPOS_AZ = ["principal", "ob_principal", "upsell", "ob_upsell"];
const ehPlanoNovo = (nomeCampanha) => /ABO RAIZ|1-1-1/i.test(nomeCampanha || "");

// turma do carrinho em que uma venda caiu: seg 21h → seg seguinte 20h59 pertence à turma de 7 dias antes da live
function turmaDoCarrinho(iso) {
  const dia = diaSP(iso), seg = segundaDe(dia);
  return dia === seg && horaSP(iso) < 21 ? somaDias(seg, -14) : somaDias(seg, -7);
}
// pessoa → chaves (e-mail e telefone) para casar compra, inscrição e live mesmo com e-mail diferente
const chavesDe = (o) => [o.email ? String(o.email).toLowerCase() : null, o.tel && telChave(o.tel) ? "tel:" + telChave(o.tel) : null].filter(Boolean);

function montarFunil() {
  // primeira compra do low de cada pessoa = entrada no funil
  const entrada = new Map(); // chave → { em, turma, id }
  const lows = APROV.filter((v) => v.tipo === "low").sort((a, b) => a.em.localeCompare(b.em));
  for (const v of lows) {
    const id = chavesDe(v)[0]; if (!id) continue;
    const e = { em: v.em, turma: segundaDe(v.dia), id };
    for (const c of chavesDe(v)) if (!entrada.has(c)) entrada.set(c, e);
  }
  const achar = (o) => { for (const c of chavesDe(o)) if (entrada.has(c)) return entrada.get(c); return null; };
  const inscritos = new Set(), presentes = new Set();
  for (const i of INSC) { const e = achar(i); if (e) inscritos.add(e.id); }
  for (const w of WEB) { const e = achar(w); if (e && w.web === liveDe(e.turma)) presentes.add(e.id); }
  // vendas do Brigadeiro de A a Z (e bump/upsell) de quem está no funil, já com a turma a que pertencem
  const az = [];
  for (const v of V) {
    if (!TIPOS_AZ.includes(v.tipo) || !["aprovada", "reembolso"].includes(v.grupo)) continue;
    const e = achar(v); if (!e || v.em < e.em) continue;
    const tc = turmaDoCarrinho(v.em);
    if (tc < e.turma) continue;
    az.push({ v, pessoa: e.id, turma: tc, valor: v.grupo === "reembolso" ? -v.fat : v.fat });
  }
  return { entrada, achar, inscritos, presentes, az };
}

// funil de um período: pessoas que compraram o low no período (na visão semanal, a turma)
function mFunilPlano(F, k) {
  const pessoas = new Set();
  for (const v of APROV) if (v.tipo === "low" && noPer(v, k)) { const e = F.achar(v); if (e) pessoas.add(e.id); }
  const insc = [...pessoas].filter((p) => F.inscritos.has(p)).length;
  const pres = [...pessoas].filter((p) => F.presentes.has(p)).length;
  // semana: vale a turma do carrinho (regra); dia/mês: tudo o que essas pessoas compraram depois do low
  const doPer = F.az.filter((x) => (MODO === "semana" ? x.turma === k : pessoas.has(x.pessoa)));
  const principal = doPer.filter((x) => x.v.tipo === "principal" && x.v.grupo === "aprovada");
  const compradores = new Set(principal.map((x) => x.pessoa)).size;
  const reemb = doPer.filter((x) => x.valor < 0);
  const fat = soma(doPer.filter((x) => x.valor > 0), (x) => x.valor), fatReemb = -soma(reemb, (x) => x.valor);
  return { pessoas: pessoas.size, insc, pres, compradores, fat, fatReemb, fatLiq: fat - fatReemb, nReemb: reemb.length };
}

const pctP = (x) => (isFinite(x) ? (x * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%" : "—");
const brlP = (x) => (isFinite(x) ? brl(x) : "—");
const n2P = (x) => (isFinite(x) ? x.toLocaleString("pt-BR", { maximumFractionDigits: 2 }) : "—");
const vend = (x) => (Math.abs(x - Math.round(x)) < 0.05 ? fmt(Math.round(x)) : x.toLocaleString("pt-BR", { maximumFractionDigits: 1 }));

// métricas por anúncio no período, com vendas divididas entre anúncios de mesmo nome (escala.js) e o que essas pessoas fizeram no funil
function porAnuncioPlano(F, k) {
  const g = new Map(), nova = () => ({ inv: 0, cmp: 0, dias: new Set(), vendas: 0, fat: 0, insc: 0, az: 0 });
  for (const r of TR_DIA) if (noPer(r, k)) { const m = g.get(r.ad) || nova(); m.inv += r.inv; m.cmp += r.cmp; if (r.inv > 0) m.dias.add(r.dia); g.set(r.ad, m); }
  const azPorPessoa = new Map(); for (const x of F.az) azPorPessoa.set(x.pessoa, (azPorPessoa.get(x.pessoa) || 0) + x.valor);
  const contada = new Set();
  for (const s of (typeof vendasFracionadas === "function" ? vendasFracionadas() : [])) {
    if (!noPer(s.v, k)) continue;
    const m = g.get(s.ad) || nova(); m.vendas += s.frac; m.fat += s.fat;
    const e = F.achar(s.v);
    if (e) {
      if (F.inscritos.has(e.id)) m.insc += s.frac;
      // o Brigadeiro de A a Z vai para o anúncio da 1ª compra do low dessa pessoa
      if (e.em === s.v.em) m.az += (azPorPessoa.get(e.id) || 0) * s.frac;
    }
    g.set(s.ad, m); contada.add(s.v.t);
  }
  return g;
}
const somaPl = (lista) => lista.reduce((a, m) => { a.inv += m.inv; a.cmp += m.cmp; m.dias.forEach((d) => a.dias.add(d)); a.vendas += m.vendas; a.fat += m.fat; a.insc += m.insc; a.az += m.az; return a; },
  { inv: 0, cmp: 0, dias: new Set(), vendas: 0, fat: 0, insc: 0, az: 0 });

function statusRegua(m, ativo) {
  const cpa = div(m.inv, m.vendas);
  if (m.vendas >= PL.campeaoVendas - 0.05 && cpa <= PL.metaCpa) return ["campeão", "bom"];
  if ((m.vendas < 0.05 && m.inv >= 2 * PL.metaCpa) || (cpa > PL.corteCpa && m.inv >= 3 * PL.metaCpa)) return [ativo ? "cortar" : "cortado", "ruim"];
  if (cpa <= PL.metaCpa) return ["promissor", "bom"];
  if (cpa <= PL.corteCpa) return ["no limite", "meio"];
  return ["em teste", "meio"];
}

function renderPlano() {
  if (!$("#aba-plano")) return;
  const F = montarFunil(), k = SEL, L = mLow(k), P = mFunilPlano(F, k);
  const cpa = div(L.traf * (1 + taxa("imposto_trafego")), L.vendas);
  const roi = div(P.fatLiq, L.traf);
  // previsão do Brigadeiro de A a Z pela taxa do plano (inscrição × presença × compra × ticket), nunca abaixo do que já vendeu
  const prevVendas = Math.max(P.compradores, L.vendas * PL.insc * PL.pres * PL.conv);
  const prevFat = Math.max(P.fatLiq, prevVendas * PL.ticket), prevRoi = div(prevFat, L.traf);
  const neg = (x) => (x < 0 ? " neg" : "");
  const tag = (txt, tipo) => `<span class="pl-tag pl-tag--${tipo}">${txt}</span>`;
  const semana = MODO === "semana";
  const fechou = semana && diaSP(new Date()) > somaDias(k, 14);

  $("#pl-nota").textContent = semana
    ? `turma do low seg ${dm(k)} → dom ${dm(somaDias(k, 6))} · live seg ${dm(liveDe(k))} 19h · carrinho até seg ${dm(somaDias(k, 14))} 20h59${fechou ? " (fechado)" : ""}`
    : "na visão por dia/mês, o funil segue quem comprou o low no período (sem a regra do carrinho)";
  $("#pl-kpis").innerHTML = [
    kpi("Investimento (low)", brl0(L.traf), `+ imposto ${brl0(L.impT)}`, "kpi--preto"),
    kpi("Compradores do low", fmt(L.vendas), `${brl0(L.fat)} com bumps · ${fmt(L.obQtd)} bumps`),
    kpi("Custo por comprador", `<span class="${cpa > PL.corteCpa ? "neg" : ""}">${brlP(cpa)}</span>`, `meta ${brl(PL.metaCpa)} · com imposto do tráfego`),
    kpi("Resultado do low", `<span class="${neg(L.liq)}">${brl0(L.liq)}</span>`, `ROAS ${n2P(L.roas)}`),
    kpi("Inscrição no webinário", pctP(div(P.insc, P.pessoas)), `${fmt(P.insc)} de ${fmt(P.pessoas)} · plano ${pctP(PL.insc)}`),
    kpi("ROI Brigadeiro de A a Z", `<span class="${roi >= PL.metaRoi ? "pos" : ""}">${n2P(roi || 0)}</span>`, `meta ${n2P(PL.metaRoi)} · previsão ${n2P(prevRoi)}`, "kpi--preto")
  ].join("");

  // funil completo: anúncio → low → inscrição → live → Brigadeiro de A a Z
  const T = typeof trafegoFunil === "function" ? trafegoFunil(k) : { imp: 0 };
  const etapas = [
    ...(T.imp ? [["Impressões", T.imp, "#a8a29e"], ["Cliques no link", T.link, "#78716c"], ["Página carregada", T.lpv, "#78716c"], ["Checkouts (Meta)", T.chk, "#57534e"]] : []),
    ["Compraram o low", P.pessoas, "#57534e"], ["Inscritos", P.insc, "#2a78d6"], ["Assistiram a live", P.pres, "#1d4f91"], ["Compraram o A a Z", P.compradores, "#1baf7a"]
  ];
  funil($("#pl-funil"), etapas, { escalaDesde: T.imp ? 2 : 0 });
  $("#pl-funil-plano").innerHTML = [
    ["Inscrição", div(P.insc, P.pessoas), PL.insc], ["Presença", div(P.pres, P.insc), PL.pres], ["Compra na live", div(P.compradores, P.pres), PL.conv]
  ].map(([n, r, p]) => `<span><b>${n}</b> ${pctP(r)} <i>plano ${pctP(p)}</i></span>`).join("")
    + `<span><b>Faturamento A a Z</b> ${brl0(P.fatLiq)}${P.nReemb ? ` <i>− ${fmt(P.nReemb)} reembolso(s) ${brl0(P.fatReemb)}</i>` : ""}</span>`;
  $("#pl-prev").innerHTML = semana
    ? `Previsão pela taxa do plano: <b>${n2P(prevVendas)}</b> venda(s) do Brigadeiro de A a Z · ${brl0(prevFat)} · ROI ${n2P(prevRoi)}. Para ROI ${n2P(PL.metaRoi)} nesta turma: <b>${brl0(PL.metaRoi * L.traf)}</b> ≈ ${n2P(div(PL.metaRoi * L.traf, PL.ticket))} venda(s).`
    : "";

  // plano antigo × novo (por campanha)
  const ads = porAnuncioPlano(F, k), linhas = { antigo: [], novo: [] };
  for (const [id, m] of ads) { const a = ADS.get(id); if (!a || !/VENDA/i.test(a.campanha || "")) continue; linhas[ehPlanoNovo(a.campanha) ? "novo" : "antigo"].push(m); }
  const linhaPlano = (nome, desc, m) => { const d = m.dias.size || 0;
    return `<tr><td><strong>${nome}</strong><span class="sub">${desc}</span></td><td class="n">${brl0(m.inv)}</td><td class="n">${fmt(d)}</td><td class="n">${brl0(div(m.inv, d) || 0)}</td><td class="n">${vend(m.vendas)}</td><td class="n">${n2P(div(m.vendas, d))}</td><td class="n"><strong>${brlP(div(m.inv, m.vendas))}</strong></td><td class="n">${n2P(div(m.fat, m.inv))}</td><td class="n">${pctP(div(m.insc, m.vendas))}</td><td class="n">${n2P(div(m.az, m.inv))}</td></tr>`; };
  const camps = (lista) => [...new Set(lista)].join(", ") || "—";
  const nomesCamp = (novo) => camps([...ads.keys()].map((id) => ADS.get(id)).filter((a) => a && /VENDA/i.test(a.campanha || "") && ehPlanoNovo(a.campanha) === novo).map((a) => a.campanha.replace(/^\[MBP\]\[VENDA\]\s*/i, "")));
  $("#pl-planos").innerHTML = `<thead><tr><th>Plano</th><th class="n">Invest.</th><th class="n">Dias</th><th class="n">Invest./dia</th><th class="n">Vendas</th><th class="n">Vendas/dia</th><th class="n">Custo real</th><th class="n">ROAS low</th><th class="n">Inscrição</th><th class="n">ROI A a Z</th></tr></thead><tbody>
    ${linhaPlano("Antigo", nomesCamp(false), somaPl(linhas.antigo))}${linhaPlano("Novo", nomesCamp(true) === "—" ? "ABO RAIZ + teste 1-1-1" : nomesCamp(true), somaPl(linhas.novo))}</tbody>`;

  // criativos pela régua (por nome, somando todas as campanhas)
  const cri = new Map();
  for (const [id, m] of ads) { const a = ADS.get(id); if (!a) continue; const kN = normNome(a.nome);
    const o = cri.get(kN) || { nome: a.nome, id, ativo: false, ms: [], camps: new Set() };
    o.ms.push(m); if (/ACTIVE/i.test(a.status || "")) o.ativo = true; o.camps.add((a.campanha || "").replace(/^\[MBP\]\[VENDA\]\s*/i, "")); cri.set(kN, o); }
  const crLinhas = [...cri.values()].map((o) => ({ ...o, m: somaPl(o.ms) })).filter((o) => o.m.inv > 0 || o.m.vendas > 0)
    .sort((a, b) => (div(a.m.inv, a.m.vendas) || 1e9) - (div(b.m.inv, b.m.vendas) || 1e9));
  $("#pl-cri").innerHTML = `<thead><tr><th>Criativo</th><th class="n">Invest.</th><th class="n">Vendas</th><th class="n">Custo real</th><th class="n">Inscrição</th><th class="n">ROI A a Z</th><th>Régua</th></tr></thead><tbody>${
    crLinhas.map((o) => { const [st, cl] = statusRegua(o.m, o.ativo);
      return `<tr class="${o.ativo ? "" : "pl-inativo"}"><td><div class="rank-nome">${thumbDe(o.id)}<div>${esc(o.nome)}<span class="sub">${esc([...o.camps].join(" · "))}${o.ativo ? "" : " · pausado"}</span></div></div></td><td class="n">${brl(o.m.inv)}</td><td class="n">${vend(o.m.vendas)}</td><td class="n"><strong>${brlP(div(o.m.inv, o.m.vendas))}</strong></td><td class="n">${pctP(div(o.m.insc, o.m.vendas))}</td><td class="n">${n2P(div(o.m.az, o.m.inv))}</td><td>${tag(st, cl)}</td></tr>`; }).join("")
    || vazioTab(7, "Sem tráfego no período")}</tbody>`;

  // decisões sugeridas (só sugestão: nada muda no Meta sem aprovação)
  const dec = [];
  const porConjunto = new Map();
  for (const [id, m] of ads) { const a = ADS.get(id); if (!a || !/ACTIVE/i.test(a.status || "")) continue; const c = porConjunto.get(a.conjunto_id) || { a, ms: [] }; c.ms.push(m); porConjunto.set(a.conjunto_id, c); }
  for (const { a, ms } of porConjunto.values()) {
    const m = somaPl(ms), cp = div(m.inv, m.vendas), nome = a.conjunto || a.nome;
    if (/ESCALA|VENCEDORES|CAMPANHA 1/i.test((a.campanha || "") + " " + (a.conjunto || ""))) continue; // escalas antigas: não mexer (regra da usuária)
    if (ehPlanoNovo(a.campanha)) {
      if (m.vendas < 0.05 && m.dias.size >= 2) dec.push(["ruim", `Desligar ${nome}`, `2 dias sem venda · ${brl(m.inv)} gastos`]);
      else if (m.dias.size >= 2 && cp <= PL.metaCpa) dec.push(["bom", `Duplicar ${nome}`, `${vend(m.vendas)} vendas a ${brl(cp)}`]);
    } else if (/TESTE/i.test(a.campanha || "")) {
      const [st] = statusRegua(m, true);
      if (st === "cortar") dec.push(["ruim", `Pausar ${nome}`, m.vendas < 0.05 ? `sem venda · ${brl(m.inv)} gastos` : `${brl(cp)} por venda`]);
      if (st === "campeão") dec.push(["bom", `Subir ${nome} para o ABO Raiz`, `${vend(m.vendas)} vendas a ${brl(cp)}`]);
    }
  }
  // alertas
  const ult2 = [0, 1].map((i) => somaDias(diaSP(new Date()), -i));
  const low2 = APROV.filter((v) => v.tipo === "low" && ult2.includes(v.dia)).length, ob2 = APROV.filter((v) => v.tipo === "ob_low" && ult2.includes(v.dia)).length;
  if (low2 >= 15 && ob2 === 0) dec.push(["alerta", "Order bump do low zerado", `0 bumps em ${fmt(low2)} vendas de ontem e hoje · conferir o checkout`]);
  if (P.pessoas >= 20 && div(P.insc, P.pessoas) < 0.3) dec.push(["alerta", "Inscrição no webinário baixa", `${pctP(div(P.insc, P.pessoas))} dos compradores · conferir a captura e a página de obrigado`]);
  if (cpa > PL.corteCpa) dec.push(["alerta", "Custo por comprador acima do corte", `${brl(cpa)} · meta ${brl(PL.metaCpa)}`]);
  $("#pl-dec").innerHTML = dec.length ? dec.map(([cl, t, s], i) => `<label class="pl-dec pl-dec--${cl}">${cl === "alerta" ? `<span class="pl-dec__ic" aria-hidden="true">!</span>` : `<input type="checkbox" data-dec="${i}">`}<span><strong>${esc(t)}</strong><span class="sub">${esc(s)}</span></span></label>`).join("")
    : `<p class="t-nota">Nenhuma decisão sugerida para o período.</p>`;
  $("#pl-dec").dataset.lista = JSON.stringify(dec.map(([, t, s]) => `${t} (${s})`));
}

// copia as decisões marcadas para colar na conversa com o Claude
document.addEventListener("click", async (e) => {
  if (e.target.id !== "pl-copiar") return;
  const lista = JSON.parse($("#pl-dec").dataset.lista || "[]");
  const marcadas = $$("#pl-dec input[data-dec]:checked").map((c) => lista[+c.dataset.dec]);
  if (!marcadas.length) { e.target.textContent = "Marque alguma decisão"; setTimeout(() => (e.target.textContent = "Copiar decisões marcadas"), 1800); return; }
  try { await navigator.clipboard.writeText("Aprovo no tráfego do MBP:\n- " + marcadas.join("\n- ")); e.target.textContent = "Copiado ✓"; }
  catch { e.target.textContent = "Não consegui copiar"; }
  setTimeout(() => (e.target.textContent = "Copiar decisões marcadas"), 1800);
});
