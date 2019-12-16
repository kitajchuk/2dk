// Load the SASS
require( "../sass/2dk.scss" );



// Load the JS
import { Player } from "./lib/index";



/**
 *
 * @public
 * @class App
 * @classdesc Main 2dk sandbox app.
 *
 */
class App {
    constructor () {
        this.player = new Player();
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
