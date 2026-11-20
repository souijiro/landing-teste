// Aba Custos: tráfego (Meta, por conta) e API oficial do WhatsApp (por número) levantados automaticamente,
// mais custos lançados à mão (Ligue Lead, passagens, gestor de tráfego, comissão comercial e outros).
// Cada linha tem um "valor confirmado": quando preenchido, ele substitui o levantado em todas as contas do dash (ROI, CAC).
// Salva em custos_black2026 via dash_custos_black2026_salvar. Usa rpc, lerToken, fmt, esc, horaSP, $ (dash.js), brlV, VENDAS (vendas.js).
let CUSTOS = null; // linhas salvas no banco
const GRUPOS_CUSTO = [
  { id: "trafego", nome: "Tráfego pago", sub: "levantado da Meta (gasto das campanhas, por conta)" },
  { id: "api", nome: "API oficial do WhatsApp", sub: "levantado dos disparos: mensagens cobradas × preço da categoria × dólar do dia" },
  { id: "outros", nome: "Outros custos", sub: "lançados à mão" }
];

async function carregarCustos(token) {
  try { CUSTOS = await rpc("dash_custos_black2026", { p_token: token }); } catch (e) { CUSTOS = null; }
  renderCustos();
  if (typeof VENDAS !== "undefined" && VENDAS) renderVendas(); // investimento total da aba Vendas usa estes valores
}

// gasto da Meta por conta, sem o filtro global de conta
function trafegoPorConta() {
  const ins = typeof BASE !== "undefined" && BASE.insights ? BASE.insights : (typeof TRAF !== "undefined" ? TRAF.insights : []);
  const out = { "Docis": 0, "Felipe Russo": 0 };
  for (const i of ins || []) {
    const c = (typeof ADS !== "undefined" && ADS.get(i.ad_id)?.conta) || "Docis";
    out[c] = (out[c] || 0) + (+i.investimento || 0);
  }
  return out;
}
// custo da API oficial por número (mesma conta da aba Disparos)
function apiPorConta() {
  const out = { "Docis": 0, "Felipe Russo": 0 };
  if (typeof DISP === "undefined" || !DISP) return out;
  const P = DISP.ptax || [];
  const ptaxDe = (d) => { let v = P.length ? +P[0][1] : 5.4; for (const [dia, p] of P) if (dia <= d) v = +p; return v; };
  const preco = (cat) => +(DISP.precos?.[cat] || 0);
  for (const [dia, , conta, cat, tipo, vol] of DISP.volume_hora || []) {
    if (/^FREE/.test(tipo) || !(preco(cat) > 0)) continue;
    out[conta] = (out[conta] || 0) + vol * preco(cat) * ptaxDe(dia);
  }
  return out;
}
function levantadoDe(chave) {
  if (chave === "meta_docis") return trafegoPorConta()["Docis"];
  if (chave === "meta_felipe") return trafegoPorConta()["Felipe Russo"];
  if (chave === "api_docis") return apiPorConta()["Docis"];
  if (chave === "api_felipe") return apiPorConta()["Felipe Russo"];
  return null; // lançado à mão
}
const SOCIOS = [
  { id: "docis", nome: "Docis", img: "/black2026/img/cabeca-ci-flutuante.webp" },
  { id: "felipe", nome: "Felipe Russo", img: "/black2026/img/cabeca-felipe-flutuante.webp" }
];
const cabeca = (id, cls = "") => { const s = SOCIOS.find((x) => x.id === id); return s ? `<img src="${s.img}" alt="" class="custo-cabeca ${cls}">` : ""; };
const confirmado = (l) => l.valor != null && l.valor !== "";
const efetivo = (l) => (confirmado(l) ? +l.valor : +(levantadoDe(l.chave) || 0));

// totais usados também na aba Vendas (ROAS, ROI, CAC)
function custosEfetivos() {
  if (!CUSTOS) return null;
  const t = { trafego: 0, api: 0, outros: 0 };
  CUSTOS.filter((l) => l.grupo !== "config").forEach((l) => { t[l.grupo] = (t[l.grupo] || 0) + efetivo(l); });
  t.total = t.trafego + t.api + t.outros;
  return t;
}

const numBR = (v) => (v == null || v === "" ? "" : (+v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
const lerNum = (s) => {
  const t = String(s || "").replace(/[^\d,.-]/g, "").trim();
  if (!t) return null;
  const n = Number(t.includes(",") ? t.replace(/\./g, "").replace(",", ".") : t);
  return isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
};

function renderCustos() {
  const alvo = $("#custo-kpis");
  if (!alvo) return;
  if (!CUSTOS) { alvo.innerHTML = '<p class="t-nota">Não consegui carregar os custos.</p>'; return; }
  const t = custosEfetivos();
  const ap = (typeof VENDAS !== "undefined" && VENDAS?.vendas) ? VENDAS.vendas.filter((v) => !v.teste && ST_APROVADA.includes(v.status) && ehCompra(v)) : [];
  const fat = ap.reduce((s, v) => s + valorCheio(v), 0);
  const pend = CUSTOS.filter((l) => l.grupo !== "config" && !confirmado(l)).length;
  alvo.innerHTML = [
    ["kpi--gigante kpi--destaque", "Custo total", brlV(t.total), pend ? `${fmt(pend)} ${pend > 1 ? "itens ainda sem" : "item ainda sem"} valor confirmado` : "todos os valores confirmados"],
    ["", "Tráfego pago", brlV(t.trafego), fat ? `${pct(t.trafego, fat)} do valor das vendas` : ""],
    ["", "API oficial", brlV(t.api), fat ? `${pct(t.api, fat)} do valor das vendas` : ""],
    ["", "Outros custos", brlV(t.outros), fat ? `${pct(t.outros, fat)} do valor das vendas` : ""],
    [fat && fat < t.total ? "kpi--vermelho-num" : "kpi--verde", "Resultado", brlV(fat - t.total), `valor cheio das vendas (${brlV(fat)}) − custo total`],
    ["", "CAC", ap.length ? brlV(t.total / ap.length) : "—", `custo total ÷ ${fmt(ap.length)} compras aprovadas`]
  ].map(([c, r, n, s]) => `<div class="kpi ${c}"><p class="rotulo">${r}</p><p class="kpi__num">${n}</p><p class="kpi__sub">${esc(s)}</p></div>`).join("");

  renderAcerto();
  $("#custo-grupos").innerHTML = GRUPOS_CUSTO.map((g) => {
    const linhas = CUSTOS.filter((l) => l.grupo === g.id);
    const tot = linhas.reduce((s, l) => s + efetivo(l), 0);
    return `<section class="cartao custo-grupo">
      <div class="cartao__topo"><h2>${g.nome}</h2><span class="t-nota">${g.sub}</span></div>
      <div class="custo-lista">${linhas.map(linhaCusto).join("")}</div>
      ${g.id === "outros" ? `<button type="button" class="custo-add" id="custo-add">+ Adicionar outro custo</button>` : ""}
      <div class="custo-total"><span>Total ${g.nome.toLowerCase()}</span><b>${brlV(tot)}</b></div>
    </section>`;
  }).join("");
  ligarCustos();
}

function linhaCusto(l) {
  const lev = levantadoDe(l.chave), extra = l.chave.startsWith("extra_");
  const st = confirmado(l) ? `<span class="custo-st custo-st--ok">✓ confirmado</span>` : lev != null ? `<span class="custo-st">usando o levantado</span>` : `<span class="custo-st custo-st--falta">a preencher</span>`;
  const quando = confirmado(l) && l.em ? ` · ${horaSP.format(new Date(l.em))}` : "";
  return `<div class="custo-item" data-chave="${esc(l.chave)}">
    <div class="custo-item__nome">${l.pago_por ? `<span class="custo-dono">${cabeca(l.pago_por)}</span>` : ""}<span class="custo-item__txt">${extra ? `<input class="custo-rotulo" type="text" maxlength="120" value="${esc(l.rotulo)}" aria-label="Nome do custo">` : `<b>${esc(l.rotulo)}</b>`}
      <span class="t-nota">${st}${quando}</span></span></div>
    ${lev != null ? `<div class="custo-item__lev"><span class="t-nota">Levantado</span><b>${brlV(lev)}</b></div>` : ""}
    <label class="custo-item__val"><span class="t-nota">Valor confirmado</span>
      <span class="custo-campo"><span aria-hidden="true">R$</span><input type="text" inputmode="decimal" placeholder="${lev != null ? numBR(lev) : "0,00"}" value="${numBR(l.valor)}" aria-label="Valor confirmado de ${esc(l.rotulo)}"></span></label>
    <div class="custo-item__acoes">
      ${lev != null ? `<button type="button" class="custo-btn" data-acao="usar">Confirmar levantado</button>` : ""}
      ${extra ? `<button type="button" class="custo-btn custo-btn--sair" data-acao="remover" aria-label="Remover ${esc(l.rotulo)}">Remover</button>` : ""}
    </div>
    <div class="custo-quem" role="group" aria-label="Quem pagou ${esc(l.rotulo)}"><span class="t-nota">Quem pagou</span>
      ${SOCIOS.map((s) => `<button type="button" class="custo-quem__btn" data-quem="${s.id}" aria-pressed="${l.pago_por === s.id}">${cabeca(s.id)}${s.nome}</button>`).join("")}
      ${l.pago_por ? "" : `<span class="custo-st custo-st--falta">a definir</span>`}</div>
    <input class="custo-obs" type="text" maxlength="300" placeholder="Observação (opcional)" value="${esc(l.obs || "")}" aria-label="Observação de ${esc(l.rotulo)}">
  </div>`;
}

async function salvarCusto(el, extra = {}) {
  const chave = el.dataset.chave, l = CUSTOS.find((x) => x.chave === chave);
  const valor = "valor" in extra ? extra.valor : lerNum(el.querySelector(".custo-campo input").value);
  if (Number.isNaN(valor)) { el.querySelector(".custo-campo input").setAttribute("aria-invalid", "true"); return; }
  const rotulo = el.querySelector(".custo-rotulo")?.value ?? l.rotulo;
  const obs = el.querySelector(".custo-obs").value.trim() || null;
  const quem = "quem" in extra ? extra.quem : (l.pago_por || null);
  if (!extra.remover && valor === (confirmado(l) ? +l.valor : null) && rotulo === l.rotulo && obs === (l.obs || null) && quem === (l.pago_por || null)) return; // nada mudou
  el.classList.add("salvando");
  try {
    await rpc("dash_custos_black2026_salvar", { p_token: lerToken(), p_chave: chave, p_rotulo: rotulo, p_valor: valor, p_obs: obs, p_remover: !!extra.remover, p_pago_por: quem });
    await carregarCustos(lerToken());
  } catch (e) {
    el.classList.remove("salvando");
    alert(e.code === "28000" ? "Sua sessão do dash expirou. Entre de novo." : "Não consegui salvar. Tente de novo.");
  }
}

function ligarCustos() {
  document.querySelectorAll(".custo-item").forEach((el) => {
    el.querySelectorAll(".custo-campo input, .custo-obs, .custo-rotulo").forEach((i) => {
      i.addEventListener("change", () => salvarCusto(el));
      i.addEventListener("keydown", (e) => { if (e.key === "Enter") i.blur(); });
    });
    el.querySelectorAll(".custo-quem__btn").forEach((b) => b.addEventListener("click", () => {
      const l = CUSTOS.find((x) => x.chave === el.dataset.chave);
      salvarCusto(el, { quem: l.pago_por === b.dataset.quem ? null : b.dataset.quem });
    }));
    el.querySelector('[data-acao="usar"]')?.addEventListener("click", () => salvarCusto(el, { valor: Math.round(levantadoDe(el.dataset.chave) * 100) / 100 }));
    el.querySelector('[data-acao="remover"]')?.addEventListener("click", () => { if (confirm("Remover este custo?")) salvarCusto(el, { remover: true }); });
  });
  $("#custo-add")?.addEventListener("click", async (e) => {
    e.target.disabled = true;
    try { await rpc("dash_custos_black2026_salvar", { p_token: lerToken(), p_chave: null, p_rotulo: "Outro custo", p_valor: null, p_obs: null, p_remover: false, p_pago_por: null }); await carregarCustos(lerToken()); }
    catch (err) { e.target.disabled = false; alert("Não consegui adicionar. Tente de novo."); }
    document.querySelector('.custo-item[data-chave^="extra_"]:last-of-type .custo-rotulo')?.select();
  });
}

// ---- acerto entre os sócios: cada um paga a sua parte dos custos (divisão em custos_black2026.divisao_docis) ----
function renderAcerto() {
  const alvo = $("#custo-acerto");
  if (!alvo) return;
  const cfg = CUSTOS.find((l) => l.chave === "divisao_docis");
  const pctDocis = cfg && cfg.valor != null ? +cfg.valor : 50;
  const itens = CUSTOS.filter((l) => l.grupo !== "config");
  const pago = { docis: 0, felipe: 0 }, lista = { docis: [], felipe: [] };
  const semDono = itens.filter((l) => !l.pago_por && efetivo(l) > 0);
  itens.forEach((l) => { if (l.pago_por && efetivo(l) > 0) { pago[l.pago_por] += efetivo(l); lista[l.pago_por].push(l); } });
  const total = pago.docis + pago.felipe;
  const parte = { docis: total * pctDocis / 100, felipe: total * (100 - pctDocis) / 100 };
  const saldo = pago.docis - parte.docis; // > 0: Felipe deve à Docis
  const de = saldo > 0 ? "felipe" : "docis", para = saldo > 0 ? "docis" : "felipe", valor = Math.abs(saldo);
  const nome = (id) => SOCIOS.find((s) => s.id === id).nome;
  const coluna = (id) => `<div class="acerto-socio">
      <div class="acerto-socio__topo">${cabeca(id, "custo-cabeca--g")}<div><p class="rotulo">${nome(id)} pagou</p><p class="acerto-socio__num">${brlV(pago[id])}</p></div></div>
      <ul class="acerto-lista">${lista[id].length ? lista[id].map((l) => `<li><span>${esc(l.rotulo)}${confirmado(l) ? "" : ' <span class="t-nota">(levantado)</span>'}</span><b>${brlV(efetivo(l))}</b></li>`).join("") : '<li class="t-nota">Nenhum custo marcado ainda.</li>'}</ul>
      <p class="acerto-parte">Parte de ${nome(id)} (${fmt(id === "docis" ? pctDocis : 100 - pctDocis)}%): <b>${brlV(parte[id])}</b></p>
    </div>`;
  alvo.innerHTML = `<div class="cartao__topo"><h2>Acerto entre Docis e Felipe</h2>
      <label class="t-nota acerto-div">Custos da Docis <span class="custo-campo custo-campo--p"><input type="text" inputmode="decimal" id="acerto-pct" value="${numBR(pctDocis).replace(",00", "")}" aria-label="Porcentagem dos custos que cabe à Docis"><span aria-hidden="true">%</span></span> · Felipe ${fmt(100 - pctDocis)}%</label></div>
    <div class="acerto-grade">${coluna("docis")}${coluna("felipe")}</div>
    <div class="acerto-total"><span>Custo total com dono definido</span><b>${brlV(total)}</b></div>
    <div class="acerto-resultado ${valor < 0.01 ? "acerto-resultado--ok" : ""}">
      ${valor < 0.01 ? `<p><b>Tudo certo:</b> cada um já pagou a sua parte.</p>`
        : `<div class="acerto-seta">${cabeca(de, "custo-cabeca--g")}<span class="acerto-seta__linha" aria-hidden="true">→ ${brlV(valor)} →</span>${cabeca(para, "custo-cabeca--g")}</div>
           <p><b>${nome(de)}</b> manda <b>${brlV(valor)}</b> para <b>${nome(para)}</b></p>`}
    </div>
    ${semDono.length ? `<p class="acerto-aviso">⚠ ${fmt(semDono.length)} ${semDono.length > 1 ? "custos sem" : "custo sem"} “quem pagou” ficaram fora do acerto: ${semDono.map((l) => esc(l.rotulo) + " (" + brlV(efetivo(l)) + ")").join(", ")}.</p>` : ""}
    <p class="t-nota">Usa o valor confirmado de cada custo (ou o levantado, quando ainda não foi confirmado).</p>`;
  $("#acerto-pct").addEventListener("change", async (e) => {
    const v = lerNum(e.target.value);
    if (Number.isNaN(v) || v == null || v > 100) { e.target.setAttribute("aria-invalid", "true"); return; }
    try { await rpc("dash_custos_black2026_salvar", { p_token: lerToken(), p_chave: "divisao_docis", p_rotulo: null, p_valor: v, p_obs: null, p_remover: false, p_pago_por: null }); await carregarCustos(lerToken()); }
    catch (err) { alert("Não consegui salvar a divisão. Tente de novo."); }
  });
  $("#acerto-pct").addEventListener("keydown", (e) => { if (e.key === "Enter") e.target.blur(); });
}
