import Utils from "../Utils";
import Config from "../Config";
import Spring from "../Spring";
import Sprite from "./Sprite";



/*******************************************************************************
* Companion NPC
* Have different behaviors for being "anchored" to a Hero
*******************************************************************************/
class Companion extends Sprite {
    constructor ( data, hero ) {
        super( data, hero.map );
        this.layer = (this.data.type === Config.npc.FLOAT ? "foreground" : "heroground");
        this.hero = hero;
        this.spring = new Spring( this.position.x, this.position.y, 10 );
        this.spring.bind( this );
    }


    visible () {
        return true;
    }


    destroy () {}


/*******************************************************************************
* Rendering
* Order is: blit, update, render
*******************************************************************************/
    blit ( elapsed ) {
        if ( !this.visible() ) {
            return;
        }

        if ( typeof this.previousElapsed === "undefined" ) {
            this.previousElapsed = elapsed;
        }

        // Companion type?
        if ( this.data.type === Config.npc.WALK ) {
            this.blitWalk();

        } else if ( this.data.type === Config.npc.FLOAT ) {
            this.blitFloat();
        }

        // Spring blit...
        this.spring.blit( elapsed );

        this.applyFrame( elapsed );
    }


    blitFloat () {
        this.position.z = -(this.map.data.tilesize * 2);

        if ( (this.hero.position.x + (this.hero.width / 2)) > (this.position.x + (this.width / 2)) ) {
            this.dir = "right";

        } else {
            this.dir = "left";
        }
    }


    blitWalk () {
        const distance = Utils.getDistance( this.position, this.spring.poi );

        // Hero is NOT idle, so moving
        // Hero IS idle but companion is within a threshold distance...
        if ( (!this.hero.idle.x || !this.hero.idle.y) || (this.hero.idle.x && this.hero.idle.y && distance > (this.map.data.tilesize / 2)) ) {
            // Bounce condition is TRUE
            // Position Z is zero, so bounce a bit...
            if ( this.data.bounce && this.position.z === 0 ) {
                this.physics.vz = -8;
            }
        }

        if ( Math.ceil( this.hero.position.x ) > Math.floor( this.position.x ) ) {
            this.dir = "right";

        } else {
            this.dir = "left";
        }
    }


/*******************************************************************************
* Applications
*******************************************************************************/
    applyPosition () {
        if ( this.data.type === Config.npc.WALK ) {
            this.applyWalkPosition();

        } else if ( this.data.type === Config.npc.FLOAT ) {
            this.applyFloatPosition();
        }
    }


    applyFloatPosition () {
        const poi = {};
        const heroCenter = {
            x: this.hero.position.x + (this.hero.width / 2),
            y: this.hero.position.y + (this.hero.height / 2),
        };
        const selfCenter = {
            x: this.position.x + (this.width / 2),
            y: this.position.y + (this.height / 2),
        };

        if ( this.hero.dir === "right" && heroCenter.x > selfCenter.x ) {
            poi.x = heroCenter.x - this.width;
            poi.y = heroCenter.y;

        } else if ( this.hero.dir === "left" && heroCenter.x < selfCenter.x ) {
            poi.x = heroCenter.x;
            poi.y = heroCenter.y;

        } else if ( this.hero.dir === "up" && heroCenter.y < selfCenter.y ) {
            poi.x = heroCenter.x - (this.width / 2);
            poi.y = heroCenter.y + this.height;

        } else if ( this.hero.dir === "down" && heroCenter.y > selfCenter.y ) {
            poi.x = heroCenter.x - (this.width / 2);
            poi.y = heroCenter.y;
        }

        if ( poi.x && poi.y ) {
            this.spring.poi = poi;
        }
    }


    applyWalkPosition () {
        const poi = {};

        if ( this.hero.dir === "right" && this.hero.position.x > this.position.x ) {
            poi.x = this.hero.position.x - (this.width / 2);
            poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);

        } else if ( this.hero.dir === "left" && this.hero.position.x < this.position.x ) {
            poi.x = this.hero.position.x + this.hero.width - (this.width / 2);
            poi.y = this.hero.footbox.y - (this.height - this.hero.footbox.height);

        } else if ( this.hero.dir === "up" && this.hero.position.y < this.position.y ) {
            poi.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            poi.y = this.hero.position.y + this.hero.height - (this.height / 2);

        } else if ( this.hero.dir === "down" && this.hero.position.y > this.position.y ) {
            poi.x = this.hero.position.x + (this.hero.width / 2) - (this.width / 2);
            poi.y = this.hero.position.y - (this.height / 2);
        }

        if ( poi.x && poi.y ) {
            this.spring.poi = poi;
        }
    }
}



export default Companion;
