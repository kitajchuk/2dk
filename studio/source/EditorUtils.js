const MediaBox = require( "properjs-mediabox" );
const Cache = require( "./Cache" );
const $ = require( "../node_modules/properjs-hobo/dist/hobo.build" );
const mediabox = new MediaBox();



const EditorUtil = {
    mediabox,


    processSound ( sampler, gameId ) {
        const select = sampler.find( ".js-select-sound" );
        const sound = select[ 0 ].value;
        const soundId = Cache.slugify( `${sound}${sampler.data().spot}` );
        const duration = 1;
        const addMedia = ( snd, sId ) => {
            mediabox.addAudio({
                id: sId,
                src: [`./games/${gameId}/assets/sounds/${snd}`],
                channel: "bgm",
                onloaded () {
                    mediabox.crossFadeChannel( "bgm", sId, duration );
                }
            });
        };
        const addEvent = ( snd, sId ) => {
            mediabox.addMediaEvent( sId, "ended", () => {
                let nextUp = select.find( `option[value="${snd}"]` ).next();

                if ( !nextUp.length ) {
                    nextUp = select.find( "option" ).eq( 1 );
                }

                const _snd = nextUp[ 0 ].value;
                const _sId = Cache.slugify( `${_snd}${sampler.data().spot}` );

                select[ 0 ].selectedIndex = nextUp.index();

                if ( !mediabox.getMedia( _sId ) ) {
                    addMedia( _snd, _sId );
                    addEvent( _snd, _sId );

                } else {
                    mediabox.setMediaProp( _sId, "currentTime", 0 );
                    mediabox.crossFadeChannel( "bgm", _sId, duration );
                }
            });
        };

        if ( sound ) {
            if ( !mediabox.getMedia( soundId ) ) {
                addMedia( sound, soundId );
                addEvent( sound, soundId );

                sampler.addClass( "is-playing" );
                masterSound.addClass( "is-playing" );

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
