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

        if ( box1.x < box2.x + box2.width && box1.x + box1.width > box2.x && box1.y < box2.y + box2.height && box1.height + box1.y > box2.y ) {
            ret = true;
        }

        return ret;
    },


    getPoi ( dir, step, sprite ) {
        const poi = {};

        if ( dir === "left" ) {
            poi.x = sprite.offset.x - step;
            poi.y = sprite.offset.y;
        }

        if ( dir === "right" ) {
            poi.x = sprite.offset.x + step;
            poi.y = sprite.offset.y;
        }

        if ( dir === "up" ) {
            poi.x = sprite.offset.x;
            poi.y = sprite.offset.y - step;
        }

        if ( dir === "down" ) {
            poi.x = sprite.offset.x;
            poi.y = sprite.offset.y + step;
        }

        return poi;
    },


    getAni ( dir, step, sprite ) {
        const css = {};

        if ( dir === "left" ) {
            css.axis = "x";
            css.from = sprite.offset.x;
            css.to = sprite.offset.x - step;
        }

        if ( dir === "right" ) {
            css.axis = "x";
            css.from = sprite.offset.x;
            css.to = sprite.offset.x + step;
        }

        if ( dir === "up" ) {
            css.axis = "y";
            css.from = sprite.offset.y;
            css.to = sprite.offset.y - step;
        }

        if ( dir === "down" ) {
            css.axis = "y";
            css.from = sprite.offset.y;
            css.to = sprite.offset.y + step;
        }

        return css;
    },
};



module.exports = Utils;
