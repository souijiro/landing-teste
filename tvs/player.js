// Player das TVs das unidades (app "TV Docis" na Samsung). O app carrega este arquivo de c.docis.com.br/tvs/player.js
// — mudou aqui, as TVs pegam sozinhas (recarregam às 4h ou ao reabrir o app); o app tem uma cópia para quando estiver sem internet.
// A TV gera o próprio código, aparece em c.docis.com.br/tvs para ser cadastrada e recebe a lista do que passar (RPC tv_playlist).
// Vídeos: baixados uma vez para dentro da TV e tocados pelo AVPlay da Samsung (o <video> do navegador não gira; o AVPlay gira).
// Fotos e mensagens: HTML, girado por CSS conforme a posição da TV (rotacao 0/90/180/270, escolhida na página).
(function () {
  "use strict";
  if (window.TV_PLAYER) return; // a cópia local e a do site chegaram as duas
  window.TV_PLAYER = { carregando: true };
  var SUPA = "https://eoqyoeohbcpdjxghfwua.supabase.co";
  var CHAVE = "sb_publishable_cv-1jB60ZGb1hJHYQi0qPA_LwF9DS98";
  var VERSAO = "1.1.0";
  var BUSCA_MS = 15000;
  var LOG = window.TV_LOG || (location.search.match(/[?&]log=([^&]+)/) || [])[1]; // endereço que recebe eventos para depurar
  var temTizen = typeof tizen !== "undefined";
  var temAvplay = typeof webapis !== "undefined" && webapis.avplay;

  function log(m) { if (LOG) try { new Image().src = decodeURIComponent(LOG) + "/l?m=" + encodeURIComponent(m); } catch (e) {} }
  window.onerror = function (m, u, l) { log("ERR " + m + " @" + l); };

  function ler(k, padrao) { try { var v = localStorage.getItem(k); return v === null ? padrao : JSON.parse(v); } catch (e) { return padrao; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }

  // ---------- tela ----------
  var css = document.createElement("style");
  css.textContent =
    "html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000;font-family:Montserrat,Arial,sans-serif}" +
    "body.tocando-video{background:transparent}" +
    "#av{position:absolute;left:0;top:0;width:100%;height:100%}" +
    "#tela{position:absolute;left:0;top:0;width:100%;height:100%}" +
    "html.rot-180 #tela{transform:rotate(180deg)}" +
    "html.rot-90 #tela,html.rot-270 #tela{width:100vh;height:100vw;left:50%;top:50%;margin-left:-50vh;margin-top:-50vw}" +
    "html.rot-90 #tela{transform:rotate(90deg)}html.rot-270 #tela{transform:rotate(270deg)}" +
    "#seta{position:absolute;left:0;top:0;width:100%;height:100%;display:none;flex-direction:column;align-items:center;justify-content:center;background:rgba(176,58,98,.92);color:#fff;z-index:5}" +
    "#seta.on{display:flex}#seta .f{font-size:30vmin;line-height:1;font-weight:800}#seta .p{font-size:9vmin;font-weight:800;letter-spacing:.1em}" +
    "#seta .d{font-size:3.6vmin;margin-top:2vmin;max-width:80%;text-align:center}" +
    ".cena{position:absolute;left:0;top:0;width:100%;height:100%;display:none;box-sizing:border-box}" +
    ".cena.on{display:flex}" +
    "#c-foto{background:#000;align-items:center;justify-content:center}" +
    "#c-foto img{max-width:100%;max-height:100%;object-fit:contain}" +
    "#c-msg{flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6vh 8vw}" +
    "#c-msg .t{font-size:9vh;font-weight:800;line-height:1.12;white-space:pre-line}" +
    "#c-msg .s{font-size:4.6vh;font-weight:600;margin-top:4vh;opacity:.85;white-space:pre-line}" +
    "#c-info{background:#F4EFE9;color:#3B1E2B;flex-direction:column;align-items:center;justify-content:center;text-align:center}" +
    "#c-info .marca{font-size:7vh;font-weight:800;letter-spacing:.02em}" +
    "#c-info .linha{font-size:3.4vh;margin-top:2.2vh;color:#7a6470}" +
    "#c-info .cod{font-size:13vh;font-weight:800;letter-spacing:.12em;margin:3vh 0 1vh;color:#B03A62}" +
    "#aviso{position:absolute;right:2.5vw;bottom:3vh;background:rgba(0,0,0,.72);color:#fff;font-size:2.6vh;padding:1.2vh 2vw;border-radius:1vh;display:none}";
  document.head.appendChild(css);

  if (!document.getElementById("av")) {
    var ob = document.createElement("object");
    ob.id = "av"; ob.setAttribute("type", "application/avplayer");
    document.body.appendChild(ob);
  }
  var tela = document.createElement("div");
  tela.id = "tela";
  tela.innerHTML =
    '<div class="cena" id="c-foto"><img alt=""></div>' +
    '<div class="cena" id="c-msg"><div class="t"></div><div class="s"></div></div>' +
    '<div class="cena on" id="c-info"><div class="marca">Docis</div><div class="linha">Carregando…</div></div>' +
    '<div id="seta"><div class="f">↑</div><div class="p">CIMA</div><div class="d">Se a seta aponta pra cima, a posição está certa</div></div>' +
    '<div id="aviso"></div>';
  document.body.appendChild(tela);
  var $ = function (s) { return document.querySelector(s); };

  function cena(id) {
    var cs = document.querySelectorAll(".cena");
    for (var i = 0; i < cs.length; i++) cs[i].classList.toggle("on", cs[i].id === id);
    document.body.classList.toggle("tocando-video", id === null);
  }
  var tAviso;
  function aviso(txt, ms) { var a = $("#aviso"); a.textContent = txt; a.style.display = "block"; clearTimeout(tAviso); tAviso = setTimeout(function () { a.style.display = "none"; }, ms || 4000); }

  function telaInfo(linhas, codigo) {
    var c = $("#c-info");
    c.innerHTML = '<div class="marca">Docis</div>' + (codigo ? '<div class="cod">' + codigo.slice(0, 4) + "-" + codigo.slice(4) + "</div>" : "") +
      linhas.map(function (l) { return '<div class="linha"></div>'; }).join("");
    var ls = c.querySelectorAll(".linha");
    for (var i = 0; i < linhas.length; i++) ls[i].textContent = linhas[i];
    cena("c-info");
  }

  // ---------- código desta TV ----------
  var codigo = ler("tv_codigo", null);
  if (!codigo || !/^[A-Z0-9]{8}$/.test(codigo)) {
    var letras = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", c = "";
    for (var i = 0; i < 8; i++) c += letras[Math.floor(Math.random() * letras.length)];
    codigo = c; gravar("tv_codigo", codigo);
  }

  function infoAparelho() {
    var i = { versao_player: VERSAO, tela: screen.width + "x" + screen.height };
    try { i.modelo = webapis.productinfo.getRealModel(); } catch (e) {}
    try { i.firmware = webapis.productinfo.getFirmware(); } catch (e) {}
    try { i.app = tizen.application.getCurrentApplication().appInfo.version; } catch (e) {}
    try { i.ip = webapis.network.getIp(); } catch (e) {}
    return i;
  }

  // ---------- lista ----------
  var estado = ler("tv_estado", null); // última resposta (para funcionar sem internet)
  var primeira = true;
  function buscar() {
    var x = new XMLHttpRequest();
    x.open("POST", SUPA + "/rest/v1/rpc/tv_playlist");
    x.setRequestHeader("apikey", CHAVE);
    x.setRequestHeader("Content-Type", "application/json");
    x.timeout = 20000;
    x.onload = function () {
      if (x.status !== 200) { log("busca " + x.status + " " + x.responseText.slice(0, 200)); return; }
      try { aplicar(JSON.parse(x.responseText)); } catch (e) { log("busca parse " + e); }
    };
    x.onerror = x.ontimeout = function () { log("busca sem rede"); if (primeira && estado) aplicar(estado); };
    x.send(JSON.stringify({ p_codigo: codigo, p_info: primeira ? infoAparelho() : null }));
  }

  function aplicar(e) {
    var mudouGiro = !estado || estado.rotacao !== e.rotacao;
    estado = e; gravar("tv_estado", e);
    posicao();
    if (mudouGiro && video.tocando) video.girar();
    $("#seta").classList.toggle("on", !!e.seta);
    sincronizarCache();
    if (!e.cadastrada) { pararTudo(); telaInfo(["Código desta TV", "Cadastre em c.docis.com.br/tvs"], codigo); }
    else if (!itensValidos().length) { pararTudo(); telaInfo([e.nome + (e.unidade ? " · " + e.unidade : ""), "Nada marcado para passar nesta TV ainda"]); }
    else if (parado || primeira) proximo();
    primeira = false;
  }

  function itensValidos() {
    if (!estado || !estado.itens) return [];
    return estado.itens.filter(function (it) { return it.tipo !== "video" || cache[it.drive_id] || podeStream(); });
  }
  // sem nenhum vídeo baixado ainda, toca direto do Drive enquanto baixa
  function podeStream() { return !estado.itens.some(function (it) { return it.tipo === "video" && cache[it.drive_id]; }) || !temTizen; }

  // ---------- cache de vídeos (arquivos dentro do app) ----------
  var cache = ler("tv_cache", {}); // drive_id -> caminho
  var baixando = null;
  function urlDrive(id) { return "https://drive.usercontent.google.com/download?id=" + id + "&export=download&confirm=t"; }
  function extensao(mime) { return /quicktime/.test(mime || "") ? ".mov" : /webm/.test(mime || "") ? ".webm" : ".mp4"; }

  function sincronizarCache() {
    if (!temTizen || !estado) return;
    var queridos = {};
    (estado.itens || []).forEach(function (it) { if (it.tipo === "video" && it.drive_id) queridos[it.drive_id] = it; });
    Object.keys(cache).forEach(function (id) {
      if (queridos[id] || id === tocandoId) return;
      apagarArquivo(cache[id]); delete cache[id]; gravar("tv_cache", cache); log("cache apagou " + id);
    });
    if (baixando) return;
    var falta = Object.keys(queridos).filter(function (id) { return !cache[id] && !(falhas[id] > 3); })[0];
    if (!falta) return;
    baixando = falta;
    var nome = "v_" + falta.replace(/[^A-Za-z0-9_-]/g, "") + extensao(queridos[falta].mime);
    log("baixando " + falta);
    try {
      tizen.download.start(new tizen.DownloadRequest(urlDrive(falta), "wgt-private", nome, null, {}), {
        oncompleted: function (id, caminho) { cache[falta] = caminho; gravar("tv_cache", cache); baixando = null; log("baixou " + caminho); sincronizarCache(); },
        onfailed: function (id, err) { falhas[falta] = (falhas[falta] || 0) + 1; baixando = null; log("download falhou " + falta + " " + (err && err.message)); setTimeout(sincronizarCache, 30000); },
        oncanceled: function () { baixando = null; }
      });
    } catch (e) { baixando = null; log("download exc " + e); }
  }
  var falhas = {};
  function apagarArquivo(caminho) {
    try { tizen.filesystem.deleteFile(caminho, null, function (e) { log("apagar " + e.message); }); return; } catch (e) {}
    try {
      var dir = caminho.replace(/\/[^\/]+$/, ""), nome = caminho.replace(/^.*\//, "");
      tizen.filesystem.resolve(dir, function (d) { d.deleteFile(dir + "/" + nome); }, null, "rw");
    } catch (e) { log("apagar exc " + e); }
  }

  // ---------- vídeo (AVPlay) ----------
  var tocandoId = null, geracao = 0; // geracao: cada vídeo novo (ou parada) invalida os avisos do anterior
  var video = {
    tocando: false,
    // área do vídeo: a TV em pé (Frame com o app marcado como "all" no config.xml) entrega a tela como 1080x1920
    area: function () {
      var empe = screen.height > screen.width;
      try { webapis.avplay.setDisplayRect(0, 0, empe ? 1080 : 1920, empe ? 1920 : 1080); } catch (e) { log("area " + e.message); }
    },
    girar: function () {
      var r = (estado && estado.rotacao) || 0;
      try { webapis.avplay.setDisplayRotation(r ? "PLAYER_DISPLAY_ROTATION_" + r : "PLAYER_DISPLAY_ROTATION_NONE"); } catch (e) { log("girar " + e.message); }
    },
    tocar: function (it, fim) {
      var p = webapis.avplay, local = cache[it.drive_id];
      var fonte = local ? (local.indexOf("file://") === 0 ? local : "file://" + local) : urlDrive(it.drive_id);
      var g = ++geracao, guarda;
      function terminar(motivo) {
        clearTimeout(guarda);
        if (g !== geracao) return;
        log("video fim " + motivo);
        video.parar(); fim();
      }
      try {
        p.close();
      } catch (e) {}
      try {
        p.open(fonte);
        video.area();
        try { p.setDisplayMethod("PLAYER_DISPLAY_MODE_LETTER_BOX"); } catch (e) {}
        video.girar();
        p.setListener({
          onstreamcompleted: function () { terminar("fim"); },
          onerror: function (t) { if (local) { delete cache[it.drive_id]; gravar("tv_cache", cache); } terminar("erro " + t); }
        });
        tocandoId = it.drive_id;
        video.tocando = true;
        cena(null);
        p.prepareAsync(function () {
          try { p.play(); } catch (e) { terminar("play " + e.message); return; }
          var dur = 0; try { dur = p.getDuration(); } catch (e) {}
          guarda = setTimeout(function () { terminar("guarda"); }, (dur > 0 ? dur + 15000 : 30 * 60000));
          log("video tocando " + it.drive_id + (local ? " local" : " stream") + " " + dur);
        }, function (e) { terminar("prepare " + e); });
      } catch (e) { terminar("open " + (e.message || e)); }
    },
    parar: function () {
      geracao++;
      video.tocando = false; tocandoId = null;
      try { webapis.avplay.stop(); } catch (e) {}
      try { webapis.avplay.close(); } catch (e) {}
    }
  };

  // ---------- sequência ----------
  var idx = -1, timer = null, parado = true;
  function pararTudo() { clearTimeout(timer); if (video.tocando) video.parar(); parado = true; }

  function proximo() {
    clearTimeout(timer);
    var lista = itensValidos();
    if (!lista.length) { parado = true; return; }
    parado = false;
    var atualId = idx >= 0 && estado.itens[idx] ? estado.itens[idx].id : null;
    // anda pela lista completa (que pode ter mudado) a partir do item atual
    var pos = -1;
    for (var i = 0; i < lista.length; i++) if (lista[i].id === atualId) pos = i;
    var it = lista[(pos + 1) % lista.length];
    idx = estado.itens.indexOf(it);
    mostrar(it, lista.length);
  }

  function anterior() {
    var lista = itensValidos();
    if (!lista.length) return;
    var pos = lista.indexOf(estado.itens[idx]);
    idx = estado.itens.indexOf(lista[(pos - 2 + 2 * lista.length) % lista.length]); // proximo() anda um para frente
    proximo();
  }

  function mostrar(it, total) {
    log("mostrar " + it.tipo + " " + it.id);
    if (it.tipo === "video") {
      if (!temAvplay) { timer = setTimeout(proximo, 1000); return; }
      video.tocar(it, function () { timer = setTimeout(proximo, total === 1 ? 300 : 50); });
      return;
    }
    if (video.tocando) video.parar();
    var dur = Math.max(3, it.duracao_s || 10) * 1000;
    if (it.tipo === "foto") {
      var img = $("#c-foto img"), feito = false;
      img.onload = function () { if (feito) return; feito = true; cena("c-foto"); timer = setTimeout(proximo, dur); preCarregar(); };
      img.onerror = function () { if (feito) return; feito = true; log("foto erro " + it.drive_id); timer = setTimeout(proximo, 500); };
      img.src = urlFoto(it.drive_id);
      return;
    }
    var m = $("#c-msg");
    m.style.background = it.cor_fundo || "#F6D7E1";
    m.style.color = it.cor_texto || "#3B1E2B";
    m.querySelector(".t").textContent = it.texto || "";
    m.querySelector(".s").textContent = it.subtexto || "";
    cena("c-msg");
    timer = setTimeout(proximo, dur);
    preCarregar();
  }
  function urlFoto(id) { return "https://drive.google.com/thumbnail?id=" + id + "&sz=w1920"; }
  function preCarregar() {
    var lista = itensValidos(), atual = estado.itens[idx];
    var pos = lista.indexOf(atual), prox = lista[(pos + 1) % lista.length];
    if (prox && prox.tipo === "foto") new Image().src = urlFoto(prox.drive_id);
  }

  // ---------- controle remoto ----------
  try { tizen.tvinputdevice.registerKeyBatch(["MediaPlayPause", "Info"]); } catch (e) {}
  document.addEventListener("keydown", function (e) {
    log("tecla " + e.keyCode);
    if (e.keyCode === 10009) { pararTudo(); try { tizen.application.getCurrentApplication().exit(); } catch (x) {} return; }
    if (e.keyCode === 39) { proximo(); return; }
    if (e.keyCode === 37) { anterior(); return; }
    if (e.keyCode === 13 || e.keyCode === 457) {
      aviso("Código " + codigo.slice(0, 4) + "-" + codigo.slice(4) + (estado && estado.nome ? " · " + estado.nome : "") +
        (estado && estado.unidade ? " · " + estado.unidade : "") + " · " + Object.keys(cache).length + " vídeo(s) na TV · v" + VERSAO, 8000);
    }
  });

  // não deixa a TV apagar / entrar no descanso de tela
  function semDescanso() {
    try { webapis.appcommon.setScreenSaver(webapis.appcommon.AppCommonScreenSaverState.SCREEN_SAVER_OFF); } catch (e) {}
    try { tizen.power.request("SCREEN", "SCREEN_NORMAL"); } catch (e) {}
  }
  semDescanso();
  setInterval(semDescanso, 5 * 60000);

  // recarrega de madrugada para pegar versão nova do player
  setInterval(function () {
    var h = new Date().getHours(), m = new Date().getMinutes();
    if (h === 4 && m < 2 && Date.now() - inicio > 3 * 3600000) location.reload();
  }, 60000);
  var inicio = Date.now();

  // TV que gira (Frame em pé): a tela muda de 1920x1080 para 1080x1920; o vídeo que está tocando acompanha
  function mudouTela() { log("tela " + screen.width + "x" + screen.height); if (video.tocando) video.area(); }
  try { screen.orientation.addEventListener("change", mudouTela); } catch (e) {}
  window.addEventListener("resize", mudouTela);

  telaInfo(["Carregando…"]);
  function posicao() {
    var h = document.documentElement, r = (estado && estado.rotacao) || 0;
    ["rot-90", "rot-180", "rot-270"].forEach(function (c) { h.classList.toggle(c, c === "rot-" + r); });
  }
  posicao();
  buscar();
  setInterval(buscar, BUSCA_MS);
  window.TV_PLAYER = { versao: VERSAO, codigo: codigo };
})();
