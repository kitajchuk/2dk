const EditorActions = require( "./EditorActions" );
const EditorLayers = require( "./EditorLayers" );
const EditorCanvas = require( "./EditorCanvas" );
const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Cache = require( "../../server/cache" );
const { ipcRenderer } = require( "electron" );



class Editor {
    constructor () {
        this.mode = null;
        this.data = {};
        this.layers = new EditorLayers( this );
        this.canvas = new EditorCanvas( this );
        this.actions = new EditorActions( this );
        this.utils = Utils;
        this.dom = {
            root: window.hobo( "#editor" ),
            settings: window.hobo( ".js-settings" ),
            mapSettings: window.hobo( "#editor-mapsettings" ),
            gameSettings: window.hobo( "#editor-gamesettings" ),
            closeSettings: window.hobo( ".js-close-settings" ),
            cancelPost: window.hobo( ".js-post-cancel" ),
            savePost: window.hobo( ".js-post-save" ),
            updatePost: window.hobo( ".js-post-update" ),
            uploadFiles: window.hobo( ".js-upload-file" ),
            cancelUpload: window.hobo( ".js-upload-cancel" ),
            deleteUpload: window.hobo( ".js-upload-delete" ),
            saveUpload: window.hobo( ".js-upload-save" ),
            deleteMap: window.hobo( "#editor-delmap" ),
            deleteGame: window.hobo( "#editor-delgame" ),
            loadout: window.hobo( "#editor-loadout" ),
            mapLoad: window.hobo( "#editor-map-load" ),
            gameLoad: window.hobo( "#editor-game-load" ),
            iconImage: window.hobo( "#editor-game-icon-image" ),
            iconField: window.hobo( "#editor-game-icon" ),
            demoGame: window.hobo( "#editor-demo-game" ),
        };
        this.selects = {
            all: window.hobo( ".js-select" ),
            maps: window.hobo( ".js-select-map" ),
            tiles: window.hobo( ".js-select-tiles" ),
            sounds: window.hobo( ".js-select-sound" ),
            sprites: window.hobo( ".js-select-sprites" ),
            actions: window.hobo( ".js-select-action" ),
        };
        this.menus = {
            all: window.hobo( ".js-menu" ),
            activeMap: window.hobo( "#editor-active-map-menu" ),
            activeGame: window.hobo( "#editor-active-game-menu" ),
            activeTiles: window.hobo( "#editor-activetiles-menu" ),
        };
        this.fields = {
            map: window.hobo( ".js-map-field" ),
            addMap: window.hobo( ".js-addmap-field" ),
            addGame: window.hobo( ".js-addgame-field" ),
            activeTile: window.hobo( ".js-activetile-field" ),
        };

        this.display();
        this.bindEvents();
        this.bindMenuEvents();
        this.bindeFileEvents();
        this.bindDocumentEvents();
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


    setTitle () {
        // Set document title
        document.title = `${this.data.map ? this.data.map.name : this.data.game.name} | 2dk Studio`;
    }


    loadGame ( game ) {
        // console.log( game );

        // When a map is deleted the ipc renderer<->menu will cycle this again...
        if ( this.mode === Config.Editor.modes.SAVING ) {
            this.mode = null;
        }

        if ( this.data.game && this.data.game.id === game.id ) {
            return;
        }

        this.data.game = game;
        this.data.map = null;

        // reset canvas in case we had a map loaded...
        this.canvas.reset();

        // Kill any MediaBox audio that is playing...
        Utils.destroySound();

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
            Utils.buildSelectMenu( this.selects[ assets.type ], assets.files );
        }
    }


    loadMapMenus () {
        Utils.buildSelectMenu( this.selects.actions, window.lib2dk.Config.verbs );
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
        this.menus.activeGame.find( ".js-game-field[name='save']" )[ 0 ].value = game.save;
        this.menus.activeGame.find( ".js-game-field[name='release']" )[ 0 ].value = game.release;
        this.dom.iconField[ 0 ].value = game.icon;
        this.dom.iconImage[ 0 ].src = `./games/${game.id}/${game.icon}`;
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
                    return ret;
                }
            }

            if ( uniq ) {
                ret.push( uniq );
            }
        }

        return ret;
    }


    updateMapLayer ( layer, coords, coordMap ) {
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
    }


    closeMenus () {
        this.menus.all.removeClass( "is-active" );
        this.actions.enableKeys();
    }


    clearMenu ( menu ) {
        const inputs = menu.find( ".editor__field, .select__field" );
        const checks = menu.find( ".check" );

        inputs.forEach(( input ) => {
            input.value = "";
        });

        checks.forEach(( check ) => {
            check.checked = false;
        });
    }


    readFile ( fileInput ) {
        return new Promise(( resolve, reject ) => {
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
        const mapData = Utils.parseFields( this.fields.map );

        Object.keys( mapData ).forEach(( i ) => {
            postData[ i ] = mapData[ i ];
        });

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

        const menu = window.hobo( `#${target}` );

        if ( menu.is( ".is-active" ) ) {
            this.closeMenus();
            this.clearMenu( menu );

        } else {
            this.closeMenus();
            menu.addClass( "is-active" );
            this.actions.disableKeys();
        }
    }


    _openUpload ( type, target ) {
        if ( !this.canGameFunction() ) {
            return false;
        }

        const menu = window.hobo( `#${target}` );

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
                    <img src="./games/${game.id}/${game.icon}" />
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
                    <img src="./games/${this.data.game.id}/${map.thumbnail || map.image}" />
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
        const targ = window.hobo( e.target );
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

        ipcRenderer.on( "menu-newsprite", () => {
            this._openUpload( "sprite", "editor-addsprites-menu" );
        });

        ipcRenderer.on( "menu-loadgame", ( e, game ) => {
            this.loadGame( game );
        });

        ipcRenderer.on( "menu-loadmap", ( e, map ) => {
            this.loadMap( map );
            this.loadMapMenus();
            this._loadoutClear();
        });

        ipcRenderer.on( "menu-assets", ( e, assets ) => {
            this.loadAssets( assets );
        });

        ipcRenderer.on( "menu-reloadicon", ( e, game ) => {
            this.dom.iconImage[ 0 ].src = `./games/${game.id}/${game.icon}?buster=${Date.now()}`;
            this.dom.iconField[ 0 ].value = game.icon;
        });
    }


    bindDocumentEvents () {
        const $document = window.hobo( document );

        $document.on( "click", ".js-game-tile", ( e ) => {
            ipcRenderer.send( "renderer-loadgame", {
                game: e.target.dataset.game,
            });
        });

        $document.on( "click", ".js-map-tile", ( e ) => {
            ipcRenderer.send( "renderer-loadmap", {
                map: e.target.dataset.map,
            });
            this._loadoutClear();
        });

        $document.on( "click", ".js-sound-button", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = window.hobo( e.target );
            const sampler = targ.is( ".js-sound-sampler" ) ? targ : targ.closest( ".js-sound-sampler" );

            Utils.processSound( sampler, this.data.game.id );
        });
    }


    bindeFileEvents () {
        this.dom.uploadFiles.on( "change", ( e ) => {
            const targ = window.hobo( e.target );
            const elem = targ.is( ".js-upload-file" ) ? targ : targ.closest( ".js-upload-file" );
            const data = elem.data();

            if ( targ[ 0 ].name === "icon" ) {
                this.readFile( targ ).then(( response ) => {
                    ipcRenderer.send( "renderer-uploadicon", response );
                });
            }

            document.getElementById( data.target ).value = elem[ 0 ].value;
        });

        this.dom.cancelUpload.on( "click", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = window.hobo( e.target );
            const elem = targ.is( ".js-upload-cancel" ) ? targ : targ.closest( ".js-upload-cancel" );

            this.closeMenus();
            this.clearMenu( elem.closest( ".js-menu" ) );
        });

        this.dom.deleteUpload.on( "click", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = window.hobo( e.target );
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

            const targ = window.hobo( e.target );
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
    }


    bindEvents () {
        this.selects.all.on( "change", () => {
            this.blurSelectMenus();
        });

        this.selects.sounds.on( "change", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = window.hobo( e.target );
            const sampler = targ.is( ".js-sound-sampler" ) ? targ : targ.closest( ".js-sound-sampler" );

            if ( sampler.length && sampler.is( ".is-playing" ) ) {
                Utils.processSound( sampler, this.data.game.id );
            }
        });

        this.dom.settings.on( "click", this._onSettingsClick.bind( this ) );
        this.dom.closeSettings.on( "click", () => {
            this.closeMenus();
        });

        this.dom.cancelPost.on( "click", ( e ) => {
            const targ = window.hobo( e.target );
            const elem = targ.is( ".js-post-cancel" ) ? targ : targ.closest( ".js-post-cancel" );
            const elemData = elem.data();
            const canFunction = (elemData.type === "game") || this.canGameFunction();

            if ( !canFunction ) {
                return false;
            }

            this.closeMenus();
            this.clearMenu( elem.closest( ".js-menu" ) );
        });

        this.dom.savePost.on( "click", ( e ) => {
            const targ = window.hobo( e.target );
            const elem = targ.is( ".js-post-save" ) ? targ : targ.closest( ".js-post-save" );
            const elemData = elem.data();
            const canFunction = (elemData.type === "game") || this.canGameFunction();

            if ( !canFunction ) {
                return false;
            }

            const postData = (elemData.type === "game" ?
                Utils.parseFields( this.fields.addGame ) :
                // "map" is the only post besides game...
                Utils.parseFields( this.fields.addMap ));

            if ( postData.name ) {
                if ( elemData.type === "game" ) {
                    this.postGame( postData );

                // "map" is the only post besides game...
                } else {
                    this.postMap( postData );
                }

                this.clearMenu( elem.closest( ".js-menu" ) );
            }
        });

        this.dom.updatePost.on( "click", ( e ) => {
            const targ = window.hobo( e.target );
            const elem = targ.is( ".js-post-update" ) ? targ : targ.closest( ".js-post-update" );
            const elemData = elem.data();

            if ( !this.canMapFunction() ) {
                return false;
            }

            if ( elemData.type === "activetiles" ) {
                const activeTileData = Utils.parseFields( this.fields.activeTile );

                this.canvas.applyActiveTiles( activeTileData );
            }
        });

        this.dom.demoGame.on( "click", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            if ( this.canMapFunction() ) {
                window.open(
                    `./games/${this.data.game.id}/index.html?map=${this.data.map.id}.json`,
                    "_blank",
                    `width=${this.data.game.width},height=${this.data.game.height}`
                );
            } else {
                window.open(
                    `./games/${this.data.game.id}/index.html`,
                    "_blank",
                    `width=${this.data.game.width},height=${this.data.game.height}`
                );
            }
        });

        this.dom.deleteMap.on( "click", ( e ) => {
            if ( !this.canMapFunction() ) {
                return false;
            }
        
            if ( confirm( `Sure you want to delete the map "${this.data.map.name}"? This may affect other data referencing this map.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root[ 0 ].className = "is-deleting-map";
                this.closeMenus();
                this.actions.resetActions();
                ipcRenderer.send( "renderer-deletemap", this.data.map );
            }
        });


        this.dom.deleteGame.on( "click", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }
        
            if ( confirm( `Sure you want to delete the game "${this.data.game.name}"? This cannot be undone.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root[ 0 ].className = "is-deleting-game";
        
                ipcRenderer.send( "renderer-deletegame", this.data.game );
                window.location.reload(); // Clunky maybe but best simple solution for now :-P
            }
        });
    }
}



module.exports = Editor;
