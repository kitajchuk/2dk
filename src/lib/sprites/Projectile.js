import Config from "../Config";
import Sprite from "./Sprite";



export default class Projectile extends Sprite {
    constructor ( projectile, spawn, dir, npc, map ) {
        const data = {
            dir,
            spawn,
            hitbox: {
                x: 0,
                y: 0,
                width: projectile.width,
                height: projectile.height,
            },
            verbs: {
                face: {
                    [dir]: {
                        offsetX: projectile.offsetX,
                        offsetY: projectile.offsetY,
                    },
                },
            },
            ...projectile,
        };
        super( data, map );
        this.npc = npc;
    }


    update () {
        if ( !this.visible() ) {
            return;
        }

        this.controls[ this.dir ] = true;
        this.handleControls();
        this.updateStack();
    }


    applyPosition () {
        const poi = this.getNextPoi();
        const collision = {
            map: this.gamebox.checkMap( poi, this ),
            hero: this.gamebox.checkHero( poi, this ),
            tiles: this.gamebox.checkTiles( poi, this ),
            doors: this.gamebox.checkDoor( poi, this ),
            camera: this.gamebox.checkCamera( poi, this ),
        };
        
        if ( collision.map || collision.hero || collision.doors || collision.camera || this.canTileStop( poi, this.dir, collision ) ) {
            this.map.killObject( "sprites", this );
            this.gamebox.smokeObject( this );
            this.player.gameaudio.hitSound( Config.verbs.SMASH );

            // Kill THIS projectile attached to an NPC
            this.npc.projectile = null;

            if ( collision.hero && !this.gamebox.hero.isHitOrStill() && !this.gamebox.hero.canShield( this ) ) {
                this.gamebox.hero.hit( this.data.power );
            }

            return;
        }

        this.position = poi;
    }
}