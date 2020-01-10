class GameSound {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.sounds = {};
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
        this.prep();
    }


    prep () {
        this.channels.bgm.node.loop = true;
        this.channels.bgm.node.volume = 0.1;
        this.channels.sfx.node.loop = true;
        this.channels.sfx.node.volume = 1.0;
    }


    // id, src, channel
    addSound ( data ) {
        if ( !this.sounds[ data.id ] ) {
            this.sounds[ data.id ] = data;
            this.sounds[ data.id ].playing = false;
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



module.exports = GameSound;
