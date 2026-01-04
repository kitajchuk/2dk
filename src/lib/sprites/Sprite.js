import Utils from "../Utils";
import Loader from "../Loader";
import Config from "../Config";



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
        this.scale = ( this.data.scale || 1 );
        this.width = this.data.width / this.scale;
        this.height = this.data.height / this.scale;
        this.dir = ( this.data.dir || this.data.spawn.dir || "down" );
        this.verb = ( this.data.verb || Config.verbs.FACE );
        this.image = Loader.cash( this.data.image );
        this.speed = 1;
        this.frame = 0;
        this.opacity = ( data.opacity || 1.0 );
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
        // Things like FX don't need to have a hitbox so we can just have a fallback
        this.data.hitbox = this.data.hitbox || {
            x: 0,
            y: 0,
            width: this.data.width,
            height: this.data.height,
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
        this.stats = this.data.stats ? structuredClone( this.data.stats ) : {
            power: 1,
            health: 1,
            strength: 0,
        };
        // Cannot increase health beyond this value...
        this.maxHealth = this.stats.health;
    }


    destroy () {}


    can ( verb ) {
        return !!this.data.verbs[ verb ];
    }


    is ( verb ) {
        return this.verb === verb;
    }


    cycle ( verb, dir ) {
        this.dir = dir;
        this.verb = verb;
    }


    face ( dir ) {
        this.cycle( Config.verbs.FACE, dir );
    }


    visible () {
        return Utils.collide( this.gamebox.camera, this.getFullbox() );
    }


    hit ( power = 1, timer = 50 ) {
        this.counter = 0;
        this.hitTimer = timer;
        this.stillTimer = timer;
        this.resetPhysics();
        this.face( this.dir );

        if ( this.stats ) {
            this.stats.health -= power;
        }
    }


    isIdle () {
        return ( this.idle.x && this.idle.y );
    }


    isHitOrStill () {
        return this.hitTimer > 0 || this.stillTimer > 0;
    }


    isJumping () {
        return this.position.z < 0;
    }


    checkStat ( stat, value ) {
        return this.stats[ stat ] >= value;
    }


    updateStat ( stat, value ) {
        if ( stat === "health" ) {
            this.stats[ stat ] = Math.min( this.stats[ stat ] + value, this.maxHealth );
            return;
        }

        this.stats[ stat ] += value;
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

        this.applyRenderLayer();

        if ( this.data.shadow && !this.is( Config.verbs.FALL ) ) {
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

        this.gamebox.draw(
            this.image,
            this.spritecel[ 0 ],
            this.spritecel[ 1 ],
            this.data.width,
            this.data.height,
            this.offset.x,
            this.offset.y + this.position.z,
            this.width,
            this.height
        );

        this.gamebox.mapLayer.context.globalAlpha = 1.0;

        if ( Utils.func( this.renderAfter ) ) {
            this.renderAfter();
        }

        if ( this.player.query.get( "debug" ) ) {
            this.renderDebug();
        }
    }


    renderDebug () {
        this.gamebox.mapLayer.context.globalAlpha = 0.25;
        this.gamebox.mapLayer.context.fillStyle = Config.colors.white;
        this.gamebox.mapLayer.context.fillRect(
            this.offset.x,
            this.offset.y,
            this.width,
            this.height
        );
        this.gamebox.mapLayer.context.globalAlpha = 0.5;
        this.gamebox.mapLayer.context.fillStyle = Config.colors.red;
        this.gamebox.mapLayer.context.fillRect(
            this.offset.x + ( this.data.hitbox.x / this.scale ),
            this.offset.y + ( this.data.hitbox.y / this.scale ),
            this.hitbox.width,
            this.hitbox.height
        );
        this.gamebox.mapLayer.context.fillStyle = Config.colors.green;
        this.gamebox.mapLayer.context.fillRect(
            this.offset.x + ( this.data.hitbox.x / this.scale ),
            this.offset.y + ( this.data.hitbox.y / this.scale ) + ( this.hitbox.height / 2 ),
            this.footbox.width,
            this.footbox.height
        );
        this.gamebox.mapLayer.context.globalAlpha = 1.0;
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
            this.gamebox.mapLayer.context.globalAlpha = this.opacity;
        }

        if ( this.hitTimer > 0 ) {
            if ( this.hitTimer % 5 === 0 ) {
                this.gamebox.mapLayer.context.globalAlpha = 0.25;
            }
        }
    }


    // Can be handled in the subclass...
    applyRenderLayer () {}


    applyPosition () {
        this.position = this.getNextPoi();
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
                Utils.log( "Static lift..." );

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


    getFullbox () {
        return {
            x: this.position.x,
            // Keep an eye on the use of position.z here...
            y: this.position.y + this.position.z,
            width: this.width,
            height: this.height,
        };
    }


/*******************************************************************************
* Checks
*******************************************************************************/
    canTileStop ( poi, dir, collision ) {
        return ( collision.tiles && collision.tiles.action.length && collision.tiles.action.find( ( tile ) => {
            return tile.stop;
        }) );
    }


    canTileFall ( poi, dir, collision ) {
        return ( collision.tiles && collision.tiles.action.length && collision.tiles.action.find( ( tile ) => {
            return tile.fall && Utils.contains( tile.tilebox, this.footbox );
        }) );
    }


    // This is more specifically an NPC or Door payload check...
    // This should be moved but we'd need to refactor NPC subclass patterns first...
    canDoPayload () {
        if ( this.data.payload.quest?.checkItem ) {
            const { id, dialogue } = this.data.payload.quest.checkItem;

            if ( !this.gamebox.hero.hasItem( id ) ) {
                // A simple message to the player...
                if ( dialogue ) {
                    this.gamebox.dialogue.auto( dialogue );
                }
                return false;
            }
        }

        return true;
    }


/*******************************************************************************
* Quests
*******************************************************************************/
    checkQuestFlag ( quest ) {
        if ( this.data.action?.quest?.checkFlag ) {
            const { key, value } = this.data.action.quest.checkFlag;

            if ( key === quest ) {
                return this.gamequest.checkQuest( key, value );

            }
        }

        return false;
    }


    isQuestFlagComplete () {
        if ( this.data.action?.quest?.checkFlag ) {
            const { key } = this.data.action.quest.checkFlag;
            return this.gamequest.getCompleted( key );
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

        const { key, value } = setFlag || this.data.action.quest.setFlag;

        if ( this.gamequest.getCompleted( key ) ) {
            return;
        }

        this.gamequest.hitQuest( key, value );
        this.gamebox.checkQuestsFlags( key );
    }


    handleQuestItemUpdate ( itemId ) {
        this.gamebox.hero.giveItem( itemId );
    }
}
