// Aba Vendas: webhook da Hotmart (hotmart-black2026) → vendas_black2026 e carrinhos_black2026.
// Professor = de quem a pessoa já era aluna (tabela alunos, por e-mail ou telefone). Usa rpc, fmt, esc, horaSP, $.
let VENDAS = null;
const brlV = (n) => (+n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 2 });
const ST_APROVADA = ["APPROVED", "COMPLETE", "COMPLETED"];
const ST_CANCELADA = ["CANCELED", "CANCELLED", "EXPIRED", "REFUNDED", "PARTIALLY_REFUNDED", "CHARGEBACK", "PROTESTED", "DISPUTE"];
const grupoStatus = (s) => (ST_APROVADA.includes(s) ? "aprovada" : ST_CANCELADA.includes(s) ? "cancelada" : "pendente");
const NOME_STATUS = {
  APPROVED: "Aprovada", COMPLETE: "Completa", COMPLETED: "Completa", CANCELED: "Cancelada", CANCELLED: "Cancelada", EXPIRED: "Expirada",
  REFUNDED: "Reembolsada", PARTIALLY_REFUNDED: "Reembolso parcial", CHARGEBACK: "Chargeback", PROTESTED: "Pedido de reembolso", DISPUTE: "Disputa",
  WAITING_PAYMENT: "Aguardando pagamento", BILLET_PRINTED: "Boleto impresso", PRINTED_BILLET: "Boleto impresso", OVERDUE: "Atrasada", DELAYED: "Atrasada"
};
const PROFS = [
  { id: "docis", nome: "Aluno da Ci", cabecas: ["ci"] },
  { id: "felipe", nome: "Aluno do Felipe", cabecas: ["fe"] },
  { id: "ambos", nome: "Aluno dos dois", cabecas: ["ci", "fe"] },
  { id: null, nome: "Não aluno", cabecas: [] }
];
const CONDICOES = [
  { id: "black", nome: "Aluno Black anterior", sub: "cupom BLACK · R$ 297" },
  { id: "aluno", nome: "Aluno", sub: "cupom ALUNOS · R$ 897" },
  { id: "novo", nome: "Novo aluno", sub: "sem cupom · R$ 1.397" }
];
const METODO = { CREDIT_CARD: "Cartão", PIX: "Pix", BILLET: "Boleto", PAYPAL: "PayPal", GOOGLE_PAY: "Google Pay", APPLE_PAY: "Apple Pay", HOTMART_CARD: "Hotmart Card", DEBIT_CARD: "Débito" };
// Preço de cada condição (valor cheio). A Hotmart manda em price.value o valor da cobrança: no parcelamento
// inteligente e no boleto parcelado é só a parcela, por isso o valor cheio sai da condição (cupom) da compra.
const PRECO = { black: 297, aluno: 897, novo: 1397 };
const emReais = (v) => !v.moeda || String(v.moeda).toUpperCase() === "BRL";
// parcelamento inteligente / boleto parcelado: a Hotmart cobra parcela a parcela
function parceladoAos(v) {
  const tab = PRECO[condicao(v)];
  if (v.recorrencia != null) return true;
  if (v.metodo === "BILLET" && v.parcelas > 1) return true;
  return emReais(v) && +v.valor > 0 && +v.valor < tab * 0.9;
}
const valorCheio = (v) => PRECO[condicao(v)];
function valorAprovado30(v) {
  const tab = PRECO[condicao(v)];
  if (!parceladoAos(v)) return tab;
  if (emReais(v) && +v.valor > 0 && +v.valor < tab * 0.9) return +v.valor; // veio só a parcela
  return v.parcelas > 1 ? tab / v.parcelas : tab;
}
// parcelas seguintes do parcelamento inteligente não são compras novas
const ehCompra = (v) => !(v.recorrencia > 1);
const META_VENDAS = 0.20; // meta de vendas = 20% dos leads captados

// gasto com tráfego da Meta nas duas contas (base sem o filtro de conta)
function investimentoTrafego() {
  const ins = typeof BASE !== "undefined" && BASE.insights ? BASE.insights : (typeof TRAF !== "undefined" ? TRAF.insights : []);
  return (ins || []).reduce((s, i) => s + (+i.investimento || 0), 0);
}
// custo da API oficial do WhatsApp (mesma conta da aba Disparos: mensagens cobradas × preço da categoria × PTAX), as duas contas
function custoApiOficial() {
  if (typeof DISP === "undefined" || !DISP) return 0;
  const P = DISP.ptax || [];
  const ptaxDe = (d) => { let v = P.length ? +P[0][1] : 5.4; for (const [dia, p] of P) if (dia <= d) v = +p; return v; };
  const preco = (cat) => +(DISP.precos?.[cat] || 0);
  let tot = 0;
  for (const [dia, , , cat, tipo, vol] of DISP.volume_hora || []) {
    if (/^FREE/.test(tipo) || !(preco(cat) > 0)) continue;
    tot += vol * preco(cat) * ptaxDe(dia);
  }
  return tot;
}

// pizza "Alunos entre os compradores" (mesmo desenho da aba principal, com as cabecinhas)
let gVendAlunos = null;
function renderAlunosVendas(aprov) {
  if (typeof GRUPOS_ALUNO === "undefined" || !$("#g-vend-alunos")) return;
  const chave = (p) => (p === "docis" ? "docis" : p === "felipe" ? "felipe" : p === "ambos" ? "ambos" : "nenhum");
  const cont = { docis: [], felipe: [], ambos: [], nenhum: [] };
  aprov.forEach((v) => cont[chave(v.professor)].push(v));
  const total = aprov.length, dados = GRUPOS_ALUNO.map((g) => cont[g.chave].length);
  const somaCheio = (l) => l.reduce((s, v) => s + valorCheio(v), 0);
  if (gVendAlunos) { gVendAlunos.data.datasets[0].data = dados; gVendAlunos.update(); }
  else {
    gVendAlunos = new Chart($("#g-vend-alunos"), {
      type: "doughnut",
      data: { labels: GRUPOS_ALUNO.map((g) => g.nome), datasets: [{ data: dados, backgroundColor: GRUPOS_ALUNO.map((g) => g.cor), borderColor: "#fff", borderWidth: 2, hoverOffset: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: true, cutout: "38%", animation: { duration: 300 },
        plugins: {
          legend: { display: false }, cabecas: { rotulo: "compras" },
          tooltip: { backgroundColor: "#0b0b0b", bodyFont: { family: "Montserrat" }, callbacks: { label: (c) => ` ${c.label}: ${fmt(c.parsed)} (${pct(c.parsed, c.dataset.data.reduce((s, x) => s + x, 0))})` } }
        }
      },
      plugins: [pluginCabecas]
    });
  }
  const ic = (t) => t === "ci" ? `<img src="${CABECA_CI.src}" alt="">` : t === "felipe" ? `<img src="${CABECA_FELIPE.src}" alt="">`
    : t === "ambos" ? `<img src="${CABECA_CI.src}" alt=""><img src="${CABECA_FELIPE.src}" alt="">` : `<span class="nenhum" aria-hidden="true"></span>`;
  const alunos = cont.docis.length + cont.felipe.length + cont.ambos.length;
  $("#vend-alunos-lista").innerHTML = GRUPOS_ALUNO.map((g) => `<li>
      <span class="alunos__icone">${ic(g.icone)}</span>
      <span class="alunos__nome"><i class="cor" style="background:${g.cor}"></i>${g.nome.replace("Não alunos", "Não alunos (novos)")}<span class="alunos__sub">${brlV(somaCheio(cont[g.chave]))} em vendas</span></span>
      <span class="alunos__num">${fmt(cont[g.chave].length)}<small>${pct(cont[g.chave].length, total)}</small></span></li>`).join("")
    + `<li class="total"><span class="alunos__icone">${ic("ambos")}</span>
      <span class="alunos__nome">Compradores que já eram alunos<span class="alunos__sub">${fmt(cont.nenhum.length)} novos · ${fmt(total)} compras aprovadas</span></span>
      <span class="alunos__num">${fmt(alunos)}<small>${pct(alunos, total)}</small></span></li>`;
}
const condicao = (v) => { const c = String(v.cupom || "").toUpperCase(); return c.includes("BLACK") ? "black" : c.includes("ALUNO") ? "aluno" : "novo"; };
const SRC_CABECA = { ci: "/black2026/img/cabeca-ci-flutuante.webp", fe: "/black2026/img/cabeca-felipe-flutuante.webp" };
const cabecas = (lista) => `<span class="v-cabecas">${lista.map((k) => `<img src="${SRC_CABECA[k]}" alt="" class="v-cabeca v-cabeca--${k}">`).join("")}</span>`;
const cabecasDe = (prof) => cabecas((PROFS.find((p) => p.id === (prof || null)) || PROFS[3]).cabecas);

async function carregarVendas(token) {
  try { VENDAS = await rpc("dash_vendas_black2026", { p_token: token }); } catch (e) { VENDAS = null; }
  renderVendas();
}

function renderVendas() {
  const alvo = $("#vend-kpis");
  if (!alvo) return;
  if (!VENDAS) { alvo.innerHTML = '<p class="t-nota">Não consegui carregar as vendas.</p>'; return; }
  const todasV = VENDAS.vendas || [], todosC = VENDAS.carrinhos || [];
  const reais = todasV.some((v) => !v.teste) || todosC.some((c) => !c.teste);
  const chk = $("#vend-testes");
  if (!chk.dataset.mexido) chk.checked = !reais; // sem venda real ainda: mostra os testes
  const comTeste = chk.checked;
  const V = todasV.filter((v) => comTeste || !v.teste), C = todosC.filter((c) => comTeste || !c.teste);
  const nTestes = todasV.filter((v) => v.teste).length + todosC.filter((c) => c.teste).length;
  $("#vend-testes-n").textContent = nTestes ? `(${fmt(nTestes)} recebido${nTestes > 1 ? "s" : ""})` : "(nenhum recebido)";

  const soma = (lista) => { const l = lista.filter(ehCompra); return { n: l.length, v: l.reduce((s, x) => s + valorCheio(x), 0), v30: l.reduce((s, x) => s + valorAprovado30(x), 0) }; };
  const por = (g) => V.filter((v) => grupoStatus(v.status) === g);
  const ap = soma(por("aprovada")), ca = soma(por("cancelada")), pe = soma(por("pendente"));
  const recup = C.filter((c) => c.comprou).length;
  const nParc = por("aprovada").filter((v) => ehCompra(v) && parceladoAos(v)).length;

  // meta: 20% dos leads captados (as duas contas)
  const captados = (typeof BASE !== "undefined" && BASE.unicos ? BASE.unicos : UNICOS).length;
  const meta = Math.round(captados * META_VENDAS);
  $("#vk-compras").textContent = fmt(ap.n);
  $("#vk-meta").textContent = fmt(meta);
  $("#vk-captados").textContent = fmt(captados);
  $("#vk-pct").textContent = pct(ap.n, meta);
  $("#vk-faltam").textContent = fmt(Math.max(0, meta - ap.n));
  $("#vk-barra-fill").style.width = (meta ? Math.min(100, ap.n / meta * 100) : 0) + "%";
  $("#vk-barra").setAttribute("aria-valuenow", meta ? Math.round(ap.n / meta * 100) : 0);

  // investimento: tráfego (Meta, as duas contas) + API oficial do WhatsApp
  const trafego = investimentoTrafego(), api = custoApiOficial(), invest = trafego + api;
  const roas = trafego ? ap.v / trafego : null, roi = invest ? (ap.v - invest) / invest : null, cac = ap.n ? invest / ap.n : null;
  const vezes = (x) => x == null ? "—" : x.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "x";
  const pctRoi = (x) => x == null ? "—" : (x * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + "%";
  alvo.innerHTML = [
    ["kpi--gigante kpi--destaque", "Valor das vendas (cheio)", brlV(ap.v), nParc ? `${fmt(nParc)} no parcelamento inteligente/boleto parcelado, contadas pelo valor total` : (ap.n ? "ticket médio " + brlV(ap.v / ap.n) : "valor total das compras aprovadas")],
    [captados && ap.n / captados >= META_VENDAS ? "kpi--verde" : "", "Conversão dos leads", captados ? pct(ap.n, captados) : "—", `${fmt(ap.n)} compras de ${fmt(captados)} leads captados · meta ${fmt(META_VENDAS * 100)}%`],
    ["kpi--verde", "Valor aprovado (30 dias)", brlV(ap.v30), nParc ? "só as parcelas já pagas" : "sem parcelamento inteligente"],
    ["", "ROAS", vezes(roas), trafego ? `valor cheio ÷ tráfego (${brlV(trafego)})` : "sem gasto de tráfego"],
    [roi != null && roi < 0 ? "kpi--vermelho-num" : "", "ROI", pctRoi(roi), invest ? `(valor cheio − investimento) ÷ investimento` : "sem investimento"],
    ["", "Investimento total", brlV(invest), `tráfego ${brlV(trafego)} + API oficial ${brlV(api)}`],
    ["", "CAC", cac == null ? "—" : brlV(cac), "investimento total ÷ compras aprovadas"]
  ].map(([c, r, n, s]) => `<div class="kpi ${c}"><p class="rotulo">${r}</p><p class="kpi__num">${n}</p><p class="kpi__sub">${esc(s)}</p></div>`).join("");
  renderAlunosVendas(por("aprovada").filter(ehCompra));
  $("#vend-kpis-2").innerHTML = [
    ["v-mini--vermelho", "Cancelamentos", ca, "inclui reembolso e chargeback"],
    ["v-mini--amarelo", "Aguardando pagamento", pe, "boleto/pix gerado"],
    ["v-mini--laranja", "Carrinho abandonado", { n: C.length }, recup ? `${fmt(recup)} compraram depois` : "ninguém comprou depois ainda"]
  ].map(([c, r, x, s]) => `<div class="v-mini ${c}"><p class="rotulo">${r}</p><p class="v-mini__num">${fmt(x.n)}${x.v != null ? ` <span>· ${brlV(x.v)}</span>` : ""}</p><p class="kpi__sub">${esc(s)}</p></div>`).join("");

  // ---- por professor ----
  const celulas = (lista) => {
    const a = soma(lista.filter((v) => grupoStatus(v.status) === "aprovada")), c = soma(lista.filter((v) => grupoStatus(v.status) === "cancelada"));
    return `<td class="n"><b>${fmt(a.n)}</b></td><td class="n">${brlV(a.v)}</td><td class="n">${brlV(a.v30)}</td><td class="n">${fmt(c.n)}</td><td class="n">${brlV(c.v)}</td>`;
  };
  $("#t-vend-prof tbody").innerHTML = PROFS.map((p) => {
    const lista = V.filter((v) => (v.professor || null) === p.id), carr = C.filter((c) => (c.professor || null) === p.id).length;
    return `<tr><td><span class="v-prof">${cabecas(p.cabecas)}${p.nome}</span></td>${celulas(lista)}<td class="n">${fmt(carr)}</td></tr>`;
  }).join("");
  $("#t-vend-prof tfoot").innerHTML = `<tr><td>Total</td>${celulas(V)}<td class="n">${fmt(C.length)}</td></tr>`;

  // ---- por condição (cupom) ----
  $("#t-vend-cond tbody").innerHTML = CONDICOES.map((k) =>
    `<tr><td><b>${k.nome}</b><br><span class="t-nota">${k.sub}</span></td>${celulas(V.filter((v) => condicao(v) === k.id))}</tr>`).join("");
  $("#t-vend-cond tfoot").innerHTML = `<tr><td>Total</td>${celulas(V)}</tr>`;

  // ---- por código src ----
  const codigo = (v) => v.src || "(sem src)";
  const grupos = {};
  V.forEach((v) => { (grupos[codigo(v)] ||= []).push(v); });
  const ordem = Object.keys(grupos).sort((a, b) => soma(grupos[b].filter((v) => grupoStatus(v.status) === "aprovada")).n - soma(grupos[a].filter((v) => grupoStatus(v.status) === "aprovada")).n || a.localeCompare(b));
  $("#t-vend-src tbody").innerHTML = ordem.length ? ordem.map((k) => {
    const rot = k === "(sem src)" ? `<span class="t-nota">${k}</span>` : `<b>${esc(k)}</b>`;
    return `<tr><td>${rot}</td>${celulas(grupos[k])}</tr>`;
  }).join("") : '<tr><td colspan="6" class="t-nota">Nenhuma compra ainda.</td></tr>';
  $("#t-vend-src tfoot").innerHTML = `<tr><td>Total</td>${celulas(V)}</tr>`;

  // ---- listas ----
  const quando = (iso) => (iso ? horaSP.format(new Date(iso)) : "—");
  const whats = (t) => { const d = String(t || "").replace(/\D/g, ""); if (!d) return "—"; const n = d.length <= 11 ? "55" + d : d; return `<a href="https://wa.me/${n}" target="_blank" rel="noopener">${esc(t)}</a>`; };
  const tagSt = (s) => `<span class="v-st v-st--${grupoStatus(s)}">${esc(NOME_STATUS[s] || s || "—")}</span>`;
  $("#t-vend-lista tbody").innerHTML = V.length ? V.map((v) => `<tr>
      <td>${quando(v.em)}</td><td>${tagSt(v.status)}${v.teste ? ' <span class="v-teste">teste</span>' : ""}</td>
      <td>${cabecasDe(v.professor)}${esc(v.nome || "—")}<br><span class="t-nota">${esc(v.email || "")}</span></td>
      <td>${whats(v.telefone)}</td><td>${esc((CONDICOES.find((k) => k.id === condicao(v)) || {}).nome)}</td>
      <td class="n">${brlV(valorCheio(v))}${parceladoAos(v) ? `<br><span class="t-nota">${v.recorrencia > 1 ? "parcela " + v.recorrencia : "parcela paga"} ${brlV(valorAprovado30(v))}</span>` : ""}</td><td>${esc(METODO[v.metodo] || v.metodo || "—")}${v.parcelas > 1 ? " " + v.parcelas + "x" : ""}${parceladoAos(v) ? (v.metodo === "BILLET" ? " · boleto parcelado" : " · parcelamento inteligente") : ""}</td></tr>`).join("")
    : '<tr><td colspan="7" class="t-nota">Nenhuma compra recebida ainda.</td></tr>';
  $("#t-vend-carr tbody").innerHTML = C.length ? C.map((c) => `<tr>
      <td>${quando(c.em)}</td><td>${cabecasDe(c.professor)}${esc(c.nome || "—")}${c.teste ? ' <span class="v-teste">teste</span>' : ""}<br><span class="t-nota">${esc(c.email || "")}</span></td>
      <td>${whats(c.telefone)}</td><td>${c.comprou ? '<span class="v-st v-st--aprovada">Comprou depois</span>' : '<span class="v-st v-st--pendente">Não comprou</span>'}</td></tr>`).join("")
    : '<tr><td colspan="4" class="t-nota">Nenhum carrinho abandonado recebido ainda.</td></tr>';
  $("#vend-ultimo").textContent = VENDAS.ultimo_evento ? "último aviso da Hotmart: " + quando(VENDAS.ultimo_evento) : "nenhum aviso da Hotmart ainda";
  renderVendasTempo(V, C);
  if (typeof renderComparativo === "function") renderComparativo(); // a aba Comparativo usa as mesmas vendas
}

// ---- por dia e por hora (horário de Brasília) ----
const gVend = {};
const COR_PROF = { docis: "#eda100", felipe: "#4a3aa7", ambos: "#1baf7a", null: "#b9b2a9" };
const horaNum = (iso) => +new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", hourCycle: "h23" }).format(new Date(iso));
function graficoVendas(id, labels, aprov, legendaX, linha) {
  const el = document.getElementById(id); if (!el) return;
  if (gVend[id]) gVend[id].destroy();
  const somaCheio = (l) => l.reduce((s, v) => s + valorCheio(v), 0);
  const o = opcoesGrafico({ stacked: !linha, legenda: true });
  o.plugins.tooltip.callbacks.label = (c) => {
    const lista = aprov[c.dataIndex].filter((v) => (v.professor || null) === PROFS[c.datasetIndex].id);
    return ` ${c.dataset.label}: ${fmt(c.parsed.y)} · ${brlV(somaCheio(lista))}`;
  };
  o.plugins.tooltip.callbacks.footer = (it) => { const l = aprov[it[0].dataIndex]; return `Total: ${fmt(l.length)} · ${brlV(somaCheio(l))}`; };
  if (linha) o.plugins.tooltip.filter = (it) => it.datasetIndex < PROFS.length; // a linha do total vai no rodapé
  if (legendaX) o.plugins.tooltip.callbacks.title = (it) => legendaX(it[0].dataIndex);
  const porProf = PROFS.map((p) => ({ label: p.nome, data: aprov.map((l) => l.filter((v) => (v.professor || null) === p.id).length) }));
  const datasets = linha
    ? [...porProf.map((d, i) => ({ ...d, borderColor: COR_PROF[PROFS[i].id], backgroundColor: COR_PROF[PROFS[i].id], borderWidth: 2, pointRadius: 3, cubicInterpolationMode: "monotone" })),
       { label: "Total", data: aprov.map((l) => l.length), borderColor: "#0b0b0b", backgroundColor: "#0b0b0b", borderWidth: 3, pointRadius: 4, cubicInterpolationMode: "monotone" }]
    : porProf.map((d, i) => ({ ...d, backgroundColor: COR_PROF[PROFS[i].id], borderRadius: 3, maxBarThickness: 46 }));
  gVend[id] = new Chart(el, { type: linha ? "line" : "bar", data: { labels, datasets }, options: o });
}
function renderVendasTempo(V, C) {
  const aprovadas = V.filter((v) => grupoStatus(v.status) === "aprovada" && v.em && ehCompra(v));
  const hoje = diaSP.format(new Date());
  const diasCom = [...V, ...C].map((x) => x.em && diaSP.format(new Date(x.em))).filter(Boolean).sort();
  const ini = diasCom[0] && diasCom[0] < hoje ? diasCom[0] : hoje;
  const dias = []; for (let d = ini; d <= hoje; d = somaDias(d, 1)) dias.push(d);
  const doDia = (lista, d) => lista.filter((x) => x.em && diaSP.format(new Date(x.em)) === d);

  graficoVendas("g-vend-dia", dias.map(dataBR), dias.map((d) => doDia(aprovadas, d)), null, true);

  // tabela por dia (mais recente primeiro)
  const somaV = (l) => l.reduce((s, v) => s + valorCheio(v), 0);
  const soma30 = (l) => l.reduce((s, v) => s + valorAprovado30(v), 0);
  $("#t-vend-dia tbody").innerHTML = dias.slice().reverse().map((d) => {
    const a = doDia(aprovadas, d), c = doDia(V.filter((v) => grupoStatus(v.status) === "cancelada"), d), k = doDia(C, d);
    return `<tr><td>${dataBR(d)}</td><td class="n"><b>${fmt(a.length)}</b></td><td class="n">${brlV(somaV(a))}</td><td class="n">${brlV(soma30(a))}</td><td class="n">${fmt(c.length)}</td><td class="n">${brlV(somaV(c))}</td><td class="n">${fmt(k.length)}</td></tr>`;
  }).join("");

  // por hora do dia escolhido
  const sel = $("#vend-dia");
  const escolhido = sel.value && dias.includes(sel.value) ? sel.value : hoje;
  sel.innerHTML = dias.slice().reverse().map((d) => `<option value="${d}"${d === escolhido ? " selected" : ""}>${d === hoje ? "Hoje · " : ""}${dataBR(d)}</option>`).join("");
  const doDiaEsc = doDia(aprovadas, escolhido);
  const horas = [...Array(24).keys()];
  const porHora = horas.map((h) => doDiaEsc.filter((v) => horaNum(v.em) === h));
  graficoVendas("g-vend-hora", horas.map((h) => h + "h"), porHora, (i) => `${dataBR(escolhido)} · ${i}h às ${i}h59`);
  const totDia = somaV(doDiaEsc);
  $("#vend-hora-resumo").textContent = `${dataBR(escolhido)}: ${fmt(doDiaEsc.length)} aprovada${doDiaEsc.length === 1 ? "" : "s"} · ${brlV(totDia)}`;
}
document.addEventListener("change", (e) => {
  if (e.target.id === "vend-testes") { e.target.dataset.mexido = "1"; renderVendas(); }
  if (e.target.id === "vend-dia") renderVendas();
});
