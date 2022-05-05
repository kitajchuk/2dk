// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
const CACHE_NAME = "v286";
const CACHE_URLS = [
    "game.json",
    "assets/tiles/tiles.png",
    "assets/tiles/inside.png",
    "assets/sprites/npcs.png",
    "assets/sprites/hero_la.png",
    "assets/sprites/hero_alttp.png",
    "assets/sprites/fx.png",
    "assets/sounds/sfx-throw.mp3",
    "assets/sounds/sfx-smash.mp3",
    "assets/sounds/sfx-pick-up.mp3",
    "assets/sounds/sfx-jump.mp3",
    "assets/sounds/sfx-dropping.mp3",
    "assets/sounds/sfx-chest-unlock.mp3",
    "assets/sounds/sfx-bounce.mp3",
    "assets/sounds/bgm-shop.mp3",
    "assets/sounds/bgm-phone-booth.mp3",
    "assets/sounds/bgm-overworld.mp3",
    "assets/sounds/bgm-mysterious-forest.mp3",
    "assets/sounds/bgm-marins-house.mp3",
    "assets/sounds/bgm-mabe-village.mp3",
    "assets/sounds/bgm-house.mp3",
    "assets/sounds/bgm-cave.mp3",
    "maps/ukuku-prairie-west.json",
    "maps/papahls-house.json",
    "maps/mysterious-forest.json",
    "maps/marins-house.json",
    "maps/mabe-village.json",
    "maps/bottom-of-the-well.json",
];



const addResourcesToCache = async ( resources ) => {
    const cache = await caches.open( CACHE_NAME );
    await cache.addAll( resources );
};

const putInCache = async ( request, response ) => {
    const cache = await caches.open( CACHE_NAME );
    await cache.put( request, response );
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match( request );
    if ( responseFromCache ) {
        return responseFromCache;
    }

    // Next try to use (and cache) the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if ( preloadResponse ) {
        console.info( "using preload response", preloadResponse );
        putInCache( request, preloadResponse.clone() );
        return preloadResponse;
    }
  
    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch( request );
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        putInCache( request, responseFromNetwork.clone() );
        return responseFromNetwork;
    } catch ( error ) {
        const fallbackResponse = await caches.match( fallbackUrl );
        if ( fallbackResponse ) {
            return fallbackResponse;
        }
        // when even the fallback response is not available,
        // there is nothing we can do, but we must always
        // return a Response object
        return new Response( "Network error happened", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
        });
    }
};

// Enable navigation preload
const enableNavigationPreload = async () => {
    if ( self.registration.navigationPreload ) {
        // Enable navigation preloads!
        await self.registration.navigationPreload.enable();
    }
};

const deleteCache = async key => {
    await caches.delete( key );
};

const getScope = () => {
    return location.pathname.replace( "sw.js", "" );
};

const deleteOldCaches = async () => {
    const cacheKeepList = [CACHE_NAME];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter( key => !cacheKeepList.includes( key ) );
    await Promise.all( cachesToDelete.map( deleteCache ) );
};

self.addEventListener( "install", ( event ) => {
    event.waitUntil( addResourcesToCache( CACHE_URLS ) );
});

self.addEventListener( "activate", ( event ) => {
    event.waitUntil( deleteOldCaches() );
    event.waitUntil( enableNavigationPreload() );
});

self.addEventListener( "fetch", ( event ) => {
    event.respondWith(
        cacheFirst({
            request: event.request,
            preloadResponsePromise: event.preloadResponse,
            fallbackUrl: "icon.png",
        })
    );
});
