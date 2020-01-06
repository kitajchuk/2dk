const CACHE_NAME = "{__CACHE_VERSION__}";
const CACHE_KEEP = [CACHE_NAME];
const CACHE_URLS = [
    // "/css/2dk.css",
    // "/js/2dk.js",
    // "/fonts/Calamity-Bold.woff",
    // "/fonts/Calamity-Bold.woff2",
    {__CACHE_LIST__}
];



// Using the client-js to preload the asset bundle so this would be redundant...
// self.addEventListener( "install", ( event ) => {
//     event.waitUntil(
//         caches.open( CACHE_NAME ).then(( cache ) => {
//             return cache.addAll( CACHE_URLS );
//         })
//     );
// });



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
