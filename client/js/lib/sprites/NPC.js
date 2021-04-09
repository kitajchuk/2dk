const Utils = require( "../Utils" );
const Config = require( "../Config" );
const Sprite = require( "./Sprite" );



/*******************************************************************************
* NPC Sprite
* Shifting states...
* AI logics?
*******************************************************************************/
class NPC extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.states = Utils.copy( this.data.states );
        this.dialogue = null;
        this.controls = {};
        // Initial cooldown period upon spawn (don't immediately move)
        // requestAnimationFrame runs 60fps so we use (60 * seconds)
        this.counter = this.data.ai ? (60 * 1) : 0;
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
            this.dialogue.then(() => {
                this.handleDialogue();

            }).catch(() => {
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
        this.updateStack();
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        const dirs = [];

        if ( this.controls.left ) {
            dirs.push( "left" );

        } else if ( this.controls.right ) {
            dirs.push( "right" );
        }

        if ( this.controls.up ) {
            dirs.push( "up" );

        } else if ( this.controls.down ) {
            dirs.push( "down" );
        }

        const poi = this.getNextPoi();
        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            npc: this.gamebox.checkNPC( poi, this ),
            hero: this.gamebox.checkHero( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
        };

        if ( collision.hero && this.data.ai === Config.npc.ROAM ) {
            if ( this.dir === "left" ) {
                this.gamebox.hero.physics.vx = -1;

            } else if ( this.dir === "right" ) {
                this.gamebox.hero.physics.vx = 1;

            } else if ( this.dir === "up" ) {
                this.gamebox.hero.physics.vy = -1;

            } else if ( this.dir === "down" ) {
                this.gamebox.hero.physics.vy = 1;
            }

        } else if ( !collision.map && !collision.npc && !collision.hero && !this.gamebox.canHeroTileStop( poi, null, collision ) ) {
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



/*******************************************************************************
* Interactions
*******************************************************************************/
    canInteract ( dir ) {
        return (this.state.action && this.state.action.require && this.state.action.require.dir && dir === this.state.action.require.dir);
    }


    doInteract () {
        if ( this.data.payload ) {
            this.payload();
        }

        if ( this.state.action.sound ) {
            this.gamebox.player.gameaudio.hitSound( this.state.action.sound );
        }

        if ( this.state.action.verb && this.data.verbs[ this.state.action.verb ] ) {
            this.verb = this.state.action.verb;
            this.dir = (this.state.action.dir || this.state.dir);
        }

        if ( this.state.action.shift ) {
            this.shift();
        }
    }
}



module.exports = NPC;
