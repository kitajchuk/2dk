import Utils from "./Utils";



class GameWorker {
    constructor ( player ) {
        this.player = player;

        // When playing from `file:` protocol within electron we need to clean the pathname
        this.scope = window.location.pathname.replace( /index\.html$/, "" );
        this.config = { scope: this.scope };
        this.worker = `${this.scope}sw.js`;
    }

    // Handle service worker update
    // https://whatwebcando.today/articles/handling-service-worker-updates/
    update ( registration ) {
        this.player.splashUpdate.classList.add( "has-update" );
        this.player.splashUpdate.addEventListener( "click", () => {
            if ( registration.waiting ) {
                // let waiting Service Worker know it should became active
                registration.waiting.postMessage( "SKIP_WAITING" );
            }
        });
    }

    register () {
        if ( Utils.dev() ) {
            Utils.log( "[2dk] Skip service worker for studio dev demo!" );
            return;
        }

        // check if the browser supports serviceWorker at all
        if ( "serviceWorker" in navigator ) {
            // register the service worker from the file specified
            navigator.serviceWorker.register( this.worker, this.config ).then( ( registration ) => {
                // ensure the case when the updatefound event was missed is also handled
                // by re-invoking the prompt when there's a waiting Service Worker
                if ( registration.waiting ) {
                    Utils.log( "[2dk] Service worker installed." );
                    this.update( registration );
                }

                // detect Service Worker update available and wait for it to become installed
                registration.addEventListener( "updatefound", () => {
                    if ( registration.installing ) {
                        // wait until the new Service worker is actually installed (ready to take over)
                        registration.installing.addEventListener( "statechange", () => {
                            if ( registration.waiting ) {
                                // if there's an existing controller (previous Service Worker), show the prompt
                                if ( navigator.serviceWorker.controller ) {
                                    this.update( registration );
                                } else {
                                    // otherwise it's the first install, nothing to do
                                    Utils.log( "[2dk] Service worker initialized for the first time" );
                                }
                            }
                        })
                    }
                })

                let refreshing = false;

                // detect controller change and refresh the page
                navigator.serviceWorker.addEventListener( "controllerchange", () => {
                    if ( !refreshing ) {
                        window.location.reload();
                        refreshing = true;
                    }
                });

            }).catch( ( error ) => {
                Utils.error( `[2dk] Service worker failed with ${error}` );
            });
        } else {
            Utils.log( "[2dk] Service workers not available!" );
        }
    }

    deregister () {
        // This is how you can deregister the service worker...
        navigator.serviceWorker.getRegistrations().then( ( registrations ) => {
            registrations.forEach( ( registration ) => {
                registration.unregister().then( ( bool ) => {
                    Utils.log( "[2dk] Unregistered Service Worker", bool );
                });
            });
        });
    }
}



export default GameWorker;