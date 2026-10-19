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

// só cadastros feitos depois do início do teste atual
const noTeste = (l) => AB && AB.inicio && Date.parse(l.criado_em) >= Date.parse(AB.inicio);
// versão no ar agora: blocos de 10 min a partir do início, 1º bloco sem e-mail
function versaoAgora() {
  if (!AB || !AB.inicio) return null;
  const bloco = (AB.bloco_min || 10) * 60000, ini = Date.parse(AB.inicio), b = Math.floor((Date.now() - ini) / bloco);
  if (b < 0) return { v: "sem_email", ate: new Date(ini + bloco), antes: true };
  return { v: b % 2 === 0 ? "sem_email" : "com_email", ate: new Date(ini + (b + 1) * bloco) };
}

function metricasVariante(v, ini) {
  const r = { visitantes: 0, visitantes_pagos: 0, popups: 0, cadastros: 0, cad_trafego: 0, atribuidos: 0, alunos: 0 };
  ((AB && AB.unicos) || []).forEach(([vv, us, um, uc, vis, pop]) => {
    if (vv !== v) return;
    r.visitantes += +vis || 0; r.popups += +pop || 0;
    if (tipoOrigem({ utm_source: us, utm_medium: um, utm_campaign: uc }) === "Tráfego") r.visitantes_pagos += +vis || 0;
  });
  UNICOS.forEach((l) => {
    if (l.ab !== v || !noTeste(l)) return;
    r.cadastros++;
    if (l.tipo === "Tráfego") r.cad_trafego++;
    if (typeof ATRIB !== "undefined" && ATRIB.has(l.id)) r.atribuidos++;
    if (l.perfil && l.perfil !== "nao_aluno") r.alunos++;
  });
  r.conv = r.visitantes ? r.cadastros / r.visitantes : null;
  r.conv_pago = r.visitantes_pagos ? r.cad_trafego / r.visitantes_pagos : null;
  r.tx_popup = r.visitantes ? r.popups / r.visitantes : null;
  r.conv_popup = r.popups ? r.cadastros / r.popups : null;
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
  UNICOS.forEach((l) => { if (l.ab && noTeste(l)) gd(l.dia)[l.ab].cad++; });
  const linhasDia = [...dias.keys()].sort().reverse().map((d) => {
    const x = dias.get(d), ca = x.com_email, sb = x.sem_email;
    const c1 = ca.vis ? ca.cad / ca.vis : null, c2 = sb.vis ? sb.cad / sb.vis : null;
    return `<tr><td>${dataBR(d)}</td><td class="n">${fmt(ca.vis)}</td><td class="n">${fmt(ca.cad)}</td><td class="n ${c1 != null && c2 != null && c1 > c2 ? "ab-melhor" : ""}">${pc(c1)}</td>
      <td class="n">${fmt(sb.vis)}</td><td class="n">${fmt(sb.cad)}</td><td class="n ${c1 != null && c2 != null && c2 > c1 ? "ab-melhor" : ""}">${pc(c2)}</td></tr>`;
  }).join("");

  // funil lado a lado, nas mesmas colunas da tabela (rótulo | A | B | B × A)
  const difPct = (a, b) => (a && b != null ? `${b / a - 1 > 0 ? "+" : ""}${((b / a - 1) * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%` : "");
  const etapasF = [["Visitantes únicos", "visitantes", 100], ["Abriram o formulário", "popups", 74], ["Cadastros", "cadastros", 50]];
  const conectF = [["abriram o formulário", "tx_popup"], ["cadastraram", "conv_popup"]];
  const melhorF = (k, x) => (A[k] != null && B[k] != null && A[k] !== B[k] && (x === "a" ? A[k] > B[k] : B[k] > A[k]) ? " abf__taxa--melhor" : "");
  let funil = `<div class="abf__cel abf__cab"></div><div class="abf__cel abf__cab abf__cab--a">A · Com e-mail</div><div class="abf__cel abf__cab abf__cab--b">B · Sem e-mail</div><div class="abf__cel abf__cab abf__dif">B × A</div>`;
  etapasF.forEach(([nome, k, w], i) => {
    funil += `<div class="abf__cel abf__rot">${nome}</div>
      <div class="abf__cel"><div class="abf__barra abf__barra--a" style="width:${w}%;opacity:${1 - i * 0.18}"><b>${fmt(A[k])}</b></div></div>
      <div class="abf__cel"><div class="abf__barra abf__barra--b" style="width:${w}%;opacity:${1 - i * 0.18}"><b>${fmt(B[k])}</b></div></div>
      <div class="abf__cel abf__dif">${difPct(A[k], B[k])}</div>`;
    if (conectF[i]) {
      const [cn, ck] = conectF[i];
      funil += `<div class="abf__cel abf__rot abf__rot--taxa">${cn}</div>
        <div class="abf__cel abf__con"><span class="abf__seta abf__seta--a">↓</span><b class="abf__taxa${melhorF(ck, "a")}">${pc(A[ck])}</b></div>
        <div class="abf__cel abf__con"><span class="abf__seta abf__seta--b">↓</span><b class="abf__taxa${melhorF(ck, "b")}">${pc(B[ck])}</b></div>
        <div class="abf__cel abf__dif">${difPct(A[ck], B[ck])}</div>`;
    }
  });
  funil += `<div class="abf__cel abf__rot abf__rot--total abf__fim">Conversão da página<small>visita → cadastro</small></div>
    <div class="abf__cel abf__con abf__fim"><span class="abf__total abf__total--a${melhorF("conv", "a")}">↳ ${pc(A.conv)}</span></div>
    <div class="abf__cel abf__con abf__fim"><span class="abf__total abf__total--b${melhorF("conv", "b")}">↳ ${pc(B.conv)}</span></div>
    <div class="abf__cel abf__dif abf__fim">${difPct(A.conv, B.conv)}</div>`;

  alvo.innerHTML = `
    <div class="ab-cabeca">
      <div><p class="rotulo">Em andamento</p><h3>${AB_TESTE1.nome}</h3>
        <p class="t-nota">Desde ${dataBR(ini)} às ${horaSP.format(new Date(AB.inicio)).split(", ").pop()} · as versões se alternam a cada ${AB.bloco_min || 10} minutos (começou pela sem e-mail)</p>
        ${(() => { const x = versaoAgora(); return x ? `<p class="ab-agora">${x.antes ? "Começa às " + horaSP.format(new Date(AB.inicio)).split(", ").pop() + " com" : "No ar agora:"} <b class="ab-agora--${x.v}">${x.v === "sem_email" ? "B · Sem e-mail" : "A · Com e-mail"}</b> até ${horaSP.format(x.ate).split(", ").pop()}</p>` : ""; })()}</div>
      <div class="ab-versoes"><span class="ab-tag ab-tag--a">A · Com e-mail<small>nome, e-mail e WhatsApp</small></span><span class="ab-tag ab-tag--b">B · Sem e-mail<small>só nome e WhatsApp</small></span></div>
    </div>
    <div class="abf" role="img" aria-label="Funil das duas versões: visitantes, aberturas do formulário e cadastros">${funil}</div>
    <p class="ab-veredito ab-veredito--${veredito.cls}">${veredito.txt}</p>
    <h3 class="ab-sub">Por dia</h3>
    <div class="tabela-wrap"><table class="tabela">
      <thead><tr><th rowspan="2">Data</th><th class="n" colspan="3">A · Com e-mail</th><th class="n" colspan="3">B · Sem e-mail</th></tr>
      <tr><th class="n">Visitantes</th><th class="n">Cadastros</th><th class="n">Conversão</th><th class="n">Visitantes</th><th class="n">Cadastros</th><th class="n">Conversão</th></tr></thead>
      <tbody>${linhasDia || '<tr><td colspan="7" class="vazio">Sem visitas ainda.</td></tr>'}</tbody></table></div>
    <p class="t-nota ab-nota">Visitantes e aberturas do formulário são contados pela própria página (não pela Meta). Verde = melhor resultado na linha. Custos não aparecem aqui: a Meta não sabe qual versão cada pessoa viu.</p>`;
}
