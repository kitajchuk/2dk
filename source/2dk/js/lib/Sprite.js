const Utils = require( "./Utils" );
const Loader = require( "./Loader" );
const Config = require( "./Config" );
const { TweenLite, Power4 } = require( "gsap" );



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
        this.dir = (this.data.spawn && this.data.spawn.dir || "down");
        this.verb = Config.verbs.FACE;
        this.image = Loader.cash( this.data.image );
        this.float = (this.data.float || 0);
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
            x: 0,
            y: 0,
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
        this.relative = (this.hitbox.height !== this.height);
        this.spritecel = this.getCel();
    }


    destroy () {
        this.data = null;

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



/*******************************************************************************
* NPC Sprite
* Shifting states...
* AI logics?
*******************************************************************************/
class NPC extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.states = Utils.copy( this.data.states );
        this.shift();
    }


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();
            this.dir = this.state.dir;
            this.verb = this.state.verb;
        }
    }


    payload () {
        if ( this.data.payload.dialogue ) {
            this.gamebox.dialogue.play( this.data.payload.dialogue );
        }
    }


    canInteract ( dir ) {
        return (this.state.action && this.state.action.require && this.state.action.require.dir && dir === this.state.action.require.dir);
    }


    doInteract ( dir ) {
        if ( this.data.payload ) {
            this.payload();
        }

        if ( this.state.action.sound ) {
            this.gamebox.player.gameaudio.hitSound( this.state.action.sound );
        }

        if ( this.state.action.shift ) {
            this.shift();
        }
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
        this.watchFPS = 24;
        this.watchFrame = 0;
        this.checkFrame = 0;
        this.watchDur = 1000;
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

        // Set sprite cycle frame
        // if ( this.data ) {
        this.applyFrame( elapsed );
        // }
    }


    blitFairy () {
        if ( this.position.z <= -(this.hero.height + 32) ) {
            this.physics.vz = 8;

        } else if ( this.position.z >= -(this.hero.height - 32) ) {
            this.physics.vz = -8;
        }

        if ( this.hero.position.x > this.position.x ) {
            this.dir = "right";

        } else {
            this.dir = "left";
        }
    }


    blitPet () {
        if ( (!this.hero.idle.x || !this.hero.idle.y) || (this.hero.idle.x && this.hero.idle.y && this.distance > 24) ) {
            if ( this.position.z === 0 ) {
                this.physics.vz = -8;
            }
        }

        if ( this.hero.position.x > this.position.x ) {
            this.dir = "right";

        } else {
            this.dir = "left";
        }
    }


    blitTile () {
        if ( this.throwing ) {
            if ( this.position.z >= 0 ) {
                this.map.smokeObject( this );
                this.resolve();
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
            this.physics.vz = -8;
            this.float = false;
        });
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
                    ease: Power4.easeOut,
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

            if ( distance > 1 ) {
                this.idle.x = false;
                this.idle.y = false;

                // Simple NPCs can operate with just FACE data
                // Checking for WALK data to shift sprite cycles while moving...
                // if ( this.data.verbs[ Config.verbs.WALK ] ) {
                //     this.verb = Config.verbs.WALK;
                // }

                this.tween = TweenLite.to( props, duration, {
                    dist: distance,
                    ease: Power4.easeOut,
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
                // this.verb = Config.verbs.FACE;
            }
        }
    }


    applyTilePosition () {
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

        // Companions
        this.companions = [];

        if ( this.data.companion ) {
            this.data.companion = Utils.merge( this.gamebox.player.data.npcs.find( ( obj ) => (obj.id === this.data.companion.id) ), this.data.companion );
            this.data.companion.spawn = {
                x: this.position.x,
                y: this.position.y,
                z: 0,
                dir: this.data.companion.dir,
            };

            this.addCompanion( this.data.companion );
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
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    update () {
        // Handle player controls
        this.handleControls();

        // The physics stack...
        this.handleVelocity();
        this.handleGravity();
        this.applyGravity();

        // Companions
        this.updateCompanions();

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


    blitCompanions ( elapsed ) {
        if ( this.companions.length ) {
            this.companions.forEach(( companion ) => {
                companion.blit( elapsed );
            });
        }
    }


    updateCompanions () {
        if ( this.companions.length ) {
            this.companions.forEach(( companion ) => {
                companion.update();
            });
        }
    }


    renderCompanions () {
        if ( this.companions.length ) {
            this.companions.forEach(( companion ) => {
                companion.render();
            });
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
            this.physics.vx = Utils.limit( this.physics.vx - 1, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.x = false;

        } else if ( this.gamebox.player.controls.right ) {
            this.physics.vx = Utils.limit( this.physics.vx + 1, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.x = false;

        } else {
            this.idle.x = true;
        }

        if ( this.gamebox.player.controls.up ) {
            this.physics.vy = Utils.limit( this.physics.vy - 1, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.y = false;

        } else if ( this.gamebox.player.controls.down ) {
            this.physics.vy = Utils.limit( this.physics.vy + 1, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.y = false;

        } else {
            this.idle.y = true;
        }
    }
}



module.exports = {
    NPC,
    Hero,
    Sprite,
};
