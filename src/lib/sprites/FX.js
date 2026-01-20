import Sprite from "./Sprite";
import Config from "../Config";



/*******************************************************************************
* Visual Effects Sprite
* Self destructive when duration is met...
*******************************************************************************/
export default class FX extends Sprite {
    constructor ( data, map ) {
        if ( data.type === Config.npc.ai.FLOAT ) {
            data.layer = "foreground";
        }

        data.verbs = {
            face: {
                down: {
                    offsetX: data.offsetX,
                    offsetY: data.offsetY,
                },
            },
        };

        super( data, map );
        this.paused = false;
    }


    blit ( elapsed ) {
        // Same as base Sprite class
        // Call visible() on blit to assign onscreen property
        // Then update() and render() can use that rather than executing again
        if ( !this.visible() ) {
            return;
        }

        if ( this.paused ) {
            return;
        }

        if ( this.previousElapsed === null ) {
            this.previousElapsed = elapsed;
        }

        if ( this.data.type === Config.npc.ai.FLOAT ) {
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
        if ( this.data.stepsX ) {
            const interval = this.data.dur / this.data.stepsX;
            const delta = ( elapsed - this.previousElapsed );

            if ( delta >= interval ) {
                this.previousElapsed = elapsed - ( delta % interval );
                this.frame++;

                if ( this.frame >= this.data.stepsX ) {
                    if ( this.data.kill ) {
                        this.map.killObject( "fx", this );
    
                    } else {
                        this.previousElapsed = null;
                        this.frame = 0;
    
                        // Resets the animation sequence, as in a loop...
                        if ( this.data.type === Config.npc.ai.FLOAT ) {
                            this.position.y = this.data.spawn.y;
                        }
                    }
                }
            }

        } else {
            this.frame = 0;
        }

        this.spritecel = this.getCel();
    }
}
