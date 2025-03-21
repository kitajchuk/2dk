const MediaBox = require( "properjs-mediabox" );
const cache = require( "../../server/cache" );
const mediabox = new MediaBox();
const channel = "bgm";
const duration = 1;



const Utils = {
    destroySound () {
        const sounds = mediabox.getAudios();

        mediabox.stopChannel( channel );

        Object.keys( sounds ).forEach( ( id ) => {
            mediabox.destroyMedia( id );
        });
    },


    processSound ( sampler, gameId ) {
        const select = sampler.find( ".js-select-sound" );
        const sound = select[ 0 ].value;
        const soundId = cache.slugify( `${sound}${sampler.data().spot}` );
        const addMedia = ( snd, sId ) => {
            mediabox.addAudio({
                id: sId,
                src: [`./games/${gameId}/assets/sounds/${snd}`],
                channel: "bgm",
                onloaded () {
                    mediabox.crossFadeChannel( channel, sId, duration );
                },
            });
        };
        const addEvent = ( snd, sId ) => {
            mediabox.addMediaEvent( sId, "ended", () => {
                let nextUp = select.find( `option[value="${snd}"]` ).next();

                if ( !nextUp.length ) {
                    nextUp = select.find( "option" ).eq( 1 );
                }

                const _snd = nextUp[ 0 ].value;
                const _sId = cache.slugify( `${_snd}${sampler.data().spot}` );

                select[ 0 ].selectedIndex = nextUp.index();

                if ( !mediabox.getMedia( _sId ) ) {
                    addMedia( _snd, _sId );
                    addEvent( _snd, _sId );

                } else {
                    mediabox.setMediaProp( _sId, "currentTime", 0 );
                    mediabox.crossFadeChannel( channel, _sId, duration );
                }
            });
        };

        if ( sound ) {
            if ( !mediabox.getMedia( soundId ) ) {
                addMedia( sound, soundId );
                addEvent( sound, soundId );

                sampler.addClass( "is-playing" );

            } else if ( ( mediabox.getMedia( soundId ) && mediabox.isPlaying( soundId ) ) ) {
                mediabox.fadeChannelOut( channel, duration );

                sampler.removeClass( "is-playing" );

            } else if ( ( mediabox.getMedia( soundId ) && !mediabox.isPlaying( soundId ) ) ) {
                mediabox.setMediaProp( soundId, "currentTime", 0 );
                mediabox.crossFadeChannel( channel, soundId, duration );

                sampler.addClass( "is-playing" );
            }
        }
    },


    buildSelectMenu ( dom, data ) {
        for ( let i = dom.length; i--; ) {
            let hasValue = false;
            const setValue = dom[ i ].value;

            dom[ i ].innerHTML = `<option value="">${dom[ i ].dataset.label}</option>`;

            // Convert {object} to [array]
            if ( !Array.isArray( data ) ) {
                const arr = [];

                Object.keys( data ).forEach( ( i ) => {
                    arr.push( data[ i ] );
                });

                data = arr;
            }

            data.forEach( ( dt ) => {
                const opt = document.createElement( "option" );
                const label = ( typeof dt === "object" ) ? dt.name : String( dt );
                const value = ( typeof dt === "object" ) ? dt.id : String( dt );

                opt.innerHTML = label;
                opt.value = value;

                dom[ i ].appendChild( opt );

                if ( setValue === value ) {
                    hasValue = true;
                }
            });

            dom[ i ].value = ( hasValue ? setValue : "" );
        }
    },


    parseFields ( fields ) {
        const data = {};

        for ( let i = fields.length; i--; ) {
            let value = null;

            // Checkboxes
            if ( fields[ i ].type === "checkbox" ) {
                value = fields[ i ].checked;

            // Radios
            } else if ( fields[ i ].type === "radio" ) {
                if ( fields[ i ].checked ) {
                    value = fields[ i ].value;
                }

            // Numbers
            } else if ( fields[ i ].type === "number" ) {
                value = parseInt( fields[ i ].value, 10 );

            // Inputs / Selects
            } else {
                value = fields[ i ].value;
            }

            if ( value ) {
                data[ fields[ i ].name ] = value;
            }
        }

        return data;
    },
};



// Expose
module.exports = Utils;
