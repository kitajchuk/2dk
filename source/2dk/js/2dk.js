// Load the SASS
require( "../sass/2dk.scss" );



// Load the JS
import { Loader, Player, Hero, Map } from "./lib/index";



////////////////////////////////////////////////////////////////////////////////
// Build Notes: ////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// HACK: 2D-game maker needs hacking:
//       Precise tile collision detection objects (x, y, width, height) 4x4?
//       Sandbox development Map for ease of testing/experimenting...
//       Retina canvas for map tiles. Design 64x64 and render 32x32...?
//       Debug visuals for collision tiles.

// TODO: Diagonal wall move physics. A left-down wall moves Hero left down.
// TODO: Bounce physics so Hero does not get tile collision locked.
// TODO: Knockbacks Hero_Slide(free) and Hero_Hit(paused).

// IDEA: Blit animation engine for game render, 24 FPS, 1.333333333px/frame.
// IDEA: NPC hypothesis is that NPCs will work now that positions are absolute!

// NOTE: Use Artificial General Intelligence for NPC base class.
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
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
