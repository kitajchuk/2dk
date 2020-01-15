const path = require( "path" );
const Utils = require( "./Utils" );
const Cache = require( "./Cache" );
const lager = require( "properjs-lager" );
const jimp = require( "jimp" );


class DB {
    constructor () {}

    /******************************************************************************
     * OPEN DB
    *******************************************************************************/
    open ( id ) {
        return new Promise(( resolve ) => {
            this.gameId = id;
            this.gameRoot = path.join( process.cwd(), "games", this.gameId );
            this.gamePath = path.join( this.gameRoot, "game.json" );
            this.mapsPath = path.join( this.gameRoot, "maps" );
            this.files = {
                tiles: path.join( this.gameRoot, "assets", "tiles" ),
                sprites: path.join( this.gameRoot, "assets", "sprites" ),
                sounds: path.join( this.gameRoot, "assets", "sounds" ),
                snapshots: path.join( this.gameRoot, "assets", "snapshots" )
            };
            this.cache = new Cache();
            this.cache.clear();

            lager.info( `DB-${this.gameId}: opened` );

            Utils.readDir( this.files.tiles, ( files ) => {
                this.cache.set( "tiles", files );
                lager.info( `DB-${this.gameId}: cached tiles` );
            });

            Utils.readDir( this.files.sprites, ( files ) => {
                this.cache.set( "sprites", files );
                lager.info( `DB-${this.gameId}: cached sprites` );
            });

            Utils.readDir( this.files.snapshots, ( files ) => {
                this.cache.set( "snapshots", files );
                lager.info( `DB-${this.gameId}: cached snapshots` );
            });

            Utils.readDir( this.files.sounds, ( files ) => {
                this.cache.set( "sounds", files );
                lager.info( `DB-${this.gameId}: cached sounds` );
            });

            Utils.readDir( this.mapsPath, ( files ) => {
                const maps = [];

                files.forEach(( file ) => {
                    maps.push( Utils.readJson( path.join( this.mapsPath, file ) ) );
                });

                this.cache.set( "maps", maps );
                lager.info( `DB-${this.gameId}: cached maps` );
            });

            Utils.readJson( this.gamePath, ( data ) => {
                this.cache.set( "game", data );
                lager.info( `DB-${this.gameId}: cached game` );
                resolve();
            });
        });
    }

    /******************************************************************************
     * GET Private events
    *******************************************************************************/
    // Use _getMap internally for pin actions
    _getMap ( id ) {
        return this.cache.get( "maps" ).find(( map ) => {
            return (map.id === id);
        });
    }

    // Use _getMergedMap internally for resolving the Promise
    // with merged map pin data back to client
    _getMergedMap ( id ) {
        const map = Utils.copyObj(this.cache.get( "maps" ).find(( map ) => {
            return (map.id === id);
        }));

        return map;
    }

    /******************************************************************************
     * GET public events
    *******************************************************************************/
    getGame () {
        return new Promise(( resolve ) => {
            resolve({
                game: this.cache.get( "game" ),
            });
        });
    }

    getMaps () {
        return new Promise(( resolve ) => {
            const maps = this.cache.get( "maps" ).map(( map ) => {
                return this._getMergedMap( map.id );
            });

            resolve({
                maps,
            });
        });
    }

    getMap ( data ) {
        return new Promise(( resolve ) => {
            resolve({
                map: this._getMergedMap( data.id ),
            });
        });
    }

    getFiles ( type ) {
        return new Promise(( resolve ) => {
            const files = this.cache.get( type );

            if ( files ) {
                resolve({
                    type,
                    files,
                });

            } else {
                Utils.readDir( this.files[ type ], ( theFiles ) => {
                    this.cache.set( type, theFiles );

                    resolve({
                        type,
                        files: theFiles,
                    });
                });
            }
        });
    }

    /******************************************************************************
     * CREATE Events
    *******************************************************************************/
    addFile ( data ) {
        return new Promise(( resolve, reject ) => {
            let files = null;
            const ext = data.fileName.split( "." ).pop();
            const rExt = new RegExp( `\.${ext}$` );
            const name = `${Cache.slugify( data.fileName.replace( rExt, "" ) )}.${ext}`;
            const file = path.join( this.files[ data.type ], name );
            const buffer = Buffer.from( data.fileData.replace( /^data:.*?;base64,/, "" ), "base64" );

            Utils.isFile( file, ( exists ) => {
                files = this.cache.get( data.type );

                if ( exists ) {
                    lager.info( `DB-${this.gameId}: overwrite file ${name}` );

                } else {
                    lager.info( `DB-${this.gameId}: create new file ${name}` );
                    files.push( name );
                }

                this.cache.set( data.type, files );

                Utils.writeFile( file, buffer, () => {
                    if ( data.type === "snapshots" ) {
                        jimp.read( file ).then(( snapshot ) => {
                            const thumbFile = file.replace( /\.png$/, "-thumb.png" );

                            snapshot.resize( 512, jimp.AUTO );
                            snapshot.quality( 100 );
                            snapshot.write( thumbFile );
                            lager.info( `DB-${this.gameId}: write file ${thumbFile.split( "/" ).pop()}` );
                        });

                    } else {
                        this.updateWorker();
                    }

                    resolve({
                        type: data.type,
                        files,
                    });
                });
            });
        });
    }

    addMap ( data ) {
        return new Promise(( resolve ) => {
            const map = DB.getModel( "map" );
            const game = this.cache.get( "game" );
            const mapjson = path.join( this.mapsPath, data.fileName );

            map.id = Cache.slugify( data.name );
            map.name = data.name;
            map.tilesize = Number( data.tilesize );
            map.tilewidth = Number( data.tilewidth );
            map.tileheight = Number( data.tileheight );
            map.height = map.tileheight * map.tilesize;
            map.width = map.tilewidth * map.tilesize;
            map.image = `/games/${this.gameId}/assets/tiles/${data.image}`;
            map.sound = data.sound ? `/games/${this.gameId}/assets/sounds/${data.sound}` : map.sound;
            // map.snapshot = `/games/${this.gameId}/assets/snapshots/${map.id}.png`;
            // map.thumbnail = `/games/${this.gameId}/assets/snapshots/${map.id}-thumb.png`;

            for ( let y = map.tileheight; y--; ) {
                map.textures.background[ y ] = [];
                map.textures.foreground[ y ] = [];

                for ( let x = map.tilewidth; x--; ) {
                    map.textures.background[ y ][ x ] = 0;
                    map.textures.foreground[ y ][ x ] = 0;
                }
            }

            Utils.writeJson( mapjson, map, () => {
                lager.info( `DB-${this.gameId}: create map ${map.id}` );

                const maps = this.cache.get( "maps" );

                maps.push( map );

                this.cache.set( "maps", maps );

                this.updateWorker();

                resolve({
                    map,
                    maps,
                });
            });
        });
    }

    /******************************************************************************
     * UPDATE Events
    *******************************************************************************/
    updateMap ( data ) {
        return new Promise(( resolve ) => {
            const maps = this.cache.get( "maps" );
            const map = this._getMap( data.id );
            const idx = maps.indexOf( map );
            const file = path.join( this.mapsPath, `${map.id}.json` );

            // map.id = Cache.slugify( data.name );
            map.name = data.name;
            map.tilesize = Number( data.tilesize );
            map.tilewidth = Number( data.tilewidth );
            map.tileheight = Number( data.tileheight );
            map.height = map.tileheight * map.tilesize;
            map.width = map.tilewidth * map.tilesize;
            map.image = `/games/${this.gameId}/assets/tiles/${data.image}`;
            map.sound = data.sound ? `/games/${this.gameId}/assets/sounds/${data.sound}` : map.sound;
            map.snapshot = `/games/${this.gameId}/assets/snapshots/${map.id}.png`;
            map.thumbnail = `/games/${this.gameId}/assets/snapshots/${map.id}-thumb.png`;
            map.collision = data.collision;
            map.textures = data.textures;

            Utils.writeJson( file, map, () => {
                maps.splice( idx, 1, map );

                this.cache.set( "maps", maps );

                lager.info( `DB-${this.gameId}: update map ${map.id}` );

                this.updateWorker();

                resolve({
                    map: this._getMergedMap( map.id ),
                    maps,
                });
            });
        });
    }

    /******************************************************************************
     * DELETE Events
    *******************************************************************************/
    deleteMap ( data ) {
        return new Promise(( resolve ) => {
            const file = path.join( this.mapsPath, `${data.id}.json` );
            const maps = this.cache.get( "maps" );
            const map = this._getMap( data.id );
            const idx = maps.indexOf( map );

            Utils.removeFile( file, () => {
                maps.splice( idx, 1 );

                this.cache.set( "maps", maps );

                lager.info( `DB-${this.gameId}: deleted map ${map.id}` );

                this.updateWorker();

                resolve({
                    map,
                    maps,
                });
            });
        });
    }

    deleteFile ( data ) {
        return new Promise(( resolve ) => {
            const file = path.join( this.files[ data.type ], data.fileName );
            const files = this.cache.get( data.type );
            const idx = files.indexOf( data.fileName );

            Utils.removeFile( file, () => {
                files.splice( idx, 1 );

                this.cache.set( data.type, files );

                lager.info( `DB-${this.gameId}: deleted ${data.type} file ${data.fileName}` );

                this.updateWorker();

                resolve({
                    type: data.type,
                    files,
                });
            });
        });
    }

    /******************************************************************************
     * Service Worker CACHE LIST
    *******************************************************************************/
    updateWorker () {
        let worker = DB.getTemplate( "worker.js" );
        const file = path.join( this.gameRoot, "worker.js" );
        const game = this.cache.get( "game" );
        const bundle = [];
        const caches = [
            `"/games/${this.gameId}/game.json",`,
        ];

        this.cache.get( "tiles" ).forEach(( tile ) => {
            caches.push( `    "/games/${this.gameId}/assets/tiles/${tile}",` );
            bundle.push( `/games/${this.gameId}/assets/tiles/${tile}` );
        });

        this.cache.get( "sprites" ).forEach(( sprite ) => {
            caches.push( `    "/games/${this.gameId}/assets/sprites/${sprite}",` );
            bundle.push( `/games/${this.gameId}/assets/sprites/${sprite}` );
        });

        this.cache.get( "sounds" ).forEach(( sound ) => {
            caches.push( `    "/games/${this.gameId}/assets/sounds/${sound}",` );
            bundle.push( `/games/${this.gameId}/assets/sounds/${sound}` );
        });

        this.cache.get( "maps" ).forEach(( map ) => {
            caches.push( `    "/games/${this.gameId}/maps/${map.id}.json",` );
            bundle.push( `/games/${this.gameId}/maps/${map.id}.json` );
        });

        game.game.version = game.game.version + 1;
        game.bundle = bundle;

        worker = worker.replace( "{__CACHE_VERSION__}", `v${game.game.version}` );
        worker = worker.replace( "{__CACHE_LIST__}", caches.join( "\n" ) );

        Utils.writeFile( file, worker, () => {
            lager.info( `DB-${this.gameId}: worker updated` );
            // lager.data( caches );

            DB.updateGame( game );
        });
    }
}


/******************************************************************************
 * STATIC methods...
*******************************************************************************/
DB.getModel = ( model ) => {
    return Utils.copyObj( require( `../../models/${model}` ) );
};


DB.getTemplate = ( template ) => {
    return Utils.readFile( path.join( __dirname, `../../templates/${template}` ) );
};


DB.getGames = () => {
    return new Promise(( resolve ) => {
        Utils.readJson( path.join( process.cwd(), "games.json" ), ( json ) => {
            resolve({
                games: json,
            });
        });
    });
};


DB.updateGame = ( data ) => {
    let games = path.join( process.cwd(), "games.json" );
    const gameDir = path.join( process.cwd(), "games", data.game.id );
    const index = DB.getTemplate( "index.html" ).replace( "{__GAME_NAME__}", data.game.name ).replace( /\{__GAME_VERSION__\}/g, data.game.version );

    // Update game index.html
    Utils.writeFile( path.join( gameDir, "index.html" ), index );

    // Save new game data
    Utils.writeJson( path.join( gameDir, "game.json" ), data );

    // Update games.json root
    Utils.readJson( games, ( json ) => {
        json.forEach(( gm, i ) => {
            if ( gm.id === data.game.id ) {
                json[ i ] = data.game;
            }
        });

        Utils.writeJson( games, json );
    });
};


DB.addGame = ( data ) => {
    return new Promise(( resolve ) => {
        let games = path.join( process.cwd(), "games.json" );
        let gameJson = null;
        const game = DB.getModel( "game" );
        const done = () => {
            const gameDir = path.join( process.cwd(), "games", game.game.id );
            const mapsDir = path.join( gameDir, "maps" );
            const assetsDir = path.join( gameDir, "assets" );
            const index = DB.getTemplate( "index.html" ).replace( "{__GAME_NAME__}", game.game.name ).replace( "{__GAME_VERSION__}", game.game.version );

            Utils.makeDir( gameDir );
            Utils.makeDir( mapsDir );
            Utils.makeDir( assetsDir );
            Utils.makeDir( path.join( assetsDir, "tiles" ) );
            Utils.makeDir( path.join( assetsDir, "sprites" ) );
            Utils.makeDir( path.join( assetsDir, "sounds" ) );
            Utils.makeDir( path.join( assetsDir, "snapshots" ) );
            Utils.writeFile( path.join( gameDir, "index.html" ), index );
            Utils.writeJson( games, gameJson, () => {
                games = path.join( gameDir, "game.json" );

                Utils.writeJson( games, game, () => {
                    lager.info( `DB-static: created game ${game.id}` );

                    resolve({
                        game,
                        games: gameJson,
                    });
                });
            });
        };

        game.game.id = Cache.slugify( data.name );
        game.game.name = data.name;
        game.game.width = Number( data.width ) || game.game.width;
        game.game.height = Number( data.height ) || game.game.height;
        game.game.resolution = Number( data.resolution ) || game.game.resolution;

        Utils.readJson( games, ( json ) => {
            gameJson = json;
            gameJson.push( game.game );
            done();
        });
    });
};


DB.deleteGame = ( data ) => {
    return new Promise(( resolve ) => {
        const jsonPath = path.join( process.cwd(), "games.json" );
        const gamePath = path.join( process.cwd(), "games", data.id );

        Utils.readJson( jsonPath, ( json ) => {
            const game = json.find(( gm ) => {
                return (gm.id === data.id);
            });

            json.splice( json.indexOf( game ), 1 );

            Utils.writeJson( jsonPath, json );
            Utils.removeDir( gamePath, () => {
                lager.info( `DB-static: deleted game ${game.id}` );

                resolve({
                    games: json,
                });
            });
        });
    });
};


// Export
module.exports = {
    DB
};
