class Socket {
    constructor () {
        this.sockConn = "ws://localhost:8002";
        this.websocket = new WebSocket( this.sockConn, "echo-protocol" );

        this.bind();
    }


    bind () {
        this.websocket.onmessage = ( message ) => {
            const response = JSON.parse( message.data );

            console.log( "onmessage", response );
        };
        this.websocket.onopen = () => {
            console.log( "socket connected" );
        };
        this.websocket.onclose = () => {
            console.log( "socket closed" );
        };
    }


    emit ( event, data ) {
        this.websocket.send( JSON.stringify({
            event,
            data,
        }));
    }
}



module.exports = Socket;
