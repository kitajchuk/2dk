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
* Credits text file (tiles, sprites, sounds, etc...)
* History states for painting
* Export map PNGs
* Hero sprite pins (sets map.spawn(x, y))


********************************************************************************
* Player
********************************************************************************
* Service Workers for cache+offline? (AppCache is DEAD!)
* Async loadImg with fetch() rather than Image.onload...?
* Pack JSON for smaller file size...


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

* Event tiles for doors, locatin switching etc...
* Animated flower tiles
* Animated water tiles


********************************************************************************
* Map Objects (colliders, state shifting, sprite OR tileset)
********************************************************************************
(
    ...Sprite:  data: id, name, width, height, image(sprite/tileset), spawn(x, y), boxes(hit, collision)
    layer?:     fg/bg
    resolution: 1, 2
    states:     [(
                    background-position,
                    repeat?,
                    animated?,
                    action?(verb, require, payload, counter),
                    steps[background-position...],
                    timing,
                    sound
                )]
)

* VERB system for Hero Actions and Object(NPC) Reactions
* VERBS: Push, Open, Pull, Lift, Toss, Read, Hit

* Object(NPC) looks at Hero conditions (dir, act, etc...) to determine payload
* Object(NPC) notifys Hero when an action meets conditions for a payload
* Hero can perform a reciprical action (sprite cycle?, animation?) in return

* Companion NPC
* Try Navi the fairy as a test-run, or bow-wow, or Dark Link!

* Butterflies, Cucco's

* NPCs look at collision layer, object layer colliders, and Hero colliders
* Hero looks at collision layer and NPC colliders

* Object interaction hints (A Open, A Check, etc...)


********************************************************************************
********************************************************************************
*******************************************************************************/
// Load CSS
require( "../sass/2dk.scss" );



// Load JS
import { Loader, Player } from "./lib/index";
const paramalama = require( "paramalama" );



// App Class
class App {
    constructor () {
        this.query = paramalama( window.location.search );
        this.loader = new Loader();
        this.loader.loadUrl( `/games/${this.query.game}/game.json` ).then(( json ) => {
            this.player = new Player( json );
        });
    }
}



// App Instace
window.app = new App();



// App Export
export default window.app;
