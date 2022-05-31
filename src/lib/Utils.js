import Config from "./Config";



const Utils = {
    dev () {
        return /^file:|^localhost/.test( window.location.href );
    },


    log ( ...args ) {
        if ( Utils.dev() ) {
            console.log.apply( console, args );
        }
    },


    func ( fn ) {
        return typeof fn === "function";
    },


    def ( el ) {
        return el !== undefined;
    },


    error ( ...args ) {
        if ( Utils.dev() ) {
            console.error.apply( console, args );
        }
    },


    copy ( obj ) {
        // Deep copy for non-mutation of origin `obj`
        return JSON.parse( JSON.stringify( obj ) );
    },


    merge ( base, pr, f ) {
        base = Utils.copy( base );
        pr = Utils.copy( pr );

        Object.keys( pr ).forEach( ( i ) => {
            if ( !base[ i ] || f ) {
                base[ i ] = pr[ i ];
            }
        });

        return base;
    },


    collide ( box1, box2 ) {
        let ret = false;

        if ( box1.x < ( box2.x + box2.width ) && ( box1.x + box1.width ) > box2.x && box1.y < ( box2.y + box2.height ) && ( box1.height + box1.y ) > box2.y ) {
            ret = {
                // box1.x1 snapped to ZERO
                x: Math.max( 0, ( box1.x - box2.x ) ),
                // box1.y1 snapped to ZERO
                y: Math.max( 0, ( box1.y - box2.y ) ),
                // box1.x2 snapped to BOX2.WIDTH
                width: ( Math.min( box2.width, ( ( box1.x - box2.x ) + box1.width ) ) ) - ( Math.max( 0, ( box1.x - box2.x ) ) ),
                // box1.y2 snapped to BOX2.HEIGHT
                height: ( Math.min( box2.height, ( ( box1.y - box2.y ) + box1.height ) ) ) - ( Math.max( 0, ( box1.y - box2.y ) ) ),
            };
        }

        return ret;
    },


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
    drawTileCel ( context, image, tileSize, gridSize, mx, my, px, py ) {
        context.drawImage(
            image,
            mx,
            my,
            tileSize,
            tileSize,
            ( px * gridSize ),
            ( py * gridSize ),
            gridSize,
            gridSize
        );
    },


    drawMapTile ( context, image, tile, tileSize, gridSize, x, y ) {
        // Position has tiles: Array[Array[x, y], Array[x, y]]
        if ( Array.isArray( tile ) ) {
            for ( let i = 0, len = tile.length; i < len; i++ ) {
                this.drawTileCel(
                    context,
                    image,
                    tileSize,
                    gridSize,
                    tile[ i ][ 0 ],
                    tile[ i ][ 1 ],
                    x,
                    y
                );
            }

        // Position has no tile: 0
        } else {
            context.clearRect(
                ( x * gridSize ),
                ( y * gridSize ),
                gridSize,
                gridSize
            );
        }
    },


    drawMapTiles ( context, image, textures, tileSize, gridSize ) {
        for ( let y = textures.length; y--; ) {
            const row = textures[ y ];

            for ( let x = row.length; x--; ) {
                const tile = row[ x ];

                this.drawMapTile( context, image, tile, tileSize, gridSize, x, y );
            }
        }
    },


    drawGridLines ( ctx, w, h, g ) {
        ctx.globalAlpha = 1.0;

        for ( let y = 1; y < h; y++ ) {
            ctx.fillStyle = Config.colors.teal;
            ctx.fillRect( 0, ( y * g ), ( g * w ), 1 );
        }

        for ( let x = 1; x < w; x++ ) {
            ctx.fillStyle = Config.colors.teal;
            ctx.fillRect( ( x * g ), 0, 1, ( g * h ) );
        }
    },


    getParams ( str ) {
        let query = decodeURIComponent( str ).match( /[#|?].*$/g );
        const ret = {};

        if ( query ) {
            query = query[ 0 ].replace( /^\?|^#|^\/|\/$|\[|\]/g, "" );
            query = query.split( "&" );

            for ( let i = query.length; i--; ) {
                const pair = query[ i ].split( "=" );
                const key = pair[ 0 ];
                const val = pair[ 1 ];

                if ( ret[ key ] ) {
                    if ( !Array.isArray( ret[ key ] ) ) {
                        ret[ key ] = [ ret[ key ] ];
                    }

                    ret[ key ].push( val );

                } else {
                    ret[ key ] = val;
                }
            }
        }

        return ret;
    },


    // From Akihabara helpers:


    // https://github.com/Akihabara/akihabara/blob/master/src/helpers.js#L78
    random  ( min, range ) {
        return min + Math.floor( Math.random() * range );
    },


    // https://github.com/Akihabara/akihabara/blob/master/src/helpers.js#L103
    limit  ( v, min, max ) {
        if ( v < min ) {
            return min;

        } else {
            if ( v > max ) {
                return max;

            } else {
                return v;
            }
        }
    },


    // https://github.com/Akihabara/akihabara/blob/master/src/helpers.js#L122
    goToZero ( v ) {
        return ( v ? v - ( v / Math.abs( v ) ) : 0 );
    },


    // From Akihabara trigo:


    /**
     * Gets the distance between two points.
     * 
     * @param {object} p1 This is an object containing x and y params for the first point.
     * @param {object} p2 This is an object containing x and y params for the second point.
     * @returns {number} The distance between p1 and p2.
     */
    getDistance ( p1, p2 ) {
        return Math.sqrt( Math.pow( p2.x - p1.x, 2 ) + Math.pow( p2.y - p1.y, 2 ) );
    },
};



export default Utils;
