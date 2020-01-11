/*******************************************************************************
* 2dk Dev Notes
********************************************************************************

* Cache canvas with Loader.cash( id, thing )?


********************************************************************************
* Studio Maker
********************************************************************************
* History states for painting
* Hero Pins (sets map.spawn(x, y))
* Map Objects (background, foreground)
* Active Tiles (background, foreground)


********************************************************************************
* Map Events
********************************************************************************
* NOUN system for events
* NOUNS: DOOR, BOUNDARY, CUTSCENE


********************************************************************************
* Game Dialogues
********************************************************************************
* Screen dialogues, Array of dialogue objects
* Plain text dialogues advance with A
* Response-based prompt dialogues with A: yes, B: no


********************************************************************************
* Map Tiles (animated?, canvas, render to layer (bg, fg), tileset, groups)
********************************************************************************
* Saves Array of tile Objects
* Adhere to map resolution scaling
* Render to either background or foreground

* NOUN system for Hero
* NOUNS: GRASS, WATER, STAIRS, LEDGE(jump...?), SWITCH(actions...?), QUICK-SAND?

* Interaction tiles like cutting grass and plants or picking up rocks or plants
* Event tiles for doors, locatin switching etc...
* Animated flower tiles
* Animated water tiles

* Only Render visible tiles....?
* Would require true Camera logic.


********************************************************************************
* Map Objects, Sprites (colliders, state shifting, sprite/tileset)
********************************************************************************
(
    ...Sprite:  data: id, name, width, height, image(sprite/tileset), spawn(x, y), boxes(hit)
    layer?:     fg/bg
    scale:      1, 2
    states:     [(
                    background-position,
                    repeat?,
                    animated?,
                    action?(verb, require, payload, counter),
                    offsetX,
                    offsetY,
                    stepsX,
                    dur,
                    sound
                )]
)

* VERB system for Hero Actions and Object(NPC) Reactions
* VERBS: Face, Walk, Push, Open, Pull, Lift, Toss, Grab

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

* HOW to handle NPCs with new Camera and Hero GameBox setup...?
* 


********************************************************************************
********************************************************************************
********************************************************************************
* Thoughts Bank:
* Random thoughts we want to keep track of...for now...
********************************************************************************
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
            navigator.serviceWorker.getRegistrations().then(( registrations ) => {
                registrations.forEach(( registration ) => {
                    registration.unregister().then(( bool ) => {
                        console.log( "Unregistered Service Worker", bool );
                    });
                });
            });
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
