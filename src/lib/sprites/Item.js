import Sprite from "./Sprite";



export default class Item extends Sprite {
    constructor ( spawn, item, map ) {
        const data = {
            layer: "background",
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