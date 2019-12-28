// Load the SASS
require( "../sass/2dk.scss" );



// Load the JS
import { Loader, Player, Hero, Map } from "./lib/index";



/*******************************************************************************
* 2dk Development Notes
********************************************************************************
HACK: 2D-game maker needs hacking:
      Collision layer (x, y, width, height) 4x4? debug?
      Pipeline to Save / Load game packages HERE from builder
      Sprite builder...
      Objects layer (tile interactions)...
      Snapshot PNG of map render

TODO: Diagonal wall move physics. A left-down wall moves Hero left down.
TODO: Bounce physics so Hero does not get tile collision locked.
TODO: Knockbacks Hero_Slide(free) and Hero_Hit(paused).
TODO: 8-point touch D-Pad for diagonal movement.

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
* Map Objects (animated tiles, colliders, state shifting, sprite OR tileset)
********************************************************************************
(
    ...Sprite:  data: id, name, width, height, image(sprite/tileset), spawn(x, y), boxes(hit, collision)
    collider?:  0, 1
    states:     [(background-position, repeat?, animated?, steps[background-position...], timing, sound, conditions?)]
    active?:    0, 1
    position:   (x, y)
    layer:      fg/bg
)


********************************************************************************
* Map Sound (crossfade, dim on pause)
********************************************************************************


********************************************************************************
********************************************************************************
*******************************************************************************/
class App {
    constructor () {
        this.loader = new Loader();
        this.loader.loadJson( "/webapp/la/game.json" ).then(( json ) => {
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
