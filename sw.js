// Čuva sve što aplikacija učita sa svoje adrese. Stranice: prvo mreža, pa sačuvano;
// ostalo (JS, CSS, ikone): prvo sačuvano, pa mreža. GitHub API se ne čuva.
const KES = "brzo-citanje-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const zahtev = e.request;
  if (zahtev.method !== "GET" || new URL(zahtev.url).origin !== self.location.origin) return;

  if (zahtev.mode === "navigate") {
    e.respondWith(
      fetch(zahtev)
        .then((odgovor) => {
          const kopija = odgovor.clone();
          caches.open(KES).then((k) => k.put(zahtev, kopija));
          return odgovor;
        })
        .catch(() => caches.match(zahtev).then((s) => s || caches.match(self.registration.scope))),
    );
    return;
  }

  e.respondWith(
    caches.match(zahtev).then(
      (sacuvano) =>
        sacuvano ||
        fetch(zahtev).then((odgovor) => {
          if (odgovor.ok) {
            const kopija = odgovor.clone();
            caches.open(KES).then((k) => k.put(zahtev, kopija));
          }
          return odgovor;
        }),
    ),
  );
});
