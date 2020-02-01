const Utils = require( "../Utils" );
const Config = require( "../Config" );
const Loader = require( "../Loader" );
const GameBox = require( "../GameBox" );
const { Map } = require( "../Map" );
const Sprite = require( "../sprites/Sprite" );
const Tween = require( "properjs-tween" );
const Easing = require( "properjs-easing" );
const { TweenLite, Power0, Power1, Power2, Power3, Power4 } = require( "gsap" );



class TopView extends GameBox {
    constructor ( player ) {
        super( player );

        // Map switch
        this.map_ = null;
        this.cam_ = null;

        // Interactions
        this.interact = {
            // tile: {
            //     group,
            //     coord,
            //     throw?,
            // }
            push: 0,
        };
        this.debounce = 1024;
        this.locked = false;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blit ( elapsed ) {
        // blit map
        // blits hero
        this.map.blit( elapsed );

        // blit map_?
        if ( this.map_ ) {
            // blits hero_
            this.map_.blit( elapsed );
        }

        // update hero
        this.hero.update();

        // update gamebox (camera)
        this.update();

        // update map
        this.map.update( this.offset );

        // update map_?
        if ( this.map_ ) {
            this.map_.update( this.map_.offset );
        }

        // render map
        // renders hero
        // currently all canvas rendering happens here...
        this.map.render( this.camera );

        // render map_?
        if ( this.map_ ) {
            // renders hero_
            this.map_.render( this.cam_ );
        }
    }


    update ( pos ) {
        const x = ( this.hero.position.x - ((this.camera.width / 2) - (this.hero.width / 2)) );
        const y = ( this.hero.position.y - ((this.camera.height / 2) - (this.hero.height / 2)) );
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

        this.offset = offset;
        this.camera.x = Math.abs( offset.x );
        this.camera.y = Math.abs( offset.y );
    }


/*******************************************************************************
* GamePad Inputs
*******************************************************************************/
    pressD ( dir ) {
        const poi = this.hero.getNextPoiByDir( dir );

        this.handleHero( poi, dir );
    }


    releaseD () {
        if ( this.locked ) {
            return;
        }

        if ( this.interact.push ) {
            this.interact.push = 0;
        }

        if ( this.interact.tile ) {
            this.hero.cycle( this.hero.verb, this.hero.dir );

        } else {
            this.hero.face( this.hero.dir );
        }
    }


    pressA () {
        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const collision = {
            npc: this.checkNPC( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
        };

        if ( collision.npc ) {
            this.handleHeroNPCAct( poi, this.hero.dir, collision.npc );
        }

        if ( collision.tiles ) {
            if ( collision.tiles.action.length && collision.tiles.action[ 0 ].act && !this.interact.tile ) {
                this.handleHeroTileAct( poi, this.hero.dir, collision.tiles.action[ 0 ] );
            }
        }
    }


    holdA () {
        console.log( "A Hold" );
    }


    releaseA () {
        this.dialogue.check( true, false );

        this.handleReleaseA();
    }


    releaseHoldA () {
        this.handleReleaseA();
    }


    pressB () {
        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const collision = {
            tiles: this.checkTiles( poi, this.hero ),
        };

        if ( collision.tiles ) {
            if ( collision.tiles.attack.length ) {
                collision.tiles.attack.forEach(( tile ) => {
                    if ( tile.hit ) {
                        this.handleHeroTileHit( poi, this.hero.dir, tile );
                    }
                });
            }
        }
    }


    holdB () {
        console.log( "B Hold" );
    }


    releaseB () {
        this.dialogue.check( false, true );
    }


    releaseHoldB () {
        console.log( "B Hold Release" );
    }


/*******************************************************************************
* Hero Handlers...
*******************************************************************************/
    handleReleaseA () {
        if ( this.hero.verb === Config.verbs.GRAB ) {
            this.hero.face( this.hero.dir );
        }

        if ( this.hero.verb === Config.verbs.LIFT ) {
            if ( this.interact.tile.throw ) {
                this.handleHeroThrow();

            } else {
                this.interact.tile.throw = true;
            }

        } else {
            delete this.interact.tile;
        }
    }


    handleHero ( poi, dir ) {
        const collision = {
            evt: this.checkEvt( poi, this.hero ),
            map: this.checkMap( poi, this.hero ),
            box: this.checkBox( poi, this.hero ),
            npc: this.checkNPC( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
        };

        if ( this.locked ) {
            return;
        }

        if ( collision.evt ) {
            if ( collision.evt.type === Config.events.BOUNDARY && collision.box ) {
                this.handleHeroEvtBoundary( poi, dir, collision.evt );
                return;
            }
        }

        if ( collision.npc ) {
            this.handleHeroNPC( poi, dir );
            return;
        }

        if ( collision.map ) {
            // Tile will allow leaping from it's edge, like a ledge...
            if ( collision.tiles && collision.tiles.action.length && collision.tiles.action[ 0 ].jump && (collision.tiles.action[ 0 ].collides.width > (collision.tiles.action[ 0 ].tilebox.width / 2) || collision.tiles.action[ 0 ].collides.height > (collision.tiles.action[ 0 ].tilebox.height / 2)) ) {
                this.handleHeroTileJump(  poi, dir, collision.tiles.action[ 0 ] );

            } else {
                this.handleHeroMap( poi, dir );
                return;
            }
        }

        if ( collision.box ) {
            this.handleHeroBox( poi, dir );
            return;
        }

        if ( this.hero.verb === Config.verbs.GRAB ) {
            if ( dir === Config.opposites[ this.hero.dir ] ) {
                this.handleHeroLift( poi, dir );
            }

            return;
        }

        if ( collision.tiles ) {
            this.handleHeroTiles(  poi, dir, collision.tiles );

            // Tile is behaves like a WALL, or Object you cannot walk on
            if ( collision.tiles.action.length && collision.tiles.action[ 0 ].stop ) {
                this.handleTileStop( poi, dir, collision.tiles.action[ 0 ] );
                return;
            }

        } else if ( this.hero.physics.maxv !== this.hero.physics.controlmaxv && this.hero.verb !== Config.verbs.LIFT ) {
            this.hero.physics.maxv = this.hero.physics.controlmaxv;
        }

        // Apply position
        this.hero.applyPosition( poi, dir );

        // Applly offset
        this.hero.applyOffset();

        // Apply the sprite animation cycle
        this.hero.applyCycle();
    }


    handleHeroPushable ( poi, dir ) {
        this.interact.push++;

        if ( (this.hero.verb !== Config.verbs.LIFT) && (this.interact.push > this.map.data.tilesize) ) {
            this.hero.cycle( Config.verbs.PUSH, dir );

        } else if ( this.hero.verb !== Config.verbs.LIFT ) {
            this.hero.cycle( Config.verbs.WALK, dir );
        }
    }


    handleHeroMap ( poi, dir ) {
        this.handleHeroPushable( poi, dir );
    }


    handleHeroNPC ( poi, dir ) {
        this.handleHeroPushable( poi, dir );
    }


    handleTileStop (  poi, dir, tile ) {
        this.handleHeroPushable( poi, dir );
    }


    handleHeroBox ( poi, dir ) {
        this.hero.cycle( this.hero.verb, dir );
    }


    handleHeroEvtBoundary (  poi, dir, evt ) {
        this.switchMap( evt );
    }


    handleHeroLift ( poi, dir ) {
        this.locked = true;
        this.hero.cycle( Config.verbs.PULL, dir );
        setTimeout(() => {
            const activeTiles = this.map.getActiveTiles( this.interact.tile.group );
            const tileCel = activeTiles.getTile();

            this.player.gameaudio.hitSound( "pickup" );
            this.map.spliceActiveTile( this.interact.tile.group, this.interact.tile.coord );
            this.interact.tile.sprite = new Sprite({
                layer: "foreground",
                width: this.map.gridsize,
                height: this.map.gridsize,
                spawn: {
                    x: this.hero.position.x + (this.hero.width / 2) - (this.map.gridsize / 2),
                    y: this.hero.position.y - this.map.gridsize + 42,
                },
                image: this.map.data.image,
                hitbox: {
                    x: 0,
                    y: 0,
                    width: this.map.gridsize,
                    height: this.map.gridsize,
                },
                verbs: {
                    face: {
                        down: {
                            offsetX: tileCel[ 0 ],
                            offsetY: tileCel[ 1 ],
                        }
                    }
                },

            }, this.map );
            this.interact.tile.sprite.hero = this.hero;
            this.map.addNPC( this.interact.tile.sprite );
            this.hero.cycle( Config.verbs.LIFT, this.hero.dir );
            this.hero.physics.maxv = this.hero.physics.controlmaxv / 2;
            this.locked = false;

        }, Config.values.debounceDur );
    }


    handleHeroThrow () {
        this.hero.face( this.hero.dir );
        this.player.gameaudio.hitSound( "throw" );
        this.hero.physics.maxv = this.hero.physics.controlmaxv;
        this.handleThrow( this.interact.tile.sprite ).then(() => {
            this.player.gameaudio.hitSound( "smash" );
            this.map.killObj( "npcs", this.interact.tile.sprite );

            delete this.interact.tile;
        });
    }


    handleHeroTiles ( poi, dir, tiles ) {
        tiles.passive.forEach(( tile ) => {
            // Stairs are hard, you have to take it slow...
            if ( tile.group === Config.tiles.STAIRS ) {
                this.hero.physics.maxv = this.hero.physics.controlmaxv / 2;

            // Grass is thick, it will slow you down a bit...
            } else if ( tile.group === Config.tiles.GRASS ) {
                this.hero.physics.maxv = this.hero.physics.controlmaxv / 1.5;
            }
        });
    }


    handleHeroNPCAct ( poi, dir, obj ) {
        if ( obj.canInteract( dir ) ) {
            obj.doInteract( dir );
        }
    }


    handleHeroTileJump ( poi, dir, tile ) {
        if ( dir === tile.tile.data.action.require.dir ) {
            this.locked = true;

            console.log( tile );

            const vertical = (dir === "up" || dir === "down");
            const collider = {
                x: vertical ? tile.tilebox.x : (dir === "left" ? (tile.tilebox.x - (tile.tilebox.width * 1)) : (tile.tilebox.x + (tile.tilebox.width * 1))),
                y: vertical ? (dir === "up" ? (tile.tilebox.y - (tile.tilebox.height * 2)) : (tile.tilebox.y + (tile.tilebox.height * 2))) : tile.tilebox.y,
                width: tile.tilebox.width,
                height: tile.tilebox.height,
            };

            this.map.setCollider( collider );

            // Render shadow to the new landing position
            // Animate hero to the new landing position
            // Unlock the game...
        }
    }


    handleHeroTileAct ( poi, dir, tile ) {
        const activeTiles = this.map.getActiveTiles( tile.group );

        if ( tile.tile.canInteract() ) {
            this.interact.tile = tile;

            if ( tile.tile.data.action.verb === Config.verbs.LIFT ) {
                this.hero.cycle( Config.verbs.GRAB, this.hero.dir );
            }
        }
    }


    handleHeroTileHit ( poi, dir, tile ) {
        if ( tile.tile.canAttack() ) {
            tile.tile.attack( tile.coord );
        }
    }


/*******************************************************************************
* Sprite Handlers
*******************************************************************************/
    handleControls ( controls, sprite ) {
        if ( controls.left ) {
            sprite.physics.vx = Utils.limit( sprite.physics.vx - sprite.speed, -sprite.physics.controlmaxv, sprite.physics.controlmaxv );
            sprite.idle.x = false;

        } else if ( controls.right ) {
            sprite.physics.vx = Utils.limit( sprite.physics.vx + sprite.speed, -sprite.physics.controlmaxv, sprite.physics.controlmaxv );
            sprite.idle.x = false;

        } else {
            sprite.idle.x = true;
        }

        if ( controls.up ) {
            sprite.physics.vy = Utils.limit( sprite.physics.vy - sprite.speed, -sprite.physics.controlmaxv, sprite.physics.controlmaxv );
            sprite.idle.y = false;

        } else if ( controls.down ) {
            sprite.physics.vy = Utils.limit( sprite.physics.vy + sprite.speed, -sprite.physics.controlmaxv, sprite.physics.controlmaxv );
            sprite.idle.y = false;

        } else {
            sprite.idle.y = true;
        }

        // Handle sprite AI logics...
        // Hero sprite will NEVER have AI data...
        if ( sprite.data.ai ) {
            if ( sprite.data.ai === "wander" ) {
                this.handleWander( sprite );
            }
        }
    }


    handleThrow ( sprite ) {
        return new Promise(( resolve ) => {
            sprite.resolve = resolve;
            sprite.throwing = this.hero.dir;

            let throwX;
            let throwY;
            const dist = 128;
            const props = {
                x: sprite.position.x,
                y: sprite.position.y,
            };
            const _complete = () => {
                this.smokeObject( sprite );
                sprite.tween.kill();
                sprite.tween = null;
                sprite.resolve();
            };

            if ( sprite.throwing === "left" ) {
                throwX = sprite.position.x - dist;
                throwY = sprite.hero.footbox.y - (sprite.height - this.hero.footbox.height);

            } else if ( sprite.throwing === "right" ) {
                throwX = sprite.position.x + dist;
                throwY = sprite.hero.footbox.y - (sprite.height - this.hero.footbox.height);

            } else if ( sprite.throwing === "up" ) {
                throwX = sprite.position.x;
                throwY = sprite.position.y - dist;

            }  else if ( sprite.throwing === "down" ) {
                throwX = sprite.position.x;
                throwY = this.hero.footbox.y + dist;
            }

            sprite.tween = TweenLite.to( props, 0.5, {
                x: throwX,
                y: throwY,
                ease: Power4.easeOut,
                onUpdate: () => {
                    sprite.position.x = sprite.tween._targets[ 0 ].x;
                    sprite.position.y = sprite.tween._targets[ 0 ].y;

                    const collision = {
                        map: this.checkMap( sprite.position, sprite ),
                        box: this.checkBox( sprite.position, sprite ),
                        npc: this.checkNPC( sprite.position, sprite ),
                    };

                    if ( collision.map || collision.box || collision.npc ) {
                        _complete();
                    }
                },
                onComplete: () => {
                    _complete();
                }
            });
        });
    }


    handleWander ( sprite ) {
        if ( !sprite.counter ) {
            // sprite.counter = Utils.random( 60, 180 );
            sprite.counter = 5 * 60;
            sprite.stepsX = Utils.random( 20, 50 );
            sprite.stepsY = Utils.random( 20, 50 );
            sprite.dirX = ["left", "right"][ Utils.random( 0, 2 ) ];
            sprite.dirY = ["up", "down"][ Utils.random( 0, 2 ) ];

            console.log(
                `Sprite: ${sprite.data.id}`,
                `Countdown: ${sprite.counter}`,
                `${sprite.dirX}: ${sprite.stepsX}`,
                `${sprite.dirY}: ${sprite.stepsY}`,
            );

        } else {
            sprite.counter--;
        }

        if ( sprite.stepsX ) {
            sprite.stepsX--;

            if ( sprite.dirX === "left" ) {
                sprite.controls.left = 1;
                sprite.controls.right = 0;
                sprite.dir = "left";

            } else {
                sprite.controls.right = 1;
                sprite.controls.left = 0;
                sprite.dir = "right";
            }

        } else {
            sprite.controls.left = 0;
            sprite.controls.right = 0;
        }

        if ( sprite.stepsY ) {
            sprite.stepsY--;

            if ( sprite.dirY === "up" ) {
                sprite.controls.up = 1;
                sprite.controls.down = 0;

            } else {
                sprite.controls.down = 1;
                sprite.controls.up = 0;
            }

        } else {
            sprite.controls.up = 0;
            sprite.controls.down = 0;
        }

        if ( !sprite.stepsX && !sprite.stepsY ) {
            sprite.verb = Config.verbs.FACE;
            sprite.controls = {};

        } else {
            if ( sprite.data.bounce && sprite.position.z === 0 ) {
                sprite.physics.vz = -6;
            }

            if ( sprite.data.verbs[ Config.verbs.WALK ] ) {
                sprite.verb = Config.verbs.WALK;
            }
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
                    obj.applyOffset();
                }

                // Only a Map has a Hero
                if ( obj.hero ) {
                    const transform = Utils.getTransform( obj.element );

                    obj.element.style.webkitTransform = `translate3d(
                        ${css.axis === "x" ? t : transform.x}px,
                        ${css.axis === "y" ? t : transform.y}px,
                        0
                    )`;
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
        // Pausing triggers the GameBox to call this.hero.face( this.hero.dir )
        this.player.pause();

        // Dupe the Hero
        const mapData = Loader.cash( evt.map );
        const heroData = Utils.copy( this.hero.data );

        // Create new Map / Camera
        this.map_ = new Map( mapData, heroData, this );
        this.cam_ = Utils.copy( this.camera );

        // Update this.map_.hero
        this.map_.hero.face( this.hero.dir );
        this.map_.hero.idle = this.hero.idle;

        // Will be the animation values for rendering...
        const _css = {
            map: null,
            map_: null,
            hero: null,
            hero_: null,
        };

        // Stage new Map / new Hero for animation
        if ( this.hero.dir === "down" ) {
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
                x: this.hero.position.x,
                y: -this.map_.hero.height,
                z: 0,
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
                from: this.hero.position.y,
                to: this.hero.position.y + this.hero.height,
            };

        } else if ( this.hero.dir === "up" ) {
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
                x: this.hero.position.x,
                y: this.map_.height,
                z: 0,
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
                from: this.hero.position.y,
                to: this.hero.position.y - this.hero.height,
            };

        } else if ( this.hero.dir === "right" ) {
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
                y: this.hero.position.y,
                z: 0,
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
                from: this.hero.position.x,
                to: this.hero.position.x + this.hero.width,
            };

        } else if ( this.hero.dir === "left" ) {
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
                y: this.hero.position.y,
                z: 0,
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
                from: this.hero.position.x,
                to: this.hero.position.x - this.hero.width,
            };
        }

        // Inject the new Map element into the DOM
        this.player.screen.appendChild( this.map_.element );

        // Animate Maps and Hero and resolve all tweens for clean-up
        Promise.all([
            // New Map, New Hero
            this.switchTween( this.map_, _css.map_ ),
            this.switchTween( this.map_.hero, _css.hero_ ),

            // Old Map, Old Hero
            this.switchTween( this.map, _css.map ),
            this.switchTween( this.hero, _css.hero ),

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



module.exports = TopView;
