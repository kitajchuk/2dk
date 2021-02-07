const $ = require( "../../../../node_modules/properjs-hobo/dist/hobo.build" );
const env = require(  "../../../properjs/js/core/env" ).default;
const cache = require(  "../../../properjs/js/core/cache" ).default;



class Lambda {
    constructor ( player ) {
        this.token = null;
        this.player = player;
        this.baseUrl = env.isDev()
            ? "http://localhost:8888"
            : "https://2dk.kitajchuk.com"
        this.functions = {
            handshake: `${this.baseUrl}/.netlify/functions/handshake/`,
            register: `${this.baseUrl}/.netlify/functions/register/`,
            blit: `${this.baseUrl}/.netlify/functions/blit/`,
        };

        this.init();
    }


    init () {
        this.token = cache.get( "token" );

        if ( this.token ) {
            this.register();

        } else {
            this.fetch( this.functions.handshake )
                .then(( response ) => {
                    cache.set( "token", response.token );

                    this.token = cache.get( "token" );

                    this.register();

                }).catch(( error ) => {
                    console.error( error );
                });
        }
    }


    fetch ( url ) {
        return $.ajax({
            url,
            dataType: "json",
            method: "GET",
            payload: {},
        });
    }


    post ( url, payload ) {
        return $.ajax({
            url,
            dataType: "json",
            method: "POST",
            payload,
        });
    }


    /*
     * Netlify pricing is too much for these functions...
     * Especially considering blit is 60 FPS...
     * https://www.netlify.com/pricing
     * 125k per site /month
     * ($25+ when exceeded)
     */
    register () {
        if ( env.isDev() ) {
            this.post( this.functions.register, { token: this.token, player: this.player.data } );
        }
    }


    blit ( elapsed ) {
        if ( env.isDev() ) {
            this.post( this.functions.blit, { token: this.token, player: this.player.data, elapsed } );
        }
    }
}



module.exports = Lambda;
