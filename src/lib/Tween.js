import Utils from "./Utils";
import Controller from "./Controller";



const Easing = {
    /**
     *
     * Produce a linear ease
     * @method linear
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    linear ( t ) { return t; },

    /**
     *
     * Produce a swing ease like in jQuery
     * @method swing
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    swing ( t ) { return ( 1 - Math.cos( t * Math.PI ) ) / 2; },

    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuad
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInQuad ( t ) { return t * t; },

    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuad
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeOutQuad ( t ) { return t * ( 2 - t ); },

    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuad
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInOutQuad ( t ) { return t < 0.5 ? 2 * t * t : -1 + ( 4 - 2 * t ) * t; },

    /**
     *
     * Accelerating from zero velocity
     * @method easeInCubic
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInCubic ( t ) { return t * t * t; },

    /**
     *
     * Decelerating to zero velocity
     * @method easeOutCubic
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeOutCubic ( t ) { return ( --t ) * t * t + 1; },

    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutCubic
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInOutCubic ( t ) { return t < 0.5 ? 4 * t * t * t : ( t - 1 ) * ( 2 * t - 2 ) * ( 2 * t - 2 ) + 1; },

    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuart
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInQuart ( t ) { return t * t * t * t; },

    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuart
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeOutQuart ( t ) { return 1 - ( --t ) * t * t * t; },

    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuart
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInOutQuart ( t ) { return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * ( --t ) * t * t * t; },

    /**
     *
     * Accelerating from zero velocity
     * @method easeInQuint
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInQuint ( t ) { return t * t * t * t * t; },

    /**
     *
     * Decelerating to zero velocity
     * @method easeOutQuint
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeOutQuint ( t ) { return 1 + ( --t ) * t * t * t * t; },

    /**
     *
     * Acceleration until halfway, then deceleration
     * @method easeInOutQuint
     * @param {number} t Difference in time
     * @returns a new t value
     *
     */
    easeInOutQuint ( t ) { return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * ( --t ) * t * t * t * t; },
};



class Tween extends Controller {
    constructor ( gamebox ) {
        super();

        this.gamebox = gamebox;
        this.sprite = null;
    }


    bind ( sprite ) {
        this.sprite = sprite;
    }


    tween ( opts ) {
        let startTime = null;
        const tweenDiffX =  ( opts.to.x - opts.from.x );
        const tweenDiffY =  ( opts.to.y - opts.from.y );

        // Default easing function...
        if ( !Utils.func( opts.ease ) ) {
            opts.ease = Easing.linear;
        }

        this.stop();
        this.go( ( elapsed ) => {
            if ( startTime === null ) {
                startTime = elapsed;
            }

            const diff = elapsed - startTime;
            const tweenToX = ( tweenDiffX * opts.ease( diff / opts.duration ) ) + opts.from.x;
            const tweenToY = ( tweenDiffY * opts.ease( diff / opts.duration ) ) + opts.from.y;
            const tweenPoi = {
                x: tweenToX,
                y: tweenToY,
            };

            if ( this.sprite ) {
                this.sprite.position.x = tweenPoi.x;
                this.sprite.position.y = tweenPoi.y;
                this.sprite.applyOffset();

            } else if ( Utils.func( opts.update ) ) {
                opts.update( tweenPoi );
            }

            if ( diff >= opts.duration ) {
                this.stop();
                opts.complete( tweenPoi );
            }
        });
    }
}



export {
    Easing,
}



export default Tween;
