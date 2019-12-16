import $ from "properjs-hobo";
import PageController from "properjs-pagecontroller";
import * as core from "./core";
import navi from "./modules/navi";
import app from "./app";



/**
 *
 * @public
 * @namespace router
 * @description Uses ProperJS PageController for client-side router management.
 *
 */
const router = {
    init () {
        this.duration = core.config.defaultDuration;
        this.state = {
            now: null,
            future: null
        };

        this.bindEmpty();

        core.log( "Router::Initialized" );

        return this;
    },


    load () {
        return new Promise(( resolve, reject ) => {
            this._resolve = resolve;
            this._reject = reject;
            this.controller = new PageController({
                transitionTime: this.duration,
                routerOptions: {
                    async: true
                }
            });

            this.controller.setConfig([
                "/",
                ":view",
                ":view/:uid"
            ]);

            // this.controller.setModules( [] );

            //this.controller.on( "page-controller-router-samepage", () => {} );
            this.controller.on( "page-controller-router-transition-out", this.changePageOut.bind( this ) );
            this.controller.on( "page-controller-router-refresh-document", this.changeContent.bind( this ) );
            this.controller.on( "page-controller-router-transition-in", this.changePageIn.bind( this ) );
            this.controller.on( "page-controller-initialized-page", ( data ) => {
                this.initPage( data );
            });
            this.controller.initPage();
        });
    },


    bindEmpty () {
        core.dom.body.on( "click", "[href^='#']", ( e ) => e.preventDefault() );
    },


    initPage ( data ) {
        if ( data.status === 404 ) {
            core.dom.html.addClass( "is-404-page" );
        }

        this.virtualData = core.dom.main.data();
        this.setDoc( data );
        this.setState( "now", data );
        this.setState( "future", data );
        this.setClass();
        this.topper();
        navi.active( this.state.now.view );
        app.controllers.exec();

        setTimeout(() => {
            this._resolve();

        }, this.duration );
    },


    parseDoc ( html ) {
        let doc = document.createElement( "html" );
        let virtual = null;

        doc.innerHTML = html;

        doc = $( doc );
        virtual = doc.find( ".js-main" );

        this.virtualData = virtual.data();

        return {
            doc: doc,
            virtual: virtual,
            html: virtual[ 0 ].innerHTML,
            data: this.virtualData
        };
    },


    setDoc ( data ) {
        this.doc = this.parseDoc( data.response );
    },


    setState ( time, data ) {
        this.state[ time ] = {
            raw: data && data || null,
            uid: data && data.request.params.uid || null,
            view: data ? data.request.params.view || core.config.homepage : null,
            cat: data && data.request.query.category || null,
            tag: data && data.request.query.tag || null
        };
    },


    setClass () {
        if ( this.state.future.view ) {
            core.dom.html.addClass( `is-${this.state.future.view}-page` );
        }

        if ( this.state.future.uid ) {
            core.dom.html.addClass( `is-uid-page` );
        }

        if ( this.state.future.cat ) {
            core.dom.html.addClass( `is-cat-page` );
        }

        if ( this.state.future.tag ) {
            core.dom.html.addClass( `is-tag-page` );
        }
    },


    unsetClass () {
        core.dom.html.removeClass( "is-404-page" );

        if ( this.state.now.view !== this.state.future.view ) {
            core.dom.html.removeClass( `is-${this.state.now.view}-page` );
        }

        if ( this.state.now.uid && !this.state.future.uid ) {
            core.dom.html.removeClass( `is-uid-page` );
        }

        if ( this.state.now.cat && !this.state.future.cat ) {
            core.dom.html.removeClass( `is-cat-page` );
        }

        if ( this.state.now.tag && !this.state.future.tag ) {
            core.dom.html.removeClass( `is-tag-page` );
        }
    },


    changePageOut ( data ) {
        core.dom.html.addClass( "is-tranny" );
        this.setState( "future", data );
        navi.active( this.state.future.view );
        navi.close();
    },


    changeContent ( data ) {
        app.controllers.destroy();
        this.setDoc( data );
        this.unsetClass();
        this.setClass();
        this.setState( "now", data );
        core.dom.main[ 0 ].innerHTML = this.doc.html;
        this.topper();
        app.controllers.exec();
        app.analytics.track( this.doc );
    },


    changePageIn ( /*data*/ ) {
        setTimeout(() => {
            core.dom.html.removeClass( "is-tranny" );

        }, this.duration );
    },


    route ( path ) {
        this.controller.getRouter().trigger( path );
    },


    push ( path ) {
        this.controller.routeSilently( path, ( data ) => {
            this.setState( "future", data );
            this.setDoc( data );
            this.setState( "now", data );
        });
    },


    topper () {
        window.scrollTo( 0, 0 );
    },
};



/******************************************************************************
 * Export
*******************************************************************************/
export default router;
