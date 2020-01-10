const Utils = require( "./Utils" );
const Config = require( "./Config" );
const Loader = require( "./Loader" );
const { Map } = require( "./Map" );
const { Hero } = require( "./Sprite" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );



class GameBox {
    constructor ( player ) {
        this.player = player;
        this.offset = {
            x: 0,
            y: 0,
        };
        this.camera = {
            x: 0,
            y: 0,
            width: this.player.width,
            height: this.player.height,
            speed: 128,
        };

        // Hero
        this.hero = new Hero( this.player.data.hero, this );

        // Map
        this.map = new Map( Loader.cash( this.hero.data.spawn.map ), this );

        this.build();
        this.initMap();
    }


    build () {
        this.map.addSprite( this.hero );
        this.player.screen.appendChild( this.map.element );
    }

    initMap () {
        this.offset = this.update( this.hero.position );
        this.map.update( this.offset );
        this.hero.update( this.hero.position, this.offset );
    }


    pause ( paused ) {
        if ( paused ) {
            this.hero.face( this.hero.dir );
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


    pressD () {}


    pressA () {}


    pressB () {}


    longPressB () {}


    releaseD () {}


    releaseA () {}


    releaseB () {}


    longReleaseB () {}
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
        };

        if ( collision.evt ) {
            this.handleEvt( collision.evt );
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

        this.handleWalk( poi, dir );
    }


    releaseD () {
        this.hero.face( this.hero.dir );
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


    handleEvt ( evt ) {
        if ( evt.type === Config.events.BOUNDARY ) {
            this.switchMap( evt );
        }
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
            const collider = this.map.data.collider / this.map.data.resolution;
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
                width: this.map.data.gridsize,
                height: this.map.data.gridsize,
                x: this.map.data.events[ i ].coords[ 0 ] * this.map.data.gridsize,
                y: this.map.data.events[ i ].coords[ 1 ] * this.map.data.gridsize
            };

            if ( Utils.collide( hitbox, tile ) && this.hero.dir === this.map.data.events[ i ].dir ) {
                ret = this.map.data.events[ i ];
                break;
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
                duration: Config.animation.duration.boundary,
                from: css.from,
                to: css.to,
                update: ( t ) => {
                    obj.offset[ css.axis ] = t;
                    obj.render();
                },
                complete: ( t ) => {
                    obj.offset[ css.axis ] = t;
                    obj.render();
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
        const _map = new Map( Loader.cash( evt.map ), this );

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
            _map.offset = {
                x: this.map.offset.x,
                y: this.player.height,
            };

            _css.newMap = {
                axis: "y",
                from: _map.offset.y,
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
            _map.offset = {
                x: this.map.offset.x,
                y: -(_map.height),
            };

            _css.newMap = {
                axis: "y",
                from: _map.offset.y,
                to: -(_map.height - this.player.height),
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
                y: _map.height - this.hero.height,
            };

        } else if ( this.hero.dir === "right" ) {
            _map.offset = {
                x: this.player.width,
                y: this.map.offset.y,
            };

            _css.newMap = {
                axis: "x",
                from: _map.offset.x,
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
            _map.offset = {
                x: -(_map.width),
                y: this.map.offset.y,
            };

            _css.newMap = {
                axis: "x",
                from: _map.offset.x,
                to: -(_map.width - this.player.width),
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
                x: _map.width - this.hero.width,
                y: _hero.y,
            };
        }

        // Render new Map (this uses _map.offset)
        _map.render();

        // Inject new Map into the player DOM
        this.player.screen.appendChild( _map.element );

        // Animate Maps and Hero and resolve all tweens for clean-up
        Promise.all([
            this.switchTween( _map, _css.newMap ),
            this.switchTween( this.map, _css.thisMap ),
            this.switchTween( this.hero, _css.hero ),

        ]).then(() => {
            // Stage Hero with correct position on new Map
            // this.hero.offset = {
            //     x: _hero.x,
            //     y: _hero.y,
            // };
            this.hero.element.style.position = "absolute";
            this.hero.update( _hero, _map.offset );
            _map.addSprite( this.hero );

            // Destroy old Map
            // Teardown GameBox stuff (npcs, etc...)
            this.map.destroy();
            this.map = _map;

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
