import Sprite from "./Sprite";
import Config from "../Config";



/*******************************************************************************
* Visual Effects Sprite
* Self destructive when duration is met...
*******************************************************************************/
class FX extends Sprite {
    constructor ( data, map ) {
        super( data, map );

        this.paused = false;
    }


    blit ( elapsed ) {
        if ( !this.visible() ) {
            return;
        }

        if ( this.paused ) {
            return;
        }

        if ( this.previousElapsed === null ) {
            this.previousElapsed = elapsed;
        }

        if ( this.data.type === Config.npc.FLOAT ) {
            this.position.y--;
        }

        this.applyFrame( elapsed );
    }


    getCel () {
        return [
            this.data.offsetX + ( this.data.width * this.frame ),
            this.data.offsetY,
        ];
    }


    applyFrame ( elapsed ) {
        this.frame = 0;

        if ( this.data.stepsX ) {
            const diff = ( elapsed - this.previousElapsed );

            this.frame = Math.floor( ( diff / this.data.dur ) * this.data.stepsX );

            if ( diff >= this.data.dur ) {
                if ( this.data.kill ) {
                    this.map.killObject( "fx", this );

                } else {
                    this.previousElapsed = elapsed;
                    this.frame = this.data.stepsX - 1;

                    // Resets the animation sequence, as in a loop...
                    if ( this.data.type === Config.npc.FLOAT ) {
                        this.position.y = this.data.spawn.y;
                    }
                }
            }
        }

        this.spritecel = this.getCel();
    }
}



export default FX;
