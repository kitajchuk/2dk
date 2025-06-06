import Utils from "../Utils";
import Config, { DIRS } from "../Config";
import GameBox from "../GameBox";
import Spring from "../Spring";
import Tween from "../Tween";
import Sprite from "../sprites/Sprite";
import FX from "../sprites/FX";



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
            // new FX
            mask: null,
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

        if ( this.interact.mask ) {
            this.interact.mask.blit( elapsed );
        }

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

        if ( this.interact.mask ) {
            this.interact.mask.update();
        }

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

        if ( this.interact.mask ) {
            this.interact.mask.render();
        }

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
        Utils.log( "A Hold" );

        if ( this.jumping || this.falling || this.attacking || this.dropin ) {
            return;
        }

    }


    releaseA () {
        if ( this.jumping || this.falling || this.attacking || this.dropin ) {
            return;
        }

        this.dialogue.check( true, false );

        this.handleReleaseA();
    }


    releaseHoldA () {
        Utils.log( "A Hold Release" );

        if ( this.jumping || this.falling || this.attacking || this.dropin ) {
            return;
        }

        this.handleReleaseA();
    }


    // Common releaseA handler
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
        Utils.log( "B Hold" );

        if ( this.jumping || this.falling || this.attacking || this.dropin ) {
            return;
        }

        if ( this.player.data.bButton === Config.verbs.RUN ) {
            this.handleHeroRun();
        }
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
        Utils.log( "B Hold Release" );

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


    applyHeroMask () {
        if ( this.interact.mask ) {
            const maskX = this.hero.position.x + ( ( this.hero.width - this.interact.mask.width ) / 2 );
            const maskY = this.hero.position.y + ( ( this.hero.height - this.interact.mask.height ) );
            this.interact.mask.position.x = maskX;
            this.interact.mask.position.y = maskY;

            if ( this.hero.isIdle() && this.interact.mask.frame === this.interact.mask.data.stepsX - 1 ) {
                this.interact.mask.paused = true;
            } else {
                this.interact.mask.paused = false;
            }
        }
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
            this.interact.mask = null;
        }

        this.applyHero( poi, dir );

        // Position mask after hero position has been applied
        if ( this.interact.mask ) {
            this.applyHeroMask();
        }
    }


    handleHeroJump () {
        // @check: hero-verb-check
        if ( !this.hero.can( Config.verbs.JUMP ) ) {
            return;
        }

        // Remove mask when jumping (will be reapplied if landing on a tile again)
        this.interact.mask = null;
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
        const destTile = [
            tile.tilebox.x,
            tile.tilebox.y,
        ];
        destTile[ axis ] = destTile[ axis ] + ( increment * ( this.map.data.tilesize * elevation ) );

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
                    x: destTile[ 0 ],
                    y: isEventDoor ? destTile[ 1 ] - ( ( this.hero.height - this.map.data.tilesize ) / 2 ) :this.hero.position.y,
                };
                break;

            case "right":
                destPos = {
                    x: destTile[ 0 ] - ( this.hero.width - this.map.data.tilesize ),
                    y: isEventDoor ? destTile[ 1 ] - ( ( this.hero.height - this.map.data.tilesize ) / 2 ) : this.hero.position.y,
                };
                break;

            case "up":
                destPos = {
                    x: isEventDoor ? destTile[ 0 ] - ( ( this.hero.width - this.map.data.tilesize ) / 2 ) :this.hero.position.x,
                    y: destTile[ 1 ],
                };
                break;

            case "down":
                destPos = {
                    x: isEventDoor ? destTile[ 0 ] - ( ( this.hero.width - this.map.data.tilesize ) / 2 ) :this.hero.position.x,
                    y: destTile[ 1 ] - ( this.hero.height - this.map.data.tilesize ),
                };
                break;
        }

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


    // Initializes the attach verb as an "action"
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
        this.player.gameaudio.hitSound( Config.verbs.ATTACK );

        setTimeout( () => {
            this.hero.face( this.hero.dir );
            
        }, this.hero.getDur( Config.verbs.ATTACK ) );
    }
    
    
    // Needs to be called for every frame of attack animation
    handleHeroAttackFrame () {
        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const weaponBox = this.hero.getWeaponbox();
        const collision = {
            npc: this.checkNPC( poi, weaponBox ),
            tiles: this.checkTiles( poi, weaponBox ),
        };

        // TODO: Check if the NPC has the "attack" action rather than just checking that it has an "ai"
        if ( collision.npc && collision.npc.data.ai && !this.interact.npc ) {
            const destPos = {};

            // TODO: Determine if the hero is properly facing the NPC in order to allow for the attack to be successful

            // Get center points of NPC and weaponBox
            const npcCenter = {
                x: collision.npc.position.x + (collision.npc.width / 2),
                y: collision.npc.position.y + (collision.npc.height / 2)
            };
            const heroCenter = {
                x: this.hero.hitbox.x + (this.hero.hitbox.width / 2),
                y: this.hero.hitbox.y + (this.hero.hitbox.height / 2)
            };

            // Calculate angle between centers
            const angle = Math.atan2(
                npcCenter.y - heroCenter.y,
                npcCenter.x - heroCenter.x
            );

            // Calculate destination point 2 tiles away in angle direction
            const distance = this.map.data.tilesize;
            destPos.x = npcCenter.x + (Math.cos(angle) * distance);
            destPos.y = npcCenter.y + (Math.sin(angle) * distance);

            this.interact.npc = {};
            this.interact.npc.sprite = collision.npc;
            this.interact.npc.sprite.attacked = true;
            this.interact.npc.spring = new Spring( this.player, collision.npc.position.x, collision.npc.position.y, 120, 3.5 );
            this.interact.npc.spring.poi = destPos;
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

            if ( !collision.map && !collision.npc && !collision.camera && !this.hero.canTileStop( this.interact.npc.sprite.position, null, collision ) ) {
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
            
            if ( maskData && !this.interact.mask ) {
                this.interact.mask = new FX({
                    ...maskData,
                    spawn: {
                        x: this.hero.position.x,
                        y: this.hero.position.y,
                    },
                }, this.map );
            }

        } else if ( ( !maskTile || maskAmount < 100 ) && this.interact.mask ) {
            this.interact.mask = null;
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


    handleHeroNPCAction ( poi, dir, npc ) {
        if ( npc.canInteract( dir ) ) {
            npc.doInteract( dir );
        }
    }


    handleHeroTileAttack ( poi, dir, tile ) {
        const attackAction = tile.instance.canAttack();

        if ( attackAction ) {
            tile.instance.attack( tile.coord, attackAction );
        }
    }


/*******************************************************************************
* Sprite Handlers
*******************************************************************************/
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
        const attackAction = this.interact.tile.instance.canAttack();
        this.smokeObject( this.interact.tile.sprite, attackAction?.fx );
        this.player.gameaudio.hitSound( Config.verbs.SMASH );
        this.map.killObj( "npcs", this.interact.tile.sprite );
        this.interact.tile = null;
    }
}



export default TopView;
