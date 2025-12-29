import Utils from "../Utils";
import Config, { DIRS } from "../Config";
import Sprite from "./Sprite";



/*******************************************************************************
* NPC Sprite
* Shifting states...
* AI logics?
*******************************************************************************/
class NPC extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.states = structuredClone( this.data.states );
        this.dialogue = null;
        
        // AI things...
        // Initial cooldown period upon spawn (don't immediately move)
        // requestAnimationFrame runs 60fps so we use (60 * seconds)
        this.counter = this.data.ai ? 60 : 0;
        this.dirX = null;
        this.dirY = null;
        this.stepsX = 0;
        this.stepsY = 0;

        this.shift();
    }


    destroy () {}


    shift () {
        if ( this.states.length ) {
            this.state = this.states.shift();
            this.dir = this.state.dir;
            this.verb = this.state.verb;
        }
    }


    payload () {
        if ( this.data.payload.dialogue && !this.dialogue ) {
            this.dialogue = this.gamebox.dialogue.play( this.data.payload.dialogue );
            this.dialogue.then( () => {
                this.resetDialogue();
                this.handleAI();
            }).catch( () => {
                this.resetDialogue();
            });
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
        const wouldLeaveTextures = this.gamebox.checkTextures( poi, this );
            
        if ( wouldLeaveTextures ) {
            this.position.z = -this.map.data.tilesize;
            this.handleAI();
            return;
        }

        this.position = {
            x: poi.x,
            y: poi.y,
            z: -this.map.data.tilesize,
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
        // TODO: Bring this back when we handle enemies and shield properly...
        // if ( collision.hero && this.data.ai === Config.npc.ai.ROAM ) {
        //     switch ( this.dir ) {
        //         case "left":
        //             this.gamebox.hero.physics.vx = -1;
        //             break;
        //         case "right": 
        //             this.gamebox.hero.physics.vx = 1;
        //             break;
        //         case "up":
        //             this.gamebox.hero.physics.vy = -1;
        //             break;
        //         case "down":
        //             this.gamebox.hero.physics.vy = 1;
        //             break;
        //     }
        //     return;
        // }

        if ( isCollision ) {
            // Let wandering NPCs cool down before moving again
            // While roaming NPCs can immediately move again
            if ( this.data.ai === Config.npc.ai.ROAM ) {
                this.counter = 0;
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
            this.handleQuestUpdate();
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
        if ( !this.counter ) {
            this.counter = Utils.random( 60, 120 );

            const lastDir = this.dir;
            const newDir = DIRS[ Utils.random( 0, DIRS.length ) ];

            // Always pick a new direction
            if ( lastDir === newDir ) {
                this.counter = 0;
                this.handleRoam();
                return;
            }

            this.dir = newDir;

            // @check: hero-verb-check
            if ( this.can( Config.verbs.WALK ) ) {
                this.verb = Config.verbs.WALK;
            }
        } else {
            this.counter--;
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
        if ( !this.counter ) {
            const lastDirX = this.dirX;
            const lastDirY = this.dirY;
            const newDirX = ["left", "right"][ Utils.random( 0, 2 ) ];
            const newDirY = ["down", "up"][ Utils.random( 0, 2 ) ];

            // Always pick a new direction
            if ( lastDirX === newDirX && lastDirY === newDirY ) {
                this.handleWander();
                return;
            }

            this.counter = Utils.random( 60, 120 );
            this.stepsX = Utils.random( 30, 60 );
            this.stepsY = Utils.random( 30, 60 );
            this.dirX = newDirX;
            this.dirY = newDirY;

        } else {
            this.counter--;
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
            this.payload();
        }

        // Handle sound
        if ( this.state.action.sound ) {
            this.player.gameaudio.hitSound( this.state.action.sound );
        }

        // Handle verb (allows unique sprite cycle to be set during the interaction)
        if ( this.state.action.verb && this.data.verbs[ this.state.action.verb ] ) {
            this.verb = this.state.action.verb;
            this.dir = this.state.dir;
        }

        // Handle shifting states
        if ( this.state.action.shift ) {
            this.shift();
        }
    }
}



export default NPC;
