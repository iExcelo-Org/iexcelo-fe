// iExcelo Service Worker — PWA caching + Push Notifications

const CACHE_NAME = 'iexcelo-cache-v1';

// ── Lifecycle ────────────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(['/']))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch / caching ──────────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin GET requests; skip API calls
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname.startsWith('/api/')
  ) return;

  // Cache-first for immutable static assets
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/seo/') ||
    url.pathname.startsWith('/svg/') ||
    url.pathname.startsWith('/images/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Network-first with cache fallback for pages
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ── Push Notifications ───────────────────────────────────────────────────────
// Registered by utils.store.ts subscribeToPush()

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
    icon: "/seo/logo.png",
    data: { url: data.url || "/" },
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
        for (const client of windowClients) {
          if ("focus" in client) {
            client.focus();
            if ("navigate" in client) client.navigate(targetUrl);
            return;
          }
        }
        if (clients.openWindow) return clients.openWindow(targetUrl);
      }),
  );
});
