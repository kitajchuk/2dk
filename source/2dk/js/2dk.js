// Load the SASS
require( "../sass/2dk.scss" );



// Load the JS
import { Loader, Player, Hero, Map } from "./lib/index";
const paramalama = require( "paramalama" );



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
* Studio editor
********************************************************************************
* Studio app icon
* Game icons and tile view (default icon)
* Maps tile view (thumbnail PNGs for savemap, default map placeholder)
* Export map PNG
* Canvas resolution zoom in/out
* History states for painting
* Refined icon set...


********************************************************************************
* Collision (1/8 grid, in-memory, read-only)
********************************************************************************
* Saves Array of collision Objects
* Adhere to map resolution scaling


********************************************************************************
* Tiles (animated?, canvas, render to layer (bg, fg), tileset, groups)
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

* CSS shadow rather than pixel-art shadow...


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
