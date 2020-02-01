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
        this.speed = 0.5;
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

        dirs.forEach(( dir ) => {
            const poi = this.getNextPoiByDir( dir );
            const collision = {
                map: this.gamebox.checkMap( poi, this ),
                tiles: this.gamebox.checkTiles( poi, this ),
            };
            const isStopTile = (collision.tiles && collision.tiles.action.length && collision.tiles.action[ 0 ].stop);

            if ( !collision.map && !collision.tiles && !isStopTile ) {
                this.position = poi;

            } else {
                if ( dir === "left" ) {
                    this.physics.vx = 8;

                } else if ( dir === "right" ) {
                    this.physics.vx = -8;
                }

                if ( dir === "up" ) {
                    this.physics.vy = 8;

                } else if ( dir === "down" ) {
                    this.physics.vy = -8;
                }
            }
        });
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


    doInteract ( dir ) {
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
