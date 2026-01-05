import Utils from "../Utils";
import Config, { DIRS } from "../Config";
import GameBox from "../GameBox";
import Spring from "../Spring";
import Tween from "../Tween";
import FX from "../sprites/FX";
import { LiftedTile } from "../sprites/Hero";



class TopView extends GameBox {
    constructor ( player ) {
        super( player );

        // Interactions
        this.interact = {
            // tile: {
            //     group?,
            //     coord?,
            //     throw?,
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
        this.liftLocked = false;
        this.keyTimer = null;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blit ( elapsed ) {
        this.clear();

        // blit render queue
        this.renderQueue.blit( elapsed );

        // blit hero
        this.hero.blit( elapsed );

        // blit companion
        if ( this.companion ) {
            this.companion.blit( elapsed );
        }

        // blit map
        this.map.blit( elapsed );

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

        // render map
        this.map.render( this.camera, this.hero, this.companion );

        // render render queue
        this.renderQueue.render();

        // Visual event debugging....
        if ( this.player.query.get( "debug" ) ) {
            this.map.renderDebug();
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
        if ( this.dropin || this.hero.isHitOrStill() ) {
            return;
        }

        const poi = this.hero.getNextPoiByDir( dir );

        this.handleHero( poi, dir );
    }


    releaseD () {
        if ( this.locked || this.jumping || this.falling || this.attacking || this.dropin || this.hero.isHitOrStill() ) {
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
        if ( this.locked || this.jumping || this.falling || this.attacking || this.dropin || this.dialogue.active || this.liftLocked || this.hero.isHitOrStill() ) {
            return;
        }

        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const collision = {
            npc: this.checkNPC( poi, this.hero ),
            door: this.checkDoor( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
        };

        if ( collision.door ) {
            this.handleHeroDoorAction( poi, this.hero.dir, collision.door );

        } else if ( collision.npc ) {
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
        Utils.log( "A Hold" );

        if ( this.jumping || this.falling || this.attacking || this.dropin || this.hero.isHitOrStill() ) {
            return;
        }

    }


    releaseA () {
        if ( this.hero.itemGet ) {
            this.dialogue.check( true, false );
            return;
        }

        if ( this.jumping || this.falling || this.attacking || this.dropin || this.hero.isHitOrStill() ) {
            return;
        }

        this.dialogue.check( true, false );

        this.handleReleaseA();
    }


    releaseHoldA () {
        Utils.log( "A Hold Release" );

        if ( this.jumping || this.falling || this.attacking || this.dropin || this.hero.isHitOrStill() ) {
            return;
        }

        this.handleReleaseA();
    }


    // Common releaseA handler
    handleReleaseA () {
        if ( this.jumping || this.attacking || this.dropin || this.running || this.hero.isHitOrStill() ) {
            return;
        }

        if ( this.liftLocked ) {
            this.liftLocked = false;
        }

        if ( this.hero.is( Config.verbs.GRAB ) ) {
            this.hero.face( this.hero.dir );
        }

        if ( this.hero.is( Config.verbs.LIFT ) ) {
            if ( this.interact.tile.throw && this.hero.liftedTile ) {
                this.hero.liftedTile.throw();

            } else {
                this.interact.tile.throw = true;
            }

        } else {
            this.interact.tile = null;
        }
    }


    pressB () {
        if ( this.attacking || this.dropin || this.dialogue.active || this.hero.isHitOrStill() ) {
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
        Utils.log( "B Hold" );

        if ( this.jumping || this.falling || this.attacking || this.dropin || this.hero.isHitOrStill() ) {
            return;
        }

        if ( this.player.data.bButton === Config.verbs.RUN ) {
            this.handleHeroRun();
        }
    }


    releaseB () {
        if ( this.jumping || this.falling || this.dropin || this.hero.isHitOrStill() ) {
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
        Utils.log( "B Hold Release" );

        if ( this.jumping || this.falling || this.dropin || this.hero.isHitOrStill() ) {
            return;
        }

        if ( this.running ) {
            this.running = false;
            this.hero.resetMaxV();
        }

        if ( this.attacking ) {
            this.attacking = false;
        }

    }


/*******************************************************************************
* Interaction checks...
*******************************************************************************/
    isPushing () {
        return this.interact.push > this.map.data.tilesize;
    }


    isPushingNPC () {
        return this.interact.push > this.map.data.tilesize * 2;
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
        if ( this.hero.isHitOrStill() ) {
            return;
        }

        if ( this.locked || this.jumping || this.falling || this.parkour || this.dropin ) {
            this.interact.push = 0;
        }

        if ( this.locked || this.falling || this.parkour || this.attacking || this.liftLocked ) {
            return;
        }

        const collision = {
            map: this.checkMap( poi, this.hero ),
            npc: this.checkNPC( poi, this.hero ),
            door: this.checkDoor( poi, this.hero ),
            item: this.checkItems( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
            event: this.checkEvents( poi, this.hero ),
            camera: this.checkCamera( poi, this.hero ),
        };

        if ( this.jumping ) {
            if ( this.hero.canMoveWhileJumping( poi, dir, collision ) ) {
                this.applyHero( poi, dir );
            }

            return;
        }

        if ( collision.event ) {
            if ( this.hero.canEventBoundary( poi, dir, collision ) ) {
                this.handleHeroEventBoundary( poi, dir, collision.event );
                return;

            } else if ( this.hero.canEventDoor( poi, dir, collision ) ) {
                this.handleHeroEventDoor( poi, dir, collision.event );
                return;

            } else if ( this.hero.canEventDialogue( poi, dir, collision ) ) {
                this.handleHeroEventDialogue( poi, dir, collision.event );
                // No return as this is a passive event
            }
        }

        if ( collision.item ) {
            this.handleHeroItem( poi, dir, collision.item );
        }

        if ( collision.door ) {
            this.handleHeroPush( poi, dir );
            return;
        }

        if ( collision.npc ) {
            if ( collision.npc.data.type === Config.npc.types.ENEMY && !collision.npc.isHitOrStill() && !this.hero.canShield( collision.npc ) ) {
                this.hero.hit( collision.npc.stats.power );
                return;
            }

            this.handleHeroPush( poi, dir );

            if ( collision.npc.canDoAction( Config.verbs.PUSH ) ) {
                this.handleHeroPushNPC( poi, dir, collision );
            }
            
            return;
        }

        if ( collision.map ) {
            this.handleHeroPush( poi, dir );
            return;
        }

        if ( collision.camera ) {
            this.handleHeroCamera( poi, dir );

            if ( this.map.data.cellauto ) {
                this.handleHeroEdgeBoundary( poi, dir, collision );
            }

            return;
        }

        if ( this.hero.is( Config.verbs.GRAB ) ) {
            if ( this.hero.canLift( poi, dir, collision ) ) {
                this.handleHeroLift( poi, dir );
            }

            return;
        }

        if ( collision.tiles ) {
            // Tile will allow leaping from it's edge, like a ledge...
            if ( this.hero.canTileJump( poi, dir, collision ) ) {
                this.handleHeroTileJump( poi, dir, collision.tiles.passive.filter( ( tile ) => tile.jump ) );

            // Tile is behaves like a WALL, or Object you cannot walk on
            } else if ( this.hero.canTileStop( poi, dir, collision ) ) {
                this.handleHeroPush( poi, dir, collision.tiles.action[ 0 ] );
                return;

            // When you fall down, you gotta get back up again...
            } else if ( this.hero.canTileFall( poi, dir, collision ) ) {
                this.handleHeroFall( poi, dir, collision.tiles );
                return;
            }

            // Handle any other tiles
            this.handleHeroTiles( poi, dir, collision.tiles );

        // Reset speed when not on a tile
        } else if ( this.hero.canResetMaxV( poi, dir, collision ) ) {
            this.hero.resetMaxV();
        }

        // Remove mask when not on a tile (duh)
        if ( !collision.tiles || !collision.tiles.passive.length ) {
            this.hero.maskFX = null;
        }

        this.applyHero( poi, dir );
    }


    handleHeroJump () {
        // @check: hero-verb-check
        if ( !this.hero.can( Config.verbs.JUMP ) ) {
            return;
        }

        // Remove mask when jumping (will be reapplied if landing on a tile again)
        this.hero.maskFX = null;
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


    handleHeroTileJump ( poi, dir, jumpTiles ) {
        this.handleResetHeroDirs();

        // Get the axis and increment
        const axis = dir === "left" || dir === "right" ? 0 : 1;
        const increment = dir === "left" || dir === "up" ? -1 : 1;
        const tile = jumpTiles[ 0 ];

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
        let elevation = tile.instance.data.elevation || 1;

        // Optionally if elevation is set in the tile data we will just use that instead of calculating it!
        if ( !tile.instance.data.elevation ) {
            while ( nextTile[ 0 ] === tileRef[ 0 ] && nextTile[ 1 ] === tileRef[ 1 ] ) {
                nextCoord[ axis ] += increment;
                const nextTextureTile = textures[ nextCoord[ 1 ] ][ nextCoord[ 0 ] ];
                nextTile = nextTextureTile[ nextTextureTile.length - 1 ];
                elevation++;
            }
        }

        // Get the destination tile
        // We can dynamically the variable axis to get the correct tile based on increment and elevation
        let destPos;
        let destTile;
        
        // When moving horizontally, the destination tile is simply the next tile in the direction of the jump
        if ( dir === "left" || dir === "right" ) {
            destTile = [
                tile.tilebox.x + ( increment * ( this.map.data.tilesize ) ),
                tile.tilebox.y,
            ];

        } else {
            destTile = [
                tile.tilebox.x,
                tile.tilebox.y + ( increment * ( this.map.data.tilesize * elevation ) ),
            ];
        }

        // Get the destination event
        const destEvent = this.getVisibleEvents().find( ( evt ) => {
            return (
                evt.coords[ 0 ] * this.map.data.tilesize === destTile[ 0 ] &&
                evt.coords[ 1 ] * this.map.data.tilesize === destTile[ 1 ]
            );
        });
        const isEventDoor = destEvent && destEvent.type === Config.events.DOOR;

        // Get the destination position
        switch ( dir ) {
            case "left":
                destPos = {
                    x: destTile[ 0 ] - ( this.hero.width - this.map.data.tilesize ),
                    y: isEventDoor ? destTile[ 1 ] - ( ( this.hero.height - this.map.data.tilesize ) / 2 ) : this.hero.position.y,
                };
                break;

            case "right":
                destPos = {
                    x: destTile[ 0 ],
                    y: isEventDoor ? destTile[ 1 ] - ( ( this.hero.height - this.map.data.tilesize ) / 2 ) : this.hero.position.y,
                };
                break;

            case "up":
                destPos = {
                    x: isEventDoor ? destTile[ 0 ] - ( ( this.hero.width - this.map.data.tilesize ) / 2 ) : this.hero.position.x,
                    y: destTile[ 1 ],
                };
                break;

            case "down":
                destPos = {
                    x: isEventDoor ? destTile[ 0 ] - ( ( this.hero.width - this.map.data.tilesize ) / 2 ) : this.hero.position.x,
                    y: destTile[ 1 ] - ( this.hero.height - this.map.data.tilesize ),
                };
                break;
        }

        this.jumping = true;
        this.hero.cycle( Config.verbs.JUMP, dir );
        this.hero.physics.vz = -( this.map.data.tilesize / 2.6667 );
        this.player.gameaudio.hitSound( "parkour" );
        this.parkour = {};
        this.parkour.tween = new Tween( this );
        this.parkour.tween.bind( this.hero );
        this.parkour.tween.tween({
            to: destPos,
            from: {
                x: this.hero.position.x,
                y: this.hero.position.y,
            },
            duration: this.hero.getDur( Config.verbs.JUMP ),
            complete: () => {
                if ( isEventDoor ) {
                    if ( destEvent.verb && this.hero.can( destEvent.verb ) ) {
                        this.hero.cycle( destEvent.verb, dir );

                        setTimeout( () => {
                            this.dropin = true;
                            this.hero.frameStopped = false;
                            this.jumping = false;
                            this.parkour = null;
                            this.handleCriticalReset();
                            this.handleHeroEventDoor( poi, dir, destEvent );

                        }, this.hero.getDur( destEvent.verb ) );

                    } else {
                        this.jumping = false;
                        this.parkour = null;
                        this.handleCriticalReset();
                        this.handleHeroEventDoor( poi, dir, destEvent );
                    }

                } else {
                    this.jumping = false;
                    this.parkour = null;
                    this.hero.face( dir );

                    // Resume directional control if still active
                    const dpad = this.player.gamepad.checkDpad();

                    if ( dpad.length ) {
                        dpad.forEach( ( ctrl ) => {
                            ctrl.dpad.forEach( ( dir ) => {
                                this.player.controls[ dir ] = true;
                            });
                        });
                    }
                }
            },
        });
    }


    handleHeroPushNPC ( poi, dir, collision ) {
        // @check: hero-verb-check
        if ( !collision.npc.canDoAction( Config.verbs.PUSH ) ) {
            return;
        }

        if ( this.isPushingNPC() ) {
            this.locked = true;

            this.hero.face( dir );

            const destPos = {};
            const distance = this.map.data.tilesize;

            if ( dir === "left" ) {
                destPos.x = collision.npc.position.x - distance;
                destPos.y = collision.npc.position.y;
            } else if ( dir === "right" ) {
                destPos.x = collision.npc.position.x + distance;
                destPos.y = collision.npc.position.y;
            } else if ( dir === "up" ) {
                destPos.x = collision.npc.position.x;
                destPos.y = collision.npc.position.y - distance;
            } else if ( dir === "down" ) {
                destPos.x = collision.npc.position.x;
                destPos.y = collision.npc.position.y + distance;
            }

            if ( collision.npc.data.action.sound ) {
                this.player.gameaudio.hitSound( collision.npc.data.action.sound );
            }

            new Tween( this ).tween({
                to: destPos,
                from: collision.npc.position,
                duration: 1000,
                update: ( tweenPoi ) => {
                    const tweenCollision = {
                        map: this.checkMap( tweenPoi, collision.npc ),
                        camera: this.checkCamera( tweenPoi, collision.npc ),
                    };
                    const isCollision = tweenCollision.map || tweenCollision.camera;

                    if ( !isCollision ) {
                        collision.npc.position.x = tweenPoi.x;
                        collision.npc.position.y = tweenPoi.y;
                        collision.npc.applyOffset();
                    }
                },
                complete: () => {
                    this.interact.push = 0;
                    this.locked = false;
                },
            });
        }
    }


    handleHeroPush ( poi, dir ) {
        this.interact.push++;

        if ( !this.hero.is( Config.verbs.LIFT ) && this.isPushing() ) {
            // @check: hero-verb-check
            if ( !this.hero.can( Config.verbs.PUSH ) ) {
                return;
            }

            this.hero.cycle( Config.verbs.PUSH, dir );

        } else if ( !this.hero.is( Config.verbs.LIFT ) ) {
            this.hero.cycle( Config.verbs.WALK, dir );
        }
    }


    handleHeroItem ( poi, dir, item ) {
        if ( !item.canPickup() ) {
            return;
        }

        if ( item.data.sound ) {
            this.player.gameaudio.hitSound( item.data.sound );
        }

        if ( item.data.currency ) {
            this.hero.receive( item.data.currency );
        }

        if ( item.data.stat ) {
            this.hero.updateStat( item.data.stat.key, item.data.stat.value );
        }

        this.map.killObject( "items", item );
    }


    handleHeroCamera ( poi, dir ) {
        this.hero.cycle( this.hero.verb, dir );
    }


    handleHeroEventCleanup () {
        this.hero.liftedTile = null;
        this.interact.tile = null;
        this.dialogue.teardown();
    }


    handleHeroEventDoor ( poi, dir, event ) {
        this.handleHeroEventCleanup();
        this.player.stop();
        this.changeMap( event );
    }


    handleHeroEventBoundary ( poi, dir, event ) {
        this.handleHeroEventCleanup();
        this.player.stop();
        this.changeMap( event );
    }


    handleHeroEdgeBoundary ( poi, dir, collision ) {
        if ( collision.camera !== dir ) {
            return;
        }

        this.handleHeroEventCleanup();
        this.player.stop();
        this.changeCellautoMap( poi, dir, collision );
    }



    handleHeroEventDialogue ( poi, dir, event ) {
        // TODO: Add dialogue modes so this can be "auto" or "play" (user has to press A/B to advance)
        this.dialogue.auto({
            text: event.payload.dialogue.text,
        });

        if ( event.sound ) {
            this.currentMusic = event.sound.split( "/" ).pop().split( "." )[ 0 ];

            this.player.gameaudio.addSound({
                id: this.currentMusic,
                src: event.sound,
                channel: "bgm",
            });

            this.player.gameaudio.playSound( this.currentMusic );
        }
    }


    handleHeroLift ( poi, dir ) {
        const action = this.interact.tile.instance.data.actions.find( ( action ) => {
            return action.verb === Config.verbs.LIFT;
        });

        if ( action?.stat ) {
            const { key, value } = action.stat;

            if ( !this.hero.checkStat( key, value ) ) {
                this.liftLocked = true;
                this.dialogue.auto( action.stat.dialogue );
                this.hero.cycle( Config.verbs.PULL, dir );
                return;
            }
        }

        this.locked = true;
        this.hero.cycle( Config.verbs.PULL, dir );
        setTimeout( () => {
            const activeTiles = this.map.getActiveTiles( this.interact.tile.group );
            const tile = activeTiles.getTile();
            const spawn = {
                x: this.interact.tile.coord[ 0 ] * this.map.data.tilesize,
                y: this.interact.tile.coord[ 1 ] * this.map.data.tilesize,
            };

            this.player.gameaudio.hitSound( Config.verbs.LIFT );
            this.map.spliceActiveTile( this.interact.tile.group, this.interact.tile.coord );
            this.hero.liftedTile = new LiftedTile( spawn, tile, this.map, this.hero );
            this.hero.cycle( Config.verbs.LIFT, this.hero.dir );
            this.hero.physics.maxv = this.hero.physics.controlmaxv / 2;
            this.locked = false;

        }, this.hero.getDur( Config.verbs.LIFT ) );
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


    // Initializes the attach verb as an "action"
    handleHeroAttack () {
        if ( this.attacking ) {
            return;
        }
        
        // @check: hero-verb-check
        if ( !this.hero.can( Config.verbs.ATTACK ) || !this.hero.hasWeapon() ) {
            return;
        }
        
        this.attacking = true;
        this.hero.resetElapsed = true;
        this.hero.cycle( Config.verbs.ATTACK, this.hero.dir );
        this.player.gameaudio.hitSound( Config.verbs.ATTACK );

        setTimeout( () => {
            this.hero.face( this.hero.dir );
            
        }, this.hero.getDur( Config.verbs.ATTACK ) );
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
        this.interact.fall.tween = new Tween( this );
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
        if ( this.jumping || this.hero.isJumping() ) {
            return;
        }

        // Friction is a divider, it will slow you down a bit...
        this.handleFrictionTiles( tiles );

        // Mask is a reference to an FX, it will render above the hero sprite...
        this.handleMaskTiles( tiles );
    }


    handleMaskTiles ( tiles ) {
        const maskTiles = tiles.passive.filter( ( tile ) => tile.instance.data.mask );
        const maskTile = maskTiles.find( ( tile ) => tile.instance.data.mask );
        const maskAmount = Math.ceil( maskTiles.reduce( ( total, tile ) => {
            return total + tile.amount;
        }, 0 ) );

        if ( maskTile && maskAmount >= 100 ) {
            const maskData = this.player.data.fx.find( ( fx ) => fx.id === maskTile.instance.data.mask );
            
            if ( maskData && !this.hero.maskFX ) {
                this.hero.maskFX = new FX({
                    ...maskData,
                    spawn: {
                        x: this.hero.position.x,
                        y: this.hero.position.y,
                    },
                }, this.map );
            }

        } else if ( ( !maskTile || maskAmount < 100 ) && this.hero.maskFX ) {
            this.hero.maskFX = null;
        }
    }


    handleFrictionTiles ( tiles ) {
        const frictionTiles = tiles.passive.filter( ( tile ) => tile.instance.data.friction );
        const frictionAmount = Math.ceil( frictionTiles.reduce( ( total, tile ) => {
            return total + tile.amount;
        }, 0 ) );

        if ( frictionTiles.length && frictionAmount >= 100 ) {
            frictionTiles.forEach( ( tile ) => {
                this.hero.physics.maxv = this.hero.physics.controlmaxv / tile.instance.data.friction;
            });

        } else if ( this.hero.canResetMaxV() ) {
            this.hero.resetMaxV();
        }
    }


    handleHeroDoorAction ( poi, dir, door ) {
        // Try interaction first (dialogue, etc.)
        if ( door.canInteract( dir ) ) {
            door.doInteract( dir );
            return;
        }

        // Try quest check next
        if ( door.data.action?.quest?.checkFlag ) {
            door.handleQuestCheck( door.data.action.quest.checkFlag );
            return;
        }
        
        // Otherwise try action (open/close) if no quest is involved
        const verb = door.open ? Config.verbs.CLOSE : Config.verbs.OPEN;
        
        if ( door.canDoAction( verb ) ) {
            door.doAction( verb );
        }
    }


    handleHeroNPCAction ( poi, dir, npc ) {
        if ( npc.canInteract( dir ) ) {
            npc.doInteract( dir );
        }
    }
}



export default TopView;
