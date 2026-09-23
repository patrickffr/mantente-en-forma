// Service Worker de "Mantente en forma"
// Estrategia: cache-first. Todo lo que se precachea en la instalación
// (el propio HTML, el manifest, los iconos y las librerías de React
// desde cdnjs) queda disponible sin conexión desde la primera carga.
//
// IMPORTANTE al publicar una nueva versión de la app:
// sube el número de CACHE_VERSION. Eso crea una caché nueva, así el
// teléfono descarga los ficheros actualizados en vez de servir para
// siempre los antiguos. Las cachés con nombre distinto al actual se
// borran solas en el evento "activate".
const CACHE_VERSION = 'v1';
const CACHE_NAME = `mantente-en-forma-${CACHE_VERSION}`;

// Rutas relativas del propio proyecto (funcionan igual en la raíz de un
// dominio que en un subdirectorio tipo GitHub Pages: usuario.github.io/repo/).
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

// React vía UMD (cdnjs). Se cachean como respuestas "opacas" (no-cors)
// porque son de otro origen; el navegador no nos deja leer su contenido,
// pero sí guardarlas y servirlas igual cuando no hay red.
const CDN_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      // El "app shell" es imprescindible: si falla, queremos verlo.
      await cache.addAll(APP_SHELL);
      // Los recursos CDN se cachean uno a uno y con tolerancia a fallos:
      // si en el primer install hay un hipo de red con cdnjs, no queremos
      // que toda la instalación del service worker se caiga por eso.
      await Promise.all(
        CDN_ASSETS.map(async (url) => {
          try {
            const response = await fetch(url, { mode: 'no-cors', cache: 'reload' });
            await cache.put(url, response);
          } catch (err) {
            // Se reintentará en el siguiente "fetch" normal si hace falta.
            console.warn('[sw] no se pudo precachear', url, err);
          }
        })
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  // Solo interceptamos peticiones GET (POST/PUT, etc. van directas a la red).
  if (request.method !== 'GET') return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;

      try {
        const network = await fetch(request);
        // Guardamos una copia para la próxima vez que falte conexión.
        cache.put(request, network.clone());
        return network;
      } catch (err) {
        // Sin red y sin nada en caché: si es una navegación (el usuario
        // abriendo la app), al menos devolvemos el index.html cacheado.
        if (request.mode === 'navigate') {
          const fallback = await cache.match('./index.html');
          if (fallback) return fallback;
        }
        throw err;
      }
    })()
  );
});
