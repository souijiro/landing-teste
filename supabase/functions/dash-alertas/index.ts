// Motor de alertas do dash: roda a cada 10 min (pg_cron), pede ao banco os alertas pendentes
// (dash_alertas_pendentes: CPL alto, marcos de 1.000 leads, grupos atualizados, criativo novo, resumo do teste A/B, ritmo de investimento)
// e manda cada um como notificação push para os aparelhos que ativaram o app do dash.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async () => {
  const { data: alertas, error } = await supabase.rpc("dash_alertas_pendentes");
  if (error) return json({ ok: false, erro: error.message }, 500);
  if (!alertas || !alertas.length) return json({ ok: true, alertas: 0 });

  const { data: chaves } = await supabase.rpc("dash_push_chaves");
  if (!chaves?.publica || !chaves?.privada) return json({ ok: false, erro: "chaves VAPID não encontradas" }, 500);
  webpush.setVapidDetails("https://c.docis.com.br/dash/", chaves.publica, chaves.privada);
  const { data: subs } = await supabase.from("dash_push_inscricoes").select("id, endpoint, p256dh, auth");

  let enviados = 0;
  for (const a of alertas) {
    const payload = JSON.stringify({ titulo: String(a.titulo || "Dash Black 2026").slice(0, 80), texto: String(a.texto || "").slice(0, 300), url: "/dash/" });
    for (const s of subs || []) {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 });
        enviados++;
      } catch (e) {
        const st = (e as any)?.statusCode;
        if (st === 404 || st === 410) await supabase.from("dash_push_inscricoes").delete().eq("id", s.id);
      }
    }
  }
  return json({ ok: true, alertas: alertas.length, enviados, aparelhos: (subs || []).length, titulos: alertas.map((a: any) => a.titulo) });
});
