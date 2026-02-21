import Utils from "../Utils";
import Config from "../Config";



/*******************************************************************************
* MapEvent
* A single event on the map that can be triggered by the player.
* They can have different types, quests etc...
*******************************************************************************/
export default class MapEvent {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
        this.eventbox = {
            x: this.data.coords[ 0 ] * this.map.data.tilesize,
            y: this.data.coords[ 1 ] * this.map.data.tilesize,
            width: this.data.width || this.map.data.tilesize,
            height: this.data.height || this.map.data.tilesize,
        };
        this.isSingleTile = (
            this.eventbox.width === this.map.data.tilesize && 
            this.eventbox.height === this.map.data.tilesize
        );
        this.isEdgeTile = (
            this.eventbox.x === 0 ||
            this.eventbox.y === 0 ||
            this.eventbox.x + this.eventbox.width === this.map.width ||
            this.eventbox.y + this.eventbox.height === this.map.height
        );
        this.isElevation = this.data.type === Config.events.ELEVATION;
        this.isHorizontal = this.eventbox.width > this.eventbox.height;

        if ( this.isElevation ) {
            this.extendElevationEventbox();
        }
    }


    isBlockedByTile () {
        return this.isSingleTile && this.map.getActiveTileOnCoords( this.data.coords );
    }


    checkCollision ( poi, sprite, isDir ) {
        const hitbox = this.isEdgeTile ? sprite.getFullbox( poi ) : sprite.getHitbox( poi );
        const collides = Utils.collide( this.eventbox, hitbox );

        if ( !collides ) {
            return false;
        }

        if ( this.isElevation ) {
            return true;
        }

        if ( !isDir ) {
            const hitboxArea = hitbox.width * hitbox.height;
            const collisionArea = collides.width * collides.height;
            const amount = collisionArea / hitboxArea * 100;
            const meetsThreshold = amount >= this.map.data.tilesize;
            return collides && meetsThreshold;
        }

        switch ( sprite.dir ) {
            case "up":
                return collides && (
                    this.isEdgeTile ?
                        hitbox.y <= 0 :
                        hitbox.y <= this.eventbox.y + this.eventbox.height / 2
                );
            case "down":
                return collides && (
                    this.isEdgeTile ?
                        hitbox.y + hitbox.height >= this.map.height :
                        hitbox.y + hitbox.height >= this.eventbox.y + this.eventbox.height / 2
                );
            case "left":
                return collides && (
                    this.isEdgeTile ?
                        hitbox.x <= 0 :
                        hitbox.x <= this.eventbox.x + this.eventbox.width / 2
                );
            case "right":
                return collides && (
                    this.isEdgeTile ?
                        hitbox.x + hitbox.width >= this.map.width :
                        hitbox.x + hitbox.width >= this.eventbox.x + this.eventbox.width / 2
                );
        }
    }


    // Gate access to the elevation event based on the sprite's position
    checkElevationAccess ( poi, sprite ) {
        return (
            Utils.collide( this.spacerOne, sprite.hitbox ) ||
            Utils.collide( this.spacerTwo, sprite.hitbox )
        );
    }


    // Check if another sprite / NPC can be interacted with from this elevation event
    checkElevationAccessToSprite ( poi, sprite ) {
        if ( this.isHorizontal ) {
            return (
                sprite.hitbox.x + sprite.hitbox.width <= this._eventbox.x ||
                sprite.hitbox.x >= this._eventbox.x + this._eventbox.width
            );

        } else {
            return (
                sprite.hitbox.y + sprite.hitbox.height <= this._eventbox.y ||
                sprite.hitbox.y >= this._eventbox.y + this._eventbox.height
            );
        }
    }


    extendElevationEventbox () {
        // Store the original eventbox for later use
        this._eventbox = { ...this.eventbox };

        if ( this.isHorizontal ) {
            this.eventbox.width += this.map.data.tilesize * 2;
            this.eventbox.x -= this.map.data.tilesize;

            this.spacerOne = {
                x: this.eventbox.x,
                y: this.eventbox.y,
                width: this.map.data.tilesize,
                height: this.eventbox.height,
            };
            this.spacerTwo = {
                x: this.eventbox.x + this.eventbox.width,
                y: this.eventbox.y,
                width: this.map.data.tilesize,
                height: this.eventbox.height,
            };

        } else {
            this.eventbox.height += this.map.data.tilesize * 2;
            this.eventbox.y -= this.map.data.tilesize;

            this.spacerOne = {
                x: this.eventbox.x,
                y: this.eventbox.y,
                width: this.eventbox.width,
                height: this.map.data.tilesize,
            };
            this.spacerTwo = {
                x: this.eventbox.x,
                y: this.eventbox.y + this.eventbox.height,
                width: this.eventbox.width,
                height: this.map.data.tilesize,
            };
        }
    }
}