import Utils from "../Utils";
import Loader from "../Loader";
import Config from "../Config";



/*******************************************************************************
* Sprite
* Something that is "alive"...
* All sprites need update, blit, render AND destroy methods...
*******************************************************************************/
class Sprite {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
        this.gamebox = this.map.gamebox;
        this.scale = ( this.data.scale || 1 );
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.dir = ( this.data.dir || this.data.spawn.dir || "down" );
        this.verb = ( this.data.verb || Config.verbs.FACE );
        this.image = Loader.cash( this.data.image );
        this.speed = 1;
        this.frame = 0;
        this.opacity = ( data.opacity || 1.0 );
        this.mask = false;
        this.position = {
            x: ( this.data.spawn && this.data.spawn.x || 0 ),
            y: ( this.data.spawn && this.data.spawn.y || 0 ),
            z: ( this.data.spawn && this.data.spawn.z || 0 ),
        };
        this.physics = {
            vx: ( this.data.vx || 0 ),
            vy: ( this.data.vy || 0 ),
            vz: ( this.data.vz || 0 ),
            maxv: ( this.data.maxv || 4 ),
            controlmaxv: ( this.data.controlmaxv || 4 ),
            maxvstatic: ( this.data.maxv || 4 ),
            controlmaxvstatic: ( this.data.controlmaxv || 4 ),
        };
        // Hero offset is based on camera.
        // NPCs offset snaps to position.
        this.offset = {
            x: this.gamebox.offset.x + this.position.x,
            y: this.gamebox.offset.y + this.position.y,
        };
        this.idle = {
            x: true,
            y: true,
        };
        this.hitbox = {
            x: this.position.x + ( this.data.hitbox.x / this.scale ),
            y: this.position.y + ( this.data.hitbox.y / this.scale ),
            width: this.data.hitbox.width / this.scale,
            height: this.data.hitbox.height / this.scale,
        };
        this.footbox = {
            x: this.hitbox.x,
            y: this.hitbox.y + ( this.hitbox.height / 2 ),
            width: this.hitbox.width,
            height: this.hitbox.height / 2,
        };
        this.layer = ( this.data.layer || "background" );
        this.spritecel = this.getCel();
        this.previousElapsed = null;
        this.resetElapsed = false;
        this.frameStopped = false;
    }


    destroy () {}


    can ( verb ) {
        return !!this.data.verbs[ verb ];
    }


    is ( verb ) {
        return this.verb === verb;
    }


    visible () {
        return Utils.collide( this.gamebox.camera, {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height,
        });
    }


    isHero () {
        return this === this.gamebox.hero;
    }


    isCompanion () {
        return this === this.gamebox.companion;
    }


    isLifted () {
        return Utils.def( this.hero );
    }


    isIdle () {
        return ( this.idle.x && this.idle.y );
    }



/*******************************************************************************
* Rendering
* Order is: blit, update, render { renderBefore, renderAfter }
* Update is overridden for Sprite subclasses with different behaviors
* Default behavior for a Sprite is to be static but with Physics forces
*******************************************************************************/
    blit ( elapsed ) {
        if ( !this.visible() ) {
            return;
        }

        if ( this.previousElapsed === null ) {
            this.previousElapsed = elapsed;
        }

        // Set frame and sprite rendering cel
        this.applyFrame( elapsed );
    }


    update () {
        if ( !this.visible() ) {
            return;
        }

        this.updateStack();
    }


    updateStack () {
        // The physics stack...
        this.handleVelocity();
        this.handleGravity();
        this.applyPosition();
        this.applyHitbox();
        this.applyOffset();
        this.applyGravity();
    }


    render () {
        if ( !this.visible() ) {
            return;
        }

        if ( Utils.func( this.renderBefore ) ) {
            this.renderBefore();
        }

        // Move betweeb BG and FG relative to Hero
        if ( !this.isHero() && !this.isCompanion() ) {
            // Assume that FLOAT should always render to the foreground
            if ( this.data.type === Config.npc.FLOAT ) {
                this.layer = "foreground";

            // Sprites that have a smaller hitbox than their actual size can flip layer
            } else if ( ( this.hitbox.width * this.hitbox.height ) !== ( this.width * this.height ) ) {
                if ( this.hitbox.y > this.gamebox.hero.hitbox.y ) {
                    this.layer = "foreground";

                } else {
                    this.layer = "background";
                }
            }
        }

        if ( this.data.shadow && !this.is( Config.verbs.FALL ) && !this.mask ) {
            this.gamebox.layers[ this.layer ].onCanvas.context.drawImage(
                this.image,
                Math.abs( this.data.shadow.offsetX ),
                Math.abs( this.data.shadow.offsetY ),
                this.data.width,
                this.data.height,
                this.offset.x,
                this.offset.y,
                this.width,
                this.height
            );
        }

        if ( this.opacity ) {
            this.gamebox.layers[ this.layer ].onCanvas.context.globalAlpha = this.opacity;
        }

        const height = this.mask ? this.height / 1.25 : this.height;

        this.gamebox.layers[ this.layer ].onCanvas.context.drawImage(
            this.image,
            this.spritecel[ 0 ],
            this.spritecel[ 1 ],
            this.data.width,
            height,
            this.offset.x,
            this.offset.y + this.position.z,
            this.width,
            height
        );

        this.gamebox.layers[ this.layer ].onCanvas.context.globalAlpha = 1.0;

        if ( Utils.func( this.renderAfter ) ) {
            this.renderAfter();
        }
    }


    cycle ( verb, dir ) {
        this.dir = dir;
        this.verb = verb;
    }


    face ( dir ) {
        this.cycle( Config.verbs.FACE, dir );
    }



/*******************************************************************************
* Handlers
*******************************************************************************/
    handleVelocity () {
        if ( this.idle.x ) {
            this.physics.vx = Utils.goToZero( this.physics.vx );
        }

        if ( this.idle.y ) {
            this.physics.vy = Utils.goToZero( this.physics.vy );
        }
    }


    handleGravity () {
        this.physics.vz++;
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        // A lifted object
        // Need to NOT hardcode the 42 here...
        if ( this.isLifted() && !this.throwing ) {
            this.position.x = this.hero.position.x + ( this.hero.width / 2 ) - ( this.width / 2 );
            this.position.y = this.hero.position.y - this.height + 42;

        // Basic collision for NPCs...
        } else if ( !this.isLifted() ) {
            this.position = this.getNextPoi();
        }
    }


    applyHitbox () {
        this.hitbox.x = this.position.x + ( this.data.hitbox.x / this.scale );
        this.hitbox.y = this.position.y + ( this.data.hitbox.y / this.scale );
        this.footbox.x = this.hitbox.x;
        this.footbox.y = this.hitbox.y + ( this.hitbox.height / 2 );
    }


    applyOffset () {
        this.offset = {
            x: this.gamebox.offset.x + this.position.x,
            y: this.gamebox.offset.y + this.position.y,
        };
    }


    applyGravity () {
        this.position.z = this.getNextZ();

        if ( this.position.z > 0 ) {
            this.position.z = 0;
        }
    }


    applyFrame ( elapsed ) {
        if ( this.frameStopped ) {
            return;
        }

        this.frame = 0;

        // Useful for ensuring clean maths below for cycles like attacking...
        if ( this.resetElapsed ) {
            this.resetElapsed = false;
            this.previousElapsed = elapsed;
        }

        if ( this.data.verbs[ this.verb ][ this.dir ].stepsX ) {
            if ( this.is( Config.verbs.LIFT ) && this.isIdle() ) {
                Utils.log( "static lift..." );

            } else {
                const diff = ( elapsed - this.previousElapsed );

                this.frame = Math.min(
                    Math.floor( ( diff / this.data.verbs[ this.verb ].dur ) * this.data.verbs[ this.verb ][ this.dir ].stepsX ),
                    ( this.data.verbs[ this.verb ][ this.dir ].stepsX - 1 )
                );

                if ( diff >= this.data.verbs[ this.verb ].dur ) {
                    this.previousElapsed = elapsed;

                    if ( this.data.verbs[ this.verb ].stop ) {
                        this.frameStopped = true;

                    } else {
                        this.frame = 0;
                    }
                }
            }
        }

        this.spritecel = this.getCel();
    }


/*******************************************************************************
* Getters
*******************************************************************************/
    getCel () {
        return [
            Math.abs( this.data.verbs[ this.verb ][ this.dir ].offsetX ) + ( this.data.width * this.frame ),
            Math.abs( this.data.verbs[ this.verb ][ this.dir ].offsetY ),
        ];
    }


    getDur ( verb ) {
        return this.data.verbs[ verb ].dur || 0;
    }


    getNextX () {
        return this.position.x + Utils.limit( this.physics.vx, -this.physics.maxv, this.physics.maxv );
    }


    getNextY () {
        return this.position.y + Utils.limit( this.physics.vy, -this.physics.maxv, this.physics.maxv );
    }


    getNextZ () {
        return this.position.z + Utils.limit( this.physics.vz, -this.physics.maxv, this.physics.maxv );
    }


    getNextPoi () {
        return {
            x: this.getNextX(),
            y: this.getNextY(),
            z: this.getNextZ(),
        }
    }


    getNextPoiByDir ( dir, ahead ) {
        if ( ahead && dir === "left" ) {
            ahead = -this.physics.controlmaxv;
        }

        if ( ahead && dir === "right" ) {
            ahead = this.physics.controlmaxv;
        }

        if ( ahead && dir === "up" ) {
            ahead = -this.physics.controlmaxv;
        }

        if ( ahead && dir === "down" ) {
            ahead = this.physics.controlmaxv;
        }

        if ( !ahead ) {
            ahead = 0;
        }

        return {
            x: ( dir === "left" || dir === "right" ) ? ( this.getNextX() + ahead ) : this.position.x,
            y: ( dir === "up" || dir === "down" ) ? ( this.getNextY() + ahead ) : this.position.y,
            z: this.position.z,
        }
    }


    getHitbox ( poi ) {
        return {
            x: poi.x + ( this.data.hitbox.x / this.scale ),
            y: poi.y + ( this.data.hitbox.y / this.scale ),
            width: this.hitbox.width,
            height: this.hitbox.height,
        };
    }


    getFootbox ( poi ) {
        return {
            x: poi.x + ( this.data.hitbox.x / this.scale ),
            y: poi.y + ( ( this.data.hitbox.y / this.scale ) + ( this.hitbox.height / 2 ) ),
            width: this.footbox.width,
            height: this.footbox.height,
        };
    }
}



export default Sprite;
