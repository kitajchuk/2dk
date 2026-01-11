import Utils from "../Utils";
import Loader from "../Loader";
import Config from "../Config";
import NPC from "../sprites/NPC";
import Door from "../sprites/Door";
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
        this.player = this.gamebox.player;
        this.camera = this.gamebox.camera;
        this.width = this.data.width;
        this.height = this.data.height;
        this.image = Loader.cash( data.image );
        this.layers = {
            background: null,
            foreground: null,
        };
        this.offset = {
            x: 0,
            y: 0,
        };

        // From map data
        this.activeTiles = [];
        this.fx = [];
        this.npcs = [];
        this.doors = [];

        // From live game state
        this.items = [];
        this.sprites = [];
    }


    destroy () {
        for ( const id in this.layers ) {
            this.layers[ id ].offCanvas.destroy();
        }
        this.layers = null;

        for ( let i = this.activeTiles.length; i--; ) {
            this.activeTiles[ i ].destroy();
        }
        this.activeTiles = null;

        for ( let i = this.npcs.length; i--; ) {
            this.npcs[ i ].destroy();
        }
        this.npcs = null;

        for ( let i = this.doors.length; i--; ) {
            this.doors[ i ].destroy();
        }
        this.doors = null;

        for ( let i = this.fx.length; i--; ) {
            this.fx[ i ].destroy();
        }
        this.fx = null;

        for ( let i = this.items.length; i--; ) {
            this.items[ i ].destroy();
        }
        this.items = null;

        for ( let i = this.sprites.length; i--; ) {
            this.sprites[ i ].destroy();
        }
        this.sprites = null;

        this.image = null;
    }


    initialize () {
        // Texture layers
        for ( const id in this.layers ) {
            this.addLayer( id );
        }

        // FX
        for ( let i = this.data.fx.length; i--; ) {
            this.fx.push(
                new FX(
                    this.player.getMergedData( this.data.fx[ i ], "fx", true ),
                    this
                )
            );
        }

        // NPCs and Doors
        for ( let i = this.data.npcs.length; i--; ) {
            if ( this.data.npcs[ i ].type === Config.npc.types.DOOR ) {
                this.doors.push(
                    new Door(
                        this.player.getMergedData( this.data.npcs[ i ], "npcs" ),
                        this
                    )
                );
    
            } else {
                this.npcs.push(
                    new NPC(
                        this.player.getMergedData( this.data.npcs[ i ], "npcs" ),
                        this,
                        // Unique map ID for the NPC
                        // This is used to identify the NPC when giving items
                        `npc-${this.data.id}-${i}`
                    )
                );
            }
        }

        // Tiles
        for ( let i = this.data.tiles.length; i--; ) {
            this.activeTiles.push( new ActiveTiles( this.data.tiles[ i ], this ) );
        }
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
        for ( let i = this.activeTiles.length; i--; ) {
            this.activeTiles[ i ].blit( elapsed );
        }

        for ( let i = this.npcs.length; i--; ) {
            this.npcs[ i ].blit( elapsed );
        }

        for ( let i = this.doors.length; i--; ) {
            this.doors[ i ].blit( elapsed );
        }

        for ( let i = this.fx.length; i--; ) {
            this.fx[ i ].blit( elapsed );
        }

        for ( let i = this.sprites.length; i--; ) {
            this.sprites[ i ].blit( elapsed );
        }

        for ( let i = this.items.length; i--; ) {
            this.items[ i ].blit( elapsed );
        }
    }


    update ( offset ) {
        this.offset = offset;

        for ( let i = this.npcs.length; i--; ) {
            this.npcs[ i ].update();
        }

        for ( let i = this.doors.length; i--; ) {
            this.doors[ i ].update();
        }

        for ( let i = this.fx.length; i--; ) {
            this.fx[ i ].update();
        }

        for ( let i = this.sprites.length; i--; ) {
            this.sprites[ i ].update();
        }

        for ( let i = this.items.length; i--; ) {
            this.items[ i ].update();
        }
    }


    render ( hero, companion ) {
        this.clear();

        this.renderBox = this.getRenderbox();

        // Draw background textures
        this.gamebox.renderQueue.add({
            render: this.renderTextures.bind( this, "background" ),
            layer: "background",
        });

        // Merge all sprites into a single array and sort by (y position + height) ascending
        this.renderSprites( hero, companion );

        // Draw foreground textures
        this.gamebox.renderQueue.add({
            render: this.renderTextures.bind( this, "foreground" ),
            layer: "foreground",
        });
    }


    // TODO: This could be better optimized...
    renderSprites ( hero, companion ) {
        const sprites = [
            hero,
            ...this.fx,
            ...this.npcs,
            ...this.doors,
            ...this.items,
            ...this.sprites,
        ];

        if ( companion ) {
            sprites.push( companion );
        }

        sprites.sort( ( a, b ) => {
            return ( a.position.y + a.height ) - ( b.position.y + b.height );
        });

        for ( let i = 0; i < sprites.length; i++ ) {
            this.gamebox.renderQueue.add( sprites[ i ] );
        }
    }


    renderDebug () {
        const visibleColliders = this.gamebox.getVisibleColliders();

        this.gamebox.mapLayer.context.save();
        this.gamebox.mapLayer.context.globalAlpha = 0.5;

        for ( let i = visibleColliders.length; i--; ) {
            this.gamebox.mapLayer.context.fillStyle = Config.colors.red;
            this.gamebox.mapLayer.context.fillRect(
                this.offset.x + ( visibleColliders[ i ][ 0 ] * this.data.collider ),
                this.offset.y + ( visibleColliders[ i ][ 1 ] * this.data.collider ),
                this.data.collider,
                this.data.collider
            );
        }

        this.gamebox.mapLayer.context.restore();
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
        this.gamebox.draw(
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
        for ( const id in this.layers ) {
            this.layers[ id ].offCanvas.clear();
        }
    }


    getRenderbox () {
        const renderBox = {
            x: Math.floor( this.camera.x / this.data.tilesize ) - 1,
            y: Math.floor( this.camera.y / this.data.tilesize ) - 1,
            width: this.camera.width + ( this.data.tilesize * 2 ),
            height: this.camera.height + ( this.data.tilesize * 2 ),
            bleed: {},
            textures: {},
        };

        renderBox.bleed = this.getBleed( renderBox );
        renderBox.textures = this.getTextures( renderBox );

        return renderBox;
    }


    getBleed ( renderBox ) {
        return {
            x: -( this.camera.x - ( renderBox.x * this.data.tilesize ) ),
            y: -( this.camera.y - ( renderBox.y * this.data.tilesize ) ),
        };
    }


    getTextures ( renderBox ) {
        const height = ( renderBox.height / this.data.tilesize );
        const width = ( renderBox.width / this.data.tilesize );
        const ret = {};

        for ( const id in this.data.textures ) {
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
                            const isShiftableForeground = id === "foreground" && this.checkShiftableForeground( id, lookupY, lookupX, celsCopy );
                            
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
        }

        return ret;
    }


    checkShiftableForeground ( layer, lookupY, lookupX, fgCel ) {
        // Fail safe but this is already gated
        if ( layer !== "foreground" ) {
            return false;
        }

        // Check if the foreground tile collides with the hero or companion before we even consider shifting
        const tile = {
            x: lookupX * this.data.tilesize,
            y: lookupY * this.data.tilesize,
            width: this.data.tilesize,
            height: this.data.tilesize,
        };

        const collides = {
            hero: Utils.collide( tile, this.gamebox.hero.getFullbox() ),
            companion: this.gamebox.companion ? Utils.collide( tile, this.gamebox.companion.getFullbox() ) : false,
        };

        if ( !collides.hero && !collides.companion ) {
            return false;
        }

        // Compare the current foreground and background cels and if they don't match we can't shift
        let bgCel = structuredClone( this.data.textures.background[ lookupY ][ lookupX ] );

        if ( fgCel === 0 || bgCel === 0 ) {
            return false;
        }

        fgCel = fgCel[ fgCel.length - 1 ];
        bgCel = bgCel[ bgCel.length - 1 ];

        if ( fgCel[ 0 ] !== bgCel[ 0 ] && fgCel[ 1 ] !== bgCel[ 1 ] ) {
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

        const heroPosition = this.gamebox.hero.position.y + this.gamebox.hero.height;
        const isShiftable = tile.y + tile.height < heroPosition;

        if ( isShiftable ) {
            const nextLookupY = lookupY + 1;

            if ( this.data.textures[ layer ][ nextLookupY ][ lookupX ] ) {
                const isNextShiftable = ( nextLookupY * this.data.tilesize ) + this.data.tilesize < heroPosition;

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


    getEvent ( coords ) {
        return this.data.events.find( ( event ) => {
            return event.coords[ 0 ] === coords[ 0 ] && event.coords[ 1 ] === coords[ 1 ];
        });
    }


    addObject ( type, obj ) {
        this[ type ].push( obj );
    }


    killObject ( type, obj ) {
        this[ type ].splice( this[ type ].indexOf( obj ), 1 );
        obj.destroy();
        obj = null;
    }
}



export default Map;
