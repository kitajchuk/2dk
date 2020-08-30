// Load the SASS
import "../sass/screen.scss";



// Load the JS
import ResizeController from "properjs-resizecontroller";
import ScrollController from "properjs-scrollcontroller";
import debounce from "properjs-debounce";
import * as core from "./core";
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
        this.deBounce = 300;
        this.scrollTimeout = null;
        this.mobileWidth = 812;
        this.resizer = new ResizeController();
        this.scroller = new ScrollController();
        this.scrollBounce = 300;
        this.scrollTimeout = null;
        this.controllers = new Controllers({
            el: this.core.dom.main
        });

        this.boot();
        this.bind();
        this.init();
    }


    boot () {
        this.intro.init();
        this.navi.init();
    }


    init () {
        this.intro.teardown();
        this.controllers.exec();
        this.core.cache.set( "session", this.core.dom.session[ 0 ].value );
    }


    bind () {
        // EMPTY
        this.core.dom.body.on( "click", "[href^='#']", ( e ) => e.preventDefault() );

        // RESIZE
        this._onResize = debounce(() => {
            this.core.emitter.fire( "app--resize" );

        }, this.deBounce );

        this.resizer.on( "resize", this._onResize );

        // SCROLL
        this.scroller.on( "scroll", ( scrollY ) => {
            core.emitter.fire( "app--scroll", scrollY );

            core.dom.html.addClass( "is-scrolling" );

            clearTimeout( this.scrollTimeout );

            this.scrollTimeout = setTimeout(() => {
                core.dom.html.removeClass( "is-scrolling" );

            }, this.scrollBounce );
        });

        this.scroller.on( "scrollup", ( scrollY ) => {
            core.dom.html.removeClass( "is-scroll-down" ).addClass( "is-scroll-up" );
            core.emitter.fire( "app--scrollup", scrollY );
        });

        this.scroller.on( "scrolldown", ( scrollY ) => {
            if ( scrollY > 0 ) {
                core.dom.html.removeClass( "is-scroll-up" ).addClass( "is-scroll-down" );
                core.emitter.fire( "app--scrolldown", scrollY );
            }
        });
    }
}


// Create {app} instance
window.app = new App();


// Export {app} instance
export default window.app;
