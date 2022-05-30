import Config from "../Config";
import Sprite from "./Sprite";



/*******************************************************************************
* Hero
* There can be only one per Map
*******************************************************************************/
class Hero extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.layer = "heroground";
    }


    visible () {
        return true;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    update () {
        // Handle player controls
        this.gamebox.handleControls( this.gamebox.player.controls, this );

        // The physics stack...
        this.handleVelocity();
        this.handleGravity();
        this.applyGravity();
    }


    renderAfter () {
        if ( this.verb === Config.verbs.ATTACK && this.data.weapon && this.data.weapon[ this.dir ].length ) {
            this.gamebox.layers[ this.layer ].onCanvas.context.drawImage(
                this.image,
                Math.abs( this.data.weapon[ this.dir ][ this.frame ].offsetX ),
                Math.abs( this.data.weapon[ this.dir ][ this.frame ].offsetY ),
                this.data.weapon[ this.dir ][ this.frame ].width,
                this.data.weapon[ this.dir ][ this.frame ].height,
                this.offset.x + this.data.weapon[ this.dir ][ this.frame ].positionX,
                this.offset.y + this.data.weapon[ this.dir ][ this.frame ].positionY,
                this.data.weapon[ this.dir ][ this.frame ].width / this.scale,
                this.data.weapon[ this.dir ][ this.frame ].height / this.scale
            );
        }
    }


/*******************************************************************************
* Applications
* Hero uses custom position and offset determinance...
*******************************************************************************/
    applyPosition ( poi, dir ) {
        this.dir = dir;
        this.position.x = poi.x;
        this.position.y = poi.y;
        this.applyHitbox();
    }


    applyOffset () {
        const absolute = {
            x: Math.abs( this.map.offset.x ),
            y: Math.abs( this.map.offset.y ),
        };

        this.offset = {
            x: ( this.gamebox.camera.width / 2 ) - ( this.width / 2 ),
            y: ( this.gamebox.camera.height / 2 ) - ( this.height / 2 ),
        };

        if ( absolute.x <= 0 ) {
            this.offset.x = this.position.x;
        }

        if ( absolute.x >= ( this.map.width - this.gamebox.camera.width ) ) {
            this.offset.x = this.position.x + this.map.offset.x;
        }

        if ( absolute.y <= 0 ) {
            this.offset.y = this.position.y;
        }

        if ( absolute.y >= ( this.map.height - this.gamebox.camera.height ) ) {
            this.offset.y = this.position.y + this.map.offset.y;
        }
    }


    applyCycle () {
        // Lifting and carrying an object trumps all
        if ( this.verb === Config.verbs.LIFT ) {
            this.cycle( Config.verbs.LIFT, this.dir );

        // Jumping needs to be captured...
        } else if ( this.gamebox.jumping ) {
            this.cycle( Config.verbs.JUMP, this.dir );

        // Attack needs to be captured...
        } else if ( this.gamebox.attacking ) {
            this.cycle( Config.verbs.ATTACK, this.dir );

        // Idle comes next...LIFT has it's own idle face...
        } else if ( this.idle.x && this.idle.y ) {
            this.face( this.dir );

        } else {
            this.cycle( Config.verbs.WALK, this.dir );
        }
    }


/*******************************************************************************
* Getters
*******************************************************************************/
    getWeaponbox () {
        const lowX = this.data.weapon[ this.dir ].reduce( ( accX, record ) => {
            const absX = Math.abs( this.position.x + record.positionX );

            if ( absX < accX ) {
                return absX;
            }

            return accX;

        }, 999999 );
        const lowY = this.data.weapon[ this.dir ].reduce( ( accY, record ) => {
            const absY = Math.abs( this.position.y + record.positionY );

            if ( absY < accY ) {
                return absY;
            }

            return accY;

        }, 999999 );
        const hiX = this.data.weapon[ this.dir ].reduce( ( accX, record ) => {
            const absX = Math.abs( this.position.x + record.positionX + record.width );

            if ( absX > accX ) {
                return absX;
            }

            return accX;

        }, 0 );
        const hiY = this.data.weapon[ this.dir ].reduce( ( accY, record ) => {
            const absY = Math.abs( this.position.y + record.positionY + record.height );

            if ( absY > accY ) {
                return absY;
            }

            return accY;

        }, 0 );

        return {
            x: lowX,
            y: lowY,
            width: hiX - lowX,
            height: hiY - lowY,

        };
    }
}



export default Hero;
