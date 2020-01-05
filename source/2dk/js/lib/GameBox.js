const Config = require( "./Config" );
const Loader = require( "./Loader" );
const GameSFX = require( "./GameSFX" );
const { Map } = require( "./Map" );
const { Hero, NPC } = require( "./Sprite" );
const { TweenLite } = require( "gsap" );



class GameBox {
    constructor ( player ) {
        this.loader = new Loader();
        this.player = player;
        this.step = Config.values.step;
        this.transform = {
            x: 0,
            y: 0
        };

        // Teardown stuff
        this.npcs = [];

        // SFX
        this.gamesfx = new GameSFX( this );

        // Hero
        this.hero = new Hero( this.player.data.hero, this );

        // Map
        this.loader.loadUrl( this.hero.data.spawn.map ).then(( data ) => {
            this.map = new Map( data, this );
            this.mapbounds = {
                top: 0,
                bottom: this.map.height - this.player.height,
                left: 0,
                right: this.map.width - this.player.width,
            };
            this.playbox = {
                top: 0,
                bottom: this.map.height - this.hero.height,
                left: 0,
                right: this.map.width - this.hero.width,
            };

            this.hero.load().then(() => {
                this.map.load().then(() => {
                    this.build();
                    this.initMap();
                });
            });
        });
    }

    initMap () {
        this.transform = this.update( this.hero.offset );
        this.map.init( this.transform );
        this.gamesfx.addSound({
            id: this.map.data.id,
            src: this.map.data.sound,
            props: {
                loop: true,
                volume: 0.25,
            },
        });
        this.map.data.objects.forEach(( data ) => {
            const npc = new NPC( data, this );

            this.npcs.push( npc );
        });
    }


    teardown () {
        this.map.destroy();
        this.npcs.forEach(( npc ) => {
            npc.destroy();
            npc = null;
        });
        this.npcs = [];
    }


    build () {
        this.screen = document.createElement( "div" );
        this.screen.className = `_2dk__screen`;

        if ( this.player.data.game.fullscreen ) {
            this.screen.style.width = "100%";
            this.screen.style.height = "100%";

        } else {
            this.screen.style.width = `${this.player.width}px`;
            this.screen.style.height = `${this.player.height}px`;
        }

        this.map.addSprite( this.hero );
        this.screen.appendChild( this.map.element );
        this.player.element.appendChild( this.screen );
    }


    pause ( paused ) {
        if ( paused ) {
            this.hero.face( this.hero.dir );
            this.gamesfx.stopSound( this.map.data.id );

        } else {
            this.gamesfx.playSound( this.map.data.id );
        }

        this.npcs.forEach(( npc ) => {
            npc.pause( paused );
        });
    }


    collide ( box1, box2 ) {
        let ret = false;

        if ( box1.x < box2.x + box2.width && box1.x + box1.width > box2.x && box1.y < box2.y + box2.height && box1.height + box1.y > box2.y ) {
            ret = true;
        }

        return ret;
    }


    update ( poi ) {
        const x = ( poi.x - (this.player.width / 2) );
        const y = ( poi.y - (this.player.height / 2) );
        const transform = {};

        if ( x >= this.mapbounds.left && x <= this.mapbounds.right ) {
            transform.x = -x;

        } else {
            if ( x >= this.mapbounds.right ) {
                transform.x = -this.mapbounds.right;

            } else {
                transform.x = 0;
            }
        }

        if ( y >= this.mapbounds.top && y <= this.mapbounds.bottom ) {
            transform.y = -y;

        } else {
            if ( y >= this.mapbounds.bottom ) {
                transform.y = -this.mapbounds.bottom;

            } else {
                transform.y = 0;
            }
        }

        return transform;
    }


    pressD ( dir ) {
        const poi = this.getPoi( dir, Config.values.step );
        const collision = {
            evt: this.checkEvt( poi ),
            npc: this.checkNPC( poi ),
            map: this.checkMap( poi ),
            box: this.checkBox( poi ),
        };

        // Stuff that should stop everything!!!
        if ( collision.evt ) {
            this.handleEvt( collision.evt );
            return;
        }

        // Stuff that should always happen during Hero movement
        this.awareNPC( poi );

        // Stuff that should only happen if conditions are met
        if ( collision.npc ) {
            collision.npc.checkAct( poi, false );
            return;

        } else if ( collision.map || collision.box ) {
            this.hero.cycle( dir );
            return;
        }

        const transform = this.update( poi );

        this.hero.move( dir, poi );
        this.hero.cycle( dir );
        this.map.move( dir, transform );
    }


    releaseD ( dir ) {
        this.hero.face( dir );
    }


    pressA () {
        const poi = this.getPoi( this.hero.dir, Config.values.step );
        const npc = this.checkNPC( poi );

        if ( npc ) {
            npc.checkAct( poi, true );
        }

        this.hero.checkDialogue( true, false );
    }


    pressB () {
        this.hero.checkDialogue( false, true );
    }


    getPoi ( dir, step ) {
        const poi = {};

        if ( dir === "left" ) {
            poi.x = this.hero.offset.x - step;
            poi.y = this.hero.offset.y;
        }

        if ( dir === "right" ) {
            poi.x = this.hero.offset.x + step;
            poi.y = this.hero.offset.y;
        }

        if ( dir === "up" ) {
            poi.x = this.hero.offset.x;
            poi.y = this.hero.offset.y - step;
        }

        if ( dir === "down" ) {
            poi.x = this.hero.offset.x;
            poi.y = this.hero.offset.y + step;
        }

        return poi;
    }


    handleEvt ( evt ) {
        if ( evt.type === Config.events.BOUNDARY ) {
            this.switchMap( evt );
        }
    }


    checkEvt ( poi ) {
        let ret = false;
        const hitbox = this.hero.getBox( poi, "hit" );

        for ( let i = this.map.data.events.length; i--; ) {
            const tile = {
                width: this.map.data.gridsize,
                height: this.map.data.gridsize,
                x: this.map.data.events[ i ].coords[ 0 ] * this.map.data.gridsize,
                y: this.map.data.events[ i ].coords[ 1 ] * this.map.data.gridsize
            };

            if ( this.collide( hitbox, tile ) && this.hero.dir === this.map.data.events[ i ].dir ) {
                ret = this.map.data.events[ i ];
                break;
            }
        }

        return ret;
    }


    awareNPC ( poi ) {
        for ( let i = this.npcs.length; i--; ) {
            this.npcs[ i ].checkPoi( poi );
            this.npcs[ i ].checkBox( poi );
        }
    }


    checkNPC ( poi ) {
        let ret = null;
        const hitbox = this.hero.getBox( poi, "collision" );

        for ( let i = this.npcs.length; i--; ) {
            const hitnpc = this.npcs[ i ].getBox( this.npcs[ i ].offset, "collision" );

            if ( this.collide( hitbox, hitnpc ) ) {
                ret = this.npcs[ i ];
                break;
            }
        }

        return ret;
    }


    checkBox ( poi ) {
        let ret = false;

        if ( poi.x <= this.playbox.left || poi.x >= this.playbox.right ) {
            ret = true;
        }

        if ( poi.y <= this.playbox.top || poi.y >= this.playbox.bottom ) {
            ret = true;
        }

        return ret;
    }


    checkMap ( poi ) {
        let ret = false;
        const hitbox = this.hero.getBox( poi, "collision" );

        for ( let i = this.map.data.collision.length; i--; ) {
            const collider = this.map.data.collider / this.map.data.resolution;
            const tile = {
                width: collider,
                height: collider,
                x: this.map.data.collision[ i ][ 0 ] * collider,
                y: this.map.data.collision[ i ][ 1 ] * collider
            };

            if ( this.collide( hitbox, tile ) ) {
                ret = true;
                break;
            }
        }

        return ret;
    }


    switchMap ( evt ) {
        // Stop player, this is a HARD stop!
        // Player can only come back online with .resume()
        this.player.stop();
        this.loader.loadUrl( evt.map ).then(( data ) => {
            // Create new Map
            const _map = new Map( data, this );

            // Determine new Map mapbounds & playbox
            const _mapbounds = {
                top: 0,
                bottom: _map.height - this.player.height,
                left: 0,
                right: _map.width - this.player.width,
            };
            const _playbox = {
                top: 0,
                bottom: _map.height - this.hero.height,
                left: 0,
                right: _map.width - this.hero.width,
            };

            // Load new Map
            _map.load().then(() => {
                const _css = {};
                const _tween = {};
                const _rect = {
                    hero: this.hero.element.getBoundingClientRect(),
                    screen: this.screen.getBoundingClientRect(),
                };
                const _offsetHero = {};

                // Position new Map
                if ( this.hero.dir === "down" ) {
                    _map.offset = {
                        x: this.map.offset.x,
                        y: this.map.offset.y + _map.height,
                    };

                    _css.newMap = {
                        y: 0,
                    };
                    _css.thisMap = {
                        y: this.map.offset.y - _map.offset.y,
                    };
                    _css.hero = {
                        y: _rect.screen.y,
                    };
                    _offsetHero.y = 0;
                    _offsetHero.x = this.hero.offset.x;

                } else if ( this.hero.dir === "up" ) {
                    _map.offset = {
                        x: this.map.offset.x,
                        y: this.map.offset.y - _map.height,
                    };

                    _css.newMap = {
                        y: _map.offset.y + _rect.screen.height,
                    };
                    _css.thisMap = {
                        y: this.map.offset.y + _rect.screen.height,
                    };
                    _css.hero = {
                        y: _rect.screen.y + _rect.screen.height - this.hero.height,
                    };

                    _offsetHero.y = _map.height - this.hero.height;
                    _offsetHero.x = this.hero.offset.x;

                } else if ( this.hero.dir === "right" ) {
                    _map.offset = {
                        x: this.map.offset.x + _map.width,
                        y: this.map.offset.y,
                    };

                    _css.newMap = {
                        x: 0,
                    };
                    _css.thisMap = {
                        x: this.map.offset.x - _map.offset.x,
                    };
                    _css.hero = {
                        x: _rect.screen.x,
                    };
                    _offsetHero.x = 0;
                    _offsetHero.y = this.hero.offset.y;

                } else if ( this.hero.dir === "left" ) {
                    _map.offset = {
                        y: this.map.offset.y,
                        x: this.map.offset.x - _map.width,
                    };

                    _css.newMap = {
                        x: _map.offset.x + _rect.screen.width,
                    };
                    _css.thisMap = {
                        x: this.map.offset.x + _rect.screen.width,
                    };
                    _css.hero = {
                        x: _rect.screen.x + _rect.screen.width - this.hero.width,
                    };

                    _offsetHero.x = _map.width - this.hero.width;
                    _offsetHero.y = this.hero.offset.y;
                }

                _map.render();

                // Transition old Map to new Map (Hero re-position, newMap.addSprite(this.hero))
                this.screen.appendChild( _map.element );
                this.player.element.appendChild( this.hero.element );
                this.hero.element.style.position = "fixed";
                this.hero.element.style.webkitTransform = `translate3d(
                    ${_rect.hero.x}px,
                    ${_rect.hero.y}px,
                    0
                )`;

                _tween.hero = TweenLite.to(
                    this.hero.element,
                    Config.animation.duration.boundary,
                    {
                        css: _css.hero,
                    }
                );

                _tween.thisMap = TweenLite.to(
                    this.map.layers,
                    Config.animation.duration.boundary,
                    {
                        css: _css.thisMap,
                        onUpdate: () => {
                            this.map.offset.x = parseInt( _tween.thisMap._targets[ 0 ]._gsap.x, 10 );
                            this.map.offset.y = parseInt( _tween.thisMap._targets[ 0 ]._gsap.y, 10 );
                        },
                    }
                );

                _tween.newMap = TweenLite.to(
                    _map.layers,
                    Config.animation.duration.boundary,
                    {
                        css: _css.newMap,
                        onUpdate: () => {
                            _map.offset.x = parseInt( _tween.newMap._targets[ 0 ]._gsap.x, 10 );
                            _map.offset.y = parseInt( _tween.newMap._targets[ 0 ]._gsap.y, 10 );
                        },
                        onComplete: () => {
                            _map.addSprite( this.hero );
                            this.hero.element.style.position = "absolute";

                            // Update hero offset for new Map
                            this.hero.offset.x = _offsetHero.x;
                            this.hero.offset.y = _offsetHero.y;
                            this.hero.element.style.webkitTransform = `translate3d(
                                ${this.hero.offset.x}px,
                                ${this.hero.offset.y}px,
                                0
                            )`;

                            // Destroy old Map (need map.destroy())
                            // Teardown GameBox stuff (npcs, etc..., need gamebox.teardown())
                            this.teardown();
                            this.map = _map;
                            this.mapbounds = _mapbounds;
                            this.playbox = _playbox;

                            // Initialize GameBox stuff (npcs, etc...)
                            this.initMap();
                            this.player.resume();
                        }
                    }
                );
            });
        });
    }
}



module.exports = GameBox;
