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
    #tv .hero { display: grid; grid-template-columns: 330px 1fr; gap: 14px; flex: none; }
    #tv .hero__principal { padding: 18px 20px; }
    #tv .hero__numero { font-size: 4.4rem; }
    #tv .kpis { grid-template-columns: repeat(5, 1fr); gap: 8px; }
    #tv .kpi { padding: 9px 11px; }
    #tv .kpi__num { font-size: 1.45rem; }
    #tv .kpi__sub { font-size: .66rem; }
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
  `;
  document.head.appendChild(css);

  const $ = (s) => document.querySelector(s);
  const LOGO = "/black2026/img/logo.webp";
  const raiz = document.createElement("div");
  raiz.id = "tv";
  raiz.innerHTML = `
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
    <div id="tv-rodape"><span id="tv-info">Carregando…</span><span>◀ ▶ troca de tela<span id="tv-pontos"></span></span></div>`;
  document.body.appendChild(raiz);

  // move os cartões do dash para as telas (os scripts do dash continuam atualizando os mesmos elementos)
  $("#tv-painel").appendChild($("#aba-painel .hero"));
  $("#tv-painel").appendChild($("#aba-painel .alunos"));
  $("#tv-funil").appendChild($(".funil-cartao"));

  // funil e taxas só de hoje
  function filtrarHoje() {
    const h = typeof hojeSP === "function" ? hojeSP() : new Date().toISOString().slice(0, 10);
    if ($("#t-de").value === h && $("#t-ate").value === h) return;
    $("#t-de").value = h; $("#t-ate").value = h;
    $("#tv-funil-dia").textContent = h.slice(8, 10) + "/" + h.slice(5, 7);
    try { if (typeof TRAF !== "undefined" && TRAF && TRAF.ads && TRAF.ads.length) renderTrafego(); } catch (e) {}
  }
  filtrarHoje();

  // o gráfico de CPM hora a hora só nasce quando os dados do tráfego chegam
  const esperaCpm = setInterval(() => {
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
  setInterval(() => { filtrarHoje(); copiarCustos(); }, 5000);

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
  if (!fixa) setInterval(() => { if (Date.now() - ultimaManual > PAUSA_MANUAL) mostrar(atual + 1); }, TROCA);
  function tecla(cod) {
    if (cod === 39) { ultimaManual = Date.now(); mostrar(atual + 1); return true; }       // ▶
    if (cod === 37) { ultimaManual = Date.now(); mostrar(atual - 1); return true; }       // ◀
    return false;
  }
  document.addEventListener("keydown", (e) => { if (tecla(e.keyCode)) e.preventDefault(); });
  // no app da TV o dash roda dentro de um iframe: o app repassa as teclas do controle por postMessage
  addEventListener("message", (e) => { if (e.data && typeof e.data.tvTecla === "number") tecla(e.data.tvTecla); });

  // recarrega de madrugada para pegar versões novas do dash
  setInterval(() => { const d = new Date(); if (d.getHours() === 4 && d.getMinutes() < 1) location.reload(); }, 50 * 1000);
})();
