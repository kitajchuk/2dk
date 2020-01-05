class GameSFX {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.sounds = {};
    }


    // id, src, props(loop, etc...)
    addSound ( data ) {
        if ( !this.sounds[ data.id ] ) {
            this.sounds[ data.id ] = {
                node: new Audio( data.src ),
                props: data.props,
            };

            for ( let prop in data.props ) {
                this.sounds[ data.id ].node[ prop ] = data.props[ prop ];
            }
        }
    }


    playSound ( id ) {
        if ( this.sounds[ id ] ) {
            this.sounds[ id ].node.play();
        }
    }


    stopSound ( id ) {
        if ( this.sounds[ id ] ) {
            this.sounds[ id ].node.pause();
        }
    }
}



module.exports = GameSFX;
