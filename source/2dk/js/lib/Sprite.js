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
        this.scale = this.gamebox.player.data.game.resolution;
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.dir = this.data.spawn.dir;
        this.verb = Config.verbs.FACE;
        this.image = Loader.cash( this.data.image );
        this.position = {
            x: this.data.spawn.x / this.scale,
            y: this.data.spawn.y / this.scale,
            z: 0,
        };
        // Hero offset is unique to camera
        // NPCs offset will simply be set to the NPCs position...
        this.offset = {
            x: 0,
            y: 0,
        };
        this.physics = {
            accx: 0,
            accy: 0,
            accz: 0,
            maxacc: 4 / this.scale,
            controlmaxacc: 4 / this.scale,
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
        this.spritecel = this.getCel();
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        // Set frame and sprite rendering cel
        this.setFrame( elapsed );
    }


    setFrame( elapsed ) {
        this.frame = 0;

        if ( this.data.verbs[ this.verb ][ this.dir ].stepsX ) {
            if ( this.verb === Config.verbs.LIFT && (this.idle.x && this.idle.y) ) {
                console.log( "static lift..." );

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


    getCel () {
        return [
            Math.abs( this.data.verbs[ this.verb ][ this.dir ].offsetX ) + (this.data.width * this.frame),
            Math.abs( this.data.verbs[ this.verb ][ this.dir ].offsetY ),
        ];
    }


    cycle ( verb, dir ) {
        this.dir = dir;
        this.verb = verb;
    }


    face ( dir ) {
        this.cycle( Config.verbs.FACE, dir );
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


    destroy () {
        this.data = null;
    }
}



/*******************************************************************************
* Hero
* There can be only one per Map
*******************************************************************************/
class Hero extends Sprite {
    constructor ( data, gamebox ) {
        super( data, gamebox );
    }


    update () {
        // Soft pause only affects Hero updates and NPCs
        // Hard stop will affect the entire blit/render engine...
        // if ( this.gamebox.player.paused ) {
        //     return;
        // }

        // Handle player controls
        this.handleControls();

        // Handle accelerations
        this.handleAccellerations();

        // Handle z gravity
        this.handleGravity();
        this.applyGravity();
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


    // getNextPoi () {
    //     return {
    //         x: this.getNextX(),
    //         y: this.getNextY(),
    //         z: this.getNextZ(),
    //     }
    // }


    getNextPoiByDir ( dir, ahead ) {
        if ( ahead && dir === "left" ) {
            this.physics.accx = -this.physics.maxacc;
        }

        if ( ahead && dir === "right" ) {
            this.physics.accx = this.physics.maxacc;
        }

        if ( ahead && dir === "up" ) {
            this.physics.accy = -this.physics.maxacc;
        }

        if ( ahead && dir === "down" ) {
            this.physics.accy = this.physics.maxacc;
        }

        return {
            x: (dir === "left" || dir === "right") ? this.getNextX() : this.position.x,
            y: (dir === "up" || dir === "down") ? this.getNextY() : this.position.y,
            z: this.position.z,
        }
    }


/*******************************************************************************
* Condition Appliers
*******************************************************************************/
    applyPosition ( poi, dir ) {
        this.dir = dir;
        this.position.x = poi.x;
        this.position.y = poi.y;
    }


    applyGravity () {
        this.position.z = this.getNextZ();

        if ( this.position.z > 0 ) {
            this.position.z = 0;
        }
    }


    applyOffset () {
        this.hitbox.x = this.position.x + (this.data.hitbox.x / this.scale);
        this.hitbox.y = this.position.y + (this.data.hitbox.y / this.scale);
        this.footbox.x = this.hitbox.x;
        this.footbox.y = this.hitbox.y + (this.hitbox.height / 2);

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
        if ( this.verb !== Config.verbs.LIFT ) {
            this.cycle( Config.verbs.WALK, this.dir );

        } else {
            this.cycle( this.verb, this.dir );
        }
    }


/*******************************************************************************
* Condition Handlers
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
}



/*******************************************************************************
* Projectile
* Creats a projectile object, even from an ActiveTile hero is carrying...
*******************************************************************************/
class Projectile {
    constructor ( activeTile, dir, dur ) {
        this.activeTile = activeTile;
        this.dir = dir;
        this.dur = dur;
        this.velocity();
    }


    velocity () {
        if ( this.dir === "up" ) {
            this.vy = -2;
            this.vx = 0;

        } else if ( this.dir === "down" ) {
            this.vy = 2;
            this.vx = 0;

        } else if ( this.dir === "left" ) {
            this.vx = -2;
            this.vy = 0;

        } else if ( this.dir === "right" ) {
            this.vx = 2;
            this.vy = 0;
        }
    }


    accelerator () {
        if ( this.dir === "up" ) {
            this.vy *= 0.99;
            this.vy -= 0.25;

        } else if ( this.dir === "down" ) {
            this.vy *= 0.99;
            this.vy += 0.25;

        } else if ( this.dir === "left" ) {
            this.vx *= 0.99;
            this.vx -= 0.25;

        } else if ( this.dir === "right" ) {
            this.vx *= 0.99;
            this.vx += 0.25;
        }
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        this.activeTile.position.x += this.vx;
        this.activeTile.position.y += this.vy;
        this.activeTile.hitbox.x = this.activeTile.position.x;
        this.activeTile.hitbox.y = this.activeTile.position.y;
        this.accelerator();

        const diff = (elapsed - this.previousElapsed);
        const collision = this.activeTile.gamebox.getCollision( this.activeTile.position, this.activeTile );

        if ( collision.map || collision.obj || collision.box ) {
            this.activeTile.destroy();
            this.resolve();
        }

        // if ( diff >= this.dur ) {
        //     this.activeTile.destroy();
        //     this.resolve();
        // }
    }


    // getValues () {
    //     const poi = {};
    //     const origin = this.activeTile.position;
    //
    //     if ( this.dir === "up" ) {
    //         poi.x = this.activeTile.position.x;
    //         poi.y = this.activeTile.position.y - this.dist;
    //
    //     } else if ( this.dir === "down" ) {
    //         poi.x = this.activeTile.position.x;
    //         poi.y = this.activeTile.position.y + this.dist;
    //
    //     } else if ( this.dir === "left" ) {
    //         poi.x = this.activeTile.position.x - this.dist;
    //         poi.y = this.activeTile.position.y + this.activeTile.map.gridsize;
    //
    //     } else if ( this.dir === "right" ) {
    //         poi.x = this.activeTile.position.x + this.dist;
    //         poi.y = this.activeTile.position.y + this.activeTile.map.gridsize;
    //     }
    //
    //     const angle = Utils.getAngle( this.activeTile.position, poi );
    //
    //     return {
    //         poi,
    //         angle,
    //         origin,
    //     }
    // }


    // update ( t ) {
    //     const distance = this.dist - (this.dist - t);
    //     const position = Utils.translate( this.values.origin, this.values.angle, distance );
    //
    //     this.activeTile.position = position;
    //     this.activeTile.hitbox.x = this.activeTile.position.x;
    //     this.activeTile.hitbox.y = this.activeTile.position.y;
    //
    //     const collision = this.activeTile.gamebox.getCollision( position, this.activeTile );
    //
    //     if ( collision.map || collision.obj || collision.box ) {
    //         this.tween.stop();
    //         this.activeTile.destroy();
    //         this.resolve();
    //     }
    // }


    fire () {
        return new Promise(( resolve ) => {
            this.resolve = resolve;
            // this.values = this.getValues();
            // this.tween = new Tween({
            //     ease: Easing.swing,
            //     duration: this.dur,
            //     from: 0,
            //     to: this.dist,
            //     update: this.update.bind( this ),
            //     complete: ( t ) => {
            //         this.update( t );
            //         this.activeTile.destroy();
            //         this.resolve();
            //     },
            // });
        });
    }
}



module.exports = {
    Hero,
    Sprite,
    Projectile,
};
