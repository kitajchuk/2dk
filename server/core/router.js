"use strict";



const express = require( "express" );
const expressApp = express();
const compression = require( "compression" );
const cookieParser = require( "cookie-parser" );
const bodyParser = require( "body-parser" );
const lager = require( "properjs-lager" );
const csurf = require( "csurf" );
const listeners = {};
const core = {
    query: require( "./query" ),
    config: require( "../../clutch.config" ),
    content: require( "./content" ),
    template: require( "./template" )
};
const ContextObject = require( "../class/ContextObject" );
const checkCSRF = csurf({
    cookie: true
});
const http = require( "http" );
const fs = require( "fs" );
const stasis = require( `../generators/static` );
let httpServer = null;
let cacheIndex = 0;



/**
 *
 * Configure Express Middleware.
 *
 */
expressApp.use( cookieParser() );
expressApp.use( bodyParser.json() );
expressApp.use( bodyParser.urlencoded({
    extended: true
}));
expressApp.use( compression( core.config.compression ) );
expressApp.use( express.static( core.config.template.staticDir, {
    maxAge: core.config.static.maxAge
}));



/**
 *
 * Configure Express Routes.
 *
 */
const setRoutes = () => {
    // SYSTEM
    expressApp.get( "/robots.txt", getRobots );
    expressApp.get( "/sitemap.xml", getSitemap );

    // SYSTEM => OLD
    // expressApp.get( "/preview", getPreview );
    // expressApp.post( "/webhook", postWebhook );

    // URI => HTML?format=json
    // URI => HTML?nocache=420
    expressApp.get( "/", checkCSRF, setReq, getPage );
    expressApp.get( "/:type", checkCSRF, setReq, getPage );
    expressApp.get( "/:type/:uid", checkCSRF, setReq, getPage );
    expressApp.get( "/:type/:uid/index.json", checkCSRF, setReq, getPage );
};




/**
 *
 * Request handling.
 *
 */
const setReq = ( req, res, next ) => {
    req.params.type = req.params.type || core.config.homepage;

    next();
};
const getKey = ( type ) => {
    const key = type;

    return key || core.config.homepage;
};



/**
 *
 * :GET Pages
 *
 */
const getPage = ( req, res ) => {
    const key = getKey( req.params.type );
    const done = () => {
        const rJson = /\.json$/;
        const isStaticJson = rJson.test( req.path );
        const isServerJson = (req.query.format === "json");

        if ( isStaticJson || isServerJson ) {
            if ( isStaticJson && rJson.test( req.params.uid ) ) {
                delete req.params.uid;
            }

            core.query.getApi( req, res, listeners[ key ] ).then(( result ) => {
                if ( isServerJson ) {
                    res.status( 200 ).json( result );

                } else {
                    res.status( 200 ).send( JSON.stringify( result ) );
                }
            });

        } else {
            core.content.getPage( req, res, listeners[ key ] ).then(( callback ) => {
                // Handshake callback
                callback(( status, html ) => {
                    res.status( status ).send( html );
                });
            });
        }
    };

    // Local CACHEBUSTER!!!
    if ( req.query.nocache ) {
        cacheIndex = Number( req.query.nocache );

        core.query.getSite().then(() => {
            lager.cache( `[Clutch] Cache query index ${cacheIndex}` );

            done();
        });

    } else {
        done();
    }
};



/**
 *
 * :GET  Prismic stuff
 * :POST Prismic stuff
 *
 */
// const getPreview = ( req, res ) => {
//     core.query.getPreview( req, res ).then(( url ) => {
//         res.redirect( url );
//     });
// };
// const postWebhook = ( req, res ) => {
//     // Skip if update is in progress, Skip if invalid secret was sent
//     if ( !isSiteUpdate && req.body.secret === core.config.api.secret ) {
//         isSiteUpdate = true;
//
//         // Re-Fetch Site JSON
//         core.query.getSite().then(() => {
//             isSiteUpdate = false;
//         });
//     }
//
//     // Always resolve with a 200 and some text
//     res.status( 200 ).send( "success" );
// };
const getSitemap = ( req, res ) => {
    const sitemap = require( `../generators/sitemap` );

    sitemap.generate().then(( xml ) => {
        res.set( "Content-Type", "text/xml" ).status( 200 ).send( xml );
    });

};
const getRobots = ( req, res ) => {
    const robots = require( `../generators/robots` );

    robots.generate().then(( txt ) => {
        res.set( "Content-Type", "text/plain" ).status( 200 ).send( txt );
    });

};



/**
 *
 * Middleware checks
 *
 */
const checkOrigin = ( req, res, next ) => {
    // No origin means not CORS :-)
    if ( !req.headers.origin ) {
        next();

    } else {
        res.status( 200 ).json({
            error: "Invalid origin for request"
        });
    }
};



/**
 *
 * Router API.
 *
 */
module.exports = {
    /**
     *
     * Handle router subscribe.
     *
     */
    on ( type, handlers ) {
        const key = getKey( type );

        // One handler per route
        if ( !listeners[ key ] ) {
            listeners[ key ] = {
                type: type,
                handlers: handlers
            };
        }
    },


    /**
     *
     * Start the Express {app}.
     *
     */
    init () {
        return new Promise(( resolve, reject ) => {
            // Init routes
            setRoutes();

            // Fetch ./template/pages listing
            core.template.getPages().then(() => {
                // Fetch Site JSON
                core.query.getSite().then(() => {
                    httpServer = http.createServer( expressApp );
                    httpServer.listen( core.config.express.port );

                    stasis.clean( core.config ).then( resolve );

                    lager.cache( `[Clutch] Server Initialized` );
                });
            });
        });
    }
};
