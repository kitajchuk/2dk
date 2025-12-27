import Utils from "../Utils";
import FX from "./FX";
import Sprite from "./Sprite";



/*******************************************************************************
* Door Sprite
* Can open shaking and smoking
*******************************************************************************/
class Door extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.open = false;
        this.opening = false;
        this.closing = false;
        this.counter = 0;
        this.originalX = this.position.x;
    }


    destroy () {}


    visible () {
        return Utils.collide( this.gamebox.camera, {
            x: this.position.x,
            y: this.position.y,
            width: this.width,
            height: this.height,
        });
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
* Update is overridden for Sprite subclasses with different behaviors
* Default behavior for a Sprite is to be static but with Physics forces
*******************************************************************************/
    render () {
        if ( !this.visible() ) {
            return;
        }

        this.gamebox.layers[ this.layer ].onCanvas.context.drawImage(
            this.image,
            this.spritecel[ 0 ],
            this.spritecel[ 1 ],
            this.data.width,
            this.data.height - this.counter,
            this.offset.x,
            this.offset.y + this.counter,
            this.width,
            this.height - this.counter
        );
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.open ) {
            return;
        }

        if ( this.opening ) {
            this.counter++;
            this.position.x += ( this.counter % 2 === 0 ? -3 : 3 );

            if ( this.counter % 5 === 0 ) {
                this.applyFX();
            }

            if ( this.counter % 15 === 0 ) {
                this.applySound();
            }

            if ( this.counter >= this.data.height ) {
                this.opening = false;
                this.open = true;
                this.position.x = this.originalX;
            }

            return;
        }

        if ( this.closing ) {
            this.counter--;
            this.position.x += ( this.counter % 2 === 0 ? -3 : 3 );

            if ( this.counter % 5 === 0 ) {
                this.applyFX();
            }

            if ( this.counter % 15 === 0 ) {
                this.applySound();
            }

            if ( this.counter <= 0 ) {
                this.closing = false;
                this.open = false;
                this.position.x = this.originalX;
            }

            return;
        }

        this.position = this.getNextPoi();
    }


    applySound () {
        if ( !this.data.action.sound ) {
            return;
        }

        this.gamebox.player.gameaudio.hitSound( this.data.action.sound );
    }


    applyFX () {
        if ( !this.data.action.fx ) {
            return;
        }

        const data = this.map.gamebox.player.getMergedData({
            id: this.data.action.fx,
            kill: true,
        }, "fx" );

        // Center
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: this.position.x + ( this.width / 2 ) - ( data.width / 2 ),
                y: this.position.y + this.height - (data.height / 2 ),
            },
            vy: -Utils.random( 0, this.height / 2 ),
        }), this.map ) );

        // Left
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: this.position.x - ( data.width / 2 ),
                y: this.position.y + this.height - (data.height / 2 ),
            },
            vx: -Utils.random( 0, 16 ),
            vy: -Utils.random( 0, this.height / 2 ),
        }), this.map ) );

        // Right
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: this.position.x + this.width - ( data.width / 2 ),
                y: this.position.y + this.height - (data.height / 2 ),
            },
            vx: Utils.random( 0, 16 ),
            vy: -Utils.random( 0, this.height / 2 ),
        }), this.map ) );

        // Add more FX if the door is wider than a tile
        if ( this.width > this.map.data.tilesize ) {
            // Left center
            this.map.addFX( new FX( Utils.merge( data, {
                spawn: {
                    x: this.position.x + ( this.width / 4 ) - ( data.width / 2 ),
                    y: this.position.y + this.height - (data.height / 2 ),
                },
                vx: -Utils.random( 0, 16 ),
                vy: -Utils.random( 0, this.height / 2 ),
            }), this.map ) );

            // Right center
            this.map.addFX( new FX( Utils.merge( data, {
                spawn: {
                    x: this.position.x + this.width - ( this.width / 4 ) - ( data.width / 2 ),
                    y: this.position.y + this.height - (data.height / 2 ),
                },
                vx: Utils.random( 0, 16 ),
                vy: -Utils.random( 0, this.height / 2 ),
            }), this.map ) );
        }
    }


/*******************************************************************************
* Interactions
*******************************************************************************/
    canDoAction ( verb ) {
        return ( this.data.action && this.data.action.verb && verb === this.data.action.verb );
    }


    doAction ( verb ) {
        if ( this.opening || this.closing ) {
            return;
        }

        if ( this.open ) {
            this.open = false;
            this.closing = true;
            this.counter = this.height;
            return;
        }

        this.opening = true;
        this.counter = 0;
    }
}



export default Door;
