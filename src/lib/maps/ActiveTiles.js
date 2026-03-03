import Config from "../Config";
import FX from "../sprites/FX";
import Utils from "../Utils";



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
        this.isAnimated = !!this.data.stepsX;
        this.pushed = [
            // Array of TileBox objects
        ];
        this.previousElapsed = null;

        this.initialize();
    }


    destroy () {}


    initialize () {
        for ( let y = this.map.data.textures[ this.data.layer ].length; y--; ) {    
            for ( let x = this.map.data.textures[ this.data.layer ][ y ].length; x--; ) {
                const cel = this.map.data.textures[ this.data.layer ][ y ][ x ];

                if ( !Array.isArray( cel ) ) {
                    continue;
                }

                const coords = [ x, y ];

                // De-spawn the tile if the quest has been completed
                if ( this.gamebox.gamequest.getCompleted( this.getMapId( coords ) ) ) {
                    this.spliceTexture( coords );
                    continue;
                }

                const topCel = cel[ cel.length - 1 ];

                if ( topCel[ 0 ] === this.data.offsetX && topCel[ 1 ] === this.data.offsetY ) {
                    this.push( coords );
                }
            }
        }
    }


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


    getQuest ( verb ) {
        const action = this.canInteract( verb );

        if ( action ) {
            return action.quest;
        }

        return null;
    }


    getMapId ( coords ) {
        return `${this.map.data.id}-${this.data.group}-${coords[ 0 ]}-${coords[ 1 ]}`;
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
        return this.canInteract( Config.verbs.ATTACK );
    }


    attack ( coords, action ) {
        const tilebox = this.getPushed( coords );
        const obj = {
            position: {
                x: tilebox.x,
                y: tilebox.y,
            },
            width: tilebox.width,
            height: tilebox.height,
        };

        if ( action.drops ) {
            this.gamebox.itemDrop( action.drops, obj.position );
        }

        if ( action.quest ) {
            this.gamebox.gamequest.completeQuest( this.getMapId( coords ) );
        }

        if ( action.sound ) {
            this.player.gameaudio.hitSound( action.sound );
        }

        this.map.mapFX.smokeObject( obj, action.fx );
        this.splice( coords );
    }


    push ( coords ) {
        const data = {
            x: coords[ 0 ] * this.map.data.tilesize,
            y: coords[ 1 ] * this.map.data.tilesize,
            width: this.map.data.tilesize,
            height: this.map.data.tilesize,
            coords,
        };

        this.pushed.push( new TileBox( data, this ) );

        if ( this.data.fx ) {
            this.addFX( data );
        }
    }


    getPushed ( coords ) {
        for ( let i = this.pushed.length; i--; ) {
            if ( this.pushed[ i ].isCoords( coords ) ) {
                return this.pushed[ i ];
            }
        }

        return null;
    }


    splice ( coords ) {
        if ( !this.isPushed( coords ) ) {
            return;
        }

        for ( let i = this.pushed.length; i--; ) {
            if ( this.pushed[ i ].coords[ 0 ] === coords[ 0 ] && this.pushed[ i ].coords[ 1 ] === coords[ 1 ] ) {
                // Texture is spliced when the tilebox goes offgrid so skip that or else we'll splice it twice
                if ( this.pushed[ i ].offgrid ) {
                    this.map.removeOffgridTile( this.pushed[ i ] );
                } else {
                    this.spliceTexture( coords );
                }
                this.pushed.splice( i, 1 );
                break;
            }
        }
    }


    spliceTexture ( coords ) {
        // Remove the tile from the texture map (direct mutation since we use a cloned data object)
        // This greatly simplifies the logic for rendering the map after we've interacted with the tile
        // since on the next frame the texture will be updated to show the new tile state
        this.map.data.textures[ this.data.layer ][ coords[ 1 ] ][ coords[ 0 ] ].pop();
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
}



export class TileBox {
    constructor ( data, activeTiles ) {
        this.data = data;
        this.activeTiles = activeTiles;
        this.gamebox = this.activeTiles.gamebox;
        this.player = this.gamebox.player;
        this.map = this.activeTiles.map;
        this.x = data.x;
        this.y = data.y;
        this.width = data.width;
        this.height = data.height;
        this.coords = data.coords;
        this.offgrid = false;
        this.mapId = this.activeTiles.getMapId( this.coords );
        this.pushed = null;

        // Apply initial perceptionBox
        this.applyHitbox();
    }


    isCoords ( coords ) {
        return this.coords[ 0 ] === coords[ 0 ] && this.coords[ 1 ] === coords[ 1 ];
    }


    goOffGrid () {
        this.offgrid = true;
        this.activeTiles.spliceTexture( this.coords );
    }


    update () {
        this.applyHitbox();
        this.applyPosition();
    }


    render () {
        this.spritecel = this.activeTiles.getTile();
        this.gamebox.draw(
            this.map.image,
            this.spritecel[ 0 ],
            this.spritecel[ 1 ],
            this.width,
            this.height,
            this.x - this.gamebox.camera.x,
            this.y - this.gamebox.camera.y,
            this.width,
            this.height
        );
    }


    // A bit of "sprite"-ness here helps a lot with rendering and collision detection...


    applyPosition () {
        if ( !this.pushed ) {
            return;
        }

        const poi = Utils.getNextPushPosition( this.pushed.dir, {
            x: this.x,
            y: this.y,
        });
        const { isCollision } = Utils.getPushedCollision( this.gamebox, poi, this );

        if ( isCollision ) {
            this.pushed = null;
            this.gamebox.locked = false;
            return;
        }

        this.x = poi.x;
        this.y = poi.y;

        if ( this.x === this.pushed.poi.x && this.y === this.pushed.poi.y ) {
            this.pushed = null;
            this.gamebox.locked = false;
        }
    }


    applyHitbox () {
        this.hitbox = {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
        };
        this.perceptionBox = Utils.getPerceptionBox(
            this, // { x, y, ... }
            this.width,
            this.height,
            this.map.data.tilesize
        );
    }


    getHitbox ( poi ) {
        return {
            x: poi.x,
            y: poi.y,
            width: this.hitbox.width,
            height: this.hitbox.height,
        };
    }
}