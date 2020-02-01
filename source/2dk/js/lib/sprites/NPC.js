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

        this.updateControls();
        this.handleControls( this.controls );
        this.updateStack();
    }


    updateControls () {
        if ( this.data.ai === "wander" ) {
            this.updateWander();
        }
    }


    updateWander () {
        if ( !this.counter ) {
            // this.counter = Utils.random( 60, 180 );
            this.counter = 5 * 60;
            this.stepsX = Utils.random( 20, 50 );
            this.stepsY = Utils.random( 20, 50 );
            this.dirX = ["left", "right"][ Utils.random( 0, 2 ) ];
            this.dirY = ["up", "down"][ Utils.random( 0, 2 ) ];

            console.log(
                `Sprite: ${this.data.id}`,
                `Countdown: ${this.counter}`,
                `${this.dirX}: ${this.stepsX}`,
                `${this.dirY}: ${this.stepsY}`,
            );

        } else {
            this.counter--;
        }

        if ( this.stepsX ) {
            this.stepsX--;

            if ( this.dirX === "left" ) {
                this.controls.left = 1;
                this.controls.right = 0;
                this.dir = "left";

            } else {
                this.controls.right = 1;
                this.controls.left = 0;
                this.dir = "right";
            }

        } else {
            this.controls.left = 0;
            this.controls.right = 0;
        }

        if ( this.stepsY ) {
            this.stepsY--;

            if ( this.dirY === "up" ) {
                this.controls.up = 1;
                this.controls.down = 0;

            } else {
                this.controls.down = 1;
                this.controls.up = 0;
            }

        } else {
            this.controls.up = 0;
            this.controls.down = 0;
        }

        if ( !this.stepsX && !this.stepsY ) {
            this.verb = Config.verbs.FACE;
            this.controls = {};

        } else {
            if ( this.data.bounce && this.position.z === 0 ) {
                this.physics.vz = -6;
            }

            if ( this.data.verbs[ Config.verbs.WALK ] ) {
                this.verb = Config.verbs.WALK;
            }
        }
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
                map: this.map.checkMap( poi, this ),
                tiles: this.map.checkTiles( poi, this.map.hero ),
            };
            const isStopTile = (collision.tiles && collision.tiles.action.length && collision.tiles.action[ 0 ].stop);

            if ( !collision.map && !collision.tiles && !isStopTile ) {
                this.position = poi;

            } else {
                if ( dir === "left" ) {
                    this.physics.vx = 8;
                    // this.dirX = "right";

                } else if ( dir === "right" ) {
                    this.physics.vx = -8;
                    // this.dirX = "left";
                }

                if ( dir === "up" ) {
                    this.physics.vy = 8;
                    // this.dirY = "down";

                } else if ( dir === "down" ) {
                    this.physics.vy = -8;
                    // this.dirY = "up";
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
