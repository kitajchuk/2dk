const Config = require( "../Config" );
const Sprite = require( "./Sprite" );



/*******************************************************************************
* Hero
* There can be only one per Map
*******************************************************************************/
class Hero extends Sprite {
    constructor ( data, map ) {
        super( data, map );
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
            x: (this.gamebox.camera.width / 2) - (this.width / 2),
            y: (this.gamebox.camera.height / 2) - (this.height / 2),
        };

        if ( absolute.x <= 0 ) {
            // this.offset.x = Math.max( 0, poi.x );
            this.offset.x = this.position.x;
        }

        if ( absolute.x >= (this.map.width - this.gamebox.camera.width) ) {
            this.offset.x = this.position.x + this.map.offset.x;
        }

        if ( absolute.y <= 0 ) {
            // this.offset.y = Math.max( 0, poi.y );
            this.offset.y = this.position.y;
        }

        if ( absolute.y >= (this.map.height - this.gamebox.camera.height) ) {
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

        // Idle comes next...LIFT has it's own idle face...
        } else if ( this.idle.x && this.idle.y ) {
            this.face( this.dir );

        } else {
            this.cycle( Config.verbs.WALK, this.dir );
        }
    }
}



module.exports = Hero;
