const Utils = require( "./Utils" );
const Loader = require( "./Loader" );
const Config = require( "./Config" );



/*
ctx.drawImage(
    img/cvs,
    mask-x,
    mask-y,
    mask-width,
    mask-height,
    x-position,
    y-position,
    width,
    height
)
*/
const drawTileCel = ( context, image, tileSize, gridSize, mx, my, px, py ) => {
    context.drawImage(
        image,
        mx,
        my,
        tileSize,
        tileSize,
        (px * gridSize),
        (py * gridSize),
        gridSize,
        gridSize
    );
};
const drawMapTile = ( context, image, tile, tileSize, gridSize, x, y ) => {
    let maskX = 0;
    let maskY = 0;

    // Position has tiles: Array[Array[x, y], Array[x, y]]
    if ( Array.isArray( tile ) ) {
        for ( let i = 0, len = tile.length; i < len; i++ ) {
            drawTileCel(
                context,
                image,
                tileSize,
                gridSize,
                tile[ i ][ 0 ],
                tile[ i ][ 1 ],
                x,
                y,
            );
        }

    // Position has no tile: 0
    } else {
        context.clearRect(
            (x * gridSize),
            (y * gridSize),
            gridSize,
            gridSize
        );
    }
};
const drawMapTiles = ( context, image, textures, tileSize, gridSize ) => {
    for ( let y = textures.length; y--; ) {
        const row = textures[ y ];

        for ( let x = row.length; x--; ) {
            const tile = row[ x ];

            drawMapTile( context, image, tile, tileSize, gridSize, x, y );
        }
    }
};



const drawGridLines = ( ctx, w, h, g ) => {
    ctx.globalAlpha = 1.0;

    for ( let y = 1; y < h; y++ ) {
        ctx.fillStyle = Config.colors.teal;
        ctx.fillRect( 0, (y * g), (g * w), 1 );
    }

    for ( let x = 1; x < w; x++ ) {
        ctx.fillStyle = Config.colors.teal;
        ctx.fillRect( (x * g), 0, 1, (g * h) );
    }
};



class ActiveTiles {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
        this.frame = 0;
        this.spliced = [];
    }


    destroy () {
        this.data = null;
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        this.frame = 0;

        if ( this.data.stepsX ) {
            const diff = (elapsed - this.previousElapsed);

            this.frame = Math.floor( (diff / this.data.dur) * this.data.stepsX );

            if ( diff >= this.data.dur ) {
                this.previousElapsed = elapsed;
                this.frame = this.data.stepsX - 1;
            }
        }
    }


    getTile () {
        return [
            (this.data.offsetX + (this.frame * this.map.data.tilesize)),
            this.data.offsetY,
        ];
    }


    canInteract () {
        return this.data.action;
    }


    canAttack () {
        return this.data.attack;
    }


    doInteract ( coords ) {
        for ( let i = this.data.coords.length; i--; ) {
            if ( this.data.coords[ i ][ 0 ] === coords[ 0 ] && this.data.coords[ i ][ 1 ] === coords[ 1 ] ) {
                this.spliced.push( this.data.coords[ i ] );
                this.data.coords.splice( i, 1 );
                break;
            }
        }
    }
}



class ActiveObject {
    constructor ( data, map ) {
        this.map = map;
        this.data = Utils.merge( map.gamebox.player.data.objects.find( ( obj ) => (obj.id === data.id) ), data );
        this.layer = this.data.layer;
        this.width = this.data.width;
        this.height = this.data.height;
        this.position = {
            x: this.data.coords[ 0 ][ 0 ] * this.map.gridsize,
            y: this.data.coords[ 0 ][ 1 ] * this.map.gridsize,
        };
        this.hitbox = {
            x: this.position.x + (this.data.hitbox.x / this.map.gamebox.camera.resolution),
            y: this.position.y + (this.data.hitbox.y / this.map.gamebox.camera.resolution),
            width: this.data.hitbox.width / this.map.gamebox.camera.resolution,
            height: this.data.hitbox.height / this.map.gamebox.camera.resolution,
        };
        this.states = Utils.copy( this.data.states );
        this.relative = (this.hitbox.height !== this.height);
        this.frame = 0;
        this.shift();
    }


    destroy () {
        this.data = null;
    }


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();
        }
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        this.frame = 0;

        if ( this.state.stepsX ) {
            const diff = (elapsed - this.previousElapsed);

            this.frame = Math.floor( (diff / this.state.dur) * this.state.stepsX );

            if ( diff >= this.state.dur ) {
                this.previousElapsed = elapsed;
                this.frame = this.state.stepsX - 1;
            }
        }

        if ( this.relative ) {
            if ( this.hitbox.y > this.map.gamebox.hero.hitbox.y ) {
                this.layer = "foreground";

            } else {
                this.layer = "background";
            }
        }
    }


    getTile ( coords ) {
        const offsetX = (this.state.offsetX + (this.frame * this.width));

        return [
            offsetX + ((coords[ 0 ] - this.data.coords[ 0 ][ 0 ]) * this.map.data.tilesize),
            this.state.offsetY + ((coords[ 1 ] - this.data.coords[ 0 ][ 1 ]) * this.map.data.tilesize),
        ];
    }


    payload () {
        if ( this.data.payload.dialogue ) {
            this.map.gamebox.dialogue.play( this.data.payload.dialogue );
        }
    }


    canInteract ( dir ) {
        return (this.state.action && this.state.action.require && this.state.action.require.dir && dir === this.state.action.require.dir);
    }


    doInteract ( dir ) {
        if ( this.data.payload ) {
            this.payload();
        }

        if ( this.state.action.shift ) {
            this.shift();
        }
    }
}



class MapLayer {
    // id, width, height
    constructor ( data ) {
        this.data = data;
        this.build();
    }


    build () {
        this.canvas = document.createElement( "canvas" );
        this.canvas.className = "_2dk__layer";
        this.canvas.dataset.layer = this.data.id;
        this.context = this.canvas.getContext( "2d" );
        this.update( this.data.width, this.data.height );
    }


    update ( width, height ) {
        this.data.width = width;
        this.data.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.width = width;
        this.canvas.height = height;
    }


    clear () {
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }


    destroy () {
        this.clear();
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.context = null;
        this.canvas = null;
    }
}



class Map {
    constructor ( data, gamebox ) {
        this.data = data;
        this.gamebox = gamebox;
        this.width = this.data.width / this.gamebox.camera.resolution;
        this.height = this.data.height / this.gamebox.camera.resolution;
        this.gridsize = this.data.tilesize / this.gamebox.camera.resolution;
        this.image = Loader.cash( data.image );
        this.layers = {
            background: null,
            foreground: null,
        };
        this.activeTiles = [];
        this.activeObjects = [];
        this.offset = {
            x: 0,
            y: 0
        };
        this.build();
    }


    destroy () {
        for ( let id in this.layers ) {
            this.layers[ id ].onCanvas.destroy();
            this.layers[ id ].offCanvas.destroy();
        }

        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.destroy();
        });
        this.activeTiles = null;

        this.activeObjects.forEach(( activeObject ) => {
            activeObject.destroy();
        });
        this.activeObjects = null;

        this.element.parentNode.removeChild( this.element );
        this.data = null;
        this.element = null;
        this.image = null;
        this.layers = null;
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__map";

        for ( let id in this.layers ) {
            this.addLayer( id );
        }

        this.data.tiles.forEach(( data ) => {
            this.activeTiles.push( new ActiveTiles( data, this ) );
        });

        this.data.objects.forEach(( data ) => {
            this.activeObjects.push( new ActiveObject( data, this ) );
        });
    }


    update ( offset ) {
        this.offset = offset;
    }


    getRenderbox ( elapsed, camera ) {
        const renderBox = {
            x: Math.floor( camera.x / this.gridsize ) - 1,
            y: Math.floor( camera.y / this.gridsize ) - 1,
            width: camera.width + (this.gridsize * 2),
            height: camera.height + (this.gridsize * 2),
            bleed: {},
            textures: {},
        };

        renderBox.bleed = this.getBleed( renderBox, elapsed, camera );
        renderBox.textures = this.getTextures( renderBox, elapsed, camera );

        return renderBox;
    }


    getBleed ( renderBox, elapsed, camera ) {
        return {
            x: -(camera.x - (renderBox.x * this.gridsize)),
            y: -(camera.y - (renderBox.y * this.gridsize)),
        };
    }


    getTextures ( renderBox, elapsed, camera ) {
        let ret = {};

        for ( let id in this.data.textures ) {
            ret[ id ] = [];

            const height = (renderBox.height / this.gridsize);
            let y = 0;

            while ( y < height ) {
                ret[ id ][ y ] = [];

                const lookupY = renderBox.y + y;

                if ( this.data.textures[ id ][ lookupY ] ) {
                    const width = (renderBox.width / this.gridsize);
                    let x = 0;

                    while ( x < width ) {
                        const lookupX = renderBox.x + x;
                        const activeObject = this.getActiveObject( id, lookupX, lookupY );

                        if ( this.data.textures[ id ][ lookupY ][ lookupX ] ) {
                            const celsCopy = Utils.copy( this.data.textures[ id ][ lookupY ][ lookupX ] );
                            const activeTile = this.getActiveTile( id, [lookupX, lookupY], celsCopy );

                            // Render the textures
                            ret[ id ][ y ][ x ] = celsCopy;

                            // Push any ActiveTiles to the cel stack
                            if ( activeTile ) {
                                ret[ id ][ y ][ x ].push( activeTile );
                            }

                            // Push any ActiveObject tiles to the cel stack
                            if ( activeObject ) {
                                ret[ id ][ y ][ x ].push( activeObject );
                            }

                        } else {
                            // ActiveObject tiles can move between background and foreground
                            ret[ id ][ y ][ x ] = activeObject ? [activeObject] : 0;
                        }

                        x++;
                    }
                }

                y++;
            }
        }

        return ret;
    }


    getActiveTiles ( group ) {
        return this.activeTiles.find(( activeTiles ) => {
            return (activeTiles.data.group === group);
        });
    }


    getActiveTile ( layer, celsCoords, celsCopy ) {
        let ret = null;

        // Either return a tile or don't if it's a static thing...

        loopTiles:
            for ( let i = this.data.tiles.length; i--; ) {
                const tiles = this.data.tiles[ i ];

                // Skip if not even the right layer to begin with...
                if ( layer !== tiles.layer ) {
                    continue;
                }

                const topCel = celsCopy[ celsCopy.length - 1 ];

                if ( tiles.coords.length ) {
                    loopCoords:
                        for ( let j = tiles.coords.length; j--; ) {
                            const coord = tiles.coords[ j ];

                            // Correct tile coords
                            if ( coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ] ) {
                                // (tiles.offsetX === topCel[ 0 ] && tiles.offsetY === topCel[ 1 ])
                                const isTileAnimated = tiles.stepsX;

                                // Make sure we don't dupe a tile match if it's NOT animated...
                                if ( isTileAnimated ) {
                                    ret = this.getActiveTiles( tiles.group ).getTile();
                                    break loopTiles;
                                }
                            }
                        }
                }

                if ( tiles.offsetX === topCel[ 0 ] && tiles.offsetY === topCel[ 1 ] ) {
                    // Check if tile is pushed...
                    const isTilePushed = tiles.coords.find(( coord ) => {
                        return (coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ]);
                    });
                    const isTileSpliced = this.getActiveTiles( tiles.group ).spliced.find(( coord ) => {
                        return (coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ]);
                    });

                    // Push the tile to the coords Array...
                    // This lets us generate ActiveTile groups that will
                    // find their coordinates in real-time using background-position...
                    /* Example: This will find stairs tiles and push them into the coords stack...
                        {
                            "group": "stairs",
                            "layer": "background",
                            "coords": [],
                            "offsetX": 256,
                            "offsetY": 384
                        }
                    */
                    if ( !isTilePushed && !isTileSpliced ) {
                        tiles.coords.push( celsCoords );
                        break loopTiles;

                    } else if ( isTileSpliced ) {
                        celsCopy.pop();
                        ret = celsCopy;
                    }
                }
            }

        return ret;
    }


    getActiveObject ( layer, lookupX, lookupY ) {
        let ret = null;

        this.activeObjects.forEach(( activeObject ) => {
            // Correct render layer AND correct tile coords
            if ( layer === activeObject.layer ) {
                activeObject.data.coords.forEach(( coord ) => {
                    if ( coord[ 0 ] === lookupX && coord[ 1 ] === lookupY ) {
                        ret = activeObject.getTile( coord );
                    }
                });
            }
        });

        return ret;
    }


    render ( elapsed, camera ) {
        this.clear();

        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.blit( elapsed );
        });

        this.activeObjects.forEach(( activeObject ) => {
            activeObject.blit( elapsed );
        });

        this.renderBox = this.getRenderbox( elapsed, camera );

        for ( let id in this.layers ) {
            // Draw textures to background / foreground
            drawMapTiles(
                this.layers[ id ].offCanvas.context,
                this.image,
                this.renderBox.textures[ id ],
                this.data.tilesize,
                this.gridsize,
            );

            // Draw offscreen canvases to the onscreen canvases
            this.layers[ id ].onCanvas.context.drawImage(
                this.layers[ id ].offCanvas.canvas,
                0,
                0,
                this.layers[ id ].offCanvas.canvas.width,
                this.layers[ id ].offCanvas.canvas.height,
                this.renderBox.bleed.x,
                this.renderBox.bleed.y,
                this.layers[ id ].offCanvas.canvas.width,
                this.layers[ id ].offCanvas.canvas.height,
            );
        }
    }


    clear () {
        for ( let id in this.layers ) {
            this.layers[ id ].onCanvas.clear();
            this.layers[ id ].offCanvas.clear();
        }
    }


    addLayer ( id ) {
        const offWidth = this.gamebox.camera.width + (this.gridsize * 2);
        const offHeight = this.gamebox.camera.height + (this.gridsize * 2);

        this.layers[ id ] = {};
        this.layers[ id ].onCanvas = new MapLayer({
            id,
            map: this,
            width: this.gamebox.camera.width,
            height: this.gamebox.camera.height,
        });
        this.layers[ id ].offCanvas = new MapLayer({
            id,
            map: this,
            width: offWidth,
            height: offHeight,
        });

        this.element.appendChild( this.layers[ id ].onCanvas.canvas );
    }
}



module.exports = {
    Map,
    MapLayer,
    drawTileCel,
    drawMapTile,
    drawMapTiles,
    drawGridLines,
};
