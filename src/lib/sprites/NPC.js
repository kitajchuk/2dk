import Utils from "../Utils";
import Config, { DIRS } from "../Config";
import { QuestSprite } from "./Sprite";



/*******************************************************************************
* NPC Sprite
* Shifting states...
* AI logics?
*******************************************************************************/
export default class NPC extends QuestSprite {
    constructor ( data, map, mapId ) {
        super( data, map );
        this.mapId = mapId;
        this.states = this.data.states;
        this.stateIndex = 0;
        this.quests = this.data.payload?.quest ? this.data.payload.quest : [];
        this.questIndex = 0;
        this.questStatusCheck = this.data.payload?.checkStatus || null;
        this.status = this.data.status || null;
        this.dialogue = null;
        
        // AI things...
        // Initial cooldown period upon spawn (don't immediately move)
        this.aiCounter = this.data.ai ? 60 : 0;
        this.aiCoolDown = this.data.ai === Config.npc.ai.WALK ? 60 : 0;

        // For wander AI (e.g. a dog, cucco etc...)
        this.dirX = null;
        this.dirY = null;
        this.stepsX = 0;
        this.stepsY = 0;

        // For step AI (e.g. a like-like)
        this.lastDir = this.dir;
        this.lastFrame = 0;

        // Things that can be pushed (e.g. a grave, statue etc...)
        this.pushed = null;

        // This stuff is rough but trying to make fairy's feel more natural...
        this.floatCounter = 0;
        this.floatCounter2 = 0;
        this.floatOffset = -( this.map.data.tilesize / 2 );

        // For attract AI (e.g. a companion or fairy)
        this.attractRange = this.map.data.tilesize * 3;
        this.attractCounter = 0;
        this.attractDuration = 128;

        this.initialize();
    }


    initialize () {
        this.initializeState();
        this.initializeQuest();
    }


    resetWalk () {
        this.aiCounter = 0;
        this.aiCoolDown = 60;
        this.face( this.dir );
        this.handleResetControls();
    }


    freezeWalk () {
        this.stillTimer = Infinity;
        this.aiCounter = 0;
        this.aiCoolDown = 60;
        this.handleResetControls();
        this.face( Config.opposites[ this.gamebox.hero.dir ] );
    }


    // TODO: Would like to get rid of this but currently used in applyFloatPosition...
    isEnemy () {
        return this.data.type === Config.npc.types.ENEMY;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
* Update is overridden for Sprite subclasses with different behaviors
* Default behavior for a Sprite is to be static but with Physics forces
*******************************************************************************/
    update () {
        if ( !this.onscreen ) {
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
        if ( this.stillTimer > 0 ) {
            return;
        }

        if ( this.pushed ) {
            this.applyPushedPosition();

        } else if ( this.data.ai === Config.npc.ai.FLOAT ) {
            this.applyFloatPosition();

        } else {
            this.applyNormalPosition();
        }
    }


    applyPushedPosition () {
        const poi = {
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
        };

        switch ( this.pushed.dir ) {
            case "left":
                poi.x -= 1;
                break;
            case "right":
                poi.x += 1;
                break;
            case "up":
                poi.y -= 1;
                break;
            case "down":
                poi.y += 1;
                break;
        }

        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            npc: this.gamebox.checkNPC( poi, this ),
            enemy: this.gamebox.checkEnemy( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
            doors: this.gamebox.checkDoor( poi, this ),
            camera: this.gamebox.checkCamera( poi, this ),
        };

        const isCollision = (
            collision.map ||
            collision.npc ||
            collision.enemy ||
            collision.doors ||
            collision.camera ||
            this.canTileStop( collision )
        );

        if ( isCollision ) {
            this.pushed = null;
            this.gamebox.locked = false;
            return;
        }

        this.position = poi;

        if ( this.position.x === this.pushed.poi.x && this.position.y === this.pushed.poi.y ) {
            this.pushed = null;
            this.gamebox.locked = false;
        }
    }


    applyFloatPosition () {
        const z = this.isEnemy() ? 0 : this.floatOffset;
        const poi = this.getNextPoi();
        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            doors: this.gamebox.checkDoor( poi, this ),
        };

        if ( this.data.bounce ) {
            this.physics.vz = -Utils.upAndDown( this.floatCounter2, 60 );
            this.floatCounter++;

            if ( this.floatCounter % 2 === 0 ) {
                this.floatCounter2++;
            }
        }
            
        if ( collision.map || collision.doors ) {
            this.position.z = z + this.physics.vz;
            this.handleAI();
            return;
        }

        this.position.x = poi.x;
        this.position.y = poi.y;
        this.position.z = z + this.physics.vz;
    }


    applyNormalPosition () {
        const poi = this.getNextPoi();
        const { collision, isMapCollision } = this.gamebox.checkElevationCollision( poi, this, {
            doors: this.gamebox.checkDoor( poi, this ),
            empty: this.gamebox.checkEmpty( poi, this ),
            hero: this.gamebox.checkHero( poi, this ),
            npc: this.gamebox.checkNPC( poi, this ),
            enemy: this.gamebox.checkEnemy( poi, this ),
            // Skip tiles check for elevation layer
            tiles: this.elevation ? false : this.gamebox.checkTiles( poi, this ),
            // For now don't let NPCs / Enemies access elevation layer
        }, undefined, { disableAccessCheck: true });


        const isCollision = (
            collision.doors ||
            // Skip map check if we're on the elevation layer and so is the collider
            isMapCollision ||
            // Layer checks handled in collision checks above
            collision.npc ||
            collision.enemy ||
            collision.hero ||
            // Skip event check if it's an elevation event
            ( collision.event && !collision.event.isElevation ) ||
            this.canTileStop( collision )
        );

        // Removing this because NPCs in general should avoid hero collisions and Enemies should handle hero collisions themselves!
        // Roaming NPCs can push the hero back...
        // if ( collision.hero ) {
        //     if ( this.gamebox.hero.canShield( this ) && this.data.ai === Config.npc.ai.ROAM ) {
        //         switch ( this.dir ) {
        //             case "left":
        //                 this.gamebox.hero.physics.vx = -1;
        //                 break;
        //             case "right": 
        //                 this.gamebox.hero.physics.vx = 1;
        //                 break;
        //             case "up":
        //                 this.gamebox.hero.physics.vy = -1;
        //                 break;
        //             case "down":
        //                 this.gamebox.hero.physics.vy = 1;
        //                 break;
        //         }
        //         return;
        //     }
        // }

        if ( this.data.action?.verb === Config.verbs.ATTRACT ) {
            this.handleAttract( poi );
        }

        if ( isCollision ) {
            // Let wandering NPCs cool down before moving again
            // While roaming NPCs can immediately move again
            switch ( this.data.ai ) {
                case Config.npc.ai.ROAM:
                case Config.npc.ai.STEP:
                    this.aiCounter = 0;
                    break;
                case Config.npc.ai.WALK:
                    this.resetWalk();
                    break;
            }
            
            this.handleAI();
            return;
        }

        this.position = poi;
    }



/*******************************************************************************
* Handlers
*******************************************************************************/
    handleAI () {
        if ( this.stillTimer ) {
            return;
        }

        if ( this.data.ai ) {
            switch ( this.data.ai ) {
                case Config.npc.ai.WALK:
                    this.handleWalk();
                    break;
                case Config.npc.ai.ROAM:
                    this.handleRoam();
                    break;
                case Config.npc.ai.FLOAT:
                case Config.npc.ai.WANDER:
                    this.handleWander();
                    break;
                case Config.npc.ai.STEP:
                    this.handleStep();
                    break;
            }
        }
    }


    handleWalk () {
        if ( !this.aiCounter ) {
            if ( this.aiCoolDown > 0 ) {
                this.aiCoolDown--;
                return;
            }

            const min = 60;
            const max = 120;

            this.aiCounter = Utils.random( min, max );

            const lastDir = this.dir;
            const newDir = DIRS[ Utils.random( 0, DIRS.length - 1 ) ];

            // Always pick a new direction
            if ( lastDir === newDir ) {
                this.aiCounter = 0;
                this.handleWalk();
                return;
            }

            this.dir = newDir;

            if ( this.can( Config.verbs.WALK ) ) {
                this.verb = Config.verbs.WALK;
            }

            this.handleResetControls();
            this.controls[ this.dir ] = true;
        } else {
            this.aiCounter--;

            if ( this.aiCounter === 0 ) {
                this.resetWalk();
            }
        }
    }


    // Designed for NPCs such as a Like-Like that only has a single verb (face) with stepsX
    handleStep () {
        if ( !this.aiCounter ) {
            const lastDir = this.lastDir;
            const newDir = DIRS[ Utils.random( 0, DIRS.length - 1 ) ];

            // Always pick a new direction
            if ( lastDir === newDir ) {
                this.aiCounter = 0;
                this.handleStep();
                return;
            }

            this.lastDir = newDir;
            this.aiCounter = Utils.random( 120, 240 );
            this.handleResetControls();

            if ( this.can( Config.verbs.WALK ) ) {
                this.verb = Config.verbs.WALK;
            }

        } else {
            this.aiCounter--;

            const interval = this.data.verbs[ this.verb ].dur / this.data.verbs[ this.verb ][ this.dir ].stepsX;
            const delta = ( this.previousElapsed  - this.lastUpdateTime );

            if ( delta >= interval ) {
                this.handleResetControls();
            }

            if ( this.frame === this.lastFrame ) {
                return;
            }

            this.lastFrame = this.frame;
            this.lastUpdateTime = this.previousElapsed;

            this.handleResetControls();
            this.controls[ this.lastDir ] = true;
        }
        
    }


    handleRoam () {
        if ( !this.aiCounter ) {
            const lastDir = this.dir;
            const newDir = DIRS[ Utils.random( 0, DIRS.length - 1 ) ];

            // Always pick a new direction
            if ( lastDir === newDir ) {
                this.aiCounter = 0;
                this.handleRoam();
                return;
            }

            this.dir = newDir;
            this.aiCounter = Utils.random( 120, 240 );

            if ( this.can( Config.verbs.WALK ) ) {
                this.verb = Config.verbs.WALK;
            }
        } else {
            this.aiCounter--;
        }

        this.handleResetControls();
        this.controls[ this.dir ] = true;
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

            const min = this.data.ai === Config.npc.ai.FLOAT ? 90 : 30;
            const max = this.data.ai === Config.npc.ai.FLOAT ? 180 : 60;

            this.aiCounter = Utils.random( 60, 120 );
            this.stepsX = Utils.random( min, max );
            this.stepsY = Utils.random( min, max );
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
            // This is skipped by FLOAT NPCs because they are not on the ground...
            if ( this.data.bounce && this.isOnGround() ) {
                this.physics.vz = -6;
            }

            if ( this.can( Config.verbs.WALK ) ) {
                this.verb = Config.verbs.WALK;
            }
        }
    }


    handleAttract ( poi ) {
        if ( !this.data.action?.quest?.setCompanion || this.stillTimer > 0 ) {
            return;
        }

        const collision = Utils.areSpritesInRange( this, this.gamebox.hero, this.attractRange );

        if ( collision ) {
            this.attractCounter++;

            if ( this.attractCounter >= this.attractDuration ) {
                if ( this.isOnGround() ) {
                    this.stillTimer = Infinity;

                    if ( this.data.spawn.quest.checkSpawn ) {
                        this.gamequest.completeQuest( this.data.spawn.quest.checkSpawn.key );
                    }

                    this.gamebox.spawnCompanion({
                        ...this.data.action.quest.setCompanion,
                        dir: this.dir,
                        verb: this.verb,
                    }, this.position );

                    this.map.killObject( "npcs", this );
                }

            }
        } else {
            this.attractCounter = 0;
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


    canTileStop ( collision ) {
        const { tiles, empty } = collision;

        if ( empty && empty.length ) {
            return true;
        }

        const stopTiles = tiles && tiles.action.filter( ( tile ) => {
            return tile.fall || tile.swim || tile.stop;
        });

        if ( stopTiles && stopTiles.length ) {
            return true;
        }

        return false;
    }


    doInteract () {
        if ( this.data.payload ) {
            this.handleQuestDialogue();
        }
    }


/*******************************************************************************
* State
*******************************************************************************/
    initializeState () {
        if ( this.states.length === 1 ) {
            this.setState( 0 );
        } else {
            const completed = this.gamequest.getCompleted( this.mapId );
            // TODO: Make this more robust for more than just two states...
            const index = completed ? 1 : 0;
            this.setState( index );
        }
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


    handleInteractionState () {
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


/*******************************************************************************
* Quests
*******************************************************************************/
    initializeQuest () {
        if ( this.quests.length === 1 ) {
            this.setQuest( 0 );
        } else if ( this.quests.length > 1 ) {
            for ( let i = 0; i < this.quests.length; i++ ) {
                const questId = this.getQuestId( this.quests[ i ].type, i );

                if ( this.gamequest.getCompleted( questId ) ) {
                    continue;
                }

                this.setQuest( i );
                break;
            }
        }
    }


    getQuestId ( type, index ) {
        return `${this.mapId}-${type}-${index}`;
    }


    setQuest ( index ) {
        this.questIndex = index;
        this.quest = this.quests[ this.questIndex ];
    }


    getNextQuest () {
        return this.quests[ this.questIndex + 1 ];
    }


    getPreviousQuest () {
        return this.quests[ this.questIndex - 1 ];
    }


    advanceQuest () {
        const nextQuest = this.getNextQuest();

        if ( nextQuest ) {
            this.setQuest( this.questIndex + 1 );
        }
    }


    advanceQuestRecursive () {
        const nextQuest = this.getNextQuest();

        if ( nextQuest ) {
            this.setQuest( this.questIndex + 1 );
            this.handleQuestDialogue();
        }
    }


    resetQuestDialogue () {
        this.dialogue = null;
        this.dir = this.state.dir;
        this.verb = this.state.verb;

        if ( this.gamebox.hero.itemGet ) {
            this.gamebox.hero.resetItemGet();
        }
    }


    playQuestDialogue ( dialogue, onComplete ) {
        if ( !this.dialogue ) {
            if ( this.data.ai === Config.npc.ai.WALK ) {
                this.freezeWalk();
            }

            this.dialogue = this.gamebox.dialogue.play( dialogue )
                .then( () => {
                    this.stillTimer = 0;
                    this.resetQuestDialogue();
                    this.handleAI();

                    if ( onComplete ) {
                        onComplete();
                    }
                    
                }).catch( () => {
                    this.resetQuestDialogue();
                });
        }
    }


    handleQuestDialogue () {
        // Safety check
        if ( this.quests.length === 0 ) {
            return;
        }

        // MARK: Quest checkStatus
        // As long as you have this status we'll play this dialogue
        if ( this.questStatusCheck ) {
            const { status, dialogue } = this.questStatusCheck;

            if ( this.gamebox.hero.status === status ) {
                this.playQuestDialogue( dialogue );
                return;
            }
        }

        const questId = this.getQuestId( this.quest.type, this.questIndex );

        // If the final quest is completed and it's not a noCheck then the quest line is unhandled at the end...
        if ( this.gamequest.getCompleted( questId ) && !this.getNextQuest() && this.quest.type !== Config.quest.dialogue.NO_CHECK ) {
            this.playQuestDialogue( UNHANDLED_QUEST_DIALOGUE );
            return;
        }

        switch ( this.quest.type ) {
            // MARK: Quest setItem
            case Config.quest.dialogue.SET_ITEM:
                this.handleQuestItemUpdate( this.quest.id );
                this.gamequest.completeQuest( questId );
                this.gamebox.playItemGetDialogue( this.quest.dialogue );
                this.advanceQuest();
                // Assume if we're setting an item we should attempt to update the NPC state
                this.handleInteractionState();
                break;

            // MARK: Quest setFlag
            case Config.quest.dialogue.SET_FLAG:
                this.playQuestDialogue( this.quest.dialogue, () => {
                    this.gamequest.completeQuest( questId );
                    this.handlePreviousQuest();
                    this.advanceQuest();
                });
                break;

            // MARK: Quest checkItem
            case Config.quest.dialogue.CHECK_ITEM:
                if ( !this.gamebox.hero.itemCheck( this.quest.id ) ) {
                    this.playQuestDialogue( this.quest.dialogue );
                } else {
                    this.handleQuestItemCheck( this.quest.id );
                    this.gamequest.completeQuest( questId );
                    this.advanceQuestRecursive();
                }
                break;

            // MARK: Quest takeItem
            case Config.quest.dialogue.TAKE_ITEM:
                if ( this.gamebox.hero.itemCheck( this.quest.id ) ) {
                    // Only complete on promise resolve to support PROMPT dialogue types...
                    this.playQuestDialogue( this.quest.dialogue, () => {
                        this.gamebox.hero.takeItem( this.quest.id );
                        this.gamequest.completeQuest( questId );
                        this.advanceQuestRecursive();
                    });
                }
                break;

            // MARK: Quest checkFlag
            case Config.quest.dialogue.CHECK_FLAG:
                if ( !this.gamequest.getCompleted( this.quest.key ) ) {
                    this.playQuestDialogue( this.quest.dialogue );
                } else {
                    this.gamequest.completeQuest( questId );
                    this.advanceQuestRecursive();
                }
                break;

            // MARK: Quest checkCompanion
            case Config.quest.dialogue.CHECK_COMPANION:
                if ( !this.gamebox.checkCompanion( this.quest.id ) ) {
                    this.playQuestDialogue( this.quest.dialogue );
                } else {
                    this.gamequest.completeQuest( questId );
                    this.advanceQuestRecursive();
                }
                break;
            
            // MARK: Quest noCheck
            case Config.quest.dialogue.NO_CHECK:
                this.playQuestDialogue( this.quest.dialogue );

                const nextQuest = this.getNextQuest();
                if ( nextQuest ) {
                    this.gamequest.completeQuest( questId );
                    this.advanceQuestRecursive();
                // If there are no more quests, handle the interaction state and don't flag this as completed
                // Here we assume that this should be the dialogue that plays from this point on (e.g. exhausted dialogue)
                } else {
                    this.handleInteractionState();
                }
                break;
        }
    }


    handlePreviousQuest () {
        const prevQuest = this.getPreviousQuest();

        if ( prevQuest && prevQuest.type === Config.quest.dialogue.CHECK_COMPANION ) {
            // The Map.handleQuestFlagCheck() will check the quest and complete it if it is successful
            // so here we just nee to hit it so that check will pass
            this.gamequest.hitQuest( this.quest.key, 1 );
            const object = this.map.getSpawnpoolObject( this.quest.key );
            this.gamebox.companion.despawnQuest = {
                questKey: this.quest.key,
                position: {
                    x: object.data.spawn.x,
                    y: object.data.spawn.y,
                },
            };
        } else {
            // Otherwise assume that the quest flag should automatically be completed for this check
            this.gamequest.completeQuest( this.quest.key );
        }
    }


    handleQuestItemUpdate ( itemId ) {
        const item = this.gamebox.hero.getItem( itemId );

        if ( item && item.collect ) {
            this.gamebox.hero.collectItem( itemId, this.mapId );
            this.gamebox.hero.doItemGet( item );

        } else {
            this.gamebox.hero.giveItem( itemId, this.mapId );
        }

        this.gamequest.completeQuest( this.mapId );
    }


    handleQuestItemCheck ( itemId ) {
        if ( this.gamebox.hero.itemCheck( itemId ) ) {
            const item = this.gamebox.hero.getItem( itemId );

            if ( item && item.collect ) {
                this.gamebox.hero.takeCollectible( itemId );
            }
        }
    }
}



const UNHANDLED_QUEST_DIALOGUE = {
    type: Config.dialogue.types.TEXT,
    text: [
        "This is an unhandled quest dialogue. If you want to properly end your quest use a NO_CHECK dialogue as the last entry in your quest array.",
    ],
};
