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
            css: window.hobo( "#editor-css" ),
            root: window.hobo( "#editor" ),
            settings: window.hobo( ".js-settings" ),
            mapSettings: window.hobo( "#editor-mapsettings" ),
            gameSettings: window.hobo( "#editor-gamesettings" ),
            loadout: window.hobo( "#editor-loadout" ),
            loadoutGrid: window.hobo( "#editor-loadout-grid" ),
            mapLoad: window.hobo( "#editor-map-load" ),
            gameLoad: window.hobo( "#editor-game-load" ),
            demoGame: window.hobo( "#editor-demo-game" ),
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
            this.dom.root.removeClass( "is-not-loaded is-saving-map is-saving-game is-saving-file is-deleting-file" );

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
        this.menus.removeMenus();
        this.done();
    }


    postGame ( postData ) {
        this.mode = Config.Editor.modes.SAVING;
        this.dom.root.addClass( "is-saving-game" );

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

        // TODO: parse map settings fields when we make them editable...

        Object.keys( mapData ).forEach( ( i ) => {
            postData[ i ] = mapData[ i ];
        });

        ipcRenderer.send( "renderer-savemap", postData );
        this.menus.removeMenus();
        this.done();

        // Save snapshot images
        this._saveSnapshot();
    }


    _onSettingsClick ( e ) {
        const targ = window.hobo( e.target );
        const elem = targ.is( ".js-settings" ) ? targ : targ.closest( ".js-settings" );
        const elemData = elem.data();

        if ( elemData.type === "game" && this.canGameFunction() ) {
            this.menus.renderMenu( "editor-active-game-menu", this.data.game );
            
        } else if ( elemData.type === "map" && this.canMapFunction() ) {
            this.menus.renderMenu( "editor-active-map-menu", {
                map: this.data.map,
                assets: this.data.assets,
            });
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
            this._onSettingsClick({
                target: this.dom.gameSettings[ 0 ],
            });
        });

        ipcRenderer.on( "menu-newgame", () => {
            this.menus.renderMenu( "editor-addgame-menu" );
        });

        ipcRenderer.on( "menu-mapsettings", () => {
            this._onSettingsClick({
                target: this.dom.mapSettings[ 0 ],
            });
        });

        ipcRenderer.on( "menu-newmap", () => {
            this.menus.renderMenu( "editor-addmap-menu", {
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
        const $document = window.hobo( document );

        $document.on( "change", ".js-upload-file", ( e ) => {
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

        $document.on( "click", ".js-upload-cancel", ( e ) => {
            if ( !this.canGameFunction() ) {
                return false;
            }

            const targ = window.hobo( e.target );
            const elem = targ.is( ".js-upload-cancel" ) ? targ : targ.closest( ".js-upload-cancel" );

            this.menus.removeMenus();
        });

        $document.on( "click", ".js-upload-delete", ( e ) => {
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
                this.menus.removeMenus();
                this.done();
            }
        });

        $document.on( "click", ".js-upload-save", ( e ) => {
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
                this.menus.removeMenus();
                this.done();
            });
        });
    }


    bindEvents () {
        const $document = window.hobo( document );

        this.dom.settings.on( "click", this._onSettingsClick.bind( this ) );

        $document.on( "click", ".js-close-settings", () => {
            this.menus.removeMenus();
        });

        $document.on( "click", ".js-delete-map", () => {
            if ( !this.canMapFunction() ) {
                return false;
            }

            if ( confirm( `Sure you want to delete the map "${this.data.map.name}"? This may affect other data referencing this map.` ) ) {
                this.mode = Config.Editor.modes.SAVING;
                this.dom.root.addClass( "is-deleting-map" );
                this.menus.removeMenus();
                this.actions.resetActions();
                ipcRenderer.send( "renderer-deletemap", this.data.map );
            }
        });

        $document.on( "click", ".js-delete-game", () => {
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

        $document.on( "click", ".js-post-cancel", ( e ) => {
            // const targ = window.hobo( e.target );
            // const elem = targ.is( ".js-post-cancel" ) ? targ : targ.closest( ".js-post-cancel" );
            // const elemData = elem.data();
            // const canFunction = ( elemData.type === "game" ) || this.canGameFunction();

            // if ( !canFunction ) {
            //     return false;
            // }

            this.menus.removeMenus();
        });

        $document.on( "click", ".js-post-save", ( e ) => {
            const targ = window.hobo( e.target );
            const elem = targ.is( ".js-post-save" ) ? targ : targ.closest( ".js-post-save" );
            const elemData = elem.data();
            const canFunction = ( elemData.type === "game" ) || this.canGameFunction();

            if ( !canFunction ) {
                return false;
            }

            const postData = elemData.type === "game"
                ? Utils.parseFields( window.hobo( ".js-addgame-field" ) )
                // "map" is the only post besides game...
                : Utils.parseFields( window.hobo( ".js-addmap-field" ) );

            if ( postData.name ) {
                if ( elemData.type === "game" ) {
                    this.postGame( postData );

                // "map" is the only post besides game...
                } else {
                    this.postMap( postData );
                }
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
    }
}



module.exports = Editor;
