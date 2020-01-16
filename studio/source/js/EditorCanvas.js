const EditorUtils = require( "./EditorUtils" );
const Config = require( "./Config" );
const Cache = require( "./Cache" );
const $ = require( "../../node_modules/properjs-hobo/dist/hobo.build" );
const { MapLayer, drawMapTiles, drawGridLines } = require( "../../../source/2dk/js/lib/Map" );
const Loader = require( "../../../source/2dk/js/lib/Loader" );



const renderTile = ( ctx, x, y, w, h, color, alpha ) => {
    ctx.globalAlpha = alpha || 0.75;
    ctx.fillStyle = color || Config.colors.blue;
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



class EditorCanvas {
    constructor ( editor ) {
        this.loader = new Loader();
        this.editor = editor;
        this.mode = null;
        this.map = null;
        this.tilesetCoords = [];
        this.isZoomable = false;
        this.isSpacebar = false;
        this.isMouseDownTiles = false;
        this.isMouseMovedTiles = false;
        this.isMouseDownCanvas = false;
        this.isMouseDownCollider = false;
        this.isDraggableAlive = false;
        this.currentTileCoord = null;
        this.dom = {
            moveCoords: document.getElementById( "editor-move-coords" ),
            canvasPane: document.getElementById( "editor-canvas-pane" ),
            $canvasPane: $( "#editor-canvas-pane" ),
            tileset: document.getElementById( "editor-tileset-image" ),
            tilebox: document.getElementById( "editor-tileset-box" ),
        };
        this.layers = {
            background: document.getElementById( "editor-bg" ),
            foreground: document.getElementById( "editor-fg" ),
            collision: document.getElementById( "editor-c" ),
            mapgrid: document.getElementById( "editor-mapgrid" ),
        };
        this.contexts = {
            background: null,
            foreground: null,
            collision: null,
        };
        this.canvases = {
            collider: document.getElementById( "editor-collider-canvas" ),
            mapgrid: document.getElementById( "editor-mapgrid-canvas" ),
            tilegrid: document.getElementById( "editor-tilegrid-canvas" ),
            tilepaint: document.getElementById( "editor-tilepaint-canvas" ),
            preview: document.getElementById( "editor-preview-canvas" ),
            cursor: document.getElementById( "editor-cursor-canvas" ),
        };
        this.draggable = this.getDraggable();
        this.draggable.disable();

        this.bindEvents();
    }


    toggleGrid () {
        const $mapgrid = $( this.layers.mapgrid );

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
                onThrowComplete: () => {
                    this.isMouseDownCanvas = false;
                    this.isDraggableAlive = false;

                    if ( !this.isSpacebar ) {
                        this.draggable.disable();
                    }
                }
            }

        )[ 0 ];
    }


    reset () {
        if ( this.map ) {
            this.clear( this.canvases.mapgrid );
            this.clear( this.canvases.tilegrid );
            this.clear( this.canvases.collider );
            this.clearTileset();
            this.resetPreview();
            this.resetCursor();

            this.isZoomable = false;
            this.isSpacebar = false;
            this.isMouseDownTiles = false;
            this.isMouseMovedTiles = false;
            this.isMouseDownCanvas = false;
            this.isDraggableAlive = false;
            this.currentTileCoord = null;
            this.tilesetCoords = [];
            this.map = null;
            this.mode = null;
            this.contexts.background = null;
            this.contexts.foreground = null;
            this.contexts.collision = null;
            this.dom.tileset.src = "";
            this.layers.background.innerHTML = "";
            this.layers.foreground.innerHTML = "";
            this.layers.collision.innerHTML = "";
            this.dom.$canvasPane.removeClass( "is-loaded" );
        }
    }


/******************************************************************************
 * BEGIN: Use this.scale for draw maths
*******************************************************************************/
    loadMap ( map ) {
        this.map = map;

        // Gridsize for tilepaint
        this.gridsize = Math.min( 32, this.map.tilesize );
        this.tilescale = this.map.tilesize / this.gridsize;

        // Empty tileset tiles
        this.tilesetCoords = [];

        // Clean up last map in DOM, prolly already happened with this.reset()
        this.layers.background.innerHTML = "";
        this.layers.foreground.innerHTML = "";
        this.layers.collision.innerHTML = "";

        // Create new map layers
        this.contexts.background = new MapLayer({
            id: "background",
            map: this.map,
            cash: false,
            width: this.map.width,
            height: this.map.height
        });
        this.contexts.foreground = new MapLayer({
            id: "foreground",
            map: this.map,
            cash: false,
            width: this.map.width,
            height: this.map.height
        });
        this.contexts.collision = new MapLayer({
            id: "collision",
            map: this.map,
            cash: false,
            width: this.map.width,
            height: this.map.height
        });

        this.contexts.background.canvas.style.width = `${this.map.width}px`;
        this.contexts.background.canvas.style.height = `${this.map.height}px`;
        this.contexts.foreground.canvas.style.width = `${this.map.width}px`;
        this.contexts.foreground.canvas.style.height = `${this.map.height}px`;
        this.contexts.collision.canvas.style.width = `${this.map.width}px`;
        this.contexts.collision.canvas.style.height = `${this.map.height}px`;

        this.layers.background.appendChild( this.contexts.background.canvas );
        this.layers.foreground.appendChild( this.contexts.foreground.canvas );
        this.layers.collision.appendChild( this.contexts.collision.canvas );

        this.canvases.mapgrid.width = this.map.width;
        this.canvases.mapgrid.height = this.map.height;
        this.canvases.mapgrid.style.width = `${this.map.width}px`;
        this.canvases.mapgrid.style.height = `${this.map.height}px`;

        this.canvases.collider.width = this.map.width;
        this.canvases.collider.height = this.map.height;
        this.canvases.collider.style.width = `${this.map.width}px`;
        this.canvases.collider.style.height = `${this.map.height}px`;

        this.dom.canvasPane.style.width = `${this.map.width}px`;
        this.dom.canvasPane.style.height = `${this.map.height}px`;

        this.dom.$canvasPane.addClass( "is-loaded" );

        this.draggable.update({
            applyBounds: true
        });

        // Load the tileset
        this.loader.loadImage( `.${this.map.image}` ).then(( img ) => {
            this.addTileset( img );
            this.addCanvas();
        });
    }


    addCanvas () {
        this.clear( this.contexts.background.canvas );
        this.clear( this.contexts.foreground.canvas );
        this.clear( this.contexts.collision.canvas );
        this.clear( this.canvases.mapgrid );

        drawGridLines(
            this.canvases.collider.getContext( "2d" ),
            this.canvases.collider.width,
            this.canvases.collider.height,
            this.map.collider
        );
        drawGridLines(
            this.canvases.mapgrid.getContext( "2d" ),
            this.canvases.mapgrid.width,
            this.canvases.mapgrid.height,
            this.map.tilesize
        );
        drawMapTiles(
            this.contexts.background.context,
            this.dom.tileset,
            this.map.textures.background,
            this.map.tilesize,
            this.map.tilesize,
        );
        drawMapTiles(
            this.contexts.foreground.context,
            this.dom.tileset,
            this.map.textures.foreground,
            this.map.tilesize,
            this.map.tilesize,
        );
        this.drawColliders();
    }


    clear ( canvas ) {
        canvas.getContext( "2d" ).clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
    }


    refresh ( layer ) {
        this.clear( this.contexts[ layer ].canvas );

        drawMapTiles(
            this.contexts[ layer ].context,
            this.dom.tileset,
            this.map.textures[ layer ],
            this.map.tilesize,
            this.map.tilesize,
        );
    }


    drawColliders () {
        this.map.collision.forEach(( collider ) => {
            renderTile(
                this.contexts.collision.context,
                collider[ 0 ] * this.map.collider,
                collider[ 1 ] * this.map.collider,
                this.map.collider,
                this.map.collider,
            );
        });
    }


    removeCollider ( coord ) {
        const collider = this.map.collision.find(( collider ) => {
            return (collider[ 0 ] === coord[ 0 ] && collider[ 1 ] === coord[ 1 ]);
        });

        if ( collider ) {
            this.map.collision.splice( this.map.collision.indexOf( collider ), 1 );

            clearTile(
                this.contexts.collision.context,
                coord[ 0 ] * this.map.collider,
                coord[ 1 ] * this.map.collider,
                this.map.collider,
                this.map.collider,
            );
        }
    }


    applyCollider ( coord ) {
        const collider = this.map.collision.find(( collider ) => {
            return (collider[ 0 ] === coord[ 0 ] && collider[ 1 ] === coord[ 1 ]);
        });

        if ( !collider ) {
            this.map.collision.push( coord );

            renderTile(
                this.contexts.collision.context,
                coord[ 0 ] * this.map.collider,
                coord[ 1 ] * this.map.collider,
                this.map.collider,
                this.map.collider,
            );
        }
    }
/******************************************************************************
 * END: Use this.scale for draw maths
*******************************************************************************/


    hide ( l ) {
        $( this.layers[ l ] ).addClass( "is-hidden" );
    }


    show ( l ) {
        $( this.layers[ l ] ).removeClass( "is-hidden" );
    }


    setTileboxBounds () {
        const boxBounds = this.dom.tilebox.getBoundingClientRect();

        this.dom.tilebox.style.height = `${window.innerHeight - boxBounds.y - 16}px`;
    }


    addTileset ( img ) {
        const width = img.naturalWidth / this.tilescale;
        const height = img.naturalHeight / this.tilescale;

        this.dom.tileset.src = img.src;
        this.dom.tileset.style.width = `${width}px`;

        this.canvases.tilegrid.width = width;
        this.canvases.tilegrid.height = height;
        this.canvases.tilegrid.style.width = `${width}px`;
        this.canvases.tilegrid.style.height = `${height}px`;

        this.canvases.tilepaint.width = width;
        this.canvases.tilepaint.height = height;
        this.canvases.tilepaint.style.width = `${width}px`;
        this.canvases.tilepaint.style.height = `${height}px`;

        this.canvases.preview.width = this.map.tilesize;
        this.canvases.preview.height = this.map.tilesize;
        this.canvases.preview.style.width = `${this.gridsize}px`;
        this.canvases.preview.style.height = `${this.gridsize}px`;

        this.canvases.cursor.width = this.map.tilesize;
        this.canvases.cursor.height = this.map.tilesize;
        this.canvases.cursor.style.width = `${this.map.tilesize}px`;
        this.canvases.cursor.style.height = `${this.map.tilesize}px`;

        this.clear( this.canvases.tilepaint );
        this.clear( this.canvases.tilegrid );

        drawGridLines(
            this.canvases.tilegrid.getContext( "2d" ),
            this.canvases.tilegrid.width,
            this.canvases.tilegrid.height,
            this.gridsize
        );
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


    setActiveLayer ( layer ) {
        this.dom.$canvasPane.removeClass( "is-background is-foreground is-collision" );

        if ( layer ) {
            this.dom.$canvasPane.addClass( `is-${layer}` );
        }
    }


    brush ( layer, coords ) {
        const coordMap = this.getCoordMap();

        this.editor.updateMapLayer( layer, coords, coordMap );
    }


    bucket ( layer ) {
        for ( let y = this.map.textures[ layer ].length; y--; ) {
            for ( let x = this.map.textures[ layer ][ y ].length; x--; ) {
                this.map.textures[ layer ][ y ][ x ] = 0;

                // Only one tile can bucket fill
                if ( this.tilesetCoords.length ) {
                    this.tilesetCoords = [this.tilesetCoords[ 0 ]];
                    this.brush( layer, [x, y] );
                }
            }
        }
    }


    trash ( layer, coords ) {
        this.tilesetCoords = [];
        this.map.textures[ layer ][ coords[ 1 ] ][ coords[ 0 ] ] = 0;
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
        this.tilesetCoords.forEach(( coord ) => {
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
    }


    pushCoords ( coords ) {
        this.tilesetCoords.push( coords );
        this.tilesetCoords = this.tilesetCoords.sort(( cA, cB ) => {
            if ( cA[ 1 ] < cB[ 1 ] ) {
                return -1;

            } else if ( cA[ 1 ] === cB[ 1 ] && cA[ 0 ] < cB[ 0 ] ) {
                return -1;

            } else {
                return 1;
            }
        });
    }


    getCoordMap () {
        const sortedX = this.tilesetCoords.sort(( cA, cB ) => {
            if ( cA[ 0 ] < cB[ 0 ] ) {
                return -1;

            } else {
                return 1;
            }
        });
        const smallX = sortedX[ 0 ][ 0 ];
        const largeX = sortedX[ sortedX.length - 1 ][ 0 ];
        const sortedY = this.tilesetCoords.sort(( cA, cB ) => {
            if ( cA[ 1 ] < cB[ 1 ] ) {
                return -1;

            } else {
                return 1;
            }
        });
        const smallY = sortedY[ 0 ][ 1 ];
        const largeY = sortedY[ sortedY.length - 1 ][ 1 ];
        const coordMap = {
            width: (largeX - smallX) + 1,
            height: (largeY - smallY) + 1,
            tiles: [],
        };

        for ( let y = smallY; y <= largeY; y++ ) {
            for ( let x = smallX; x <= largeX; x++ ) {
                const foundCoord = this.tilesetCoords.find(( coord ) => {
                    return (coord[ 0 ] === x && coord[ 1 ] === y);
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

        ctx.clearRect(
            0,
            0,
            this.canvases.preview.width,
            this.canvases.preview.width
        );

        this.canvases.preview.width = this.map.tilesize;
        this.canvases.preview.height = this.map.tilesize;
        this.canvases.preview.style.width = `${this.gridsize}px`;
        this.canvases.preview.style.height = `${this.gridsize}px`;
    }


    resetCursor () {
        const ctx = this.canvases.cursor.getContext( "2d" );

        ctx.clearRect(
            0,
            0,
            this.canvases.cursor.width,
            this.canvases.cursor.width
        );

        this.canvases.cursor.width = this.map.tilesize;
        this.canvases.cursor.height = this.map.tilesize;
        this.canvases.cursor.style.width = `${this.map.tilesize}px`;
        this.canvases.cursor.style.height = `${this.map.tilesize}px`;
    }


    applyPreview () {
        const ctx = this.canvases.preview.getContext( "2d" );
        const coordMap = this.getCoordMap();
        const width = coordMap.width * this.gridsize;
        const height = coordMap.height * this.gridsize;

        ctx.clearRect(
            0,
            0,
            this.canvases.preview.width,
            this.canvases.preview.width
        );

        this.canvases.preview.width = width * this.tilescale;
        this.canvases.preview.height = height * this.tilescale;
        this.canvases.preview.style.width = `${width}px`;
        this.canvases.preview.style.height = `${height}px`;

        coordMap.tiles.forEach(( tile ) => {
            if ( tile.paintTile ) {
                ctx.drawImage(
                    this.dom.tileset,
                    (tile.tileCoord[ 0 ] * this.map.tilesize),
                    (tile.tileCoord[ 1 ] * this.map.tilesize),
                    this.map.tilesize,
                    this.map.tilesize,
                    (tile.drawCoord[ 0 ] * this.map.tilesize),
                    (tile.drawCoord[ 1 ] * this.map.tilesize),
                    this.map.tilesize,
                    this.map.tilesize
                );
            }
        });
    }


    applyCursor () {
        const ctx = this.canvases.cursor.getContext( "2d" );
        const coordMap = this.getCoordMap();
        const width = coordMap.width * this.map.tilesize;
        const height = coordMap.height * this.map.tilesize;

        ctx.clearRect(
            0,
            0,
            this.canvases.cursor.width,
            this.canvases.cursor.width
        );

        this.canvases.cursor.width = width;
        this.canvases.cursor.height = height;
        this.canvases.cursor.style.width = `${width}px`;
        this.canvases.cursor.style.height = `${height}px`;

        coordMap.tiles.forEach(( tile ) => {
            if ( tile.paintTile ) {
                ctx.drawImage(
                    this.dom.tileset,
                    (tile.tileCoord[ 0 ] * this.map.tilesize),
                    (tile.tileCoord[ 1 ] * this.map.tilesize),
                    this.map.tilesize,
                    this.map.tilesize,
                    (tile.drawCoord[ 0 ] * this.map.tilesize),
                    (tile.drawCoord[ 1 ] * this.map.tilesize),
                    this.map.tilesize,
                    this.map.tilesize
                );
            }
        });
    }


    applyLayer ( layer, coords ) {
        if ( this.editor.actions.mode === Config.EditorActions.modes.BRUSH ) {
            this.brush( layer, coords );

        } else if ( editor.actions.mode === Config.EditorActions.modes.BUCKET ) {
            this.bucket( layer, coords );

        } else if ( editor.actions.mode === Config.EditorActions.modes.ERASE ) {
            this.trash( layer, coords );
        }

        this.refresh( layer );
    }


    bindEvents () {
        const $document = $( document );
        const $tilepaint = $( this.canvases.tilepaint );
        const $mapgrid = $( this.canvases.mapgrid );
        const $collider = $( this.canvases.collider );

        $document.on( "keydown", ( e ) => {
            const activeMenu = $( ".js-menu.is-active" );

            if ( activeMenu.length ) {
                return;
            }

            this.isSpacebar = (e.which === Config.keys.SPACEBAR);

            if ( this.isSpacebar ) {
                this.editor.blurSelectMenus();
            }

            if ( this.editor.mode !== Config.Editor.modes.SAVING && (this.isSpacebar && this.mode !== Config.EditorCanvas.modes.DRAG) ) {
                e.preventDefault();

                this.draggable.enable();

                this.mode = Config.EditorCanvas.modes.DRAG;
            }
        });

        $document.on( "keyup", ( e ) => {
            this.isSpacebar = false;

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

        $tilepaint.on( "mousedown", ( e ) => {
            if ( this.editor.canMapFunction() && this.editor.actions.mode !== Config.EditorActions.modes.ERASE ) {
                this.isMouseDownTiles = true;
                this.isMouseMovedTiles = false;

                const coords = [ Math.floor( e.offsetX / this.gridsize ), Math.floor( e.offsetY / this.gridsize ) ];
                const foundCoord = this.tilesetCoords.find( ( coord ) => coord[ 0 ] === coords[ 0 ] && coord[ 1 ] === coords[ 1 ] );

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
            if ( this.editor.canMapFunction() ) {
                if ( this.canApplyTiles() ) {
                    const coords = [ Math.floor( e.offsetX / this.gridsize ), Math.floor( e.offsetY / this.gridsize ) ];
                    const foundCoord = this.tilesetCoords.find( ( coord ) => coord[ 0 ] === coords[ 0 ] && coord[ 1 ] === coords[ 1 ] );
                    const sameCoord = coords[ 0 ] === this.currentTileCoord[ 0 ] && coords[ 1 ] === this.currentTileCoord[ 1 ];

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

        $tilepaint.on( "mouseup", ( e ) => {
            this.currentTileCoord = null;
            this.isMouseDownTiles = false;
            this.isMouseMovedTiles = false;
        });

        $collider.on( "mousedown", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                this.isMouseDownCollider = true;
            }
        });

        $collider.on( "mousemove", ( e ) => {
            if ( !this.map ) {
                return;
            }

            // Need to use this.scale?
            const coords = [ Math.floor( e.offsetX / this.map.collider ), Math.floor( e.offsetY / this.map.collider ) ];

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

        $collider.on( "mouseup", ( e ) => {
            this.isMouseDownCollider = false;
        });

        $collider.on( "mouseout", () => {
            this.dom.moveCoords.innerHTML = "( X, Y )";
        });

        $mapgrid.on( "mousedown", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                this.isMouseDownCanvas = true;
            }
        });

        $mapgrid.on( "mousemove", ( e ) => {
            if ( !this.map ) {
                return;
            }

            // Need to use this.scale?
            const coords = [ Math.floor( e.offsetX / this.map.tilesize ), Math.floor( e.offsetY / this.map.tilesize ) ];

            this.dom.moveCoords.innerHTML = `( ${coords[ 0 ]}, ${coords[ 1 ]} )`;

            this.canvases.cursor.style.opacity = 0.5;
            this.canvases.cursor.style.zIndex = 9999;
            this.canvases.cursor.style.webkitTransform = `translate3d(
                    ${coords[ 0 ] * this.map.tilesize}px,
                    ${coords[ 1 ] * this.map.tilesize}px,
                    0
                )
            `;

            if ( this.editor.canMapFunction() && this.isMouseDownCanvas ) {
                if ( this.canApplyLayer() ) {
                    this.applyLayer( this.editor.layers.mode, coords );
                }
            }
        });

        $mapgrid.on( "mouseup", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                // Need to use this.scale?
                const coords = [ Math.floor( e.offsetX / this.map.tilesize ), Math.floor( e.offsetY / this.map.tilesize ) ];

                if ( this.canApplyLayer() ) {
                    this.applyLayer( this.editor.layers.mode, coords );
                }
            }

            this.isMouseDownCanvas = false;
        });

        $mapgrid.on( "mouseout", () => {
            this.dom.moveCoords.innerHTML = "( X, Y )";

            this.canvases.cursor.style.opacity = 0;
            this.canvases.cursor.style.zIndex = -1;
            this.canvases.cursor.style.webkitTransform = `translate3d(
                    0,
                    0,
                    0
                )
            `;
        });
    }


    canApplyLayer () {
        return (
            this.tilesetCoords.length &&
            (this.editor.layers.mode === Config.EditorLayers.modes.BACKGROUND || this.editor.layers.mode === Config.EditorLayers.modes.FOREGROUND)
        ) || (
            this.editor.actions.mode === Config.EditorActions.modes.ERASE &&
            (this.editor.layers.mode === Config.EditorLayers.modes.BACKGROUND || this.editor.layers.mode === Config.EditorLayers.modes.FOREGROUND)
        );
    }


    canApplyCollider () {
        return (
            this.isMouseDownCollider &&
            this.editor.layers.mode === Config.EditorLayers.modes.COLLISION &&
            this.editor.actions.mode !== Config.EditorActions.modes.BUCKET
        );
    }


    canApplyTiles () {
        return (
            this.isMouseDownTiles &&
            this.editor.actions.mode !== Config.EditorActions.modes.ERASE &&
            this.editor.actions.mode !== Config.EditorActions.modes.BUCKET
        );
    }
}



module.exports = EditorCanvas;
