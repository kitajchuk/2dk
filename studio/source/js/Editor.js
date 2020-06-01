const EditorActions = require( "./EditorActions" );
const EditorLayers = require( "./EditorLayers" );
const EditorCanvas = require( "./EditorCanvas" );
const EditorUtils = require( "./EditorUtils" );
const Config = require( "./Config" );
const Cache = require( "./Cache" );
const $ = require( "../../node_modules/properjs-hobo/dist/hobo.build" );
const { ipcRenderer } = require( "electron" );



class Editor {
    constructor () {
        this.mode = null;
        this.data = {};
        this.layers = new EditorLayers( this );
        this.canvas = new EditorCanvas( this );
        this.actions = new EditorActions( this );
        this.utils = EditorUtils;
        this.dom = {
            root: $( "#editor" ),
            settings: $( ".js-settings" ),
            mapSettings: $( "#editor-mapsettings" ),
            gameSettings: $( "#editor-gamesettings" ),
            closeSettings: $( ".js-close-settings" ),
            cancelPost: $( ".js-post-cancel" ),
            savePost: $( ".js-post-save" ),
            uploadFiles: $( ".js-upload-file" ),
            cancelUpload: $( ".js-upload-cancel" ),
            deleteUpload: $( ".js-upload-delete" ),
            saveUpload: $( ".js-upload-save" ),
            deleteMap: $( "#editor-delmap" ),
            deleteGame: $( "#editor-delgame" ),
            loadout: $( "#editor-loadout" ),
            mapLoad: $( "#editor-map-load" ),
            gameLoad: $( "#editor-game-load" ),
            iconImage: $( "#editor-game-icon-image" ),
            iconField: $( "#editor-game-icon" ),
        };
        this.selects = {
            all: $( ".js-select" ),
            maps: $( ".js-select-map" ),
            tiles: $( ".js-select-tiles" ),
            sounds: $( ".js-select-sound" ),
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

        // Show UI
        this.display();

        // bind events
        this.bindEvents();

        // bind menu events from Electron
        this.bindMenuEvents();
    }


    setTitle () {
        // Set document title
        document.title = `${this.data.map ? this.data.map.name : this.data.game.name} | 2dk Studio`;
    }


    loadGame ( game ) {
        if ( this.data.game && this.data.game.id === game.game.id ) {
            return;
        }

        this.data.game = game.game;
        this.data.hero = game.hero;
        this.data.map = null;

        // reset canvas in case we had a map loaded...
        this.canvas.reset();

        // Kill any MediaBox audio that is playing...
        EditorUtils.destroySound();

        // Prefill the game data fields
        this.prefillGameFields( this.data.game );

        // Set active game to menu
        this.dom.gameLoad[ 0 ].innerText = this.data.game.name;

        this.setTitle();
    }


    loadMap ( map ) {
        if ( this.data.map && this.data.map.id === map.id ) {
            return;
        }

        // Set active map
        this.data.map = map;

        // Prefill the map data fields
        this.prefillMapFields( this.data.map );

        // Display the map canvas
        this.canvas.loadMap( this.data.map );

        // Set active map to menu
        this.dom.mapLoad[ 0 ].innerText = map.name;

        this.setTitle();
    }


    postMap ( postData ) {
        postData.fileName = `${Cache.slugify( postData.name )}.json`;
        this.mode = Config.Editor.modes.SAVING;
        this.dom.root[ 0 ].className = "is-saving-map";

        ipcRenderer.send( "renderer-newmap", postData );
        this.closeMenus();
        this.done();
    }


    postGame ( postData ) {
        this.mode = Config.Editor.modes.SAVING;
        this.dom.root[ 0 ].className = "is-saving-game";


        ipcRenderer.send( "renderer-newgame", postData );
        this.closeMenus();
        this.done();
    }


    loadAssets ( assets ) {
        if ( this.selects[ assets.type ] ) {
            EditorUtils.buildSelectMenu( this.selects[ assets.type ], assets.files );
        }
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
        // this.menus.activeGame.find( ".js-game-field[name='resolution']" )[ 0 ].value = game.resolution;
        this.menus.activeGame.find( ".js-game-field[name='width']" )[ 0 ].value = game.width;
        this.menus.activeGame.find( ".js-game-field[name='height']" )[ 0 ].value = game.height;
        this.dom.iconField[ 0 ].value = game.icon;
        this.dom.iconImage[ 0 ].src = `.${game.icon}`;
    }


    prefillMapFields ( map ) {
        this.menus.activeMap.find( ".js-map-field[name='name']" )[ 0 ].value = map.name;
        this.menus.activeMap.find( ".js-map-field[name='tilesize']" )[ 0 ].value = map.tilesize;
        this.menus.activeMap.find( ".js-map-field[name='tilewidth']" )[ 0 ].value = map.tilewidth;
        this.menus.activeMap.find( ".js-map-field[name='tileheight']" )[ 0 ].value = map.tileheight;
        this.menus.activeMap.find( ".js-map-field[name='image']" )[ 0 ].value = map.image.split( "/" ).pop();

        if ( map.sound ) {
            this.menus.activeMap.find( ".js-map-field[name='sound']" )[ 0 ].value = map.sound.split( "/" ).pop();
        }
    }


    blurSelectMenus () {
        this.selects.all.forEach(( select ) => {
            select.blur();
        });
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
                        // Purge the tile cels ensuring no duplicates Array[Array[x, y], Array[x, y]]
                        if ( Array.isArray( this.data.map.textures[ l ][ y ][ x ] ) ) {
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
                const px = this.data.map.tilesize * tile.tileCoord[ 0 ];
                const py = this.data.map.tilesize * tile.tileCoord[ 1 ];

                // Position has no tile: 0
                if ( this.data.map.textures[ layer ][ cy ][ cx ] === 0 ) {
                    this.data.map.textures[ layer ][ cy ][ cx ] = [
                        [
                            px,
                            py,
                        ]
                    ];

                // Position has tiles: Array[Array[x, y], Array[x, y]]
                } else if ( Array.isArray( this.data.map.textures[ layer ][ cy ][ cx ] ) ) {
                    this.data.map.textures[ layer ][ cy ][ cx ].push([
                        px,
                        py,
                    ]);
                }

                // Clean tiles on draw so we don't have to scan the entire texture
                this.data.map.textures[ layer ][ cy ][ cx ] = this.cleanTiles( this.data.map.textures[ layer ][ cy ][ cx ] );
                tile.renderTree = this.data.map.textures[ layer ][ cy ][ cx ];
            }
        });

        // this.cleanMap();
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


    readFile ( fileInput ) {
        return new Promise(( resolve ) => {
            const fileReader = new FileReader();
            const fileData = fileInput[ 0 ].files[ 0 ];

            if ( fileData ) {
                fileReader.onload = ( fe ) => {
                    resolve({
                        fileName: fileData.name,
                        fileData: fe.target.result,
                    });
                };

                fileReader.readAsDataURL( fileData );

            } else {
                reject();
            }
        });
    }


    _saveSnapshot () {
        // Upload map PNG snapshot
        const uploadSnap = {
            id: this.data.game.id,
            type: "snapshots",
            fileName: `${this.data.map.id}.png`,
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

        this.snapshot = snapshot;

        uploadSnap.fileData = snapshot.toDataURL( "image/png" );

        // Upload & save to disk in the background...
        ipcRenderer.send( "renderer-newfile", uploadSnap );
    }


    _saveMap () {
        if ( !this.canMapFunction() ) {
            return false;
        }

        this.mode = Config.Editor.modes.SAVING;
        this.dom.root[ 0 ].className = "is-saving-map";
        // this.cleanMap();

        // Save map JSON
        const postData = this.data.map;
        const mapData = EditorUtils.parseFields( this.fields.map );

        for ( const i in mapData ) {
            if ( mapData.hasOwnProperty( i ) ) {
                postData[ i ] = mapData[ i ];
            }
        }

        ipcRenderer.send( "renderer-savemap", postData );
        this.closeMenus();
        this.done();

        // Save snapshot images
        this._saveSnapshot();
    }


    _openMenu ( action, target ) {
        let canFunction = this.canGameFunction();

        // Capture circumstances
        if ( action === "newgame" ) {
            canFunction = true;

        } else if ( action === "mapsettings" && !this.data.map ) {
            canFunction = false;
        }

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


    _loadoutGames ( games ) {
        this.dom.loadout[ 0 ].innerHTML = games.map(( game ) => {
            return `<div class="js-game-tile" data-game="${game.id}">
                <div>
                    <img src=".${game.icon}" />
                </div>
                <div>${game.name}</div>
            </div>`;

        }).join( "" );

        this.dom.loadout.addClass( "is-loaded" );
    }


    _loadoutMaps ( maps ) {
        this.dom.loadout[ 0 ].innerHTML = maps.map(( map ) => {
            return `<div class="js-map-tile" data-map="${map.id}">
                <div>
                    <img src="./${map.thumbnail}" />
                </div>
                <div>${map.name}</div>
            </div>`;

        }).join( "" );

        this.dom.loadout.addClass( "is-loaded" );
    }


    _loadoutClear () {
        this.dom.loadout[ 0 ].innerHTML = "";
        this.dom.loadout.removeClass( "is-loaded" );
    }


    _onSettingsClick ( e ) {
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
    }


    bindMenuEvents () {
        ipcRenderer.send( "renderer-loadgames" );

        // Tell ipcMain to reset dynamic submenus
        window.onbeforeunload = () => {
            ipcRenderer.send( "renderer-unload" );
        };

        ipcRenderer.on( "menu-loadgames", ( e, games ) => {
            this._loadoutGames( games );
        });

        ipcRenderer.on( "menu-loadmaps", ( e, maps ) => {
            this._loadoutMaps( maps );
        });

        ipcRenderer.on( "menu-togglegrid", () => {
            this.canvas.toggleGrid();
        });

        ipcRenderer.on( "menu-savemap", () => {
            this._saveMap();
        });

        ipcRenderer.on( "menu-gamesettings", () => {
            this._onSettingsClick({
                target: this.dom.gameSettings[ 0 ],
            });
        });

        ipcRenderer.on( "menu-newgame", () => {
            this._openMenu( "newgame", "editor-addgame-menu" );
        });

        ipcRenderer.on( "menu-mapsettings", () => {
            this._onSettingsClick({
                target: this.dom.mapSettings[ 0 ],
            });
        });

        ipcRenderer.on( "menu-newmap", () => {
            this._openMenu( "newmap", "editor-addmap-menu" );
        });

        ipcRenderer.on( "menu-newtileset", () => {
            this._openUpload( "tileset", "editor-addtiles-menu" );
        });

        ipcRenderer.on( "menu-newsound", () => {
            this._openUpload( "sound", "editor-addsound-menu" );
        });

        ipcRenderer.on( "menu-loadgame", ( e, game ) => {
            this.loadGame( game );
        });

        ipcRenderer.on( "menu-loadmap", ( e, map ) => {
            this.loadMap( map );
        });

        ipcRenderer.on( "menu-assets", ( e, assets ) => {
            this.loadAssets( assets );
        });

        ipcRenderer.on( "menu-reloadicon", ( e, game ) => {
            this.dom.iconImage[ 0 ].src = `.${game.icon}?buster=${Date.now()}`;
            this.dom.iconField[ 0 ].value = game.icon;
        });
    }


    bindEvents () {
        const $document = $( document );

        $document.on( "click", ".js-game-tile", ( e ) => {
            ipcRenderer.send( "renderer-loadgame", e.target.dataset );
        });

        $document.on( "click", ".js-map-tile", ( e ) => {
            ipcRenderer.send( "renderer-loadmap", e.target.dataset );
            this._loadoutClear();
        });

        this.selects.all.on( "change", ( e ) => {
            this.blurSelectMenus();
        });

        this.dom.uploadFiles.on( "change", ( e ) => {
            const targ = $( e.target );
            const elem = targ.is( ".js-upload-file" ) ? targ : targ.closest( ".js-upload-file" );
            const data = elem.data();

            if ( targ[ 0 ].name === "icon" ) {
                this.readFile( targ ).then(( response ) => {
                    ipcRenderer.send( "renderer-uploadicon", response );
                });
            }

            document.getElementById( data.target ).value = elem[ 0 ].value;
        });


        this.selects.sounds.on( "change", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = $( e.target );
            const sampler = targ.is( ".js-sound-sampler" ) ? targ : targ.closest( ".js-sound-sampler" );

            if ( sampler.length && sampler.is( ".is-playing" ) ) {
                EditorUtils.processSound( sampler, this.data.game.id );
            }
        });

        this.dom.settings.on( "click", this._onSettingsClick.bind( this ) );
        this.dom.closeSettings.on( "click", ( e ) => {
            this.closeMenus();
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

                ipcRenderer.send( "renderer-deletefile", postData );
                this.closeMenus();
                this.done();
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
            const postData = {
                id: this.data.game.id,
                type: button.data().type,
            };

            this.mode = Config.Editor.modes.SAVING;
            this.dom.root[ 0 ].className = "is-saving-file";

            this.readFile( fileInput ).then(( response ) => {
                postData.fileName = response.fileName;
                postData.fileData = response.fileData;
                ipcRenderer.send( "renderer-newfile", postData );
                fileField[ 0 ].value = "";
                this.closeMenus();
                this.done();
            });
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

            if ( button.is( ".icon--pause_circle_outline" ) ) {
                button.removeClass( "icon--pause_circle_outline" );
                button.addClass( "icon--play_circle_outline" );

            } else {
                button.removeClass( "icon--play_circle_outline" );
                button.addClass( "icon--pause_circle_outline" );
            }

            EditorUtils.processSound( sampler, this.data.game.id );
        });


        // this.dom.deleteMap.on( "click", ( e ) => {
        //     if ( !this.canMapFunction() ) {
        //         return false;
        //     }
        //
        //     if ( confirm( `Sure you want to delete the map "${active.map.name}"?` ) ) {
        //         this.mode = Config.Editor.modes.SAVING;
        //         this.dom.root[ 0 ].className = "is-deleting-map";
        //
        //         ipcRenderer.send( "renderer-deletemap", this.data.map );
        //         // window.location.reload();
        //     }
        // });


        // this.dom.deleteGame.on( "click", ( e ) => {
        //     if ( !this.canGameFunction() ) {
        //         return false;
        //     }
        //
        //     if ( confirm( `Sure you want to delete the game "${this.data.game.name}"?` ) ) {
        //         this.mode = Library.Editor.modes.SAVING;
        //         this.dom.root[ 0 ].className = "is-deleting-game";
        //
        //         ipcRenderer.send( "renderer-deletegame", this.data.game );
        //         // window.location.reload();
        //     }
        // });
    }
}



module.exports = Editor;
