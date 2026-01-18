// https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
const CACHE_NAME = "v807";
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
    "assets/tiles/inside.png",
    "assets/tiles/tiles.png",
    "assets/sprites/fx.png",
    "assets/sprites/hero_la.png",
    "assets/sprites/items.png",
    "assets/sprites/npcs.png",
    "assets/sounds/bgm-cave.mp3",
    "assets/sounds/bgm-house.mp3",
    "assets/sounds/bgm-interior-theme.mp3",
    "assets/sounds/bgm-intro-theme.mp3",
    "assets/sounds/bgm-mabe-village.mp3",
    "assets/sounds/bgm-marins-house.mp3",
    "assets/sounds/bgm-mysterious-forest.mp3",
    "assets/sounds/bgm-overworld.mp3",
    "assets/sounds/bgm-phone-booth.mp3",
    "assets/sounds/bgm-shop.mp3",
    "assets/sounds/bgm-world-theme.mp3",
    "assets/sounds/sfx-bounce.mp3",
    "assets/sounds/sfx-chest-unlock.mp3",
    "assets/sounds/sfx-death.mp3",
    "assets/sounds/sfx-dropping.mp3",
    "assets/sounds/sfx-heart.mp3",
    "assets/sounds/sfx-item-get.mp3",
    "assets/sounds/sfx-jump.mp3",
    "assets/sounds/sfx-move-object.mp3",
    "assets/sounds/sfx-pick-up.mp3",
    "assets/sounds/sfx-rupee.mp3",
    "assets/sounds/sfx-smash.mp3",
    "assets/sounds/sfx-sword.mp3",
    "assets/sounds/sfx-throw.mp3",
    "assets/scenes/logo.png",
    "maps/beneath-the-grave.json",
    "maps/beneath-the-moblin-hideout.json",
    "maps/beneath-the-rooster.json",
    "maps/graveyard-residence.json",
    "maps/lost-corner-of-the-world.json",
    "maps/master-shinjis-house.json",
    "maps/tunnel-crypt.json",
    "maps/under-the-plateau.json",
    "maps/untended-graveyard.json",
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
