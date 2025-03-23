const { ipcRenderer } = require( "electron" );
const Config = require( "./Config" );
const { renderNPC, renderObject } = require( "./Render" );


const renderTile = ( ctx, x, y, w, h, color, alpha ) => {
    ctx.globalAlpha = alpha || 0.75;
    ctx.fillStyle = color || window.lib2dk.Config.colors.blue;
    ctx.fillRect( x, y, w, h );
};
const clearTile = ( ctx, x, y, w, h ) => {
    ctx.clearRect(
        x,
        y,
        w,
        h
    );
};
const sortCoords = ( cA, cB ) => {
    if ( cA[ 1 ] < cB[ 1 ] ) {
        return -1;

    } else if ( cA[ 1 ] === cB[ 1 ] && cA[ 0 ] < cB[ 0 ] ) {
        return -1;

    } else {
        return 1;
    }
};



class EditorCanvas {
    constructor ( editor ) {
        this.loader = new window.lib2dk.Loader();
        this.editor = editor;
        this.mode = null;
        this.map = null;
        this.game = null;
        this.assets = {};
        this.canvasMouseCoords = null;
        this.tilesetCoords = [];
        this.selectionCoords = [];
        this.currentNPC = null;
        this.currentObject = null;
        this.isSpacebar = false;
        this.isEscape = false;
        this.isMouseDownTiles = false;
        this.isMouseMovedTiles = false;
        this.isMouseDownCanvas = false;
        this.isMouseDownCollider = false;
        this.isDraggableAlive = false;
        this.currentTileCoord = null;
        this.contextCoords = null;
        this.dom = {
            moveCoords: document.getElementById( "editor-move-coords" ),
            canvasPane: document.getElementById( "editor-canvas-pane" ),
            $canvasPane: window.hobo( "#editor-canvas-pane" ),
            tileset: document.getElementById( "editor-tileset-image" ),
            tilebox: document.getElementById( "editor-tileset-box" ),
            $tilePicker: window.hobo( "#editor-tile-picker" ),
            $objPicker: window.hobo( "#editor-obj-picker" ),
            $objPickerBox: window.hobo( "#editor-obj-picker-box" ),
            $npcPicker: window.hobo( "#editor-npc-picker" ),
            $npcPickerBox: window.hobo( "#editor-npc-picker-box" ),
        };
        this.layers = {
            background: document.getElementById( "editor-bg" ),
            foreground: document.getElementById( "editor-fg" ),
            collision: document.getElementById( "editor-c" ),
            selection: document.getElementById( "editor-sel" ),
            mapgrid: document.getElementById( "editor-mapgrid" ),
            npc: document.getElementById( "editor-npc" ),
            obj: document.getElementById( "editor-obj" ),
        };
        this.contexts = {
            background: null,
            foreground: null,
            collision: null,
            selection: null,
            npc: null,
            obj: null,
        };
        this.canvases = {
            mapgrid: document.getElementById( "editor-mapgrid-canvas" ),
            collider: document.getElementById( "editor-collider-canvas" ),
            tilegrid: document.getElementById( "editor-tilegrid-canvas" ),
            tilepaint: document.getElementById( "editor-tilepaint-canvas" ),
            preview: document.getElementById( "editor-preview-canvas" ),
            cursor: document.getElementById( "editor-cursor-canvas" ),
        };
        this.draggable = this.getDraggable();
        this.draggable.disable();

        this.bindMenuEvents();
        this.bindMapgridEvents();
        this.bindColliderEvents();
        this.bindDocumentEvents();
        this.bindTilepaintEvents();
        this.hideCanvasCursor();
    }


    hide ( l ) {
        window.hobo( this.layers[ l ] ).addClass( "is-hidden" );
    }


    show ( l ) {
        window.hobo( this.layers[ l ] ).removeClass( "is-hidden" );
    }


    toggleGrid () {
        const $mapgrid = window.hobo( this.layers.mapgrid );

        if ( $mapgrid.is( ".is-hidden" ) ) {
            this.show( "mapgrid" );

        } else {
            this.hide( "mapgrid" );
        }
    }


    getDraggable () {
        return window.Draggable.create( this.dom.canvasPane,
            {
                type: "x,y",
                bounds: this.dom.canvasPane.parentNode,
                force3D: true,
                throwProps: true,
                dragResistance: 0.3,
                edgeResistance: 0.5,
                cursor: "grab",
                activeCursor: "grabbing",
                onDragStart: () => {
                    this.isDraggableAlive = true;
                },
                onRelease: () => {
                    this.dom.canvasPane.classList.remove( "is-dragging" );
                },
                onPress: () => {
                    this.dom.canvasPane.classList.add( "is-dragging" );
                },
                onThrowComplete: () => {
                    this.isMouseDownCanvas = false;
                    this.isDraggableAlive = false;

                    if ( !this.isSpacebar ) {
                        this.draggable.disable();
                    }
                },
            }

        )[ 0 ];
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

            this.clearTileset();
            this.resetPreview();
            this.resetCursor();

            this.isSpacebar = false;
            this.isMouseDownTiles = false;
            this.isMouseMovedTiles = false;
            this.isMouseDownCanvas = false;
            this.isDraggableAlive = false;
            this.currentTileCoord = null;
            this.canvasMouseCoords = null;
            this.currentNPC = null;
            this.currentObject = null;
            this.tilesetCoords = [];
            this.selectionCoords = [];
            this.map = null;
            this.game = null;
            this.assets = {};
            this.mode = null;
            this.dom.tileset.src = "";
            this.dom.$canvasPane.removeClass( "is-loaded" );
        }
    }


    loadMap ( map, game ) {
        this.map = map;
        this.game = window.lib2dk.Utils.copy( game );

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

        ["mapgrid", "collider"].forEach(( layer ) => {
            this.canvases[ layer ].width = this.map.width;
            this.canvases[ layer ].height = this.map.height;
            this.canvases[ layer ].style.width = `${this.map.width}px`;
            this.canvases[ layer ].style.height = `${this.map.height}px`;
        });

        this.canvases.preview.width = this.map.tilesize;
        this.canvases.preview.height = this.map.tilesize;
        this.canvases.preview.style.width = `${this.gridsize}px`;
        this.canvases.preview.style.height = `${this.gridsize}px`;

        this.canvases.cursor.width = this.map.tilesize;
        this.canvases.cursor.height = this.map.tilesize;
        this.canvases.cursor.style.width = `${this.map.tilesize}px`;
        this.canvases.cursor.style.height = `${this.map.tilesize}px`;

        this.dom.canvasPane.style.width = `${this.map.width}px`;
        this.dom.canvasPane.style.height = `${this.map.height}px`;
        this.dom.$canvasPane.addClass( "is-loaded" );

        this.draggable.update({
            applyBounds: true,
        });

        this.loadMapAssets().then(() => {
            this.srcTileset();
            this.drawGrids();
            this.drawTextures();
            this.drawColliders();
            this.drawNPCs();
            this.drawObjects();
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


    getActiveTileCoords ( tiles ) {
        const coords = [];

        for ( let y = this.map.textures[ tiles.layer ].length; y--; ) {
            for ( let x = this.map.textures[ tiles.layer ][ y ].length; x--; ) {
                if ( this.map.textures[ tiles.layer ][ y ][ x ] ) {
                    const len = this.map.textures[ tiles.layer ][ y ][ x ].length;
                    const topCel = this.map.textures[ tiles.layer ][ y ][ x ][ len - 1 ];

                    if ( topCel[ 0 ] === tiles.offsetX && topCel[ 1 ] === tiles.offsetY ) {
                        coords.push( [ x, y ] );
                    }
                }
            }
        }

        return coords;
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

        ["tilegrid", "tilepaint",].forEach(( layer ) => {
            this.canvases[ layer ].width = width;
            this.canvases[ layer ].height = height;
            this.canvases[ layer ].style.width = `${width}px`;
            this.canvases[ layer ].style.height = `${height}px`;
        });
    }


    drawGrids () {
        window.lib2dk.Utils.drawGridLines(
            this.canvases.collider.getContext( "2d" ),
            this.canvases.collider.width,
            this.canvases.collider.height,
            this.map.collider
        );

        window.lib2dk.Utils.drawGridLines(
            this.canvases.mapgrid.getContext( "2d" ),
            this.canvases.mapgrid.width,
            this.canvases.mapgrid.height,
            this.map.tilesize
        );

        window.lib2dk.Utils.drawGridLines(
            this.canvases.tilegrid.getContext( "2d" ),
            this.canvases.tilegrid.width,
            this.canvases.tilegrid.height,
            this.gridsize
        );
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
        this.dom.$npcPickerBox[ 0 ].innerHTML = this.game.npcs.map( ( npc ) => {
            return renderNPC( npc, this.game );
        }).join( "" );
    }


    renderObjectLoadout () {
        this.dom.$objPickerBox[ 0 ].innerHTML = this.game.objects.map( ( obj ) => {
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


    applySelection ( coord ) {
        renderTile(
            this.contexts.selection.context,
            coord[ 0 ] * this.map.tilesize,
            coord[ 1 ] * this.map.tilesize,
            this.map.tilesize,
            this.map.tilesize,
            window.lib2dk.Config.colors.blueDark,
            0.5
        );
    }


    clearSelection () {
        this.selectionCoords.forEach( ( coord ) => {
            clearTile(
                this.contexts.selection.context,
                coord[ 0 ] * this.map.tilesize,
                coord[ 1 ] * this.map.tilesize,
                this.map.tilesize,
                this.map.tilesize
            );
        });
        this.selectionCoords = [];
        ipcRenderer.send( "renderer-selection", false );
    }


    clearSelectionCoord ( coord ) {
        clearTile(
            this.contexts.selection.context,
            coord[ 0 ] * this.map.tilesize,
            coord[ 1 ] * this.map.tilesize,
            this.map.tilesize,
            this.map.tilesize
        );
    }


    validateSelection () {
        let testCoord = this.selectionCoords[ 0 ];
        let testTexture;
        const validation = {
            valid: true,
            alert: "",
        };
        const validTexture = this.map.textures[ this.editor.layers.mode ][ testCoord[ 1 ] ][ testCoord[ 0 ] ];

        // Need to allow layered textures to be converted
        // This means we need to reverse the Array order to look at the "top" tile
        // E.g. A shrub on top of a dirt hole -- lift the shrub and toss it
        // if ( validTexture.length > 1 ) {
            // validation.valid = false;
            // validation.alert = "You can only convert single texture tiles to Active Tiles.";
        // }

        for ( let i = this.selectionCoords.length; i--; ) {
            testCoord = this.selectionCoords[ i ];
            testTexture = this.map.textures[ this.editor.layers.mode ][ testCoord[ 1 ] ][ testCoord[ 0 ] ];

            const testX = validTexture[ validTexture.length - 1 ][ 0 ] === testTexture[ validTexture.length - 1 ][ 0 ];
            const testY = validTexture[ validTexture.length - 1 ][ 1 ] === testTexture[ validTexture.length - 1 ][ 1 ];

            if ( !testX || !testY ) {
                validation.valid = false;
                validation.alert = "Selected tiles must all be the same in order to convert to Active Tiles.";
                return validation;
            }
        }

        return validation;
    }


    selectMatchingTiles ( coord ) {
        console.log( "selectMatchingTiles", coord );
    }


    applyActiveTiles ( data ) {
        // Offset X & Y are already known by selection tiles
        const coord = this.selectionCoords[ 0 ];
        const texture = this.map.textures[ this.editor.layers.mode ][ coord[ 1 ] ][ coord[ 0 ] ];

        data.offsetX = texture[ texture.length - 1 ][ 0 ];
        data.offsetY = texture[ texture.length - 1 ][ 1 ];

        // Layer is determined by active layer in Sidebar
        data.layer = this.editor.layers.mode;

        // Coords is the current canvas selectionCoords
        // Discover allows dynamic Active Tiles based on tileset position
        if ( data.discover ) {
            data.coords = [];
            delete data.discover;

        } else {
            data.coords = this.selectionCoords;
        }

        // Action is an internalized VERB object (dynamic)
        if ( data.action ) {
            data.action = {
                verb: data.action,
            };
        }

        // Attack is an internalized VERB object (static)
        if ( data.attack ) {
            data.attack = {
                verb: window.lib2dk.Config.verbs.ATTACK,
            };
        }

        // Normalize integers
        if ( data.dur ) {
            data.dur = parseInt( data.dur, 10 );
        }

        if ( data.stepsX ) {
            data.stepsX = parseInt( data.stepsX, 10 );
        }

        // Check for this Active Tiles group
        const tiles = this.map.tiles.find( ( obj ) => {
            return ( obj.group === data.group );
        });

        if ( !tiles ) {
            this.map.tiles.push( data );
            this.editor._saveMap();
            this.editor.clearMenu( this.editor.menus.activeTiles );
            this.clearSelection();

        } else {
            alert( `The tile group ${data.group} already exists!` );
        }
    }

    setActiveTool ( tool ) {
        this.dom.$canvasPane.removeClass( "is-brush-tool is-erase-tool is-select-tool" );

        if ( tool ) {
            this.dom.$canvasPane.addClass( `is-${tool}-tool` );
        }
    }


    setActiveLayer ( layer ) {
        this.dom.$canvasPane.removeClass( "is-background is-foreground is-collision is-npc is-obj is-selection" );

        if ( layer ) {
            this.dom.$canvasPane.addClass( `is-${layer}` );

            if ( layer === Config.EditorLayers.modes.OBJ ) {
                this.dom.$objPicker.removeClass( "is-hidden" );
                this.dom.$tilePicker.addClass( "is-hidden" );
                this.dom.$npcPicker.addClass( "is-hidden" );
                this.editor.actions.resetActions();
                this.clearTileset();
            } else if ( layer === Config.EditorLayers.modes.NPC ) {
                this.dom.$npcPicker.removeClass( "is-hidden" );
                this.dom.$objPicker.addClass( "is-hidden" );
                this.dom.$tilePicker.addClass( "is-hidden" );
                this.editor.actions.resetActions();
                this.clearTileset();
            } else {
                this.dom.$tilePicker.removeClass( "is-hidden" );
                this.dom.$objPicker.addClass( "is-hidden" );
                this.dom.$npcPicker.addClass( "is-hidden" );

                // Clear NPC & Object previews (if they exist)
                if ( !this.tilesetCoords.length ) {
                    this.clearTileset();
                }
            }
        }

        if ( this.canApplySelection() ) {
            this.dom.$canvasPane.addClass( "is-selection" );
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
        this.resetCursor();
        this.resetCurrentNPCAndObject();
    }


    pushCoords ( coords ) {
        this.tilesetCoords.push( coords );
        this.tilesetCoords = this.tilesetCoords.sort( sortCoords );
    }


    pushSelection ( coords ) {
        this.selectionCoords.push( coords );
        this.selectionCoords = this.selectionCoords.sort( sortCoords );
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


    resetCursor () {
        const ctx = this.canvases.cursor.getContext( "2d" );

        this.clearCanvas( this.canvases.cursor );

        this.canvases.cursor.width = this.map.tilesize;
        this.canvases.cursor.height = this.map.tilesize;
        this.canvases.cursor.style.width = `${this.map.tilesize}px`;
        this.canvases.cursor.style.height = `${this.map.tilesize}px`;
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
        const npc = this.currentNPC;
        const ctx = this.canvases.preview.getContext( "2d" );
        const scale = this.map.tilesize / this.gridsize;
        const width = npc.width;
        const height = npc.height;
        const state = npc.states[ 0 ];
        const offsetX = Math.abs( npc.verbs[ state.verb ][ state.dir ].offsetX );
        const offsetY = Math.abs( npc.verbs[ state.verb ][ state.dir ].offsetY );
        
        this.clearCanvas( this.canvases.preview );

        this.canvases.preview.width = width;
        this.canvases.preview.height = height;
        this.canvases.preview.style.width = `${width / scale}px`;
        this.canvases.preview.style.height = `${height / scale}px`;

        ctx.drawImage(
            this.assets[ npc.image ],
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


    applyPreviewObject () {
        const obj = this.currentObject;
        const ctx = this.canvases.preview.getContext( "2d" );
        const scale = this.map.tilesize / this.gridsize;
        const width = obj.width;
        const height = obj.height;

        this.clearCanvas( this.canvases.preview );

        this.canvases.preview.width = width;
        this.canvases.preview.height = height;
        this.canvases.preview.style.width = `${width / scale}px`;
        this.canvases.preview.style.height = `${height / scale}px`;
        
        ctx.drawImage(
            this.assets[ obj.image ],
            obj.offsetX,
            obj.offsetY,
            width,
            height,
            0,
            0,
            width,
            height
        );
    }


    applyCursor () {
        const ctx = this.canvases.cursor.getContext( "2d" );
        const coordMap = this.getCoordMap();
        const width = coordMap.width * this.map.tilesize;
        const height = coordMap.height * this.map.tilesize;

        this.clearCanvas( this.canvases.cursor );

        this.canvases.cursor.width = width;
        this.canvases.cursor.height = height;
        this.canvases.cursor.style.width = `${width}px`;
        this.canvases.cursor.style.height = `${height}px`;

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


    applyCursorNPC () {
        const npc = this.currentNPC;
        const ctx = this.canvases.cursor.getContext( "2d" );
        const width = npc.width;
        const height = npc.height;
        const state = npc.states[ 0 ];
        const offsetX = Math.abs( npc.verbs[ state.verb ][ state.dir ].offsetX );
        const offsetY = Math.abs( npc.verbs[ state.verb ][ state.dir ].offsetY );

        this.canvases.cursor.width = width;
        this.canvases.cursor.height = height;
        this.canvases.cursor.style.width = `${width}px`;
        this.canvases.cursor.style.height = `${height}px`;

        ctx.drawImage(
            this.assets[ npc.image ],
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


    applyCursorObject () {
        const obj = this.currentObject;
        const ctx = this.canvases.cursor.getContext( "2d" );
        const width = obj.width;
        const height = obj.height;

        this.canvases.cursor.width = width;
        this.canvases.cursor.height = height;
        this.canvases.cursor.style.width = `${width}px`;
        this.canvases.cursor.style.height = `${height}px`;

        ctx.drawImage(
            this.assets[ obj.image ],
            obj.offsetX,
            obj.offsetY,
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

    _applyObjectOrNPC ( coords, objectOrNPC ) {
        const isNPC = this.editor.layers.mode === Config.EditorLayers.modes.NPC;

        // Must reference map data by key to mutate it
        let _mapDataKey = isNPC ? "npcs" : "objects";
        let _gameData = isNPC ? this.game.npcs : this.game.objects;
        let _context = isNPC ? this.contexts.npc : this.contexts.obj;
        let _redraw = isNPC ? this.drawNPCs.bind( this ) : this.drawObjects.bind( this );

        if ( objectOrNPC && this.editor.actions.mode == Config.EditorActions.modes.BRUSH ) {
            const offsetCoords = this.getCursorOffsetCoords( coords, objectOrNPC );

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
            const coordTile = {
                x: this.canvasMouseCoords.x,
                y: this.canvasMouseCoords.y,
                width: 10,
                height: 10,
            };
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

                return window.lib2dk.Utils.collide( objectOrNPCSprite, coordTile );
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


    getCursorOffsetCoords ( coords, obj ) {
        let x = coords[ 0 ];
        let y = coords[ 1 ];

        const midX = this.map.tilesize / 2;
        const midY = this.map.tilesize / 2;
        const mouseX = this.canvasMouseCoords.x;
        const mouseY = this.canvasMouseCoords.y;

        // Support for negative object placement at the top of the canvas
        // Placing with overflow off the bottom of the canvas works by default
        if ( x === 0 && mouseX < midX ) {
            x = x - ( ( obj.width / 2 ) / this.map.tilesize );
        }

        if ( y === 0 && mouseY < midY ) {
            y = y - ( ( obj.height / 2 ) / this.map.tilesize );
        }

        return [ x, y ];
    }


    showCanvasCursor ( coords ) {
        let x = coords[ 0 ];
        let y = coords[ 1 ];

        if ( this.currentObject && this.editor.layers.mode === Config.EditorLayers.modes.OBJ ) {
            const offsetCoords = this.getCursorOffsetCoords( coords, this.currentObject );

            x = offsetCoords[ 0 ];
            y = offsetCoords[ 1 ];
        }

        this.canvases.cursor.style.opacity = 0.5;
        this.canvases.cursor.style.zIndex = 9999;
        this.canvases.cursor.style.webkitTransform = `translate3d(
                ${x * this.map.tilesize}px,
                ${y * this.map.tilesize}px,
                0
            )
        `;
    }


    hideCanvasCursor () {
        this.canvases.cursor.style.opacity = 0;
        this.canvases.cursor.style.zIndex = -1;
        this.canvases.cursor.style.webkitTransform = `translate3d(
                0,
                0,
                0
            )
        `;
    }


    bindDocumentEvents () {
        const $document = window.hobo( document );

        $document.on( "keydown", ( e ) => {
            const activeMenu = window.hobo( ".js-menu.is-active" );

            if ( activeMenu.length ) {
                return;
            }

            this.isSpacebar = ( e.keyCode === Config.keys.SPACEBAR );
            this.isEscape = ( e.keyCode === Config.keys.ESCAPE );

            if ( this.isEscape ) {
                this.clearTileset();
                this.clearSelection();
            }

            if ( this.isSpacebar ) {
                this.editor.blurSelectMenus();
            }

            if ( this.editor.mode !== Config.Editor.modes.SAVING && ( this.isSpacebar && this.mode !== Config.EditorCanvas.modes.DRAG ) ) {
                e.preventDefault();

                this.draggable.enable();

                this.mode = Config.EditorCanvas.modes.DRAG;
            }
        });

        $document.on( "keyup", ( e ) => {
            this.isSpacebar = false;
            this.isEscape = false;

            if ( !this.isSpacebar && !this.isDraggableAlive ) {
                this.draggable.disable();
            }

            if ( this.editor.mode !== Config.Editor.modes.SAVING && this.mode === Config.EditorCanvas.modes.DRAG ) {
                e.preventDefault();

                this.mode = null;
            }
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
            this.applyCursorNPC();
        }); 

        $document.on( "click", ".js-obj-tile", ( e ) => {
            const id = e.target.dataset.obj;

            const obj = this.game.objects.find( ( obj ) => {
                return obj.id === id;
            });

            this.currentObject = obj;

            this.resetPreview();
            this.applyPreviewObject();
            this.applyCursorObject();
        });
    }


    bindColliderEvents () {
        const $collider = window.hobo( this.canvases.collider );

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

            this.dom.moveCoords.innerHTML = `( ${coords[ 0 ]}, ${coords[ 1 ]} )`;

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
            this.dom.moveCoords.innerHTML = "( X, Y )";
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
                    this.clearTile( foundCoord );
                    this.tilesetCoords.splice( this.tilesetCoords.indexOf( foundCoord ), 1 );
                }

                if ( this.tilesetCoords.length ) {
                    this.applyPreview();
                    this.applyCursor();

                } else {
                    this.resetPreview();
                    this.resetCursor();
                }

                this.currentTileCoord = coords;
            }
        });

        $tilepaint.on( "mousemove", ( e ) => {
            if ( !this.map ) {
                return;
            }

            const coords = this.getMouseCoords( e, this.gridsize );

            this.dom.moveCoords.innerHTML = `( ${coords[ 0 ]}, ${coords[ 1 ]} )`;

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
                        this.applyCursor();

                    } else {
                        this.resetPreview();
                        this.resetCursor();
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
            this.dom.moveCoords.innerHTML = "( X, Y )";
        });
    }


    bindMapgridEvents () {
        const $mapgrid = window.hobo( this.canvases.mapgrid );

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

                const coords = this.getMouseCoords( e, this.map.tilesize );

                if ( this.canApplySelection() ) {
                    const foundCoord = this.getFoundCoords( this.selectionCoords, coords );

                    if ( !foundCoord ) {
                        this.applySelection( coords );
                        this.pushSelection( coords );
                        ipcRenderer.send( "renderer-selection", true );
                    }
                }
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

            this.dom.moveCoords.innerHTML = `( ${coords[ 0 ]}, ${coords[ 1 ]} )`;

            if ( this.editor.canMapFunction() ) {
                if ( this.isMouseDownCanvas ) {
                    if ( this.canApplySelection() ) {
                        const foundCoord = this.getFoundCoords( this.selectionCoords, coords );

                        if ( !foundCoord ) {
                            this.applySelection( coords );
                            this.pushSelection( coords );
                            ipcRenderer.send( "renderer-selection", true );
                        }

                    } else if ( this.canApplyLayer() ) {
                        this.applyLayer( this.editor.layers.mode, coords );
                    }
                } else {
                    if ( this.canApplyLayer() ) {
                        this.showCanvasCursor( coords );
                    } else if ( this.canApplyNPC() ) {
                        this.showCanvasCursor( coords );
                    } else if ( this.canApplyObject() ) {
                        this.showCanvasCursor( coords );
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
                }
            }

            this.isMouseDownCanvas = false;
        });

        $mapgrid.on( "mouseout", () => {
            this.dom.moveCoords.innerHTML = "( X, Y )";
            this.canvasMouseCoords = null;

            this.hideCanvasCursor();
        });

        $mapgrid.on( "contextmenu", ( e ) => {
            e.preventDefault();

            this.isMouseDownCanvas = false;

            const ctxCoords = this.getMouseCoords( e, this.map.tilesize );

            this.contextCoords = this.getFoundCoords( this.selectionCoords, ctxCoords );

            if ( this.canApplySelection() ) {
                ipcRenderer.send( "renderer-contextmenu" );
            }
        });
    }


    bindMenuEvents () {
        ipcRenderer.on( "menu-contextmenu", ( e, action ) => {
            this.isMouseDownCanvas = false;

            // Clear the "selection"
            if ( action === "deselect-tiles" ) {
                this.clearSelection();

            // Clear the "selected" tile
            } else if ( action === "deselect-tile" ) {
                this.clearSelectionCoord( this.contextCoords );
                this.selectionCoords.splice( this.selectionCoords.indexOf( this.contextCoords ), 1 );

            } else if ( action === "select-matching-tiles" ) {
                // Find all matching tiles to "contextCoords"
                // Push to selectionCoords[] and draw to canvas
                this.selectMatchingTiles( this.contextCoords );

            // Initiate Active Tiles menu
            } else if ( action === "create-activetiles" ) {
                const validation = this.validateSelection();

                if ( validation.valid ) {
                    this.editor._openMenu( "activetiles", "editor-activetiles-menu" );

                } else {
                    alert( validation.alert );
                }

            // One-time action to revert Active Tiles
            // Use a confirm() popup indicating permanence of this action...
            } else if ( action === "remove-activetiles" ) {
                // Remove active tiles by selectionCoords[]
                // Requires calling "this.editor._saveMap()"
            }

            this.contextCoords = null;
        });
    }


    canApplySelection () {
        return (
            this.editor.actions.mode === Config.EditorActions.modes.SELECT &&
            ( this.editor.layers.mode === Config.EditorLayers.modes.BACKGROUND || this.editor.layers.mode === Config.EditorLayers.modes.FOREGROUND )
        );
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
