const path = require( "path" );
const Utils = require( "./Utils" );
const Cache = require( "./Cache" );
const lager = require( "properjs-lager" );
const jimp = require( "jimp" );
const paths = {
    games: path.join( process.cwd(), "games.json" ),
    models: path.join( __dirname, "../../models/" ),
    templates: path.join( __dirname, "../../templates/" ),
};


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
                lager.info( `DB-${this.gameId}: loaded tiles` );
            });

            Utils.readDir( this.files.sprites, ( files ) => {
                this.cache.set( "sprites", files );
                lager.info( `DB-${this.gameId}: loaded sprites` );
            });

            Utils.readDir( this.files.snapshots, ( files ) => {
                this.cache.set( "snapshots", files );
                lager.info( `DB-${this.gameId}: loaded snapshots` );
            });

            Utils.readDir( this.files.sounds, ( files ) => {
                this.cache.set( "sounds", files );
                lager.info( `DB-${this.gameId}: loaded sounds` );
            });

            Utils.readDir( this.mapsPath, ( files ) => {
                const maps = [];

                files.forEach(( file ) => {
                    maps.push( Utils.readJson( path.join( this.mapsPath, file ) ) );
                });

                this.cache.set( "maps", maps );
                lager.info( `DB-${this.gameId}: loaded maps` );
            });

            Utils.readJson( this.gamePath, ( data ) => {
                this.cache.set( "game", data );
                lager.info( `DB-${this.gameId}: loaded game` );
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
    // { fileName, fileData, type }
    addFile ( data ) {
        return new Promise(( resolve ) => {
            let files = null;
            const ext = data.fileName.split( "." ).pop();
            const rExt = new RegExp( `.${ext}$` );
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
            // const game = this.cache.get( "game" );
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

    updateIcon ( data ) {
        return new Promise(( resolve ) => {
            const buffer = Buffer.from( data.fileData.replace( /^data:.*?;base64,/, "" ), "base64" );
            const game = this.cache.get( "game" );
            const file = path.join( process.cwd(), "games", game.game.id, "icon.png" );

            lager.info( `DB-${this.gameId}: update game icon` );

            // Create webapp icons...
            jimp.read( file ).then(( icon ) => {
                let img = icon.clone();

                // apple-icon.png / 192x192
                img.resize( 192, 192 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon.png" ) );

                img = icon.clone();

                // apple-icon-precomposed.png / 192x192
                img.resize( 192, 192 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-precomposed.png" ) );

                img = icon.clone();

                // apple-icon-57x57.png
                img.resize( 57, 57 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-57x57.png" ) );

                img = icon.clone();

                // apple-icon-60x60.png
                img.resize( 60, 60 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-60x60.png" ) );

                img = icon.clone();

                // apple-icon-72x72.png
                img.resize( 72, 72 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-72x72.png" ) );

                img = icon.clone();

                // apple-icon-76x76.png
                img.resize( 76, 76 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-76x76.png" ) );

                img = icon.clone();

                // apple-icon-114x114.png
                img.resize( 114, 114 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-114x114.png" ) );

                img = icon.clone();

                // apple-icon-120x120.png
                img.resize( 120, 120 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-120x120.png" ) );

                img = icon.clone();

                // apple-icon-144x144.png
                img.resize( 144, 144 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-144x144.png" ) );

                img = icon.clone();

                // apple-icon-152x152.png
                img.resize( 152, 152 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-152x152.png" ) );

                img = icon.clone();

                // apple-icon-180x180.png
                img.resize( 180, 180 );
                img.quality( 100 );
                img.write( file.replace( "icon.png", "apple-icon-180x180.png" ) );
            });

            Utils.writeFile( file, buffer, () => {
                resolve( game.game );
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

        game.game.save = game.game.save + 1;
        game.bundle = bundle;

        worker = worker.replace( "{__CACHE_VERSION__}", `v${game.game.save}` );
        worker = worker.replace( "{__CACHE_LIST__}", caches.join( "\n" ) );

        Utils.writeFile( file, worker, () => {
            lager.info( `DB-${this.gameId}: worker updated` );

            DB.updateGame( game );
        });
    }
}


/******************************************************************************
 * STATIC methods...
*******************************************************************************/
DB.getModel = ( model ) => {
    return Utils.copyObj( require( path.join( paths.models, model ) ) );
};


DB.getTemplate = ( template ) => {
    return Utils.readFile( path.join( paths.templates, template ) );
};


DB.getGames = () => {
    return new Promise(( resolve ) => {
        Utils.readJson( paths.games, ( json ) => {
            resolve({
                games: json,
            });
        });
    });
};


DB.updateGame = ( data ) => {
    const gameDir = path.join( process.cwd(), "games", data.game.id );
    const indexHtml = DB.getTemplate( "index.html" )
                        .replace( /\{__GAME_ID__\}/g, data.game.id )
                        .replace( /\{__GAME_NAME__\}/g, data.game.name )
                        .replace( /\{__GAME_VERSION__\}/g, data.game.save );

    // Update game index.html
    Utils.writeFile( path.join( gameDir, "index.html" ), indexHtml );

    // Save new game data
    Utils.writeJson( path.join( gameDir, "game.json" ), data );

    // Update games.json root
    DB.getGames().then(( json ) => {
        json.games.forEach(( gm, i ) => {
            if ( gm.id === data.game.id ) {
                json.games[ i ] = data.game;
            }
        });

        Utils.writeJson( paths.games, json.games );
    });
};


DB.addGame = ( data ) => {
    return new Promise(( resolve ) => {
        DB.getGames().then(( json ) => {
            const games = json.games;
            const gameModel = DB.getModel( "game" );

            gameModel.game.id = Cache.slugify( data.name );
            gameModel.game.name = data.name;
            gameModel.game.width = Number( data.width ) || gameModel.game.width;
            gameModel.game.height = Number( data.height ) || gameModel.game.height;
            gameModel.game.resolution = Number( data.resolution ) || gameModel.game.resolution;
            gameModel.game.icon = `/games/${gameModel.game.id}/icon.png`;

            games.push( gameModel.game );

            const gameDir = path.join( process.cwd(), "games", gameModel.game.id );
            const mapsDir = path.join( gameDir, "maps" );
            const assetsDir = path.join( gameDir, "assets" );
            const indexHtml = DB.getTemplate( "index.html" )
                                .replace( /\{__GAME_ID__\}/g, gameModel.game.id )
                                .replace( /\{__GAME_NAME__\}/g, gameModel.game.name )
                                .replace( /\{__GAME_VERSION__\}/g, gameModel.game.save );

            Utils.makeDir( gameDir );
            Utils.makeDir( mapsDir );
            Utils.makeDir( assetsDir );
            Utils.makeDir( path.join( assetsDir, "tiles" ) );
            Utils.makeDir( path.join( assetsDir, "sprites" ) );
            Utils.makeDir( path.join( assetsDir, "sounds" ) );
            Utils.makeDir( path.join( assetsDir, "snapshots" ) );
            Utils.writeFile( path.join( gameDir, "index.html" ), indexHtml );
            Utils.copyFile( path.join( paths.templates, "icon.png" ), path.join( gameDir, "icon.png" ) );

            Utils.writeJson( paths.games, games, () => {
                Utils.writeJson( path.join( gameDir, "game.json" ), gameModel, () => {
                    lager.info( `DB-static: created game ${gameModel.game.id}` );

                    resolve({
                        game: gameModel,
                        games,
                    });
                });
            });
        });
    });
};


DB.deleteGame = ( data ) => {
    return new Promise(( resolve ) => {
        DB.getGames().then(( json ) => {
            const gamePath = path.join( process.cwd(), "games", data.id );
            const game = json.games.find(( gm ) => {
                return (gm.id === data.id);
            });

            json.games.splice( json.games.indexOf( game ), 1 );

            Utils.writeJson( paths.games, json.games );
            Utils.removeDir( gamePath, () => {
                lager.info( `DB-static: deleted game ${game.id}` );

                resolve( json );
            });
        });
    });
};


// Export
module.exports = DB;
