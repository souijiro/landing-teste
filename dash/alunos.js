// Pizza "Alunos entre os leads" com as cabecinhas dentro das fatias. Usa UNICOS, fmt, pct, $ de dash.js.
const CABECA_CI = Object.assign(new Image(), { src: "/black2026/img/cabeca-cilaine.webp" });
const CABECA_FELIPE = Object.assign(new Image(), { src: "/black2026/img/cabeca-felipe.webp" });
[CABECA_CI, CABECA_FELIPE].forEach((img) => img.addEventListener("load", () => { if (gAlunos) gAlunos.draw(); }));

const GRUPOS_ALUNO = [
  { chave: "docis", nome: "Alunos Docis", cor: "#eda100", perfis: ["aluno_docis", "aluno_docis_black"], black: "aluno_docis_black", icone: "ci" },
  { chave: "felipe", nome: "Alunos Felipe Russo", cor: "#4a3aa7", perfis: ["aluno_felipe", "aluno_felipe_black"], black: "aluno_felipe_black", icone: "felipe" },
  { chave: "ambos", nome: "Alunos dos dois", cor: "#e87ba4", perfis: ["aluno_ambos"], icone: "ambos" },
  { chave: "nenhum", nome: "Não alunos", cor: "#c9c4bd", perfis: ["nao_aluno", null, undefined, ""], icone: "nenhum" }
];
let gAlunos = null;

function grupoDoPerfil(p) { return GRUPOS_ALUNO.find((g) => g.perfis.includes(p)) || GRUPOS_ALUNO[3]; }

// desenha um ícone (cabeça(s) ou círculo cortado) centrado em (x, y) com altura h
function desenharIcone(ctx, tipo, x, y, h) {
  const cabeca = (img, cx) => {
    if (!img.complete || !img.naturalWidth) return;
    const w = h * img.naturalWidth / img.naturalHeight;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = 4;
    ctx.drawImage(img, cx - w / 2, y - h / 2, w, h); ctx.restore();
  };
  if (tipo === "ci") cabeca(CABECA_CI, x);
  else if (tipo === "felipe") cabeca(CABECA_FELIPE, x);
  else if (tipo === "ambos") { const d = h * 0.32; cabeca(CABECA_CI, x - d); cabeca(CABECA_FELIPE, x + d); }
  else {
    const r = h * 0.42;
    ctx.save(); ctx.strokeStyle = "#e5484d"; ctx.lineWidth = Math.max(3, h * 0.11); ctx.fillStyle = "rgba(255,255,255,.85)";
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x - r * 0.7, y + r * 0.7); ctx.lineTo(x + r * 0.7, y - r * 0.7); ctx.stroke();
    ctx.restore();
  }
}

const pluginCabecas = {
  id: "cabecas",
  afterDatasetsDraw(chart) {
    const ctx = chart.ctx, meta = chart.getDatasetMeta(0), total = chart.data.datasets[0].data.reduce((s, v) => s + v, 0);
    meta.data.forEach((arc, i) => {
      const v = chart.data.datasets[0].data[i];
      if (!v || v / total < 0.04) return; // fatia pequena demais para caber o ícone
      const p = arc.getProps(["x", "y", "startAngle", "endAngle", "innerRadius", "outerRadius"], true);
      const meio = (p.startAngle + p.endAngle) / 2;
      const raio = (p.innerRadius + p.outerRadius) / 2;
      const espessura = p.outerRadius - p.innerRadius;
      const arco = (p.endAngle - p.startAngle) * raio;
      const h = Math.max(18, Math.min(espessura * 0.78, arco * 0.62, 64));
      desenharIcone(ctx, GRUPOS_ALUNO[i].icone, p.x + Math.cos(meio) * raio, p.y + Math.sin(meio) * raio, GRUPOS_ALUNO[i].icone === "ambos" ? h * 0.85 : h);
    });
    // total no meio
    const p0 = meta.data[0]?.getProps(["x", "y"], true);
    if (p0) {
      ctx.save(); ctx.textAlign = "center"; ctx.fillStyle = "#1a1a1a";
      ctx.font = "800 26px Montserrat, sans-serif"; ctx.fillText(fmt(total), p0.x, p0.y + 4);
      ctx.font = "600 11px Montserrat, sans-serif"; ctx.fillStyle = "#8a857f"; ctx.fillText("leads únicos", p0.x, p0.y + 22);
      ctx.restore();
    }
  }
};

function renderAlunos() {
  const cont = Object.fromEntries(GRUPOS_ALUNO.map((g) => [g.chave, 0]));
  const black = { docis: 0, felipe: 0 };
  UNICOS.forEach((l) => {
    const g = grupoDoPerfil(l.perfil);
    cont[g.chave]++;
    if (g.black && l.perfil === g.black) black[g.chave]++;
  });
  const total = UNICOS.length;
  const alunos = cont.docis + cont.felipe + cont.ambos;
  const dados = GRUPOS_ALUNO.map((g) => cont[g.chave]);

  if (gAlunos) { gAlunos.data.datasets[0].data = dados; gAlunos.update(); }
  else {
    gAlunos = new Chart($("#g-alunos"), {
      type: "doughnut",
      data: { labels: GRUPOS_ALUNO.map((g) => g.nome), datasets: [{ data: dados, backgroundColor: GRUPOS_ALUNO.map((g) => g.cor), borderColor: "#fff", borderWidth: 2, hoverOffset: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: true, cutout: "38%", animation: { duration: 300 },
        plugins: {
          legend: { display: false },
          tooltip: { backgroundColor: "#0b0b0b", bodyFont: { family: "Montserrat" }, callbacks: { label: (c) => ` ${c.label}: ${fmt(c.parsed)} (${pct(c.parsed, total)})` } }
        }
      },
      plugins: [pluginCabecas]
    });
  }

  const icone = (t) => t === "ci" ? `<img src="${CABECA_CI.src}" alt="">` : t === "felipe" ? `<img src="${CABECA_FELIPE.src}" alt="">`
    : t === "ambos" ? `<img src="${CABECA_CI.src}" alt=""><img src="${CABECA_FELIPE.src}" alt="">` : `<span class="nenhum" aria-hidden="true"></span>`;
  const sub = (g) => g.black ? `${fmt(black[g.chave])} da Black` : g.chave === "ambos" ? "Docis e Felipe Russo" : "não estão em nenhuma lista";
  $("#alunos-lista").innerHTML = GRUPOS_ALUNO.map((g) => `<li>
      <span class="alunos__icone">${icone(g.icone)}</span>
      <span class="alunos__nome"><i class="cor" style="background:${g.cor}"></i>${g.nome}<span class="alunos__sub">${sub(g)}</span></span>
      <span class="alunos__num">${fmt(cont[g.chave])}<small>${pct(cont[g.chave], total)}</small></span></li>`).join("")
    + `<li class="total"><span class="alunos__icone">${icone("ambos")}</span>
      <span class="alunos__nome">Total de alunos<span class="alunos__sub">${fmt(cont.nenhum)} não alunos · ${fmt(total)} leads únicos</span></span>
      <span class="alunos__num">${fmt(alunos)}<small>${pct(alunos, total)}</small></span></li>`;
  $("#alunos-nota").textContent = "por e-mail ou telefone, na lista de alunos";
}
