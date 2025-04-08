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
        this.attacked = false;
        
        // AI things...
        this.controls = {};
        // Initial cooldown period upon spawn (don't immediately move)
        // requestAnimationFrame runs 60fps so we use (60 * seconds)
        this.counter = this.data.ai ? ( 60 * 1 ) : 0;
        this.dirX = null;
        this.dirY = null;
        this.stepsX = 0;
        this.stepsY = 0;

        if ( this.data.stats ) {
            this.stats = structuredClone( this.data.stats );
        }

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
                this.handleDialogue();

            }).catch( () => {
                this.handleDialogue();
            });
        }
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

        this.gamebox.handleControls( this.controls, this );
        this.handleAI();
        this.updateStack();
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        const poi = this.getNextPoi();
        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            npc: this.gamebox.checkNPC( poi, this ),
            hero: this.gamebox.checkHero( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
        };
        const isCollision = (
            collision.map ||
            collision.npc ||
            collision.hero ||
            this.gamebox.canHeroTileStop( poi, null, collision )
        );

        // Roaming NPCs can push the hero back...
        if ( collision.hero && this.data.ai === Config.npc.ROAM ) {
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

        } else if ( !isCollision ) {
            this.position = poi;
        }
    }



/*******************************************************************************
* Handlers
*******************************************************************************/
    handleDialogue () {
        this.dialogue = null;
        this.dir = this.state.dir;
        this.verb = this.state.verb;
    }


    handleAI () {
        if ( this.data.ai && !this.attacked ) {
            switch ( this.data.ai ) {
                case Config.npc.ROAM:
                    this.handleRoam();
                    break;
                case Config.npc.WANDER:
                    this.handleWander();
                    break;
            }
        }
    }


    handleRoam () {
        if ( !this.counter ) {
            this.counter = Utils.random( 64, 192 );
            this.dir = DIRS[ Utils.random( 0, DIRS.length ) ];

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
            this.counter = Utils.random( 100, 200 );
            this.stepsX = Utils.random( 4, 60 );
            this.stepsY = Utils.random( 4, 60 );
            this.dirX = ["left", "right"][ Utils.random( 0, 2 ) ];
            this.dirY = ["down", "up"][ Utils.random( 0, 2 ) ];

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
        return ( this.state.action && this.state.action.dir && dir === this.state.action.dir );
    }


    doInteract () {
        // Handle dialogue payload
        if ( this.data.payload ) {
            this.payload();
        }

        // Handle sound
        if ( this.state.action.sound ) {
            this.gamebox.player.gameaudio.hitSound( this.state.action.sound );
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
