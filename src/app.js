import Player from "./lib/Player";



// App Class
class App {
    constructor () {
        this.gameId = this.parseGameId();
        this.worker = `/games/${this.gameId}/worker.js`;
        this.scope = `/games/${this.gameId}/`;

        window.onload = () => {
            this.player = new Player();
            this.player.load();
            this.serviceWorker();
        };
    }

    parseGameId () {
        return window.location.pathname.replace( /^\/|\/$/g, "" ).split( "/" ).pop();
    }

    serviceWorker () {
        if ( "serviceWorker" in navigator ) {
            navigator.serviceWorker.register( this.worker, { scope: this.scope } ).then(( register ) => {
                if ( register.installing ) {
                    console.log( "[2dk] Service worker installing." );

                } else if ( register.waiting ) {
                    console.log( "[2dk] Service worker installed." );

                } else if ( register.active ) {
                    console.log( "[2dk] Service worker active!" );
                }

            }).catch(( error ) => {
                console.log( "[2dk] Service worker failed", error );
            });

            // Keeping service workers off during GameBox development...
            // navigator.serviceWorker.getRegistrations().then(( registrations ) => {
            //     registrations.forEach(( registration ) => {
            //         registration.unregister().then(( bool ) => {
            //             console.log( "[2dk] Unregistered Service Worker", bool );
            //         });
            //     });
            // });
        }
    }
}



// App Instace
window.app = new App();



// App Export
export default window.app;
