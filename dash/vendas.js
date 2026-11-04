// Aba Vendas: webhook da Hotmart (hotmart-black2026) → vendas_black2026 e carrinhos_black2026.
// Professor = de quem a pessoa já era aluna (tabela alunos, por e-mail ou telefone). Usa rpc, fmt, esc, horaSP, $.
let VENDAS = null;
const brlV = (n) => (+n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
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

  const soma = (lista) => ({ n: lista.length, v: lista.reduce((s, x) => s + (+x.valor || 0), 0) });
  const por = (g) => V.filter((v) => grupoStatus(v.status) === g);
  const ap = soma(por("aprovada")), ca = soma(por("cancelada")), pe = soma(por("pendente"));
  const recup = C.filter((c) => c.comprou).length;
  alvo.innerHTML = [
    ["kpi--destaque", "Compras aprovadas", fmt(ap.n), brlV(ap.v)],
    ["", "Compras canceladas", fmt(ca.n), brlV(ca.v) + " · inclui reembolso e chargeback"],
    ["", "Aguardando pagamento", fmt(pe.n), brlV(pe.v) + " · boleto/pix gerado"],
    ["", "Carrinhos abandonados", fmt(C.length), recup ? `${fmt(recup)} compraram depois` : "ninguém comprou depois ainda"]
  ].map(([c, r, n, s]) => `<div class="kpi ${c}"><p class="rotulo">${r}</p><p class="kpi__num">${n}</p><p class="kpi__sub">${esc(s)}</p></div>`).join("");

  // ---- por professor ----
  const celulas = (lista) => {
    const a = soma(lista.filter((v) => grupoStatus(v.status) === "aprovada")), c = soma(lista.filter((v) => grupoStatus(v.status) === "cancelada"));
    return `<td class="n"><b>${fmt(a.n)}</b></td><td class="n">${brlV(a.v)}</td><td class="n">${fmt(c.n)}</td><td class="n">${brlV(c.v)}</td>`;
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

  // ---- listas ----
  const quando = (iso) => (iso ? horaSP.format(new Date(iso)) : "—");
  const whats = (t) => { const d = String(t || "").replace(/\D/g, ""); if (!d) return "—"; const n = d.length <= 11 ? "55" + d : d; return `<a href="https://wa.me/${n}" target="_blank" rel="noopener">${esc(t)}</a>`; };
  const tagSt = (s) => `<span class="v-st v-st--${grupoStatus(s)}">${esc(NOME_STATUS[s] || s || "—")}</span>`;
  $("#t-vend-lista tbody").innerHTML = V.length ? V.map((v) => `<tr>
      <td>${quando(v.em)}</td><td>${tagSt(v.status)}${v.teste ? ' <span class="v-teste">teste</span>' : ""}</td>
      <td>${cabecasDe(v.professor)}${esc(v.nome || "—")}<br><span class="t-nota">${esc(v.email || "")}</span></td>
      <td>${whats(v.telefone)}</td><td>${esc((CONDICOES.find((k) => k.id === condicao(v)) || {}).nome)}</td>
      <td class="n">${brlV(v.valor)}</td><td>${esc(v.metodo || "—")}${v.parcelas > 1 ? " " + v.parcelas + "x" : ""}</td></tr>`).join("")
    : '<tr><td colspan="7" class="t-nota">Nenhuma compra recebida ainda.</td></tr>';
  $("#t-vend-carr tbody").innerHTML = C.length ? C.map((c) => `<tr>
      <td>${quando(c.em)}</td><td>${cabecasDe(c.professor)}${esc(c.nome || "—")}${c.teste ? ' <span class="v-teste">teste</span>' : ""}<br><span class="t-nota">${esc(c.email || "")}</span></td>
      <td>${whats(c.telefone)}</td><td>${c.comprou ? '<span class="v-st v-st--aprovada">Comprou depois</span>' : '<span class="v-st v-st--pendente">Não comprou</span>'}</td></tr>`).join("")
    : '<tr><td colspan="4" class="t-nota">Nenhum carrinho abandonado recebido ainda.</td></tr>';
  $("#vend-ultimo").textContent = VENDAS.ultimo_evento ? "último aviso da Hotmart: " + quando(VENDAS.ultimo_evento) : "nenhum aviso da Hotmart ainda";
}
document.addEventListener("change", (e) => { if (e.target.id === "vend-testes") { e.target.dataset.mexido = "1"; renderVendas(); } });
