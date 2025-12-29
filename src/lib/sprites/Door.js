import Utils from "../Utils";
import FX from "./FX";
import Sprite from "./Sprite";
import Config from "../Config";



/*******************************************************************************
* Door Sprite
* Can open shaking and smoking
*******************************************************************************/
class Door extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.states = structuredClone( this.data.states );
        this.open = false;
        this.opening = false;
        this.closing = false;
        this.counter = 0;
        this.rumble = 0;
        this.originalX = this.position.x;
        this.dialogue = null;

        this.initialize();
    }


    initialize () {
        if ( this.data.action ) {
            const completed = this.isQuestComplete();

            this.open = this.data.action.verb === Config.verbs.OPEN ? completed ? true : false : completed ? false : true;
            this.counter = this.open ? this.data.height : 0;
        }

        // Same as NPC shift() method
        if ( this.states.length ) {
            this.state = this.states.shift();
            this.dir = this.state.dir;
            this.verb = this.state.verb;
        }
    }


    destroy () {}

    
    payload () {
        if ( this.data.payload.dialogue && !this.dialogue ) {
            this.dialogue = this.gamebox.dialogue.play( this.data.payload.dialogue );
            this.dialogue.then( () => {
                this.resetDialogue();
            }).catch( () => {
                this.resetDialogue();
            });
        }
    }


    resetDialogue () {
        this.dialogue = null;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
* Update is overridden for Sprite subclasses with different behaviors
* Default behavior for a Sprite is to be static but with Physics forces
*******************************************************************************/
    render () {
        if ( !this.visible() ) {
            return;
        }

        this.gamebox.layers[ this.layer ].onCanvas.context.drawImage(
            this.image,
            this.spritecel[ 0 ],
            this.spritecel[ 1 ],
            this.data.width,
            this.data.height - this.counter,
            this.offset.x,
            this.offset.y + this.counter,
            this.width,
            this.height - this.counter
        );
    }


/*******************************************************************************
* Handlers
*******************************************************************************/
    handleQuestCheck ( quest ) {
        if ( this.checkQuest( quest ) ) {
            this.gamequest.completeQuest( quest );

            // TODO: This is rough but maybe we should just complete the quest instead of hitting it?
            if ( this.data.action.quest.set ) {
                const { key, value } = this.data.action.quest.set;
                this.gamequest.hitQuest( key, value );
            }

            const verb = this.open ? Config.verbs.CLOSE : Config.verbs.OPEN;

            if ( this.canDoAction( verb ) ) {
                this.doAction( verb );
            }
        }
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.open ) {
            return;
        }

        if ( this.opening ) {
            if ( this.rumble > 0 ) {
                this.rumble--;
                this.position.x += ( this.rumble % 2 === 0 ? -3 : 3 );
                return;
            }

            this.counter++;
            this.position.x += ( this.counter % 2 === 0 ? -3 : 3 );

            if ( this.counter % 5 === 0 ) {
                this.applyFX();
            }

            if ( this.counter % 15 === 0 ) {
                this.applySound();
            }

            if ( this.counter >= this.data.height ) {
                this.opening = false;
                this.open = true;
                this.position.x = this.originalX;
            }

            return;
        }

        if ( this.closing ) {
            this.counter--;
            this.position.x += ( this.counter % 2 === 0 ? -3 : 3 );

            if ( this.counter % 5 === 0 ) {
                this.applyFX();
            }

            if ( this.counter % 15 === 0 ) {
                this.applySound();
            }

            if ( this.counter <= 0 ) {
                this.closing = false;
                this.open = false;
                this.position.x = this.originalX;
            }

            return;
        }

        this.position = this.getNextPoi();
    }


    applySound () {
        if ( !this.data.action.sound ) {
            return;
        }

        this.player.gameaudio.hitSound( this.data.action.sound );
    }


    applyFX () {
        if ( !this.data.action.fx ) {
            return;
        }

        const data = this.map.gamebox.player.getMergedData({
            id: this.data.action.fx,
            kill: true,
        }, "fx" );

        // Center
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: this.position.x + ( this.width / 2 ) - ( data.width / 2 ),
                y: this.position.y + this.height - (data.height / 2 ),
            },
            vy: -Utils.random( 0, this.height / 2 ),
        }), this.map ) );

        // Left
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: this.position.x - ( data.width / 2 ),
                y: this.position.y + this.height - (data.height / 2 ),
            },
            vx: -Utils.random( 0, 16 ),
            vy: -Utils.random( 0, this.height / 2 ),
        }), this.map ) );

        // Right
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: this.position.x + this.width - ( data.width / 2 ),
                y: this.position.y + this.height - (data.height / 2 ),
            },
            vx: Utils.random( 0, 16 ),
            vy: -Utils.random( 0, this.height / 2 ),
        }), this.map ) );

        // Add more FX if the door is wider than a tile
        if ( this.width > this.map.data.tilesize ) {
            // Left center
            this.map.addFX( new FX( Utils.merge( data, {
                spawn: {
                    x: this.position.x + ( this.width / 4 ) - ( data.width / 2 ),
                    y: this.position.y + this.height - (data.height / 2 ),
                },
                vx: -Utils.random( 0, 16 ),
                vy: -Utils.random( 0, this.height / 2 ),
            }), this.map ) );

            // Right center
            this.map.addFX( new FX( Utils.merge( data, {
                spawn: {
                    x: this.position.x + this.width - ( this.width / 4 ) - ( data.width / 2 ),
                    y: this.position.y + this.height - (data.height / 2 ),
                },
                vx: Utils.random( 0, 16 ),
                vy: -Utils.random( 0, this.height / 2 ),
            }), this.map ) );
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
    }


    doAction ( verb ) {
        if ( this.opening || this.closing ) {
            return;
        }

        if ( this.open ) {
            this.open = false;
            this.closing = true;
            this.counter = this.height;
            return;
        }

        this.opening = true;
        this.counter = 0;
        this.rumble = 60;
    }
}



export default Door;
