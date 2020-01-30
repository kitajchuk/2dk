const Sprite = require( "./Sprite" );



/*******************************************************************************
* Visual Effects Sprite
* Self destructive when duration is met...
*******************************************************************************/
class FX extends Sprite {
    constructor ( data, map ) {
        super( data, map );
    }


    destroy () {
        this.map.killFX( this );
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        this.applyFrame( elapsed );
    }


    getCel () {
        return [
            Math.abs( this.data.offsetX ) + (this.data.width * this.frame),
            Math.abs( this.data.offsetY ),
        ];
    }


    applyFrame ( elapsed ) {
        this.frame = 0;

        if ( this.data.stepsX ) {
            const diff = (elapsed - this.previousElapsed);

            this.frame = Math.floor( (diff / this.data.dur) * this.data.stepsX );

            if ( diff >= this.data.dur ) {
                this.destroy();
            }
        }

        this.spritecel = this.getCel();
    }
}



module.exports = FX;
