import Utils from "../Utils";
import Loader from "../Loader";
import Config from "../Config";
import NPC from "../sprites/NPC";
import FX from "../sprites/FX";
import MapLayer from "./MapLayer";
import ActiveTiles from "./ActiveTiles";



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
            this.renderDebug();
        }
    }


    renderDebug () {
        const visibleColliders = this.gamebox.getVisibleColliders();

        visibleColliders.forEach( ( collider ) => {
            this.gamebox.layers.foreground.onCanvas.context.globalAlpha = 0.5;
            this.gamebox.layers.foreground.onCanvas.context.fillStyle = Config.colors.red;
            this.gamebox.layers.foreground.onCanvas.context.fillRect(
                this.offset.x + ( collider[ 0 ] * this.data.collider ),
                this.offset.y + ( collider[ 1 ] * this.data.collider ),
                this.data.collider,
                this.data.collider
            );
        });

        this.gamebox.layers.foreground.onCanvas.context.globalAlpha = 1.0;
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
                            const celsCopy = structuredClone( this.data.textures[ id ][ lookupY ][ lookupX ] );
                            const activeTile = this.getActiveTile( id, [lookupX, lookupY], celsCopy );
                            const isShiftableForeground = this.checkShiftableForeground( id, lookupY, lookupX );
                            
                            // Shift foreground behind hero render if textures and hero position determine so
                            if ( isShiftableForeground ) {
                                ret.background[ y ][ x ] = ret.background[ y ][ x ].concat( celsCopy );

                            } else {
                                ret[ id ][ y ][ x ] = celsCopy;
                            }
                            
                            // Push any ActiveTiles to the cel stack
                            if ( activeTile ) {
                                ret[ id ][ y ][ x ].push( activeTile );
                            }
                            
                        // Empty textures are represented as 0 in the texture matrix (data)
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


    checkShiftableForeground ( layer, lookupY, lookupX ) {
        if ( layer !== "foreground" ) {
            return false;
        }

        // Foreground is unique in that it can be shifted behind the hero.
        // However, it's not good enough to just check the current foreground tile.
        // If the next tile down also contains foreground texture data we need to check
        // whether it can also be shifted. If not we can assume that the foreground tiles are
        // "connected" and we should not shift them behind the hero otherwise we'd produce
        // a rendering glitch.
        // E.g. hero renders behind one foreground tile and in front of the tile below it
        // even though visually the hero should be behind both tiles.

        const isShiftable = ( lookupY * this.data.tilesize ) < this.gamebox.hero.position.y;

        if ( isShiftable ) {
            const nextLookupY = lookupY + 1;

            if ( this.data.textures[ layer ][ nextLookupY ][ lookupX ] ) {
                const isNextShiftable = ( nextLookupY * this.data.tilesize ) < this.gamebox.hero.position.y;

                return isNextShiftable;

            } else {
                return true;
            }
        }
        
        return false;
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
            const isTileAnimated = tiles.stepsX;
            const isTilePushed = activeTiles.isPushed( celsCoords );
            const isTileSpliced = activeTiles.isSpliced( celsCoords );


            if ( activeTiles.pushed.length ) {
                for ( let j = activeTiles.pushed.length; j--; ) {
                    const coord = activeTiles.pushed[ j ];

                    // Correct tile coords
                    if ( coord[ 0 ] === celsCoords[ 0 ] && coord[ 1 ] === celsCoords[ 1 ] && isTileAnimated ) {
                        // Make sure we don't dupe a tile match if it's NOT animated...
                        return activeTiles.getTile();
                    }
                }
            }

            if ( tiles.offsetX === topCel[ 0 ] && tiles.offsetY === topCel[ 1 ] ) {
                // Push the tile to the coords Array...
                // This lets us generate ActiveTile groups that will
                // find their coordinates in real-time using spritesheet background-position...
                if ( !isTilePushed && !isTileSpliced ) {
                    // Really we should have a ActiveTiles.prototype.coords
                    // Then this should find ActiveTiles instance and push there...
                    activeTiles.push( celsCoords );
                    return true;
                }

                // An ActiveTiles coord can be spliced during interaction.
                // Example: Hero picks up an action tile and throws it.
                // The original tile cel still exists in the textures data,
                // but we can capture this condition and make sure we pop
                // if off and no longer render it to the texture map.
                if ( isTileSpliced ) {
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
