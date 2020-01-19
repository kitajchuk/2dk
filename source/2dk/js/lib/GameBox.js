const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const Dialogue = require( "./Dialogue" );
const { Map } = require( "./Map" );
const { Hero, NPC } = require( "./Sprite" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );
const stopTiles = [
    Config.verbs.GRAB,
    Config.verbs.MOVE,
    Config.verbs.LIFT,
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
        this.interact = {};
        this.debounce = 1024;

        // Map
        this.map = new Map( Loader.cash( this.player.data.hero.spawn.map ), this );

        // Map switch
        this.map_ = null;
        this.cam_ = null;

        // Hero
        this.hero = new Hero( this.player.data.hero, this );

        // NPCs
        this.npcs = [];

        // Dialogues
        this.dialogue = new Dialogue();

        this.build();
        this.initMap();
        // this.initNPC();
    }


    build () {
        this.map.element.appendChild( this.hero.element );
        this.player.screen.appendChild( this.map.element );
        this.player.screen.appendChild( this.dialogue.element );
    }


    initMap () {
        this.offset = this.update( this.hero.position );
        this.map.update( this.offset );
        this.hero.update( this.hero.position, this.offset );
        this.player.gameaudio.addSound({
            id: this.map.data.id,
            src: this.map.data.sound,
            channel: "bgm",
        });
    }


    // initNPC () {
    //     this.map.data.objects.forEach(( npc ) => {
    //         npc = new NPC( Utils.merge( this.player.data.objects.find( ( obj ) => (obj.id === npc.id) ), npc ), this );
    //
    //         this.map.element.appendChild( npc.element );
    //
    //         this.npcs.push( npc );
    //     });
    // }


    // killNPC () {
    //     this.npcs.forEach(( npc ) => {
    //         npc.destroy();
    //         npc = null;
    //     });
    //
    //     this.npcs = [];
    // }


    pause ( paused ) {
        if ( paused ) {
            this.hero.face( this.hero.dir );
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
        this.hero.render( elapsed );
        // this.npcs.forEach(( npc ) => {
        //     npc.update( this.hero.position, this.offset );
        //     npc.render( elapsed );
        // });
    }


    getSpeed () {
        return this.player.width * 0.333333;
    }


    getPoi ( delta, dirX, dirY ) {
        return {
            x: this.hero.position.x + (dirX * this.camera.speed * delta),
            y: this.hero.position.y + (dirY * this.camera.speed * delta),
        }
    }


    getCollision ( poi ) {
        return {
            evt: this.checkEvt( poi ),
            map: this.checkMap( poi, this.hero ),
            box: this.checkBox( poi ),
            obj: this.checkObj( poi ),
            // npc: this.checkNPC( poi ),
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
* Can all be handled in TopView or other play style Box
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

        if ( poi.x <= this.camera.x || poi.x >= (this.camera.x + this.camera.width - this.hero.width) ) {
            ret = true;
        }

        if ( poi.y <= this.camera.y || poi.y >= (this.camera.y + this.camera.height - this.hero.height) ) {
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
            width: this.hero.width,
            height: this.hero.height,
            x: this.hero.position.x,
            y: this.hero.position.y,
        };

        for ( let i = this.map.data.events.length; i--; ) {
            const tile = {
                width: this.map.gridsize,
                height: this.map.gridsize,
                x: this.map.data.events[ i ].coords[ 0 ] * this.map.gridsize,
                y: this.map.data.events[ i ].coords[ 1 ] * this.map.gridsize
            };

            if ( Utils.collide( hitbox, tile ) && this.hero.dir === this.map.data.events[ i ].dir ) {
                ret = this.map.data.events[ i ];
                break;
            }
        }

        return ret;
    }


    // awareNPC ( poi ) {
    //     for ( let i = this.npcs.length; i--; ) {
    //         this.npcs[ i ].checkHero( poi );
    //         this.npcs[ i ].checkCamera( poi );
    //     }
    // }


    // checkNPC ( poi ) {
    //     let ret = null;
    //     const hitbox = this.hero.getHitbox( poi );
    //
    //     for ( let i = this.npcs.length; i--; ) {
    //         const hitnpc = this.npcs[ i ].getHitbox( this.npcs[ i ].position );
    //
    //         if ( Utils.collide( hitbox, hitnpc ) ) {
    //             ret = this.npcs[ i ];
    //             break;
    //         }
    //     }
    //
    //     return ret;
    // }


    checkObj ( poi ) {
        let ret = false;
        const hitbox = this.hero.getHitbox( poi );

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
        const footbox = this.hero.getFootbox( poi );

        for ( let i = this.map.activeTiles.length; i--; ) {
            for ( let j = this.map.activeTiles[ i ].data.coords.length; j--; ) {
                const tile = this.map.activeTiles[ i ];
                const tilebox = {
                    width: this.map.gridsize,
                    height: this.map.gridsize,
                    x: tile.data.coords[ j ][ 0 ] * this.map.gridsize,
                    y: tile.data.coords[ j ][ 1 ] * this.map.gridsize
                };

                if ( Utils.collide( footbox, tilebox ) ) {
                    tiles.push({
                        activeTile: tile,
                        activeCoord: tile.data.coords[ j ],
                    });
                }
            }
        }

        if ( tiles.length === 1 ) {
            return tiles[ 0 ];
        }

        // If there's no action tile, return one tile...
        return (tiles.find(( tile ) => {
            return tile.activeTile.data.action || tile.activeTile.data.attack;

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

        if ( collision.evt ) {
            if ( collision.evt.type === Config.events.BOUNDARY && collision.box ) {
                this.handleEvtBoundary( collision.evt );
                return;
            }
        }

        // this.awareNPC( poi );
        //
        // if ( collision.npc ) {
        //     this.handleNPC( poi, dir, collision.npc );
        //     return;
        // }

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

        if ( collision.tile ) {
            this.handleTile( poi, dir, collision.tile );

            if ( collision.tile.activeTile.data.action && stopTiles.indexOf( collision.tile.activeTile.data.action.verb ) !== -1 ) {
                this.hero.cycle( Config.verbs.WALK, dir );
                return;
            }

        } else if ( this.camera.speed !== speed ) {
            this.camera.speed = speed;
        }

        this.handleWalk( poi, dir );
    }


    releaseD () {
        this.hero.face( this.hero.dir );
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

        if ( collision.tile && collision.tile.activeTile.data.action && (tileActs.indexOf( collision.tile.activeTile.data.action.verb ) !== -1) && !this.interact.tile ) {
            this.handleTileAct( poi, dir, collision.tile );
        }
    }


    holdA ( dir, delta, dirX, dirY ) {
        console.log( "A Hold" );
    }


    releaseA () {
        this.interact.tile = false;
        this.dialogue.check( true, false );
    }


    releaseHoldA () {
        console.log( "A Hold Release" );
    }


    pressB ( dir, delta, dirX, dirY ) {
        const poi = this.getPoi( delta, dirX, dirY );
        const collision = this.getCollision( poi );
        const tileActs = [
            Config.verbs.CUT,
        ];

        if ( collision.tile && collision.tile.activeTile.data.attack && (tileActs.indexOf( collision.tile.activeTile.data.attack.verb ) !== -1) ) {
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
        this.map.update( this.offset );
        this.hero.update( poi, this.offset );
        this.hero.cycle( Config.verbs.WALK, dir );
    }


    handleMap ( poi, dir ) {
        this.hero.cycle( Config.verbs.WALK, dir );
    }


    handleNPC ( npc, dir ) {
        this.hero.cycle( Config.verbs.WALK, dir );
    }


    handleObj ( obj, dir ) {
        this.hero.cycle( Config.verbs.WALK, dir );
    }


    handleObjAct ( poi, dir, obj ) {
        if ( obj.canInteract( dir ) ) {
            obj.doInteract( dir );
        }
    }


    handleTile ( poi, dir, tile ) {
        // Stairs are hard, you have to take it slow...
        if ( tile.activeTile.data.group === Config.tiles.STAIRS ) {
            this.camera.speed = this.getSpeed() / 2.5;

        // Grass is thick, it will slow you down a bit...
        } else if ( tile.activeTile.data.group === Config.tiles.GRASS ) {
            this.camera.speed = this.getSpeed() / 1.5;
        }

        // console.log( "ActiveTile", tile );
    }


    handleTileAct ( poi, dir, tile ) {
        if ( tile.activeTile.canInteract() ) {
            this.interact.tile = true;
            tile.activeTile.doInteract( tile.activeCoord );
        }
    }


    handleTileHit ( poi, dir, tile ) {
        if ( tile.activeTile.canAttack() ) {
            tile.activeTile.doInteract( tile.activeCoord );
        }
    }


    handleBox ( poi, dir ) {
        this.hero.cycle( Config.verbs.WALK, dir );
    }


    handleEvtBoundary ( evt ) {
        this.switchMap( evt );
    }


/*******************************************************************************
* Map Switching
*******************************************************************************/
    switchTween ( obj, css ) {
        return new Promise(( resolve ) => {
            const _update = ( t ) => {
                const transform = Utils.getTransform( obj.element );

                obj.element.style.webkitTransform = `translate3d(
                    ${css.axis === "x" ? t : transform.x}px,
                    ${css.axis === "y" ? t : transform.y}px,
                    0
                )`;
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
        // Stop player, this is a HARD stop!
        // Player can only come back online with .resume()
        this.player.stop();

        // Create new Map
        this.map_ = new Map( Loader.cash( evt.map ), this );
        this.cam_ = Utils.copy( this.camera );

        const _css = {};
        const _poi = Utils.copy( this.hero.position );
        const _rect = {
            hero: this.hero.element.getBoundingClientRect(),
            screen: this.player.screen.getBoundingClientRect(),
        };

        // Stage Hero for animation
        document.body.appendChild( this.hero.element );
        this.hero.element.style.position = "fixed";
        this.hero.element.style.webkitTransform = `translate3d(
            ${_rect.hero.x}px,
            ${_rect.hero.y}px,
            0
        )`;

        // Stage new Map for animation
        if ( this.hero.dir === "down" ) {
            this.map_.offset = {
                x: this.map.offset.x,
                y: 0,
            };
            this.cam_.y = 0;
            this.map_.element.style.webkitTransform = `translate3d(
                0,
                ${this.camera.height}px,
                0
            )`;

            _poi.y = 0;
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
            _css.hero = {
                axis: "y",
                from: _rect.hero.y,
                to: _rect.screen.y,
            };

        } else if ( this.hero.dir === "up" ) {
            this.map_.offset = {
                x: this.map.offset.x,
                y: -(this.map_.height - this.camera.height),
            };
            this.cam_.y = this.map_.height - this.camera.height;
            this.map_.element.style.webkitTransform = `translate3d(
                0,
                ${-this.camera.height}px,
                0
            )`;

            _poi.y = this.map_.height - this.hero.height;
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
            _css.hero = {
                axis: "y",
                from: _rect.hero.y,
                to: _rect.screen.y + _rect.screen.height - this.hero.height,
            };

        } else if ( this.hero.dir === "right" ) {
            this.map_.offset = {
                x: 0,
                y: this.map.offset.y,
            };
            this.cam_.x = 0;
            this.map_.element.style.webkitTransform = `translate3d(
                ${this.camera.width}px,
                0,
                0
            )`;

            _poi.x = 0;
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
            _css.hero = {
                axis: "x",
                from: _rect.hero.x,
                to: _rect.screen.x,
            };

        } else if ( this.hero.dir === "left" ) {
            this.map_.offset = {
                x: -(this.map_.width - this.camera.width),
                y: this.map.offset.y,
            };
            this.cam_.x = this.map_.width - this.camera.width;
            this.map_.element.style.webkitTransform = `translate3d(
                ${-this.camera.width}px,
                0,
                0
            )`;

            _poi.x = this.map_.width - this.hero.width;
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
            _css.hero = {
                axis: "x",
                from: _rect.hero.x,
                to: _rect.screen.x + _rect.screen.width - this.hero.width,
            };
        }

        // One-time initial render based on the camera we'll end up with
        // after the transition is complete and the new Map becomes THE Map.
        this.map_.render( this.player.previousElapsed, this.cam_ );
        this.player.screen.appendChild( this.map_.element );

        // Animate Maps and Hero and resolve all tweens for clean-up
        Promise.all([
            this.switchTween( this.map_, _css.map_ ),
            this.switchTween( this.map, _css.map ),
            this.switchTween( this.hero, _css.hero ),

        ]).then(() => {
            setTimeout(() => {
                // Stage Hero with correct position on new Map
                this.hero.element.style.position = "absolute";
                this.map_.element.appendChild( this.hero.element );
                this.hero.update( _poi, this.map_.offset );
                this.hero.render( this.player.previousElapsed );

                // Destroy old Map / Set new Map
                // this.killNPC();
                this.map.destroy();
                this.map = this.map_;
                this.map_ = null;
                this.cam_ = null;

                // Initialize
                this.initMap();
                // this.initNPC();
                this.player.resume();

            }, Config.values.debounceDur );
        });
    }
}



module.exports = {
    GameBox,
    TopView,
};
