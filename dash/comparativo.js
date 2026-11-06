// Aba Comparativo: Black 2025 (planilha Hotmart + boleto parcelado, tabela vendas_black2025) × Black 2026 (webhook).
// Os dois anos são alinhados pela abertura do carrinho: hora 0 / dia 1 = abertura de cada ano.
// Segmento do aluno (black / low ticket / outros / novo) vem da função dash_comparativo_black2026.
// Usa rpc, fmt, pct, esc, horaSP, $ (dash.js) e VENDAS, valorCheio, ehCompra, condicao, brlV, ST_APROVADA (vendas.js).
let CMP; // undefined = carregando, null = falhou
const ABERTURA = { 2025: new Date("2025-10-27T20:00:00-03:00"), 2026: new Date("2026-11-05T20:00:00-03:00") };
// A planilha da Hotmart 2025 não tem valor: usa a mistura real do boleto parcelado de 2025
// (163 alunos a R$ 897 + 39 novos a R$ 1.397 = R$ 993,53 por venda). Troque aqui se tiver o valor certo.
const VALOR_HOTMART_2025 = (163 * 897 + 39 * 1397) / 202;
const SEGMENTOS = [
  { id: "black", nome: "Alunos da Black anterior", sub: "compraram a Black 2025" },
  { id: "low_ticket", nome: "Alunos do low ticket", sub: "só compraram produto de entrada" },
  { id: "aluno", nome: "Outros alunos", sub: "Docis ou Felipe, outros cursos" },
  { id: "novo", nome: "Não alunos", sub: "fora da base de alunos" }
];
const COR_ANO = { 2025: "#a8a29e", 2026: "#1e853a" };
const cmpOpc = { escala: "hora", medida: "vendas", acumulado: true };
let gCmp = null;

async function carregarComparativo(token) {
  try { CMP = await rpc("dash_comparativo_black2026", { p_token: token }); } catch (e) { CMP = null; }
  renderComparativo();
}

// vendas dos dois anos no mesmo formato: { em: Date, valor }
function vendasAno(ano) {
  if (ano === 2025) return (CMP?.b2025 || []).map(([canal, em, valor]) => ({ em: new Date(em), valor: canal === "hotmart" ? VALOR_HOTMART_2025 : +valor, canal }));
  return ((typeof VENDAS !== "undefined" && VENDAS?.vendas) || [])
    .filter((v) => !v.teste && ST_APROVADA.includes(v.status) && ehCompra(v))
    .map((v) => ({ em: new Date(v.em), valor: valorCheio(v), v }));
}
const horasDesde = (ano, d) => Math.floor((d - ABERTURA[ano]) / 36e5);
// dia 1 = dia da abertura (calendário de Brasília)
const diaDesde = (ano, d) => Math.round((new Date(diaSP.format(d)) - new Date(diaSP.format(ABERTURA[ano]))) / 864e5) + 1;

function serie(ano, n, idx) {
  const out = Array.from({ length: n }, () => ({ q: 0, v: 0 }));
  for (const x of vendasAno(ano)) { const i = idx(ano, x.em); if (i >= 0 && i < n) { out[i].q++; out[i].v += x.valor; } }
  return out;
}

function renderComparativo() {
  const alvo = $("#cmp-kpis");
  if (!alvo) return;
  if (CMP === undefined) return;
  if (!CMP) { alvo.innerHTML = '<p class="t-nota">Não consegui carregar o comparativo.</p>'; return; }
  const v25 = vendasAno(2025), v26 = vendasAno(2026);
  const agoraH = Math.max(0, horasDesde(2026, new Date()));
  // mesmo ponto do ano passado: vendas de 2025 até a mesma quantidade de horas desde a abertura
  const ate = (l, ano, h) => l.filter((x) => horasDesde(ano, x.em) < h);
  const s = (l) => ({ n: l.length, v: l.reduce((t, x) => t + x.valor, 0) });
  const a26 = s(v26), a25p = s(ate(v25, 2025, agoraH + 1)), a25 = s(v25);
  const varia = (a, b) => (b ? ((a - b) / b * 100).toLocaleString("pt-BR", { maximumFractionDigits: 0, signDisplay: "always" }) + "%" : "—");
  const cls = (a, b) => (b ? (a >= b ? "kpi--verde" : "kpi--vermelho-num") : "");
  const hb = v25.filter((x) => x.canal === "hotmart").length, bo = v25.length - hb;
  alvo.innerHTML = [
    [cls(a26.n, a25p.n), "Vendas 2026", fmt(a26.n), `${varia(a26.n, a25p.n)} vs. 2025 no mesmo ponto (${fmt(a25p.n)} vendas em ${fmt(agoraH + 1)}h)`],
    [cls(a26.v, a25p.v), "Faturamento 2026", brlV(a26.v), `${varia(a26.v, a25p.v)} vs. 2025 no mesmo ponto (${brlV(a25p.v)})`],
    ["", "Black 2025 · total", fmt(a25.n), `${fmt(hb)} na Hotmart + ${fmt(bo)} no boleto parcelado`],
    ["", "Faturamento 2025 · total", brlV(a25.v), `Hotmart estimada a ${brlV(VALOR_HOTMART_2025)} por venda`]
  ].map(([c, r, n, sub]) => `<div class="kpi ${c}"><p class="rotulo">${r}</p><p class="kpi__num">${n}</p><p class="kpi__sub">${esc(sub)}</p></div>`).join("");
  renderGraficoCmp();
  renderSegmentos(v26);
}

function renderGraficoCmp() {
  const porHora = cmpOpc.escala === "hora";
  const ultimo = (ano) => Math.max(0, ...vendasAno(ano).map((x) => (porHora ? horasDesde(ano, x.em) : diaDesde(ano, x.em) - 1)));
  const n = porHora ? Math.max(120, Math.max(0, horasDesde(2026, new Date())) + 1) : Math.max(ultimo(2025), ultimo(2026)) + 1;
  const idx = porHora ? horasDesde : (ano, d) => diaDesde(ano, d) - 1;
  const agora26 = porHora ? horasDesde(2026, new Date()) : diaDesde(2026, new Date()) - 1;
  const labels = Array.from({ length: n }, (_, i) => (porHora ? `${i}h` : `Dia ${i + 1}`));
  const ds = [2025, 2026].map((ano) => {
    let tot = 0;
    const dados = serie(ano, n, idx).map((p, i) => {
      if (ano === 2026 && i > agora26) return null; // 2026 só até agora
      const x = cmpOpc.medida === "vendas" ? p.q : p.v;
      tot += x; return cmpOpc.acumulado ? tot : x;
    });
    return { label: "Black " + ano, data: dados, borderColor: COR_ANO[ano], backgroundColor: COR_ANO[ano], borderWidth: ano === 2026 ? 3 : 2,
      borderDash: ano === 2025 ? [6, 4] : [], pointRadius: porHora ? 0 : 3, pointHoverRadius: 5, tension: 0, cubicInterpolationMode: "monotone", spanGaps: false };
  });
  const val = (y) => (cmpOpc.medida === "vendas" ? fmt(y) : brlV(y));
  const quando = (ano, i) => horaSP.format(new Date(+ABERTURA[ano] + (porHora ? i * 36e5 : i * 864e5)));
  const opts = {
    responsive: true, maintainAspectRatio: false, animation: { duration: 250 }, interaction: { mode: "index", intersect: false },
    scales: { x: { ticks: { maxTicksLimit: porHora ? 12 : 16, autoSkip: true }, grid: { display: false } },
      y: { beginAtZero: true, ticks: { callback: (y) => (cmpOpc.medida === "vendas" ? fmt(y) : "R$ " + (y >= 1000 ? fmt(y / 1000) + " mil" : fmt(y))) } } },
    plugins: { legend: { position: "bottom", labels: { usePointStyle: true, font: { family: "Montserrat", weight: 700 } } },
      tooltip: { backgroundColor: "#0b0b0b", titleFont: { family: "Montserrat" }, bodyFont: { family: "Montserrat" },
        callbacks: {
          title: (it) => labels[it[0].dataIndex] + (porHora ? " depois da abertura" : ""),
          label: (c) => ` ${c.dataset.label}: ${val(c.parsed.y)}${porHora ? "" : " · " + quando(+c.dataset.label.slice(-4), c.dataIndex).slice(0, 5)}`
        } } }
  };
  if (gCmp) gCmp.destroy();
  gCmp = new Chart($("#g-cmp"), { type: "line", data: { labels, datasets: ds }, options: opts });
  $("#cmp-nota").textContent = porHora
    ? "0h = abertura do carrinho (27/10/2025 20h e 05/11/2026 20h). Mostra as primeiras 120 horas (5 dias)."
    : "Dia 1 = dia da abertura do carrinho de cada ano (27/10/2025 e 05/11/2026). O boleto parcelado de 2025 foi até 01/12.";
}

function renderSegmentos(v26) {
  const segV = CMP.seg_vendas || {}, L = CMP.seg_leads || {}, B = CMP.seg_base || {};
  const segDe = (x) => segV[x.v.transacao] || "novo";
  const cont = {};
  SEGMENTOS.forEach((g) => { cont[g.id] = []; });
  v26.forEach((x) => cont[segDe(x)].push(x));
  const pc = (a, b) => (b ? pct(a, b) : "—");
  // destaque para low ticket e Black anterior
  $("#cmp-seg-kpis").innerHTML = ["low_ticket", "black"].map((id) => {
    const g = SEGMENTOS.find((s) => s.id === id), n = cont[id].length;
    return `<div class="kpi"><p class="rotulo">${g.nome}</p><p class="kpi__num">${fmt(n)} <span class="cmp-conv">${pc(n, L[id])}</span></p>
      <p class="kpi__sub">compraram · ${pc(n, L[id])} dos ${fmt(L[id] || 0)} leads ${id === "black" ? "da Black anterior" : "do low ticket"} · ${pc(n, B[id])} da base (${fmt(B[id] || 0)})</p></div>`;
  }).join("");
  const tl = Object.values(L).reduce((a, b) => a + b, 0);
  $("#t-cmp-seg tbody").innerHTML = SEGMENTOS.map((g) => {
    const l = cont[g.id], v = l.reduce((t, x) => t + x.valor, 0);
    return `<tr><td><b>${g.nome}</b><br><span class="t-nota">${g.sub}</span></td><td class="n">${fmt(L[g.id] || 0)}</td><td class="n"><b>${fmt(l.length)}</b></td>
      <td class="n"><b>${pc(l.length, L[g.id])}</b></td><td class="n">${g.id === "novo" ? "—" : fmt(B[g.id] || 0)}</td><td class="n">${g.id === "novo" ? "—" : pc(l.length, B[g.id])}</td><td class="n">${brlV(v)}</td></tr>`;
  }).join("");
  $("#t-cmp-seg tfoot").innerHTML = `<tr><td>Total</td><td class="n">${fmt(tl)}</td><td class="n">${fmt(v26.length)}</td><td class="n">${pc(v26.length, tl)}</td><td></td><td></td><td class="n">${brlV(v26.reduce((t, x) => t + x.valor, 0))}</td></tr>`;
  const lista = (id, sel) => {
    const l = cont[id].slice().sort((a, b) => b.em - a.em);
    $(sel + " tbody").innerHTML = l.length ? l.map((x) => `<tr><td>${horaSP.format(x.em)}</td><td>${esc(x.v.nome || "—")}<br><span class="t-nota">${esc(x.v.email || "")}</span></td>
      <td>${esc((CONDICOES.find((k) => k.id === condicao(x.v)) || {}).nome || "")}</td><td class="n">${brlV(x.valor)}</td></tr>`).join("")
      : '<tr><td colspan="4" class="t-nota">Ninguém deste grupo comprou ainda.</td></tr>';
  };
  lista("low_ticket", "#t-cmp-lt");
  lista("black", "#t-cmp-black");
}

document.querySelectorAll(".cmp-opc button").forEach((b) => b.addEventListener("click", () => {
  const grupo = b.parentElement.dataset.opc;
  b.parentElement.querySelectorAll("button").forEach((x) => x.classList.toggle("ativo", x === b));
  cmpOpc[grupo] = grupo === "acumulado" ? b.dataset.v === "1" : b.dataset.v;
  if (CMP) renderGraficoCmp();
}));
