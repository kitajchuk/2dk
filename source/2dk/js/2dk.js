/*******************************************************************************
* 2dk Dev Notes
********************************************************************************
* Studio Software
********************************************************************************


* Map models...
* Map Active Tiles (group, layer, coords, offsetX, offsetY, stepsX?, action?, attack?)
* Map Spawnpoints (x, y, dir)
* Map Ojbects, Sprites & NPCs (id, ai, spawn, payload)
* Map CellAuto registration UI
* Map Events (coords, type, map, dir, spawn?)
* Map FX Maker
* Map NPC Maker
* Map Hero Maker (companion?)
* Quest status system
* Refactor dialogue(s) system for quest status


* Resolution rendering
* External storage
* Engine upgrades
* Software upgrades
* Distribution
* Software player (...debugger)
* Code docs (framework?)
* Code unit tests (framework?)


* Map collider should be dynamic (precision: 4)
* Uploads with progress, bulk uploads?
* History states for painting (undo/redo)



********************************************************************************
* Network Online
********************************************************************************
** Multiplayer online
    * Websocket server deploys (Clutch AWS)
    * Lambda (Port Netlify functions to AWS Lambda)
    * JWT token in-memory client storage (fully private?)
* Versioned game package tar balls (releases)
    * Requires a difference between saves / releases
    * Implement "Package Release" button to create tar ball



********************************************************************************
* NPCs (Sprites)
********************************************************************************

* Butterflies / Bugs
* Perception box (aggro-ranges)
* Projectiles (with FX)
* Enemy AIs (Baddies)



********************************************************************************
* Hero
********************************************************************************
* Hero weapon animations / collisions (sword...?)
* Tile interactions (fall, etc...)
* Hero sprite masking?
* Grass sprite cycle / sound
* Water sprite cycle / sound
* Sword sprite cycle / sound / collision
* Attacking & Weapons
* Charged Hero + Release Attack
* Move resistance (pushing, tiles, etc...)
* Object interaction hints (A Open, A Check, etc...)



********************************************************************************
* Thoughts Bank:
* Random thoughts we want to keep track of...for now...
********************************************************************************
* Use Zelda 1 map with our ALTTP modified tileset
    * 16x11 for one screen
    * 32x22 for four screens (2x2 screens)
    * 64x44 for sixteen screens (4x4 screens)
* HUD / Menus / Items (attached to buttons...?)
* GameCycle manager for states (intro, title, credits, etc...)
* Render foreground textures to background if BEHIND Hero
*******************************************************************************/
// Load CSS
import "../sass/2dk.scss";



// Load JS
import Player from "./lib/Player";



// App Class
class App {
    constructor () {
        this.gameId = window.location.pathname.replace( /^\/|\/$/g, "" ).split( "/" ).pop();
        this.worker = `/games/${this.gameId}/worker.js`;
        this.scope = `/games/${this.gameId}/`;

        if ( "serviceWorker" in navigator ) {
            // navigator.serviceWorker.register( this.worker, {scope: this.scope} ).then(( register ) => {
            //     if ( register.installing ) {
            //         console.log( "[2dk] Service worker installing." );
            //
            //     } else if ( register.waiting ) {
            //         console.log( "[2dk] Service worker installed." );
            //
            //     } else if ( register.active ) {
            //         console.log( "[2dk] Service worker active!" );
            //     }
            //
            // }).catch(( error ) => {
            //     console.log( "[2dk] Service worker failed", error );
            // });

            // Keeping service workers off during GameBox development...
            // navigator.serviceWorker.getRegistrations().then(( registrations ) => {
            //     registrations.forEach(( registration ) => {
            //         registration.unregister().then(( bool ) => {
            //             console.log( "Unregistered Service Worker", bool );
            //         });
            //     });
            // });
        }

        window.onload = () => {
            this.player = new Player();
            this.player.load();
        };
    }
}



// App Instace
window.app = new App();



// App Export
export default window.app;
