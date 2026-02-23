import Sprite from "./Sprite";



export default class Projectile extends Sprite {
    constructor ( projectile, dir, sprite, map ) {
        const width = projectile.dirs ? projectile.dirs[ dir ].width : projectile.width;
        const height = projectile.dirs ? projectile.dirs[ dir ].height : projectile.height;
        const spawn = {
            x: sprite.position.x + ( sprite.width / 2 ) - ( width / 2 ),
            y: sprite.position.y + ( sprite.height / 2 ) - ( height / 2 ),
        }
        switch ( dir ) {
            case "left":
                spawn.x -= width;
                break;
            case "right":
                spawn.x += width;
                break;
            case "up":
                spawn.y -= height;
                break;
            case "down":
                spawn.y += height;
                break;
        }
        const hitbox = {
            x: 0,
            y: 0,
            width,
            height,
        }
        const verbs = projectile.dirs ? {
            face: {
                down: projectile.dirs.down,
                up: projectile.dirs.up,
                left: projectile.dirs.left,
                right: projectile.dirs.right,
            },
        } : {
            face: {
                [dir]: {
                    offsetX: projectile.offsetX,
                    offsetY: projectile.offsetY,
                },
            },
        }
        // Inherit the layer from the sprite that fired the projectile
        const layer = sprite.layer;
        const data = {
            dir,
            spawn,
            width,
            height,
            hitbox,
            verbs,
            layer,
            ...projectile,
        };
        super( data, map );
        this.flightDir = dir;
        this.flightCounter = 0;
        this.hitCounter = 0;
        this.sprite = sprite;
        // Inherit the elevation from the sprite that fired the projectile
        this.elevation = this.sprite.elevation;
        this.lockElevation = this.elevation ? (
            ( this.elevation.event.isHorizontal && ( this.flightDir === "up" || this.flightDir === "down" ) ) ||
            ( !this.elevation.event.isHorizontal && ( this.flightDir === "left" || this.flightDir === "right" ) )
        ) : false;
        this.map.addObject( "sprites", this );
        this.init();
    }


    init () {
        this.sparks();
    }


    sparks () {
        if ( this.data.fx ) {
            this.map.mapFX.smokeObject( this, this.data.fx, {
                layer: this.layer,
            });
        }

        if ( this.data.sound ) {
            if ( this.sprite === this.gamebox.hero ) {
                this.player.gameaudio.heroSound( this.data.sound );
            } else {
                this.player.gameaudio.hitSound( this.data.sound );
            }
        }
    }


    update () {
        if ( !this.onscreen ) {
            return;
        }

        this.controls[ this.flightDir ] = true;

        this.handleFlight();
        this.handleControls();
        this.updateStack();
    }


    handleFlight () {
        if ( !this.data.spin ) {
            return;
        }

        this.flightCounter++;

        if ( this.flightCounter % 5 === 0 ) {
            if ( this.dir === "left" ) {
                this.dir = "down";

            } else if ( this.dir === "down" ) {
                this.dir = "right";

            } else if ( this.dir === "right" ) {
                this.dir = "up";

            } else if ( this.dir === "up" ) {
                this.dir = "left";
            }
        }
    }


    kill () {
        this.map.killObject( "sprites", this );
        this.sparks();
        this.sprite.projectile = null;
    }


    canHitHero () {
        return !this.gamebox.hero.isHitOrStill() && !this.gamebox.hero.canShield( this );
    }


    applyPosition () {
        const poi = this.getNextPoi();
        const { collision, isMapCollision } = this.gamebox.checkElevationCollision( this.position, this, {
            hero: this.gamebox.checkHero( this.position, this ),
            doors: this.gamebox.checkDoor( this.position, this ),
            camera: this.gamebox.checkCamera( this.position, this ),
            npc: this.gamebox.checkNPC( this.position, this ),
            enemy: this.gamebox.checkEnemy( this.position, this ),
            // Skip tiles check for elevation layer
            tiles: this.elevation ? false : this.gamebox.checkTiles( this.position, this ),
        });

        const isCollision = (
            collision.doors ||
            collision.camera ||
            // Skip map check if we're on the elevation layer and so is the collider
            isMapCollision ||
            // Layer checks handled in collision checks above
            collision.hero ||
            collision.npc ||
            ( collision.enemy && collision.enemy !== this.sprite ) ||
            this.canTileStop( collision )
        );

        if ( isCollision ) {
            if ( collision.hero && this.canHitHero() ) {
                this.gamebox.hero.hit( this.data.power );
            }
            
            this.kill();

            return;
        }

        this.position = poi;
    }
}