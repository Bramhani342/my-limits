// ============================================================
// MY LIMITS - SERVICE WORKER
// ============================================================
//
// Development-safe PWA service worker.
//
// During Vite development, files such as:
//
// /@vite/client
// /src/main.js
// /src/style.css
//
// are served dynamically by Vite.
//
// We therefore use NETWORK FIRST and only fall back to
// cache when the network is unavailable.
//
// ============================================================

const CACHE_NAME = "my-limits-v1";


// ============================================================
// INSTALL
// ============================================================

self.addEventListener(
    "install",
    event => {

        console.log(
            "📦 My Limits service worker installing..."
        );


        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(
                    cache => {

                        return cache.addAll([
                            "/",
                            "/index.html",
                            "/manifest.webmanifest"
                        ]);

                    }
                )

        );


        self.skipWaiting();

    }
);


// ============================================================
// ACTIVATE
// ============================================================

self.addEventListener(
    "activate",
    event => {

        console.log(
            "⚡ My Limits service worker activated."
        );


        event.waitUntil(

            caches
                .keys()
                .then(
                    cacheNames => {

                        return Promise.all(

                            cacheNames
                                .filter(
                                    cacheName =>
                                        cacheName !==
                                        CACHE_NAME
                                )
                                .map(
                                    cacheName =>
                                        caches.delete(
                                            cacheName
                                        )
                                )

                        );

                    }
                )

        );


        self.clients.claim();

    }
);


// ============================================================
// FETCH
// ============================================================

self.addEventListener(
    "fetch",
    event => {

        const request =
            event.request;


        // ----------------------------------------------------
        // Only handle GET requests.
        // ----------------------------------------------------

        if (
            request.method !== "GET"
        ) {

            return;

        }


        event.respondWith(

            fetch(request)

                .then(
                    response => {

                        // ------------------------------------
                        // Don't cache bad responses.
                        // ------------------------------------

                        if (
                            !response ||
                            !response.ok
                        ) {

                            return response;

                        }


                        // ------------------------------------
                        // Save a copy for offline use.
                        // ------------------------------------

                        const responseClone =
                            response.clone();


                        caches
                            .open(
                                CACHE_NAME
                            )
                            .then(
                                cache => {

                                    cache.put(
                                        request,
                                        responseClone
                                    );

                                }
                            )
                            .catch(
                                error => {

                                    console.warn(
                                        "Cache update failed:",
                                        error
                                    );

                                }
                            );


                        return response;

                    }
                )

                .catch(
                    async () => {

                        // ------------------------------------
                        // Network unavailable.
                        // Try cached version.
                        // ------------------------------------

                        const cachedResponse =
                            await caches.match(
                                request
                            );


                        if (
                            cachedResponse
                        ) {

                            return cachedResponse;

                        }


                        // ------------------------------------
                        // IMPORTANT:
                        //
                        // Always return a valid Response.
                        //
                        // Never return undefined here.
                        // ------------------------------------

                        return new Response(
                            "Offline - this page is not available yet.",
                            {
                                status: 503,
                                statusText:
                                    "Service Unavailable",
                                headers: {
                                    "Content-Type":
                                        "text/plain"
                                }
                            }
                        );

                    }
                )

        );

    }
);