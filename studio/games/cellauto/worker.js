const CACHE_NAME = "v50";
const CACHE_KEEP = [CACHE_NAME];
const CACHE_URLS = [
    "/games/cellauto/game.json",
    "/games/cellauto/assets/tiles/tiles.png",
    "/games/cellauto/assets/tiles/inside.png",
    "/games/cellauto/assets/sprites/npcs.png",
    "/games/cellauto/assets/sprites/hero_la.png",
    "/games/cellauto/assets/sprites/hero_alttp.png",
    "/games/cellauto/assets/sprites/fx.png",
    "/games/cellauto/assets/sounds/sfx-throw.mp3",
    "/games/cellauto/assets/sounds/sfx-smash.mp3",
    "/games/cellauto/assets/sounds/sfx-pick-up.mp3",
    "/games/cellauto/assets/sounds/sfx-jump.mp3",
    "/games/cellauto/assets/sounds/sfx-dropping.mp3",
    "/games/cellauto/assets/sounds/sfx-chest-unlock.mp3",
    "/games/cellauto/assets/sounds/sfx-bounce.mp3",
    "/games/cellauto/assets/sounds/bgm-shop.mp3",
    "/games/cellauto/assets/sounds/bgm-phone-booth.mp3",
    "/games/cellauto/assets/sounds/bgm-overworld.mp3",
    "/games/cellauto/assets/sounds/bgm-mysterious-forest.mp3",
    "/games/cellauto/assets/sounds/bgm-marins-house.mp3",
    "/games/cellauto/assets/sounds/bgm-mabe-village.mp3",
    "/games/cellauto/assets/sounds/bgm-house.mp3",
    "/games/cellauto/assets/sounds/bgm-cave.mp3",
    "/games/cellauto/maps/world-1-2.json",
    "/games/cellauto/maps/world-1-1.json",
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
