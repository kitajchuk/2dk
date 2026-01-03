import Sprite from "./Sprite";



export default class ItemDrop extends Sprite {
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
        this.killCounter = 60 * 6;
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.killCounter > 0 ) {
            this.killCounter--;

            if ( this.killCounter === 0 ) {
                this.map.killObject( "items", this );
            }
        }

        if ( this.bounce > 0 && this.position.z === 0 ) {
            this.physics.vz = -this.bounce;
            this.bounce--;
        }

        this.position = this.getNextPoi();
    }


    applyOpacity () {
        if ( this.killCounter <= 60 * 2 ) {
            if ( this.killCounter % 5 === 0 ) {
                this.gamebox.mapLayer.context.globalAlpha = 0.25;
            }
        }
    }

/*******************************************************************************
* Checks
*******************************************************************************/
    canPickup () {
        return this.bounce === 0;
    }
}