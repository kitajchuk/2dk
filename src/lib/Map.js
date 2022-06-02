import Utils from "./Utils";
import Loader from "./Loader";
import Config from "./Config";
import NPC from "./sprites/NPC";
import FX from "./sprites/FX";



/*******************************************************************************
* ActiveTiles
* Static and animated background tiles injected into the texture map.
* They work in groups based on tileset background position for rendering.
* They can have interactions with VERB system or can be attacked with weapon.
*******************************************************************************/
class ActiveTiles {
    constructor ( data, map ) {
        this.data = data;
        this.map = map;
        this.gamebox = this.map.gamebox;
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

        this.frame = 0;

        if ( this.data.stepsX ) {
            const diff = ( elapsed - this.previousElapsed );

            this.frame = Math.min(
                Math.floor( ( diff / this.data.dur ) * this.data.stepsX ),
                ( this.data.stepsX - 1 )
            );

            if ( diff >= this.data.dur ) {
                this.previousElapsed = elapsed;
                this.frame = 0;
            }
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


    attack ( coords ) {
        this.splice( coords );
        this.map.gamebox.smokeObject({
            position: {
                x: coords[ 0 ] * this.map.data.tilesize,
                y: coords[ 1 ] * this.map.data.tilesize,
            },
            width: this.map.data.tilesize,
            height: this.map.data.tilesize,
        });
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
        }
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



/*******************************************************************************
* MapLayer
* Normalize a rendering layer for Canvas and Context.
*******************************************************************************/
class MapLayer {
    constructor ( data ) {
        this.data = data;
        this.build();
    }


    build () {
        this.canvas = document.createElement( "canvas" );
        this.canvas.className = "_2dk__layer";
        this.canvas.dataset.layer = this.data.id;
        this.context = this.canvas.getContext( "2d" );
        this.update( this.data.width, this.data.height );
    }


    update ( width, height ) {
        this.data.width = width;
        this.data.height = height;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.canvas.width = width;
        this.canvas.height = height;
    }


    clear () {
        this.context.clearRect(
            0,
            0,
            this.canvas.width,
            this.canvas.height
        );
    }


    destroy () {
        this.clear();
        this.canvas.width = 0;
        this.canvas.height = 0;
        this.context = null;
        this.canvas = null;
    }
}



/*******************************************************************************
* Map
* The logic map.
* Everything is rendered via the Map as the Map is our game world.
* My preference is to keep this sort of logic out of the GameBox, which
* manages Map offset and Camera position.
*******************************************************************************/
class Map {
    constructor ( data, gamebox ) {
        this.data = data;
        this.gamebox = gamebox;
        this.camera = this.gamebox.camera;
        this.width = this.data.width;
        this.height = this.data.height;
        this.image = Loader.cash( data.image );
        this.layers = {
            background: null,
            foreground: null,
        };
        this.activeTiles = [];
        this.fx = [];
        this.npcs = [];
        this.offset = {
            x: 0,
            y: 0,
        };
        this.build();
    }


    destroy () {
        Object.keys( this.layers ).forEach( ( id ) => {
            this.layers[ id ].offCanvas.destroy();
        });
        this.layers = null;

        this.activeTiles.forEach( ( activeTiles ) => {
            activeTiles.destroy();
        });
        this.activeTiles = null;

        this.npcs.forEach( ( npc ) => {
            npc.destroy();
        });
        this.npcs = null;

        this.fx.forEach( ( fx ) => {
            fx.destroy();
        });
        this.fx = null;

        this.image = null;
    }


    build () {
        // Render layers
        Object.keys( this.layers ).forEach( ( id ) => {
            this.addLayer( id );
        });

        // FX
        this.data.fx.forEach( ( data ) => {
            this.fx.push( new FX( this.gamebox.player.getMergedData( data, "fx", true ), this ) );
        });

        // NPCs
        this.data.npcs.forEach( ( data ) => {
            this.npcs.push( new NPC( this.gamebox.player.getMergedData( data, "npcs" ), this ) );
        });

        // Tiles
        this.data.tiles.forEach( ( data ) => {
            this.activeTiles.push( new ActiveTiles( data, this ) );
        });
    }


    addLayer ( id ) {
        const offWidth = this.gamebox.camera.width + ( this.data.tilesize * 2 );
        const offHeight = this.gamebox.camera.height + ( this.data.tilesize * 2 );

        this.layers[ id ] = {};
        this.layers[ id ].offCanvas = new MapLayer({
            id,
            width: offWidth,
            height: offHeight,
        });

        this.layers[ id ].offCanvas.canvas.width = `${offWidth * this.gamebox.camera.resolution}`;
        this.layers[ id ].offCanvas.canvas.height = `${offHeight * this.gamebox.camera.resolution}`;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
* Map data order is: tiles, objects, hero, npcs, fx
*******************************************************************************/
    blit ( elapsed ) {
        this.activeTiles.forEach( ( activeTiles ) => {
            activeTiles.blit( elapsed );
        });

        this.npcs.forEach( ( npc ) => {
            npc.blit( elapsed );
        });

        this.fx.forEach( ( fx ) => {
            fx.blit( elapsed );
        });
    }


    update ( offset ) {
        this.offset = offset;

        this.npcs.forEach( ( npc ) => {
            npc.update();
        });

        this.fx.forEach( ( fx ) => {
            fx.update();
        });
    }


    render ( camera ) {
        this.clear();

        this.camera = camera;
        this.renderBox = this.getRenderbox( camera );

        // Separate background / foreground NPCs
        const npcsBg = this.npcs.filter( ( npc ) => {
            return npc.data.type !== Config.npc.FLOAT && npc.layer === "background";
        });
        const npcsFg = this.npcs.filter( ( npc ) => {
            return npc.data.type === Config.npc.FLOAT || npc.layer === "foreground";
        });

        // Draw background textures
        this.renderTextures( "background" );

        // Draw NPCs to background
        npcsBg.forEach( ( npc ) => {
            npc.render();
        });

        // Draw foreground textures
        this.renderTextures( "foreground" );

        // Draw NPCs to foreground
        // Float NPCs are included always
        npcsFg.forEach( ( npc ) => {
            npc.render();
        });

        // Draw FX
        // This is the topmost layer so we can do cool stuff...
        this.fx.forEach( ( fx ) => {
            fx.render();
        });

        // Visual event debugging....
        if ( this.gamebox.player.query.debug ) {
            this.data.events.forEach( ( event ) => {
                this.gamebox.layers.foreground.onCanvas.context.globalAlpha = 0.5;
                this.gamebox.layers.foreground.onCanvas.context.fillStyle = Config.colors.blue;
                this.gamebox.layers.foreground.onCanvas.context.fillRect(
                    this.offset.x + ( event.coords[ 0 ] * this.data.tilesize ),
                    this.offset.y + ( event.coords[ 1 ] * this.data.tilesize ),
                    this.data.tilesize,
                    this.data.tilesize
                );
            });
            this.data.spawn.forEach( ( spawn ) => {
                this.gamebox.layers.foreground.onCanvas.context.fillStyle = Config.colors.yellow;
                this.gamebox.layers.foreground.onCanvas.context.fillRect(
                    this.offset.x + spawn.x,
                    this.offset.y + spawn.y,
                    this.gamebox.hero.width,
                    this.gamebox.hero.height
                );
            });

            const visibleTiles = this.gamebox.getVisibleActiveTiles();

            this.gamebox.layers.foreground.onCanvas.context.fillStyle = Config.colors.pink;

            visibleTiles.forEach( ( activeTiles ) => {
                activeTiles.pushed.forEach( ( coord ) => {
                    this.gamebox.layers.foreground.onCanvas.context.fillRect(
                        this.offset.x + ( coord[ 0 ] * this.data.tilesize ),
                        this.offset.y + ( coord[ 1 ] * this.data.tilesize ),
                        this.data.tilesize,
                        this.data.tilesize
                    );
                });
            });

            this.gamebox.layers.foreground.onCanvas.context.globalAlpha = 1.0;
        }
    }


    renderTextures ( id ) {
        // Draw textures to background / foreground
        Utils.drawMapTiles(
            this.layers[ id ].offCanvas.context,
            this.image,
            this.renderBox.textures[ id ],
            this.data.tilesize,
            this.data.tilesize
        );

        // Draw offscreen Map canvases to the onscreen World canvases
        this.gamebox.layers[ id ].onCanvas.context.drawImage(
            this.layers[ id ].offCanvas.canvas,
            0,
            0,
            this.layers[ id ].offCanvas.canvas.width,
            this.layers[ id ].offCanvas.canvas.height,
            this.renderBox.bleed.x,
            this.renderBox.bleed.y,
            this.layers[ id ].offCanvas.canvas.width,
            this.layers[ id ].offCanvas.canvas.height
        );
    }


    clear () {
        Object.keys( this.layers ).forEach( ( id ) => {
            this.layers[ id ].offCanvas.clear();
        });
    }


    getRenderbox ( camera ) {
        const renderBox = {
            x: Math.floor( camera.x / this.data.tilesize ) - 1,
            y: Math.floor( camera.y / this.data.tilesize ) - 1,
            width: camera.width + ( this.data.tilesize * 2 ),
            height: camera.height + ( this.data.tilesize * 2 ),
            bleed: {},
            textures: {},
        };

        renderBox.bleed = this.getBleed( renderBox, camera );
        renderBox.textures = this.getTextures( renderBox, camera );

        return renderBox;
    }


    getBleed ( renderBox, camera ) {
        return {
            x: -( camera.x - ( renderBox.x * this.data.tilesize ) ),
            y: -( camera.y - ( renderBox.y * this.data.tilesize ) ),
        };
    }


    getTextures ( renderBox ) {
        const height = ( renderBox.height / this.data.tilesize );
        const width = ( renderBox.width / this.data.tilesize );
        const ret = {};

        Object.keys( this.data.textures ).forEach( ( id ) => {
            let y = 0;

            ret[ id ] = [];

            while ( y < height ) {
                ret[ id ][ y ] = [];

                const lookupY = renderBox.y + y;

                if ( this.data.textures[ id ][ lookupY ] ) {
                    let x = 0;

                    while ( x < width ) {
                        const lookupX = renderBox.x + x;

                        if ( this.data.textures[ id ][ lookupY ][ lookupX ] ) {
                            const celsCopy = Utils.copy( this.data.textures[ id ][ lookupY ][ lookupX ] );
                            const activeTile = this.getActiveTile( id, [lookupX, lookupY], celsCopy );

                            // Render the textures
                            // Shift foreground behind hero render if coords determine so
                            if ( id === "foreground" && ( lookupY * this.data.tilesize ) < this.gamebox.hero.position.y ) {
                                ret.background[ y ][ x ] = ret.background[ y ][ x ].concat( celsCopy );

                            } else {
                                ret[ id ][ y ][ x ] = celsCopy;
                            }

                            // Push any ActiveTiles to the cel stack
                            if ( activeTile ) {
                                ret[ id ][ y ][ x ].push( activeTile );
                            }

                        } else {
                            ret[ id ][ y ][ x ] = 0;
                        }

                        x++;
                    }
                }

                y++;
            }
        });

        return ret;
    }


    spliceActiveTile ( group, coords ) {
        const activeTiles = this.getActiveTiles( group );

        activeTiles.splice( coords );
    }


    getActiveTiles ( group ) {
        return this.activeTiles.find( ( activeTiles ) => ( activeTiles.data.group === group ) );
    }


    getActiveTile ( layer, celsCoords, celsCopy ) {
        // Either return a tile or don't if it's a static thing...
        const layerTiles = this.data.tiles.filter( ( tiles ) => {
            return tiles.layer === layer;
        });

        for ( let i = layerTiles.length; i--; ) {
            const tiles = layerTiles[ i ];
            const topCel = celsCopy[ celsCopy.length - 1 ];
            const activeTiles = this.getActiveTiles( tiles.group );

            if ( activeTiles.pushed.length ) {
                for ( let j = activeTiles.pushed.length; j--; ) {
                    const coord = activeTiles.pushed[ j ];

                    // Correct tile coords
                    if ( coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ] ) {
                        // (tiles.offsetX === topCel[ 0 ] && tiles.offsetY === topCel[ 1 ])
                        const isTileAnimated = tiles.stepsX;

                        // Make sure we don't dupe a tile match if it's NOT animated...
                        if ( isTileAnimated ) {
                            return activeTiles.getTile();
                        }
                    }
                }
            }

            if ( tiles.offsetX === topCel[ 0 ] && tiles.offsetY === topCel[ 1 ] ) {
                // Check if tile is pushed...
                const isTilePushed = activeTiles.isPushed( celsCoords );
                const isTileSpliced = activeTiles.isSpliced( celsCoords );

                // Push the tile to the coords Array...
                // This lets us generate ActiveTile groups that will
                // find their coordinates in real-time using spritesheet background-position...
                if ( !isTilePushed && !isTileSpliced ) {
                    // Really we should have a ActiveTiles.prototype.coords
                    // Then this should find ActiveTiles instance and push there...
                    activeTiles.push( celsCoords );
                    return true;

                // An ActiveTiles coord can be spliced during interaction.
                // Example: Hero picks up an action tile and throws it.
                // The original tile cel still exists in the textures data,
                // but we can capture this condition and make sure we pop
                // if off and no longer render it to the texture map.
                } else if ( isTileSpliced ) {
                    celsCopy.pop();
                    return celsCopy;
                }
            }
        }
    }


    addNPC ( npc ) {
        this.npcs.push( npc );
    }


    addFX ( fx ) {
        this.fx.push( fx );
    }


    killObj ( type, obj ) {
        this[ type ].splice( this[ type ].indexOf( obj ), 1 );
        obj.destroy();
        obj = null;
    }
}



export default Map;

export {
    Map,
    MapLayer,
    ActiveTiles,
};
