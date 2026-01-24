import Sprite from "./Sprite";



export default class KeyItem extends Sprite {
    // item: { spawn, dialogue: { type, text } }
    constructor ( item, map, mapId ) {
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
    constructor ( spawn, item, map ) {
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
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.bounce > 0 && this.position.z === 0 ) {
            this.physics.vz = -this.bounce;
            this.bounce--;
        }

        this.position = this.getNextPoi();
    }


/*******************************************************************************
* Checks
*******************************************************************************/
    canPickup () {
        return this.bounce === 0;
    }
}