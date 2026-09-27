// Painel de leads do lançamento Canagá.
// A senha é verificada dentro do Supabase (função painel_leads_canaga); sem ela nenhum dado é retornado.
const SUPABASE_URL = "https://dhpfoynxsspaovtdbwmq.supabase.co";
const SUPABASE_KEY = "sb_publishable_9jMmrFBHVzXufxLwGgUO_A_47HsuLx3";
const POR_PAGINA = 50;
const ATUALIZA_MS = 60000;
const SEM_UTM = "__sem_utm__";

const $ = (id) => document.getElementById(id);
const fmt = new Intl.NumberFormat("pt-BR");
const fmtData = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

const norm = (s) => (s || "").trim().toLowerCase().replace(/^@+/, "");
const PROFS = (window.PROFESSORES || []).map((p) => ({ ...p, handle: norm(p.instagram) }));
const PROF_POR_HANDLE = Object.fromEntries(PROFS.map((p) => [p.handle, p]));

const estado = { senha: null, filtro: "", busca: "", pagina: 1, dados: null, timer: null };

function escapar(t) {
  const d = document.createElement("div");
  d.textContent = t == null ? "" : String(t);
  return d.innerHTML;
}

// ---------- API ----------
async function consultar() {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/painel_leads_canaga`, {
    method: "POST",
    headers: { "apikey": SUPABASE_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({
      senha: estado.senha,
      professor: estado.filtro || null,
      busca: estado.busca || null,
      limite: POR_PAGINA,
      pagina: estado.pagina
    })
  });
  const corpo = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const err = new Error(corpo.message || `HTTP ${resp.status}`);
    err.senhaInvalida = corpo.message === "senha_invalida";
    throw err;
  }
  return corpo;
}

async function carregar() {
  $("btn-atualizar").disabled = true;
  try {
    estado.dados = await consultar();
    renderizar();
    $("atualizado").textContent = "Atualizado às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  } catch (e) {
    if (e.senhaInvalida) return sair("Sessão expirada. Digite a senha novamente.");
    console.error(e);
    $("atualizado").textContent = "Erro ao atualizar";
  } finally {
    $("btn-atualizar").disabled = false;
  }
}

// ---------- Trava ----------
$("form-senha").addEventListener("submit", async (e) => {
  e.preventDefault();
  const botao = e.target.querySelector("button");
  estado.senha = $("senha").value;
  botao.disabled = true;
  botao.textContent = "Verificando...";
  $("trava-erro").textContent = "";
  try {
    estado.dados = await consultar();
    try { sessionStorage.setItem("leadscanaga_senha", estado.senha); } catch (err) {}
    abrirPainel();
  } catch (err) {
    estado.senha = null;
    $("trava-erro").textContent = err.senhaInvalida ? "Senha incorreta." : "Não foi possível conectar. Tente novamente.";
  } finally {
    botao.disabled = false;
    botao.textContent = "Entrar";
  }
});

function abrirPainel() {
  $("trava").hidden = true;
  $("painel").hidden = false;
  montarSelect();
  renderizar();
  $("atualizado").textContent = "Atualizado às " + new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  clearInterval(estado.timer);
  estado.timer = setInterval(carregar, ATUALIZA_MS);
}

function sair(msg) {
  clearInterval(estado.timer);
  estado.senha = null;
  estado.dados = null;
  try { sessionStorage.removeItem("leadscanaga_senha"); } catch (err) {}
  $("painel").hidden = true;
  $("trava").hidden = false;
  $("senha").value = "";
  $("trava-erro").textContent = typeof msg === "string" ? msg : "";
  $("senha").focus();
}
$("btn-sair").addEventListener("click", () => sair());
$("btn-atualizar").addEventListener("click", carregar);

// ---------- Filtros ----------
function montarSelect() {
  const sel = $("filtro-prof");
  const opcoes = [`<option value="">Todos os leads</option>`]
    .concat(PROFS.slice().sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .map((p) => `<option value="${escapar(p.handle)}">${escapar(p.nome)} (@${escapar(p.handle)})</option>`));
  sel.innerHTML = opcoes.join("");
  sel.value = estado.filtro;
}

function aplicarFiltro(valor) {
  estado.filtro = estado.filtro === valor ? "" : valor; // clicar de novo remove o filtro
  estado.pagina = 1;
  garantirOpcao(estado.filtro);
  $("filtro-prof").value = estado.filtro;
  carregar();
  if (estado.filtro) $("bloco-tabela").scrollIntoView({ behavior: "smooth", block: "start" });
}

// Origens fora da lista de professores ganham uma opção temporária no select
function garantirOpcao(valor) {
  const sel = $("filtro-prof");
  sel.querySelectorAll("option[data-extra]").forEach((o) => o.remove());
  if (valor && !PROF_POR_HANDLE[valor]) {
    const o = document.createElement("option");
    o.value = valor;
    o.dataset.extra = "1";
    o.textContent = valor === SEM_UTM ? "Sem utm_source" : `Origem: ${valor}`;
    sel.appendChild(o);
  }
}

$("filtro-prof").addEventListener("change", (e) => aplicarFiltro(e.target.value || estado.filtro));
let buscaTimer;
$("filtro-busca").addEventListener("input", (e) => {
  clearTimeout(buscaTimer);
  buscaTimer = setTimeout(() => {
    estado.busca = e.target.value.trim();
    estado.pagina = 1;
    carregar();
  }, 350);
});
$("pag-ant").addEventListener("click", () => { if (estado.pagina > 1) { estado.pagina--; carregar(); } });
$("pag-prox").addEventListener("click", () => { estado.pagina++; carregar(); });

// ---------- Render ----------
function renderizar() {
  const d = estado.dados;
  if (!d) return;

  const porSource = Object.fromEntries((d.placar || []).map((p) => [p.source == null ? SEM_UTM : p.source, p]));
  const ranking = PROFS.map((p) => ({ ...p, leads: porSource[p.handle]?.leads || 0, unicos: porSource[p.handle]?.unicos || 0 }))
    .sort((a, b) => b.unicos - a.unicos || b.leads - a.leads || a.nome.localeCompare(b.nome, "pt-BR"));
  const outras = (d.placar || []).filter((p) => !PROF_POR_HANDLE[p.source]);
  const somaProfs = ranking.reduce((s, p) => s + p.unicos, 0);
  const max = Math.max(1, ...ranking.map((p) => p.unicos));

  // KPIs
  $("kpi-unicos").textContent = fmt.format(d.total_unicos);
  $("kpi-total").textContent = fmt.format(d.total_leads);
  $("kpi-profs").textContent = fmt.format(somaProfs);
  $("kpi-profs-nota").textContent = d.total_unicos
    ? `${Math.round((somaProfs / d.total_unicos) * 100)}% dos leads únicos vieram de links de professores`
    : "soma dos leads únicos de cada professor";

  // Placar
  let pos = 0, anterior = null;
  $("placar").innerHTML = ranking.map((p, i) => {
    if (p.unicos !== anterior) { pos = i + 1; anterior = p.unicos; }
    const top = p.unicos > 0 && pos <= 3 ? ` prof--top${pos}` : "";
    const ativo = estado.filtro === p.handle ? " prof--ativo" : "";
    return `
    <li>
      <div class="prof${top}${ativo}" role="button" tabindex="0" data-filtro="${escapar(p.handle)}" aria-pressed="${!!ativo}">
        <span class="prof__barra" style="width:${(p.unicos / max) * 100}%"></span>
        <span class="prof__pos">${p.unicos > 0 ? pos + "º" : "–"}</span>
        <img class="prof__foto" src="${escapar(p.foto)}" alt="" width="52" height="52" loading="lazy">
        <span class="prof__info">
          <span class="prof__nome">${escapar(p.nome)}</span>
          <a class="prof__ig" href="https://www.instagram.com/${encodeURIComponent(p.handle)}/" target="_blank" rel="noopener">@${escapar(p.handle)}</a>
        </span>
        <span class="prof__num"><strong>${fmt.format(p.unicos)}</strong><span>${p.unicos === 1 ? "lead" : "leads"}</span></span>
      </div>
    </li>`;
  }).join("");

  // Outras origens
  $("outras").innerHTML = outras.length ? `
    <h3>Outras origens (fora da lista de professores)</h3>
    <div class="outras__lista">
      ${outras.map((o) => {
        const v = o.source == null ? SEM_UTM : o.source;
        const rotulo = o.source == null ? "sem utm_source" : o.source;
        return `<button type="button" class="chip${estado.filtro === v ? " chip--ativo" : ""}" data-filtro="${escapar(v)}">${escapar(rotulo)} · <b>${fmt.format(o.unicos)}</b></button>`;
      }).join("")}
    </div>` : "";

  // Resumo do filtro
  const nomeFiltro = !estado.filtro ? "todos os leads"
    : PROF_POR_HANDLE[estado.filtro] ? PROF_POR_HANDLE[estado.filtro].nome
    : estado.filtro === SEM_UTM ? "leads sem utm_source" : `origem "${estado.filtro}"`;
  $("filtro-resumo").textContent =
    `${fmt.format(d.filtro_unicos)} únicos · ${fmt.format(d.filtro_total)} cadastros — ${nomeFiltro}` +
    (estado.busca ? ` · busca "${estado.busca}"` : "");

  // Tabela
  const linhas = d.leads || [];
  $("tabela-corpo").innerHTML = linhas.length ? linhas.map((l) => `
    <tr>
      <td>${escapar(fmtData.format(new Date(l.data)))}</td>
      <td>${escapar([l.nome, l.sobrenome].filter(Boolean).join(" "))}</td>
      <td>${escapar(l.email)}</td>
      <td>${escapar(l.telefone)}</td>
      <td>${escapar(l.utm_source)}</td>
      <td>${escapar(l.utm_medium)}</td>
      <td>${escapar(l.utm_campaign)}</td>
      <td>${escapar(l.utm_content)}</td>
      <td>${escapar(l.utm_term)}</td>
    </tr>`).join("")
    : `<tr><td colspan="9" class="tabela__vazio">Nenhum lead encontrado para este filtro.</td></tr>`;

  // Paginação
  const paginas = Math.max(1, Math.ceil(d.filtro_total / POR_PAGINA));
  if (estado.pagina > paginas) estado.pagina = paginas;
  $("pag-info").textContent = `Página ${estado.pagina} de ${paginas}`;
  $("pag-ant").disabled = estado.pagina <= 1;
  $("pag-prox").disabled = estado.pagina >= paginas;
}

// Clique/teclado nos cards do placar e nos chips
document.addEventListener("click", (e) => {
  if (e.target.closest(".prof__ig")) return; // link do Instagram abre normalmente
  const alvo = e.target.closest("[data-filtro]");
  if (alvo) aplicarFiltro(alvo.dataset.filtro);
});
document.addEventListener("keydown", (e) => {
  const alvo = e.target.closest && e.target.closest(".prof[data-filtro]");
  if (alvo && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); aplicarFiltro(alvo.dataset.filtro); }
});

// Reabre direto se a senha já foi digitada nesta aba
(async () => {
  let salva = null;
  try { salva = sessionStorage.getItem("leadscanaga_senha"); } catch (err) {}
  if (!salva) return $("senha").focus();
  estado.senha = salva;
  try {
    estado.dados = await consultar();
    abrirPainel();
  } catch (err) {
    sair(err.senhaInvalida ? "" : "Não foi possível conectar. Tente novamente.");
  }
})();
