// Aba Disparos: WhatsApp API oficial (WABA 3) × leads com utm_medium=full_funnel.
// Envios por modelo vêm do template_analytics (dia UTC); volume e custo vêm do relatório de cobrança da Meta (meia hora, por número),
// custo = mensagens cobradas × preço da categoria (US$) × PTAX do dia. Usa rpc, fmt, brl, $, UNICOS, CONTA_SEL, opcoesGrafico.
let DISP = null;
const gDisp = {};
const COR_CONTA = { Docis: "#eda100", "Felipe Russo": "#4a3aa7" };
const grupoModelo = (nome) => (/inscricao_confirmada/i.test(nome) ? "insc" : /template/i.test(nome) ? "convite" : "outros");
const pct1 = (a, b) => (b ? (a / b * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%" : "—");
const dataCurta = (d) => d.slice(8, 10) + "/" + d.slice(5, 7);

async function carregarDisparos(token) {
  try { DISP = await rpc("dash_disparos_black2026", { p_token: token }); } catch (e) { DISP = null; }
  renderDisparos();
}

function renderDisparos() {
  const alvo = $("#disp-kpis");
  if (!alvo) return;
  if (!DISP) { alvo.innerHTML = '<p class="t-nota">Sem dados de disparos ainda.</p>'; return; }
  const contas = CONTA_SEL === "todas" ? ["Docis", "Felipe Russo"] : [CONTA_SEL];
  const ptaxDe = (() => { const P = DISP.ptax || []; return (d) => { let v = P.length ? +P[0][1] : 5.4; for (const [dia, p] of P) if (dia <= d) v = +p; return v; }; })();
  const preco = (cat) => +(DISP.precos?.[cat] || 0);
  const cobrada = (cat, tipo) => !/^FREE/.test(tipo) && preco(cat) > 0;

  // ---- custo e volume cobrado por dia/hora (Brasília) e conta ----
  const H = new Map(); // "dia|hora" -> {conta: {vol, custo}}
  const D = new Map(); // dia -> {conta: {vol, custo}}, mais _tot (as duas contas)
  const soma = (m, k, conta, vol, custo) => {
    const o = m.get(k) || {}; const c = o[conta] || (o[conta] = { vol: 0, custo: 0 });
    c.vol += vol; c.custo += custo; m.set(k, o);
  };
  for (const [dia, hora, conta, cat, tipo, vol] of DISP.volume_hora || []) {
    if (!cobrada(cat, tipo)) continue;
    const custo = vol * preco(cat) * ptaxDe(dia);
    soma(D, dia, "_tot", vol, custo);
    if (!contas.includes(conta)) continue;
    soma(H, dia + "|" + hora, conta, vol, custo);
    soma(D, dia, conta, vol, custo);
  }
  const daConta = (o) => contas.reduce((s, c) => ({ vol: s.vol + (o?.[c]?.vol || 0), custo: s.custo + (o?.[c]?.custo || 0) }), { vol: 0, custo: 0 });

  // ---- envios por modelo (somam as duas contas; a Meta não separa por número) ----
  const M = new Map((DISP.modelos || []).map(([id, nome, cat, st]) => [id, { id, nome, cat, st, grupo: grupoModelo(nome), env: 0, ent: 0, lid: 0, cli: 0, custo: 0, ult: "", dias: {} }]));
  const envDiaGrupo = new Map(); // dia -> {insc, convite, outros}
  for (const [dia, id, env, ent, lid, cli] of DISP.modelo_dia || []) {
    const m = M.get(id); if (!m) continue;
    m.env += env; m.ent += ent; m.lid += lid; m.cli += cli; m.dias[dia] = (m.dias[dia] || 0) + env;
    if (dia > m.ult) m.ult = dia;
    const g = envDiaGrupo.get(dia) || { insc: 0, convite: 0, outros: 0 }; g[m.grupo] += env; envDiaGrupo.set(dia, g);
  }
  // custo dos convites no dia = custo cobrado − inscrições e outros (sempre utilidade), na proporção da conta escolhida
  const custoConviteDia = (dia) => {
    const tot = D.get(dia)?._tot, c = daConta(D.get(dia));
    if (!tot || !c.custo) return { custo: 0, vol: 0, frac: 0 };
    const g = envDiaGrupo.get(dia) || { insc: 0, convite: 0, outros: 0 };
    const fracConta = tot.vol ? c.vol / tot.vol : 0;
    const naoConvite = (g.insc + g.outros) * fracConta;
    const custo = Math.max(0, c.custo - naoConvite * preco("UTILITY") * ptaxDe(dia));
    const vol = Math.max(0, c.vol - naoConvite);
    return { custo, vol, frac: c.custo ? custo / c.custo : 0, fracVol: c.vol ? vol / c.vol : 0 };
  };
  // custo por modelo: divide o custo de cada grupo no dia pelos envios × preço da categoria atual do modelo
  for (const dia of envDiaGrupo.keys()) {
    const conv = custoConviteDia(dia).custo;
    const doGrupo = [...M.values()].filter((m) => m.dias[dia]);
    const pesoConv = doGrupo.filter((m) => m.grupo === "convite").reduce((s, m) => s + m.dias[dia] * (preco(m.cat) || preco("UTILITY")), 0);
    const fracConta = (() => { const tot = D.get(dia)?._tot, c = daConta(D.get(dia)); return tot?.vol ? c.vol / tot.vol : 0; })();
    for (const m of doGrupo) {
      if (m.grupo === "convite") m.custo += pesoConv ? conv * m.dias[dia] * (preco(m.cat) || preco("UTILITY")) / pesoConv : 0;
      else m.custo += m.dias[dia] * fracConta * preco("UTILITY") * ptaxDe(dia);
    }
  }

  // ---- leads full_funnel (já filtrados pela conta global) ----
  const leadsFF = UNICOS.filter((l) => (l.utm_medium || "").toLowerCase() === "full_funnel");
  const leadsDia = new Map(), leadsHora = new Map();
  leadsFF.forEach((l) => {
    leadsDia.set(l.dia, (leadsDia.get(l.dia) || 0) + 1);
    const h = Math.floor(l.minuto / 60); leadsHora.set(l.dia + "|" + h, (leadsHora.get(l.dia + "|" + h) || 0) + 1);
  });

  // ---- séries por dia ----
  const dias = [...new Set([...D.keys(), ...leadsDia.keys()])].filter((d) => d >= "2026-10-16").sort();
  const serie = dias.map((d) => {
    const cc = custoConviteDia(d), porConta = {};
    contas.forEach((c) => { const o = D.get(d)?.[c]; porConta[c] = o ? o.custo * cc.frac : 0; });
    return { d, custo: cc.custo, envios: cc.vol, leads: leadsDia.get(d) || 0, porConta };
  });
  const tot = serie.reduce((s, x) => ({ custo: s.custo + x.custo, envios: s.envios + x.envios, leads: s.leads + x.leads }), { custo: 0, envios: 0, leads: 0 });
  const insc = [...M.values()].filter((m) => m.grupo === "insc");
  const conv = [...M.values()].filter((m) => m.grupo === "convite");
  const somaG = (L, k) => L.reduce((s, m) => s + m[k], 0);

  // ---- KPIs ----
  alvo.innerHTML = [
    ["Custo dos convites", brl(tot.custo), `${fmt(tot.envios)} mensagens cobradas`],
    ["Leads full_funnel", fmt(tot.leads), "utm_medium = full_funnel"],
    ["Custo por lead", tot.leads ? brl(tot.custo / tot.leads) : "—", "custo dos convites ÷ leads"],
    ["Conversão", pct1(tot.leads, tot.envios), "inscrições ÷ convites enviados"],
    ["Inscrição confirmada", brl(somaG(insc, "custo")), `${fmt(somaG(insc, "env"))} envios · ${pct1(somaG(insc, "cli"), somaG(insc, "ent"))} clicaram`],
    ["Última leitura da Meta", DISP.sync?.em ? horaSP.format(new Date(DISP.sync.em)) : "—", DISP.sync?.ok === false ? "falhou: " + (DISP.sync.erro || "") : "atualiza de hora em hora"]
  ].map(([r, n, s]) => `<div class="kpi"><p class="rotulo">${r}</p><p class="kpi__num">${n}</p><p class="kpi__sub">${esc(s)}</p></div>`).join("");

  // ---- tabelas de modelos ----
  const linhaModelo = (m) => `<tr><td><b>${esc(m.nome)}</b><small class="delta">${m.cat === "MARKETING" ? "Marketing" : m.cat === "UTILITY" ? "Utilidade" : esc(m.cat || "")}${m.st !== "APPROVED" ? " · " + esc(m.st) : ""}</small></td>
    <td class="n">${fmt(m.env)}</td><td class="n">${pct1(m.ent, m.env)}</td><td class="n">${pct1(m.lid, m.ent)}</td><td class="n">${pct1(m.cli, m.ent)}</td>
    <td class="n">${brl(m.custo)}</td><td class="n">${m.ult ? dataCurta(m.ult) : "—"}</td></tr>`;
  const totalModelos = (L, rot) => `<tr><td>${rot}</td><td class="n">${fmt(somaG(L, "env"))}</td><td class="n">${pct1(somaG(L, "ent"), somaG(L, "env"))}</td>
    <td class="n">${pct1(somaG(L, "lid"), somaG(L, "ent"))}</td><td class="n">${pct1(somaG(L, "cli"), somaG(L, "ent"))}</td><td class="n">${brl(somaG(L, "custo"))}</td><td></td></tr>`;
  const preencher = (id, L, rot) => {
    L.sort((a, b) => b.env - a.env);
    $(id + " tbody").innerHTML = L.map(linhaModelo).join("") || '<tr><td colspan="7" class="vazio">Nenhum envio.</td></tr>';
    $(id + " tfoot").innerHTML = L.length ? totalModelos(L, rot) : "";
  };
  preencher("#t-disp-insc", insc, `Total · ${insc.length} modelos`);
  preencher("#t-disp-conv", conv, `Total convites · ${conv.length} modelos`);

  // ---- gráficos por dia ----
  const rotDia = serie.map((x) => dataCurta(x.d));
  grafico("g-disp-gasto-dia", {
    type: "bar",
    data: { labels: rotDia, datasets: contas.map((c) => ({ label: c, data: serie.map((x) => x.porConta[c]), backgroundColor: COR_CONTA[c], borderRadius: 4, stack: "s" })) },
    options: opcoesMoeda({ stacked: true, legenda: contas.length > 1 })
  });
  grafico("g-disp-cpl-dia", {
    type: "line",
    data: { labels: rotDia, datasets: [{ label: "Custo por lead", data: serie.map((x) => (x.leads && x.custo ? x.custo / x.leads : null)), borderColor: "#0b0b0b", backgroundColor: "#0b0b0b", tension: .25, spanGaps: true, pointRadius: 3 }] },
    options: opcoesMoeda({})
  });
  grafico("g-disp-conv-dia", configConversao(rotDia, serie.map((x) => x.envios), serie.map((x) => x.leads)));

  // ---- por hora do dia escolhido ----
  const sel = $("#disp-dia");
  const comDados = serie.filter((x) => x.envios || x.leads).map((x) => x.d);
  const atual = sel.value && comDados.includes(sel.value) ? sel.value : comDados[comDados.length - 1];
  sel.innerHTML = comDados.slice().reverse().map((d) => `<option value="${d}"${d === atual ? " selected" : ""}>${dataCurta(d)}</option>`).join("");
  sel.onchange = renderDisparos;
  const cc = atual ? custoConviteDia(atual) : { frac: 0, fracVol: 0 };
  const horas = [...Array(24).keys()];
  const hs = horas.map((h) => {
    const o = H.get(atual + "|" + h), c = daConta(o), porConta = {};
    contas.forEach((k) => { porConta[k] = (o?.[k]?.custo || 0) * cc.frac; });
    return { custo: c.custo * cc.frac, envios: c.vol * cc.fracVol, leads: leadsHora.get(atual + "|" + h) || 0, porConta };
  });
  const rotH = horas.map((h) => h + "h");
  grafico("g-disp-gasto-hora", {
    type: "bar",
    data: { labels: rotH, datasets: contas.map((c) => ({ label: c, data: hs.map((x) => x.porConta[c]), backgroundColor: COR_CONTA[c], borderRadius: 4, stack: "s" })) },
    options: opcoesMoeda({ stacked: true, legenda: contas.length > 1 })
  });
  grafico("g-disp-cpl-hora", {
    type: "line",
    data: { labels: rotH, datasets: [{ label: "Custo por lead", data: hs.map((x) => (x.leads && x.custo ? x.custo / x.leads : null)), borderColor: "#0b0b0b", backgroundColor: "#0b0b0b", tension: .25, spanGaps: true, pointRadius: 3 }] },
    options: opcoesMoeda({})
  });
  grafico("g-disp-conv-hora", configConversao(rotH, hs.map((x) => x.envios), hs.map((x) => x.leads)));

  // ---- tabela por dia ----
  $("#t-disp-dia tbody").innerHTML = serie.slice().reverse().map((x) => `<tr><td>${dataCurta(x.d)}</td><td class="n">${fmt(x.envios)}</td><td class="n">${brl(x.custo)}</td>
    <td class="n">${fmt(x.leads)}</td><td class="n">${x.leads && x.custo ? brl(x.custo / x.leads) : "—"}</td><td class="n">${pct1(x.leads, x.envios)}</td></tr>`).join("");
}

function grafico(id, cfg) {
  const el = document.getElementById(id); if (!el) return;
  if (gDisp[id]) gDisp[id].destroy();
  gDisp[id] = new Chart(el, cfg);
}
function opcoesMoeda({ stacked = false, legenda = false }) {
  const o = opcoesGrafico({ stacked, legenda });
  o.plugins.tooltip.callbacks.label = (c) => ` ${c.dataset.label}: ${c.parsed.y == null ? "—" : brl(c.parsed.y)}`;
  if (stacked) o.plugins.tooltip.callbacks.footer = (it) => "Total: " + brl(it.reduce((s, i) => s + (i.parsed.y || 0), 0));
  o.scales.y.ticks.callback = (v) => brl(v).replace(",00", "");
  o.scales.y.ticks.precision = undefined;
  return o;
}
// envios (barras, eixo esquerdo) × inscrições (linha, eixo direito); a conversão aparece no rodapé da dica
function configConversao(labels, envios, leads) {
  const o = opcoesGrafico({ legenda: true });
  const eixo = (cor, txt) => ({ color: cor, font: { family: "Montserrat", size: 11 } , text: txt, display: true });
  o.scales.y.title = eixo("#8a857f", "convites");
  o.scales.y2 = { position: "right", beginAtZero: true, grid: { drawOnChartArea: false }, border: { display: false }, title: eixo("#1e853a", "inscrições"),
    ticks: { color: "#1e853a", font: { family: "Montserrat", size: 11 }, precision: 0, callback: (v) => fmt(v) } };
  o.plugins.tooltip.callbacks.footer = (it) => { const i = it[0].dataIndex; return envios[i] ? "Conversão: " + pct1(leads[i], envios[i]) : ""; };
  return {
    data: { labels, datasets: [
      { type: "bar", label: "Convites enviados", data: envios.map(Math.round), backgroundColor: "#c9c4bd", borderRadius: 4, yAxisID: "y", order: 2 },
      { type: "line", label: "Inscrições full_funnel", data: leads, borderColor: "#1e853a", backgroundColor: "#1e853a", yAxisID: "y2", tension: .25, pointRadius: 3, borderWidth: 2.5, order: 1 }
    ] },
    options: o
  };
}
