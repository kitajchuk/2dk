const Utils = require( "./Utils" );



class GameCycle {
    constructor ( player ) {
        this.step = 1;
        this.player = player;
        this.run();
    }


    run () {
        this._blit = this.blit.bind( this );
        this._previousElapsed = 0;

        window.requestAnimationFrame( this._blit );
    }


    blit ( elapsed ) {
        window.requestAnimationFrame( this._blit );

        if ( this.player.stopped || this.player.paused ) {
            return;
        }

        const dpad = this.player.gamepad.checkDpad();
        let delta = (elapsed - this._previousElapsed) / 1000.0;

        delta = Math.min( delta, 0.25 ); // maximum delta of 250ms
        this._previousElapsed = elapsed;

        if ( !dpad.length ) {
            this.player.gamebox.releaseD();
        }

        dpad.forEach(( ctrl ) => {
            ctrl.dpad.forEach(( dir ) => {
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

                this.player.gamebox.pressD( dir, delta, dirX, dirY );
            });
        });
    }
}



module.exports = GameCycle;
