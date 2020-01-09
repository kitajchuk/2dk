const Config = require( "./Config" );
const Loader = require( "./Loader" );
const GameSFX = require( "./GameSFX" );
const Dialogue = require( "./Dialogue" );
const { Map } = require( "./Map" );
const { Hero, NPC } = require( "./Sprite" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );



class GameBox {
    constructor ( player ) {
        this.loader = new Loader();
        this.player = player;
        this.step = Config.values.step;
        this.transform = {
            x: 0,
            y: 0
        };

        // VERBS stuff
        this.locked = false;
        this.grabbed = null;
        this.pulling = null;
        this.pushing = false;

        // Teardown stuff
        this.npcs = [];

        // Dialogue box
        this.dialogue = new Dialogue( this );

        // SFX
        this.gamesfx = new GameSFX( this );

        // Hero
        this.heroRef = this.player.data.hero;
        this.heroPick = this.player.data.heroes[ this.heroRef.sprite ];
        this.heroData = Config.utils.merge( this.heroPick, this.heroRef );
        this.hero = new Hero( this.heroData, this );

        // Map
        this.loader.loadJson( this.hero.data.spawn.map ).then(( data ) => {
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
                this.hero.init();
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
            },
        });
        this.map.data.objects.forEach(( data ) => {
            const npcRef = data;
            const npcPick = this.player.data.objects.find(( obj ) => {
                return (obj.id === data.id);
            });
            const npcData = Config.utils.merge( npcPick, npcRef );
            const npc = new NPC( npcData, this );

            npc.load().then(() => {
                npc.init();
                this.npcs.push( npc );
            });
        });
    }


    payload ( payload ) {
        if ( payload.dialogue ) {
            this.dialogue.play( payload.dialogue ).then(() => {
                console.log( "dialogue resolved with A" );

            }).catch(() => {
                console.log( "dialogue rejected with B" );
            });
        }
    }


    teardown () {
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

        this.screen.appendChild( this.map.element );
        this.screen.appendChild( this.dialogue.element );
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


    grab ( npc ) {
        this.grabbed = npc;
        this.pulling = Config.opposites[ this.hero.dir ];
        this.hero.cycling = false;
        this.hero.verb = Config.verbs.GRAB;
        this.hero.child.classList.add( Config.verbs.GRAB );
    }


    ungrab () {
        this.grabbed = null;
        this.pulling = null;
        this.hero.cycling = false;
        this.hero.child.classList.remove( Config.verbs.GRAB );
    }


    pressD ( dir ) {
        const poi = this.getPoi( dir, Config.values.step, this.hero );
        const collision = {
            evt: this.checkEvt( poi ),
            npc: this.checkNPC( poi ),
            map: this.checkMap( poi, this.hero ),
            box: this.checkBox( poi ),
        };

        this.awareNPC( poi, dir );

        if ( this.locked ) {
            return;
        }

        if ( this.grabbed && (dir === this.pulling) ) {
            this.handlePull( poi, dir, collision );
            return;

        } else if ( this.grabbed && (dir !== this.pulling) ) {
            this.ungrab();
        }

        if ( collision.npc ) {
            this.handleNPC( collision.npc, poi, dir );
            return;
        }

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


    pressA () {
        const poi = this.getPoi( this.hero.dir, Config.values.step, this.hero );
        const npc = this.checkNPC( poi );

        if ( npc ) {
            npc.checkAct( poi, true );
        }

        this.dialogue.check( true, false );
    }


    pressB () {
        this.dialogue.check( false, true );
    }


    releaseD ( dir ) {
        if ( !this.grabbed ) {
            this.hero.face( dir );

            if ( this.pulling ) {
                this.pulling = null;
            }
        }

        if ( this.pushing ) {
            this.pushing = false;
        }

        if ( this.grabbed && (this.heroTween && this.grabTween) ) {
            this.heroTween.stop();
            this.grabTween.stop();
            this.heroTween = null;
            this.grabTween = null;
            this.locked = false;
            this.hero.face( Config.opposites[ dir ] );
            this.hero.cycle( Config.verbs.GRAB, Config.opposites[ dir ] );
        }
    }


    releaseA () {
        this.handleReleaseA();
    }


    longReleaseA () {
        this.handleReleaseA();
    }


    handleReleaseA () {
        const poi = this.getPoi( this.hero.dir, Config.values.step, this.hero );
        const npc = this.checkNPC( poi );

        this.hero.face( this.hero.dir );

        if ( this.grabbed ) {
            this.ungrab();
        }

        if ( this.locked ) {
            this.locked = false;
        }
    }


    handleWalk ( poi, dir ) {
        this.transform = this.update( poi );
        this.hero.move( dir, poi );
        this.map.move( dir, this.transform );
        this.hero.cycle( this.pushing ? Config.verbs.PUSH : Config.verbs.WALK, dir );
    }


    handlePull ( poi, dir, collision ) {
        this.locked = true;
        this.pushing = false;
        this.pulling = dir;
        this.hero.child.classList.remove( Config.verbs.GRAB );

        if ( collision.map || collision.box || collision.npc ) {
            return;
        }

        const heroCss = this.getCss( dir, this.hero );
        const grabCss = this.getCss( dir, this.grabbed );

        this.hero.cycle( Config.verbs.PULL, dir );

        this.heroTween = new Tween({
            ease: Easing.swing,
            duration: Config.animation.duration.pulled,
            delay: Config.animation.duration.pulled,
            from: heroCss.from,
            to: heroCss.to,
            update: ( t ) => {
                this.hero.offset[ heroCss.axis ] = t;
                this.transform = this.update( this.hero.offset );
                this.hero.move( dir, this.hero.offset );
                this.map.move( dir, this.transform );
            },
            complete: ( t ) => {
                this.hero.offset[ heroCss.axis ] = t;
                this.transform = this.update( this.hero.offset );
                this.hero.move( dir, this.hero.offset );
                this.map.move( dir, this.transform );
                this.locked = false;
            }
        });

        this.grabTween = new Tween({
            ease: Easing.swing,
            duration: Config.animation.duration.pulled,
            delay: Config.animation.duration.pulled,
            from: grabCss.from,
            to: grabCss.to,
            update: ( t ) => {
                this.grabbed.offset[ grabCss.axis ] = t;
                this.grabbed.move( dir, this.grabbed.offset );
            },
            complete: ( t ) => {
                this.grabbed.offset[ grabCss.axis ] = t;
                this.grabbed.move( dir, this.grabbed.offset );
            }
        });
    }


    handleNPC ( npc, poi, dir ) {
        npc.checkAct( poi, false );
        this.handlePush( poi, dir );
    }


    handleMap ( poi, dir ) {
        this.hero.cycle( Config.verbs.WALK, dir );
    }


    handlePush ( poi, dir ) {
        this.pulling = null;
        this.pushing = true;
        this.hero.child.classList.remove( Config.verbs.GRAB );
        this.hero.cycle( Config.verbs.PUSH, dir );
    }


    handleEvt ( evt ) {
        if ( evt.type === Config.events.BOUNDARY ) {
            this.switchMap( evt );
        }
    }


    handleBox ( poi, dir ) {
        this.hero.cycle( Config.verbs.WALK, dir );
    }


    awareNPC ( poi, dir ) {
        for ( let i = this.npcs.length; i--; ) {
            this.npcs[ i ].checkPoi( poi );
            this.npcs[ i ].checkBox( poi );
        }
    }


    checkNPC ( poi ) {
        let ret = null;
        const hitbox = this.hero.getBox( poi, "hit" );

        for ( let i = this.npcs.length; i--; ) {
            const hitnpc = this.npcs[ i ].getBox( this.npcs[ i ].offset, "hit" );

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


    checkMap ( poi, sprite ) {
        let ret = false;
        const hitbox = sprite.getBox( poi, "hit" );

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


    getPoi ( dir, step, sprite ) {
        const poi = {};

        if ( dir === "left" ) {
            poi.x = sprite.offset.x - step;
            poi.y = sprite.offset.y;
        }

        if ( dir === "right" ) {
            poi.x = sprite.offset.x + step;
            poi.y = sprite.offset.y;
        }

        if ( dir === "up" ) {
            poi.x = sprite.offset.x;
            poi.y = sprite.offset.y - step;
        }

        if ( dir === "down" ) {
            poi.x = sprite.offset.x;
            poi.y = sprite.offset.y + step;
        }

        return poi;
    }


    getCss ( dir, sprite ) {
        const css = {};

        if ( dir === "left" ) {
            css.axis = "x";
            css.from = sprite.offset.x;
            css.to = sprite.offset.x - this.map.data.gridsize;
        }

        if ( dir === "right" ) {
            css.axis = "x";
            css.from = sprite.offset.x;
            css.to = sprite.offset.x + this.map.data.gridsize;
        }

        if ( dir === "up" ) {
            css.axis = "y";
            css.from = sprite.offset.y;
            css.to = sprite.offset.y - this.map.data.gridsize;
        }

        if ( dir === "down" ) {
            css.axis = "y";
            css.from = sprite.offset.y;
            css.to = sprite.offset.y + this.map.data.gridsize;
        }

        return css;
    }


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
        this.loader.loadJson( evt.map ).then(( data ) => {
            this.teardown();

            // Create new Map
            const _map = new Map( data, this );

            // Load new Map
            _map.load().then(() => {
                let _hero = this.hero.offset;
                const _css = {};
                const _rect = {
                    hero: this.hero.element.getBoundingClientRect(),
                    screen: this.screen.getBoundingClientRect(),
                };

                // Stage Hero for animation
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
                this.screen.appendChild( _map.element );

                // Animate Maps and Hero and resolve all tweens for clean-up
                Promise.all([
                    this.switchTween( _map, _css.newMap ),
                    this.switchTween( this.map, _css.thisMap ),
                    this.switchTween( this.hero, _css.hero ),

                ]).then(() => {
                    // Stage Hero with correct position on new Map
                    this.hero.offset = {
                        x: _hero.x,
                        y: _hero.y,
                    };
                    this.hero.element.style.position = "absolute";
                    this.hero.render();
                    _map.addSprite( this.hero );

                    // Destroy old Map
                    // Teardown GameBox stuff (npcs, etc...)
                    this.map.destroy();
                    this.map = _map;

                    // Determine new Map mapbounds & playbox
                    // Only relevant if the new Map is NOT the same size!
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

                    // Initialize GameBox stuff (npcs, etc...)
                    this.initMap();
                    this.player.resume();
                });
            });
        });
    }
}



module.exports = GameBox;
