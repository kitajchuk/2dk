import Config from "../Config";
import Sprite from "./Sprite";



export default class Projectile extends Sprite {
    constructor ( projectile, dir, npc, map ) {
        const width = projectile.dirs ? projectile.dirs[ dir ].width : projectile.width;
        const height = projectile.dirs ? projectile.dirs[ dir ].height : projectile.height;
        const spawn = {
            x: npc.position.x + ( npc.width / 2 ) - ( width / 2 ),
            y: npc.position.y + ( npc.height / 2 ) - ( height / 2 ),
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
        this.npc = npc;
        this.map.addObject( "sprites", this );
        this.sparks();
    }


    sparks () {
        if ( this.data.fx ) {
            this.gamebox.smokeObject( this, this.data.fx );
        }

        if ( this.data.sound ) {
            this.player.gameaudio.hitSound( this.data.sound );
        }
    }


    update () {
        if ( !this.visible() ) {
            return;
        }

        this.controls[ this.dir ] = true;

        this.handleControls();
        this.updateStack();
    }


    kill () {
        this.map.killObject( "sprites", this );
        this.sparks();
        this.npc.projectile = null;
    }


    applyPosition () {
        const poi = this.getNextPoi();

        if ( this.hitCounter > 0 ) {
            this.hitCounter--;
            this.position = poi;

            if ( this.hitCounter === 0 ) {
                this.kill();
            }

            return;
        }

        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            hero: this.gamebox.checkHero( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
            doors: this.gamebox.checkDoor( poi, this ),
            camera: this.gamebox.checkCamera( poi, this ),
        };
        
        if ( collision.map || collision.hero || collision.doors || collision.camera || this.canTileStop( poi, this.dir, collision ) ) {
            if ( collision.hero && !this.gamebox.hero.isHitOrStill() && !this.gamebox.hero.canShield( this ) ) {
                this.gamebox.hero.hit( this.data.power );
            }
            
            this.hitCounter = 4;

            return;
        }

        this.position = poi;
    }
}