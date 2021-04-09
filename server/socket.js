const express = require( "express" );
const expressApp = express();
const bodyParser = require( "body-parser" );
const http = require( "http" );
const websocket = require( "websocket" );
const session = require( "express-session" );
const jwt = require( "jsonwebtoken" );
const WebSocketServer = websocket.server;
const httpServer = http.Server( expressApp );
// const httpsServer = https.Server( expressApp );
const httpPort = 8002;
const websocketserver = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: false,
});
const allowed = [
    "https://2dk.kitajchuk.com",
    "http://localhost:8000",
];
const pool = {}; // Memo sessions for clients
const sessionSecret = "shutupnavi";



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
//     console.log( `Session ID: ${req.session.id} is being destroyed` );
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
expressApp.use( session({
    secret: sessionSecret,
    saveUninitialized: true,
    resave: true,
    cookie: {
        secure: false, // Needs to be true for HTTPS in production
        maxAge: 3600 * 1000, // One hour -- 3600s => 3600000ms
    },
}));



/*******************************************************************************
* Express routes
*******************************************************************************/
expressApp.post( "/gamesession", checkOrigin, ( req, res, next ) => {
    jwt.sign( { sessionId: req.session.id }, sessionSecret, ( error, token ) => {
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
    console.log( `Sock server requested by origin ${request.origin}` );

    if ( allowed.indexOf( request.origin ) !== -1 ) {
        console.log( `Sock server accepted origin ${request.origin}` );

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
        // console.log( utf8Data );

        jwt.verify( utf8Data.token, sessionSecret, ( error, decoded ) => {
            if ( !error ) {
                // Persist the verified session
                if ( !pool[ decoded.sessionId ] ) {
                    pool[ decoded.sessionId ] = new AppSession( decoded.sessionId, connection );
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
                            // console.log( utf8Data.data );
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
                        // console.log( utf8Data.data );
                    }

                    console.log( `Sock server connected to client. Session ID: ${connection.session.id}` );
                }

            // https://www.npmjs.com/package/jsonwebtoken#errors--codes
            } else {
                console.log( error );

                // Expire the session...?
            }
        });
    });
});
websocketserver.on( "close", ( connection ) => {
    try {
        console.log( `Sock server disconnected from client. Session ID: ${connection.session.id}` );

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



module.exports = {
    init () {
        return new Promise(( resolve, reject ) => {
            httpServer.listen( httpPort );

            console.log( "Socket Server Initialized" );
        });
    }
};
