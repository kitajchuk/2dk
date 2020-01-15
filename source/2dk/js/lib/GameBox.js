const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const Dialogue = require( "./Dialogue" );
const { Map } = require( "./Map" );
const { Hero } = require( "./Sprite" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );



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
            speed: 256 / (this.player.data.hero.scale || this.player.data.game.resolution),
        };

        // Map
        this.map = new Map( Loader.cash( this.player.data.hero.spawn.map ), this );

        // Map switch
        this.map_ = null;

        // Hero
        this.hero = new Hero( this.player.data.hero, this );

        // Dialogues
        this.dialogue = new Dialogue();

        this.build();
        this.initMap();
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
        if ( this.map_ ) {
            this.map_.render( elapsed );
        }

        this.map.render( elapsed );
        this.hero.render( elapsed );
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


    // pressD ( dir, delta, dirX, dirY ) {}
    // releaseD () {}
    // pressA () {}
    // pressB () {}
    // holdB () {}
}



class TopView extends GameBox {
    constructor ( player ) {
        super( player );
    }


/*******************************************************************************
* GamePad Inputs
*******************************************************************************/
    pressD ( dir, delta, dirX, dirY ) {
        const poi = {
            x: this.hero.position.x + (dirX * this.camera.speed * delta),
            y: this.hero.position.y + (dirY * this.camera.speed * delta),
        };
        const collision = {
            evt: this.checkEvt( poi ),
            map: this.checkMap( poi, this.hero ),
            box: this.checkBox( poi ),
            obj: this.checkObj( poi ),
            tile: this.checkTile( poi ),
        };

        if ( collision.evt ) {
            this.handleEvt( collision.evt );
            return;
        }

        if ( collision.obj ) {
            this.handleObj( collision.obj, dir );
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
            this.handleTile( collision.tile );
        }

        this.handleWalk( poi, dir );
    }


    releaseD () {
        this.hero.face( this.hero.dir );
    }


    pressA ( dir, delta, dirX, dirY ) {
        const poi = {
            x: this.hero.position.x + (dirX * this.camera.speed * delta),
            y: this.hero.position.y + (dirY * this.camera.speed * delta),
        };
        const collision = {
            obj: this.checkObj( poi ),
        };

        if ( collision.obj ) {
            this.handleActObj( collision.obj, dir );
        }

        this.dialogue.check( true, false );
    }


    pressB () {
        this.dialogue.check( false, true );
    }


    holdB () {
        console.log( "B Hold" );
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
        this.hero.cycle( Config.verbs.PUSH, dir );
    }


    handleEvt ( evt ) {
        if ( evt.type === Config.events.BOUNDARY ) {
            this.switchMap( evt );
        }
    }


    handleObj ( obj, dir ) {
        this.hero.cycle( Config.verbs.WALK, dir );
    }


    handleActObj ( obj, dir ) {
        if ( obj.canInteract( dir ) ) {
            obj.doInteract( dir );
        }
    }


    handleTile ( tile ) {
        // console.log( tile );
    }


    handleBox ( poi, dir ) {
        this.hero.cycle( Config.verbs.WALK, dir );
    }


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
        const hitbox = this.hero.getHitbox( poi );

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
        let ret = false;
        const hitbox = this.hero.getHitbox( poi );

        loop1:
            for ( let i = this.map.activeTiles.length; i--; ) {
                loop2:
                    for ( let j = this.map.activeTiles[ i ].data.coords.length; j--; ) {
                        const tile = {
                            width: this.map.gridsize,
                            height: this.map.gridsize,
                            x: this.map.activeTiles[ i ].data.coords[ j ][ 0 ] * this.map.gridsize,
                            y: this.map.activeTiles[ i ].data.coords[ j ][ 1 ] * this.map.gridsize
                        };

                        if ( Utils.collide( hitbox, tile ) ) {
                            ret = tile;
                            break loop1;
                        }
                    }
            }

        return ret;
    }


/*******************************************************************************
* Map Switching
*******************************************************************************/
    switchTween ( obj, css ) {
        return new Promise(( resolve ) => {
            return new Tween({
                ease: Easing.swing,
                duration: Config.values.boundaryAnimDur,
                from: css.from,
                to: css.to,
                update: ( t ) => {
                    obj.offset[ css.axis ] = t;
                    obj.render( this.player.previousElapsed );
                },
                complete: ( t ) => {
                    obj.offset[ css.axis ] = t;
                    obj.render( this.player.previousElapsed );
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

        // Stage Hero for animation
        let _hero = this.hero.position;
        const _css = {};
        const _rect = {
            hero: this.hero.element.getBoundingClientRect(),
            screen: this.player.screen.getBoundingClientRect(),
        };

        this.hero.offset = {
            x: _rect.hero.x,
            y: _rect.hero.y,
        };
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
                y: this.player.height,
            };

            _css.newMap = {
                axis: "y",
                from: this.map_.offset.y,
                to: 0,
            };

            _css.thisMap = {
                axis: "y",
                from: this.map.offset.y,
                to: -(this.map.height),
            };

            _css.hero = {
                axis: "y",
                from: _rect.hero.y,
                to: _rect.screen.y,
            };

            _hero = {
                x: _hero.x,
                y: 0,
            };

        } else if ( this.hero.dir === "up" ) {
            this.map_.offset = {
                x: this.map.offset.x,
                y: -(this.map_.height),
            };

            _css.newMap = {
                axis: "y",
                from: this.map_.offset.y,
                to: -(this.map_.height - this.player.height),
            };

            _css.thisMap = {
                axis: "y",
                from: this.map.offset.y,
                to: this.player.height,
            };

            _css.hero = {
                axis: "y",
                from: _rect.hero.y,
                to: _rect.screen.y + _rect.screen.height - this.hero.height,
            };

            _hero = {
                x: _hero.x,
                y: this.map_.height - this.hero.height,
            };

        } else if ( this.hero.dir === "right" ) {
            this.map_.offset = {
                x: this.player.width,
                y: this.map.offset.y,
            };

            _css.newMap = {
                axis: "x",
                from: this.map_.offset.x,
                to: 0,
            };

            _css.thisMap = {
                axis: "x",
                from: this.map.offset.x,
                to: -(this.map.width),
            };

            _css.hero = {
                axis: "x",
                from: _rect.hero.x,
                to: _rect.screen.x,
            };

            _hero = {
                x: 0,
                y: _hero.y,
            };

        } else if ( this.hero.dir === "left" ) {
            this.map_.offset = {
                x: -(this.map_.width),
                y: this.map.offset.y,
            };

            _css.newMap = {
                axis: "x",
                from: this.map_.offset.x,
                to: -(this.map_.width - this.player.width),
            };

            _css.thisMap = {
                axis: "x",
                from: this.map.offset.x,
                to: this.player.width,
            };

            _css.hero = {
                axis: "x",
                from: _rect.hero.x,
                to: _rect.screen.x + _rect.screen.width - this.hero.width,
            };

            _hero = {
                x: this.map_.width - this.hero.width,
                y: _hero.y,
            };
        }

        // Inject new Map into the player DOM
        this.player.screen.appendChild( this.map_.element );

        // Animate Maps and Hero and resolve all tweens for clean-up
        Promise.all([
            this.switchTween( this.map_, _css.newMap ),
            this.switchTween( this.map, _css.thisMap ),
            this.switchTween( this.hero, _css.hero ),

        ]).then(() => {
            // Stage Hero with correct position on new Map
            this.hero.element.style.position = "absolute";
            this.hero.update( _hero, this.map_.offset );
            this.hero.render( this.player.previousElapsed );
            this.map_.element.appendChild( this.hero.element );

            // Destroy old Map
            // Teardown GameBox stuff (npcs, etc...)
            this.map.destroy();
            this.map = this.map_;
            this.map_ = null;

            // Initialize GameBox stuff (npcs, etc...)
            this.initMap();
            this.player.resume();
        });
    }
}



module.exports = {
    GameBox,
    TopView,
};
