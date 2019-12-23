const $ = require( "properjs-hobo" );



class Loader {
    constructor () {}

    loadImg ( src ) {
        return new Promise(( resolve, reject ) => {
            const img = new Image();

            img.onload = () => {
                resolve( img );
            };

            img.onerror = () => {
                reject();
            };

            img.src = src;
        });
    }


    loadJson ( url ) {
        return new Promise(( resolve ) => {
            $.ajax({
                url: url,
                dataType: "text"

            }).then(( json ) => {
                try {
                    json = JSON.parse( json );

                } catch ( error ) {
                    throw error;
                }

                resolve( json );
            })
        });
    }
}



module.exports = Loader;
