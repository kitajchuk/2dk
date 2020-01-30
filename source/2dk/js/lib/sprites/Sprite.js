const Utils = require( "../Utils" );
const Loader = require( "../Loader" );
const Config = require( "../Config" );



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
        this.scale = this.gamebox.camera.resolution;
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.dir = (this.data.dir || "down");
        this.verb = (this.data.verb || Config.verbs.FACE);
        this.image = Loader.cash( this.data.image );
        this.frame = 0;
        this.position = {
            x: (this.data.spawn && this.data.spawn.x || 0) / this.scale,
            y: (this.data.spawn && this.data.spawn.y || 0) / this.scale,
            z: (this.data.spawn && this.data.spawn.z || 0) / this.scale,
        };
        this.physics = {
            vx: (this.data.vx || 0),
            vy: (this.data.vy || 0),
            vz: (this.data.vz || 0),
            maxv: (this.data.maxv || 4) / this.scale,
            controlmaxv: (this.data.controlmaxv || 4) / this.scale,
        };
        // Hero offset is based on camera.
        // NPCs offset snaps to position.
        this.offset = {
            x: this.map.offset.x + this.position.x,
            y: this.map.offset.y + this.position.y,
        };
        this.idle = {
            x: true,
            y: true,
        };
        this.hitbox = {
            x: this.position.x + (this.data.hitbox.x / this.scale),
            y: this.position.y + (this.data.hitbox.y / this.scale),
            width: this.data.hitbox.width / this.scale,
            height: this.data.hitbox.height / this.scale,
        };
        this.footbox = {
            x: this.hitbox.x,
            y: this.hitbox.y + (this.hitbox.height / 2),
            width: this.hitbox.width,
            height: this.hitbox.height / 2,
        };
        this.layer = (this.data.layer || "background");
        this.relative = (this.hitbox.height !== this.height); // A better way?
        this.spritecel = this.getCel();
    }


    destroy () {
        if ( this.tween ) {
            this.tween.kill();
            this.tween = null;
        }
    }



/*******************************************************************************
* Rendering
* Order is: blit, update, render
* Update is overridden for Sprite subclasses with different behaviors
* Default behavior for a Sprite is to be static but with Physics forces
*******************************************************************************/
    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        // Hero can blit companions
        if ( typeof this.blitCompanions === "function" ) {
            this.blitCompanions( elapsed );
        }

        // Set frame and sprite rendering cel
        this.applyFrame( elapsed );
    }


    update () {
        // Build in handlControls( this.controls )?
        // The physics stack...
        this.handleVelocity();
        this.handleGravity();
        this.applyPosition();
        this.applyHitbox();
        this.applyOffset();
        this.applyGravity();
    }


    render () {
        if ( this.relative ) {
            if ( this.hitbox.y > this.map.hero.hitbox.y ) {
                this.layer = "foreground";

            } else {
                this.layer = "background";
            }
        }

        if ( this.data.shadow ) {
            this.map.layers[ this.layer ].onCanvas.context.drawImage(
                this.image,
                Math.abs( this.data.shadow.offsetX ),
                Math.abs( this.data.shadow.offsetY ),
                this.data.width,
                this.data.height,
                this.offset.x,
                this.offset.y,
                this.width,
                this.height,
            );
        }

        // Hero can render companions
        if ( typeof this.renderCompanions === "function" ) {
            this.renderCompanions();
        }

        this.map.layers[ this.layer ].onCanvas.context.drawImage(
            this.image,
            this.spritecel[ 0 ],
            this.spritecel[ 1 ],
            this.data.width,
            this.data.height,
            this.offset.x,
            this.offset.y + this.position.z,
            this.width,
            this.height,
        );

        // Debug rendering...
        if ( this.gamebox.player.query.debug ) {
            this.renderDebug();
        }
    }


    renderDebug () {
        this.map.layers[ this.layer ].onCanvas.context.globalAlpha = 0.5;
        this.map.layers[ this.layer ].onCanvas.context.fillStyle = Config.colors.red;

        // Hitbox
        this.map.layers[ this.layer ].onCanvas.context.fillRect(
            this.offset.x + (this.data.hitbox.x / this.scale),
            this.offset.y + (this.data.hitbox.y / this.scale),
            this.hitbox.width,
            this.hitbox.height,
        );

        // Footbox
        this.map.layers[ this.layer ].onCanvas.context.fillRect(
            this.offset.x + (this.data.hitbox.x / this.scale),
            this.offset.y + (this.data.hitbox.y / this.scale) + (this.hitbox.height / 2),
            this.hitbox.width,
            this.hitbox.height / 2,
        );

        this.map.layers[ this.layer ].onCanvas.context.globalAlpha = 1.0;
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


    handleControls ( controls ) {
        if ( controls.left ) {
            this.physics.vx = Utils.limit( this.physics.vx - 1, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.x = false;

        } else if ( controls.right ) {
            this.physics.vx = Utils.limit( this.physics.vx + 1, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.x = false;

        } else {
            this.idle.x = true;
        }

        if ( controls.up ) {
            this.physics.vy = Utils.limit( this.physics.vy - 1, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.y = false;

        } else if ( controls.down ) {
            this.physics.vy = Utils.limit( this.physics.vy + 1, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.y = false;

        } else {
            this.idle.y = true;
        }
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        this.position = this.getNextPoi();
    }


    applyHitbox () {
        this.hitbox.x = this.position.x + (this.data.hitbox.x / this.scale);
        this.hitbox.y = this.position.y + (this.data.hitbox.y / this.scale);
        this.footbox.x = this.hitbox.x;
        this.footbox.y = this.hitbox.y + (this.hitbox.height / 2);
    }


    applyOffset () {
        this.offset = {
            x: this.map.offset.x + this.position.x,
            y: this.map.offset.y + this.position.y,
        };
    }


    applyGravity () {
        this.position.z = this.getNextZ();

        if ( this.position.z > 0 ) {
            this.position.z = 0;
        }
    }


    applyFrame( elapsed ) {
        this.frame = 0;

        if ( this.data.verbs[ this.verb ][ this.dir ].stepsX ) {
            if ( this.verb === Config.verbs.LIFT && (this.idle.x && this.idle.y) ) {
                // console.log( "static lift..." );

            } else {
                const diff = (elapsed - this.previousElapsed);

                this.frame = Math.floor( (diff / this.data.verbs[ this.verb ].dur) * this.data.verbs[ this.verb ][ this.dir ].stepsX );

                if ( diff >= this.data.verbs[ this.verb ].dur ) {
                    this.previousElapsed = elapsed;
                    this.frame = this.data.verbs[ this.verb ][ this.dir ].stepsX - 1;
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
            Math.abs( this.data.verbs[ this.verb ][ this.dir ].offsetX ) + (this.data.width * this.frame),
            Math.abs( this.data.verbs[ this.verb ][ this.dir ].offsetY ),
        ];
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
            x: (dir === "left" || dir === "right") ? (this.getNextX() + ahead) : this.position.x,
            y: (dir === "up" || dir === "down") ? (this.getNextY() + ahead) : this.position.y,
            z: this.position.z,
        }
    }


    getHitbox ( poi ) {
        return {
            x: poi.x + (this.data.hitbox.x / this.scale),
            y: poi.y + (this.data.hitbox.y / this.scale),
            width: this.hitbox.width,
            height: this.hitbox.height,
        };
    }


    getFootbox ( poi ) {
        return {
            x: poi.x + (this.data.hitbox.x / this.scale),
            y: poi.y + ((this.data.hitbox.y / this.scale) + (this.hitbox.height / 2)),
            width: this.footbox.width,
            height: this.footbox.height,
        };
    }
}



module.exports = Sprite;
