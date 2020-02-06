const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const Dialogue = require( "./Dialogue" );
const { Map } = require( "./Map" );
const FX = require( "./sprites/FX" );
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



class GameBox {
    constructor ( player ) {
        this.player = player;
        this.step = 1;
        this.offset = {
            x: 0,
            y: 0,
        };
        this.camera = {
            x: 0,
            y: 0,
            width: this.player.width * this.player.data.game.resolution,
            height: this.player.height * this.player.data.game.resolution,
            resolution: this.player.data.game.resolution,
        };

        // Map
        this.map = new Map( Loader.cash( this.player.data.hero.map ), this.player.data.hero, this );

        // NPCs
        this.npcs = [];

        // Dialogues
        this.dialogue = new Dialogue();

        this.build();
        this.initMap();
    }


    build () {
        this.player.screen.appendChild( this.map.element );
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


    initMap () {
        // Shortcut ref to Hero sprite
        this.hero = this.map.hero;
        this.update( this.hero.position );
        this.hero.applyOffset();
        this.player.gameaudio.addSound({
            id: this.map.data.id,
            src: this.map.data.sound,
            channel: "bgm",
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


    checkMap ( poi, sprite ) {
        let ret = false;
        const hitbox = sprite.getHitbox( poi );

        for ( let i = this.map.data.collision.length; i--; ) {
            const collider = this.map.data.collider;
            const tile = {
                width: collider,
                height: collider,
                x: this.map.data.collision[ i ][ 0 ] * collider,
                y: this.map.data.collision[ i ][ 1 ] * collider,
                layer: "foreground",
            };

            if ( Utils.collide( hitbox, tile ) ) {
                ret = true;
                this.map.setCollider( tile );
                // break;

            } else {
                this.map.clearCollider( tile );
            }
        }

        return ret;
    }


    checkEvents ( poi, sprite ) {
        let ret = false;

        for ( let i = this.map.data.events.length; i--; ) {
            const tile = {
                width: this.map.data.tilesize,
                height: this.map.data.tilesize,
                x: this.map.data.events[ i ].coords[ 0 ] * this.map.data.tilesize,
                y: this.map.data.events[ i ].coords[ 1 ] * this.map.data.tilesize
            };
            const collides = Utils.collide( sprite.footbox, tile );

            if ( collides && (sprite.dir === this.map.data.events[ i ].dir) ) {
                ret = this.map.data.events[ i ];
                ret.collides = collides;
                ret.amount = collides.width * collides.height;
                this.map.setCollider( tile );
                break;

            } else {
                this.map.clearCollider( tile );
            }
        }

        return ret;
    }


    checkNPC ( poi, sprite ) {
        let ret = false;
        let collider;
        const hitbox = sprite.getHitbox( poi );

        for ( let i = this.map.npcs.length; i--; ) {
            // Companion NPC will have a Hero prop?
            // Ensure we also don't collide with ourselves :P
            if ( this.map.npcs[ i ].hero || this.map.npcs[ i ] === sprite ) {
                continue;
            }

            collider = {
                x: this.map.npcs[ i ].position.x,
                y: this.map.npcs[ i ].position.y,
                width: this.map.npcs[ i ].width,
                height: this.map.npcs[ i ].height,
                layer: this.map.npcs[ i ].layer,
            };

            if ( Utils.collide( hitbox, this.map.npcs[ i ].hitbox ) ) {
                ret = this.map.npcs[ i ];
                this.map.setCollider( collider );
                // break;

            } else {
                this.map.clearCollider( collider );
            }
        }

        return ret;
    }


    // Currently this check assumes the Hero as context...
    checkTiles ( poi ) {
        let ret = false;
        let amount;
        const tiles = {
            action: [],
            attack: [],
            passive: [],
        };
        const hitbox = this.hero.getHitbox( poi );
        const footbox = this.hero.getFootbox( poi );

        for ( let i = this.map.activeTiles.length; i--; ) {
            const instance = this.map.activeTiles[ i ];
            const lookbox = ((footTiles.indexOf( instance.data.group ) !== -1) ? footbox : hitbox);

            for ( let j = this.map.activeTiles[ i ].data.coords.length; j--; ) {
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

                } else if ( this.player.query.debug ) {
                    this.map.clearCollider( tilebox );
                }
            }
        }

        if ( tiles.action.length || tiles.attack.length || tiles.passive.length ) {
            tiles.action = tiles.action.sort( tileSortFunc );
            tiles.attack = tiles.attack.sort( tileSortFunc );
            tiles.passive = tiles.passive.sort( tileSortFunc );

            if ( this.player.query.debug ) {
                this.map.setTileColliders( tiles );
            }

            ret = tiles;
        }

        return ret;
    }
}



module.exports = GameBox;
