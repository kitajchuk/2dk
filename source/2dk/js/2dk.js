// Load the SASS
require( "../sass/2dk.scss" );



// Load the JS
import { Loader, Player, Hero, Map } from "./lib/index";



////////////////////////////////////////////////////////////////////////////////
// Build Notes: ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// TODO: Sandbox development Map for ease of testing/experimenting...
// TODO: Sandbox development Hero ALTTP sprite cycle from spritesheet.
// TODO: Better boxes for hit and collision.
// TODO: Diagonal wall move physics. A left-down wall moves Hero left down.
// TODO: Bounce physics so Hero does not get tile collision locked, clip edges.
// TODO: Knockbacks Hero_Slide(free) and Hero_Hit(paused)
// TODO: Precise tile collision detection objects (x, y, width, height) 4x4?
// TODO: Debug visuals: grid, hero, hitbox, collisionbox, collision tiles.

// BUGS: KeysInterface is buggy for diagonal movement now that touch works lol.

// TEST: Blit animation engine for game render, 24 FPS, 1.333333333px/frame.
// TEST: NPC hypothesis is that NPCs will work now that positions are absolute!
// TEST: Retina canvas for map tiles. Design 64x64 and render 32x32...?
// TEST: TouchpadInterface.

// NOTE: Use top-down player state for literal on/off hardware > software.
// NOTE: Use Artificial General Interlligence for NPC base class.
// NOTE: Link sprite is 84px at widest and 96px at tallest for walking...
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
class App {
    constructor () {
        this.loader = new Loader();
        this.loader.loadJson( "/webapp/bundles/sandbox/game.json" ).then(( json ) => {
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
