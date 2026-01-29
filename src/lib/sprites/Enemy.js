import NPC from "./NPC";
import Utils from "../Utils";
import Config from "../Config";
import Projectile from "./Projectile";



export default class Enemy extends NPC {
    constructor ( data, map, mapId ) {
        super( data, map, mapId );

        this.projectileCounter = this.data.projectile ? 120 : 0;
        this.projectile = null;
    }


    hit ( ...args ) {
        super.hit( ...args );
        this.face( this.dir );
        this.aiCounter = 0;
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
        this.handleProjectile();
        this.updateStack();
    }


/*******************************************************************************
* Handlers
*******************************************************************************/
    handleProjectile () {
        if ( !this.data.projectile ) {
            return;
        }

        if ( this.projectile ) {
            return;
        }

        if ( this.isHitOrStill() ) {
            this.projectileCounter = 120;
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
    canBeAttacked () {
        return (
            !this.hitTimer &&
            this.canDoAction( Config.verbs.ATTACK ) &&
            (
                !this.status ||
                this.status === this.gamebox.hero.status
            )
        );
    }


    canHitHero () {
        return !this.isHitOrStill() && !this.gamebox.hero.canShield( this );
    }


/*******************************************************************************
* Quests
*******************************************************************************/
    handleHealthCheck () {
        if ( !this.stats ) {
            return;
        }

        if ( this.health <= 0 ) {
            this.handleQuestFlagUpdate();
            this.gamebox.smokeObject( this, this.data.action.fx );
            this.map.killObject( "enemies", this );
            this.gamebox.hero.enemiesKilled++;

            if ( this.data.action.sound ) {
                this.player.gameaudio.hitSound( this.data.action.sound );
            }

            if ( this.data.drops && !this.circularCheckQuestFlag() ) {
                this.gamebox.itemDrop( this.data.drops, this.position );
            }
        }
    }


    circularCheckQuestFlag() {
        if ( this.data.action.quest?.checkFlag && this.data.action.quest?.setFlag && this.data.action.quest?.dropItem ) {
            const { key: checkKey } = this.data.action.quest.checkFlag;
            const { key: setKey } = this.data.action.quest.setFlag;

            if ( checkKey === setKey ) {
                return this.gamequest.getCompleted( checkKey );
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


    handleQuestFlagCheck ( checkFlag ) {
        if ( this.checkQuestFlag( checkFlag ) ) {
            if ( this.data.action.quest.setFlag ) {
                const { key, value, reset } = this.data.action.quest.setFlag;

                // Exit out if the quest flag has been completed already...
                // This allows combining setFlag, checkFlag and dropItem quests together
                // In the below example when an octorok is killed it will drop a key if it is the 3rd one and this quest has not been completed yet
                /*
                    "quest": {
                        "dropItem": {
                            "id": "key",
                            "dialogue": {
                                "type": "text",
                                "text": [
                                    "You got a small key!",
                                    "I bet it opens something cool!"
                                ]
                            }
                        },
                        "setFlag": {
                            "key": "octorok-killed",
                            "value": 1
                        },
                        "checkFlag": {
                            "key": "octorok-killed",
                            "value": 3
                        }
                    }
                */
                if ( key === checkFlag && this.isQuestFlagComplete() ) {
                    return;
                }

                this.gamequest.hitQuest( key, value, reset );
            }

            this.gamequest.completeQuest( checkFlag );

            if ( this.data.action.quest.dropItem ) {
                this.gamebox.keyItemDrop( this.data.action.quest.dropItem, this.position );
            }
        }
    }
}