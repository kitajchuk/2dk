const path = require( "path" );
const Utils = require( "./Utils" );
const Cache = require( "./Cache" );
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

            Utils.readDir( this.files.tiles, ( files ) => {
                this.cache.set( "tiles", files );
                lager.info( "Cached tiles data" );
            });

            Utils.readDir( this.files.sprites, ( files ) => {
                this.cache.set( "sprites", files );
                lager.info( "Cached sprites data" );
            });

            Utils.readDir( this.files.snapshots, ( files ) => {
                this.cache.set( "snapshots", files );
                lager.info( "Cached snapshots data" );
            });

            Utils.readDir( this.files.sounds, ( files ) => {
                this.cache.set( "sounds", files );
                lager.info( "Cached sounds data" );
            });

            Utils.readDir( this.mapsPath, ( files ) => {
                const maps = [];

                files.forEach(( file ) => {
                    maps.push( Utils.readJson( path.join( this.mapsPath, file ) ) );
                });

                this.cache.set( "maps", maps );
                lager.info( "Cached maps data" );
            });

            Utils.readJson( this.gamePath, ( data ) => {
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
                Utils.readDir( this.files[ type ], ( theFiles ) => {
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

            Utils.isFile( file, ( exists ) => {
                files = this.cache.get( data.type );

                if ( exists ) {
                    lager.info( `Overwriting file ${name}` );

                } else {
                    lager.info( `Writing new file ${name}` );
                    files.push( name );
                }

                this.cache.set( data.type, files );

                Utils.writeFile( file, buffer, () => {
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
            map.image = `/games/${this.gameId}/assets/tiles/${data.image}`;
            map.sound = data.sound ? `/games/${this.gameId}/assets/sounds/${data.sound}` : map.sound;

            for ( let y = map.tileheight; y--; ) {
                map.textures.background[ y ] = [];
                map.textures.foreground[ y ] = [];

                for ( let x = map.tilewidth; x--; ) {
                    map.textures.background[ y ][ x ] = 0;
                    map.textures.foreground[ y ][ x ] = 0;
                }
            }

            Utils.writeJson( mapjson, map, () => {
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
            map.image = `/games/${this.gameId}/assets/tiles/${data.image}`;
            map.sound = data.sound ? `/games/${this.gameId}/assets/sounds/${data.sound}` : map.sound;
            map.collision = data.collision;
            map.textures = data.textures;

            Utils.writeJson( file, map, () => {
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

            Utils.removeFile( file, () => {
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

            Utils.removeFile( file, () => {
                files.splice( idx, 1 );

                this.cache.set( data.type, files );

                lager.info( `Deleted ${data.type} file ${data.fileName}` );

                resolve();
            });
        });
    }
}


/******************************************************************************
 * STATIC methods...
*******************************************************************************/
DB.mergeModel = ( pin, model ) => {
    for ( const i in model ) {
        // Don't override ID property or Name property
        if ( i !== "id" && i !== "name" ) {
            pin[ i ] = model[ i ];
        }
    }

    return pin;
};


DB.getUID = () => {
    return String( Math.random() * Date.now() ).replace( /\D/, "" );
};


DB.getModel = ( model ) => {
    return Utils.copyObj( require( `../../models/${model}` ) );
};


DB.getGames = () => {
    return new Promise(( resolve ) => {
        Utils.readJson( path.join( process.cwd(), "games.json" ), ( json ) => {
            resolve( json );
        });
    });
};


DB.getMaps = ( gameId ) => {
    return new Promise(( resolve ) => {
        const mapsPath = path.join( process.cwd(), "games", gameId, "maps" );

        Utils.readDir( mapsPath, ( files ) => {
            const maps = [];

            files.forEach(( file ) => {
                maps.push( Utils.readJson( path.join( mapsPath, file ) ) );
            });

            resolve( maps );
        });
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

            Utils.makeDir( gameDir );
            Utils.makeDir( mapsDir );
            Utils.makeDir( assetsDir );
            Utils.makeDir( path.join( assetsDir, "tiles" ) );
            Utils.makeDir( path.join( assetsDir, "sprites" ) );
            Utils.makeDir( path.join( assetsDir, "sounds" ) );
            Utils.makeDir( path.join( assetsDir, "snapshots" ) );
            Utils.writeJson( games, gameJson, () => {
                games = path.join( gameDir, "game.json" );

                Utils.writeJson( games, game, () => {
                    resolve( game );
                });
            });
        };

        game.game.id = Cache.slugify( data.name );
        game.game.name = data.name;
        game.game.width = Number( data.width ) || game.game.width;
        game.game.height = Number( data.height ) || game.game.height;
        // game.game.fullscreen = data.fullscreen ? true : false;

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
                resolve( data );
            });
        });
    });
};


// Export
module.exports = {
    DB
};