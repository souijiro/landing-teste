// Aba "Teste A/B". Teste 1: formulário com e-mail x só nome e telefone.
// Usa AB, fatorAB, abPagosPorDia, ATRIB, TRAF (trafego.js) e UNICOS, fmt, brl, dataBR, horaSP, $ (dash.js).

const AB_TESTE1 = { nome: "Teste 1 · E-mail no formulário", a: "com_email", b: "sem_email" };

// teste de duas proporções (bicaudal): devolve a confiança de que a diferença é real (0 a 1)
function confiancaDiferenca(x1, n1, x2, n2) {
  if (!n1 || !n2) return null;
  const p = (x1 + x2) / (n1 + n2), se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  if (!se) return null;
  const z = Math.abs(x1 / n1 - x2 / n2) / se;
  // aproximação da normal acumulada
  const t = 1 / (1 + 0.2316419 * z), d = Math.exp(-z * z / 2) / Math.sqrt(2 * Math.PI);
  const cauda = d * t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return 1 - 2 * cauda;
}

function metricasVariante(v, ini) {
  const r = { visitantes: 0, visitantes_pagos: 0, popups: 0, cadastros: 0, cad_trafego: 0, atribuidos: 0, alunos: 0, investimento: 0 };
  ((AB && AB.unicos) || []).forEach(([vv, us, um, uc, vis, pop]) => {
    if (vv !== v) return;
    r.visitantes += +vis || 0; r.popups += +pop || 0;
    if (tipoOrigem({ utm_source: us, utm_medium: um, utm_campaign: uc }) === "Tráfego") r.visitantes_pagos += +vis || 0;
  });
  UNICOS.forEach((l) => {
    if (l.ab !== v) return;
    r.cadastros++;
    if (l.tipo === "Tráfego") r.cad_trafego++;
    if (typeof ATRIB !== "undefined" && ATRIB.has(l.id)) r.atribuidos++;
    if (l.perfil && l.perfil !== "nao_aluno") r.alunos++;
  });
  TRAF.insights.forEach((i) => { if (ini && i.dia >= ini) r.investimento += i.investimento * fatorAB(v, i.dia); });
  r.conv = r.visitantes ? r.cadastros / r.visitantes : null;
  r.conv_pago = r.visitantes_pagos ? r.cad_trafego / r.visitantes_pagos : null;
  r.tx_popup = r.visitantes ? r.popups / r.visitantes : null;
  r.conv_popup = r.popups ? r.cadastros / r.popups : null;
  r.cpl = r.atribuidos ? r.investimento / r.atribuidos : null;
  r.pct_alunos = r.cadastros ? r.alunos / r.cadastros : null;
  return r;
}

function renderAB() {
  const alvo = $("#ab-conteudo");
  if (!alvo) return;
  const ini = abInicioDia();
  if (!AB || !AB.inicio) {
    alvo.innerHTML = `<p class="t-nota">O teste começa a contar na primeira visita à página depois da publicação. Volte em alguns minutos.</p>`;
    return;
  }
  const A = metricasVariante(AB_TESTE1.a, ini), B = metricasVariante(AB_TESTE1.b, ini);
  const pc = (v) => (v == null ? "—" : (v * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%");
  const rs = (v) => (v == null ? "—" : brl(v));
  // [rótulo, valorA, valorB, formato, maior é melhor?, dica]
  const linhas = [
    ["Visitantes únicos", A.visitantes, B.visitantes, fmt, null, "pessoas diferentes que abriram a página"],
    ["Abriram o formulário", A.popups, B.popups, fmt, null, ""],
    ["Taxa de abertura do formulário", A.tx_popup, B.tx_popup, pc, true, "abriram ÷ visitantes"],
    ["Cadastros", A.cadastros, B.cadastros, fmt, null, "leads únicos"],
    ["Conversão da página", A.conv, B.conv, pc, true, "cadastros ÷ visitantes — a métrica principal do teste"],
    ["Conversão do formulário", A.conv_popup, B.conv_popup, pc, true, "cadastros ÷ quem abriu o formulário"],
    ["Visitantes de tráfego pago", A.visitantes_pagos, B.visitantes_pagos, fmt, null, ""],
    ["Conversão do tráfego pago", A.conv_pago, B.conv_pago, pc, true, "cadastros de tráfego ÷ visitantes de tráfego"],
    ["Investimento ≈", A.investimento, B.investimento, rs, null, "dividido pela proporção de visitantes pagos de cada versão no dia"],
    ["CPL ≈", A.cpl, B.cpl, rs, false, "investimento ≈ ÷ leads ligados aos anúncios"],
    ["Alunos entre os cadastros", A.pct_alunos, B.pct_alunos, pc, null, ""]
  ];
  const corpo = linhas.map(([n, a, b, f, maiorMelhor, dica]) => {
    let ca = "", cb = "", dif = "";
    if (a != null && b != null && a !== b && maiorMelhor !== null) {
      const aMelhor = maiorMelhor ? a > b : a < b;
      ca = aMelhor ? "ab-melhor" : ""; cb = aMelhor ? "" : "ab-melhor";
    }
    if (a && b != null && typeof a === "number") {
      const d = b / a - 1;
      dif = `${d > 0 ? "+" : ""}${(d * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
    }
    return `<tr${n.startsWith("Conversão da página") ? ' class="ab-principal"' : ""}><td title="${esc(dica)}">${n}${dica ? `<small>${esc(dica)}</small>` : ""}</td><td class="n ${ca}">${f(a)}</td><td class="n ${cb}">${f(b)}</td><td class="n ab-dif">${dif}</td></tr>`;
  }).join("");

  // veredito pela conversão da página
  const conf = confiancaDiferenca(A.cadastros, A.visitantes, B.cadastros, B.visitantes);
  let veredito;
  if (A.visitantes + B.visitantes < 200 || A.cadastros + B.cadastros < 20) veredito = { cls: "espera", txt: `Ainda poucos dados (${fmt(A.visitantes + B.visitantes)} visitantes, ${fmt(A.cadastros + B.cadastros)} cadastros). Espere pelo menos 200 visitantes e 20 cadastros em cada lado antes de decidir.` };
  else if (conf != null && conf >= 0.95) {
    const ganhaB = B.conv > A.conv;
    veredito = { cls: "vence", txt: `<b>${ganhaB ? "Sem e-mail" : "Com e-mail"} converte mais</b>: ${pc(ganhaB ? B.conv : A.conv)} contra ${pc(ganhaB ? A.conv : B.conv)}, com ${pc(conf)} de confiança.${ganhaB ? " Lembre que sem e-mail você perde o canal de e-mail com esses leads." : ""}` };
  } else veredito = { cls: "empate", txt: `Até agora sem diferença confiável na conversão (${pc(A.conv)} com e-mail × ${pc(B.conv)} sem e-mail; confiança ${conf == null ? "—" : pc(conf)}, o ideal é 95%). Continue rodando.` };

  // por dia
  const dias = new Map();
  const gd = (d) => { if (!dias.has(d)) dias.set(d, { com_email: { vis: 0, cad: 0 }, sem_email: { vis: 0, cad: 0 } }); return dias.get(d); };
  (AB.dias || []).forEach(([d, v, , , , vis]) => { gd(d)[v].vis += +vis || 0; });
  UNICOS.forEach((l) => { if (l.ab) gd(l.dia)[l.ab].cad++; });
  const linhasDia = [...dias.keys()].sort().reverse().map((d) => {
    const x = dias.get(d), ca = x.com_email, sb = x.sem_email;
    const c1 = ca.vis ? ca.cad / ca.vis : null, c2 = sb.vis ? sb.cad / sb.vis : null;
    return `<tr><td>${dataBR(d)}</td><td class="n">${fmt(ca.vis)}</td><td class="n">${fmt(ca.cad)}</td><td class="n ${c1 != null && c2 != null && c1 > c2 ? "ab-melhor" : ""}">${pc(c1)}</td>
      <td class="n">${fmt(sb.vis)}</td><td class="n">${fmt(sb.cad)}</td><td class="n ${c1 != null && c2 != null && c2 > c1 ? "ab-melhor" : ""}">${pc(c2)}</td></tr>`;
  }).join("");

  alvo.innerHTML = `
    <div class="ab-cabeca">
      <div><p class="rotulo">Em andamento</p><h3>${AB_TESTE1.nome}</h3>
        <p class="t-nota">Desde ${dataBR(ini)} às ${horaSP.format(new Date(AB.inicio)).split(", ").pop()} · cada visitante é sorteado 50/50 e vê sempre a mesma versão</p></div>
      <div class="ab-versoes"><span class="ab-tag ab-tag--a">A · Com e-mail<small>nome, e-mail e WhatsApp</small></span><span class="ab-tag ab-tag--b">B · Sem e-mail<small>só nome e WhatsApp</small></span></div>
    </div>
    <p class="ab-veredito ab-veredito--${veredito.cls}">${veredito.txt}</p>
    <div class="tabela-wrap"><table class="tabela ab-tabela">
      <thead><tr><th>Métrica</th><th class="n">A · Com e-mail</th><th class="n">B · Sem e-mail</th><th class="n">B × A</th></tr></thead>
      <tbody>${corpo}</tbody></table></div>
    <h3 class="ab-sub">Por dia</h3>
    <div class="tabela-wrap"><table class="tabela">
      <thead><tr><th rowspan="2">Data</th><th class="n" colspan="3">A · Com e-mail</th><th class="n" colspan="3">B · Sem e-mail</th></tr>
      <tr><th class="n">Visitantes</th><th class="n">Cadastros</th><th class="n">Conversão</th><th class="n">Visitantes</th><th class="n">Cadastros</th><th class="n">Conversão</th></tr></thead>
      <tbody>${linhasDia || '<tr><td colspan="7" class="vazio">Sem visitas ainda.</td></tr>'}</tbody></table></div>
    <p class="t-nota ab-nota">Visitantes e aberturas do formulário são contados pela própria página (não pela Meta). A Meta não sabe qual versão cada pessoa viu, então investimento e CPL de cada versão são estimados (≈). Verde = melhor resultado na linha.</p>`;
}
