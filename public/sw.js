// iExcelo Service Worker — PWA Push Notifications
// Handles incoming push events and notification clicks.
// Registered by utils.store.ts subscribeToPush().

self.addEventListener("push", (event) => {
  console.log("[SW push] event received, raw:", event.data?.text());

  let data = {};
  try {
    data = event.data?.json() ?? {};
  } catch {
    data = { title: "iExcelo", body: event.data?.text() ?? "" };
  }

  console.log("[SW push] parsed payload:", JSON.stringify(data));

  const title = data.title || "iExcelo";
  const options = {
    body: data.body || "",
    icon: "/svg/logo.svg",
    data: { url: data.url || "/" },
    // Collapse repeated notifications from same chatroom
    tag: data.url || "iexcelo-notification",
    renotify: true,
  };

  event.waitUntil(
    self.registration
      .showNotification(title, options)
      .then(() => console.log("[SW push] showNotification OK"))
      .catch((err) =>
        console.error("[SW push] showNotification FAILED:", err.name, err.message),
      ),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        // If app tab is already open — focus it and navigate
        for (const client of windowClients) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) client.navigate(targetUrl);
            return;
          }
        }
        // No open tab — open a new one
        if (clients.openWindow) return clients.openWindow(targetUrl);
      }),
  );
});
