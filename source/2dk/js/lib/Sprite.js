const Utils = require( "./Utils" );
const Loader = require( "./Loader" );
const Config = require( "./Config" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );



/*******************************************************************************
* Sprite
* Something that is "alive"...
*******************************************************************************/
class Sprite {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
        this.gamebox = this.map.gamebox;
        this.scale = this.gamebox.camera.resolution;
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.dir = this.data.spawn.dir;
        this.verb = Config.verbs.FACE;
        this.image = Loader.cash( this.data.image );
        this.float = this.data.float || false;
        this.position = {
            x: this.data.spawn.x / this.scale,
            y: this.data.spawn.y / this.scale,
            z: this.data.spawn.z / this.scale,
        };
        // Hero offset is based on camera.
        // NPCs offset snaps to position.
        this.offset = {
            x: 0,
            y: 0,
        };
        this.idle = {
            x: true,
            y: true,
        };
        this.physics = {
            accx: 0,
            accy: 0,
            accz: 0,
            maxacc: 5 / this.scale,
            controlmaxacc: 5 / this.scale,
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
        this.spritecel = this.getCel();
        this.companions = [];
    }


    destroy () {
        this.data = null;

        if ( this.companion ) {
            this.companion.destroy();
            this.companion = null;
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

        // Set frame and sprite rendering cel
        this.applyFrame( elapsed );

        // Companions
        if ( this.companions.length ) {
            this.companions.forEach(( companion ) => {
                companion.blit( elapsed );
            });
        }
    }


    update () {
        // The physics stack...
        this.handleAccellerations();
        this.handleGravity();
        this.applyPosition();
        this.applyHitbox();
        this.applyOffset();
        this.applyGravity();

        // Companions
        if ( this.companions.length ) {
            this.companions.forEach(( companion ) => {
                companion.update();
            });
        }
    }


    render () {
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

        this.map.layers.background.onCanvas.context.drawImage(
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

        // Companions
        if ( this.companions.length ) {
            this.companions.forEach(( companion ) => {
                companion.render();
            });
        }

        // Debug rendering...
        if ( this.gamebox.player.query.debug ) {
            this.map.layers.background.onCanvas.context.globalAlpha = 0.5;
            this.map.layers.background.onCanvas.context.fillStyle = Config.colors.red;

            // Hitbox
            this.map.layers.background.onCanvas.context.fillRect(
                this.offset.x + (this.data.hitbox.x / this.scale),
                this.offset.y + (this.data.hitbox.y / this.scale),
                this.hitbox.width,
                this.hitbox.height,
            );

            // Footbox
            this.map.layers.background.onCanvas.context.fillRect(
                this.offset.x + (this.data.hitbox.x / this.scale),
                this.offset.y + (this.data.hitbox.y / this.scale) + (this.hitbox.height / 2),
                this.hitbox.width,
                this.hitbox.height / 2,
            );

            this.map.layers.background.onCanvas.context.globalAlpha = 1.0;
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
    handleAccellerations () {
        if ( this.idle.x ) {
            this.physics.accx = Utils.goToZero( this.physics.accx );
        }

        if ( this.idle.y ) {
            this.physics.accy = Utils.goToZero( this.physics.accy );
        }
    }


    handleGravity () {
        this.physics.accz++;
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
        if ( this.float ) {
            return;
        }

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
        return this.position.x + Utils.limit( this.physics.accx, -this.physics.maxacc, this.physics.maxacc );
    }


    getNextY () {
        return this.position.y + Utils.limit( this.physics.accy, -this.physics.maxacc, this.physics.maxacc );
    }


    getNextZ () {
        return this.position.z + Utils.limit( this.physics.accz, -this.physics.maxacc, this.physics.maxacc );
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
            ahead = -this.physics.controlmaxacc;
        }

        if ( ahead && dir === "right" ) {
            ahead = this.physics.controlmaxacc;
        }

        if ( ahead && dir === "up" ) {
            ahead = -this.physics.controlmaxacc;
        }

        if ( ahead && dir === "down" ) {
            ahead = this.physics.controlmaxacc;
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



/*******************************************************************************
* Companion Sprite
* Have different behaviors for being "anchored" to a Hero
*******************************************************************************/
class Companion extends Sprite {
    constructor ( data, hero ) {
        super( data, hero.map );
        this.hero = hero;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    update () {
        // The physics stack...
        this.handleAccellerations();
        this.handleGravity();
        this.applyPosition();
        this.applyHitbox();
        this.applyOffset();
        this.applyGravity();

        // Companion type?
        if ( this.data.companion === "activetile" ) {
            this.updateActiveTile();
        }
    }


    updateActiveTile () {
        if ( this.throwing ) {
            if ( this.position.z >= 0 ) {
                this.map.smokeObject( this );
                this.hero.spliceCompanion( this );
                this.resolve();
                this.destroy();
            }
        }
    }


/*******************************************************************************
* Handlers
*******************************************************************************/
    handleThrow () {
        return new Promise(( resolve ) => {
            this.resolve = resolve;
            this.throwing = this.hero.dir;
            this.physics.accz = -8;
            this.float = false;
        });
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.data.companion === "activetile" ) {
            this.applyActiveTilePosition();
        }
    }


    applyActiveTilePosition () {
        if ( this.throwing ) {
            this.position.x = this.getNextX();
            this.position.y = this.getNextY();

        } else {
            this.position.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            this.position.y = this.hero.position.y + (this.hero.height - this.height);
        }
    }
}



/*******************************************************************************
* Hero
* There can be only one per Map
*******************************************************************************/
class Hero extends Sprite {
    constructor ( data, map ) {
        super( data, map );
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    update () {
        // Handle player controls
        this.handleControls();

        // The physics stack...
        this.handleAccellerations();
        this.handleGravity();
        this.applyGravity();

        // Companions
        if ( this.companions.length ) {
            this.companions.forEach(( companion ) => {
                companion.update();
            });
        }

        // Soft pause only affects Hero updates and NPCs
        // Hard stop will affect the entire blit/render engine...
        if ( !this.gamebox.player.paused ) {
            // D-Pad movement
            // Easier to check the gamepad than have player use event handlers...
            const dpad = this.gamebox.player.gamepad.checkDpad();

            if ( !dpad.length ) {
                this.gamebox.releaseD();
                this.gamebox.handleCollision( this.getNextPoi(), this.dir );

            } else {
                dpad.forEach(( ctrl ) => {
                    ctrl.dpad.forEach(( dir ) => {
                        this.gamebox.pressD( dir );
                    });
                });
            }

            // Action buttons
            // Easier to have the player use event handlers and check controls...
            if ( this.gamebox.player.controls.aHold ) {
                this.gamebox.holdA();

            } else if ( this.gamebox.player.controls.a ) {
                this.gamebox.pressA();
            }

            if ( this.gamebox.player.controls.bHold ) {
                this.gamebox.holdB();

            } else if ( this.gamebox.player.controls.b ) {
                this.gamebox.pressB();
            }
        }
    }


    addCompanion ( data ) {
        const companion = new Companion( data, this );

        this.companions.push( companion );

        return companion;
    }


    throwCompanion ( companion ) {
        return companion.handleThrow();
    }


    spliceCompanion ( companion ) {
        for ( let i = this.companions.length; i--; ) {
            if ( this.companions[ i ] === companion ) {
                this.companions.splice( i, 1 );
                break;
            }
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

        // Idle comes next...LIFT has it's own idle face...
        } else if ( this.idle.x && this.idle.y ) {
            this.face( this.dir );

        } else {
            this.cycle( Config.verbs.WALK, this.dir );
        }
    }


/*******************************************************************************
* Handlers
*******************************************************************************/
    handleControls () {
        if ( this.gamebox.player.controls.left ) {
            this.physics.accx = Utils.limit( this.physics.accx - 1, -this.physics.controlmaxacc, this.physics.controlmaxacc );
            this.idle.x = false;

        } else if ( this.gamebox.player.controls.right ) {
            this.physics.accx = Utils.limit( this.physics.accx + 1, -this.physics.controlmaxacc, this.physics.controlmaxacc );
            this.idle.x = false;

        } else {
            this.idle.x = true;
        }

        if ( this.gamebox.player.controls.up ) {
            this.physics.accy = Utils.limit( this.physics.accy - 1, -this.physics.controlmaxacc, this.physics.controlmaxacc );
            this.idle.y = false;

        } else if ( this.gamebox.player.controls.down ) {
            this.physics.accy = Utils.limit( this.physics.accy + 1, -this.physics.controlmaxacc, this.physics.controlmaxacc );
            this.idle.y = false;

        } else {
            this.idle.y = true;
        }
    }
}



module.exports = {
    Hero,
    Sprite,
};
