const CACHE_NAME = "v216";
const CACHE_KEEP = [CACHE_NAME];
const CACHE_URLS = [
    "/games/la/game.json",
    "/games/la/assets/tiles/tiles.png",
    "/games/la/assets/sprites/smoke.png",
    "/games/la/assets/sprites/hero_la.png",
    "/games/la/assets/sprites/hero_alttp.png",
    "/games/la/assets/sounds/16-mysterious-forest.mp3",
    "/games/la/assets/sounds/11-mabe-village.mp3",
    "/games/la/assets/sounds/10-overworld.mp3",
    "/games/la/maps/ukuku-prairie-west.json",
    "/games/la/maps/mysterious-forest.json",
    "/games/la/maps/mabe-village.json",
];



// Using the client-js to preload the asset bundle so this is redundant?
self.addEventListener( "install", ( event ) => {
    event.waitUntil(
        caches.open( CACHE_NAME ).then(( cache ) => {
            return cache.addAll( CACHE_URLS );
        })
    );
});



self.addEventListener( "activate", ( event ) => {
    event.waitUntil(
        caches.keys().then(( keyList ) => {
            return Promise.all(keyList.map(( key ) => {
                if ( CACHE_KEEP.indexOf( key ) === -1 ) {
                    return caches.delete( key );
                }
            }));
        })
    );
});



self.addEventListener( "fetch", ( event ) => {
    event.respondWith(
        caches.match( event.request ).then(( response ) => {
            // Cache hit - return response
            if ( response ) {
                return response;
            }

            return fetch( event.request ).then(( response ) => {
                // Check if we received a valid response
                if( !response || response.status !== 200 || response.type !== "basic" ) {
                    return response;
                }

                // IMPORTANT: Clone the response. A response is a stream
                // and because we want the browser to consume the response
                // as well as the cache consuming the response, we need
                // to clone it so we have two streams.
                const responseClone = response.clone();

                caches.open( CACHE_NAME ).then(( cache ) => {
                    cache.put( event.request, responseClone );
                });

                return response;
            });
        })
    );
});
