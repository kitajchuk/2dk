import Loader from "./Loader";
import Config from "./Config";



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
    ctx.globalAlpha = 0.5;

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
        this.canvas.className = "_2dk__map__layer";
        this.canvas.dataset.layer = this.data.id;
        this.context = this.canvas.getContext( "2d" );
        this.canvas.style.width = `${this.data.width}px`;
        this.canvas.width = this.data.width;
        this.canvas.style.height = `${this.data.height}px`;
        this.canvas.height = this.data.height;
    }


    update ( width, height ) {
        this.data.width = width;
        this.data.height = height;
        this.canvas.style.width = `${this.data.width}px`;
        this.canvas.width = this.data.width;
        this.canvas.style.height = `${this.data.height}px`;
        this.canvas.height = this.data.height;
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

            if ( this.map.player.debug ) {
                this.setDebugLayer();
            }
        }
    }


    setLayer ( id ) {
        this.layers[ id ] = new MapLayer({
            id,
            width: this.map.data.width,
            height: this.map.data.height
        });

        drawMapTiles(
            this.layers[ id ].context,
            this.map.image,
            this.map.data.textures[ id ],
            this.map.data.tilesize
        );
    }


    setDebugLayer () {
        this.layers.debug = new MapLayer({
            id: "debug",
            width: this.map.data.width,
            height: this.map.data.height
        });

        drawGridLines(
            this.layers.debug.context,
            this.map.width,
            this.map.height,
            this.map.data.tilesize
        );
    }
}



export default class Map {
    constructor ( data ) {
        this.data = data;
        this.loader = new Loader();
        this.layers = {};
        this.location = null;
        this.width = this.data.width;
        this.height = this.data.height;
        this.offset = {
            x: 0,
            y: 0
        };
        this.build();
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__map";
        this.objects = document.createElement( "div" );
        this.objects.className = `_2dk__obj`;
        this.objects.style.width = `${this.width}px`;
        this.objects.style.height = `${this.height}px`;
        this.element.appendChild( this.objects );
    }


    load () {
        return new Promise(( resolve ) => {
            this.loader.loadImg( this.data.image ).then(( image ) => {
                this.image = image;
                this.location = new MapLocation( this );

                for ( let id in this.data.textures ) {
                    this.setLayer( id );
                }

                if ( this.player.debug ) {
                    this.setDebugLayer();
                }

                resolve();
            });
        });
    }


    init ( transform ) {
        this.offset = transform;
        this.render();
    }


    move ( dir, transform ) {
        this.offset = transform;
        this.render();
    }


    render () {
        this.clear();

        this.objects.style.webkitTransform = `translate3d(
            ${this.offset.x}px,
            ${this.offset.y}px,
            0
        )`;

        for ( let id in this.layers ) {
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
            this.layers[ id ].context.drawImage(
                this.location.layers[ id ].canvas,
                0,
                0,
                this.location.layers[ id ].data.width,
                this.location.layers[ id ].data.height,
                this.offset.x,
                this.offset.y,
                this.location.layers[ id ].data.width,
                this.location.layers[ id ].data.height
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

        if ( this.debugLayer ) {
            this.debugLayer.context.clearRect(
                0,
                0,
                this.debugLayer.data.width,
                this.debugLayer.data.height
            );
        }
    }


    addSprite ( sprite ) {
        this.objects.appendChild( sprite.element );
    }


    updateLayers ( width, height ) {
        for ( let id in this.layers ) {
            this.layers[ id ].update( width, height );
        }

        this.render();
    }


    setLayer ( id ) {
        this.layers[ id ] = new MapLayer({
            id,
            width: this.player.width,
            height: this.player.height
        });

        this.element.appendChild( this.layers[ id ].canvas );
    }


    setDebugLayer () {
        this.layers.debug = new MapLayer({
            id: "debug",
            width: this.player.width,
            height: this.player.height
        });

        this.element.appendChild( this.layers.debug.canvas );
    }
}
