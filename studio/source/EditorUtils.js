const MediaBox = require( "properjs-mediabox" );
const Cache = require( "./Cache" );
const $ = require( "../node_modules/properjs-hobo/dist/hobo.build" );
const mediabox = new MediaBox();



const EditorUtil = {
    processSound ( sampler, gameId ) {
        const select = sampler.find( ".js-select-sound" );
        const sound = select[ 0 ].value;
        const soundId = Cache.slugify( `${sound}${sampler.data().spot}` );
        const duration = 1;

        if ( sound ) {
            if ( !mediabox.getMedia( soundId ) ) {
                mediabox.addAudio({
                    id: soundId,
                    src: [`./games/${gameId}/assets/sounds/${sound}`],
                    channel: "bgm",
                    onloaded () {
                        mediabox.crossFadeChannel( "bgm", soundId, duration );
                    }
                });

                sampler.addClass( "is-playing" );

            } else if ( (mediabox.getMedia( soundId ) && mediabox.isPlaying( soundId )) ) {
                mediabox.fadeChannelOut( "bgm", duration );

                sampler.removeClass( "is-playing" );

            } else if ( (mediabox.getMedia( soundId ) && !mediabox.isPlaying( soundId )) ) {
                mediabox.setMediaProp( soundId, "currentTime", 0 );
                mediabox.crossFadeChannel( "bgm", soundId, duration );

                sampler.addClass( "is-playing" );
            }
        }
    },


    stopSoundSampler ( sampler ) {
        const button = sampler.find( ".js-sound-button" );

        sampler.removeClass( "is-playing" );
        button.removeClass( "icon--pause" ).addClass( "icon--play2" );
    }
};



// Expose
module.exports = EditorUtil;
