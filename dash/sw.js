// Service worker do app do dash: recebe as notificações push e abre o dash ao tocar.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { texto: e.data ? e.data.text() : "" }; }
  e.waitUntil(self.registration.showNotification(d.titulo || "Dash Black 2026", {
    body: d.texto || "",
    icon: "/dash/icons/icon-192.png",
    badge: "/dash/icons/icon-192.png",
    data: { url: d.url || "/dash/" }
  }));
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/dash/";
  e.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((lista) => {
    const aberto = lista.find((c) => c.url.includes("/dash"));
    if (aberto) { aberto.navigate(url); return aberto.focus(); }
    return self.clients.openWindow(url);
  }));
});
