// Puxa o gasto da conta do Felipe Russo (JSON da Blessy Mídias) e grava nas tabelas de tráfego da Black 2026,
// marcando conta_id/conta_nome para o dash separar por conta. Roda de hora em hora (pg_cron).
// O token fica no Vault do banco (função token_blessy_felipe, só service_role).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const URL_GASTO = "https://raiox.blessymidias.com.br/blf26-docis/gasto.json";
const CONTA_NOME = "Felipe Russo";
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

// pega o primeiro campo existente (aceita objetos aninhados com "a.b")
const pega = (o: any, ...nomes: string[]) => {
  for (const n of nomes) {
    const v = n.split(".").reduce((x, k) => (x == null ? x : x[k]), o);
    if (v != null && v !== "") return v;
  }
  return null;
};
const num = (v: any) => (v == null || v === "" || isNaN(+v) ? 0 : +v);

async function log(ok: boolean, mensagem: string, linhas = 0) {
  await supabase.from("meta_sync_log").insert({ ok, mensagem, linhas, fonte: "felipe" });
}

async function upsert(tabela: string, linhas: any[], conflito: string) {
  for (let i = 0; i < linhas.length; i += 500) {
    const { error } = await supabase.from(tabela).upsert(linhas.slice(i, i + 500), { onConflict: conflito });
    if (error) throw new Error(`${tabela}: ${error.message}`);
  }
}

Deno.serve(async () => {
  try {
    const { data: token, error: eTok } = await supabase.rpc("token_blessy_felipe");
    if (eTok || !token) throw new Error("token da Blessy não encontrado no Vault");

    const resp = await fetch(URL_GASTO, { headers: { Authorization: `Bearer ${token}` } });
    if (!resp.ok) throw new Error(`gasto.json respondeu ${resp.status}`);
    const d = await resp.json();
    if (d?.status && d.status.ok === false) throw new Error(`Blessy: ${d.status.erro || "status não ok"}`);

    const contaId = String(pega(d, "conta.id") || "act_766204412703705");
    const linhas: any[] = Array.isArray(d?.linhas) ? d.linhas : [];
    const ads = new Map<string, any>();
    const insights: any[] = [];
    const semId: string[] = [];

    for (const l of linhas) {
      const adId = pega(l, "ad_id", "ad.id", "anuncio_id");
      const dia = pega(l, "date", "dia", "date_start");
      if (!adId || !dia) { semId.push(Object.keys(l).join(",")); continue; }
      const adName = pega(l, "ad_name", "ad.name", "anuncio");
      const adsetName = pega(l, "adset_name", "adset.name", "conjunto");
      const formato = String(pega(l, "formato", "format", "creative_type", "tipo") || "").toLowerCase();
      ads.set(String(adId), {
        ad_id: String(adId), ad_name: adName, adset_id: pega(l, "adset_id", "adset.id"), adset_name: adsetName,
        campaign_id: pega(l, "campaign_id", "campaign.id"), campaign_name: pega(l, "campaign_name", "campaign.name", "campanha"),
        status: pega(l, "status", "effective_status", "ad_status"),
        url_tags: pega(l, "url_tags"),
        // UTMs fixas combinadas com a Blessy: utm_content = conjunto, utm_term = anúncio
        utm_source: "facebook", utm_medium: "{{placement}}", utm_campaign: pega(l, "utm_campaign") || "blf26_felipe",
        utm_content: pega(l, "utm_content") || adsetName, utm_term: pega(l, "utm_term") || adName,
        conta_id: contaId, conta_nome: CONTA_NOME,
        formato: /vid/.test(formato) ? "video" : /(imag|image|foto|photo|carrossel|carousel)/.test(formato) ? "imagem" : null,
        atualizado_em: new Date().toISOString(),
      });
      insights.push({
        dia, ad_id: String(adId),
        investimento: num(pega(l, "spend_brl", "gasto_brl")),
        investimento_usd: num(pega(l, "spend_usd", "gasto_usd")),
        cambio: pega(l, "fx_efetivo", "cambio") != null ? num(pega(l, "fx_efetivo", "cambio")) : null,
        impressoes: Math.round(num(pega(l, "impressions", "impressoes"))),
        cliques: Math.round(num(pega(l, "link_clicks", "inline_link_clicks", "cliques"))),
        page_views: Math.round(num(pega(l, "landing_page_views", "page_views"))),
        leads_meta: Math.round(num(pega(l, "leads_meta", "leads"))),
        alcance: Math.round(num(pega(l, "reach", "alcance"))),
        atualizado_em: new Date().toISOString(),
      });
    }

    // não sobrescreve campos que já existem com null (ex.: formato definido à mão)
    const listaAds = [...ads.values()].map((a) => Object.fromEntries(Object.entries(a).filter(([, v]) => v != null)));
    if (listaAds.length) await upsert("meta_ads_black2026", listaAds, "ad_id");
    if (insights.length) await upsert("meta_insights_black2026", insights, "dia,ad_id");

    const tot = pega(d, "totais.acumulado") || {};
    let msg = `${insights.length} linhas, ${ads.size} anúncios · acumulado R$ ${num(tot.spend_brl).toFixed(2)} · Blessy atualizou ${d?.atualizado_em ?? "?"}`;
    if (semId.length) msg += ` · ${semId.length} linhas sem ad_id/date (campos: ${semId[0].slice(0, 300)})`;
    await log(true, msg, insights.length);
    return new Response(JSON.stringify({ ok: true, mensagem: msg }), { headers: { "Content-Type": "application/json" } });
  } catch (e) {
    const msg = String(e?.message || e);
    await log(false, msg);
    return new Response(JSON.stringify({ ok: false, erro: msg }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
});
