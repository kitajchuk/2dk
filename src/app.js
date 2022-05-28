import Player from "./lib/Player";
import Config from "./lib/Config";
import Utils from "./lib/Utils";



// 2dk entry point
// A 2dk game is a pure static web bundle
// The Player can just load "game.json" to get started
class App {
    constructor () {
        // When playing from `file:` protocol within electron we need to clean the pathname
        this.scope = window.location.pathname.replace( /index\.html$/, "" );
        this.config = { scope: this.scope };
        this.worker = `${this.scope}sw.js`;

        window.onload = () => {
            this.player = new Player();
            this.player.load();
            this.register();
            this.bind();
        };
    }

    bind () {
        this.player.on( Config.broadcast.MAPEVENT, ( event ) => {
            Utils.log(
                Config.broadcast.MAPEVENT,
                event
            );
        });
    }

    register () {
        if ( Utils.dev() ) {
            Utils.log( "[2dk] Skip service worker for studio dev demo!" );
            return;
        }

        if ( "serviceWorker" in navigator ) {
            navigator.serviceWorker.register( this.worker, this.config ).then(( registration ) => {
                if ( registration.installing ) {
                    Utils.log( "[2dk] Service worker installing." );

                } else if ( registration.waiting ) {
                    Utils.log( "[2dk] Service worker installed." );

                } else if ( registration.active ) {
                    Utils.log( "[2dk] Service worker active!" );
                }

            }).catch(( error ) => {
                Utils.error( `[2dk] Service worker failed with ${error}` );
            });
        } else {
            Utils.log( "[2dk] Service workers not available!" );
        }
    }

    deregister () {
        // This is how you can deregister the service worker...
        navigator.serviceWorker.getRegistrations().then(( registrations ) => {
            registrations.forEach(( registration ) => {
                registration.unregister().then(( bool ) => {
                    Utils.log( "[2dk] Unregistered Service Worker", bool );
                });
            });
        });
    }
}



// App Instace
window.app2dk = new App();



// App Export
export default window.app;
