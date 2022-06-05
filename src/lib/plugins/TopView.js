import Utils from "../Utils";
import Config from "../Config";
import Loader from "../Loader";
import GameBox from "../GameBox";
import Map from "../Map";
import Spring from "../Spring";
import Sprite from "../sprites/Sprite";
import Companion from "../sprites/Companion";



class TopView extends GameBox {
    constructor ( player ) {
        super( player );

        // Interactions
        this.interact = {
            // npc: {
            //     sprite?
            //     spring?
            // }
            npc: null,
            // tile: {
            //     group?,
            //     coord?,
            //     throw?,
            //     sprite?
            //     spring?
            // }
            tile: null,
            push: 0,
        };
        // parkour: {
        //     distance?
        //     landing?
        // }
        this.parkour = null;
        this.attacking = false;
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

        // blit interaction tile sprite?
        if ( this.interact.tile && this.interact.tile.sprite && this.interact.tile.spring ) {
            this.handleThrowing( elapsed );
        }

        // blit interaction npc sprite?
        if ( this.interact.npc && this.interact.npc.sprite && this.interact.npc.spring ) {
            this.handleAttackNCP( elapsed );
        }

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
        if ( this.companion && ( this.companion.data.type !== Config.npc.FLOAT && this.companion.hitbox.y > this.hero.hitbox.y ) ) {
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
        const x = ( this.hero.position.x - ( ( this.camera.width / 2 ) - ( this.hero.width / 2 ) ) );
        const y = ( this.hero.position.y - ( ( this.camera.height / 2 ) - ( this.hero.height / 2 ) ) );
        const offset = {};

        if ( x >= 0 && x <= ( this.map.width - this.camera.width ) ) {
            offset.x = -x;

        } else {
            if ( x >= ( this.map.width - this.camera.width ) ) {
                offset.x = -( this.map.width - this.camera.width );

            } else {
                offset.x = 0;
            }
        }

        if ( y >= 0 && y <= ( this.map.height - this.camera.height ) ) {
            offset.y = -y;

        } else {
            if ( y >= ( this.map.height - this.camera.height ) ) {
                offset.y = -( this.map.height - this.camera.height );

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
        if ( this.locked || this.jumping || this.falling || this.attacking ) {
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
        if ( this.locked || this.jumping || this.falling || this.attacking ) {
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
        if ( this.jumping || this.falling || this.attacking ) {
            return;
        }

        Utils.log( "A Hold" );
    }


    releaseA () {
        if ( this.jumping || this.falling || this.attacking ) {
            return;
        }

        this.dialogue.check( true, false );

        this.handleReleaseA();
    }


    releaseHoldA () {
        if ( this.jumping || this.falling || this.attacking ) {
            return;
        }

        this.handleReleaseA();
    }


    pressB () {
        if ( this.attacking ) {
            return;
        }

        // There will be extra blocking checks wrapped around this action
        if ( !this.jumping ) {
            this.handleHeroAttack();
        }
    }


    holdB () {
        if ( this.jumping || this.falling || this.attacking ) {
            return;
        }

        Utils.log( "B Hold" );
    }


    releaseB () {
        if ( this.jumping || this.falling ) {
            return;
        }

        if ( this.attacking ) {
            this.attacking = false;
        }

        this.dialogue.check( false, true );
    }


    releaseHoldB () {
        if ( this.jumping || this.falling ) {
            return;
        }

        if ( this.attacking ) {
            this.attacking = false;
        }

        Utils.log( "B Hold Release" );
    }


/*******************************************************************************
* Hero Conditions...
*******************************************************************************/
    canHeroMoveWhileJumping ( poi, dir, collision ) {
        return ( !collision.map && !collision.npc && !( collision.tiles && collision.tiles.action.length && collision.tiles.action.find( ( tile ) => {
            return tile.stop;
        }) ) );
    }


    canHeroResetMaxV () {
        return ( this.hero.physics.maxv !== this.hero.physics.controlmaxv && this.hero.verb !== Config.verbs.LIFT );
    }


    canHeroEventDoor ( poi, dir, collision ) {
        return ( collision.event.type === Config.events.DOOR );
    }


    canHeroEventBoundary ( poi, dir, collision ) {
        return ( collision.event.type === Config.events.BOUNDARY && collision.camera );
    }


    canHeroTileStop ( poi, dir, collision ) {
        return ( collision.tiles && collision.tiles.action.length && collision.tiles.action.find( ( tile ) => {
            return tile.stop;
        }) );
    }


    canHeroLift ( poi, dir ) {
        return ( dir === Config.opposites[ this.hero.dir ] );
    }


    canHeroTileJump ( poi, dir, collision ) {
        return (
            collision.tiles &&
            collision.tiles.passive.length &&
            collision.tiles.passive[ 0 ].jump &&
            (
                collision.tiles.passive[ 0 ].collides.width > ( collision.tiles.passive[ 0 ].tilebox.width / 2 ) ||
                collision.tiles.passive[ 0 ].collides.height > ( collision.tiles.passive[ 0 ].tilebox.height / 2 )
            )
            && this.hero.verb !== Config.verbs.LIFT &&
            collision.tiles.passive[ 0 ].instance.canInteract( Config.verbs.JUMP ).dir === dir
        );
    }


/*******************************************************************************
* Hero apply methods...
*******************************************************************************/
    applyHero ( poi, dir ) {
        // Apply position
        this.hero.applyPosition( poi, dir );

        // Applly offset
        this.hero.applyOffset();

        // Apply the sprite animation cycle
        this.hero.applyCycle();
    }


    applyHeroTileJump ( poi, dir ) {
        this.player.controls[ this.hero.dir ] = true;

        if (
            ( dir === "left" && this.hero.position.x <= this.parkour.landing.x ) ||
            ( dir === "right" && this.hero.position.x >= this.parkour.landing.x ) ||
            ( dir === "up" && this.hero.position.y <= this.parkour.landing.y ) ||
            ( dir === "down" && this.hero.position.y >= this.parkour.landing.y )
        ) {
            const dpad = this.player.gamepad.checkDpad();
            const dpadDir = dpad.find( ( ctrl ) => {
                return ( ctrl.btn[ 0 ] === this.hero.dir );
            });

            if ( !dpadDir ) {
                this.player.controls[ this.hero.dir ] = false;
            }

            this.parkour = null;
            this.hero.face( this.hero.dir );
        }
    }


/*******************************************************************************
* Hero Handlers...
*******************************************************************************/
    handleReleaseA () {
        if ( this.jumping || this.attacking ) {
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
            this.interact.tile = null;
        }
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
        this.attacking = false;
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

        if ( this.locked || this.falling || this.attacking ) {
            return;

        } else if ( this.parkour ) {
            if ( collision.event ) {
                if ( this.canHeroEventDoor( poi, dir, collision ) && collision.event.amount >= 30 ) {
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
            this.handleHeroPush( poi, dir );
            return;
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
            // Tile will allow leaping from it's edge, like a ledge...
            if ( this.canHeroTileJump( poi, dir, collision ) ) {
                this.handleHeroTileJump(  poi, dir, collision.tiles.passive[ 0 ] );

            // Tile is behaves like a WALL, or Object you cannot walk on
            } else if ( this.canHeroTileStop( poi, dir, collision ) ) {
                this.handleHeroPush( poi, dir, collision.tiles.action[ 0 ] );
                return;
            }

            this.handleHeroTiles( poi, dir, collision.tiles );

        } else if ( this.canHeroResetMaxV( poi, dir, collision ) ) {
            this.hero.physics.maxv = this.hero.physics.controlmaxv;
        }

        this.applyHero( poi, dir );
    }


    handleHeroJump () {
        this.jumping = true;
        this.hero.cycle( Config.verbs.JUMP, this.hero.dir );
        this.hero.physics.vz = -16;
        this.player.gameaudio.hitSound( Config.verbs.JUMP );
        this.keyTimer = setTimeout( () => {
            this.jumping = false;
            this.hero.face( this.hero.dir );

        }, this.hero.getDur( Config.verbs.JUMP ) );
    }


    handleHeroTileJump ( poi, dir, tile ) {
        const dirs = ["left", "right", "up", "down"];
        const distance = this.map.data.tilesize + ( this.map.data.tilesize * tile.instance.data.elevation );

        dirs.forEach( ( d ) => {
            this.player.controls[ d ] = false;
        });

        this.parkour = {
            distance,
            landing: {
                x: ( dir === "left" ? this.hero.position.x - distance : dir === "right" ? this.hero.position.x + distance : this.hero.position.x ),
                y: ( dir === "up" ? this.hero.position.y - distance : dir === "down" ? this.hero.position.y + distance : this.hero.position.y ),
            },
        };
        this.jumping = true;
        this.hero.cycle( Config.verbs.JUMP, dir );
        this.hero.physics.vz = -24;
        this.player.controls[ dir ] = true;
        this.player.gameaudio.hitSound( "parkour" );
        this.keyTimer = setTimeout( () => {
            this.jumping = false;
            this.hero.face( dir );

        }, this.hero.getDur( Config.verbs.JUMP ) );
    }


    handleHeroPush ( poi, dir ) {
        this.interact.push++;

        if ( ( this.hero.verb !== Config.verbs.LIFT ) && ( this.interact.push > this.map.data.tilesize ) ) {
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
        setTimeout( () => {
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
                        },
                    },
                },

            }, this.map );
            this.interact.tile.sprite.hero = this.hero;
            this.map.addNPC( this.interact.tile.sprite );
            this.hero.cycle( Config.verbs.LIFT, this.hero.dir );
            this.hero.physics.maxv = this.hero.physics.controlmaxv / 2;
            this.locked = false;

        }, this.hero.getDur( Config.verbs.LIFT ) );
    }


    handleHeroThrow () {
        this.hero.face( this.hero.dir );
        this.player.gameaudio.hitSound( Config.verbs.THROW );
        this.hero.physics.maxv = this.hero.physics.controlmaxv;
        this.handleThrow( this.interact.tile.sprite );
    }


    handleHeroAttack () {
        this.attacking = true;
        this.hero.resetElapsed = true;
        this.hero.cycle( Config.verbs.ATTACK, this.hero.dir );

        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const weaponBox = this.hero.getWeaponbox();
        const collision = {
            npc: this.checkNPC( poi, weaponBox ),
            tiles: this.checkTiles( poi, weaponBox ),
        };

        if ( collision.npc ) {
            const poi = {};

            if ( this.hero.dir === "left" || this.hero.dir === "right" ) {
                if ( this.hero.position.y < collision.npc.position.y ) {
                    poi.y = collision.npc.position.y - ( collision.npc.position.y - this.hero.position.y );

                } else {
                    poi.y = this.hero.position.y - ( this.hero.position.y - collision.npc.position.y );
                }

            // up or down
            } else {
                if ( this.hero.position.x < collision.npc.position.x ) {
                    poi.x = collision.npc.position.x - ( collision.npc.position.x - this.hero.position.x );

                } else {
                    poi.x = this.hero.position.x - ( this.hero.position.x - collision.npc.position.x );
                }
            }

            if ( this.hero.dir === "left" ) {
                poi.x = collision.npc.position.x - this.map.data.tilesize;
            }

            if ( this.hero.dir === "right" ) {
                poi.x = collision.npc.position.x + this.map.data.tilesize;
            }

            if ( this.hero.dir === "up" ) {
                poi.y = collision.npc.position.y - this.map.data.tilesize;
            }

            if ( this.hero.dir === "down" ) {
                poi.y = collision.npc.position.y + this.map.data.tilesize;
            }

            this.interact.npc = {};
            this.interact.npc.sprite = collision.npc;
            this.interact.npc.sprite.attacked = true;
            this.interact.npc.spring = new Spring( this.player, collision.npc.position.x, collision.npc.position.y, 120, 3.5 );
            this.interact.npc.spring.poi = poi;
            // Don't bind so we can manage collision better
            // this.interact.npc.spring.bind( collision.npc );
        }

        if ( collision.tiles && collision.tiles.attack.length ) {
            collision.tiles.attack.forEach( ( tile ) => {
                if ( tile.attack ) {
                    this.handleHeroTileAttack( poi, this.hero.dir, tile );
                }
            });
        }

        this.player.gameaudio.hitSound( Config.verbs.ATTACK );

        setTimeout( () => {
            this.hero.face( this.hero.dir );

        }, this.hero.getDur( Config.verbs.ATTACK ) );
    }


    handleAttackNCP ( elapsed ) {
        if ( this.interact.npc.spring.isResting ) {
            this.interact.npc.sprite.attacked = false;

            if ( this.interact.npc.sprite.stats ) {
                this.interact.npc.sprite.stats.health -= this.hero.data.stats.power;

                if ( this.interact.npc.sprite.stats.health <= 0 ) {
                    this.smokeObject( this.interact.npc.sprite );
                    this.player.gameaudio.hitSound( Config.verbs.SMASH );
                    this.map.killObj( "npcs", this.interact.npc.sprite );
                }
            }

            this.interact.npc = null;

        } else {
            this.interact.npc.spring.blit( elapsed );

            const collision = {
                map: this.checkMap( this.interact.npc.spring.position, this.interact.npc.sprite ),
                npc: this.checkNPC( this.interact.npc.spring.position, this.interact.npc.sprite ),
                tiles: this.checkTiles( this.interact.npc.spring.position, this.interact.npc.sprite ),
                camera: this.checkCamera( this.interact.npc.spring.position, this.interact.npc.sprite ),
            };

            if ( !collision.map && !collision.npc && !collision.camera && !this.canHeroTileStop( this.interact.npc.sprite.position, null, collision ) ) {
                this.interact.npc.sprite.position.x = this.interact.npc.spring.position.x;
                this.interact.npc.sprite.position.y = this.interact.npc.spring.position.y;
            }
        }
    }


    handleHeroTiles ( poi, dir, tiles ) {
        tiles.passive.forEach( ( tile ) => {
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


    handleHeroNPCAction ( poi, dir, npc ) {
        if ( npc.canInteract( dir ) ) {
            npc.doInteract( dir );
        }
    }


    handleHeroTileAction ( poi, dir, tile ) {
        if ( tile.instance.canInteract() ) {
            this.interact.tile = tile;

            if ( tile.instance.canInteract( Config.verbs.LIFT ) ) {
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
        // Sprite movement is hindered when attacked...
        if ( sprite.data.ai && !sprite.attacked ) {
            if ( sprite.data.ai === Config.npc.ROAM ) {
                this.handleRoam( sprite );

            } else if ( sprite.data.ai === Config.npc.WANDER ) {
                this.handleWander( sprite );
            }
        }
    }


    handleThrow ( sprite ) {
        sprite.throwing = this.hero.dir;

        let throwX;
        let throwY;
        const dist = this.map.data.tilesize * 2;

        if ( sprite.throwing === "left" ) {
            throwX = sprite.position.x - dist;
            throwY = sprite.hero.footbox.y - ( sprite.height - this.hero.footbox.height );

        } else if ( sprite.throwing === "right" ) {
            throwX = sprite.position.x + dist;
            throwY = sprite.hero.footbox.y - ( sprite.height - this.hero.footbox.height );

        } else if ( sprite.throwing === "up" ) {
            throwX = sprite.position.x;
            throwY = sprite.position.y - dist;

        }  else if ( sprite.throwing === "down" ) {
            throwX = sprite.position.x;
            throwY = this.hero.footbox.y + dist;
        }

        this.interact.tile.spring = new Spring( this.player, sprite.position.x, sprite.position.y, 60, 3.5 );
        this.interact.tile.spring.poi = {
            x: throwX,
            y: throwY,
        };
        this.interact.tile.spring.bind( sprite );
    }


    handleThrowing ( elapsed ) {
        if ( this.interact.tile.spring.isResting ) {
            this.handleThrew();

        } else {
            const collision = {
                map: this.checkMap( this.interact.tile.sprite.position, this.interact.tile.sprite ),
                npc: this.checkNPC( this.interact.tile.sprite.position, this.interact.tile.sprite ),
                camera: this.checkCamera( this.interact.tile.sprite.position, this.interact.tile.sprite ),
            };

            if ( collision.map || collision.npc || collision.camera ) {
                this.handleThrew();

            } else {
                this.interact.tile.spring.blit( elapsed );
            }
        }
    }


    handleThrew () {
        this.smokeObject( this.interact.tile.sprite );
        this.player.gameaudio.hitSound( Config.verbs.SMASH );
        this.map.killObj( "npcs", this.interact.tile.sprite );
        this.interact.tile = null;
    }


    handleRoam ( sprite ) {
        const dirs = ["left", "right", "up", "down"];

        if ( !sprite.counter ) {
            sprite.counter = Utils.random( 64, 192 );
            sprite.dir = dirs[ Utils.random( 0, dirs.length ) ];

        } else {
            sprite.counter--;
        }

        dirs.forEach( ( dir ) => {
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


            } else {
                sprite.dirX = ["left", "right"][ Utils.random( 0, 2 ) ];
                sprite.dirY = ["down", "up"][ Utils.random( 0, 2 ) ];
            }

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

        // Emit map change event
        this.player.emit( Config.broadcast.MAPEVENT, event );

        setTimeout( () => {
            // New Map data
            const newMapData = Loader.cash( event.map );
            const newHeroPos = this.getNewHeroPosition();

            // Set a spawn index...
            this.hero.position.x = ( Utils.def( event.spawn ) ? newMapData.spawn[ event.spawn ].x : newHeroPos.x );
            this.hero.position.y = ( Utils.def( event.spawn ) ? newMapData.spawn[ event.spawn ].y : newHeroPos.y );

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
                this.hero.position.z = -( this.camera.height / 2 );
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
