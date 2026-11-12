/* Pontuação do quiz — roda só no navegador, nada vai para o banco. */
(function (root) {
  function calcular(respostas, cfg) {
    var total = 0;
    var areas = {};
    cfg.AREAS.forEach(function (a) { areas[a.id] = { pontos: 0, max: 0 }; });

    cfg.PERGUNTAS.forEach(function (p, i) {
      if (!p.pontos || !p.area) return;
      var r = respostas[i];
      var pts = typeof r === "number" ? p.pontos[r] || 0 : 0;
      total += pts;
      areas[p.area].pontos += pts;
      areas[p.area].max += Math.max.apply(null, p.pontos);
    });

    var perfil = cfg.PERFIS.filter(function (f) { return total >= f.min && total <= f.max; })[0] ||
      cfg.PERFIS[cfg.PERFIS.length - 1];

    // menor percentual; empate segue a ordem de cfg.AREAS (técnica, vendas, gestão)
    var pior = null, piorPct = Infinity;
    cfg.AREAS.forEach(function (a) {
      var x = areas[a.id];
      var pct = x.max ? x.pontos / x.max : 1;
      if (pct < piorPct - 1e-9) { piorPct = pct; pior = a; }
    });

    return {
      total: total,
      perfil: perfil,
      dificuldade: pior,
      areas: areas,
      estagio: typeof respostas[0] === "number" ? respostas[0] : null,
    };
  }
  root.QuizScore = { calcular: calcular };
  if (typeof module !== "undefined") module.exports = root.QuizScore;
})(typeof window !== "undefined" ? window : globalThis);
