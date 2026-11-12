/* Quiz Diagnóstico da Confeiteira — telas, navegação, lead e agenda. */
(function () {
  "use strict";
  var C = window.QUIZ_CONFIG;
  var N = C.PERGUNTAS.length;
  var LETRAS = ["A", "B", "C", "D"];
  var CHAVE = "quiz_docis_v1"; // progresso (só respostas, sem dados pessoais)
  var $ = function (id) { return document.getElementById(id); };

  var params = new URLSearchParams(location.search);
  var captacao = (params.get("captacao") || "").toLowerCase() === "sim";

  // ---------- estado ----------
  var estado = { passo: -1, respostas: [] }; // passo -1 = abertura, N = resultado
  try {
    var salvo = JSON.parse(localStorage.getItem(CHAVE) || "null");
    if (salvo && Array.isArray(salvo.respostas)) estado = salvo;
  } catch (e) {}
  function guardar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {} }

  // ---------- telas ----------
  function mostrar(id) {
    ["t-inicio", "t-pergunta", "t-carregando", "t-resultado"].forEach(function (t) {
      $(t).classList.toggle("ativa", t === id);
    });
    window.scrollTo(0, 0);
  }

  function preCarregar(src) { var i = new Image(); i.decoding = "async"; i.src = src; }
  function imgPergunta(i) { return "img/question-" + String(i + 1).padStart(2, "0") + ".webp"; }

  var travado = false;
  function renderPergunta() {
    var i = estado.passo, p = C.PERGUNTAS[i];
    $("p-num").textContent = "Pergunta " + (i + 1) + " de " + N;
    var pct = Math.round((i / N) * 100);
    $("p-pct").textContent = pct + "%";
    $("p-barra").style.width = pct + "%";
    $("b-voltar").disabled = false;
    var img = $("q-img");
    img.src = imgPergunta(i);
    img.alt = "Confeiteira ilustrada — momento " + (i + 1);
    $("q-txt").textContent = p.texto;

    var box = $("q-opcoes");
    box.innerHTML = "";
    p.opcoes.forEach(function (txt, k) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "opcao" + (estado.respostas[i] === k ? " sel" : "");
      b.setAttribute("role", "radio");
      b.setAttribute("aria-checked", estado.respostas[i] === k ? "true" : "false");
      b.innerHTML = '<span class="letra">' + LETRAS[k] + "</span><span></span>";
      b.lastChild.textContent = txt;
      b.addEventListener("click", function () { escolher(k, b); });
      box.appendChild(b);
    });
    // reinicia a animação de entrada a cada pergunta
    var t = $("t-pergunta"); t.style.animation = "none"; void t.offsetWidth; t.style.animation = "";
    if (i + 1 < N) preCarregar(imgPergunta(i + 1));
    else C.PERFIS.forEach(function (f) { preCarregar(f.imagem); });
    travado = false;
  }

  function escolher(k, el) {
    if (travado) return;
    travado = true;
    estado.respostas[estado.passo] = k;
    Array.prototype.forEach.call($("q-opcoes").children, function (b) {
      b.classList.remove("sel"); b.setAttribute("aria-checked", "false");
    });
    el.classList.add("sel"); el.setAttribute("aria-checked", "true");
    guardar();
    setTimeout(avancar, 300);
  }

  function avancar() {
    if (estado.passo < N - 1) { estado.passo++; guardar(); renderPergunta(); }
    else finalizar();
  }

  function voltar() {
    if (estado.passo > 0) { estado.passo--; guardar(); renderPergunta(); }
    else { estado.passo = -1; guardar(); mostrar("t-inicio"); }
  }

  function comecar() {
    estado = { passo: 0, respostas: [] };
    guardar(); renderPergunta(); mostrar("t-pergunta");
  }

  // ---------- final ----------
  function finalizar() {
    estado.passo = N; guardar();
    mostrar("t-carregando");
    salvarLead();
    setTimeout(function () { renderResultado(); mostrar("t-resultado"); }, 1300);
  }

  // Grava só e-mail e telefone (recebidos na URL). Falha em silêncio.
  function salvarLead() {
    var id;
    try { id = JSON.parse(sessionStorage.getItem("quiz_docis_id") || "null"); } catch (e) {}
    if (!id || (!id.email && !id.telefone)) return;
    var email = String(id.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email) || email.length > 254) email = null;
    var tel = String(id.telefone || "").replace(/\D/g, "");
    if (tel.length < 10 || tel.length > 15) tel = null;
    if (!email && !tel) { try { sessionStorage.removeItem("quiz_docis_id"); } catch (e) {} return; }
    var ctrl = window.AbortController ? new AbortController() : null;
    if (ctrl) setTimeout(function () { ctrl.abort(); }, 8000);
    fetch(C.SUPABASE_URL + "/rest/v1/rpc/" + C.SUPABASE_RPC, {
      method: "POST",
      keepalive: true,
      referrerPolicy: "no-referrer",
      signal: ctrl ? ctrl.signal : undefined,
      headers: { apikey: C.SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ p_email: email, p_telefone: tel }),
    }).then(function (r) {
      // gravou: apaga os dados pessoais também do navegador
      if (r.ok) { try { sessionStorage.removeItem("quiz_docis_id"); } catch (e) {} }
    }).catch(function () {});
  }

  function renderResultado() {
    var r = window.QuizScore.calcular(estado.respostas, C);
    var f = r.perfil;
    $("r-img").src = f.imagem;
    $("r-img").alt = "Ilustração: " + f.nome;
    $("r-titulo").textContent = f.titulo;
    $("r-desc").textContent = f.descricao;
    $("r-msg").textContent = f.mensagem;
    $("r-desafio").textContent = r.dificuldade.desafio;
    $("r-recomendacao").textContent = "💡 " + r.dificuldade.recomendacao;

    var areas = $("r-areas"); areas.innerHTML = "";
    C.AREAS.forEach(function (a) {
      var x = r.areas[a.id], pct = x.max ? Math.round((x.pontos / x.max) * 100) : 0;
      var d = document.createElement("div");
      d.className = "area-linha" + (a.id === r.dificuldade.id ? " foco" : "");
      d.innerHTML = '<span></span><div class="barra"><i></i></div><span></span>';
      d.children[0].textContent = a.nome;
      d.children[2].textContent = pct + "%";
      areas.appendChild(d);
      requestAnimationFrame(function () { setTimeout(function () { d.querySelector("i").style.width = pct + "%"; }, 80); });
    });

    var msg = C.COMPARTILHAR.replace("{perfil}", f.nome).replace("{url}", C.QUIZ_URL);
    $("b-compartilhar").href = "https://wa.me/?text=" + encodeURIComponent(msg);

    montarChamada();
  }

  // ---------- captação (?captacao=sim) ou lembrete na agenda ----------
  function montarChamada() {
    var aula = $("b-aula"), ag = $("b-agenda"), alt = $("b-agenda-alt");
    if (captacao && C.AULA_URL) {
      // mantém UTMs e outros parâmetros (nunca e-mail/telefone, já removidos)
      var u = new URL(C.AULA_URL, location.href);
      params.forEach(function (v, k) { if (k !== "captacao" && !u.searchParams.has(k)) u.searchParams.set(k, v); });
      aula.href = u.toString();
      aula.classList.remove("oculto");
      return;
    }
    var ini = proximaAula(Date.now());
    var apple = ehApple();
    var ics = "/api/quiz-agenda?t=" + ini;
    var google = linkGoogle(ini);
    ag.href = apple ? ics : google;
    if (!apple) ag.target = "_blank";
    $("b-agenda-txt").textContent = apple ? "ADICIONAR À AGENDA DO " + (apple === "ios" ? "IPHONE" : "MAC") : "ADICIONAR À AGENDA DO GOOGLE";
    ag.classList.remove("oculto");

    var q = $("agenda-quando");
    q.textContent = "📅 " + quando(ini) + " (horário de Brasília)";
    q.style.display = "block";

    alt.textContent = apple ? "Usa o Google Agenda? Toque aqui" : "Usa iPhone ou Outlook? Baixar o arquivo da agenda";
    alt.href = apple ? google : ics;
    if (apple) alt.target = "_blank";
    alt.classList.remove("oculto");

    // navegador interno do Instagram/Facebook às vezes não abre a agenda
    if (/Instagram|FBAN|FBAV|Line\//i.test(navigator.userAgent)) $("aviso-app").style.display = "block";
  }

  function ehApple() {
    var ua = navigator.userAgent || "";
    if (/iPhone|iPad|iPod/i.test(ua)) return "ios";
    if (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1) return "ios"; // iPadOS
    if (/Macintosh|Mac OS X/i.test(ua)) return "mac";
    return null;
  }

  // Próxima aula: dia/hora de Brasília (UTC-3, sem horário de verão)
  function proximaAula(agora) {
    var A = C.AGENDA, br = new Date(agora - 3 * 3600e3);
    for (var k = 0; k <= 7; k++) {
      var t = Date.UTC(br.getUTCFullYear(), br.getUTCMonth(), br.getUTCDate() + k, A.hora + 3, A.minuto);
      if (new Date(t - 3 * 3600e3).getUTCDay() === A.diaSemana && t + A.toleranciaMin * 60000 > agora) return t;
    }
    return agora;
  }

  function fmtUTC(t) { return new Date(t).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, ""); }

  function linkGoogle(ini) {
    var A = C.AGENDA, fim = ini + A.duracaoMin * 60000;
    return "https://calendar.google.com/calendar/render?action=TEMPLATE" +
      "&text=" + encodeURIComponent(A.titulo) +
      "&dates=" + fmtUTC(ini) + "/" + fmtUTC(fim) +
      "&details=" + encodeURIComponent(A.descricao) +
      "&ctz=America/Sao_Paulo";
  }

  function quando(t) {
    var d = new Date(t - 3 * 3600e3);
    var dias = ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"];
    var hoje = new Date(Date.now() - 3 * 3600e3);
    var mesmoDia = d.toISOString().slice(0, 10) === hoje.toISOString().slice(0, 10);
    var hh = String(d.getUTCHours()).padStart(2, "0") + "h" + (d.getUTCMinutes() ? String(d.getUTCMinutes()).padStart(2, "0") : "");
    return (mesmoDia ? "Hoje" : dias[d.getUTCDay()].replace(/^./, function (c) { return c.toUpperCase(); }) +
      ", " + String(d.getUTCDate()).padStart(2, "0") + "/" + String(d.getUTCMonth() + 1).padStart(2, "0")) + " às " + hh;
  }

  // ---------- eventos ----------
  $("b-comecar").addEventListener("click", comecar);
  $("b-voltar").addEventListener("click", voltar);
  $("b-refazer").addEventListener("click", function () {
    try { localStorage.removeItem(CHAVE); } catch (e) {}
    estado = { passo: -1, respostas: [] };
    mostrar("t-inicio");
  });

  if (C.PRIVACIDADE_URL) {
    var a = document.createElement("a");
    a.href = C.PRIVACIDADE_URL; a.target = "_blank"; a.rel = "noopener noreferrer";
    a.textContent = "Política de Privacidade";
    $("privacidade").append(" · ", a);
  }

  // ---------- retomada ----------
  if (estado.passo >= 0 && estado.passo < N) { renderPergunta(); mostrar("t-pergunta"); }
  else if (estado.passo === N && estado.respostas.length === N) { renderResultado(); mostrar("t-resultado"); }
  else preCarregar(imgPergunta(0));
})();
