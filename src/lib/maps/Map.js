import Utils from "../Utils";
import Loader from "../Loader";
import Config from "../Config";
import NPC from "../sprites/NPC";
import Door from "../sprites/Door";
import Enemy from "../sprites/Enemy";
import EnemyAggro from "../sprites/EnemyAggro";
import FX from "../sprites/FX";
import ActiveTiles from "./ActiveTiles";
import MapEvent from "./MapEvent";
import MapFX from "./MapFX";
import KeyItem from "../sprites/KeyItem";



/*******************************************************************************
* Map
* The logic map.
* Everything is rendered via the Map as the Map is our game world.
* My preference is to keep this sort of logic out of the GameBox, which
* manages Map offset and Camera position.
*******************************************************************************/
export default class Map {
    constructor ( data, gamebox ) {
        this.gamebox = gamebox;
        this.gamequest = this.gamebox.gamequest;
        this.player = this.gamebox.player;
        this.camera = this.gamebox.camera;
        this.initMap( data );
    }


    destroy () {
        for ( let i = this.activeTiles.length; i--; ) {
            this.activeTiles[ i ].destroy();
            this.activeTiles[ i ] = null;
        }
        this.activeTiles = null;
        this.animatedTiles = null;

        for ( let i = this.npcs.length; i--; ) {
            this.npcs[ i ].destroy();
            this.npcs[ i ] = null;
        }
        this.npcs = null;

        for ( let i = this.doors.length; i--; ) {
            this.doors[ i ].destroy();
            this.doors[ i ] = null;
        }
        this.doors = null;

        for ( let i = this.enemies.length; i--; ) {
            this.enemies[ i ].destroy();
            this.enemies[ i ] = null;
        }
        this.enemies = null;

        for ( let i = this.fx.length; i--; ) {
            this.fx[ i ].destroy();
            this.fx[ i ] = null;
        }
        this.fx = null;

        for ( let i = this.items.length; i--; ) {
            this.items[ i ].destroy();
            this.items[ i ] = null;
        }
        this.items = null;

        for ( let i = this.sprites.length; i--; ) {
            this.sprites[ i ].destroy();
            this.sprites[ i ] = null;
        }
        this.sprites = null;

        this.image = null;
        this.events = null;
        this.colliders = null;
        this.allSprites = null;
        this.spawnpool = null;
    }


    initMap ( data ) {
        this.data = structuredClone( data );
        this.width = this.data.width;
        this.height = this.data.height;
        this.image = Loader.cash( this.data.image );

        // FX utils
        this.mapFX = new MapFX( this );

        // From map data
        this.activeTiles = [];
        this.animatedTiles = []; // Just references to ActiveTiles instances that are animated...
        this.fx = [];
        this.npcs = [];
        this.doors = [];
        this.enemies = [];
        this.events = [];
        this.colliders = [];

        // From live game state
        this.items = [];
        this.sprites = [];
        this.spawnpool = [];

        // For sprite render priority
        this.allSprites = [];
    }


    initSprites () {
        // FX
        for ( let i = this.data.fx.length; i--; ) {
            this.fx.push(
                new FX(
                    this.player.getMergedData( this.data.fx[ i ], "fx", true ),
                    this
                )
            );
            this.addAllSprite( this.fx[ i ] );
        }

        // NPCs, Doors, Enemies...
        for ( let i = this.data.npcs.length; i--; ) {
            const data = this.player.getMergedData( this.data.npcs[ i ], "npcs", true );
            const type = this.data.npcs[ i ].type || "npc";
            const mapId = this.getMapId( type, i );
            const quest = data.spawn.quest;

            // This is a "de-spawn" flag check for when we want to remove an NPC from the map after a quest is completed
            if ( quest?.checkSpawn && this.gamequest.getCompleted( quest.checkSpawn.key ) ) {
                continue;
            }

            // This is a "spawn" flag check for when we want to add an NPC to the map after a quest is completed (e.g. handleQuestFlagCheck())
            if ( quest?.checkFlag && !this.gamequest.getCompleted( quest.checkFlag.key ) ) {
                this.spawnpool.push({ data, type, mapId });

            } else if ( type === Config.npc.types.ENEMY ) {
                const enemy = data.aggro 
                    ? new EnemyAggro( data, this, mapId )
                    : new Enemy( data, this, mapId );
                this.enemies.push( enemy );
                this.addAllSprite( enemy );

            } else if ( type === Config.npc.types.DOOR ) {
                const door = new Door( data, this, mapId );
                this.doors.push( door );
                this.addAllSprite( door );
    
            } else {
                const npc = new NPC( data, this, mapId );
                this.npcs.push( npc );
                this.addAllSprite( npc );
            }
        }

        // Items
        for ( let i = this.data.items.length; i--; ) {
            const mapId = this.getMapId( "item", i );

            // Skip if the item has already been collected
            if ( this.gamequest.getCompleted( mapId ) ) {
                continue;
            }

            this.items.push( new KeyItem(
                this.player.getMergedData( this.data.items[ i ], "items", true ),
                this,
                mapId
            ) );
            this.addAllSprite( this.items[ i ] );
        }
    }


    initTiles () {
        // Tiles
        for ( let i = this.data.tiles.length; i--; ) {
            const activeTiles = new ActiveTiles( this.data.tiles[ i ], this );

            this.activeTiles.push( activeTiles );

            // Track animated tiles for rendering the correct frame...
            if ( activeTiles.isAnimated ) {
                this.animatedTiles.push( activeTiles );
            }
        }

        // Events
        for ( let i = this.data.events.length; i--; ) {
            this.events.push( new MapEvent( this.data.events[ i ], this ) );
        }

        // Colliders
        for ( let i = this.data.collision.length; i--; ) {
            this.colliders.push({
                x: this.data.collision[ i ][ 0 ] * this.data.collider,
                y: this.data.collision[ i ][ 1 ] * this.data.collider,
                width: this.data.collider,
                height: this.data.collider,
            });
        }
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

        for ( let i = this.enemies.length; i--; ) {
            this.enemies[ i ].blit( elapsed );
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


    update () {
        for ( let i = this.npcs.length; i--; ) {
            this.npcs[ i ].update();
        }

        for ( let i = this.enemies.length; i--; ) {
            this.enemies[ i ].update();
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

        this.sortAllSprites();
    }


    render () {
        this.renderBox = this.getRenderbox();

        // Draw background textures
        this.gamebox.renderQueue.add({
            render: this.renderTextures.bind( this, "background" ),
            layer: "background",
        });

        // Merge all sprites into a single array and sort by (y position + height) ascending
        this.renderAllSprites();

        // Draw foreground textures
        this.gamebox.renderQueue.add({
            render: this.renderTextures.bind( this, "foreground" ),
            layer: "foreground",
        });
    }


    renderTextures ( id ) {
        // Draw textures to background / foreground
        Utils.drawMapTiles(
            this.player.renderLayer.context,
            this.image,
            this.renderBox.textures[ id ],
            this.data.tilesize,
            this.data.tilesize,
            this.renderBox.bleed
        );
    }


    // TODO: This could be better optimized
    // (Sprite class is using onscreen to add/remove from allSprites array)
    sortAllSprites () {
        this.allSprites.sort( ( a, b ) => {
            return a.prio - b.prio;
        });
    }


    renderAllSprites () {
        for ( let i = 0; i < this.allSprites.length; i++ ) {
            this.gamebox.renderQueue.add( this.allSprites[ i ] );
        }
    }


    renderDebug () {
        const visibleColliders = this.gamebox.getVisibleColliders();
        const visibleEvents = this.gamebox.getVisibleEvents();

        this.player.renderLayer.context.save();
        this.player.renderLayer.context.globalAlpha = 0.5;

        for ( let i = visibleColliders.length; i--; ) {
            this.player.renderLayer.context.fillStyle = Config.colors.red;
            this.player.renderLayer.context.fillRect(
                visibleColliders[ i ].x - this.gamebox.camera.x,
                visibleColliders[ i ].y - this.gamebox.camera.y,
                visibleColliders[ i ].width,
                visibleColliders[ i ].height
            );
        }

        for ( let i = visibleEvents.length; i--; ) {
            this.player.renderLayer.context.fillStyle = Config.colors.blue;
            this.player.renderLayer.context.fillRect(
                visibleEvents[ i ].eventbox.x - this.gamebox.camera.x,
                visibleEvents[ i ].eventbox.y - this.gamebox.camera.y,
                visibleEvents[ i ].eventbox.width,
                visibleEvents[ i ].eventbox.height
            );
        }

        this.player.renderLayer.context.restore();
    }


    getMapId ( type, index ) {
        return `${type}-${this.data.id}-${index}`;
    }


    getRenderbox () {
        const renderBox = {
            // Floor the camera position to snap to the tile grid (top-left corner)
            x: Math.floor( this.camera.x / this.data.tilesize ),
            y: Math.floor( this.camera.y / this.data.tilesize ),
            // Add one tile size to the width and height to ensure we capture all tiles
            // in the camera view (including the top-left corner)
            width: this.camera.width + this.data.tilesize,
            height: this.camera.height + this.data.tilesize,
            bleed: {},
            textures: {},
        };

        renderBox.bleed = this.getBleed( renderBox );
        renderBox.textures = this.getTextures( renderBox );

        return renderBox;
    }


    getBleed ( renderBox ) {
        return {
            x: -Math.floor( this.camera.x - ( renderBox.x * this.data.tilesize ) ),
            y: -Math.floor( this.camera.y - ( renderBox.y * this.data.tilesize ) ),
        };
    }


    getTextures ( renderBox ) {
        const height = ( renderBox.height / this.data.tilesize );
        const width = ( renderBox.width / this.data.tilesize );
        const ret = {};

        for ( const id in this.data.textures ) {
            ret[ id ] = [];

            for ( let y = 0; y < height; y++ ) {
                ret[ id ][ y ] = [];

                const lookupY = renderBox.y + y;

                if ( this.data.textures[ id ][ lookupY ] ) {
                    for ( let x = 0; x < width; x++ ) {
                        const lookupX = renderBox.x + x;

                        if ( this.data.textures[ id ][ lookupY ][ lookupX ] ) {
                            const celsCopy = [ ...this.data.textures[ id ][ lookupY ][ lookupX ] ];

                            if ( id === "background" ) {
                                ret[ id ][ y ][ x ] = this.getActiveTile( [ lookupX, lookupY ], celsCopy );

                            // Foreground...
                            } else {
                                const isShiftableForeground = this.checkShiftableForeground( lookupY, lookupX, celsCopy );

                                // Shift foreground behind hero render if textures and hero position determine so
                                // This is only supported if the background texture matches the foreground texture
                                // so we can just set the foreground tile to 0 and let the background tile render instead
                                ret[ id ][ y ][ x ] = isShiftableForeground ? 0 : celsCopy;
                            }
                            
                        // Empty textures are represented as 0 in the texture matrix (data)
                        } else {
                            ret[ id ][ y ][ x ] = 0;
                        }
                    }
                }
            }
        }

        return ret;
    }


    checkShiftableForeground ( lookupY, lookupX, fgCel ) {
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
        let bgCel = this.data.textures.background[ lookupY ][ lookupX ];

        if ( fgCel === 0 || bgCel === 0 ) {
            return false;
        }

        fgCel = fgCel[ fgCel.length - 1 ];
        bgCel = bgCel[ bgCel.length - 1 ];

        if ( fgCel[ 0 ] !== bgCel[ 0 ] && fgCel[ 1 ] !== bgCel[ 1 ] ) {
            return false;
        }

        const heroPosition = this.gamebox.hero.position.y + this.gamebox.hero.height;
        const isShiftable = tile.y + tile.height < heroPosition;

        return isShiftable;

        // TODO: I think this logic is a non-issue now but keeping an eye on it for a bit...
        // Foreground is unique in that it can be shifted behind the hero.
        // However, it's not good enough to just check the current foreground tile.
        // If the next tile down also contains foreground texture data we need to check
        // whether it can also be shifted. If not we can assume that the foreground tiles are
        // "connected" and we should not shift them behind the hero otherwise we'd produce
        // a rendering glitch.
        // E.g. hero renders behind one foreground tile and in front of the tile below it
        // even though visually the hero should be behind both tiles.

        // if ( isShiftable ) {
        //     const nextLookupY = lookupY + 1;

        //     if ( this.data.textures.foreground[ nextLookupY ][ lookupX ] ) {
        //         const isNextShiftable = ( nextLookupY * this.data.tilesize ) + this.data.tilesize < heroPosition;

        //         return isNextShiftable;

        //     } else {
        //         return true;
        //     }
        // }
        
        // return false;
    }


    spliceActiveTile ( group, coords ) {
        this.getActiveTiles( group ).splice( coords );
    }


    getActiveTiles ( group ) {
        for ( let i = this.activeTiles.length; i--; ) {
            if ( this.activeTiles[ i ].data.group === group ) {
                return this.activeTiles[ i ];
            }
        }

        return null;
    }


    getActiveTileOnCoords ( coords ) {
        for ( let i = this.activeTiles.length; i--; ) {
            if ( this.activeTiles[ i ].isPushed( coords ) ) {
                return this.activeTiles[ i ];
            }
        }

        return null;
    }


    getActiveTile ( celsCoords, celsCopy ) {
        for ( let i = this.animatedTiles.length; i--; ) {
            if ( this.animatedTiles[ i ].isPushed( celsCoords ) ) {
                // The first frame of the animated tile will always at the end of the celsCopy array
                // Here we push the current frame of the animated tile to the end of the celsCopy array
                return [ ...celsCopy, this.animatedTiles[ i ].getTile() ];
            }
        }

        // No animated tile found, return the original celsCopy
        return celsCopy;
    }


    getEvent ( coords ) {
        for ( let i = this.events.length; i--; ) {
            if ( this.events[ i ].data.coords[ 0 ] === coords[ 0 ] && this.events[ i ].data.coords[ 1 ] === coords[ 1 ] ) {
                return this.events[ i ];
            }
        }

        return null;
    }


    getEmptyTile ( coords, layer = "background" ) {
        return this.data.textures[ layer ][ coords[ 1 ] ][ coords[ 0 ] ];
    }


    addAllSprite ( sprite ) {
        if ( sprite && this.allSprites.indexOf( sprite ) === -1 ) {
            this.allSprites.push( sprite );
        }
    }


    removeAllSprite ( sprite ) {
        if ( sprite && this.allSprites.indexOf( sprite ) !== -1 ) {
            this.allSprites.splice( this.allSprites.indexOf( sprite ), 1 );
        }
    }


    addObject ( type, obj ) {
        this[ type ].push( obj );
        this.addAllSprite( obj );
    }


    killObject ( type, obj ) {
        if ( this[ type ].indexOf( obj ) !== -1 ) {
            this[ type ].splice( this[ type ].indexOf( obj ), 1 );
            this.removeAllSprite( obj );
            this.gamebox.removeCollision( type, obj );
            obj.destroy();
            obj = null;
        }
    }


    spawnObject ( obj, mapId, { fx = true, ...props } = {} ) {
        this.spawnpool.splice( this.spawnpool.indexOf( obj ), 1 );

        if ( props ) {
            for ( const key in props ) {
                obj.data[ key ] = props[ key ];
            }
        }

        // For now just assume base NPC type...
        const npc = new NPC( obj.data, this, mapId );

        this.npcs.push( npc );
        this.addAllSprite( npc );

        if ( fx ) {
            this.mapFX.smokeObject( npc );
            this.player.gameaudio.hitSound( "smash" );
        }
    }


    getSpawnpoolObject ( checkFlag ) {
        for ( let i = this.spawnpool.length; i--; ) {
            if ( this.spawnpool[ i ].data.spawn.quest.checkFlag.key === checkFlag ) {
                return this.spawnpool[ i ];
            }
        }

        return null;
    }


    handleQuestFlagCheck ( checkFlag, options = undefined ) {
        for ( let i = this.spawnpool.length; i--; ) {
            const { data, mapId } = this.spawnpool[ i ];
            const { key, value } = data.spawn.quest.checkFlag;

            if ( key === checkFlag && this.gamequest.checkQuest( key, value ) ) {
                this.gamequest.completeQuest( key );
                this.spawnObject( this.spawnpool[ i ], mapId, options );
                break;
            }
        }
    }
}
