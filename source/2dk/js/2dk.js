/*******************************************************************************
* 2dk Development Notes
********************************************************************************
TODO: Diagonal wall move physics. A left-down wall moves Hero left down.
TODO: Bounce physics so Hero does not get tile collision locked.
TODO: Knockbacks Hero_Slide(free) and Hero_Hit(paused).
TODO: Port studio Editor to renderer-editor.

IDEA: NPC hypothesis is that NPCs will work now that positions are absolute!
IDEA: Use Artificial General Intelligence for NPC base class.
IDEA: Procedural map paint with cellauto JS.


********************************************************************************
* Studio
********************************************************************************
* History states for painting
* Export map PNGs
* Hero sprite pins (sets map.spawn(x, y))


********************************************************************************
* Player
* https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API/Using_Service_Workers
* https://developers.google.com/web/fundamentals/primers/service-workers
********************************************************************************
* Pack JSON for smaller file size...
* Audio performance on mobile...

* GameBox order of operations for press/release events!
* Package versioning for index.html
* Client caching with Loader
* Load by type with Loader (may improve audio on mobile?)
* Attacking & Weapons
* Enemy AIs (Baddies)
* Grab > Push/Pull for VERBS
* Charged Hero + Release Attack
* Collider events?
* Move resistance (pushing, tiles, etc...)


********************************************************************************
* Events
********************************************************************************
* NOUN system for events
* NOUNS: DOOR, BOUNDARY, CUTSCENE, LOADSCREEN?, INTRO?, OUTRO?


********************************************************************************
* Dialogues
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
* VERBS: Face, Walk, Push, Open, Pull, Lift, Toss... Read, Hit?

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
********************************************************************************
*******************************************************************************/
// Load CSS
require( "../sass/2dk.scss" );



// Load JS
import { Player } from "./lib/index";



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
