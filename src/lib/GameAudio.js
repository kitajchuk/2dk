class GameAudio {
    constructor ( device ) {
        this.device = device;
        this.sounds = {};
        this.build();
    }


    build () {
        // MARK: mobile-audio-disabled
        if ( this.device ) {
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
        this.channels.sfx.node.volume = 0.6;
    }


    addSound ( data ) {
        // MARK: mobile-audio-disabled
        if ( this.device ) {
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
