class GameSFX {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.element = new Audio();
        this.sounds = {};
    }


    // id, src, props(loop, etc...)
    addSound ( data ) {
        if ( !this.sounds[ data.id ] ) {
            this.sounds[ data.id ] = data;
        }
    }


    playSound ( id ) {
        if ( this.sounds[ id ] ) {
            for ( let prop in this.sounds[ id ].props ) {
                this.element[ prop ] = this.sounds[ id ].props[ prop ];
            }

            this.element.src = this.sounds[ id ].src;
            this.element.play();
        }
    }


    stopSound ( id ) {
        if ( this.sounds[ id ] ) {
            this.element.pause();
        }
    }
}



module.exports = GameSFX;
