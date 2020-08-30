"use strict";



const path = require( "path" );
const lager = require( "properjs-lager" );
const core = {
    query: require( "./query" ),
    config: require( "../../clutch.config" ),
    template: require( "./template" )
};
const ContextObject = require( "../class/ContextObject" );



/**
 *
 * Load the data for the given request.
 *
 */
const getPage = function ( req, res, listener ) {
    return new Promise(( resolve, reject ) => {
        const page = (core.config.onepager ? core.config.homepage : (req.params.type ? req.params.type : core.config.homepage));
        let context = new ContextObject( page );
        const check = ( data ) => {
            // data: {
            //     site,
            //     navi,
            //     docs?,
            //     doc?,
            //     next?,
            //     prev?
            // }

            // 0.0 => Missing template file
            // 0.1 => Single ContentItem
            // 0.2 => Multiple ContentItems(s)
            const isNoNamePage = (core.template.cache.pages.indexOf( `${page}.html` ) === -1);
            const isNoTypePage = data.doc ? (core.template.cache.pages.indexOf( `${data.doc.type}.html` ) === -1) : true;

            if ( isNoNamePage && isNoTypePage ) {
                const file = path.join( core.config.template.pagesDir, `${page}.html` );

                fail( `Missing template for this endpoint. ${file.replace( `${page}.html`, `<em>${page}.html</em>` )}.` );

            } else {
                if ( data.doc ) {
                    context.set( "doc", data.doc );
                }

                if ( data.docs ) {
                    context.set( "docs", data.docs );
                }

                if ( data.prev ) {
                    context.set( "prev", data.prev );
                }

                if ( data.next ) {
                    context.set( "next", data.next );
                }

                // context?
                if ( listener && listener.handlers.context ) {
                    context = listener.handlers.context( context, core.query.cache, req );
                }

                done();
            }
        };
        const fail = ( error ) => {
            context.set({
                page: core.config.notfound,
                error: error
            });

            done();
        };
        const done = () => {
            context.set({
                session: req.session ? req.session.id : null,
                navi: core.query.cache.navi,
                site: core.query.cache.site
            });

            resolve(( callback ) => {
                render( callback );
            });
        };
        const render = ( callback ) => {
            let layout = core.config.template.layout;
            const localObject = {
                context: context
            };
            const doc = localObject.context.get( "doc" );
            const isNoNamePage = (core.template.cache.pages.indexOf( `${page}.html` ) === -1);

            if ( isNoNamePage && doc ) {
                localObject.context.set( "page", doc.type );
            }

            core.template.render( layout, localObject ).then(( html ) => {
                callback( (context.page === core.config.notfound ? 404 : 200), html );

            }).catch(( error ) => {
                renderError( callback, error );
            });
        };
        const renderError = ( callback, error ) => {
            context.set({
                page: core.config.notright,
                error: error
            });

            core.template.render( core.config.template.layout, { context: context } ).then(( html ) => {
                callback( 500, html );
            });
        };

        core.query.getPage( req, res, listener ).then( check ).catch( fail );
    });
};


module.exports = {
    getPage
};
