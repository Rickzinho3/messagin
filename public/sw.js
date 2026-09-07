self.addEventListener("push", function (event) {
  if (!event.data) return;

  let data = { title: "🔥 Lembrei de você", body: "Você recebeu uma mensagem safada..." };
  try {
    data = event.data.json();
  } catch (e) {
    data.body = event.data.text();
  }

  const options = {
    body: data.body || "Nova mensagem quente pra você 😈",
    vibrate: [200, 100, 200, 100, 200],
    data: { url: data.url || "/" },
    requireInteraction: true,
    tag: "notificacao-safada-" + Date.now(),
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "🔥 Lembrei de você", options)
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      for (const client of clientList) {
        if ("focus" in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow("/");
    })
  );
});

self.addEventListener("install", (e) => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
