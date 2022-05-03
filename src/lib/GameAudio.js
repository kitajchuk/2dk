class GameAudio {
    constructor ( player ) {
        this.player = player;
        this.sounds = {};
        this.build();
    }


    build () {
        if ( this.player.device ) {
            // console.log( "GameAudio disabled for mobile...", this );
            return;
        }

        this.channels = {
            bgm: {
                node: new Audio(),
                open: false,
            },
            sfx: {
                node: new Audio(),
                open: false,
            },
        };

        this.channels.bgm.node.loop = true;
        this.channels.bgm.node.volume = 0.4;
        this.channels.sfx.node.loop = false;
        this.channels.sfx.node.volume = 0.8;
    }


    addSound ( data ) {
        if ( this.player.device ) {
            // console.log( "GameAudio disabled for mobile...", data );
            return;
        }

        if ( !this.sounds[ data.id ] ) {
            this.sounds[ data.id ] = data;
            this.sounds[ data.id ].playing = false;
        }
    }


    hitSound ( id ) {
        const sound = this.sounds[ id ];

        if ( sound ) {
            const channel = this.channels[ sound.channel ];

            channel.node.src = sound.src;

            channel.node.play();
        }
    }


    playSound ( id ) {
        const sound = this.sounds[ id ];

        if ( sound && !sound.playing ) {
            const channel = this.channels[ sound.channel ];
            const playing = channel.node.src.split( "/" ).pop();
            const requesting = sound.src.split( "/" ).pop();

            if ( requesting !== playing ) {
                channel.node.src = sound.src;
            }

            this.sounds[ id ].playing = true;

            channel.node.play();
        }
    }


    stopSound ( id ) {
        const sound = this.sounds[ id ];

        if ( sound && sound.playing ) {
            const channel = this.channels[ sound.channel ];

            this.sounds[ id ].playing = false;

            channel.node.pause();
        }
    }
}



export default GameAudio;
