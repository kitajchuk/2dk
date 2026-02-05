import NPC from "./NPC";
import Utils from "../Utils";
import Config from "../Config";
import Projectile from "./Projectile";



export default class Enemy extends NPC {
    constructor ( data, map, mapId ) {
        super( data, map, mapId );

        this.aggroActive = false;
        this.aggroRadius = this.map.data.tilesize * 4;
        this.aggroSpeed = this.physics.maxv * 2;
        this.backoffPosition = null;
        this.projectileCounter = this.data.projectile ? 120 : 0;
        this.projectile = null;
    }


    hit ( ...args ) {
        super.hit( ...args );
        this.face( this.dir );
        this.aiCounter = 0;
        this.aggroActive = false;
        this.backoffPosition = null;

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
        this.handleDetection();
        this.handleProjectile();
        this.updateStack();
    }


    // Shallow wrapper so we can override when aggro
    handleAI () {
        if ( this.aggroActive ) {
            return;
        }

        super.handleAI();
    }


    // Shallow wrapper so we can override when aggro
    applyPosition () {
        if ( this.aggroActive ) {
            this.applyAggroPosition();
            return;
        }

        super.applyPosition();
    }


    handleDetection () {
        if ( !this.data.aggro || this.isHitOrStill() || !this.gamebox.hero.canAggroEnemy( this ) ) {
            this.aggroActive = false;
            return;
        }

        const distX = this.gamebox.hero.center.x - this.center.x;
        const distY = this.gamebox.hero.center.y - this.center.y;
        const canAggro = Math.pow( distX, 2 ) + Math.pow( distY, 2 ) <= Math.pow( this.aggroRadius, 2 );

        // TODO: Raycast to the hero and check if there is a wall in the way...
        //       Figure out map collision layer first then apply to other collision layers...
        
        if ( canAggro ) {
            this.aggroActive = true;

        } else {
            this.aggroActive = false;
        }
    }


    applyAggroPosition () {
        const poi = this.getNextPoi();

        // Bounce a bit when aggroed
        if ( this.isOnGround() ) {
            this.physics.vz = -3;
        }

        // Back off from the hero (from collision whether the hero absorbed the hit or not)
        // Here we don't set the dir so that the enemy can still face the hero when they are backing off
        if ( this.backoffPosition ) {
            const toBackoffX = this.backoffPosition.x - this.center.x;
            const toBackoffY = this.backoffPosition.y - this.center.y;
            const angle = Math.atan2( toBackoffY, toBackoffX );
            poi.x = this.position.x + ( this.aggroSpeed * Math.cos( angle ) );
            poi.y = this.position.y + ( this.aggroSpeed * Math.sin( angle ) );

            const { isCollision } = this.getCollision( poi );

            if ( isCollision ) {
                // TODO: Implement pathfinding logic to get around stuff like other aggroed enemies when backing off...
                // Right now this can cause an enemy to ping-pong between collision and the hero in short bursts causing rapid death...
                this.backoffPosition = null;
                return;
            }

            this.position = poi;

            if ( Math.abs( this.center.x - this.backoffPosition.x ) < 1 && Math.abs( this.center.y - this.backoffPosition.y ) < 1 ) {
                this.backoffPosition = null;
            }

            return;
        }

        // Go after the hero until the hero is hit, the enemy is hit or the hero moves out of range
        const toHeroX = this.gamebox.hero.center.x - this.center.x;
        const toHeroY = this.gamebox.hero.center.y - this.center.y;
        const angle = Math.atan2( toHeroY, toHeroX );

        // Determine the cardinal direction based on the angle
        this.dir = Utils.getDirectionFromAngle( angle );

        poi.x = this.position.x + ( this.aggroSpeed * Math.cos( angle ) );
        poi.y = this.position.y + ( this.aggroSpeed * Math.sin( angle ) );

        const { collision, isCollision } = this.getCollision( poi );

        if ( collision.hero && !this.backoffPosition ) {
            const angleFromHero = angle + Math.PI;
            this.backoffPosition = {
                x: this.center.x + Math.cos( angleFromHero ) * this.map.data.tilesize,
                y: this.center.y + Math.sin( angleFromHero ) * this.map.data.tilesize,
            };
            return;
        }

        if ( isCollision ) {
            // TODO: Implement pathfinding logic to get around walls etc...
            return;
        }

        this.position = poi;
    }


    getCollision ( poi ) {
        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            npc: this.gamebox.checkNPC( poi, this ),
            enemy: this.gamebox.checkEnemy( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
            doors: this.gamebox.checkDoor( poi, this ),
            empty: this.gamebox.checkEmpty( poi, this ),
            // Handle collision on current position so we can HIT the hero
            hero: this.gamebox.checkHero( this.position, this ),
        };

        const isCollision = (
            collision.map ||
            collision.npc ||
            collision.enemy ||
            collision.doors ||
            this.canTileStop( collision )
        );

        return { collision, isCollision };
    }


/*******************************************************************************
* Handlers
*******************************************************************************/
    handleProjectile () {
        if ( !this.data.projectile || this.projectile || this.aggroActive ) {
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
        return !this.isHitOrStill() && !this.gamebox.hero.isHitOrStill() && !this.gamebox.hero.canShield( this );
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
            this.map.mapFX.smokeObject( this, this.data.action.fx );
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
                this.gamebox.keyItemDrop( this.data.action.quest.dropItem, this.position, checkFlag );
            }
        }
    }
}