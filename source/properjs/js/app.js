// Load the SASS
require( "../sass/screen.scss" );



// Load the JS
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
        this.core = core;
        this.intro = intro;
        this.navi = navi;
        this.router = router;
        this.analytics = new Analytics();
        this.controllers = new Controllers({
            el: this.core.dom.main
        });

        this.boot();
    }


    boot () {
        this.intro.init();
        this.navi.init();
        this.init();
        this.bind();
        this.router.init().load().then(() => {
            this.bind();
            this.init();

        }).catch(( error ) => {
            this.core.log( "warn", error );
        });
    }


    init () {
        this.intro.teardown();
    }


    bind () {
        this.core.dom.doc.on( "click", ".js-webapp-link", ( e ) => {
            e.preventDefault();

            window.location.href = e.target.href;
        });
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
