const Utils = require( "./Utils" );



class GameCycle {
    constructor ( player ) {
        this.step = 1;
        this.player = player;
        this.start();
    }


    start () {
        this._blit = this.blit.bind( this );
        this._previousElapsed = 0;

        window.requestAnimationFrame( this._blit );
    }


    blit ( elapsed ) {
        window.requestAnimationFrame( this._blit );

        if ( this.player.stopped || this.player.paused ) {
            this._previousElapsed = elapsed;
            return;
        }

        let delta = (elapsed - this._previousElapsed) / 1000.0;

        delta = Math.min( delta, 0.25 ); // maximum delta of 250ms
        this._previousElapsed = elapsed;

        // D-Pad movement
        // Easier to check the gamepad than have player use event handlers...
        const dpad = this.player.gamepad.checkDpad();

        if ( !dpad.length ) {
            this.player.gamebox.releaseD();

        } else {
            dpad.forEach(( ctrl ) => {
                ctrl.dpad.forEach(( dir ) => {
                    const step = this.getStep( dir );

                    this.player.gamebox.pressD( dir, delta, step.x, step.y );
                });
            });
        }

        // Action buttons
        // Easier to have the player use event handlers and check controls...
        if ( this.player.controls.a ) {
            const step = this.getStep( this.player.gamebox.hero.dir );

            this.player.gamebox.pressA( this.player.gamebox.hero.dir, delta, step.x, step.y );
        }

        if ( this.player.controls.bHold ) {
            this.player.gamebox.holdB();

        } else if ( this.player.controls.b ) {
            this.player.gamebox.pressB();
        }
    }


    getStep ( dir ) {
        let dirX = 0;
        let dirY = 0;

        if ( dir === "up" ) {
            dirY = -this.step;
        }

        if ( dir === "down" ) {
            dirY = this.step;
        }

        if ( dir === "left" ) {
            dirX = -this.step;
        }

        if ( dir === "right" ) {
            dirX = this.step;
        }

        return {
            x: dirX,
            y: dirY,
        }
    }
}



module.exports = GameCycle;
