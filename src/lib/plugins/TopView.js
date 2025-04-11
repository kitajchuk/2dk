import Utils from "../Utils";
import Config, { DIRS } from "../Config";
import Loader from "../Loader";
import GameBox from "../GameBox";
import Map from "../maps/Map";
import Spring from "../Spring";
import Tween from "../Tween";
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
            // fall: {
            //     tween?
            // }
            fall: null,
            push: 0,
        };
        // parkour: {
        //     tween?
        // }
        this.parkour = null;
        this.attacking = false;
        this.running = false;
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

        // dropin effect for new map?
        if ( this.dropin && this.hero.position.z === 0 ) {
            this.dropin = false;
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

        } else if ( x >= ( this.map.width - this.camera.width ) ) {
            offset.x = -( this.map.width - this.camera.width );

        } else {
            offset.x = 0;
        }

        if ( y >= 0 && y <= ( this.map.height - this.camera.height ) ) {
            offset.y = -y;

        } else if ( y >= ( this.map.height - this.camera.height ) ) {
            offset.y = -( this.map.height - this.camera.height );

        } else {
            offset.y = 0;
        }

        this.offset = offset;
        this.camera.x = Math.abs( offset.x );
        this.camera.y = Math.abs( offset.y );
    }


/*******************************************************************************
* GamePad Inputs
*******************************************************************************/
    pressD ( dir ) {
        if ( this.dropin ) {
            return;
        }

        const poi = this.hero.getNextPoiByDir( dir );

        this.handleHero( poi, dir );
    }


    releaseD () {
        if ( this.locked || this.jumping || this.falling || this.attacking || this.dropin ) {
            return;
        }

        if ( this.running ) {
            this.running = false;
            this.hero.resetMaxV();
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
        if ( this.locked || this.jumping || this.falling || this.attacking || this.dropin || this.dialogue.active ) {
            return;
        }

        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const collision = {
            npc: this.checkNPC( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
        };

        if ( collision.npc ) {
            this.handleHeroNPCAction( poi, this.hero.dir, collision.npc );

        } else if (
            collision.tiles &&
            collision.tiles.action.length &&
            collision.tiles.action[ 0 ].action &&
            collision.tiles.action[ 0 ].instance.canInteract( Config.verbs.LIFT ) &&
            // @check: hero-verb-check
            this.hero.can( Config.verbs.LIFT ) &&
            this.hero.can( Config.verbs.GRAB ) &&
            !this.interact.tile
        ) {
            this.interact.tile = collision.tiles.action[ 0 ];
            this.hero.cycle( Config.verbs.GRAB, this.hero.dir );

        // Jump...
        } else if ( !this.hero.is( Config.verbs.LIFT ) && !this.hero.is( Config.verbs.GRAB ) ) {
            this.handleHeroJump( poi, this.hero.dir );
        }
    }


    holdA () {
        if ( this.jumping || this.falling || this.attacking || this.dropin ) {
            return;
        }

        Utils.log( "A Hold" );
    }


    releaseA () {
        if ( this.jumping || this.falling || this.attacking || this.dropin ) {
            return;
        }

        this.dialogue.check( true, false );

        this.handleReleaseA();
    }


    releaseHoldA () {
        if ( this.jumping || this.falling || this.attacking || this.dropin ) {
            return;
        }

        this.handleReleaseA();
    }


    pressB () {
        if ( this.attacking || this.dropin || this.dialogue.active ) {
            return;
        }

        // There will be extra blocking checks wrapped around this action
        if ( !this.jumping && !this.hero.is( Config.verbs.LIFT ) ) {
            switch ( this.player.data.bButton ) {
                case Config.verbs.RUN:
                    this.handleHeroRun();
                    break;
                case Config.verbs.ATTACK:
                    this.handleHeroAttack();
                    break;
            }
        }
    }


    holdB () {
        if ( this.jumping || this.falling || this.attacking || this.dropin ) {
            return;
        }

        if ( this.player.data.bButton === Config.verbs.RUN ) {
            this.handleHeroRun();
        }

        Utils.log( "B Hold" );
    }


    releaseB () {
        if ( this.jumping || this.falling || this.dropin ) {
            return;
        }

        if ( this.running ) {
            this.running = false;
            this.hero.resetMaxV();
        }

        if ( this.attacking ) {
            this.attacking = false;
        }

        this.dialogue.check( false, true );
    }


    releaseHoldB () {
        if ( this.jumping || this.falling || this.dropin ) {
            return;
        }

        if ( this.running ) {
            this.running = false;
            this.hero.resetMaxV();
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
        return (
            !collision.map &&
            !collision.npc &&
            !collision.camera &&
            !( collision.tiles && collision.tiles.action.length && collision.tiles.action.find( ( tile ) => {
                return tile.stop;
            }) )
        );
    }


    canHeroResetMaxV () {
        return ( this.hero.physics.maxv !== this.hero.physics.controlmaxv && !this.hero.is( Config.verbs.LIFT ) );
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


    canHeroTileFall ( poi, dir, collision ) {
        return ( collision.tiles && collision.tiles.action.length && collision.tiles.action.find( ( tile ) => {
            return tile.fall && Utils.contains( tile.tilebox, this.hero.footbox );
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
            ) &&
            !this.hero.is( Config.verbs.LIFT ) &&
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


/*******************************************************************************
* Hero Handlers...
*******************************************************************************/
    handleReleaseA () {
        if ( this.jumping || this.attacking || this.dropin || this.running ) {
            return;
        }

        if ( this.hero.is( Config.verbs.GRAB ) ) {
            this.hero.face( this.hero.dir );
        }

        if ( this.hero.is( Config.verbs.LIFT ) ) {
            if ( this.interact.tile.throw ) {
                this.handleHeroThrow();

            } else {
                this.interact.tile.throw = true;
            }

        } else {
            this.interact.tile = null;
        }
    }


    handleResetHeroDirs () {
        DIRS.forEach( ( dir ) => {
            this.player.controls[ dir ] = false;
        });
    }


    handleCriticalReset () {
        // Timer used for jumping / parkour
        if ( this.keyTimer ) {
            clearTimeout( this.keyTimer );
            this.keyTimer = null;
        }

        // Applied for parkour
        // this.player.controls[ this.hero.dir ] = false;
        this.handleResetHeroDirs();

        // To kill any animated sprite cycling (jump etc...)
        this.hero.face( this.hero.dir );

        // Reset flags
        this.parkour = false;
        this.jumping = false;
        this.falling = false;
        this.attacking = false;
        this.running = false;

        // Reset speed
        this.hero.resetMaxV();
    }


    handleHero ( poi, dir ) {
        if ( this.locked || this.jumping || this.falling || this.parkour || this.dropin ) {
            this.interact.push = 0;
        }

        if ( this.locked || this.falling || this.parkour || this.attacking ) {
            return;
        }

        const collision = {
            map: this.checkMap( poi, this.hero ),
            npc: this.checkNPC( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
            event: this.checkEvents( poi, this.hero ),
            camera: this.checkCamera( poi, this.hero ),
        };

        if ( this.jumping ) {
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

        if ( this.hero.is( Config.verbs.GRAB ) ) {
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

            // When you fall down, you gotta get back up again...
            } else if ( this.canHeroTileFall( poi, dir, collision ) ) {
                this.handleHeroFall( poi, dir, collision.tiles );
                return;
            }

            // Handle any other tiles
            this.handleHeroTiles( poi, dir, collision.tiles );

        // Reset speed when not on a tile
        } else if ( this.canHeroResetMaxV( poi, dir, collision ) ) {
            this.hero.resetMaxV();
        }

        // Remove mask when not on a tile (duh)
        if ( !collision.tiles || !collision.tiles.passive.length ) {
            this.hero.mask = false;
        }

        this.applyHero( poi, dir );
    }


    handleHeroJump () {
        // @check: hero-verb-check
        if ( !this.hero.can( Config.verbs.JUMP ) ) {
            return;
        }

        // Remove mask when jumping (will be reapplied if landing on a tile again)
        this.hero.mask = false;
        this.hero.resetMaxV();
        this.jumping = true;
        this.hero.cycle( Config.verbs.JUMP, this.hero.dir );
        this.hero.physics.vz = -( this.map.data.tilesize / 4 );
        this.player.gameaudio.hitSound( Config.verbs.JUMP );
        this.keyTimer = setTimeout( () => {
            this.jumping = false;
            this.hero.face( this.hero.dir );

        }, this.hero.getDur( Config.verbs.JUMP ) );
    }


    handleHeroTileJump ( poi, dir, tile ) {
        this.handleResetHeroDirs();

        // Get the axis and increment
        const axis = dir === "left" || dir === "right" ? 0 : 1;
        const increment = dir === "left" || dir === "up" ? -1 : 1;

        // Get the next tile
        // What we're doing here is finding the next tile in the direction of the jump as a reference
        // Then we're looping through proceeding tiles until we find one that doesn't match the reference tile
        // This allows us to find the destination tile to land on which assumes all tiles in between are the same
        // E.g. this example implies the direction of the jump is "down"
        // [ jump tile ] <- tile that triggers the jump
        // [ wall tile ] <- reference tile (first tile after the trigger tile in the direction of the jump)
        // [ wall tile ] <- proceeding tile (matching the reference tile)
        // [ wall tile ] <- proceeding tile (matching the reference tile)
        // [ land tile ] <- destination tile (first tile that doesn't match the reference tile)
        const textures = this.map.data.textures[ tile.instance.data.layer ];
        const nextCoord = [ ...tile.coord ];
        nextCoord[ axis ] += increment;
        const textureTile = textures[ nextCoord[ 1 ] ][ nextCoord[ 0 ] ];
        const tileRef = textureTile[ textureTile.length - 1 ];

        // Get the elevation
        // This is the number of proceeding tiles that match the reference tile plus the reference tile itself
        // E.g. in the example above, the elevation is 3
        let nextTile = tileRef;
        let elevation = 1;

        while ( nextTile[ 0 ] === tileRef[ 0 ] && nextTile[ 1 ] === tileRef[ 1 ] ) {
            nextCoord[ axis ] += increment;
            const nextTextureTile = textures[ nextCoord[ 1 ] ][ nextCoord[ 0 ] ];
            nextTile = nextTextureTile[ nextTextureTile.length - 1 ];
            elevation++;
        }

        // Get the destination tile
        // We can dynamically the variable axis to get the correct tile based on increment and elevation
        let destPos;
        const destTile = [
            tile.tilebox.x,
            tile.tilebox.y,
        ];
        destTile[ axis ] = destTile[ axis ] + ( increment * ( this.map.data.tilesize * elevation ) );

        // Get the destination position
        switch ( dir ) {
            case "left":
                destPos = {
                    x: destTile[ 0 ],
                    y: destTile[ 1 ] - ( ( this.hero.height - this.map.data.tilesize ) / 2 ),
                };
                break;

            case "right":
                destPos = {
                    x: destTile[ 0 ] - ( this.hero.width - this.map.data.tilesize ),
                    y: destTile[ 1 ] - ( ( this.hero.height - this.map.data.tilesize ) / 2 ),
                };
                break;

            case "up":
                destPos = {
                    x: destTile[ 0 ] - ( ( this.hero.width - this.map.data.tilesize ) / 2 ),
                    y: destTile[ 1 ],
                };
                break;

            case "down":
                destPos = {
                    x: destTile[ 0 ] - ( ( this.hero.width - this.map.data.tilesize ) / 2 ),
                    y: destTile[ 1 ] - ( this.hero.height - this.map.data.tilesize ),
                };
                break;
        }

        const destEvent = this.getVisibleEvents().find( ( evt ) => {
            return (
                evt.coords[ 0 ] * this.map.data.tilesize === destTile[ 0 ] &&
                evt.coords[ 1 ] * this.map.data.tilesize === destTile[ 1 ]
            );
        });

        this.jumping = true;
        this.hero.cycle( Config.verbs.JUMP, dir );
        this.hero.physics.vz = -( this.map.data.tilesize / 2.6667 );
        this.player.gameaudio.hitSound( "parkour" );
        this.parkour = {};
        this.parkour.tween = new Tween();
        this.parkour.tween.bind( this.hero );
        this.parkour.tween.tween({
            to: destPos,
            from: {
                x: this.hero.position.x,
                y: this.hero.position.y,
            },
            duration: this.hero.getDur( Config.verbs.JUMP ),
            complete: () => {
                if ( destEvent ) {
                    this.hero.cycle( Config.verbs.FALL, dir );
                    setTimeout( () => {
                        this.dropin = true;
                        this.hero.frameStopped = false;
                        this.handleCriticalReset();
                        this.handleHeroEventDoor( poi, dir, destEvent );
                        this.jumping = false;
                        this.parkour = null;

                    }, this.hero.getDur( Config.verbs.FALL ) );

                } else {
                    this.jumping = false;
                    this.parkour = null;
                    this.hero.face( dir );
                }
            },
        });
    }


    handleHeroPush ( poi, dir ) {
        this.interact.push++;

        if ( !this.hero.is( Config.verbs.LIFT ) && this.interact.push > this.map.data.tilesize ) {
            // @check: hero-verb-check
            if ( !this.hero.can( Config.verbs.PUSH ) ) {
                return;
            }

            this.hero.cycle( Config.verbs.PUSH, dir );

        } else if ( !this.hero.is( Config.verbs.LIFT ) ) {
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


    handleHeroRun () {
        const dpad = this.player.gamepad.checkDpad();

        if ( !dpad.length ) {
            return;
        }

        if ( this.running ) {
            return;
        }

        // @check: hero-verb-check
        if ( !this.hero.is( Config.verbs.WALK ) && !this.hero.can( Config.verbs.RUN ) ) {
            return;
        }

        this.running = true;
        this.hero.cycle( Config.verbs.RUN, this.hero.dir );
        this.hero.physics.maxv = this.hero.physics.controlmaxvstatic * 1.75;
        this.hero.physics.controlmaxv = this.hero.physics.controlmaxvstatic * 1.75;
    }

    handleHeroAttack () {
        if ( this.attacking ) {
            return;
        }

        // @check: hero-verb-check
        if ( !this.hero.can( Config.verbs.ATTACK ) ) {
            return;
        }

        this.attacking = true;
        this.hero.resetElapsed = true;
        this.hero.cycle( Config.verbs.ATTACK, this.hero.dir );

        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const weaponBox = this.hero.getWeaponbox();
        const collision = {
            npc: this.checkNPC( poi, weaponBox ),
            tiles: this.checkTiles( poi, weaponBox ),
        };

        if ( collision.npc && collision.npc.data.ai ) {
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


    handleHeroFall ( poi, dir, tiles ) {
        this.handleResetHeroDirs();

        const cycleDur = this.hero.getDur( Config.verbs.FALL );
        const fallTile = tiles.action.find( ( tile ) => {
            return tile.fall;
        });
        const fallCoords = fallTile.coord;
        const surroundingTiles = Utils.getSurroundingTileCoords( fallCoords );

        // Reset to the tile that the hero came from
        let resetTile;

        switch ( dir ) {
            case "up":
                resetTile = surroundingTiles.bottom;
                break;
            case "down":
                resetTile = surroundingTiles.top;
                break;
            case "left":
                resetTile = surroundingTiles.right;
                break;
            case "right":
                resetTile = surroundingTiles.left;
                break;
        }

        // Center the hero's hitbox on the reset tile when the fall animation is complete
        const finalOffsetX = ( ( this.hero.width - this.map.data.tilesize ) / 2 );
        const finalOffsetY = ( this.hero.height - this.map.data.tilesize );
        const finalResetPosition = {
            x: ( resetTile.x * this.map.data.tilesize ) - finalOffsetX,
            y: ( resetTile.y * this.map.data.tilesize ) - finalOffsetY,
        };

        // Center the hero's sprite on the fall tile as the animation's final destination
        const coordX = fallCoords[ 0 ] * this.map.data.tilesize;
        const coordY = fallCoords[ 1 ] * this.map.data.tilesize;
        const fallOffsetY = ( ( this.hero.height - this.map.data.tilesize ) / 2 );
        const fallOffsetX = ( ( this.hero.width - this.map.data.tilesize ) / 2 );
        const fallToPosition = {
            x: coordX - fallOffsetX,
            y: coordY - fallOffsetY,
        };

        this.falling = true;
        this.interact.fall = {};
        this.interact.fall.tween = new Tween();
        this.interact.fall.tween.bind( this.hero );
        this.interact.fall.tween.tween({
            to: fallToPosition,
            from: {
                x: this.hero.position.x,
                y: this.hero.position.y,
            },
            duration: cycleDur / 2,
            complete: () => {
                setTimeout( () => {
                    this.interact.fall.tween.tween({
                        to: finalResetPosition,
                        from: fallToPosition,
                        duration: cycleDur / 2,
                        complete: () => {
                            this.falling = false;
                            this.hero.frameStopped = false;
                            this.interact.fall = null;
                            this.hero.face( this.hero.dir );
                        },
                    });

                }, cycleDur / 2 );
            },
        });
        this.hero.cycle( Config.verbs.FALL, this.hero.dir );
    }


    handleHeroTiles ( poi, dir, tiles ) {
        tiles.passive.forEach( ( tile ) => {
            // Friction is a divider, it will slow you down a bit...
            if ( tile.instance.data.friction ) {
                this.hero.physics.maxv = this.hero.physics.controlmaxv / tile.instance.data.friction;
            }
        });

        // Mask is a boolean, it will mask the hero sprite...
        this.hero.mask = tiles.passive.some( ( tile ) => tile.instance.data.mask );
    }


    handleHeroNPCAction ( poi, dir, npc ) {
        if ( npc.canInteract( dir ) ) {
            npc.doInteract( dir );
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
    }


    handleThrow ( sprite ) {
        sprite.throwing = this.hero.dir;

        let throwX;
        let throwY;
        const dist = this.map.data.tilesize * 2;

        if ( sprite.throwing === "left" ) {
            throwX = sprite.position.x - dist;
            throwY = sprite.hero.footbox.y - ( sprite.height - this.hero.footbox.height );
        }

        if ( sprite.throwing === "right" ) {
            throwX = sprite.position.x + dist;
            throwY = sprite.hero.footbox.y - ( sprite.height - this.hero.footbox.height );
        }

        if ( sprite.throwing === "up" ) {
            throwX = sprite.position.x;
            throwY = sprite.position.y - dist;
        }

        if ( sprite.throwing === "down" ) {
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
        }

        if ( this.hero.dir === "up" ) {
            return {
                x: this.hero.position.x,
                y: this.map.height - this.hero.height,
                z: 0,
            };
        }

        if ( this.hero.dir === "right" ) {
            return {
                x: 0,
                y: this.hero.position.y,
                z: 0,
            };
        }

        if ( this.hero.dir === "left" ) {
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
                this.hero.position.z = -( this.camera.height / 2 );
            }

            // Create a new Companion
            if ( this.companion ) {
                const newCompanionData = structuredClone( this.hero.data.companion );
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
