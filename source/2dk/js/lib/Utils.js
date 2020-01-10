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
            poi.x = sprite.position.x - step;
            poi.y = sprite.position.y;
        }

        if ( dir === "right" ) {
            poi.x = sprite.position.x + step;
            poi.y = sprite.position.y;
        }

        if ( dir === "up" ) {
            poi.x = sprite.position.x;
            poi.y = sprite.position.y - step;
        }

        if ( dir === "down" ) {
            poi.x = sprite.position.x;
            poi.y = sprite.position.y + step;
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


    // From Akihabara helpers
    // https://github.com/Akihabara/akihabara/blob/master/src/helpers.js
    /**
    * Generates uniformly distributed random integers between min and min + range, non-inclusive. So AkihabaraHelpersers.random(0, 2) will only return 0 and 1, etc.
    * @param {Integer} min The minimum random value to be returned by the function.
    * @param {Integer} range The number of different values returned by the function.
    * @returns An integer between min (includive) and min + range (noninclusive).
    */
    random: function (min, range) {
        return min + Math.floor(Math.random() * range);
    },


    // From Akihabara Trigo
    // https://github.com/Akihabara/akihabara/blob/master/src/trigo.js
    // ANGLE_RIGHT: 0,
    // ANGLE_DOWN: Math.PI * 0.5,
    // ANGLE_LEFT: Math.PI,
    // ANGLE_UP: Math.PI * 1.5555555,

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
