// Envia uma notificação para todos os aparelhos que ativaram as notificações do app do dash.
// POST { "titulo": "...", "texto": "...", "url": "/dash/" }  (precisa do JWT do projeto; chamado pelo banco/cron)
// Chaves VAPID no Vault (dash_push_chaves, só service_role). Aparelho que não existe mais (404/410) é removido.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
import webpush from "npm:web-push@3.6.7";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const json = (o: unknown, status = 200) => new Response(JSON.stringify(o), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  let corpo: any = {};
  try { corpo = await req.json(); } catch (_) { /* sem corpo */ }
  const titulo = String(corpo.titulo || "Dash Black 2026").slice(0, 80);
  const texto = String(corpo.texto || "").slice(0, 300);
  const url = String(corpo.url || "/dash/").startsWith("/dash") ? String(corpo.url || "/dash/") : "/dash/";

  const { data: chaves, error: eCh } = await supabase.rpc("dash_push_chaves");
  if (eCh || !chaves?.publica || !chaves?.privada) return json({ ok: false, erro: "chaves VAPID não encontradas" }, 500);
  webpush.setVapidDetails("https://c.docis.com.br/dash/", chaves.publica, chaves.privada);

  const { data: subs, error } = await supabase.from("dash_push_inscricoes").select("id, endpoint, p256dh, auth");
  if (error) return json({ ok: false, erro: error.message }, 500);

  const payload = JSON.stringify({ titulo, texto, url });
  let enviados = 0, removidos = 0, falhas = 0;
  for (const s of subs || []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, { TTL: 3600 });
      enviados++;
      await supabase.from("dash_push_inscricoes").update({ ultimo_envio: new Date().toISOString(), falhas: 0 }).eq("id", s.id);
    } catch (e) {
      const st = (e as any)?.statusCode;
      if (st === 404 || st === 410) { await supabase.from("dash_push_inscricoes").delete().eq("id", s.id); removidos++; }
      else { falhas++; await supabase.from("dash_push_inscricoes").update({ falhas: 1 }).eq("id", s.id); }
    }
  }
  return json({ ok: true, aparelhos: (subs || []).length, enviados, removidos, falhas });
});
