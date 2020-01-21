const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const Dialogue = require( "./Dialogue" );
const { Map } = require( "./Map" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );
const stopTiles = [
    Config.verbs.GRAB,
    Config.verbs.MOVE,
    Config.verbs.LIFT,
];
const footTiles = [
    Config.tiles.STAIRS,
    Config.tiles.WATER,
    Config.tiles.GRASS,
    Config.tiles.HOLE,
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
            width: this.player.width,
            height: this.player.height,
            resolution: this.player.data.game.resolution,
            speed: this.getSpeed(),
        };
        this.interact = {
            // tile: {
            //     activeTiles,
            //     activeTile,
            //     coord,
            //     toss?,
            // }
            tile: null,
            push: 0,
        };
        this.debounce = 1024;
        this.locked = false;

        // Map
        this.map = new Map( Loader.cash( this.player.data.hero.spawn.map ), this.player.data.hero, this );

        // Map switch
        this.map_ = null;
        this.cam_ = null;

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


    initMap () {
        this.offset = this.update( this.map.hero.position );
        this.map.update( this.map.hero.position, this.offset );
        this.player.gameaudio.addSound({
            id: this.map.data.id,
            src: this.map.data.sound,
            channel: "bgm",
        });
    }


/*******************************************************************************
* Rendering
*******************************************************************************/
    pause ( paused ) {
        if ( paused ) {
            this.map.hero.face( this.map.hero.dir );
            this.player.gameaudio.stopSound( this.map.data.id );

        } else {
            this.player.gameaudio.playSound( this.map.data.id );
        }
    }


    update ( poi ) {
        const x = ( poi.x - (this.camera.width / 2) );
        const y = ( poi.y - (this.camera.height / 2) );
        const offset = {};

        if ( x >= 0 && x <= (this.map.width - this.camera.width) ) {
            offset.x = -x;

        } else {
            if ( x >= (this.map.width - this.camera.width) ) {
                offset.x = -(this.map.width - this.camera.width);

            } else {
                offset.x = 0;
            }
        }

        if ( y >= 0 && y <= (this.map.height - this.camera.height) ) {
            offset.y = -y;

        } else {
            if ( y >= (this.map.height - this.camera.height) ) {
                offset.y = -(this.map.height - this.camera.height);

            } else {
                offset.y = 0;
            }
        }

        this.camera.x = Math.abs( offset.x );
        this.camera.y = Math.abs( offset.y );

        return offset;
    }


    render ( elapsed ) {
        this.map.render( elapsed, this.camera );

        if ( this.map_ ) {
            this.map_.render( elapsed, this.cam_ );
        }
    }


/*******************************************************************************
* Helper methods
*******************************************************************************/
    getSpeed () {
        return this.player.width * 0.333333;
    }


    getPoi ( delta, dirX, dirY ) {
        return {
            x: this.map.hero.position.x + (dirX * this.camera.speed * delta),
            y: this.map.hero.position.y + (dirY * this.camera.speed * delta),
        }
    }


    getCollision ( poi ) {
        return {
            evt: this.checkEvt( poi ),
            map: this.checkMap( poi, this.map.hero ),
            box: this.checkBox( poi ),
            obj: this.checkObj( poi ),
            tile: this.checkTile( poi ),
        };
    }


    getStep ( dir ) {
        let dirX = 0;
        let dirY = 0;

        if ( dir === "up" ) {
            dirY = -this.step;
        }

        if ( dir === "down" ) {
            dirY = this.step;
        }

        if ( dir === "left" ) {
            dirX = -this.step;
        }

        if ( dir === "right" ) {
            dirX = this.step;
        }

        return {
            x: dirX,
            y: dirY,
        }
    }


/*******************************************************************************
* GamePad Inputs
* Can all be handled in TopView or other play style plugin Box
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
* Perception Checks
*******************************************************************************/
    checkBox ( poi ) {
        let ret = false;

        if ( poi.x <= this.camera.x || poi.x >= (this.camera.x + this.camera.width - this.map.hero.width) ) {
            ret = true;
        }

        if ( poi.y <= this.camera.y || poi.y >= (this.camera.y + this.camera.height - this.map.hero.height) ) {
            ret = true;
        }

        return ret;
    }


    checkMap ( poi, sprite ) {
        let ret = false;
        const hitbox = sprite.getHitbox( poi );

        for ( let i = this.map.data.collision.length; i--; ) {
            const collider = this.map.data.collider / this.player.data.game.resolution;
            const tile = {
                width: collider,
                height: collider,
                x: this.map.data.collision[ i ][ 0 ] * collider,
                y: this.map.data.collision[ i ][ 1 ] * collider
            };

            if ( Utils.collide( hitbox, tile ) ) {
                ret = true;
                break;
            }
        }

        return ret;
    }


    checkEvt ( poi ) {
        let ret = false;
        const hitbox = {
            width: this.map.hero.width,
            height: this.map.hero.height,
            x: this.map.hero.position.x,
            y: this.map.hero.position.y,
        };

        for ( let i = this.map.data.events.length; i--; ) {
            const tile = {
                width: this.map.gridsize,
                height: this.map.gridsize,
                x: this.map.data.events[ i ].coords[ 0 ] * this.map.gridsize,
                y: this.map.data.events[ i ].coords[ 1 ] * this.map.gridsize
            };

            if ( Utils.collide( hitbox, tile ) && this.map.hero.dir === this.map.data.events[ i ].dir ) {
                ret = this.map.data.events[ i ];
                break;
            }
        }

        return ret;
    }


    checkObj ( poi ) {
        let ret = false;
        const hitbox = this.map.hero.getHitbox( poi );

        for ( let i = this.map.activeObjects.length; i--; ) {
            if ( Utils.collide( hitbox, this.map.activeObjects[ i ].hitbox ) ) {
                ret = this.map.activeObjects[ i ];
                break;
            }
        }

        return ret;
    }


    checkTile ( poi ) {
        const tiles = [];
        const hitbox = this.map.hero.getHitbox( poi );
        const footbox = this.map.hero.getFootbox( poi );

        for ( let i = this.map.activeTiles.length; i--; ) {
            for ( let j = this.map.activeTiles[ i ].data.coords.length; j--; ) {
                const tile = this.map.activeTiles[ i ];
                const tilebox = {
                    width: this.map.gridsize,
                    height: this.map.gridsize,
                    x: tile.data.coords[ j ][ 0 ] * this.map.gridsize,
                    y: tile.data.coords[ j ][ 1 ] * this.map.gridsize
                };
                const lookbox = ((footTiles.indexOf( tile.data.group ) !== -1) ? footbox : hitbox);

                if ( Utils.collide( lookbox, tilebox ) ) {
                    tiles.push({
                        activeTiles: tile,
                        coord: tile.data.coords[ j ],
                    });
                }
            }
        }

        if ( tiles.length === 1 ) {
            return tiles[ 0 ];
        }

        // If there's no action tile, return one tile...
        return (tiles.find(( tile ) => {
            return tile.activeTiles.data.action || tile.activeTiles.data.attack;

        }) || tiles[ 0 ]);
    }
}



class TopView extends GameBox {
    constructor ( player ) {
        super( player );
    }


/*******************************************************************************
* GamePad Inputs
*******************************************************************************/
    pressD ( dir, delta, dirX, dirY ) {
        const poi = this.getPoi( delta, dirX, dirY );
        const collision = this.getCollision( poi );
        const speed = this.getSpeed();

        if ( this.locked ) {
            return;
        }

        if ( collision.evt ) {
            if ( collision.evt.type === Config.events.BOUNDARY && collision.box ) {
                this.handleEvtBoundary( collision.evt );
                return;
            }
        }

        if ( collision.obj ) {
            this.handleObj( poi, dir );
            return;
        }

        if ( collision.map ) {
            this.handleMap( poi, dir );
            return;
        }

        if ( collision.box ) {
            this.handleBox( poi, dir );
            return;
        }

        if ( this.map.hero.verb === Config.verbs.GRAB ) {
            if ( dir === Config.opposites[ this.map.hero.dir ] ) {
                this.handleLift( poi, dir );
            }

            return;
        }

        if ( collision.tile ) {
            this.handleTile( poi, dir, collision.tile );

            if ( collision.tile.activeTiles.data.action && stopTiles.indexOf( collision.tile.activeTiles.data.action.verb ) !== -1 ) {
                this.handleTileStop( poi, dir, collision.tile );
                return;
            }

        } else if ( this.camera.speed !== speed ) {
            this.camera.speed = speed;
        }

        if ( this.map.hero.verb === Config.verbs.FACE ) {
            this.map.hero.verb = Config.verbs.WALK;
        }

        this.handleWalk( poi, dir );
    }


    releaseD () {
        if ( this.locked ) {
            return;
        }

        if ( this.interact.push ) {
            this.interact.push = 0;
        }

        if ( this.interact.tile ) {
            this.map.hero.act( this.map.hero.verb, this.map.hero.dir );

        } else {
            this.map.hero.face( this.map.hero.dir );
        }
    }


    pressA ( dir, delta, dirX, dirY ) {
        const poi = this.getPoi( delta, dirX, dirY );
        const collision = this.getCollision( poi );
        const tileActs = [
            Config.verbs.LIFT,
        ];

        if ( collision.obj ) {
            this.handleObjAct( poi, dir, collision.obj );
        }

        if ( collision.tile && collision.tile.activeTiles.data.action && (tileActs.indexOf( collision.tile.activeTiles.data.action.verb ) !== -1) && !this.interact.tile ) {
            this.handleTileAct( poi, dir, collision.tile );
        }
    }


    holdA ( dir, delta, dirX, dirY ) {
        console.log( "A Hold" );
    }


    releaseA () {
        this.dialogue.check( true, false );

        this.handleReleaseA();
    }


    releaseHoldA () {
        this.handleReleaseA();
    }


    handleReleaseA () {
        if ( this.map.hero.verb === Config.verbs.GRAB ) {
            this.map.hero.face( this.map.hero.dir );
        }

        if ( this.map.hero.verb === Config.verbs.LIFT ) {
            if ( this.interact.tile.toss ) {
                this.handleToss();

            } else {
                this.interact.tile.toss = true;
            }

        } else {
            this.interact.tile = null;
        }
    }


    pressB ( dir, delta, dirX, dirY ) {
        const poi = this.getPoi( delta, dirX, dirY );
        const collision = this.getCollision( poi );
        const tileActs = [
            Config.verbs.CUT,
        ];

        if ( collision.tile && collision.tile.activeTiles.data.attack && (tileActs.indexOf( collision.tile.activeTiles.data.attack.verb ) !== -1) ) {
            this.handleTileHit( poi, dir, collision.tile );
        }
    }


    holdB ( dir, delta, dirX, dirY ) {
        console.log( "B Hold" );
    }


    releaseB () {
        this.dialogue.check( false, true );
    }


    releaseHoldB () {
        console.log( "B Hold Release" );
    }


/*******************************************************************************
* Condition Handlers
*******************************************************************************/
    handleWalk ( poi, dir ) {
        this.offset = this.update( poi );
        this.map.update( poi, this.offset );

        if ( this.interact.tile && this.interact.tile.sprite ) {
            this.interact.tile.sprite.update( poi, this.offset );
        }

        if ( this.map.hero.verb !== Config.verbs.LIFT ) {
            this.map.hero.cycle( Config.verbs.WALK, dir );

        } else {
            this.map.hero.cycle( this.map.hero.verb, dir );
        }
    }


    handlePushable ( poi, dir ) {
        this.interact.push++;

        if ( (this.map.hero.verb !== Config.verbs.LIFT) && (this.interact.push > this.map.data.tilesize) ) {
            this.map.hero.cycle( Config.verbs.PUSH, dir );

        } else {
            this.map.hero.cycle( this.map.hero.verb, dir );
        }
    }


    handleMap ( poi, dir ) {
        this.handlePushable( poi, dir );
    }


    handleObj ( poi, dir ) {
        this.handlePushable( poi, dir );
    }


    handleTileStop ( poi, dir, tile ) {
        this.handlePushable( poi, dir );
    }


    handleBox ( poi, dir ) {
        this.map.hero.cycle( this.map.hero.verb, dir );
    }


    handleEvtBoundary ( evt ) {
        this.switchMap( evt );
    }


    handleLift ( poi, dir ) {
        this.locked = true;
        this.map.hero.act( Config.verbs.PULL, dir );
        setTimeout(() => {
            this.player.gameaudio.hitSound( "pickup" );
            this.interact.tile.activeTile = this.map.setActiveTile( this.interact.tile.activeTiles, this.interact.tile.coord );
            this.map.hero.act( Config.verbs.LIFT, dir );
            this.locked = false;

        }, Config.values.debounceDur );
    }


    handleToss () {
        this.map.hero.face( this.map.hero.dir );
        this.player.gameaudio.hitSound( "throw" );
        this.interact.tile.activeTile.toss( this.map.hero.dir ).then(() => {
            this.player.gameaudio.hitSound( "smash" );
            this.interact.tile = null;
        });
    }


    handleTile ( poi, dir, tile ) {
        // Stairs are hard, you have to take it slow...
        if ( tile.activeTiles.data.group === Config.tiles.STAIRS ) {
            this.camera.speed = this.getSpeed() / 2.5;

        // Grass is thick, it will slow you down a bit...
        } else if ( tile.activeTiles.data.group === Config.tiles.GRASS ) {
            this.camera.speed = this.getSpeed() / 1.5;
        }
    }


    handleObjAct ( poi, dir, obj ) {
        if ( obj.canInteract( dir ) ) {
            obj.doInteract( dir );
        }
    }


    handleTileAct ( poi, dir, tile ) {
        if ( tile.activeTiles.canInteract() ) {
            this.interact.tile = tile;

            if ( tile.activeTiles.data.action.verb === Config.verbs.LIFT ) {
                this.map.hero.act( Config.verbs.GRAB, dir );
            }
        }
    }


    handleTileHit ( poi, dir, tile ) {
        if ( tile.activeTiles.canAttack() ) {
            tile.activeTiles.splice( tile.coord );
        }
    }


/*******************************************************************************
* Map Switching
*******************************************************************************/
    switchTween ( obj, css ) {
        return new Promise(( resolve ) => {
            const _update = ( t ) => {
                if ( obj.position ) {
                    obj.position.x = (css.axis === "x" ? t : obj.position.x);
                    obj.position.y = (css.axis === "y" ? t : obj.position.y);
                }

                // Only a Map has a Hero
                if ( obj.hero ) {
                    const transform = Utils.getTransform( obj.element );

                    obj.element.style.webkitTransform = `translate3d(
                        ${css.axis === "x" ? t : transform.x}px,
                        ${css.axis === "y" ? t : transform.y}px,
                        0
                    )`;

                    // Map offset stays static, Hero position updates...
                    obj.update( obj.hero.position, obj.offset );
                }
            };

            return new Tween({
                ease: Easing.swing,
                duration: Config.values.boundaryAnimDur,
                from: css.from,
                to: css.to,
                update: ( t ) => {
                    _update( t );
                },
                complete: ( t ) => {
                    _update( t );
                    resolve();
                }
            });
        });
    }


    switchMap ( evt ) {
        // Pause the Player so no game buttons dispatch
        // Pausing triggers the GameBox to call this.map.hero.face( this.map.hero.dir )
        this.player.pause();

        // Dupe the Hero
        const mapData = Loader.cash( evt.map );
        const heroData = Utils.copy( this.map.hero.data );

        // Create new Map / Camera
        this.map_ = new Map( mapData, heroData, this );
        this.cam_ = Utils.copy( this.camera );

        // Update this.map_.hero
        this.map_.hero.face( this.map.hero.dir );

        // Will be the new Hero position on the new Map
        // const _poi = Utils.copy( this.map.hero.position );

        // Will be the animation values for rendering...
        const _css = {
            map: null,
            map_: null,
            hero: null,
            hero_: null,
        };

        // Stage new Map / new Hero for animation
        if ( this.map.hero.dir === "down" ) {
            // Presets
            this.cam_.y = 0;
            this.map_.offset = {
                x: this.map.offset.x,
                y: 0,
            };
            this.map_.element.style.webkitTransform = `translate3d(
                0,
                ${this.camera.height}px,
                0
            )`;
            this.map_.hero.position = {
                x: this.map.hero.position.x,
                y: -this.map_.hero.height,
            };

            // Animation values
            _css.map_ = {
                axis: "y",
                from: this.camera.height,
                to: 0,
            };
            _css.map = {
                axis: "y",
                from: 0,
                to: -this.camera.height,
            };
            _css.hero_ = {
                axis: "y",
                from: -this.map_.hero.height,
                to: 0,
            };
            _css.hero = {
                axis: "y",
                from: this.map.hero.position.y,
                to: this.map.hero.position.y + this.map.hero.height,
            };

        } else if ( this.map.hero.dir === "up" ) {
            // Presets
            this.cam_.y = this.map_.height - this.camera.height;
            this.map_.offset = {
                x: this.map.offset.x,
                y: -(this.map_.height - this.camera.height),
            };
            this.map_.element.style.webkitTransform = `translate3d(
                0,
                ${-this.camera.height}px,
                0
            )`;
            this.map_.hero.position = {
                x: this.map.hero.position.x,
                y: this.map_.height,
            };

            // Animation values
            _css.map_ = {
                axis: "y",
                from: -this.camera.height,
                to: 0,
            };
            _css.map = {
                axis: "y",
                from: 0,
                to: this.camera.height,
            };
            _css.hero_ = {
                axis: "y",
                from: this.map_.height,
                to: this.map_.height - this.map_.hero.height,
            };
            _css.hero = {
                axis: "y",
                from: this.map.hero.position.y,
                to: this.map.hero.position.y - this.map.hero.height,
            };

        } else if ( this.map.hero.dir === "right" ) {
            // Presets
            this.cam_.x = 0;
            this.map_.offset = {
                x: 0,
                y: this.map.offset.y,
            };
            this.map_.element.style.webkitTransform = `translate3d(
                ${this.camera.width}px,
                0,
                0
            )`;
            this.map_.hero.position = {
                x: -this.map_.hero.width,
                y: this.map.hero.position.y,
            };

            // Animation values
            _css.map_ = {
                axis: "x",
                from: this.camera.width,
                to: 0,
            };
            _css.map = {
                axis: "x",
                from: 0,
                to: -this.camera.width,
            };
            _css.hero_ = {
                axis: "x",
                from: -this.map_.hero.width,
                to: 0,
            };
            _css.hero = {
                axis: "x",
                from: this.map.hero.position.x,
                to: this.map.hero.position.x + this.map.hero.width,
            };

        } else if ( this.map.hero.dir === "left" ) {
            // Presets
            this.cam_.x = this.map_.width - this.camera.width;
            this.map_.offset = {
                x: -(this.map_.width - this.camera.width),
                y: this.map.offset.y,
            };
            this.map_.element.style.webkitTransform = `translate3d(
                ${-this.camera.width}px,
                0,
                0
            )`;
            this.map_.hero.position = {
                x: this.map_.width,
                y: this.map.hero.position.y,
            };

            // Animation values
            _css.map_ = {
                axis: "x",
                from: -this.camera.width,
                to: 0,
            };
            _css.map = {
                axis: "x",
                from: 0,
                to: this.camera.width,
            };
            _css.hero_ = {
                axis: "x",
                from: this.map_.width,
                to: this.map_.width - this.map_.hero.width,
            };
            _css.hero = {
                axis: "x",
                from: this.map.hero.position.x,
                to: this.map.hero.position.x - this.map.hero.width,
            };
        }

        // Set pre-animation offset for map AND hero
        // this.map_.update( this.map_hero.position, this.map_.offset );

        // Inject the new Map element into the DOM
        this.player.screen.appendChild( this.map_.element );

        // Animate Maps and Hero and resolve all tweens for clean-up
        Promise.all([
            // New Map, New Hero
            this.switchTween( this.map_, _css.map_ ),
            this.switchTween( this.map_.hero, _css.hero_ ),

            // Old Map, Old Hero
            this.switchTween( this.map, _css.map ),
            this.switchTween( this.map.hero, _css.hero ),

        ]).then(() => {
            setTimeout(() => {
                // Set new Hero with props (backfill relevant attributes)

                // Destroy old Map / Set new Map
                this.map.destroy();
                this.map = this.map_;
                this.map_ = null;
                this.cam_ = null;

                // Initialize
                this.initMap();

                // Resume game blit cycle...
                this.player.resume();

            }, Config.values.debounceDur );
        });
    }
}



module.exports = {
    GameBox,
    TopView,
};
