import Utils from "../Utils";
import Config from "../Config";
import GameBox from "../GameBox";



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
            push: 0,
        };
        this.attacking = null;
        this.running = false;
        this.jumping = false;
        this.falling = false;
        this.locked = false;
        this.swimming = false;
        this.liftLocked = false;
    }


/*******************************************************************************
* GamePad Inputs
*******************************************************************************/
    pressD ( dir ) {
        if ( this.panning || this.dropin || this.hero.isHitOrStill() ) {
            return;
        }

        this.handleHero( this.hero.getNextPoiByDir( dir ), dir );
    }


    releaseD () {
        if ( this.panning || this.locked || this.jumping || this.falling || this.attacking || this.dropin || this.swimming || this.hero.isHitOrStill() ) {
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
        if ( this.canBlockAPress() ) {
            return;
        }

        if ( this.hero.kickCounter > 0 ) {
            return;
        }

        const poi = this.hero.getNextPoiByDir( this.hero.dir, 1 );
        const collision = {
            npc: this.checkNPC( poi, this.hero ),
            door: this.checkDoor( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
        };

        if ( this.swimming ) {
            this.hero.swimKick();

        } else if ( collision.door ) {
            this.handleHeroDoorAction( poi, this.hero.dir, collision.door );

        } else if ( collision.npc ) {
            this.handleHeroNPCAction( poi, this.hero.dir, collision.npc );

        } else if ( this.hero.canGrabTile( collision ) && !this.interact.tile ) {
            const liftTiles = collision.tiles.action.filter( ( tile ) => {
                return tile.instance.canInteract( Config.verbs.LIFT );
            });
            this.interact.tile = Utils.getMostCollidingTile( liftTiles );
            this.hero.cycle( Config.verbs.GRAB, this.hero.dir );

        } else {
            // This is the default case for all other actions
            const notLifting = !this.hero.is( Config.verbs.LIFT ) && !this.hero.is( Config.verbs.GRAB );
            
            // Jump...
            if ( notLifting && this.hero.hasJump() ) {
                this.handleHeroJump( poi, this.hero.dir );
            }
        }
    }


    holdA () {}


    // Common pressA methods
    canBlockAPress () {
        return this.panning || this.locked || this.jumping || this.falling || this.attacking || this.dropin || this.dialogue.active || this.liftLocked || this.hero.isHitOrStill();
    }


    releaseA () {
        if ( this.hero.itemGet ) {
            this.dialogue.check( "A" );
            return;
        }

        if ( this.canBlockReleaseA() ) {
            return;
        }

        this.dialogue.check( "A" );
        this.handleReleaseA();
    }


    releaseHoldA () {
        if ( this.canBlockReleaseA() ) {
            return;
        }

        this.handleReleaseA();
    }


    // Common releaseA methods
    canBlockReleaseA () {
        return this.panning || this.jumping || this.falling || this.attacking || this.dropin || this.running || this.hero.isHitOrStill();
    }


    handleReleaseA () {
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
        if ( this.canBlockPressB() ) {
            return;
        }

        if ( this.hero.diveCounter > 0 ) {
            return;
        }

        if ( this.swimming ) {
            this.hero.swimDive();
            return;
        }

        // There will be extra blocking checks wrapped around this action
        if ( !this.hero.is( Config.verbs.LIFT ) ) {
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
        if ( this.canBlockPressB() ) {
            return;
        }

        if ( this.player.data.bButton === Config.verbs.RUN ) {
            this.handleHeroRun();
        }
    }


    // Common pressB methods
    canBlockPressB () {
        return this.panning || this.jumping || this.falling || this.attacking || this.dropin || this.dialogue.active || this.hero.isHitOrStill();
    }


    releaseB () {
        if ( this.hero.itemGet ) {
            this.dialogue.check( "B" );
            return;
        }

        if ( this.canBlockReleaseB() ) {
            return;
        }

        this.handleReleaseB();
        this.dialogue.check( "B" );
    }


    releaseHoldB () {
        if ( this.canBlockReleaseB() ) {
            return;
        }

        this.handleReleaseB();
    }


    // Common releaseB methods
    canBlockReleaseB () {
        return this.panning || this.jumping || this.falling || this.dropin || this.hero.isHitOrStill();
    }


    handleReleaseB () {
        if ( this.running ) {
            this.running = false;
            this.hero.resetMaxV();
        }
    }


/*******************************************************************************
* Hero Handlers...
*******************************************************************************/
    handleHero ( poi, dir ) {
        // Reset push under certain conditions
        if ( this.locked || this.jumping || this.falling || this.dropin ) {
            this.interact.push = 0;
        }

        if (
            this.locked ||
            this.panning ||
            this.falling ||
            this.attacking ||
            this.liftLocked ||
            this.hero.isHitOrStill() ||
            // Only apply if the input direction matches the parkour direction
            // Fixes a bug in which diagonal parkour is accelerated and feels unnatural
            ( this.hero.parkour && dir !== this.hero.parkour.dir )
        ) {
            return;
        }

        if ( this.hero.parkour || this.hero.falling || this.dropin ) {
            this.applyHero( poi, dir );
            return;
        }

        const collision = {
            map: this.checkMap( poi, this.hero ),
            npc: this.checkNPC( poi, this.hero ),
            enemy: this.checkEnemy( poi, this.hero ),
            door: this.checkDoor( poi, this.hero ),
            item: this.checkItems( poi, this.hero ),
            tiles: this.checkTiles( poi, this.hero ),
            event: this.checkEvents( poi, this.hero ),
            empty: this.checkEmpty( poi, this.hero ),
            camera: this.checkCamera( poi, this.hero ) && !this.panning,
        };

        if ( this.jumping ) {
            if ( this.hero.canMoveWhileJumping( collision ) ) {
                this.applyHero( poi, dir );
            }

            if ( this.hero.isOnGround() ) {
                this.jumping = false;
                this.hero.face( dir );
            }

            return;
        }

        const canTileSwim = this.hero.canTileSwim( poi, collision );

        if ( collision.event && !( canTileSwim && !this.hero.hasSwim() ) ) {
            if ( this.hero.canEventBoundary( collision ) ) {
                this.handleHeroEventBoundary( poi, dir, collision.event );
                return;

            } else if ( this.hero.canEventDoor( collision ) ) {
                this.handleHeroEventDoor( poi, dir, collision.event );
                return;

            } else if ( this.hero.canEventDialogue( collision ) ) {
                this.handleHeroEventDialogue( poi, dir, collision.event );
                // No return as this is a passive event
            }
        }

        if ( collision.item ) {
            this.handleHeroItem( poi, dir, collision.item );

            if ( collision.item.data.collect || collision.item.mapId ) {
                return;
            }
        }

        if ( collision.door ) {
            this.handleHeroPush( poi, dir );
            return;
        }

        if ( collision.enemy ) {
            if ( collision.enemy.canHitHero() ) {
                this.hero.hit( collision.enemy.stats.power );
            }

            return;
        }

        if ( collision.npc ) {
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
            return;
        }

        if ( this.hero.is( Config.verbs.GRAB ) ) {
            if ( this.hero.canLift( dir ) ) {
                this.handleHeroLift( poi, dir );
            }

            return;
        }

        // When you fall down, you gotta get back up again...
        // Handles collision.tiles and collision.empty checks!
        if ( this.hero.canTileFall( poi, collision ) ) {
            this.handleHeroFall( poi, dir, collision );
            return;
        }

        if ( canTileSwim ) {
            if ( !this.hero.hasSwim() ) {
                this.handleHeroTileSink( poi, dir, collision );

            } else {
                this.handleHeroTileSwim( poi, dir, collision );
            }

        } else if ( this.swimming ) {
            this.resetHeroSwim();
        }

        if ( collision.tiles ) {
            // Tile will allow leaping from it's edge, like a ledge...
            if ( this.hero.canTileJump( dir, collision ) ) {
                this.handleHeroTileJump( poi, dir, collision );

            // Tile is behaves like a WALL, or Object you cannot walk on
            } else if ( this.hero.canTileStop( collision ) ) {
                this.handleHeroPush( poi, dir );
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


    handleResetHeroDirs () {
        this.hero.handleResetControls();
    }


    handleCriticalReset () {
        // Applied for parkour
        // this.player.controls[ this.hero.dir ] = false;
        this.handleResetHeroDirs();

        // To kill any animated sprite cycling (jump etc...)
        this.hero.face( this.hero.dir );

        // Reset flags
        this.jumping = false;
        this.falling = false;
        this.attacking = null;
        this.running = false;

        // Reset speed
        this.hero.resetMaxV();
    }


    handleHeroJump () {
        if ( !this.hero.can( Config.verbs.JUMP ) ) {
            return;
        }

        // Remove mask when jumping (will be reapplied if landing on a tile again)
        this.jumping = true;
        this.hero.jump();
    }


    handleHeroTileJump ( poi, dir, collision ) {
        this.handleResetHeroDirs();

        const jumpTiles = collision.tiles.passive.filter( ( tile ) => tile.jump );

        // Get the axis and increment
        const axis = dir === "left" || dir === "right" ? 0 : 1;
        const increment = dir === "left" || dir === "up" ? -1 : 1;
        const tile = Utils.getMostCollidingTile( jumpTiles );

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
        let destCoords;
        
        // When moving horizontally, the destination tile is simply the next tile in the direction of the jump
        if ( dir === "left" || dir === "right" ) {
            destTile = [
                tile.tilebox.x + ( increment * ( this.map.data.tilesize ) ),
                tile.tilebox.y,
            ];
            elevation = 1;

        } else {
            destTile = [
                tile.tilebox.x,
                tile.tilebox.y + ( increment * ( this.map.data.tilesize * elevation ) ),
            ];
        }

        destCoords = [
            destTile[ 0 ] / this.map.data.tilesize,
            destTile[ 1 ] / this.map.data.tilesize,
        ];

        // Get the destination event
        const destEvent = this.map.getEvent( destCoords );
        const isEventDoor = destEvent && destEvent.data.type === Config.events.DOOR;

        // Get the destination active tiles
        const activeTiles = this.map.getActiveTileOnCoords( destCoords );

        // Get the destination position
        switch ( dir ) {
            case "left":
                destPos = {
                    x: destTile[ 0 ] - ( this.hero.width - this.map.data.tilesize ),
                    y: this.hero.position.y,
                };
                break;
            case "right":
                destPos = {
                    x: destTile[ 0 ],
                    y: this.hero.position.y,
                };
                break;
            case "up":
                destPos = {
                    x: this.hero.position.x,
                    y: destTile[ 1 ],
                };
                break;
            case "down":
                destPos = {
                    x: this.hero.position.x,
                    y: destTile[ 1 ] - ( this.hero.height - this.map.data.tilesize ),
                };
                break;
        }


        this.jumping = true;
        this.hero.cycle( Config.verbs.JUMP, dir );
        this.hero.physics.vz = -( this.map.data.tilesize / 4 );
        this.player.gameaudio.heroSound( "parkour" );

        if ( this.hero.liftedTile ) {
            this.hero.liftedTile.destroy();
        }

        this.hero.parkour = {
            poi: destPos,
            dir,
            tile: destTile,
            event: destEvent,
            coords: destCoords,
            elevation,
            isEventDoor,
            activeTiles,
        };
    }


    handleHeroPushNPC ( poi, dir, collision ) {
        if ( !collision.npc.canDoAction( Config.verbs.PUSH ) ) {
            return;
        }

        if ( this.isPushingNPC() ) {
            this.locked = true;

            this.hero.face( dir );

            const position = {};
            const distance = this.map.data.tilesize;

            switch ( dir ) {
                case "left":
                    position.x = collision.npc.position.x - distance;
                    position.y = collision.npc.position.y;
                    break;
                case "right":
                    position.x = collision.npc.position.x + distance;
                    position.y = collision.npc.position.y;
                    break;
                case "up":
                    position.x = collision.npc.position.x;
                    position.y = collision.npc.position.y - distance;
                    break;
                case "down":
                    position.x = collision.npc.position.x;
                    position.y = collision.npc.position.y + distance;
                    break;
            }

            collision.npc.pushed = {
                poi: position,
                dir,
            };

            if ( collision.npc.data.action.sound ) {
                this.player.gameaudio.heroSound( collision.npc.data.action.sound );
            }
        }
    }


    handleHeroPush ( poi, dir ) {
        if ( this.swimming ) {
            return;
        }

        this.interact.push++;

        if ( !this.hero.is( Config.verbs.LIFT ) && this.isPushing() ) {
            if ( !this.hero.can( Config.verbs.PUSH ) ) {
                return;
            }

            this.hero.cycle( Config.verbs.PUSH, dir );

        } else if ( !this.hero.is( Config.verbs.LIFT ) ) {
            this.hero.cycle( Config.verbs.WALK, dir );
        }
    }


    playItemGetDialogue ( dialogue ) {
        return this.dialogue.play( dialogue ).then( () => {
            this.hero.resetItemGet();

        }).catch( () => {
            this.hero.resetItemGet();
        });
    }


    handleHeroItem ( poi, dir, item ) {
        if ( !item.canPickup() ) {
            return;
        }

        // Key map items
        if ( item.mapId ) {
            // Cancel attack animation for itemGet sequence
            if ( this.attacking ) {
                this.attacking = null;
            }

            this.hero.giveItem( item.data.id, item.mapId );
            this.gamequest.completeQuest( item.mapId );
            this.playItemGetDialogue( item.data.dialogue );
        }

        if ( item.data.sound ) {
            // Don't use hero sound channel for item pickup sounds
            this.player.gameaudio.hitSound( item.data.sound );
        }

        if ( item.data.currency ) {
            this.hero.receive( item.data.currency );
        }

        if ( item.data.stat ) {
            this.hero.updateStat( item.data.stat.key, item.data.stat.value );
        }

        if ( item.data.collect ) {
            const hasItemAlready = this.hero.getItem( item.data.id );

            this.hero.collectItem( item.data.id );

            // If the item is picked up remove it's quest flag connection.
            // Otherwise the items destroy method will reset the flag (e.g. exit map without picking up the item)
            // This will allow the quest to be done again and the item will be dropped again until it's picked up.
            if ( item.checkFlag ) {
                delete item.checkFlag;
            }

            if ( item.data.dialogue && !hasItemAlready ) {
                // Cancel attack animation for itemGet sequence
                if ( this.attacking ) {
                    this.attacking = null;
                }

                this.playItemGetDialogue( item.data.dialogue );
            }
            // TODO: Add sound here for ite pickup if it's not first time...
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
        this.mapChangeEvent = event;
    }


    handleHeroEventBoundary ( poi, dir, event ) {
        this.handleHeroEventCleanup();
        this.mapChangeEvent = event;
    }


    handleHeroEventDialogue ( poi, dir, event ) {
        // TODO: Add dialogue modes so this can be "auto" or "play" (user has to press A/B to advance)
        this.dialogue.auto({
            text: event.data.dialogue.text,
        });

        if ( event.data.sound ) {
            this.currentMusic = event.data.sound.split( "/" ).pop().split( "." )[ 0 ];

            this.player.gameaudio.addSound({
                id: this.currentMusic,
                src: event.data.sound,
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
        this.hero.lifting = {
            timeStarted: performance.now(),
        };
    }


    handleHeroRun () {
        const dpad = this.player.gamepad.checkDpad();

        if ( !dpad.length ) {
            return;
        }

        if ( this.running ) {
            return;
        }

        if ( !this.hero.is( Config.verbs.WALK ) && !this.hero.can( Config.verbs.RUN ) ) {
            return;
        }

        this.running = true;
        this.hero.cycle( Config.verbs.RUN, this.hero.dir );
        this.hero.physics.maxv = this.hero.physics.controlmaxvstatic * 2;
        this.hero.physics.controlmaxv = this.hero.physics.controlmaxvstatic * 2;
    }


    // Initializes the attach verb as an "action"
    handleHeroAttack () {
        if ( this.attacking ) {
            return;
        }

        if ( !this.hero.can( Config.verbs.ATTACK ) ) {
            return;
        }

        const isWeapon = this.hero.hasWeapon() && this.hero.mode === Config.hero.modes.WEAPON;
        const isProjectile = this.hero.hasProjectile() && this.hero.mode === Config.hero.modes.PROJECTILE;

        if ( !isWeapon && !isProjectile ) {
            return;
        }

        if ( isProjectile ) {
            this.hero.fireProjectile();
        }
        
        this.attacking = {
            timeStarted: performance.now(),
        };
        this.hero.resetElapsed = true;
        this.hero.cycle( Config.verbs.ATTACK, this.hero.dir );
        
        if ( isWeapon ) {
            this.player.gameaudio.heroSound( Config.verbs.ATTACK );
        }
    }


    getFallPosition ( fallCoords, dir ) {
        // Center the hero's sprite on the fall tile as the animation's final destination
        const coordX = fallCoords[ 0 ] * this.map.data.tilesize;
        const coordY = fallCoords[ 1 ] * this.map.data.tilesize;
        const fallOffsetY = ( ( this.hero.height - this.map.data.tilesize ) / 2 );
        const fallOffsetX = ( ( this.hero.width - this.map.data.tilesize ) / 2 );
        const fallToPosition = {
            x: coordX - fallOffsetX,
            y: coordY - fallOffsetY,
        };

        // Rest position
        const fallResetPosition = {
            x: this.hero.lastPositionOnGround.x,
            y: this.hero.lastPositionOnGround.y,
        };
        switch ( dir ) {
            case "left":
                fallResetPosition.x += this.map.data.tilesize / 4;
                break;
            case "right":
                fallResetPosition.x -= this.map.data.tilesize / 4;
                break;
            case "up":
                fallResetPosition.y += this.map.data.tilesize / 2;
                break;
            case "down":
                fallResetPosition.y -= this.map.data.tilesize / 4;
                break;
        }

        return {
            fallToPosition,
            fallResetPosition,
        };
    }


    handleHeroTileSink ( poi, dir, collision ) {
        this.handleResetHeroDirs();

        const diveTiles = collision.tiles.action.filter( ( tile ) => {
            return tile.swim;
        });
        const diveTile = Utils.getMostCollidingTile( diveTiles );
        const fallCoords = diveTile.coord;

        const { fallToPosition, fallResetPosition } = this.getFallPosition( fallCoords, dir );

        this.falling = true;
        this.hero.cycle( Config.verbs.DIVE, this.hero.dir );
        this.player.gameaudio.heroSound( "parkour" );

        if ( this.hero.liftedTile ) {
            this.hero.liftedTile.destroy();
        }

        this.hero.falling = {
            to: fallToPosition,
            reset: fallResetPosition,
        };
    }


    handleHeroTileSwim ( poi, dir, collision ) {
        this.swimming = true;

        if ( !this.hero.kickCounter ) {
            this.hero.physics.maxv = this.hero.physics.controlmaxv / 2;
        }

        if ( this.hero.kickCounter > 0 || this.hero.diveCounter > 0 ) {
            if ( this.hero.canMoveWhileJumping( collision ) ) {
                this.applyHero( poi, dir );
            }

        } else {
            this.hero.cycle( Config.verbs.SWIM, this.hero.dir );
        }
    }


    resetHeroSwim () {
        this.swimming = false;
        this.hero.diveCounter = 0;
        this.hero.kickCounter = 0;
        this.hero.resetMaxV();
    }


    handleHeroFall ( poi, dir, collision ) {
        this.handleResetHeroDirs();

        let fallCoords = [];

        if ( collision.tiles ) {
            const fallTiles = collision.tiles.action.filter( ( tile ) => {
                return tile.fall;
            });
            const fallTile = Utils.getMostCollidingTile( fallTiles );
            fallCoords = fallTile.coord;

        } else if ( collision.empty ) {
            const emptyTile = collision.empty[ 0 ];
            fallCoords = [
                emptyTile.x / this.map.data.tilesize,
                emptyTile.y / this.map.data.tilesize,
            ];
        }

        const { fallToPosition, fallResetPosition } = this.getFallPosition( fallCoords, dir );

        if ( this.hero.liftedTile ) {
            this.hero.liftedTile.destroy();
        }

        this.falling = true;
        this.hero.cycle( Config.verbs.FALL, this.hero.dir );
        this.player.gameaudio.heroSound( "parkour" );

        this.hero.falling = {
            to: fallToPosition,
            reset: fallResetPosition,
        };
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
        const maskAmount = Utils.getTotalCollisionAmount( maskTiles );

        if ( maskTile && maskAmount >= 100 ) {
            const maskData = this.player.getMergedData( {
                id: maskTile.instance.data.mask,
            }, "fx" );
            
            if ( maskData && !this.hero.maskFX ) {
                this.hero.addMaskFX( maskData );
            }

        } else if ( ( !maskTile || maskAmount < 100 ) && this.hero.maskFX ) {
            this.hero.maskFX = null;
        }
    }


    handleFrictionTiles ( tiles ) {
        const frictionTiles = tiles.passive.filter( ( tile ) => tile.instance.data.friction );
        const frictionAmount = Utils.getTotalCollisionAmount( frictionTiles );

        if ( frictionTiles.length && frictionAmount >= 100 ) {
            for ( let i = frictionTiles.length; i--; ) {
                this.hero.physics.maxv = this.hero.physics.controlmaxv / frictionTiles[ i ].instance.data.friction;
            }

        } else if ( this.hero.canResetMaxV() ) {
            this.hero.resetMaxV();
        }
    }


    handleHeroDoorAction ( poi, dir, door ) {
        // Simple dialogue payload...
        if ( door.canInteract( dir ) ) {
            door.doInteract( dir );
            return;
        }

        // Mark: Quest checkFlag
        // Mark: Quest checkItem
        if ( door.data.action?.quest ) {
            door.handleQuestInteractionCheck();
            return;
        }
        
        // Otherwise try action (open/close) if no quest is involved
        door.handleDoAction();
    }


    handleHeroNPCAction ( poi, dir, npc ) {
        if ( npc.canInteract( dir ) ) {
            npc.doInteract( dir );
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
}



export default TopView;
