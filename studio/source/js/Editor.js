const EditorActions = require( "./EditorActions" );
const EditorLayers = require( "./EditorLayers" );
const EditorCanvas = require( "./EditorCanvas" );
const EditorUtils = require( "./EditorUtils" );
const Config = require( "./Config" );
const Cache = require( "./Cache" );
const $ = require( "../../node_modules/properjs-hobo/dist/hobo.build" );
const db = require( "./db" );
const { ipcRenderer } = require( "electron" );



class Editor {
    constructor () {
        this.mode = null;
        this.db = new db.DB();
        this.data = {};
        this.layers = new EditorLayers( this );
        this.canvas = new EditorCanvas( this );
        this.actions = new EditorActions( this );
        this.utils = EditorUtils;
        this.dom = {
            root: $( "#editor" ),
            gameName: $( "#editor-gamename" ),
            mapPanel: $( "#editor-map-panel" ),
            gamePanel: $( "#editor-game-panel" ),
            settings: $( ".js-settings" ),
            mapSettings: $( "#editor-mapsettings" ),
            gameSettings: $( "#editor-gamesettings" ),
            cancelPost: $( ".js-post-cancel" ),
            savePost: $( ".js-post-save" ),
            uploadFiles: $( ".js-upload-file" ),
            cancelUpload: $( ".js-upload-cancel" ),
            deleteUpload: $( ".js-upload-delete" ),
            saveUpload: $( ".js-upload-save" ),
            deleteMap: $( "#editor-delmap" ),
            deleteGame: $( "#editor-delgame" ),
        };
        this.selects = {
            all: $( ".js-select" ),
            maps: $( ".js-select-map" ),
            tiles: $( ".js-select-tiles" ),
            sounds: $( ".js-select-sound" ),
            mapLoad: $( "#editor-map-load-select" ),
            gameLoad: $( "#editor-game-load-select" ),
        };
        this.menus = {
            all: $( ".js-menu" ),
            activeMap: $( "#editor-active-map-menu" ),
            activeGame: $( "#editor-active-game-menu" ),
        };
        this.fields = {
            map: $( ".js-map-field" ),
            addMap: $( ".js-addmap-field" ),
            addGame: $( ".js-addgame-field" ),
        };

        this.loadGames();
    }


    setMode ( mode ) {
        this.mode = mode;
    }


    getMode () {
        return this.mode;
    }


    loadGames () {
        db.DB.getGames().then(( games ) => {
            this.data.games = games;

            // load games
            EditorUtils.buildSelectMenu( this.selects.gameLoad, games );

            // Show UI
            this.display();

            // bind events
            this.bindEvents();

            // bind menu events from Electron
            this.bindMenuEvents();
        });
    }


    loadGame ( id ) {
        this.db.open( id ).then(() => {
            this.db.getGame().then(( data ) => {
                this.data.game = data.game;
                this.data.hero = data.hero;
                this.data.map = null;

                // load files
                this.loadAssets();

                // load maps
                this.loadMaps();

                // reset canvas in case we had a map loaded...
                this.canvas.reset();

                // Kill any MediaBox audio that is playing...
                EditorUtils.destroySound();

                // Prefill the game data fields
                this.prefillGameFields( this.data.game );

                // Set active game to menu
                this.selects.gameLoad[ 0 ].selectedIndex = this.selects.gameLoad.find( `option[value="${id}"]` ).index();
            });
        });
    }


    loadMaps () {
        this.db.getMaps().then(( maps ) => {
            this.data.maps = maps;

            EditorUtils.buildSelectMenu( this.selects.maps, maps );
        });
    }


    loadMap ( id ) {
        // Set active map
        this.data.map = this.data.maps.find(( map ) => {
            return (map.id === id);
        });

        // Prefill the map data fields
        this.prefillMapFields( this.data.map );

        // Display the map canvas
        this.canvas.loadMap( this.data.map );

        // Set active map to menu
        this.selects.mapLoad[ 0 ].selectedIndex = this.selects.mapLoad.find( `option[value="${id}"]` ).index();
    }


    postMap ( postData ) {
        postData.fileName = `${Cache.slugify( postData.name )}.json`;
        this.mode = Config.Editor.modes.SAVING;
        this.dom.root[ 0 ].className = "is-saving-map";

        this.db.addMap( postData ).then(( map ) => {
            this.closeMenus();
            this.data.maps.push( map );
            EditorUtils.buildSelectMenu( this.selects.maps, this.data.maps );
            ipcRenderer.send( "newmap", map );
            this.done();
        });
    }


    postGame ( postData ) {
        this.mode = Config.Editor.modes.SAVING;
        this.dom.root[ 0 ].className = "is-saving-game";

        db.DB.addGame( postData ).then(( game ) => {
            this.closeMenus();
            this.data.games.push( game.game );
            EditorUtils.buildSelectMenu( this.selects.gameLoad, this.data.games );
            // this.loadGame( game.game.id );
            ipcRenderer.send( "newgame", game.game );
            this.done();
        });
    }


    loadAssets () {
        const assets = [
            {
                type: "tiles",
                elem: this.selects.tiles
            },
            {
                type: "sounds",
                elem: this.selects.sounds
            },
            // {
            //     type: "sprites",
            //     elem: this.selects.sprites
            // },
        ];
        const _getAssets = ( obj ) => {
            this.db.getFiles( obj.type ).then(( files ) => {
                EditorUtils.buildSelectMenu( obj.elem, files );

                if ( assets.length ) {
                    _getAssets( assets.shift() );
                }
            });
        };

        _getAssets( assets.shift() );
    }


    display () {
        setTimeout(() => {
            this.dom.root[ 0 ].className = "";

        }, 1000 );
    }


    done () {
        this.mode = null;

        setTimeout(() => {
            this.dom.root[ 0 ].className = "";

        }, 1000 );
    }


    canGameFunction () {
        return (
            this.data.game &&
            this.mode !== Config.Editor.modes.SAVING
        );
    }


    canMapFunction () {
        return (
            this.data.map &&
            this.mode !== Config.Editor.modes.SAVING &&
            this.canvas.mode !== Config.EditorCanvas.modes.DRAG
        );
    }


    prefillGameFields ( game ) {
        this.menus.activeGame.find( ".js-game-field[name='name']" )[ 0 ].value = game.name;
        this.menus.activeGame.find( ".js-game-field[name='width']" )[ 0 ].value = game.width;
        this.menus.activeGame.find( ".js-game-field[name='height']" )[ 0 ].value = game.height;
    }


    prefillMapFields ( map ) {
        this.menus.activeMap.find( ".js-map-field[name='name']" )[ 0 ].value = map.name;
        this.menus.activeMap.find( ".js-map-field[name='resolution']" )[ 0 ].value = map.resolution;
        this.menus.activeMap.find( ".js-map-field[name='tilesize']" )[ 0 ].value = map.tilesize;
        this.menus.activeMap.find( ".js-map-field[name='gridsize']" )[ 0 ].value = map.gridsize;
        this.menus.activeMap.find( ".js-map-field[name='tilewidth']" )[ 0 ].value = map.tilewidth;
        this.menus.activeMap.find( ".js-map-field[name='tileheight']" )[ 0 ].value = map.tileheight;
        this.menus.activeMap.find( ".js-map-field[name='image']" )[ 0 ].value = map.image.split( "/" ).pop();

        if ( map.sound ) {
            this.menus.activeMap.find( ".js-map-field[name='sound']" )[ 0 ].value = map.sound.split( "/" ).pop();
        }
    }


    cleanTiles ( arr ) {
        const ret = [];

        for ( let i = 0, len = arr.length; i < len; i++ ) {
            let uniq = arr[ i ];

            for ( let j = ret.length; j--; ) {
                if ( ret[ j ][ 0 ] === arr[ i ][ 0 ] && ret[ j ][ 1 ] === arr[ i ][ 1 ] ) {
                    uniq = null;
                    break;
                }
            }

            if ( uniq ) {
                ret.push( uniq );
            }
        }

        return ret;
    }


    cleanMap () {
        for ( const l in this.data.map.textures ) {
            if ( this.data.map.textures.hasOwnProperty( l ) ) {
                for ( let y = this.data.map.textures[ l ].length; y--; ) {
                    for ( let x = this.data.map.textures[ l ][ y ].length; x--; ) {
                        // Position has more than one tile, [[x, y], [x, y]], so make sure the stack is purged of dupes
                        if ( Array.isArray( this.data.map.textures[ l ][ y ][ x ] ) && Array.isArray( this.data.map.textures[ l ][ y ][ x ][ 0 ] ) ) {
                            this.data.map.textures[ l ][ y ][ x ] = this.cleanTiles( this.data.map.textures[ l ][ y ][ x ] );
                        }
                    }
                }
            }
        }
    }


    updateMapLayer ( layer, coords, coordMap ) {
        let tmp;

        coordMap.tiles.forEach(( tile ) => {
            if ( tile.paintTile ) {
                const cx = coords[ 0 ] + tile.drawCoord[ 0 ];
                const cy = coords[ 1 ] + tile.drawCoord[ 1 ];

                // Position has no tile, 0
                if ( this.data.map.textures[ layer ][ cy ][ cx ] === 0 ) {
                    this.data.map.textures[ layer ][ cy ][ cx ] = [
                        this.data.map.tilesize * tile.tileCoord[ 0 ],
                        this.data.map.tilesize * tile.tileCoord[ 1 ]
                    ];

                // Position has more than one tile, [[x, y], [x, y]]
                } else if ( Array.isArray( this.data.map.textures[ layer ][ cy ][ cx ] ) && Array.isArray( this.data.map.textures[ layer ][ cy ][ cx ][ 0 ] ) ) {
                    this.data.map.textures[ layer ][ cy ][ cx ].push([
                        this.data.map.tilesize * tile.tileCoord[ 0 ],
                        this.data.map.tilesize * tile.tileCoord[ 1 ]
                    ]);

                // Position has one tile, [x, y]
                } else {
                    tmp = this.data.map.textures[ layer ][ cy ][ cx ];

                    this.data.map.textures[ layer ][ cy ][ cx ] = [];
                    this.data.map.textures[ layer ][ cy ][ cx ].push( tmp );
                    this.data.map.textures[ layer ][ cy ][ cx ].push([
                        this.data.map.tilesize * tile.tileCoord[ 0 ],
                        this.data.map.tilesize * tile.tileCoord[ 1 ]
                    ]);
                }
            }
        });

        this.cleanMap();
    }


    updateMap ( map ) {
        this.data.map = map;
        this.data.maps.forEach(( m, i ) => {
            if ( m.id === this.data.map.id ) {
                this.data.maps[ i ] = this.data.map;
            }
        });
    }


    closeMenus () {
        this.menus.all.removeClass( "is-active" );
    }


    clearMenu ( menu ) {
        const inputs = menu.find( ".editor__field, .select__field" );

        inputs.forEach(( input ) => {
            input.value = "";
        });
    }


    _saveMap () {
        if ( !this.canMapFunction() ) {
            return false;
        }

        this.mode = Config.Editor.modes.SAVING;
        this.dom.root[ 0 ].className = "is-saving-map";
        this.cleanMap();

        // Save map JSON
        const postData = this.data.map;
        const mapData = EditorUtils.parseFields( this.fields.map );

        for ( const i in mapData ) {
            if ( mapData.hasOwnProperty( i ) ) {
                postData[ i ] = mapData[ i ];
            }
        }

        this.db.updateMap( postData ).then(( map ) => {
            this.updateMap( map );
            this.closeMenus();
            this.done();

            this.canvas.loadMap( this.data.map );

            document.querySelector( `option[value="${map.id}"]` ).innerHTML = map.name;
        });

        // Upload map PNG snapshot
        const uploadSnap = {
            id: this.data.game.id,
            type: "snapshots",
            fileName: `${this.data.map.id}.png`
        };
        const snapshot = document.createElement( "canvas" );
        const snapshotCtx = snapshot.getContext( "2d" );

        snapshot.width = this.canvas.contexts.background.canvas.width;
        snapshot.height = this.canvas.contexts.background.canvas.height;
        snapshot.style.width = `${this.canvas.contexts.background.canvas.width}px`;
        snapshot.style.height = `${this.canvas.contexts.background.canvas.height}px`;

        // Draw background
        snapshotCtx.drawImage(
            this.canvas.contexts.background.canvas,
            0,
            0,
            snapshot.width,
            snapshot.height,
            0,
            0,
            snapshot.width,
            snapshot.height
        );

        // Draw foreground
        snapshotCtx.drawImage(
            this.canvas.contexts.foreground.canvas,
            0,
            0,
            snapshot.width,
            snapshot.height,
            0,
            0,
            snapshot.width,
            snapshot.height
        );

        uploadSnap.fileData = snapshot.toDataURL( "image/png" );

        // Upload & save to disk in the background...
        this.db.addFile( uploadSnap );
    }


    _openMenu ( type, target ) {
        const canFunction = (type === "game") || this.canGameFunction();

        if ( !canFunction ) {
            return false;
        }

        const menu = $( `#${target}` );

        if ( menu.is( ".is-active" ) ) {
            this.closeMenus();
            this.clearMenu( menu );

        } else {
            this.closeMenus();
            menu.addClass( "is-active" );
        }
    }


    _openUpload ( type, target ) {
        if ( !this.canGameFunction() ) {
            return false;
        }

        const menu = $( `#${target}` );

        if ( menu.is( ".is-active" ) ) {
            this.closeMenus();

        } else {
            this.closeMenus();
            menu.addClass( "is-active" );
        }
    }


    bindMenuEvents () {
        ipcRenderer.on( "savemap", ( event, message ) => {
            this._saveMap();
        });

        ipcRenderer.on( "newgame", ( event, message ) => {
            this._openMenu( "game", "editor-addgame-menu" );
        });

        ipcRenderer.on( "newmap", ( event, message ) => {
            this._openMenu( "map", "editor-addmap-menu" );
        });

        ipcRenderer.on( "addtileset", ( event, message ) => {
            this._openUpload( "tileset", "editor-addtiles-menu" );
        });

        ipcRenderer.on( "addsound", ( event, message ) => {
            this._openUpload( "sound", "editor-addsound-menu" );
        });

        ipcRenderer.on( "loadgame", ( event, game ) => {
            this.loadGame( game.id );
        });

        ipcRenderer.on( "loadmap", ( event, map ) => {
            this.loadMap( map.id );
        });
    }


    bindEvents () {
        const $document = $( document );

        this.selects.all.on( "change", ( e ) => {
            this.selects.all.forEach(( select ) => {
                select.blur();
            });
        });

        // this.selects.gameLoad.on( "change", ( e ) => {
        //     if ( this.selects.gameLoad[ 0 ].value ) {
        //         this.loadGame( this.selects.gameLoad[ 0 ].value );
        //     }
        // });


        // this.selects.mapLoad.on( "change", ( e ) => {
        //     if ( this.selects.mapLoad[ 0 ].value ) {
        //         this.loadMap( this.selects.mapLoad[ 0 ].value );
        //     }
        // });

        this.dom.uploadFiles.on( "change", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = $( e.target );
            const elem = targ.is( ".js-upload-file" ) ? targ : targ.closest( ".js-upload-file" );
            const data = elem.data();

            document.getElementById( data.target ).value = elem[ 0 ].value;
        });


        this.selects.sounds.on( "change", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = $( e.target );
            const sampler = targ.is( ".js-sound-sampler" ) ? targ : targ.closest( ".js-sound-sampler" );

            if ( sampler.is( ".is-playing" ) ) {
                EditorUtils.processSound( sampler, this.data.game.id );
            }
        });

        this.dom.settings.on( "click", ( e ) => {
            const targ = $( e.target );
            const elem = targ.is( ".js-settings" ) ? targ : targ.closest( ".js-settings" );
            const elemData = elem.data();

            if ( elemData.type === "game" && this.canGameFunction() ) {
                if ( this.menus.activeGame.is( ".is-active" ) ) {
                    this.menus.activeGame.removeClass( "is-active" );

                } else {
                    this.menus.activeGame.addClass( "is-active" );
                }
            }

            if ( elemData.type === "map" && this.canMapFunction() ) {
                if ( this.menus.activeMap.is( ".is-active" ) ) {
                    this.menus.activeMap.removeClass( "is-active" );

                } else {
                    this.menus.activeMap.addClass( "is-active" );
                }
            }
        });


        this.dom.cancelPost.on( "click", ( e ) => {
            const targ = $( e.target );
            const elem = targ.is( ".js-post-cancel" ) ? targ : targ.closest( ".js-post-cancel" );
            const elemData = elem.data();
            const canFunction = (elemData.type === "game") || this.canGameFunction();

            if ( !canFunction ) {
                return false;
            }

            this.closeMenus();
            this.clearMenu( elem.closest( ".js-menu" ) );
        });


        this.dom.cancelUpload.on( "click", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = $( e.target );
            const elem = targ.is( ".js-upload-cancel" ) ? targ : targ.closest( ".js-upload-cancel" );

            this.closeMenus();
            this.clearMenu( elem.closest( ".js-menu" ) );
        });


        this.dom.deleteUpload.on( "click", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = $( e.target );
            const button = targ.is( ".js-upload-delete" ) ? targ : targ.closest( ".js-upload-delete" );
            const menu = button.closest( ".js-upload-menu" );
            const select = menu.find( ".js-select-delete" );
            const postData = {
                type: button.data().type,
                fileName: select[ 0 ].value
            };

            if ( confirm( `Sure you want to delete the file "${select[ 0 ].value}"? This may affect other data referencing this file.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root[ 0 ].className = "is-deleting-file";

                this.db.deleteFile( postData ).then(() => {
                    this.loadAssets();
                    this.closeMenus();
                    this.done();
                });
            }
        });


        this.dom.saveUpload.on( "click", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = $( e.target );
            const button = targ.is( ".js-upload-save" ) ? targ : targ.closest( ".js-upload-save" );
            const menu = button.closest( ".js-upload-menu" );
            const fileInput = menu.find( ".js-upload-file" );
            const fileField = menu.find( ".js-upload-field" );
            const fileReader = new FileReader();
            const fileData = fileInput[ 0 ].files[ 0 ];
            const postData = {
                id: this.data.game.id,
                type: button.data().type
            };

            if ( fileData ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root[ 0 ].className = "is-saving-file";
                postData.fileName = fileData.name;

                fileReader.onload = ( fe ) => {
                    postData.fileData = fe.target.result;

                    this.db.addFile( postData ).then(() => {
                        fileField[ 0 ].value = "";
                        this.loadAssets();
                        this.closeMenus();
                        this.done();
                    });
                };

                fileReader.readAsDataURL( fileData );
            }
        });


        this.dom.savePost.on( "click", ( e ) => {
            const targ = $( e.target );
            const elem = targ.is( ".js-post-save" ) ? targ : targ.closest( ".js-post-save" );
            const elemData = elem.data();
            const canFunction = (elemData.type === "game") || this.canGameFunction();

            if ( !canFunction ) {
                return false;
            }

            const postData = (elemData.type === "game" ? EditorUtils.parseFields( this.fields.addGame ) : EditorUtils.parseFields( this.fields.addMap ));

            if ( postData.name ) {
                if ( elemData.type === "game" ) {
                    this.postGame( postData );

                // Map is the only post besides game...
                } else {
                    this.postMap( postData );
                }

                this.clearMenu( elem.closest( ".js-menu" ) );
            }
        });


        $document.on( "click", ".js-sound-button", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = $( e.target );
            const button = targ.is( ".js-sound-button" ) ? targ : targ.closest( ".js-sound-button" );
            const sampler = targ.is( ".js-sound-sampler" ) ? targ : targ.closest( ".js-sound-sampler" );

            if ( button.is( ".icon--pause" ) ) {
                button.removeClass( "icon--pause" );
                button.addClass( "icon--play2" );

            } else {
                button.removeClass( "icon--play2" );
                button.addClass( "icon--pause" );
            }

            EditorUtils.processSound( sampler, this.data.game.id );
        });


        this.dom.deleteMap.on( "click", ( e ) => {
            if ( !this.canMapFunction() ) {
                return false;
            }

            if ( confirm( `Sure you want to delete the map "${active.map.name}"?` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root[ 0 ].className = "is-deleting-map";

                this.db.deleteMap( this.data.map ).then(() => {
                    window.location.reload();
                });
            }
        });


        this.dom.deleteGame.on( "click", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            if ( confirm( `Sure you want to delete the game "${this.data.game.name}"?` ) ) {
                this.mode = Library.Editor.modes.SAVING;
                this.dom.root[ 0 ].className = "is-deleting-game";

                db.DB.deleteGame( this.data.game ).then(() => {
                    window.location.href = "index.html";
                });
            }
        });
    }
}



module.exports = Editor;