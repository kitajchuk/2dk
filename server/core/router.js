"use strict";



const express = require( "express" );
const compression = require( "compression" );
const bodyParser = require( "body-parser" );
const lager = require( "properjs-lager" );
const session = require( "express-session" );
const jwt = require( "jsonwebtoken" );
const websocket = require( "websocket" );
const ContextObject = require( "../class/ContextObject" );
const http = require( "http" );
const https = require( "https" );
const fs = require( "fs" );
const stasis = require( "../generators/static" );
const WebSocketServer = websocket.server;
const expressApp = express();
const listeners = {};
const core = {
    query: require( "./query" ),
    config: require( "../../clutch.config" ),
    content: require( "./content" ),
    template: require( "./template" )
};
const httpServer = (core.config.env.sandbox ? http.Server( expressApp ) : https.Server( expressApp ));
const allowed = [
    core.config.url
];
const oneHourMs = 3600000; // 1 hour in milliseconds
const oneHourSs = oneHourMs / 1000; // 1 hour in seconds
const sess = {}; // Memo sessions for clients
const conn = {};
const hours = 24;
let cacheIndex = 0;
let socketServer = null;



// Lager methods:
// template: "cyan"
// server: "magenta"
// cache: "green"
// error: "red"
// warn: "yellow"
// info: "white"
// comment: "grey"
// data: "rainbow"



/*******************************************************************************
* Sandbox development
*******************************************************************************/
if ( core.config.env.sandbox ) {
    allowed.push( `http://localhost:${core.config.browser.port}` );
    lager.info( "Pushing sandbox development url to allowed origins" );
}



/*******************************************************************************
* Local session for clients
*******************************************************************************/
class AppSess {
    constructor ( sessId ) {
        this.sessId = sessId;
    }
}



/*******************************************************************************
* Local connection for Websockets
*******************************************************************************/
class AppConn {
    constructor ( sessId, connection ) {
        this.sessId = sessId;
        this.connection = connection;
        this.connection.session = {
            id: sessId,
        };
    }

    send ( event, data ) {
        this.connection.send( JSON.stringify({
            event,
            data,
            sess: this.sessId,
        }));
    }
}



/*******************************************************************************
* Express middleware (custom)
*******************************************************************************/
const killAuth = ( req, res, next ) => {
    lager.info( `Session ID: ${lager.comment( req.session.id )} is being destroyed` );

    delete sess[ req.session.id ];
    delete conn[ req.session.id ];

    req.session.destroy(() => {
        res.redirect( "/" );
    });
};
async function checkOrigin ( req, res, next ) {
    // No origin means not CORS :-)
    if ( !req.headers.origin ) {
        next();

    } else {
        res.status( 200 ).json({
            error: "Invalid origin for request"
        });
    }
};
async function checkAuth ( req, res, next ) {
    // Condition:
    // 1. No session
    if ( !sess[ req.session.id ] ) {
        lager.info( `Session ID: ${lager.comment( req.session.id )} generating session` );

        sess[ req.session.id ] = new AppSess( req.session.id );

        res.redirect( "/" );

    // Condition:
    // 1. Yes session
    } else if ( sess[ req.session.id ] ) {
        lager.info( `Session ID: ${lager.comment( req.session.id )} persisting session` );
        lager.info( req.path );

        // Persist AppSess after a server restart (nodemon dev OR deploy in the wild?)
        if ( !sess[ req.session.id ] ) {
            sess[ req.session.id ] = new AppSess( req.session.id );
        }

        next();
    }
};



/*******************************************************************************
* Express setup
*******************************************************************************/
expressApp.use( compression( core.config.compression ) );
expressApp.use( bodyParser.json({
    limit: "10mb",
}));
expressApp.use( bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
}));
expressApp.use( session({
    secret: core.config.express.secret,
    saveUninitialized: true,
    resave: true,
    cookie: {
        secure: (core.config.env.sandbox ? false : true),
        // 24 hour cookie time in milliseconds
        maxAge: (oneHourMs * hours),
    },
}));
expressApp.use( checkOrigin, checkAuth );
expressApp.use( express.static( core.config.template.staticDir, {
    maxAge: core.config.static.maxAge,
}));



/*******************************************************************************
* Express routes
*******************************************************************************/
const setRoutes = () => {
    // SYSTEM
    expressApp.get( "/robots.txt", getRobots );
    expressApp.get( "/sitemap.xml", getSitemap );

    // SYSTEM => OLD
    // expressApp.get( "/preview", getPreview );
    // expressApp.post( "/webhook", postWebhook );

    // URI => HTML?format=json
    // URI => HTML?nocache=420
    expressApp.get( "/", setReq, getPage );
    expressApp.get( "/:type", setReq, getPage );
    expressApp.get( "/:type/:uid", setReq, getPage );
    // expressApp.get( "/:type/:uid/index.json", setReq, getPage );
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



/*******************************************************************************
* WebSocketServer
*******************************************************************************/
socketServer = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false,
});
socketServer.on( "request", ( request ) => {
    lager.info( `Sock server requested by origin ${lager.comment( request.origin )}` );

    if ( allowed.indexOf( request.origin ) !== -1 ) {
        lager.info( `Sock server accepted origin ${lager.comment( request.origin )}` );

        request.accept( "echo-protocol", request.origin );
    }
});
socketServer.on( "connect", ( connection ) => {
    // message { event, sess, data }
    connection.on( "message", ( message ) => {
        const utf8Data = JSON.parse( message.utf8Data );

        if ( !sess[ utf8Data.sess ] ) {
            // Silence is golden...

        // Register a client connection with a session
        } else if ( utf8Data.event === "subscribe" ) {
            if ( !conn[ utf8Data.sess ] ) {
                conn[ utf8Data.sess ] = new AppConn( utf8Data.sess, connection );

                lager.info( `Sock server connected to client. Session ID: ${lager.comment( connection.session.id )}` );
            }
        }
    });
});
socketServer.on( "close", ( connection ) => {
    try {
        lager.info( `Sock server disconnected from client. Session ID: ${lager.comment( connection.session.id )}` );

        delete conn[ connection.session.id ];

    } catch ( error ) {
        console.error( error );
    }
});



/*******************************************************************************
* Down she goes...
*******************************************************************************/
// process.on( "SIGINT", () => {
//     // Cleanup
//     try {
//         // Something?
//
//     } catch ( error ) {
//         console.error( error );
//     }
//
//     process.exit( 0 );
// });



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
                    httpServer.listen( core.config.express.port );

                    stasis.clean( core.config ).then( resolve );

                    lager.cache( `[Clutch] Server Initialized` );
                });
            });
        });
    }
};
