"use strict";



const fs = require( "fs" );
const path = require( "path" );
const express = require( "express" );
const expressApp = express();
const compression = require( "compression" );
const cookieParser = require( "cookie-parser" );
const bodyParser = require( "body-parser" );
const http = require( "http" );
const lager = require( "properjs-lager" );
const websocket = require( "websocket" );
const session = require( "express-session" );
const jwt = require( "jsonwebtoken" );
const WebSocketServer = websocket.server;
const FileStore = require( "session-file-store" )( session );
const core = {
    config: require( "../../clutch.config" )
};
const httpServer = (core.config.env.sandbox ? http.Server( expressApp ) : https.Server( expressApp ));
const websocketserver = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false,
});
const allowed = [
    core.config.url
];
const oneHourMs = 3600000; // 1 hour in milliseconds
const oneHourSs = oneHourMs / 1000; // 1 hour in seconds
const pool = {}; // Memo sessions for clients
const hours = 24;



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
class AppSession {
    constructor ( id, connection ) {
        this.id = id;
        this.player = null;
        this.handshake = false;
        this.connection = connection;

        // So we can delete @this AppSession on closed connections
        this.connection.session = { id };
    }

    emit ( event, data ) {
        this.connection.send( JSON.stringify({
            event,
            data,
        }));
    }

    broadcast ( event, token ) {
        for ( let id in pool ) {
            // Ignore oneself in the pool...
            // Ignore connections from games that are not OUR GAME...
            if ( id !== this.id && pool[ id ].player && pool[ id ].player.game.id === this.player.game.id ) {
                // Sends the static JSON blob (game.json) from Software bundle to other clients...
                pool[ id ].emit( event, {
                    token,
                    player: this.player,
                });
            }
        }
    }
}



/*******************************************************************************
* Express middleware (custom)
*******************************************************************************/
// async function killSession ( req, res, next ) {
//     lager.info( `Session ID: ${lager.comment( req.session.id )} is being destroyed` );
//
//     delete sess[ req.session.id ];
//
//     req.session.destroy(() => {
//         res.status( 200 ).json({
//             success: true,
//             destroyed: req.session.id,
//         });
//     });
// };
async function checkOrigin ( req, res, next ) {
    // No origin means not CORS :-)
    if ( !req.headers.origin ) {
        next();

    } else {
        // Check allowed origins for access to this application...
        if ( allowed.indexOf( req.headers.origin ) !== -1 ) {
            res.set({
                "Access-Control-Allow-Origin": req.headers.origin,
            });

            next();

        } else {
            res.status( 200 ).json({
                error: "Invalid request origin",
            });
        }
    }
};



/*******************************************************************************
* Express setup
*******************************************************************************/
expressApp.use( bodyParser.json({
    limit: "10mb",
}));
expressApp.use( bodyParser.urlencoded({
    limit: "10mb",
    extended: true,
}));
// expressApp.use( cookieParser() );
expressApp.use( session({
    secret: core.config.session.secret,
    saveUninitialized: true,
    resave: true,
    cookie: {
        secure: (core.config.env.sandbox ? false : true),
        // 24 hour cookie time in milliseconds
        maxAge: (oneHourMs * hours),
    },
    store: new FileStore({
        secret: core.config.express.secret,
        // 24 hour session time in seconds
        ttl: (oneHourSs * hours),
    }),
}));



/*******************************************************************************
* Express routes
*******************************************************************************/
expressApp.post( "/gamesession", checkOrigin, ( req, res, next ) => {
    jwt.sign( { sessionId: req.session.id }, core.config.session.secret, ( error, token ) => {
        if ( !error ) {
            res.status( 200 ).json( { token } );

        } else {
            res.status( 200 ).json({
                error: "Could not sign JSON Web Token",
            });
        }
    });
});



/*******************************************************************************
* WebSocketServer
*******************************************************************************/
websocketserver.on( "request", ( request ) => {
    lager.info( `Sock server requested by origin ${request.origin}` );

    if ( allowed.indexOf( request.origin ) !== -1 ) {
        lager.info( `Sock server accepted origin ${request.origin}` );

        request.accept( "echo-protocol", request.origin );
    }
});
websocketserver.on( "connect", ( connection ) => {
    // message { event, sess, data }
    connection.on( "message", ( message ) => {
        const utf8Data = JSON.parse( message.utf8Data );

        /*
        utf8Data {
            token,
            event,
            data,
        }
        */
        // lager.data( utf8Data );

        jwt.verify( utf8Data.token, core.config.session.secret, ( error, decoded ) => {
            if ( !error ) {
                // Persist the verified session
                if ( !pool[ decoded.sessionId ] ) {
                    const sessPath = path.join( process.cwd(), `./sessions/${decoded.sessionId}.json` );

                    if ( fs.existsSync( sessPath ) ) {
                        pool[ decoded.sessionId ] = new AppSession( decoded.sessionId, connection );
                    }
                }

                // Verified session exists
                if ( pool[ decoded.sessionId ] ) {
                    // Returning the client <=> server handshake...
                    if ( utf8Data.event === "handshake" ) {
                        // Handshake is a one-time event initialization
                        if ( !pool[ decoded.sessionId ].handshake ) {
                            pool[ decoded.sessionId ].handshake = true;
                            pool[ decoded.sessionId ].emit( "handshake", {
                                success: true,
                            });
                        }

                    // Register the client player to the session...
                    } else if ( utf8Data.event === "register" ) {
                        // Registration is a one-time event like handshake
                        // Here the client is notifying the server of a new player for the pool
                        if ( !pool[ decoded.sessionId ].player ) {
                            // lager.data( utf8Data.data );
                            // The data here is the static JSON blob (game.json) from Software bundle
                            pool[ decoded.sessionId ].player = utf8Data.data;
                            pool[ decoded.sessionId ].emit( "registered", {
                                success: true,
                            });

                            // Need to do this in a better way -- new connections are not notified by this...
                            // Rather than broadcast here, we should notify on interval so all sessions resolve to talking with one another...
                            // We could broadcast on blit -- likely not a problem since registration is a one-time "capture if not exists"...

                            // Broadcast this player registration to other clients in the pool for the SAME GAME
                            pool[ decoded.sessionId ].broadcast( "register", utf8Data.token );
                        }

                    } else if ( utf8Data.event === "blit" ) {
                        // Currently receiving game blit elapsed time value
                        // Needs to receive Player+Game data to broadcast to
                        // other players on the same map...
                        // lager.data( utf8Data.data );
                    }

                    lager.info( `Sock server connected to client. Session ID: ${connection.session.id}` );
                }

            // https://www.npmjs.com/package/jsonwebtoken#errors--codes
            } else {
                lager.data( error );

                // Expire the session...?
            }
        });
    });
});
websocketserver.on( "close", ( connection ) => {
    try {
        lager.info( `Sock server disconnected from client. Session ID: ${connection.session.id}` );

        // So we can delete @this AppSession on closed connections
        delete pool[ connection.session.id ];

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
 * Socket API.
 *
 */
module.exports = {
    /**
     *
     * Start the Socket {server}.
     *
     */
    init () {
        return new Promise(( resolve, reject ) => {
            httpServer.listen( core.config.socket.port );

            lager.cache( `[Clutch] Socket Server Initialized` );
        });
    }
};
