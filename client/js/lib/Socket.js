const $ = require( "../../../node_modules/properjs-hobo/dist/hobo.build" );



class Socket {
    constructor ( player ) {
        this.player = player;
        this.token = null;
        this.handshake = false;
        this.registered = false;
        this.registrations = {};
        this.connection = "ws://localhost:8002";
        this.endpoint = "http://localhost:8002/gamesession";

        this.init();
    }


    init () {
        this.token = null; // Use localstorage maybe?

        if ( this.token ) {
            this.bind();

        } else {
            $.ajax({
                url: this.endpoint,
                dataType: "json",
                method: "POST",
                payload: {},

            }).then(( response ) => {
                this.token = response.token; // Use localstorage maybe?

                this.bind();

            }).catch(( error ) => {
                console.error( error );
            });
        }
    }


    bind () {
        this.websocket = new WebSocket( this.connection, "echo-protocol" );

        this.websocket.onmessage = ( message ) => {
            const response = JSON.parse( message.data );

            // Receiving the client <=> server handshake...
            if ( response.event === "handshake" ) {
                // Handshake is a one-time event initialization
                if ( !this.handshake ) {
                    this.handshake = true;
                    this.emit( "register", this.player.data );
                    console.log( "handshake", response );
                }

            // Initialize the client <=> server registration...
            } else if ( response.event === "registered" ) {
                // Registration is a one-time event like handshake
                // Here the client is notifying the server of a new player for the pool
                if ( !this.registered ) {
                    this.registered = true;
                    console.log( "registered", response );
                }

            // Receiving registration from another REAL player -- MMO real-time
            } else if ( response.event === "register" ) {
                // MMO registration is a one-time event like handshake
                if ( !this.registrations[ response.data.token ] ) {
                    this.registrations[ response.data.token ] = response.data.player;
                    console.log( "register", response );
                }
            }
        };

        this.websocket.onopen = () => {
            console.log( "socket connected", this );

            // Initializing the client <=> server handshake...
            this.emit( "handshake" );
        };

        this.websocket.onclose = () => {
            console.log( "socket closed" );
        };
    }


    blit ( elapsed ) {
        this.emit( "blit", { elapsed } );
    }


    emit ( event, data ) {
        this.websocket.send( JSON.stringify({
            token: this.token,
            event,
            data,
        }));
    }
}



module.exports = Socket;
