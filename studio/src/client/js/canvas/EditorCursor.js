const Config = require( "../Config" );


class EditorCursor {
    constructor ( editorCanvas ) {
        this.editor = editorCanvas.editor;
        this.editorCanvas = editorCanvas;
        
        this.cursors = {
            dom: document.getElementById( "editor-cursor-box" ), 
            canvas: document.getElementById( "editor-cursor-canvas" ),
        };
    }


    update ( map ) {
        this.map = map;
        this.cursors.canvas.width = this.map.tilesize;
        this.cursors.canvas.height = this.map.tilesize;
        this.cursors.canvas.style.width = `${this.map.tilesize}px`;
        this.cursors.canvas.style.height = `${this.map.tilesize}px`;
    }


    reset () {
        this.editorCanvas.clearCanvas( this.cursors.canvas );
        this.cursors.canvas.width = this.map.tilesize;
        this.cursors.canvas.height = this.map.tilesize;
        this.cursors.canvas.style.width = `${this.map.tilesize}px`;
        this.cursors.canvas.style.height = `${this.map.tilesize}px`;

        this.hideCanvasCursor();
        this.hideBlockCursor();
    }


    getCursorOffsetCoords ( coords, obj ) {
        let x = coords[ 0 ];
        let y = coords[ 1 ];

        const midX = this.map.tilesize / 2;
        const midY = this.map.tilesize / 2;
        const mouseX = this.editorCanvas.canvasMouseCoords.x;
        const mouseY = this.editorCanvas.canvasMouseCoords.y;

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


    showCanvasCursor ( coords, objectOrNPC ) {
        // Default to the tile grid
        let x = coords[ 0 ] * this.map.tilesize;
        let y = coords[ 1 ] * this.map.tilesize;

        if ( objectOrNPC ) {
            const isNPC = this.editor.layers.mode === Config.EditorLayers.modes.NPC;
            
            // NPCs don't need to be locked to the tile grid
            if ( isNPC && !this.editorCanvas.dom.snapNPCToGrid.checked ) {
                x = this.editorCanvas.canvasMouseCoords.x;
                y = this.editorCanvas.canvasMouseCoords.y;

            // Objects will be locked to the tile grid
            } else {
                const offsetCoords = this.getCursorOffsetCoords( coords, objectOrNPC );
                x = offsetCoords[ 0 ] * this.map.tilesize;
                y = offsetCoords[ 1 ] * this.map.tilesize;
            }
        }

        this.cursors.canvas.style.setProperty( "--z", 5 );
        this.cursors.canvas.style.setProperty( "--o", 0.5 );
        this.cursors.canvas.style.setProperty( "--x", `${x}px` );
        this.cursors.canvas.style.setProperty( "--y", `${y}px` );
    }


    hideCanvasCursor () {
        this.cursors.canvas.style.removeProperty( "--z" );
        this.cursors.canvas.style.removeProperty( "--o" );
        this.cursors.canvas.style.removeProperty( "--x" );
        this.cursors.canvas.style.removeProperty( "--y" );
    }


    removeHitEvent () {
        document.querySelectorAll( ".js-event-tile.is-hit" ).forEach( ( tile ) => {
            tile.classList.remove( "is-hit" );
        });
    }


    removeHitSpawn () {
        document.querySelectorAll( ".js-spawn-tile.is-hit" ).forEach( ( tile ) => {
            tile.classList.remove( "is-hit" );
        });
    }


    removeHitTile () {
        document.querySelectorAll( ".js-active-tile.is-hit" ).forEach( ( tile ) => {
            tile.classList.remove( "is-hit" );
        });
    }


    enterEraseMode ( id ) {
        const dom = document.getElementById( id );
        dom.classList.add( "is-hit" );
        this.cursors.dom.classList.add( "is-hidden" );
        this.editorCanvas.draggable.canvasPane.classList.add( "is-erase-tool" );
    }


    exitEraseMode () {
        this.cursors.dom.classList.remove( "is-hidden" );
        this.editorCanvas.draggable.canvasPane.classList.remove( "is-erase-tool" );
    }


    showEventCursor ( coords ) {
        const hitEvent = this.editorCanvas.getHitEvent();

        this.removeHitEvent();

        if ( hitEvent ) {
            this.enterEraseMode( `event-x${hitEvent.coords[ 0 ]}-y${hitEvent.coords[ 1 ]}` );

        } else {
            this.exitEraseMode();
        }

        this.cursors.dom.style.setProperty( "--z", 5 );
        this.cursors.dom.style.setProperty( "--o", 1 );
        this.cursors.dom.style.setProperty( "--x", `${coords[ 0 ] * this.map.tilesize}px` );
        this.cursors.dom.style.setProperty( "--y", `${coords[ 1 ] * this.map.tilesize}px` );
        this.cursors.dom.style.setProperty( "--w", `${this.map.tilesize}px` );
        this.cursors.dom.style.setProperty( "--h", `${this.map.tilesize}px` );
        this.cursors.dom.classList.add( "editor__block", "is-event" );
        this.cursors.dom.innerHTML = window.feather.icons.clock.toSvg();
    }


    showTilesCursor ( coords ) {
        const hitTile = this.editorCanvas.getHitTile( coords );

        this.removeHitTile();

        if ( hitTile ) {
            this.enterEraseMode( `tile-x${hitTile.coords[ 0 ]}-y${hitTile.coords[ 1 ]}` );

        } else {
            this.exitEraseMode();
        }

        this.cursors.dom.style.setProperty( "--z", 5 );
        this.cursors.dom.style.setProperty( "--o", 1 );
        this.cursors.dom.style.setProperty( "--x", `${coords[ 0 ] * this.map.tilesize}px` );
        this.cursors.dom.style.setProperty( "--y", `${coords[ 1 ] * this.map.tilesize}px` );
        this.cursors.dom.style.setProperty( "--w", `${this.map.tilesize}px` );
        this.cursors.dom.style.setProperty( "--h", `${this.map.tilesize}px` );
        this.cursors.dom.classList.add( "editor__block", "is-tiles" );
        this.cursors.dom.innerHTML = window.feather.icons.activity.toSvg();
    }


    showSpawnCursor ( coords ) {
        const hitSpawn = this.editorCanvas.getHitSpawn();
        const newSpawn = this.editorCanvas.getNewSpawn();

        this.removeHitSpawn();

        if ( hitSpawn ) {
            this.enterEraseMode( `spawn-x${hitSpawn.x}-y${hitSpawn.y}` );

        } else {
            this.exitEraseMode();
        }

        this.cursors.dom.style.setProperty( "--z", 5 );
        this.cursors.dom.style.setProperty( "--o", 1 );
        this.cursors.dom.style.setProperty( "--x", `${newSpawn.x}px` );
        this.cursors.dom.style.setProperty( "--y", `${newSpawn.y}px` );
        this.cursors.dom.style.setProperty( "--w", `${newSpawn.width}px` );
        this.cursors.dom.style.setProperty( "--h", `${newSpawn.height}px` );
        this.cursors.dom.innerHTML = window.feather.icons[ "map-pin" ].toSvg();
        this.cursors.dom.classList.add( "editor__block", "is-spawn" );
    }



    hideBlockCursor () {
        this.cursors.dom.style.removeProperty( "--z" );
        this.cursors.dom.style.removeProperty( "--o" );
        this.cursors.dom.style.removeProperty( "--x" );
        this.cursors.dom.style.removeProperty( "--y" );
        this.cursors.dom.style.removeProperty( "--w" );
        this.cursors.dom.style.removeProperty( "--h" );
        this.cursors.dom.classList.remove( "editor__block", "is-spawn", "is-event", "is-tiles", "is-hidden" );
        this.cursors.dom.innerHTML = "";
    }


    applyCursor () {
        const ctx = this.cursors.canvas.getContext( "2d" );
        const coordMap = this.editorCanvas.getCoordMap();
        const width = coordMap.width * this.map.tilesize;
        const height = coordMap.height * this.map.tilesize;

        this.editorCanvas.clearCanvas( this.cursors.canvas );

        this.cursors.canvas.width = width;
        this.cursors.canvas.height = height;
        this.cursors.canvas.style.width = `${width}px`;
        this.cursors.canvas.style.height = `${height}px`;

        coordMap.tiles.forEach( ( tile ) => {
            if ( tile.paintTile ) {
                ctx.drawImage(
                    this.editorCanvas.dom.tileset,
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
        this._applyCursorObjectOrNPC( this.editorCanvas.currentNPC );
    }


    applyCursorObject () {
        this._applyCursorObjectOrNPC( this.editorCanvas.currentObject );
    }


    _applyCursorObjectOrNPC ( objOrNPC ) {
        const isNPC = this.editor.layers.mode === Config.EditorLayers.modes.NPC;
        const ctx = this.cursors.canvas.getContext( "2d" );
        const width = objOrNPC.width;
        const height = objOrNPC.height;

        let offsetX = objOrNPC.offsetX;
        let offsetY = objOrNPC.offsetY;

        if ( isNPC ) {
            const state = objOrNPC.states[ 0 ];
            offsetX = objOrNPC.verbs[ state.verb ][ state.dir ].offsetX;
            offsetY = objOrNPC.verbs[ state.verb ][ state.dir ].offsetY;
        }

        this.cursors.canvas.width = width;
        this.cursors.canvas.height = height;
        this.cursors.canvas.style.width = `${width}px`;
        this.cursors.canvas.style.height = `${height}px`;

        ctx.drawImage(
            this.editorCanvas.assets[ objOrNPC.image ],
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
}

module.exports = EditorCursor;