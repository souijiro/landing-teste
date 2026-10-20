// Aba "Teste A/B". Teste 1: formulário com e-mail x só nome e telefone, alternando a cada 10 minutos.
// Usa AB, noTeste, versaoEm, fracHora, ATRIB, ADS, TRAF, CONTA_DOCIS (trafego.js) e UNICOS, fmt, brl, esc, dataBR, horaSP, tipoOrigem, $ (dash.js).

const AB_TESTE1 = { nome: "Teste 1 · E-mail no formulário", a: "com_email", b: "sem_email" };
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

function versaoAgora() {
  if (!AB || !AB.inicio) return null;
  const ini = Date.parse(AB.inicio), agora = Date.now();
  if (agora < ini) return { v: "com_email", ate: new Date(ini), antes: true };
  const h = Math.floor((agora - ini) / 3600000);
  return { v: versaoEm(agora), ate: new Date(ini + (h + 1) * 3600000) };
}

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
    if (l.ab !== v || !noTeste(l)) return;
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
  const div = (a, b) => (b ? a / b : null);
  Object.assign(r, {
    conv: div(r.cadastros, r.visitantes),
    // mesmas definições da aba Tráfego: CTR, carregamento (page views ÷ cliques), conversão da página (cadastros ÷ page views)
    ctr: div(r.cliques, r.impressoes), tx_lp: div(r.page_views, r.cliques), tx_popup: div(r.pop_pago, r.page_views),
    conv_popup: div(r.cad_pago, r.pop_pago), conv_lp: div(r.cad_pago, r.page_views),
    cpm: r.impressoes ? r.investimento / r.impressoes * 1000 : null, cpc: div(r.investimento, r.cliques),
    cpv: div(r.investimento, r.page_views), cpl: div(r.investimento, r.cad_pago)
  });
  return r;
}

function renderAB() {
  const alvo = $("#ab-conteudo");
  if (!alvo) return;
  if (!AB || !AB.inicio) {
    alvo.innerHTML = `<p class="t-nota">O teste começa a contar na primeira visita à página depois da publicação. Volte em alguns minutos.</p>`;
    return;
  }
  const ini = abInicioDia();
  const corte = corteFunil();
  const A = metricasVariante(AB_TESTE1.a, corte), B = metricasVariante(AB_TESTE1.b, corte);
  const horaTxt = (ms) => horaSP.format(new Date(ms)).split(", ").pop();
  const funilVazio = corte <= Date.parse(AB.inicio);
  const pc = (v) => (v == null ? "—" : (v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%");
  const rs = (v) => (v == null ? "—" : brl(v));
  const n1 = (v) => (v < 10 && v % 1 ? v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) : fmt(v));

  // ---------- funil de custo + conversão, A e B lado a lado, setas por fora ----------
  // colunas: rótulo | seta A | barras A | seta longa A | seta longa B | barras B | seta B
  const etapas = [
    ["Investimento", "investimento", rs, null, 100],
    ["Impressões", "impressoes", fmt, ["CPM", "cpm"], 88],
    ["Cliques", "cliques", fmt, ["CPC", "cpc"], 76],
    ["Page views", "page_views", fmt, ["por page view", "cpv"], 64],
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
  let g = `<div class="abc__cab" style="grid-column:2 / 5;color:#2a78d6">A · Com e-mail</div><div class="abc__cab" style="grid-column:5 / 8;color:#eb6834">B · Sem e-mail</div>`;
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
    veredito = { cls: "vence", txt: `<b>${ganhaB ? "Sem e-mail" : "Com e-mail"} converte mais</b>: ${pc(ganhaB ? B.conv : A.conv)} contra ${pc(ganhaB ? A.conv : B.conv)}, com ${pc(conf)} de confiança.${ganhaB ? " Lembre que sem e-mail você perde o canal de e-mail com esses leads." : ""}` };
  } else veredito = { cls: "empate", txt: `Até agora sem diferença confiável na conversão (${pc(A.conv)} com e-mail × ${pc(B.conv)} sem e-mail; confiança ${conf == null ? "—" : pc(conf)}, o ideal é 95%). Continue rodando.` };

  // ---------- por dia ----------
  const dias = new Map();
  const gd = (d) => { if (!dias.has(d)) dias.set(d, { com_email: { vis: 0, cad: 0 }, sem_email: { vis: 0, cad: 0 } }); return dias.get(d); };
  (AB.dias || []).forEach(([d, v, , , , vis]) => { gd(d)[v].vis += +vis || 0; });
  UNICOS.forEach((l) => { if (l.ab && noTeste(l)) gd(l.dia)[l.ab].cad++; });
  const linhasDia = [...dias.keys()].sort().reverse().map((d) => {
    const x = dias.get(d), ca = x.com_email, sb = x.sem_email;
    const c1 = ca.vis ? ca.cad / ca.vis : null, c2 = sb.vis ? sb.cad / sb.vis : null;
    return `<tr><td>${dataBR(d)}</td><td class="n">${fmt(ca.vis)}</td><td class="n">${fmt(ca.cad)}</td><td class="n ${c1 != null && c2 != null && c1 > c2 ? "ab-melhor" : ""}">${pc(c1)}</td>
      <td class="n">${fmt(sb.vis)}</td><td class="n">${fmt(sb.cad)}</td><td class="n ${c1 != null && c2 != null && c2 > c1 ? "ab-melhor" : ""}">${pc(c2)}</td></tr>`;
  }).join("");

  const agora = versaoAgora();
  alvo.innerHTML = `
    <div class="ab-cabeca">
      <div><p class="rotulo">Em andamento</p><h3>${AB_TESTE1.nome}</h3>
        <p class="t-nota">Desde ${dataBR(ini)} às ${horaSP.format(new Date(AB.inicio)).split(", ").pop()} · a versão muda a cada hora cheia, junto com a atualização do tráfego (1ª hora sem e-mail; a ordem inverte a cada dia)</p>
        ${agora ? `<p class="ab-agora">${agora.antes ? "Antes do teste, no ar:" : "No ar agora:"} <b class="ab-agora--${agora.v}">${agora.v === "sem_email" ? "B · Sem e-mail" : "A · Com e-mail"}</b> até ${horaSP.format(agora.ate).split(", ").pop()}${agora.antes ? " (aí começa o teste, com B · Sem e-mail)" : ""}</p>` : ""}</div>
      <div class="ab-versoes"><span class="ab-tag ab-tag--a">A · Com e-mail<small>nome, e-mail e WhatsApp</small></span><span class="ab-tag ab-tag--b">B · Sem e-mail<small>só nome e WhatsApp</small></span></div>
    </div>
    <p class="ab-veredito ab-veredito--${veredito.cls}">${veredito.txt}</p>
    <h3 class="ab-sub">Funil de custo · ${funilVazio ? "aguardando a 1ª hora fechada" : `horas fechadas, das ${horaTxt(Date.parse(AB.inicio))} às ${horaTxt(corte)}`}</h3>
    ${funilVazio ? `<p class="t-nota">A primeira hora do teste fecha e a Meta entrega o custo uns 10 minutos depois da hora cheia. Até lá, acompanhe a conversão abaixo.</p>` : `<div class="abc" role="img" aria-label="Funil de custo e conversão das duas versões">${g}</div>`}
    <p class="t-nota ab-nota">Funil dos anúncios das contas Docis e Felipe Russo. Investimento, impressões, cliques e page views vêm da Meta hora a hora (cada hora do teste pertence inteira a uma versão). "Abriram o formulário" é contado pela própria página, só de quem veio de anúncio. Cadastros = leads ligados aos anúncios. A hora em andamento só entra no funil quando fecha e a Meta entrega o custo das duas contas (por volta de 10 min depois da hora cheia).</p>
    <h3 class="ab-sub">Custo de cada etapa</h3>
    <div class="ab-grafico"><canvas id="g-ab-custo" role="img" aria-label="Barras: CPM ÷ 10, CPC, custo por page view e CPL das versões A e B"></canvas></div>
    <h3 class="ab-sub">Todos os visitantes contados pela página (inclui orgânico) · base do resultado do teste</h3>
    <div class="tabela-wrap"><table class="tabela">
      <thead><tr><th>Versão</th><th class="n">Visitantes</th><th class="n">Abriram o formulário</th><th class="n">Cadastros</th><th class="n">Conversão</th></tr></thead>
      <tbody>
        <tr><td><b style="color:#2a78d6">A · Com e-mail</b></td><td class="n">${fmt(A.visitantes)}</td><td class="n">${fmt(A.popups)}</td><td class="n">${fmt(A.cadastros)}</td><td class="n${melhor("conv", "a") ? " ab-melhor" : ""}">${pc(A.conv)}</td></tr>
        <tr><td><b style="color:#eb6834">B · Sem e-mail</b></td><td class="n">${fmt(B.visitantes)}</td><td class="n">${fmt(B.popups)}</td><td class="n">${fmt(B.cadastros)}</td><td class="n${melhor("conv", "b") ? " ab-melhor" : ""}">${pc(B.conv)}</td></tr>
      </tbody></table></div>
    <h3 class="ab-sub">Por dia</h3>
    <div class="tabela-wrap"><table class="tabela">
      <thead><tr><th rowspan="2">Data</th><th class="n" colspan="3">A · Com e-mail</th><th class="n" colspan="3">B · Sem e-mail</th></tr>
      <tr><th class="n">Visitantes</th><th class="n">Cadastros</th><th class="n">Conversão</th><th class="n">Visitantes</th><th class="n">Cadastros</th><th class="n">Conversão</th></tr></thead>
      <tbody>${linhasDia || '<tr><td colspan="7" class="vazio">Sem visitas ainda.</td></tr>'}</tbody></table></div>`;

  // barras do custo por etapa
  if (gAbCusto) { gAbCusto.destroy(); gAbCusto = null; }
  const val = (R) => [R.cpm != null ? R.cpm / 10 : null, R.cpc, R.cpv, R.cpl];
  gAbCusto = new Chart($("#g-ab-custo"), {
    type: "bar",
    data: { labels: ["CPM ÷ 10", "CPC", "Custo por page view", "CPL"],
      datasets: [{ label: "A · Com e-mail", data: val(A), backgroundColor: "#2a78d6", borderRadius: 4 },
        { label: "B · Sem e-mail", data: val(B), backgroundColor: "#eb6834", borderRadius: 4 }] },
    options: { responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
      plugins: { legend: { labels: { font: { family: "Montserrat", weight: 600 }, boxWidth: 12 } },
        tooltip: { backgroundColor: "#0b0b0b", callbacks: { label: (c) => ` ${c.dataset.label}: ${c.label === "CPM ÷ 10" ? "CPM " + brl(c.parsed.y * 10) : brl(c.parsed.y)}` } } },
      scales: { x: { grid: { display: false }, ticks: { font: { family: "Montserrat" } } }, y: { beginAtZero: true, ticks: { callback: (v) => "R$ " + v.toLocaleString("pt-BR"), font: { family: "Montserrat" } } } } }
  });
}
