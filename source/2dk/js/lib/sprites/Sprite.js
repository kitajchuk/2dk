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
        this.scale = (this.data.scale || 1);
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.dir = (this.data.dir || this.data.spawn.dir || "down");
        this.verb = (this.data.verb || Config.verbs.FACE);
        this.image = Loader.cash( this.data.image );
        this.speed = 1;
        this.frame = 0;
        this.opacity = (data.opacity || 1);
        this.position = {
            x: (this.data.spawn && this.data.spawn.x || 0),
            y: (this.data.spawn && this.data.spawn.y || 0),
            z: (this.data.spawn && this.data.spawn.z || 0),
        };
        this.physics = {
            vx: (this.data.vx || 0),
            vy: (this.data.vy || 0),
            vz: (this.data.vz || 0),
            maxv: (this.data.maxv || 4),
            controlmaxv: (this.data.controlmaxv || 4),
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
        this.spritecel = this.getCel();
    }


    destroy () {}


    visible () {
        return Utils.collide( this.map.camera, {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height,
        });
    }



/*******************************************************************************
* Rendering
* Order is: blit, update, render
* Update is overridden for Sprite subclasses with different behaviors
* Default behavior for a Sprite is to be static but with Physics forces
*******************************************************************************/
    blit ( elapsed ) {
        if ( !this.visible() ) {
            return;
        }

        if ( typeof this.previousElapsed === "undefined" ) {
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

        // Move betweeb BG and FG relative to Hero
        if ( this !== this.map.hero ) {
            // Assume that FLOAT should always render to the foreground
            if ( this.data.type === Config.npc.FLOAT ) {
                this.layer = "foreground";

            // Companions can flip between layers depending on hero position
            } else if ( this.hero && (this.hitbox.y > this.map.hero.hitbox.y) ) {
                this.layer = "foreground";

            // Sprites that have a smaller hitbox than their actual size can flip layer
            } else if ( (this.hitbox.width * this.hitbox.height) !== (this.width * this.height) && (this.hitbox.y > this.map.hero.hitbox.y) ) {
                this.layer = "foreground";

            } else {
                this.layer = "background";
            }
        }

        if ( this.data.shadow ) {
            this.map.layers.background.onCanvas.context.drawImage(
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

        if ( this.opacity ) {
            this.map.layers[ this.layer ].onCanvas.context.globalAlpha = this.opacity;
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

        this.map.layers[ this.layer ].onCanvas.context.globalAlpha = 1.0;

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


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        // A lifted object
        if ( this.hero ) {
            if ( !this.throwing ) {
                this.position.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
                this.position.y = this.hero.position.y - this.height + 42;
            }

        // Basic collision for NPCs...
        } else {
            this.position = this.getNextPoi();
        }
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
