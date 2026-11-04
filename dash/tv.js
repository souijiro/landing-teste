// Modo TV do dash (/dash/tv): reaproveita os cartões do próprio dash (mesmos números, carinhas e gráficos)
// em telas grandes que trocam sozinhas e pelas setas ◀ ▶ do controle. Feito para a TV do escritório
// (Samsung Frame, navegador Chromium 85): nada de recursos de CSS/JS mais novos que isso.
(function () {
  // ctx.roundRect só existe a partir do Chrome 99 (usado nos rótulos dos gráficos)
  if (window.CanvasRenderingContext2D && !CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function (x, y, w, h, r) {
      r = Math.min(typeof r === "number" ? r : 0, w / 2, h / 2);
      this.moveTo(x + r, y); this.arcTo(x + w, y, x + w, y + h, r); this.arcTo(x + w, y + h, x, y + h, r);
      this.arcTo(x, y + h, x, y, r); this.arcTo(x, y, x + w, y, r); this.closePath();
    };
  }
  if (!window.MODO_TV) return;
  // /dash/tv?so=vendas: só as telas de vendas (TV de casa)
  const SO_VENDAS = /[?&]so=vendas/.test(location.search);

  const ESCALA = 1.5;            // layout em 1280×720, ampliado para 1920×1080
  const TROCA = 30 * 1000;       // troca sozinha a cada 30 s…
  const PAUSA_MANUAL = 3 * 60 * 1000; // …e espera 3 min depois de usar as setas
  if (window.Chart) Chart.defaults.devicePixelRatio = ESCALA * (window.devicePixelRatio || 1);

  const css = document.createElement("style");
  css.textContent = `
    html.modo-tv { zoom: ${ESCALA}; overflow: hidden; }
    html.modo-tv body { overflow: hidden; background: #f4efe9; }
    html.modo-tv .topo, html.modo-tv main.aba-conteudo { display: none !important; }
    #tv { position: fixed; top: 0; left: 0; width: 1280px; height: 720px; }
    .tv-slide { position: absolute; top: 0; left: 0; right: 0; bottom: 0; padding: 18px 28px 46px; display: flex; flex-direction: column;
      opacity: 0; pointer-events: none; transition: opacity .6s; }
    .tv-slide.ativa { opacity: 1; }
    .tv-titulo { display: flex; align-items: center; margin: 0 0 12px; font: 800 26px Montserrat, sans-serif; color: #0b0b0b; }
    .tv-titulo img { height: 34px; margin-right: 12px; }
    .tv-titulo small { margin-left: 12px; font-size: 14px; font-weight: 600; color: #8a857f; }
    .tv-corpo { flex: 1; min-height: 0; }
    .tv-grade { display: flex; }
    .tv-grade > * { flex: 1; min-width: 0; margin: 0 !important; }
    .tv-grade > * + * { margin-left: 18px !important; }
    #tv-painel { display: flex; flex-direction: column; }
    #tv-painel .hero { display: grid; grid-template-columns: 330px 1fr; gap: 14px; flex: none; }
    #tv-painel .hero__principal { padding: 18px 20px; }
    #tv-painel .hero__numero { font-size: 4.4rem; }
    #tv-painel .kpis { grid-template-columns: repeat(5, 1fr); gap: 8px; }
    #tv-painel .kpi { padding: 9px 11px; }
    #tv-painel .kpi__num { font-size: 1.45rem; }
    #tv-painel .kpi__sub { font-size: .66rem; }
    #tv-vendas { display: flex; flex-direction: column; }
    #tv-vendas .v-hero { display: grid; grid-template-columns: 410px 1fr; gap: 14px; flex: 1; min-height: 0; }
    #tv-vendas .hero__principal { display: flex; flex-direction: column; padding: 22px 26px; }
    #tv-vendas .hero__numero { font-size: 6rem; }
    #tv-vendas .v-grandes { grid-template-columns: repeat(3, 1fr); grid-auto-rows: 1fr; gap: 10px; }
    #tv-vendas .kpi { display: flex; flex-direction: column; justify-content: center; padding: 12px 16px; }
    #tv-vendas .kpi__num { font-size: 2rem; }
    #tv-vendas .kpi__sub { font-size: .72rem; }
    #tv-vendas .kpi--gigante .kpi__num { font-size: 3.6rem; }
    #tv-vendas .v-menores { grid-template-columns: repeat(3, 1fr); margin-top: 12px; flex: none; }
    #tv-vendas .v-mini__num { font-size: 1.6rem; }
    #tv-venda { position: fixed; top: 0; left: 0; width: 1280px; height: 720px; display: flex; flex-direction: column; align-items: center; justify-content: center;
      background: rgba(11,11,11,.92); color: #fff; font-family: Montserrat, sans-serif; text-align: center; opacity: 0; pointer-events: none; transition: opacity .5s; }
    #tv-venda.on { opacity: 1; }
    #tv-venda .r { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; color: #ffd60a; }
    #tv-venda .v { margin: 6px 0 0; font-size: 150px; font-weight: 800; line-height: 1; }
    #tv-venda .s { margin: 18px 0 0; font-size: 30px; font-weight: 600; color: #d6d3d1; }
    #tv-quem { height: 100%; }
    #tv-quem > * { display: flex; flex-direction: column; overflow: hidden; }
    #tv #tv-quem .alunos { margin-top: 0; flex: 1.35; }
    #tv #tv-quem .alunos__lista li { padding: 6px 10px; }
    #tv #tv-quem .alunos__corpo { grid-template-columns: 230px 1fr; gap: 16px; align-items: center; }
    #tv #tv-quem .alunos__pizza { width: 230px; height: 230px; }
    #tv #tv-quem .alunos__lista { grid-template-columns: 1fr; }
    #tv #tv-quem .grafico { flex: 1; height: auto !important; min-height: 0; }
    #tv #tv-quem .tabela-wrap { display: none; }
    #tv .alunos { flex: 1; min-height: 0; margin-top: 14px; padding: 12px 18px; overflow: hidden; }
    #tv .alunos .cartao__topo { margin-bottom: 4px; }
    #tv .alunos__corpo { grid-template-columns: 250px 1fr; gap: 22px; }
    #tv .alunos__pizza { width: 250px; height: 250px; max-width: none; }
    #tv .alunos__lista { grid-template-columns: 1fr 1fr; gap: 8px; }
    #tv .alunos__lista li { padding: 7px 10px; }
    #tv .funil-cartao { height: 100%; }
    #tv .tv-cpm { height: 100%; display: flex; flex-direction: column; }
    #tv .tv-cpm .grafico { flex: 1; height: auto !important; min-height: 0; }
    .tv-custos { display: flex; flex-wrap: wrap; height: 100%; margin: -9px; }
    .tv-custo { width: calc(50% - 18px); height: calc(50% - 18px); margin: 9px; background: #fff; border-radius: 18px; padding: 28px 34px;
      display: flex; flex-direction: column; justify-content: center; box-shadow: 0 1px 0 rgba(0,0,0,.05); }
    .tv-custo p { margin: 0; }
    .tv-custo .r { font: 700 18px Montserrat, sans-serif; text-transform: uppercase; letter-spacing: .08em; color: #8a857f; }
    .tv-custo .v { font: 800 76px Montserrat, sans-serif; color: #0b0b0b; line-height: 1.1; margin-top: 6px; }
    .tv-custo .s { font: 600 17px Montserrat, sans-serif; color: #8a857f; margin-top: 6px; }
    .tv-custo.escuro { background: #0b0b0b; } .tv-custo.escuro .v { color: #ffd60a; }
    #tv-rodape { position: fixed; left: 28px; right: 28px; bottom: 12px; display: flex; align-items: center; justify-content: space-between;
      font: 600 13px Montserrat, sans-serif; color: #8a857f; }
    #tv-pontos span { display: inline-block; width: 11px; height: 11px; border-radius: 50%; background: #d8d1c8; margin-left: 9px; }
    #tv-pontos span.on { background: #0b0b0b; }
    #tv-aviso { position: fixed; left: 50%; top: 42%; width: 420px; margin-left: -210px; padding: 18px 0; border-radius: 16px; text-align: center;
      background: rgba(11,11,11,.88); color: #ffd60a; font: 800 28px Montserrat, sans-serif; pointer-events: none; transition: opacity .4s; }
  `;
  document.head.appendChild(css);

  const $ = (s) => document.querySelector(s);
  const LOGO = "/black2026/img/logo.webp";
  const raiz = document.createElement("div");
  raiz.id = "tv";
  raiz.innerHTML = SO_VENDAS ? `
    <section class="tv-slide" data-nome="vendas">
      <h1 class="tv-titulo">Vendas da Black Vitalícia<small>compras aprovadas na Hotmart</small></h1>
      <div class="tv-corpo" id="tv-vendas"></div>
    </section>
    <section class="tv-slide" data-nome="quem">
      <h1 class="tv-titulo">Quem está comprando<small>compras aprovadas · por perfil e por dia</small></h1>
      <div class="tv-corpo tv-grade" id="tv-quem"></div>
    </section>
    <div id="tv-rodape"><span id="tv-info">Carregando…</span><span><span id="tv-dica"></span><span id="tv-pontos"></span></span></div>
    <div id="tv-aviso"></div>
    <div id="tv-venda"><p class="r"></p><p class="v"></p><p class="s"></p></div>` : `
    <section class="tv-slide" data-nome="painel">
      <h1 class="tv-titulo">Leads da Black Vitalícia<small>meta 10.000 até 5/11</small></h1>
      <div class="tv-corpo" id="tv-painel"></div>
    </section>
    <section class="tv-slide" data-nome="funil">
      <h1 class="tv-titulo">Funil do tráfego · hoje<small id="tv-funil-dia"></small></h1>
      <div class="tv-corpo" id="tv-funil"></div>
    </section>
    <section class="tv-slide" data-nome="custos">
      <h1 class="tv-titulo">Investimento e custo por lead<small>Meta · Docis + Felipe Russo</small></h1>
      <div class="tv-corpo tv-custos">
        <div class="tv-custo"><p class="r">Investimento total</p><p class="v" id="tv-inv">—</p><p class="s">desde 16/10</p></div>
        <div class="tv-custo escuro"><p class="r">CPL total</p><p class="v" id="tv-cpl">—</p><p class="s" id="tv-cpl-sub"></p></div>
        <div class="tv-custo"><p class="r">Investimento hoje</p><p class="v" id="tv-inv-hoje">—</p><p class="s">até agora</p></div>
        <div class="tv-custo escuro"><p class="r">CPL hoje</p><p class="v" id="tv-cpl-hoje">—</p><p class="s" id="tv-cpl-hoje-sub"></p></div>
      </div>
    </section>
    <section class="tv-slide" data-nome="cpm">
      <h1 class="tv-titulo">CPM hora a hora · hoje<small>custo por mil impressões · só horas fechadas</small></h1>
      <div class="tv-corpo"><div class="cartao tv-cpm" id="tv-cpm"><p class="t-nota taxas-legenda"><img src="/black2026/img/cabeca-cilaine.webp" alt=""> Docis &nbsp; <img src="/black2026/img/cabeca-felipe.webp" alt=""> Felipe Russo</p></div></div>
    </section>
    <div id="tv-rodape"><span id="tv-info">Carregando…</span><span><span id="tv-dica"></span><span id="tv-pontos"></span></span></div>
    <div id="tv-aviso"></div>`;
  document.body.appendChild(raiz);

  // move os cartões do dash para as telas (os scripts do dash continuam atualizando os mesmos elementos)
  if (SO_VENDAS) {
    $("#tv-vendas").appendChild($("#aba-vendas .v-hero"));
    $("#tv-vendas").appendChild($("#vend-kpis-2"));
    $("#tv-quem").appendChild($("#aba-vendas .alunos"));
    $("#tv-quem").appendChild($("#g-vend-dia").closest(".cartao"));
  } else {
    $("#tv-painel").appendChild($("#aba-painel .hero"));
    $("#tv-painel").appendChild($("#aba-painel .alunos"));
    $("#tv-funil").appendChild($(".funil-cartao"));
  }

  // funil e taxas só de hoje
  function filtrarHoje() {
    const h = typeof hojeSP === "function" ? hojeSP() : new Date().toISOString().slice(0, 10);
    if ($("#t-de").value === h && $("#t-ate").value === h) return;
    $("#t-de").value = h; $("#t-ate").value = h;
    $("#tv-funil-dia").textContent = h.slice(8, 10) + "/" + h.slice(5, 7);
    try { if (typeof TRAF !== "undefined" && TRAF && TRAF.ads && TRAF.ads.length) renderTrafego(); } catch (e) {}
  }
  if (!SO_VENDAS) filtrarHoje();

  // o gráfico de CPM hora a hora só nasce quando os dados do tráfego chegam
  const esperaCpm = SO_VENDAS ? null : setInterval(() => {
    const c = $("#g-tx-cpm-hora");
    if (!c) return;
    clearInterval(esperaCpm);
    $("#tv-cpm").appendChild(c.parentElement);
  }, 1000);

  function copiarCustos() {
    const t = (id) => ($(id) ? $(id).textContent : "—");
    $("#tv-inv").textContent = t("#k-inv");
    $("#tv-inv-hoje").textContent = t("#k-inv-sub").replace(/^hoje:\s*/, "");
    $("#tv-cpl").textContent = t("#k-cpl");
    $("#tv-cpl-sub").textContent = t("#k-cpl-sub");
    $("#tv-cpl-hoje").textContent = t("#k-cpl-hoje");
    $("#tv-cpl-hoje-sub").textContent = t("#k-cpl-hoje-sub");
    $("#tv-info").textContent = "Black Vitalícia 2026 · atualizado às " +
      new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
  }
  // venda nova: tela de comemoração + som (o app da TV toca o som; no navegador toca aqui mesmo)
  let vistas = null, vendaTimer = null;
  // um som por venda, cada um num player próprio: vendas juntas tocam encavaladas (com um pequeno intervalo)
  function tocarVendas(n) {
    for (let i = 0; i < Math.min(n, 20); i++) setTimeout(() => { try { new Audio("/dash/venda.mp3").play().catch(() => {}); } catch (e) {} }, i * 700);
  }
  function comemorar(novas) {
    const ultima = novas[novas.length - 1];
    $("#tv-venda .r").textContent = novas.length > 1 ? novas.length + " vendas novas!" : "Venda nova!";
    $("#tv-venda .v").textContent = typeof valorCheio === "function" ? brlV(novas.reduce((s, v) => s + valorCheio(v), 0)) : "";
    $("#tv-venda .s").textContent = [((ultima.nome || "").split(" ")[0]), typeof condicao === "function" ? (CONDICOES.find((k) => k.id === condicao(ultima)) || {}).nome : ""].filter(Boolean).join(" · ");
    $("#tv-venda").classList.add("on");
    clearTimeout(vendaTimer); vendaTimer = setTimeout(() => $("#tv-venda").classList.remove("on"), 10000);
    if (window.parent !== window) parent.postMessage({ tvVenda: novas.length }, "*");
    else tocarVendas(novas.length);
  }
  function olharVendas() {
    if (typeof VENDAS === "undefined" || !VENDAS || typeof grupoStatus !== "function") return;
    const comTeste = $("#vend-testes") && $("#vend-testes").checked; // mesmas compras que o quadro conta
    const aprov = (VENDAS.vendas || []).filter((v) => grupoStatus(v.status) === "aprovada" && ehCompra(v) && (comTeste || !v.teste));
    const chave = (v) => v.id || v.transacao || (v.em + "|" + v.email);
    if (vistas === null) { vistas = new Set(aprov.map(chave)); return; } // primeira carga: só guarda
    const novas = aprov.filter((v) => !vistas.has(chave(v)));
    novas.forEach((v) => vistas.add(chave(v)));
    if (novas.length) comemorar(novas);
  }
  window.tvTesteVenda = () => comemorar([{ nome: "Teste", cupom: "" }]);

  function copiarConversao() {
    olharVendas();
    $("#tv-info").textContent = "Vendas · Black Vitalícia 2026 · atualizado às " +
      new Date().toLocaleTimeString("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" });
  }
  setInterval(() => { if (SO_VENDAS) return copiarConversao(); filtrarHoje(); copiarCustos(); }, 5000);

  // troca de telas
  const telas = [].slice.call(raiz.querySelectorAll(".tv-slide"));
  $("#tv-pontos").innerHTML = telas.map(() => "<span></span>").join("");
  let atual = 0, ultimaManual = 0;
  function mostrar(i) {
    atual = (i + telas.length) % telas.length;
    telas.forEach((t, k) => t.classList.toggle("ativa", k === atual));
    [].forEach.call($("#tv-pontos").children, (s, k) => { s.className = k === atual ? "on" : ""; });
    // gráficos que nasceram escondidos se ajustam ao tamanho da tela
    if (window.Chart && Chart.instances) Object.values(Chart.instances).forEach((g) => { try { g.resize(); } catch (e) {} });
  }
  const fixa = location.search.match(/[?&]tela=(\d)/);
  mostrar(fixa ? +fixa[1] : 0);
  // OK do controle pausa na tela atual (fica parado até apertar OK de novo; vale mesmo depois de recarregar)
  let pausado = false;
  try { pausado = localStorage.getItem("tv_pausado") === "1"; } catch (e) {}
  let avisoTimer = null;
  function pausar(sim) {
    pausado = sim;
    try { localStorage.setItem("tv_pausado", sim ? "1" : "0"); } catch (e) {}
    $("#tv-dica").innerHTML = sim ? "<b style='color:#0b0b0b'>⏸ Pausado</b> · OK continua · ◀ ▶ troca de tela" : "OK pausa · ◀ ▶ troca de tela";
    const av = $("#tv-aviso");
    av.textContent = sim ? "⏸ Pausado nesta tela" : "▶ Girando as telas";
    av.style.opacity = 1; clearTimeout(avisoTimer); avisoTimer = setTimeout(() => { av.style.opacity = 0; }, 2000);
  }
  pausar(pausado); $("#tv-aviso").style.opacity = 0;
  if (!fixa) setInterval(() => { if (!pausado && Date.now() - ultimaManual > PAUSA_MANUAL) mostrar(atual + 1); }, TROCA);
  function tecla(cod) {
    if (cod === 39) { ultimaManual = Date.now(); mostrar(atual + 1); return true; }       // ▶
    if (cod === 37) { ultimaManual = Date.now(); mostrar(atual - 1); return true; }       // ◀
    if (cod === 13) { pausar(!pausado); return true; }                                   // OK
    if (SO_VENDAS && (cod === 10252 || cod === 415)) { window.tvTesteVenda(); return true; } // ▶❚❚ / ▶ = teste do aviso de venda
    return false;
  }
  document.addEventListener("keydown", (e) => { if (tecla(e.keyCode)) e.preventDefault(); });
  // no app da TV o dash roda dentro de um iframe: o app repassa as teclas do controle por postMessage
  addEventListener("message", (e) => { if (e.data && typeof e.data.tvTecla === "number") tecla(e.data.tvTecla); });

  // recarrega de madrugada para pegar versões novas do dash
  setInterval(() => { const d = new Date(); if (d.getHours() === 4 && d.getMinutes() < 1) location.reload(); }, 50 * 1000);
})();
