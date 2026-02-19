import Utils from "./Utils";
import Config from "./Config";
import Loader from "./Loader";
import Dialogue from "./Dialogue";
import Map from "./maps/Map";
import Hero from "./sprites/Hero";
import Companion from "./sprites/Companion";
import GameQuest from "./GameQuest";
import GameStorage from "./GameStorage";
import ItemDrop from "./sprites/ItemDrop";
import { KeyItemDrop } from "./sprites/KeyItem";
import HUD from "./HUD";



export default class GameBox {
    constructor ( player ) {
        this.player = player;
        this.dropin = false;
        this.panning = false;
        this.mapChangeEvent = null;

        // Quest, render queue
        const quests = this.player.query.nostorage ?
            undefined :
            this.player.gamestorage.get( "quests" );
        this.gamequest = new GameQuest( this, quests );
        this.renderQueue = new RenderQueue( this );

        // Dialogues
        this.dialogue = new Dialogue( this );

        // Sounds
        this.currentMusic = null;
        
        // GameStorage map needs to be handled up front to load the correct data
        const mapId = this.player.query.nostorage ?
            this.player.heroData.map :
            this.player.gamestorage.get( "map" ) || this.player.heroData.map;
        const initMapData = Loader.cash( mapId );
        const initHeroData = structuredClone( this.player.heroData );

        // Camera
        this.camera = new Camera( this );

        // Map
        this.map = new Map( initMapData, this );

        // Hero
        initHeroData.spawn = initMapData.spawn[ initHeroData.spawn ];
        this.dropin = initHeroData.spawn?.dropin ?? false;
        this.hero = new Hero( initHeroData, this.map );
        this.map.addAllSprite( this.hero );
        this.seedStorage();
        this.seedQuery();

        // HUD
        this.hud = new HUD( this );

        // Collision groups
        this.collision = {};
        this.renderBox = this.getRenderBox();

        // Sounds
        for ( const id in this.player.data.sounds ) {
            this.player.gameaudio.addSound({
                id,
                src: this.player.data.sounds[ id ],
                channel: "sfx",
            });
        }

        // Companion?
        const companionData = this.player.query.nostorage ?
            undefined :
            this.player.gamestorage.get( "companion" );
        if ( companionData ) {
            this.spawnCompanion( companionData, {
                x: this.hero.position.x,
                y: this.hero.position.y,
            } );
        }

        this.initMap();
    }


    destroy () {
        this.clear();
        this.hud.reset();
        this.hero.destroy();
        this.companion?.destroy();
        this.map.destroy();
        this.dialogue.destroy();
    }


    clear () {
        this.renderQueue.clear();
        this.player.clear();
    }


    draw ( ...args ) {
        this.player.renderLayer.context.drawImage( ...args );
    }


    pause ( paused ) {
        if ( paused ) {
            this.player.gameaudio.stopSound( this.currentMusic );

        } else {
            this.player.gameaudio.playSound( this.currentMusic );
        }
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blit ( elapsed ) {
        // blit hero
        this.hero.blit( elapsed );

        // blit companion
        if ( this.companion ) {
            this.companion.blit( elapsed );
        }

        // blit map
        this.map.blit( elapsed );
    }


    update () {
        // Reset dropin flag if the hero is on the ground
        if ( this.dropin && this.hero.isOnGround() ) {
            this.dropin = false;
        }

        // update gamebox (camera)
        this.camera.update();

        // update collision groups
        this.scan();

        // update hero
        this.hero.update();

        // update companion
        if ( this.companion ) {
            this.companion.update();
        }

        // update map
        this.map.update();
    }


    render () {
        // Clear canvas and render queue
        this.clear();

        // render map
        this.map.render();

        // render render queue
        this.renderQueue.render();

        // Visual event debugging....
        if ( this.player.query.debug ) {
            this.map.renderDebug();
        }

        // render HUD
        this.hud.render();
    }


    // Pre-determine collision groups once per frame
    scan () {
        // Pre-calculate the render box for collision checks
        this.renderBox = this.getRenderBox();

        // Update collision groups for use in collision checks
        this.collision.colliders = this.getVisibleColliders();
        this.collision.events = this.getVisibleEvents();
        this.collision.activeTiles = this.getVisibleActiveTiles();
        this.collision.items = this.getVisibleItems();
        this.collision.npcs = this.getVisibleNPCs();
        this.collision.doors = this.getVisibleNPCs( "doors" );
        this.collision.enemies = this.getVisibleNPCs( "enemies" );
    }


    // Remove if the object is not in the map -- e.g. "stale object reference bug"
    // This is possible because the gamebox calls scan() from update() to pre-determine collision groups
    // Example: An item drop can "kill itself" if it times out but the hero can collide with the stale reference (TopView.handleHeroItem())
    // This was resulting in a second call to Map.killObject() in which we'd call splice(-1, 1) because it was already removed from the array
    // So we also added a safeguard in the Map.killObject() method so we don't try to remove it again if it's already been removed
    // And Map.killObject() also removes the object from the collision array so we don't need to do that here (e.g. calls THIS method)
    removeCollision ( type, obj ) {
        if ( this.collision[ type ] && this.collision[ type ].indexOf( obj ) !== -1 ) {
            this.collision[ type ].splice( this.collision[ type ].indexOf( obj ), 1 );
        }
    }


/*******************************************************************************
* GamePad Inputs
* Should all be handled in plugin GameBox
*******************************************************************************/
    pressD () {}
    releaseD () {}
    pressA () {}
    holdA () {}
    releaseA () {}
    releaseHoldA () {}
    pressB () {}
    holdB () {}
    releaseB () {}
    releaseHoldB () {}


/*******************************************************************************
* Hero logic
* This is the main entry point for hero logic
* Should be handled in plugin GameBox
* Needs to apply the rest of the sprite stack after hero.update()
* See applyHero() below to see what that does
*******************************************************************************/
    handleHero ( poi, dir ) {}


    applyHero ( poi, dir ) {
        // Apply position
        this.hero.applyPosition( poi, dir );
        this.hero.applyPriority();

        // Applly offset
        this.hero.applyOffset();

        // Apply the sprite animation cycle
        this.hero.applyCycle();
    }


/*******************************************************************************
* Sprite utilities
*******************************************************************************/
    spawnCompanion ( data, spawn ) {
        const companionData = this.player.getMergedData({
            ...data,
            spawn,
        }, "npcs" );

        this.companion = new Companion( companionData, this.hero );
        this.map.addAllSprite( this.companion );
    }


    despawnCompanion () {
        this.companion.destroy();
        this.map.removeAllSprite( this.companion );
        this.companion = null;
    }


    checkCompanion ( id ) {
        return this.companion && this.companion.data.id === id;
    }


    itemDrop ( id, position ) {
        let drops = structuredClone( this.player.data.drops[ id ] );

        // Only drop magic if the hero has the magic powder
        if ( !this.hero.hasMagic() ) {
            drops = drops.filter( ( drop ) => {
                const item = this.player.data.items.find( ( item ) => item.id === drop.id );
                return item.stat ? item.stat.key !== "magic" : true;
            });
        }

        const drop = drops[ Utils.random( 0, drops.length - 1 ) ];
        const chance = Utils.random( 0, 100 );

        if ( !Utils.def( drop.chance ) || chance <= drop.chance ) {
            const data = this.player.getMergedData({
                id: drop.id,
            }, "items" );
            const spawn = {
                x: position.x + ( this.map.data.tilesize / 2 ) - ( data.width / 2 ),
                y: position.y + ( this.map.data.tilesize / 2 ) - ( data.height / 2 ),
            };
    
            this.map.addObject( "items", new ItemDrop( spawn, data, this.map ) );
        }
    }


    keyItemDrop ( dropItem, position, checkFlag ) {
        const data = this.player.getMergedData({
            id: dropItem.id,
            dialogue: dropItem.dialogue,
        }, "items" );
        const spawn = {
            x: position.x + ( this.map.data.tilesize / 2 ) - ( data.width / 2 ),
            y: position.y + ( this.map.data.tilesize / 2 ) - ( data.height / 2 ),
        };
        this.map.addObject( "items", new KeyItemDrop( spawn, data, this.map, checkFlag ) );
    }


    seedQuery () {
        if ( this.player.query.status ) {
            this.hero.applyStatus( this.player.query.status );
        }

        if ( this.player.query.items ) {
            const items = this.player.query.items.split( "," );
            
            for ( let i = items.length; i--; ) {
                const item = items[ i ];
                
                // We seed storage before we seed the query so make sure we don't duplicate items...
                if ( !this.hero.getItem( item ) ) {
                    const data = this.player.getMergedData({
                        id: item,
                    // Doesn't support mapId which is defined by NPCs so this is PURELY for debugging / testing
                    }, "items" );
                    this.hero.items.push( data );
        
                    if ( data.equip ) {
                        this.hero.equip( data.equip );
                    }
                }
            }
        }
    }


    seedItem ( id ) {
        this.hero.giveItem( id );
        this.hero.stillTimer = 0;
        this.hero.itemGet = null;
        this.hero.face( this.hero.dir );
    }


    seedStorage () {
        if ( this.player.query.nostorage ) {
            return;
        }

        for ( const prop of GameStorage.heroProps ) {
            this.hero[ prop ] = this.player.gamestorage.get( prop ) || this.hero[ prop ];

            // Apply status present so it will apply the status effects correctly
            if ( prop === "status" && this.hero.status ) {
                this.hero.applyStatus( this.hero.status );
            }
        }
    }


/*******************************************************************************
* Collision checks
* Can all be handled in plugin GameBox
*******************************************************************************/
    getRenderBox () {
        // Expand the camera scope for collision checks so that NPCs don't get collision
        // locked when they are partially off-screen (2 tiles on each side)
        //  +-----------------------------+
        //  |    [ ][ ][ ][ ][ ][ ][ ]    |
        //  |    [ ][ ][ ][ ][ ][ ][ ]    |
        //  |    [ ][ ][■■■■■■■][ ][ ]    |
        //  |    [ ][ ][■■■■■■■][ ][ ]    |
        //  |    [ ][ ][■■■■■■■][ ][ ]    |
        //  |    [ ][ ][ ][ ][ ][ ][ ]    |
        //  |    [ ][ ][ ][ ][ ][ ][ ]    |
        //  +-----------------------------+
        return {
            x: this.camera.x - this.map.data.tilesize * 2,
            y: this.camera.y - this.map.data.tilesize * 2,
            width: this.camera.width + ( this.map.data.tilesize * 4 ),
            height: this.camera.height + ( this.map.data.tilesize * 4 ),
        };
    }


    getVisibleColliders () {
        const colliders = [];

        for ( let i = this.map.colliders.length; i--; ) {
            const collides = Utils.collide( this.renderBox, this.map.colliders[ i ] );

            if ( collides ) {
                colliders.push( this.map.colliders[ i ] );
            }
        }

        return colliders;
    }


    getVisibleEvents () {
        const events = [];

        for ( let i = this.map.events.length; i--; ) {
            const collides = Utils.collide( this.renderBox, this.map.events[ i ].eventbox );

            if ( collides ) {
                events.push( this.map.events[ i ] );
            }
        }

        return events;
    }


    getVisibleNPCs ( type = "npcs" ) {
        const npcs = [];

        for ( let i = this.map[ type ].length; i--; ) {
            const collides = Utils.collide( this.renderBox, this.map[ type ][ i ].getFullbox() );

            if ( collides ) {
                npcs.push( this.map[ type ][ i ] );
            }
        }

        return npcs;
    }


    getVisibleItems () {
        const items = [];

        for ( let i = this.map.items.length; i--; ) {
            const collides = Utils.collide( this.renderBox, this.map.items[ i ].getFullbox() );

            if ( collides ) {
                items.push( this.map.items[ i ] );
            }
        }

        return items;
    }


    getVisibleActiveTiles () {
        const activeTiles = [];

        for ( let i = this.map.activeTiles.length; i--; ) {
            for ( let j = this.map.activeTiles[ i ].pushed.length; j--; ) {
                const collides = Utils.collide( this.renderBox, this.map.activeTiles[ i ].pushed[ j ] );

                if ( collides ) {
                    activeTiles.push( this.map.activeTiles[ i ] );
                    break;
                }
            }
        }

        return activeTiles;
    }


    // In certain maps there can be many empty tiles that are not accessible
    // To avoid checking every single tile in the render box, we only check the tiles within the sprite's perception box
    getNearestEmptyTiles ( sprite ) {
        const tiles = [];

        if ( !this.map.renderBox ) {
            return tiles;
        }

        const { tileBox } = sprite.perceptionBox;

        for ( let y = tileBox.y; y < tileBox.y + tileBox.height; y++ ) {
            for ( let x = tileBox.x; x < tileBox.x + tileBox.width; x++ ) {
                // Using optional chaining to check if the tile exists so we don't have to handle "in map bounds" type logic
                const isEmpty = this.map.data.textures.background[ y ]?.[ x ] === 0;

                if ( isEmpty ) {
                    tiles.push({
                        x: x * this.map.data.tilesize,
                        y: y * this.map.data.tilesize,
                        width: this.map.data.tilesize,
                        height: this.map.data.tilesize,
                    });
                }
            }
        }

        return tiles;
    }


    checkHero ( poi, sprite ) {
        if ( sprite.layer && sprite.layer !== this.hero.layer ) {
            return false;
        }

        // Ad-hoc "sprite" object with { x, y, width, height }
        // See NPC.handleAttract() for an example where we pass the perceptionBox.tileBox directly...
        const lookbox = Utils.func( sprite.getHitbox ) ? sprite.getHitbox( poi ) : sprite;
        return Utils.collide( lookbox, this.hero.hitbox );
    }


    checkCamera ( poi, sprite ) {
        let ret = false;

        if ( poi.x <= this.camera.x ) {
            ret = "left";
        }

        if ( poi.x >= ( this.camera.x + this.camera.width - sprite.width ) ) {
            ret = "right";
        }

        if ( poi.y <= this.camera.y ) {
            ret = "up";
        }

        if ( poi.y >= ( this.camera.y + this.camera.height - sprite.height ) ) {
            ret = "down";
        }

        return ret;
    }


    checkMap ( poi, sprite ) {
        const hitbox = sprite.getHitbox( poi );

        for ( let i = this.collision.colliders.length; i--; ) {
            if ( Utils.collide( hitbox, this.collision.colliders[ i ] ) ) {
                return this.collision.colliders[ i ];
            }
        }

        return false;
    }


    checkEvents ( poi, sprite, { dirCheck = true } = {} ) {
        for ( let i = this.collision.events.length; i--; ) {
            // An event without a "dir" can be triggered from any direction
            const dir = this.collision.events[ i ].data.dir;
            const isDir = dir && dirCheck ? ( sprite.dir === dir ) : true;

            if ( !isDir ) {
                continue;
            }

            const collides = this.collision.events[ i ].checkCollision( poi, sprite, !!dir );

            if ( collides ) {
                if ( this.collision.events[ i ].isBlockedByTile() ) {
                    return false;
                }
                return this.collision.events[ i ];
            }
        }

        return false;
    }


    // NPCs just need to avoid event boxes entirely...
    checkEventsNPC ( poi, sprite ) {
        for ( let i = this.collision.events.length; i--; ) {
            const collides = Utils.collide( sprite.getHitbox( poi ), this.collision.events[ i ].eventbox );

            if ( collides ) {
                if ( this.collision.events[ i ].isBlockedByTile() ) {
                    return false;
                }
                return this.collision.events[ i ];
            }
        }

        return false;
    }


    checkNPC ( poi, sprite, type = "npcs" ) {
        const npcs = this.collision[ type ]
        
        // Ad-hoc "sprite" object with { x, y, width, height }
        // See Hero.handleAttackFrame() for an example where we pass the weaponBox directly...
        const lookbox = Utils.func( sprite.getHitbox ) ? sprite.getHitbox( poi ) : sprite;

        for ( let i = npcs.length; i--; ) {
            // Non-enemy floating NPCs don't collide with the hero
            // Skip if thrown object, self, layers don't match or door is open
            if (
                ( npcs[ i ].data.ai === Config.npc.ai.FLOAT && type !== "enemies" ) ||
                npcs[ i ].hero ||
                npcs[ i ] === sprite ||
                npcs[ i ].layer !== sprite.layer ||
                ( type === "doors" && npcs[ i ].open )
            ) {
                continue;
            }
            
            if (  Utils.collide( lookbox, npcs[ i ].hitbox ) ) {
                return npcs[ i ];
            }
        }

        return false;
    }


    checkDoor ( poi, sprite ) {
        return this.checkNPC( poi, sprite, "doors" );
    }


    checkEnemy ( poi, sprite ) {
        return this.checkNPC( poi, sprite, "enemies" );
    }


    checkItems ( poi, sprite ) {
        // Ad-hoc "sprite" object with { x, y, width, height }
        // See Hero.handleAttackFrame() for an example where we pass the weaponBox directly...
        const lookbox = Utils.func( sprite.getHitbox ) ? sprite.getHitbox( poi ) : sprite;

        for ( let i = this.collision.items.length; i--; ) {
            if ( Utils.collide( lookbox, this.collision.items[ i ].hitbox ) ) {
                return this.collision.items[ i ];
            }
        }

        return false;
    }


    checkEmpty ( poi, sprite ) {
        const emptyTiles = this.getNearestEmptyTiles( sprite );
        const touchedTiles = [];

        for ( let i = emptyTiles.length; i--; ) {
            const collides = Utils.collide( sprite.getHitbox( poi ), emptyTiles[ i ] );

            if ( collides ) {
                touchedTiles.push({
                    ...emptyTiles[ i ],
                    amount: Utils.getCollisionAmount( collides, sprite.hitbox ),
                });
            }
        }

        return touchedTiles.length ? touchedTiles : false;
    }


    checkTiles ( poi, sprite ) {
        const tiles = {
            action: [],
            attack: [],
            passive: [],
        };
        const isInstance = sprite.gamebox === this;
        const footbox = isInstance ? sprite.getFootbox( poi ) : sprite;
        const hitbox = isInstance ? sprite.getHitbox( poi ) : sprite;
        
        let ret = false;

        for ( let i = this.collision.activeTiles.length; i--; ) {
            const instance = this.collision.activeTiles[ i ];
            // Ad-hoc "sprite" object with { x, y, width, height }
            // See Hero.handleAttackFrame() for an example where we pass the weaponBox directly...
            const isFootTile = footTiles.indexOf( instance.data.group ) !== -1;
            const lookbox = isInstance ? isFootTile ? footbox : hitbox : sprite;

            for ( let j = instance.pushed.length; j--; ) {
                const tilebox = instance.pushed[ j ];
                const collides = Utils.collide( lookbox, tilebox );

                if ( !collides ) {
                    continue;
                }

                const action = !!( instance.data.actions && instance.data.actions.some( ( action ) => {
                    return actionVerbs.indexOf( action.verb ) !== -1;
                }));
                const attack = !!( instance.data.actions && instance.canAttack() );
                const camera = !!( instance.data.friction || instance.data.mask );

                // The amount is the percentage of the lookbox that is colliding with the tilebox
                const amount = Utils.getCollisionAmount( collides, lookbox );
                const match = {
                    action,
                    attack,
                    camera,
                    amount,
                    tilebox,
                    collides,
                    instance,
                    coord: tilebox.coords,
                    group: instance.data.group,
                    jump: !!( instance.data.actions && instance.canInteract( Config.verbs.JUMP ) ),
                    fall: !!( instance.data.actions && instance.canInteract( Config.verbs.FALL ) ),
                    swim: !!( instance.data.actions && instance.canInteract( Config.verbs.SWIM ) ),
                    stop: !!( instance.data.actions && instance.data.actions.some( ( action ) => {
                        return stopVerbs.indexOf( action.verb ) !== -1;
                    })),
                };

                if ( action ) {
                    ret = true;
                    tiles.action.push( match );
                }

                if ( attack ) {
                    ret = true;
                    tiles.attack.push( match );
                }

                if ( ( !action && !attack ) || ( attack && camera ) ) {
                    ret = true;
                    tiles.passive.push( match );
                }
            }
        }

        return ret ? tiles : false;
    }


    checkQuestFlags ( quest ) {
        for ( let i = this.map.doors.length; i--; ) {
            this.map.doors[ i ].handleQuestFlagCheck( quest );
        }

        for ( let i = this.map.enemies.length; i--; ) {
            this.map.enemies[ i ].handleQuestFlagCheck( quest );
        }

        this.map.handleQuestFlagCheck( quest );
    }


/*******************************************************************************
* Map Switching
*******************************************************************************/
    initMap () {
        this.map.initSprites();
        this.map.initTiles();
        this.update();
        this.applyHero( this.hero.position, this.hero.dir );
        this.player.gameaudio.addSound({
            id: this.map.data.id,
            src: this.map.data.sound,
            channel: "bgm",
        });
        this.currentMusic = this.map.data.id;
        this.dialogue.auto({
            text: [ this.map.data.name ],
        });

        // Persist the game state on initialization and after map change
        // The game loop isn't running when we do this synchronous write to localStorage
        this.player.gamestorage.persist( this );
    }


    afterChangeMap ( newMapData ) {
        // Update the Map
        this.map.destroy();
        this.map.initMap( newMapData );
        this.map.addAllSprite( this.hero );

        // Update the Companion
        if ( this.companion ) {
            this.map.addAllSprite( this.companion );
        }

        // Initialize the new Map
        // Applies new hero offset!
        // Plays the new map's music
        this.initMap();

        // Resume game blit cycle...
        this.player.resume();

        // Fade in...
        this.player.fadeIn();
    }


    changeMap ( event ) {
        // Pause the Player so no game buttons dispatch
        this.player.hardStop();

        // Reset collision groups
        this.collision = {};

        // Fade out...
        this.player.fadeOut().then(() => {
            // Clear render layers and queue (after fade out)
            this.clear();

            // Clear the map change event
            this.mapChangeEvent = null;

            // Reset the quests
            this.gamequest.resetQuests();

            // New Map data
            const newMapData = Loader.cash( event.data.map );
            const newHeroPos = this.hero.getPositionForNewMap();
            const newSpawn = Utils.def( event.data.spawn ) ? newMapData.spawn[ event.data.spawn ] : {
                x: newHeroPos.x,
                y: newHeroPos.y,
            };

            // Set spawn position
            this.hero.position.x = newSpawn.x;
            this.hero.position.y = newSpawn.y;

            // Set spawn direction
            this.hero.dir = newSpawn.dir || this.hero.dir;

            // Handle the `dropin` effect
            if ( newSpawn.dropin ) {
                this.dropin = true;
                this.hero.position.z = -( this.camera.height / 2 );
                this.hero.cycle( Config.verbs.JUMP, this.hero.dir );
            }

            if ( this.companion ) {
                this.companion.reset();
            }

            this.afterChangeMap( newMapData );
        });
    }
}



const stopVerbs = [
    Config.verbs.GRAB,
    Config.verbs.LIFT,
];
const actionVerbs = [
    Config.verbs.LIFT,
    Config.verbs.PULL,
    Config.verbs.PUSH,
    Config.verbs.FALL,
    Config.verbs.SWIM,
    Config.verbs.ATTACK,
];
// @see notes in ./Config.js as these are related to that line of thought...
const footTiles = [
    Config.tiles.STAIRS,
    Config.tiles.WATER,
    Config.tiles.GRASS,
    Config.tiles.HOLES,
];



export class Camera {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.player = this.gamebox.player;
        this.x = 0;
        this.y = 0;
        this.width = this.player.width * this.player.resolution;
        this.height = this.player.height * this.player.resolution;
        this.pan = null;
    }


    update () {
        if ( this.pan ) {
            if ( this.pan.to.x === this.x && this.pan.to.y === this.y ) {
                this.resetPan();
            } else {
                this.updatePan();
            }
            return;
        }

        const x = ( this.gamebox.hero.position.x - ( ( this.width / 2 ) - ( this.gamebox.hero.width / 2 ) ) );
        const y = ( this.gamebox.hero.position.y - ( ( this.height / 2 ) - ( this.gamebox.hero.height / 2 ) ) );

        if ( x >= 0 && x <= ( this.gamebox.map.width - this.width ) ) {
            this.x = x;

        } else if ( x >= ( this.gamebox.map.width - this.width ) ) {
            this.x = ( this.gamebox.map.width - this.width );

        } else {
            this.x = 0;
        }

        if ( y >= 0 && y <= ( this.gamebox.map.height - this.height ) ) {
            this.y = y;

        } else if ( y >= ( this.gamebox.map.height - this.height ) ) {
            this.y = ( this.gamebox.map.height - this.height );

        } else {
            this.y = 0;
        }
    }


    resetPan () {
        this.pan = null;
        this.gamebox.panning = false;
    }


    updatePan () {
        const poi = {
            x: this.x,
            y: this.y,
        };

        const speed = 2;
        const destination = this.pan.to;

        if ( Math.abs( poi.x - destination.x ) > speed ) {
            poi.x += poi.x < destination.x ? speed : -speed;

        } else {
            poi.x = destination.x;
        }

        if ( Math.abs( poi.y - destination.y ) > speed ) {
            poi.y += poi.y < destination.y ? speed : -speed;

        } else {
            poi.y = destination.y;
        }

        this.x = poi.x;
        this.y = poi.y;
    }


    panCamera ( x, y ) {
        this.pan = {
            to: {
                x,
                y,
            },
            reset: {
                x: this.x,
                y: this.y,
            }
        };
        this.gamebox.panning = true;
        this.gamebox.handleCriticalReset();
    }
}



export class RenderQueue {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.player = this.gamebox.player;
        this.clear();
    }


    clear () {
        this.background = [];
        this.sprites = [];
        this.foreground = [];
        this.elevation = [];
    }


    // Supports anything with a "render" method and a "layer" property
    add ( sprite ) {
        this[ sprite.layer ].push( sprite );
    }


    render () {
        for ( let i = this.background.length; i--; ) {
            this.safeRender( this.background[ i ] );
        }

        for ( let i = 0; i < this.sprites.length; i++ ) {
            this.safeRender( this.sprites[ i ] );
        }

        for ( let i = this.foreground.length; i--; ) {
            this.safeRender( this.foreground[ i ] );
        }

        for ( let i = this.elevation.length; i--; ) {
            this.safeRender( this.elevation[ i ] );
        }
    }


    safeRender ( sprite ) {
        this.player.renderLayer.context.save();
        sprite.render();
        this.player.renderLayer.context.restore();
    }
}
