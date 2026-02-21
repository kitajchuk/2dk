import Utils from "../Utils";
import Config from "../Config";
import Sprite from "./Sprite";
import Spring from "../Spring";
import Projectile from "./Projectile";
import FX from "./FX";



/*******************************************************************************
* Hero
* There can be only one per Map
*******************************************************************************/
export default class Hero extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.onscreen = true;
        this.magic = this.data.stats?.magic ?? 20;
        // Cannot increase magic beyond this value...
        this.maxMagic = this.magic;
        this.status = null;
        this.statusEffects = {};
        this.currency = this.data.currency || 0;
        this.equipped = this.data.equipped || {
            weapon: false,
            shield: false,
        };
        this.enemiesKilled = 0;
        this.totalDeaths = 0;
        this.itemGet = null;
        this.liftedTile = null;
        this.maskFX = null;
        this.items = [];
        // Hero controls are defined by the Player
        this.controls = this.player.controls;
        this.deathCounter = 0;
        this.kickCounter = 0;
        this.diveCounter = 0;
        this.spinCounter = 0;
        this.spinLocked = false;
        this.spinCharged = false;
        this.projectile = null;
        this.projectileIndex = -1;
        this.projectileItem = null;
        this.mode = Config.hero.modes.WEAPON;
        this.interact = null;
        this.parkour = null;
        this.falling = null;
        this.lifting = null;
        this.lastPositionOnGround = this.position;
    }


    visible () {
        return true;
    }


    hit ( ...args ) {
        if ( this.falling || this.diveCounter > 0 ) {
            return;
        }

        super.hit( ...args );

        this.destroyLiftedTile();

        if ( !this.gamebox.swimming ) {
            this.resetSpin(); // Will call face( this.dir );
            this.physics.vz = -6;
        }
    }


    isDead () {
        return this.deathCounter > 0 || this.killed;
    }


    jump () {
        this.maskFX = null;
        this.resetMaxV();
        this.cycle( Config.verbs.JUMP, this.dir );
        this.physics.vz = -( this.map.data.tilesize / 3 );
        this.player.gameaudio.heroSound( Config.verbs.JUMP );
    }


    swimKick () {
        this.kickCounter = 30;
        this.physics.maxv = this.physics.controlmaxv * 4;
        this.player.gameaudio.heroSound( Config.verbs.JUMP );
    }


    swimDive () {
        this.diveCounter = 120;
        this.cycle( Config.verbs.DIVE, this.dir );
    }


    resetMaxV () {
        if ( this.spinLocked ) {
            this.physics.maxv = this.physics.controlmaxv / 2;

        } else {
            this.physics.maxv = this.physics.controlmaxv;
        }
    }


    resetItemGet () {
        this.itemGet = null;
        this.stillTimer = 0;
        this.face( "down" );
    }


    addMaskFX ( data ) {
        this.maskFX = new HeroMaskFX( data, this, this.map, {
            x: this.position.x,
            y: this.position.y,
        });
    }


/*******************************************************************************
* Stats
*******************************************************************************/
    checkStat ( stat, value ) {
        return this.getStat( stat ) >= value;
    }


    getStat ( stat ) {
        let itemEffects = 0
        for ( let i = this.items.length; i--; ) {
            if ( this.items[ i ].stat?.key === stat ) {
                itemEffects += this.items[ i ].stat.value;
            }
        }
        const statusEffects = this.statusEffects[ this.status ]?.[ stat ] ?? 0;
        return this.stats[ stat ] + itemEffects + statusEffects;
    }


    updateStat ( stat, value ) {
        switch ( stat ) {
            case "health":
                this.health = Math.max( 0, Math.min( this.health + value, this.getMaxHealth() ) );
                break;
            case "magic":
                this.magic = Math.max( 0, Math.min( this.magic + value, this.maxMagic ) );
                break;
            default:
                this.stats[ stat ] += value;
                break;
        }
    }


    getMaxHealth () {
        return this.maxHealth * ( this.statusEffects[ this.status ]?.maxHealth ?? 1 );
    }


/*******************************************************************************
* Items
*******************************************************************************/
    applyStatus ( status ) {
        this.status = status;

        if ( this.data.status[ status ] ) {
            this.statusEffects[ status ] = this.data.status[ status ];

            // Max health is special (e.g. curse caps at 1/2 health)
            if ( this.statusEffects[ status ].maxHealth ) {
                this.health = this.maxHealth * this.statusEffects[ status ].maxHealth;
            }
        }
    }


    removeStatus () {
        this.status = null;
        this.statusEffects = {};
        this.health = this.maxHealth;
    }


    itemCheck ( id ) {
        const item = this.getItem( id );

        if ( item ) {
            if ( item.collect ) {
                return item.collected > 0;
            }

            return true;
        }

        return false;
    }


    getItem ( id ) {
        return this.items.find( ( item ) => item.id === id );
    }


    hasJump () {
        return this.items.some( ( item ) => item.verb === Config.verbs.JUMP );
    }


    hasSwim () {
        return this.items.some( ( item ) => item.verb === Config.verbs.SWIM );
    }


    hasMagic () {
        return this.items.some( ( item ) => item.stat?.key === "magic" );
    }


    canUseMagic () {
        return this.hasMagic() && this.magic > 0;
    }


    collectItem ( id, mapId ) {
        const item = this.getItem( id );

        if ( item ) {
            item.collected++;
            return;
        }

        this.giveItem( id, mapId );
    }


    takeCollectible ( id ) {
        const item = this.getItem( id );

        if ( item && item.collect ) {
            item.collected = Math.max( 0, item.collected - 1 );
        }
    }


    doItemGet ( item ) {
        if ( this.data.verbs.itemGet?.down ) {
            this.itemGet = new ItemGet( this.position, item, this.map, this );
            this.stillTimer = Infinity;
            this.cycle( "itemGet", "down" );
            this.player.gameaudio.heroSound( "itemGet" );
        }
    }


    giveItem ( id, mapId ) {
        const item = this.player.getMergedData({
            id,
            mapId,
        }, "items" );

        if ( !this.getItem( id ) ) {
            this.items.push( item );
        }

        this.doItemGet( item );

        if ( item.equip ) {
            this.equip( item.equip );
        }

        if ( item.currency ) {
            this.receive( item.currency );
        }

        if ( item.status ) {
            this.applyStatus( item.status );
        }

        if ( item.cure && item.cure === this.status ) {
            this.removeStatus( item.cure );
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

        if ( item.status ) {
            this.removeStatus();
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
* Equipped (weapon, shield, projectile etc...)
*******************************************************************************/
    equip ( eq ) {
        this.equipped[ eq ] = true;
    }


    unequip ( eq ) {
        this.equipped[ eq ] = false;
    }


    isEquipped ( eq ) {
        return this.equipped[ eq ] || false;
    }


    hasWeapon () {
        return this.equipped.weapon && this.data.weapon?.[ this.dir ]?.length;
    }


    hasShield () {
        return this.equipped.shield && this.data.shield?.[ this.verb ]?.[ this.dir ]?.length;
    }


    hasProjectile () {
        return this.items.some( ( item ) => item.projectile );
    }


    canCycleProjectile () {
        const projectiles = this.items.filter( ( item ) => item.projectile );
        return projectiles.length > 1 && this.projectileIndex < projectiles.length - 1;
    }


    updateProjectileItem () {
        const projectiles = this.items.filter( ( item ) => item.projectile );
        
        if ( this.projectileIndex >= projectiles.length - 1 ) {
            this.projectileIndex = 0;
        } else {
            this.projectileIndex++;
        }

        this.projectileItem = projectiles[ this.projectileIndex ];
    }


    fireProjectile () {
        if ( this.projectile || !this.projectileItem ) {
            return;
        }

        const data = this.gamebox.player.getMergedData({
            id: this.projectileItem.projectile,
        }, "projectiles" );

        this.projectile = new HeroProjectile( data, this.dir, this, this.map );
    }


    isWeaponMode () {
        return this.hasWeapon() && this.mode === Config.hero.modes.WEAPON;
    }


    isProjectileMode () {
        return this.hasProjectile() && this.mode === Config.hero.modes.PROJECTILE;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blitAfter ( elapsed ) {
        if ( this.kickCounter > 0 ) {
            this.kickCounter--;
        }

        if ( this.diveCounter > 0 ) {
            this.diveCounter--;

            // Exit dive cycle here in case we're handling early return collision in gamebox...
            if ( this.diveCounter === 0 ) {
                this.cycle( Config.verbs.SWIM, this.dir );
            }
        }

        // We need to capture this here since during a lift the gamebox is LOCKED...
        if ( this.lifting ) {
            this.blitLifting( elapsed );
        }

        // We need to prevent an infinite attack loop so we force a face reset after the attack duration...
        if ( this.gamebox.attacking ) {
            this.blitAttacking( elapsed );
        }

        if ( this.maskFX ) {
            this.maskFX.blit( elapsed );
        }

        if ( this.itemGet ) {
            this.itemGet.blit( elapsed );
        }

        if ( this.liftedTile ) {
            this.liftedTile.blit( elapsed );
        }

        // Handle passive interaction
        this.handlePassiveInteraction( elapsed );
    }


    blitLifting ( elapsed ) {
        this.lifting.timeElapsed = elapsed - this.lifting.timeStarted;

        if ( this.lifting.timeElapsed >= this.getDur( Config.verbs.LIFT ) ) {
            this.applyLifting();
        }
    }


    blitAttacking ( elapsed ) {
        this.gamebox.attacking.timeElapsed = elapsed - this.gamebox.attacking.timeStarted;

        if ( this.gamebox.attacking.timeElapsed < this.getDur( Config.verbs.ATTACK ) ) {
            return;
        }

        if ( !this.canUseMagic() || !this.isWeaponMode() ) {
            this.resetAttacking();
            return;
        }

        if ( this.controls.b ) {
            if ( this.controls.bHold ) {
                this.spinCharged = true;
                this.spinCounter++;

            } else {
                this.spinLocked = true;

                // Force the final frame of the attack sprite cycle to "charge" up the spin
                this.frameStopped = true;
                this.frame = this.data.verbs[ this.verb ][ this.dir ].stepsX - 1;
                this.spritecel = this.getCel();
                this.physics.maxv = this.physics.controlmaxv / 2;
            }

            if ( !this.isIdle() && this.isOnGround() ) {
                this.physics.vz = -3;
            }

            return;
        }

        this.resetAttacking();
    }


    resetAttacking () {
        this.face( this.dir );
        this.spinCounter = 0;
        this.frameStopped = false;
        this.gamebox.attacking = null;
    }


    // This is to hard cancel out of the spin attack sequence (e.g. from a tile fall)
    resetSpin () {
        this.spinLocked = false;
        this.spinCharged = false;
        this.resetAttacking();
    }


    update () {
        if ( this.gamebox.panning ) {
            this.updateWhilePanning();
            return;
        }

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


    updateWhilePanning () {
        this.applyOffset();

        if ( this.maskFX ) {
            this.maskFX.applyOffset();
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

        this.renderWeapon();
        this.renderShield();

        if ( this.player.query.debug ) {
            this.renderAfterDebug();
        }
    }


    renderWeapon () {
        if ( !( this.hasWeapon() && this.is( Config.verbs.ATTACK ) && this.mode === Config.hero.modes.WEAPON ) ) {
            return;
        }
        
        if ( this.spinCharged && this.spinCounter % 5 === 0 ) {
            this.player.renderLayer.context.save();
            this.player.renderLayer.context.globalAlpha = 0.25;
        }

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

        this.player.renderLayer.context.restore();
        
        // Don't handle attack collision on the "windup" frame
        // Can always provide more control over which frames are checked
        // TODO: This needs to handle the spin attack on EVERY frame...
        if ( this.frame > 0 ) {
            this.handleAttackFrame();
        }
    }


    renderShield () {
        if ( !( this.hasShield() && !this.gamebox.attacking ) ) {
            return;
        }

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

    
    renderAfterDebug () {
        this.player.renderLayer.context.globalAlpha = 0.5;
        this.player.renderLayer.context.fillStyle = Config.colors.teal;

        if ( this.hasWeapon() && this.is( Config.verbs.ATTACK ) ) {
            const weaponbox = this.getWeaponbox( "offset" );

            this.player.renderLayer.context.fillRect(
                weaponbox.x,
                weaponbox.y,
                weaponbox.width,
                weaponbox.height
            );
        }

        if ( this.hasShield() ) {
            const shieldbox = this.getShieldbox( "offset" );

            this.player.renderLayer.context.fillRect(
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
    handlePassiveInteraction () {
        const poi = this.getNextPoiByDir( this.dir, 1 );
        const collision = {
            npc: this.gamebox.checkNPC( poi, this ),
            door: this.gamebox.checkDoor( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
        };
        const notLifting = !this.is( Config.verbs.LIFT ) && !this.is( Config.verbs.GRAB ) && !this.is( Config.verbs.PULL );
        const isDoorRead = collision.door && ( collision.door.canInteract( this.dir ) || collision.door.canInteractQuest() );
        const isNPCRead = collision.npc && collision.npc.canInteract( this.dir );
        const isGrabTile = this.canGrabTile( collision ) || !notLifting;

        if ( this.gamebox.dialogue.active || isDoorRead || isNPCRead ) {
            this.interact = Config.hero.interact.READ;

        } else if ( isGrabTile ) {
            this.interact = Config.hero.interact.GRAB;

        } else if ( notLifting ) {
            this.interact = null;
        }
    }


    // Needs to be called for every frame of attack animation
    handleAttackFrame () {
        const weaponBox = this.getWeaponbox();
        const collision = {
            enemy: this.gamebox.checkEnemy( this.position, weaponBox ),
            item: this.gamebox.checkItems( this.position, weaponBox ),
            tiles: this.gamebox.checkTiles( this.position, weaponBox ),
        };

        if ( collision.item ) {
            this.gamebox.handleHeroItem( this.position, this.dir, collision.item );
        }

        if ( collision.enemy && collision.enemy.canBeAttacked( this ) ) {
            collision.enemy.hit( this.getStat( "power" ) );
        }

        // TODO: When we implement the spin attack sequence, we need to fix this so THOSE frames CAN trigger tile attacks...
        this.handleAttackTiles({ collision });
    }


    handleAttackTiles ({ collision, checkStop = false }) {
        if ( collision.tiles && collision.tiles.attack.length && !this.spinLocked ) {
            for ( let i = collision.tiles.attack.length; i--; ) {
                if ( collision.tiles.attack[ i ].attack && ( !checkStop || collision.tiles.attack[ i ].stop ) ) {
                    const attackAction = collision.tiles.attack[ i ].instance.canAttack();

                    if ( attackAction ) {
                        collision.tiles.attack[ i ].instance.attack( collision.tiles.attack[ i ].coord, attackAction );
                    }
                }
            }
        }
    }


    handleHealthCheck () {
        if ( this.health <= 0 ) {
            this.stillTimer = Infinity;
            this.deathCounter = 240;
            this.totalDeaths++;

            if ( this.maskFX ) {
                this.maskFX.paused = true;
            }

            if ( this.gamebox.swimming ) {
                this.cycle( Config.verbs.DIVE, "down" );

            } else if ( this.data.verbs.die?.down ) {
                this.cycle( "die", "down" );
            }

            this.player.gameaudio.stop();
            this.player.gameaudio.heroSound( "death" );
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

        // Don't allow the hero to change direction visually while spinLocked
        // The gamebox still allows the hero to move around while spinLocked
        if ( !this.spinLocked ) {
            this.dir = dir;
        }

        this.position.x = poi.x;
        this.position.y = poi.y;
        this.applyHitbox();
        this.applyHeroMask();
    }


    applyOpacity () {
        super.applyOpacity();

        // Camera animates to reset position but we omit the hero sprite visually
        // For standard fall (e.g. empty tiles) this isn't a big deal but...
        // For ledge jumping into water without flippers it looks odd to reset with the DIVE sprite cycle.
        if ( this.falling && this.falling.didReset && this.falling.resetCounter === 0 ) {
            this.player.renderLayer.context.globalAlpha = 0;
        }
    }


    destroyLiftedTile () {
        if ( this.liftedTile ) {
            this.liftedTile.destroy();
        }
    }


    applyLifting () {
        const activeTiles = this.map.getActiveTiles( this.gamebox.interact.tile.group );
        const spawn = {
            x: this.gamebox.interact.tile.coord[ 0 ] * this.map.data.tilesize,
            y: this.gamebox.interact.tile.coord[ 1 ] * this.map.data.tilesize,
        };

        this.player.gameaudio.heroSound( Config.verbs.LIFT );
        this.map.spliceActiveTile( this.gamebox.interact.tile.group, this.gamebox.interact.tile.coord );
        this.liftedTile = new LiftedTile( spawn, activeTiles, this.map, this );
        this.cycle( Config.verbs.LIFT, this.dir );
        this.physics.maxv = this.physics.controlmaxv / 2;
        this.gamebox.locked = false;
        this.lifting = null;
    }


    applyFalling () {
        if ( this.position.x === this.falling.reset.x && this.position.y === this.falling.reset.y ) {
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
                this.applyParkourComplete();
                return;
            }
            return;
        }
        if ( this.position.x === this.parkour.poi.x && this.position.y === this.parkour.poi.y ) {
            if ( this.parkour.isEventDoor ) {
                if ( this.parkour.event.data.verb && this.can( this.parkour.event.data.verb ) ) {
                    this.parkour.didEventDoor = true;
                    this.cycle( this.parkour.event.data.verb, this.parkour.dir );

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

        const speed = this.parkour.elevation * 2 + 2;

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
            this.parkour.activeTiles.attack( this.parkour.coords, attackAction );

            // Check surrounding tiles in case we technically land on multiple tiles
            const surroundingTiles = Utils.getSurroundingTileCoords( this.parkour.coords );

            for ( const pos in surroundingTiles ) {
                const tileCoords = [
                    surroundingTiles[ pos ].x,
                    surroundingTiles[ pos ].y,
                ];

                if ( this.parkour.activeTiles.isPushed( tileCoords ) ) {
                    this.parkour.activeTiles.attack( tileCoords, attackAction );
                }
            }
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

            if ( this.isIdle() ) {
                this.maskFX.paused = true;
            } else {
                this.maskFX.paused = false;
            }
        }
    }


    applyOffset () {
        if ( this.gamebox.panning ) {
            super.applyOffset();
            return;
        }
        
        this.offset = {
            x: ( this.gamebox.camera.width / 2 ) - ( this.width / 2 ),
            y: ( this.gamebox.camera.height / 2 ) - ( this.height / 2 ),
        };

        if ( this.gamebox.camera.x <= 0 ) {
            this.offset.x = this.position.x;

        } else if ( this.gamebox.camera.x >= ( this.map.width - this.gamebox.camera.width ) ) {
            this.offset.x = this.position.x - this.gamebox.camera.x;
        }

        if ( this.gamebox.camera.y <= 0 ) {
            this.offset.y = this.position.y;

        } else if ( this.gamebox.camera.y >= ( this.map.height - this.gamebox.camera.height ) ) {
            this.offset.y = this.position.y - this.gamebox.camera.y;
        }
    }


    applyCycle () {
        if ( this.parkour || this.falling || this.spinLocked ) {
            return;
        }

        // Lifting and carrying an object trumps all
        if ( this.is( Config.verbs.LIFT ) ) {
            this.cycle( Config.verbs.LIFT, this.dir );

        // Swimming needs to be captured...
        } else if ( this.gamebox.swimming ) {
            if ( this.diveCounter > 0 ) {
                this.cycle( Config.verbs.DIVE, this.dir );
            } else {
                this.cycle( Config.verbs.SWIM, this.dir );
            }

        // Jumping needs to be captured...
        } else if ( this.gamebox.jumping || this.gamebox.dropin ) {
            this.cycle( Config.verbs.JUMP, this.dir );

        // Attack needs to be captured...
        } else if ( this.gamebox.attacking ) {
            this.cycle( Config.verbs.ATTACK, this.dir );

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
            height: this.data.weapon[ this.dir ][ this.frame ].height,
            // Can be used for collision checks with other sprites etc...
            layer: this.layer,
            elevation: this.elevation,
        };
    }


    // Use "offset" to draw shield debug box
    getShieldbox ( prop = "position" ) {
        return {
            x: this[ prop ].x + this.data.shield[ this.verb ][ this.dir ][ this.frame ].positionX,
            y: this[ prop ].y + this.data.shield[ this.verb ][ this.dir ][ this.frame ].positionY,
            width: this.data.shield[ this.verb ][ this.dir ][ this.frame ].width,
            height: this.data.shield[ this.verb ][ this.dir ][ this.frame ].height,
            layer: this.layer,
            elevation: this.elevation,
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
    canMoveWhileJumping ( collision, isElevationCollider = false ) {
        return (
            !( collision.map && !isElevationCollider ) &&
            !collision.npc &&
            !collision.enemy &&
            !collision.door &&
            !collision.camera &&
            !( collision.tiles && collision.tiles.action.length && collision.tiles.action.find( ( tile ) => {
                return tile.stop;
            }) )
        );
    }


    canResetMaxV () {
        return ( this.physics.maxv !== this.physics.controlmaxv && !this.is( Config.verbs.LIFT ) && !this.gamebox.swimming );
    }


    canEventDoor ( collision ) {
        return ( collision.event.data.type === Config.events.DOOR );
    }


    canEventBoundary ( collision ) {
        return ( collision.event.data.type === Config.events.BOUNDARY && collision.camera );
    }


    canEventDialogue ( collision ) {
        return ( collision.event.data.type === Config.events.DIALOGUE && collision.event.data.dialogue );
    }


    canLift ( dir ) {
        return ( dir === Config.opposites[ this.dir ] );
    }


    canGrabTile ( collision ) {
        if ( !collision.tiles || !collision.tiles.action.length ) {
            return false;
        }

        if ( !this.can( Config.verbs.LIFT ) || !this.can( Config.verbs.GRAB ) ) {
            return false;
        }
        
        return collision.tiles.action.some( ( tile ) => {
            return tile.instance.canInteract( Config.verbs.LIFT );
        });
    }


    canTileSwim ( poi, collision ) {
        const { tiles } = collision;
        const swimTiles = tiles && tiles.action.filter( ( tile ) => {
            return tile.swim;
        });
        const tolerance = 5;

        if ( swimTiles && swimTiles.length ) {
            return swimTiles.some( ( tile ) => {
                return Utils.collide( tile.tilebox, this.footbox, tolerance );
            });
        }

        return false;
    }


    canTileJump ( dir, collision ) {
        const hasPassiveTiles = collision.tiles && collision.tiles.passive.length;

        if ( !hasPassiveTiles ) {
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

            const fgTile = this.map.getEmptyTile( tileCoords, "foreground" );

            if ( fgTile !== 0 ) {
                return false;
            }

            return !!emptyTile;
        }

        return false;
    }


    canShield ( npc, tolerance = 10 ) {
        if ( !this.hasShield() ) {
            return false;
        }

        if ( npc.status && npc.status !== this.status ) {
            return false;
        }

        if ( this.dir === "left" && npc.hitbox.x + npc.hitbox.width <= this.hitbox.x + tolerance ) {
            return true;
        }

        if ( this.dir === "right" && npc.hitbox.x >= this.hitbox.x + this.hitbox.width - tolerance ) {
            return true;
        }

        if ( this.dir === "up" && npc.hitbox.y + npc.hitbox.height <= this.hitbox.y + tolerance ) {
            return true;
        }

        if ( this.dir === "down" && npc.hitbox.y >= this.hitbox.y + this.hitbox.height - tolerance ) {
            return true;
        }

        return false;
    }


    canAggroEnemy ( enemy ) {
        return !this.gamebox.dropin && !this.isDead();
    }
}



/*******************************************************************************
* Hero Mask FX
* Used to display the mask the hero is wearing
*******************************************************************************/
export class HeroMaskFX extends FX {
    constructor ( fx, hero, map, spawn ) {
        const data = {
            ...fx,
            spawn,
        };
        super( data, map );
        this.hero = hero;
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
            map: this.gamebox.checkMap( this.position, this ),
            doors: this.gamebox.checkDoor( this.position, this ),
            camera: this.gamebox.checkCamera( this.position, this ),
            event: this.gamebox.checkEvents( poi, this, { dirCheck: false } ),
            npc: this.gamebox.checkNPC( this.position, this ),
            enemy: this.gamebox.checkEnemy( this.position, this ),
            // Skip tiles check for elevation layer
            tiles: this.elevation ? false : this.gamebox.checkTiles( this.position, this ),
        };

        const { isElevationCollider } = this.handleElevation( poi, collision );

        const isCollision = (
            // Skip map check if we're on the elevation layer and so is the collider
            ( collision.map && !isElevationCollider ) ||
            // Layer checks handled in collision checks above
            collision.npc ||
            collision.enemy ||
            collision.doors ||
            collision.camera ||
            this.canTileStop( collision )
        );

        if ( collision.tiles && this.data.spin ) {
            this.hero.handleAttackTiles({ collision, checkStop: true });
        }
        
        if ( isCollision ) {
            if ( collision.enemy && collision.enemy.canBeAttacked( this ) ) {
                collision.enemy.hit( this.hero.getStat( "power" ) );
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
        this.onscreen = true;
        this.activeTiles = activeTiles;
    }


    destroy () {
        const attackAction = this.activeTiles.canAttack();

        if ( attackAction?.drops ) {
            this.gamebox.itemDrop( attackAction.drops, this.position );
        }

        if ( attackAction?.sound ) {
            // Don't use hero sound channel for lifted tile sounds
            this.player.gameaudio.hitSound( attackAction.sound );
        }
        
        this.map.mapFX.smokeObject( this, attackAction?.fx );
        this.gamebox.interact.tile = null;

        // Kills THIS sprite
        this.hero.liftedTile = null;
        
        if ( this.spring ) {
            this.spring.destroy();
        }
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
            enemy: this.gamebox.checkEnemy( this.position, this ),
            camera: this.gamebox.checkCamera( this.position, this ),
        };

        if ( collision.map || collision.npc || collision.enemy || collision.camera ) {
            if ( collision.enemy && !collision.enemy.isHitOrStill() ) {
                collision.enemy.hit( this.hero.getStat( "power" ) );
            }

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
        this.player.gameaudio.heroSound( Config.verbs.THROW );
        this.hero.physics.maxv = this.hero.physics.controlmaxv;
        this.hero.interact = null;
        this.throwing = true;

        let throwX;
        let throwY;
        const dist = this.map.data.tilesize * 2;

        switch ( this.hero.dir ) {
            case "left":
                throwX = this.position.x - dist - this.width;
                throwY = this.hero.footbox.y - ( this.height - this.hero.footbox.height );
                break;
            case "right":
                throwX = this.position.x + dist + this.width;
                throwY = this.hero.footbox.y - ( this.height - this.hero.footbox.height );
                break;
            case "up":
                throwX = this.position.x;
                throwY = this.position.y - dist - this.height;
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
