const Config = require( "./Config" );



const Utils = {
    copy ( obj ) {
        return JSON.parse( JSON.stringify( obj ) );
    },


    merge ( base, pr, f ) {
        base = Utils.copy( base );
        pr = Utils.copy( pr );

        for ( let i in pr ) {
            if ( !base[ i ] || f ) {
                base[ i ] = pr[ i ];
            }
        }

        return base;
    },


    collide ( box1, box2 ) {
        let ret = false;

        if ( box1.x < (box2.x + box2.width) && (box1.x + box1.width) > box2.x && box1.y < (box2.y + box2.height) && (box1.height + box1.y) > box2.y ) {
            ret = {
                // box1.x1 snapped to ZERO
                x: Math.max( 0, (box1.x - box2.x) ),
                // box1.y1 snapped to ZERO
                y: Math.max( 0, (box1.y - box2.y) ),
                // box1.x2 snapped to BOX2.WIDTH
                width: (Math.min( box2.width, ((box1.x - box2.x) + box1.width) )) - (Math.max( 0, (box1.x - box2.x) )),
                // box1.y2 snapped to BOX2.HEIGHT
                height: (Math.min( box2.height, ((box1.y - box2.y) + box1.height) )) - (Math.max( 0, (box1.y - box2.y) )),
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
            (px * gridSize),
            (py * gridSize),
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
                (x * gridSize),
                (y * gridSize),
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
            ctx.fillRect( 0, (y * g), (g * w), 1 );
        }

        for ( let x = 1; x < w; x++ ) {
            ctx.fillStyle = Config.colors.teal;
            ctx.fillRect( (x * g), 0, 1, (g * h) );
        }
    },


    getTransform ( el ) {
        const transform = el ? window.getComputedStyle( el )[ "transform" ] : "none";
        const values = transform.replace( /matrix|3d|\(|\)|\s/g, "" ).split( "," );
        const ret = {};

        // No Transform
        if ( values[ 0 ] === "none" ) {
            ret.x = 0;
            ret.y = 0;
            ret.z = 0;

        // Matrix 3D
        } else if ( values.length === 16 ) {
            ret.x = parseFloat( values[ 12 ] );
            ret.y = parseFloat( values[ 13 ] );
            ret.z = parseFloat( values[ 14 ] );

        } else {
            ret.x = parseFloat( values[ 4 ] );
            ret.y = parseFloat( values[ 5 ] );
            ret.z = 0;
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
        return (v ? v - (v / Math.abs( v )) : 0);
    },


    // From Akihabara trigo:


    /**
    * Adds two angles together (radians).
    * @param {Float} a Base angle.
    * @param {Float} add The angle you're adding to the base angle.
    * @returns The resultant angle, always between 0 and 2*pi.
    */
    addAngle: function (a, add) {
        a = (a + add) % (Math.PI * 2);
        if (a < 0) {
            return (Math.PI * 2) + a;
        } else {
            return a;
        }
    },


    /**
    * Gets the distance between two points.
    * @param {Object} p1 This is an object containing x and y params for the first point.
    * @param {Object} p2 This is an object containing x and y params for the second point.
    * @returns The distance between p1 and p2.
    */
    getDistance: function (p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    },


    /**
    * Calculates the angle between two points.
    * @param {Object} p1 This is an object containing x and y params for the first point.
    * @param {Object} p2 This is an object containing x and y params for the second point.
    * @param {Float} transl (Optional) Adds an angle (in radians) to the result. Defaults to 0.
    * @returns The angle between points p1 and p2, plus transl.
    */
    getAngle: function (p1, p2, transl) {
        return Utils.addAngle(Math.atan2(p2.y - p1.y, p2.x - p1.x), (transl ? transl : 0));
    },


    /**
    * Translates a point by a vector defined by angle and distance. This does not return a value but rather modifies the x and y values of p1.
    * @param {Object} p1 This is an object containing x and y params for the point.
    * @param {Float} a The angle of translation (rad).
    * @param {Float} d The distance of translation.
    */
    translate: function (p1, a, d) {
        return {x: p1.x + Math.cos(a) * d, y: p1.y + Math.sin(a) * d};
    },


    /**
    * Translates an x component of a coordinate by a vector defined by angle and distance. This returns its component translation.
    * @param {Float} x1 This is an x coordinate.
    * @param {Float} a The angle of translation (rad).
    * @param {Float} d The distance of translation.
    */
    translateX: function (x1, a, d) {
        return x1 + Math.cos(a) * d;
    },


    /**
    * Translates a y component of a coordinate by a vector defined by angle and distance. This returns its component translation.
    * @param {Float} y1 This is a y coordinate.
    * @param {Float} a The angle of translation (rad).
    * @param {Float} d The distance of translation.
    */
    translateY: function (y1, a, d) {
        return y1 + Math.sin(a) * d;
    }
};



module.exports = Utils;
