const EditorUtils = require( "./EditorUtils" );
const Config = require( "./Config" );
const Cache = require( "./Cache" );
const $ = require( "../../node_modules/properjs-hobo/dist/hobo.build" );
const { MapLayer, drawMapTiles, drawGridLines } = require( "../../../source/2dk/js/lib/Map" );
const Loader = require( "../../../source/2dk/js/lib/Loader" );



const renderTile = ( ctx, x, y, w, h ) => {
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = Config.colors.teal;
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
        this.isSpacebar = false;
        this.isMouseDownTiles = false;
        this.isMouseMovedTiles = false;
        this.isMouseDownCanvas = false;
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
            collision: document.getElementById( "editor-collision" ),
            mapgrid: document.getElementById( "editor-grid" ),
        };
        this.contexts = {
            background: null,
            foreground: null,
        };
        this.canvases = {
            mapgrid: document.getElementById( "editor-mapgrid-canvas" ),
            tilegrid: document.getElementById( "editor-tilegrid-canvas" ),
            tilepaint: document.getElementById( "editor-tilepaint-canvas" ),
            preview: document.getElementById( "editor-preview-canvas" ),
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


    setMode ( mode ) {
        this.mode = mode;
    }


    getMode () {
        return this.mode;
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
                onDragStart: () => {
                    this.isDraggableAlive = true;
                    this.dom.$canvasPane.addClass( "is-dragging" );
                },
                onThrowComplete: () => {
                    this.isMouseDownCanvas = false;
                    this.isDraggableAlive = false;
                    this.dom.$canvasPane.removeClass( "is-dragging" );

                    if ( !this.isSpacebar ) {
                        this.draggable.disable();
                    }
                }
            }

        )[ 0 ];
    }


    reset () {
        if ( this.map ) {
            this.clear( this.canvases.mapgrid.getContext( "2d" ) );
            this.clear( this.canvases.tilegrid.getContext( "2d" ) );
            this.clearTileset();
            this.resetPreview();

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
            this.dom.tileset.src = "";
            this.layers.background.innerHTML = "";
            this.layers.foreground.innerHTML = "";
            this.layers.collision.innerHTML = "";
        }
    }


    loadMap ( map ) {
        this.map = map;

        // Empty tileset tiles
        this.tilesetCoords = [];

        // Clean up last map in DOM
        this.layers.background.innerHTML = "";
        this.layers.foreground.innerHTML = "";
        this.layers.collision.innerHTML = "";

        // Create new map layers
        this.contexts.background = new MapLayer({
            id: "background",
            width: this.map.width,
            height: this.map.height
        });
        this.contexts.foreground = new MapLayer({
            id: "foreground",
            width: this.map.width,
            height: this.map.height
        });

        this.layers.background.appendChild( this.contexts.background.canvas );
        this.layers.foreground.appendChild( this.contexts.foreground.canvas );

        this.canvases.mapgrid.width = this.map.width;
        this.canvases.mapgrid.height = this.map.height;
        this.canvases.mapgrid.style.width = `${this.map.width}px`;
        this.canvases.mapgrid.style.height = `${this.map.height}px`;

        this.dom.canvasPane.style.width = `${this.map.width}px`;
        this.dom.canvasPane.style.height = `${this.map.height}px`;

        this.draggable.update({
            applyBounds: true
        });

        // Load the tileset
        this.loader.loadImg( `.${this.map.image}` ).then(( img ) => {
            this.addTileset( img );
            this.addCanvas();
        });
    }


    hide ( l ) {
        $( this.layers[ l ] ).addClass( "is-hidden" );
    }


    show ( l ) {
        $( this.layers[ l ] ).removeClass( "is-hidden" );
    }


    clear ( ctx ) {
        ctx.clearRect(
            0,
            0,
            this.map.width,
            this.map.height
        );
    }


    setTileboxBounds () {
        const boxBounds = this.dom.tilebox.getBoundingClientRect();

        this.dom.tilebox.style.height = `${window.innerHeight - boxBounds.y - 16}px`;
    }


    addTileset ( img ) {
        const width = img.naturalWidth / this.map.resolution;
        const height = img.naturalHeight / this.map.resolution;

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
        this.canvases.preview.style.width = `${this.map.gridsize}px`;
        this.canvases.preview.style.height = `${this.map.gridsize}px`;

        this.clear( this.canvases.tilepaint.getContext( "2d" ) );
        this.clear( this.canvases.tilegrid.getContext( "2d" ) );

        drawGridLines(
            this.canvases.tilegrid.getContext( "2d" ),
            this.canvases.tilegrid.width,
            this.canvases.tilegrid.height,
            this.map.gridsize
        );
    }


    addCanvas () {
        this.clear( this.contexts.background.context );
        this.clear( this.contexts.foreground.context );
        this.clear( this.canvases.mapgrid.getContext( "2d" ) );

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
            this.map.tilesize
        );
        drawMapTiles(
            this.contexts.foreground.context,
            this.dom.tileset,
            this.map.textures.foreground,
            this.map.tilesize
        );
    }


    setActiveTiles ( bool ) {
        if ( bool ) {
            this.dom.$canvasPane.addClass( "is-active-tiles" );

        } else {
            this.dom.$canvasPane.removeClass( "is-active-tiles" );
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


    refresh ( layer ) {
        this.clear( this.contexts[ layer ].context );

        drawMapTiles(
            this.contexts[ layer ].context,
            this.dom.tileset,
            this.map.textures[ layer ],
            this.map.tilesize
        );
    }


    clearTile ( coord ) {
        clearTile(
            this.canvases.tilepaint.getContext( "2d" ),
            coord[ 0 ] * this.map.gridsize,
            coord[ 1 ] * this.map.gridsize,
            this.map.gridsize,
            this.map.gridsize
        );
    }


    clearTileset () {
        this.tilesetCoords.forEach(( coord ) => {
            clearTile(
                this.canvases.tilepaint.getContext( "2d" ),
                coord[ 0 ] * this.map.gridsize,
                coord[ 1 ] * this.map.gridsize,
                this.map.gridsize,
                this.map.gridsize
            );
        });

        this.tilesetCoords = [];

        this.resetPreview();
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
        this.canvases.preview.style.width = `${this.map.gridsize}px`;
        this.canvases.preview.style.height = `${this.map.gridsize}px`;
    }


    applyPreview () {
        const ctx = this.canvases.preview.getContext( "2d" );
        const coordMap = this.getCoordMap();
        const width = coordMap.width * this.map.gridsize;
        const height = coordMap.height * this.map.gridsize;

        ctx.clearRect(
            0,
            0,
            this.canvases.preview.width,
            this.canvases.preview.width
        );

        this.canvases.preview.width = width * this.map.resolution;
        this.canvases.preview.height = height * this.map.resolution;
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


    applyTile ( coord ) {
        renderTile(
            this.canvases.tilepaint.getContext( "2d" ),
            coord[ 0 ] * this.map.gridsize,
            coord[ 1 ] * this.map.gridsize,
            this.map.gridsize,
            this.map.gridsize
        );
    }


    applyLayer ( layer, coords ) {
        if ( this.editor.actions.getMode() === Config.EditorActions.modes.BRUSH ) {
            this.brush( layer, coords );

        } else if ( editor.actions.getMode() === Config.EditorActions.modes.BUCKET ) {
            this.bucket( layer, coords );

        } else if ( editor.actions.getMode() === Config.EditorActions.modes.TRASH ) {
            this.trash( layer, coords );
        }

        this.refresh( layer );
    }


    bindEvents () {
        const $document = $( document );
        const $tilepaint = $( this.canvases.tilepaint );
        const $mapgrid = $( this.canvases.mapgrid );

        $document.on( "keydown", ( e ) => {
            const activeMenu = $( ".js-menu.is-active" );

            if ( activeMenu.length ) {
                return;
            }

            this.isSpacebar = (e.which === 32);

            if ( this.isSpacebar ) {
                this.editor.blurSelectMenus();
            }

            if ( this.editor.getMode() !== Config.Editor.modes.SAVING && (this.isSpacebar && this.mode !== Config.EditorCanvas.modes.DRAG) ) {
                e.preventDefault();

                this.draggable.enable();

                this.mode = Config.EditorCanvas.modes.DRAG;

                this.dom.$canvasPane.addClass( "is-drag" );
            }
        });

        $document.on( "keyup", ( e ) => {
            this.isSpacebar = false;

            if ( !this.isSpacebar && !this.isDraggableAlive ) {
                this.draggable.disable();
            }

            if ( this.editor.getMode() !== Config.Editor.modes.SAVING && this.mode === Config.EditorCanvas.modes.DRAG ) {
                e.preventDefault();

                this.mode = null;

                this.dom.$canvasPane.removeClass( "is-drag is-dragging" );
            }
        });

        $document.on( "mouseup", () => {
            this.isMouseDownCanvas = false;
        });

        $tilepaint.on( "mousedown", ( e ) => {
            if ( this.editor.canMapFunction() && this.editor.actions.getMode() !== Config.EditorActions.modes.TRASH ) {
                this.isMouseDownTiles = true;
                this.isMouseMovedTiles = false;

                const coords = [ Math.floor( e.offsetX / this.map.gridsize ), Math.floor( e.offsetY / this.map.gridsize ) ];
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

                } else {
                    this.resetPreview();
                }

                this.currentTileCoord = coords;
            }
        });

        $tilepaint.on( "mousemove", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                if ( this.canApplyTiles() ) {
                    const coords = [ Math.floor( e.offsetX / this.map.gridsize ), Math.floor( e.offsetY / this.map.gridsize ) ];
                    const foundCoord = this.tilesetCoords.find( ( coord ) => coord[ 0 ] === coords[ 0 ] && coord[ 1 ] === coords[ 1 ] );
                    const sameCoord = coords[ 0 ] === this.currentTileCoord[ 0 ] && coords[ 1 ] === this.currentTileCoord[ 1 ];

                    if ( !foundCoord && !sameCoord ) {
                        this.applyTile( coords );
                        this.pushCoords( coords );
                    }

                    if ( this.tilesetCoords.length ) {
                        this.applyPreview();

                    } else {
                        this.resetPreview();
                    }
                }
            }
        });

        $tilepaint.on( "mouseup", ( e ) => {
            this.currentTileCoord = null;
            this.isMouseDownTiles = false;
            this.isMouseMovedTiles = false;
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

            const coords = [ Math.floor( e.offsetX / this.map.tilesize ), Math.floor( e.offsetY / this.map.tilesize ) ];

            this.dom.moveCoords.innerHTML = `( ${coords[ 0 ]}, ${coords[ 1 ]} )`;

            if ( this.editor.canMapFunction() && this.isMouseDownCanvas ) {
                if ( this.canApplyLayer() ) {
                    this.applyLayer( this.editor.layers.getMode(), coords );
                }
            }
        });

        $mapgrid.on( "mouseup", ( e ) => {
            if ( this.editor.canMapFunction() ) {
                const coords = [ Math.floor( e.offsetX / this.map.tilesize ), Math.floor( e.offsetY / this.map.tilesize ) ];

                if ( this.canApplyLayer() ) {
                    this.applyLayer( this.editor.layers.getMode(), coords );
                }
            }

            this.isMouseDownCanvas = false;
        });

        $mapgrid.on( "mouseout", () => {
            this.dom.moveCoords.innerHTML = "( X, Y )";
        });
    }


    canApplyTiles () {
        return (
            this.isMouseDownTiles &&
            this.editor.actions.getMode() !== Config.EditorActions.modes.TRASH &&
            this.editor.actions.getMode() !== Config.EditorActions.modes.BUCKET
        );
    }


    canApplyLayer () {
        return (
            this.tilesetCoords.length &&
            (this.editor.layers.getMode() === Config.EditorLayers.modes.BACKGROUND || this.editor.layers.getMode() === Config.EditorLayers.modes.FOREGROUND)
        ) || (
            this.editor.actions.getMode() === Config.EditorActions.modes.TRASH &&
            (this.editor.layers.getMode() === Config.EditorLayers.modes.BACKGROUND || this.editor.layers.getMode() === Config.EditorLayers.modes.FOREGROUND)
        );
    }
}



module.exports = EditorCanvas;
