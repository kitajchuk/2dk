"use strict";



/**
 *
 * Adapter for static data prototyping
 *
 * Every adapter must have a common, public `cache` object:
 * api?
 * site
 * navi
 * docs
 *
 * Every adapter must have common, public functions:
 * cache^
 * getApi
 * getPage
 * getSite
 * getDocs
 *
 *
 */
const path = require( "path" );
const cache = {
    api: null,
    site: null,
    navi: null,
    docs: null
};
const core = {
    config: require( "../../clutch.config" ),
    template: require( "../core/template" ),
    files: require( "../core/files" )
};



/**
 *
 * Load the Site context model.
 *
 */
const getSite = ( req ) => {
    return new Promise(( resolve, reject ) => {
        getDocs().then(( docs ) => {
            cache.site = docs.site;
            cache.navi = docs.navi;
            cache.docs = docs;

            resolve();
        });
    });
};



/**
 *
 * Handle API requests.
 * resolveData: {
 *    site,
 *    navi,
 *    docs?,
 *    doc?,
 *    next?,
 *    prev?
 * }
 *
 */
const getApi = ( req, res, listener ) => {
    return new Promise(( resolve, reject ) => {
        const doQuery = ( type, uid ) => {
            let ret = null;
            let pageUIDoc = cache.docs.page.find(( page ) => {
                return (page.uid === type);
            });
            const resolveData = {
                site: cache.site,
                navi: cache.navi
            };

            // if ( cache.api.data.forms[ type ] ) {
            //     const regex = /\[\[\:d\s=\sany\(document.type,\s\["(.*?)"\]\)\]\]/;
            //     const match = cache.api.data.forms[ type ].fields.q.default.match( regex );
            //
            //     type = match[ 1 ] || type;
            // }

            // One-pager
            if ( core.config.onepager ) {
                resolveData.doc = cache.docs.page.find(( d ) => {
                    return (d.uid === core.config.homepage);
                });

            // Homepage "/"
            } else if ( type === core.config.homepage ) {
                if ( pageUIDoc ) {
                    resolveData.doc = pageUIDoc;

                } else {
                    resolveData.docs = cache.docs;
                }

            } else {
                const docs = cache.docs[ type ] || cache.docs.page;

                // Single
                if ( uid ) {
                    const doc = docs.find(( d ) => {
                        return (d.uid === uid);
                    });
                    const idx = docs.indexOf( doc );
                    let next = null;
                    let prev = null;

                    if ( docs[ idx + 1 ] ) {
                        next = docs[ idx + 1 ];
                    }

                    if ( docs[ idx - 1 ] ) {
                        prev = docs[ idx - 1 ];
                    }

                    resolveData.doc = doc;
                    resolveData.next = next;
                    resolveData.prev = prev;

                } else if ( pageUIDoc ) {
                    resolveData.doc = pageUIDoc;
                    resolveData.docs = docs;

                } else {
                    resolveData.docs = docs;
                }
            }

            resolve( resolveData );
        };

        doQuery( req.params.type, req.params.uid );
    });
};



/**
 *
 * Handle Page requests.
 *
 */
const getPage = ( req, res, listener ) => {
    return getApi( req, res, listener );
};



/**
 *
 * Get all documents from a Prismic service API
 *
 */
const getDocs = () => {
    return new Promise(( resolve, reject ) => {
        const apiPath = path.join( core.config.template.staticDir, "api", "data.json" );

        core.files.read( apiPath ).then(( json ) => {
            let docs = {};

            json.results.forEach(( doc ) => {
                if ( !docs[ doc.type ] ) {
                    docs[ doc.type ] = [];
                }

                docs[ doc.type ].push( doc );
            });

            docs.site = json.site;
            docs.navi = json.navi;

            resolve( docs );

        }).catch( reject );
    });
};



module.exports = {
    cache,
    getApi,
    getSite,
    getPage,
    getDocs
};
