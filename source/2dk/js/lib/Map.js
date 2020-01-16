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
    }


    destroy () {
        this.data = null;
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        const diff = (elapsed - this.previousElapsed);

        this.frame = Math.floor( (diff / this.data.dur) * this.data.stepsX );

        if ( diff >= this.data.dur ) {
            this.previousElapsed = elapsed;
            this.frame = this.data.stepsX - 1;
        }
    }


    getTile () {
        return [
            [
                (this.data.offsetX + (this.frame * this.map.data.tilesize)),
                this.data.offsetY,
            ]
        ];
    }
}



class ActiveObject {
    constructor ( data, map ) {
        this.map = map;
        this.data = Utils.merge( map.gamebox.player.data.objects.find( ( obj ) => (obj.id === data.id) ), data );
        this.image = new Image();
        this.image.src = this.data.image;
        this.position = {
            x: this.data.spawn.x / this.map.gamebox.camera.resolution,
            y: this.data.spawn.y / this.map.gamebox.camera.resolution,
        };
        this.hitbox = {
            x: !this.data.boxes ? 0 : this.position.x + (this.data.boxes.hit.x / this.map.gamebox.camera.resolution),
            y: !this.data.boxes ? 0 : this.position.y + (this.data.boxes.hit.y / this.map.gamebox.camera.resolution),
            width: !this.data.boxes ? 0 : (this.data.boxes.hit.width / this.map.gamebox.camera.resolution),
            height: !this.data.boxes ? 0 : (this.data.boxes.hit.height / this.map.gamebox.camera.resolution),
        };
        // Copy so we can cooldown and re-spawn objects with fresh states
        this.states = Utils.copy( this.data.states );
        // Render between "objects" and "foreground" layers relative to Hero
        this.relative = (this.hitbox.height !== this.data.height);
        this.frame = 0;

        this.shift();
    }


    destroy () {
        this.data = null;
        this.image = null;
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        this.frame = 0;

        if ( this.state.animated ) {
            const diff = (elapsed - this.previousElapsed);

            this.frame = Math.floor( (diff / this.state.dur) * this.state.stepsX );

            if ( diff >= this.state.dur ) {
                this.previousElapsed = elapsed;
                this.frame = this.state.stepsX - 1;
            }
        }
    }


    render ( renderBox ) {
        const offsetX = (this.state.offsetX + (this.frame * this.data.width));
        let context = this.map.layers.background.offCanvas.context;

        if ( this.relative && (this.hitbox.y > this.map.gamebox.hero.hitbox.y) ) {
            context = this.map.layers.foreground.offCanvas.context;
        }

        context.drawImage(
            this.image,
            offsetX,
            this.state.offsetY,
            this.data.width,
            this.data.height,
            (renderBox.bleed.x + this.map.offset.x) + this.position.x,
            (renderBox.bleed.y + this.map.offset.y) + this.position.y,
            this.data.width / this.map.gamebox.camera.resolution,
            this.data.height / this.map.gamebox.camera.resolution,
        );
    }


    payload () {
        if ( this.state.action.payload.dialogue ) {
            this.map.gamebox.dialogue.play( this.state.action.payload.dialogue );
        }
    }


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();
        }
    }


    canInteract ( dir ) {
        return (this.state.action && this.state.action.require && this.state.action.require.dir && dir === this.state.action.require.dir);
    }


    doInteract ( dir ) {
        if ( this.state.action.payload ) {
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

        // this.activeObjects.forEach(( activeObject ) => {
        //     activeObject.destroy();
        // });
        // this.activeObjects = null;

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

        // this.data.objects.forEach(( data ) => {
        //     this.activeObjects.push( new ActiveObject( data, this ) );
        // });
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
                        const activeTile = this.getActiveTile( lookupX, lookupY );

                        if ( this.data.textures[ id ][ lookupY ][ lookupX ] ) {
                            // Either draw the texture or the correct frame for an ActiveTile
                            ret[ id ][ y ][ x ] = activeTile || this.data.textures[ id ][ lookupY ][ lookupX ];

                        } else {
                            ret[ id ][ y ][ x ] = 0;
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


    getActiveTile ( lookupX, lookupY ) {
        let ret = null;

        this.data.tiles.forEach(( tiles ) => {
            tiles.coords.forEach(( coord ) => {
                if ( coord[ 0 ] === lookupX && coord[ 1 ] === lookupY ) {
                    ret = this.getActiveTiles( tiles.group ).getTile();
                }
            });
        });

        return ret;
    }


    render ( elapsed, camera ) {
        this.clear();

        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.blit( elapsed );
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
