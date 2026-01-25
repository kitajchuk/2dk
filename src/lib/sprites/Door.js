import Utils from "../Utils";
import FX from "./FX";
import { QuestSprite } from "./Sprite";
import Config from "../Config";



/*******************************************************************************
* Door Sprite
* Can open shaking and smoking
*******************************************************************************/
export default class Door extends QuestSprite {
    constructor ( data, map, mapId ) {
        super( data, map );
        this.mapId = mapId;
        this.open = false;
        this.opening = false;
        this.closing = false;
        this.counter = 0;
        this.rumble = 0;
        this.originalX = this.position.x;
        this.dialogue = null;
        this.states = this.data.states;

        this.initialize();
    }


    initialize () {
        if ( this.data.action ) {
            const completed = this.gamequest.getCompleted( this.mapId );

            this.open = this.data.action.verb === Config.verbs.OPEN ? completed ? true : false : completed ? false : true;
            this.counter = this.open ? this.data.height : 0;
        }

        this.setState( 0 );
    }


    // Same as NPC setState() method
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
        const dialogue = this.data.payload?.quest?.[ 0 ]?.dialogue;

        if ( dialogue && !this.dialogue ) {
            this.dialogue = this.gamebox.dialogue.play( dialogue );
            this.dialogue.then( () => {
                this.resetDialogue();
                this.handleCompleteQuest();
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
        if ( !this.onscreen ) {
            return;
        }

        this.gamebox.draw(
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

        if ( this.player.query.get( "debug" ) ) {
            this.renderDebug();
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
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: this.position.x + ( this.width / 2 ) - ( data.width / 2 ),
                y: this.position.y + this.height - (data.height / 2 ),
            },
            vy: -Utils.random( 0, this.height / 2 ),
        }), this.map ) );

        // Left
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: this.position.x - ( data.width / 2 ),
                y: this.position.y + this.height - (data.height / 2 ),
            },
            vx: -Utils.random( 0, 16 ),
            vy: -Utils.random( 0, this.height / 2 ),
        }), this.map ) );

        // Right
        this.map.addObject( "fx", new FX( Utils.merge( data, {
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
            this.map.addObject( "fx", new FX( Utils.merge( data, {
                spawn: {
                    x: this.position.x + ( this.width / 4 ) - ( data.width / 2 ),
                    y: this.position.y + this.height - (data.height / 2 ),
                },
                vx: -Utils.random( 0, 16 ),
                vy: -Utils.random( 0, this.height / 2 ),
            }), this.map ) );

            // Right center
            this.map.addObject( "fx", new FX( Utils.merge( data, {
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


    canInteractQuest () {
        return this.data.action.quest?.checkFlag?.dialogue || this.data.action.quest?.checkItem?.dialogue;
    }


    canDoAction ( verb ) {
        return ( this.data.action && this.data.action.verb && verb === this.data.action.verb );
    }


    doInteract () {
        if ( this.opening || this.closing ) {
            return;
        }

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

/*******************************************************************************
* Quests
*******************************************************************************/
    handleQuestInteractionCheck () {
        // Mark: Quest checkFlag
        if ( this.data.action.quest.checkFlag ) {
            const { key, dialogue } = this.data.action.quest.checkFlag;

            // Exit out if the quest flag has been completed already...
            if ( this.gamequest.getCompleted( key ) ) {
                return;
            }

            if ( !this.checkQuestFlag( key ) ) {
                // A simple message to the player...
                if ( dialogue ) {
                    this.gamebox.dialogue.auto( dialogue );
                }
                return;
            }

            this.handleQuestFlagCheck( key );
        }

        // Mark: Quest checkItem
        if ( this.data.action.quest.checkItem ) {
            const { id, dialogue } = this.data.action.quest.checkItem;

            // Exit out if the quest flag has been completed already...
            if ( this.gamequest.getCompleted( this.mapId ) ) {
                return;
            }

            if ( !this.gamebox.hero.itemCheck( id ) ) {
                // A simple message to the player...
                if ( dialogue ) {
                    this.gamebox.dialogue.auto( dialogue );
                }
                return;
            }

            this.handleQuestItemCheck( id );
        }
    }


    handleQuestFlagCheck ( checkFlag ) {
        if ( this.checkQuestFlag( checkFlag ) ) {
            this.gamequest.completeQuest( checkFlag );

            if ( this.data.action.quest.setFlag ) {
                const { key, value } = this.data.action.quest.setFlag;
                this.gamequest.hitQuest( key, value );
            }

            this.handleCompleteQuest();
        }
    }


    handleQuestItemCheck ( itemId ) {
        if ( this.gamebox.hero.itemCheck( itemId ) ) {
            const item = this.gamebox.hero.getItem( itemId );

            if ( item && item.collect ) {
                this.gamebox.hero.takeCollectible( itemId );
            }

            this.handleCompleteQuest();
        }
    }


    handleCompleteQuest () {
        this.gamequest.completeQuest( this.mapId );
        this.handleDoAction();
    }


    handleDoAction () {
        const verb = this.open ? Config.verbs.CLOSE : Config.verbs.OPEN;

        if ( this.canDoAction( verb ) ) {
            this.doAction( verb );
        }
    }
}
