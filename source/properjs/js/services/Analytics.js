import * as core from "../core";



// Singleton
let _instance = null;


/**
 *
 * @public
 * @class Analytics
 * @classdesc Handles Google Analytics.
 *            @see {@link https://developers.google.com/analytics/devguides/collection/analyticsjs/}
 * @memberof core
 *
 */
class Analytics {
    constructor () {
        if ( !_instance ) {
            core.emitter.on( "app--tracker", this.track.bind( this ) );

            core.log( "Analytics::Initialized" );

            this.doc = {
                data: {
                    title: null
                }
            };

            _instance = this;
        }

        return _instance;
    }


    /**
     *
     * @public
     * @method track
     * @memberof core.Analytics
     * @param {object} doc The doc object created by router {$doc, $page, pageData, pageHtml}
     * @description Track Squarespace Metrics since we are ajax-routing.
     *
     */
    track ( doc ) {
        // Google Analytics
        if ( !this.doc.data.title ) {
            this.doc.data.title = document.title;
        }

        if ( window.ga && doc.data.title !== this.doc.data.title ) {
            this.doc = doc;
            this.setTitle( doc.data.title );
            core.log( "Analytics::Track", doc.data.title );
            window.ga( "send", "pageview", window.location.href );
        }
    }


    /**
     *
     * @public
     * @method setTitle
     * @param {string} title The new title for the document
     * @memberof class.Analytics
     * @description Update the documents title.
     *
     */
    setTitle ( title ) {
        document.title = title;
    }
}



/******************************************************************************
 * Export
*******************************************************************************/
export default Analytics;
