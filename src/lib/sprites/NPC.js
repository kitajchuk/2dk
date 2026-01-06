import Utils from "../Utils";
import Config, { DIRS } from "../Config";
import Sprite from "./Sprite";
import Projectile from "./Projectile";



/*******************************************************************************
* NPC Sprite
* Shifting states...
* AI logics?
*******************************************************************************/
export default class NPC extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.dialogue = null;
        
        // AI things...
        // Initial cooldown period upon spawn (don't immediately move)
        // requestAnimationFrame runs 60fps so we use (60 * seconds)
        this.aiCounter = this.data.ai ? 60 : 0;
        this.projectileCounter = this.data.projectile ? 120 : 0;
        this.projectile = null;
        this.dirX = null;
        this.dirY = null;
        this.stepsX = 0;
        this.stepsY = 0;
        this.states = structuredClone( this.data.states );

        this.initialize();
    }


    initialize () {
        const id = this.data.payload?.quest?.setItem;
        const item = this.gamebox.hero.items.find( ( item ) => item.id === id );
        // TODO: Make this more robust for more than just two states...
        const index = item && this.gamebox.hero.hasItem( item.id ) ? 1 : 0;
        this.setState( index );
    }


    hit ( ...args ) {
        super.hit( ...args );
        this.aiCounter = 0;
    }


    setState ( index ) {
        if ( !this.states.length ) {
            return;
        }

        this.stateIndex = index;
        this.state = this.states[ this.stateIndex ];
        this.dir = this.state.dir;
        this.verb = this.state.verb;
    }


    payload () {
        if ( this.data.payload.dialogue && !this.dialogue ) {
            // For basic text dialogue, we need to check for quests immediately...
            if ( this.data.payload.dialogue.type === Config.dialogue.types.TEXT ) {
                this.payloadQuest();
            }

            this.dialogue = this.gamebox.dialogue.play( this.data.payload.dialogue );
            this.dialogue.then( () => {
                this.resetDialogue();
                this.handleAI();

                // Reset the hero item get sequence...
                if ( this.gamebox.hero.itemGet ) {
                    this.gamebox.hero.itemGet = null;
                    this.gamebox.hero.stillTimer = 0;
                    this.gamebox.hero.face( "down" );
                }

                // For prompt dialogue, we need to check for quests on resolution (e.g. pressed "a")
                if ( this.data.payload.dialogue.type === Config.dialogue.types.PROMPT ) {
                    this.payloadQuest();
                }
                
            }).catch( () => {
                this.resetDialogue();
            });
        }
    }


    payloadQuest () {
        if ( this.data.payload.quest?.setFlag ) {
            this.handleQuestFlagUpdate( this.data.payload.quest.setFlag );
        }

        if ( this.data.payload.quest?.setItem ) {
            this.handleQuestItemUpdate( this.data.payload.quest.setItem );
        }
    }


    resetDialogue () {
        this.dialogue = null;
        this.dir = this.state.dir;
        this.verb = this.state.verb;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
* Update is overridden for Sprite subclasses with different behaviors
* Default behavior for a Sprite is to be static but with Physics forces
*******************************************************************************/
    update () {
        if ( !this.visible() ) {
            return;
        }

        this.handleControls();
        this.handleAI();
        this.handleProjectile();
        this.updateStack();
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.data.ai === Config.npc.ai.FLOAT ) {
            this.applyFloatPosition();

        } else {
            this.applyNormalPosition();
        }
    }


    applyFloatPosition () {
        const poi = this.getNextPoi();
        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            doors: this.gamebox.checkDoor( poi, this ),
        };
            
        if ( collision.map || collision.doors ) {
            this.position.z = -( this.map.data.tilesize * 0.75 );
            this.handleAI();
            return;
        }

        this.position = {
            x: poi.x,
            y: poi.y,
            z: -( this.map.data.tilesize * 0.75 ),
        };
    }


    applyNormalPosition () {
        const poi = this.getNextPoi();
        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            npc: this.gamebox.checkNPC( poi, this ),
            hero: this.gamebox.checkHero( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
            doors: this.gamebox.checkDoor( poi, this ),
        };
        const isCollision = (
            collision.map ||
            collision.npc ||
            collision.hero ||
            collision.doors ||
            this.canTileStop( poi, null, collision )
        );

        // Roaming NPCs can push the hero back...
        if ( collision.hero && this.gamebox.hero.canShield( this ) && this.data.ai === Config.npc.ai.ROAM ) {
            switch ( this.dir ) {
                case "left":
                    this.gamebox.hero.physics.vx = -1;
                    break;
                case "right": 
                    this.gamebox.hero.physics.vx = 1;
                    break;
                case "up":
                    this.gamebox.hero.physics.vy = -1;
                    break;
                case "down":
                    this.gamebox.hero.physics.vy = 1;
                    break;
            }
            return;
        }

        if ( isCollision ) {
            // Let wandering NPCs cool down before moving again
            // While roaming NPCs can immediately move again
            if ( this.data.ai === Config.npc.ai.ROAM || this.data.ai === Config.npc.ai.WALK ) {
                this.aiCounter = 0;
            }
            
            this.handleAI();
            return;
        }

        this.position = poi;
    }



/*******************************************************************************
* Handlers
*******************************************************************************/
    handleHealthCheck () {
        if ( !this.stats ) {
            return;
        }

        if ( this.stats.health <= 0 ) {
            this.gamebox.smokeObject( this, this.data.action.fx );
            this.player.gameaudio.hitSound( this.data.action.sound || Config.verbs.SMASH );
            this.map.killObject( "npcs", this );
            this.handleQuestFlagUpdate();

            if ( this.data.drops ) {
                this.gamebox.itemDrop( this.data.drops, this.position );
            }
        }
    }


    handleAI () {
        if ( this.stillTimer ) {
            return;
        }

        if ( this.data.ai ) {
            switch ( this.data.ai ) {
                case Config.npc.ai.ROAM:
                    this.handleRoam();
                    break;
                case Config.npc.ai.FLOAT:
                case Config.npc.ai.WANDER:
                    this.handleWander();
                    break;
            }
        }
    }


    handleRoam () {
        if ( !this.aiCounter ) {
            const min = this.data.ai === Config.npc.ai.WALK ? 240 : 120;
            const max = this.data.ai === Config.npc.ai.WALK ? 360 : 240;

            this.aiCounter = Utils.random( min, max );

            const lastDir = this.dir;
            const newDir = DIRS[ Utils.random( 0, DIRS.length - 1 ) ];

            // Always pick a new direction
            if ( lastDir === newDir ) {
                this.aiCounter = 0;
                this.handleRoam();
                return;
            }

            this.dir = newDir;

            // @check: hero-verb-check
            if ( this.can( Config.verbs.WALK ) ) {
                this.verb = Config.verbs.WALK;
            }
        } else {
            this.aiCounter--;
        }

        DIRS.forEach( ( dir ) => {
            if ( dir === this.dir ) {
                this.controls[ dir ] = true;

            } else {
                this.controls[ dir ] = false;
            }
        });
    }


    handleWander () {
        if ( !this.aiCounter ) {
            const lastDirX = this.dirX;
            const lastDirY = this.dirY;
            const newDirX = ["left", "right"][ Utils.random( 0, 2 ) ];
            const newDirY = ["down", "up"][ Utils.random( 0, 2 ) ];

            // Always pick a new direction
            if ( lastDirX === newDirX && lastDirY === newDirY ) {
                this.handleWander();
                return;
            }

            this.aiCounter = Utils.random( 60, 120 );
            this.stepsX = Utils.random( 30, 60 );
            this.stepsY = Utils.random( 30, 60 );
            this.dirX = newDirX;
            this.dirY = newDirY;

        } else {
            this.aiCounter--;
        }

        if ( this.stepsX ) {
            this.stepsX--;

            this.controls[ this.dirX ] = true;
            this.controls[ Config.opposites[ this.dirX ] ] = false;

            if ( this.data.verbs[ this.verb ][ this.dirX ] ) {
                this.dir = this.dirX;
            }

        } else {
            this.controls.left = false;
            this.controls.right = false;
        }

        if ( this.stepsY ) {
            this.stepsY--;

            this.controls[ this.dirY ] = true;
            this.controls[ Config.opposites[ this.dirY ] ] = false;

            if ( this.data.verbs[ this.verb ][ this.dirY ] ) {
                this.dir = this.dirY;
            }

        } else {
            this.controls.up = false;
            this.controls.down = false;
        }

        if ( !this.stepsX && !this.stepsY ) {
            this.verb = Config.verbs.FACE;
            this.controls = {};

        } else {
            if ( this.data.bounce && this.position.z === 0 ) {
                this.physics.vz = -6;
            }

            // @check: hero-verb-check
            if ( this.can( Config.verbs.WALK ) ) {
                this.verb = Config.verbs.WALK;
            }
        }
    }


    handleProjectile () {
        if ( !this.data.projectile ) {
            return;
        }

        if ( this.projectile ) {
            return;
        }

        if ( this.projectileCounter > 0 ) {
            this.projectileCounter--;

            if ( this.projectileCounter === 0 ) {
                const chance = Utils.random( 0, 100 );

                if ( chance <= 25 ) {
                    const data = this.gamebox.player.getMergedData({
                        id: this.data.projectile,
                    }, "projectiles" );

                    this.projectile = new Projectile( data, this.dir, this, this.map );
                }

                this.projectileCounter = 120;
            }
        }
    }


/*******************************************************************************
* Interactions
*******************************************************************************/
    canInteract ( dir ) {
        return ( this.state.action && ( !this.state.action.dir || dir === this.state.action.dir ) );
    }


    canDoAction ( verb ) {
        return ( this.data.action && this.data.action.verb && verb === this.data.action.verb );
    }


    doInteract () {
        // Handle dialogue payload
        if ( this.data.payload ) {
            const canDoPayload = this.canDoPayload();

            if ( !canDoPayload ) {
                return;
            }

            this.payload();
        }

        // Handle sound (skip if we're doing the item get sequence)
        if ( this.state.action.sound && !this.gamebox.hero.itemGet ) {
            this.player.gameaudio.hitSound( this.state.action.sound );
        }

        // Handle verb (allows unique sprite cycle to be set during the interaction)
        if ( this.state.action.verb && this.data.verbs[ this.state.action.verb ] ) {
            this.verb = this.state.action.verb;
            this.dir = this.state.dir;
        }

        // Handle shifting states (TODO: "shift" is a bad name for this...)
        if ( this.state.action.shift ) {
            this.setState( this.stateIndex + 1 );
        }
    }
}
