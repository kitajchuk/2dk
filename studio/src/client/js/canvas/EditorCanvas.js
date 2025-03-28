const { ipcRenderer } = require( "electron" );

const {
    clearTile,
    sortCoords,
} = require( "../Utils" );
const {
    renderNPC,
    renderTile,
    renderSpawn,
    renderEvent,
    renderObject,
} = require( "../render/Render" );
const Utils = require( "../Utils" );
const Config = require( "../Config" );
const EditorCursor = require( "./EditorCursor" );
const EditorDraggable = require( "./EditorDraggable" );


class EditorCanvas {
    constructor ( editor ) {
        this.loader = new window.lib2dk.Loader();
        this.editor = editor;
        this.mode = null;
        this.map = null;
        this.game = null;
        this.spawn = null;
        this.assets = {};
        this.canvasMouseCoords = null;
        this.tilesetCoords = [];
        this.currentNPC = null;
        this.currentObject = null;
        this.isEscape = false;
        this.isMouseDownTiles = false;
        this.isMouseMovedTiles = false;
        this.isMouseDownCanvas = false;
        this.isMouseDownCollider = false;
        this.currentTileCoord = null;
        this.contextCoords = null;
        this.dom = {
            moveCoords: document.getElementById( "editor-move-coords" ),
            tileset: document.getElementById( "editor-tileset-image" ),
            tilebox: document.getElementById( "editor-tileset-box" ),
        };
        this.pickers = {
            $all: window.hobo( ".js-picker" ),
            objPickerBox: document.getElementById( "editor-obj-picker-box" ),
            npcPickerBox: document.getElementById( "editor-npc-picker-box" ),
        };
        this.layers = {
            background: document.getElementById( "editor-bg" ),
            foreground: document.getElementById( "editor-fg" ),
            collision: document.getElementById( "editor-c" ),
            mapgrid: document.getElementById( "editor-mapgrid" ),
            npc: document.getElementById( "editor-npc" ),
            obj: document.getElementById( "editor-obj" ),
            spawn: document.getElementById( "editor-spawn" ),
            event: document.getElementById( "editor-event" ),
            tiles: document.getElementById( "editor-tiles" ),
        };
        this.contexts = {
            background: null,
            foreground: null,
            collision: null,
            npc: null,
            obj: null,
        };
        this.canvases = {
            tilepaint: document.getElementById( "editor-tilepaint-canvas" ),
            preview: document.getElementById( "editor-preview-canvas" ),
        };
        this.cssgrids = {
            mapgrid: document.getElementById( "editor-mapgrid-canvas" ),
            collider: document.getElementById( "editor-collider-canvas" ),
            tilegrid: document.getElementById( "editor-tilegrid-canvas" ),
        };

        this.cursor = new EditorCursor( this );
        this.draggable = new EditorDraggable( this );

        this.bindMenuEvents();
        this.bindMapgridEvents();
        this.bindColliderEvents();
        this.bindDocumentEvents();
        this.bindTilepaintEvents();
        this.bindActiveTilesMenuPost();
    }


    hide ( l ) {
        this.layers[ l ].classList.add( "is-hidden" );
    }


    show ( l ) {
        this.layers[ l ].classList.remove( "is-hidden" );
    }


    toggleGrid () {
        if ( this.layers.mapgrid.classList.contains( "is-hidden" ) ) {
            this.show( "mapgrid" );

        } else {
            this.hide( "mapgrid" );
        }
    }


    reset () {
        if ( this.map ) {
            for ( const canvas in this.canvases ) {
                this.clearCanvas( this.canvases[ canvas ] );
            }

            for ( const layer in this.contexts ) {
                this.contexts[ layer ].destroy();
                this.contexts[ layer ] = null;
                this.layers[ layer ].innerHTML = "";
            }

            for ( const grid in this.cssgrids ) {
                this.cssgrids[ grid ].style.removeProperty( "--grid-size" );
            }

            ["spawn", "event"].forEach(( layer ) => {
                this.layers[ layer ].innerHTML = "";
            });

            this.clearTileset();
            this.resetPreview();

            this.isSpacebar = false;
            this.isMouseDownTiles = false;
            this.isMouseMovedTiles = false;
            this.isMouseDownCanvas = false;
            this.currentTileCoord = null;
            this.canvasMouseCoords = null;
            this.currentNPC = null;
            this.currentObject = null;
            this.tilesetCoords = [];
            this.map = null;
            this.game = null;
            this.assets = {};
            this.spawn = null;
            this.mode = null;
            this.dom.tileset.src = "";

            this.cursor.reset();
            this.draggable.reset();
        }
    }


    loadMap ( map, game ) {
        this.map = map;
        this.game = game;

        const hero = this.game.heroes[ this.game.hero.sprite ];
        this.spawn = hero ? {
            width: hero.width,
            height: hero.height
        } : {
            width: map.tilesize,
            height: map.tilesize
        };

        // Gridsize for tilepaint
        this.gridsize = Math.min( 32, this.map.tilesize );
        this.tilescale = this.map.tilesize / this.gridsize;

        // Create new map layers
        for ( const layer in this.contexts ) {
            this.contexts[ layer ] = new window.lib2dk.MapLayer({
                id: layer,
                map: this.map,
                cash: false,
                width: this.map.width,
                height: this.map.height,
            });

            this.layers[ layer ].appendChild( this.contexts[ layer ].canvas );
        }

        ["spawn", "event"].forEach(( layer ) => {
            this.layers[ layer ].style.width = `${this.map.width}px`;
            this.layers[ layer ].style.height = `${this.map.height}px`;
        });

        ["mapgrid", "collider"].forEach(( layer ) => {
            this.cssgrids[ layer ].style.width = `${this.map.width}px`;
            this.cssgrids[ layer ].style.height = `${this.map.height}px`;
        });

        this.canvases.preview.width = this.map.tilesize;
        this.canvases.preview.height = this.map.tilesize;
        this.canvases.preview.style.width = `${this.gridsize}px`;
        this.canvases.preview.style.height = `${this.gridsize}px`;
        
        this.cursor.update( map );
        this.draggable.update( map );

        this.loadMapAssets().then(() => {
            this.srcTileset();
            this.drawGrids();
            this.drawTextures();
            this.drawColliders();
            this.drawNPCs();
            this.drawObjects();
            this.drawSpawns();
            this.drawEvents();
            this.drawActiveTiles();
            this.renderNPCLoadout();
            this.renderObjectLoadout();
        });
    }



    loadMapAssets () {
        const promises = [];

        for ( const type in this.editor.data.assets ) {
            if ( type === "sounds" ) {
                continue;
            }

            this.editor.data.assets[ type ].files.forEach( ( asset ) => {
                promises.push(
                    new Promise( ( resolve ) => {
                        const key = `assets/${type}/${asset}`;

                        this.loader.loadImage( `./games/${this.game.id}/${key}` ).then( ( img ) => {
                            this.assets[ key ] = img;
                            resolve({ img, type, asset });
                        });
                    })
                );
            });
        }

        return Promise.all( promises );
    }


    clearCanvas ( canvas ) {
        canvas.getContext( "2d" ).clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }


    refreshTile ( layer, coords, tile ) {
        if ( tile.paintTile ) {
            this.contexts[ layer ].context.clearRect(
                ( coords[ 0 ] + tile.drawCoord[ 0 ] ) * this.map.tilesize,
                ( coords[ 1 ] + tile.drawCoord[ 1 ] ) * this.map.tilesize,
                this.map.tilesize,
                this.map.tilesize
            );

            window.lib2dk.Utils.drawMapTile(
                this.contexts[ layer ].context,
                this.dom.tileset,
                tile.renderTree,
                this.map.tilesize,
                this.map.tilesize,
                coords[ 0 ] + tile.drawCoord[ 0 ],
                coords[ 1 ] + tile.drawCoord[ 1 ]
            );
        }
    }


    refreshTiles ( layer, coords, coordMap ) {
        coordMap.tiles.forEach( ( tile ) => {
            if ( tile.paintTile ) {
                this.refreshTile( layer, coords, tile );
            }
        });
    }

    srcTileset () {
        const img = this.assets[ this.map.image ];
        const width = img.naturalWidth / this.tilescale;
        const height = img.naturalHeight / this.tilescale;

        this.dom.tileset.src = img.src;
        this.dom.tileset.style.width = `${width}px`;

        this.canvases.tilepaint.width = width;
        this.canvases.tilepaint.height = height;
        this.canvases.tilepaint.style.width = `${width}px`;
        this.canvases.tilepaint.style.height = `${height}px`;

        this.cssgrids.tilegrid.style.width = `${width}px`;
        this.cssgrids.tilegrid.style.height = `${height}px`;
    }


    drawGrids () {
        this.cssgrids.mapgrid.style.setProperty( "--grid-size", `${this.map.tilesize}px` );
        this.cssgrids.collider.style.setProperty( "--grid-size", `${this.map.collider}px` );
        this.cssgrids.tilegrid.style.setProperty( "--grid-size", `${this.gridsize}px` );
    }


    drawTextures () {
        window.lib2dk.Utils.drawMapTiles(
            this.contexts.background.context,
            this.dom.tileset,
            this.map.textures.background,
            this.map.tilesize,
            this.map.tilesize
        );

        window.lib2dk.Utils.drawMapTiles(
            this.contexts.foreground.context,
            this.dom.tileset,
            this.map.textures.foreground,
            this.map.tilesize,
            this.map.tilesize
        );
    }


    drawNPCs () {
        this.map.npcs.forEach( ( npc ) => {
            const baseNpc = this.game.npcs.find( ( gnpc ) => {
                return npc.id === gnpc.id;
            });

            if ( baseNpc ) {
                const baseState = baseNpc.states[ 0 ];
                const offsetX = baseNpc.verbs[ baseState.verb ][ baseState.dir ].offsetX;
                const offsetY = baseNpc.verbs[ baseState.verb ][ baseState.dir ].offsetY;

                this.contexts.npc.context.drawImage(
                    this.assets[ baseNpc.image ],
                    Math.abs( offsetX ),
                    Math.abs( offsetY ),
                    baseNpc.width,
                    baseNpc.height,
                    npc.spawn.x,
                    npc.spawn.y,
                    baseNpc.width,
                    baseNpc.height
                );
            }
        });
    }


    drawObjects () {
        this.map.objects.forEach( ( obj ) => {
            const baseObj = this.game.objects.find( ( gobj ) => {
                return obj.id === gobj.id;
            });

            if ( baseObj ) {
                this.contexts.obj.context.drawImage(
                    this.assets[ baseObj.image ],
                    baseObj.offsetX,
                    baseObj.offsetY,
                    baseObj.width,
                    baseObj.height,
                    obj.spawn.x,
                    obj.spawn.y,
                    baseObj.width,
                    baseObj.height
                );
            }
        });
    }


    drawSpawns () {
        this.layers.spawn.innerHTML = this.map.spawn.map( ( spawn ) => {
            return renderSpawn( spawn, this.spawn );
        }).join( "" );
    }


    drawEvents () {
        this.layers.event.innerHTML = this.map.events.map( ( event ) => {
            return renderEvent( event, this.map );
        }).join( "" );
    }


    drawActiveTiles () {
        this.layers.tiles.innerHTML = this.map.tiles.map( ( tile ) => {
            return "";
        }).join( "" );
    }


    drawColliders () {
        this.map.collision.forEach( ( collider ) => {
            renderTile(
                this.contexts.collision.context,
                collider[ 0 ] * this.map.collider,
                collider[ 1 ] * this.map.collider,
                this.map.collider,
                this.map.collider,
                window.lib2dk.Config.colors.red,
                0.5
            );
        });
    }


    removeCollider ( coord ) {
        const collider = this.map.collision.find( ( collider ) => {
            return ( collider[ 0 ] === coord[ 0 ] && collider[ 1 ] === coord[ 1 ] );
        });

        if ( collider ) {
            this.map.collision.splice( this.map.collision.indexOf( collider ), 1 );

            clearTile(
                this.contexts.collision.context,
                coord[ 0 ] * this.map.collider,
                coord[ 1 ] * this.map.collider,
                this.map.collider,
                this.map.collider
            );
        }
    }


    applyCollider ( coord ) {
        const collider = this.map.collision.find( ( collider ) => {
            return ( collider[ 0 ] === coord[ 0 ] && collider[ 1 ] === coord[ 1 ] );
        });

        if ( !collider ) {
            this.map.collision.push( coord );

            renderTile(
                this.contexts.collision.context,
                coord[ 0 ] * this.map.collider,
                coord[ 1 ] * this.map.collider,
                this.map.collider,
                this.map.collider,
                window.lib2dk.Config.colors.red,
                0.5
            );
        }
    }


    setTileboxBounds () {
        const boxBounds = this.dom.tilebox.getBoundingClientRect();

        this.dom.tilebox.style.height = `${window.innerHeight - boxBounds.y - 16}px`;
    }


    renderNPCLoadout () {
        this.pickers.npcPickerBox.innerHTML = this.game.npcs.map( ( npc ) => {
            return renderNPC( npc, this.game );
        }).join( "" );
    }


    renderObjectLoadout () {
        this.pickers.objPickerBox.innerHTML = this.game.objects.map( ( obj ) => {
            return renderObject( obj, this.game );
        }).join( "" );
    }


    applyTile ( coord ) {
        renderTile(
            this.canvases.tilepaint.getContext( "2d" ),
            coord[ 0 ] * this.gridsize,
            coord[ 1 ] * this.gridsize,
            this.gridsize,
            this.gridsize
        );
    }

    setActiveTool ( tool ) {
        this.draggable.resetTool();

        if ( tool ) {
            this.draggable.setTool( tool );
        }

        if ( this.editor.actions.specialTools.includes( tool ) ) {
            this.clearTileset();
            this.cursor.reset();
            this.editor.layers.resetLayers();
        }
    }


    togglePickers ( layer ) {
        // background, foreground, collision all use the "tile" picker
        const picker = ( layer === Config.EditorLayers.modes.OBJ || layer === Config.EditorLayers.modes.NPC ) ? layer : "tile";
        const $picker = this.pickers.$all.filter( `#editor-${picker}-picker` );

        this.pickers.$all.addClass( "is-hidden" );
        $picker.removeClass( "is-hidden" );
    }


    setActiveLayer ( layer ) {
        this.draggable.resetLayer()

        if ( layer ) {
            this.draggable.setLayer( layer );
            this.togglePickers( layer );

            if ( layer === Config.EditorLayers.modes.OBJ || layer === Config.EditorLayers.modes.NPC ) {
                this.clearTileset();

            // Clear NPC & Object previews (if they exist)
            } else if ( !this.tilesetCoords.length ) {
                this.clearTileset();
            }

            if ( this.editor.actions.specialTools.includes( this.editor.actions.mode ) ) {
                this.editor.actions.resetActions();
            }
        }
    }


    brush ( layer, coords ) {
        const coordMap = this.getCoordMap();

        this.updateMapLayer( layer, coords, coordMap );
        this.refreshTiles( layer, coords, coordMap );
    }


    trash ( layer, coords ) {
        this.tilesetCoords = [];
        this.map.textures[ layer ][ coords[ 1 ] ][ coords[ 0 ] ] = 0;

        clearTile(
            this.contexts[ layer ].context,
            coords[ 0 ] * this.map.tilesize,
            coords[ 1 ] * this.map.tilesize,
            this.map.tilesize,
            this.map.tilesize
        );
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
        coordMap.tiles.forEach( ( tile ) => {
            if ( tile.paintTile ) {
                const cx = coords[ 0 ] + tile.drawCoord[ 0 ];
                const cy = coords[ 1 ] + tile.drawCoord[ 1 ];
                const px = this.map.tilesize * tile.tileCoord[ 0 ];
                const py = this.map.tilesize * tile.tileCoord[ 1 ];

                // Position has no tile: 0
                if ( this.map.textures[ layer ][ cy ][ cx ] === 0 ) {
                    this.map.textures[ layer ][ cy ][ cx ] = [
                        [
                            px,
                            py,
                        ],
                    ];

                // Position has tiles: Array[Array[x, y], Array[x, y]]
                } else if ( Array.isArray( this.map.textures[ layer ][ cy ][ cx ] ) ) {
                    this.map.textures[ layer ][ cy ][ cx ].push( [
                        px,
                        py,
                    ] );
                }

                // Clean tiles on draw so we don't have to scan the entire texture
                this.map.textures[ layer ][ cy ][ cx ] = this.cleanTiles( this.map.textures[ layer ][ cy ][ cx ] );
                tile.renderTree = this.map.textures[ layer ][ cy ][ cx ];
            }
        });
    }


    clearTile ( coord ) {
        clearTile(
            this.canvases.tilepaint.getContext( "2d" ),
            coord[ 0 ] * this.gridsize,
            coord[ 1 ] * this.gridsize,
            this.gridsize,
            this.gridsize
        );
    }


    clearTileset () {
        this.tilesetCoords.forEach( ( coord ) => {
            clearTile(
                this.canvases.tilepaint.getContext( "2d" ),
                coord[ 0 ] * this.gridsize,
                coord[ 1 ] * this.gridsize,
                this.gridsize,
                this.gridsize
            );
        });

        this.tilesetCoords = [];

        this.resetPreview();
        this.cursor.reset();
        this.resetCurrentNPCAndObject();
    }


    pushCoords ( coords ) {
        this.tilesetCoords.push( coords );
        this.tilesetCoords = this.tilesetCoords.sort( sortCoords );
    }


    getCoordMap () {
        const sortedX = this.tilesetCoords.sort( ( cA, cB ) => {
            if ( cA[ 0 ] < cB[ 0 ] ) {
                return -1;

            } else {
                return 1;
            }
        });
        const smallX = sortedX[ 0 ][ 0 ];
        const largeX = sortedX[ sortedX.length - 1 ][ 0 ];
        const sortedY = this.tilesetCoords.sort( ( cA, cB ) => {
            if ( cA[ 1 ] < cB[ 1 ] ) {
                return -1;

            } else {
                return 1;
            }
        });
        const smallY = sortedY[ 0 ][ 1 ];
        const largeY = sortedY[ sortedY.length - 1 ][ 1 ];
        const coordMap = {
            width: ( largeX - smallX ) + 1,
            height: ( largeY - smallY ) + 1,
            tiles: [],
        };

        for ( let y = smallY; y <= largeY; y++ ) {
            for ( let x = smallX; x <= largeX; x++ ) {
                const foundCoord = this.tilesetCoords.find( ( coord ) => {
                    return ( coord[ 0 ] === x && coord[ 1 ] === y );
                });

                coordMap.tiles.push({
                    tileCoord: [x, y],
                    drawCoord: [x - smallX, y - smallY],
                    paintTile: foundCoord ? true : false,
                });
            }
        }

        return coordMap;
    }


    resetPreview () {
        const ctx = this.canvases.preview.getContext( "2d" );

        this.clearCanvas( this.canvases.preview );

        this.canvases.preview.width = this.map.tilesize;
        this.canvases.preview.height = this.map.tilesize;
        this.canvases.preview.style.width = `${this.gridsize}px`;
        this.canvases.preview.style.height = `${this.gridsize}px`;
    }


    resetCurrentNPCAndObject () {
        this.currentNPC = null;
        this.currentObject = null;
    }


    applyPreview () {
        const ctx = this.canvases.preview.getContext( "2d" );
        const coordMap = this.getCoordMap();
        const width = coordMap.width * this.gridsize;
        const height = coordMap.height * this.gridsize;

        this.clearCanvas( this.canvases.preview );

        this.canvases.preview.width = width * this.tilescale;
        this.canvases.preview.height = height * this.tilescale;
        this.canvases.preview.style.width = `${width}px`;
        this.canvases.preview.style.height = `${height}px`;

        coordMap.tiles.forEach( ( tile ) => {
            if ( tile.paintTile ) {
                ctx.drawImage(
                    this.dom.tileset,
                    ( tile.tileCoord[ 0 ] * this.map.tilesize ),
                    ( tile.tileCoord[ 1 ] * this.map.tilesize ),
                    this.map.tilesize,
                    this.map.tilesize,
                    ( tile.drawCoord[ 0 ] * this.map.tilesize ),
                    ( tile.drawCoord[ 1 ] * this.map.tilesize ),
                    this.map.tilesize,
                    this.map.tilesize
                );
            }
        });
    }


    applyPreviewNPC () {
        this._applyPreviewObjectOrNPC( this.currentNPC );
    }


    applyPreviewObject () {
        this._applyPreviewObjectOrNPC( this.currentObject );
    }


    _applyPreviewObjectOrNPC ( objOrNPC ) {
        const isNPC = this.editor.layers.mode === Config.EditorLayers.modes.NPC;
        const ctx = this.canvases.preview.getContext( "2d" );
        const scale = this.map.tilesize / this.gridsize;
        const width = objOrNPC.width;
        const height = objOrNPC.height;

        let offsetX = objOrNPC.offsetX;
        let offsetY = objOrNPC.offsetY;

        if ( isNPC ) {
            const state = objOrNPC.states[ 0 ];
            offsetX = Math.abs( objOrNPC.verbs[ state.verb ][ state.dir ].offsetX );
            offsetY = Math.abs( objOrNPC.verbs[ state.verb ][ state.dir ].offsetY );
        }

        this.clearCanvas( this.canvases.preview );
        this.canvases.preview.width = width;
        this.canvases.preview.height = height;
        this.canvases.preview.style.width = `${width / scale}px`;
        this.canvases.preview.style.height = `${height / scale}px`;
        
        ctx.drawImage(
            this.assets[ objOrNPC.image ],
            offsetX,
            offsetY,
            width,
            height,
            0,
            0,
            width,
            height
        );
    }


    applyLayer ( layer, coords ) {
        if ( this.editor.actions.mode === Config.EditorActions.modes.BRUSH ) {
            this.brush( layer, coords );

        } else if ( this.editor.actions.mode === Config.EditorActions.modes.ERASE ) {
            this.trash( layer, coords );
        }
    }


    applyObject ( coords ) {
        this._applyObjectOrNPC( coords, this.currentObject );
    }


    applyNPC ( coords ) {
        this._applyObjectOrNPC( coords, this.currentNPC );
    }


    getHitSpawn () {
        const cursorPoint = this.getCursorPoint();
        return this.map.spawn.find( ( spawn ) => {
            const spawnSprite = {
                x: spawn.x,
                y: spawn.y,
                width: this.spawn.width,
                height: this.spawn.height,
            };

            return window.lib2dk.Utils.collide( cursorPoint, spawnSprite );
        });
    }


    getNewSpawn () {
        return {
            x: this.canvasMouseCoords.x,
            y: this.canvasMouseCoords.y,
            width: this.spawn.width ,
            height: this.spawn.height,
        };
    }



    applySpawn ( coords ) { 
        const hitSpawn = this.getHitSpawn();
        const newSpawn = this.getNewSpawn();

        if ( hitSpawn ) {
            this.map.spawn = this.map.spawn.reduce( ( acc, spawn ) => {
                if ( spawn.x === hitSpawn.x && spawn.y === hitSpawn.y ) {
                    return acc;
                }

                acc.push( spawn );

                return acc;
            }, []);

        } else {
            this.map.spawn.push( newSpawn );
        }

        this.drawSpawns();
    }


    applyEvent ( coords ) {
        this.editor.menus.renderMenu( "editor-mapevent-menu", {
            maps: Utils.getOptionData( this.editor.data.maps ).filter( ( map ) => {
                return map.id !== this.map.id;
            }),
            facing: Utils.getOptionData( window.lib2dk.Config.facing ),
            events: Utils.getOptionData( window.lib2dk.Config.events ),
            coords,
        });
    }


    applyActiveTiles ( coords ) {
        this.editor.menus.renderMenu( "editor-activetiles-menu", {
            map: this.map,
            game: this.game,
            coords,
            facing: Utils.getOptionData( window.lib2dk.Config.facing ),
            actions: Utils.getOptionData( window.lib2dk.Config.verbs ),
            layers: [
                Config.EditorLayers.modes.BACKGROUND,
                Config.EditorLayers.modes.FOREGROUND,
            ],
        });
    }


    _applyObjectOrNPC ( coords, objectOrNPC ) {
        const isNPC = this.editor.layers.mode === Config.EditorLayers.modes.NPC;

        // Must reference map data by key to mutate it
        let _mapDataKey = isNPC ? "npcs" : "objects";
        let _gameData = isNPC ? this.game.npcs : this.game.objects;
        let _context = isNPC ? this.contexts.npc : this.contexts.obj;
        let _redraw = isNPC ? this.drawNPCs.bind( this ) : this.drawObjects.bind( this );

        if ( objectOrNPC && this.editor.actions.mode == Config.EditorActions.modes.BRUSH ) {
            const offsetCoords = this.cursor.getCursorOffsetCoords( coords, objectOrNPC );

            const newObjectOrNPC = {
                id: objectOrNPC.id,
                spawn: {
                    x: offsetCoords[ 0 ] * this.map.tilesize,
                    y: offsetCoords[ 1 ] * this.map.tilesize,
                },
            };

            const existingObjectOrNPC = this.map.objects.find( ( obj ) => {
                return ( 
                    obj.id === newObjectOrNPC.id && 
                    obj.spawn.x === newObjectOrNPC.spawn.x && 
                    obj.spawn.y === newObjectOrNPC.spawn.y
                );
            });

            if ( existingObjectOrNPC ) {
                return;
            }

            this.map[ _mapDataKey ].push( newObjectOrNPC );

            let offsetX = objectOrNPC.offsetX;
            let offsetY = objectOrNPC.offsetY;

            if ( isNPC ) {
                const state = objectOrNPC.states[ 0 ];
                offsetX = Math.abs( objectOrNPC.verbs[ state.verb ][ state.dir ].offsetX );
                offsetY = Math.abs( objectOrNPC.verbs[ state.verb ][ state.dir ].offsetY );
            }

            _context.context.drawImage(
                this.assets[ objectOrNPC.image ],
                offsetX,
                offsetY,
                objectOrNPC.width,
                objectOrNPC.height,
                newObjectOrNPC.spawn.x,
                newObjectOrNPC.spawn.y,
                objectOrNPC.width,
                objectOrNPC.height
            );
        } else if ( !objectOrNPC && this.editor.actions.mode === Config.EditorActions.modes.ERASE ) {
            const cursorPoint = this.getCursorPoint();
            const topmostObjectOrNPCs = this.map[ _mapDataKey ].filter( ( obj ) => {
                const baseObjectOrNPC = _gameData.find( ( gobj ) => {
                    return obj.id === gobj.id;
                });
                
                const objectOrNPCSprite = {
                    x: obj.spawn.x,
                    y: obj.spawn.y,
                    width: baseObjectOrNPC.width,
                    height: baseObjectOrNPC.height,
                };

                return window.lib2dk.Utils.collide( objectOrNPCSprite, cursorPoint );
            });
            const topmostObjectOrNPC = topmostObjectOrNPCs.pop();

            if ( topmostObjectOrNPC ) {
                this.map[ _mapDataKey ] = this.map[ _mapDataKey ].reduce( ( acc, obj ) => {
                    if ( obj.spawn.x === topmostObjectOrNPC.spawn.x && obj.spawn.y === topmostObjectOrNPC.spawn.y ) {
                        return acc;
                    }

                    acc.push( obj );

                    return acc;
                }, []);

                _context.clear();
                _redraw();
            }
        }
    }


    setMoveCoords ( coords ) {
        if ( this.canApplySpawn() && this.canvasMouseCoords ) {
            this.dom.moveCoords.innerHTML = `( ${this.canvasMouseCoords.x}, ${this.canvasMouseCoords.y} )`;

        } else {
            this.dom.moveCoords.innerHTML = `( ${coords[ 0 ]}, ${coords[ 1 ]} )`;
        }
    }


    clearMoveCoords () {
        this.dom.moveCoords.innerHTML = "( X, Y )";
    }


    getCursorPoint () {
        return {
            x: this.canvasMouseCoords.x,
            y: this.canvasMouseCoords.y,
            width: 1,
            height: 1,
        };
    }

    getMouseCoords ( e, grid ) {
        return [
            Math.floor( e.offsetX / grid ),
            Math.floor( e.offsetY / grid ),
        ];
    }


    getFoundCoords ( source, ref ) {
        return source.find( ( coord ) => {
            return ( coord[ 0 ] === ref[ 0 ] && coord[ 1 ] === ref[ 1 ] );
        });
    }


    bindActiveTilesMenuPost () {
        window.hobo( document ).on( "click", ".js-activetiles-post", ( e ) => {
            const data = Utils.parseFields( window.hobo( ".js-activetile-field" ) );
            const newData = {
                layer: data.layer,
                group: data.group,
            };
            const isJump = data.action === window.lib2dk.Config.verbs.JUMP;

            // Coord X & Y are a position on the tileset
            // Could try using the currentTileCoord for now..
            const tile = JSON.parse( data.tile );
            newData.offsetX = tile[ 0 ];
            newData.offsetY = tile[ 1 ];

            if ( data.stepsX ) {
                newData.stepsX = data.stepsX;
            }

            if ( data.dur ) {
                newData.dur = data.dur;
            }

            if ( data.action ) {
                newData.actions = [];

                const firstAction = {
                    verb: data.action,
                };

                if ( data.elevation && isJump ) {
                    newData.elevation = data.elevation;
                    
                    if ( data.direction ) {
                        firstAction.dir = data.direction;
                    }
                }

                newData.actions.push( firstAction );

                if ( data.attack && !isJump ) {
                    newData.actions.push({
                        verb: window.lib2dk.Config.verbs.ATTACK,
                    });
                }
            }

            console.log( newData );

            // Check for this Active Tiles group
            // const tiles = this.map.tiles.find( ( obj ) => {
            //     return ( obj.group === data.group );
            // });

            // if ( !tiles ) {
            //     // TODO: Implement this for REALs...
            //     // this.map.tiles.push( data );
            //     // this.editor._saveMap();
            //     this.editor.menus.removeMenus();

            // } else {
            //     alert( `The tile group ${data.group} already exists!` );
            // }
        });
    }


    bindDocumentEvents () {
        const $document = window.hobo( document );

        $document.on( "keydown", ( e ) => {
            const activeMenu = window.hobo( ".js-menu.is-active" );

            if ( activeMenu.length ) {
                return;
            }

            this.isEscape = ( e.keyCode === Config.keys.ESCAPE );

            if ( this.isEscape ) {
                this.clearTileset();
            }

            if ( this.draggable.isSpacebar ) {
                this.editor.menus.blurSelectMenus();
            }
        });

        $document.on( "keyup", ( e ) => {
            this.isEscape = false;
        });

        $document.on( "mouseup", () => {
            this.isMouseDownCanvas = false;
            this.isMouseDownCollider = false;
        });

        $document.on( "click", ".js-npc-tile", ( e ) => {
            const id = e.target.dataset.npc;

            const npc = this.game.npcs.find( ( npc ) => {
                return npc.id === id;
            });

            this.currentNPC = npc;

            this.resetPreview();
            this.applyPreviewNPC();
            this.cursor.applyCursorNPC();
        }); 

        $document.on( "click", ".js-obj-tile", ( e ) => {
            const id = e.target.dataset.obj;

            const obj = this.game.objects.find( ( obj ) => {
                return obj.id === id;
            });

            this.currentObject = obj;

            this.resetPreview();
            this.applyPreviewObject();
            this.cursor.applyCursorObject();
        });
    }


    bindColliderEvents () {
        const $collider = window.hobo( this.cssgrids.collider );

        $collider.on( "mousedown", () => {
            if ( this.editor.canMapFunction() ) {
                this.isMouseDownCollider = true;
            }
        });

        $collider.on( "mousemove", ( e ) => {
            if ( !this.map ) {
                return;
            }

            const coords = this.getMouseCoords( e, this.map.collider );

            this.setMoveCoords( coords );

            if ( this.editor.canMapFunction() && this.isMouseDownCollider ) {
                if ( this.canApplyCollider() ) {
                    if ( this.editor.actions.mode === Config.EditorActions.modes.BRUSH ) {
                        this.applyCollider( coords );

                    } else if ( this.editor.actions.mode === Config.EditorActions.modes.ERASE ) {
                        this.removeCollider( coords );
                    }
                }
            }
        });

        $collider.on( "mouseup", () => {
            this.isMouseDownCollider = false;
        });

        $collider.on( "mouseout", () => {
            this.clearMoveCoords();
        });
    }


    bindTilepaintEvents () {
        const $tilepaint = window.hobo( this.canvases.tilepaint );

        $tilepaint.on( "mousedown", ( e ) => {
            if ( this.canBeginApplyTiles() ) {
                this.isMouseDownTiles = true;
                this.isMouseMovedTiles = false;

                const coords = this.getMouseCoords( e, this.gridsize );
                const foundCoord = this.getFoundCoords( this.tilesetCoords, coords );

                if ( !foundCoord ) {
                    this.applyTile( coords );
                    this.pushCoords( coords );

                } else {
                    clearTile(
                        this.canvases.tilepaint.getContext( "2d" ),
                        foundCoord[ 0 ] * this.gridsize,
                        foundCoord[ 1 ] * this.gridsize,
                        this.gridsize,
                        this.gridsize
                    );
                    this.tilesetCoords.splice( this.tilesetCoords.indexOf( foundCoord ), 1 );
                }

                if ( this.tilesetCoords.length ) {
                    this.applyPreview();
                    this.cursor.applyCursor();

                } else {
                    this.resetPreview();
                    this.cursor.reset();
                }

                this.currentTileCoord = coords;
            }
        });

        $tilepaint.on( "mousemove", ( e ) => {
            if ( !this.map ) {
                return;
            }

            const coords = this.getMouseCoords( e, this.gridsize );

            this.setMoveCoords( coords );

            if ( this.editor.canMapFunction() ) {
                if ( this.canApplyTiles() ) {
                    const foundCoord = this.getFoundCoords( this.tilesetCoords, coords );
                    const sameCoord = ( coords[ 0 ] === this.currentTileCoord[ 0 ] && coords[ 1 ] === this.currentTileCoord[ 1 ] );

                    if ( !foundCoord && !sameCoord ) {
                        this.applyTile( coords );
                        this.pushCoords( coords );
                    }

                    if ( this.tilesetCoords.length ) {
                        this.applyPreview();
                        this.cursor.applyCursor();

                    } else {
                        this.resetPreview();
                        this.cursor.reset();
                    }
                }
            }
        });

        $tilepaint.on( "mouseup", () => {
            this.currentTileCoord = null;
            this.isMouseDownTiles = false;
            this.isMouseMovedTiles = false;
        });

        $tilepaint.on( "mouseout", () => {
            this.clearMoveCoords();
        });
    }


    bindMapgridEvents () {
        const $mapgrid = window.hobo( this.cssgrids.mapgrid );

        $mapgrid.on( "mousedown", ( e ) => {
            // Right click mouse button
            // https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
            if ( e.button === 2 ) {
                this.isMouseDownCanvas = false;
                return;
            }

            if ( this.editor.canMapFunction() ) {
                this.isMouseDownCanvas = true;
                this.canvasMouseCoords = {
                    x: e.offsetX,
                    y: e.offsetY
                };

                // const coords = this.getMouseCoords( e, this.map.tilesize );
            }
        });

        $mapgrid.on( "mousemove", ( e ) => {
            if ( !this.map ) {
                return;
            }

            this.canvasMouseCoords = {
                x: e.offsetX,
                y: e.offsetY
            };

            const coords = this.getMouseCoords( e, this.map.tilesize );

            this.setMoveCoords( coords );

            if ( this.editor.canMapFunction() ) {
                if ( this.isMouseDownCanvas ) {
                    if ( this.canApplyLayer() ) {
                        this.applyLayer( this.editor.layers.mode, coords );
                    }
                } else {
                    if ( this.canApplyLayer() ) {
                        this.cursor.showCanvasCursor( coords );

                    } else if ( this.currentNPC && this.canApplyNPC() ) {
                        this.cursor.showCanvasCursor( coords, this.currentNPC );

                    } else if ( this.currentObject && this.canApplyObject() ) {
                        this.cursor.showCanvasCursor( coords, this.currentObject );

                    } else if ( this.canApplySpawn() ) {
                        this.cursor.showSpawnCursor( coords );

                    } else if ( this.canApplyEvent() ) {
                        this.cursor.showEventCursor( coords );

                    } else if ( this.canApplyActiveTiles() ) {
                        this.cursor.showTilesCursor( coords );
                    }
                }
            }
        });

        $mapgrid.on( "mouseup", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                this.canvasMouseCoords = {
                    x: e.offsetX,
                    y: e.offsetY
                };

                const coords = this.getMouseCoords( e, this.map.tilesize );

                if ( this.canApplyLayer() ) {
                    this.applyLayer( this.editor.layers.mode, coords );

                } else if ( this.canApplyNPC() ) {
                    this.applyNPC( coords );

                } else if ( this.canApplyObject() ) {
                    this.applyObject( coords );

                } else if ( this.canApplySpawn() ) {
                    this.applySpawn( coords );

                } else if ( this.canApplyEvent() ) {
                    this.applyEvent( coords );

                } else if ( this.canApplyActiveTiles() ) {
                    this.applyActiveTiles( coords );
                }
            }

            this.isMouseDownCanvas = false;
        });

        $mapgrid.on( "mouseout", () => {
            this.clearMoveCoords();
            this.canvasMouseCoords = null;

            this.cursor.hideCanvasCursor();
            this.cursor.hideBlockCursor();
        });

        $mapgrid.on( "contextmenu", ( e ) => {
            e.preventDefault();

            // TODO: contextmenu...
        });
    }


    bindMenuEvents () {
        ipcRenderer.on( "menu-togglegrid", () => {
            this.toggleGrid();
        });

        ipcRenderer.on( "menu-contextmenu", ( e, action ) => {
            this.isMouseDownCanvas = false;
            this.contextCoords = null;
        });
    }


    canApplyLayer () {
        return (
            this.tilesetCoords.length &&
            ( this.editor.layers.mode === Config.EditorLayers.modes.BACKGROUND || this.editor.layers.mode === Config.EditorLayers.modes.FOREGROUND )
        ) || (
            this.editor.actions.mode === Config.EditorActions.modes.ERASE &&
            ( this.editor.layers.mode === Config.EditorLayers.modes.BACKGROUND || this.editor.layers.mode === Config.EditorLayers.modes.FOREGROUND )
        );
    }


    canApplyNPC () {
        return (
            this.editor.layers.mode === Config.EditorLayers.modes.NPC
        );
    }


    canApplyObject () {
        return (
            this.editor.layers.mode === Config.EditorLayers.modes.OBJ
        );
    }


    canApplySpawn () {
        return (
            this.editor.actions.mode === Config.EditorActions.modes.SPAWN &&
            this.editor.layers.meta[ Config.EditorLayers.modes.SPAWN ]
        );
    }


    canApplyEvent () {
        return (
            this.editor.actions.mode === Config.EditorActions.modes.EVENT &&
            this.editor.layers.meta[ Config.EditorLayers.modes.EVENT ]
        );
    }
    

    canApplyActiveTiles () {
        return (
            this.editor.actions.mode === Config.EditorActions.modes.TILES &&
            this.editor.layers.meta[ Config.EditorLayers.modes.EVENT ]
        );
    }


    canApplyCollider () {
        return (
            this.isMouseDownCollider &&
            this.editor.layers.mode === Config.EditorLayers.modes.COLLISION
        );
    }


    canApplyTiles () {
        return (
            this.isMouseDownTiles &&
            this.editor.actions.mode !== Config.EditorActions.modes.ERASE
        );
    }


    canBeginApplyTiles () {
        return (
            this.editor.canMapFunction() &&
            this.editor.actions.mode !== Config.EditorActions.modes.ERASE &&
            this.editor.actions.mode !== Config.EditorActions.modes.SELECT
        );
    }
}



module.exports = EditorCanvas;
