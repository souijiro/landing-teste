// Dash Black Vitalícia 2026 — lê leads_black2026 via RPC protegida por senha (token em cookie)
const SUPABASE_URL = "https://eoqyoeohbcpdjxghfwua.supabase.co";
const SUPABASE_KEY = "sb_publishable_cv-1jB60ZGb1hJHYQi0qPA_LwF9DS98";
const PAINEL = "black2026";
const COOKIE = "dash_black2026";
const META = 10000;
const FIM_CAPTACAO = "2026-11-05"; // dia do evento (5/11 às 19h)
const INICIO_CAPTACAO = "2026-10-16"; // 1º dia da captação (antes disso eram só testes)
const FAIXA_IGUAL = 0.10; // ±10% da média = "igual"
const TZ = "America/Sao_Paulo";
const ATUALIZAR_A_CADA = 60 * 1000;

// Classificação de origem (mesma lógica da planilha: campanha *_trafego / fontes pagas = Tráfego)
const FONTES_PAGAS = ["facebook", "fb", "meta", "google", "gads", "youtube", "tiktok", "ig_ads", "facebook_ads"];
const MEIOS_PAGOS = ["cpc", "paid", "pago", "ads", "trafego", "tráfego", "paid_social"];
const TIPOS = ["Tráfego", "Orgânico", "Sem UTM"];
const COR = { "Tráfego": "#2a78d6", "Orgânico": "#eb6834", "Sem UTM": "#1baf7a" };
const TAG = { "Tráfego": "trafego", "Orgânico": "organico", "Sem UTM": "semutm" };
const PERFIS = { aluno_docis: "Aluno Docis", aluno_docis_black: "Aluno Docis (Black)", aluno_felipe: "Aluno Felipe", aluno_felipe_black: "Aluno Felipe (Black)", aluno_ambos: "Aluno dos dois", nao_aluno: "Não aluno" };

const $ = (s) => document.querySelector(s);
const fmt = (n) => Math.round(n).toLocaleString("pt-BR");
const pct = (a, b) => (b ? (a / b * 100) : 0).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%";
const esc = (t) => String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const diaSP = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
const horaSP = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
const dataBR = (iso) => iso.slice(8, 10) + "/" + iso.slice(5, 7);
const _hm = new Intl.DateTimeFormat("en-GB", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
function minutoSP(d) { const [h, m] = _hm.format(d).split(":").map(Number); return h * 60 + m; }
function somaDias(iso, n) { const d = new Date(iso + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
function difDias(a, b) { return Math.round((new Date(b + "T12:00:00Z") - new Date(a + "T12:00:00Z")) / 86400000); }

// ---------- Cookie / login ----------
function lerToken() { const m = document.cookie.match(new RegExp("(?:^|; )" + COOKIE + "=([^;]+)")); return m ? decodeURIComponent(m[1]) : null; }
function salvarToken(t) { document.cookie = `${COOKIE}=${encodeURIComponent(t)}; max-age=${90 * 86400}; path=/dash; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`; }
function apagarToken() { document.cookie = `${COOKIE}=; max-age=0; path=/dash`; }

async function rpc(nome, corpo) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${nome}`, {
    method: "POST",
    headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify(corpo)
  });
  const dados = await r.json().catch(() => null);
  if (!r.ok) { const e = new Error(dados?.message || "erro"); e.code = dados?.code; throw e; }
  return dados;
}

function mostrarLogin() { $("#app").hidden = true; $("#login").hidden = false; $("#senha").focus(); }
function mostrarApp() { $("#login").hidden = true; $("#app").hidden = false; }

$("#login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("#login-erro").hidden = true;
  $("#login-btn").disabled = true;
  try {
    const token = await rpc("dash_login", { p_painel: PAINEL, p_senha: $("#senha").value });
    if (!token) { $("#login-erro").hidden = false; return; }
    salvarToken(token);
    $("#senha").value = "";
    mostrarApp();
    carregar();
  } catch (err) {
    $("#login-erro").textContent = "Não foi possível entrar. Tente de novo.";
    $("#login-erro").hidden = false;
  } finally { $("#login-btn").disabled = false; }
});
$("#sair").addEventListener("click", () => { apagarToken(); location.reload(); });

// ---------- Dados ----------
let LEADS = [];      // todos os cadastros
let UNICOS = [];     // primeiro cadastro de cada e-mail
let timer = null;

function tipoOrigem(l) {
  const c = (l.utm_campaign || "").toLowerCase(), s = (l.utm_source || "").toLowerCase(), m = (l.utm_medium || "").toLowerCase();
  if (!c && !s && !m) return "Sem UTM";
  if (c.includes("traf") || c.includes("pago") || FONTES_PAGAS.includes(s) || MEIOS_PAGOS.includes(m)) return "Tráfego";
  return "Orgânico";
}

function preparar(linhas) {
  LEADS = linhas.map((r) => {
    const l = { id: r[0], criado_em: r[1], nome: r[2], email: (r[3] || "").toLowerCase(), telefone: r[4], pais: (r[5] || "").toUpperCase(),
      utm_source: r[6], utm_medium: r[7], utm_campaign: r[8], utm_content: r[9], utm_term: r[10], pagina_origem: r[11], perfil: r[12], low_ticket: r[13] === true };
    // Teste A/B 1: versão do formulário (antes do teste todos tinham e-mail)
    l.variante = r[14] || (l.email ? "com_email" : "sem_email");
    l.ab = r[14] || null; // só cadastros feitos durante o teste
    l.pessoa = l.email || "tel:" + (l.telefone || "").replace(/\D/g, "");
    l.dia = diaSP.format(new Date(l.criado_em));
    l.minuto = minutoSP(new Date(l.criado_em));
    l.tipo = tipoOrigem(l);
    return l;
  }).sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  // únicos por e-mail (sem e-mail, pelo telefone); vale o primeiro cadastro
  const vistos = new Set();
  UNICOS = [...LEADS].sort((a, b) => a.criado_em.localeCompare(b.criado_em)).filter((l) => {
    if (vistos.has(l.pessoa)) return false; vistos.add(l.pessoa); return true;
  });
  const idsUnicos = new Set(UNICOS.map((l) => l.id));
  LEADS.forEach((l) => { l.unico = idsUnicos.has(l.id); });
}

async function carregar() {
  const token = lerToken();
  if (!token) return mostrarLogin();
  $("#recarregar").disabled = true;
  try {
    const [linhas, traf, horas, ab] = await Promise.all([
      rpc("dash_leads_black2026", { p_token: token }),
      rpc("dash_trafego_black2026", { p_token: token }).catch((e) => { if (e.code === "28000") throw e; return null; }),
      rpc("dash_trafego_horas_black2026", { p_token: token }).catch(() => null),
      rpc("dash_ab_black2026", typeof periodoAB === "function" ? periodoAB() : { p_token: token }).catch(() => null)
    ]);
    AB = ab;
    preparar(linhas || []);
    if (traf) { prepararTrafego(traf); TRAF.horas = horas || []; registrarConjuntosHora(); }
    renderPainel();
    montarFiltros();
    renderLeads();
    if (traf) { montarFiltrosTrafego(); renderTrafego(); }
    if (traf && typeof renderAB === "function") renderAB();
    if (typeof carregarAnalise === "function") carregarAnalise();
    carregarBases(token);
    $("#atualizado").textContent = "Atualizado " + horaSP.format(new Date()) + " · atualiza sozinho a cada 1 min";
  } catch (err) {
    if (err.code === "28000") { apagarToken(); return mostrarLogin(); }
    $("#atualizado").textContent = "Falha ao atualizar — tentando de novo em 1 min";
  } finally {
    $("#recarregar").disabled = false;
    clearTimeout(timer);
    timer = setTimeout(carregar, ATUALIZAR_A_CADA);
  }
}
$("#recarregar").addEventListener("click", carregar);

// ---------- Abas ----------
document.querySelectorAll(".aba").forEach((b) => b.addEventListener("click", () => {
  document.querySelectorAll(".aba").forEach((x) => { x.classList.toggle("ativa", x === b); x.setAttribute("aria-selected", x === b); });
  document.querySelectorAll(".aba-conteudo").forEach((m) => { m.hidden = m.id !== "aba-" + b.dataset.aba; });
  if (b.dataset.aba === "trafego" && typeof gInv !== "undefined" && gInv) gInv.resize();
  try { localStorage.setItem("dash_aba", b.dataset.aba); } catch (e) {}
}));
try { const a = localStorage.getItem("dash_aba"); if (a) document.querySelector(`.aba[data-aba="${a}"]`)?.click(); } catch (e) {}

// ---------- Aba Dashboard ----------
let gDia = null;

function serieDias() {
  const hoje = diaSP.format(new Date());
  const inicio = hoje < INICIO_CAPTACAO ? hoje : INICIO_CAPTACAO; // captação: 16/10 a 5/11
  const dias = [];
  for (let d = inicio; d <= hoje; d = somaDias(d, 1)) dias.push(d);
  const porDia = Object.fromEntries(dias.map((d) => [d, { "Tráfego": 0, "Orgânico": 0, "Sem UTM": 0 }]));
  UNICOS.forEach((l) => { if (porDia[l.dia]) porDia[l.dia][l.tipo]++; });
  const antes = UNICOS.filter((l) => l.dia < inicio).length; // cadastros de teste antes da captação
  return { dias, porDia, hoje, antes };
}

function renderPainel() {
  const n = UNICOS.length;
  const { dias, porDia, hoje, antes } = serieDias();
  const tot = (d) => (porDia[d] ? TIPOS.reduce((s, t) => s + porDia[d][t], 0) : 0);
  const ontem = somaDias(hoje, -1);

  $("#k-unicos").textContent = fmt(n);
  $("#k-pct").textContent = pct(n, META);
  $("#k-faltam").textContent = fmt(Math.max(0, META - n));
  $("#barra-fill").style.width = Math.min(100, n / META * 100) + "%";
  $("#barra").setAttribute("aria-valuenow", Math.round(n / META * 100));

  $("#k-hoje").textContent = fmt(tot(hoje));
  $("#k-hoje-sub").textContent = TIPOS.map((t) => `${t}: ${fmt(porDia[hoje]?.[t] || 0)}`).join(" · ");
  $("#k-ontem").textContent = fmt(tot(ontem));

  // média diária: só dias completos da captação (sem hoje, que é parcial), últimos 7
  const completos = dias.filter((d) => d >= INICIO_CAPTACAO && d < hoje).slice(-7);
  let media7 = completos.length ? completos.reduce((s, d) => s + tot(d), 0) / completos.length : 0;
  if (!completos.length) { // primeiro dia: estima pelo ritmo de hoje até agora
    const agora = minutoSP(new Date());
    media7 = agora > 60 ? tot(hoje) * 1440 / agora : tot(hoje);
  }
  $("#k-media").textContent = fmt(media7);
  $("#k-media").parentElement.querySelector(".rotulo").textContent = completos.length ? `Média/dia (${completos.length} dia${completos.length > 1 ? "s" : ""} completo${completos.length > 1 ? "s" : ""})` : "Média/dia (estimada hoje)";

  // dias restantes contando hoje até o dia do evento
  const restantes = Math.max(0, difDias(hoje, FIM_CAPTACAO) + 1);
  const faltam = Math.max(0, META - n);
  $("#k-ritmo").textContent = restantes ? fmt(Math.ceil(faltam / restantes)) : "—";
  $("#k-ritmo-sub").textContent = restantes ? `${restantes} dia${restantes > 1 ? "s" : ""} até 5/11` : "captação encerrada";
  // projeção: dias seguintes na média de 7 dias + o que falta para hoje chegar na média
  const proj = restantes ? n + media7 * (restantes - 1) + Math.max(0, media7 - tot(hoje)) : n;
  $("#k-proj").textContent = fmt(proj);
  $("#k-proj-sub").textContent = `${pct(proj, META)} da meta no ritmo da média diária`;

  // tráfego (Meta)
  const invDia = typeof totaisTrafegoPorDia === "function" ? totaisTrafegoPorDia() : new Map();
  const invTotal = [...invDia.values()].reduce((s, v) => s + v, 0);
  const leadsAtrib = (d) => UNICOS.filter((l) => (!d || l.dia === d) && typeof ATRIB !== "undefined" && ATRIB.has(l.id)).length;
  const totAtrib = leadsAtrib(null);
  $("#k-inv").textContent = brl(invTotal);
  $("#k-inv-sub").textContent = `hoje: ${brl(invDia.get(hoje) || 0)}`;
  $("#k-cpl").textContent = totAtrib ? brl(invTotal / totAtrib) : "—";
  $("#k-cpl-sub").textContent = `${fmt(totAtrib)} leads ligados aos anúncios`;
  const atribHoje = leadsAtrib(hoje);
  $("#k-cpl-hoje").textContent = invDia.get(hoje) && atribHoje ? brl(invDia.get(hoje) / atribHoje) : "—";
  $("#k-cpl-hoje-sub").textContent = `${brl(invDia.get(hoje) || 0)} · ${fmt(atribHoje)} leads hoje`;

  $("#k-total").textContent = fmt(LEADS.length);
  $("#k-dup").textContent = `${fmt(LEADS.length - n)} cadastros repetidos (mesmo e-mail ou telefone)`;

  // gráfico único: barras = leads por dia (eixo esquerdo) · linhas = acumulado, projeção e meta (eixo direito)
  const diasAte = [];
  for (let d = dias[0] || hoje; d <= FIM_CAPTACAO; d = somaDias(d, 1)) diasAte.push(d);
  let ac = antes;
  const acumPorDia = Object.fromEntries(dias.map((d) => [d, (ac += tot(d))]));
  const acumHoje = acumPorDia[hoje] ?? ac;
  const fimDeHoje = acumHoje + Math.max(0, media7 - tot(hoje));
  const serieReal = diasAte.map((d) => (d <= hoje ? acumPorDia[d] ?? null : null));
  const serieProj = diasAte.map((d) => (d < hoje ? null : d === hoje ? acumHoje : Math.round(fimDeHoje + media7 * difDias(hoje, d))));
  const labels = diasAte.map(dataBR);
  const maxY2 = Math.max(META, ...serieProj.filter((v) => v != null)) * 1.08;
  const maxY = Math.max(10, ...dias.map(tot)) * 1.25;
  $("#legenda-dia").innerHTML = TIPOS.map((t) => `<span><i style="background:${COR[t]}"></i>${t}</span>`).join("")
    + `<span><i style="background:#0b0b0b;height:3px"></i>Acumulado</span>
       <span><i style="background:rgba(87,83,78,.4);height:3px"></i>Projeção (${fmt(media7)}/dia)</span>
       <span><i style="background:#c9a800;height:3px"></i>Meta 10.000</span><span>🚀 5/11</span>`;
  $("#nota-captacao").textContent = `Captação de 16/10 a 5/11. Barras: leads únicos do dia (eixo da esquerda). Linhas: total acumulado, projeção no ritmo da média diária e meta (eixo da direita).${antes ? ` O acumulado inclui ${fmt(antes)} cadastro${antes > 1 ? "s" : ""} de teste antes de 16/10.` : ""}`;
  const barras = TIPOS.map((t) => ({
    type: "bar", label: t, yAxisID: "y", stack: "s", order: 2,
    data: diasAte.map((d) => (porDia[d] ? porDia[d][t] : null)), backgroundColor: COR[t],
    borderColor: "#fff", borderWidth: { top: 2 }, borderRadius: 4, borderSkipped: "bottom", maxBarThickness: 30
  }));
  const linhasGraf = [
    { type: "line", label: "Acumulado", yAxisID: "y2", order: 1, data: serieReal, borderColor: "#0b0b0b", backgroundColor: "#0b0b0b", borderWidth: 2.5, pointRadius: 2, pointHoverRadius: 5, tension: .25 },
    { type: "line", label: "Projeção", yAxisID: "y2", order: 1, data: serieProj, borderColor: "rgba(87,83,78,.4)", backgroundColor: "rgba(87,83,78,.4)", borderWidth: 3, pointRadius: 0, pointHoverRadius: 4, tension: 0 },
    { type: "line", label: "Meta", yAxisID: "y2", order: 1, data: diasAte.map(() => META), borderColor: "#c9a800", borderDash: [6, 5], borderWidth: 2, pointRadius: 0, pointHoverRadius: 0 }
  ];
  if (gDia) {
    gDia.data.labels = labels;
    [...barras, ...linhasGraf].forEach((ds, k) => { gDia.data.datasets[k].data = ds.data; });
    gDia.options.scales.y.suggestedMax = maxY; gDia.options.scales.y2.suggestedMax = maxY2;
    gDia.update();
  } else {
    const o = opcoesGrafico({ stacked: true, max: maxY });
    o.plugins.tooltip.filter = (i) => i.parsed.y != null && !(i.dataset.type === "bar" && i.parsed.y === 0 && i.dataIndex > dias.length - 1);
    o.plugins.tooltip.callbacks.label = (c) => ` ${c.dataset.label}: ${fmt(c.parsed.y)}`;
    o.plugins.tooltip.callbacks.footer = (items) => {
      const b = items.filter((i) => i.dataset.type === "bar");
      return b.length ? "Leads do dia: " + fmt(b.reduce((s2, i) => s2 + (i.parsed.y || 0), 0)) : "";
    };
    o.layout = { padding: { top: 26 } };
    o.scales.x.ticks.maxTicksLimit = 11;
    o.scales.y.title = { display: true, text: "leads por dia", color: "#8a857f", font: { family: "Montserrat", size: 11 } };
    o.scales.y2 = {
      position: "right", beginAtZero: true, suggestedMax: maxY2, grid: { drawOnChartArea: false }, border: { display: false },
      title: { display: true, text: "acumulado", color: "#8a857f", font: { family: "Montserrat", size: 11 } },
      ticks: { color: "#8a857f", font: { family: "Montserrat", size: 11 }, precision: 0, callback: (v) => fmt(v) }
    };
    gDia = new Chart($("#g-dia"), {
      type: "bar",
      data: { labels, datasets: [...barras, ...linhasGraf] },
      options: o,
      plugins: [{
        id: "foguete",
        afterDatasetsDraw(chart) {
          const { ctx, chartArea, scales } = chart;
          const x = scales.x.getPixelForValue(chart.data.labels.length - 1);
          ctx.save();
          ctx.strokeStyle = "rgba(201,168,0,.6)"; ctx.setLineDash([3, 4]); ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom); ctx.stroke();
          ctx.setLineDash([]); ctx.textAlign = "right"; ctx.textBaseline = "bottom";
          ctx.font = "22px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif"; ctx.fillText("🚀", x + 10, chartArea.top - 2);
          ctx.font = "700 11px Montserrat, sans-serif"; ctx.fillStyle = "#57534e"; ctx.fillText("Lançamento 5/11 · 19h", x - 16, chartArea.top - 6);
          ctx.restore();
        }
      }]
    });
  }

  // tabela por dia (mais recente em cima), com seta vs. média dos dias anteriores da captação
  // dia parcial (hoje): compara com a média dos dias anteriores ATÉ O MESMO HORÁRIO
  const agoraMin = minutoSP(new Date());
  const ateAgora = {}; // dia -> { tipo -> leads até o horário atual }
  UNICOS.forEach((l) => {
    if (l.minuto > agoraMin) return;
    ateAgora[l.dia] = ateAgora[l.dia] || { "Tráfego": 0, "Orgânico": 0, "Sem UTM": 0 };
    ateAgora[l.dia][l.tipo]++;
  });
  const cplDia = (d) => (invDia.get(d) && leadsAtrib(d) ? invDia.get(d) / leadsAtrib(d) : null);
  const media = (arr) => { const v = arr.filter((x) => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
  const seta = (valor, med, menorEhMelhor = false, parcial = false, formato = null) => {
    if (valor == null || med == null || med === 0) return '<span class="seta"></span>';
    const r = valor / med;
    const tipo = r > 1 + FAIXA_IGUAL ? "sobe" : r < 1 - FAIXA_IGUAL ? "desce" : "igual";
    const cor = tipo === "igual" ? "igual" : (tipo === "sobe") !== menorEhMelhor ? "sobe" : "desce";
    const simbolo = tipo === "sobe" ? "▲" : tipo === "desce" ? "▼" : "=";
    const quando = parcial ? " até este horário" : "";
    const medTxt = formato ? formato(med) : med.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    const txt = `${tipo === "sobe" ? "acima" : tipo === "desce" ? "abaixo" : "igual (±10%)"} da média dos dias anteriores${quando} (${medTxt})`;
    return `<span class="seta seta--${cor}" title="${txt}" aria-label="${txt}">${simbolo}</span>`;
  };
  ac = antes;
  const linhas = dias.map((d) => { ac += tot(d); return { d, ac }; }).reverse();
  $("#t-dia tbody").innerHTML = linhas.map(({ d, ac }) => {
    const anteriores = dias.filter((x) => x >= INICIO_CAPTACAO && x < d);
    const comparavel = d >= INICIO_CAPTACAO && anteriores.length;
    const parcial = d === hoje;
    const valorTipo = (dd, t) => (parcial ? (ateAgora[dd]?.[t] || 0) : porDia[dd][t]);
    const totTipos = (dd) => TIPOS.reduce((s, t) => s + valorTipo(dd, t), 0);
    const celTipo = (t) => `<td class="n">${fmt(porDia[d][t])}${comparavel ? seta(valorTipo(d, t), media(anteriores.map((x) => valorTipo(x, t))), false, parcial) : '<span class="seta"></span>'}</td>`;
    return `<tr>
      <td>${dataBR(d)}${parcial ? " · hoje (parcial)" : ""}</td>
      ${TIPOS.map(celTipo).join("")}
      <td class="n"><strong>${fmt(tot(d))}</strong>${comparavel ? seta(totTipos(d), media(anteriores.map(totTipos)), false, parcial) : '<span class="seta"></span>'}</td>
      <td class="n">${pct(tot(d), META)}</td>
      <td class="n">${fmt(ac)}</td>
      <td class="n">${invDia.get(d) ? brl(invDia.get(d)) : "—"}${comparavel && !parcial ? seta(invDia.get(d) || null, media(anteriores.map((x) => invDia.get(x) || null)), false, false, brl) : '<span class="seta"></span>'}</td>
      <td class="n">${cplDia(d) ? brl(cplDia(d)) : "—"}${comparavel ? seta(cplDia(d), media(anteriores.map(cplDia)), true, false, brl) : '<span class="seta"></span>'}</td></tr>`;
  }).join("")
    + (antes ? `<tr><td class="vazio">antes de 16/10 (testes)</td><td class="n" colspan="3"></td><td class="n">${fmt(antes)}</td><td class="n" colspan="4"></td></tr>` : "")
    + `<tr class="total"><td>Total</td>${TIPOS.map((t) => `<td class="n">${fmt(UNICOS.filter((l) => l.tipo === t).length)}</td>`).join("")}<td class="n">${fmt(n)}</td><td class="n">${pct(n, META)}</td><td class="n"></td><td class="n">${brl(invTotal)}</td><td class="n">${totAtrib ? brl(invTotal / totAtrib) : "—"}</td></tr>`;

  if (typeof renderAlunos === "function") renderAlunos();

  // quebras
  const quebras = [
    ["Por origem", (l) => l.tipo],
    ["Por campanha (utm_campaign)", (l) => l.utm_campaign],
    ["Por fonte (utm_source)", (l) => l.utm_source],
    ["Por meio (utm_medium)", (l) => l.utm_medium],
    ["Por expert / conteúdo (utm_content)", (l) => l.utm_content],
    ["Por anúncio (utm_term)", (l) => l.utm_term],
    ["Por perfil de aluno", (l) => (l.perfil ? PERFIS[l.perfil] || l.perfil : "Não aluno")],
    ["Por país", (l) => l.pais],
    ["Por domínio da página", (l) => { try { return new URL(l.pagina_origem).hostname; } catch (e) { return ""; } }],
    ["Por hora do dia", (l) => new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit" }).format(new Date(l.criado_em)) + "h", true]
  ];
  $("#quebras").innerHTML = quebras.map(([titulo, fn, ordemNatural], i) => {
    const cont = {};
    UNICOS.forEach((l) => { const k = fn(l) || "(vazio)"; cont[k] = (cont[k] || 0) + 1; });
    let itens = Object.entries(cont);
    itens.sort(ordemNatural ? (a, b) => a[0].localeCompare(b[0]) : (a, b) => b[1] - a[1]);
    const max = Math.max(1, ...itens.map((x) => x[1]));
    const lis = itens.map(([k, v], j) => `<li${j >= 8 && !ordemNatural ? ' data-extra hidden' : ""}><span class="nome" title="${esc(k)}">${esc(k)}</span><span class="num">${fmt(v)}</span><span class="pct">${pct(v, n)}</span><span class="trilho"><b style="width:${v / max * 100}%"></b></span></li>`).join("");
    const extra = !ordemNatural && itens.length > 8 ? `<button class="quebra-mais" data-q="${i}">Ver todos (${itens.length})</button>` : "";
    return `<div class="cartao"><div class="cartao__topo"><h2>${titulo}</h2></div><ul class="quebra">${lis || '<li class="vazio">Sem dados ainda</li>'}</ul>${extra}</div>`;
  }).join("");
  document.querySelectorAll(".quebra-mais").forEach((b) => b.addEventListener("click", () => {
    b.previousElementSibling.querySelectorAll("[data-extra]").forEach((li) => { li.hidden = false; });
    b.remove();
  }));
}

function opcoesGrafico({ stacked = false, legenda = false, max } = {}) {
  return {
    responsive: true, maintainAspectRatio: false, animation: { duration: 300 },
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: legenda, position: "top", align: "end", labels: { boxWidth: 10, boxHeight: 10, color: "#57534e", font: { family: "Montserrat", size: 11 } } },
      tooltip: {
        backgroundColor: "#0b0b0b", titleFont: { family: "Montserrat", weight: "700" }, bodyFont: { family: "Montserrat" }, padding: 10,
        callbacks: {
          label: (c) => ` ${c.dataset.label}: ${fmt(c.parsed.y)}`,
          footer: stacked ? (items) => "Total: " + fmt(items.reduce((s, i) => s + i.parsed.y, 0)) : undefined
        }
      }
    },
    scales: {
      x: { stacked, grid: { display: false }, ticks: { color: "#8a857f", font: { family: "Montserrat", size: 11 }, maxRotation: 0, autoSkip: true } },
      y: { stacked, beginAtZero: true, suggestedMax: max, grid: { color: "#f1ece6" }, border: { display: false }, ticks: { color: "#8a857f", font: { family: "Montserrat", size: 11 }, precision: 0, callback: (v) => fmt(v) } }
    }
  };
}

// ---------- Aba Leads ----------
const FILTROS = [
  ["tipo", "Tipo"], ["utm_campaign", "Campanha"], ["utm_source", "Fonte"], ["utm_medium", "Meio"],
  ["utm_content", "Conteúdo"], ["utm_term", "Termo"], ["perfil", "Perfil"], ["pais", "País"]
];
const POR_PAGINA = 100;
let pagina = 1;

function montarFiltros() {
  const wrap = $("#f-selects");
  const atuais = Object.fromEntries([...wrap.querySelectorAll("select")].map((s) => [s.dataset.campo, s.value]));
  wrap.innerHTML = FILTROS.map(([campo, nome]) => {
    const vals = [...new Set(LEADS.map((l) => l[campo] || ""))].sort((a, b) => a.localeCompare(b));
    const opts = vals.map((v) => `<option value="${esc(v)}">${esc(campo === "perfil" ? (PERFIS[v] || (v ? v : "(a definir)")) : (v || "(vazio)"))}</option>`).join("");
    return `<select data-campo="${campo}" aria-label="${nome}"><option value="__todos">${nome}: todos</option>${opts}</select>`;
  }).join("");
  wrap.querySelectorAll("select").forEach((s) => {
    if (atuais[s.dataset.campo] !== undefined && [...s.options].some((o) => o.value === atuais[s.dataset.campo])) s.value = atuais[s.dataset.campo];
    s.addEventListener("change", () => { pagina = 1; renderLeads(); });
  });
}

function filtrados() {
  const busca = $("#f-busca").value.trim().toLowerCase();
  const buscaNum = busca.replace(/\D/g, "");
  const de = $("#f-de").value, ate = $("#f-ate").value;
  const sel = [...document.querySelectorAll("#f-selects select")].filter((s) => s.value !== "__todos").map((s) => [s.dataset.campo, s.value]);
  return LEADS.filter((l) =>
    (!$("#f-unicos").checked || l.unico) &&
    (!de || l.dia >= de) && (!ate || l.dia <= ate) &&
    sel.every(([c, v]) => (l[c] || "") === v) &&
    (!busca || (l.nome || "").toLowerCase().includes(busca) || l.email.includes(busca) || (buscaNum.length >= 3 && (l.telefone || "").includes(buscaNum)))
  );
}

function renderLeads() {
  const lista = filtrados();
  const paginas = Math.max(1, Math.ceil(lista.length / POR_PAGINA));
  pagina = Math.min(pagina, paginas);
  const fatia = lista.slice((pagina - 1) * POR_PAGINA, pagina * POR_PAGINA);
  const unicosNaLista = lista.filter((l) => l.unico).length;
  $("#f-contagem").textContent = $("#f-unicos").checked
    ? `${fmt(lista.length)} lead${lista.length === 1 ? "" : "s"} único${lista.length === 1 ? "" : "s"}`
    : `${fmt(lista.length)} cadastro${lista.length === 1 ? "" : "s"} (${fmt(unicosNaLista)} únicos + ${fmt(lista.length - unicosNaLista)} repetidos)`;
  $("#t-leads tbody").innerHTML = fatia.map((l) => `<tr>
    <td>${horaSP.format(new Date(l.criado_em))}</td>
    <td title="${esc(l.nome)}">${esc(l.nome)}</td>
    <td title="${esc(l.email)}">${esc(l.email)}</td>
    <td><a href="https://wa.me/${esc((l.telefone || "").replace(/\D/g, ""))}" target="_blank" rel="noopener">${esc(l.telefone)}</a></td>
    <td>${esc(l.pais)}</td>
    <td><span class="tag tag--${TAG[l.tipo]}">${l.tipo}</span></td>
    <td>${esc(l.utm_campaign)}</td><td>${esc(l.utm_source)}</td><td>${esc(l.utm_medium)}</td><td>${esc(l.utm_content)}</td><td>${esc(l.utm_term)}</td>
    <td>${esc(l.perfil ? PERFIS[l.perfil] || l.perfil : "")}</td></tr>`).join("") || `<tr><td colspan="12" style="color:#8a857f">Nenhum lead com esses filtros.</td></tr>`;
  $("#p-info").textContent = lista.length
    ? `Mostrando ${fmt((pagina - 1) * POR_PAGINA + 1)}–${fmt(Math.min(pagina * POR_PAGINA, lista.length))} de ${fmt(lista.length)} · página ${pagina} de ${paginas}`
    : "";
  $("#p-ant").disabled = pagina <= 1;
  $("#p-prox").disabled = pagina >= paginas;
}

["#f-busca", "#f-de", "#f-ate", "#f-unicos"].forEach((s) => $(s).addEventListener("input", () => { pagina = 1; renderLeads(); }));
$("#p-ant").addEventListener("click", () => { pagina--; renderLeads(); });
$("#p-prox").addEventListener("click", () => { pagina++; renderLeads(); });
$("#f-limpar").addEventListener("click", () => {
  $("#f-busca").value = ""; $("#f-de").value = ""; $("#f-ate").value = ""; $("#f-unicos").checked = true;
  document.querySelectorAll("#f-selects select").forEach((s) => { s.value = "__todos"; });
  pagina = 1; renderLeads();
});
$("#f-csv").addEventListener("click", () => {
  const cab = ["data_hora", "nome", "email", "telefone", "pais", "tipo", "utm_campaign", "utm_source", "utm_medium", "utm_content", "utm_term", "perfil", "pagina_origem"];
  const cel = (v) => { const s = String(v ?? ""); return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
  const linhas = filtrados().map((l) => [horaSP.format(new Date(l.criado_em)), l.nome, l.email, l.telefone, l.pais, l.tipo, l.utm_campaign, l.utm_source, l.utm_medium, l.utm_content, l.utm_term, l.perfil ? PERFIS[l.perfil] || l.perfil : "", l.pagina_origem].map(cel).join(";"));
  const blob = new Blob(["﻿" + [cab.join(";"), ...linhas].join("\n")], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `leads-black2026-${diaSP.format(new Date())}.csv`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
});

// ---------- Dica de instalação no iPhone ----------
(function () {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const instalado = window.navigator.standalone === true || matchMedia("(display-mode: standalone)").matches;
  let dispensado = false;
  try { dispensado = localStorage.getItem("dash_instalar_ok") === "1"; } catch (e) {}
  if (ios && !instalado && !dispensado) $("#instalar").hidden = false;
  $("#instalar-fechar").addEventListener("click", () => {
    $("#instalar").hidden = true;
    try { localStorage.setItem("dash_instalar_ok", "1"); } catch (e) {}
  });
})();

// ---------- Início ----------
if (lerToken()) { mostrarApp(); carregar(); } else mostrarLogin();
document.addEventListener("visibilitychange", () => { if (!document.hidden && lerToken()) carregar(); });

// ---------- Aba Alunos: totais das bases e % que já se inscreveu ----------
async function carregarBases(token) {
  let d;
  try { d = await rpc("dash_alunos_black2026", { p_token: token }); } catch (e) { return; }
  if (!d) return;
  const pctN = (a, b) => (b ? (a / b * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%" : "—");
  const barra = (a, b) => `<div class="base__barra"><i style="width:${b ? Math.max(0.6, Math.min(100, a / b * 100)) : 0}%"></i></div>`;
  const card = (titulo, cor, icone, t, i, subs = [], nota = "") => `
    <article class="base" style="--cor:${cor}">
      <header class="base__topo"><span class="base__icone">${icone}</span><h3>${titulo}</h3></header>
      <p class="base__pct">${pctN(i, t)}<small>já se inscreveu</small></p>
      ${barra(i, t)}
      <p class="base__nums"><b>${fmt(i)}</b> de ${fmt(t)} alunos</p>
      ${subs.map(([n, si, st]) => `<p class="base__sub"><span>${n}</span><span><b>${fmt(si)}</b> de ${fmt(st)} · ${pctN(si, st)}</span></p>`).join("")}
      ${nota ? `<p class="t-nota base__nota">${nota}</p>` : ""}
    </article>`;
  const ci = '<img src="/black2026/img/cabeca-cilaine.webp" alt="">', fe = '<img src="/black2026/img/cabeca-felipe.webp" alt="">';
  const tot = d.docis.total + d.felipe.total - d.ambos.total, ins = d.docis.inscritos + d.felipe.inscritos - d.ambos.inscritos;
  $("#bases").innerHTML =
    card("Todas as bases", "#1a1a1a", ci + fe, tot, ins, [], "cada pessoa contada uma vez, mesmo estando nas duas listas")
    + card("Alunos Docis", "#eda100", ci, d.docis.total, d.docis.inscritos,
      [["Compraram a Black", d.docis.black_inscritos, d.docis.black], ["Low Ticket", d.docis.low_ticket_inscritos, d.docis.low_ticket]],
      `${fmt(d.docis.sem_telefone)} sem telefone na lista (só pelo e-mail)`)
    + card("Alunos Felipe Russo", "#4a3aa7", fe, d.felipe.total, d.felipe.inscritos, [], `${fmt(d.felipe.sem_telefone)} sem telefone na lista (só pelo e-mail)`)
    + card("Alunos dos dois", "#e87ba4", ci + fe, d.ambos.total, d.ambos.inscritos, [], "estão na lista da Docis e na do Felipe");
}
