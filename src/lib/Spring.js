import Config from "./Config";



class Spring {
    constructor ( player, x = 0, y = 0, stiffness = 30, damping = 1.5, mass = 0.1 ) {
        this.player = player;
        this.position = {
            x,
            y,
        };
        this.poi = {
            x,
            y,
        };
        this.velocity = {
            x: 0,
            y: 0,
        };
        this.mass = mass;
        this.stiffness = stiffness;
        this.damping = damping;
        this.errorMargin = 0.001;
        this.isResting = false;
        this.sprite = null;
        this.previousElapsed = null;

        this.player.on( Config.broadcast.PAUSED, () => {
            this.previousElapsed = null;
        });
    }


    bind ( sprite ) {
        this.sprite = sprite;
    }


    blit ( elapsed ) {
        if ( this.previousElapsed === null ) {
            this.previousElapsed = elapsed;
        }

        if ( Math.abs( this.position.x - this.poi.x ) < this.errorMargin && Math.abs( this.position.y - this.poi.y ) < this.errorMargin ) {
            this.previousElapsed = elapsed;
            this.isResting = true;
            return;
        }

        const timeSinceLastFrame = elapsed - this.previousElapsed;
        const timeStep = timeSinceLastFrame / 1000;

        this.previousElapsed = elapsed;
        this.isResting = false;

        const springX = -this.stiffness * ( this.position.x - this.poi.x );
        const damperX = -this.damping * this.velocity.x;
        const accelerationX = ( springX + damperX ) / this.mass;

        const springY = -this.stiffness * ( this.position.y - this.poi.y );
        const damperY = -this.damping * this.velocity.y;
        const accelerationY = ( springY + damperY ) / this.mass;

        this.velocity.x += ( accelerationX * timeStep );
        this.velocity.y += ( accelerationY * timeStep );
        this.position.x += ( this.velocity.x * timeStep );
        this.position.y += ( this.velocity.y * timeStep );

        if ( this.sprite ) {
            this.sprite.position.x = this.position.x;
            this.sprite.position.y = this.position.y;
        }
    }
}



export default Spring;