import Config from "./Config";



const Utils = {
    dev () {
        return /^file:|^http:\/\/(localhost|127\.0\.0\.1)/.test( window.location.href );
    },


    log ( ...args ) {
        if ( Utils.dev() ) {
            console.log.apply( console, ["[2dk]", ...args] );
        }
    },


    func ( fn ) {
        return typeof fn === "function";
    },


    def ( el ) {
        return el !== undefined && el !== null;
    },


    error ( ...args ) {
        if ( Utils.dev() ) {
            console.error.apply( console, args );
        }
    },


    merge ( base, pr, f ) {
        base = structuredClone( base );
        pr = structuredClone( pr );

        for ( const i in pr ) {
            if ( !base[ i ] || f ) {
                base[ i ] = pr[ i ];
            }
        }

        return base;
    },


    collide ( box1, box2, tolerance = 0 ) {
        if (
            (box1.x + tolerance) < (box2.x + box2.width - tolerance) &&
            (box1.x + box1.width - tolerance) > (box2.x + tolerance) &&
            (box1.y + tolerance) < (box2.y + box2.height - tolerance) &&
            (box1.height + box1.y - tolerance) > (box2.y + tolerance)
        ) {
            return {
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

        return false;
    },


    getCollisionAmount ( box1, box2 ) {
        return ( box1.width * box1.height ) / ( box2.width * box2.height ) * 100;
    },


    getTotalCollisionAmount ( tiles ) {
        return Math.ceil( tiles.reduce(( acc, tile ) => {
            return acc + tile.amount;
        }, 0 ) );
    },


    getMostCollidingTile ( tiles ) {
        return tiles.reduce(( acc, tile ) => {
            if ( !acc ) {
                return tile;
            }

            return tile.amount > acc.amount ? tile : acc;
        }, null );
    },


    getPerceptionBox ( position, width, height, tileSize ) {
        const topLeft = {
            x: Math.floor( position.x / tileSize ),
            y: Math.floor( position.y / tileSize ),
        };
        const bottomRight = {
            x: Math.floor( ( position.x + width ) / tileSize ),
            y: Math.floor( ( position.y + height ) / tileSize ),
        };

        // Tilebox is so we can narrow the scope of texture checks with getNearestEmptyTiles()
        const tileBox = {
            x: topLeft.x - 1,
            y: topLeft.y - 1,
            width: bottomRight.x - topLeft.x + 3,
            height: bottomRight.y - topLeft.y + 3,
        };

        // NOTE: Not in use but we'll need a REAL perception box for aggro logic later...
        // Hitbox is so we can narrow the scope of collision checks for everything else
        // Also the hitbox is a consistent area around the sprite whereas the tilebox shifts slightly depending on how position snaps to tiles
        // const hitBox = {
        //     x: position.x - tileSize,
        //     y: position.y - tileSize,
        //     width: width + tileSize * 2,
        //     height: height + tileSize * 2,
        // };

        return { tileBox };
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
    drawTileCel ( context, image, tileSize, gridSize, mx, my, px, py, bleed = null ) {
        const bleedX = bleed?.x ?? 0;
        const bleedY = bleed?.y ?? 0;

        context.drawImage(
            image,
            mx,
            my,
            tileSize,
            tileSize,
            ( px * gridSize ) + bleedX,
            ( py * gridSize ) + bleedY,
            gridSize,
            gridSize
        );
    },


    drawMapTile ( context, image, tile, tileSize, gridSize, x, y, bleed = null ) {
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
                    y,
                    bleed
                );
            }

        // Position has no tile: 0
        } else if ( bleed === null ) {
            context.clearRect(
                ( x * gridSize ),
                ( y * gridSize ),
                gridSize,
                gridSize
            );
        }
    },


    drawMapTiles ( context, image, textures, tileSize, gridSize, bleed = null ) {
        for ( let y = textures.length; y--; ) {
            const row = textures[ y ];

            for ( let x = row.length; x--; ) {
                const tile = row[ x ];

                this.drawMapTile( context, image, tile, tileSize, gridSize, x, y, bleed );
            }
        }
    },


    /*
     * Get the surrounding tiles of a tile at coords
     * 
     * -------------
     * |   |   |   |
     * -------------
     * |   | x |   |
     * -------------
     * |   |   |   |
     * -------------
     * 
     */
    getSurroundingTileCoords ( coords ) {
        return {
            topLeft: {
                x: coords[ 0 ] - 1,
                y: coords[ 1 ] - 1,
            },
            top: {
                x: coords[ 0 ],
                y: coords[ 1 ] - 1,
            },
            topRight: {
                x: coords[ 0 ] + 1,
                y: coords[ 1 ] - 1,
            },
            left: {
                x: coords[ 0 ] - 1,
                y: coords[ 1 ],
            },
            right: {
                x: coords[ 0 ] + 1,
                y: coords[ 1 ],
            },
            bottomLeft: {
                x: coords[ 0 ] - 1,
                y: coords[ 1 ] + 1,
            },
            bottom: {
                x: coords[ 0 ],
                y: coords[ 1 ] + 1,
            },
            bottomRight: {
                x: coords[ 0 ] + 1,
                y: coords[ 1 ] + 1,
            }
        };
    },


    random  ( min, max ) {
        return Math.floor( Math.random() * ( max - min + 1 ) ) + min;
    },


    getDirectionFromAngle ( angle ) {
        if ( angle >= -Math.PI / 4 && angle < Math.PI / 4 ) {
            return "right";

        } else if ( angle >= Math.PI / 4 && angle < 3 * Math.PI / 4 ) {
            return "down";

        } else if ( angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4 ) {
            return "up";

        } else {
            return "left";
        }
    },


    areSpritesInRange ( sprite1, sprite2, range ) {
        return this.getDistance( sprite1.center, sprite2.center ) <= range;
    },


    canSpriteInteractWithNPCByLayer ( sprite, npc ) {
        return (
            npc.layer === sprite.layer ||
            (
                sprite.layer === Config.layers.ELEVATION &&
                sprite.elevation &&
                sprite.elevation.event &&
                sprite.elevation.event.checkElevationAccess( npc.position, npc )
            )
        );
    },


    // From Akihabara helpers:


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

    // https://github.com/Akihabara/akihabara/blob/master/src/helpers.js#L95
	upAndDown ( counter, max ) {
		if ( ( counter % max ) > ( max / 2 ) ) {
			return max - ( counter % max );
		} else {
			return ( counter % max );
		}
	},


    // From Akihabara trigo:


    // https://github.com/Akihabara/akihabara/blob/master/src/trigo.js#L34
    getDistance ( p1, p2 ) {
        return Math.sqrt( Math.pow( p2.x - p1.x, 2 ) + Math.pow( p2.y - p1.y, 2 ) );
    },
};



export default Utils;
