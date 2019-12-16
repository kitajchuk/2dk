import * as core from "../../core";
import $ from "properjs-hobo";
import ImageController from "../controllers/ImageController";
// import paramalama from "paramalama";


/**
 *
 * @public
 * @global
 * @class View
 * @param {object} args The settings for the view
 * @classdesc Handle shared view functionality.
 *
 * @todo: Use ./core/cache for data and try that first
 *
 */
class View {
    constructor ( elem, data ) {
        this.data = data;
        this.element = elem;
        this.id = this.data.uid;
        this.endpoint = this.data.url;
        this.json = null;
        this.controllers = {};
        this.dataType = "text";
        this.method = "GET";

        this.init();
    }


    /**
     *
     * @instance
     * @description Run the View initialization stack
     * @memberof View
     * @method init
     *
     */
    init () {
        this.load().then( this.done.bind( this ) );
    }


    done ( json ) {
        try {
            this.json = JSON.parse( json );

        } catch ( error ) {
            core.log( "warn", error );
        }

        this.render();
        this.exec();
    }


    /**
     *
     * @instance
     * @description Get the data for the view
     * @memberof View
     * @method load
     * @returns {Promise}
     *
     */
    load () {
        return new Promise(( resolve ) => {
            const cache = core.cache.get( this.id );

            // Pre-render from cache
            if ( cache ) {
                this.done( cache );
            }

            // Update render from AJAX
            $.ajax({
                url: this.endpoint,
                dataType: this.dataType,
                method: this.method

            }).then(( json ) => {
                // Update the cache from AJAX
                core.cache.set( this.id, json );

                resolve( json );
            });
        });
    }


    /**
     *
     * @instance
     * @description Render the view template
     * @memberof View
     * @method render
     *
     */
    render () {
        // Webpack es6Module { __esModule: true, default: f }
        const view = require( `../../views/${this.id}` );

        this.element[ 0 ].innerHTML = view.default( this );
    }


    /**
     *
     * @instance
     * @description Initialize controllers
     * @memberof View
     * @method exec
     *
     */
    exec () {
        this.controllers.image = new ImageController( this.element.find( core.config.lazyImageSelector ) );
    }


    /**
     *
     * @instance
     * @description Stop the animation frame
     * @memberof View
     * @method destroy
     *
     */
    destroy () {
        if ( this.controllers.image ) {
            this.controllers.image.destroy();
        }
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default View;
