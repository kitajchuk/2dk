const path = require( "path" );
const util = require( "./util" );
const Cache = require( "./Cache" );
const Library = require( "./Library" );
const lager = require( "properjs-lager" );


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

            util.readDir( this.files.tiles, ( files ) => {
                this.cache.set( "tiles", files );
                lager.info( "Cached tiles data" );
            });

            util.readDir( this.files.sprites, ( files ) => {
                this.cache.set( "sprites", files );
                lager.info( "Cached sprites data" );
            });

            util.readDir( this.files.snapshots, ( files ) => {
                this.cache.set( "snapshots", files );
                lager.info( "Cached snapshots data" );
            });

            util.readDir( this.files.sounds, ( files ) => {
                this.cache.set( "sounds", files );
                lager.info( "Cached sounds data" );
            });

            util.readDir( this.mapsPath, ( files ) => {
                const maps = [];

                files.forEach(( file ) => {
                    maps.push( util.readJson( path.join( this.mapsPath, file ) ) );
                });

                this.cache.set( "maps", maps );
                lager.info( "Cached maps data" );
            });

            util.readJson( this.gamePath, ( data ) => {
                this.cache.set( "game", data );
                lager.info( "Cached game data" );
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
        const map = util.copyObj(this.cache.get( "maps" ).find(( map ) => {
            return (map.id === id);
        }));

        return map;
    }

    /******************************************************************************
     * GET public events
    *******************************************************************************/
    getGame () {
        return new Promise(( resolve ) => {
            resolve( this.cache.get( "game" ) );
        });
    }

    getMaps () {
        return new Promise(( resolve ) => {
            const maps = this.cache.get( "maps" ).map(( map ) => {
                return this._getMergedMap( map.id );
            });

            resolve( maps );
        });
    }

    getMap ( data ) {
        return new Promise(( resolve ) => {
            resolve( this._getMergedMap( data.id ) );
        });
    }

    getFiles ( type ) {
        return new Promise(( resolve ) => {
            const files = this.cache.get( type );

            if ( files ) {
                resolve( files );

            } else {
                util.readDir( this.files[ type ], ( theFiles ) => {
                    this.cache.set( type, theFiles );

                    resolve( theFiles );
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

            util.isFile( file, ( exists ) => {
                files = this.cache.get( data.type );

                if ( exists ) {
                    lager.info( `Overwriting file ${name}` );

                } else {
                    lager.info( `Writing new file ${name}` );
                    files.push( name );
                }

                this.cache.set( data.type, files );

                util.writeFile( file, buffer, () => {
                    resolve();
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
            map.resolution = Number( data.resolution );
            map.gridsize = map.tilesize / map.resolution;
            map.tilewidth = Number( data.tilewidth );
            map.tileheight = Number( data.tileheight );
            map.height = map.tileheight * map.tilesize;
            map.width = map.tilewidth * map.tilesize;
            map.image = `/${this.gameId}/assets/tiles/${data.image}`;
            map.sound = data.sound ? `/${this.gameId}/assets/sounds/${data.sound}` : map.sound;

            for ( let y = map.tileheight; y--; ) {
                map.textures.background[ y ] = [];
                map.textures.foreground[ y ] = [];

                for ( let x = map.tilewidth; x--; ) {
                    map.textures.background[ y ][ x ] = 0;
                    map.textures.foreground[ y ][ x ] = 0;
                }
            }

            util.writeJson( mapjson, map, () => {
                lager.info( `Add Map ${map.name}` );

                const maps = this.cache.get( "maps" );

                maps.push( map );

                this.cache.set( "maps", maps );

                resolve( map );
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
            map.resolution = Number( data.resolution );
            map.gridsize = map.tilesize / map.resolution;
            map.tilewidth = Number( data.tilewidth );
            map.tileheight = Number( data.tileheight );
            map.height = map.tileheight * map.tilesize;
            map.width = map.tilewidth * map.tilesize;
            map.image = `/${this.gameId}/assets/tiles/${data.image}`;
            map.sound = data.sound ? `/${this.gameId}/assets/sounds/${data.sound}` : map.sound;
            map.collision = data.collision;
            map.textures = data.textures;

            util.writeJson( file, map, () => {
                maps.splice( idx, 1, map );

                this.cache.set( "maps", maps );

                lager.info( `Updated Map: ${map.name}` );

                resolve( this._getMergedMap( map.id ) );
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

            util.removeFile( file, () => {
                maps.splice( idx, 1 );

                this.cache.set( "maps", maps );

                lager.info( `Deleted Map: ${map.name}` );

                resolve( map );
            });
        });
    }

    deleteFile ( data ) {
        return new Promise(( resolve ) => {
            const file = path.join( this.files[ data.type ], data.fileName );
            const files = this.cache.get( data.type );
            const idx = files.indexOf( data.fileName );

            util.removeFile( file, () => {
                files.splice( idx, 1 );

                this.cache.set( data.type, files );

                lager.info( `Deleted ${data.type} file ${data.fileName}` );

                resolve();
            });
        });
    }
}


DB.mergeModel = function ( pin, model ) {
    for ( const i in model ) {
        // Don't override ID property or Name property
        if ( i !== "id" && i !== "name" ) {
            pin[ i ] = model[ i ];
        }
    }

    return pin;
};


DB.getUID = function () {
    return String( Math.random() * Date.now() ).replace( /\D/, "" );
};


DB.getModel = function ( model ) {
    return util.copyObj( require( `../models/${model}` ) );
};


DB.getGames = function () {
    return new Promise(( resolve ) => {
        util.readJson( path.join( process.cwd(), "games.json" ), ( json ) => {
            resolve( json );
        });
    });
};


DB.addGame = function ( data ) {
    return new Promise(( resolve ) => {
        let games = path.join( process.cwd(), "games.json" );
        let gameJson = null;
        const game = DB.getModel( "game" );
        const done = () => {
            const gameDir = path.join( process.cwd(), "games", game.game.id );
            const mapsDir = path.join( gameDir, "maps" );
            const assetsDir = path.join( gameDir, "assets" );

            util.makeDir( gameDir );
            util.makeDir( mapsDir );
            util.makeDir( assetsDir );
            util.makeDir( path.join( assetsDir, "tiles" ) );
            util.makeDir( path.join( assetsDir, "sprites" ) );
            util.makeDir( path.join( assetsDir, "sounds" ) );
            util.makeDir( path.join( assetsDir, "snapshots" ) );
            util.writeJson( games, gameJson, () => {
                games = path.join( gameDir, "game.json" );

                util.writeJson( games, game, () => {
                    resolve( game );
                });
            });
        };

        game.game.id = Cache.slugify( data.name );
        game.game.name = data.name;
        game.game.width = Number( data.width ) || game.game.width;
        game.game.height = Number( data.height ) || game.game.height;
        // game.game.fullscreen = data.fullscreen ? true : false;

        util.readJson( games, ( json ) => {
            gameJson = json;
            gameJson.push( game.game );
            done();
        });
    });
};


DB.deleteGame = function ( data ) {
    return new Promise(( resolve ) => {
        const jsonPath = path.join( process.cwd(), "games.json" );
        const gamePath = path.join( process.cwd(), "games", data.id );

        util.readJson( jsonPath, ( json ) => {
            const game = json.find(( gm ) => {
                return (gm.id === data.id);
            });

            json.splice( json.indexOf( game ), 1 );

            util.writeJson( jsonPath, json );
            util.removeDir( gamePath, () => {
                resolve( data );
            });
        });
    });
};


// Export
module.exports = {
    DB
};
