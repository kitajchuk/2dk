const Utils = require( "../Utils" );
const Config = require( "../Config" );
const Sprite = require( "./Sprite" );
const { TweenLite, Power0, Power1, Power2, Power3, Power4 } = require( "gsap" );



/*******************************************************************************
* Companion Sprite
* Have different behaviors for being "anchored" to a Hero
*******************************************************************************/
class Companion extends Sprite {
    constructor ( data, hero ) {
        super( data, hero.map );
        this.hero = hero;
        this.watchFPS = 24;
        this.watchFrame = 0;
        this.checkFrame = 0;
        this.watchDur = 1000;
        this.controls = {};
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blit ( elapsed ) {
        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        if ( typeof this.watchElapsed === "undefined" ) {
            this.watchElapsed = elapsed;
        }

        // Companion type?
        if ( this.data.type === Config.npc.TILE ) {
            this.blitTile();

        } else if ( this.data.type === Config.npc.PET ) {
            this.blitPet();

        } else if ( this.data.type === Config.npc.FAIRY ) {
            this.blitFairy();
        }

        // Set watch cycle frame
        this.watchDiff = (elapsed - this.watchElapsed);
        this.checkFrame = Math.floor( (this.watchDiff / this.watchDur) * this.watchFPS );

        if ( this.watchDiff >= this.watchDur ) {
            this.watchElapsed = elapsed;
            this.watchFrame = 0;
            this.checkFrame = 0;
        }

        this.applyFrame( elapsed );
    }


    blitTile () {}


    blitFairy () {
        if ( this.position.z <= -(this.hero.height + 32) ) {
            this.physics.vz = 8;

        } else if ( this.position.z >= -(this.hero.height - 32) ) {
            this.physics.vz = -8;
        }

        if ( (this.hero.position.x + (this.hero.width / 2)) > (this.position.x + (this.width / 2)) ) {
            this.dir = "right";

        } else {
            this.dir = "left";
        }
    }


    blitPet () {
        // Hero is NOT idle, so moving
        // Hero IS idle but companion is within a threshold distance...
        if ( (!this.hero.idle.x || !this.hero.idle.y) || (this.hero.idle.x && this.hero.idle.y && this.distance > (this.map.gridsize / 2)) ) {
            // Bounce condition is TRUE
            // Position Z is zero, so bounce a bit...
            if ( this.data.bounce && this.position.z === 0 ) {
                this.physics.vz = -8;
            }
        }

        if ( (this.hero.position.x + (this.hero.width / 2)) > (this.position.x + (this.width / 2)) ) {
            this.dir = "right";

        } else {
            this.dir = "left";
        }
    }


    shadow () {
        if ( this.hero.data.shadow && (this.data.type === Config.npc.FAIRY) ) {
            // Shadows can always render to the BG since they are floored
            this.map.layers.background.onCanvas.context.drawImage(
                this.hero.image,
                Math.abs( this.hero.data.shadow.offsetX ),
                Math.abs( this.hero.data.shadow.offsetY ),
                this.hero.data.width,
                this.hero.data.height,
                this.offset.x,
                this.offset.y,
                this.width,
                this.height,
            );
        }
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.data.type === Config.npc.TILE ) {
            this.applyTilePosition();

        } else if ( this.data.type === Config.npc.PET ) {
            this.applyPetPosition();

        } else if ( this.data.type === Config.npc.FAIRY ) {
            this.applyFairyPosition();
        }
    }


    applyTilePosition () {
        if ( this.throwing ) {
            this.position.x = this.getNextX();
            this.position.y = this.getNextY();

        } else {
            this.position.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            this.position.y = this.hero.position.y - (this.height / 5);
        }
    }


    applyFairyPosition () {
        const poi = {};

        if ( this.hero.dir === "right" && this.hero.position.x > this.position.x ) {
            poi.x = this.hero.position.x - this.width;
            poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);

        } else if ( this.hero.dir === "left" && this.hero.position.x < this.position.x ) {
            poi.x = this.hero.position.x + this.hero.width;
            poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);

        } else if ( this.hero.dir === "up" && this.hero.position.y < this.position.y ) {
            poi.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            poi.y = this.hero.position.y + this.hero.height;

        } else if ( this.hero.dir === "down" && this.hero.position.y > this.position.y ) {
            poi.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            poi.y = this.hero.position.y + this.hero.height - (this.height * 2);
        }

        if ( !this.origin ) {
            this.origin = this.position;
            console.log( `Spawn Origin ${this.data.id} (${this.position.x}, ${this.position.y})` );
        }

        if ( (poi.x && poi.y) && (this.checkFrame !== this.watchFrame) ) {
            this.watchFrame = this.checkFrame;

            if ( this.tween ) {
                this.tween.kill();
            }

            const angle = Utils.getAngle( this.position, poi );
            const distance = Utils.getDistance( this.position, poi );
            const origin = {
                x: this.position.x,
                y: this.position.y,
            };
            const props = { dist: 0 };
            const duration = (!this.hero.idle.x && !this.hero.idle.y) ? 2.0 : 1.5;

            if ( distance > 1 ) {
                this.idle.x = false;
                this.idle.y = false;
                this.tween = TweenLite.to( props, duration, {
                    dist: distance,
                    ease: Power2.easeOut,
                    onUpdate: () => {
                        const dist = distance - (distance - props.dist);
                        const pos = Utils.translate( origin, angle, dist );

                        this.position.x = pos.x;
                        this.position.y = pos.y;
                    },
                    onComplete: () => {
                        this.tween = null;
                    }
                });

            } else {
                this.idle.x = true;
                this.idle.y = true;
            }
        }
    }


    applyPetPosition () {
        const poi = {};

        if ( this.hero.dir === "right" && this.hero.position.x > this.position.x ) {
            poi.x = this.hero.position.x - (this.width / 2);
            poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);

        } else if ( this.hero.dir === "left" && this.hero.position.x < this.position.x ) {
            poi.x = this.hero.position.x + this.hero.width - (this.width / 2);
            poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);

        } else if ( this.hero.dir === "up" && this.hero.position.y < this.position.y ) {
            poi.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            poi.y = this.hero.position.y + this.hero.height - (this.height / 2);

        } else if ( this.hero.dir === "down" && this.hero.position.y > this.position.y ) {
            poi.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            poi.y = this.hero.position.y - (this.height / 2);
        }

        if ( !this.origin ) {
            this.origin = this.position;
            console.log( `Spawn Origin ${this.data.id} (${this.position.x}, ${this.position.y})` );
        }

        if ( (poi.x && poi.y) && (this.checkFrame !== this.watchFrame) && (this.hero.verb !== Config.verbs.GRAB) ) {
            this.watchFrame = this.checkFrame;

            if ( this.tween ) {
                this.tween.kill();
            }

            const angle = Utils.getAngle( this.position, poi );
            const distance = Utils.getDistance( this.position, poi );
            const origin = {
                x: this.position.x,
                y: this.position.y,
            };
            const props = { dist: 0 };
            const duration = (!this.hero.idle.x && !this.hero.idle.y) ? 2.0 : 1.5;

            this.distance = distance;

            // Simple NPCs can operate with just FACE data
            // Checking for WALK data to shift sprite cycles while moving...
            if ( distance >= (this.map.gridsize / 4) && this.data.verbs[ Config.verbs.WALK ] ) {
                this.verb = Config.verbs.WALK;

            } else {
                this.verb = Config.verbs.FACE;
            }

            if ( distance >= 1 ) {
                this.idle.x = false;
                this.idle.y = false;

                this.tween = TweenLite.to( props, duration, {
                    dist: distance,
                    ease: Power2.easeOut,
                    onUpdate: () => {
                        const dist = distance - (distance - props.dist);
                        const pos = Utils.translate( origin, angle, dist );

                        this.position.x = pos.x;
                        this.position.y = pos.y;
                    },
                    onComplete: () => {
                        this.tween = null;
                    }
                });

            } else {
                this.idle.x = true;
                this.idle.y = true;
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

            let throwX;
            let throwY;
            const dist = 128;
            const props = {
                x: this.position.x,
                y: this.position.y,
            };
            const _complete = () => {
                this.tween.kill();
                this.tween = null;
                this.map.smokeObject( this );
                this.resolve();
            };

            if ( this.throwing === "left" ) {
                throwX = this.position.x - dist;
                throwY = this.hero.footbox.y - (this.height - this.hero.footbox.height);

            } else if ( this.throwing === "right" ) {
                throwX = this.position.x + dist;
                throwY = this.hero.footbox.y - (this.height - this.hero.footbox.height);

            } else if ( this.throwing === "up" ) {
                throwX = this.position.x;
                throwY = this.position.y - dist;

            }  else if ( this.throwing === "down" ) {
                throwX = this.position.x;
                throwY = this.hero.footbox.y + dist;
            }

            this.tween = TweenLite.to( props, 0.5, {
                x: throwX,
                y: throwY,
                ease: Power4.easeOut,
                onUpdate: () => {
                    this.position.x = this.tween._targets[ 0 ].x;
                    this.position.y = this.tween._targets[ 0 ].y;

                    const collision = this.gamebox.getCollision( this.position, this );

                    if ( collision.map || collision.box || collision.npc ) {
                        _complete();
                    }
                },
                onComplete: () => {
                    _complete();
                }
            });
        });
    }
}



module.exports = Companion;
