import Config from "../Config";
import Sprite from "./Sprite";



/*******************************************************************************
* Hero
* There can be only one per Map
*******************************************************************************/
class Hero extends Sprite {
    constructor ( data, map ) {
        super( data, map );
        this.layer = "heroground";
        // Hero controls are defined by the Player
        this.controls = this.gamebox.player.controls;
    }


    visible () {
        return true;
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


    hasWeapon () {
        return this.data.weapon && this.data.weapon[ this.dir ] && this.data.weapon[ this.dir ].length;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    update () {
        // Handle player controls
        this.handleControls();

        // The physics stack...
        this.handleVelocity();
        this.handleGravity();
        this.applyGravity();
    }


    renderAfter () {
        if ( this.is( Config.verbs.ATTACK ) && this.hasWeapon() ) {
            this.gamebox.layers[ this.layer ].onCanvas.context.drawImage(
                this.image,
                Math.abs( this.data.weapon[ this.dir ][ this.frame ].offsetX ),
                Math.abs( this.data.weapon[ this.dir ][ this.frame ].offsetY ),
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
                this.gamebox.handleHeroAttackFrame();
            }
        }

        if ( this.gamebox.player.query.get( "debug" ) ) {
            this.renderAfterDebug();
        }
    }

    
    renderAfterDebug () {
        if ( this.gamebox.attacking && this.hasWeapon() ) {
            const weaponbox = this.getWeaponbox( "offset" );

            this.gamebox.layers.foreground.onCanvas.context.globalAlpha = 0.5;
            this.gamebox.layers.foreground.onCanvas.context.fillStyle = Config.colors.teal;
            this.gamebox.layers.foreground.onCanvas.context.fillRect(
                weaponbox.x,
                weaponbox.y,
                weaponbox.width,
                weaponbox.height
            );
            this.gamebox.layers.foreground.onCanvas.context.globalAlpha = 1.0;
        }
    }


/*******************************************************************************
* Applications
* Hero uses custom position and offset determinance...
*******************************************************************************/
    applyPosition ( poi, dir ) {
        this.dir = dir;
        this.position.x = poi.x;
        this.position.y = poi.y;
        this.applyHitbox();
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
    // Use "offset" to draw weaponbox debug box
    getWeaponbox ( prop = "position" ) {
        return {
            x: this[ prop ].x + this.data.weapon[ this.dir ][ this.frame ].positionX,
            y: this[ prop ].y + this.data.weapon[ this.dir ][ this.frame ].positionY,
            width: this.data.weapon[ this.dir ][ this.frame ].width,
            height: this.data.weapon[ this.dir ][ this.frame ].height
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
    canMoveWhileJumping ( poi, dir, collision ) {
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


    canEventDoor ( poi, dir, collision ) {
        return ( collision.event.type === Config.events.DOOR );
    }


    canEventBoundary ( poi, dir, collision ) {
        return ( collision.event.type === Config.events.BOUNDARY && collision.camera );
    }


    canEventDialogue ( poi, dir, collision ) {
        return ( collision.event.type === Config.events.DIALOGUE && collision.event.payload );
    }


    canLift ( poi, dir ) {
        return ( dir === Config.opposites[ this.dir ] );
    }


    canTileJump ( poi, dir, collision ) {
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
}



export default Hero;
