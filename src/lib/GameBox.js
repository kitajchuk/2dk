import Utils from "./Utils";
import Config from "./Config";
import Loader from "./Loader";
import Dialogue from "./Dialogue";
import Map from "./maps/Map";
import MapLayer from "./maps/MapLayer";
import Hero from "./sprites/Hero";
import Companion from "./sprites/Companion";
import FX from "./sprites/FX";
import CellAutoMap from "./maps/CellAutoMap";
import GameQuest from "./GameQuest";
import ItemDrop from "./sprites/ItemDrop";
import KeyItemDrop from "./sprites/KeyItemDrop";
import HUD from "./HUD";




export default class GameBox {
    constructor ( player, onReady ) {
        this.player = player;
        this.onReady = onReady;
        this.step = 1;
        this.dropin = false;
        this.offset = {
            x: 0,
            y: 0,
        };
        this.camera = new Camera(
            0,
            0,
            this.player.width * this.player.resolution,
            this.player.height * this.player.resolution,
            this.player.resolution
        );
        this.mapLayer = null;
        this.gamequest = new GameQuest( this );
        this.renderQueue = new RenderQueue( this );

        // Dialogues
        this.dialogue = new Dialogue( this );

        // Sounds
        this.currentMusic = null;

        let initMapData = Loader.cash( this.player.heroData.map );
        let initHeroData = structuredClone( this.player.heroData );

        this.build();

        const _init = () => {
            // Map
            this.map = new Map( initMapData, this );

            // Hero
            initHeroData.spawn = initMapData.spawn[ initHeroData.spawn ];
            this.hero = new Hero( initHeroData, this.map );
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
            }

            this.onReady();
            this.initMap();
        };

        // Cellular automata map
        if ( initMapData.cellauto ) {
            this.cellauto = new CellAutoMap();
            this.cellauto.initialize( initMapData );
            this.cellauto.generate( ( { textures } ) => {
                initMapData.textures.background = textures;
            }).then( ( { textures, spawn } ) => {
                initMapData.textures.background = textures;
                initMapData.spawn = [ spawn ];
                Utils.log( "Cellauto map ready!" );
                _init();
            });
            // Standard map
        } else {
            _init();
        }
    }


    destroy () {
        this.hero.destroy();
        this.companion?.destroy();
        this.map.destroy();
        this.cellauto?.destroy();
        this.mapLayer.destroy();
        this.dialogue.destroy();
        this.element.remove();
    }


    clear () {
        this.mapLayer.clear();
    }


    draw ( ...args ) {
        this.mapLayer.context.drawImage( ...args );
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__gamebox";

        this.mapLayer = new MapLayer({
            id: "gameground",
            width: this.camera.width,
            height: this.camera.height,
        });
        this.mapLayer.canvas.width = `${this.camera.width * this.camera.resolution}`;
        this.mapLayer.canvas.height = `${this.camera.height * this.camera.resolution}`;
        this.element.appendChild( this.mapLayer.canvas );

        this.player.screen.appendChild( this.element );
    }


    pause ( paused ) {
        if ( paused ) {
            this.hero.face( this.hero.dir );
            this.player.gameaudio.stopSound( this.currentMusic );

        } else {
            this.player.gameaudio.playSound( this.currentMusic );
        }
    }


/*******************************************************************************
* Rendering
* Can all be handled in plugin GameBox
*******************************************************************************/
    blit () {}
    update () {}


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
    smokeObject ( obj, fx = "smoke" ) {
        const origin = {
            x: obj.position.x + ( obj.width / 2 ) - ( this.map.data.tilesize / 2 ),
            y: obj.position.y + ( obj.height / 2 ) - ( this.map.data.tilesize / 2 ),
        };
        const data = this.player.getMergedData({
            id: fx,
            kill: true,
            spawn: origin,
        }, "fx" );

        this.map.addObject( "fx", new FX( data, this.map ) );
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: origin.x - ( this.map.data.tilesize / 4 ),
                y: origin.y - ( this.map.data.tilesize / 4 ),
            },
            vx: -8,
            vy: -8,

        }), this.map ) );
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: origin.x + ( this.map.data.tilesize / 4 ),
                y: origin.y - ( this.map.data.tilesize / 4 ),
            },
            vx: 8,
            vy: -8,

        }), this.map ) );
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: origin.x - ( this.map.data.tilesize / 4 ),
                y: origin.y + ( this.map.data.tilesize / 4 ),
            },
            vx: -8,
            vy: 8,

        }), this.map ) );
        this.map.addObject( "fx", new FX( Utils.merge( data, {
            spawn: {
                x: origin.x + ( this.map.data.tilesize / 4 ),
                y: origin.y + ( this.map.data.tilesize / 4 ),
            },
            vx: 8,
            vy: 8,

        }), this.map ) );
    }


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
        const items = this.player.query.get( "items" ).split( "," );

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


/*******************************************************************************
* Collision checks
* Can all be handled in plugin GameBox
*******************************************************************************/
    getVisibleColliders () {
        const colliders = [];

        // renderBox isn't defined until the map begins rendering
        // use it when it is available so that NPCs don't get collision
        // locked when they are partially off-screen
        const cameraBox = this.map.renderBox ? {
            x: this.camera.x - this.map.data.tilesize,
            y: this.camera.y - this.map.data.tilesize,
            width: this.map.renderBox.width,
            height: this.map.renderBox.height,
        } : this.camera;

        for ( let i = this.map.data.collision.length; i--; ) {
            const collides = Utils.collide( cameraBox, {
                width: this.map.data.collider,
                height: this.map.data.collider,
                x: this.map.data.collision[ i ][ 0 ] * this.map.data.collider,
                y: this.map.data.collision[ i ][ 1 ] * this.map.data.collider,
            });

            if ( collides ) {
                colliders.push( this.map.data.collision[ i ] );
            }
        }

        return colliders;
    }


    getVisibleEvents () {
        const events = [];

        for ( let i = this.map.data.events.length; i--; ) {
            const collides = Utils.collide( this.camera, {
                width: this.map.data.tilesize,
                height: this.map.data.tilesize,
                x: this.map.data.events[ i ].coords[ 0 ] * this.map.data.tilesize,
                y: this.map.data.events[ i ].coords[ 1 ] * this.map.data.tilesize,
            });

            if ( collides ) {
                events.push( this.map.data.events[ i ] );
            }
        }

        return events;
    }


    // "npcs" or "doors"
    getVisibleNPCs ( type = "npcs" ) {
        const npcs = [];

        for ( let i = this.map[ type ].length; i--; ) {
            const collides = Utils.collide( this.camera, this.map[ type ][ i ].getFullbox() );

            if ( collides ) {
                npcs.push( this.map[ type ][ i ] );
            }
        }

        return npcs;
    }


    getVisibleItems () {
        const items = [];

        for ( let i = this.map.items.length; i--; ) {
            const collides = Utils.collide( this.camera, this.map.items[ i ].getFullbox() );

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
                const collides = Utils.collide( this.camera, {
                    width: this.map.data.tilesize,
                    height: this.map.data.tilesize,
                    x: this.map.activeTiles[ i ].pushed[ j ][ 0 ] * this.map.data.tilesize,
                    y: this.map.activeTiles[ i ].pushed[ j ][ 1 ] * this.map.data.tilesize,
                });

                if ( collides && activeTiles.indexOf( this.map.activeTiles[ i ] ) === -1 ) {
                    activeTiles.push( this.map.activeTiles[ i ] );
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

        for ( let y = 0; y < this.map.renderBox.textures[ layer ].length; y++ ) {
            for ( let x = 0; x < this.map.renderBox.textures[ layer ][ y ].length; x++ ) {
                const tile = {
                    x: ( this.map.renderBox.x + x ) * this.map.data.tilesize,
                    y: ( this.map.renderBox.y + y ) * this.map.data.tilesize,
                    width: this.map.data.tilesize,
                    height: this.map.data.tilesize,
                };
                const collides = Utils.collide( tile, this.camera );
                const isEmpty = this.map.renderBox.textures[ layer ][ y ][ x ] === 0;

                if ( collides && isEmpty ) {
                    tiles.push( tile );
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
            const tile = {
                width: this.map.data.collider,
                height: this.map.data.collider,
                x: colliders[ i ][ 0 ] * this.map.data.collider,
                y: colliders[ i ][ 1 ] * this.map.data.collider,
            };

            if ( Utils.collide( hitbox, tile ) ) {
                return true;
            }
        }

        return false;
    }


    checkEvents ( poi, sprite ) {
        const events = this.getVisibleEvents();

        let amount = 0;

        for ( let i = events.length; i--; ) {
            const tile = {
                width: this.map.data.tilesize,
                height: this.map.data.tilesize,
                x: events[ i ].coords[ 0 ] * this.map.data.tilesize,
                y: events[ i ].coords[ 1 ] * this.map.data.tilesize,
            };
            const hasDir = events[ i ].dir;
            const isBoundary = events[ i ].type === Config.events.BOUNDARY;
            const lookbox = ( isBoundary ? sprite.getFullbox() : sprite.hitbox );
            const collides = Utils.collide( lookbox, tile );

            if ( collides ) {
                // Cumulative amount of the event tile(s) that can be colliding with the sprite
                amount += ( collides.width * collides.height ) / ( tile.width * tile.height ) * 100;

                const isDir = hasDir ? ( sprite.dir === hasDir ) : true;
                const isThresh = isBoundary ? ( amount >= 50 ) : ( amount >= 20 );

                // An event without a "dir" can be triggered from any direction
                if ( isThresh && isDir ) {
                    return Object.assign( events[ i ], {
                        collides,
                        amount,
                    });
                }
            }
        }

        return false;
    }


    checkNPC ( poi, sprite, type = "npcs" ) {
        const npcs = this.getVisibleNPCs( type ).filter( ( npc ) => {
            return npc.data.ai !== Config.npc.ai.FLOAT;
        });

        // Ad-hoc "sprite" object with { x, y, width, height }
        // See handleHeroAttackFrame() for an example where we pass the weaponBox directly...
        const lookbox = Utils.func( sprite.getHitbox ) ? sprite.getHitbox( poi ) : sprite;

        for ( let i = npcs.length; i--; ) {
            if ( 
                // A thrown object Sprite will have a hero prop
                !npcs[ i ].hero && 
                npcs[ i ] !== sprite && 
                Utils.collide( lookbox, npcs[ i ].hitbox ) &&
                // Check if the NPC is open (e.g. a door)
                !( type === "doors" && npcs[ i ].open )
            ) {
                return npcs[ i ];
            }
        }

        return false;
    }


    checkDoor ( poi, sprite ) {
        return this.checkNPC( poi, sprite, "doors" );
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
    }


    checkEmpty ( poi, sprite, layer = "background" ) {
        const emptyTiles = this.getVisibleEmptyTiles( layer );
        const touchedTiles = [];

        for ( let i = emptyTiles.length; i--; ) {
            const collides = Utils.collide( sprite.getHitbox( poi ), emptyTiles[ i ] );

            if ( collides ) {
                touchedTiles.push( emptyTiles[ i ] )
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

        for ( let i = activeTiles.length; i--; ) {
            const instance = activeTiles[ i ];
            // Ad-hoc "sprite" object with { x, y, width, height }
            // See handleHeroAttackFrame() for an example where we pass the weaponBox directly...
            const isInstance = ( Utils.func( sprite.getFootbox ) && Utils.func( sprite.getHitbox ) );
            const isFootTile = footTiles.indexOf( instance.data.group ) !== -1;
            const lookbox = isInstance ? isFootTile ? sprite.getFootbox( poi ) : sprite.getHitbox( poi ) : sprite;

            for ( let j = instance.pushed.length; j--; ) {
                const coord = instance.pushed[ j ];
                const tilebox = {
                    width: this.map.data.tilesize,
                    height: this.map.data.tilesize,
                    x: coord[ 0 ] * this.map.data.tilesize,
                    y: coord[ 1 ] * this.map.data.tilesize,
                };
                const collides = Utils.collide( lookbox, tilebox );

                if ( collides ) {
                    // The amount is the percentage of the lookbox that is colliding with the tilebox
                    const amount = ( collides.width * collides.height ) / ( lookbox.width * lookbox.height ) * 100;
                    const match = {
                        jump: ( instance.data.actions && instance.canInteract( Config.verbs.JUMP ) ? true : false ),
                        fall: ( instance.data.actions && instance.canInteract( Config.verbs.FALL ) ? true : false ),
                        stop: ( instance.data.actions && instance.data.actions.find( ( action ) => {
                            return stopVerbs.indexOf( action.verb ) !== -1;
                        }) ? true : false ),
                        group: instance.data.group,
                        coord,
                        action: ( instance.data.actions && instance.data.actions.find( ( action ) => {
                            return actionVerbs.indexOf( action.verb ) !== -1;
                        }) ? true : false ),
                        attack: ( instance.data.actions && instance.canAttack() ? true : false ),
                        camera: instance.data.friction || instance.data.mask,
                        amount,
                        tilebox,
                        collides,
                        instance,
                    };

                    if ( match.action ) {
                        tiles.action.push( match );
                    }

                    if ( match.attack ) {
                        tiles.attack.push( match );
                    }

                    if ( ( !match.action && !match.attack ) || ( match.attack && match.camera ) ) {
                        tiles.passive.push( match );
                    }
                }
            }
        }

        return ( tiles.action.length || tiles.attack.length || tiles.passive.length ) ? tiles : false;
    }


    checkQuestFlags ( quest ) {
        for ( let i = this.map.doors.length; i--; ) {
            this.map.doors[ i ].handleQuestFlagCheck( quest );
        }

        for ( let i = this.map.npcs.length; i--; ) {
            this.map.npcs[ i ].handleQuestFlagCheck( quest );
        }
    }


/*******************************************************************************
* Map Switching
*******************************************************************************/
    initMap () {
        this.map.initialize();
        this.update( this.hero.position );
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

        // Create new Map
        this.map = new Map( newMapData, this );
        this.hero.map = this.map;

        // Initialize the new Map
        // Applies new hero offset!
        // Plays the new map's music
        this.initMap();

        // Handle the `dropin` effect
        if ( this.dropin ) {
            this.hero.position.z = -( this.camera.height / 2 );
        }

        // Create a new Companion
        if ( this.companion ) {
            const newCompanionData = structuredClone( this.hero.data.companion );
            newCompanionData.spawn = {
                x: this.hero.position.x,
                y: this.hero.position.y,
            };
            this.companion.destroy();
            this.companion = new Companion( newCompanionData, this.hero );
        }

        // Fade in...
        this.player.fadeIn();

        // Resume game blit cycle...
        this.player.resume();
    }


    changeMap ( event ) {
        // Pause the Player so no game buttons dispatch
        this.player.pause();

        // Fade out...
        this.player.fadeOut();

        setTimeout( () => {
            // New Map data
            const newMapData = Loader.cash( event.map );
            const newHeroPos = this.hero.getPositionForNewMap();

            // Set a spawn index...
            this.hero.position.x = ( Utils.def( event.spawn ) ? newMapData.spawn[ event.spawn ].x : newHeroPos.x );
            this.hero.position.y = ( Utils.def( event.spawn ) ? newMapData.spawn[ event.spawn ].y : newHeroPos.y );

            this.afterChangeMap( newMapData );

        }, 1000 );
    }


    changeCellautoMap ( poi, dir, collision ) {
        // Pause the Player so no game buttons dispatch
        this.player.pause();

        // Fade out...
        this.player.fadeOut();

        setTimeout( () => {
            // New Map data (keep reusing the same map for cellauto)
            const newMapData = Loader.cash( this.hero.data.map );

            // Set a new position...
            this.hero.position = this.hero.getPositionForNewMap();

            // TODO: Fix the new map spawn area so hero doesn't spawn into collision

            this.cellauto.initialize( newMapData );
            this.cellauto.generate( ( { textures } ) => {
                newMapData.textures.background = textures;
            }).then( ( { textures, spawn } ) => {
                newMapData.textures.background = textures;
                newMapData.spawn = [ spawn ];
                this.hero.dir = dir;
                this.hero.position.x = spawn.x;
                this.hero.position.y = spawn.y;
                this.afterChangeMap( newMapData );
            });

        }, 1000 );
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
    constructor ( x, y, width, height, resolution ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.resolution = resolution;
    }
}



export class RenderQueue {
    constructor ( gamebox ) {
        this.gamebox = gamebox;
        this.blit();
    }


    blit () {
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
