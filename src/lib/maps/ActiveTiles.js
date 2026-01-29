import Config from "../Config";
import FX from "../sprites/FX";



/*******************************************************************************
* ActiveTiles
* Static and animated background tiles injected into the texture map.
* They work in groups based on tileset background position for rendering.
* They can have interactions with VERB system or can be attacked with weapon.
*******************************************************************************/
export default class ActiveTiles {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
        this.gamebox = this.map.gamebox;
        this.player = this.map.player;
        this.frame = 0;
        this.pushed = [
            // Array of "tilebox" objects
            // { x, y, width, height, coords }
        ];
        this.spliced = [
            // Array of "tilebox" objects
            // { x, y, width, height, coords }
        ];
        this.previousElapsed = null;
    }


    destroy () {}


    blit ( elapsed ) {
        if ( this.previousElapsed === null ) {
            this.previousElapsed = elapsed;
        }

        this.applyFrame( elapsed );
    }


    applyFrame ( elapsed ) {
        if ( this.data.stepsX ) {
            const interval = this.data.dur / this.data.stepsX;
            const delta = ( elapsed - this.previousElapsed );

            if ( delta >= interval ) {
                this.previousElapsed = elapsed - ( delta % interval );
                this.frame++;

                if ( this.frame >= this.data.stepsX ) {
                    this.previousElapsed = null;
                    this.frame = 0;
                }
            }

        } else {
            this.frame = 0;
        }
    }


    getTile () {
        return [
            ( this.data.offsetX + ( this.frame * this.map.data.tilesize ) ),
            this.data.offsetY,
        ];
    }


    canInteract ( verb = null ) {
        if ( !verb ) {
            return this.data.actions;
        }

        for ( let i = this.data.actions.length; i--; ) {
            if ( this.data.actions[ i ].verb === verb ) {
                return this.data.actions[ i ];
            }
        }

        return null;
    }


    canAttack () {
        if ( !this.data.actions ) {
            return null;
        }

        for ( let i = this.data.actions.length; i--; ) {
            if ( this.data.actions[ i ].verb === Config.verbs.ATTACK ) {
                return this.data.actions[ i ];
            }
        }

        return null;
    }


    attack ( coords, action ) {
        this.splice( coords );

        const obj = {
            position: {
                x: coords[ 0 ] * this.map.data.tilesize,
                y: coords[ 1 ] * this.map.data.tilesize,
            },
            width: this.map.data.tilesize,
            height: this.map.data.tilesize,
        };

        if ( action.drops ) {
            this.gamebox.itemDrop( action.drops, obj.position );
        }
        
        this.map.mapFX.smokeObject( obj, action.fx );
    }


    push ( coords ) {
        if ( this.isPushed( coords ) ) {
            return;
        }

        const tilebox = {
            x: coords[ 0 ] * this.map.data.tilesize,
            y: coords[ 1 ] * this.map.data.tilesize,
            width: this.map.data.tilesize,
            height: this.map.data.tilesize,
            coords,
        };

        this.pushed.push( tilebox );

        if ( this.data.fx ) {
            this.addFX( tilebox );
        }
    }


    splice ( coords ) {
        if ( this.isSpliced( coords ) ) {
            return;
        }

        for ( let i = this.pushed.length; i--; ) {
            if ( this.pushed[ i ].coords[ 0 ] === coords[ 0 ] && this.pushed[ i ].coords[ 1 ] === coords[ 1 ] ) {
                this.spliced.push( this.pushed[ i ] );
                this.pushed.splice( i, 1 );
                break;
            }
        }
    }


    addFX ( tilebox ) {
        const offsetX = this.data.fx.offsetX || 0;
        const offsetY = this.data.fx.offsetY || 0;
        const fx = new FX(
            this.player.getMergedData({
                id: this.data.fx.id,
                dur: this.data.fx.dur,
                type: this.data.fx.type,
                spawn: {
                    x: tilebox.x + offsetX,
                    y: tilebox.y + offsetY,
                },
            }, "fx", true ),
            this.map
        );
        this.map.addObject( "fx", fx );
    }


    isInArray ( array, testCoords ) {
        for ( let i = array.length; i--; ) {
            if ( array[ i ].coords[ 0 ] === testCoords[ 0 ] && array[ i ].coords[ 1 ] === testCoords[ 1 ] ) {
                return true;
            }
        }

        return false;
    }


    isPushed ( testCoords ) {
        return this.isInArray( this.pushed, testCoords );
    }


    isSpliced ( testCoords ) {
        return this.isInArray( this.spliced, testCoords );
    }
}