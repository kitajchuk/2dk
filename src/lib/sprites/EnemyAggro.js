import Utils from "../Utils";
import Enemy from "./Enemy";



export default class EnemyAggro extends Enemy {
    constructor ( data, map, mapId ) {
        super( data, map, mapId );

        this.aggroActive = false;
        this.aggroRadius = this.map.data.tilesize * 4;
        this.aggroInterval = 3000; // 3 seconds
        this.lastAggroTime = null;
        this.aggroSpeed = this.physics.maxv * 2;
        this.backoffPosition = null;
    }


    hit ( ...args ) {
        super.hit( ...args );
        this.aggroActive = false;
        this.backoffPosition = null;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
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
    handleProjectile () {
        if ( this.aggroActive ) {
            return;
        }

        super.handleProjectile();
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

        // Throttle the aggro check so it's not called every frame...
        if ( !this.lastAggroTime ) {
            this.lastAggroTime = this.previousElapsed;
        }

        if ( this.previousElapsed - this.lastAggroTime < this.aggroInterval ) {
            return;
        }

        this.lastAggroTime = null;

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
}