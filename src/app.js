import Player from "./lib/Player";



// 2dk entry point
// A 2dk game is a pure static web bundle
// The Player can just load "game.json" to get started
class App {
    constructor () {
        this.scope = window.location.pathname;
        this.config = { scope: this.scope };
        this.worker = `${this.scope}sw.js`;

        window.onload = () => {
            this.register();
            this.player = new Player();
            this.player.load();
        };
    }

    register () {
        if ( "serviceWorker" in navigator ) {
            navigator.serviceWorker.register( this.worker, this.config ).then(( registration ) => {
                if ( registration.installing ) {
                    console.log( "[2dk] Service worker installing." );

                } else if ( registration.waiting ) {
                    console.log( "[2dk] Service worker installed." );

                } else if ( registration.active ) {
                    console.log( "[2dk] Service worker active!" );
                }

            }).catch(( error ) => {
                console.error( `[2dk] Service worker failed with ${error}` );
            });
        } else {
            console.log( "[2dk] Service workers not available!" );
        }
    }

    deregister () {
        // This is how you can deregister the service worker...
        navigator.serviceWorker.getRegistrations().then(( registrations ) => {
            registrations.forEach(( registration ) => {
                registration.unregister().then(( bool ) => {
                    console.log( "[2dk] Unregistered Service Worker", bool );
                });
            });
        });
    }
}



// App Instace
window.app2dk = new App();



// App Export
export default window.app;
