const cache = {};



class Loader {
    static cash ( id, val ) {
        if ( val ) {
            cache[ id ] = val;
        }
    
        return (id ? cache[ id ] : cache);
    }


    load ( url ) {
        const type = url.split( "/" ).pop().split( "." ).pop();

        if ( type === "png" ) {
            return this.loadImage( url );

        } else if ( type === "mp3" ) {
            return this.loadAudio( url );

        } else if ( type === "json" ) {
            return this.loadJson( url );
        }
    }


    loadImage ( src ) {
        return new Promise(( resolve, reject ) => {
            if ( cache[ src ] ) {
                return resolve( cache[ src ] );
            }

            const image = new Image();

            image.onload = () => {
                cache[ src ] = image;
                resolve( cache[ src ] );
            };

            image.onerror = () => {
                reject();
            };

            image.src = src;
        });
    }


    loadAudio ( src ) {
        return new Promise(( resolve ) => {
            if ( cache[ src ] ) {
                return resolve( cache[ src ] );
            }

            let audio = new Audio();

            audio.addEventListener( "loadedmetadata", () => {
                cache[ src ] = true;
                audio = null;
                resolve( cache[ src ] );

            }, false );

            audio.muted = true;
            audio.volume = 0;
            audio.src = src;
            audio.load();
        });
    }


    loadJson ( url ) {
        return new Promise(( resolve ) => {
            if ( cache[ url ] ) {
                return resolve( cache[ url ] );
            }

            fetch( url ).then(( response ) => {
                response.json().then(( json ) => {
                    cache[ url ] = json;
                    resolve( cache[ url ] );
                });
            });
        });
    }
}



export default Loader;
