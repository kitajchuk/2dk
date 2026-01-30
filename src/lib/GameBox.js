import Utils from "./Utils";
import Config from "./Config";
import Loader from "./Loader";
import Dialogue from "./Dialogue";
import Map from "./maps/Map";
import MapLayer from "./maps/MapLayer";
import Hero from "./sprites/Hero";
import Companion from "./sprites/Companion";
import GameQuest from "./GameQuest";
import ItemDrop from "./sprites/ItemDrop";
import { KeyItemDrop } from "./sprites/KeyItem";
import HUD from "./HUD";



export default class GameBox {
    constructor ( player ) {
        this.player = player;
        this.dropin = false;
        this.panning = false;
        this.mapLayer = null;
        this.mapLayers = {
            background: null,
            foreground: null,
        };
        this.mapChangeEvent = null;
        this.gamequest = new GameQuest( this );
        this.renderQueue = new RenderQueue( this );

        // Dialogues
        this.dialogue = new Dialogue( this );

        // Sounds
        this.currentMusic = null;

        let initMapData = Loader.cash( this.player.heroData.map );
        let initHeroData = { ...this.player.heroData };

        // Camera
        this.camera = new Camera( this );

        // Map
        this.map = new Map( initMapData, this );

        // Hero
        initHeroData.spawn = initMapData.spawn[ initHeroData.spawn ];
        this.hero = new Hero( initHeroData, this.map );
        this.map.addAllSprite( this.hero );
        this.seedItems();

        // HUD
        this.hud = new HUD( this );

        // Sounds
        for ( const id in this.player.data.sounds ) {
            this.player.gameaudio.addSound({
                id,
                src: this.player.data.sounds[ id ],
                channel: "sfx",
            });
        }

        // Companion?
        if ( initHeroData.companion ) {
            initHeroData.companion = this.player.getMergedData( initHeroData.companion, "npcs" );
            initHeroData.companion.spawn = {
                x: this.hero.position.x,
                y: this.hero.position.y,
            };

            this.companion = new Companion( initHeroData.companion, this.hero );
            this.map.addAllSprite( this.companion );
        }

        this.build();
        this.initMap();
    }


    destroy () {
        this.hud.reset();
        this.hero.destroy();
        this.companion?.destroy();
        this.map.destroy();
        this.mapLayer.destroy();
        this.dialogue.destroy();
        this.element.remove();
    }


    clear () {
        this.mapLayer.clear();
        this.renderQueue.clear();

        for ( const id in this.mapLayers ) {
            this.mapLayers[ id ].clear();
        }
    }


    draw ( ...args ) {
        this.mapLayer.context.drawImage( ...args );
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__gamebox";

        // Main canvas visible on screen
        this.mapLayer = new MapLayer({
            id: "gameground",
            width: this.camera.width,
            height: this.camera.height,
        });
        this.mapLayer.canvas.width = `${this.camera.width * this.player.resolution}`;
        this.mapLayer.canvas.height = `${this.camera.height * this.player.resolution}`;

        // Offscreen canvases for each texture layer
        for ( const id in this.mapLayers ) {
            const offWidth = this.camera.width + ( this.map.data.tilesize * 2 );
            const offHeight = this.camera.height + ( this.map.data.tilesize * 2 );

            this.mapLayers[ id ] = new MapLayer({
                id,
                width: offWidth,
                height: offHeight,
            });
            this.mapLayers[ id ].canvas.width = `${offWidth * this.player.resolution}`;
            this.mapLayers[ id ].canvas.height = `${offHeight * this.player.resolution}`;
        }

        this.element.appendChild( this.mapLayer.canvas );
        this.player.screen.appendChild( this.element );
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
* Can all be handled in plugin GameBox
* Order is: blit, update, render
*******************************************************************************/
    blit () {}
    update () {}
    render () {}


/*******************************************************************************
* GamePad Inputs
* Can all be handled in plugin GameBox
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
* Sprite utilities
*******************************************************************************/
    itemDrop ( drops, position ) {
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


    keyItemDrop ( dropItem, position ) {
        const data = this.player.getMergedData({
            id: dropItem.id,
            dialogue: dropItem.dialogue,
        }, "items" );
        const spawn = {
            x: position.x + ( this.map.data.tilesize / 2 ) - ( data.width / 2 ),
            y: position.y + ( this.map.data.tilesize / 2 ) - ( data.height / 2 ),
        };
        this.map.addObject( "items", new KeyItemDrop( spawn, data, this.map ) );
    }


    seedItems () {
        const param = this.player.query.get( "items" );

        if ( param ) {
            const items = param.split( "," );

            for ( let i = items.length; i--; ) {
                const item = items[ i ];
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


    seedItemLive ( id ) {
        this.hero.giveItem( id );
        this.hero.stillTimer = 0;
        this.hero.itemGet = null;
        this.hero.face( this.hero.dir );
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
            const collides = Utils.collide( this.getRenderBox(), this.map.colliders[ i ] );

            if ( collides ) {
                colliders.push( this.map.colliders[ i ] );
            }
        }

        return colliders;
    }


    getVisibleEvents () {
        const events = [];

        for ( let i = this.map.events.length; i--; ) {
            const collides = Utils.collide( this.getRenderBox(), this.map.events[ i ].eventbox );

            if ( collides ) {
                events.push( this.map.events[ i ] );
            }
        }

        return events;
    }


    // "npcs" or "doors"
    getVisibleNPCs ( type = "npcs" ) {
        const npcs = [];

        for ( let i = this.map[ type ].length; i--; ) {
            const collides = Utils.collide( this.getRenderBox(), this.map[ type ][ i ].getFullbox() );

            if ( collides ) {
                npcs.push( this.map[ type ][ i ] );
            }
        }

        return npcs;
    }


    getVisibleItems () {
        const items = [];

        for ( let i = this.map.items.length; i--; ) {
            const collides = Utils.collide( this.getRenderBox(), this.map.items[ i ].getFullbox() );

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
                const collides = Utils.collide( this.getRenderBox(), this.map.activeTiles[ i ].pushed[ j ] );

                if ( collides ) {
                    activeTiles.push( this.map.activeTiles[ i ] );
                    break;
                }
            }
        }

        return activeTiles;
    }


    getVisibleEmptyTiles ( layer = "background" ) {
        const tiles = [];

        if ( !this.map.renderBox ) {
            return tiles;
        }

        for ( let y = this.map.renderBox.textures[ layer ].length; y--; ) {
            for ( let x = this.map.renderBox.textures[ layer ][ y ].length; x--; ) {
                const isEmpty = this.map.renderBox.textures[ layer ][ y ][ x ] === 0;

                if ( isEmpty ) {
                    const tile = {
                        x: ( this.map.renderBox.x + x ) * this.map.data.tilesize,
                        y: ( this.map.renderBox.y + y ) * this.map.data.tilesize,
                        width: this.map.data.tilesize,
                        height: this.map.data.tilesize,
                    };
                    const collides = Utils.collide( this.getRenderBox(), tile );

                    if ( collides ) {
                        tiles.push( tile );
                    }
                }
            }
        }

        return tiles;
    }


    getEmptyTile ( coords, layer = "background" ) {
        return this.map.data.textures[ layer ][ coords[ 1 ] ][ coords[ 0 ] ];
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


    checkHero ( poi, sprite ) {
        return Utils.collide( sprite.getHitbox( poi ), this.hero.hitbox );
    }


    checkMap ( poi, sprite ) {
        const hitbox = sprite.getHitbox( poi );
        const colliders = this.getVisibleColliders();

        for ( let i = colliders.length; i--; ) {
            if ( Utils.collide( hitbox, colliders[ i ] ) ) {
                return true;
            }
        }

        return false;
    }


    checkEvents ( poi, sprite ) {
        const events = this.getVisibleEvents();

        for ( let i = events.length; i--; ) {
            // An event without a "dir" can be triggered from any direction
            const dir = events[ i ].data.dir;
            const isDir = dir ? ( sprite.dir === dir ) : true;

            if ( !isDir ) {
                continue;
            }

            const collides = events[ i ].checkCollision( poi, sprite, !!dir );

            if ( collides ) {
                if ( events[ i ].isBlockedByTile() ) {
                    return false;
                }
                return events[ i ];
            }
        }

        return false;
    }


    checkNPC ( poi, sprite, type = "npcs" ) {
        const npcs = this.getVisibleNPCs( type );
        
        // Ad-hoc "sprite" object with { x, y, width, height }
        // See handleHeroAttackFrame() for an example where we pass the weaponBox directly...
        const lookbox = Utils.func( sprite.getHitbox ) ? sprite.getHitbox( poi ) : sprite;

        for ( let i = npcs.length; i--; ) {
            // Non-enemy floating NPCs don't collide with the hero
            // Skip if thrown object, self, or door is open
            if (
                npcs[ i ].data.ai === Config.npc.ai.FLOAT && type !== "enemies" ||
                npcs[ i ].hero ||
                npcs[ i ] === sprite ||
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
        const items = this.getVisibleItems();

        // Ad-hoc "sprite" object with { x, y, width, height }
        // See handleHeroAttackFrame() for an example where we pass the weaponBox directly...
        const lookbox = Utils.func( sprite.getHitbox ) ? sprite.getHitbox( poi ) : sprite;

        for ( let i = items.length; i--; ) {
            if ( Utils.collide( lookbox, items[ i ].hitbox ) ) {
                return items[ i ];
            }
        }

        return false;
    }


    checkEmpty ( poi, sprite, layer = "background" ) {
        const emptyTiles = this.getVisibleEmptyTiles( layer );
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
        const activeTiles = this.getVisibleActiveTiles();
        const isInstance = sprite.gamebox === this;
        const footbox = isInstance ? sprite.getFootbox( poi ) : sprite;
        const hitbox = isInstance ? sprite.getHitbox( poi ) : sprite;
        
        let ret = false;

        for ( let i = activeTiles.length; i--; ) {
            const instance = activeTiles[ i ];
            // Ad-hoc "sprite" object with { x, y, width, height }
            // See handleHeroAttackFrame() for an example where we pass the weaponBox directly...
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
        this.map.initialize();
        this.update();
        this.hero.applyOffset();
        this.player.gameaudio.addSound({
            id: this.map.data.id,
            src: this.map.data.sound,
            channel: "bgm",
        });
        this.currentMusic = this.map.data.id;
        this.dialogue.auto({
            text: [this.map.data.name],
        });
    }


    afterChangeMap ( newMapData ) {
        // Destroy old Map
        this.map.destroy();
        delete this.map;

        // Create new Map
        this.map = new Map( newMapData, this );
        this.hero.map = this.map;
        this.map.addAllSprite( this.hero );

        // Initialize the new Map
        // Applies new hero offset!
        // Plays the new map's music
        this.initMap();

        // Create a new Companion
        if ( this.companion ) {
            const newCompanionData = { ...this.hero.data.companion };
            newCompanionData.spawn = {
                x: this.hero.position.x,
                y: this.hero.position.y,
            };
            this.companion.destroy();
            this.companion = new Companion( newCompanionData, this.hero );
            this.map.addAllSprite( this.companion );
        }

        // Clear the map change event
        this.mapChangeEvent = null;

        // Reset the quests
        this.gamequest.resetQuests();

        // Fade in...
        this.player.fadeIn();

        // Resume game blit cycle...
        this.player.resume();
    }


    changeMap ( event ) {
        // Pause the Player so no game buttons dispatch
        this.player.hardStop();

        // Fade out...
        this.player.fadeOut();

        setTimeout( () => {
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

            this.afterChangeMap( newMapData );

        }, Config.player.fadeDur );
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
        this.player = gamebox.player;
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
        this.clear();
    }


    clear () {
        this.background = [];
        this.heroground = [];
        this.foreground = [];
    }


    // Supports anything with a "render" method and a "layer" property
    add ( sprite ) {
        this[ sprite.layer ].push( sprite );
    }


    render () {
        for ( let i = this.background.length; i--; ) {
            this.safeRender( this.background[ i ] );
        }

        for ( let i = 0; i < this.heroground.length; i++ ) {
            this.safeRender( this.heroground[ i ] );
        }

        for ( let i = this.foreground.length; i--; ) {
            this.safeRender( this.foreground[ i ] );
        }
    }


    safeRender ( sprite ) {
        this.gamebox.mapLayer.context.save();
        sprite.render();
        this.gamebox.mapLayer.context.restore();
    }
}
