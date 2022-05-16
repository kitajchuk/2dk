import Utils from "../Utils";
import Config from "../Config";
import Loader from "../Loader";
import GameBox from "../GameBox";
import Map from "../Map";
import Sprite from "../sprites/Sprite";
import Companion from "../sprites/Companion";
import { TweenLite, Power4 } from "gsap";



class TopView extends GameBox {
    constructor ( player ) {
        super( player );

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
        this.dropin = false;
        this.keyTimer = null;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blit ( elapsed ) {
        this.clear();

        // blit hero
        this.hero.blit( elapsed );
        
        // blit companion
        if ( this.companion ) {
            this.companion.blit( elapsed );
        }

        // blit map
        this.map.blit( elapsed );

        // update gamebox (camera)
        this.update();

        // update hero
        this.hero.update();

        // update companion
        if ( this.companion ) {
            this.companion.update();
        }

        // update map
        this.map.update( this.offset );

        // render companion behind hero?
        if ( this.companion && this.companion.data.type !== Config.npc.FLOAT && this.companion.hitbox.y < this.hero.hitbox.y ) {
            this.companion.render();
        }

        // render hero
        this.hero.render();

        // render companion infront of hero?
        if ( this.companion && (this.companion.data.type !== Config.npc.FLOAT && this.companion.hitbox.y > this.hero.hitbox.y) ) {
            this.companion.render();
        }

        // render map
        this.map.render( this.camera );

        // render companion infront of everything?
        if ( this.companion && this.companion.data.type === Config.npc.FLOAT ) {
            this.companion.render();
        }
    }


    update () {
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
                if ( this.canHeroEventDoor( poi, dir, collision ) && collision.event.amount >= (786 / this.camera.resolution) ) {
                    this.dropin = true;
                    this.handleCriticalReset();
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


    canHeroResetMaxV () {
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


    canHeroLift ( poi, dir ) {
        return (dir === Config.opposites[ this.hero.dir ]);
    }


    canHeroTileJump ( poi, dir, collision ) {
        return (collision.tiles && collision.tiles.action.length && collision.tiles.action[ 0 ].jump && (collision.tiles.action[ 0 ].collides.width > (collision.tiles.action[ 0 ].tilebox.width / 2) || collision.tiles.action[ 0 ].collides.height > (collision.tiles.action[ 0 ].tilebox.height / 2)) && this.hero.verb !== Config.verbs.LIFT && dir === collision.tiles.action[ 0 ].instance.data.action.require.dir);
    }


    handleHeroJump () {
        this.jumping = true;
        this.hero.cycle( Config.verbs.JUMP, this.hero.dir );
        this.hero.physics.vz = -16;
        this.player.gameaudio.hitSound( Config.verbs.JUMP );
        this.keyTimer = setTimeout(() => {
            this.jumping = false;
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
        this.player.stop();
    }


    handleHeroEventBoundary ( poi, dir, event ) {
        this.changeMap( event );
        this.player.stop();
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
        if ( sprite.cooldown ) {
            return sprite.cooldown--;
        }

        const dirs = ["left", "right", "up", "down"];

        if ( !sprite.counter ) {
            sprite.counter = Utils.random( 64, 192 );
            sprite.dir = dirs[ Utils.random( 0, dirs.length ) ];

            // console.log(
            //     `Roam: ${sprite.data.id}`,
            //     `Steps: ${sprite.dir} ${sprite.counter}`,
            // );

        } else {
            sprite.counter--;
        }

        dirs.forEach(( dir ) => {
            if ( dir === sprite.dir ) {
                sprite.controls[ dir ] = 1;

            } else {
                sprite.controls[ dir ] = 0;
            }
        });
    }


    handleWander ( sprite ) {
        if ( sprite.cooldown ) {
            return sprite.cooldown--;
        }

        if ( !sprite.counter ) {
            sprite.counter = Utils.random( 100, 200 );
            sprite.stepsX = Utils.random( 4, 60 );
            sprite.stepsY = Utils.random( 4, 60 );

            if ( sprite.collided ) {
                sprite.collided = false;
                sprite.dirX = Config.opposites[ sprite.dirX ];
                sprite.dirY = Config.opposites[ sprite.dirY ];
                // console.log( `Wander: ${sprite.data.id} collided so using opposites` );


            } else {
                sprite.dirX = ["left", "right"][ Utils.random( 0, 2 ) ];
                sprite.dirY = ["down", "up"][ Utils.random( 0, 2 ) ];
            }

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

            sprite.controls[ sprite.dirX ] = 1;
            sprite.controls[ Config.opposites[ sprite.dirX ] ] = 0;

            if ( sprite.data.verbs[ sprite.verb ][ sprite.dirX ] ) {
                sprite.dir = sprite.dirX;
            }

        } else {
            sprite.controls.left = 0;
            sprite.controls.right = 0;
        }

        if ( sprite.stepsY ) {
            sprite.stepsY--;

            sprite.controls[ sprite.dirY ] = 1;
            sprite.controls[ Config.opposites[ sprite.dirY ] ] = 0;

            if ( sprite.data.verbs[ sprite.verb ][ sprite.dirY ] ) {
                sprite.dir = sprite.dirY;
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
    getNewHeroPosition () {
        if ( this.hero.dir === "down" ) {
            return {
                x: this.hero.position.x,
                y: 0,
                z: 0,
            };

        } else if ( this.hero.dir === "up" ) {
            return {
                x: this.hero.position.x,
                y: this.map.height - this.hero.height,
                z: 0,
            };

        } else if ( this.hero.dir === "right" ) {
            return {
                x: 0,
                y: this.hero.position.y,
                z: 0,
            };

        } else if ( this.hero.dir === "left" ) {
            return {
                x: this.map.width - this.hero.width,
                y: this.hero.position.y,
                z: 0,
            };
        }
    }


    changeMap ( event ) {
        // Pause the Player so no game buttons dispatch
        this.player.pause();

        // Fade out...
        this.player.element.classList.add( "is-fader" );

        setTimeout(() => {
            // New Map data
            const newMapData = Loader.cash( event.map );
            const newHeroPos = this.getNewHeroPosition();

            // Set a spawn index...
            this.hero.position.x = (event.spawn !== undefined ? newMapData.spawn[ event.spawn ].x : newHeroPos.x);
            this.hero.position.y = (event.spawn !== undefined ? newMapData.spawn[ event.spawn ].y : newHeroPos.y);

            // Destroy old Map
            this.map.destroy();

            // Create new Map
            this.map = new Map( newMapData, this );
            this.hero.map = this.map;

            // Initialize the new Map
            // Applies new hero offset!
            this.initMap();

            // Handle the `dropin` effect
            if ( this.dropin ) {
                this.dropin = false;
                this.hero.position.z = -(this.camera.height / 2);
            }

            // Create a new Companion
            if ( this.companion ) {
                const newCompanionData = Utils.copy( this.hero.data.companion );
                newCompanionData.spawn = {
                    x: this.hero.position.x,
                    y: this.hero.position.y,
                };
                this.companion.destroy();
                this.companion = new Companion( newCompanionData, this.hero );
            }

            // Fade in...
            this.player.element.classList.remove( "is-fader" );

            // Resume game blit cycle...
            this.player.resume();

        }, 1000 );
    }
}



export default TopView;
