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
const drawMapTiles = ( ctx, img, data, grid ) => {
    const draw = ( mx, my, x, y ) => {
        ctx.drawImage(
            img,
            mx,
            my,
            grid,
            grid,
            (x * grid),
            (y * grid),
            grid,
            grid
        );
    };

    for ( let y = data.length; y--; ) {
        const row = data[ y ];

        for ( let x = row.length; x--; ) {
            const tile = row[ x ];
            let maskX = 0;
            let maskY = 0;

            if ( Array.isArray( tile ) ) {
                maskX = tile[ 0 ];
                maskY = tile[ 1 ];

                if ( Array.isArray( maskX ) ) {
                    for ( let i = 0, len = tile.length; i < len; i++ ) {
                        draw( tile[ i ][ 0 ], tile[ i ][ 1 ], x, y );
                    }

                } else {
                    draw( maskX, maskY, x, y );
                }

            } else {
                ctx.clearRect(
                    (x * grid),
                    (y * grid),
                    grid,
                    grid
                );
            }
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



class MapLayer {
    // id, width, height
    constructor ( data ) {
        this.data = data;
        this.cashId = `${this.data.map.id}-${this.data.id}`;
        this.build();
    }


    build () {
        const cashLayer = Loader.cash( this.cashId );

        if ( cashLayer && this.data.cash ) {
            this.canvas = cashLayer;
            this.context = this.canvas.getContext( "2d" );

        } else {
            this.canvas = document.createElement( "canvas" );
            this.canvas.className = "_2dk__layer";
            this.canvas.dataset.layer = this.data.id;
            this.context = this.canvas.getContext( "2d" );

            this.update( this.data.width, this.data.height );

            Loader.cash( this.cashId, this.canvas );
        }
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
        // Don't clear cashed <canvas> elements
        if ( !this.data.cash ) {
            this.context.clearRect(
                0,
                0,
                this.canvas.width,
                this.canvas.height
            );
        }
    }


    destroy () {
        // Don't destroy cashed <canvas> elements
        if ( !this.data.cash ) {
            this.clear();
            this.canvas.width = 0;
            this.canvas.height = 0;
            this.context = null;
            this.canvas = null;
        }
    }
}



class MapLocation {
    // Map
    constructor ( map ) {
        this.map = map;
        this.layers = {};
        this.build();
    }


    build () {
        for ( let id in this.map.data.textures ) {
            this.setLayer( id );
        }
    }


    setLayer ( id, cash ) {
        this.layers[ id ] = new MapLayer({
            id,
            map: this.map.data,
            cash: true,
            width: this.map.width,
            height: this.map.height
        });

        this.layers[ id ].canvas.width = this.map.width * this.map.data.resolution;
        this.layers[ id ].canvas.height = this.map.height * this.map.data.resolution;

        drawMapTiles(
            this.layers[ id ].context,
            this.map.image,
            this.map.data.textures[ id ],
            this.map.data.tilesize,
        );
    }


    destroy () {
        for ( let id in this.layers ) {
            this.layers[ id ].destroy();
        }

        this.layers = null;
    }
}



class ActiveTiles {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
    }


    destroy () {
        this.data = null;
    }


    draw ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        const diff = (elapsed - this.previousElapsed);
        let frame = Math.floor( (diff / this.data.dur) * this.data.stepsX );

        if ( diff >= this.data.dur ) {
            this.previousElapsed = elapsed;
            frame = this.data.stepsX - 1;
        }

        const active = this.getActive();

        if ( active.length ) {
            this.renderActive( active, frame );
        }
    }


    getActive () {
        // Get only tiles that are visible in the camera box
        return this.data.coords.filter(( coord ) => {
            const offset = {
                top: (coord[ 1 ] * this.map.data.gridsize) + this.map.offset.y,
                bottom: ((coord[ 1 ] * this.map.data.gridsize) + this.map.data.gridsize) + this.map.offset.y,
                left: (coord[ 0 ] * this.map.data.gridsize) + this.map.offset.x,
                right: ((coord[ 0 ] * this.map.data.gridsize) + this.map.data.gridsize) + this.map.offset.x,
            };

            // Tile is offscreen
            if ( offset.bottom <= 0 || offset.top >= this.map.gamebox.camera.height || offset.right <= 0 || offset.left >= this.map.gamebox.camera.width ) {
                return false;

            // Tile is onscreen
            } else {
                return true;
            }
        });
    }


    renderActive ( active, frame ) {
        const activeX = (this.data.offsetX + (frame * this.map.data.tilesize));

        active.forEach(( coord ) => {
            this.map.location.layers[ this.data.layer ].context.clearRect(
                this.map.data.tilesize * coord[ 0 ],
                this.map.data.tilesize * coord[ 1 ],
                this.map.data.tilesize,
                this.map.data.tilesize,
            );

            this.map.location.layers[ this.data.layer ].context.drawImage(
                this.map.image,
                activeX,
                this.data.offsetY,
                this.map.data.tilesize,
                this.map.data.tilesize,
                this.map.data.tilesize * coord[ 0 ],
                this.map.data.tilesize * coord[ 1 ],
                this.map.data.tilesize,
                this.map.data.tilesize,
            );
        });
    }
}



class ActiveObject {
    constructor ( data, map ) {
        this.map = map;
        this.data = Utils.merge( map.gamebox.player.data.objects.find( ( obj ) => (obj.id === data.id) ), data );
        this.image = new Image();
        this.image.src = this.data.image;
        // Copy so we can cooldown and re-spawn objects with fresh states
        this.states = Utils.copy( this.data.states );
        this.hitbox = {
            x: !this.data.boxes ? 0 : this.data.spawn.x + (this.data.boxes.hit.x / this.data.scale),
            y: !this.data.boxes ? 0 : this.data.spawn.y + (this.data.boxes.hit.y / this.data.scale),
            width: !this.data.boxes ? 0 : (this.data.boxes.hit.width / this.data.scale),
            height: !this.data.boxes ? 0 : (this.data.boxes.hit.height / this.data.scale),
        };

        this.shift();
    }


    destroy () {
        this.data = null;
        this.image = null;
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


    payload () {
        if ( this.state.action.payload.dialogue ) {
            console.log( "PAYLOAD", this.state.action.payload.dialogue );
        }
    }


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();

            if ( !this.state.animated ) {
                this.draw();
            }
        }
    }


    draw ( elapsed ) {
        this.map.layers[ this.data.layer ].context.clearRect(
            this.map.offset.x + this.data.spawn.x,
            this.map.offset.y + this.data.spawn.y,
            this.data.width / this.data.scale,
            this.data.height / this.data.scale,
        );

        this.map.layers[ this.data.layer ].context.drawImage(
            this.image,
            this.state.offsetX,
            this.state.offsetY,
            this.data.width,
            this.data.height,
            this.map.offset.x + this.data.spawn.x,
            this.map.offset.y + this.data.spawn.y,
            this.data.width / this.data.scale,
            this.data.height / this.data.scale,
        );
    }
}



class Map {
    constructor ( data, gamebox ) {
        this.data = data;
        this.gamebox = gamebox;
        this.location = null;
        this.layers = {};
        this.width = data.width / data.resolution;
        this.height = data.height / data.resolution;
        this.image = Loader.cash( data.image );
        this.location = new MapLocation( this );
        this.activeTiles = [];
        this.activeObjects = [];
        this.offset = {
            x: 0,
            y: 0
        };
        this.build();
    }


    destroy () {
        this.data = null;
        this.element.parentNode.removeChild( this.element );
        this.element = null;
        this.image = null;
        this.location.destroy();
        this.location = null;
        this.layers = null;
        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.destroy();
        });
        this.activeObjects.forEach(( activeObject ) => {
            activeObject.destroy();
        });
        this.activeTiles = null;
        this.activeObjects = null;
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__map";

        for ( let id in this.data.textures ) {
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


    render ( elapsed ) {
        this.clear();

        this.activeTiles.forEach(( activeTiles ) => {
            activeTiles.draw( elapsed );
        });

        for ( let id in this.data.textures ) {
            this.layers[ id ].context.drawImage(
                this.location.layers[ id ].canvas,
                0,
                0,
                this.location.layers[ id ].data.width * this.data.resolution,
                this.location.layers[ id ].data.height * this.data.resolution,
                this.offset.x,
                this.offset.y,
                this.location.layers[ id ].data.width,
                this.location.layers[ id ].data.height,
            );
        }

        this.activeObjects.forEach(( activeObject ) => {
            if ( !activeObject.state.animated ) {
                activeObject.draw( elapsed );
            }
        });
    }


    clear () {
        for ( let id in this.data.textures ) {
            this.layers[ id ].clear();
        }
    }


    addLayer ( id ) {
        this.layers[ id ] = new MapLayer({
            id,
            map: this,
            cash: false,
            width: this.gamebox.player.width,
            height: this.gamebox.player.height
        });

        this.element.appendChild( this.layers[ id ].canvas );
    }
}



module.exports = {
    Map,
    MapLayer,
    MapLocation,
    drawMapTiles,
    drawGridLines,
};
