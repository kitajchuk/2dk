// Load the SASS
require( "../sass/2dk.scss" );



// Load the JS
import { Loader, Player, Hero, Map } from "./lib/index";
const paramalama = require( "paramalama" );



/*******************************************************************************
* 2dk Development Notes
********************************************************************************
HACK: 2D-game maker needs hacking:
      Collision layer (x, y, width, height) 4x4? debug?
      Pipeline to game data: needs to be in static for webapp to work remote...?
      Sprite builder...
      Objects layer (tile interactions)...
      Refactor event bindings with Hobo

TODO: Diagonal wall move physics. A left-down wall moves Hero left down.
TODO: Bounce physics so Hero does not get tile collision locked.
TODO: Knockbacks Hero_Slide(free) and Hero_Hit(paused).

IDEA: Blit animation engine for game render, 24 FPS, 1.333333333px/frame.
IDEA: NPC hypothesis is that NPCs will work now that positions are absolute!

NOTE: Use Artificial General Intelligence for NPC base class.

********************************************************************************
* Collision (1/8 grid, in-memory, read-only)
********************************************************************************
* Small canvas tile painter UI
* Saves Array of collision-tile Objects
* Adhere to map resolution scaling


********************************************************************************
* Tiles (animated?, canvas, render to layer (bg, fg), tileset, groups)
********************************************************************************
* Paint tile groups UI
* Saves Array of tile Objects
* Adhere to map resolution scaling
* Render to either background or foreground
* NOUN system for Hero
* NOUNS: GRASS, WATER, STAIRS, LEDGE, QUICK-SAND?


********************************************************************************
* Map Objects (colliders, state shifting, sprite OR tileset)
********************************************************************************
(
    ...Sprite:  data: id, name, width, height, image(sprite/tileset), spawn(x, y), boxes(hit, collision)
    collider?:  0, 1
    states:     [(background-position, repeat?, animated?, action?(verb, response, payload), steps[background-position...], timing, sound)]
    active?:    0, 1
    position:   (x, y)
    layer?:     fg/bg
    resolution: 1, 2
)

* VERB system for Hero Actions and Object(NPC) Reactions
* VERBS: Push, Pull, Lift, Toss, Read, Open, Hit
* Object(NPC) looks at Hero conditions (dir, act, etc...) to determine response
* Object(NPC) notifys Hero when an action meets conditions for a response
* Hero can perform a reciprical action (sprite cycle?, animation?) in return

* Companion NPC
* Try Navi the fairy as a test-run, or Dark Link!

* NPCs look at collision layer, object layer colliders, and Hero colliders
* Hero looks at collision layer and NPC colliders


********************************************************************************
* Map Sound (crossfade, dim on pause)
********************************************************************************


********************************************************************************
********************************************************************************
*******************************************************************************/
class App {
    constructor () {
        this.query = paramalama( window.location.search );
        this.loader = new Loader();
        this.loader.loadJson( `/games/${this.query.game}/game.json` ).then(( json ) => {
            // Player
            this.player = new Player( json.game );

            // Hero
            this.hero = new Hero( json.hero );
            this.player.setHero( this.hero );

            // Map
            this.loader.loadJson( json.hero.spawn.map ).then(( data ) => {
                this.map = new Map( data );
                this.player.setMap( this.map );

                // START!
                this.player.start();
            });
        });
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
