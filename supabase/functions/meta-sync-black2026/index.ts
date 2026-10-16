// Sincroniza os dados de anúncios da Meta (campanhas com "blf26" no nome) para o Supabase.
// Roda de hora em hora (pg_cron). Token em Edge Functions → Secrets → META_ACCESS_TOKEN.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const CONTA = "act_259868608977585";
const FILTRO_CAMPANHA = "blf26";
const INICIO = "2026-10-01";
const API = "https://graph.facebook.com/v23.0";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

function hojeSP(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

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

const filtro = JSON.stringify([{ field: "campaign.name", operator: "CONTAIN", value: FILTRO_CAMPANHA }]);

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

Deno.serve(async () => {
  const token = Deno.env.get("META_ACCESS_TOKEN");
  if (!token) {
    await supabase.from("meta_sync_log").insert({ ok: false, mensagem: "META_ACCESS_TOKEN não configurado" });
    return new Response(JSON.stringify({ ok: false, erro: "META_ACCESS_TOKEN não configurado" }), { status: 400 });
  }
  const agora = new Date().toISOString();
  const periodo = JSON.stringify({ since: INICIO, until: hojeSP() });
  try {
    // 1) anúncios + UTMs
    const ads = await graph(`${CONTA}/ads`, {
      fields: "id,name,effective_status,adset{id,name},campaign{id,name},creative{url_tags,object_story_spec,asset_feed_spec,link_url}",
      filtering: filtro, limit: "200",
    }, token);
    const linhasAds = ads.map((ad) => {
      const urlTags = ad.creative?.url_tags || "";
      const link = linkDoCriativo(ad.creative);
      return {
        ad_id: ad.id, ad_name: ad.name, adset_id: ad.adset?.id, adset_name: ad.adset?.name,
        campaign_id: ad.campaign?.id, campaign_name: ad.campaign?.name, status: ad.effective_status,
        url_tags: urlTags, link_url: link, ...resolverUtms(ad, urlTags, link), atualizado_em: agora,
      };
    });

    // 2) métricas diárias por anúncio
    const base = { time_range: periodo, filtering: filtro, limit: "500" };
    const diarios = await graph(`${CONTA}/insights`, {
      ...base, level: "ad", time_increment: "1",
      fields: "ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name,spend,impressions,inline_link_clicks,clicks,reach,actions",
    }, token);
    const linhasInsights = diarios.map((r) => ({
      dia: r.date_start, ad_id: r.ad_id,
      investimento: Number(r.spend) || 0, impressoes: Number(r.impressions) || 0,
      cliques: Number(r.inline_link_clicks) || 0, cliques_todos: Number(r.clicks) || 0,
      alcance: Number(r.reach) || 0,
      page_views: acao(r.actions, ["landing_page_view", "omni_landing_page_view"]),
      leads_meta: acao(r.actions, ["lead", "offsite_conversion.fb_pixel_lead", "onsite_web_lead"]),
      atualizado_em: agora,
    }));
    // anúncios que aparecem nas métricas mas não vieram na listagem (ex.: excluídos)
    const conhecidos = new Set(linhasAds.map((a) => a.ad_id));
    for (const r of diarios) {
      if (!conhecidos.has(r.ad_id)) {
        conhecidos.add(r.ad_id);
        linhasAds.push({ ad_id: r.ad_id, ad_name: r.ad_name, adset_id: r.adset_id, adset_name: r.adset_name,
          campaign_id: r.campaign_id, campaign_name: r.campaign_name, status: "DELETED", url_tags: "", link_url: "",
          utm_source: null, utm_medium: null, utm_campaign: null, utm_content: null, utm_term: null, atualizado_em: agora } as any);
      }
    }

    // 3) alcance deduplicado
    const alcance: any[] = [];
    const contaDia = await graph(`${CONTA}/insights`, { ...base, level: "account", time_increment: "1", fields: "reach" }, token);
    contaDia.forEach((r) => alcance.push({ nivel: "conta", chave: "total", periodo: r.date_start, alcance: Number(r.reach) || 0 }));
    for (const [nivel, campo] of [["conta", null], ["campanha", "campaign_id"], ["conjunto", "adset_id"], ["anuncio", "ad_id"]] as const) {
      const level = { conta: "account", campanha: "campaign", conjunto: "adset", anuncio: "ad" }[nivel];
      const rows = await graph(`${CONTA}/insights`, { ...base, level, fields: `reach${campo ? "," + campo : ""}` }, token);
      rows.forEach((r) => alcance.push({ nivel, chave: campo ? r[campo] : "total", periodo: "total", alcance: Number(r.reach) || 0 }));
    }
    alcance.forEach((a) => { a.atualizado_em = agora; });

    await upsert("meta_ads_black2026", linhasAds, "ad_id");
    await upsert("meta_insights_black2026", linhasInsights, "dia,ad_id");
    await upsert("meta_alcance_black2026", alcance, "nivel,chave,periodo");

    const msg = `${linhasAds.length} anúncios, ${linhasInsights.length} linhas diárias`;
    await supabase.from("meta_sync_log").insert({ ok: true, mensagem: msg, linhas: linhasInsights.length });
    return new Response(JSON.stringify({ ok: true, mensagem: msg }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const msg = String((e as Error).message || e).slice(0, 500);
    await supabase.from("meta_sync_log").insert({ ok: false, mensagem: msg });
    return new Response(JSON.stringify({ ok: false, erro: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
