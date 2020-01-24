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
        };
        this.offset = {
            x: 0,
            y: 0,
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
        this.moving = false;
        this.moveTimer = null;
    }


    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        this.frame = 0;

        if ( this.data.verbs[ this.verb ][ this.dir ].stepsX ) {
            if ( this.verb === Config.verbs.LIFT && !this.moving ) {
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
            this.offset.y,
            this.width,
            this.height,
        );

        // Debug rendering...
        if ( this.gamebox.player.query.debug ) {
            this.map.layers.background.onCanvas.context.globalAlpha = 0.5;

            // Hitbox
            this.map.layers.background.onCanvas.context.fillStyle = Config.colors.red;
            this.map.layers.background.onCanvas.context.fillRect(
                this.offset.x + (this.data.hitbox.x / this.scale),
                this.offset.y + (this.data.hitbox.y / this.scale),
                this.hitbox.width,
                this.hitbox.height,
            );

            // Footbox
            this.map.layers.background.onCanvas.context.fillStyle = Config.colors.black;
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


    update ( poi, offset ) {
        this.position = poi;
        this.hitbox.x = this.position.x + (this.data.hitbox.x / this.scale);
        this.hitbox.y = this.position.y + (this.data.hitbox.y / this.scale);
        this.footbox.x = this.hitbox.x;
        this.footbox.y = this.hitbox.y + (this.hitbox.height / 2);

        clearTimeout( this.moveTimer );

        this.moving = true;
        // console.log( "Hero is moving" );

        this.moveTimer = setTimeout(() => {
            this.moving = false;
            // console.log( "Hero is idle" );

        }, Config.values.debounceDur );

        const absolute = {
            x: Math.abs( offset.x ),
            y: Math.abs( offset.y ),
        };

        this.offset = {
            x: (this.gamebox.camera.width / 2) - (this.width / 2),
            y: (this.gamebox.camera.height / 2) - (this.height / 2),
        };

        if ( absolute.x <= 0 ) {
            // this.offset.x = Math.max( 0, poi.x );
            this.offset.x = poi.x;
        }

        if ( absolute.x >= (this.gamebox.map.width - this.gamebox.camera.width) ) {
            this.offset.x = poi.x + offset.x;
        }

        if ( absolute.y <= 0 ) {
            // this.offset.y = Math.max( 0, poi.y );
            this.offset.y = poi.y
        }

        if ( absolute.y >= (this.gamebox.map.height - this.gamebox.camera.height) ) {
            this.offset.y = poi.y + offset.y;
        }
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
