// Sincroniza a conta de anúncios do Felipe Russo DIRETO da Meta (substitui o JSON da Blessy).
// Token: Edge Functions → Secrets → META_TOKEN_FELIPE (token de usuário com ads_read, app "App Conta Felipe").
// A conta é em USD e no fuso de Nova York:
//  • investimento em R$ = USD × PTAX de venda do dia (Banco Central; fim de semana/feriado = último dia útil) × 1,035 (IOF) — mesma regra da Blessy
//  • diário: dia da conta (Nova York), igual ao que a Blessy mandava · hora a hora: convertido para o horário de Brasília
// ?seco=1 calcula e devolve os totais sem gravar nada (para conferir).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CONTA = "act_766204412703705";
const CONTA_NOME = "Felipe Russo";
const FILTRO_CAMPANHA = "BLF26";
const INICIO = "2026-10-18";
const IOF = 0.035;
const API = "https://graph.facebook.com/v23.0";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const filtro = JSON.stringify([{ field: "campaign.name", operator: "CONTAIN", value: FILTRO_CAMPANHA }]);
const diaEm = (tz: string, d = new Date()) => new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(d);

async function graph(caminho: string, params: Record<string, string>, token: string): Promise<any[]> {
  const url = new URL(`${API}/${caminho}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  url.searchParams.set("access_token", token);
  const linhas: any[] = [];
  let proxima: string | null = url.toString();
  while (proxima) {
    const r = await fetch(proxima);
    const j = await r.json();
    if (!r.ok || j.error) throw new Error(`Meta API (${caminho}): ${j.error?.message || r.status}`);
    linhas.push(...(j.data || []));
    proxima = j.paging?.next || null;
  }
  return linhas;
}


function acao(actions: any[] | undefined, tipos: string[]): number {
  if (!actions) return 0;
  for (const t of tipos) {
    const a = actions.find((x) => x.action_type === t);
    if (a) return Number(a.value) || 0;
  }
  return 0;
}

// Resolve as macros da Meta nos parâmetros de URL do anúncio
function resolverUtms(ad: any, urlTags: string, link: string) {
  const params = new URLSearchParams();
  try { new URL(link).searchParams.forEach((v, k) => params.set(k, v)); } catch (_) { /* sem link */ }
  new URLSearchParams(urlTags || "").forEach((v, k) => params.set(k, v));
  const macros: Record<string, string> = {
    "{{campaign.name}}": ad.campaign?.name || "", "{{adset.name}}": ad.adset?.name || "", "{{ad.name}}": ad.name || "",
    "{{campaign.id}}": ad.campaign?.id || "", "{{adset.id}}": ad.adset?.id || "", "{{ad.id}}": ad.id || "",
  };
  const res: Record<string, string | null> = {};
  for (const campo of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
    let v = params.get(campo);
    if (v == null || v === "") { res[campo] = null; continue; }
    for (const [m, val] of Object.entries(macros)) v = v.split(m).join(val);
    // macros que variam por posicionamento não dá para resolver
    if (/\{\{[^}]+\}\}/.test(v)) v = "(varia por posicionamento)";
    res[campo] = v;
  }
  return res;
}

// vídeo x imagem pelo próprio criativo da Meta
function formatoDoCriativo(c: any): "video" | "imagem" {
  if (c?.video_id || c?.object_story_spec?.video_data || (c?.asset_feed_spec?.videos || []).length || c?.object_type === "VIDEO") return "video";
  return "imagem";
}

function linkDoCriativo(c: any): string {
  return c?.object_story_spec?.link_data?.link
    || c?.object_story_spec?.video_data?.call_to_action?.value?.link
    || c?.asset_feed_spec?.link_urls?.[0]?.website_url
    || c?.link_url || "";
}

async function upsert(tabela: string, linhas: any[], conflito: string) {
  for (let i = 0; i < linhas.length; i += 500) {
    const { error } = await supabase.from(tabela).upsert(linhas.slice(i, i + 500), { onConflict: conflito });
    if (error) throw new Error(`${tabela}: ${error.message}`);
  }
}


// PTAX de venda (fechamento) por dia; dia sem PTAX usa a do último dia útil anterior
async function ptaxPorDia(de: string, ate: string): Promise<(dia: string) => { fx: number; data: string }> {
  const fmt = (d: string) => `${d.slice(5, 7)}-${d.slice(8, 10)}-${d.slice(0, 4)}`;
  const inicio = new Date(Date.parse(de) - 10 * 86400000).toISOString().slice(0, 10);
  const url = `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?@dataInicial='${fmt(inicio)}'&@dataFinalCotacao='${fmt(ate)}'&$format=json&$select=cotacaoVenda,dataHoraCotacao`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`PTAX respondeu ${r.status}`);
  const lista = ((await r.json()).value || []) as { cotacaoVenda: number; dataHoraCotacao: string }[];
  const porData = new Map<string, number>();
  lista.forEach((c) => porData.set(c.dataHoraCotacao.slice(0, 10), Number(c.cotacaoVenda))); // a última do dia (fechamento) fica
  const datas = [...porData.keys()].sort();
  if (!datas.length) throw new Error("PTAX sem cotações no período");
  return (dia: string) => {
    let d = datas[0];
    for (const x of datas) if (x <= dia) d = x;
    return { fx: porData.get(d)! * (1 + IOF), data: d };
  };
}

// hora cheia de Nova York (dia, hora) → dia e hora em Brasília
function nyParaBrasilia(dia: string, hora: number): { dia: string; hora: number } {
  const [a, m, d] = dia.split("-").map(Number);
  let t = Date.UTC(a, m - 1, d, hora) + 4 * 3600000; // chute EDT (UTC-4) e corrige
  for (let i = 0; i < 2; i++) {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date(t)).map((x) => [x.type, x.value]));
    const vistoUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour);
    t += Date.UTC(a, m - 1, d, hora) - vistoUtc;
  }
  const b = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", hourCycle: "h23" }).formatToParts(new Date(t)).map((x) => [x.type, x.value]));
  return { dia: `${b.year}-${b.month}-${b.day}`, hora: +b.hour };
}

const log = (ok: boolean, mensagem: string, linhas = 0) => supabase.from("meta_sync_log").insert({ ok, mensagem: mensagem.slice(0, 500), linhas, fonte: "felipe" });

Deno.serve(async (req) => {
  const seco = new URL(req.url).searchParams.get("seco") === "1";
  const token = Deno.env.get("META_TOKEN_FELIPE");
  if (!token) { if (!seco) await log(false, "META_TOKEN_FELIPE não configurado"); return new Response(JSON.stringify({ ok: false, erro: "META_TOKEN_FELIPE não configurado" }), { status: 400 }); }
  const agora = new Date().toISOString();
  const hojeNY = diaEm("America/New_York");
  try {
    const cambio = await ptaxPorDia(INICIO, diaEm("America/Sao_Paulo"));
    const periodo = JSON.stringify({ since: INICIO, until: hojeNY });

    // 1) anúncios + UTMs + formato
    const ads = await graph(`${CONTA}/ads`, {
      fields: "id,name,effective_status,adset{id,name},campaign{id,name},creative{url_tags,object_story_spec,asset_feed_spec,link_url,object_type,video_id}",
      filtering: filtro, limit: "200",
    }, token);
    const linhasAds = ads.map((ad) => {
      const urlTags = ad.creative?.url_tags || "";
      const link = linkDoCriativo(ad.creative);
      return {
        ad_id: ad.id, ad_name: ad.name, adset_id: ad.adset?.id, adset_name: ad.adset?.name,
        campaign_id: ad.campaign?.id, campaign_name: ad.campaign?.name, status: ad.effective_status,
        url_tags: urlTags, link_url: link, ...resolverUtms(ad, urlTags, link), conta_id: CONTA, conta_nome: CONTA_NOME,
        formato: formatoDoCriativo(ad.creative), atualizado_em: agora,
      };
    });

    // 2) diário por anúncio (dia da conta = Nova York)
    const base = { time_range: periodo, filtering: filtro, limit: "500" };
    const diarios = await graph(`${CONTA}/insights`, {
      ...base, level: "ad", time_increment: "1",
      fields: "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,inline_link_clicks,clicks,reach,actions",
    }, token);
    const linhasInsights = diarios.map((r) => {
      const usd = Number(r.spend) || 0, { fx } = cambio(r.date_start);
      return {
        dia: r.date_start, ad_id: r.ad_id,
        investimento: Math.round(usd * fx * 100) / 100, investimento_usd: usd, cambio: Math.round(fx * 1e6) / 1e6,
        impressoes: Number(r.impressions) || 0, cliques: Number(r.inline_link_clicks) || 0, cliques_todos: Number(r.clicks) || 0,
        alcance: Number(r.reach) || 0,
        page_views: acao(r.actions, ["landing_page_view", "omni_landing_page_view"]),
        leads_meta: acao(r.actions, ["offsite_conversion.fb_pixel_lead", "lead", "onsite_web_lead"]),
        atualizado_em: agora,
      };
    });
    const conhecidos = new Set(linhasAds.map((a) => a.ad_id));
    for (const r of diarios) {
      if (!conhecidos.has(r.ad_id)) {
        conhecidos.add(r.ad_id);
        linhasAds.push({ ad_id: r.ad_id, ad_name: r.ad_name, adset_id: r.adset_id, adset_name: r.adset_name,
          campaign_id: r.campaign_id, campaign_name: r.campaign_name, status: "DELETED", url_tags: "", link_url: "",
          utm_source: "facebook", utm_medium: null, utm_campaign: "blf26_felipe", utm_content: r.adset_name, utm_term: r.ad_name,
          conta_id: CONTA, conta_nome: CONTA_NOME, atualizado_em: agora } as any);
      }
    }

    // 3) hora a hora por anúncio: hora de Nova York → hora de Brasília (soma se cair na mesma hora)
    const horarios = await graph(`${CONTA}/insights`, {
      ...base, level: "ad", time_increment: "1", breakdowns: "hourly_stats_aggregated_by_advertiser_time_zone",
      fields: "ad_id,spend,impressions,inline_link_clicks,actions",
    }, token);
    const porHora = new Map<string, any>();
    for (const r of horarios) {
      const hNY = parseInt(String(r.hourly_stats_aggregated_by_advertiser_time_zone || "0").slice(0, 2), 10) || 0;
      const br = nyParaBrasilia(r.date_start, hNY);
      const k = `${br.dia}|${br.hora}|${r.ad_id}`;
      const x = porHora.get(k) ?? { dia: br.dia, hora: br.hora, ad_id: r.ad_id, investimento: 0, impressoes: 0, cliques: 0, page_views: 0, leads_meta: 0, atualizado_em: agora };
      x.investimento += (Number(r.spend) || 0) * cambio(r.date_start).fx;
      x.impressoes += Number(r.impressions) || 0; x.cliques += Number(r.inline_link_clicks) || 0;
      x.page_views += acao(r.actions, ["landing_page_view", "omni_landing_page_view"]);
      x.leads_meta += acao(r.actions, ["offsite_conversion.fb_pixel_lead", "lead", "onsite_web_lead"]);
      porHora.set(k, x);
    }
    const linhasHora = [...porHora.values()].map((x) => ({ ...x, investimento: Math.round(x.investimento * 100) / 100 }));

    // 4) alcance deduplicado por campanha/conjunto/anúncio no período (a conta fica com a própria chave)
    const alcance: any[] = [];
    for (const [nivel, campo] of [["conta", null], ["campanha", "campaign_id"], ["conjunto", "adset_id"], ["anuncio", "ad_id"]] as const) {
      const level = { conta: "account", campanha: "campaign", conjunto: "adset", anuncio: "ad" }[nivel];
      const rows = await graph(`${CONTA}/insights`, { ...base, level, fields: `reach${campo ? "," + campo : ""}` }, token);
      rows.forEach((r) => alcance.push({ nivel, chave: campo ? r[campo] : CONTA, periodo: "total", alcance: Number(r.reach) || 0, atualizado_em: agora }));
    }

    const soma = (l: any[], c: string) => Math.round(l.reduce((s, r) => s + (Number(r[c]) || 0), 0) * 100) / 100;
    const resumo = { anuncios: linhasAds.length, linhas_dia: linhasInsights.length, linhas_hora: linhasHora.length,
      dia_brl: soma(linhasInsights, "investimento"), dia_usd: soma(linhasInsights, "investimento_usd"), hora_brl: soma(linhasHora, "investimento"),
      impressoes: soma(linhasInsights, "impressoes"), cliques: soma(linhasInsights, "cliques"), page_views: soma(linhasInsights, "page_views"),
      ptax_hoje: cambio(hojeNY) };
    if (seco) {
      const porDia: Record<string, number> = {};
      linhasInsights.forEach((r) => { porDia[r.dia] = Math.round(((porDia[r.dia] || 0) + r.investimento) * 100) / 100; });
      return new Response(JSON.stringify({ ok: true, seco: true, resumo, porDia }), { headers: { "Content-Type": "application/json" } });
    }

    await upsert("meta_ads_black2026", linhasAds, "ad_id");
    await upsert("meta_insights_black2026", linhasInsights, "dia,ad_id");
    await upsert("meta_insights_hora_black2026", linhasHora, "dia,hora,ad_id");
    if (alcance.length) await upsert("meta_alcance_black2026", alcance, "nivel,chave,periodo");
    const msg = `direto da Meta: ${linhasAds.length} anúncios, ${linhasInsights.length} linhas diárias, ${linhasHora.length} por hora · R$ ${resumo.dia_brl.toFixed(2)} (US$ ${resumo.dia_usd.toFixed(2)})`;
    await log(true, msg, linhasInsights.length);
    return new Response(JSON.stringify({ ok: true, mensagem: msg }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const msg = String((e as Error).message || e);
    if (!seco) await log(false, msg);
    return new Response(JSON.stringify({ ok: false, erro: msg.slice(0, 500) }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
