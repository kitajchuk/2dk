const MediaBox = require( "properjs-mediabox" );



class GameSFX {
    constructor ( gamebox ) {
        this.channel = "bgm";
        this.gamebox = gamebox;
        this.mediabox = new MediaBox();
    }


    // id, src, props(loop, etc...)
    addSound ( data ) {
        return new Promise(( resolve ) => {
            const sound = this.mediabox.getMedia( data.id );

            if ( !sound ) {
                this.mediabox.addAudio({
                    id: data.id,
                    src: [data.src],
                    channel: data.channel || this.channel,
                    onloaded: () => {
                        for ( let prop in data.props ) {
                            this.mediabox.setMediaProp( data.id, prop, data.props[ prop ] );
                        }

                        resolve();
                    }
                });
            }
        });
    }


    playSound ( id ) {
        const sound = this.mediabox.getMedia( id );

        if ( sound ) {
            this.mediabox.fadeMediaIn( id, 500 );
        }
    }


    stopSound ( id ) {
        const sound = this.mediabox.getMedia( id );

        if ( sound ) {
            this.mediabox.fadeMediaOut( id, 500 );
        }
    }
}



module.exports = GameSFX;
