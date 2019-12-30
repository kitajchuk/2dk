const EditorActions = require( "./EditorActions" );
const EditorLayers = require( "./EditorLayers" );
const EditorCanvas = require( "./EditorCanvas" );
const EditorUtils = require( "./EditorUtils" );
const Config = require( "./Config" );
const Cache = require( "./Cache" );
const $ = require( "../node_modules/properjs-hobo/dist/hobo.build" );
const db = require( "./db" );



class Editor {
    constructor ( gameId ) {
        this.mode = null;
        this.gameId = gameId;
        this.layers = new EditorLayers( this );
        this.canvas = new EditorCanvas( this );
        this.actions = new EditorActions( this );
        this.dom = {
            gameName: $( "#editor-gamename" ),
            mapPanel: $( "#editor-map-panel" ),
            mapSettings: $( "#editor-mapsettings" ),
            postActions: $( ".js-post-action" ),
            uploadActions: $( ".js-upload-action" ),
            cancelPost: $( ".js-post-cancel" ),
            savePost: $( ".js-post-save" ),
            uploadFiles: $( ".js-upload-file" ),
            cancelUpload: $( ".js-upload-cancel" ),
            deleteUpload: $( ".js-upload-delete" ),
            saveUpload: $( ".js-upload-save" ),
            soundSamplers: $( ".js-sound-sampler" ),
            deleteMap: $( "#editor-delmap" ),
            deleteGame: $( "#editor-delgame" ),
            saveMap: $( "#editor-savemap" ),
        };
        this.selects = {
            maps: $( ".js-select-map" ),
            tiles: $( ".js-select-tiles" ),
            sounds: $( ".js-select-sound" ),
            mapLoad: $( "#editor-map-load-select" ),
        };
        this.menus = {
            all: $( ".js-menu" ),
            activeMap: $( "#editor-active-map-menu" ),
        };
        this.fields = {
            map: $( ".js-map-field" ),
            addMap: $( ".js-addmap-field" ),
        };

        this.loadGame();
    }


    setMode ( mode ) {
        this.mode = mode;
    }


    getMode () {
        return this.mode;
    }


    loadGame () {
        this.db = new db.DB();
        this.db.open( this.gameId ).then(() => {
            this.db.getGame().then(( data ) => {
                this.data = data;

                // load files
                this.loadAssets();

                // load maps
                this.loadMaps();

                // bind events
                this.bindEvents();

                // Show UI
                this.display();
            });
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
                this.buildSelectMenu( obj.elem, files );

                if ( assets.length ) {
                    _getAssets( assets.shift() );
                }
            });
        };

        _getAssets( assets.shift() );
    }


    display () {
        this.dom.gameName[ 0 ].innerHTML = this.data.game.name;
        document.body.className = "";
    }


    done () {
        this.mode = null;
        document.body.className = "";
    }


    canFunction () {
        return (
            this.data.map &&
            this.mode !== Config.Editor.modes.SAVING &&
            this.canvas.mode !== Config.EditorCanvas.modes.DRAG
        );
    }


    buildSelectMenu ( dom, data ) {
        for ( let i = dom.length; i--; ) {
            let hasValue = false;
            const setValue = dom[ i ].value;

            dom[ i ].innerHTML = `<option value="">${dom[ i ].dataset.label}</option>`;

            data.forEach(( dt ) => {
                const opt = document.createElement( "option" );
                const label = (typeof dt === "object") ? dt.name : String( dt );
                const value = (typeof dt === "object") ? dt.id : String( dt );

                opt.innerHTML = label;
                opt.value = value;

                dom[ i ].appendChild( opt );

                if ( setValue === value ) {
                    hasValue = true;
                }
            });

            dom[ i ].value = (hasValue ? setValue : "");
        }
    }


    parseFields ( fields ) {
        const data = {};

        for ( let i = fields.length; i--; ) {
            let value = null;

            // Checkboxes
            if ( fields[ i ].type === "checkbox" ) {
                value = fields[ i ].checked;

            // Radios
            } else if ( fields[ i ].type === "radio" ) {
                if ( fields[ i ].checked ) {
                    value = fields[ i ].value;
                }

            // Inputs / Selects
            } else {
                value = fields[ i ].value;
            }

            if ( value ) {
                data[ fields[ i ].name ] = value;
            }
        }

        return data;
    }


    prefillMapFields ( map ) {
        document.querySelector( ".js-map-field[name='name']" ).value = map.name;
        document.querySelector( ".js-map-field[name='resolution']" ).value = map.resolution;
        document.querySelector( ".js-map-field[name='tilesize']" ).value = map.tilesize;
        document.querySelector( ".js-map-field[name='gridsize']" ).value = map.gridsize;
        document.querySelector( ".js-map-field[name='tilewidth']" ).value = map.tilewidth;
        document.querySelector( ".js-map-field[name='tileheight']" ).value = map.tileheight;
        document.querySelector( ".js-map-field[name='image']" ).value = map.image.split( "/" ).pop();

        if ( map.sound ) {
            document.querySelector( ".js-map-field[name='sound']" ).value = map.sound.split( "/" ).pop();
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


    loadMaps () {
        this.db.getMaps().then(( maps ) => {
            this.data.maps = maps;

            this.buildSelectMenu( this.selects.maps, maps );
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

        // Position map settings menu
        this.menus.activeMap[ 0 ].style.left = `${this.dom.mapPanel[ 0 ].offsetLeft - 1}px`;
        this.menus.activeMap[ 0 ].style.width = `${this.dom.mapPanel[ 0 ].clientWidth + 2}px`;
    }


    postMap ( postData ) {
        postData.fileName = `${Cache.slugify( postData.name )}.json`;
        this.mode = Config.Editor.modes.SAVING;
        document.body.className = "is-saving";

        this.db.addMap( postData ).then(( map ) => {
            this.closeMenus();
            this.data.maps.push( map );
            this.buildSelectMenu( this.selects.maps, this.data.maps );
            this.done();
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


    bindEvents () {
        this.dom.mapSettings.on( "click", ( e ) => {
            if ( this.canFunction() ) {
                if ( this.menus.activeMap.is( ".is-active" ) ) {
                    this.menus.activeMap.removeClass( "is-active" );

                } else {
                    this.menus.activeMap.addClass( "is-active" );
                }
            }
        });


        this.dom.postActions.on( "click", ( e ) => {
            const targ = $( e.target );
            const elem = targ.is( ".js-post-action" ) ? targ : targ.closest( ".js-post-action" );
            const menu = $( `#${elem.data().target}` );

            if ( elem.is( ".is-active" ) ) {
                this.dom.postActions.removeClass( "is-active" );
                this.closeMenus();
                this.clearMenu( menu );

            } else {
                this.dom.postActions.removeClass( "is-active" );
                this.dom.uploadActions.removeClass( "is-active" );
                this.closeMenus();
                elem.addClass( "is-active" );
                menu.addClass( "is-active" );
            }
        });


        this.dom.uploadActions.on( "click", ( e ) => {
            const targ = $( e.target );
            const elem = targ.is( ".js-upload-action" ) ? targ : targ.closest( ".js-upload-action" );
            const menu = $( `#${elem.data().target}` );

            if ( elem.is( ".is-active" ) ) {
                this.dom.uploadActions.removeClass( "is-active" );
                this.closeMenus();

            } else {
                this.dom.postActions.removeClass( "is-active" );
                this.dom.uploadActions.removeClass( "is-active" );
                this.closeMenus();
                elem.addClass( "is-active" );
                menu.addClass( "is-active" );
            }
        });


        this.dom.cancelPost.on( "click", ( e ) => {
            const targ = $( e.target );
            const elem = targ.is( ".js-post-cancel" ) ? targ : targ.closest( ".js-post-cancel" );

            this.dom.postActions.removeClass( "is-active" );

            this.closeMenus();
            this.clearMenu( elem.closest( ".js-menu" ) );
        });


        this.dom.cancelUpload.on( "click", ( e ) => {
            const targ = $( e.target );
            const elem = targ.is( ".js-upload-cancel" ) ? targ : targ.closest( ".js-upload-cancel" );

            this.dom.uploadActions.removeClass( "is-active" );

            this.closeMenus();
            this.clearMenu( elem.closest( ".js-menu" ) );
        });


        this.dom.deleteUpload.on( "click", ( e ) => {
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
                document.body.className = "is-saving";

                this.db.deleteFile( postData ).then(() => {
                    this.loadAssets();
                    this.closeMenus();
                    this.done();
                });
            }
        });


        this.dom.saveUpload.on( "click", ( e ) => {
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
                document.body.className = "is-saving";
                postData.fileName = fileData.name;

                fileReader.onload = ( fe ) => {
                    postData.fileData = fe.target.result;

                    this.db.addFile( postData ).then(() => {
                        this.dom.postActions.removeClass( "is-active" );
                        this.dom.uploadActions.removeClass( "is-active" );
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
            // const data = elem.data();
            const postData = this.parseFields( this.fields.addMap );

            if ( postData.name ) {
                this.postMap( postData );

                this.dom.postActions.removeClass( "is-active" );
                this.dom.uploadActions.removeClass( "is-active" );

                this.clearMenu( elem.closest( ".js-menu" ) );
            }
        });


        this.dom.uploadFiles.on( "change", ( e ) => {
            const targ = $( e.target );
            const elem = targ.is( ".js-upload-file" ) ? targ : targ.closest( ".js-upload-file" );
            const data = elem.data();

            document.getElementById( data.target ).value = elem[ 0 ].value;
        });


        this.selects.mapLoad.on( "change", ( e ) => {
            if ( this.selects.mapLoad[ 0 ].value ) {
                this.loadMap( this.selects.mapLoad[ 0 ].value );
            }
        });


        this.selects.sounds.on( "change", ( e ) => {
            const targ = $( e.target );
            const sampler = targ.is( ".js-sound-sampler" ) ? targ : targ.closest( ".js-sound-sampler" );

            if ( sampler.is( ".is-playing" ) ) {
                EditorUtils.processSound( sampler, this.data.game.id );
            }
        });


        $( document ).on( "click", ".js-sound-button", ( e ) => {
            const targ = $( e.target );
            const button = targ.is( ".js-sound-button" ) ? targ : targ.closest( ".js-sound-button" );
            const sampler = targ.is( ".js-sound-sampler" ) ? targ : targ.closest( ".js-sound-sampler" );

            for ( let i = this.dom.soundSamplers.length; i--; ) {
                if ( this.dom.soundSamplers[ i ].dataset.spot !== sampler[ 0 ].dataset.spot && this.dom.soundSamplers.eq( i ).is( ".is-playing" ) ) {
                    EditorUtils.stopSoundSampler( this.dom.soundSamplers[ i ] );
                }
            }

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
            if ( this.canFunction() && this.data.map ) {
                if ( confirm( `Sure you want to delete the map "${active.map.name}"?` ) ) {
                    this.mode = Config.Editor.modes.SAVING;
                    document.body.className = "is-saving";

                    this.db.deleteMap( this.data.map ).then(() => {
                        window.location.reload();
                    });
                }
            }
        });


        this.dom.deleteGame.on( "click", ( e ) => {
            if ( confirm( `Sure you want to delete the game "${this.data.game.name}"?` ) ) {
                this.mode = Library.Editor.modes.SAVING;
                document.body.className = "is-saving";

                db.DB.deleteGame( this.data.game ).then(() => {
                    window.location.href = "index.html";
                });
            }
        });


        this.dom.saveMap.on( "click", ( e ) => {
            if ( this.canFunction() && this.data.map ) {
                this.mode = Config.Editor.modes.SAVING;
                document.body.className = "is-saving";
                this.cleanMap();

                // Save map JSON
                const postData = this.data.map;
                const mapData = this.parseFields( this.fields.map );

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
        });
    }
}



module.exports = Editor;
