import Utils from "../Utils";
import Config from "../Config";
import Sprite from "./Sprite";
import Spring from "../Spring";
import Projectile from "./Projectile";



/*******************************************************************************
* Hero
* There can be only one per Map
*******************************************************************************/
export default class Hero extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.currency = this.data.currency || 0;
        this.itemGet = null;
        this.liftedTile = null;
        this.maskFX = null;
        this.items = [];
        // Hero controls are defined by the Player
        this.controls = this.player.controls;
        this.killed = false;
        this.deathCounter = 0;
        this.projectile = null;
        this.mode = Config.hero.modes.WEAPON;
        this.parkour = null;
        this.falling = null;
        this.lastPositionOnGround = this.position;
    }


    visible () {
        return true;
    }


    hit ( ...args ) {
        super.hit( ...args );
        this.physics.vz = -6;
    }


    jump () {
        this.maskFX = null;
        this.resetMaxV();
        this.cycle( Config.verbs.JUMP, this.dir );
        this.physics.vz = -( this.map.data.tilesize / 3 );
        this.player.gameaudio.hitSound( Config.verbs.JUMP );
    }


    resetMaxV () {
        // Resume running speed...
        if ( this.gamebox.running ) {
            this.physics.maxv = this.physics.controlmaxvstatic * 1.75;
            this.physics.controlmaxv = this.physics.controlmaxvstatic * 1.75;

        // Resume normal speed...
        } else {
            this.physics.maxv = this.physics.maxvstatic;
            this.physics.controlmaxv = this.physics.controlmaxvstatic;
        }
    }


    resetItemGet () {
        this.itemGet = null;
        this.stillTimer = 0;
        this.face( "down" );
    }


/*******************************************************************************
* Stats
*******************************************************************************/
    checkStat ( stat, value ) {
        return this.getStat( stat ) >= value;
    }


    getStat ( stat ) {
        const items = this.items.filter( ( item ) => item.stat?.key === stat );
        return this.stats[ stat ] + items.reduce( ( acc, item ) => acc + item.stat.value, 0 );
    }


/*******************************************************************************
* Items
*******************************************************************************/
    itemCheck ( id ) {
        const item = this.getItem( id );
        return ( item && item.collect && item.collected > 0 ) || item;
    }


    getItem ( id ) {
        return this.items.find( ( item ) => item.id === id );
    }


    hasJump () {
        return this.items.some( ( item ) => item.verb === Config.verbs.JUMP );
    }


    hasProjectile () {
        return this.items.some( ( item ) => item.projectile );
    }


    fireProjectile () {
        const item = this.items.find( ( item ) => item.projectile );

        if ( !item ) {
            return;
        }

        const data = this.gamebox.player.getMergedData({
            id: item.projectile,
        }, "projectiles" );

        this.projectile = new HeroProjectile( data, this.dir, this, this.map );
    }


    collectItem ( id ) {
        const item = this.getItem( id );

        if ( item ) {
            item.collected++;
            return;
        }

        this.giveItem( id );
    }


    takeCollectible ( id ) {
        const item = this.getItem( id );

        if ( item && item.collect ) {
            item.collected = Math.max( 0, item.collected - 1 );
        }
    }


    giveItem ( id, mapId ) {
        const item = this.player.getMergedData({
            id,
            mapId,
        }, "items" );

        this.items.push( item );

        if ( this.data.verbs.item?.down ) {
            this.itemGet = new ItemGet( this.position, item, this.map, this );
            this.stillTimer = Infinity;
            this.cycle( "item", "down" );
            this.player.gameaudio.hitSound( "itemGet" );
        }

        if ( item.equip ) {
            this.equip( item.equip );
        }

        if ( item.currency ) {
            this.receive( item.currency );
        }

        if ( item.collect ) {
            item.collected = 1;
        }
    }


    takeItem ( id ) {
        const item = this.items.find( ( item ) => item.id === id );
    
        if ( !item ) {
            return;
        }

        this.items.splice( this.items.indexOf( item ), 1 );

        if ( item.equip ) {
            this.unequip( item.equip );
        }
    }


/*******************************************************************************
* Currency
*******************************************************************************/
    pay ( amount ) {
        this.currency = Math.max( 0, this.currency - amount );
    }


    receive ( amount ) {
        this.currency += amount;
    }


/*******************************************************************************
* Equipped
*******************************************************************************/
    equip ( eq ) {
        this.data.equipped[ eq ] = true;
    }


    unequip ( eq ) {
        this.data.equipped[ eq ] = false;
    }


    isEquipped ( eq ) {
        return this.data.equipped[ eq ] || false;
    }


    hasWeapon () {
        return this.data.equipped.weapon && this.data.weapon?.[ this.dir ]?.length;
    }


    hasShield () {
        return this.data.equipped.shield && this.data.shield?.[ this.verb ]?.[ this.dir ]?.length;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blitAfter ( elapsed ) {
        if ( this.maskFX ) {
            this.maskFX.blit( elapsed );
        }

        if ( this.itemGet ) {
            this.itemGet.blit( elapsed );
        }

        if ( this.liftedTile ) {
            this.liftedTile.blit( elapsed );
        }
    }


    update () {
        // Handle player controls
        this.handleControls();

        // The physics stack...
        this.handleVelocity();
        this.handleGravity();
        this.applyGravity();

        if ( this.maskFX ) {
            this.maskFX.update();
        }

        if ( this.itemGet ) {
            this.itemGet.update();
        }

        if ( this.liftedTile ) {
            this.liftedTile.update();
        }
    }


    renderAfter () {
        if ( this.maskFX ) {
            this.maskFX.render();
        }

        if ( this.itemGet ) {
            this.itemGet.render();
        }

        if ( this.liftedTile ) {
            this.liftedTile.render();
        }

        if ( this.hasWeapon() && this.is( Config.verbs.ATTACK ) && this.mode === Config.hero.modes.WEAPON ) {
            this.gamebox.draw(
                this.image,
                this.data.weapon[ this.dir ][ this.frame ].offsetX,
                this.data.weapon[ this.dir ][ this.frame ].offsetY,
                this.data.weapon[ this.dir ][ this.frame ].width,
                this.data.weapon[ this.dir ][ this.frame ].height,
                this.offset.x + this.data.weapon[ this.dir ][ this.frame ].positionX,
                this.offset.y + this.data.weapon[ this.dir ][ this.frame ].positionY,
                this.data.weapon[ this.dir ][ this.frame ].width / this.scale,
                this.data.weapon[ this.dir ][ this.frame ].height / this.scale
            );
            
            // Don't handle attack collision on the "windup" frame
            // Can always provide more control over which frames are checked
            if ( this.frame > 0 ) {
                this.handleAttackFrame();
            }

        }
        
        try {
            if ( this.hasShield() && !this.gamebox.attacking ) {
                this.gamebox.draw(
                    this.image,
                    this.data.shield[ this.verb ][ this.dir ][ this.frame ].offsetX,
                    this.data.shield[ this.verb ][ this.dir ][ this.frame ].offsetY,
                    this.data.shield[ this.verb ][ this.dir ][ this.frame ].width,
                    this.data.shield[ this.verb ][ this.dir ][ this.frame ].height,
                    this.offset.x + this.data.shield[ this.verb ][ this.dir ][ this.frame ].positionX,
                    this.offset.y + this.position.z + this.data.shield[ this.verb ][ this.dir ][ this.frame ].positionY,
                    this.data.shield[ this.verb ][ this.dir ][ this.frame ].width / this.scale,
                    this.data.shield[ this.verb ][ this.dir ][ this.frame ].height / this.scale
                );
            }
        } catch (error) {
            console.log({
                dir: this.dir,
                verb: this.verb,
                frame: this.frame,
                attacking: this.gamebox.attacking,
            });
            console.error( error );
        }

        if ( this.player.query.get( "debug" ) ) {
            this.renderAfterDebug();
        }
    }

    
    renderAfterDebug () {
        this.gamebox.mapLayer.context.globalAlpha = 0.5;
        this.gamebox.mapLayer.context.fillStyle = Config.colors.teal;

        if ( this.hasWeapon() && this.is( Config.verbs.ATTACK ) ) {
            const weaponbox = this.getWeaponbox( "offset" );

            this.gamebox.mapLayer.context.fillRect(
                weaponbox.x,
                weaponbox.y,
                weaponbox.width,
                weaponbox.height
            );
        }

        if ( this.hasShield() ) {
            const shieldbox = this.getShieldbox( "offset" );

            this.gamebox.mapLayer.context.fillRect(
                shieldbox.x,
                shieldbox.y,
                shieldbox.width,
                shieldbox.height
            );
        }
    }


/*******************************************************************************
* Handlers
*******************************************************************************/
    // Needs to be called for every frame of attack animation
    handleAttackFrame () {
        const poi = this.getNextPoiByDir( this.dir, 1 );
        const weaponBox = this.getWeaponbox();
        const collision = {
            npc: this.gamebox.checkNPC( poi, weaponBox ),
            tiles: this.gamebox.checkTiles( poi, weaponBox ),
            item: this.gamebox.checkItems( poi, weaponBox ),
        };

        if ( collision.item ) {
            this.gamebox.handleHeroItem( poi, this.dir, collision.item );
        }

        if ( collision.npc && !collision.npc.hitTimer && collision.npc.canDoAction( Config.verbs.ATTACK ) ) {
            collision.npc.hit( this.getStat( "power" ) );
        }

        if ( collision.tiles && collision.tiles.attack.length ) {
            for ( let i = collision.tiles.attack.length; i--; ) {
                if ( collision.tiles.attack[ i ].attack ) {
                    const attackAction = collision.tiles.attack[ i ].instance.canAttack();

                    if ( attackAction ) {
                        collision.tiles.attack[ i ].instance.attack( collision.tiles.attack[ i ].coord, attackAction );
                    }
                }
            }
        }
    }


    handleHealthCheck () {
        if ( this.stats.health <= 0 ) {
            this.killed = true;
            this.stillTimer = Infinity;
            this.deathCounter = 240;

            if ( this.maskFX ) {
                this.maskFX.paused = true;
            }
            
            if ( this.data.verbs.kill?.down ) {
                this.cycle( "kill", "down" );
                this.player.gameaudio.stop();
                this.player.gameaudio.hitSound( "death" );
            }
        }
    }


/*******************************************************************************
* Applications
* Hero uses custom position and offset determinance...
*******************************************************************************/
    applyPosition ( poi, dir ) {
        if ( this.parkour ) {
            this.applyParkour();
            this.applyHitbox();
            return;
        }

        if ( this.falling ) {
            this.applyFalling();
            this.applyHitbox();
            return;
        }

        if ( !this.gamebox.jumping ) {
            this.lastPositionOnGround = {
                x: this.position.x,
                y: this.position.y,
            };
        }

        this.dir = dir;
        this.position.x = poi.x;
        this.position.y = poi.y;
        this.applyHitbox();
        this.applyHeroMask();
    }


    applyFalling () {
        if ( this.position.x === this.falling.reset.x && this.position.y === this.falling.reset.y ) {
            // this.position.x = this.falling.reset.x;
            // this.position.y = this.falling.reset.y;
            this.falling = null;
            this.frameStopped = false;
            this.gamebox.falling = false;
            this.face( this.dir );
            this.hit( 0.25 );
            return;
        }
        if ( this.position.x === this.falling.to.x && this.position.y === this.falling.to.y ) {
            this.falling.didReset = true;

            if ( !this.falling.resetCounter ) {
                this.falling.resetCounter = 30;

            } else if ( this.falling.resetCounter > 0 ) {
                this.falling.resetCounter--;
            }
        }
        this.applyFallingPosition();
    }


    applyFallingPosition () {
        if ( this.falling.resetCounter && this.falling.resetCounter > 0 ) {
            return;
        }

        const poi = {
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
        };

        // Ideally this is based on the duration of the fall verb for sprite cycle timing...
        // this.getDur( Config.verbs.FALL )

        const speed = 2;
        const destination = this.falling.didReset ? this.falling.reset : this.falling.to;

        if ( Math.abs( poi.x - destination.x ) > speed ) {
            poi.x += poi.x < destination.x ? speed : -speed;

        } else {
            poi.x = destination.x;
        }

        if ( Math.abs( poi.y - destination.y ) > speed ) {
            poi.y += poi.y < destination.y ? speed : -speed;

        } else {
            poi.y = destination.y;
        }

        this.position = poi;
    }


    applyParkour () {
        if ( this.parkour.didEventDoor ) {
            // The FALL will trigger a frameStopped, so we need to handle that...
            // This wouldn't work if he event verb was anything other than FALL...
            if ( this.frameStopped ) {
                this.frameStopped = false;
                this.gamebox.dropin = true;
                this.applyParkourComplete();
                return;
            }
            return;
        }
        if ( this.position.x === this.parkour.poi.x && this.position.y === this.parkour.poi.y ) {
            if ( this.parkour.isEventDoor ) {
                if ( this.parkour.event.verb && this.can( this.parkour.event.verb ) ) {
                    this.parkour.didEventDoor = true;
                    this.cycle( this.parkour.event.verb, this.parkour.dir );

                } else {
                    this.applyParkourComplete();
                }
                return;
            }
            this.applyParkourLanding();
            return;
        }
        this.applyParkourPosition();
    }


    applyParkourPosition () {
        const poi = {
            x: this.position.x,
            y: this.position.y,
            z: this.position.z,
        };

        // Ideally this is based on the duration of the jump verb for sprite cycle timing...
        // this.getDur( Config.verbs.JUMP )

        const speed = this.parkour.elevation === 1 ? 4 : this.parkour.elevation * 3;

        switch ( this.parkour.dir ) {
            case "left":
                poi.x = Math.max( poi.x - speed, this.parkour.poi.x );
                break;
            case "right":
                poi.x = Math.min( poi.x + speed, this.parkour.poi.x );
                break;
            case "up":
                poi.y = Math.max( poi.y - speed, this.parkour.poi.y );
                break;
            case "down":
                poi.y = Math.min( poi.y + speed, this.parkour.poi.y) ;
                break;
        }

        this.position = poi;
    }


    applyParkourComplete () {
        this.gamebox.handleCriticalReset();
        this.gamebox.handleHeroEventDoor( this.parkour.poi, this.parkour.dir, this.parkour.event );
        this.gamebox.jumping = false;
        this.parkour = null;
    }


    applyParkourLanding () {
        const attackAction = this.parkour.activeTiles && this.parkour.activeTiles.canAttack();

        if ( attackAction ) {
                this.parkour.activeTiles.attack( [
                    this.parkour.tile[ 0 ] / this.map.data.tilesize,
                    this.parkour.tile[ 1 ] / this.map.data.tilesize,
                ],
                attackAction
            );
        }

        this.face( this.parkour.dir );
        this.gamebox.jumping = false;
        this.parkour = null;

        // Resume directional control if still active
        const dpad = this.player.gamepad.checkDpad();

        if ( dpad.length ) {
            for ( let i = 0; i < dpad.length; i++ ) {
                for ( let j = 0; j < dpad[ i ].dpad.length; j++ ) {
                    this.player.controls[ dpad[ i ].dpad[ j ] ] = true;
                }
            }
        }
    }


    applyHeroMask () {
        if ( this.maskFX ) {
            const maskX = this.position.x + ( ( this.width - this.maskFX.width ) / 2 );
            const maskY = this.position.y + ( ( this.height - this.maskFX.height ) );
            this.maskFX.position.x = maskX;
            this.maskFX.position.y = maskY;

            if ( this.isIdle() && this.maskFX.frame === this.maskFX.data.stepsX - 1 ) {
                this.maskFX.paused = true;
            } else {
                this.maskFX.paused = false;
            }
        }
    }


    applyOffset () {
        const absolute = {
            x: Math.abs( this.map.offset.x ),
            y: Math.abs( this.map.offset.y ),
        };

        this.offset = {
            x: ( this.gamebox.camera.width / 2 ) - ( this.width / 2 ),
            y: ( this.gamebox.camera.height / 2 ) - ( this.height / 2 ),
        };

        if ( absolute.x <= 0 ) {
            this.offset.x = this.position.x;
        }

        if ( absolute.x >= ( this.map.width - this.gamebox.camera.width ) ) {
            this.offset.x = this.position.x + this.map.offset.x;
        }

        if ( absolute.y <= 0 ) {
            this.offset.y = this.position.y;
        }

        if ( absolute.y >= ( this.map.height - this.gamebox.camera.height ) ) {
            this.offset.y = this.position.y + this.map.offset.y;
        }
    }


    applyCycle () {
        if ( this.parkour || this.falling ) {
            return;
        }

        // Lifting and carrying an object trumps all
        if ( this.is( Config.verbs.LIFT ) ) {
            this.cycle( Config.verbs.LIFT, this.dir );

        // Jumping needs to be captured...
        } else if ( this.gamebox.jumping ) {
            this.cycle( Config.verbs.JUMP, this.dir );

        // Attack needs to be captured...
        } else if ( this.gamebox.attacking ) {
            this.cycle( Config.verbs.ATTACK, this.dir );

        // Running comes next...
        } else if ( this.gamebox.running ) {
            this.cycle( Config.verbs.RUN, this.dir );

        // Idle comes next...LIFT has it's own idle face...
        } else if ( this.idle.x && this.idle.y ) {
            this.face( this.dir );

        } else {
            this.cycle( Config.verbs.WALK, this.dir );
        }
    }


/*******************************************************************************
* Getters
*******************************************************************************/
    // Use "offset" to draw weapon debug box
    getWeaponbox ( prop = "position" ) {
        return {
            x: this[ prop ].x + this.data.weapon[ this.dir ][ this.frame ].positionX,
            y: this[ prop ].y + this.data.weapon[ this.dir ][ this.frame ].positionY,
            width: this.data.weapon[ this.dir ][ this.frame ].width,
            height: this.data.weapon[ this.dir ][ this.frame ].height
        };
    }


    // Use "offset" to draw shield debug box
    getShieldbox ( prop = "position" ) {
        return {
            x: this[ prop ].x + this.data.shield[ this.verb ][ this.dir ][ this.frame ].positionX,
            y: this[ prop ].y + this.data.shield[ this.verb ][ this.dir ][ this.frame ].positionY,
            width: this.data.shield[ this.verb ][ this.dir ][ this.frame ].width,
            height: this.data.shield[ this.verb ][ this.dir ][ this.frame ].height
        };
    }


    getPositionForNewMap () {
        if ( this.dir === "down" ) {
            return {
                x: this.position.x,
                y: 0,
                z: 0,
            };
        }

        if ( this.dir === "up" ) {
            return {
                x: this.position.x,
                y: this.map.height - this.height,
                z: 0,
            };
        }

        if ( this.dir === "right" ) {
            return {
                x: 0,
                y: this.position.y,
                z: 0,
            };
        }

        if ( this.dir === "left" ) {
            return {
                x: this.map.width - this.width,
                y: this.position.y,
                z: 0,
            };
        }
    }


/*******************************************************************************
* Checks
*******************************************************************************/
    canMoveWhileJumping ( collision ) {
        return (
            !collision.map &&
            !collision.npc &&
            !collision.camera &&
            !( collision.tiles && collision.tiles.action.length && collision.tiles.action.find( ( tile ) => {
                return tile.stop;
            }) )
        );
    }


    canResetMaxV () {
        return ( this.physics.maxv !== this.physics.controlmaxv && !this.is( Config.verbs.LIFT ) );
    }


    canEventDoor ( collision ) {
        return ( collision.event.type === Config.events.DOOR );
    }


    canEventBoundary ( collision ) {
        return ( collision.event.type === Config.events.BOUNDARY && collision.camera );
    }


    canEventDialogue ( collision ) {
        return ( collision.event.type === Config.events.DIALOGUE && collision.event.payload );
    }


    canLift ( dir ) {
        return ( dir === Config.opposites[ this.dir ] );
    }


    canTileJump ( dir, collision ) {
        const hasPassiveTiles = collision.tiles && collision.tiles.passive.length;

        if ( this.is( Config.verbs.LIFT ) || !hasPassiveTiles ) {
            return false;
        }

        const jumpTiles = collision.tiles.passive.filter( ( tile ) => tile.jump );

        if ( !jumpTiles.length ) {
            return false;
        }

        const firstJumpTile = jumpTiles[ 0 ];

        if ( jumpTiles.length > 1 ) {
            return jumpTiles.every( ( tile ) => {
                return tile.instance.canInteract( Config.verbs.JUMP ).dir === dir;
            });
        }

        return (
            (
                firstJumpTile.collides.width > ( firstJumpTile.tilebox.width / 2 ) ||
                firstJumpTile.collides.height > ( firstJumpTile.tilebox.height / 2 )
            ) &&
            firstJumpTile.instance.canInteract( Config.verbs.JUMP ).dir === dir
        );
    }


    canTileFall ( poi, collision ) {
        const { tiles, empty } = collision;
        const fallTiles = tiles && tiles.action.filter( ( tile ) => {
            return tile.fall;
        });
        const tolerance = 5;

        if ( fallTiles && fallTiles.length ) {
            return fallTiles.some( ( tile ) => {
                return Utils.collide( tile.tilebox, this.footbox, tolerance );
            });
        }

        if ( empty ) {
            const emptyTile = empty.find( ( tile ) => {
                return Utils.collide( tile, this.footbox, tolerance );
            });

            if ( !emptyTile ) {
                return false;
            }

            const tileCoords = [
                emptyTile.x / this.map.data.tilesize,
                emptyTile.y / this.map.data.tilesize,
            ];

            const event = this.map.getEvent( tileCoords );

            if ( event ) {
                return false;
            }

            const fgTile = this.gamebox.getEmptyTile( tileCoords, "foreground" );

            if ( fgTile !== 0 ) {
                return false;
            }

            return !!emptyTile;
        }

        return false;
    }


    canShield ( npc ) {
        if ( !this.hasShield() ) {
            return false;
        }

        if ( this.dir === "left" && npc.hitbox.x + npc.hitbox.width <= this.hitbox.x ) {
            return true;
        }

        if ( this.dir === "right" && npc.hitbox.x >= this.hitbox.x + this.hitbox.width ) {
            return true;
        }

        if ( this.dir === "up" && npc.hitbox.y + npc.hitbox.height <= this.hitbox.y ) {
            return true;
        }

        if ( this.dir === "down" && npc.hitbox.y >= this.hitbox.y + this.hitbox.height ) {
            return true;
        }

        return false;
    }
}



/*******************************************************************************
* Hero Projectile
* Used to display the projectile the hero is firing
*******************************************************************************/
export class HeroProjectile extends Projectile {
    constructor ( projectile, dir, hero, map ) {
        super( projectile, dir, hero, map );
        this.hero = hero;
    }


    applyPosition () {
        const poi = this.getNextPoi();
        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            npc: this.gamebox.checkNPC( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
            doors: this.gamebox.checkDoor( poi, this ),
            camera: this.gamebox.checkCamera( poi, this ),
        };

        const isCollision = (
            collision.map ||
            collision.npc ||
            collision.doors ||
            collision.camera ||
            this.canTileStop( collision )
        );
        
        if ( isCollision ) {
            if ( collision.npc && collision.npc.data.type === Config.npc.types.ENEMY && !collision.npc.isHitOrStill() ) {
                collision.npc.hit( this.data.power );
            }

            this.kill();

            return;
        }

        this.position = poi;
    }
}



/*******************************************************************************
* Item Get
* Used to display the item the hero is getting
*******************************************************************************/
export class ItemGet extends Sprite {
    constructor ( spawn, { verb, ...item }, map, hero ) {
        const data = {
            spawn,
            hitbox: {
                x: 0,
                y: 0,
                width: item.width,
                height: item.height,
            },
            verbs: {
                face: {
                    down: {
                        offsetX: item.offsetX,
                        offsetY: item.offsetY,
                    },
                },
            },
            ...item,
        };
        super( data, map );
        this.hero = hero;
    }


    applyPosition () {
        this.position = {
            x: this.hero.position.x + ( this.hero.width / 2 ) - ( this.width / 2 ),
            y: this.hero.position.y,
            z: -this.height,
        }
    }
}



/*******************************************************************************
* Lifted Tile
* There can be only one at a time
*******************************************************************************/
export class LiftedTile extends Sprite {
    constructor ( spawn, activeTiles, map, hero ) {
        const tile = activeTiles.getTile();
        const data = {
            width: map.data.tilesize,
            height: map.data.tilesize,
            image: map.data.image,
            spawn,
            hitbox: {
                x: 0,
                y: 0,
                width: map.data.tilesize,
                height: map.data.tilesize,
            },
            verbs: {
                face: {
                    down: {
                        offsetX: tile[ 0 ],
                        offsetY: tile[ 1 ],
                    },
                },
            },
        };
        super( data, map );
        this.hero = hero;
        this.throwing = false;
        this.activeTiles = activeTiles;
    }


    destroy () {
        const attackAction = this.activeTiles.canAttack();

        if ( attackAction?.drops ) {
            this.gamebox.itemDrop( attackAction.drops, this.position );
        }
        
        this.gamebox.smokeObject( this, attackAction?.fx );
        this.player.gameaudio.hitSound( Config.verbs.SMASH );
        this.gamebox.interact.tile = null;

        // Kills THIS sprite
        this.hero.liftedTile = null;
        this.spring.destroy();
    }


    blit ( elapsed ) {
        if ( !this.spring ) {
            return;
        }

        if ( this.spring.isResting ) {
            this.destroy();
            return;
        }

        const collision = {
            map: this.gamebox.checkMap( this.position, this ),
            npc: this.gamebox.checkNPC( this.position, this ),
            camera: this.gamebox.checkCamera( this.position, this ),
        };

        if ( collision.map || collision.npc || collision.camera ) {
            this.destroy();
            return;

        }
        
        this.spring.blit( elapsed );
    }


    applyPosition () {
        if ( !this.throwing ) {
            this.position = {
                x: this.hero.position.x + ( this.hero.width / 2 ) - ( this.width / 2 ),
                y: this.hero.hitbox.y,
                z: -this.height,
            };
            return;
        }

        this.position = this.getNextPoi();
    }


    throw () {
        this.hero.face( this.hero.dir );
        this.player.gameaudio.hitSound( Config.verbs.THROW );
        this.hero.physics.maxv = this.hero.physics.controlmaxv;
        this.throwing = true;

        let throwX;
        let throwY;
        const dist = this.map.data.tilesize * 2;

        switch ( this.hero.dir ) {
            case "left":
                throwX = this.position.x - dist;
                throwY = this.hero.footbox.y - ( this.height - this.hero.footbox.height );
                break;
            case "right":
                throwX = this.position.x + dist;
                throwY = this.hero.footbox.y - ( this.height - this.hero.footbox.height );
                break;
            case "up":
                throwX = this.position.x;
                throwY = this.position.y - dist;
                break;
            case "down":
                throwX = this.position.x;
                throwY = this.hero.footbox.y + dist;
                break;
        }

        this.spring = new Spring( 
            this.player,
            this.position.x,
            this.position.y,
            60,
            3.5
        );
        this.spring.poi = {
            x: throwX,
            y: throwY,
        };
        this.spring.bind( this );
    }
}
