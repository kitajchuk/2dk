const { ipcRenderer } = require( "electron" );

const {
    renderMap, 
    renderGame 
} = require( "./render/Render" );
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
        this.data = {
            game: null,
            map: null,
            maps: [],
            assets: {},
        };
        this.dom = {
            css: document.getElementById( "editor-css" ),
            root: document.getElementById( "editor" ),
            debug: document.getElementById( "editor-debug" ),
            settings: document.querySelectorAll( ".js-settings" ),
            mapSettings: document.getElementById( "editor-mapsettings" ),
            gameSettings: document.getElementById( "editor-gamesettings" ),
            loadout: document.getElementById( "editor-loadout" ),
            loadoutGrid: document.getElementById( "editor-loadout-grid" ),
            mapLoad: document.getElementById( "editor-map-load" ),
            gameLoad: document.getElementById( "editor-game-load" ),
            demoGame: document.getElementById( "editor-demo-game" ),
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


    done ( timeout = 1000 ) {
        this.mode = null;

        setTimeout( () => {
            this.dom.root.classList.remove(
                "is-not-loaded",
                "is-saving-map",
                "is-saving-game",
                "is-saving-file",
                "is-deleting-file"
            );

        }, timeout );
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

        this.data = {
            game,
            map: null,
            maps: [],
            assets: {},
        };

        // reset canvas in case we had a map loaded...
        this.canvas.reset();

        // Kill any MediaBox audio that is playing...
        Utils.destroySound();

        // Set active game to menu
        this.dom.gameLoad.innerText = this.data.game.name;

        this.setTitle();
        this.updateUrl();
    }


    loadMap ( map ) {
        if ( this.data.map && this.data.map.id === map.id ) {
            return;
        }

        // Set active map
        this.data.map = map;

        // Display the map canvas
        this.canvas.reset();
        this.canvas.loadMap( this.data.map, this.data.game );

        // Set active map to menu
        this.dom.mapLoad.innerText = map.name;

        this.setTitle();
        this.updateUrl();
    }


    postMap ( postData ) {
        postData.fileName = `${Cache.slugify( postData.name )}.json`;

        // We now get this from the game data...
        postData.tilesize = Number( this.data.game.tilesize );
        postData.tilewidth = postData.type === window.lib2dk.Config.map.types.WORLD
            ? Number( this.data.game.worldmapsize.tilewidth )
            : Number( this.data.game.indoormapsize.tilewidth );
        postData.tileheight = postData.type === window.lib2dk.Config.map.types.WORLD
            ? Number( this.data.game.worldmapsize.tileheight )
            : Number( this.data.game.indoormapsize.tileheight );

        this.mode = Config.Editor.modes.SAVING;
        this.dom.root.classList.add( "is-saving-map" );

        ipcRenderer.send( "renderer-newmap", postData );
        this.menus.removeMenus();
        this.done();
    }


    postGame ( postData ) {
        this.mode = Config.Editor.modes.SAVING;
        this.dom.root.classList.add( "is-saving-game" );

        ipcRenderer.send( "renderer-newgame", postData );
        this.menus.removeMenus();
        this.done();
    }


    loadAssets ( assets ) {
        this.data.assets[ assets.type ] = assets;
        this.menus.buildAssetSelectMenu( assets );
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
            const fileData = fileInput.files[ 0 ];

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
        this.dom.root.classList.add( "is-saving-map" );

        // Save map JSON
        const postData = this.data.map;

        // TODO: parse map settings fields when we make them editable...
        // Object.keys( mapData ).forEach( ( i ) => {
        //     postData[ i ] = mapData[ i ];
        // });

        ipcRenderer.send( "renderer-savemap", postData );
        this.menus.removeMenus();
        this.done();

        // Save snapshot images
        this._saveSnapshot();
    }


    _onSettingsClick ( target ) {
        const settings = target.closest( ".js-settings" );

        if ( !settings ) {
            return;
        }

        const elemData = settings.dataset;

        if ( elemData.type === "game" && this.canGameFunction() ) {
            this.menus.renderMenu( "editor-active-game-menu", this.data.game );
            
        } else if ( elemData.type === "map" && this.canMapFunction() ) {
            this.menus.renderMenu( "editor-active-map-menu", {
                map: this.data.map,
                types: Utils.getOptionData( window.lib2dk.Config.map.types ),
                assets: this.data.assets,
            });
        }
    }


    _loadoutGames ( games ) {
        this.dom.loadoutGrid.innerHTML = games.map( ( game ) => {
            return renderGame( game );
        }).join( "" );

        this.dom.loadout.classList.add( "is-loaded" );
    }


    _loadoutMaps ( maps ) {
        this.dom.loadoutGrid.innerHTML = maps.map( ( map ) => {
            return renderMap( map, this.data.game );
        }).join( "" );

        this.dom.loadout.classList.add( "is-loaded" );
    }


    _loadoutClear () {
        this.dom.loadoutGrid.innerHTML = "";
        this.dom.loadout.classList.remove( "is-loaded" );
    }


    bindMenuEvents () {
        const initialParams = new URLSearchParams( window.location.search );
        let initialQueryGame = initialParams.get( "game" );
        let initialQueryMap = initialParams.get( "map" );

        // Tell ipcMain to reset dynamic submenus
        window.onbeforeunload = () => {
            ipcRenderer.send( "renderer-unload" );
        };

        ipcRenderer.on( "menu-gamelibrary", () => {
            console.log( "menu-gamelibrary" );
        });

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
            this.data.maps = maps;
            
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
            this._onSettingsClick( this.dom.gameSettings );
        });

        ipcRenderer.on( "menu-newgame", () => {
            this.menus.renderMenu( "editor-addgame-menu" );
        });

        ipcRenderer.on( "menu-mapsettings", () => {
            this._onSettingsClick( this.dom.mapSettings );
        });

        ipcRenderer.on( "menu-newmap", () => {
            this.menus.renderMenu( "editor-addmap-menu", {
                types: Utils.getOptionData( window.lib2dk.Config.map.types ),
                tiles: this.data.assets.tiles,
                sounds: this.data.assets.sounds,
            });
        });

        ipcRenderer.on( "menu-newtileset", () => {
            this.menus.renderMenu( "editor-addtiles-menu", {
                tiles: this.data.assets.tiles,
            });
        });

        ipcRenderer.on( "menu-newsound", () => {
            this.menus.renderMenu( "editor-addsound-menu", {
                sounds: this.data.assets.sounds,
            });
        });

        ipcRenderer.on( "menu-newsprite", () => {
            this.menus.renderMenu( "editor-addsprites-menu", {
                sprites: this.data.assets.sprites,
            });
        });

        ipcRenderer.on( "menu-loadgame", ( e, game ) => {
            this.loadGame( game );
        });

        ipcRenderer.on( "menu-loadmap", ( e, map ) => {
            this.loadMap( map );
            this._loadoutClear();
        });

        ipcRenderer.on( "menu-assets", ( e, assets ) => {
            this.loadAssets( assets );
        });

        ipcRenderer.on( "menu-reloadicon", ( e, game ) => {
            const img = document.getElementById( "editor-game-icon-image" );
            const icon = document.getElementById( "editor-game-icon" );

            img.src = `./games/${game.id}/${game.icon}?buster=${Date.now()}`;
            icon.value = game.icon;
        });

        ipcRenderer.on( "watch-reloadcss", ( e ) => {
            this.dom.css.href = `./public/css/studio.css?buster=${Date.now()}`;
        });
    }


    bindDocumentEvents () {
        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-game-tile" );

            if ( !target ) {
                return;
            }

            ipcRenderer.send( "renderer-loadgame", {
                game: target.dataset.game,
            });
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-map-tile" );

            if ( !target ) {
                return;
            }

            ipcRenderer.send( "renderer-loadmap", {
                map: target.dataset.map,
            });

            this._loadoutClear();
        });

        document.addEventListener( "click", ( e ) => {
            const button = e.target.closest( ".js-sound-button" );
            const sampler = e.target.closest( ".js-sound-sampler" );

            if ( !this.canGameFunction() || !button || !sampler ) {
                return;
            }

            Utils.processSound( sampler, this.data.game.id );
        });
    }


    bindeFileEvents () {
        document.addEventListener( "change", ( e ) => {
            const target = e.target.closest( ".js-upload-file" );

            if ( !target ) {
                return;
            }

            if ( target.name === "icon" ) {
                this.readFile( target ).then( ( response ) => {
                    ipcRenderer.send( "renderer-uploadicon", response );
                });
            }

            const dataTarget = document.getElementById( target.dataset.target );

            if ( dataTarget ) {
                dataTarget.value = target.value;
            }
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-upload-cancel" );

            if ( !this.canGameFunction() || !target ) {
                return;
            }

            this.menus.removeMenus();
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-upload-delete" );

            if ( !target ) {
                return;
            }

            if ( !this.canGameFunction() ) {
                return false;
            }

            const menu = target.closest( ".js-upload-menu" );
            const select = menu.querySelector( ".js-select-delete" );
            const postData = {
                type: target.dataset.type,
                fileName: select.value,
            };

            if ( confirm( `Sure you want to delete the file "${select.value}"? This may affect other data referencing this file.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root.classList.add( "is-deleting-file" );

                ipcRenderer.send( "renderer-deletefile", postData );
                this.menus.removeMenus();
                this.done();
            }
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-upload-save" );

            if ( !target ) {
                return;
            }   

            if ( !this.canGameFunction() ) {
                return false;
            }

            const menu = target.closest( ".js-upload-menu" );
            const fileInput = menu.querySelector( ".js-upload-file" );
            const fileField = menu.querySelector( ".js-upload-field" );
            const postData = {
                id: this.data.game.id,
                type: target.dataset.type,
            };

            this.mode = Config.Editor.modes.SAVING;
            this.dom.root.classList.add( "is-saving-file" );

            this.readFile( fileInput ).then( ( response ) => {
                postData.fileName = response.fileName;
                postData.fileData = response.fileData;
                ipcRenderer.send( "renderer-newfile", postData );
                fileField.value = "";
                this.menus.removeMenus();
                this.done();
            });
        });
    }


    bindEvents () {
        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-settings" );

            if ( !target ) {
                return;
            }

            this._onSettingsClick( e.target );
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-close-settings" );

            if ( !target ) {
                return;
            }

            this.menus.removeMenus();
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-delete-map" );

            if ( !target || !this.canMapFunction() ) {
                return;
            }

            if ( confirm( `Sure you want to delete the map "${this.data.map.name}"? This may affect other data referencing this map.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root.classList.add( "is-deleting-map" );        
                this.canvas.reset();
                this.menus.removeMenus();
                this.actions.resetActions();
                ipcRenderer.send( "renderer-deletemap", this.data.map );
            }
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-delete-game" );

            if ( !target || !this.canGameFunction() ) {
                return;
            }

            if ( confirm( `Sure you want to delete the game "${this.data.game.name}"? This cannot be undone.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root.classList.add( "is-deleting-game" );

                ipcRenderer.send( "renderer-deletegame", this.data.game );
                this.data = {};
                this.updateUrl();
                window.location.reload();
            }

            if ( confirm( `Sure you want to delete the game "${this.data.game.name}"? This cannot be undone.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root.classList.add( "is-deleting-game" );

                ipcRenderer.send( "renderer-deletegame", this.data.game );
                this.data = {};
                this.updateUrl();
                window.location.reload();
            }
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-post-cancel" );

            if ( !target ) {
                return;
            }

            this.menus.removeMenus();
        });

        document.addEventListener( "click", ( e ) => {
            const target = e.target.closest( ".js-post-save" );

            if ( !target ) {
                return;
            }

            const elemData = target.dataset;
            const postData = elemData.type === "game"
                ? Utils.parseFields( document.querySelectorAll( ".js-addgame-field" ) )
                // "map" is the only post besides game...
                : Utils.parseFields( document.querySelectorAll( ".js-addmap-field" ) );

            if ( elemData.type === "game" ) {
                this.postGame( postData );

            // "map" is the only post besides game...
            } else {
                this.postMap( postData );
            }
        });

        this.dom.demoGame.addEventListener( "click", () => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const debug = this.dom.debug.checked;
            const baseUrl = `./games/${this.data.game.id}/index.html`;
            const params = new URLSearchParams();

            if ( this.canMapFunction() ) {
                params.set( "map", `${this.data.map.id}.json` );
            }

            if ( debug ) {
                params.set( "debug", "true" );
            }

            const query = params.toString();

            window.open(
                `${baseUrl}${query ? `?${query}` : ""}`,
                "_blank",
                `width=${this.data.game.width},height=${this.data.game.height}`
            );
        });
    }
}



module.exports = Editor;
