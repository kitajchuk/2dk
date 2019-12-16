// Load the SASS
require( "../sass/screen.scss" );



// Load the JS
// import Store from "./core/Store";
import JScroll from "properjs-jscroll";
import ResizeController from "properjs-resizecontroller";
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
        this.resizer = new ResizeController();
        this.controllers = new Controllers({
            el: this.core.dom.main
        });

        this.boot();
    }


    boot () {
        this.intro.init();
        this.navi.init();
        this.router.init().load().then(() => {
            this.jscroll = new JScroll({
                scrollbar: true
            });
            this.bind();
            this.reqRaf();
            this.init();

        }).catch(( error ) => {
            this.core.log( "warn", error );
        });
    }


    init () {
        // this.navi.load();
        this.intro.teardown();
    }


    bind () {
        // RESIZE
        this._onResize = debounce(() => {
            this.core.emitter.fire( "app--resize" );

        }, this.deBounce );

        this.resizer.on( "resize", this._onResize );

        // VIRTUAL-SCROLL
        this.jscroll.vs.on(( e ) => {
            this.core.emitter.fire( "app--scroll", e );

            // this.reqRaf();

            this.core.dom.html.addClass( "is-scrolling" );

            clearTimeout( this.scrollTimeout );

            this.scrollTimeout = setTimeout(() => {
                this.core.dom.html.removeClass( "is-scrolling" );

                // this.cancelRaf();

            }, this.deBounce );

            // DOWN
            // if ( e.deltaY < 0 ) {
            //     this.core.dom.html.removeClass( "is-scroll-up" ).addClass( "is-scroll-down" );
            //     this.core.emitter.fire( "app--scrolldown", e );
            //
            // // UP
            // } else {
            //     this.core.dom.html.removeClass( "is-scroll-down" ).addClass( "is-scroll-up" );
            //     this.core.emitter.fire( "app--scrollup", e );
            // }
        });
    }


    reqRaf () {
        if ( !this.isRaf ) {
            this.isRaf = true;

            this.core.emitter.go(() => {
                this.core.emitter.fire( "app--raf" );
            });
        }
    }


    cancelRaf () {
        this.isRaf = false;
        this.core.emitter.stop();
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
