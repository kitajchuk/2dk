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


    loadUrl ( url ) {
        const isJson = /\.json$/.test( url );

        return new Promise(( resolve ) => {
            fetch( url ).then(( response ) => {
                resolve( (isJson ? response.json() : response) );
            });
        });
    }
}



module.exports = Loader;
