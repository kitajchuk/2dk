import Utils from "./Utils";
import Config from "./Config";
import Loader from "./Loader";
import Dialogue from "./Dialogue";
import Map, { MapLayer } from "./Map";
import Hero from "./sprites/Hero";
import Companion from "./sprites/Companion";
import FX from "./sprites/FX";



const tileSortFunc = ( tileA, tileB ) => {
    if ( tileA.amount > tileB.amount ) {
        return -1;

    } else {
        return 1;
    }
};
const stopVerbs = [
    Config.verbs.GRAB,
    Config.verbs.MOVE,
    Config.verbs.LIFT,
];
const actionVerbs = [
    Config.verbs.LIFT,
];
const attackVerbs = [
    Config.verbs.ATTACK,
];
// @see notes in ./Config.js as these are related to that line of thought...
const footTiles = [
    Config.tiles.STAIRS,
    Config.tiles.WATER,
    Config.tiles.GRASS,
    Config.tiles.HOLES,
];
const cameraTiles = [
    Config.tiles.STAIRS,
    Config.tiles.GRASS,
];



class Camera {
    constructor ( x, y, width, height, resolution ) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.resolution = resolution;
    }
}



class GameBox {
    constructor ( player ) {
        this.player = player;
        this.step = 1;
        this.offset = {
            x: 0,
            y: 0,
        };
        this.camera = new Camera(
            0,
            0,
            this.player.width * this.player.data.resolution,
            this.player.height * this.player.data.resolution,
            this.player.data.resolution
        );
        this.layers = {
            background: null,
            heroground: null,
            foreground: null,
        };

        const initMapData = Loader.cash( this.player.data.hero.map );
        const initHeroData = this.player.data.hero;

        // Map
        this.map = new Map( initMapData, this );

        // Hero
        initHeroData.spawn = initMapData.spawn[ initHeroData.spawn ];
        this.hero = new Hero( initHeroData, this.map );

        Object.keys( initHeroData.sounds ).forEach(( id ) => {
            this.player.gameaudio.addSound({
                id,
                src: initHeroData.sounds[ id ],
                channel: "sfx",
            });
        });

        // Companion?
        if ( initHeroData.companion ) {
            initHeroData.companion = this.player.getMergedData( initHeroData.companion, "npcs" );
            initHeroData.companion.spawn = {
                x: this.hero.position.x,
                y: this.hero.position.y,
            };

            this.companion = new Companion( initHeroData.companion, this.hero );
        }

        // Dialogues
        this.dialogue = new Dialogue();

        this.build();
        this.initMap();
    }


    clear () {
        Object.keys( this.layers ).forEach(( id ) => {
            this.layers[ id ].onCanvas.clear();
        });
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__gamebox";

        // Render layers
        Object.keys( this.layers ).forEach(( id ) => {
            this.addLayer( id );
        });

        this.player.screen.appendChild( this.element );
        this.player.screen.appendChild( this.dialogue.element );
    }


    pause ( paused ) {
        if ( paused ) {
            this.hero.face( this.hero.dir );
            this.player.gameaudio.stopSound( this.map.data.id );

        } else {
            this.player.gameaudio.playSound( this.map.data.id );
        }
    }


    addLayer ( id ) {
        this.layers[ id ] = {};
        this.layers[ id ].onCanvas = new MapLayer({
            id,
            width: this.camera.width,
            height: this.camera.height,
        });

        this.layers[ id ].onCanvas.canvas.width = `${this.camera.width * this.camera.resolution}`;
        this.layers[ id ].onCanvas.canvas.height = `${this.camera.height * this.camera.resolution}`;

        this.element.appendChild( this.layers[ id ].onCanvas.canvas );
    }


    initMap () {
        this.update( this.hero.position );
        this.hero.applyOffset();
        this.player.gameaudio.addSound({
            id: this.map.data.id,
            src: this.map.data.sound,
            channel: "bgm",
        });
        this.dialogue.auto({
            text: [this.map.data.name]
        });
    }


/*******************************************************************************
* Rendering
Can all be handled in plugin GameBox
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
* FX utilities
*******************************************************************************/
    smokeObject ( obj ) {
        let data = {
            id: "smoke",
            spawn: {
                x: obj.position.x + (obj.width / 2) - (this.map.data.tilesize / 2),
                y: obj.position.y + (obj.height / 2) - (this.map.data.tilesize / 2),
            },
        };

        data = this.player.getMergedData( data, "fx" );
        data.hitbox = {
            x: 0,
            y: 0,
            width: data.width,
            height: data.height,
        };

        this.map.addFX( new FX( data, this.map ) );
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: origin.x - (this.map.data.tilesize / 4),
                y: origin.y - (this.map.data.tilesize / 4),
            },
            vx: -8,
            vy: -8,

        }), this.map ));
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: origin.x + (this.map.data.tilesize / 4),
                y: origin.y - (this.map.data.tilesize / 4),
            },
            vx: 8,
            vy: -8,

        }), this.map ));
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: origin.x - (this.map.data.tilesize / 4),
                y: origin.y + (this.map.data.tilesize / 4),
            },
            vx: -8,
            vy: 8,

        }), this.map ));
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: origin.x + (this.map.data.tilesize / 4),
                y: origin.y + (this.map.data.tilesize / 4),
            },
            vx: 8,
            vy: 8,

        }), this.map ));
    }


/*******************************************************************************
* Collision checks
* Can all be handled in plugin GameBox
*******************************************************************************/
    getVisibleColliders() {
        const colliders = [];

        for ( let i = this.map.data.collision.length; i--; ) {
            const collides = Utils.collide( this.camera, {
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


    getVisibleEvents() {
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


    getVisibleNPCs() {
        const npcs = [];

        for ( let i = this.map.npcs.length; i--; ) {
            const collides = Utils.collide( this.camera, {
                x: this.map.npcs[ i ].position.x,
                y: this.map.npcs[ i ].position.y,
                width: this.map.npcs[ i ].width,
                height: this.map.npcs[ i ].height,
            });

            if ( collides ) {
                npcs.push( this.map.npcs[ i ] );
            }
        }

        return npcs;
    }


    getVisibleActiveTiles() {
        const activeTiles = [];

        for ( let i = this.map.activeTiles.length; i--; ) {
            for ( let j = this.map.activeTiles[ i ].data.coords.length; j--; ) {
                const collides = Utils.collide( this.camera, {
                    width: this.map.data.tilesize,
                    height: this.map.data.tilesize,
                    x: this.map.activeTiles[ i ].data.coords[ j ][ 0 ] * this.map.data.tilesize,
                    y: this.map.activeTiles[ i ].data.coords[ j ][ 1 ] * this.map.data.tilesize,
                });
                
                if ( collides && activeTiles.indexOf( this.map.activeTiles[ i ] ) === -1 ) {
                    activeTiles.push( this.map.activeTiles[ i ] );
                }
            }
        }

        return this.map.activeTiles;
    }


    checkCamera ( poi, sprite ) {
        let ret = false;

        if ( poi.x <= this.camera.x || poi.x >= (this.camera.x + this.camera.width - sprite.width) ) {
            ret = true;
        }

        if ( poi.y <= this.camera.y || poi.y >= (this.camera.y + this.camera.height - sprite.height) ) {
            ret = true;
        }

        return ret;
    }


    checkHero ( poi, sprite ) {
        let ret = false;
        const collides = Utils.collide( sprite.getHitbox( poi ), this.hero.hitbox );

        if ( collides ) {
            ret = collides;
        }

        return ret;
    }


    checkMap( poi, sprite ) {
        const hitbox = sprite.getHitbox( poi );
        const colliders = this.getVisibleColliders();

        for ( let i = colliders.length; i--; ) {
            const tile = {
                width: this.map.data.collider,
                height: this.map.data.collider,
                x: colliders[ i ][ 0 ] * this.map.data.collider,
                y: colliders[ i ][ 1 ] * this.map.data.collider,
                layer: "foreground",
            };

            if ( Utils.collide( hitbox, tile ) ) {
                return true;
            }
        }

        return false;
    }


    checkEvents( poi, sprite ) {
        const events = this.getVisibleEvents();

        for ( let i = events.length; i--; ) {
            const tile = {
                width: this.map.data.tilesize,
                height: this.map.data.tilesize,
                x: events[ i ].coords[ 0 ] * this.map.data.tilesize,
                y: events[ i ].coords[ 1 ] * this.map.data.tilesize
            };
            const hasDir = events[ i ].dir;
            const isBoundary = events[ i ].type === Config.events.BOUNDARY;
            const lookbox = (isBoundary ? {
                width: sprite.width,
                height: sprite.height,
                x: sprite.position.x,
                y: sprite.position.y,

            } : sprite.hitbox);
            const collides = Utils.collide( lookbox, tile );
            const amount = (collides.width * collides.height);
            const isDir = hasDir ? (sprite.dir === hasDir) : true;
            const isThresh = isBoundary ? true : !hasDir ? (amount >= (1280 / this.camera.resolution)) : (amount >= (256 / this.camera.resolution));

            // An event without a "dir" can be triggered from any direction
            if ( collides && isThresh && isDir ) {
                return Object.assign( events[ i ], {
                    collides,
                    amount,
                });
            }
        }

        return false;
    }


    checkNPC ( poi, sprite ) {
        const hitbox = sprite.getHitbox( poi );
        const npcs = this.getVisibleNPCs();

        for ( let i = npcs.length; i--; ) {
            // A thrown object Sprite will have a hero prop
            if ( !npcs[ i ].hero && npcs[ i ] !== sprite && Utils.collide( hitbox, npcs[ i ].hitbox ) ) {
                return npcs[ i ];
            }
        }

        return false;
    }


    checkTiles ( poi ) {
        const tiles = {
            action: [],
            attack: [],
            passive: [],
        };
        const hitbox = this.hero.getHitbox( poi );
        const footbox = this.hero.getFootbox( poi );
        const activeTiles = this.getVisibleActiveTiles();

        for ( let i = activeTiles.length; i--; ) {
            const instance = activeTiles[ i ];
            const lookbox = ((footTiles.indexOf( instance.data.group ) !== -1) ? footbox : hitbox);

            for ( let j = activeTiles[ i ].data.coords.length; j--; ) {
                const tilebox = {
                    width: this.map.data.tilesize,
                    height: this.map.data.tilesize,
                    x: instance.data.coords[ j ][ 0 ] * this.map.data.tilesize,
                    y: instance.data.coords[ j ][ 1 ] * this.map.data.tilesize,
                };
                const collides = Utils.collide( lookbox, tilebox );

                if ( collides ) {
                    // Utils.collides returns a useful collider object...
                    const amount = collides.width * collides.height;
                    const match = {
                        jump: (instance.data.action && instance.data.action.verb === Config.verbs.JUMP),
                        stop: (instance.data.action && stopVerbs.indexOf( instance.data.action.verb ) !== -1),
                        group: instance.data.group,
                        coord: instance.data.coords[ j ],
                        action: (instance.data.action && actionVerbs.indexOf( instance.data.action.verb ) !== -1),
                        attack: (instance.data.attack && attackVerbs.indexOf( instance.data.attack.verb ) !== -1),
                        camera: (cameraTiles.indexOf( instance.data.group ) !== -1),
                        amount,
                        tilebox,
                        collides,
                        instance,
                    };

                    if ( instance.data.action ) {
                        tiles.action.push( match );
                    }

                    if ( instance.data.attack ) {
                        tiles.attack.push( match );
                    }

                    if ( (!instance.data.action && !instance.data.attack) || (instance.data.attack && match.camera) ) {
                        tiles.passive.push( match );
                    }
                }
            }
        }

        if ( tiles.action.length || tiles.attack.length || tiles.passive.length ) {
            tiles.action = tiles.action.sort( tileSortFunc );
            tiles.attack = tiles.attack.sort( tileSortFunc );
            tiles.passive = tiles.passive.sort( tileSortFunc );

            return tiles
        }

        return false;
    }
}



export default GameBox;

export {
    Camera,
    GameBox,
}
