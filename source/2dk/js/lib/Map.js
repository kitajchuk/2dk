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


    setLayer ( id ) {
        this.layers[ id ] = new MapLayer({
            id,
            width: this.map.width,
            height: this.map.height
        });

        this.layers[ id ].canvas.width = this.map.width * this.map.data.resolution;
        this.layers[ id ].canvas.height =  this.map.height * this.map.data.resolution;

        drawMapTiles(
            this.layers[ id ].context,
            this.map.image,
            this.map.data.textures[ id ],
            this.map.data.tilesize
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
        this.objects = null;
        this.image = null;
        this.location = null;
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__map";
        this.objects = document.createElement( "div" );
        this.objects.className = `_2dk__layer`;
        this.objects.dataset.layer = "objects";
        this.element.appendChild( this.objects );

        for ( let id in this.data.textures ) {
            this.addLayer( id );
        }
    }


    update ( offset ) {
        this.offset = offset;
        this.render();
    }


    render () {
        this.clear();

        for ( let id in this.layers ) {
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
    }


    clear () {
        for ( let id in this.layers ) {
            this.layers[ id ].context.clearRect(
                0,
                0,
                this.layers[ id ].data.width,
                this.layers[ id ].data.height
            );
        }
    }


    addSprite ( sprite ) {
        this.objects.appendChild( sprite.element );
    }


    removeSprite ( sprite ) {
        this.objects.removeChild( sprite.element );
    }


    addLayer ( id ) {
        this.layers[ id ] = new MapLayer({
            id,
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
    drawGridLines
};
