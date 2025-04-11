import Utils from "./Utils";
import Config from "./Config";
import Loader from "./Loader";
import Dialogue from "./Dialogue";
import Map from "./maps/Map";
import MapLayer from "./maps/MapLayer";
import Hero from "./sprites/Hero";
import Companion from "./sprites/Companion";
import FX from "./sprites/FX";



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
            this.player.width * this.player.resolution,
            this.player.height * this.player.resolution,
            this.player.resolution
        );
        this.layers = {
            background: null,
            heroground: null,
            foreground: null,
        };

        const initMapData = Loader.cash( this.player.heroData.map );
        const initHeroData = this.player.heroData;

        // Map
        this.map = new Map( initMapData, this );

        // Hero
        initHeroData.spawn = initMapData.spawn[ initHeroData.spawn ];
        this.hero = new Hero( initHeroData, this.map );

        Object.keys( initHeroData.sounds ).forEach( ( id ) => {
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
        Object.keys( this.layers ).forEach( ( id ) => {
            this.layers[ id ].onCanvas.clear();
        });
    }


    build () {
        this.element = document.createElement( "div" );
        this.element.className = "_2dk__gamebox";

        // Render layers
        Object.keys( this.layers ).forEach( ( id ) => {
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
            text: [this.map.data.name],
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
        const data = this.player.getMergedData({
            id: "smoke",
            kill: true,
            spawn: {
                x: obj.position.x + ( obj.width / 2 ) - ( this.map.data.tilesize / 2 ),
                y: obj.position.y + ( obj.height / 2 ) - ( this.map.data.tilesize / 2 ),
            },
        }, "fx" );

        this.map.addFX( new FX( data, this.map ) );
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: origin.x - ( this.map.data.tilesize / 4 ),
                y: origin.y - ( this.map.data.tilesize / 4 ),
            },
            vx: -8,
            vy: -8,

        }), this.map ) );
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: origin.x + ( this.map.data.tilesize / 4 ),
                y: origin.y - ( this.map.data.tilesize / 4 ),
            },
            vx: 8,
            vy: -8,

        }), this.map ) );
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: origin.x - ( this.map.data.tilesize / 4 ),
                y: origin.y + ( this.map.data.tilesize / 4 ),
            },
            vx: -8,
            vy: 8,

        }), this.map ) );
        this.map.addFX( new FX( Utils.merge( data, {
            spawn: {
                x: origin.x + ( this.map.data.tilesize / 4 ),
                y: origin.y + ( this.map.data.tilesize / 4 ),
            },
            vx: 8,
            vy: 8,

        }), this.map ) );
    }


/*******************************************************************************
* Collision checks
* Can all be handled in plugin GameBox
*******************************************************************************/
    getVisibleColliders () {
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


    getVisibleNPCs () {
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


    checkCamera ( poi, sprite ) {
        let ret = false;

        if ( poi.x <= this.camera.x || poi.x >= ( this.camera.x + this.camera.width - sprite.width ) ) {
            ret = true;
        }

        if ( poi.y <= this.camera.y || poi.y >= ( this.camera.y + this.camera.height - sprite.height ) ) {
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


    checkMap ( poi, sprite ) {
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


    checkEvents ( poi, sprite ) {
        const events = this.getVisibleEvents();

        for ( let i = events.length; i--; ) {
            const tile = {
                width: this.map.data.tilesize,
                height: this.map.data.tilesize,
                x: events[ i ].coords[ 0 ] * this.map.data.tilesize,
                y: events[ i ].coords[ 1 ] * this.map.data.tilesize,
            };
            const hasDir = events[ i ].dir;
            const isBoundary = events[ i ].type === Config.events.BOUNDARY;
            const lookbox = ( isBoundary ? {
                ...sprite.position,
                width: sprite.width,
                height: sprite.height,

            } : sprite.hitbox );
            const collides = Utils.collide( lookbox, tile );
            const amount = ( collides.width * collides.height ) / ( tile.width * tile.height ) * 100
            const isDir = hasDir ? ( sprite.dir === hasDir ) : true;
            const isThresh = isBoundary ? ( amount >= 50 ) : ( amount >= 20 );

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
        const npcs = this.getVisibleNPCs();

        // Ad-hoc "sprite" object with { x, y, width, height }
        let lookbox = sprite;

        if ( Utils.func( sprite.getHitbox ) ) {
            lookbox = sprite.getHitbox( poi );
        }

        for ( let i = npcs.length; i--; ) {
            // A thrown object Sprite will have a hero prop
            if ( !npcs[ i ].hero && npcs[ i ] !== sprite && Utils.collide( lookbox, npcs[ i ].hitbox ) ) {
                return npcs[ i ];
            }
        }

        return false;
    }


    checkTiles ( poi, sprite ) {
        const tiles = {
            action: [],
            attack: [],
            passive: [],
        };
        const activeTiles = this.getVisibleActiveTiles();

        activeTiles.forEach( ( instance ) => {
            // Ad-hoc "sprite" object with { x, y, width, height }
            let lookbox = sprite;

            if ( Utils.func( sprite.getFootbox ) && Utils.func( sprite.getHitbox ) ) {
                lookbox = ( footTiles.indexOf( instance.data.group ) !== -1 ) ? sprite.getFootbox( poi ) : sprite.getHitbox( poi );
            }

            instance.pushed.forEach( ( coord ) => {
                const tilebox = {
                    width: this.map.data.tilesize,
                    height: this.map.data.tilesize,
                    x: coord[ 0 ] * this.map.data.tilesize,
                    y: coord[ 1 ] * this.map.data.tilesize,
                };
                const collides = Utils.collide( lookbox, tilebox );

                if ( collides ) {
                    const amount = ( collides.width * collides.height ) / ( this.map.data.tilesize * this.map.data.tilesize ) * 100;
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
                        camera: ( cameraTiles.indexOf( instance.data.group ) !== -1 ),
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
            });
        });

        if ( tiles.action.length || tiles.attack.length || tiles.passive.length ) {
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
