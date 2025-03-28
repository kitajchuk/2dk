const cache = require( "../../server/cache" );
const MediaBox = require( "properjs-mediabox" );


const mediabox = new MediaBox();
const channel = "bgm";
const duration = 1;


const Utils = {
    clearTile ( ctx, x, y, w, h ) {
        ctx.clearRect(
            x,
            y,
            w,
            h
        );
    },


    sortCoords ( cA, cB ) {
        if ( cA[ 1 ] < cB[ 1 ] ) {
            return -1;
    
        } else if ( cA[ 1 ] === cB[ 1 ] && cA[ 0 ] < cB[ 0 ] ) {
            return -1;
    
        } else {
            return 1;
        }
    },


    destroySound () {
        const sounds = mediabox.getAudios();

        mediabox.stopChannel( channel );

        Object.keys( sounds ).forEach( ( id ) => {
            mediabox.destroyMedia( id );
        });
    },


    processSound ( sampler, gameId ) {
        const select = sampler.querySelector( ".js-select-sounds" );
        const options = [ ...select.querySelectorAll( "option" ) ];
        const sound = select.value;
        const data = sampler.dataset;
        const soundId = cache.slugify( `${sound}${data.spot}` );
        const addMedia = ( snd, sId ) => {
            mediabox.addAudio({
                id: sId,
                src: [`./games/${gameId}/assets/sounds/${snd}`],
                channel,
                onloaded () {
                    mediabox.crossFadeChannel( channel, sId, duration );
                },
            });
        };
        const addEvent = ( snd, sId ) => {
            mediabox.addMediaEvent( sId, "ended", () => {
                let nextUp = options.find( ( opt ) => {
                    return opt.value === snd;
                } )?.nextElementSibling;

                if ( !nextUp ) {
                    // Circle back to the first option
                    nextUp = select.querySelector( "option:nth-child(2)" );
                }

                const _snd = nextUp.value;
                const _sId = cache.slugify( `${_snd}${data.spot}` );

                select.selectedIndex = options.indexOf( nextUp );

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

                sampler.classList.add( "is-playing" );

            } else if ( ( mediabox.getMedia( soundId ) && mediabox.isPlaying( soundId ) ) ) {
                mediabox.fadeChannelOut( channel, duration );

                sampler.classList.remove( "is-playing" );

            } else if ( ( mediabox.getMedia( soundId ) && !mediabox.isPlaying( soundId ) ) ) {
                mediabox.setMediaProp( soundId, "currentTime", 0 );
                mediabox.crossFadeChannel( channel, soundId, duration );

                sampler.classList.add( "is-playing" );
            }
        }
    },


    getOptionData ( data ) {
        let newData = structuredClone( data );

        // Convert {object} to [array]
        if ( !Array.isArray( newData ) ) {
            const arr = [];

            Object.keys( data ).forEach( ( i ) => {
                arr.push( data[ i ] );
            });

            newData = arr;
        }

        return newData;
    },


    buildSelectMenu ( dom, data ) {
        for ( let i = dom.length; i--; ) {
            let hasValue = false;
            const setValue = dom[ i ].value;

            dom[ i ].innerHTML = `<option value="">${dom[ i ].dataset.label}</option>`;

            const newData = this.getOptionData( data );

            newData.forEach( ( dt ) => {
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

            // Numbers
            } else if ( fields[ i ].type === "number" || fields[ i ].type === "range" ) {
                value = parseFloat( fields[ i ].value );

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
