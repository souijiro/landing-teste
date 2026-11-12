// Lembrete da aula gratuita (quiz /quiz) em .ics para Agenda do iPhone/Mac.
// ?t=<início em ms UTC> calculado pelo quiz (config.js → AGENDA). Sem dados pessoais.
const TITULO = "Aula gratuita da Docis 🍫";
const DESCRICAO =
  "Aula gratuita da Ci com técnicas e estratégias para produzir brigadeiros incríveis e vender todos os dias. O link de acesso chega pelo WhatsApp.";
const DURACAO_MIN = 120;

function fmt(d) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
function esc(s) {
  return s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export default function handler(req, res) {
  const agora = Date.now();
  let t = Number(req.query.t);
  // só aceita datas nos próximos 15 dias, alinhadas ao minuto
  if (!Number.isFinite(t) || t < agora - 3 * 3600e3 || t > agora + 15 * 86400e3 || t % 60000 !== 0) {
    res.status(400).send("data inválida");
    return;
  }
  const ini = new Date(t);
  const fim = new Date(t + DURACAO_MIN * 60000);
  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Docis//Quiz//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:aula-docis-${t}@c.docis.com.br`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(ini)}`,
    `DTEND:${fmt(fim)}`,
    `SUMMARY:${esc(TITULO)}`,
    `DESCRIPTION:${esc(DESCRICAO)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(TITULO)}`,
    "TRIGGER:-PT1H",
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${esc(TITULO)}`,
    "TRIGGER:-PT10M",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");
  res.setHeader("Content-Type", "text/calendar; charset=utf-8");
  res.setHeader("Content-Disposition", 'inline; filename="aula-docis.ics"');
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.setHeader("Referrer-Policy", "no-referrer");
  res.status(200).send(ics);
}
