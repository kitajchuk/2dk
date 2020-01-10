const GameBox = require( "./GameBox" );
const Utils = require( "./Utils" );
const Config = require( "./Config" );
const { Map } = require( "./Map" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );



class TopView extends GameBox {
    constructor ( player ) {
        super( player );
        this.locked = false;
        this.grabbed = null;
        this.pulling = null;
        this.pushing = false;
        this.tween = {};
    }


/*******************************************************************************
* GamePad Inputs
*******************************************************************************/
    pressD ( dir ) {
        const poi = Utils.getPoi( dir, Config.values.step, this.hero );
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

        if ( collision.npc || this.grabbed ) {
            this.handleNPC( collision, poi, dir );
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
        const poi = Utils.getPoi( this.hero.dir, Config.values.step, this.hero );
        const npc = this.checkNPC( poi );

        if ( npc ) {
            this.checkNPCAct( npc, poi, true );
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

        if ( this.grabbed && (this.tween.hero && this.tween.npc) ) {
            this.killgrab( dir );
        }
    }


    releaseA () {
        this.handleReleaseA();
    }


    longReleaseA () {
        this.handleReleaseA();
    }


/*******************************************************************************
* VERBS
*******************************************************************************/
    grab ( npc, poi, btn ) {
        if ( !npc.state.action ) {
            return;
        }

        if ( npc.state.action.verb !== Config.verbs.MOVE ) {
            return;
        }

        if ( this.grabbed ) {
            return;
        }

        this.grabbed = npc;
        this.pulling = Config.opposites[ this.hero.dir ];
        this.hero.cycling = false;
        this.hero.verb = Config.verbs.GRAB;
        this.hero.child.classList.add( Config.verbs.GRAB );
    }


    open ( npc, poi, btn ) {
        if ( !npc.state.action ) {
            return;
        }

        if ( npc.state.action.verb !== Config.verbs.OPEN ) {
            return;
        }

        if ( npc.state.action.require.button && !btn ) {
            return;
        }

        if ( npc.state.action.shift ) {
            if ( npc.state.action.payload ) {
                this.payload( npc.state.action.payload );
            }

            npc.shift();
        }
    }


    push ( npc, poi, btn ) {
        if ( btn ) {
            return;
        }

        if ( !npc.state.action ) {
            return;
        }

        if ( npc.state.action.verb !== Config.verbs.MOVE ) {
            return;
        }

        if ( !npc.state.action.counter ) {
            return;
        }

        if ( npc.pushed.pushing ) {
            return;
        }

        if ( npc.state.action.require && npc.state.action.require.dir && npc.gamebox.hero.dir !== npc.state.action.require.dir ) {
            return;
        }

        clearTimeout( npc.pushed.timer );

        npc.pushed.pushes++;

        if ( npc.pushed.pushes >= npc.pushed.needed ) {
            npc.pushed.pushes = 0;
            npc.pushed.pushing = true;
            npc.state.action.counter--;

            const css = Utils.getAni( this.hero.dir, this.map.data.gridsize, npc );
            const pos = {};

            pos[ css.axis ] = css.to;
            pos[ Config.opposites[ css.axis ] ] = npc.offset[ Config.opposites[ css.axis ] ];

            // Map collider layer
            if ( this.checkMap( pos, npc ) ) {
                npc.pushed.pushing = false;
                return;
            }

            npc.tween = new Tween({
                ease: Easing.swing,
                duration: Config.animation.duration.pushed,
                from: css.from,
                to: css.to,
                update: ( t ) => {
                    npc.offset[ css.axis ] = t;
                    npc.move( npc.offset );
                },
                complete: ( t ) => {
                    npc.offset[ css.axis ] = t;
                    npc.move( npc.offset );
                    npc.pushed.pushing = false;

                    if ( npc.state.action.payload ) {
                        this.payload( npc.state.action.payload );
                    }
                }
            });
        }

        npc.pushed.timer = setTimeout(() => {
            npc.pushed.pushes = 0;

        }, npc.pushed.bounce );
    }


    pull ( npc, poi, dir, collision ) {
        this.locked = true;
        this.pushing = false;
        this.pulling = dir;
        this.hero.child.classList.remove( Config.verbs.GRAB );

        if ( collision.map || collision.box || collision.npc ) {
            return;
        }

        if ( !npc.state.action.counter ) {
            return;
        }

        if ( npc.state.action.require && npc.state.action.require.dir && dir !== npc.state.action.require.dir ) {
            return;
        }

        const heroAni = Utils.getAni( dir, this.map.data.gridsize, this.hero );
        const npcAni = Utils.getAni( dir, this.map.data.gridsize, npc );

        this.hero.cycle( Config.verbs.PULL, dir );

        this.tween.hero = new Tween({
            ease: Easing.swing,
            duration: Config.animation.duration.pulled,
            delay: Config.animation.duration.pulled,
            from: heroAni.from,
            to: heroAni.to,
            update: ( t ) => {
                this.hero.offset[ heroAni.axis ] = t;
                this.offset = this.update( this.hero.offset );
                this.hero.move( this.hero.offset );
                this.map.move( this.offset );
            },
            complete: ( t ) => {
                this.hero.offset[ heroAni.axis ] = t;
                this.offset = this.update( this.hero.offset );
                this.hero.move( this.hero.offset );
                this.map.move( this.offset );
                this.locked = false;
            }
        });

        this.tween.npc = new Tween({
            ease: Easing.swing,
            duration: Config.animation.duration.pulled,
            delay: Config.animation.duration.pulled,
            from: npcAni.from,
            to: npcAni.to,
            update: ( t ) => {
                npc.offset[ npcAni.axis ] = t;
                npc.move( npc.offset );
            },
            complete: ( t ) => {
                npc.offset[ npcAni.axis ] = t;
                npc.move( npc.offset );

                if ( npc.state.action.payload ) {
                    this.payload( npc.state.action.payload );
                }
            }
        });
    }


    ungrab () {
        this.grabbed = null;
        this.pulling = null;
        this.hero.cycling = false;
        this.hero.child.classList.remove( Config.verbs.GRAB );
    }


    killgrab ( dir ) {
        this.tween.hero.stop();
        this.tween.npc.stop();
        this.tween.hero = null;
        this.tween.npc = null;
        this.locked = false;
        this.hero.face( Config.opposites[ dir ] );
        this.hero.cycle( Config.verbs.GRAB, Config.opposites[ dir ] );
    }


/*******************************************************************************
* Condition Handlers
*******************************************************************************/
    handleReleaseA () {
        const poi = Utils.getPoi( this.hero.dir, Config.values.step, this.hero );
        const npc = this.checkNPC( poi );

        this.hero.face( this.hero.dir );

        if ( this.grabbed ) {
            this.ungrab();

            if ( this.tween.hero && this.tween.npc ) {
                this.killgrab( this.hero.dir );
            }
        }

        if ( this.locked ) {
            this.locked = false;
        }
    }


    handleWalk ( poi, dir ) {
        this.offset = this.update( poi );
        this.hero.move( poi );
        this.map.move( this.offset );
        this.hero.cycle( this.pushing ? Config.verbs.PUSH : Config.verbs.WALK, dir );
    }


    // collision (npc, evt, map, box)
    handleNPC ( collision, poi, dir ) {
        if ( this.grabbed && (dir === this.pulling) ) {
            this.pull( this.grabbed, poi, dir, collision );

        } else if ( this.grabbed && (dir !== this.pulling) ) {
            this.ungrab();

        } else {
            this.checkNPCAct( collision.npc, poi, false );
            this.handlePush( poi, dir );
        }
    }


    handleMap ( poi, dir ) {
        this.hero.cycle( Config.verbs.WALK, dir );
        // this.handlePush( poi, dir );
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


/*******************************************************************************
* Perception Checks
*******************************************************************************/
    checkNPCAct ( npc, poi, btn ) {
        // MOVE covers the idea of PUSH/PULL because it supports GRAB
        if ( npc.state.action && npc.state.action.verb === Config.verbs.MOVE && !btn ) {
            this.push( npc, poi, btn );

        } else if ( npc.state.action && npc.state.action.verb === Config.verbs.MOVE && btn ) {
            this.grab( npc, poi, btn );

        } else if ( npc.state.action && npc.state.action.verb === Config.verbs.OPEN ) {
            this.open( npc, poi, btn );
        }
    }


    checkNPC ( poi ) {
        let ret = null;
        const hitbox = this.hero.getBox( poi, "hit" );

        for ( let i = this.npcs.length; i--; ) {
            const hitnpc = this.npcs[ i ].getBox( this.npcs[ i ].offset, "hit" );

            if ( Utils.collide( hitbox, hitnpc ) ) {
                ret = this.npcs[ i ];
                break;
            }
        }

        return ret;
    }


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
        const hitbox = sprite.getBox( poi, "hit" );

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
        const hitbox = this.hero.getBox( poi, "hit" );

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

                    // Initialize GameBox stuff (npcs, etc...)
                    this.initMap();
                    this.player.resume();
                });
            });
        });
    }
}



module.exports = TopView;
