// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
const CACHE_NAME = "v131";
const CACHE_URLS = [
    "",
    "index.html",
    "game.json",
    "2dk.css",
    "app.js",
    "favicon.ico",
    "manifest.json",
    "icon.png",
    "icon192.png",
    "icon384.png",
    "icon512.png",
    "icon1024.png",
    "assets/tiles/pk-indoor.png",
    "assets/tiles/pk-tiles.png",
    "assets/sprites/ash-hero.png",
    "assets/sprites/npc.png",
    "assets/sounds/bgm-pallet-town.mp3",
    "assets/sounds/bgm-route-1-2-underground-path.mp3",
    "maps/pallet-town-and-route-1.json",
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

const deleteCache = async ( key ) => {
    await caches.delete( key );
};

const getScope = () => {
    return location.pathname.replace( "sw.js", "" );
};

const getScopedUrls = () => {
    const scope = getScope();
    return CACHE_URLS.map( url => `${scope}${url}` );
};

const deleteOldCaches = async () => {
    const cacheKeepList = [CACHE_NAME];
    const keyList = await caches.keys();
    const cachesToDelete = keyList.filter( key => !cacheKeepList.includes( key ) );
    await Promise.all( cachesToDelete.map( deleteCache ) );
};

self.addEventListener( "install", ( event ) => {
    const scopedUrls = getScopedUrls();
    event.waitUntil( addResourcesToCache( scopedUrls ) );
});

self.addEventListener( "activate", ( event ) => {
    event.waitUntil( deleteOldCaches() );
    // event.waitUntil( enableNavigationPreload() );
});

self.addEventListener( "fetch", ( event ) => {
    event.respondWith(
        cacheFirst({
            request: event.request,
            // preloadResponsePromise: event.preloadResponse,
            fallbackUrl: `${getScope()}icon.png`,
        })
    );
});

// Handle service worker updates
// https://whatwebcando.today/articles/handling-service-worker-updates/
self.addEventListener( "message", ( event ) => {
    if ( event.data === "SKIP_WAITING" ) {
        self.skipWaiting();
    }
});
