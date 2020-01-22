/*******************************************************************************
* 2dk Dev Notes
********************************************************************************



* Bug: hero walk cycle can get locked (switch map with activeTile lifed...)
* Fix lift walk cycling for canvas hero (including sprite design)
* Try having only a single MapLayer(onCanvas, offCanvas...)



* Grass sprite cycle / sound
* Water sprite cycle / sound
* Sword sprite cycle / sound / collision
* Canvas FX layer (blast, smash, sparks, smoke, etc...?)
* Z-Axis for sprite position (x, y, z) / use for collision checks...
* Better system for Array.prototype.find within map loops...?
* Visually center the Hero on the screen (currently centering top left corner)
* Door events for entering and exiting interiors




********************************************************************************
* Studio Software
********************************************************************************
* History states for painting
* Hero Pins (sets map.spawn(x, y))
* Active Objects (background, foreground)
* Active Tiles (background, foreground)
* Upload icon PNG when creating a new game
* Sync games to ../static when maps are saved?
* Map spawn points (x, y, dir)
* Map event points (coords, type, map, dir)
* Erase one tile cel at a time?


********************************************************************************
* Active Tiles (animated?, canvas, render to layer (bg, fg), tileset, groups)
********************************************************************************
* NOUN system for Hero
* NOUNS: HOLE, GRASS, WATER, LEDGE, STAIRS, SWITCH

* action & attack properties

* Interaction tiles like cutting grass and plants
* Event tiles for doors, locatin switching etc...

* Handle active tile collision (uses the NOUN system for FX)

* Interact with tiles using weapon (sword)


********************************************************************************
* Active Objects (colliders, state shifting, sprite/tileset)
********************************************************************************
* States that can shift with interaction
* Colliders
* Relative render between background/foreground compared to Hero


********************************************************************************
* VERBS
********************************************************************************
* VERB system for Hero Actions and Object(NPC) Reactions
* VERBS: PUSH, PULL, GRAB, MOVE, LIFT, OPEN, WALK, FACE, TOSS, CUT

* Interactions like pushing pots, picking up rocks etc...


********************************************************************************
* NPCs (Sprites)
********************************************************************************
* Object(NPC) looks at Hero conditions (dir, act, etc...) to determine payload
* Object(NPC) notifys Hero when an action meets conditions for a payload
* Hero can perform a reciprical action (sprite cycle?, animation?) in return

* Companion NPC
* Try Navi the fairy as a test-run, or bow-wow, or Dark Link!

* Butterflies, Cucco's

* Object interaction hints (A Open, A Check, etc...)

* NPCs look at collision layer, object layer colliders, and Hero colliders
* Hero looks at collision layer and NPC colliders
* Sprites can have a perception box to activate a little before entering screen


********************************************************************************
* Map Events
********************************************************************************
* NOUN system for events
* NOUNS: DOOR, WARP, BOUNDARY, CUTSCENE


********************************************************************************
* Game Dialogues
********************************************************************************
* Screen dialogues, Array of dialogue objects
* Plain text dialogues advance with A
* Response-based prompt dialogues with A: yes, B: no


********************************************************************************
********************************************************************************
********************************************************************************
* Thoughts Bank:
* Random thoughts we want to keep track of...for now...
********************************************************************************
* ALTTP Sprite scale: 2.1875

* Make Editor Utils Promise-based... like clutch core files module
* Use game icon for mobile installed

* Exclude audio on mobile...?
* Document code...(jsdoc?

* GameCycle manager for states (intro, title, credits, etc...)
* Projectiles, FX in general
* Math functions (arc animations?, see Akihabara Trigo)

* Attacking & Weapons
* Enemy AIs (Baddies)
* Charged Hero + Release Attack
* Collider events?
* Move resistance (pushing, tiles, etc...)

* LOADSCREEN?, INTRO?, OUTRO?
* Diagonal wall move physics. A left-down wall moves Hero left down.
* Bounce physics so Hero does not get tile collision locked.
* Knockbacks Hero_Slide(free) and Hero_Hit(paused).
* Use Artificial General Intelligence for NPC base class.
* Procedural map paint with cellauto JS.
*******************************************************************************/
// Load CSS
require( "../sass/2dk.scss" );



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
