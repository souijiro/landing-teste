// Aba "Teste A/B": compara as versões A e B do teste escolhido (TESTES_AB em trafego.js).
// Usa AB, noTeste, versaoEm, fracHora, ATRIB, ADS, TRAF, CONTA_DOCIS (trafego.js) e UNICOS, fmt, brl, esc, dataBR, horaSP, tipoOrigem, $ (dash.js).

// as versões A e B (ids, nomes e descrições) vêm do teste escolhido em TESTES_AB (trafego.js)
let gAbCusto = null;

// teste de duas proporções (bicaudal): confiança de que a diferença é real (0 a 1)
function confiancaDiferenca(x1, n1, x2, n2) {
  if (!n1 || !n2) return null;
  const p = (x1 + x2) / (n1 + n2), se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  if (!se) return null;
  const z = Math.abs(x1 / n1 - x2 / n2) / se;
  const t = 1 / (1 + 0.2316419 * z), d = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  const cauda = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 1 - 2 * cauda;
}

// qual versão está no ar agora no teste escolhido e até quando
function versaoAgora() {
  const t = TESTE_AB, agora = Date.now();
  if (agora < t.ini) return { v: null, ate: new Date(t.ini), antes: true };
  if (t.sorteio && agora < t.fim) return { sorteio: true, ate: new Date(t.fim) };
  if (agora >= t.fim) return { fim: true };
  const v = versaoEm(agora);
  let ate = agora - (agora % 60000) + 60000;
  while (ate < t.fim && versaoEm(ate) === v) ate += 60000;
  return { v, ate: new Date(Math.min(ate, t.fim)) };
}

// troca o teste exibido: recarrega visitas/aberturas do período dele
async function escolherTeste(id) {
  TESTE_AB = TESTES_AB.find((t) => t.id === +id) || TESTES_AB[0];
  $("#ab-conteudo").innerHTML = `<p class="t-nota">Carregando…</p>`;
  try { AB = await rpc("dash_ab_black2026", periodoAB()); } catch (e) { AB = null; }
  renderAB();
  if (typeof montarFiltroAB === "function") montarFiltroAB();
  if (typeof renderTrafego === "function" && TRAF.ads.length) renderTrafego();
}
const periodoAB = () => ({ p_token: lerToken(), p_ini: new Date(TESTE_AB.ini).toISOString(), p_fim: new Date(TESTE_AB.fim).toISOString(), p_campo: TESTE_AB.campo || "email" });

// visitantes vindos dos anúncios (Docis e Felipe, as duas contas têm gasto por hora)
const ehPagoDocis = (us, um, uc) => tipoOrigem({ utm_source: us, utm_medium: um, utm_campaign: uc }) === "Tráfego";

// fim da hora (dia, hora em Brasília) em ms
const fimHora = (dia, hora) => Date.parse(`${dia}T${String(hora).padStart(2, "0")}:00:00-03:00`) + 3600000;
// até onde o funil de custo vai: só horas fechadas que a Meta já entregou nas duas contas
function corteFunil() {
  const syncs = [TRAF.ultimaOk, TRAF.syncFelipe && TRAF.syncFelipe.ok ? TRAF.syncFelipe.em : null].filter(Boolean).map((x) => Date.parse(x));
  if (!syncs.length) return 0;
  const t = Math.min(...syncs);
  return t - (t % 3600000); // hora cheia (UTC e Brasília alinham na hora)
}

function metricasVariante(v, corte) {
  const r = { visitantes: 0, popups: 0, cadastros: 0, vis_pago: 0, pop_pago: 0, cad_pago: 0,
    investimento: 0, impressoes: 0, cliques: 0, page_views: 0 };
  // totais ao vivo (todos os visitantes, inclui a hora em andamento)
  ((AB && AB.unicos) || []).forEach(([vv, , , , vis, pop]) => {
    if (vv !== v) return;
    r.visitantes += +vis || 0; r.popups += +pop || 0;
  });
  UNICOS.forEach((l) => {
    if (varianteDoLead(l) !== v || !noTeste(l)) return;
    r.cadastros++;
    // funil de custo: só cadastros de anúncios em horas fechadas
    if (Date.parse(l.criado_em) >= corte) return;
    const at = ATRIB.get(l.id);
    if (at) at.forEach(({ peso }) => { r.cad_pago += peso; });
  });
  ((AB && AB.horas) || []).forEach(([dia, hora, vv, us, um, uc, vis, pop]) => {
    if (vv !== v || fimHora(dia, hora) > corte || !ehPagoDocis(us, um, uc)) return;
    r.vis_pago += +vis || 0; r.pop_pago += +pop || 0;
  });
  (TRAF.horas || []).forEach(([d, h, , inv, imp, cl, lpv]) => {
    if (fimHora(d, h) > corte) return;
    const x = fracHora(d, h, v);
    if (!x) return;
    r.investimento += (+inv || 0) * x; r.impressoes += (+imp || 0) * x; r.cliques += (+cl || 0) * x; r.page_views += (+lpv || 0) * x;
  });
  // no sorteio a Meta não sabe qual versão cada pessoa viu: investimento, impressões e cliques ficam 1/N (iguais),
  // mas page views passam a ser os visitantes de anúncio que a própria página contou em cada versão
  if (TESTE_AB.sorteio) r.page_views = r.vis_pago;
  const div = (a, b) => (b ? a / b : null);
  Object.assign(r, {
    conv: div(r.cadastros, r.visitantes),
    // mesmas definições da aba Tráfego: CTR, carregamento (page views ÷ cliques), conversão da página (cadastros ÷ page views)
    ctr: div(r.cliques, r.impressoes), tx_lp: TESTE_AB.sorteio ? null : div(r.page_views, r.cliques), // no sorteio os cliques são metade estimada: não dá para comparar tx_popup: div(r.pop_pago, r.page_views),
    conv_popup: div(r.cad_pago, r.pop_pago), conv_lp: div(r.cad_pago, r.page_views),
    cpm: r.impressoes ? r.investimento / r.impressoes * 1000 : null, cpc: div(r.investimento, r.cliques),
    cpv: div(r.investimento, r.page_views), cpl: div(r.investimento, r.cad_pago)
  });
  return r;
}

function renderAB() {
  if (TESTE_AB.variantes && TESTE_AB.variantes.length > 2) return renderABMulti();
  const alvo = $("#ab-conteudo");
  if (!alvo) return;
  if (!AB || !AB.inicio) {
    alvo.innerHTML = `<p class="t-nota">O teste começa a contar na primeira visita à página depois da publicação. Volte em alguns minutos.</p>`;
    return;
  }
  const ini = abInicioDia();
  const corte = corteFunil();
  const A = metricasVariante(TESTE_AB.a, corte), B = metricasVariante(TESTE_AB.b, corte);
  const horaTxt = (ms) => horaSP.format(new Date(ms));
  const corteFim = Math.min(corte, AB.fim ? Date.parse(AB.fim) : corte);
  const funilVazio = corteFim <= Date.parse(AB.inicio);
  const pc = (v) => (v == null ? "—" : (v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%");
  const rs = (v) => (v == null ? "—" : brl(v));
  const n1 = (v) => (v < 10 && v % 1 ? v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : fmt(v));

  // ---------- funil de custo + conversão, A e B lado a lado, setas por fora ----------
  // colunas: rótulo | seta A | barras A | seta longa A | seta longa B | barras B | seta B
  const etapas = [
    ["Investimento", "investimento", rs, null, 100],
    ["Impressões", "impressoes", fmt, ["CPM", "cpm"], 88],
    ["Cliques", "cliques", fmt, ["CPC", "cpc"], 76],
    [TESTE_AB.sorteio ? "Visitantes" : "Page views", "page_views", fmt, ["por visitante", "cpv"], 64],
    ["Abriram o formulário", "pop_pago", fmt, null, 54],
    ["Cadastros", "cad_pago", n1, ["CPL", "cpl"], 44]
  ];
  // seta que CHEGA em cada etapa (índice = etapa de destino)
  const conectores = [null, null, ["CTR", "ctr"], ["carregamento da página", "tx_lp"], ["abriram o formulário", "tx_popup"], ["cadastraram", "conv_popup"]];
  const melhor = (k, x, menorMelhor) => {
    const a = A[k], b = B[k];
    if (a == null || b == null || a === b) return "";
    return (x === "a" ? (menorMelhor ? a < b : a > b) : (menorMelhor ? b < a : b > a)) ? " abc--melhor" : "";
  };
  let g = `<div class="abc__cab" style="grid-column:2 / 5;color:#2a78d6">${TESTE_AB.nomeA}</div><div class="abc__cab" style="grid-column:5 / 8;color:#eb6834">${TESTE_AB.nomeB}</div>`;
  etapas.forEach(([nome, k, f, custo, w], i) => {
    const lin = i * 2 + 2;
    const bar = (x, R) => `<div class="abc__cel" style="grid-row:${lin};grid-column:${x === "a" ? 3 : 6}">
        <div class="abc__barra abc__barra--${x}" style="width:${w}%;opacity:${1 - i * 0.11}"><b>${f(R[k])}</b><span>${nome === "Abriram o formulário" ? "Formulário" : nome}</span></div>
        ${custo ? `<p class="abc__custo${melhor(custo[1], x, true)}">${custo[0]} ${rs(R[custo[1]])}</p>` : ""}</div>`;
    g += `<div class="abc__rot" style="grid-row:${lin}">${nome}</div>${bar("a", A)}${bar("b", B)}`;
    if (i < etapas.length - 1) g += `<div class="abc__vao" style="grid-row:${lin + 1}"></div>`;
    const c = conectores[i];
    if (c) {
      // seta da etapa anterior para esta, vindo por fora (A à esquerda, B à direita)
      const sp = `grid-row:${lin - 2} / ${lin + 1}`;
      g += `<div class="abc__chave abc__chave--a" style="${sp};grid-column:2"><span><b class="${melhor(c[1], "a")}">${pc(A[c[1]])}</b>${c[0]}</span></div>`;
      g += `<div class="abc__chave abc__chave--b" style="${sp};grid-column:7"><span><b class="${melhor(c[1], "b")}">${pc(B[c[1]])}</b>${c[0]}</span></div>`;
    }
  });
  // seta longa page view → cadastro (conversão da página), por dentro de cada lado (linha de Visitantes = 8, Cadastros = 12)
  const longa = "grid-row:8 / 13";
  g += `<div class="abc__chave abc__chave--longa-a" style="${longa};grid-column:4"><span><b class="${melhor("conv_lp", "a")}">${pc(A.conv_lp)}</b>conversão da página</span></div>`;
  g += `<div class="abc__chave abc__chave--longa-b" style="${longa};grid-column:5"><span><b class="${melhor("conv_lp", "b")}">${pc(B.conv_lp)}</b>conversão da página</span></div>`;
  // CPL em destaque
  const pctMenor = A.cpl && B.cpl ? 1 - Math.min(A.cpl, B.cpl) / Math.max(A.cpl, B.cpl) : null;
  const pill = (x, R) => {
    const vence = melhor("cpl", x, true);
    const txt = vence && pctMenor != null ? ` · ${pc(pctMenor)} menor` : "";
    return `<div class="abc__fim" style="grid-row:14;grid-column:${x === "a" ? "2 / 5" : "5 / 8"}"><span class="abc__cpl abc__cpl--${x}${vence}">CPL ${rs(R.cpl)}${txt}</span></div>`;
  };
  g += `<div class="abc__rot abc__fim" style="grid-row:14">Custo por lead</div>${pill("a", A)}${pill("b", B)}`;

  // ---------- veredito pela conversão de todos os visitantes ----------
  const conf = confiancaDiferenca(A.cadastros, A.visitantes, B.cadastros, B.visitantes);
  let veredito;
  if (A.visitantes + B.visitantes < 200 || A.cadastros + B.cadastros < 20) veredito = { cls: "espera", txt: `Ainda poucos dados (${fmt(A.visitantes + B.visitantes)} visitantes, ${fmt(A.cadastros + B.cadastros)} cadastros). Espere pelo menos 200 visitantes e 20 cadastros em cada lado antes de decidir.` };
  else if (conf != null && conf >= 0.95) {
    const ganhaB = B.conv > A.conv;
    veredito = { cls: "vence", txt: `<b>${ganhaB ? TESTE_AB.nomeB : TESTE_AB.nomeA} converte mais</b>: ${pc(ganhaB ? B.conv : A.conv)} contra ${pc(ganhaB ? A.conv : B.conv)}, com ${pc(conf)} de confiança.${ganhaB && TESTE_AB.campo === "email" ? " Lembre que sem e-mail você perde o canal de e-mail com esses leads." : ""}` };
  } else veredito = { cls: "empate", txt: `Até agora sem diferença confiável na conversão (${pc(A.conv)} na A × ${pc(B.conv)} na B; confiança ${conf == null ? "—" : pc(conf)}, o ideal é 95%). Continue rodando.` };
  if (Date.now() >= TESTE_AB.fim) {
    veredito.txt = "<b>Resultado final:</b> " + veredito.txt.replace("Até agora sem", "sem").replace(" Continue rodando.", "").replace("Espere pelo menos 200 visitantes e 20 cadastros em cada lado antes de decidir.", "Dados insuficientes para decidir.");
  }

  // ---------- por dia ----------
  const dias = new Map();
  const gd = (d) => { if (!dias.has(d)) dias.set(d, { [TESTE_AB.a]: { vis: 0, cad: 0 }, [TESTE_AB.b]: { vis: 0, cad: 0 } }); return dias.get(d); };
  (AB.dias || []).forEach(([d, v, , , , vis]) => { if (gd(d)[v]) gd(d)[v].vis += +vis || 0; });
  UNICOS.forEach((l) => { const v = varianteDoLead(l); if (v && noTeste(l) && gd(l.dia)[v]) gd(l.dia)[v].cad++; });
  const linhasDia = [...dias.keys()].sort().reverse().map((d) => {
    const x = dias.get(d), ca = x[TESTE_AB.a], sb = x[TESTE_AB.b];
    const c1 = ca.vis ? ca.cad / ca.vis : null, c2 = sb.vis ? sb.cad / sb.vis : null;
    return `<tr><td>${dataBR(d)}</td><td class="n">${fmt(ca.vis)}</td><td class="n">${fmt(ca.cad)}</td><td class="n ${c1 != null && c2 != null && c1 > c2 ? "ab-melhor" : ""}">${pc(c1)}</td>
      <td class="n">${fmt(sb.vis)}</td><td class="n">${fmt(sb.cad)}</td><td class="n ${c1 != null && c2 != null && c2 > c1 ? "ab-melhor" : ""}">${pc(c2)}</td></tr>`;
  }).join("");

  const agora = versaoAgora();
  alvo.innerHTML = `
    <div class="ab-cabeca">
      <div><label class="ab-escolha">Ver <select id="ab-teste" aria-label="Teste exibido">${TESTES_AB.map((t) => `<option value="${t.id}"${t.id === TESTE_AB.id ? " selected" : ""}>${t.nome}${t === TESTES_AB[0] ? " (atual)" : ""}</option>`).join("")}</select></label>
        <p class="rotulo">${agora && agora.fim ? "Encerrado" : agora && agora.antes ? "Começa em breve" : "Em andamento"}</p><h3>${TESTE_AB.nome}</h3>
        <p class="t-nota">${TESTE_AB.desc}</p>
        ${agora ? (agora.fim ? `<p class="ab-agora">Teste encerrado</p>` : agora.sorteio ? `<p class="ab-agora">No ar: as duas versões, 50/50 por visitante, até ${horaSP.format(agora.ate)}</p>` : agora.antes && TESTE_AB.sorteio ? `<p class="ab-agora">A divisão 50/50 já está no ar; a contagem começa em ${horaSP.format(agora.ate)}</p>` : `<p class="ab-agora">${agora.antes ? "Antes do teste, no ar:" : "No ar agora:"} <b class="ab-agora--${agora.v === TESTE_AB.b ? "sem_email" : "com_email"}">${AB_NOMES[agora.v] || "—"}</b> até ${horaSP.format(agora.ate)}${agora.antes ? " (aí começa o teste)" : ""}</p>`) : ""}</div>
      <div class="ab-versoes"><span class="ab-tag ab-tag--a">${TESTE_AB.nomeA}<small>${TESTE_AB.subA}</small></span><span class="ab-tag ab-tag--b">${TESTE_AB.nomeB}<small>${TESTE_AB.subB}</small></span></div>
    </div>
    <p class="ab-veredito ab-veredito--${veredito.cls}">${veredito.txt}</p>
    <h3 class="ab-sub">Funil de custo · ${funilVazio ? "aguardando a 1ª hora fechada" : `horas fechadas, de ${horaTxt(Date.parse(AB.inicio))} a ${horaTxt(corteFim)}`}</h3>
    ${funilVazio ? `<p class="t-nota">O teste começa em ${horaTxt(TESTE_AB.ini)}. A primeira hora fecha e a Meta entrega o custo uns 10 minutos depois da hora cheia. Até lá, acompanhe a conversão abaixo.</p>` : `<div class="abc" role="img" aria-label="Funil de custo e conversão das duas versões">${g}</div>`}
    <p class="t-nota ab-nota">Funil dos anúncios das contas Docis e Felipe Russo. Investimento, impressões, cliques e page views vêm da Meta hora a hora (${TESTE_AB.sorteio ? "no sorteio 50/50 a Meta não sabe qual fundo cada pessoa viu, então investimento, impressões, cliques, CPM, CPC e CTR são <b>iguais nos dois lados por definição</b>: metade de cada hora para cada versão. A diferença real começa nos visitantes de anúncio, contados pela própria página em cada versão" : "cada hora do teste pertence inteira a uma versão"}). "Abriram o formulário" é contado pela própria página, só de quem veio de anúncio. Cadastros = leads ligados aos anúncios. A hora em andamento só entra no funil quando fecha e a Meta entrega o custo das duas contas (por volta de 10 min depois da hora cheia).</p>
    <h3 class="ab-sub">Custo de cada etapa</h3>
    <div class="ab-grafico"><canvas id="g-ab-custo" role="img" aria-label="Barras: CPM ÷ 10, CPC, custo por page view e CPL das versões A e B"></canvas></div>
    <h3 class="ab-sub">Todos os visitantes contados pela página (inclui orgânico) · base do resultado do teste</h3>
    <div class="tabela-wrap"><table class="tabela">
      <thead><tr><th>Versão</th><th class="n">Visitantes</th><th class="n">Abriram o formulário</th><th class="n">Cadastros</th><th class="n">Conversão</th></tr></thead>
      <tbody>
        <tr><td><b style="color:#2a78d6">${TESTE_AB.nomeA}</b></td><td class="n">${fmt(A.visitantes)}</td><td class="n">${fmt(A.popups)}</td><td class="n">${fmt(A.cadastros)}</td><td class="n${melhor("conv", "a") ? " ab-melhor" : ""}">${pc(A.conv)}</td></tr>
        <tr><td><b style="color:#eb6834">${TESTE_AB.nomeB}</b></td><td class="n">${fmt(B.visitantes)}</td><td class="n">${fmt(B.popups)}</td><td class="n">${fmt(B.cadastros)}</td><td class="n${melhor("conv", "b") ? " ab-melhor" : ""}">${pc(B.conv)}</td></tr>
      </tbody></table></div>
    <h3 class="ab-sub">Por dia</h3>
    <div class="tabela-wrap"><table class="tabela">
      <thead><tr><th rowspan="2">Data</th><th class="n" colspan="3">${TESTE_AB.nomeA}</th><th class="n" colspan="3">${TESTE_AB.nomeB}</th></tr>
      <tr><th class="n">Visitantes</th><th class="n">Cadastros</th><th class="n">Conversão</th><th class="n">Visitantes</th><th class="n">Cadastros</th><th class="n">Conversão</th></tr></thead>
      <tbody>${linhasDia || '<tr><td colspan="7" class="vazio">Sem visitas ainda.</td></tr>'}</tbody></table></div>`;

  $("#ab-teste").addEventListener("change", (e) => escolherTeste(e.target.value));

  // barras do custo por etapa
  if (gAbCusto) { gAbCusto.destroy(); gAbCusto = null; }
  const val = (R) => [R.cpm != null ? R.cpm / 10 : null, R.cpc, R.cpv, R.cpl];
  gAbCusto = new Chart($("#g-ab-custo"), {
    type: "bar",
    data: { labels: ["CPM ÷ 10", "CPC", "Custo por page view", "CPL"],
      datasets: [{ label: TESTE_AB.nomeA, data: val(A), backgroundColor: "#2a78d6", borderRadius: 4 },
        { label: TESTE_AB.nomeB, data: val(B), backgroundColor: "#eb6834", borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
      plugins: { legend: { labels: { font: { family: "Montserrat", weight: 600 }, boxWidth: 12 } },
        tooltip: { backgroundColor: "#0b0b0b", callbacks: { label: (c) => ` ${c.dataset.label}: ${c.label === "CPM ÷ 10" ? "CPM " + brl(c.parsed.y * 10) : brl(c.parsed.y)}` } } },
      scales: { x: { grid: { display: false }, ticks: { font: { family: "Montserrat" } } }, y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v.toLocaleString("pt-BR"), font: { family: "Montserrat" } } } } }
  });
}

// ---------- Teste com 3+ versões (sorteio): colunas lado a lado, cada uma comparada com a A ----------
let gAbCustoMulti = null;
function renderABMulti() {
  const alvo = $("#ab-conteudo");
  if (!alvo) return;
  const T = TESTE_AB, V = T.variantes;
  const pc = (v) => (v == null ? "—" : (v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%");
  const rs = (v) => (v == null ? "—" : brl(v));
  const n1 = (v) => (v < 10 && v % 1 ? v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : fmt(v));
  const horaTxt = (ms) => horaSP.format(new Date(ms));
  const corte = Math.min(corteFunil(), AB && AB.fim ? Date.parse(AB.fim) : Infinity);
  const M = V.map((x) => ({ ...x, m: metricasVariante(x.id, corte) }));
  const agora = versaoAgora();
  const funilVazio = !AB || corte <= Date.parse(AB.inicio || T.ini);

  // veredito: cada desafiante contra a A (conversão de todos os visitantes)
  const A = M[0].m, totVis = M.reduce((s2, x) => s2 + x.m.visitantes, 0), totCad = M.reduce((s2, x) => s2 + x.m.cadastros, 0);
  const lider = [...M].filter((x) => x.m.conv != null).sort((a, b) => b.m.conv - a.m.conv)[0];
  const linhasVer = M.slice(1).map((x) => {
    const conf = confiancaDiferenca(x.m.cadastros, x.m.visitantes, A.cadastros, A.visitantes);
    const dif = x.m.conv != null && A.conv ? x.m.conv / A.conv - 1 : null;
    const ok = conf != null && conf >= 0.95;
    return `<li><b style="color:${x.cor}">${x.nome}</b> × A: ${dif == null ? "—" : `${dif > 0 ? "+" : ""}${pc(dif)}`} na conversão · confiança ${conf == null ? "—" : pc(conf)}${ok ? (dif > 0 ? " · <b>vence a A</b>" : " · <b>perde para a A</b>") : ""}</li>`;
  }).join("");
  const poucos = totVis < 300 || totCad < 30;
  const encerrado = Date.now() >= T.fim;
  const veredito = `<p class="ab-veredito ab-veredito--${poucos ? "espera" : "empate"}">${encerrado ? "<b>Resultado final.</b> " : ""}${poucos ? `Ainda poucos dados (${fmt(totVis)} visitantes, ${fmt(totCad)} cadastros). Espere pelo menos 100 visitantes e 10 cadastros em cada versão antes de decidir.` : `Líder em conversão: <b style="color:${lider.cor}">${lider.nome}</b> (${pc(lider.m.conv)}). O ideal é 95% de confiança para declarar vencedora.`}</p>
    <ul class="ab-ver-lista">${linhasVer}</ul>`;

  // comparação lado a lado: cada linha com barrinhas proporcionais e o melhor em verde
  const linhas = [
    ["Visitantes únicos", "visitantes", fmt, null, "todos os visitantes contados pela página"],
    ["Cadastros", "cadastros", fmt, null, "leads únicos"],
    ["Conversão da página", "conv", pc, true, "cadastros ÷ visitantes — a métrica principal do teste", true],
    ["Abriram o formulário", "popups", fmt, null, ""],
    ["Taxa de abertura do formulário", (m) => (m.visitantes ? m.popups / m.visitantes : null), pc, true, "abriram ÷ visitantes"],
    ["Conversão do formulário", (m) => (m.popups ? m.cadastros / m.popups : null), pc, true, "cadastros ÷ quem abriu"],
    ["Investimento ≈", "investimento", rs, null, "1/3 de cada hora fechada do teste (sorteio)"],
    ["Visitantes de anúncio", "page_views", fmt, null, "contados pela página, horas fechadas"],
    ["Cadastros de anúncio", "cad_pago", n1, null, "horas fechadas"],
    ["CPL ≈", "cpl", rs, false, "investimento ÷ cadastros de anúncio (horas fechadas)"],
    ["Conversão da página (anúncios)", "conv_lp", pc, true, "cadastros de anúncio ÷ visitantes de anúncio"]
  ];
  const val = (m, k) => (typeof k === "function" ? k(m) : m[k]);
  const corpo = linhas.map(([nome, k, f, maiorMelhor, dica, principal]) => {
    const vals = M.map((x) => val(x.m, k));
    const validos = vals.filter((v) => v != null);
    const max = Math.max(...validos.map(Math.abs), 0);
    let melhor = null;
    if (maiorMelhor !== null && validos.length > 1 && new Set(validos).size > 1) melhor = maiorMelhor ? Math.max(...validos) : Math.min(...validos);
    return `<tr${principal ? ' class="ab-principal"' : ""}><td>${nome}${dica ? `<small>${dica}</small>` : ""}</td>${vals.map((v, i) => `
      <td class="n${v != null && v === melhor ? " ab-melhor" : ""}"><span class="abm__val">${f(v)}</span>${v != null && max ? `<i class="abm__barra" style="width:${Math.max(4, Math.abs(v) / max * 100)}%;background:${M[i].cor}"></i>` : ""}</td>`).join("")}</tr>`;
  }).join("");

  // por dia
  const dias = new Map();
  const gd = (d) => { if (!dias.has(d)) dias.set(d, Object.fromEntries(V.map((x) => [x.id, { vis: 0, cad: 0 }]))); return dias.get(d); };
  ((AB && AB.dias) || []).forEach(([d, v, , , , vis]) => { if (gd(d)[v]) gd(d)[v].vis += +vis || 0; });
  UNICOS.forEach((l) => { const v = varianteDoLead(l); if (v && noTeste(l) && gd(l.dia)[v]) gd(l.dia)[v].cad++; });
  const linhasDia = [...dias.keys()].sort().reverse().map((d) => `<tr><td>${dataBR(d)}</td>${V.map((x) => { const r = dias.get(d)[x.id]; return `<td class="n">${fmt(r.vis)}</td><td class="n">${fmt(r.cad)}</td><td class="n">${pc(r.vis ? r.cad / r.vis : null)}</td>`; }).join("")}</tr>`).join("");

  alvo.innerHTML = `
    <div class="ab-cabeca">
      <div><label class="ab-escolha">Ver <select id="ab-teste" aria-label="Teste exibido">${TESTES_AB.map((t) => `<option value="${t.id}"${t.id === T.id ? " selected" : ""}>${t.nome}${t === TESTES_AB[0] ? " (atual)" : ""}</option>`).join("")}</select></label>
        <p class="rotulo">${encerrado ? "Encerrado" : agora && agora.antes ? "Começa em breve" : "Em andamento"}</p><h3>${T.nome}</h3>
        <p class="t-nota">${T.desc}</p>
        ${agora && agora.antes ? `<p class="ab-agora">A divisão já está no ar; a contagem começa em ${horaTxt(agora.ate)}</p>` : !encerrado ? `<p class="ab-agora">No ar: as ${V.length} versões, 1/${V.length} dos visitantes cada, até ${horaTxt(T.fim)}</p>` : ""}</div>
      <div class="ab-versoes">${V.map((x) => `<span class="ab-tag" style="background:${x.cor}">${x.nome}<small>${x.sub}</small></span>`).join("")}</div>
    </div>
    ${veredito}
    <div class="tabela-wrap"><table class="tabela abm-tabela">
      <thead><tr><th>Métrica</th>${V.map((x) => `<th class="n" style="color:${x.cor}">${x.nome}</th>`).join("")}</tr></thead>
      <tbody>${corpo}</tbody></table></div>
    <p class="t-nota ab-nota">${funilVazio ? "O custo aparece quando a primeira hora do teste fechar e a Meta entregar os dados (uns 10 min depois da hora cheia)." : `Custos e page views: horas fechadas de ${horaTxt(Date.parse(AB.inicio))} a ${horaTxt(corte)}, 1/${V.length} de cada hora para cada versão.`} Verde = melhor da linha.</p>
    <h3 class="ab-sub">Custo de cada etapa</h3>
    <div class="ab-grafico"><canvas id="g-ab-custo-multi" role="img" aria-label="CPM ÷ 10, CPC, custo por page view e CPL de cada versão"></canvas></div>
    <h3 class="ab-sub">Por dia</h3>
    <div class="tabela-wrap"><table class="tabela">
      <thead><tr><th rowspan="2">Data</th>${V.map((x) => `<th class="n" colspan="3" style="color:${x.cor}">${x.nome}</th>`).join("")}</tr>
      <tr>${V.map(() => `<th class="n">Visitantes</th><th class="n">Cadastros</th><th class="n">Conversão</th>`).join("")}</tr></thead>
      <tbody>${linhasDia || `<tr><td colspan="${1 + V.length * 3}" class="vazio">Sem visitas ainda.</td></tr>`}</tbody></table></div>`;

  $("#ab-teste").addEventListener("change", (e) => escolherTeste(e.target.value));
  if (gAbCustoMulti) { gAbCustoMulti.destroy(); gAbCustoMulti = null; }
  const valC = (m) => [m.cpm != null ? m.cpm / 10 : null, m.cpc, m.cpv, m.cpl];
  gAbCustoMulti = new Chart($("#g-ab-custo-multi"), {
    type: "bar",
    data: { labels: ["CPM ÷ 10", "CPC", "Custo por page view", "CPL"], datasets: M.map((x) => ({ label: x.nome, data: valC(x.m), backgroundColor: x.cor, borderRadius: 4 })) },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
      plugins: { legend: { labels: { font: { family: "Montserrat", weight: 600 }, boxWidth: 12 } },
        tooltip: { backgroundColor: "#0b0b0b", callbacks: { label: (c) => ` ${c.dataset.label}: ${c.label === "CPM ÷ 10" ? "CPM " + brl(c.parsed.y * 10) : brl(c.parsed.y)}` } } },
      scales: { x: { grid: { display: false } }, y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v.toLocaleString("pt-BR") } } } }
  });
}
