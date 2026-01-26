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
        this.pushed = [];
        this.spliced = [];
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
        return verb ? this.data.actions.find( ( action ) => {
            return action.verb === verb;

        }) : this.data.actions;
    }


    canAttack () {
        return this.data.actions && this.data.actions.find( ( action ) => {
            return action.verb === Config.verbs.ATTACK;
        });
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
        
        this.gamebox.smokeObject( obj, action.fx );
    }


    splice ( coords ) {
        if ( !this.isSpliced( coords ) ) {
            for ( let i = this.pushed.length; i--; ) {
                if ( this.pushed[ i ][ 0 ] === coords[ 0 ] && this.pushed[ i ][ 1 ] === coords[ 1 ] ) {
                    this.spliced.push( this.pushed[ i ] );
                    this.pushed.splice( i, 1 );
                    return true;
                }
            }
        }
    }


    push ( coords ) {
        if ( !this.isPushed( coords ) ) {
            this.pushed.push( coords );

            // TODO: Lets see how we feel about this...
            if ( this.data.fx ) {
                this.addFX( coords );
            }
        }
    }


    addFX ( coords ) {
        const offsetX = this.data.fx.offsetX || 0;
        const offsetY = this.data.fx.offsetY || 0;
        const fx = new FX(
            this.player.getMergedData({
                id: this.data.fx.id,
                dur: this.data.fx.dur,
                type: this.data.fx.type,
                spawn: {
                    x: coords[ 0 ] * this.map.data.tilesize + offsetX,
                    y: coords[ 1 ] * this.map.data.tilesize + offsetY,
                },
            }, "fx", true ),
            this.map
        );
        this.map.addObject( "fx", fx );
    }


    isPushed ( testCoords ) {
        return this.pushed.find( ( coord ) => {
            return ( coord[ 0 ] === testCoords[ 0 ] && coord[ 1 ] === testCoords[ 1 ] );
        });
    }


    isSpliced ( testCoords ) {
        return this.spliced.find( ( coord ) => {
            return ( coord[ 0 ] === testCoords[ 0 ] && coord[ 1 ] === testCoords[ 1 ] );
        });
    }
}