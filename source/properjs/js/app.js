// Load the SASS
require( "../sass/screen.scss" );



// Load the JS
// import Store from "./core/Store";
import debounce from "properjs-debounce";
import router from "./router";
import * as core from "./core";
import Analytics from "./services/Analytics";
import intro from "./modules/intro";
import navi from "./modules/navi";
import Controllers from "./Controllers";



/**
 *
 * @public
 * @class App
 * @classdesc Main Clutch ProperJS Application.
 *
 */
class App {
    constructor () {
        // this.Store = Store;
        this.core = core;
        this.intro = intro;
        this.navi = navi;
        this.router = router;
        this.deBounce = 300;
        this.scrollTimeout = null;
        this.mobileWidth = 812;
        this.isRaf = false;
        this.isLoad = false;
        this.analytics = new Analytics();
        this.controllers = new Controllers({
            el: this.core.dom.main
        });

        this.boot();
    }


    boot () {
        this.intro.init();
        this.navi.init();
        this.router.init().load().then(() => {
            this.bind();
            this.init();

        }).catch(( error ) => {
            this.core.log( "warn", error );
        });
    }


    init () {
        // this.navi.load();
        this.intro.teardown();
    }


    bind () {}
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
