const cache = {};



export default class Loader {
    static cash ( id, val ) {
        if ( val ) {
            cache[ id ] = val;
        }

        return ( id ? cache[ id ] : cache );
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
        return new Promise( ( resolve, reject ) => {
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
        return new Promise( ( resolve ) => {
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
        return new Promise( ( resolve ) => {
            if ( cache[ url ] ) {
                return resolve( cache[ url ] );
            }

            fetch( url ).then( ( response ) => {
                response.json().then( ( json ) => {
                    cache[ url ] = json;
                    resolve( cache[ url ] );
                });
            });
        });
    }


    async loadBundle ( game, device, onLoadCallback ) {
        const data = await this.loadJson( game );

        let counter = 0;
    
        // MARK: mobile-audio-disabled
        // Audio is still experimental for mobile so disabling for now...
        const resources = device ? data.bundle.filter( ( url ) => {
            const type = url.split( "/" ).pop().split( "." ).pop();
            return type !== "mp3";
        }) : data.bundle;

        // Map bundle resource URLs to a Loader promise types for initialization...
        await Promise.all(
            resources.map( async ( url ) => {
                await this.load( url );
    
                counter++;

                onLoadCallback( counter, resources.length );
            })
        );

        return data;
    }
}
