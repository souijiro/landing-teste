// Sincroniza os disparos de WhatsApp (API oficial, WABA 3) para o dash da Black 2026:
// modelos, envios/leituras/cliques por modelo e dia (template_analytics) e volume cobrado por meia hora (pricing_analytics).
// Só totais: nenhuma mensagem, contato ou telefone de cliente é lido. Token: META_TOKEN_WHATSAPP (usuário do sistema dash-black).
// Uso: cron de hora em hora (últimos 3 dias); ?completo=1 refaz desde o início da captação.
import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const G = "https://graph.facebook.com/v23.0";
const WABA = "655472080706637";
const INICIO = Date.parse("2026-10-16T00:00:00Z");
const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const T = Deno.env.get("META_TOKEN_WHATSAPP")!;

async function pega(url: string) {
  const r = await fetch(url + (url.includes("access_token=") ? "" : (url.includes("?") ? "&" : "?") + "access_token=" + T));
  const j = await r.json();
  if (!r.ok) throw new Error(j.error?.message || "erro " + r.status);
  return j;
}
async function todasPaginas(url: string) {
  const out: any[] = [];
  for (let i = 0; i < 50 && url; i++) { const j = await pega(url); out.push(...(j.data || [])); url = j.paging?.next || ""; }
  return out;
}

Deno.serve(async (req) => {
  const u = new URL(req.url);
  const completo = u.searchParams.get("completo") === "1";
  const agora = Date.now();
  const desde = completo ? INICIO : Math.max(INICIO, agora - 3 * 86400e3);
  const ini = Math.floor(desde / 1000), fim = Math.floor(agora / 1000);
  const res: any = {};
  try {
    // 1) modelos
    const modelos = await todasPaginas(`${G}/${WABA}/message_templates?fields=id,name,category,status&limit=200`);
    await sb.from("wa_modelos_black2026").upsert(modelos.map((m) => ({ id: m.id, nome: m.name, categoria: m.category, status: m.status, atualizado_em: new Date().toISOString() })));
    res.modelos = modelos.length;

    // 2) envios por modelo e dia (10 modelos por consulta)
    const linhas = new Map<string, any>();
    for (let i = 0; i < modelos.length; i += 10) {
      const ids = modelos.slice(i, i + 10).map((m) => m.id);
      const pts = (await todasPaginas(`${G}/${WABA}/template_analytics?start=${ini}&end=${fim}&granularity=DAILY` +
        `&metric_types=${encodeURIComponent('["SENT","DELIVERED","READ","CLICKED"]')}&template_ids=${encodeURIComponent("[" + ids.join(",") + "]")}&limit=1000`))
        .flatMap((d) => d.data_points || []);
      for (const p of pts) {
        if (!(p.sent || p.delivered || p.read)) continue;
        const dia = new Date(p.start * 1000).toISOString().slice(0, 10);
        const k = dia + "|" + p.template_id;
        const l = linhas.get(k) || { dia, modelo_id: p.template_id, enviados: 0, entregues: 0, lidos: 0, cliques: 0 };
        l.enviados += p.sent || 0; l.entregues += p.delivered || 0; l.lidos += p.read || 0;
        l.cliques += (p.clicked || []).reduce((a: number, c: any) => a + (c.count || 0), 0);
        linhas.set(k, l);
      }
    }
    if (linhas.size) { const { error } = await sb.from("wa_modelo_dia_black2026").upsert([...linhas.values()]); if (error) throw error; }
    res.modelo_dia = linhas.size;

    // 3) volume cobrado por meia hora, número e categoria (blocos de 7 dias)
    const vol: any[] = [];
    for (let a = ini; a < fim; a += 7 * 86400) {
      const b = Math.min(fim, a + 7 * 86400);
      const campo = `pricing_analytics.start(${a}).end(${b}).granularity(HALF_HOUR).dimensions(["PRICING_CATEGORY","PRICING_TYPE","PHONE"])`;
      const j = await pega(`${G}/${WABA}?fields=${encodeURIComponent(campo)}`);
      for (const d of (j.pricing_analytics?.data || [])) for (const p of (d.data_points || [])) {
        if (!p.volume) continue;
        vol.push({ inicio: new Date(p.start * 1000).toISOString(), telefone: p.phone_number || p.phone || "-", categoria: p.pricing_category, tipo: p.pricing_type, volume: p.volume });
      }
    }
    for (let i = 0; i < vol.length; i += 1000) { const { error } = await sb.from("wa_volume_black2026").upsert(vol.slice(i, i + 1000)); if (error) throw error; }
    res.volume = vol.length;

    // 4) dólar (PTAX venda) dos últimos dias
    const fmtBC = (d: Date) => `${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}-${d.getUTCFullYear()}`;
    const p = await fetch(`https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@i,dataFinalCotacao=@f)?@i='${fmtBC(new Date(desde - 5 * 86400e3))}'&@f='${fmtBC(new Date(agora))}'&$format=json&$select=cotacaoVenda,dataHoraCotacao`).then((r) => r.json()).catch(() => null);
    const cot = (p?.value || []).map((c: any) => ({ dia: c.dataHoraCotacao.slice(0, 10), ptax: c.cotacaoVenda }));
    if (cot.length) await sb.from("wa_cambio_black2026").upsert(cot);
    res.ptax = cot.length;

    await sb.from("wa_sync_black2026").upsert({ id: 1, em: new Date().toISOString(), ok: true, erro: null });
    return Response.json({ ok: true, completo, ...res });
  } catch (e) {
    await sb.from("wa_sync_black2026").upsert({ id: 1, em: new Date().toISOString(), ok: false, erro: String(e).slice(0, 300) });
    return Response.json({ ok: false, erro: String(e), ...res }, { status: 500 });
  }
});
