import Utils from "../Utils";
import Loader from "../Loader";
import Config, { DIRS } from "../Config";



/*******************************************************************************
* Sprite
* Something that is "alive"...
* All sprites need update, blit, render AND destroy methods...
*******************************************************************************/
export default class Sprite {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
        this.gamebox = this.map.gamebox;
        this.player = this.gamebox.player;
        this.gamequest = this.gamebox.gamequest;
        this.layer = (data.layer || "heroground");
        this.scale = ( this.data.scale || 1 );
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.dir = ( this.data.dir || this.data.spawn.dir || "down" );
        this.verb = ( this.data.verb || Config.verbs.FACE );
        this.image = Loader.cash( this.data.image );
        this.frame = 0;
        this.opacity = ( data.opacity || 1.0 );
        this.position = {
            x: ( this.data.spawn && this.data.spawn.x || 0 ),
            y: ( this.data.spawn && this.data.spawn.y || 0 ),
            z: ( this.data.spawn && this.data.spawn.z || 0 ),
        };
        this.prio = this.position.y + this.height;
        this.onscreen = false;
        this.speed = Config.physics.speed;
        this.physics = {
            vx: ( this.data.vx || 0 ),
            vy: ( this.data.vy || 0 ),
            vz: ( this.data.vz || 0 ),
            maxv: ( this.data.maxv || Config.physics.maxv ),
            controlmaxv: ( this.data.controlmaxv || Config.physics.maxv ),
            maxvstatic: ( this.data.maxv || Config.physics.maxv ),
            controlmaxvstatic: ( this.data.controlmaxv || Config.physics.maxv ),
        };
        // Hero offset is based on camera.
        // NPCs offset snaps to position.
        this.offset = {
            x: this.position.x - this.gamebox.camera.x,
            y: this.position.y - this.gamebox.camera.y,
        };
        this.idle = {
            x: true,
            y: true,
        };
        // Things like FX don't need to have a hitbox so we can just have a fallback
        this.data.hitbox = this.data.hitbox || {
            x: 0,
            y: 0,
            width: this.data.width / this.scale,
            height: this.data.height / this.scale,
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
        this.perceptionBox = Utils.getPerceptionBox(
            this.position,
            this.width,
            this.height,
            this.map.data.tilesize
        );
        this.spritecel = this.getCel();
        this.previousElapsed = null;
        this.resetElapsed = false;
        this.frameStopped = false;
        // Used for things like NPCs or Heros that need controls
        this.controls = {
            left: false,
            right: false,
            up: false,
            down: false,
        };
        // Used for things like NPCs, enemies, Hero etx...
        this.hitTimer = 0;
        this.stillTimer = 0;
        this.stats = {
            power: this.data.stats?.power ?? 1,
            strength: this.data.stats?.strength ?? 0,
        };
        this.health = this.data.stats?.health ?? 1;
        // Cannot increase health beyond this value...
        this.maxHealth = this.health;
    }


    destroy () {}


    can ( verb ) {
        return !!this.data.verbs[ verb ];
    }


    is ( verb ) {
        return this.verb === verb;
    }


    cycle ( verb, dir ) {
        // Reset frame when verb changes
        if ( verb !== this.verb ) {
            this.frame = 0;
        }

        this.dir = dir;
        this.verb = verb;
    }


    face ( dir ) {
        this.cycle( Config.verbs.FACE, dir );
    }


    hit ( power = 1, timer = 50 ) {
        this.hitTimer = timer;
        this.stillTimer = timer;
        this.frame = 0;
        this.health = Math.max( this.health - power, 0 );
        this.resetPhysics();
    }


    isIdle () {
        return ( this.idle.x && this.idle.y );
    }


    isOnGround () {
        return this.position.z === 0;
    }


    isHitOrStill () {
        return this.hitTimer > 0 || this.stillTimer > 0;
    }


    isJumping () {
        return this.position.z < 0;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render { renderBefore, renderAfter }
* Update is overridden for Sprite subclasses with different behaviors
* Default behavior for a Sprite is to be static but with Physics forces
*******************************************************************************/
    visible () {
        this.onscreen = Utils.collide( this.gamebox.camera, this.getFullbox() );
        
        // Don't mess with Hero sprites (e.g. mask FX or lifted tile etc...)
        if ( !this.hero ) {
            if ( !this.onscreen ) {
                this.map.removeAllSprite( this );
            } else {
                this.map.addAllSprite( this );
            }
        }

        return this.onscreen;
    }


    blit ( elapsed ) {
        // Call visible() on blit to assign onscreen property
        // Then update() and render() can use that rather than executing again
        if ( !this.visible() ) {
            return;
        }

        if ( this.previousElapsed === null ) {
            this.previousElapsed = elapsed;
        }

        if ( this.hitTimer > 0 ) {
            this.hitTimer--;

            if ( this.hitTimer === 0 ) {
                this.handleHealthCheck();
            }
        }

        if ( this.stillTimer > 0 ) {
            this.stillTimer--;
        }

        // Set frame and sprite rendering cel
        this.applyFrame( elapsed );

        if ( Utils.func( this.blitAfter ) ) {
            this.blitAfter( elapsed );
        }
    }


    update () {
        if ( !this.onscreen ) {
            return;
        }

        this.updateStack();
    }


    updateStack () {
        // The physics stack...
        this.handleVelocity();
        this.handleGravity();
        this.applyPosition();
        this.applyPriority();
        this.applyHitbox();
        this.applyOffset();
        this.applyGravity();
    }


    render () {
        if ( !this.onscreen ) {
            return;
        }

        if ( Utils.func( this.renderBefore ) ) {
            this.renderBefore();
        }

        if ( 
            this.data.shadow &&
            !this.is( Config.verbs.FALL ) &&
            !this.is( Config.verbs.DIVE ) &&
            !this.is( Config.verbs.SWIM )
        ) {
            this.gamebox.draw(
                this.image,
                this.data.shadow.offsetX,
                this.data.shadow.offsetY,
                this.data.width,
                this.data.height,
                this.offset.x,
                this.offset.y,
                this.width,
                this.height
            );
        }

        this.applyOpacity();

        const flipX = this.data.verbs[ this.verb ][ this.dir ].flipX;
        const flipY = this.data.verbs[ this.verb ][ this.dir ].flipY;

        this.player.renderLayers.gamebox.context.save();
        this.player.renderLayers.gamebox.context.translate(
            flipX ? this.width : 0,
            flipY ? this.height : 0
        );
        this.player.renderLayers.gamebox.context.scale(
            flipX ? -1 : 1,
            flipY ? -1 : 1
        );

        this.gamebox.draw(
            this.image,
            this.spritecel[ 0 ],
            this.spritecel[ 1 ],
            this.data.width,
            this.data.height,
            this.offset.x * ( flipX ? -1 : 1 ),
            this.offset.y * ( flipY ? -1 : 1 ) + this.position.z,
            this.width,
            this.height
        );

        this.player.renderLayers.gamebox.context.restore();

        if ( Utils.func( this.renderAfter ) ) {
            this.renderAfter();
        }

        if ( this.player.query.get( "debug" ) ) {
            this.renderDebug();
        }
    }


    renderDebug () {
        this.player.renderLayers.gamebox.context.save();
        
        // Full sprite box
        this.player.renderLayers.gamebox.context.globalAlpha = 0.25;
        this.player.renderLayers.gamebox.context.fillStyle = Config.colors.white;
        this.player.renderLayers.gamebox.context.fillRect(
            this.offset.x,
            this.offset.y,
            this.width,
            this.height
        );

        // Hitbox
        this.player.renderLayers.gamebox.context.globalAlpha = 0.5;
        this.player.renderLayers.gamebox.context.fillStyle = Config.colors.red;
        this.player.renderLayers.gamebox.context.fillRect(
            this.offset.x + ( this.data.hitbox.x / this.scale ),
            this.offset.y + ( this.data.hitbox.y / this.scale ),
            this.hitbox.width,
            this.hitbox.height
        );

        // Footbox
        this.player.renderLayers.gamebox.context.fillStyle = Config.colors.green;
        this.player.renderLayers.gamebox.context.fillRect(
            this.offset.x + ( this.data.hitbox.x / this.scale ),
            this.offset.y + ( this.data.hitbox.y / this.scale ) + ( this.hitbox.height / 2 ),
            this.footbox.width,
            this.footbox.height
        );

        // Nearest tiles within perception box
        this.player.renderLayers.gamebox.context.globalAlpha = 0.25;
        this.player.renderLayers.gamebox.context.fillStyle = Config.colors.yellow;
        this.player.renderLayers.gamebox.context.fillRect(
            this.perceptionBox.tileBox.x * this.map.data.tilesize - this.gamebox.camera.x,
            this.perceptionBox.tileBox.y * this.map.data.tilesize - this.gamebox.camera.y,
            this.perceptionBox.tileBox.width * this.map.data.tilesize,
            this.perceptionBox.tileBox.height * this.map.data.tilesize
        );

        this.player.renderLayers.gamebox.context.restore();
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


    handleResetControls () {
        for ( let i = DIRS.length; i--; ) {
            this.controls[ DIRS[ i ] ] = false;
        }
    }


    // Can be handled in the subclass...
    handleHealthCheck () {}


    handleControls () {
        if ( this.stillTimer ) {
            return;
        }
    
        if ( this.controls.left ) {
            this.physics.vx = Utils.limit( this.physics.vx - this.speed, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.x = false;
    
        } else if ( this.controls.right ) {
            this.physics.vx = Utils.limit( this.physics.vx + this.speed, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.x = false;
    
        } else {
            this.idle.x = true;
        }
    
        if ( this.controls.up ) {
            this.physics.vy = Utils.limit( this.physics.vy - this.speed, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.y = false;
    
        } else if ( this.controls.down ) {
            this.physics.vy = Utils.limit( this.physics.vy + this.speed, -this.physics.controlmaxv, this.physics.controlmaxv );
            this.idle.y = false;
    
        } else {
            this.idle.y = true;
        }
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyOpacity () {
        if ( this.opacity ) {
            this.player.renderLayers.gamebox.context.globalAlpha = this.opacity;
        }

        if ( this.hitTimer > 0 ) {
            if ( this.hitTimer % 5 === 0 ) {
                this.player.renderLayers.gamebox.context.globalAlpha = 0.25;
            }
        }
    }


    applyPosition () {
        this.position = this.getNextPoi();
    }


    applyPriority () {
        this.prio = this.position.y + this.height;
    }


    applyHitbox () {
        this.hitbox.x = this.position.x + ( this.data.hitbox.x / this.scale );
        this.hitbox.y = this.position.y + ( this.data.hitbox.y / this.scale );
        this.footbox.x = this.hitbox.x;
        this.footbox.y = this.hitbox.y + ( this.hitbox.height / 2 );
        this.perceptionBox = Utils.getPerceptionBox(
            this.position,
            this.width,
            this.height,
            this.map.data.tilesize
        );
    }


    applyOffset () {
        this.offset = {
            x: this.position.x - this.gamebox.camera.x,
            y: this.position.y - this.gamebox.camera.y,
        };
    }


    applyGravity () {
        const nextZ = this.getNextZ();

        if ( nextZ > 0 ) {
            this.position.z = 0;

        } else {
            this.position.z = nextZ;
        }
    }


    applyFrame ( elapsed ) {
        if ( this.frameStopped ) {
            return;
        }

        // Useful for ensuring clean maths below for cycles like attacking...
        if ( this.resetElapsed ) {
            this.resetElapsed = false;
            this.previousElapsed = elapsed;
        }

        if ( this.data.verbs[ this.verb ][ this.dir ].stepsX ) {
            if ( this.is( Config.verbs.LIFT ) && this.isIdle() ) {
                // Do nothing...

            } else {
                const interval = this.data.verbs[ this.verb ].dur / this.data.verbs[ this.verb ][ this.dir ].stepsX;
                const delta = ( elapsed - this.previousElapsed );

                if ( delta >= interval ) {
                    this.previousElapsed = elapsed - ( delta % interval );
                    this.frame++;

                    if ( this.frame >= this.data.verbs[ this.verb ][ this.dir ].stepsX ) {
                        this.previousElapsed = null;

                        if ( this.data.verbs[ this.verb ].stop ) {
                            this.frame = this.data.verbs[ this.verb ][ this.dir ].stepsX - 1;
                            this.frameStopped = true;

                        } else {
                            this.frame = 0;
                        }
                    }
                }
            }

        } else {
            this.frame = 0;
        }

        this.spritecel = this.getCel();
    }


/*******************************************************************************
* Getters
*******************************************************************************/
    getCel () {
        return [
            this.data.verbs[ this.verb ][ this.dir ].offsetX + ( this.data.width * this.frame ),
            this.data.verbs[ this.verb ][ this.dir ].offsetY,
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


    resetPhysics () {
        this.physics.vx = 0;
        this.physics.vy = 0;
        this.physics.vz = 0;
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
            ahead = -this.physics.maxv;
        }

        if ( ahead && dir === "right" ) {
            ahead = this.physics.maxv;
        }

        if ( ahead && dir === "up" ) {
            ahead = -this.physics.maxv;
        }

        if ( ahead && dir === "down" ) {
            ahead = this.physics.maxv;
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


    getFullbox ( poi = null ) {
        const position = poi || this.position;

        return {
            x: position.x,
            // Keep an eye on the use of position.z here...
            y: position.y + position.z,
            width: this.width,
            height: this.height,
        };
    }


/*******************************************************************************
* Checks
*******************************************************************************/
    canTileStop ( collision ) {
        return ( collision.tiles && collision.tiles.action.length && collision.tiles.action.find( ( tile ) => {
            return tile.stop;
        }) );
    }
}



/*******************************************************************************
* Quest interface
* TODO: Refactor because at this point the core NPC class doesn't use this...
*******************************************************************************/
export class QuestSprite extends Sprite {
    constructor ( data, map ) {
        super( data, map );
    }


    checkQuestFlag ( quest ) {
        if ( this.data.action?.quest?.checkFlag ) {
            const { key, value } = this.data.action.quest.checkFlag;

            if ( key === quest ) {
                return this.gamequest.checkQuest( key, value );

            }
        }

        return false;
    }


    // Can be handled in the subclass...
    handleQuestFlagCheck () {}


    // Can be handled in the subclass...
    handleQuestItemCheck () {}


    handleQuestFlagUpdate ( setFlag ) {
        if ( !this.data.action?.quest?.setFlag && !setFlag ) {
            return;
        }

        const { key, value, reset } = setFlag || this.data.action.quest.setFlag;

        if ( this.gamequest.getCompleted( key ) ) {
            return;
        }

        this.gamequest.hitQuest( key, value, reset );
        this.gamebox.checkQuestFlags( key );
    }


    // Can be handled in the subclass...
    handleQuestItemUpdate () {}
}
