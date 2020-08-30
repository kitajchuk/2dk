/*******************************************************************************
* 2dk Dev Notes
********************************************************************************

* Update LOZ start-screen map to be new 64x44 tilesize (keep painted)
* Render foreground textures to background if BEHIND Hero



* Wandering NPCs can get locked in corners (collision problems...)
* Can we use physics for throw rather than a canned tween?
* Canvas FX layer (blast, smash, sparks, smoke, etc...?)



* Procedural map paint with cellauto JS.



********************************************************************************
* Studio Software
********************************************************************************

* Add Spritesheet uploader
* Bullet-proof uploads with progress, bulk uploads?

* History states for painting (undo/redo)
* Make EditorUtils Promise-based...like clutch core files module.
* Map Spawn (x, y, dir)
* Map Events (coords, type, map, dir, spawn?)
* Map Heroes / Hero
* Map NPCs (background?, foreground?)
* Map Active Tiles (background)
* Map FX maker?
* Map Hero companion?
* Game Sprite Editor...



********************************************************************************
* NPCs (Sprites)
********************************************************************************

* Butterflies
* Perception box
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
* Diagonal wall move physics. A left-down wall moves Hero left down.
* Bounce physics so Hero does not get tile collision locked.
* Knockbacks Hero_Slide(free) and Hero_Hit(paused).
* Object interaction hints (A Open, A Check, etc...)



********************************************************************************
********************************************************************************
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
*******************************************************************************/
// Load CSS
import "../sass/2dk.scss";



// Load JS
import Player from "./lib/Player";
import cache from "../../properjs/js/core/cache";



// App Class
class App {
    constructor () {
        this.gameId = window.location.pathname.replace( /^\/|\/$/g, "" ).split( "/" ).pop();
        this.worker = `/games/${this.gameId}/worker.js`;
        this.scope = `/games/${this.gameId}/`;
        this.session = cache.get( "session" );

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
