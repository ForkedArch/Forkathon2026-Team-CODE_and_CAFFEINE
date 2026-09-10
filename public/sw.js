const CACHE_NAME = "campuspulse-shell-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", event => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    payload = { title: "CampusPulse", body: event.data?.text() || "New campus notice" };
  }

  const title = payload.title || "CampusPulse";
  const options = {
    body: payload.body || "You have a new campus notice.",
    tag: payload.notice_id ? `campuspulse-${payload.notice_id}` : "campuspulse-notice",
    renotify: true,
    requireInteraction: payload.urgency === "critical",
    data: { url: payload.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const destination = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(clients => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(destination);
          return client.focus();
        }
      }
      if (self.clients.openWindow) return self.clients.openWindow(destination);
      return undefined;
    }),
  );
});