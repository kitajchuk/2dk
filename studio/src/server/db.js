const path = require( "path" );
const lager = require( "properjs-lager" );
const sharp = require( "sharp" );
const shell = require( "shelljs" );
const { Lame } = require( "node-lame" );
const utils = require( "./utils" );
const Cache = require( "./cache" );



const paths = {
    games: path.join( process.cwd(), "games.json" ),
    models: path.join( process.cwd(), "src", "models" ),
    templates: path.join( process.cwd(), "src", "templates" ),
};
const models = {
    game: require( path.join( paths.models, "game" ) ),
    map: require( path.join( paths.models, "map" ) ),
};
const templates = {
    "sw": utils.readFile( path.join( paths.templates, "sw.js" ) ),
    "index": utils.readFile( path.join( paths.templates, "index.html" ) ),
    "manifest": utils.readFile( path.join( paths.templates, "manifest.json" ) ),
};



class DB {
    /******************************************************************************
     * LOGS
    *******************************************************************************/
    logInfo ( ...args ) {
        lager.info( `DB-${this.gameId}:`, ...args );
    }

    /******************************************************************************
     * OPEN DB
    *******************************************************************************/
    async open ( id ) {
        this.gameId = id;
        this.gameRoot = path.join( process.cwd(), "games", this.gameId );
        this.gamePath = path.join( this.gameRoot, "game.json" );
        this.mapsPath = path.join( this.gameRoot, "maps" );
        this.files = {
            tiles: path.join( this.gameRoot, "assets", "tiles" ),
            sprites: path.join( this.gameRoot, "assets", "sprites" ),
            sounds: path.join( this.gameRoot, "assets", "sounds" ),
            snapshots: path.join( this.gameRoot, "assets", "snapshots" ),
        };
        this.cache = new Cache();

        this.logInfo( "opened" );

        const loadMaps = async () => {
            const mapsJSON = await utils.readDir( this.mapsPath );
            const maps = await Promise.all(mapsJSON.map( async ( file ) => {
                return await utils.readJson( path.join( this.mapsPath, file ) );
            }));
            this.cache.set( "maps", maps );
            this.logInfo( "loaded maps" );
        };

        await Promise.all([
            loadMaps(),
            utils.readJson( this.gamePath ).then( ( game ) => {
                this.cache.set( "game", game );
                this.logInfo( "loaded game" );
            }),
            utils.readDir( this.files.tiles ).then( ( tiles ) => {
                this.cache.set( "tiles", tiles );
                this.logInfo( "loaded tiles" );
            }),
            utils.readDir( this.files.sprites ).then( ( sprites ) => {
                this.cache.set( "sprites", sprites );
                this.logInfo( "loaded sprites" );
            }),
            utils.readDir( this.files.snapshots ).then( ( snapshots ) => {
                this.cache.set( "snapshots", snapshots );
                this.logInfo( "loaded snapshots" );
            }),
            utils.readDir( this.files.sounds ).then( ( sounds ) => {
                this.cache.set( "sounds", sounds );
                this.logInfo( "loaded sounds" );
            }),
        ]);

        this.logInfo( "ready" );

        return Promise.resolve();
    }

    /******************************************************************************
     * GET Private events
    *******************************************************************************/
    // Use _getMap internally for pin actions
    _getMap ( id ) {
        return this.cache.get( "maps" ).find( ( map ) => {
            return ( map.id === id );
        });
    }

    // Use _getMergedMap internally for resolving the Promise
    // with merged map pin data back to client
    _getMergedMap ( id ) {
        const map = structuredClone( this.cache.get( "maps" ).find( ( map ) => {
            return ( map.id === id );
        }) );

        return map;
    }

    /******************************************************************************
     * GET public events
    *******************************************************************************/
    async getGame () {
        return this.cache.get( "game" );
    }

    async getMaps () {
        return this.cache.get( "maps" ).map( ( map ) => {
            return this._getMergedMap( map.id );
        });
    }

    async getMap ( data ) {
        return this._getMergedMap( data.id );
    }

    async getFiles ( type ) {
        const files = this.cache.get( type );

        if ( files ) {
            return {
                type,
                files,
            };

        } else {
            const theFiles = await utils.readDir( this.files[ type ] );
            this.cache.set( type, theFiles );

            return {
                type,
                files: theFiles,
            };
        }
    }

    /******************************************************************************
     * CREATE Events
    *******************************************************************************/
    // { fileName, fileData, type }
    addFile ( data ) {
        return new Promise( ( resolve ) => {
            const files = this.cache.get( data.type );
            const ext = data.fileName.split( "." ).pop();
            const rExt = new RegExp( `.${ext}$` );
            const name = `${Cache.slugify( data.fileName.replace( rExt, "" ) )}.${ext}`;
            const file = path.join( this.files[ data.type ], name );
            const buffer = DB.getBuffer( data.fileData );
            const onDone = () => {
                if ( data.type === "snapshots" ) {
                    const thumbFile = file.replace( /\.png$/, "-thumb.png" );

                    sharp( buffer )
                        .resize( 512 )
                        .toFile( thumbFile )
                        .then( () => {
                            this.logInfo( `write file ${thumbFile.split( "/" ).pop()}` );
                        });

                } else {
                    this.updateWorker();
                }

                resolve({
                    type: data.type,
                    files,
                });
            };

            utils.isFile( file, ( exists ) => {
                if ( exists ) {
                    this.logInfo( `overwrite file ${name}` );

                } else {
                    this.logInfo( `create new file ${name}` );
                    files.push( name );
                }

                this.cache.set( data.type, files );

                // If we have access to `lame` we can create a compressed audio file...
                if ( shell.which( "lame" ) && ext === "mp3" ) {
                    this.logInfo( "compressing audio file with lame" );

                    const encoder = new Lame({
                        output: file,
                        mp3Input: true,
                        bitrate: 192,
                    }).setBuffer( buffer );

                    encoder
                        .encode()
                        .then( () => {
                            // Encoding finished
                            this.logInfo( "compressed audio file with lame" );
                            onDone();
                        })
                        .catch( ( error ) => {
                            // Something went wrong
                            lager.error( error );
                        });

                } else {
                    utils.writeFile( file, buffer, () => {
                        onDone();
                    });
                }
            });
        });
    }

    addMap ( data ) {
        return new Promise( ( resolve ) => {
            const map = DB.getModel( "map" );
            // const game = this.cache.get( "game" );
            const mapjson = path.join( this.mapsPath, data.fileName );

            map.id = Cache.slugify( data.name );
            map.name = data.name;
            map.type = data.type;
            map.tilesize = Number( data.tilesize );
            map.tilewidth = Number( data.tilewidth );
            map.tileheight = Number( data.tileheight );
            map.height = map.tileheight * map.tilesize;
            map.width = map.tilewidth * map.tilesize;
            map.image = `assets/tiles/${data.image}`;
            map.sound = data.sound ? `assets/sounds/${data.sound}` : map.sound;

            // map.cellauto is omitted by default and it must be saved on update in the studio editor

            for ( let y = map.tileheight; y--; ) {
                map.textures.background[ y ] = [];
                map.textures.foreground[ y ] = [];

                for ( let x = map.tilewidth; x--; ) {
                    map.textures.background[ y ][ x ] = 0;
                    map.textures.foreground[ y ][ x ] = 0;
                }
            }

            utils.writeJson( mapjson, map, () => {
                this.logInfo( `create map ${map.id}` );

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
        return new Promise( ( resolve ) => {
            const maps = this.cache.get( "maps" );
            const map = this._getMap( data.id );
            const idx = maps.indexOf( map );
            const file = path.join( this.mapsPath, `${map.id}.json` );

            map.tilesize = Number( data.tilesize );
            map.tilewidth = Number( data.tilewidth );
            map.tileheight = Number( data.tileheight );
            map.height = map.tileheight * map.tilesize;
            map.width = map.tilewidth * map.tilesize;
            map.image = data.image || map.image;
            map.sound = data.sound || map.sound;
            map.snapshot = `assets/snapshots/${map.id}.png`;
            map.thumbnail = `assets/snapshots/${map.id}-thumb.png`;

            // This is the only place we save cellauto data from the studio editor
            if ( data.cellauto ) {
                map.cellauto = data.cellauto;
            }

            const keys = [
                "name",
                "collision",
                "spawn",
                "fx",
                "tiles",
                "events",
                "npcs",
                "objects"
            ];

            // Cellauto maps don't have saved textures
            if ( !data.cellauto ) {
                keys.push( "textures" );
            }
            
            keys.forEach( ( key ) => {
                map[ key ] = data[ key ] || map[ key ];
            });
            
            utils.writeJson( file, map, () => {
                maps.splice( idx, 1, map );

                this.cache.set( "maps", maps );

                this.logInfo( `update map ${map.id}` );

                this.updateWorker();

                resolve({
                    map: this._getMergedMap( map.id ),
                    maps,
                });
            });
        });
    }

    updateIcon ( data ) {
        return new Promise( ( resolve ) => {
            const buffer = DB.getBuffer( data.fileData );
            const game = this.cache.get( "game" );
            const file = path.join( process.cwd(), "games", game.id, "icon.png" );

            this.logInfo( "update game icon" );

            // Create webapp icons...
            sharp( buffer )
                .resize( 1024 )
                .toFile( file.replace( "icon.png", "icon1024.png" ) )
                .then( () => {
                    this.logInfo( "wrote game icon icon1024.png" );
                });

            sharp( buffer )
                .resize( 512 )
                .toFile( file.replace( "icon.png", "icon512.png" ) )
                .then( () => {
                    this.logInfo( "wrote game icon icon512.png" );
                });

            sharp( buffer )
                .resize( 384 )
                .toFile( file.replace( "icon.png", "icon384.png" ) )
                .then( () => {
                    this.logInfo( "wrote game icon icon384.png" );
                });

            sharp( buffer )
                .resize( 192 )
                .toFile( file.replace( "icon.png", "icon192.png" ) )
                .then( () => {
                    this.logInfo( "wrote game icon icon192.png" );
                });

            sharp( buffer )
                .resize( 64 )
                .toFile( file.replace( "icon.png", "favicon.ico" ) )
                .then( () => {
                    this.logInfo( "wrote game icon favicon.ico" );
                });

            utils.writeFile( file, buffer, () => {
                resolve( game );
            });
        });
    }

    /******************************************************************************
     * DELETE Events
    *******************************************************************************/
    deleteMap ( data ) {
        return new Promise( ( resolve ) => {
            const file = path.join( this.mapsPath, `${data.id}.json` );
            const snapshot = path.join( this.gameRoot, data.snapshot );
            const thumbnail = path.join( this.gameRoot, data.thumbnail );
            const maps = this.cache.get( "maps" );
            const map = this._getMap( data.id );
            const idx = maps.indexOf( map );

            utils.removeFile( snapshot, () => {
                this.logInfo( `deleted map snapshot ${map.id}` );
            });

            utils.removeFile( thumbnail, () => {
                this.logInfo( `deleted map thumbnail ${map.id}` );
            });

            utils.removeFile( file, () => {
                maps.splice( idx, 1 );

                this.cache.set( "maps", maps );

                this.logInfo( `deleted map ${map.id}` );

                this.updateWorker();

                resolve({
                    map,
                    maps,
                });
            });
        });
    }

    deleteFile ( data ) {
        return new Promise( ( resolve ) => {
            const file = path.join( this.files[ data.type ], data.fileName );
            const files = this.cache.get( data.type );
            const idx = files.indexOf( data.fileName );

            utils.removeFile( file, () => {
                files.splice( idx, 1 );

                this.cache.set( data.type, files );

                this.logInfo( `deleted ${data.type} file ${data.fileName}` );

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
        const file = path.join( this.gameRoot, "sw.js" );
        const game = this.cache.get( "game" );
        const bundle = [];
        const caches = [
            "\"\",",
            "    \"index.html\",",
            "    \"game.json\",",
            "    \"2dk.css\",",
            "    \"app.js\",",
            "    \"favicon.ico\",",
            "    \"manifest.json\",",
            "    \"icon.png\",",
            "    \"icon192.png\",",
            "    \"icon384.png\",",
            "    \"icon512.png\",",
            "    \"icon1024.png\",",
        ];

        this.cache.get( "tiles" ).forEach( ( tile ) => {
            caches.push( `    "assets/tiles/${tile}",` );
            bundle.push( `assets/tiles/${tile}` );
        });

        this.cache.get( "sprites" ).forEach( ( sprite ) => {
            caches.push( `    "assets/sprites/${sprite}",` );
            bundle.push( `assets/sprites/${sprite}` );
        });

        this.cache.get( "sounds" ).forEach( ( sound ) => {
            caches.push( `    "assets/sounds/${sound}",` );
            bundle.push( `assets/sounds/${sound}` );
        });

        this.cache.get( "maps" ).forEach( ( map ) => {
            caches.push( `    "maps/${map.id}.json",` );
            bundle.push( `maps/${map.id}.json` );
        });

        game.save = game.save + 1;
        game.bundle = bundle;

        const swJS = DB.updateTemplate( "sw", {
            save: `v${game.save}`,
            bundle: caches.join( "\n" ),
        });

        utils.writeFile( file, swJS, () => {
            this.logInfo( "service worker updated" );

            DB.updateGame( game );
        });
    }

    /******************************************************************************
     * STATIC METHODS
    *******************************************************************************/
    static renderTemplate ( str, data ) {
        // Allow varying bracket styles, {{foo}} or {foo}
        return str.replace( /\{{1,2}([^{}]*)\}{1,2}/g, ( match, p1 ) => {
            // Replace spaces, allowing { foo } or {{ foo }} style
            const ret = data[ p1.replace( /\s/g, "" ) ];

            // Very basic -- Allows string or numeral replacement
            return ( typeof ret === "string" || typeof ret === "number" ) ? ret : match;
        });
    }

    static getBuffer ( data ) {
        return Buffer.from( data.replace( /^data:.*?;base64,/, "" ), "base64" );
    }

    static getModel ( model ) {
        return structuredClone( models[ model ] );
    }

    static async getGames () {
        return await utils.readJson( paths.games );
    }

    static getGameSlice ( data ) {
        return {
            id: data.id,
            name: data.name,
            width: data.width,
            height: data.height,
            resolution: data.resolution,
            maxresolution: data.maxresolution,
            diagonaldpad: data.diagonaldpad,
            icon: data.icon,
            save: data.save,
            release: data.release,
            plugin: data.plugin,
        };
    }

    static updateTemplate ( template, data ) {
        return DB.renderTemplate( templates[ template ], data );
    }

    static updateCommon ( game, gameDir ) {
        const indexHtml = DB.updateTemplate( "index", game );
        const manifestJson = DB.updateTemplate( "manifest", game );

        // Update index.html
        utils.writeFile( path.join( gameDir, "index.html" ), indexHtml );
        lager.info( `DB-static: saved new index.html for ${game.id}` );

        // Update web app manifest
        utils.writeFile( path.join( gameDir, "manifest.json" ), manifestJson );
        lager.info( `DB-static: saved new manifest.json for ${game.id}` );

        // Update css and js entry
        utils.copyFile( path.join( paths.templates, "app.js" ), path.join( gameDir, "app.js" ) );
        utils.copyFile( path.join( paths.templates, "2dk.css" ), path.join( gameDir, "2dk.css" ) );
        lager.info( `DB-static: copied app.js and 2dk.css for ${game.id}` );

        // Update fonts
        utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Regular.woff" ), path.join( gameDir, "fonts", "Calamity-Regular.woff" ) );
        utils.copyFile( path.join( process.cwd(), "public/fonts/Calamity-Bold.woff" ), path.join( gameDir, "fonts", "Calamity-Bold.woff" ) );
        lager.info( `DB-static: copied fonts for ${game.id}` );
    }


    static updateGame ( data ) {
        const gameDir = path.join( process.cwd(), "games", data.id );

        // Save new game data
        utils.writeJson( path.join( gameDir, "game.json" ), data );
        lager.info( `DB-static: saved new game.json for ${data.id}` );

        DB.updateCommon( data, gameDir );

        // Update games.json root
        DB.getGames().then( ( games ) => {
            games.forEach( ( gm, i ) => {
                if ( gm.id === data.id ) {
                    games[ i ] = DB.getGameSlice( data );
                }
            });

            utils.writeJson( paths.games, games );
        });
    }


    static addGame ( data ) {
        return new Promise( ( resolve ) => {
            DB.getGames().then( ( games ) => {
                const gameModel = DB.getModel( "game" );
                const newGame = {
                    ...gameModel,
                };

                newGame.id = Cache.slugify( data.name );
                newGame.name = data.name;
                newGame.width = Number( data.width ) || gameModel.width;
                newGame.height = Number( data.height ) || gameModel.height;
                newGame.tilesize = Number( data.tilesize ) || gameModel.tilesize;
                newGame.worldmapsize = {
                    tilewidth: Number( data.worldtilewidth ) || gameModel.worldmapsize.tilewidth,
                    tileheight: Number( data.worldtileheight ) || gameModel.worldmapsize.tileheight,
                };
                newGame.indoormapsize = {
                    tilewidth: Number( data.indoortilewidth ) || gameModel.indoormapsize.tilewidth,
                    tileheight: Number( data.indoortileheight ) || gameModel.indoormapsize.tileheight,
                };
                newGame.bButton = data.bButton || gameModel.bButton;
                newGame.resolution = Number( data.resolution ) || gameModel.resolution;
                newGame.maxresolution = Number( data.maxresolution ) || gameModel.maxresolution;
                newGame.diagonaldpad = data.diagonaldpad === false ? data.diagonaldpad : gameModel.diagonaldpad;
                newGame.release = Number( data.release ) || gameModel.release;
                newGame.plugin = data.plugin || gameModel.plugin;
                newGame.icon = "icon.png";

                games.push( DB.getGameSlice( newGame ) );

                const gameDir = path.join( process.cwd(), "games", newGame.id );
                const mapsDir = path.join( gameDir, "maps" );
                const fontsDir = path.join( gameDir, "fonts" );
                const assetsDir = path.join( gameDir, "assets" );

                utils.makeDir( gameDir );
                utils.makeDir( mapsDir );
                utils.makeDir( fontsDir );
                utils.makeDir( assetsDir );
                utils.makeDir( path.join( assetsDir, "tiles" ) );
                utils.makeDir( path.join( assetsDir, "sprites" ) );
                utils.makeDir( path.join( assetsDir, "sounds" ) );
                utils.makeDir( path.join( assetsDir, "snapshots" ) );
                utils.copyFile( path.join( paths.templates, "icon.png" ), path.join( gameDir, "icon.png" ) );

                DB.updateCommon( newGame, gameDir );

                utils.writeJson( paths.games, games, () => {
                    utils.writeJson( path.join( gameDir, "game.json" ), newGame, () => {
                        lager.info( `DB-static: created game ${newGame.id}` );

                        resolve({
                            game: newGame,
                            games,
                        });
                    });
                });
            });
        });
    }


    static deleteGame ( data ) {
        return new Promise( ( resolve ) => {
            DB.getGames().then( ( games ) => {
                const gamePath = path.join( process.cwd(), "games", data.id );
                const game = games.find( ( gm ) => {
                    return ( gm.id === data.id );
                });

                games.splice( games.indexOf( game ), 1 );

                utils.writeJson( paths.games, games );
                utils.removeDir( gamePath, () => {
                    lager.info( `DB-static: deleted game ${game.id}` );

                    resolve( games );
                });
            });
        });
    }
}


// Export
module.exports = {
    DB,
};
