const { ipcRenderer } = require( "electron" );

const {
    renderMap, 
    renderGame 
} = require( "./Render" );
const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Cache = require( "../../server/cache" );
const EditorMenus = require( "./EditorMenus" );
const EditorLayers = require( "./EditorLayers" );
const EditorActions = require( "./EditorActions" );
const EditorCanvas = require( "./canvas/EditorCanvas" );



class Editor {
    constructor () {
        this.menus = new EditorMenus( this );
        this.layers = new EditorLayers( this );
        this.canvas = new EditorCanvas( this );
        this.actions = new EditorActions( this );
        
        this.baseUrl = `${window.location.pathname}`;
        this.mode = null;
        this.data = {};
        this.dom = {
            css: window.hobo( "#editor-css" ),
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
            loadoutGrid: window.hobo( "#editor-loadout-grid" ),
            mapLoad: window.hobo( "#editor-map-load" ),
            gameLoad: window.hobo( "#editor-game-load" ),
            iconImage: window.hobo( "#editor-game-icon-image" ),
            iconField: window.hobo( "#editor-game-icon" ),
            demoGame: window.hobo( "#editor-demo-game" ),
        };
        this.fields = {
            map: window.hobo( ".js-map-field" ),
            addMap: window.hobo( ".js-addmap-field" ),
            addGame: window.hobo( ".js-addgame-field" ),
            activeTile: window.hobo( ".js-activetile-field" ),
        };

        this.load();
        this.done();
        this.bindEvents();
        this.bindMenuEvents();
        this.bindeFileEvents();
        this.bindDocumentEvents();
    }


    load () {
        ipcRenderer.send( "renderer-loadgames" );
    }


    done () {
        this.mode = null;

        setTimeout( () => {
            this.dom.root.removeClass( "is-not-loaded is-saving-map is-saving-game is-saving-file is-deleting-file" );

        }, 1000 );
    }


    setTitle () {
        const title = [ "2dk Studio" ];

        if ( this.data.map ) {
            title.push( `Map: ${this.data.map.name}` );
        }
        
        if ( this.data.game ) {
            title.push( `Game: ${this.data.game.name}` );
        }

        document.title = title.reverse().join( " | " );
    }


    updateUrl () {
        const params = new URLSearchParams();

        if ( this.data.game ) {
            params.set( "game", this.data.game.id );
        }

        if ( this.data.map ) {
            params.set( "map", this.data.map.id );
        }

        const query = params.toString();

        window.history.replaceState( {}, "", `${this.baseUrl}${query ? `?${query}` : ""}` );
    }


    loadGame ( game ) {
        // When a map is deleted the ipc renderer<->menu will cycle this again...
        if ( this.mode === Config.Editor.modes.SAVING ) {
            this.mode = null;
        }

        if ( this.data.game && this.data.game.id === game.id ) {
            return;
        }

        this.data.game = game;
        this.data.map = null;
        this.data.assets = {};
        // reset canvas in case we had a map loaded...
        this.canvas.reset();

        // Kill any MediaBox audio that is playing...
        Utils.destroySound();

        // Prefill the game data fields
        this.menus.prefillGameFields( this.data.game );

        // Set active game to menu
        this.dom.gameLoad[ 0 ].innerText = this.data.game.name;

        this.setTitle();
        this.updateUrl();
    }


    loadMap ( map ) {
        if ( this.data.map && this.data.map.id === map.id ) {
            return;
        }

        // Set active map
        this.data.map = map;

        // Prefill the map data fields
        this.menus.prefillMapFields( this.data.map );

        // Display the map canvas
        this.canvas.reset();
        this.canvas.loadMap( this.data.map, this.data.game );

        // Set active map to menu
        this.dom.mapLoad[ 0 ].innerText = map.name;

        this.setTitle();
        this.updateUrl();
    }


    postMap ( postData ) {
        postData.fileName = `${Cache.slugify( postData.name )}.json`;
        this.mode = Config.Editor.modes.SAVING;
        this.dom.root.addClass( "is-saving-map" );

        ipcRenderer.send( "renderer-newmap", postData );
        this.menus.closeMenus();
        this.done();
    }


    postGame ( postData ) {
        this.mode = Config.Editor.modes.SAVING;
        this.dom.root.addClass( "is-saving-game" );

        ipcRenderer.send( "renderer-newgame", postData );
        this.menus.closeMenus();
        this.done();
    }


    loadAssets ( assets ) {
        if ( !this.data.assets[ assets.type ] ) {
            this.data.assets[ assets.type ] = assets;
        }

        this.menus.buildAssetSelectMenu( assets );
    }


    loadMapMenus () {
        this.menus.buildConfigSelectMenus();
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


    readFile ( fileInput ) {
        return new Promise( ( resolve, reject ) => {
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

        snapshot.width = this.data.map.width;
        snapshot.height = this.data.map.height;
        snapshot.style.width = `${this.data.map.width}px`;
        snapshot.style.height = `${this.data.map.height}px`;

        const layers = [
            "background",       
            "foreground",
            "npc",
            "obj",
        ];

        layers.forEach(( layer ) => {
            snapshotCtx.drawImage(
                this.canvas.contexts[ layer ].canvas,
                0,
                0,
                snapshot.width,
                snapshot.height,
                0,
                0,
                snapshot.width,
                snapshot.height
            );
        });

        uploadSnap.fileData = snapshot.toDataURL( "image/png" );

        // Upload & save to disk in the background...
        ipcRenderer.send( "renderer-newfile", uploadSnap );
    }


    _saveMap () {
        if ( !this.canMapFunction() ) {
            return false;
        }

        this.mode = Config.Editor.modes.SAVING;
        this.dom.root.addClass( "is-saving-map" );

        // Save map JSON
        const postData = this.data.map;
        const mapData = Utils.parseFields( this.fields.map );

        Object.keys( mapData ).forEach( ( i ) => {
            postData[ i ] = mapData[ i ];
        });

        ipcRenderer.send( "renderer-savemap", postData );
        this.menus.closeMenus();
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

        this.menus.toggleMenu( target );
    }


    _openUpload ( type, target ) {
        if ( !this.canGameFunction() ) {
            return false;
        }

        this.menus.toggleMenu( target );
    }


    _onSettingsClick ( e ) {
        const targ = window.hobo( e.target );
        const elem = targ.is( ".js-settings" ) ? targ : targ.closest( ".js-settings" );
        const elemData = elem.data();

        if ( elemData.type === "game" && this.canGameFunction() ) {
            this.menus.toggleMenu( "editor-active-game-menu" );
            
        } else if ( elemData.type === "map" && this.canMapFunction() ) {
            this.menus.toggleMenu( "editor-active-map-menu" );
        }
    }


    _loadoutGames ( games ) {
        this.dom.loadoutGrid[ 0 ].innerHTML = games.map( ( game ) => {
            return renderGame( game );
        }).join( "" );

        this.dom.loadout.addClass( "is-loaded" );
    }


    _loadoutMaps ( maps ) {
        this.dom.loadoutGrid[ 0 ].innerHTML = maps.map( ( map ) => {
            return renderMap( map, this.data.game );
        }).join( "" );

        this.dom.loadout.addClass( "is-loaded" );
    }


    _loadoutClear () {
        this.dom.loadoutGrid[ 0 ].innerHTML = "";
        this.dom.loadout.removeClass( "is-loaded" );
    }


    bindMenuEvents () {
        const initialParams = new URLSearchParams( window.location.search );
        let initialQueryGame = initialParams.get( "game" );
        let initialQueryMap = initialParams.get( "map" );

        // Tell ipcMain to reset dynamic submenus
        window.onbeforeunload = () => {
            ipcRenderer.send( "renderer-unload" );
        };

        ipcRenderer.on( "menu-loadgames", ( e, games ) => {
            if ( initialQueryGame ) {
                ipcRenderer.send( "renderer-loadgame", {
                    game: initialQueryGame,
                });
                initialQueryGame = null;
            } else {
                this._loadoutGames( games );
            }
        });

        ipcRenderer.on( "menu-loadmaps", ( e, maps ) => {
            this.menus.buildMapSelectMenus( maps );
            
            if ( initialQueryMap ) {
                ipcRenderer.send( "renderer-loadmap", {
                    map: initialQueryMap,
                });
                initialQueryMap = null;
            } else {
                this._loadoutMaps( maps );
            }
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

        ipcRenderer.on( "watch-reloadcss", ( e ) => {
            this.dom.css[ 0 ].href = `./public/css/studio.css?buster=${Date.now()}`;
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
                this.readFile( targ ).then( ( response ) => {
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

            this.menus.closeMenus();
            this.menus.clearMenu( elem.closest( ".js-menu" ) );
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
                fileName: select[ 0 ].value,
            };

            if ( confirm( `Sure you want to delete the file "${select[ 0 ].value}"? This may affect other data referencing this file.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root.addClass( "is-deleting-file" );

                ipcRenderer.send( "renderer-deletefile", postData );
                this.menus.closeMenus();
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
            this.dom.root.addClass( "is-saving-file" );

            this.readFile( fileInput ).then( ( response ) => {
                postData.fileName = response.fileName;
                postData.fileData = response.fileData;
                ipcRenderer.send( "renderer-newfile", postData );
                fileField[ 0 ].value = "";
                this.menus.closeMenus();
                this.done();
            });
        });
    }


    bindEvents () {
        this.dom.settings.on( "click", this._onSettingsClick.bind( this ) );
        this.dom.closeSettings.on( "click", () => {
            this.menus.closeMenus();
        });

        this.dom.cancelPost.on( "click", ( e ) => {
            const targ = window.hobo( e.target );
            const elem = targ.is( ".js-post-cancel" ) ? targ : targ.closest( ".js-post-cancel" );
            const elemData = elem.data();
            const canFunction = ( elemData.type === "game" ) || this.canGameFunction();

            if ( !canFunction ) {
                return false;
            }

            this.menus.closeMenus();
            this.menus.clearMenu( elem.closest( ".js-menu" ) );
        });

        this.dom.savePost.on( "click", ( e ) => {
            const targ = window.hobo( e.target );
            const elem = targ.is( ".js-post-save" ) ? targ : targ.closest( ".js-post-save" );
            const elemData = elem.data();
            const canFunction = ( elemData.type === "game" ) || this.canGameFunction();

            if ( !canFunction ) {
                return false;
            }

            const postData = ( elemData.type === "game" ?
                Utils.parseFields( this.fields.addGame ) :
                // "map" is the only post besides game...
                Utils.parseFields( this.fields.addMap ) );

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

        this.dom.demoGame.on( "click", () => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            let baseUrl = `./games/${this.data.game.id}/index.html`;

            if ( this.canMapFunction() ) {
                baseUrl += `?map=${this.data.map.id}.json`;
            }

            window.open(
                baseUrl,
                "_blank",
                `width=${this.data.game.width},height=${this.data.game.height}`
            );
        });

        this.dom.deleteMap.on( "click", () => {
            if ( !this.canMapFunction() ) {
                return false;
            }

            if ( confirm( `Sure you want to delete the map "${this.data.map.name}"? This may affect other data referencing this map.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root.addClass( "is-deleting-map" );
                this.menus.closeMenus();
                this.actions.resetActions();
                ipcRenderer.send( "renderer-deletemap", this.data.map );
            }
        });


        this.dom.deleteGame.on( "click", () => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            if ( confirm( `Sure you want to delete the game "${this.data.game.name}"? This cannot be undone.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root.addClass( "is-deleting-game" );

                ipcRenderer.send( "renderer-deletegame", this.data.game );
                this.data = {};
                this.updateUrl();
                window.location.reload();
            }
        });
    }
}



module.exports = Editor;
