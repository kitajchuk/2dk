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
        const data = {
            dir,
            spawn,
            width,
            height,
            hitbox,
            verbs,
            ...projectile,
        };
        super( data, map );
        this.hitCounter = 0;
        this.sprite = sprite;
        this.map.addObject( "sprites", this );
        this.sparks();
    }


    sparks () {
        if ( this.data.fx ) {
            this.map.mapFX.smokeObject( this, this.data.fx );
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

        this.controls[ this.dir ] = true;

        this.handleControls();
        this.updateStack();
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
        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            npc: this.gamebox.checkNPC( poi, this ),
            enemy: this.gamebox.checkEnemy( poi, this ),
            hero: this.gamebox.checkHero( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
            doors: this.gamebox.checkDoor( poi, this ),
            camera: this.gamebox.checkCamera( poi, this ),
        };

        const isCollision = (
            collision.map ||
            collision.hero ||
            collision.doors ||
            collision.camera ||
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