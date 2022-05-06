const path = require( "path" );
const utils = require( "./utils" );
const cache = require( "./cache" );
const lager = require( "properjs-lager" );
const sharp = require( "sharp" );
const paths = {
    games: path.join( process.cwd(), "games.json" ),
    models: path.join( process.cwd(), "src", "models" ),
    templates: path.join( process.cwd(), "src", "templates" ),
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
            this.cache = new cache();
            this.cache.clear();

            lager.info( `DB-${this.gameId}: opened` );

            utils.readDir( this.files.tiles, ( files ) => {
                this.cache.set( "tiles", files );
                lager.info( `DB-${this.gameId}: loaded tiles` );
            });

            utils.readDir( this.files.sprites, ( files ) => {
                this.cache.set( "sprites", files );
                lager.info( `DB-${this.gameId}: loaded sprites` );
            });

            utils.readDir( this.files.snapshots, ( files ) => {
                this.cache.set( "snapshots", files );
                lager.info( `DB-${this.gameId}: loaded snapshots` );
            });

            utils.readDir( this.files.sounds, ( files ) => {
                this.cache.set( "sounds", files );
                lager.info( `DB-${this.gameId}: loaded sounds` );
            });

            utils.readDir( this.mapsPath, ( files ) => {
                const maps = [];

                files.forEach(( file ) => {
                    maps.push( utils.readJson( path.join( this.mapsPath, file ) ) );
                });

                this.cache.set( "maps", maps );
                lager.info( `DB-${this.gameId}: loaded maps` );
            });

            utils.readJson( this.gamePath, ( data ) => {
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
        const map = utils.copyObj(this.cache.get( "maps" ).find(( map ) => {
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
                utils.readDir( this.files[ type ], ( theFiles ) => {
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
            const name = `${cache.slugify( data.fileName.replace( rExt, "" ) )}.${ext}`;
            const file = path.join( this.files[ data.type ], name );
            const buffer = Buffer.from( data.fileData.replace( /^data:.*?;base64,/, "" ), "base64" );

            utils.isFile( file, ( exists ) => {
                files = this.cache.get( data.type );

                if ( exists ) {
                    lager.info( `DB-${this.gameId}: overwrite file ${name}` );

                } else {
                    lager.info( `DB-${this.gameId}: create new file ${name}` );
                    files.push( name );
                }

                this.cache.set( data.type, files );

                utils.writeFile( file, buffer, async () => {
                    if ( data.type === "snapshots" ) {
                        const thumbFile = file.replace( /\.png$/, "-thumb.png" );

                        await sharp( file )
                            .resize( 512 )
                            .toFile( thumbFile );
                        
                        lager.info( `DB-${this.gameId}: write file ${thumbFile.split( "/" ).pop()}` );

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

            map.id = cache.slugify( data.name );
            map.name = data.name;
            map.tilesize = Number( data.tilesize );
            map.tilewidth = Number( data.tilewidth );
            map.tileheight = Number( data.tileheight );
            map.height = map.tileheight * map.tilesize;
            map.width = map.tilewidth * map.tilesize;
            map.cellauto = data.cellauto;
            map.image = `assets/tiles/${data.image}`;
            map.sound = data.sound ? `assets/sounds/${data.sound}` : map.sound;
            // map.snapshot = `assets/snapshots/${map.id}.png`;
            // map.thumbnail = `assets/snapshots/${map.id}-thumb.png`;

            for ( let y = map.tileheight; y--; ) {
                map.textures.background[ y ] = [];
                map.textures.foreground[ y ] = [];

                for ( let x = map.tilewidth; x--; ) {
                    map.textures.background[ y ][ x ] = 0;
                    map.textures.foreground[ y ][ x ] = 0;
                }
            }

            utils.writeJson( mapjson, map, () => {
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

            // map.id = cache.slugify( data.name );
            map.name = data.name;
            map.tilesize = Number( data.tilesize );
            map.tilewidth = Number( data.tilewidth );
            map.tileheight = Number( data.tileheight );
            map.height = map.tileheight * map.tilesize;
            map.width = map.tilewidth * map.tilesize;
            map.cellauto = data.cellauto;
            map.image = `assets/tiles/${data.image}`;
            map.sound = data.sound ? `assets/sounds/${data.sound}` : map.sound;
            map.snapshot = `assets/snapshots/${map.id}.png`;
            map.thumbnail = `assets/snapshots/${map.id}-thumb.png`;
            map.collision = data.collision;
            map.textures = data.textures;

            // Active Tiles
            map.tiles = data.tiles || map.tiles;

            utils.writeJson( file, map, () => {
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
        return new Promise(async ( resolve ) => {
            const buffer = Buffer.from( data.fileData.replace( /^data:.*?;base64,/, "" ), "base64" );
            const game = this.cache.get( "game" );
            const file = path.join( process.cwd(), "games", game.game.id, "icon.png" );

            lager.info( `DB-${this.gameId}: update game icon` );

            // Create webapp icons...
            await sharp( file )
                .resize( 1024 )
                .toFile( file.replace( "icon.png", "icon1024.png" ) );
            
            await sharp( file )
                .resize( 512 )
                .toFile( file.replace( "icon.png", "icon512.png" ) );
            
            await sharp( file )
                .resize( 384 )
                .toFile( file.replace( "icon.png", "icon384.png" ) );
            
            await sharp( file )
                .resize( 192 )
                .toFile( file.replace( "icon.png", "icon192.png" ) );
            
            await sharp( file )
                .resize( 64 )
                .toFile( file.replace( "icon.png", "favicon.ico" ) );

            utils.writeFile( file, buffer, () => {
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

            utils.removeFile( file, () => {
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

            utils.removeFile( file, () => {
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
        let worker = DB.getTemplate( "sw.js" );
        const file = path.join( this.gameRoot, "sw.js" );
        const game = this.cache.get( "game" );
        const bundle = [];
        const caches = [
            `"",`,
            `    "index.html",`,
            `    "game.json",`,
            `    "2dk.css",`,
            `    "app.js",`,
            `    "favicon.ico",`,
            `    "manifest.json",`,
            `    "icon.png",`,
            `    "icon192.png",`,
            `    "icon384.png",`,
            `    "icon512.png",`,
            `    "icon1024.png",`,
        ];

        this.cache.get( "tiles" ).forEach(( tile ) => {
            caches.push( `    "assets/tiles/${tile}",` );
            bundle.push( `assets/tiles/${tile}` );
        });

        this.cache.get( "sprites" ).forEach(( sprite ) => {
            caches.push( `    "assets/sprites/${sprite}",` );
            bundle.push( `assets/sprites/${sprite}` );
        });

        this.cache.get( "sounds" ).forEach(( sound ) => {
            caches.push( `    "assets/sounds/${sound}",` );
            bundle.push( `assets/sounds/${sound}` );
        });

        this.cache.get( "maps" ).forEach(( map ) => {
            caches.push( `    "maps/${map.id}.json",` );
            bundle.push( `maps/${map.id}.json` );
        });

        game.game.save = game.game.save + 1;
        game.bundle = bundle;

        worker = worker.replace( "{__CACHE_VERSION__}", `v${game.game.save}` );
        worker = worker.replace( "{__CACHE_LIST__}", caches.join( "\n" ) );

        utils.writeFile( file, worker, () => {
            lager.info( `DB-${this.gameId}: service worker updated` );

            DB.updateGame( game );
        });
    }
}


/******************************************************************************
 * STATIC methods...
*******************************************************************************/
DB.getModel = ( model ) => {
    return utils.copyObj( require( path.join( paths.models, model ) ) );
};


DB.getTemplate = ( template ) => {
    return utils.readFile( path.join( paths.templates, template ) );
};


DB.getGames = () => {
    return new Promise(( resolve ) => {
        utils.readJson( paths.games, ( json ) => {
            resolve({
                games: json,
            });
        });
    });
};


DB.updateGame = ( data ) => {
    const gameDir = path.join( process.cwd(), "games", data.game.id );
    const manifestJson = DB.getTemplate( "manifest.json" )
                           .replace( /\{__GAME_NAME__\}/g, data.game.name );
    const indexHtml = DB.getTemplate( "index.html" )
                        .replace( /\{__GAME_ID__\}/g, data.game.id )
                        .replace( /\{__GAME_NAME__\}/g, data.game.name )
                        .replace( /\{__GAME_VERSION__\}/g, data.game.save );

    // Update game index.html
    utils.writeFile( path.join( gameDir, "index.html" ), indexHtml );
    lager.info( `DB-static: saved new index.html for ${data.game.id}` );

    // Update web app manifest
    utils.writeFile( path.join( gameDir, "manifest.json" ), manifestJson );
    lager.info( `DB-static: saved new manifest.json for ${data.game.id}` );

    // Save new game data
    utils.writeJson( path.join( gameDir, "game.json" ), data );
    lager.info( `DB-static: saved new game.json for ${data.game.id}` );

    // Update core 2dk lib and styles
    utils.copyFile( path.join( paths.templates, "app.js" ), path.join( gameDir, "app.js" ) );
    utils.copyFile( path.join( paths.templates, "2dk.css" ), path.join( gameDir, "2dk.css" ) );
    lager.info( `DB-static: copied app.js and 2dk.css for ${data.game.id}` );

    // Update core fonts
    utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Regular.woff" ), path.join( gameDir, "fonts", "Calamity-Regular.woff" ) );
    utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Regular.woff2" ), path.join( gameDir, "fonts", "Calamity-Regular.woff2" ) );
    utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Bold.woff" ), path.join( gameDir, "fonts", "Calamity-Bold.woff" ) );
    utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Bold.woff2" ), path.join( gameDir, "fonts", "Calamity-Bold.woff2" ) );
    lager.info( `DB-static: copied fonts for ${data.game.id}` );

    // Update games.json root
    DB.getGames().then(( json ) => {
        json.games.forEach(( gm, i ) => {
            if ( gm.id === data.game.id ) {
                json.games[ i ] = data.game;
            }
        });

        utils.writeJson( paths.games, json.games );
    });
};


DB.addGame = ( data ) => {
    return new Promise(( resolve ) => {
        DB.getGames().then(( json ) => {
            const games = json.games;
            const gameModel = DB.getModel( "game" );

            gameModel.game.id = cache.slugify( data.name );
            gameModel.game.name = data.name;
            gameModel.game.width = Number( data.width ) || gameModel.game.width;
            gameModel.game.height = Number( data.height ) || gameModel.game.height;
            gameModel.game.resolution = Number( data.resolution ) || gameModel.game.resolution;
            gameModel.game.icon = "icon.png";

            games.push( gameModel.game );

            const gameDir = path.join( process.cwd(), "games", gameModel.game.id );
            const mapsDir = path.join( gameDir, "maps" );
            const fontsDir = path.join( gameDir, "fonts" );
            const assetsDir = path.join( gameDir, "assets" );
            const manifestJson = DB.getTemplate( "manifest.json" )
                                .replace( /\{__GAME_NAME__\}/g, gameModel.game.name );
            const indexHtml = DB.getTemplate( "index.html" )
                                .replace( /\{__GAME_ID__\}/g, gameModel.game.id )
                                .replace( /\{__GAME_NAME__\}/g, gameModel.game.name )
                                .replace( /\{__GAME_VERSION__\}/g, gameModel.game.save );

            utils.makeDir( gameDir );
            utils.makeDir( mapsDir );
            utils.makeDir( fontsDir );
            utils.makeDir( assetsDir );
            utils.makeDir( path.join( assetsDir, "tiles" ) );
            utils.makeDir( path.join( assetsDir, "sprites" ) );
            utils.makeDir( path.join( assetsDir, "sounds" ) );
            utils.makeDir( path.join( assetsDir, "snapshots" ) );
            utils.writeFile( path.join( gameDir, "index.html" ), indexHtml );
            utils.writeFile( path.join( gameDir, "manifest.json" ), manifestJson );
            utils.copyFile( path.join( paths.templates, "icon.png" ), path.join( gameDir, "icon.png" ) );
            utils.copyFile( path.join( paths.templates, "app.js" ), path.join( gameDir, "app.js" ) );
            utils.copyFile( path.join( paths.templates, "2dk.css" ), path.join( gameDir, "2dk.css" ) );
            utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Regular.woff" ), path.join( gameDir, "fonts", "Calamity-Regular.woff" ) );
            utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Regular.woff2" ), path.join( gameDir, "fonts", "Calamity-Regular.woff2" ) );
            utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Bold.woff" ), path.join( gameDir, "fonts", "Calamity-Bold.woff" ) );
            utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Bold.woff2" ), path.join( gameDir, "fonts", "Calamity-Bold.woff2" ) );

            utils.writeJson( paths.games, games, () => {
                utils.writeJson( path.join( gameDir, "game.json" ), gameModel, () => {
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

            utils.writeJson( paths.games, json.games );
            utils.removeDir( gamePath, () => {
                lager.info( `DB-static: deleted game ${game.id}` );

                resolve( json );
            });
        });
    });
};


// Export
module.exports = {
    DB,
};
