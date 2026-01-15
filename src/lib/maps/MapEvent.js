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
            this.eventbox.x + this.eventbox.width === this.map.width
            // Omit y-axis since that is representative of hitbox (footbox)
        );
        this.tolerance = this.isSingleTile && this.data.dir !== "down" ? 
            10 : 
            20;
    }
}