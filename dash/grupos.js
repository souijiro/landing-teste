// Aba Grupos: pessoas nos grupos de WhatsApp (contagem 4x/dia) × leads únicos. Usa rpc, fmt, esc, $, TZ, opcoesGrafico de dash.js.
const NIVEIS_GRUPO = [
  { min: 90, classe: "nivel--otimo", nome: "acima de 90%" },
  { min: 80, classe: "nivel--bom", nome: "80 a 90%" },
  { min: 70, classe: "nivel--atencao", nome: "70 a 80%" },
  { min: -Infinity, classe: "nivel--ruim", nome: "abaixo de 70%" }
];
const nivelGrupo = (p) => NIVEIS_GRUPO.find((n) => p >= n.min);
const pctTxt = (p) => p.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
const fmtDia = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const fmtHora = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const fmtDiaHora = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
let gGrupos = null;

function selo(membros, leads) {
  if (!leads) return '<span class="selo-nivel">—</span>';
  const p = membros / leads * 100, n = nivelGrupo(p);
  return `<span class="selo-nivel ${n.classe}">${pctTxt(p)}</span>`;
}
const delta = (v) => v == null ? "" : `<small class="delta">${v > 0 ? "+" : ""}${fmt(v)}</small>`;

async function carregarGrupos(token) {
  let d;
  try { d = await rpc("dash_grupos_black2026", { p_token: token }); } catch (e) { return; }
  const R = (d?.rodadas || []).map((r) => ({ ...r, em: new Date(r.rodada_em), col: new Date(r.coletado_em || r.rodada_em) }));
  // leads são contados até `col` (momento em que os grupos foram lidos); `em` (horário previsto) só agrupa por dia
  if (!R.length) { $("#grupos-hero").innerHTML = '<p class="t-nota">Nenhuma contagem ainda.</p>'; return; }
  const u = R[R.length - 1];

  // ---- Hero ----
  const p = u.leads ? u.membros / u.leads * 100 : 0, n = nivelGrupo(p);
  const box = $("#k-grupos-box");
  if (box) {
    box.className = "kpi kpi--grupos " + n.classe;
    $("#k-grupos").textContent = pctTxt(p);
    $("#k-grupos-sub").textContent = `${fmt(u.membros)} de ${fmt(u.leads)} leads · ${fmtHora.format(u.col)}`;
  }
  const alunosD = u.alunos_docis, alunosF = u.alunos_felipe;
  const quem = alunosD === alunosF ? "Empate entre alunos Docis e Felipe" : alunosD > alunosF ? "Mais alunos Docis nos grupos" : "Mais alunos Felipe nos grupos";
  $("#grupos-hero").innerHTML = `
    <div class="g-hero ${n.classe}">
      <p class="rotulo">Pessoas nos grupos ÷ leads únicos</p>
      <p class="g-hero__pct">${pctTxt(p)}</p>
      <p class="g-hero__sub"><b>${fmt(u.membros)}</b> nos ${u.grupos} grupos · <b>${fmt(u.leads)}</b> leads até ${fmtHora.format(u.col)}</p>
      <p class="g-hero__sub">Contagem de ${fmtDiaHora.format(u.col)} · faltam ${fmt(Math.max(0, u.leads - u.membros))} pessoas</p>
    </div>
    <div class="g-comp">
      <h3>${quem}</h3>
      ${compLinha("Alunos Docis", "#eda100", u.alunos_docis, u.com_telefone, u.leads_docis)}
      ${compLinha("Alunos Felipe Russo", "#4a3aa7", u.alunos_felipe, u.com_telefone, u.leads_felipe)}
      ${compLinha("Alunos dos dois", "#e87ba4", u.alunos_ambos, u.com_telefone, u.leads_ambos)}
      ${compLinha("Não alunos", "#c9c4bd", u.nao_alunos, u.com_telefone, null)}
      <p class="t-nota">Classificado pelo telefone de quem está nos grupos (${fmt(u.com_telefone)} com número visível). Ao lado, quantos leads daquele perfil existem.</p>
    </div>`;

  // ---- Por grupo (última contagem) + totais ----
  renderPorGrupo(d?.grupos || [], u);

  // ---- Gráfico por horário ----
  const rot = R.map((r) => fmtDiaHora.format(r.col));
  const dados = {
    labels: rot,
    datasets: [
      { type: "line", label: "Leads únicos", data: R.map((r) => r.leads), borderColor: "#0b0b0b", backgroundColor: "#0b0b0b", tension: .25, pointRadius: 3 },
      { type: "bar", label: "Pessoas nos grupos", data: R.map((r) => r.membros), backgroundColor: R.map((r) => corNivel(r.leads ? r.membros / r.leads * 100 : 0)), borderRadius: 6 }
    ]
  };
  const op = opcoesGrafico({ legenda: true });
  op.plugins.tooltip.callbacks.footer = (items) => { const r = R[items[0].dataIndex]; return r.leads ? "Nos grupos: " + pctTxt(r.membros / r.leads * 100) : ""; };
  if (gGrupos) { gGrupos.data = dados; gGrupos.options = op; gGrupos.update(); }
  else gGrupos = new Chart($("#g-grupos"), { data: dados, options: op });

  // ---- Tabela por horário (mais recente primeiro) ----
  $("#t-grupos-hora tbody").innerHTML = R.map((r, i) => {
    const a = R[i - 1];
    return `<tr><td>${esc(fmtDiaHora.format(r.col))}</td><td class="n">${fmt(r.leads)}${delta(a ? r.leads - a.leads : null)}</td><td class="n">${fmt(r.membros)}${delta(a ? r.membros - a.membros : null)}</td><td class="n">${selo(r.membros, r.leads)}</td><td class="n">${fmt(r.alunos_docis + r.alunos_ambos)}</td><td class="n">${fmt(r.alunos_felipe + r.alunos_ambos)}</td></tr>`;
  }).reverse().join("");

  // ---- Tabela por dia (última contagem de cada dia) ----
  const porDia = new Map();
  R.forEach((r) => porDia.set(fmtDia.format(r.em), r));
  const D = [...porDia.entries()];
  $("#t-grupos-dia tbody").innerHTML = D.map(([dia, r], i) => {
    const a = D[i - 1]?.[1];
    return `<tr><td>${dia.slice(8, 10)}/${dia.slice(5, 7)} <small class="delta">até ${fmtHora.format(r.col)}</small></td><td class="n">${fmt(r.leads)}</td><td class="n">${a ? fmt(r.leads - a.leads) : "—"}</td><td class="n">${fmt(r.membros)}</td><td class="n">${a ? fmt(r.membros - a.membros) : "—"}</td><td class="n">${selo(r.membros, r.leads)}</td></tr>`;
  }).reverse().join("");
}

function compLinha(nome, cor, n, total, leads) {
  const w = total ? n / total * 100 : 0;
  return `<div class="g-comp__linha"><span class="g-comp__nome"><i style="background:${cor}"></i>${nome}</span><span class="g-comp__num"><b>${fmt(n)}</b> · ${pctTxt(w)}${leads != null ? ` <small>de ${fmt(leads)} leads</small>` : ""}</span><span class="trilho"><b style="width:${w}%;background:${cor}"></b></span></div>`;
}

function corNivel(p) { return p >= 90 ? "#146c3a" : p >= 80 ? "#7ccf8f" : p >= 70 ? "#f08c2e" : "#e5484d"; }

// capacidade de cada grupo do WhatsApp; acima de 90% fica em vermelho
const CAPACIDADE_GRUPO = 1000, ALERTA_CAPACIDADE = 0.9;
function renderPorGrupo(G, u) {
  const alvo = $("#t-grupos-cada");
  if (!alvo) return;
  const num = (g) => +((g.grupo_nome || "").match(/#(\d+)/) || [])[1] || g.grupo_id;
  G = [...G].sort((a, b) => num(a) - num(b));
  const temBlack = G.some((g) => g.alunos_felipe_black != null);
  const nb = (v) => (v == null ? "—" : fmt(v));
  // lista de telefones cortada: perfis escalados ao total do grupo (estimativa, marcada com ≈)
  const cel = (g) => {
    const oc = g.membros / CAPACIDADE_GRUPO, cheio = oc >= ALERTA_CAPACIDADE;
    const fmt0 = fmt, est = g.estimado ? "≈" : "";
    const fmt = (v) => est + fmt0(v);
    return `<tr${cheio ? ' class="g-cheio"' : ""}><td><b>#${num(g)}</b>${cheio ? ' <span class="g-cheio__tag">quase cheio</span>' : ""}</td>
      <td class="n"><b>${fmt0(g.membros)}</b></td>
      <td class="g-ocup"><span class="trilho"><b style="width:${Math.min(100, oc * 100)}%"></b></span><small>${pctTxt(oc * 100)}</small></td>
      <td class="n">${fmt(g.alunos_docis)}</td><td class="n">${fmt(g.alunos_felipe)}</td><td class="n">${fmt(g.alunos_ambos)}</td>
      <td class="n">${nb(g.alunos_felipe_black)}</td><td class="n">${fmt(g.nao_alunos)}</td></tr>`;
  };
  const soma = (k) => G.reduce((s, g) => s + (+g[k] || 0), 0);
  const tot = { membros: soma("membros"), cap: G.length * CAPACIDADE_GRUPO };
  const cheios = G.filter((g) => g.membros / CAPACIDADE_GRUPO >= ALERTA_CAPACIDADE).length;
  alvo.querySelector("tbody").innerHTML = G.map(cel).join("") || '<tr><td colspan="8" class="vazio">Sem contagem ainda.</td></tr>';
  alvo.querySelector("tfoot").innerHTML = G.length ? `<tr><td>Total · ${G.length} grupos</td><td class="n">${fmt(tot.membros)}</td>
    <td class="g-ocup"><small>${pctTxt(tot.membros / tot.cap * 100)} de ${fmt(tot.cap)} vagas</small></td>
    <td class="n">${fmt(soma("alunos_docis"))}</td><td class="n">${fmt(soma("alunos_felipe"))}</td><td class="n">${fmt(soma("alunos_ambos"))}</td>
    <td class="n">${temBlack ? fmt(soma("alunos_felipe_black")) : "—"}</td><td class="n">${fmt(soma("nao_alunos"))}</td></tr>` : "";
  $("#grupos-cada-nota").textContent = `Contagem de ${fmtDiaHora.format(u.col)}. Capacidade de ${fmt(CAPACIDADE_GRUPO)} membros por grupo; em vermelho os que passaram de ${ALERTA_CAPACIDADE * 100}%`
    + (cheios ? ` (${cheios} agora).` : " (nenhum agora).")
    + " Docis, Felipe e Dos dois somam os alunos de cada perfil; Black Felipe é quem está na lista de compradores da Black do Felipe (já incluído em Felipe ou Dos dois)"
    + (temBlack ? "." : ", e começa a aparecer na próxima contagem.")
    + (G.some((g) => g.estimado) ? " ≈ = grupo com a lista de telefones cortada: perfis estimados na mesma proporção dos telefones lidos." : "");
}
