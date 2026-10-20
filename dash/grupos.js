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
  const R = (d?.rodadas || []).map((r) => ({ ...r, em: new Date(r.rodada_em) }));
  if (!R.length) { $("#grupos-hero").innerHTML = '<p class="t-nota">Nenhuma contagem ainda.</p>'; return; }
  const u = R[R.length - 1];

  // ---- Hero ----
  const p = u.leads ? u.membros / u.leads * 100 : 0, n = nivelGrupo(p);
  const box = $("#k-grupos-box");
  if (box) {
    box.className = "kpi kpi--grupos " + n.classe;
    $("#k-grupos").textContent = pctTxt(p);
    $("#k-grupos-sub").textContent = `${fmt(u.membros)} de ${fmt(u.leads)} leads · ${fmtHora.format(u.em)}`;
  }
  const alunosD = u.alunos_docis, alunosF = u.alunos_felipe;
  const quem = alunosD === alunosF ? "Empate entre alunos Docis e Felipe" : alunosD > alunosF ? "Mais alunos Docis nos grupos" : "Mais alunos Felipe nos grupos";
  $("#grupos-hero").innerHTML = `
    <div class="g-hero ${n.classe}">
      <p class="rotulo">Pessoas nos grupos ÷ leads únicos</p>
      <p class="g-hero__pct">${pctTxt(p)}</p>
      <p class="g-hero__sub"><b>${fmt(u.membros)}</b> nos ${u.grupos} grupos · <b>${fmt(u.leads)}</b> leads até ${fmtHora.format(u.em)}</p>
      <p class="g-hero__sub">Contagem de ${fmtDiaHora.format(u.em)} · faltam ${fmt(Math.max(0, u.leads - u.membros))} pessoas</p>
    </div>
    <div class="g-comp">
      <h3>${quem}</h3>
      ${compLinha("Alunos Docis", "#eda100", u.alunos_docis, u.com_telefone, u.leads_docis)}
      ${compLinha("Alunos Felipe Russo", "#4a3aa7", u.alunos_felipe, u.com_telefone, u.leads_felipe)}
      ${compLinha("Alunos dos dois", "#e87ba4", u.alunos_ambos, u.com_telefone, u.leads_ambos)}
      ${compLinha("Não alunos", "#c9c4bd", u.nao_alunos, u.com_telefone, null)}
      <p class="t-nota">Classificado pelo telefone de quem está nos grupos (${fmt(u.com_telefone)} com número visível). Ao lado, quantos leads daquele perfil existem.</p>
    </div>`;

  // ---- Gráfico por horário ----
  const rot = R.map((r) => fmtDiaHora.format(r.em));
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
    return `<tr><td>${esc(fmtDiaHora.format(r.em))}</td><td class="n">${fmt(r.leads)}${delta(a ? r.leads - a.leads : null)}</td><td class="n">${fmt(r.membros)}${delta(a ? r.membros - a.membros : null)}</td><td class="n">${selo(r.membros, r.leads)}</td><td class="n">${fmt(r.alunos_docis + r.alunos_ambos)}</td><td class="n">${fmt(r.alunos_felipe + r.alunos_ambos)}</td></tr>`;
  }).reverse().join("");

  // ---- Tabela por dia (última contagem de cada dia) ----
  const porDia = new Map();
  R.forEach((r) => porDia.set(fmtDia.format(r.em), r));
  const D = [...porDia.entries()];
  $("#t-grupos-dia tbody").innerHTML = D.map(([dia, r], i) => {
    const a = D[i - 1]?.[1];
    return `<tr><td>${dia.slice(8, 10)}/${dia.slice(5, 7)} <small class="delta">até ${fmtHora.format(r.em)}</small></td><td class="n">${fmt(r.leads)}</td><td class="n">${a ? fmt(r.leads - a.leads) : "—"}</td><td class="n">${fmt(r.membros)}</td><td class="n">${a ? fmt(r.membros - a.membros) : "—"}</td><td class="n">${selo(r.membros, r.leads)}</td></tr>`;
  }).reverse().join("");
}

function compLinha(nome, cor, n, total, leads) {
  const w = total ? n / total * 100 : 0;
  return `<div class="g-comp__linha"><span class="g-comp__nome"><i style="background:${cor}"></i>${nome}</span><span class="g-comp__num"><b>${fmt(n)}</b> · ${pctTxt(w)}${leads != null ? ` <small>de ${fmt(leads)} leads</small>` : ""}</span><span class="trilho"><b style="width:${w}%;background:${cor}"></b></span></div>`;
}

function corNivel(p) { return p >= 90 ? "#146c3a" : p >= 80 ? "#7ccf8f" : p >= 70 ? "#f08c2e" : "#e5484d"; }
