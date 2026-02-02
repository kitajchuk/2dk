import Sprite from "./Sprite";



export default class KeyItem extends Sprite {
    // item: { spawn, dialogue: { type, text } }
    constructor ( { verb, ...item }, map, mapId ) {
        const data = {
            hitbox: {
                x: 0,
                y: 0,
                width: item.width,
                height: item.height,
            },
            verbs: {
                face: {
                    down: {
                        offsetX: item.offsetX,
                        offsetY: item.offsetY,
                    },
                },
            },
            ...item,
        };
        super( data, map );
        this.mapId = mapId;
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        this.position = this.getNextPoi();
    }


/*******************************************************************************
* Checks
*******************************************************************************/
    canPickup () {
        return true;
    }
}



export class KeyItemDrop extends Sprite {
    constructor ( spawn, { verb, ...item }, map, checkFlag ) {
        const data = {
            spawn,
            hitbox: {
                x: 0,
                y: 0,
                width: item.width,
                height: item.height,
            },
            verbs: {
                face: {
                    down: {
                        offsetX: item.offsetX,
                        offsetY: item.offsetY,
                    },
                },
            },
            ...item,
        };
        super( data, map );
        this.bounce = 6;

        // Quest connection
        // See TopView.handleHeroItem() for more details
        this.checkFlag = checkFlag;
    }


    destroy () {
        // Item is destroyed but was never picked up so reset the quest
        if ( this.checkFlag ) {
            this.gamequest.removeCompleted( this.checkFlag );
        }
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.bounce > 0 && this.isOnGround() ) {
            this.physics.vz = -this.bounce;
            this.bounce--;
        }

        this.position = this.getNextPoi();
    }


/*******************************************************************************
* Checks
*******************************************************************************/
    canPickup () {
        return this.bounce === 0 && this.isOnGround();
    }
}