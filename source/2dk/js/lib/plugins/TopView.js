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
        // parkour: {
        //     distance,
        //     landing: { x, y }
        // }
        this.parkour = false;
        this.jumping = false;
        this.falling = false;
        this.locked = false;
        this.keyTimer = null;
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
        // also renders hero...
        // ...currently all canvas rendering happens here...
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
        if ( this.locked || this.jumping || this.falling ) {
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
        if ( this.locked || this.jumping || this.falling ) {
            return;
        }

        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const collision = {
            npc: this.checkNPC( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
        };

        if ( collision.npc ) {
            this.handleHeroNPCAction( poi, this.hero.dir, collision.npc );

        } else if ( collision.tiles && collision.tiles.action.length && collision.tiles.action[ 0 ].action ) {
            if ( !this.interact.tile ) {
                this.handleHeroTileAction( poi, this.hero.dir, collision.tiles.action[ 0 ] );
            }

        // Jump...
        } else if ( this.hero.verb !== Config.verbs.LIFT && this.hero.verb !== Config.verbs.GRAB ) {
            this.handleHeroJump( poi, this.hero.dir );
        }
    }


    holdA () {
        if ( this.jumping || this.falling ) {
            return;
        }

        console.log( "A Hold" );
    }


    releaseA () {
        if ( this.jumping || this.falling ) {
            return;
        }

        this.dialogue.check( true, false );

        this.handleReleaseA();
    }


    releaseHoldA () {
        if ( this.jumping || this.falling ) {
            return;
        }

        this.handleReleaseA();
    }


    pressB () {
        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const collision = {
            tiles: this.checkTiles( poi, this.hero ),
        };

        // Apply attack cycle...

        if ( collision.tiles && collision.tiles.attack.length ) {
            collision.tiles.attack.forEach(( tile ) => {
                if ( tile.attack ) {
                    this.handleHeroTileAttack( poi, this.hero.dir, tile );
                }
            });
        }
    }


    holdB () {
        if ( this.jumping || this.falling ) {
            return;
        }

        console.log( "B Hold" );
    }


    releaseB () {
        if ( this.jumping || this.falling ) {
            return;
        }

        this.dialogue.check( false, true );
    }


    releaseHoldB () {
        if ( this.jumping || this.falling ) {
            return;
        }

        console.log( "B Hold Release" );
    }


/*******************************************************************************
* Hero Handlers...
*******************************************************************************/
    handleReleaseA () {
        if ( this.jumping ) {
            return;
        }

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


    applyHero ( poi, dir ) {
        // Apply position
        this.hero.applyPosition( poi, dir );

        // Applly offset
        this.hero.applyOffset();

        // Apply the sprite animation cycle
        this.hero.applyCycle();
    }


    handleCriticalReset () {
        // Timer used for jumping / parkour
        if ( this.keyTimer ) {
            clearTimeout( this.keyTimer );
            this.keyTimer = null;
        }

        // Applied for parkour
        this.player.controls[ this.hero.dir ] = false;

        // To kill any animated sprite cycling (jump etc...)
        this.hero.face( this.hero.dir );

        // Reset flags
        this.parkour = false;
        this.jumping = false;
        this.falling = false;
    }


    handleHero ( poi, dir ) {
        const collision = {
            map: this.checkMap( poi, this.hero ),
            npc: this.checkNPC( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
            event: this.checkEvents( poi, this.hero ),
            camera: this.checkCamera( poi, this.hero ),
        };

        if ( this.locked || this.jumping || this.falling || this.parkour ) {
            this.interact.push = 0;
        }

        if ( this.locked || this.falling ) {
            return;

        } else if ( this.parkour ) {
            if ( collision.event ) {
                // console.log( collision.event.amount );
                if ( this.canHeroEventDoor( poi, dir, collision ) && collision.event.amount >= (786 / this.camera.resolution) ) {
                    this.handleCriticalReset();
                    // console.log( "collision", collision );
                    this.handleHeroEventDoor( poi, dir, collision.event );
                    return;
                }
            }

            this.applyHeroTileJump( poi, dir );
            this.applyHero( poi, dir );
            return;

        } else if ( this.jumping ) {
            if ( this.canHeroMoveWhileJumping( poi, dir, collision ) ) {
                this.applyHero( poi, dir );
            }

            return;
        }

        if ( collision.event ) {
            if ( this.canHeroEventBoundary( poi, dir, collision ) ) {
                this.handleHeroEventBoundary( poi, dir, collision.event );
                return;

            } else if ( this.canHeroEventDoor( poi, dir, collision ) ) {
                this.handleHeroEventDoor( poi, dir, collision.event );
                return;
            }
        }

        if ( collision.npc ) {
            this.handleHeroPush( poi, dir );
            return;
        }

        if ( collision.map ) {
            // Tile will allow leaping from it's edge, like a ledge...
            if ( this.canHeroTileJump( poi, dir, collision ) ) {
                this.handleHeroTileJump(  poi, dir, collision.tiles.action[ 0 ] );

            } else {
                this.handleHeroPush( poi, dir );
                return;
            }
        }

        if ( collision.camera ) {
            this.handleHeroCamera( poi, dir );
            return;
        }

        if ( this.hero.verb === Config.verbs.GRAB ) {
            if ( this.canHeroLift( poi, dir, collision ) ) {
                this.handleHeroLift( poi, dir );
            }

            return;
        }

        if ( collision.tiles ) {
            this.handleHeroTiles( poi, dir, collision.tiles );

            // Tile is behaves like a WALL, or Object you cannot walk on
            if ( this.canHeroTileStop( poi, dir, collision ) ) {
                this.handleHeroPush( poi, dir, collision.tiles.action[ 0 ] );
                return;
            }

        } else if ( this.canHeroResetMaxV( poi, dir, collision ) ) {
            this.hero.physics.maxv = this.hero.physics.controlmaxv;
        }

        this.applyHero( poi, dir );
    }


    canHeroMoveWhileJumping ( poi, dir, collision ) {
        return (!collision.map && !collision.npc && !(collision.tiles && collision.tiles.action.length && collision.tiles.action[ 0 ].stop));
    }


    canHeroResetMaxV ( poi, dir, collision ) {
        return (this.hero.physics.maxv !== this.hero.physics.controlmaxv && this.hero.verb !== Config.verbs.LIFT);
    }


    canHeroEventDoor ( poi, dir, collision ) {
        return (collision.event.type === Config.events.DOOR);
    }


    canHeroEventBoundary ( poi, dir, collision ) {
        return (collision.event.type === Config.events.BOUNDARY && collision.camera);
    }


    canHeroTileStop ( poi, dir, collision ) {
        return (collision.tiles && collision.tiles.action.length && collision.tiles.action[ 0 ].stop);
    }


    canHeroLift ( poi, dir, collision ) {
        return (dir === Config.opposites[ this.hero.dir ]);
    }


    canHeroTileJump ( poi, dir, collision ) {
        return (collision.tiles && collision.tiles.action.length && collision.tiles.action[ 0 ].jump && (collision.tiles.action[ 0 ].collides.width > (collision.tiles.action[ 0 ].tilebox.width / 2) || collision.tiles.action[ 0 ].collides.height > (collision.tiles.action[ 0 ].tilebox.height / 2)) && this.hero.verb !== Config.verbs.LIFT && dir === collision.tiles.action[ 0 ].instance.data.action.require.dir);
    }


    handleHeroJump ( poi, dir ) {
        this.jumping = true;
        this.hero.cycle( Config.verbs.JUMP, this.hero.dir );
        this.hero.physics.vz = -16;
        this.hero.layer = "foreground";
        this.player.gameaudio.hitSound( Config.verbs.JUMP );
        this.keyTimer = setTimeout(() => {
            this.jumping = false;
            this.hero.layer = "background";
            this.hero.face( this.hero.dir );

        }, 500 );
    }


    applyHeroTileJump ( poi, dir ) {
        this.player.controls[ this.hero.dir ] = true;

        if ( (dir === "left" && this.hero.position.x <= this.parkour.landing.x) || (dir === "right" && this.hero.position.x >= this.parkour.landing.x) || (dir === "up" && this.hero.position.y <= this.parkour.landing.y) || (dir === "down" && this.hero.position.y >= this.parkour.landing.y) ) {
            const dpad = this.player.gamepad.checkDpad();
            const dpadDir = dpad.find(( ctrl ) => {
                return (ctrl.btn[ 0 ] === this.hero.dir);
            });

            if ( !dpadDir ) {
                this.player.controls[ this.hero.dir ] = false;
            }

            this.parkour = false;
            this.hero.layer = "background";
            this.hero.face( this.hero.dir );
        }
    }


    handleHeroTileJump ( poi, dir, tile ) {
        const distance = this.map.data.tilesize + (this.map.data.tilesize * tile.instance.data.elevation);

        this.parkour = {
            distance,
            landing: {
                x: (dir === "left" ? this.hero.position.x - distance : dir === "right" ? this.hero.position.x + distance : this.hero.position.x),
                y: (dir === "up" ? this.hero.position.y - distance : dir === "down" ? this.hero.position.y + distance : this.hero.position.y),
            },
        };
        this.jumping = true;
        this.hero.cycle( Config.verbs.JUMP, this.hero.dir );
        this.hero.physics.vz = -16;
        this.hero.layer = "foreground";
        this.player.controls[ this.hero.dir ] = true;
        this.player.gameaudio.hitSound( "parkour" );
        this.keyTimer = setTimeout(() => {
            this.jumping = false;
            this.hero.face( this.hero.dir );

        }, 500 );
    }


    handleHeroPush ( poi, dir ) {
        this.interact.push++;

        if ( (this.hero.verb !== Config.verbs.LIFT) && (this.interact.push > this.map.data.tilesize) ) {
            this.hero.cycle( Config.verbs.PUSH, dir );

        } else if ( this.hero.verb !== Config.verbs.LIFT ) {
            this.hero.cycle( Config.verbs.WALK, dir );
        }
    }


    handleHeroCamera ( poi, dir ) {
        this.hero.cycle( this.hero.verb, dir );
    }


    handleHeroEventDoor ( poi, dir, event ) {
        this.changeMap( event );
    }


    handleHeroEventBoundary ( poi, dir, event ) {
        this.switchMap( event );
    }


    handleHeroLift ( poi, dir ) {
        this.locked = true;
        this.hero.cycle( Config.verbs.PULL, dir );
        setTimeout(() => {
            const activeTiles = this.map.getActiveTiles( this.interact.tile.group );
            const tileCel = activeTiles.getTile();

            this.player.gameaudio.hitSound( Config.verbs.LIFT );
            this.map.spliceActiveTile( this.interact.tile.group, this.interact.tile.coord );
            this.interact.tile.sprite = new Sprite({
                type: Config.npc.FLOAT,
                layer: "foreground",
                width: this.map.data.tilesize,
                height: this.map.data.tilesize,
                spawn: {
                    x: this.interact.tile.coord[ 0 ] * this.map.data.tilesize,
                    y: this.interact.tile.coord[ 1 ] * this.map.data.tilesize,
                },
                image: this.map.data.image,
                hitbox: {
                    x: 0,
                    y: 0,
                    width: this.map.data.tilesize,
                    height: this.map.data.tilesize,
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

        }, 250 );
    }


    handleHeroThrow () {
        this.hero.face( this.hero.dir );
        this.player.gameaudio.hitSound( Config.verbs.THROW );
        this.hero.physics.maxv = this.hero.physics.controlmaxv;
        this.handleThrow( this.interact.tile.sprite ).then(() => {
            this.player.gameaudio.hitSound( Config.verbs.SMASH );
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

            } else if ( tile.group === Config.tiles.HOLES ) {
                // if ( tile.amount >= (this.hero.footbox.width * this.hero.footbox.height) ) {
                //     this.falling = true;
                //     setTimeout(() => {
                //         this.falling = false;
                //
                //     }, 1000 );
                // }
            }
        });
    }


    handleHeroNPCAction ( poi, dir, obj ) {
        if ( obj.canInteract( dir ) ) {
            obj.doInteract( dir );
        }
    }


    handleHeroTileAction ( poi, dir, tile ) {
        const activeTiles = this.map.getActiveTiles( tile.group );

        if ( tile.instance.canInteract() ) {
            this.interact.tile = tile;

            if ( tile.instance.data.action.verb === Config.verbs.LIFT ) {
                this.hero.cycle( Config.verbs.GRAB, this.hero.dir );
            }
        }
    }


    handleHeroTileAttack ( poi, dir, tile ) {
        if ( tile.instance.canAttack() ) {
            tile.instance.attack( tile.coord );
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
            if ( sprite.data.ai === Config.npc.ROAM ) {
                this.handleRoam( sprite );

            } else if ( sprite.data.ai === Config.npc.WANDER ) {
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
            const dist = this.map.data.tilesize * 2;
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
                        npc: this.checkNPC( sprite.position, sprite ),
                        camera: this.checkCamera( sprite.position, sprite ),
                    };

                    if ( collision.map || collision.camera || collision.npc ) {
                        _complete();
                    }
                },
                onComplete: () => {
                    _complete();
                }
            });
        });
    }


    handleRoam ( sprite ) {
        if ( !sprite.counter ) {
            sprite.counter = Utils.random( 64, 192 );
            sprite.dir = ["left", "right", "up", "down"][ Utils.random( 0, 4 ) ];

            // console.log(
            //     `Roam: ${sprite.data.id}`,
            //     `Steps: ${sprite.dir} ${sprite.counter}`,
            // );

        } else {
            sprite.counter--;
        }

        if ( sprite.dir === "left" ) {
            sprite.controls.left = 1;
            sprite.controls.right = 0;
            sprite.controls.up = 0;
            sprite.controls.down = 0;

        } else if ( sprite.dir === "right" ) {
            sprite.controls.left = 0;
            sprite.controls.right = 1;
            sprite.controls.up = 0;
            sprite.controls.down = 0;

        } else if ( sprite.dir === "up" ) {
            sprite.controls.left = 0;
            sprite.controls.right = 0;
            sprite.controls.up = 1;
            sprite.controls.down = 0;

        } else if ( sprite.dir === "down" ) {
            sprite.controls.left = 0;
            sprite.controls.right = 0;
            sprite.controls.up = 0;
            sprite.controls.down = 1;
        }
    }


    handleWander ( sprite ) {
        if ( !sprite.counter ) {
            sprite.counter = Utils.random( 100, 200 );
            sprite.stepsX = Utils.random( 4, 60 );
            sprite.stepsY = Utils.random( 4, 60 );
            sprite.dirX = ["left", "right"][ Utils.random( 0, 2 ) ];
            sprite.dirY = ["down", "up"][ Utils.random( 0, 2 ) ];

            // console.log(
            //     `Wander: ${sprite.data.id}`,
            //     `StepsX: ${sprite.dirX} ${sprite.stepsX}`,
            //     `StepsY: ${sprite.dirY} ${sprite.stepsY}`,
            // );

        } else {
            sprite.counter--;
        }

        if ( sprite.stepsX ) {
            sprite.stepsX--;

            if ( sprite.dirX === "left" ) {
                sprite.controls.left = 1;
                sprite.controls.right = 0;

                if ( sprite.data.verbs[ sprite.verb ].left ) {
                    sprite.dir = "left";
                }

            } else {
                sprite.controls.right = 1;
                sprite.controls.left = 0;

                if ( sprite.data.verbs[ sprite.verb ].right ) {
                    sprite.dir = "right";
                }
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

                if ( sprite.data.verbs[ sprite.verb ].up ) {
                    sprite.dir = "up";
                }

            } else {
                sprite.controls.down = 1;
                sprite.controls.up = 0;

                if ( sprite.data.verbs[ sprite.verb ].down ) {
                    sprite.dir = "down";
                }
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
    changeMap ( event ) {
        // Pause the Player so no game buttons dispatch
        // Pausing triggers the GameBox to call this.hero.face( this.hero.dir )
        this.player.pause();

        // Fade out...
        this.player.element.classList.add( "is-fader" );

        setTimeout(() => {
            // Dupe the Hero
            const mapData = Loader.cash( event.map );
            const heroData = Utils.copy( this.hero.data );

            // Set a spawn index...
            heroData.spawn = (event.spawn || 0);

            // Destroy old Map
            this.map.destroy();

            // Create new Map
            this.map = new Map( mapData, heroData, this );

            // Inject the new Map element into the DOM
            this.player.screen.appendChild( this.map.element );

            // Initialize the new Map
            this.initMap();

            // Fade in...
            this.player.element.classList.remove( "is-fader" );

            // Resume game blit cycle...
            this.player.resume();

            // Show contextual location text...
            this.dialogue.auto({
                text: [
                    mapData.name
                ]
            });

        }, 1000 );
    }


    switchMap ( event ) {
        // Pause the Player so no game buttons dispatch
        // Pausing triggers the GameBox to call this.hero.face( this.hero.dir )
        this.player.pause();

        // Get the Map data
        const mapData = Loader.cash( event.map );

        // Create new Camera
        this.cam_ = Utils.copy( this.camera );

        // Will be the animation values for transition...
        const _css = {
            map: null,
            map_: null,
            hero: null,
            hero_: null,
        };
        // Will be the new values for map_ and cam_
        const _val = {
            cam_: this.cam_,
            map_: {
                offset: null,
                transform: null,
                heroPosition: null,
            }
        };

        // Stage new Map / new Hero for animation
        if ( this.hero.dir === "down" ) {
            // Presets
            _val.cam_.y = 0;
            _val.map_.offset = {
                x: this.map.offset.x,
                y: 0,
            };
            _val.map_.transform = `translate3d(
                0,
                ${this.player.height}px,
                0
            )`;
            _val.map_.heroPosition = {
                x: this.hero.position.x,
                y: -this.hero.height,
                z: 0,
            };

            // Animation values
            _css.map_ = {
                axis: "y",
                from: this.player.height,
                to: 0,
            };
            _css.map = {
                axis: "y",
                from: 0,
                to: -this.player.height,
            };
            _css.hero_ = {
                axis: "y",
                from: -this.hero.height,
                to: 0,
            };
            _css.hero = {
                axis: "y",
                from: this.hero.position.y,
                to: this.hero.position.y + this.hero.height,
            };

        } else if ( this.hero.dir === "up" ) {
            // Presets
            _val.cam_.y = this.map.height - this.camera.height;
            _val.map_.offset = {
                x: this.map.offset.x,
                y: -(this.map.height - this.camera.height),
            };
            _val.map_.transform = `translate3d(
                0,
                ${-this.player.height}px,
                0
            )`;
            _val.map_.heroPosition = {
                x: this.hero.position.x,
                y: this.map.height,
                z: 0,
            };

            // Animation values
            _css.map_ = {
                axis: "y",
                from: -this.player.height,
                to: 0,
            };
            _css.map = {
                axis: "y",
                from: 0,
                to: this.player.height,
            };
            _css.hero_ = {
                axis: "y",
                from: this.map.height,
                to: this.map.height - this.hero.height,
            };
            _css.hero = {
                axis: "y",
                from: this.hero.position.y,
                to: this.hero.position.y - this.hero.height,
            };

        } else if ( this.hero.dir === "right" ) {
            // Presets
            _val.cam_.x = 0;
            _val.map_.offset = {
                x: 0,
                y: this.map.offset.y,
            };
            _val.map_transform = `translate3d(
                ${this.player.width}px,
                0,
                0
            )`;
            _val.map_.heroPosition = {
                x: -this.hero.width,
                y: this.hero.position.y,
                z: 0,
            };

            // Animation values
            _css.map_ = {
                axis: "x",
                from: this.player.width,
                to: 0,
            };
            _css.map = {
                axis: "x",
                from: 0,
                to: -this.player.width,
            };
            _css.hero_ = {
                axis: "x",
                from: -this.hero.width,
                to: 0,
            };
            _css.hero = {
                axis: "x",
                from: this.hero.position.x,
                to: this.hero.position.x + this.hero.width,
            };

        } else if ( this.hero.dir === "left" ) {
            // Presets
            _val.cam_.x = this.map.width - this.camera.width;
            _val.map_.offset = {
                x: -(this.map.width - this.camera.width),
                y: this.map.offset.y,
            };
            _val.map_.transform = `translate3d(
                ${-this.player.width}px,
                0,
                0
            )`;
            _val.map_.heroPosition = {
                x: this.map.width,
                y: this.hero.position.y,
                z: 0,
            };

            // Animation values
            _css.map_ = {
                axis: "x",
                from: -this.player.width,
                to: 0,
            };
            _css.map = {
                axis: "x",
                from: 0,
                to: this.player.width,
            };
            _css.hero_ = {
                axis: "x",
                from: this.map.width,
                to: this.map.width - this.hero.width,
            };
            _css.hero = {
                axis: "x",
                from: this.hero.position.x,
                to: this.hero.position.x - this.hero.width,
            };
        }

        // New values for cam_
        this.cam_ = _val.cam_;

        // Dupe current Hero data
        const heroData = Utils.copy( this.hero.data );

        // Shim a spawn index based on initial new Hero position
        mapData.spawn.push( _val.map_.heroPosition );
        mapData.spawn[ mapData.spawn.length - 1 ][ _css.hero_.axis ] = _css.hero_.from;
        heroData.spawn = mapData.spawn.length - 1;

        // Create new Map and apply calculations
        this.map_ = new Map( mapData, heroData, this );
        this.map_.offset = _val.map_.offset;
        this.map_.hero.position = _val.map_.heroPosition;
        this.map_.element.style.webkitTransform = _val.map_.transform;

        // Update new Map's Hero
        this.map_.hero.face( this.hero.dir );
        this.map_.hero.idle = this.hero.idle;

        // Inject the new Map element into the DOM
        this.player.screen.appendChild( this.map_.element );

        // Animate Maps and Hero and resolve all tweens for clean-up
        Promise.all([
            // New Map, New Hero
            this.switchMapTween( this.map_, _css.map_ ),
            this.switchMapTween( this.map_.hero, _css.hero_ ),

            // Old Map, Old Hero
            this.switchMapTween( this.map, _css.map ),
            this.switchMapTween( this.hero, _css.hero ),

        ]).then(() => {
            setTimeout(() => {
                // Destroy old Map & Set the new Map
                this.map.destroy();
                this.map = this.map_;
                this.map_ = null;
                this.cam_ = null;

                // Initialize the new Map
                this.initMap();

                // Resume game blit cycle...
                this.player.resume();

            }, 250 );
        });
    }


    switchMapTween ( obj, css ) {
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
                duration: 500,
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
}



module.exports = TopView;
