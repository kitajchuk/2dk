import * as core from "./core";
import ImageController from "./controllers/ImageController";
// import BaseController from "./controllers/BaseController";
// import View from "./components/View";



/**
 *
 * @public
 * @global
 * @class Controllers
 * @classdesc Handle controller functions.
 * @param {object} options Optional config
 *
 */
class Controllers {
    constructor ( options ) {
        this.element = options.el;
        this.callback = options.cb;
        this.controllers = [];

        core.log( "Controllers::Initialized" );
    }


    exec () {
        this.controllers = [];

        // Push components here...
        // this.push( "view", this.element.find( ".js-view" ), BaseController, View );

        // Initialize pushed components
        this.init();

        // Initialize image loading after components execute
        this.images = this.element.find( core.config.lazyImageSelector );
        this.imageController = new ImageController( this.images, core.util.noop );
        this.imageController.on( "preloaded", () => {
            if ( this.callback ) {
                this.callback();
            }
        });
    }


    init () {
        this.controllers.forEach(( controller ) => {
            if ( controller.elements.length ) {
                controller.instance = new controller.Controller(
                    controller.elements,
                    controller.component
                );

            } else if ( typeof controller.elements === "function" ) {
                try {
                    controller.elements = controller.elements();

                    if ( controller.elements.length ) {
                        controller.instance = new controller.Controller(
                            controller.elements,
                            controller.component
                        );
                    }

                } catch ( error ) {
                    core.log( "warn", error );
                }
            }
        });
    }


    push ( id, elements, controller, component ) {
        this.controllers.push({
            id,
            elements,
            instance: null,
            Controller: controller,
            component
        });
    }


    kill () {
        this.controllers.forEach(( controller ) => {
            if ( controller.instance ) {
                controller.instance.destroy();
            }
        });

        this.controllers = [];

        if ( this.imageController ) {
            this.imageController.destroy();
            this.imageController = null;
        }
    }


    destroy () {
        this.kill();
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Controllers;
