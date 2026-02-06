import Utils from "../Utils";
import Config from "../Config";
import Spring from "../Spring";
import Sprite from "./Sprite";



/*******************************************************************************
* Companion NPC
* Have different behaviors for being "anchored" to a Hero
*******************************************************************************/
export default class Companion extends Sprite {
    constructor ( data, hero ) {
        super( data, hero.map );
        this.hero = hero;
        this.onscreen = true;
        this.spring = new Spring( this.player, this.position.x, this.position.y, 10 );
        this.spring.bind( this );
    }


    destroy () {
        this.spring.destroy();
    }


    visible () {
        return true;
    }


    reset () {
        this.position.x = this.hero.position.x;
        this.position.y = this.hero.position.y;
        this.spring.position.x = this.position.x;
        this.spring.position.y = this.position.y;
        this.spring.poi.x = this.position.x;
        this.spring.poi.y = this.position.y;
        this.spring.previousElapsed = null;
    }


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blitAfter ( elapsed ) {
        // Companion types?
        switch ( this.data.type ) {
            case Config.npc.ai.WALK:
                this.blitWalk();
                break;
            case Config.npc.ai.FLOAT:
                this.blitFloat();
                break;
        }

        // Spring blit...
        this.spring.blit( elapsed );
    }


    blitFloat () {
        this.position.z = -( this.map.data.tilesize );

        if ( ( this.hero.position.x + ( this.hero.width / 2 ) ) > ( this.position.x + ( this.width / 2 ) ) ) {
            this.dir = "right";

        } else {
            this.dir = "left";
        }
    }


    blitWalk () {
        const distance = Utils.getDistance( this.position, this.spring.poi );

        // Hero is NOT idle, so moving
        // Hero IS idle but companion is within a threshold distance...
        if (
            (
                ( !this.hero.isIdle() ) ||
                ( this.hero.isIdle() && distance > ( this.map.data.tilesize / 2 ) )
            ) &&
            this.data.bounce &&
            this.isOnGround() &&
            !this.gamebox.panning
        ) {
            // Bounce condition is TRUE
            // Position Z is zero, so bounce a bit...
            this.physics.vz = -8;
        }

        if ( this.hero.isIdle() ) {
            this.verb = Config.verbs.FACE;

        } else if ( this.can( Config.verbs.WALK ) ) {
            this.verb = Config.verbs.WALK;
        }

        if ( this.data.verbs[ this.verb ][ this.hero.dir ] ) {
            this.dir = this.hero.dir;

        } else {
            // Do below here with better wrapping logic...
            if ( Math.ceil( this.hero.position.x ) > Math.floor( this.position.x ) ) {
                this.dir = "right";
    
            } else {
                this.dir = "left";
            }
        }
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.data.type === Config.npc.ai.WALK ) {
            this.applyWalkPosition();
        }

        if ( this.data.type === Config.npc.ai.FLOAT ) {
            this.applyFloatPosition();
        }
    }


    applyFloatPosition () {
        const poi = {};

        if ( this.hero.dir === "right" && this.hero.center.x > this.center.x ) {
            poi.x = this.hero.center.x - this.width;
            poi.y = this.hero.center.y;
        }

        if ( this.hero.dir === "left" && this.hero.center.x < this.center.x ) {
            poi.x = this.hero.center.x;
            poi.y = this.hero.center.y;
        }

        if ( this.hero.dir === "up" && this.hero.center.y < this.center.y ) {
            poi.x = this.hero.center.x - ( this.width / 2 );
            poi.y = this.hero.center.y + this.height;
        }

        if ( this.hero.dir === "down" && this.hero.center.y > this.center.y ) {
            poi.x = this.hero.center.x - ( this.width / 2 );
            poi.y = this.hero.center.y;
        }

        if ( poi.x && poi.y ) {
            this.spring.poi = poi;
        }
    }


    applyWalkPosition () {
        const poi = {};

        if ( this.hero.dir === "right" && this.hero.position.x > this.position.x ) {
            poi.x = this.hero.position.x - ( this.width / 2 );
            poi.y = this.hero.footbox.y - ( this.height - this.hero.footbox.height );
        }

        if ( this.hero.dir === "left" && this.hero.position.x < this.position.x ) {
            poi.x = this.hero.position.x + this.hero.width - ( this.width / 2 );
            poi.y = this.hero.footbox.y - ( this.height - this.hero.footbox.height );
        }

        if ( this.hero.dir === "up" && this.hero.position.y < this.position.y ) {
            poi.x = this.hero.position.x + ( this.hero.width / 2 ) - ( this.width / 2 );
            poi.y = this.hero.position.y + this.hero.height - ( this.height / 2 );
        }

        if ( this.hero.dir === "down" && this.hero.position.y > this.position.y ) {
            poi.x = this.hero.position.x + ( this.hero.width / 2 ) - ( this.width / 2 );
            poi.y = this.hero.position.y - ( this.height / 2 );
        }

        if ( poi.x && poi.y ) {
            this.spring.poi = poi;
        }
    }
}
