import Utils from "../Utils";



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
    }


    isBlockedByTile () {
        return this.isSingleTile && this.map.getActiveTileOnCoords( this.data.coords );
    }


    checkCollision ( poi, sprite, isDir ) {
        const hitbox = this.isEdgeTile ? sprite.getFullbox( poi ) : sprite.getHitbox( poi );
        const collides = Utils.collide( this.eventbox, hitbox );
        

        if ( !isDir ) {
            const hitboxArea = hitbox.width * hitbox.height;
            const collisionArea = collides ? collides.width * collides.height : 0;
            const amount = collides ? collisionArea / hitboxArea * 100 : 0;
            const meetsThreshold = isDir ? true : amount >= this.map.data.tilesize;
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
}